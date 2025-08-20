import { state as globalState } from "../state.js";
import * as api from "../api.js";
import { createElement } from "../utils.js";
import { showResultModal as showOptimalResultModal } from "../resultModal.js";
import { addResult as addHistory } from "../historyManager.js";
import { renderSpiritGrid } from "../components/spritGrid.js";
import { showLoading, hideLoading } from "../loadingIndicator.js";
import { checkSpiritStats, checkItemForStatEffect } from "../utils.js";
import { createStatFilter } from "../components/statFilter.js";
import { INFLUENCE_ROWS, GRADE_ORDER, STATS_MAPPING } from "../constants.js";

const pageState = {
  currentCategory: "수호",
  selectedSpirits: new Map(),
  groupByInfluence: false,
  currentStatFilter: "",
};
const elements = {};

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
  const filtered = globalState.allSpirits.filter(
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
    const card = createElement("div", "selected-spirit-card", {
      "data-spirit-name": spirit.name,
    });
    card.innerHTML = `
        <button class="remove-spirit" data-action="remove" title="선택 해제">×</button>
        <div class="selected-spirit-header">
            <img src="${spirit.image}" alt="${spirit.name}">
            <div class="spirit-info">
                <div class="spirit-name">${spirit.name}</div>
            </div>
        </div>
        <div class="spirit-level-control">
            <button class="level-btn min-btn" data-action="min-level" title="레벨 0으로 설정">0</button>
            <button class="level-btn minus-btn" data-action="level-down" title="레벨 감소">-</button>
            <input type="number" class="level-input" min="0" max="25" value="${spirit.level}">
            <button class="level-btn plus-btn" data-action="level-up" title="레벨 증가">+</button>
            <button class="level-btn max-btn" data-action="max-level" title="레벨 25로 설정">25</button>
        </div>
        `;
    container.appendChild(card);

    if (mobileSelectedSpiritsContainer) {
      const mobileCard = createElement("div", "selected-spirit-card", {
        "data-spirit-name": spirit.name,
      });
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
      console.error("Error loading state from storage, resetting:", e);
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
  createStatFilter(filterContainer, globalState.allSpirits, (newStatKey) => {
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
  elements.container.addEventListener("click", handleContainerClick);
  elements.influenceToggle.addEventListener("change", handleToggleChange);
  elements.selectedSpiritsList.addEventListener(
    "input",
    handleLevelInputChange
  );
  elements.selectAllBtn.addEventListener("click", handleSelectAll);
  elements.clearAllSelectionBtn.addEventListener("click", handleClearSelection);
  elements.applyBatchLevelBtn.addEventListener("click", () =>
    handleBatchLevel("batchLevelInput")
  );
  elements.findOptimalBtn.addEventListener("click", handleFindOptimal);

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
    panelToggleBtn.addEventListener("click", onPanelToggleBtnClick);
  }
  if (mobileSelectedSpiritsList) {
    mobileSelectedSpiritsList.addEventListener("input", handleLevelInputChange);
  }
  if (applyMobileBatchLevelBtn) {
    applyMobileBatchLevelBtn.addEventListener(
      "click",
      onApplyMobileBatchLevelClick
    );
  }
  if (setMaxMobileBatchLevelBtn) {
    setMaxMobileBatchLevelBtn.addEventListener(
      "click",
      onSetMaxMobileBatchLevelClick
    );
  }
  if (findOptimalMobileBtn) {
    findOptimalMobileBtn.addEventListener("click", onFindOptimalMobileClick);
  }
}

function handleSpiritSelect(spirit) {
  if (!spirit) return;
  const spiritName = spirit.name;

  if (pageState.selectedSpirits.has(spiritName)) {
    pageState.selectedSpirits.delete(spiritName);
  } else {
    pageState.selectedSpirits.set(spiritName, { ...spirit, level: 0 });
  }
  renderAll();
}

function handleContainerClick(e) {
  const target = e.target;
  const subTab = target.closest("#bondCategoryTabs .tab");
  if (subTab && !subTab.classList.contains("active")) {
    elements.bondCategoryTabs
      .querySelector(".tab.active")
      .classList.remove("active");
    subTab.classList.add("active");
    pageState.currentCategory = subTab.dataset.category;
    renderAll();
    return;
  }

  if (target.matches("#applyBatchLevelBtn"))
    handleBatchLevel("batchLevelInput");
  else if (target.matches("#findOptimalBtn")) handleFindOptimal();

  const card = target.closest(".selected-spirit-card");
  if (!card) return;

  const spiritName = card.dataset.spiritName;
  const spirit = pageState.selectedSpirits.get(spiritName);
  if (!spirit) return;

  const action = target.dataset.action;
  let shouldRender = false;

  switch (action) {
    case "remove":
      pageState.selectedSpirits.delete(spiritName);
      shouldRender = true;
      break;
    case "min-level":
      if (spirit.level !== 0) {
        spirit.level = 0;
        shouldRender = true;
      }
      break;
    case "level-down":
      if (spirit.level > 0) {
        spirit.level = Math.max(0, spirit.level - 1);
        shouldRender = true;
      }
      break;
    case "level-up":
      if (spirit.level < 25) {
        spirit.level = Math.min(25, spirit.level + 1);
        shouldRender = true;
      }
      break;
    case "max-level":
      if (spirit.level !== 25) {
        spirit.level = 25;
        shouldRender = true;
      }
      break;
  }

  if (shouldRender) {
    renderAll();
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
  showLoading(
    appContainer,
    "최적 조합 계산 중",
    "유전 알고리즘이 실행 중입니다..."
  );

  try {
    const result = await api.calculateOptimalCombination(creaturesForCalc);
    if (!result || !result.spirits) {
      throw new Error("API에서 유효한 응답을 받지 못했습니다.");
    }
    addHistory(result);
    showOptimalResultModal(result, false);
  } catch (error) {
    // alert(`계산 오류: ${error.message}`);
    alert(`서버 점검중입니다`);

    console.error("Optimal combination calculation failed:", error);
  } finally {
    hideLoading();
  }
}

export function init(container) {
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
  // console.log("환수 결속 페이지 초기화 완료.");
}

export function getHelpContentHTML() {
  return `
        <div class="content-block">
            <h2>환수 결속 계산기 사용 안내</h2>
            <p>환수 결속 시스템은 5마리 환수의 조합을 통해 다양한 능력치 시너지를 얻는 핵심 콘텐츠입니다. '바연화연'의 결속 계산기는 여러분이 보유한 환수들로 달성할 수 있는 최적의 조합을 찾아드립니다.</p>
            <p>이 계산기는 <strong>피해저항, 피해저항관통, 대인피해%*10, 대인방어%*10</strong>를 합산한 '환산 점수'를 기준으로 최적의 조합을 찾아내며, 유전 알고리즘을 통해 수많은 경우의 수를 빠르게 탐색합니다.</p>

            <h3>🔎 페이지 기능 설명</h3>
            <ul>
                <li><strong>카테고리 선택:</strong> '수호', '탑승', '변신' 탭을 클릭하여 해당 종류의 환수 목록을 확인하세요. 결속 조합은 동일 카테고리 내에서만 가능합니다.</li>
                <li><strong>환수 선택:</strong> 좌측 '전체 환수 목록'에서 결속 조합에 사용할 환수를 클릭하여 선택하세요. 선택된 환수는 우측 '선택된 환수' 목록에 추가됩니다. (레벨은 0으로 자동 설정됩니다.)</li>
                <li><strong>전체 선택/해제:</strong> '현재 탭 전체 선택' 또는 '현재 탭 전체 해제' 버튼을 사용하여 해당 카테고리의 모든 환수를 한 번에 선택하거나 해제할 수 있습니다.</li>
                <li><strong>환수 레벨 조절:</strong> 우측 선택된 환수 목록에서 각 환수의 레벨을 0~25 사이로 조절할 수 있습니다. '일괄 레벨 적용' 기능으로 모든 환수의 레벨을 한 번에 변경할 수도 있습니다.</li>
                <li><strong>최적 조합 찾기:</strong> '최적 조합 찾기' 버튼을 클릭하면 선택된 환수들 중 가장 높은 환산 점수를 내는 5마리 조합을 찾아 모달 창으로 표시합니다.</li>
                <li><strong>결과 모달 확인:</strong>
                    <ul>
                        <li><strong>종합 점수:</strong> 등급 효과, 세력 효과, 장착 효과를 모두 합산한 총 환산 점수를 보여줍니다.</li>
                        <li><strong>조합 환수:</strong> 선택된 5마리 환수의 목록을 보여주며, 각 환수의 레벨도 표시됩니다.</li>
                        <li><strong>효과별 스탯:</strong> 등급, 세력, 장착 효과로 인해 증가하는 능력치 목록과 합산 점수를 확인할 수 있습니다.</li>
                        <li><strong>상세 스탯 비교:</strong> 선택된 5마리 환수 각각의 상세 장착 스탯과 총합을 비교하여 볼 수 있습니다.</li>
                    </ul>
                </li>
                <li><strong>기록 탭:</strong> 이전에 계산했던 최적 조합 결과들을 기록 탭에서 다시 확인하고 비교할 수 있습니다. '최신', '최고' 점수를 쉽게 파악할 수 있습니다.</li>
            </ul>

            <h3>💡 결속 시스템 팁 & 전략</h3>
            <ul>
                <li><strong>PvE와 PvP 조합:</strong> 보스 사냥을 위한 조합(피해저항관통, 보스몬스터추가피해)과 PvP를 위한 조합(대인방어%, 피해저해)은 스탯 우선순위가 다릅니다. 목표에 맞는 조합을 찾아보세요.</li>
                <li><strong>등급 시너지 vs 세력 시너지:</strong> 전설/불멸 환수 갯수에 따른 등급 시너지와 같은 세력 환수 갯수에 따른 세력 시너지을 모두 고려하는 것이 중요합니다. 때로는 낮은 등급이라도 세력 시너지를 맞추는 것이 더 유리할 수 있습니다.</li>
                <li><strong>고레벨 환수의 중요성:</strong> 장착 효과는 환수 레벨에 따라 크게 증가하므로, 주요 환수는 25레벨까지 육성하는 것이 중요합니다.</li>
                <li><strong>모든 환수 활용:</strong> 단순히 보유 환수 중 강한 환수 5마리를 고르는 것이 아니라, 결속 계산기를 통해 예상치 못한 조합이 더 좋은 결과를 낼 수도 있습니다.</li>
            </ul>
        </div>
    `;
}

export function cleanup() {
  if (elements.container) {
    elements.container.removeEventListener("click", handleContainerClick);
  }
  if (elements.influenceToggle) {
    elements.influenceToggle.removeEventListener("change", handleToggleChange);
  }
  if (elements.selectedSpiritsList) {
    elements.selectedSpiritsList.removeEventListener(
      "input",
      handleLevelInputChange
    );
  }

  if (elements.selectAllBtn) {
    elements.selectAllBtn.removeEventListener("click", handleSelectAll);
  }
  if (elements.clearAllSelectionBtn) {
    elements.clearAllSelectionBtn.removeEventListener(
      "click",
      handleClearSelection
    );
  }

  elements.applyBatchLevelBtn.removeEventListener("click", () =>
    handleBatchLevel("batchLevelInput")
  );
  elements.findOptimalBtn.removeEventListener("click", handleFindOptimal);

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
    panelToggleBtn.removeEventListener("click", onPanelToggleBtnClick);
  }
  if (mobileSelectedSpiritsList) {
    mobileSelectedSpiritsList.removeEventListener(
      "input",
      handleLevelInputChange
    );
  }
  if (applyMobileBatchLevelBtn) {
    applyMobileBatchLevelBtn.removeEventListener(
      "click",
      onApplyMobileBatchLevelClick
    );
  }
  if (setMaxMobileBatchLevelBtn) {
    setMaxMobileBatchLevelBtn.removeEventListener(
      "click",
      onSetMaxMobileBatchLevelClick
    );
  }
  if (findOptimalMobileBtn) {
    findOptimalMobileBtn.removeEventListener("click", onFindOptimalMobileClick);
  }

  const dynamicallyAddedPanel = document.getElementById("panelToggleContainer");
  if (dynamicallyAddedPanel) {
    dynamicallyAddedPanel.remove();
  }

  // console.log("환수 결속 페이지 정리 완료.");
}
