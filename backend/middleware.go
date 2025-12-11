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
		deletedCount := 0
		for ip, visitor := range rl.visitors {
			// 2시간 이상 활동이 없으면 삭제
			if now.Sub(visitor.lastSeen) > 2*time.Hour {
				delete(rl.visitors, ip)
				deletedCount++
			}
		}
		rl.mu.Unlock()
		
		// 정리된 항목 수 로깅 (디버깅용, 필요시 주석 처리)
		if deletedCount > 0 {
			// 로깅은 선택사항 (과도한 로그 방지)
			// log.Printf("Rate limiter: cleaned up %d old visitors", deletedCount)
		}
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

// SecurityHeadersMiddleware: 보안 헤더 추가 미들웨어
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// X-Frame-Options: 클릭재킹 방지
		c.Header("X-Frame-Options", "DENY")
		
		// X-Content-Type-Options: MIME 타입 스니핑 방지
		c.Header("X-Content-Type-Options", "nosniff")
		
		// X-XSS-Protection: XSS 필터 활성화 (구형 브라우저용)
		c.Header("X-XSS-Protection", "1; mode=block")
		
		// Referrer-Policy: 리퍼러 정보 제한
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		
		// Permissions-Policy: 브라우저 기능 제한
		c.Header("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
		
		// Content-Security-Policy: XSS 및 데이터 주입 공격 방지
		// API 서버이므로 스크립트 실행이 필요 없음
		// CORS 요청을 허용하기 위해 connect-src에 외부 origin 추가하지 않음 (CSP는 서버 측 정책이므로 클라이언트 연결에 영향 없음)
		c.Header("Content-Security-Policy", "default-src 'self'; script-src 'none'; style-src 'none'; img-src 'none'; font-src 'none'; connect-src 'self'")
		
		// Strict-Transport-Security (HSTS): HTTPS 강제 (HTTPS 환경에서만)
		// 프로덕션 환경에서만 적용 (로컬 개발 환경에서는 적용하지 않음)
		if c.Request.TLS != nil {
			c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		}
		
		c.Next()
	}
}

