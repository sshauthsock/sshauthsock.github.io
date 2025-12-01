/**
 * 환수 관리 모듈
 * 결속 슬롯, 환수 선택, 레벨 팝업 관리
 */

import { state as globalState } from "../../state.js";
import { createElement } from "../../utils.js";
import { renderSpiritGrid } from "../../components/spritGrid.js";
import { isFixedLevelSpirit } from "../../constants.js";
import Logger from "../../utils/logger.js";
import { pageState, elements } from "./state.js";
import { showImageLoadError } from "./ui/renderer.js";
import { getEngravingData, createEngravingItem } from "./engravingManager.js";

// 팝업 관련 전역 변수
let currentPopup = null;
let currentPopupOverlay = null;

/**
 * 팝업 닫기 (외부에서 호출 가능)
 */
export function closeSpiritLevelPopup() {
  if (currentPopup) {
    const closeBtn = currentPopup.querySelector(".my-info-spirit-popup-close");
    if (closeBtn) {
      // 팝업 내부의 cleanup 함수 호출 (이벤트 리스너 제거)
      closeBtn.click();
    } else {
      currentPopup.remove();
      currentPopup = null;
    }
  }
  if (currentPopupOverlay) {
    currentPopupOverlay.remove();
    currentPopupOverlay = null;
  }
}

// 길게 누르기를 위한 상태 변수들
let popupLongPressState = {
  isPressed: false,
  intervalId: null,
  timeoutId: null,
  hintElement: null,
  bridgeElement: null,
  hintHovered: false,
  button: null,
  spirit: null,
  category: null,
  index: null,
  action: null,
  mouseDownTime: null,
  touchStartTime: null,
  touchMoveHandler: null,
  ignoreMouseUp: false,
};

/**
 * 카테고리별 환수 목록 가져오기
 * @param {string} category - 카테고리
 * @returns {Array} 환수 목록
 */
export function getSpiritsForCategory(category) {
  const allCreatures = Array.isArray(globalState.allSpirits)
    ? globalState.allSpirits
    : [];
  return allCreatures.filter((s) => s.type === category);
}

/**
 * 결속 슬롯 렌더링
 * @param {string} category - 카테고리
 * @param {Function} setCategoryForSelection - 카테고리 선택 콜백
 * @param {Function} showSpiritLevelPopup - 레벨 팝업 표시 콜백
 */
export function renderBondSlots(
  category,
  setCategoryForSelection,
  showSpiritLevelPopup
) {
  const container = elements[`bondSlots${category}`];
  if (!container) return;

  container.innerHTML = "";
  const bondSpirits = pageState.bondSpirits[category] || [];

  // 6개 슬롯 생성 (2행 3열)
  for (let i = 0; i < 6; i++) {
    const slot = createElement("div", "my-info-bond-slot");
    slot.dataset.slotIndex = i;
    slot.dataset.category = category;

    if (bondSpirits[i]) {
      const spirit = bondSpirits[i];
      slot.classList.add("filled");

      // 사용 중인 환수인지 확인
      const active = pageState.activeSpirits[category];
      if (active && active.name === spirit.name) {
        slot.classList.add("used-spirit");
      }

      const img = createElement("img");
      
      // 이미지 경로가 없으면 실제 환수 객체에서 찾기
      if (!spirit.image) {
        const allSpirits = Array.isArray(globalState.allSpirits)
          ? globalState.allSpirits
          : [];
        const fullSpirit = allSpirits.find(
          (s) => s.name === spirit.name && s.type === category
        );
        if (fullSpirit && fullSpirit.image) {
          spirit.image = fullSpirit.image;
        } else {
          Logger.warn(`이미지 경로를 찾을 수 없습니다: ${spirit.name}`);
          // 기본 이미지 경로 시도
          spirit.image = `assets/img/${category}/${spirit.name}.webp`;
        }
      }
      
      img.src = spirit.image;
      img.alt = spirit.name;
      img.onerror = () => {
        // WebP 로드 실패 시 원본으로 폴백
        if (img.src.endsWith(".webp")) {
          const originalPath = spirit.image.replace(/\.webp$/i, ".jpg");
          img.src = originalPath;
          return; // 폴백 시도 중이므로 에러 처리 스킵
        }
        // 이미지 경로가 없거나 잘못된 경우 실제 환수 객체에서 다시 찾기
        if (!spirit.image || !spirit.image.includes('/')) {
          const allSpirits = Array.isArray(globalState.allSpirits)
            ? globalState.allSpirits
            : [];
          const fullSpirit = allSpirits.find(
            (s) => s.name === spirit.name && s.type === category
          );
          if (fullSpirit && fullSpirit.image) {
            spirit.image = fullSpirit.image;
            img.src = fullSpirit.image;
            return;
          }
        }
        pageState.imageLoadErrors.add(spirit.image || 'unknown');
        showImageLoadError();
      };
      slot.appendChild(img);

      // 레벨 표시
      const levelBadge = createElement("div");
      levelBadge.className = "level-badge";
      levelBadge.style.position = "absolute";
      levelBadge.style.bottom = "1px";
      levelBadge.style.right = "1px";
      levelBadge.style.background = "rgba(0,0,0,0.7)";
      levelBadge.style.color = "white";
      levelBadge.style.padding = "1px 3px";
      levelBadge.style.borderRadius = "2px";
      levelBadge.style.fontSize = "9px";
      levelBadge.style.fontWeight = "600";
      levelBadge.textContent = `Lv.${spirit.level || 25}`;
      levelBadge.style.pointerEvents = "none";
      slot.appendChild(levelBadge);

      // 각인 표시 (각인이 있는 경우)
      const engraving = pageState.engravingData[category]?.[spirit.name];
      if (engraving) {
        const hasRegistration =
          Array.isArray(engraving.registration) &&
          engraving.registration.length > 0;
        const hasBind =
          engraving.bind && Object.keys(engraving.bind).length > 0;

        if (hasRegistration || hasBind) {
          const engravingBadge = createElement("div");
          engravingBadge.className = "engraving-badge";
          engravingBadge.style.position = "absolute";
          engravingBadge.style.top = "1px";
          engravingBadge.style.right = "1px";
          engravingBadge.style.background = "var(--color-primary)";
          engravingBadge.style.color = "white";
          engravingBadge.style.padding = "2px 4px";
          engravingBadge.style.borderRadius = "2px";
          engravingBadge.style.fontSize = "8px";
          engravingBadge.style.fontWeight = "700";
          engravingBadge.textContent = "각인";
          engravingBadge.style.pointerEvents = "none";
          engravingBadge.style.zIndex = "10";
          slot.appendChild(engravingBadge);
        }
      }
    } else {
      slot.textContent = "+";
      slot.style.fontSize = "16px";
      slot.style.color = "var(--text-light)";
    }

    slot.addEventListener("click", (e) => {
      // 제거 버튼 클릭이 아닌 경우에만 처리
      if (
        e.target.classList.contains("remove-btn") ||
        e.target.closest(".remove-btn")
      ) {
        return;
      }

      if (!bondSpirits[i]) {
        // 슬롯이 비어있으면 오른쪽 그리드에서 선택하도록
        if (setCategoryForSelection) {
          setCategoryForSelection(category);
        }
      } else {
        // 결속 환수 이미지 클릭 시 레벨 수정 팝업 표시
        if (showSpiritLevelPopup) {
          showSpiritLevelPopup(category, i, slot, e);
        }
      }
    });

    container.appendChild(slot);
  }
}

/**
 * 사용중 환수 선택 렌더링 (현재는 빈 함수)
 * @param {string} category - 카테고리
 */
export function renderActiveSpiritSelect(category) {
  // 드롭다운이 제거되었으므로 이 함수는 더 이상 필요 없음
  // 하지만 호출되는 곳이 있을 수 있으므로 빈 함수로 유지
}

/**
 * 환수 리스트 렌더링
 * @param {Function} handleSpiritSelect - 환수 선택 콜백
 */
export function renderSpiritList(handleSpiritSelect) {
  const spirits = getSpiritsForCategory(pageState.currentCategory);

  if (spirits.length === 0) {
    elements.spiritGrid.innerHTML =
      "<p class='text-center text-sm text-light mt-lg'>환수 데이터를 불러오는 중...</p>";
    return;
  }

  // 현재 카테고리의 결속 환수 목록 가져오기 (최신 상태 보장)
  const currentCategory = pageState.currentCategory;
  const bondSpirits = pageState.bondSpirits[currentCategory] || [];
  const bondSpiritNames = new Set(bondSpirits.map((s) => s.name));

  // 사용 중인 환수 확인
  const active = pageState.activeSpirits[currentCategory];
  const activeSpiritName = active ? active.name : null;

  renderSpiritGrid({
    container: elements.spiritGrid,
    spirits: spirits,
    onSpiritClick: handleSpiritSelect,
    getSpiritState: (spirit) => {
      // 결속 슬롯에 포함되어 있는지 확인
      const isInBond = bondSpiritNames.has(spirit.name);
      // 사용 중인 환수인지 확인 (결속에 포함되어 있어야 함)
      const isUsed = isInBond && activeSpiritName === spirit.name;

      return {
        selected: isInBond,
        registrationCompleted: isUsed, // 사용 중인 환수는 registrationCompleted로 표시
        bondCompleted: false,
        level25BindAvailable: false,
      };
    },
    groupByInfluence: false,
  });
}

/**
 * 선택 카테고리 설정
 */
export function setCategoryForSelection(category) {
  pageState.currentCategory = category;
  elements.spiritTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.category === category);
  });
  // renderSpiritList는 외부에서 호출해야 함 (순환 의존성 방지)
}

/**
 * 환수 선택 처리
 * @param {Object} spirit - 선택된 환수
 * @param {Function} renderBondSlots - 결속 슬롯 렌더링 콜백
 * @param {Function} renderSpiritList - 환수 리스트 렌더링 콜백
 * @param {Function} debouncedUpdateTotalStats - 스탯 업데이트 콜백
 * @param {Function} debouncedUpdateSoulExp - 경험치 업데이트 콜백
 */
export function handleSpiritSelect(
  spirit,
  renderBondSlots,
  renderSpiritList,
  debouncedUpdateTotalStats,
  debouncedUpdateSoulExp,
  updateTotalStats = null,
  updateStatItemsWithValues = null,
  getSpiritsForCategory = null
) {
  if (!spirit) return;

  const category = pageState.currentCategory;
  const bondSpirits = pageState.bondSpirits[category] || [];

  // 이미 결속에 포함되어 있는지 확인
  const existingIndex = bondSpirits.findIndex((s) => s.name === spirit.name);

  if (existingIndex !== -1) {
    // 이미 있으면 제거
    const removedSpirit = bondSpirits[existingIndex];
    bondSpirits.splice(existingIndex, 1);
    pageState.bondSpirits[category] = bondSpirits;

    // 제거된 환수의 레벨 정보 저장 (다시 추가할 때 사용)
    if (!pageState.removedSpiritLevels[category]) {
      pageState.removedSpiritLevels[category] = {};
    }
    pageState.removedSpiritLevels[category][removedSpirit.name] =
      removedSpirit.level || 25;

    // 각인 데이터는 제거하지 않음 (결속에서 제거해도 각인 정보는 유지)

    // 초기 로딩 플래그 해제 (사용자가 환수를 제거했으므로 증감 표시)
    pageState.isInitialLoad = false;

    if (renderBondSlots) renderBondSlots(category);
    if (renderSpiritList) renderSpiritList();

    // 캐시 무효화
    pageState.lastTotalStatsHash = null;
    pageState.lastTotalStatsCalculation = null;
    pageState.lastSoulExpHash = null;
    pageState.lastSoulExpCalculation = null;

    // 즉시 업데이트 (환수 제거 시 즉시 반영되어야 함)
    if (
      updateTotalStats &&
      updateStatItemsWithValues &&
      getSpiritsForCategory
    ) {
      updateTotalStats(getSpiritsForCategory, updateStatItemsWithValues);
    } else if (debouncedUpdateTotalStats) {
      debouncedUpdateTotalStats();
    }
    if (debouncedUpdateSoulExp) debouncedUpdateSoulExp();
  } else {
    // 없으면 추가 (최대 6개)
    if (bondSpirits.length < 6) {
      // 고정 레벨 환수는 항상 25레벨로 설정
      const isFixed = isFixedLevelSpirit(spirit.name);
      let level = 25;

      // 고정 레벨 환수가 아니고, 이전에 제거된 환수인 경우 저장된 레벨 사용
      if (!isFixed) {
        const savedLevel =
          pageState.removedSpiritLevels[category]?.[spirit.name];
        if (savedLevel !== undefined) {
          level = savedLevel;
        }
      }

      const newSpirit = {
        ...spirit,
        level: level,
      };
      bondSpirits.push(newSpirit);

      // 레벨 정보 사용 후 제거 (다시 제거하면 새로운 레벨로 저장됨)
      if (
        pageState.removedSpiritLevels[category]?.[spirit.name] !== undefined
      ) {
        delete pageState.removedSpiritLevels[category][spirit.name];
      }
      pageState.bondSpirits[category] = bondSpirits;

      // 초기 로딩 플래그 해제 (사용자가 환수를 추가했으므로 증감 표시)
      pageState.isInitialLoad = false;

      // 새로 추가된 슬롯 인덱스
      const newIndex = bondSpirits.length - 1;

      // 슬롯 렌더링
      if (renderBondSlots) renderBondSlots(category);

      // 새로 추가된 슬롯 하이라이트
      const container = elements[`bondSlots${category}`];
      if (container) {
        const newSlot = container.children[newIndex];
        if (newSlot) {
          newSlot.classList.add("highlight");
          setTimeout(() => {
            newSlot.classList.remove("highlight");
          }, 1000);
        }
      }

      if (renderSpiritList) renderSpiritList();

      // 캐시 무효화
      pageState.lastTotalStatsHash = null;
      pageState.lastSoulExpHash = null;

      // 디바운스된 업데이트
      if (debouncedUpdateTotalStats) debouncedUpdateTotalStats();
      if (debouncedUpdateSoulExp) debouncedUpdateSoulExp();
    } else {
      alert("결속 슬롯은 최대 6개까지 선택할 수 있습니다.");
      return;
    }
  }
}

/**
 * 결속 환수 제거
 * @param {string} category - 카테고리
 * @param {number} index - 인덱스
 * @param {Function} renderBondSlots - 결속 슬롯 렌더링 콜백
 * @param {Function} renderActiveSpiritSelect - 사용중 환수 선택 렌더링 콜백
 * @param {Function} renderSpiritList - 환수 리스트 렌더링 콜백
 * @param {Function} debouncedUpdateTotalStats - 스탯 업데이트 콜백
 * @param {Function} debouncedUpdateSoulExp - 경험치 업데이트 콜백
 */
export function removeBondSpirit(
  category,
  index,
  renderBondSlots,
  renderActiveSpiritSelect,
  renderSpiritList,
  debouncedUpdateTotalStats,
  debouncedUpdateSoulExp,
  updateTotalStats = null,
  updateStatItemsWithValues = null,
  getSpiritsForCategory = null
) {
  const bondSpirits = pageState.bondSpirits[category] || [];
  const spirit = bondSpirits[index];

  // 제거되는 환수가 사용 중인 환수인지 확인
  const active = pageState.activeSpirits[category];
  if (active && active.name === spirit.name) {
    pageState.activeSpirits[category] = null;
  }

  bondSpirits.splice(index, 1);
  pageState.bondSpirits[category] = bondSpirits;

  // 제거된 환수의 레벨 정보 저장 (다시 추가할 때 사용)
  if (!pageState.removedSpiritLevels[category]) {
    pageState.removedSpiritLevels[category] = {};
  }
  pageState.removedSpiritLevels[category][spirit.name] = spirit.level || 25;

  // 각인 데이터는 제거하지 않음 (결속에서 제거해도 각인 정보는 유지)

  if (renderBondSlots) renderBondSlots(category);
  if (renderActiveSpiritSelect) renderActiveSpiritSelect(category);
  if (renderSpiritList) renderSpiritList();

  // 캐시 무효화
  pageState.lastTotalStatsHash = null;
  pageState.lastTotalStatsCalculation = null;
  pageState.lastSoulExpHash = null;
  pageState.lastSoulExpCalculation = null;

  // 즉시 업데이트 (환수 제거 시 즉시 반영되어야 함)
  if (updateTotalStats && updateStatItemsWithValues && getSpiritsForCategory) {
    updateTotalStats(getSpiritsForCategory, updateStatItemsWithValues);
  } else if (debouncedUpdateTotalStats) {
    debouncedUpdateTotalStats();
  }
  if (debouncedUpdateSoulExp) debouncedUpdateSoulExp();
}

/**
 * 팝업 활성 상태 업데이트
 * @param {HTMLElement} popup - 팝업 요소
 * @param {string} category - 카테고리
 * @param {Object} spirit - 환수 객체
 */
export function updatePopupActiveState(popup, category, spirit) {
  const active = pageState.activeSpirits[category];
  const isActive = active && active.name === spirit.name;
  const setActiveBtn = popup.querySelector("[data-action='set-active']");
  if (setActiveBtn) {
    if (isActive) {
      setActiveBtn.textContent = "사용중";
      setActiveBtn.classList.add("active");
    } else {
      setActiveBtn.textContent = "사용하기";
      setActiveBtn.classList.remove("active");
    }
  }
}

/**
 * 팝업 길게 누르기 시작
 * @param {Object} callbacks - 콜백 객체
 * @param {Function} callbacks.renderBondSlots - 결속 슬롯 렌더링 콜백
 * @param {Function} callbacks.updatePopupActiveState - 팝업 활성 상태 업데이트 콜백
 * @param {Function} callbacks.debouncedUpdateTotalStats - 스탯 업데이트 콜백
 * @param {Function} callbacks.debouncedUpdateSoulExp - 경험치 업데이트 콜백
 */
function startPopupLongPress(callbacks) {
  if (!popupLongPressState.button || !popupLongPressState.spirit) return;

  // 고정 레벨 환수는 레벨 변경 불가
  if (isFixedLevelSpirit(popupLongPressState.spirit.name)) {
    return;
  }

  popupLongPressState.isPressed = true;

  // 힌트 생성 직후 발생하는 mouseup 무시하기 위한 플래그 설정
  popupLongPressState.ignoreMouseUp = true;
  setTimeout(() => {
    popupLongPressState.ignoreMouseUp = false;
  }, 100);

  // 힌트 생성
  createPopupHint(callbacks);

  // 연속 증감 함수
  const performLevelChange = () => {
    if (
      !popupLongPressState.isPressed ||
      popupLongPressState.category === null ||
      popupLongPressState.index === null
    ) {
      return false;
    }

    // 최신 spirit 객체 가져오기
    const bondSpirits =
      pageState.bondSpirits[popupLongPressState.category] || [];
    const currentSpirit = bondSpirits[popupLongPressState.index];

    if (!currentSpirit) {
      return false;
    }

    const currentLevel =
      currentSpirit.level !== undefined && currentSpirit.level !== null
        ? currentSpirit.level
        : 25;
    let changed = false;

    if (popupLongPressState.action === "level-down" && currentLevel > 0) {
      currentSpirit.level = Math.max(0, currentLevel - 1);
      changed = true;
    } else if (popupLongPressState.action === "level-up" && currentLevel < 25) {
      currentSpirit.level = Math.min(25, currentLevel + 1);
      changed = true;
    }

    if (changed) {
      // 사용중 환수인 경우 activeSpirits의 레벨도 함께 업데이트
      const active = pageState.activeSpirits[popupLongPressState.category];
      if (active && active.name === currentSpirit.name) {
        pageState.activeSpirits[popupLongPressState.category] = {
          ...active,
          level: currentSpirit.level,
        };
      }

      // 저장 버튼을 눌러야 저장됨 (자동 저장 제거)

      const levelInput = currentPopup?.querySelector(".level-input");
      if (levelInput) {
        levelInput.value = currentSpirit.level;
      }
      if (callbacks?.renderBondSlots) {
        callbacks.renderBondSlots(popupLongPressState.category);
      }
      if (callbacks?.updatePopupActiveState) {
        callbacks.updatePopupActiveState(
          currentPopup,
          popupLongPressState.category,
          currentSpirit
        );
      }

      // 초기 로딩 플래그 해제 (사용자가 레벨을 변경했으므로 증감 표시)
      pageState.isInitialLoad = false;

      // 캐시 무효화 (레벨 변경 시 재계산 필요)
      pageState.lastTotalStatsHash = null;
      pageState.lastTotalStatsCalculation = null;
      pageState.lastSoulExpHash = null;
      pageState.lastSoulExpCalculation = null;

      // 즉시 업데이트 (레벨 변경 시 즉시 반영되어야 함)
      if (
        callbacks?.updateTotalStats &&
        callbacks?.updateStatItemsWithValues &&
        callbacks?.getSpiritsForCategory
      ) {
        callbacks.updateTotalStats(
          callbacks.getSpiritsForCategory,
          callbacks.updateStatItemsWithValues
        );
      } else if (callbacks?.debouncedUpdateTotalStats) {
        callbacks.debouncedUpdateTotalStats();
      }
      if (callbacks?.debouncedUpdateSoulExp) {
        callbacks.debouncedUpdateSoulExp();
      }

      return true;
    }
    return false;
  };

  // 첫 번째 변경 즉시 실행
  performLevelChange();

  // 연속 증감 시작 (200ms 간격)
  popupLongPressState.intervalId = setInterval(() => {
    if (!performLevelChange()) {
      stopPopupLongPress();
    }
  }, 200);
}

/**
 * 팝업 길게 누르기 중지
 */
export function stopPopupLongPress() {
  if (popupLongPressState.intervalId) {
    clearInterval(popupLongPressState.intervalId);
    popupLongPressState.intervalId = null;
  }

  if (popupLongPressState.timeoutId) {
    clearTimeout(popupLongPressState.timeoutId);
    popupLongPressState.timeoutId = null;
  }

  removePopupHint();

  if (popupLongPressState.touchMoveHandler) {
    document.removeEventListener(
      "touchmove",
      popupLongPressState.touchMoveHandler
    );
    popupLongPressState.touchMoveHandler = null;
  }

  popupLongPressState.isPressed = false;
  popupLongPressState.hintHovered = false;
  popupLongPressState.bridgeElement = null;
  popupLongPressState.button = null;
  popupLongPressState.spirit = null;
  popupLongPressState.category = null;
  popupLongPressState.index = null;
  popupLongPressState.action = null;
  popupLongPressState.mouseDownTime = null;
  popupLongPressState.touchStartTime = null;
  popupLongPressState.ignoreMouseUp = false;
}

/**
 * 팝업 힌트 생성
 * @param {Object} callbacks - 콜백 객체
 * @param {Function} callbacks.renderBondSlots - 결속 슬롯 렌더링 콜백
 * @param {Function} callbacks.updatePopupActiveState - 팝업 활성 상태 업데이트 콜백
 * @param {Function} callbacks.debouncedUpdateTotalStats - 스탯 업데이트 콜백
 * @param {Function} callbacks.debouncedUpdateSoulExp - 경험치 업데이트 콜백
 */
function createPopupHint(callbacks) {
  if (!popupLongPressState.button) return;

  const targetValue = popupLongPressState.action === "level-down" ? 0 : 25;
  const hintText = targetValue.toString();

  const hint = createElement("div", "level-hint");
  hint.textContent = hintText;

  // 버튼 바로 옆에 힌트 배치
  const buttonRect = popupLongPressState.button.getBoundingClientRect();

  hint.style.position = "fixed";
  hint.style.top = buttonRect.top + "px";
  hint.style.zIndex = "1001";
  hint.style.color = "white";
  hint.style.padding = "0px 4px";
  hint.style.margin = "0";
  hint.style.border = "none";
  hint.style.borderRadius = "3px";
  hint.style.fontSize = "10px";
  hint.style.fontWeight = "bold";
  hint.style.pointerEvents = "none";
  hint.style.cursor = "pointer";
  hint.style.whiteSpace = "nowrap";
  hint.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
  hint.style.textAlign = "center";
  hint.style.height = buttonRect.height + "px";
  hint.style.lineHeight = buttonRect.height + "px";
  hint.style.width = "32px";
  hint.style.display = "flex";
  hint.style.alignItems = "center";
  hint.style.justifyContent = "center";
  hint.style.transition = "all 0.2s ease";

  if (popupLongPressState.action === "level-down") {
    hint.style.left = buttonRect.left - 36 + "px";
    hint.style.backgroundColor = "#f44336";
  } else {
    hint.style.left = buttonRect.right + 4 + "px";
    hint.style.backgroundColor = "#4CAF50";
  }

  document.body.appendChild(hint);
  popupLongPressState.hintElement = hint;
  popupLongPressState.hintHovered = false;

  // 브리지 영역 생성
  const bridge = createElement("div", "hint-bridge");
  bridge.style.position = "fixed";
  bridge.style.top = buttonRect.top + "px";
  bridge.style.height = buttonRect.height + "px";
  bridge.style.zIndex = "1000";
  bridge.style.backgroundColor = "transparent";
  bridge.style.pointerEvents = "none";

  if (popupLongPressState.action === "level-down") {
    bridge.style.left = buttonRect.left - 36 + "px";
    bridge.style.width = 36 + buttonRect.width + 4 + "px";
  } else {
    bridge.style.left = buttonRect.left + "px";
    bridge.style.width = buttonRect.width + 4 + 32 + "px";
  }

  document.body.appendChild(bridge);
  popupLongPressState.bridgeElement = bridge;

  // 힌트 이벤트 리스너
  const handleHintEnter = () => {
    if (popupLongPressState.isPressed) {
      popupLongPressState.hintHovered = true;
      hint.style.transform = "scale(1.2)";
      hint.style.fontSize = "12px";
      hint.style.fontWeight = "900";
      hint.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    }
  };

  const handleHintLeave = () => {
    if (popupLongPressState.isPressed) {
      popupLongPressState.hintHovered = false;
      hint.style.transform = "scale(1)";
      hint.style.fontSize = "10px";
      hint.style.fontWeight = "bold";
      hint.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
    }
  };

  const handleHintMouseUp = () => {
    if (popupLongPressState.isPressed) {
      if (popupLongPressState.hintHovered) {
        const targetValue =
          popupLongPressState.action === "level-down" ? 0 : 25;
        if (popupLongPressState.spirit) {
          // 초기 로딩 플래그 해제 (사용자가 레벨을 변경했으므로 증감 표시)
          pageState.isInitialLoad = false;

          popupLongPressState.spirit.level = targetValue;

          // 사용중 환수인 경우 activeSpirits의 레벨도 함께 업데이트
          const active = pageState.activeSpirits[popupLongPressState.category];
          if (active && active.name === popupLongPressState.spirit.name) {
            pageState.activeSpirits[popupLongPressState.category] = {
              ...active,
              level: targetValue,
            };
          }

          const levelInput = currentPopup?.querySelector(".level-input");
          if (levelInput) {
            levelInput.value = targetValue;
          }
          // 저장 버튼을 눌러야 저장됨 (자동 저장 제거)

          if (callbacks?.renderBondSlots) {
            callbacks.renderBondSlots(popupLongPressState.category);
          }
          if (callbacks?.updatePopupActiveState) {
            callbacks.updatePopupActiveState(
              currentPopup,
              popupLongPressState.category,
              popupLongPressState.spirit
            );
          }

          // 초기 로딩 플래그 해제 (사용자가 레벨을 변경했으므로 증감 표시)
          pageState.isInitialLoad = false;

          // 캐시 무효화
          pageState.lastTotalStatsHash = null;
          pageState.lastTotalStatsCalculation = null;
          pageState.lastSoulExpHash = null;
          pageState.lastSoulExpCalculation = null;

          // 즉시 업데이트 (레벨 변경 시 즉시 반영되어야 함)
          if (
            callbacks?.updateTotalStats &&
            callbacks?.updateStatItemsWithValues &&
            callbacks?.getSpiritsForCategory
          ) {
            callbacks.updateTotalStats(
              callbacks.getSpiritsForCategory,
              callbacks.updateStatItemsWithValues
            );
          } else if (callbacks?.debouncedUpdateTotalStats) {
            callbacks.debouncedUpdateTotalStats();
          }
          if (callbacks?.debouncedUpdateSoulExp) {
            callbacks.debouncedUpdateSoulExp();
          }
        }
      }
      stopPopupLongPress();
    }
  };

  hint.addEventListener("mouseenter", handleHintEnter);
  hint.addEventListener("mouseup", handleHintMouseUp);
  hint.addEventListener("mouseleave", (e) => {
    if (!bridge.contains(e.relatedTarget) && e.relatedTarget !== bridge) {
      handleHintLeave();
    }
  });

  hint.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleHintEnter();
    },
    { passive: false }
  );

  hint.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleHintMouseUp();
    },
    { passive: false }
  );

  // 브리지 이벤트
  bridge.addEventListener("mouseleave", (e) => {
    // 브리지에서 힌트로 이동하는 경우는 제외
    if (!hint.contains(e.relatedTarget) && e.relatedTarget !== hint) {
      handleHintLeave();
    }
  });

  bridge.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleHintEnter(); // 브리지도 hover 상태로 설정
    },
    { passive: false }
  );

  bridge.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      // 브리지에서는 값 적용하지 않음 (힌트로만 적용)
    },
    { passive: false }
  );

  // 터치 이동 처리
  const handleTouchMove = (e) => {
    if (!popupLongPressState.isPressed) return;

    const touch = e.touches[0];
    const elementUnderTouch = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );
    const hint = popupLongPressState.hintElement;
    const bridge = popupLongPressState.bridgeElement;

    if (!hint) return;

    const isOnHint =
      elementUnderTouch === hint || hint.contains(elementUnderTouch);
    const isOnBridge = elementUnderTouch === bridge;

    if (isOnHint || isOnBridge) {
      if (!popupLongPressState.hintHovered) {
        hint.style.pointerEvents = "auto";
        bridge.style.pointerEvents = "auto";
        popupLongPressState.hintHovered = true;
        hint.style.transform = "scale(1.2)";
        hint.style.fontSize = "12px";
        hint.style.fontWeight = "900";
        hint.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      }
    } else {
      if (popupLongPressState.hintHovered) {
        hint.style.pointerEvents = "none";
        bridge.style.pointerEvents = "none";
        popupLongPressState.hintHovered = false;
        hint.style.transform = "scale(1)";
        hint.style.fontSize = "10px";
        hint.style.fontWeight = "bold";
        hint.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
      }
    }
  };

  popupLongPressState.touchMoveHandler = handleTouchMove;
  document.addEventListener("touchmove", handleTouchMove, { passive: false });

  // 모든 이벤트 리스너 추가 후 pointerEvents 활성화 (버튼 방해 방지)
  // setTimeout을 사용하여 다음 이벤트 루프에서 활성화
  setTimeout(() => {
    if (hint && popupLongPressState.isPressed) {
      hint.style.pointerEvents = "auto";
    }
    if (bridge && popupLongPressState.isPressed) {
      bridge.style.pointerEvents = "auto";
    }
  }, 0);
}

/**
 * 팝업 힌트 제거
 */
function removePopupHint() {
  if (popupLongPressState.hintElement) {
    popupLongPressState.hintElement.remove();
    popupLongPressState.hintElement = null;
  }
  if (popupLongPressState.bridgeElement) {
    popupLongPressState.bridgeElement.remove();
    popupLongPressState.bridgeElement = null;
  }
}

/**
 * 환수 레벨 팝업 표시
 * @param {string} category - 카테고리
 * @param {number} index - 인덱스
 * @param {HTMLElement} slot - 슬롯 요소
 * @param {Event} event - 이벤트
 * @param {Object} callbacks - 콜백 객체
 * @param {Function} callbacks.renderBondSlots - 결속 슬롯 렌더링 콜백
 * @param {Function} callbacks.updateTotalStats - 스탯 업데이트 콜백
 * @param {Function} callbacks.updateSoulExp - 경험치 업데이트 콜백
 * @param {Function} callbacks.debouncedUpdateTotalStats - 디바운스된 스탯 업데이트 콜백
 * @param {Function} callbacks.debouncedUpdateSoulExp - 디바운스된 경험치 업데이트 콜백
 * @param {Function} callbacks.updateStatItemsWithValues - 스탯 아이템 업데이트 콜백
 * @param {Function} callbacks.removeBondSpirit - 결속 환수 제거 콜백
 */
export function showSpiritLevelPopup(category, index, slot, event, callbacks) {
  const bondSpirits = pageState.bondSpirits[category] || [];
  const spirit = bondSpirits[index];
  if (!spirit) return;

  // 기존 팝업 제거
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
  if (currentPopupOverlay) {
    currentPopupOverlay.remove();
    currentPopupOverlay = null;
  }

  // 팝업 생성
  const popup = createElement("div", "my-info-spirit-popup");

  // 오버레이 생성 (배경 어둡게)
  const overlay = createElement("div", "my-info-spirit-popup-overlay");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    z-index: 999;
  `;

  // 오버레이 클릭 시 팝업 닫기
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      popup.remove();
      overlay.remove();
      currentPopup = null;
      currentPopupOverlay = null;
    }
  });

  document.body.appendChild(overlay);
  currentPopupOverlay = overlay;

  const active = pageState.activeSpirits[category];
  const isActive = active && active.name === spirit.name;
  const isFixed = isFixedLevelSpirit(spirit.name);

  // 현재 각인 데이터 가져오기
  const currentEngraving =
    pageState.engravingData[category]?.[spirit.name] || {};
  const registrationCount = Array.isArray(currentEngraving.registration)
    ? currentEngraving.registration.length
    : 0;

  popup.innerHTML = `
    <button class="my-info-spirit-popup-close">×</button>
    <div class="kakao-ad-popup-container desktop-popup-ad">
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-aOM3JPGvOLhHlyoS"
          data-ad-width="728"
          data-ad-height="90"></ins>
    </div>
    <div class="kakao-ad-popup-container mobile-popup-ad">
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-epbkjAaeHSxv0MYl"
          data-ad-width="320"
          data-ad-height="50"></ins>
    </div>
    <div class="my-info-spirit-popup-content">
      <div class="my-info-spirit-popup-header">
        <div style="display: flex; align-items: center; gap: var(--space-sm);">
          <img src="${spirit.image}" alt="${spirit.name}" loading="lazy">
          <div class="my-info-spirit-popup-name">${spirit.name}</div>
        </div>
        <div style="display: flex; align-items: center; justify-content: center; flex: 1;">
          <div class="spirit-level-control">
            ${
              isFixed
                ? `<div class="fixed-level-control">
                    <span class="fixed-level-label">레벨 25 (고정)</span>
                  </div>`
                : `<div style="display: flex; align-items: center; gap: 4px;">
                    <button class="level-btn minus-btn" data-action="level-down">-</button>
                    <input type="number" class="level-input" min="0" max="25" value="${
                      spirit.level || 25
                    }">
                    <button class="level-btn plus-btn" data-action="level-up">+</button>
                  </div>`
            }
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: var(--space-xs);">
          <div class="my-info-spirit-popup-actions">
            <button class="my-info-spirit-popup-action-btn ${
              isActive ? "active" : ""
            }" data-action="set-active">
              ${isActive ? "사용중" : "사용하기"}
            </button>
            <button class="my-info-spirit-popup-action-btn remove" data-action="remove">결속 제거</button>
          </div>
        </div>
      </div>
      <div class="my-info-engraving-tabs">
        <button class="my-info-engraving-tab active" data-tab="registration">등록효과</button>
        <button class="my-info-engraving-tab" data-tab="bind">장착효과</button>
      </div>
      <div class="my-info-engraving-tab-content active" id="registrationTab">
        <div id="registrationItemsContainer"></div>
        <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-sm);">
          <button class="my-info-engraving-add-btn" id="addEngravingBtn" ${
            registrationCount >= 4 ? "disabled" : ""
          }>
            + 등록효과 추가 (${registrationCount}/4)
          </button>
          <button class="my-info-engraving-save-btn" id="saveEngravingBtn">각인 저장</button>
        </div>
      </div>
      <div class="my-info-engraving-tab-content" id="bindTab">
        <div id="bindItemsContainer"></div>
        <div style="display: flex; gap: var(--space-sm); margin-top: var(--space-sm); justify-content: flex-end;">
          <button class="my-info-engraving-save-btn" id="saveEngravingBtnBind" style="flex: 0 1 50%; max-width: 50%;">각인 저장</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  currentPopup = popup;

  // 팝업 이미지에 에러 핸들러 추가
  const popupImg = popup.querySelector("img");
  if (popupImg) {
    popupImg.onerror = () => {
      pageState.imageLoadErrors.add(popupImg.src);
      showImageLoadError();
    };
  }

  // 광고 렌더링
  setTimeout(() => {
    try {
      const desktopAdElement = popup.querySelector(
        ".desktop-popup-ad .kakao_ad_area"
      );
      const mobileAdElement = popup.querySelector(
        ".mobile-popup-ad .kakao_ad_area"
      );

      if (window.adfit && typeof window.adfit.render === "function") {
        if (desktopAdElement) window.adfit.render(desktopAdElement);
        if (mobileAdElement) window.adfit.render(mobileAdElement);
      }
    } catch (error) {
      Logger.error("Kakao AdFit: Error rendering ads in popup:", error);
    }
  }, 100);

  // 이벤트 리스너
  const closeBtn = popup.querySelector(".my-info-spirit-popup-close");

  // 콜백 객체 생성 (내부 함수에서 사용)
  const internalCallbacks = {
    renderBondSlots: callbacks?.renderBondSlots,
    updatePopupActiveState: updatePopupActiveState,
    debouncedUpdateTotalStats: callbacks?.debouncedUpdateTotalStats,
    debouncedUpdateSoulExp: callbacks?.debouncedUpdateSoulExp,
  };

  // 레벨 컨트롤 이벤트 (고정 레벨이 아닌 경우)
  if (!isFixed) {
    const levelInput = popup.querySelector(".level-input");
    const minusBtn = popup.querySelector(".minus-btn");
    const plusBtn = popup.querySelector(".plus-btn");

    levelInput.focus();
    levelInput.select();

    // 길게 누르기 기능을 위한 mousedown/touchstart 이벤트
    const setupLongPress = (btn, action) => {
      const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // 이전 상태 정리
        if (popupLongPressState.timeoutId) {
          clearTimeout(popupLongPressState.timeoutId);
        }
        if (popupLongPressState.intervalId) {
          clearInterval(popupLongPressState.intervalId);
        }

        // 길게 누르기 상태 설정
        popupLongPressState.isPressed = false;
        popupLongPressState.button = btn;
        popupLongPressState.spirit = spirit;
        popupLongPressState.category = category;
        popupLongPressState.index = index;
        popupLongPressState.action = action;
        popupLongPressState.hintHovered = false;
        popupLongPressState.mouseDownTime = Date.now();

        // 300ms 후에 길게 누르기 시작
        popupLongPressState.timeoutId = setTimeout(() => {
          if (popupLongPressState.button === btn) {
            startPopupLongPress(internalCallbacks);
          }
        }, 300);
      };

      const handleTouchStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        popupLongPressState.touchStartTime = Date.now();
        handleMouseDown(e);
      };

      btn.addEventListener("mousedown", handleMouseDown);
      btn.addEventListener("touchstart", handleTouchStart, { passive: false });
    };

    setupLongPress(minusBtn, "level-down");
    setupLongPress(plusBtn, "level-up");

    // 레벨 입력 변경 시 (저장 버튼을 눌러야 저장됨)
    levelInput.addEventListener("change", () => {
      let level = parseInt(levelInput.value, 10) || 25;
      if (level < 0) level = 0;
      if (level > 25) level = 25;
      levelInput.value = level;
      spirit.level = level;

      // 사용중 환수인 경우 activeSpirits의 레벨도 함께 업데이트
      const active = pageState.activeSpirits[category];
      if (active && active.name === spirit.name) {
        pageState.activeSpirits[category] = {
          ...active,
          level: level,
        };
      }

      // 저장 버튼을 눌러야 저장됨 (자동 저장 제거)

      if (callbacks?.renderBondSlots) {
        callbacks.renderBondSlots(category);
      }
      updatePopupActiveState(popup, category, spirit);

      // 초기 로딩 플래그 해제 (사용자가 레벨을 변경했으므로 증감 표시)
      pageState.isInitialLoad = false;

      // 캐시 무효화 (레벨 변경 시 재계산 필요)
      pageState.lastTotalStatsHash = null;
      pageState.lastTotalStatsCalculation = null;
      pageState.lastSoulExpHash = null;
      pageState.lastSoulExpCalculation = null;

      // 즉시 업데이트 (레벨 변경 시 즉시 반영되어야 함)
      if (
        callbacks?.updateTotalStats &&
        callbacks?.updateStatItemsWithValues &&
        callbacks?.getSpiritsForCategory
      ) {
        callbacks.updateTotalStats(
          callbacks.getSpiritsForCategory,
          callbacks.updateStatItemsWithValues
        );
      } else if (callbacks?.debouncedUpdateTotalStats) {
        callbacks.debouncedUpdateTotalStats();
      }
      if (callbacks?.debouncedUpdateSoulExp) {
        callbacks.debouncedUpdateSoulExp();
      }
    });
  }

  // 전역 mouseup/touchend 이벤트로 길게 누르기 중지
  const handleGlobalMouseUp = (e) => {
    // ignoreMouseUp 플래그가 true면 무시
    if (popupLongPressState.ignoreMouseUp) {
      return;
    }

    // 길게 누르기가 시작되지 않았다면 timeout만 취소하고 짧은 클릭 처리
    if (popupLongPressState.timeoutId && !popupLongPressState.isPressed) {
      clearTimeout(popupLongPressState.timeoutId);
      popupLongPressState.timeoutId = null;

      // 짧은 클릭인지 확인 (300ms 이내)
      const clickDuration = popupLongPressState.mouseDownTime
        ? Date.now() - popupLongPressState.mouseDownTime
        : 0;
      const isShortClick = clickDuration > 0 && clickDuration < 300;

      // 짧은 클릭 처리
      if (
        isShortClick &&
        popupLongPressState.category !== null &&
        popupLongPressState.index !== null
      ) {
        // 최신 spirit 객체 가져오기
        const bondSpirits =
          pageState.bondSpirits[popupLongPressState.category] || [];
        const currentSpirit = bondSpirits[popupLongPressState.index];

        if (currentSpirit) {
          let level =
            currentSpirit.level !== undefined && currentSpirit.level !== null
              ? currentSpirit.level
              : 25;
          let changed = false;

          if (popupLongPressState.action === "level-down" && level > 0) {
            level = Math.max(0, level - 1);
            changed = true;
          } else if (popupLongPressState.action === "level-up" && level < 25) {
            level = Math.min(25, level + 1);
            changed = true;
          }

          if (changed) {
            const oldLevel = currentSpirit.level;
            currentSpirit.level = level;

            // 사용중 환수인 경우 activeSpirits의 레벨도 함께 업데이트
            const active =
              pageState.activeSpirits[popupLongPressState.category];
            if (active && active.name === currentSpirit.name) {
              pageState.activeSpirits[popupLongPressState.category] = {
                ...active,
                level: level,
              };
            }

            const levelInput = popup.querySelector(".level-input");
            if (levelInput) {
              levelInput.value = level;
            }

            // 초기 로딩 플래그 해제 (사용자가 레벨을 변경했으므로 증감 표시)
            pageState.isInitialLoad = false;

            // 로그 출력: 레벨 변경

            // 저장 버튼을 눌러야 저장됨 (자동 저장 제거)

            if (callbacks?.renderBondSlots) {
              callbacks.renderBondSlots(popupLongPressState.category);
            }
            updatePopupActiveState(
              popup,
              popupLongPressState.category,
              currentSpirit
            );

            // 캐시 무효화
            pageState.lastTotalStatsHash = null;
            pageState.lastTotalStatsCalculation = null;
            pageState.lastSoulExpHash = null;
            pageState.lastSoulExpCalculation = null;
            if (callbacks?.debouncedUpdateTotalStats) {
              callbacks.debouncedUpdateTotalStats();
            }
            if (callbacks?.debouncedUpdateSoulExp) {
              callbacks.debouncedUpdateSoulExp();
            }
          }
        }
      }

      // 상태 초기화
      popupLongPressState.button = null;
      popupLongPressState.spirit = null;
      popupLongPressState.category = null;
      popupLongPressState.index = null;
      popupLongPressState.action = null;
      popupLongPressState.mouseDownTime = null;
      return;
    }

    // 길게 누르기가 활성화된 상태라면 중지
    if (popupLongPressState.isPressed) {
      // 터치 이벤트인 경우 힌트와의 충돌 감지
      if (e.type === "touchend" && popupLongPressState.hintElement) {
        const touch = e.changedTouches?.[0] || e;
        const hintRect =
          popupLongPressState.hintElement.getBoundingClientRect();
        const isWithinHint =
          touch.clientX >= hintRect.left &&
          touch.clientX <= hintRect.right &&
          touch.clientY >= hintRect.top &&
          touch.clientY <= hintRect.bottom;

        if (isWithinHint) {
          popupLongPressState.hintHovered = true;
        }
      }

      // 힌트에 마우스가 올려져 있다면 해당 값으로 적용
      if (
        popupLongPressState.hintHovered &&
        popupLongPressState.category !== null &&
        popupLongPressState.index !== null
      ) {
        const targetValue =
          popupLongPressState.action === "level-down" ? 0 : 25;
        // 최신 spirit 객체 가져오기
        const bondSpirits =
          pageState.bondSpirits[popupLongPressState.category] || [];
        const currentSpirit = bondSpirits[popupLongPressState.index];

        if (currentSpirit) {
          currentSpirit.level = targetValue;

          // 사용중 환수인 경우 activeSpirits의 레벨도 함께 업데이트
          const active = pageState.activeSpirits[popupLongPressState.category];
          if (active && active.name === currentSpirit.name) {
            pageState.activeSpirits[popupLongPressState.category] = {
              ...active,
              level: targetValue,
            };
          }

          const levelInput = popup.querySelector(".level-input");
          if (levelInput) {
            levelInput.value = targetValue;
          }
          // saveData() 제거: 저장 버튼을 눌러야 저장됨
          if (callbacks?.renderBondSlots) {
            callbacks.renderBondSlots(popupLongPressState.category);
          }
          updatePopupActiveState(
            popup,
            popupLongPressState.category,
            currentSpirit
          );

          // 캐시 무효화
          pageState.lastTotalStatsHash = null;
          pageState.lastSoulExpHash = null;
          if (callbacks?.debouncedUpdateTotalStats) {
            callbacks.debouncedUpdateTotalStats();
          }
          if (callbacks?.debouncedUpdateSoulExp) {
            callbacks.debouncedUpdateSoulExp();
          }
        }
      }

      stopPopupLongPress();
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // 상태가 남아있으면 초기화
    if (popupLongPressState.button || popupLongPressState.timeoutId) {
      popupLongPressState.button = null;
      popupLongPressState.spirit = null;
      popupLongPressState.category = null;
      popupLongPressState.index = null;
      popupLongPressState.action = null;
      popupLongPressState.mouseDownTime = null;
      popupLongPressState.touchStartTime = null;
      if (popupLongPressState.timeoutId) {
        clearTimeout(popupLongPressState.timeoutId);
        popupLongPressState.timeoutId = null;
      }
    }
  };

  const handleGlobalTouchEnd = (e) => {
    // 가상의 마우스 이벤트로 변환하여 handleGlobalMouseUp 호출
    const touch = e.changedTouches[0];
    const fakeEvent = {
      ...e,
      type: "touchend",
      clientX: touch.clientX,
      clientY: touch.clientY,
      changedTouches: [touch],
    };

    handleGlobalMouseUp(fakeEvent);
  };

  document.addEventListener("mouseup", handleGlobalMouseUp);
  document.addEventListener("touchend", handleGlobalTouchEnd, {
    passive: false,
  });

  // 팝업이 닫힐 때 이벤트 리스너 제거
  const cleanup = () => {
    stopPopupLongPress();
    document.removeEventListener("mouseup", handleGlobalMouseUp);
    document.removeEventListener("touchend", handleGlobalTouchEnd);
    popup.remove();
    if (currentPopupOverlay) {
      currentPopupOverlay.remove();
      currentPopupOverlay = null;
    }
    currentPopup = null;
  };

  // closeBtn 클릭 시 cleanup 호출
  closeBtn.addEventListener("click", cleanup);

  // 외부 클릭은 오버레이에서 처리하므로 제거

  const setActiveBtn = popup.querySelector("[data-action='set-active']");
  setActiveBtn.addEventListener("click", () => {
    const previousActive = pageState.activeSpirits[category];
    const active = pageState.activeSpirits[category];

    if (active && active.name === spirit.name) {
      // 같은 환수를 다시 클릭하면 사용중 해제
      pageState.activeSpirits[category] = null;
      setActiveBtn.textContent = "사용하기";
      setActiveBtn.classList.remove("active");
    } else {
      const level = isFixed
        ? 25
        : parseInt(popup.querySelector(".level-input")?.value, 10) ||
          spirit.level ||
          25;
      // activeSpirits에 저장할 때 spirit 객체의 모든 속성을 복사하되, level은 최신 값으로 설정
      const newActive = {
        name: spirit.name,
        level: level,
        ...spirit, // spirit의 다른 속성들도 포함 (grade, influence 등)
      };
      // level은 명시적으로 설정한 값으로 덮어쓰기
      newActive.level = level;
      pageState.activeSpirits[category] = newActive;
      spirit.level = level;
      setActiveBtn.textContent = "사용중";
      setActiveBtn.classList.add("active");
      setActiveBtn.textContent = "사용중";
      setActiveBtn.classList.add("active");
    }

    // 초기 로딩 플래그 해제 (사용자가 사용중 환수를 변경했으므로 증감 표시)
    pageState.isInitialLoad = false;

    // 저장 버튼을 눌러야 저장됨 (자동 저장 제거)

    if (callbacks?.renderBondSlots) {
      callbacks.renderBondSlots(category);
    }
    updatePopupActiveState(popup, category, spirit);

    // 캐시 무효화 및 즉시 업데이트 (사용중 환수 변경 시 각인 등록효과가 즉시 반영되어야 함)
    pageState.lastTotalStatsHash = null;
    pageState.lastTotalStatsCalculation = null;
    pageState.lastSoulExpHash = null;
    pageState.lastSoulExpCalculation = null;
    if (callbacks?.updateTotalStats) {
      callbacks.updateTotalStats(
        getSpiritsForCategory,
        callbacks.updateStatItemsWithValues
      );
    }
    if (callbacks?.updateSoulExp) {
      callbacks.updateSoulExp(getSpiritsForCategory);
    }
  });

  const removeBtn = popup.querySelector("[data-action='remove']");
  removeBtn.addEventListener("click", () => {
    stopPopupLongPress();
    if (callbacks?.removeBondSpirit) {
      callbacks.removeBondSpirit(category, index);
    }
    cleanup();
  });

  // 각인 설정 기능 통합
  const registrationContainer = popup.querySelector(
    "#registrationItemsContainer"
  );
  const bindContainer = popup.querySelector("#bindItemsContainer");
  const addBtn = popup.querySelector("#addEngravingBtn");
  const saveBtn = popup.querySelector("#saveEngravingBtn");
  const saveBtnBind = popup.querySelector("#saveEngravingBtnBind");
  const engravingTabs = popup.querySelectorAll(".my-info-engraving-tab");
  const engravingTabContents = popup.querySelectorAll(
    ".my-info-engraving-tab-content"
  );

  // 등록효과와 장착효과 데이터 가져오기 (engravingManager.js의 함수 사용)
  function getEngravingDataLocal() {
    return getEngravingData(category, spirit.name);
  }

  // 등록효과 탭 렌더링
  function renderRegistrationTab() {
    if (!registrationContainer) return;
    registrationContainer.innerHTML = "";
    const { registrationItems } = getEngravingDataLocal();

    registrationItems.forEach((regItem, index) => {
      const statKey = regItem.statKey || "";
      const value = regItem.value || "";
      const item = createEngravingItem(
        statKey,
        value,
        "",
        "registration",
        index,
        () => renderBindTab(), // 스탯 선택 변경 시 장착효과 탭 업데이트
        (item) => {
          // 제거 버튼 클릭
          item.remove();
          if (addBtn) {
            const newCount = registrationContainer.querySelectorAll(
              '.my-info-engraving-item[data-type="registration"]'
            ).length;
            addBtn.disabled = newCount >= 4;
            addBtn.textContent = `+ 등록효과 추가 (${newCount}/4)`;
          }
          renderBindTab();
        }
      );
      registrationContainer.appendChild(item);
    });

    if (addBtn) {
      const registrationCount = registrationItems.length;
      addBtn.disabled = registrationCount >= 4;
      addBtn.textContent = `+ 등록효과 추가 (${registrationCount}/4)`;
    }
  }

  // 장착효과 탭 렌더링
  function renderBindTab() {
    if (!bindContainer) return;
    bindContainer.innerHTML = "";

    const registrationItemsElements = registrationContainer.querySelectorAll(
      '.my-info-engraving-item[data-type="registration"]'
    );

    const uniqueStats = new Set();
    registrationItemsElements.forEach((item) => {
      const statSelect = item.querySelector(".my-info-engraving-stat-select");
      const statKey = statSelect?.value || "";
      if (statKey) {
        uniqueStats.add(statKey);
      }
    });

    const { bindStats } = getEngravingDataLocal();

    uniqueStats.forEach((statKey) => {
      const currentValue = bindStats[statKey] || "";
      const item = createEngravingItem(statKey, "", currentValue, "bind");
      bindContainer.appendChild(item);
    });
  }

  // 전체 렌더링
  function renderEngravingItems() {
    renderRegistrationTab();
    renderBindTab();
  }

  // 각인 탭 전환 기능
  if (engravingTabs && engravingTabContents) {
    engravingTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetTab = tab.dataset.tab;

        engravingTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        engravingTabContents.forEach((content) => {
          content.classList.remove("active");
          if (content.id === `${targetTab}Tab`) {
            content.classList.add("active");
          }
        });
      });
    });
  }

  // 초기 렌더링
  renderEngravingItems();

  // 각인 추가 버튼
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const currentRegistrationItems = registrationContainer.querySelectorAll(
        '.my-info-engraving-item[data-type="registration"]'
      );
      if (currentRegistrationItems.length >= 4) {
        return;
      }
      const item = createEngravingItem(
        "",
        "",
        "",
        "registration",
        null,
        () => renderBindTab(), // 스탯 선택 변경 시 장착효과 탭 업데이트
        (item) => {
          // 제거 버튼 클릭
          item.remove();
          if (addBtn) {
            const newCount = registrationContainer.querySelectorAll(
              '.my-info-engraving-item[data-type="registration"]'
            ).length;
            addBtn.disabled = newCount >= 4;
            addBtn.textContent = `+ 등록효과 추가 (${newCount}/4)`;
          }
          renderBindTab();
        }
      );
      registrationContainer.appendChild(item);
      renderBindTab();
      if (addBtn) {
        const newCount = registrationContainer.querySelectorAll(
          '.my-info-engraving-item[data-type="registration"]'
        ).length;
        addBtn.disabled = newCount >= 4;
        addBtn.textContent = `+ 등록효과 추가 (${newCount}/4)`;
      }
    });
  }

  // 각인 저장 버튼
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const registrationItems = [];
      const bindStats = {};

      const registrationItemsElements = registrationContainer.querySelectorAll(
        '.my-info-engraving-item[data-type="registration"]'
      );
      registrationItemsElements.forEach((item) => {
        const statSelect = item.querySelector(".my-info-engraving-stat-select");
        const valueInput = item.querySelector(".my-info-engraving-value-input");
        const statKey = statSelect.value;
        const value = parseFloat(valueInput.value) || 0;

        if (statKey) {
          registrationItems.push({
            statKey: statKey,
            value: value,
          });
        }
      });

      const bindItemsElements = bindContainer.querySelectorAll(
        '.my-info-engraving-item[data-type="bind"]'
      );
      bindItemsElements.forEach((item) => {
        const statKey = item.dataset.statKey;
        if (!statKey) return;

        const valueInput = item.querySelector(".my-info-engraving-value-input");
        const value = parseFloat(valueInput.value) || 0;

        bindStats[statKey] = value;
      });

      const engravingData = {
        registration: registrationItems,
        bind: bindStats,
      };

      if (!pageState.engravingData[category]) {
        pageState.engravingData[category] = {};
      }
      const oldEngravingData = pageState.engravingData[category][spirit.name];
      pageState.engravingData[category][spirit.name] = engravingData;

      pageState.isInitialLoad = false;

      // 캐시 무효화 (각인 변경 시 재계산 필요)
      pageState.lastTotalStatsHash = null;
      pageState.lastTotalStatsCalculation = null;

      // 즉시 업데이트 (각인 저장 후 바로 반영되어야 함)
      if (callbacks?.updateTotalStats) {
        callbacks.updateTotalStats(
          getSpiritsForCategory,
          callbacks.updateStatItemsWithValues
        );
      }
      if (callbacks?.renderBondSlots) {
        callbacks.renderBondSlots(category);
      }

      // 팝업 닫기 (저장 완료 후)
      if (popup && popup.parentNode) {
        popup.remove();
        if (currentPopupOverlay) {
          currentPopupOverlay.remove();
          currentPopupOverlay = null;
        }
        currentPopup = null;
      }
    });
  }

  // 장착효과 탭 저장 버튼
  if (saveBtnBind) {
    saveBtnBind.addEventListener("click", () => {
      const registrationItems = [];
      const bindStats = {};

      // 등록효과 항목 수집
      const registrationItemsElements = registrationContainer.querySelectorAll(
        '.my-info-engraving-item[data-type="registration"]'
      );
      registrationItemsElements.forEach((item) => {
        const statSelect = item.querySelector(".my-info-engraving-stat-select");
        const valueInput = item.querySelector(".my-info-engraving-value-input");
        const statKey = statSelect.value;
        const value = parseFloat(valueInput.value) || 0;

        if (statKey) {
          registrationItems.push({
            statKey: statKey,
            value: value,
          });
        }
      });

      // 장착효과 항목 수집
      const bindItemsElements = bindContainer.querySelectorAll(
        '.my-info-engraving-item[data-type="bind"]'
      );
      bindItemsElements.forEach((item) => {
        const statKey = item.dataset.statKey;
        if (!statKey) return;

        const valueInput = item.querySelector(".my-info-engraving-value-input");
        const value = parseFloat(valueInput.value) || 0;

        bindStats[statKey] = value;
      });

      // 각인 데이터 저장
      const engravingData = {
        registration: registrationItems,
        bind: bindStats,
      };

      if (!pageState.engravingData[category]) {
        pageState.engravingData[category] = {};
      }
      const oldEngravingData = pageState.engravingData[category][spirit.name];
      pageState.engravingData[category][spirit.name] = engravingData;

      pageState.isInitialLoad = false;

      // 캐시 무효화 (각인 변경 시 재계산 필요)
      pageState.lastTotalStatsHash = null;
      pageState.lastTotalStatsCalculation = null;

      // 즉시 업데이트 (각인 저장 후 바로 반영되어야 함)
      if (callbacks?.updateTotalStats) {
        callbacks.updateTotalStats(
          getSpiritsForCategory,
          callbacks.updateStatItemsWithValues
        );
      }
      if (callbacks?.renderBondSlots) {
        callbacks.renderBondSlots(category);
      }

      // 팝업 닫기 (저장 완료 후)
      if (popup && popup.parentNode) {
        popup.remove();
        if (currentPopupOverlay) {
          currentPopupOverlay.remove();
          currentPopupOverlay = null;
        }
        currentPopup = null;
      }
    });
  }
}
