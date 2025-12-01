/**
 * Service Worker 등록 및 관리 유틸리티
 */
import Logger from "./logger.js";

const SW_PATH = '/sw.js';
const SW_VERSION = 'v1.0.0';

// 업데이트 알림 표시 여부 추적
let updateNotificationShown = false;

/**
 * Service Worker 등록
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    Logger.warn('[Service Worker] Service Worker is not supported in this browser.');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_PATH, {
      scope: '/',
    });

    Logger.log('[Service Worker] Registered successfully:', registration.scope);

    // 업데이트 확인 (한 번만 등록)
    if (!registration._updateFoundListenerAdded) {
      registration._updateFoundListenerAdded = true;
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller && !updateNotificationShown) {
                // 새 버전이 설치되었지만 아직 활성화되지 않음
                Logger.log('[Service Worker] New version available. Reload to update.');
                updateNotificationShown = true;
                showUpdateNotification();
                
                // 새 Service Worker에게 즉시 활성화 요청
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              } else {
                // 첫 설치
                Logger.log('[Service Worker] First installation completed.');
              }
            }
          });
        }
      });
    }

    // Service Worker가 제어권을 가진 경우
    if (registration.active) {
      Logger.log('[Service Worker] Active and controlling page');
    }

    // 컨트롤러 변경 감지 (새 Service Worker 활성화) - 한 번만 등록
    if (!navigator.serviceWorker._controllerChangeListenerAdded) {
      navigator.serviceWorker._controllerChangeListenerAdded = true;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        Logger.log('[Service Worker] New controller activated. Reloading page...');
        // 알림 플래그 리셋
        updateNotificationShown = false;
        // 새 Service Worker가 활성화되면 자동으로 새로고침하여 최신 버전 사용
        window.location.reload();
      });
    }

    return true;
  } catch (error) {
    Logger.error('[Service Worker] Registration failed:', error);
    return false;
  }
}

/**
 * Service Worker 업데이트 확인
 */
export async function checkForUpdates() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    // 이미 알림이 표시된 경우 업데이트 확인만 하고 알림은 표시하지 않음
    await registration.update();
    Logger.log('[Service Worker] Update check completed');
  } catch (error) {
    Logger.error('[Service Worker] Update check failed:', error);
  }
}

/**
 * Service Worker 업데이트 알림 표시
 */
function showUpdateNotification() {
  // 기존 알림이 있으면 제거
  const existing = document.getElementById('sw-update-notification');
  if (existing) {
    existing.remove();
  }
  
  // 알림 UI 생성
  const notification = document.createElement('div');
  notification.id = 'sw-update-notification';
  notification.innerHTML = `
    <div class="sw-update-content">
      <div class="sw-update-icon">🔄</div>
      <div class="sw-update-text">
        <strong>새 버전이 사용 가능합니다</strong>
        <p>업데이트를 적용하려면 새로고침하세요. (Ctrl+Shift+R 또는 Cmd+Shift+R)</p>
      </div>
      <div class="sw-update-actions">
        <button class="sw-update-btn sw-update-now" id="sw-update-now-btn">지금 업데이트</button>
        <button class="sw-update-btn sw-update-later" id="sw-update-later-btn">나중에</button>
      </div>
    </div>
  `;
  
  // 이벤트 리스너 추가
  notification.querySelector('#sw-update-now-btn').addEventListener('click', () => {
    window.location.reload();
  });
  
  notification.querySelector('#sw-update-later-btn').addEventListener('click', () => {
    notification.style.animation = 'slideInUp 0.3s ease-out reverse';
    setTimeout(() => notification.remove(), 300);
  });

  // 스타일 추가 (한 번만)
  if (!document.getElementById('sw-update-styles')) {
    const style = document.createElement('style');
    style.id = 'sw-update-styles';
    style.textContent = `
      #sw-update-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        max-width: 400px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInUp 0.3s ease-out;
        font-family: 'Noto Sans KR', sans-serif;
      }
      @keyframes slideInUp {
        from {
          transform: translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      .sw-update-content {
        padding: 16px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .sw-update-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
        line-height: 1;
      }
      .sw-update-text {
        flex: 1;
        min-width: 0;
      }
      .sw-update-text strong {
        display: block;
        font-size: 1rem;
        color: #333;
        margin-bottom: 4px;
        font-weight: 600;
      }
      .sw-update-text p {
        margin: 0;
        font-size: 0.875rem;
        color: #666;
        line-height: 1.4;
      }
      .sw-update-actions {
        display: flex;
        flex-direction: row;
        gap: 8px;
        margin-top: 12px;
        width: 100%;
      }
      .sw-update-btn {
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        flex: 1;
        white-space: nowrap;
      }
      .sw-update-now {
        background: #3498db;
        color: white;
      }
      .sw-update-now:hover {
        background: #2980b9;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
      }
      .sw-update-now:active {
        transform: translateY(0);
      }
      .sw-update-later {
        background: #ecf0f1;
        color: #7f8c8d;
      }
      .sw-update-later:hover {
        background: #bdc3c7;
      }
      .sw-update-later:active {
        transform: translateY(0);
      }
      @media (max-width: 768px) {
        #sw-update-notification {
          bottom: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
          border-radius: 10px;
        }
        .sw-update-content {
          padding: 12px;
          gap: 10px;
          flex-direction: column;
        }
        .sw-update-icon {
          font-size: 1.25rem;
          align-self: flex-start;
        }
        .sw-update-text {
          width: 100%;
        }
        .sw-update-text strong {
          font-size: 0.95rem;
          margin-bottom: 3px;
        }
        .sw-update-text p {
          font-size: 0.8rem;
        }
        .sw-update-actions {
          flex-direction: column;
          gap: 6px;
          margin-top: 10px;
        }
        .sw-update-btn {
          padding: 10px 14px;
          font-size: 0.875rem;
          width: 100%;
        }
      }
      @media (max-width: 480px) {
        #sw-update-notification {
          bottom: 8px;
          right: 8px;
          left: 8px;
          border-radius: 8px;
        }
        .sw-update-content {
          padding: 10px;
          gap: 8px;
        }
        .sw-update-icon {
          font-size: 1.1rem;
        }
        .sw-update-text strong {
          font-size: 0.9rem;
        }
        .sw-update-text p {
          font-size: 0.75rem;
        }
        .sw-update-btn {
          padding: 8px 12px;
          font-size: 0.8rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // 알림 추가
  document.body.appendChild(notification);

  // 10초 후 자동으로 제거 (선택적)
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideInUp 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
    }
  }, 10000);
}

/**
 * Service Worker 초기화 (앱 시작 시 호출)
 */
export function initServiceWorker() {
  // Service Worker 등록
  registerServiceWorker();

  // 페이지 로드 후 즉시 업데이트 확인
  setTimeout(() => {
    checkForUpdates();
  }, 2000); // 2초 후 (초기 로딩 완료 후)

  // 주기적으로 업데이트 확인 (5분마다 - 더 자주 확인)
  setInterval(() => {
    checkForUpdates();
  }, 5 * 60 * 1000); // 5분

  // 페이지 가시성 변경 시 업데이트 확인 (탭 전환 시)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      checkForUpdates();
    }
  });
  
  // 포커스 시 업데이트 확인 (창 포커스 시)
  window.addEventListener('focus', () => {
    checkForUpdates();
  });
}

