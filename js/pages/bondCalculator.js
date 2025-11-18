import { state as globalState } from "../state.js";
import * as api from "../api.js";
import { createElement } from "../utils.js";
import { showResultModal as showOptimalResultModal } from "../resultModal.js";
import { addResult as addHistory } from "../historyManager.js";
import { renderSpiritGrid } from "../components/spritGrid.js";
import { showLoading, hideLoading, showLoadingWithProgress, updateLoadingProgress } from "../loadingIndicator.js";
import { checkSpiritStats, checkItemForStatEffect } from "../utils.js";
import { createStatFilter } from "../components/statFilter.js";
import ErrorHandler from "../utils/errorHandler.js";
import Logger from "../utils/logger.js";
import {
  INFLUENCE_ROWS,
  isFixedLevelSpirit,
  GRADE_ORDER,
  STATS_MAPPING,
  PERCENT_STATS,
} from "../constants.js";

// 길게 누르기를 위한 상태 변수들
let longPressState = {
  isPressed: false,
  intervalId: null,
  timeoutId: null,
  hintElement: null,
  bridgeElement: null,
  hintHovered: false,
  button: null,
  spiritName: null,
  action: null,
  mouseDownTime: null,
  touchStartTime: null,
  touchMoveHandler: null,
  ignoreMouseUp: false, // mouseup 무시 플래그 추가
};

const pageState = {
  currentCategory: "수호",
  selectedSpirits: new Map(),
  groupByInfluence: false,
  currentStatFilter: "",
};
const elements = {};

const eventListeners = {};

function getHTML() {
  return `
    <div class="sub-tabs" id="bondCategoryTabs">
        <div class="tab active" data-category="수호">수호</div>
        <div class="tab" data-category="탑승">탑승</div>
        <div class="tab" data-category="변신">변신</div>
    </div>

    <div class="view-toggle-container">
        <label class="toggle-switch">
            <input type="checkbox" id="influenceToggle">
            <span class="slider round"></span>
        </label>
        <span class="toggle-label">세력별 보기</span>
        <div class="stat-filter-container"></div>
        <a href="https://open.kakao.com/o/sUSXtUYe" target="_blank" class="kakao-gift-btn">
            <img src="assets/img/gift.png" alt="카카오 선물하기 아이콘"
                style="height: 20px; vertical-align: middle; margin-right: 5px;">
            개발자에게 카톡 선물하기
        </a>
    </div>
    <div class="bond-container">
        <div class="main-content">
            <div class="left-panel">
                <div class="section-header">
                    <h2 class="section-title">전체 환수 목록</h2>
                    <div class="selection-controls">
                        <button id="selectAllBtn" class="btn btn-sm btn-primary">전체선택</button>
                        <button id="clearAllSelectionBtn" class="btn btn-sm btn-danger">전체해제</button>
                    </div>
                </div>
                <div id="spiritListContainer" class="spirit-selection"></div>
            </div>
            <div class="right-panel">
                <div class="selected-spirits-container">
                    <div class="selected-spirits-header">
                        <h3 class="selection-title">선택된 환수 (<span id="selectedCount">0</span>)</h3>
                    </div>
                    <div id="selectedSpiritsList" class="selected-spirits"></div>
                    <div class="header-controls">
                        <div class="level-batch-control">
                            <label>일괄 레벨:</label>
                            <input type="number" id="batchLevelInput" min="0" max="25" value="0">
                            <button id="applyBatchLevelBtn" class="btn btn-sm btn-primary">적용</button>
                        </div>
                        <div class="calculate-btn-small">
                            <button id="findOptimalBtn" class="btn btn-warning">최적 조합 찾기</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

function renderAll() {
  renderSpiritList();
  renderSelectedList();
  saveStateToStorage();
}

function renderSpiritList() {
  let spirits = getSpiritsForCurrentState();
  if (pageState.currentStatFilter) {
    spirits = spirits.filter((spirit) =>
      checkItemForStatEffect(spirit, pageState.currentStatFilter)
    );
  }

  renderSpiritGrid({
    container: elements.spiritListContainer,
    spirits: spirits,
    onSpiritClick: handleSpiritSelect,
    getSpiritState: (spirit) => {
      const { hasFullRegistration, hasFullBind, hasLevel25Bind } =
        checkSpiritStats(spirit);
      return {
        selected: pageState.selectedSpirits.has(spirit.name),
        registrationCompleted: hasFullRegistration,
        bondCompleted: hasFullBind,
        level25BindAvailable: hasLevel25Bind,
      };
    },
    groupByInfluence: pageState.groupByInfluence,
  });
}

function getSpiritsForCurrentState() {
  const extractNumber = (path) =>
    path ? parseInt(path.match(/\d+/)?.[0] || "999", 10) : 999;
  const allCreatures = Array.isArray(globalState.allSpirits)
    ? globalState.allSpirits
    : [];
  const filtered = allCreatures.filter(
    (s) => s.type === pageState.currentCategory
  );
  filtered.sort((a, b) => {
    const gradeOrder = { 전설: 1, 불멸: 2 };
    const orderA = gradeOrder[a.grade] || 99;
    const orderB = gradeOrder[b.grade] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return extractNumber(a.image) - extractNumber(b.image);
  });
  return filtered;
}

function renderSelectedList() {
  const container = elements.selectedSpiritsList;
  container.innerHTML = "";

  const currentCategorySpirits = [...pageState.selectedSpirits.values()].filter(
    (s) => s.type === pageState.currentCategory
  );
  elements.selectedCount.textContent = currentCategorySpirits.length;

  const mobileSelectedCountSpan = document.getElementById(
    "mobileSelectedCount"
  );
  if (mobileSelectedCountSpan) {
    mobileSelectedCountSpan.textContent = currentCategorySpirits.length;
  }

  const mobileSelectedSpiritsContainer = document.getElementById(
    "selectedSpiritsMobile"
  );
  if (mobileSelectedSpiritsContainer) {
    mobileSelectedSpiritsContainer.innerHTML = "";
  }

  if (currentCategorySpirits.length === 0) {
    container.innerHTML =
      "<p class='text-center text-sm text-light mt-lg'>선택된 환수가 없습니다.</p>";
    if (mobileSelectedSpiritsContainer) {
      mobileSelectedSpiritsContainer.innerHTML =
        "<p class='text-center text-sm text-light mt-lg'>선택된 환수가 없습니다.</p>";
    }
    return;
  }

  currentCategorySpirits.forEach((spirit) => {
    const card = createElement("div", "selected-spirit-card");
    card.dataset.spiritName = spirit.name;
    card.innerHTML = `
        <button class="remove-spirit" data-action="remove" title="선택 해제">×</button>
        <div class="selected-spirit-header">
            <img src="${spirit.image}" alt="${spirit.name}">
            <div class="spirit-info">
                <div class="spirit-name">${spirit.name}</div>
            </div>
        </div>
        <div class="spirit-level-control">
            ${
              isFixedLevelSpirit(spirit.name)
                ? `<div class="fixed-level-control">
                <span class="fixed-level-label">25 (고정)</span>
              </div>`
                : `<button class="level-btn minus-btn" data-action="level-down">-</button>
              <input type="number" class="level-input" min="0" max="25" value="${spirit.level}">
              <button class="level-btn plus-btn" data-action="level-up">+</button>`
            }
        </div>
        `;
    container.appendChild(card);

    if (mobileSelectedSpiritsContainer) {
      const mobileCard = createElement("div", "selected-spirit-card");
      mobileCard.dataset.spiritName = spirit.name;
      mobileCard.innerHTML = card.innerHTML;
      mobileSelectedSpiritsContainer.appendChild(mobileCard);
    }
  });
}

function saveStateToStorage() {
  localStorage.setItem(
    "bondCalculatorState",
    JSON.stringify({
      category: pageState.currentCategory,
      spirits: [...pageState.selectedSpirits.values()],
      groupByInfluence: pageState.groupByInfluence,
      currentStatFilter: pageState.currentStatFilter,
    })
  );
}

function loadStateFromStorage() {
  const savedState = localStorage.getItem("bondCalculatorState");
  if (savedState) {
    try {
      const data = JSON.parse(savedState);
      pageState.currentCategory = data.category || "수호";
      pageState.selectedSpirits = new Map(
        (data.spirits || []).map((s) => [s.name, s])
      );
      pageState.groupByInfluence = data.groupByInfluence || false;
      pageState.currentStatFilter = data.currentStatFilter || "";
    } catch (e) {
      Logger.error("Error loading state from storage, resetting:", e);
      pageState.selectedSpirits = new Map();
      pageState.groupByInfluence = false;
      pageState.currentStatFilter = "";
    }
  }
}

function initStatFilter() {
  const filterContainer = elements.container.querySelector(
    ".stat-filter-container"
  );
  const allSpiritsForFilter = Array.isArray(globalState.allSpirits)
    ? globalState.allSpirits
    : [];
  createStatFilter(filterContainer, allSpiritsForFilter, (newStatKey) => {
    pageState.currentStatFilter = newStatKey;
    renderSpiritList();
  });

  const statFilterElement = elements.container.querySelector("#statFilter");
  const clearFilterBtnElement =
    elements.container.querySelector(".clear-filter-btn");

  if (statFilterElement) {
    statFilterElement.value = pageState.currentStatFilter;
  }
  if (clearFilterBtnElement) {
    clearFilterBtnElement.style.display = pageState.currentStatFilter
      ? "inline-flex"
      : "none";
  }
}

function onPanelToggleBtnClick() {
  const panelToggleContainer = document.getElementById("panelToggleContainer");
  const rightPanelInToggle = panelToggleContainer
    ? panelToggleContainer.querySelector(".right-panel")
    : null;
  if (rightPanelInToggle) {
    rightPanelInToggle.classList.toggle("collapsed");
    panelToggleContainer.querySelector(".toggle-icon").textContent =
      rightPanelInToggle.classList.contains("collapsed") ? "▲" : "▼";
  }
}

function onApplyMobileBatchLevelClick() {
  handleBatchLevel("mobileBatchLevel");
}

function onSetMaxMobileBatchLevelClick() {
  setMaxBatchLevel("mobileBatchLevel");
}

function onFindOptimalMobileClick() {
  handleFindOptimal();
}

function setupEventListeners() {
  eventListeners.containerClickHandler = handleContainerClick;
  elements.container.addEventListener(
    "click",
    eventListeners.containerClickHandler
  );

  // 길게 누르기 기능을 위한 mousedown/mouseup 이벤트 리스너
  eventListeners.containerMouseDownHandler = handleContainerMouseDown;
  eventListeners.globalMouseUpHandler = handleGlobalMouseUp;

  // 모바일 터치 이벤트 리스너
  eventListeners.containerTouchStartHandler = handleContainerTouchStart;
  eventListeners.containerTouchEndHandler = handleContainerTouchEnd;
  eventListeners.globalTouchEndHandler = handleGlobalTouchEnd;

  elements.container.addEventListener(
    "mousedown",
    eventListeners.containerMouseDownHandler
  );

  // 모바일 터치 이벤트 추가
  elements.container.addEventListener(
    "touchstart",
    eventListeners.containerTouchStartHandler,
    { passive: false }
  );

  // 컨테이너에서 touchend 감지 (버튼에서 터치를 뗄 때)
  elements.container.addEventListener(
    "touchend",
    eventListeners.containerTouchEndHandler,
    { passive: false }
  );

  // 전역 mouseup 이벤트로 확실하게 감지
  document.addEventListener("mouseup", eventListeners.globalMouseUpHandler);

  // 전역 touchend 이벤트로 모바일 지원 - passive: false 추가
  document.addEventListener("touchend", eventListeners.globalTouchEndHandler, {
    passive: false,
  });

  elements.container.addEventListener("mouseleave", handleContainerMouseLeave);

  eventListeners.bondCategoryTabsClickHandler = (e) => {
    const target = e.target;
    const subTab = target.closest(".tab");
    if (subTab && !subTab.classList.contains("active")) {
      elements.bondCategoryTabs
        .querySelector(".tab.active")
        ?.classList.remove("active");
      subTab.classList.add("active");
      pageState.currentCategory = subTab.dataset.category;
      renderAll();
    }
  };
  elements.bondCategoryTabs.addEventListener(
    "click",
    eventListeners.bondCategoryTabsClickHandler
  );

  eventListeners.influenceToggleChangeHandler = handleToggleChange;
  elements.influenceToggle.addEventListener(
    "change",
    eventListeners.influenceToggleChangeHandler
  );

  eventListeners.selectedSpiritsListInputHandler = handleLevelInputChange;
  elements.selectedSpiritsList.addEventListener(
    "input",
    eventListeners.selectedSpiritsListInputHandler
  );

  eventListeners.selectAllClickHandler = handleSelectAll;
  elements.selectAllBtn.addEventListener(
    "click",
    eventListeners.selectAllClickHandler
  );

  eventListeners.clearAllSelectionClickHandler = handleClearSelection;
  elements.clearAllSelectionBtn.addEventListener(
    "click",
    eventListeners.clearAllSelectionClickHandler
  );

  eventListeners.applyBatchLevelClickHandler = () =>
    handleBatchLevel("batchLevelInput");
  elements.applyBatchLevelBtn.addEventListener(
    "click",
    eventListeners.applyBatchLevelClickHandler
  );

  eventListeners.findOptimalClickHandler = handleFindOptimal;
  elements.findOptimalBtn.addEventListener(
    "click",
    eventListeners.findOptimalClickHandler
  );

  const panelToggleBtn = document.getElementById("panelToggleBtn");
  const mobileSelectedSpiritsList = document.getElementById(
    "selectedSpiritsMobile"
  );
  const applyMobileBatchLevelBtn = document.getElementById(
    "applyMobileBatchLevelBtn"
  );
  const setMaxMobileBatchLevelBtn = document.getElementById(
    "setMaxMobileBatchLevelBtn"
  );
  const findOptimalMobileBtn = document.getElementById("findOptimalMobileBtn");

  if (panelToggleBtn) {
    eventListeners.panelToggleBtnClickHandler = onPanelToggleBtnClick;
    panelToggleBtn.addEventListener(
      "click",
      eventListeners.panelToggleBtnClickHandler
    );
  }
  if (mobileSelectedSpiritsList) {
    eventListeners.mobileSelectedSpiritsListInputHandler =
      handleLevelInputChange;
    mobileSelectedSpiritsList.addEventListener(
      "input",
      eventListeners.mobileSelectedSpiritsListInputHandler
    );

    // 모바일 리스트에도 터치 이벤트 추가
    mobileSelectedSpiritsList.addEventListener(
      "touchstart",
      eventListeners.containerTouchStartHandler,
      { passive: false }
    );
    mobileSelectedSpiritsList.addEventListener(
      "mousedown",
      eventListeners.containerMouseDownHandler
    );
  }
  if (applyMobileBatchLevelBtn) {
    eventListeners.applyMobileBatchLevelClickHandler =
      onApplyMobileBatchLevelClick;
    applyMobileBatchLevelBtn.addEventListener(
      "click",
      eventListeners.applyMobileBatchLevelClickHandler
    );
  }
  if (setMaxMobileBatchLevelBtn) {
    eventListeners.setMaxMobileBatchLevelClickHandler =
      onSetMaxMobileBatchLevelClick;
    setMaxMobileBatchLevelBtn.addEventListener(
      "click",
      eventListeners.setMaxMobileBatchLevelClickHandler
    );
  }
  if (findOptimalMobileBtn) {
    eventListeners.findOptimalMobileClickHandler = onFindOptimalMobileClick;
    findOptimalMobileBtn.addEventListener(
      "click",
      eventListeners.findOptimalMobileClickHandler
    );
  }
}

function handleSpiritSelect(spirit) {
  if (!spirit) return;
  const spiritName = spirit.name;

  if (pageState.selectedSpirits.has(spiritName)) {
    pageState.selectedSpirits.delete(spiritName);
  } else {
    // 고정 레벨 환수는 25레벨로 설정, 나머지는 0레벨
    const initialLevel = isFixedLevelSpirit(spiritName) ? 25 : 0;
    pageState.selectedSpirits.set(spiritName, {
      ...spirit,
      level: initialLevel,
    });
  }
  renderAll();
}

function handleContainerClick(e) {
  const target = e.target;

  // 길게 누르기 상태에서는 클릭 이벤트 무시
  if (longPressState.isPressed) {
    return;
  }

  // 짧은 터치인지 확인 (300ms 이내)
  const touchDuration = longPressState.mouseDownTime
    ? Date.now() - longPressState.mouseDownTime
    : 0;
  const isShortTouch = touchDuration > 0 && touchDuration < 300;

  const card = target.closest(".selected-spirit-card");
  if (card) {
    const spiritName = card.dataset.spiritName;
    const spirit = pageState.selectedSpirits.get(spiritName);
    if (!spirit) {
      Logger.warn("Selected spirit not found in pageState for:", spiritName);
      return;
    }

    const action = target.dataset.action;
    let shouldRender = false;

    switch (action) {
      case "remove":
        pageState.selectedSpirits.delete(spiritName);
        shouldRender = true;
        break;
      case "level-down":
        // 고정 레벨 환수는 변경 불가
        if (isFixedLevelSpirit(spiritName)) break;
        if (spirit.level > 0) {
          spirit.level = Math.max(0, spirit.level - 1);
          shouldRender = true;
        }
        break;
      case "level-up":
        // 고정 레벨 환수는 변경 불가
        if (isFixedLevelSpirit(spiritName)) break;
        if (spirit.level < 25) {
          spirit.level = Math.min(25, spirit.level + 1);
          shouldRender = true;
        }
        break;
    }

    if (shouldRender) {
      saveStateToStorage();
      renderAll();
    }
  }

  // 클릭 처리 후 mouseDownTime 초기화
  longPressState.mouseDownTime = null;
}

function handleContainerMouseDown(e) {
  const target = e.target;
  const card = target.closest(".selected-spirit-card");

  if (!card) return;

  const action = target.dataset.action;
  if (action !== "level-down" && action !== "level-up") return;

  e.preventDefault();
  e.stopPropagation(); // 이벤트 전파 중지

  const spiritName = card.dataset.spiritName;
  const spirit = pageState.selectedSpirits.get(spiritName);
  if (!spirit) return;

  // 이전 상태 정리
  if (longPressState.timeoutId) {
    clearTimeout(longPressState.timeoutId);
  }
  if (longPressState.intervalId) {
    clearInterval(longPressState.intervalId);
  }

  // 길게 누르기 상태 설정
  longPressState.isPressed = false;
  longPressState.button = target;
  longPressState.spiritName = spiritName;
  longPressState.action = action;
  longPressState.hintHovered = false;
  longPressState.mouseDownTime = Date.now(); // 마우스 다운 시간 기록

  // 300ms 후에 길게 누르기 시작
  longPressState.timeoutId = setTimeout(() => {
    if (longPressState.button === target) {
      startLongPress();
    }
  }, 300);
}

// 모바일 터치 이벤트 핸들러
function handleContainerTouchStart(e) {
  const target = e.target;
  const card = target.closest(".selected-spirit-card");

  if (!card) {
    return;
  }

  // 레벨 버튼인지 확인 (클래스와 data-action 모두 확인)
  const isLevelBtn =
    target.classList.contains("level-btn") ||
    target.classList.contains("minus-btn") ||
    target.classList.contains("plus-btn");

  const action = target.dataset.action;

  if (!isLevelBtn || (action !== "level-down" && action !== "level-up")) {
    return;
  }

  // 터치 이벤트를 preventDefault 처리 (클릭 이벤트와 중복 방지)
  e.preventDefault();
  e.stopPropagation();

  // 터치 시작 시간 저장 (짧은 터치 판별용)
  longPressState.touchStartTime = Date.now();

  // 직접 handleContainerMouseDown 호출
  const syntheticEvent = {
    target: e.target,
    preventDefault: () => {},
    stopPropagation: () => {},
  };

  handleContainerMouseDown(syntheticEvent);
}

// 컨테이너에서 터치 종료 처리
function handleContainerTouchEnd(e) {
  // 길게 누르기가 활성화된 상태라면 반드시 중지
  if (longPressState.isPressed) {
    const touch = e.changedTouches[0];

    // 터치 위치로 힌트와의 충돌 감지
    if (longPressState.hintElement) {
      const hintRect = longPressState.hintElement.getBoundingClientRect();
      const isWithinHint =
        touch.clientX >= hintRect.left &&
        touch.clientX <= hintRect.right &&
        touch.clientY >= hintRect.top &&
        touch.clientY <= hintRect.bottom;

      if (isWithinHint) {
        longPressState.hintHovered = true;
        // 힌트에서 터치를 뗐으므로 값 적용
        const targetValue = longPressState.action === "level-down" ? 0 : 25;
        const spirit = pageState.selectedSpirits.get(longPressState.spiritName);
        if (spirit) {
          spirit.level = targetValue;
          saveStateToStorage();
          renderAll();
        }
      }
    }

    stopLongPress();
    e.preventDefault();
    e.stopPropagation();
  }
}

function handleTouchMove(e) {
  if (!longPressState.isPressed) return;

  const touch = e.touches[0];
  const elementUnderTouch = document.elementFromPoint(
    touch.clientX,
    touch.clientY
  );
  const hint = longPressState.hintElement;
  const bridge = longPressState.bridgeElement;

  if (!hint) return;

  // 힌트나 브리지 영역에 있는지 확인
  const isOnHint =
    elementUnderTouch === hint || hint.contains(elementUnderTouch);
  const isOnBridge = elementUnderTouch === bridge;

  if (isOnHint) {
    if (!longPressState.hintHovered) {
      longPressState.hintHovered = true;
      hint.style.transform = "scale(1.2)";
      hint.style.fontSize = "12px";
      hint.style.fontWeight = "900";
      hint.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    }
  } else if (longPressState.hintHovered && !isOnBridge) {
    longPressState.hintHovered = false;
    hint.style.transform = "scale(1)";
    hint.style.fontSize = "10px";
    hint.style.fontWeight = "bold";
    hint.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
  }
}

function handleGlobalTouchEnd(e) {
  // 아무 상태도 없으면 무시
  if (!longPressState.isPressed && !longPressState.timeoutId) {
    return;
  }

  const touch = e.changedTouches[0];

  // 짧은 터치인지 확인 (300ms 이내)
  const touchDuration = longPressState.touchStartTime
    ? Date.now() - longPressState.touchStartTime
    : 0;
  const isShortTouch = touchDuration > 0 && touchDuration < 300;

  // 짧은 터치이고 길게 누르기가 시작되지 않았다면
  if (isShortTouch && !longPressState.isPressed) {
    // timeout 취소
    if (longPressState.timeoutId) {
      clearTimeout(longPressState.timeoutId);
      longPressState.timeoutId = null;
    }

    // 레벨 증감 처리
    const spiritName = longPressState.spiritName;
    const action = longPressState.action;
    const spirit = pageState.selectedSpirits.get(spiritName);

    if (spirit && action) {
      // 고정 레벨 환수는 변경 불가
      if (!isFixedLevelSpirit(spiritName)) {
        let shouldRender = false;

        if (action === "level-down" && spirit.level > 0) {
          spirit.level = Math.max(0, spirit.level - 1);
          shouldRender = true;
        } else if (action === "level-up" && spirit.level < 25) {
          spirit.level = Math.min(25, spirit.level + 1);
          shouldRender = true;
        }

        if (shouldRender) {
          saveStateToStorage();
          renderAll();
        }
      }
    }

    // 상태 초기화
    longPressState.button = null;
    longPressState.spiritName = null;
    longPressState.action = null;
    longPressState.touchStartTime = null;
    return;
  }

  // 길게 누르기가 활성화된 상태라면 반드시 중지
  if (longPressState.isPressed) {
    // 터치 위치로 힌트와의 충돌 감지
    if (longPressState.hintElement) {
      const hintRect = longPressState.hintElement.getBoundingClientRect();
      const isWithinHint =
        touch.clientX >= hintRect.left &&
        touch.clientX <= hintRect.right &&
        touch.clientY >= hintRect.top &&
        touch.clientY <= hintRect.bottom;

      if (isWithinHint) {
        longPressState.hintHovered = true;
        // 힌트에서 터치를 뗐으므로 값 적용
        const targetValue = longPressState.action === "level-down" ? 0 : 25;
        const spirit = pageState.selectedSpirits.get(longPressState.spiritName);
        if (spirit) {
          spirit.level = targetValue;
          saveStateToStorage();
          renderAll();
        }
      }
    }

    // 반드시 stopLongPress 호출 (힌트 여부와 관계없이)
    stopLongPress();

    // 터치 이동 리스너 제거
    if (longPressState.touchMoveHandler) {
      document.removeEventListener(
        "touchmove",
        longPressState.touchMoveHandler
      );
      longPressState.touchMoveHandler = null;
    }

    // touchStartTime 초기화
    longPressState.touchStartTime = null;
    return;
  }

  // 길게 누르기가 시작되지 않았지만 timeout이 있다면
  if (longPressState.timeoutId) {
    // 터치 위치로 가상의 마우스 이벤트 생성
    const fakeEvent = {
      target: document.elementFromPoint(touch.clientX, touch.clientY),
      clientX: touch.clientX,
      clientY: touch.clientY,
      type: "touchend",
    };

    // 터치 종료를 마우스 업으로 처리
    handleGlobalMouseUp(fakeEvent);
  }

  // 터치 이동 리스너 제거
  if (longPressState.touchMoveHandler) {
    document.removeEventListener("touchmove", longPressState.touchMoveHandler);
    longPressState.touchMoveHandler = null;
  }

  // touchStartTime 초기화
  longPressState.touchStartTime = null;
}

function handleGlobalMouseUp(e) {
  // ignoreMouseUp 플래그가 true면 무시
  if (longPressState.ignoreMouseUp) {
    return;
  }

  // 길게 누르기가 시작되지 않았다면 timeout만 취소
  if (longPressState.timeoutId && !longPressState.isPressed) {
    clearTimeout(longPressState.timeoutId);
    longPressState.timeoutId = null;

    // 짧은 터치/클릭이었으므로 일반 클릭 이벤트로 처리되도록 함
    // mouseDownTime은 유지해서 handleContainerClick에서 판단 가능하도록
    longPressState.button = null;
    longPressState.spiritName = null;
    longPressState.action = null;
    return;
  }

  // 길게 누르기가 활성화된 상태라면 중지
  if (longPressState.isPressed) {
    // 터치 이벤트인 경우 힌트와의 충돌 감지
    if (e.type === "touchend" && longPressState.hintElement) {
      const hintRect = longPressState.hintElement.getBoundingClientRect();
      const isWithinHint =
        e.clientX >= hintRect.left &&
        e.clientX <= hintRect.right &&
        e.clientY >= hintRect.top &&
        e.clientY <= hintRect.bottom;

      if (isWithinHint) {
        longPressState.hintHovered = true;
      }
    }

    // 힌트에 마우스가 올려져 있다면 해당 값으로 적용
    if (longPressState.hintHovered) {
      const targetValue = longPressState.action === "level-down" ? 0 : 25;
      const spirit = pageState.selectedSpirits.get(longPressState.spiritName);
      if (spirit) {
        spirit.level = targetValue;
        saveStateToStorage();
        renderAll();
      }
    }
    stopLongPress();
  }
}

function handleContainerMouseLeave(e) {
  // 컨테이너를 벗어날 때 길게 누르기 중지
  // 단, 힌트나 브리지로 이동하는 경우는 제외
  if (longPressState.isPressed) {
    const isMovingToHint =
      e.relatedTarget === longPressState.hintElement ||
      longPressState.hintElement?.contains(e.relatedTarget);
    const isMovingToBridge =
      e.relatedTarget === longPressState.bridgeElement ||
      longPressState.bridgeElement?.contains(e.relatedTarget);

    if (isMovingToHint || isMovingToBridge) {
      return;
    }

    stopLongPress();
  }
}

// 레벨 표시만 업데이트하는 함수 (DOM 재렌더링 방지)
function updateSpiritLevelDisplay(spiritName, newLevel) {
  // 데스크톱 카드 찾기
  const card = elements.selectedSpiritsList.querySelector(
    `[data-spirit-name="${spiritName}"]`
  );

  if (card) {
    const levelInput = card.querySelector(".level-input");

    if (levelInput) {
      // value 속성과 프로퍼티 모두 설정
      levelInput.value = newLevel;
      levelInput.setAttribute("value", newLevel);
      // 강제로 input 이벤트 발생시켜 업데이트 보장
      levelInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }

  // 모바일 카드도 업데이트
  const mobileContainer = document.getElementById("selectedSpiritsMobile");
  if (mobileContainer) {
    const mobileCard = mobileContainer.querySelector(
      `[data-spirit-name="${spiritName}"]`
    );
    if (mobileCard) {
      const levelInput = mobileCard.querySelector(".level-input");
      if (levelInput) {
        levelInput.value = newLevel;
        levelInput.setAttribute("value", newLevel);
        levelInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  }

  // 선택된 환수 카운트는 변경되지 않으므로 업데이트 불필요
}

function startLongPress() {
  if (!longPressState.button) return;

  longPressState.isPressed = true;

  // 힌트 생성 직후 발생하는 mouseup 무시하기 위한 플래그 설정
  longPressState.ignoreMouseUp = true;
  setTimeout(() => {
    longPressState.ignoreMouseUp = false;
  }, 100); // 100ms 동안만 무시

  // 힌트 요소 생성
  try {
    createHint();
  } catch (error) {
    Logger.error("createHint 에러:", error);
  } // 연속 증감 함수
  const performLevelChange = () => {
    if (!longPressState.isPressed) {
      return false;
    }

    const spirit = pageState.selectedSpirits.get(longPressState.spiritName);
    if (!spirit) {
      return false;
    }

    // 고정 레벨 환수는 레벨 변경 불가
    if (isFixedLevelSpirit(longPressState.spiritName)) {
      return false;
    }

    const currentLevel = spirit.level;
    let changed = false;
    if (longPressState.action === "level-down" && spirit.level > 0) {
      spirit.level = Math.max(0, spirit.level - 1);
      changed = true;
    } else if (longPressState.action === "level-up" && spirit.level < 25) {
      spirit.level = Math.min(25, spirit.level + 1);
      changed = true;
    }

    if (changed) {
      //   "✅ performLevelChange: 레벨 변경",
      //   currentLevel,
      //   "→",
      //   spirit.level
      // );
      saveStateToStorage();

      // renderAll() 대신 레벨 표시만 업데이트 (DOM 재렌더링 방지)
      updateSpiritLevelDisplay(longPressState.spiritName, spirit.level);
      return true;
    }
    return false;
  };

  // 첫 번째 변경 즉시 실행
  performLevelChange();

  // 연속 증감 시작
  longPressState.intervalId = setInterval(() => {
    if (!performLevelChange()) {
      stopLongPress();
    }
  }, 200);
}

function stopLongPress() {
  if (longPressState.intervalId) {
    clearInterval(longPressState.intervalId);
    longPressState.intervalId = null;
  }

  if (longPressState.timeoutId) {
    clearTimeout(longPressState.timeoutId);
    longPressState.timeoutId = null;
  }

  removeHint(); // 터치 이동 리스너 정리
  if (longPressState.touchMoveHandler) {
    document.removeEventListener("touchmove", longPressState.touchMoveHandler);
    longPressState.touchMoveHandler = null;
  }

  longPressState.isPressed = false;
  longPressState.hintHovered = false;
  longPressState.bridgeElement = null;
  longPressState.button = null;
  longPressState.spiritName = null;
  longPressState.action = null;
  longPressState.mouseDownTime = null;
  longPressState.touchStartTime = null;
  longPressState.ignoreMouseUp = false;
}
function restartLongPressInterval() {
  if (!longPressState.isPressed) return;

  // 연속 증감 재시작
  longPressState.intervalId = setInterval(() => {
    const spirit = pageState.selectedSpirits.get(longPressState.spiritName);
    if (!spirit) {
      stopLongPress();
      return;
    }

    let changed = false;
    if (longPressState.action === "level-down" && spirit.level > 0) {
      spirit.level = Math.max(0, spirit.level - 1);
      changed = true;
    } else if (longPressState.action === "level-up" && spirit.level < 25) {
      spirit.level = Math.min(25, spirit.level + 1);
      changed = true;
    }

    if (changed) {
      saveStateToStorage();
      renderAll();
    } else {
      stopLongPress(); // 최대/최소에 도달하면 중지
    }
  }, 150); // 150ms마다 증감
}

function createHint() {
  if (!longPressState.button) return;


  const targetValue = longPressState.action === "level-down" ? 0 : 25;
  const hintText = targetValue.toString();

  const hint = document.createElement("div");
  hint.className = "level-hint";
  hint.textContent = hintText;

  // 버튼 바로 옆에 힌트 배치 (마이너스는 왼쪽, 플러스는 오른쪽)
  const buttonRect = longPressState.button.getBoundingClientRect();

  hint.style.position = "fixed";
  hint.style.top = buttonRect.top + "px";
  hint.style.zIndex = "1000";
  hint.style.color = "white";
  hint.style.padding = "0px 4px";
  hint.style.margin = "0";
  hint.style.border = "none";
  hint.style.borderRadius = "3px";
  hint.style.fontSize = "10px";
  hint.style.fontWeight = "bold";
  hint.style.pointerEvents = "none"; // 먼저 none으로 설정하여 버튼 방해 방지
  hint.style.cursor = "pointer";
  hint.style.whiteSpace = "nowrap";
  hint.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
  hint.style.textAlign = "center";
  hint.style.height = buttonRect.height + "px";
  hint.style.lineHeight = buttonRect.height + "px";
  hint.style.width = "32px"; // 텍스트가 잘리지 않도록 증가
  hint.style.display = "flex";
  hint.style.alignItems = "center";
  hint.style.justifyContent = "center";
  hint.style.transition = "all 0.2s ease";

  if (longPressState.action === "level-down") {
    // 마이너스 버튼: 왼쪽에 배치 (버튼과 겹치지 않도록 간격 추가)
    hint.style.left = buttonRect.left - 36 + "px"; // 32px(힌트 너비) + 4px(간격)
    hint.style.backgroundColor = "#f44336"; // 빨간색
  } else {
    // 플러스 버튼: 오른쪽에 배치 (버튼과 겹치지 않도록 간격 추가)
    hint.style.left = buttonRect.right + 4 + "px"; // 4px 간격
    hint.style.backgroundColor = "#4CAF50"; // 초록색
  }

  document.body.appendChild(hint);
  longPressState.hintElement = hint;
  longPressState.hintHovered = false;

  // 버튼과 힌트 사이의 브리지 영역 생성 (마우스가 빠져나가지 않도록)
  const bridge = document.createElement("div");
  bridge.className = "hint-bridge";
  bridge.style.position = "fixed";
  bridge.style.top = buttonRect.top + "px";
  bridge.style.height = buttonRect.height + "px";
  bridge.style.zIndex = "999";
  bridge.style.backgroundColor = "transparent";
  bridge.style.pointerEvents = "none"; // 먼저 none으로 설정하여 버튼 방해 방지

  if (longPressState.action === "level-down") {
    // 마이너스: 버튼 왼쪽부터 힌트까지
    bridge.style.left = buttonRect.left - 36 + "px";
    bridge.style.width = 36 + buttonRect.width + 4 + "px"; // 힌트(36px) + 버튼 + 간격(4px)
  } else {
    // 플러스: 버튼부터 힌트 오른쪽까지
    bridge.style.left = buttonRect.left + "px";
    bridge.style.width = buttonRect.width + 4 + 32 + "px"; // 버튼 + 간격(4px) + 힌트(32px)
  }

  document.body.appendChild(bridge);
  longPressState.bridgeElement = bridge;

  // 힌트와 브리지에 이벤트 리스너 추가
  const handleHintEnter = () => {
    if (longPressState.isPressed) {
      longPressState.hintHovered = true;
      // 시각적 피드백: 크기 증가 및 글씨 키우기
      hint.style.transform = "scale(1.2)";
      hint.style.fontSize = "12px";
      hint.style.fontWeight = "900";
      hint.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    }
  };

  const handleHintLeave = () => {
    if (longPressState.isPressed) {
      longPressState.hintHovered = false;
      // 원래 크기로 복원
      hint.style.transform = "scale(1)";
      hint.style.fontSize = "10px";
      hint.style.fontWeight = "bold";
      hint.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
    }
  };

  // 힌트에서의 mouseup/touchend 이벤트 처리
  const handleHintMouseUp = () => {
    Logger.log("🎯 힌트 클릭/터치 종료", {
      isPressed: longPressState.isPressed,
      hintHovered: longPressState.hintHovered,
    });

    if (longPressState.isPressed) {
      // 힌트에 있었다면 값 적용
      if (longPressState.hintHovered) {
        const targetValue = longPressState.action === "level-down" ? 0 : 25;
        const spirit = pageState.selectedSpirits.get(longPressState.spiritName);
        if (spirit) {
          spirit.level = targetValue;
          saveStateToStorage();
          renderAll();
        }
      }
      // 항상 stopLongPress 호출
      stopLongPress();
    }
  };

  // 마우스 이벤트
  hint.addEventListener("mouseenter", handleHintEnter);
  hint.addEventListener("mouseup", handleHintMouseUp);
  hint.addEventListener("mouseleave", (e) => {
    // 힌트에서 브리지로 이동하는 경우는 제외
    if (!bridge.contains(e.relatedTarget) && e.relatedTarget !== bridge) {
      handleHintLeave();
    }
  });

  // 터치 이벤트 추가 - passive: false로 preventDefault 가능하게
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

  // 터치 이동 감지 시작
  longPressState.touchMoveHandler = handleTouchMove;
  document.addEventListener("touchmove", longPressState.touchMoveHandler);

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

  // 모든 이벤트 리스너 추가 후 pointerEvents 활성화 (버튼 방해 방지)
  // setTimeout을 사용하여 다음 이벤트 루프에서 활성화
  setTimeout(() => {
    if (hint && longPressState.isPressed) {
      hint.style.pointerEvents = "auto";
    }
    if (bridge && longPressState.isPressed) {
      bridge.style.pointerEvents = "auto";
    }
  }, 0);
}

function removeHint() {
  if (longPressState.hintElement) {
    longPressState.hintElement.remove();
    longPressState.hintElement = null;
  }
  if (longPressState.bridgeElement) {
    longPressState.bridgeElement.remove();
    longPressState.bridgeElement = null;
  }
}

function handleToggleChange(e) {
  pageState.groupByInfluence = e.target.checked;
  saveStateToStorage();
  renderSpiritList();
}

function handleLevelInputChange(e) {
  if (e.target.matches(".level-input")) {
    const card = e.target.closest(".selected-spirit-card");
    const spirit = pageState.selectedSpirits.get(card.dataset.spiritName);
    if (spirit) {
      // 고정 레벨 환수는 레벨 변경 불가
      if (isFixedLevelSpirit(card.dataset.spiritName)) {
        e.target.value = 25; // 25로 되돌림
        return;
      }

      let newLevel = parseInt(e.target.value, 10);
      if (isNaN(newLevel) || newLevel < 0) newLevel = 0;
      if (newLevel > 25) newLevel = 25;
      spirit.level = newLevel;
      e.target.value = newLevel;
      saveStateToStorage();
    }
  }
}

function handleClearSelection() {
  const spiritsInCurrentCategory = getSpiritsForCurrentState();
  spiritsInCurrentCategory.forEach((s) => {
    if (pageState.selectedSpirits.has(s.name)) {
      pageState.selectedSpirits.delete(s.name);
    }
  });
  renderAll();
}

function handleSelectAll() {
  const spiritsToSelect = getSpiritsForCurrentState();
  spiritsToSelect.forEach((spirit) => {
    if (!pageState.selectedSpirits.has(spirit.name)) {
      pageState.selectedSpirits.set(spirit.name, { ...spirit, level: 0 });
    }
  });
  renderAll();
}

function handleBatchLevel(inputId) {
  const batchLevelInput = document.getElementById(inputId);
  const batchLevel = parseInt(batchLevelInput.value, 10);
  if (isNaN(batchLevel) || batchLevel < 0 || batchLevel > 25) {
    alert("0에서 25 사이의 레벨을 입력해주세요.");
    return;
  }
  pageState.selectedSpirits.forEach((s) => {
    if (s.type === pageState.currentCategory) s.level = batchLevel;
  });
  renderAll();
}

function setMaxBatchLevel(inputId) {
  const batchLevelInput = document.getElementById(inputId);
  if (batchLevelInput) {
    batchLevelInput.value = 25;
    handleBatchLevel(inputId);
  }
}

async function handleFindOptimal() {
  const creaturesForCalc = [...pageState.selectedSpirits.values()]
    .filter((s) => s.type === pageState.currentCategory)
    .map((c) => ({ name: c.name, level: c.level }));

  if (creaturesForCalc.length === 0) {
    alert("현재 탭에서 선택된 환수가 없습니다.");
    return;
  }

  const appContainer = document.getElementById("app-container");
  
  // 진행률 표시와 함께 로딩 시작
  const numCreatures = creaturesForCalc.length;
  let progressMessage = "";
  if (numCreatures > 6) {
    progressMessage = "최적 조합 탐색 중...";
  } else {
    progressMessage = "조합 계산 중...";
  }
  
  showLoadingWithProgress(
    appContainer,
    "최적 조합 계산 중",
    progressMessage,
    0,
    "초기화 중..."
  );

  // 시뮬레이션 진행률 업데이트 (실제로는 백엔드에서 진행률을 받아야 하지만, 여기서는 시뮬레이션)
  let progress = 0;
  const progressInterval = setInterval(() => {
    if (progress < 90) {
      progress += Math.random() * 10;
      if (numCreatures > 6) {
        updateLoadingProgress(progress, `조합 탐색 중... ${Math.round(progress)}%`);
      } else {
        updateLoadingProgress(progress, `계산 중... ${Math.round(progress)}%`);
      }
    }
  }, 500);

  try {
    const result = await api.calculateOptimalCombination(creaturesForCalc);
    
    clearInterval(progressInterval);
    updateLoadingProgress(100, "완료!");
    
    // 완료 표시를 잠시 보여줌
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (!result || !result.spirits) {
      throw new Error("API에서 유효한 응답을 받지 못했습니다.");
    }

    addHistory(result);
    showOptimalResultModal(result, false);
  } catch (error) {
    clearInterval(progressInterval);
    ErrorHandler.handle(error, "Optimal combination calculation");
    alert(ErrorHandler.getUserFriendlyMessage(error.message));
  } finally {
    hideLoading();
  }
}

export function init(container) {
  cleanup();

  container.innerHTML = getHTML();

  const panelToggleHtml = `
    <button class="panel-toggle-button" id="panelToggleBtn">
        선택된 환수 <span id="mobileSelectedCount">0</span>개 <span class="toggle-icon">▲</span>
    </button>
    <div class="right-panel collapsed">
        <div class="selected-spirits-container">
            <div class="selected-spirits-header">
                <h3>선택된 환수</h3>
                <div class="header-controls">
                    <div class="level-batch-control">
                        <label>일괄 레벨 설정:</label>
                        <input type="number" id="mobileBatchLevel" min="0" max="25" value="0">
                        <button id="applyMobileBatchLevelBtn" class="btn btn-primary apply-level-btn">적용</button>
                        <button id="setMaxMobileBatchLevelBtn" class="btn btn-warning max-level-btn">Max</button>
                    </div>
                    <div class="calculate-btn-small">
                        <button id="findOptimalMobileBtn" class="btn btn-secondary">찾기</button>
                    </div>
                </div>
            </div>
            <div id="selectedSpiritsMobile" class="selected-spirits"></div>
        </div>
    </div>`;

  const panelToggleContainer = createElement("div", "panel-toggle-container", {
    id: "panelToggleContainer",
  });
  panelToggleContainer.innerHTML = panelToggleHtml;
  document.body.appendChild(panelToggleContainer);

  const el = elements;
  el.container = container;
  el.bondCategoryTabs = container.querySelector("#bondCategoryTabs");
  el.spiritListContainer = container.querySelector("#spiritListContainer");
  el.selectedSpiritsList = container.querySelector("#selectedSpiritsList");
  el.selectedCount = container.querySelector("#selectedCount");
  el.selectAllBtn = container.querySelector("#selectAllBtn");
  el.clearAllSelectionBtn = container.querySelector("#clearAllSelectionBtn");
  el.batchLevelInput = container.querySelector("#batchLevelInput");
  el.applyBatchLevelBtn = container.querySelector("#applyBatchLevelBtn");
  el.findOptimalBtn = container.querySelector("#findOptimalBtn");
  el.influenceToggle = container.querySelector("#influenceToggle");

  loadStateFromStorage();

  container.querySelectorAll(".sub-tabs .tab").forEach((tab) => {
    tab.classList.toggle(
      "active",
      tab.dataset.category === pageState.currentCategory
    );
  });
  elements.influenceToggle.checked = pageState.groupByInfluence;

  setupEventListeners();
  initStatFilter();
  renderAll();
}

export function getHelpContentHTML() {
  return `
        <div class="content-block">
            <h2>환수 결속 계산기 사용 안내</h2>
            <p>환수 결속 시스템은 6마리 환수의 조합을 통해 다양한 능력치 시너지를 얻는 핵심 콘텐츠입니다. '바연화연'의 결속 계산기는 여러분이 보유한 환수들로 달성할 수 있는 최적의 조합을 찾아드립니다.</p>
            <p>이 계산기는 <strong>피해저항, 피해저항관통, 대인피해%*10, 대인방어%*10</strong>를 합산한 '환산 점수'를 기준으로 최적의 조합을 찾아내며, 유전 알고리즘을 통해 수많은 경우의 수를 빠르게 탐색합니다.</p>

            <h3>🔎 페이지 기능 설명</h3>
            <ul>
                <li><strong>카테고리 선택:</strong> '수호', '탑승', '변신' 탭을 클릭하여 해당 종류의 환수 목록을 확인하세요. 결속 조합은 동일 카테고리 내에서만 가능합니다.</li>
                <li><strong>환수 선택:</strong> 좌측 '전체 환수 목록'에서 결속 조합에 사용할 환수를 클릭하여 선택하세요. 선택된 환수는 우측 '선택된 환수' 목록에 추가됩니다. (레벨은 0으로 자동 설정됩니다.)</li>
                <li><strong>전체 선택/해제:</strong> '현재 탭 전체 선택' 또는 '현재 탭 전체 해제' 버튼을 사용하여 해당 카테고리의 모든 환수를 한 번에 선택하거나 해제할 수 있습니다.</li>
                <li><strong>환수 레벨 조절:</strong> 우측 선택된 환수 목록에서 각 환수의 레벨을 0~25 사이로 조절할 수 있습니다. '일괄 레벨 적용' 기능으로 모든 환수의 레벨을 한 번에 변경할 수도 있습니다.</li>
                <li><strong>최적 조합 찾기:</strong> '최적 조합 찾기' 버튼을 클릭하면 선택된 환수들 중 가장 높은 환산 점수를 내는 6마리 조합을 찾아 모달 창으로 표시합니다.</li>
                <li><strong>결과 모달 확인:</strong>
                    <ul>
                        <li><strong>조합 합산 점수:</strong> 모달 헤더에 '조합 합산: 1234 (123)' 형식으로 총점수(등록포함)와 결속점수를 함께 표시합니다. 등록 효과가 없을 경우 '조합 합산: 1234' 형식으로 표시됩니다.</li>
                        <li><strong>조합 저장 버튼:</strong> 헤더 우측에 위치한 '조합 저장' 버튼으로 현재 조합을 저장할 수 있습니다.</li>
                        <li><strong>현재 사용 중인 환수 선택:</strong> 결과 모달의 조합 환수 목록에서 현재 게임에서 사용 중인 환수를 클릭하면 등록 효과가 실시간으로 헤더 점수에 반영됩니다.</li>
                        <li><strong>레벨 조절 (장기 누르기):</strong> 각 환수의 +/- 버튼을 짧게 누르면 1레벨씩, 길게 누르면 연속으로 레벨이 변경됩니다. 모바일에서도 터치로 동일하게 작동하며, 조합 합산 점수가 실시간으로 업데이트됩니다.</li>
                        <li><strong>조합 환수:</strong> 선택된 6마리 환수의 목록을 보여주며, 각 환수의 레벨도 표시됩니다.</li>
                        <li><strong>효과별 스탯:</strong> 등급, 세력, 장착 효과로 인해 증가하는 능력치 목록과 합산 점수를 확인할 수 있습니다.</li>
                        <li><strong>상세 스탯 비교:</strong> 선택된 6마리 환수 각각의 상세 장착 스탯과 총합을 비교하여 볼 수 있습니다.</li>
                    </ul>
                </li>
                <li><strong>기록 탭:</strong> 이전에 계산했던 최적 조합 결과들을 기록 탭에서 다시 확인하고 비교할 수 있습니다. '최신', '최고' 점수를 쉽게 파악할 수 있습니다.</li>
            </ul>

            <h3>💡 결속 시스템 팁 & 전략</h3>
            <ul>
                <li><strong>PvE와 PvP 조합:</strong> 보스 사냥을 위한 조합(피해저항관통, 보스몬스터추가피해)과 PvP를 위한 조합(대인방어%, 피해저해)은 스탯 우선순위가 다릅니다. 목표에 맞는 조합을 찾아보세요.</li>
                <li><strong>등급 시너지 vs 세력 시너지:</strong> 전설/불멸 환수 갯수에 따른 등급 시너지와 같은 세력 환수 갯수에 따른 세력 시너지을 모두 고려하는 것이 중요합니다. 때로는 낮은 등급이라도 세력 시너지를 맞추는 것이 더 유리할 수 있습니다.</li>
                <li><strong>실시간 레벨 조정:</strong> 결과 모달에서 각 환수의 레벨을 +/- 버튼으로 조정하면 조합 합산 점수가 실시간으로 변경됩니다. 장기 누르기로 빠르게 레벨을 변경할 수 있으며, 모바일에서도 터치로 동일하게 작동합니다.</li>
                <li><strong>고레벨 환수의 중요성:</strong> 장착 효과는 환수 레벨에 따라 크게 증가하므로, 주요 환수는 25레벨까지 육성하는 것이 중요합니다. 실시간 레벨 조정 기능으로 레벨별 점수 변화를 즉시 확인할 수 있습니다.</li>
                <li><strong>모든 환수 활용:</strong> 단순히 보유 환수 중 강한 환수 6마리를 고르는 것이 아니라, 결속 계산기를 통해 예상치 못한 조합이 더 좋은 결과를 낼 수도 있습니다.</li>
                <li><strong>등록 효과 활용:</strong> 결과 모달에서 현재 사용 중인 환수를 선택하여 등록 효과를 반영하면 실제 게임에서의 총 능력치를 정확히 파악할 수 있습니다. 헤더에 '조합 합산: 총점 (결속점)' 형식으로 표시됩니다.</li>
                <li><strong>빠른 조합 저장:</strong> 헤더 우측의 '조합 저장' 버튼으로 현재 조합을 기록 탭에 저장하여 나중에 비교할 수 있습니다.</li>
            </ul>
        </div>
    `;
}

export function cleanup() {
  if (elements.container) {
    if (
      elements.bondCategoryTabs &&
      eventListeners.bondCategoryTabsClickHandler
    ) {
      elements.bondCategoryTabs.removeEventListener(
        "click",
        eventListeners.bondCategoryTabsClickHandler
      );
    }
    if (elements.container && eventListeners.containerClickHandler) {
      elements.container.removeEventListener(
        "click",
        eventListeners.containerClickHandler
      );
    }
    if (
      elements.influenceToggle &&
      eventListeners.influenceToggleChangeHandler
    ) {
      elements.influenceToggle.removeEventListener(
        "change",
        eventListeners.influenceToggleChangeHandler
      );
    }
    if (
      elements.selectedSpiritsList &&
      eventListeners.selectedSpiritsListInputHandler
    ) {
      elements.selectedSpiritsList.removeEventListener(
        "input",
        eventListeners.selectedSpiritsListInputHandler
      );
    }
    if (elements.selectAllBtn && eventListeners.selectAllClickHandler) {
      elements.selectAllBtn.removeEventListener(
        "click",
        eventListeners.selectAllClickHandler
      );
    }
    if (
      elements.clearAllSelectionBtn &&
      eventListeners.clearAllSelectionClickHandler
    ) {
      elements.clearAllSelectionBtn.removeEventListener(
        "click",
        eventListeners.clearAllSelectionClickHandler
      );
    }
    if (
      elements.applyBatchLevelBtn &&
      eventListeners.applyBatchLevelClickHandler
    ) {
      elements.applyBatchLevelBtn.removeEventListener(
        "click",
        eventListeners.applyBatchLevelClickHandler
      );
    }
    if (elements.findOptimalBtn && eventListeners.findOptimalClickHandler) {
      elements.findOptimalBtn.removeEventListener(
        "click",
        eventListeners.findOptimalClickHandler
      );
    }

    const panelToggleBtn = document.getElementById("panelToggleBtn");
    const mobileSelectedSpiritsList = document.getElementById(
      "selectedSpiritsMobile"
    );
    const applyMobileBatchLevelBtn = document.getElementById(
      "applyMobileBatchLevelBtn"
    );
    const setMaxMobileBatchLevelBtn = document.getElementById(
      "setMaxMobileBatchLevelBtn"
    );
    const findOptimalMobileBtn = document.getElementById(
      "findOptimalMobileBtn"
    );

    if (panelToggleBtn && eventListeners.panelToggleBtnClickHandler) {
      panelToggleBtn.removeEventListener(
        "click",
        eventListeners.panelToggleBtnClickHandler
      );
    }
    if (
      mobileSelectedSpiritsList &&
      eventListeners.mobileSelectedSpiritsListInputHandler
    ) {
      mobileSelectedSpiritsList.removeEventListener(
        "input",
        eventListeners.mobileSelectedSpiritsListInputHandler
      );
    }
    if (
      applyMobileBatchLevelBtn &&
      eventListeners.applyMobileBatchLevelClickHandler
    ) {
      applyMobileBatchLevelBtn.removeEventListener(
        "click",
        eventListeners.applyMobileBatchLevelClickHandler
      );
    }
    if (
      setMaxMobileBatchLevelBtn &&
      eventListeners.setMaxMobileBatchLevelClickHandler
    ) {
      setMaxMobileBatchLevelBtn.removeEventListener(
        "click",
        eventListeners.setMaxMobileBatchLevelClickHandler
      );
    }
    if (findOptimalMobileBtn && eventListeners.findOptimalMobileClickHandler) {
      findOptimalMobileBtn.removeEventListener(
        "click",
        eventListeners.findOptimalMobileClickHandler
      );
    }

    const dynamicallyAddedPanel = document.getElementById(
      "panelToggleContainer"
    );
    if (dynamicallyAddedPanel) {
      dynamicallyAddedPanel.remove();
    }
  }
}
