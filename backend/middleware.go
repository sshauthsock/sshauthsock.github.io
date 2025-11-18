package main

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// Rate Limiting 설정
const (
	RateLimitRequests = 100        // 시간당 최대 요청 수
	RateLimitWindow   = time.Hour  // 시간 윈도우
	RateLimitBurst    = 20         // 버스트 허용량 (짧은 시간 내 허용 요청 수)
)

// RateLimiter: IP 기반 Rate Limiter
type RateLimiter struct {
	visitors map[string]*Visitor
	mu       sync.RWMutex
	requests int
	window   time.Duration
	burst    int
}

// Visitor: 방문자 정보
type Visitor struct {
	lastSeen time.Time
	count    int
	resetAt  time.Time
}

// NewRateLimiter: Rate Limiter 생성
func NewRateLimiter(requests int, window time.Duration, burst int) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*Visitor),
		requests: requests,
		window:   window,
		burst:    burst,
	}

	// 주기적으로 오래된 방문자 정보 정리 (메모리 누수 방지)
	go rl.cleanupVisitors()

	return rl
}

// cleanupVisitors: 오래된 방문자 정보 정리 (1시간마다)
func (rl *RateLimiter) cleanupVisitors() {
	ticker := time.NewTicker(1 * time.Hour)
	defer ticker.Stop()

	for range ticker.C {
		rl.mu.Lock()
		now := time.Now()
		for ip, visitor := range rl.visitors {
			// 1시간 이상 활동이 없으면 삭제
			if now.Sub(visitor.lastSeen) > 2*time.Hour {
				delete(rl.visitors, ip)
			}
		}
		rl.mu.Unlock()
	}
}

// Allow: 요청 허용 여부 확인
func (rl *RateLimiter) Allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	visitor, exists := rl.visitors[ip]

	if !exists {
		// 새로운 방문자
		rl.visitors[ip] = &Visitor{
			lastSeen: now,
			count:    1,
			resetAt:  now.Add(rl.window),
		}
		return true
	}

	// 윈도우가 지났으면 리셋
	if now.After(visitor.resetAt) {
		visitor.count = 1
		visitor.resetAt = now.Add(rl.window)
		visitor.lastSeen = now
		return true
	}

	// 버스트 허용량 체크 (짧은 시간 내 많은 요청)
	if visitor.count < rl.burst {
		visitor.count++
		visitor.lastSeen = now
		return true
	}

	// 시간 윈도우 내 요청 수 체크
	if visitor.count < rl.requests {
		visitor.count++
		visitor.lastSeen = now
		return true
	}

	// Rate limit 초과
	return false
}

// GetRemainingRequests: 남은 요청 수 반환
func (rl *RateLimiter) GetRemainingRequests(ip string) int {
	rl.mu.RLock()
	defer rl.mu.RUnlock()

	visitor, exists := rl.visitors[ip]
	if !exists {
		return rl.requests
	}

	now := time.Now()
	if now.After(visitor.resetAt) {
		return rl.requests
	}

	remaining := rl.requests - visitor.count
	if remaining < 0 {
		return 0
	}
	return remaining
}

// RateLimitMiddleware: Rate Limiting 미들웨어
func RateLimitMiddleware() gin.HandlerFunc {
	limiter := NewRateLimiter(RateLimitRequests, RateLimitWindow, RateLimitBurst)

	return func(c *gin.Context) {
		ip := c.ClientIP()

		if !limiter.Allow(ip) {
			// resetAt 시간 가져오기 (락 보호)
			resetAt := limiter.getResetAt(ip)
			retryAfter := 0.0
			if !resetAt.IsZero() {
				retryAfter = time.Until(resetAt).Seconds()
			}

			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":      "Rate limit exceeded. Please try again later.",
				"retryAfter": retryAfter,
			})
			c.Abort()
			return
		}

		remaining := limiter.GetRemainingRequests(ip)
		c.Header("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
		c.Next()
	}
}

// getResetAt: 방문자의 resetAt 시간 가져오기 (락 보호)
func (rl *RateLimiter) getResetAt(ip string) time.Time {
	rl.mu.RLock()
	defer rl.mu.RUnlock()

	visitor, exists := rl.visitors[ip]
	if !exists {
		return time.Time{}
	}
	return visitor.resetAt
}

// MaxBodySizeMiddleware: 요청 본문 크기 제한 미들웨어
func MaxBodySizeMiddleware(maxSize int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.ContentLength > maxSize {
			c.JSON(http.StatusRequestEntityTooLarge, gin.H{
				"error": fmt.Sprintf("Request body too large: maximum %d bytes allowed, got %d bytes", maxSize, c.Request.ContentLength),
			})
			c.Abort()
			return
		}

		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxSize)
		c.Next()
	}
}

