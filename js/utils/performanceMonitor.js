/**
 * 성능 모니터링 유틸리티
 * Google Analytics 4에 성능 메트릭을 전송합니다.
 */

/**
 * API 응답 시간 추적
 * @param {string} endpoint - API 엔드포인트
 * @param {number} duration - 응답 시간 (ms)
 * @param {boolean} success - 성공 여부
 */
export function trackApiPerformance(endpoint, duration, success = true) {
  if (typeof gtag !== "function") return;

  gtag("event", "api_performance", {
    event_category: "API",
    event_label: endpoint,
    value: Math.round(duration),
    success: success,
    // 커스텀 메트릭
    api_endpoint: endpoint,
    response_time_ms: Math.round(duration),
  });
}

/**
 * 계산 작업 성능 추적
 * @param {string} calculationType - 계산 타입 (bond, soul, chak)
 * @param {number} duration - 계산 시간 (ms)
 * @param {object} metadata - 추가 메타데이터
 */
export function trackCalculationPerformance(
  calculationType,
  duration,
  metadata = {}
) {
  if (typeof gtag !== "function") return;

  gtag("event", "calculation_performance", {
    event_category: "Calculation",
    event_label: calculationType,
    value: Math.round(duration),
    calculation_type: calculationType,
    duration_ms: Math.round(duration),
    ...metadata,
  });
}

/**
 * 사용자 행동 추적
 * @param {string} action - 행동 (예: "calculate_optimal", "open_modal")
 * @param {string} category - 카테고리 (예: "Bond Calculator")
 * @param {object} metadata - 추가 메타데이터
 */
export function trackUserAction(action, category, metadata = {}) {
  if (typeof gtag !== "function") return;

  gtag("event", "user_action", {
    event_category: category,
    event_label: action,
    action: action,
    category: category,
    ...metadata,
  });
}

/**
 * 페이지 로딩 성능 추적
 * @param {string} pageName - 페이지 이름
 * @param {number} loadTime - 로딩 시간 (ms)
 */
export function trackPageLoadPerformance(pageName, loadTime) {
  if (typeof gtag !== "function") return;

  gtag("event", "page_load_performance", {
    event_category: "Page Load",
    event_label: pageName,
    value: Math.round(loadTime),
    page_name: pageName,
    load_time_ms: Math.round(loadTime),
  });
}

/**
 * Web Vitals 측정 및 전송
 */
export function measureWebVitals() {
  if (typeof gtag !== "function") return;

  // Largest Contentful Paint (LCP)
  if ("PerformanceObserver" in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        gtag("event", "web_vitals", {
          event_category: "Web Vitals",
          event_label: "LCP",
          value: Math.round(lastEntry.renderTime || lastEntry.loadTime),
          metric_name: "LCP",
          metric_value: Math.round(lastEntry.renderTime || lastEntry.loadTime),
        });
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      // PerformanceObserver가 지원되지 않는 경우 무시
    }

    // First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          gtag("event", "web_vitals", {
            event_category: "Web Vitals",
            event_label: "FID",
            value: Math.round(entry.processingStart - entry.startTime),
            metric_name: "FID",
            metric_value: Math.round(entry.processingStart - entry.startTime),
          });
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      // PerformanceObserver가 지원되지 않는 경우 무시
    }

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        // CLS는 누적되므로 마지막 값만 전송
        gtag("event", "web_vitals", {
          event_category: "Web Vitals",
          event_label: "CLS",
          value: Math.round(clsValue * 1000), // 1000배하여 정수로 변환
          metric_name: "CLS",
          metric_value: clsValue,
        });
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      // PerformanceObserver가 지원되지 않는 경우 무시
    }
  }

  // 페이지 로드 시간 측정
  window.addEventListener("load", () => {
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;
      
      gtag("event", "page_load", {
        event_category: "Performance",
        event_label: "Page Load",
        value: Math.round(loadTime),
        load_time_ms: Math.round(loadTime),
        dom_content_loaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        dom_complete: timing.domComplete - timing.navigationStart,
      });
    }
  });
}

/**
 * 성능 모니터링 초기화
 */
export function initPerformanceMonitoring() {
  // Web Vitals 측정 시작
  measureWebVitals();
}

