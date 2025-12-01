/**
 * UI 렌더링 관련 함수들
 * HTML 템플릿 및 유틸리티 UI 함수를 포함합니다.
 */

import { createElement } from "../../../utils.js";
import { pageState } from "../state.js";

/**
 * 모바일 디바이스 여부 확인
 * @returns {boolean} 모바일 여부
 */
export function isMobile() {
  return window.innerWidth <= 768;
}

/**
 * 이미지 로드 실패 메시지 표시
 */
export function showImageLoadError() {
  if (pageState.imageLoadErrorShown) return;

  pageState.imageLoadErrorShown = true;

  // 메시지 표시
  const message = createElement("div");
  message.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ff6b35;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-size: 14px;
    font-weight: 600;
    max-width: 90%;
    text-align: center;
    animation: slideDown 0.3s ease-out;
  `;
  message.textContent =
    "일부 이미지가 로드되지 않았습니다. Ctrl+Shift+R을 눌러 새로고침해주세요.";

  // 애니메이션 스타일 추가
  if (!document.getElementById("image-error-animation-style")) {
    const style = createElement("style");
    style.id = "image-error-animation-style";
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(message);

  // 5초 후 자동으로 제거
  setTimeout(() => {
    if (message.parentNode) {
      message.style.animation = "slideDown 0.3s ease-out reverse";
      setTimeout(() => {
        if (message.parentNode) {
          message.remove();
        }
      }, 300);
    }
  }, 5000);

  // 클릭 시 제거
  message.addEventListener("click", () => {
    if (message.parentNode) {
      message.style.animation = "slideDown 0.3s ease-out reverse";
      setTimeout(() => {
        if (message.parentNode) {
          message.remove();
        }
      }, 300);
    }
  });
}

/**
 * 페이지 HTML 템플릿 생성
 * @returns {string} HTML 문자열
 */
export function getHTML() {
  return `
    <div class="my-info-container">
    <div class="my-info-top-section">
      <!-- 왼쪽: 환수 섹션 (50%) -->
      <div class="my-info-spirit-section-wrapper">
        <!-- 왼쪽: 수호/탑승/변신 카드 (40%) -->
        <div class="my-info-left-panel">
          <!-- 수호 카드 -->
          <div class="my-info-category-card" data-category="수호">
            <h2 class="my-info-category-title">수호</h2>
            <div class="my-info-bond-slots" id="bondSlots수호"></div>
          </div>

          <!-- 탑승 카드 -->
          <div class="my-info-category-card" data-category="탑승">
            <h2 class="my-info-category-title">탑승</h2>
            <div class="my-info-bond-slots" id="bondSlots탑승"></div>
          </div>

          <!-- 변신 카드 -->
          <div class="my-info-category-card" data-category="변신">
            <h2 class="my-info-category-title">변신</h2>
            <div class="my-info-bond-slots" id="bondSlots변신"></div>
          </div>
        </div>

        <!-- 오른쪽: 전체 환수 선택 그리드 (60%) -->
        <div class="my-info-right-panel">
          <div class="my-info-spirit-section">
            <div class="my-info-spirit-tabs">
              <button class="my-info-spirit-tab active" data-category="수호">수호</button>
              <button class="my-info-spirit-tab" data-category="탑승">탑승</button>
              <button class="my-info-spirit-tab" data-category="변신">변신</button>
            </div>
            <div id="myInfoSpiritGrid"></div>
          </div>
        </div>
      </div>

      <!-- 오른쪽: 기본 스탯 섹션 (50%) -->
      <div class="my-info-stats-section-wrapper">
        <div class="my-info-stats-section">
          <!-- 프로파일 선택 섹션 (통합) -->
          <div class="my-info-profile-section">
            <div class="my-info-profile-section-left">
              <label class="my-info-profile-label">설정:</label>
              <select class="my-info-profile-select" id="profileSelect">
                <option value="">설정 없음</option>
              </select>
              <div class="my-info-profile-actions">
                <button class="my-info-profile-btn primary" id="createProfileBtn" title="새 프로파일">+</button>
                <button class="my-info-profile-btn" id="editProfileBtn" disabled title="이름 수정">✏️</button>
                <button class="my-info-profile-btn danger" id="deleteProfileBtn" disabled>삭제</button>
              </div>
            </div>
            <div class="my-info-profile-section-right">
              <div class="my-info-data-menu">
                <button id="dataMenuBtn" class="my-info-menu-btn" title="데이터 관리">
                  <span class="my-info-btn-icon">⚙️</span>
                  <span class="my-info-btn-text">데이터</span>
                  <span class="my-info-menu-arrow">▼</span>
                </button>
                <div id="dataMenuDropdown" class="my-info-menu-dropdown">
                  <button id="copyClipboardBtn" class="my-info-menu-item">
                    <span class="my-info-menu-icon">📋</span>
                    <span>클립보드 복사</span>
                  </button>
                  <button id="pasteClipboardBtn" class="my-info-menu-item">
                    <span class="my-info-menu-icon">📄</span>
                    <span>클립보드 붙여넣기</span>
                  </button>
                  <div class="my-info-menu-divider"></div>
                  <button id="exportJSONBtn" class="my-info-menu-item">
                    <span class="my-info-menu-icon">📥</span>
                    <span>JSON 내보내기</span>
                  </button>
                  <button id="exportCSVBtn" class="my-info-menu-item">
                    <span class="my-info-menu-icon">📥</span>
                    <span>CSV 내보내기</span>
                  </button>
                  <div class="my-info-menu-divider"></div>
                  <button id="importBtn" class="my-info-menu-item">
                    <span class="my-info-menu-icon">📤</span>
                    <span>파일 가져오기</span>
                  </button>
                </div>
              </div>
              <button id="saveBaselineBtn" class="my-info-save-btn">
                <span>저장</span>
              </button>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm); margin-top: var(--space-xs); position: relative;">
            <h2 class="my-info-section-title" style="margin: 0; flex: 0 0 auto;">나의 스탯</h2>
            <!-- 환산타채 합 -->
            <div class="my-info-key-stat-item" style="max-width: 300px; min-width: 250px; margin: 0; flex: 0 0 auto; left: 50%; transform: translateX(-50%);">
              <div class="my-info-key-stat-label">환산타채 합</div>
              <div class="my-info-key-stat-value-wrapper">
                <div class="my-info-key-stat-value" id="keyStatTachae">-</div>
                <div class="my-info-key-stat-change" id="keyStatTachaeChange">-</div>
              </div>
            </div>
          </div>
          <div class="my-info-stats-list">
            <!-- 1컬럼 -->
            <div class="my-info-stats-column" id="statsColumn1"></div>
            <!-- 2컬럼 -->
            <div class="my-info-stats-column" id="statsColumn2"></div>
            <!-- 3컬럼 -->
            <div class="my-info-stats-column" id="statsColumn3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 영역 -->
    <div class="my-info-bottom-section">
      <!-- 왼쪽: 환수 혼 경험치 -->
      <div class="my-info-bottom-left">
        <div class="my-info-stats-section">
          <h2 class="my-info-section-title">환수 초기화 시 환수 혼 경험치</h2>
          <div id="soulExpInfo"></div>
        </div>
      </div>

      <!-- 오른쪽: 각인 등록효과, 각인 장착효과 -->
      <div class="my-info-bottom-right">
        <div class="my-info-key-stats-section">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <h2 class="my-info-section-title">각인 효과</h2>
            <div class="my-info-engraving-notice" style="font-size: 9px; color: var(--text-secondary); padding: 0 2px;">
              ⚠️ 각인 정보는 레벨에 따른 스탯 자동으로 계산 안됩니다. 직접 입력해야합니다.
            </div>
          </div>
          <div class="my-info-key-stats-grid" id="keyStatsGrid">
            <div class="my-info-key-stat-item">
              <div class="my-info-key-stat-label">각인 등록효과</div>
              <div class="my-info-key-stat-registration-list" id="keyStatRegistrationList"></div>
            </div>
            <div class="my-info-key-stat-item">
              <div class="my-info-key-stat-label">각인 장착효과</div>
              <div class="my-info-key-stat-bind-list" id="keyStatBindList"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  `;
}

