package main

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// Metrics: 서버 메트릭을 저장하는 구조체
type Metrics struct {
	mu                sync.RWMutex
	RequestCount      int64             `json:"requestCount"`
	ErrorCount        int64             `json:"errorCount"`
	TotalResponseTime time.Duration     `json:"totalResponseTime"`
	EndpointMetrics   map[string]*EndpointMetric `json:"endpointMetrics"`
	StartTime         time.Time         `json:"startTime"`
}

// EndpointMetric: 엔드포인트별 메트릭
type EndpointMetric struct {
	Count             int64         `json:"count"`
	ErrorCount        int64         `json:"errorCount"`
	TotalResponseTime time.Duration `json:"totalResponseTime"`
	MinResponseTime   time.Duration `json:"minResponseTime"`
	MaxResponseTime   time.Duration `json:"maxResponseTime"`
	LastRequestTime   time.Time     `json:"lastRequestTime"`
}

var globalMetrics = &Metrics{
	EndpointMetrics: make(map[string]*EndpointMetric),
	StartTime:       time.Now(),
}

// MonitoringMiddleware: 요청 메트릭을 수집하는 미들웨어
func MonitoringMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		startTime := time.Now()
		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path
		}

		// 요청 처리
		c.Next()

		// 메트릭 수집
		duration := time.Since(startTime)
		statusCode := c.Writer.Status()

		globalMetrics.mu.Lock()
		globalMetrics.RequestCount++
		globalMetrics.TotalResponseTime += duration

		if statusCode >= 400 {
			globalMetrics.ErrorCount++
		}

		// 엔드포인트별 메트릭 업데이트
		endpointMetric, exists := globalMetrics.EndpointMetrics[path]
		if !exists {
			endpointMetric = &EndpointMetric{
				MinResponseTime: duration,
				MaxResponseTime: duration,
			}
			globalMetrics.EndpointMetrics[path] = endpointMetric
		}

		endpointMetric.Count++
		endpointMetric.TotalResponseTime += duration
		endpointMetric.LastRequestTime = time.Now()

		if statusCode >= 400 {
			endpointMetric.ErrorCount++
		}

		if duration < endpointMetric.MinResponseTime {
			endpointMetric.MinResponseTime = duration
		}
		if duration > endpointMetric.MaxResponseTime {
			endpointMetric.MaxResponseTime = duration
		}
		globalMetrics.mu.Unlock()
	}
}

// GetMetrics: 현재 메트릭을 반환
func GetMetrics() *Metrics {
	globalMetrics.mu.RLock()
	defer globalMetrics.mu.RUnlock()

	// 복사본 반환 (동시성 안전)
	metricsCopy := &Metrics{
		RequestCount:      globalMetrics.RequestCount,
		ErrorCount:        globalMetrics.ErrorCount,
		TotalResponseTime: globalMetrics.TotalResponseTime,
		EndpointMetrics:   make(map[string]*EndpointMetric),
		StartTime:         globalMetrics.StartTime,
	}

	for path, metric := range globalMetrics.EndpointMetrics {
		metricsCopy.EndpointMetrics[path] = &EndpointMetric{
			Count:             metric.Count,
			ErrorCount:        metric.ErrorCount,
			TotalResponseTime: metric.TotalResponseTime,
			MinResponseTime:   metric.MinResponseTime,
			MaxResponseTime:   metric.MaxResponseTime,
			LastRequestTime:   metric.LastRequestTime,
		}
	}

	return metricsCopy
}

// ResetMetrics: 메트릭 초기화 (테스트/디버깅용)
func ResetMetrics() {
	globalMetrics.mu.Lock()
	defer globalMetrics.mu.Unlock()

	globalMetrics.RequestCount = 0
	globalMetrics.ErrorCount = 0
	globalMetrics.TotalResponseTime = 0
	globalMetrics.EndpointMetrics = make(map[string]*EndpointMetric)
	globalMetrics.StartTime = time.Now()
}

// getMetricsHandler: 메트릭을 반환하는 핸들러
func (a *App) getMetricsHandler(c *gin.Context) {
	metrics := GetMetrics()

	uptime := time.Since(metrics.StartTime)
	avgResponseTime := time.Duration(0)
	if metrics.RequestCount > 0 {
		avgResponseTime = metrics.TotalResponseTime / time.Duration(metrics.RequestCount)
	}

	errorRate := float64(0)
	if metrics.RequestCount > 0 {
		errorRate = float64(metrics.ErrorCount) / float64(metrics.RequestCount) * 100
	}

	response := gin.H{
		"uptime":          uptime.String(),
		"uptimeSeconds":   int64(uptime.Seconds()),
		"requestCount":    metrics.RequestCount,
		"errorCount":      metrics.ErrorCount,
		"errorRate":       errorRate,
		"avgResponseTime": avgResponseTime.String(),
		"avgResponseTimeMs": avgResponseTime.Milliseconds(),
		"endpoints":       metrics.EndpointMetrics,
	}

	c.JSON(http.StatusOK, response)
}

// healthCheckHandler: Health check 핸들러
func (a *App) healthCheckHandler(c *gin.Context) {
	a.dataLoadMutex.RLock()
	defer a.dataLoadMutex.RUnlock()

	healthStatus := gin.H{
		"status":    "healthy",
		"timestamp": time.Now().Format(time.RFC3339),
		"data": gin.H{
			"loaded": a.isDataLoaded,
		},
	}

	if !a.isDataLoaded {
		healthStatus["status"] = "degraded"
		healthStatus["message"] = "Data is still loading or failed to load"
		c.JSON(http.StatusServiceUnavailable, healthStatus)
		return
	}

	c.JSON(http.StatusOK, healthStatus)
}

