/**
 * 에러 바운더리 유틸리티
 * 예상치 못한 에러를 처리하고 앱이 중단되지 않도록 합니다.
 */

import ErrorHandler from "./errorHandler.js";
import Logger from "./logger.js";
import { showErrorRecoveryUI } from "../components/errorRecovery.js";

class ErrorBoundary {
  constructor() {
    this.errorCount = 0;
    this.maxErrors = 5; // 최대 에러 허용 횟수
    this.errorResetTime = 60000; // 1분 후 에러 카운트 리셋
    this.lastErrorTime = null;
  }

  /**
   * 에러 바운더리 초기화
   */
  init() {
    // 전역 에러 핸들러
    window.addEventListener("error", (event) => {
      // 404 에러인 경우 사용자에게 적절한 메시지 표시
      const errorMessage = event.message || '';
      const is404Error = 
        errorMessage.includes('404') ||
        errorMessage.includes('Failed to load resource') ||
        errorMessage.includes('the server responded with a status of 404') ||
        errorMessage.includes('Not Found') ||
        (event.target && event.target.tagName && (
          event.target.tagName === 'SCRIPT' || 
          event.target.tagName === 'LINK' || 
          event.target.tagName === 'IMG'
        ));

      if (is404Error) {
        // 404 에러는 사용자 친화적인 메시지로 표시
        const userMessage = ErrorHandler.getUserFriendlyMessage(errorMessage);
        Logger.error(`[ErrorBoundary] 404 Error detected: ${errorMessage}`);
        
        // 앱 컨테이너에 에러 메시지 표시 (이미 표시되지 않은 경우)
        const appContainer = document.getElementById("app-container");
        if (appContainer && !appContainer.querySelector(".error-recovery-container")) {
          showErrorRecoveryUI(appContainer, new Error(errorMessage), {
            title: "리소스 로드 실패",
            message: userMessage,
            onRetry: () => {
              // Ctrl+Shift+R과 동일한 강제 새로고침
              window.location.reload(true);
            },
          });
        }
      }

      this.handleError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: "window_error",
        is404: is404Error,
      });
    });

    // Promise rejection 핸들러
    window.addEventListener("unhandledrejection", (event) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));
      
      // 404 에러인지 확인
      const errorMessage = error.message || String(event.reason);
      const is404Error = 
        errorMessage.includes('404') ||
        errorMessage.includes('Failed to load resource') ||
        errorMessage.includes('the server responded with a status of 404') ||
        errorMessage.includes('Not Found') ||
        errorMessage.includes('Failed to fetch dynamically imported module') ||
        errorMessage.includes('Loading chunk') && errorMessage.includes('failed');

      if (is404Error) {
        // 404 에러는 사용자 친화적인 메시지로 표시
        const userMessage = ErrorHandler.getUserFriendlyMessage(errorMessage);
        Logger.error(`[ErrorBoundary] 404 Error detected in promise rejection: ${errorMessage}`);
        
        // 앱 컨테이너에 에러 메시지 표시 (이미 표시되지 않은 경우)
        const appContainer = document.getElementById("app-container");
        if (appContainer && !appContainer.querySelector(".error-recovery-container")) {
          showErrorRecoveryUI(appContainer, error, {
            title: "리소스 로드 실패",
            message: userMessage,
            onRetry: () => {
              // Ctrl+Shift+R과 동일한 강제 새로고침
              window.location.reload(true);
            },
          });
        }
      }

      this.handleError(error, {
        type: "unhandled_promise_rejection",
        promise: event.promise,
        is404: is404Error,
      });
      // 기본 동작 방지 (콘솔 에러 출력 방지)
      event.preventDefault();
    });

    // 처리된 Promise rejection 로깅 (선택사항)
    window.addEventListener("rejectionhandled", (event) => {
      Logger.log("[ErrorBoundary] Promise rejection was handled:", event.reason);
    });

    Logger.log("[ErrorBoundary] Error boundary initialized");
  }

  /**
   * 에러 처리
   * @param {Error} error - 에러 객체
   * @param {object} context - 추가 컨텍스트 정보
   */
  handleError(error, context = {}) {
    // 에러 카운트 관리 (너무 많은 에러 방지)
    const now = Date.now();
    if (
      this.lastErrorTime &&
      now - this.lastErrorTime > this.errorResetTime
    ) {
      this.errorCount = 0;
    }
    this.lastErrorTime = now;

    this.errorCount++;

    // 너무 많은 에러가 발생하면 앱 중단 방지
    if (this.errorCount > this.maxErrors) {
      Logger.error(
        `[ErrorBoundary] Too many errors (${this.errorCount}). Preventing further error handling.`
      );
      return;
    }

    // 에러 정보 수집
    const errorInfo = {
      message: error.message || "알 수 없는 오류",
      stack: error.stack,
      name: error.name,
      ...context,
      timestamp: new Date().toISOString(),
      errorCount: this.errorCount,
    };

    // ErrorHandler를 통해 처리
    ErrorHandler.handle(error, `ErrorBoundary: ${context.type || "unknown"}`);

    // 개발 환경에서만 상세 로그
    if (import.meta.env.DEV) {
      Logger.error("[ErrorBoundary] Error caught:", errorInfo);
    }

    // Google Analytics에 fatal 에러로 전송
    if (typeof gtag === "function") {
      gtag("event", "exception", {
        description: errorInfo.message,
        fatal: true,
        error_type: context.type || "unknown",
        error_count: this.errorCount,
      });
    }

    return errorInfo;
  }

  /**
   * 안전한 함수 실행 (에러 발생 시에도 앱이 중단되지 않음)
   * @param {Function} fn - 실행할 함수
   * @param {string} context - 컨텍스트 이름
   * @param {Function} onError - 에러 발생 시 콜백
   * @returns {*} 함수 실행 결과
   */
  safeExecute(fn, context = "unknown", onError = null) {
    try {
      return fn();
    } catch (error) {
      this.handleError(error, { type: "safe_execute", context });
      if (onError && typeof onError === "function") {
        return onError(error);
      }
      return null;
    }
  }

  /**
   * 안전한 비동기 함수 실행
   * @param {Function} asyncFn - 실행할 비동기 함수
   * @param {string} context - 컨텍스트 이름
   * @param {Function} onError - 에러 발생 시 콜백
   * @returns {Promise} 함수 실행 결과
   */
  async safeExecuteAsync(asyncFn, context = "unknown", onError = null) {
    try {
      return await asyncFn();
    } catch (error) {
      this.handleError(error, { type: "safe_execute_async", context });
      if (onError && typeof onError === "function") {
        return await onError(error);
      }
      return null;
    }
  }

  /**
   * 에러 카운트 리셋
   */
  resetErrorCount() {
    this.errorCount = 0;
    this.lastErrorTime = null;
    Logger.log("[ErrorBoundary] Error count reset");
  }
}

// 싱글톤 인스턴스
const errorBoundary = new ErrorBoundary();

export default errorBoundary;

