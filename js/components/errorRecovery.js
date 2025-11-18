/**
 * 에러 복구 UI 컴포넌트
 * 에러 발생 시 사용자에게 복구 옵션을 제공합니다.
 */

import ErrorHandler from "../utils/errorHandler.js";
import Logger from "../utils/logger.js";

/**
 * 에러 복구 UI 표시
 * @param {HTMLElement} container - 에러를 표시할 컨테이너
 * @param {Error} error - 에러 객체
 * @param {object} options - 옵션
 * @param {Function} options.onRetry - 재시도 콜백
 * @param {Function} options.onGoHome - 홈으로 가기 콜백
 * @param {string} options.title - 커스텀 제목
 * @param {string} options.message - 커스텀 메시지
 */
export function showErrorRecoveryUI(container, error, options = {}) {
  if (!container) {
    Logger.error("[ErrorRecovery] Container not provided");
    return;
  }

  const {
    onRetry = null,
    onGoHome = () => {
      window.location.href = "/";
    },
    title = "오류가 발생했습니다",
    message = null,
  } = options;

  const userMessage =
    message || ErrorHandler.getUserFriendlyMessage(error?.message || "");

  const errorId = `error-${Date.now()}`;

  container.innerHTML = `
    <div class="error-recovery-container" id="${errorId}">
      <div class="error-recovery-content">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">${title}</h2>
        <p class="error-message">${userMessage}</p>
        
        <div class="error-actions">
          ${onRetry ? `<button class="btn btn-primary error-retry-btn">다시 시도</button>` : ""}
          <button class="btn btn-secondary error-home-btn">홈으로 가기</button>
          <button class="btn btn-link error-reload-btn">페이지 새로고침</button>
        </div>
        
        ${import.meta.env.DEV ? `
          <details class="error-details">
            <summary>에러 상세 정보 (개발 모드)</summary>
            <pre class="error-stack">${error?.stack || error?.message || "No error details"}</pre>
          </details>
        ` : ""}
      </div>
    </div>
  `;

  // 이벤트 리스너 추가
  const errorContainer = container.querySelector(`#${errorId}`);
  
  if (onRetry) {
    const retryBtn = errorContainer.querySelector(".error-retry-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        Logger.log("[ErrorRecovery] Retry button clicked");
        if (typeof onRetry === "function") {
          try {
            onRetry();
          } catch (retryError) {
            Logger.error("[ErrorRecovery] Retry failed:", retryError);
            showErrorRecoveryUI(container, retryError, options);
          }
        }
      });
    }
  }

  const homeBtn = errorContainer.querySelector(".error-home-btn");
  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      Logger.log("[ErrorRecovery] Go home button clicked");
      if (typeof onGoHome === "function") {
        onGoHome();
      }
    });
  }

  const reloadBtn = errorContainer.querySelector(".error-reload-btn");
  if (reloadBtn) {
    reloadBtn.addEventListener("click", () => {
      Logger.log("[ErrorRecovery] Reload button clicked");
      window.location.reload();
    });
  }

  // 스타일 추가 (한 번만)
  if (!document.getElementById("error-recovery-styles")) {
    const style = document.createElement("style");
    style.id = "error-recovery-styles";
    style.textContent = `
      .error-recovery-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        padding: 2rem;
      }
      .error-recovery-content {
        text-align: center;
        max-width: 500px;
        background: #fff;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .error-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }
      .error-title {
        color: #e74c3c;
        margin-bottom: 1rem;
        font-size: 1.5rem;
      }
      .error-message {
        color: #666;
        margin-bottom: 2rem;
        line-height: 1.6;
      }
      .error-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      .error-actions .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s;
      }
      .error-actions .btn-primary {
        background: #3498db;
        color: white;
      }
      .error-actions .btn-primary:hover {
        background: #2980b9;
      }
      .error-actions .btn-secondary {
        background: #95a5a6;
        color: white;
      }
      .error-actions .btn-secondary:hover {
        background: #7f8c8d;
      }
      .error-actions .btn-link {
        background: transparent;
        color: #3498db;
        text-decoration: underline;
      }
      .error-actions .btn-link:hover {
        color: #2980b9;
      }
      .error-details {
        margin-top: 2rem;
        text-align: left;
        border-top: 1px solid #eee;
        padding-top: 1rem;
      }
      .error-details summary {
        cursor: pointer;
        color: #666;
        margin-bottom: 0.5rem;
      }
      .error-stack {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.875rem;
        color: #333;
        max-height: 300px;
        overflow-y: auto;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * 간단한 에러 메시지 표시 (복구 옵션 없음)
 * @param {HTMLElement} container - 에러를 표시할 컨테이너
 * @param {Error} error - 에러 객체
 */
export function showSimpleError(container, error) {
  if (!container) return;

  const userMessage = ErrorHandler.getUserFriendlyMessage(
    error?.message || ""
  );

  container.innerHTML = `
    <div class="error-message" style="text-align: center; padding: 2rem;">
      <h3>${userMessage}</h3>
    </div>
  `;
}

