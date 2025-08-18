// js/pages/chakCalculator.js

import { createElement } from "../utils.js";
import { showLoading, hideLoading } from "../loadingIndicator.js";
import * as api from "../api.js";
import { showChakResultsModal } from "../components/chakResultsModal.js";

const pageState = {
  chakData: null, // 서버에서 불러온 착 데이터 (equipment, costs, constants)
  selectedPart: null, // 현재 선택된 장비 부위 (예: "투구_0")
  selectedLevel: null, // 현재 선택된 강화 레벨 (예: "+1")
  userResources: { goldButton: 10000, colorBall: 10000 }, // 사용자 보유 자원
  statState: {}, // 각 착 스탯의 현재 상태 Map<cardId, {level, value, isUnlocked, isFirst, ...}>
  allAvailableStats: [], // 모든 착 스탯 이름 목록 (검색 필터링용)
  selectedStats: [], // 검색 또는 프리셋으로 선택된 스탯 목록 (검색 결과 모달 표시용)
};
const elements = {}; // DOM 요소 참조를 저장할 객체

/**
 * 페이지의 기본 HTML 구조를 반환합니다.
 */
function getHTML() {
  return `
    <div class="layout-container chak-container">
      <div class="equipment-section">
        <div class="panel equipment-panel">
          <h3>장비 부위</h3>
          <div id="equipment-selector" class="button-grid"></div>
        </div>
      </div>
      <div class="level-info-section">
        <div class="panel level-panel">
          <h3>강화 레벨</h3>
          <div id="level-selector" class="level-buttons"></div>
        </div>
        <div class="panel enhancement-panel">
          <h3>능력치 정보</h3>
          <div id="stats-display" class="stats-grid"></div>
        </div>
      </div>
      <div class="panel summary-panel">
        <div class="tool-section">
            <div class="preset-section">
                <button id="boss-preset-btn" class="btn btn-secondary boss-btn">보스용 조합</button>
                <button id="pvp-preset-btn" class="btn btn-primary pvp-btn">피빕용 조합</button>
            </div>
            <div class="search-section">
                <div class="search-input-container">
                    <input id="search-input" placeholder="능력치 검색..." class="search-input">
                    <button id="search-button" class="search-btn">검색</button>
                </div>
                <div class="dropdown-container">
                    <div id="stat-options" class="stat-options"></div>
                </div>
                <div class="selected-stats" id="selected-stats"></div>
            </div>
        </div>
        <h3>능력치 합계 및 자원 현황</h3>
        <div class="resources-section">
          <label class="resource-label">보유 수량</label>
          <div class="resource-inputs">
            <div class="resource-input">
              <img src="assets/img/gold-button.jpg" alt="황금단추" class="resource-icon-img">
              <input type="number" id="gold-button" value="10000" min="0">
            </div>
            <div class="resource-input">
              <img src="assets/img/fivecolored-beads.jpg" alt="오색구슬" class="resource-icon-img">
              <input type="number" id="color-ball" value="10000" min="0">
            </div>
          </div>
          <div class="resource-status">
            <div id="resource-summary"></div>
          </div>
        </div>
        <div id="summary-display" class="summary-box">
          <p>능력치가 개방되면 여기에 합계가 표시됩니다.</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * 페이지를 초기화하고 필요한 데이터를 로드하며 이벤트 리스너를 설정합니다.
 * @param {HTMLElement} container - 페이지 내용이 렌더링될 DOM 요소
 */
export async function init(container) {
  container.innerHTML = getHTML();

  elements.container = container;
  elements.equipmentSelector = container.querySelector("#equipment-selector");
  elements.levelSelector = container.querySelector("#level-selector");
  elements.statsDisplay = container.querySelector("#stats-display");
  elements.summaryDisplay = container.querySelector("#summary-display");
  elements.goldButton = container.querySelector("#gold-button");
  elements.colorBall = container.querySelector("#color-ball");
  elements.bossPresetBtn = container.querySelector("#boss-preset-btn");
  elements.pvpPresetBtn = container.querySelector("#pvp-preset-btn");
  elements.searchInput = container.querySelector("#search-input");
  elements.searchButton = container.querySelector("#search-button");
  elements.statOptions = container.querySelector("#stat-options");
  elements.selectedStats = container.querySelector("#selected-stats");
  elements.resourceSummary = container.querySelector("#resource-summary");

  showLoading(
    container,
    "착 데이터 로딩 중...",
    "서버에서 착 정보를 불러오고 있습니다..."
  );

  try {
    pageState.chakData = await api.fetchChakData();
    collectAllStatNames();
    populateStatOptions();
    renderSelectors();
    renderStatCards();
    renderSummary();

    elements.equipmentSelector.addEventListener("click", handleSelectorClick);
    elements.levelSelector.addEventListener("click", handleSelectorClick);
    elements.statsDisplay.addEventListener("click", handleStatAction);
    elements.goldButton.addEventListener("input", handleResourceChange);
    elements.colorBall.addEventListener("input", handleResourceChange);
    elements.bossPresetBtn.addEventListener("click", () =>
      optimizeStats("boss")
    );
    elements.pvpPresetBtn.addEventListener("click", () => optimizeStats("pvp"));
    setupSearchEventListeners();

    console.log("착 계산 페이지 초기화 완료.");
  } catch (error) {
    console.error("Chak page init error:", error);
    container.innerHTML = `<p class="error-message">착 데이터를 불러오는 데 실패했습니다: ${error.message}</p>`;
  } finally {
    hideLoading();
  }
}

/**
 * 페이지 정리 함수.
 */
export function cleanup() {
  if (elements.equipmentSelector)
    elements.equipmentSelector.removeEventListener(
      "click",
      handleSelectorClick
    );
  if (elements.levelSelector)
    elements.levelSelector.removeEventListener("click", handleSelectorClick);
  if (elements.statsDisplay)
    elements.statsDisplay.removeEventListener("click", handleStatAction);
  if (elements.goldButton)
    elements.goldButton.removeEventListener("input", handleResourceChange);
  if (elements.colorBall)
    elements.colorBall.removeEventListener("input", handleResourceChange);
  if (elements.bossPresetBtn)
    elements.bossPresetBtn.removeEventListener("click", () =>
      optimizeStats("boss")
    );
  if (elements.pvpPresetBtn)
    elements.pvpPresetBtn.removeEventListener("click", () =>
      optimizeStats("pvp")
    );
  if (elements.searchInput)
    elements.searchInput.removeEventListener("click", (e) =>
      e.stopPropagation()
    );
  if (elements.searchInput)
    elements.searchInput.removeEventListener("input", () =>
      filterStatOptions(elements.searchInput.value)
    );
  if (elements.searchButton)
    elements.searchButton.removeEventListener("click", searchStats);
  document.removeEventListener("click", () => {
    elements.statOptions.style.display = "none";
  });

  console.log("착 계산 페이지 정리 완료.");
}

/**
 * 장비 부위 및 강화 레벨 선택 버튼을 렌더링합니다.
 */
function renderSelectors() {
  const { parts, levels } = pageState.chakData.constants;

  pageState.selectedPart = `${parts[0]}_0`;
  pageState.selectedLevel = levels[0];

  elements.equipmentSelector.innerHTML = "";
  elements.levelSelector.innerHTML = "";

  parts.forEach((part, index) => {
    const uniquePartId = `${part}_${index}`;
    const btn = createElement("button", "selector-btn equip-btn", {
      text: part,
      "data-part-id": uniquePartId,
    });
    elements.equipmentSelector.appendChild(btn);
  });

  levels.forEach((level) => {
    const btn = createElement("button", "selector-btn level-btn", {
      "data-level": level,
    });
    btn.innerHTML = `
            <div class="level-text">${level}</div>
            <div class="level-progress-container">
                <div class="level-status"></div>
                <div class="level-progress-bar empty" style="width: 0%;"></div>
            </div>
            <div class="progress-dots">
                ${[...Array(4)]
                  .map(() => `<span class="progress-dot gray"></span>`)
                  .join("")}
            </div>
        `;
    elements.levelSelector.appendChild(btn);
  });

  updateActiveSelectors();
}

/**
 * 현재 선택된 장비 부위 및 강화 레벨에 해당하는 능력치 카드들을 렌더링합니다.
 */
function renderStatCards() {
  if (!pageState.selectedPart || !pageState.selectedLevel) return;

  const dataKeyPart = pageState.selectedPart.split("_")[0];
  const levelKey = `lv${pageState.selectedLevel.replace("+", "")}`;
  const stats = pageState.chakData.equipment[dataKeyPart]?.[levelKey] || {};

  elements.statsDisplay.innerHTML = "";
  let statIndex = 0;
  Object.entries(stats).forEach(([statName, maxValue]) => {
    const cardId = `${statName}_${pageState.selectedPart}_${pageState.selectedLevel}_${statIndex}`;
    const state = pageState.statState[cardId] || {
      level: 0,
      value: 0,
      isUnlocked: false,
      isFirst: false,
      part: pageState.selectedPart,
      partLevel: pageState.selectedLevel,
      statName: statName,
      maxValue: maxValue,
    };

    const card = createStatCard(statName, maxValue, state, cardId, statIndex);
    elements.statsDisplay.appendChild(card);
    statIndex++;
  });
  updateAllButtonStates();
  updateLevelButtonIndicators();
}

/**
 * 하나의 능력치 카드를 생성합니다.
 */
function createStatCard(statName, maxValue, state, cardId, statIndex) {
  const displayStatName = statName.replace(/\d+$/, "");
  const card = createElement("div", "stat-card", {
    "data-card-id": cardId,
    "data-stat-index": statIndex,
    "data-stat-name": statName,
  });
  card.innerHTML = `
        <div class="card-header">
            <h3>${displayStatName}</h3>
            <button class="redistribute-btn" title="초기화">↻</button>
        </div>
        <p class="value-display">${state.value} / ${maxValue}</p>
        <div class="progress-container">
            <div class="progress-dots"></div>
            <p class="progress-display">강화 단계: ${state.level}/3</p>
        </div>
        <button class="action-btn"></button>
    `;
  updateStatCardUI(card, state, maxValue);
  return card;
}

/**
 * 능력치 카드의 UI (값, 진행도 점, 버튼)를 업데이트합니다.
 */
function updateStatCardUI(card, state, maxValue) {
  card.querySelector(
    ".value-display"
  ).textContent = `${state.value} / ${maxValue}`;
  card.querySelector(
    ".progress-display"
  ).textContent = `강화 단계: ${state.level}/3`;

  const dotsContainer = card.querySelector(".progress-dots");
  dotsContainer.innerHTML = [...Array(3)]
    .map((_, i) => {
      let dotClass = "gray";
      if (state.isUnlocked) {
        dotClass = i < state.level ? "blue" : "yellow";
      }
      return `<span class="progress-dot ${dotClass}"></span>`;
    })
    .join("");

  updateButtonState(card, state);
}

/**
 * 모든 스탯 카드의 버튼 상태를 업데이트합니다.
 * '첫 번째 개방' 규칙에 따라 버튼 텍스트와 비용이 달라집니다.
 */
function updateAllButtonStates() {
  const hasFirstUnlocked = Object.values(pageState.statState).some(
    (s) =>
      s.part === pageState.selectedPart &&
      s.partLevel === pageState.selectedLevel &&
      s.isFirst
  );

  elements.statsDisplay.querySelectorAll(".stat-card").forEach((card) => {
    const cardId = card.dataset.cardId;
    const state = pageState.statState[cardId] || {
      level: 0,
      isUnlocked: false,
      isFirst: false,
    };
    updateButtonState(card, state, hasFirstUnlocked);
  });
}

/**
 * 특정 스탯 카드의 버튼 상태를 업데이트합니다.
 */
function updateButtonState(card, state, hasFirstUnlockedOverride = null) {
  const button = card.querySelector(".action-btn");
  if (!button) return;

  button.disabled = false;

  const hasFirstUnlocked =
    hasFirstUnlockedOverride ??
    Object.values(pageState.statState).some(
      (s) =>
        s.part === pageState.selectedPart &&
        s.partLevel === pageState.selectedLevel &&
        s.isFirst
    );

  if (state.isUnlocked) {
    if (state.level >= 3) {
      button.innerHTML = `<span>완료</span>`;
      button.disabled = true;
    } else {
      const costKey = state.isFirst
        ? "upgradeFirst"
        : `upgradeOther${state.level}`;
      const cost = pageState.chakData.costs[costKey];
      button.innerHTML = `<img src="assets/img/fivecolored-beads.jpg" class="btn-icon"> <span>강화 ${cost}</span>`;
    }
  } else {
    const costKey = hasFirstUnlocked ? "unlockOther" : "unlockFirst";
    const cost = pageState.chakData.costs[costKey];
    const icon = hasFirstUnlocked ? "gold-button.jpg" : "fivecolored-beads.jpg";
    button.innerHTML = `<img src="assets/img/${icon}" class="btn-icon"> <span>선택 ${cost}</span>`;
  }
}

/**
 * 선택된 장비 부위 및 레벨 선택기 버튼의 활성화 상태를 업데이트합니다.
 */
function updateActiveSelectors() {
  elements.equipmentSelector
    .querySelectorAll(".selector-btn")
    .forEach((btn) => {
      const isActive = btn.dataset.partId === pageState.selectedPart;
      btn.classList.toggle("active", isActive);
      btn.classList.toggle("bg-sky-500", isActive);
    });
  elements.levelSelector.querySelectorAll(".selector-btn").forEach((btn) => {
    const isActive = btn.dataset.level === pageState.selectedLevel;
    btn.classList.toggle("active", isActive);
    btn.classList.toggle("bg-emerald-500", isActive);
  });
}

/**
 * 레벨 선택기 버튼 하단의 진행도 인디케이터를 업데이트합니다.
 */
function updateLevelButtonIndicators() {
  elements.levelSelector.querySelectorAll(".level-btn").forEach((btn) => {
    const level = btn.dataset.level;
    const dataKeyPart = pageState.selectedPart.split("_")[0];
    const levelKey = `lv${level.replace("+", "")}`;
    const statsForLevel =
      pageState.chakData.equipment[dataKeyPart]?.[levelKey] || {};

    const dotsContainer = btn.querySelector(".progress-dots");
    if (!dotsContainer) return;
    dotsContainer.innerHTML = "";

    const statEntries = Object.entries(statsForLevel);
    const maxDots = Math.min(4, statEntries.length);

    for (let i = 0; i < maxDots; i++) {
      const [statName] = statEntries[i];
      const cardId = `${statName}_${pageState.selectedPart}_${level}_${i}`;
      const state = pageState.statState[cardId] || {
        isUnlocked: false,
        level: 0,
      };
      const dot = createElement("span", "progress-dot");
      if (state.isUnlocked) {
        dot.classList.add(state.level === 3 ? "blue" : "yellow");
      } else {
        dot.classList.add("gray");
      }
      dotsContainer.appendChild(dot);
    }
    updateLevelProgressBar(btn, Object.values(statsForLevel).length);
  });
}

/**
 * 레벨 선택기 버튼의 진행도 바와 상태 텍스트를 업데이트합니다.
 */
function updateLevelProgressBar(btn, totalStats) {
  const level = btn.dataset.level;
  const progressBar = btn.querySelector(".level-progress-bar");
  const statusText = btn.querySelector(".level-status");

  if (!progressBar || !statusText || totalStats === 0) {
    if (progressBar) progressBar.style.width = `0%`;
    if (statusText) statusText.textContent = "";
    return;
  }

  let totalPoints = 0;
  let unlockedCount = 0;

  Object.values(pageState.statState).forEach((state) => {
    if (
      state.part === pageState.selectedPart &&
      state.partLevel === level &&
      state.isUnlocked
    ) {
      totalPoints += state.level;
      unlockedCount++;
    }
  });

  const totalMaxPoints = totalStats * 3;
  const percent =
    totalMaxPoints > 0 ? Math.round((totalPoints / totalMaxPoints) * 100) : 0;

  progressBar.style.width = `${percent}%`;
  progressBar.className = "level-progress-bar";
  if (percent === 0) progressBar.classList.add("empty");
  else if (percent < 100) progressBar.classList.add("partial");
  else progressBar.classList.add("complete");

  statusText.textContent =
    unlockedCount > 0 ? `${unlockedCount}/${totalStats} (${percent}%)` : "";
}

/**
 * 능력치 합계와 자원 현황을 계산하고 렌더링합니다.
 */
async function renderSummary() {
  showLoading(elements.summaryDisplay, "합계 계산 중...");

  try {
    const result = await api.calculateChak({
      statState: pageState.statState,
      userResources: pageState.userResources,
    });
    const { summary, resources } = result;

    let statHtml =
      Object.keys(summary).length > 0
        ? `<div class="summary-section"><div class="stat-list">${Object.entries(
            summary
          )
            .sort((a, b) => b[1] - a[1])
            .map(
              ([stat, value]) =>
                `<div class="stat-item"><span class="stat-name">${stat}</span><span class="stat-value">+${value}</span></div>`
            )
            .join("")}</div></div>`
        : "<p>능력치가 개방되지 않았습니다.</p>";

    elements.summaryDisplay.innerHTML = statHtml;

    elements.resourceSummary.innerHTML = `
            <div class="resource-summary-item">
                <img src="assets/img/gold-button.jpg" class="resource-icon-img-small">
                <span class="resource-details">
                    <span class="${
                      resources.goldButton.remaining < 0
                        ? "resource-negative"
                        : ""
                    }">${resources.goldButton.remaining.toLocaleString()}</span> 보유 / <span>${resources.goldButton.consumed.toLocaleString()}</span> 소모
                </span>
            </div>
            <div class="resource-summary-item">
                <img src="assets/img/fivecolored-beads.jpg" class="resource-icon-img-small">
                <span class="resource-details">
                    <span class="${
                      resources.colorBall.remaining < 0
                        ? "resource-negative"
                        : ""
                    }">${resources.colorBall.remaining.toLocaleString()}</span> 보유 / <span>${resources.colorBall.consumed.toLocaleString()}</span> 소모
                </span>
            </div>
        `;
  } catch (error) {
    alert(`합계 계산 오류: ${error.message}`);
    console.error("Chak summary calculation failed:", error);
    elements.summaryDisplay.innerHTML = `<p class="error-message">계산 중 오류가 발생했습니다.</p>`;
  } finally {
    hideLoading();
  }
}

/**
 * 장비 부위 또는 강화 레벨 선택 버튼 클릭 이벤트를 처리합니다.
 */
function handleSelectorClick(e) {
  const btn = e.target.closest(".selector-btn");
  if (!btn) return;

  if (btn.classList.contains("equip-btn")) {
    pageState.selectedPart = btn.dataset.partId;
  } else if (btn.classList.contains("level-btn")) {
    pageState.selectedLevel = btn.dataset.level;
  }
  updateActiveSelectors();
  renderStatCards();
}

/**
 * 스탯 카드 내의 액션 (개방/강화, 초기화) 클릭 이벤트를 처리합니다.
 */
function handleStatAction(e) {
  const card = e.target.closest(".stat-card");
  if (!card) return;

  const cardId = card.dataset.cardId;
  const statName = card.dataset.statName;
  if (!statName) return;

  const dataKeyPart = pageState.selectedPart.split("_")[0];
  const levelKey = `lv${pageState.selectedLevel.replace("+", "")}`;
  const maxValue = (pageState.chakData.equipment[dataKeyPart]?.[levelKey] ||
    {})[statName];
  if (maxValue === undefined) {
    console.error(`Max value not found for ${statName}`);
    return;
  }

  let state = JSON.parse(
    JSON.stringify(
      pageState.statState[cardId] || {
        level: 0,
        value: 0,
        isUnlocked: false,
        isFirst: false,
        part: pageState.selectedPart,
        partLevel: pageState.selectedLevel,
        statName: statName,
        maxValue: maxValue,
      }
    )
  );

  if (e.target.closest(".action-btn")) {
    if (state.level >= 3) return;

    if (!state.isUnlocked) {
      const hasFirst = Object.values(pageState.statState).some(
        (s) =>
          s.part === pageState.selectedPart &&
          s.partLevel === pageState.selectedLevel &&
          s.isFirst
      );
      state.isFirst = !hasFirst;
      state.isUnlocked = true;
      state.level = 0;
    } else {
      state.level++;
    }
  } else if (e.target.closest(".redistribute-btn")) {
    delete pageState.statState[cardId];
    renderStatCards();
    renderSummary();
    return;
  } else {
    return;
  }

  state.value = calculateStatValue(
    state.maxValue,
    state.level,
    state.isUnlocked,
    state.isFirst
  );

  pageState.statState[cardId] = state;

  updateStatCardUI(card, state, maxValue);
  updateAllButtonStates();
  updateLevelButtonIndicators();
  renderSummary();
}

/**
 * 스탯의 현재 레벨에 따른 값을 계산합니다. (프론트엔드 로직 일치)
 */
function calculateStatValue(maxValue, level, isUnlocked, isFirst) {
  if (!isUnlocked) return 0;

  if (isFirst) {
    return Math.floor((maxValue / 3) * level);
  } else {
    if (level === 0) return 0;
    else if (level === 1)
      return Math.floor(maxValue / 15) + Math.floor(maxValue / 3);
    else return Math.floor(maxValue / 15) + Math.floor(maxValue / 3) * level;
  }
}

/**
 * 사용자 보유 자원 입력 변경 이벤트를 처리하고 합계를 재렌더링합니다.
 */
function handleResourceChange() {
  pageState.userResources = {
    goldButton: parseInt(elements.goldButton.value, 10) || 0,
    colorBall: parseInt(elements.colorBall.value, 10) || 0,
  };
  renderSummary();
}

/**
 * 모든 고유 스탯 이름을 수집하여 검색 필터링에 사용합니다.
 */
function collectAllStatNames() {
  const stats = new Set();
  for (const part in pageState.chakData.equipment) {
    for (const level in pageState.chakData.equipment[part]) {
      for (const statName in pageState.chakData.equipment[part][level]) {
        stats.add(statName.replace(/\d+$/, ""));
      }
    }
  }
  pageState.allAvailableStats = Array.from(stats).sort();
}

/**
 * 스탯 검색 드롭다운 옵션을 채웁니다.
 */
function populateStatOptions() {
  elements.statOptions.innerHTML = "";
  pageState.allAvailableStats.forEach((stat) => {
    const option = createElement("div", "stat-option", { text: stat });
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleStatSelection(stat);
    });
    elements.statOptions.appendChild(option);
  });
}

/**
 * 스탯 검색 관련 이벤트 리스너를 설정합니다.
 */
function setupSearchEventListeners() {
  elements.searchInput.addEventListener("click", (e) => {
    e.stopPropagation();
    elements.statOptions.style.display = "block";
    filterStatOptions(elements.searchInput.value);
  });
  elements.searchInput.addEventListener("input", () =>
    filterStatOptions(elements.searchInput.value)
  );
  elements.searchButton.addEventListener("click", searchStats);
  document.addEventListener("click", () => {
    elements.statOptions.style.display = "none";
  });
}

/**
 * 스탯 검색 옵션을 필터링합니다.
 */
function filterStatOptions(filterText) {
  const options = elements.statOptions.querySelectorAll(".stat-option");
  filterText = filterText.toLowerCase();
  options.forEach((option) => {
    option.style.display = option.textContent.toLowerCase().includes(filterText)
      ? "flex"
      : "none";
  });
}

/**
 * 스탯 선택 칩을 추가/제거합니다.
 */
function toggleStatSelection(stat) {
  const index = pageState.selectedStats.indexOf(stat);
  if (index === -1) {
    pageState.selectedStats.push(stat);
  } else {
    pageState.selectedStats.splice(index, 1);
  }
  updateSelectedStatsDisplay();
  elements.statOptions.style.display = "none";
  elements.searchInput.value = "";
  filterStatOptions("");
}

/**
 * 선택된 스탯 칩 목록을 렌더링합니다.
 */
function updateSelectedStatsDisplay() {
  elements.selectedStats.innerHTML = "";
  pageState.selectedStats.forEach((stat) => {
    const chip = createElement("div", "stat-chip", {
      html: `${stat} <span class="remove-stat">×</span>`,
    });
    chip
      .querySelector(".remove-stat")
      .addEventListener("click", () => toggleStatSelection(stat));
    elements.selectedStats.appendChild(chip);
  });
}

/**
 * 프리셋 (보스용, PvP용)에 따라 스탯 조합을 최적화하고 결과를 모달로 표시합니다.
 * @param {string} type - "boss" 또는 "pvp"
 */
function optimizeStats(type) {
  const BOSS_STATS = [
    "피해저항관통",
    "보스몬스터추가피해",
    "치명위력%",
    "파괴력증가",
    "파괴력증가%",
    "경험치획득증가",
    "전리품획득증가",
  ];
  const PVP_STATS = [
    "피해저항관통",
    "피해저항",
    "대인방어",
    "대인피해",
    "대인피해%",
    "대인방어%",
    "체력증가",
    "체력증가%",
    "마력증가",
    "마력증가%",
    "치명저항",
    "치명피해저항",
    "상태이상적중",
    "상태이상저항",
  ];

  const targetStats = type === "boss" ? BOSS_STATS : PVP_STATS;
  const title = type === "boss" ? "보스용 추천 조합" : "PvP용 추천 조합";

  showChakResultsModal(
    pageState.chakData,
    pageState.statState,
    title,
    targetStats,
    (partId, levelKey) => {
      pageState.selectedPart = partId;
      pageState.selectedLevel = levelKey;
      updateActiveSelectors();
      renderStatCards();
    }
  );
}

/**
 * 선택된 스탯(searchStats)에 해당하는 착 정보를 검색하고 결과를 모달로 표시합니다.
 */
function searchStats() {
  if (pageState.selectedStats.length === 0) {
    alert("검색할 능력치를 선택해주세요.");
    return;
  }
  showChakResultsModal(
    pageState.chakData,
    pageState.statState,
    "검색 결과",
    pageState.selectedStats,
    (partId, levelKey) => {
      pageState.selectedPart = partId;
      pageState.selectedLevel = levelKey;
      updateActiveSelectors();
      renderStatCards();
    }
  );
}

/**
 * 이 페이지에 대한 도움말 콘텐츠 HTML을 반환합니다.
 * main.js에서 호출하여 도움말 툴팁에 주입됩니다.
 */
export function getHelpContentHTML() {
  return `
        <div class="content-block">
            <h2>착(장비 강화) 시스템 및 계산기 사용 안내</h2>
            <p>바람의나라: 연의 '착' 시스템은 장비 부위별로 추가 능력치를 개방하고 강화하여 캐릭터를 세밀하게 육성할 수 있는 핵심 콘텐츠입니다. '바연화연'의 착 계산기는 각 부위의 스탯 정보를 확인하고, 원하는 스탯을 가진 부위를 찾아 효과적으로 강화 계획을 세울 수 있도록 돕습니다.</p>

            <h3>🔎 페이지 기능 설명</h3>
            <ul>
                <li><strong>장비 부위 선택:</strong> 좌측 '장비 부위' 섹션에서 강화하려는 부위(투구, 갑옷 등)를 선택하세요.</li>
                <li><strong>강화 레벨 선택:</strong> 선택한 장비 부위의 '강화 레벨'을 선택하세요. 각 레벨별로 개방할 수 있는 능력치가 다릅니다. 레벨별 진행도(개방된 스탯 수)도 확인할 수 있습니다.</li>
                <li><strong>능력치 정보:</strong> 선택된 부위와 레벨에서 개방 가능한 능력치 목록이 표시됩니다.
                    <ul>
                        <li><strong>개방/강화:</strong> 각 스탯 카드 하단의 버튼을 클릭하여 능력치를 개방하거나 강화할 수 있습니다. 첫 번째 능력치 개방은 오색구슬, 이후 능력치 개방은 황금단추가 필요합니다. 강화에는 모두 오색구슬이 소모됩니다.</li>
                        <li><strong>초기화(↻):</strong> 개방된 능력치를 초기화하여 다른 능력치로 재개방할 수 있습니다.</li>
                    </ul>
                </li>
                <li><strong>보유 자원 입력:</strong> '황금 단추'와 '오색 구슬'의 보유 수량을 입력하여 현재 자원으로 개방/강화 가능한 능력치를 파악하고, 총 소모량을 추적할 수 있습니다.</li>
                <li><strong>능력치 합계 및 자원 현황:</strong> 개방된 모든 착 능력치의 총합과, 누적된 황금 단추/오색 구슬 소모량을 실시간으로 보여줍니다.</li>
                <li><strong>프리셋 조합 (보스용, PvP용):</strong> '보스용 조합', 'PvP용 조합' 버튼을 클릭하면 해당 목적에 맞는 추천 스탯들을 가진 착 부위/레벨 목록을 모달 창으로 보여줍니다.</li>
                <li><strong>능력치 검색:</strong> '능력치 검색' 입력창에 원하는 스탯을 입력하거나 선택하여 해당 스탯이 부여되는 모든 착 부위/레벨 목록을 모달 창으로 확인할 수 있습니다.</li>
                <li><strong>모달 내 링크 이동:</strong> 프리셋 또는 검색 결과 모달에서 특정 스탯 위치(예: 투구+1의 피해저항관통)를 클릭하면, 해당 착 부위와 레벨 뷰로 자동으로 이동하여 편리하게 강화 계획을 세울 수 있습니다.</li>
            </ul>

            <h3>💡 착 시스템 팁 & 전략</h3>
            <ul>
                <li><strong>첫 번째 착 개방의 중요성:</strong> 각 착 부위/레벨에서 첫 번째로 개방하는 능력치는 다른 능력치와 비용 및 증가량이 다릅니다. 일반적으로 첫 번째는 오색구슬로, 이후는 황금단추로 개방됩니다.</li>
                <li><strong>비용 효율성:</strong> 착 시스템은 많은 자원을 소모하므로, 필요한 스탯을 파악하고 계획적으로 개방/강화하는 것이 중요합니다. 계산기를 활용하여 자원 소모량을 미리 예측하세요.</li>
                <li><strong>상황별 착 세팅:</strong> 보스 사냥, 일반 사냥, PvP 등 상황에 따라 중요하게 작용하는 착 능력치가 다릅니다. 여러 조합을 시뮬레이션하여 최적의 세팅을 찾아보세요.</li>
            </ul>
        </div>
    `;
}
