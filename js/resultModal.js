import { createElement, ensureNumber } from "./utils.js";
import {
  getHistoryForCategory,
  addResult as addHistory,
  removeResult as removeHistory,
} from "./historyManager.js";
import { state as globalState } from "./state.js";
import {
  FACTION_ICONS,
  STATS_MAPPING,
  PERCENT_STATS,
  isFixedLevelSpirit,
} from "./constants.js";
import { addSupportMessageToModal } from "./utils/supportMessage.js";
import Logger from "./utils/logger.js";

let activeModal = null;
let currentlyUsedSpirit = null;
let currentResult = null;
let modifiedSpirits = [];

// Long press state for modal spirit level controls
let modalLongPressState = {
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
};

const SPECIAL_STAT_CLASSES = {
  damageResistance: "stat-damage-resistance",
  damageResistancePenetration: "stat-damage-resistance-penetration",
  pvpDefensePercent: "stat-pvp-defense-percent",
  pvpDamagePercent: "stat-pvp-damage-percent",
};

const SCORE_CONTRIBUTING_STATS = [
  "damageResistance",
  "damageResistancePenetration",
  "pvpDamagePercent",
  "pvpDefensePercent",
];

function calculateRegistrationBonus(spiritName) {
  return calculateRegistrationBonusAtLevel(spiritName, 25);
}

function calculateRegistrationBonusAtLevel(spiritName, level) {
  if (!spiritName) {
    return {
      spiritName: null,
      stats: [],
      totalScore: 0,
    };
  }

  const spiritData = globalState.allSpirits.find((s) => s.name === spiritName);
  if (!spiritData) {
    return {
      spiritName: spiritName,
      stats: [],
      totalScore: 0,
    };
  }

  const levelStats = spiritData.stats.find((s) => s.level === level);
  const registrationStats = levelStats?.registrationStat || {};

  let totalScore = 0;
  const statDetails = [];

  Object.entries(registrationStats).forEach(([key, value]) => {
    const numericValue = ensureNumber(value);
    const displayName = STATS_MAPPING[key] || key;

    if (key === "damageResistance" || key === "damageResistancePenetration") {
      totalScore += numericValue;
    } else if (key === "pvpDamagePercent" || key === "pvpDefensePercent") {
      totalScore += numericValue * 10;
    }

    if (numericValue > 0) {
      statDetails.push({
        key: key,
        name: displayName,
        value: numericValue,
        isScoreContributing: SCORE_CONTRIBUTING_STATS.includes(key),
      });
    }
  });

  return {
    spiritName: spiritName,
    stats: statDetails,
    totalScore: Math.round(totalScore),
  };
}

function recalculateBindScore(spirits) {
  let totalBindScore = 0;
  const allBindStats = {};

  spirits.forEach((spirit) => {
    const fullSpiritData = globalState.allSpirits.find(
      (s) => s.name === spirit.name && s.type === spirit.type
    );

    if (fullSpiritData) {
      const levelStats = fullSpiritData.stats.find(
        (s) => s.level === spirit.stats[0].level
      );
      if (levelStats?.bindStat) {
        Object.entries(levelStats.bindStat).forEach(([key, value]) => {
          const numericValue = ensureNumber(value);
          allBindStats[key] = (allBindStats[key] || 0) + numericValue;

          if (
            key === "damageResistance" ||
            key === "damageResistancePenetration"
          ) {
            totalBindScore += numericValue;
          } else if (
            key === "pvpDamagePercent" ||
            key === "pvpDefensePercent"
          ) {
            totalBindScore += numericValue * 10;
          }
        });
      }
    }
  });

  return {
    bindScore: totalBindScore,
    bindStats: Object.entries(allBindStats)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        key: key,
        name: STATS_MAPPING[key] || key,
        value: value,
      })),
  };
}

function renderEffects(elementId, title, effects, score, counts = {}) {
  const container = document.getElementById(elementId);
  if (!container) return;

  let setInfoHtml = "";
  if (counts.gradeCounts) {
    setInfoHtml = Object.entries(counts.gradeCounts)
      .filter(([, count]) => count >= 2)
      .map(
        ([grade, count]) =>
          `<span class="grade-tag grade-tag-${
            grade === "전설" ? "legend" : "immortal"
          }">${grade}x${count}</span>`
      )
      .join(" ");
  } else if (counts.factionCounts) {
    setInfoHtml = Object.entries(counts.factionCounts)
      .filter(([, count]) => count >= 2)
      .map(([faction, count]) => {
        const iconPath = FACTION_ICONS[faction] || "";
        return `<span class="faction-tag" title="${faction}"><img src="${iconPath}" class="faction-icon" alt="${faction}" loading="lazy">x${count}</span>`;
      })
      .join(" ");
  }

  const validEffects = Array.isArray(effects) ? effects : [];

  // 환산합산에 계산되는 스탯들 (맨 위에 표시)
  const scoreContributingStats = [
    "damageResistance",
    "damageResistancePenetration",
    "pvpDamagePercent",
    "pvpDefensePercent",
  ];

  // 스탯을 정렬: 환산합산 스탯 먼저, 나머지는 알파벳 순
  const sortedEffects = [...validEffects].sort((a, b) => {
    const aIsPriority = scoreContributingStats.includes(a.key);
    const bIsPriority = scoreContributingStats.includes(b.key);

    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;
    if (aIsPriority && bIsPriority) {
      // 둘 다 우선순위 스탯이면 정의된 순서대로
      return (
        scoreContributingStats.indexOf(a.key) -
        scoreContributingStats.indexOf(b.key)
      );
    }
    // 둘 다 일반 스탯이면 알파벳 순
    return (a.name || a.key).localeCompare(b.name || b.key);
  });

  let effectsListHtml = '<p class="no-effects">효과 없음</p>';
  if (sortedEffects.length > 0) {
    effectsListHtml = `<ul class="effects-list">${sortedEffects
      .map((stat) => {
        const isPercent = PERCENT_STATS.includes(stat.key);
        const numericValue = Math.round(ensureNumber(stat.value));
        const displayValue = isPercent
          ? `${numericValue}%`
          : numericValue.toLocaleString();

        const highlightClass = SPECIAL_STAT_CLASSES[stat.key] || "";

        return `<li class="${highlightClass}"><span class="stat-name">${stat.name}</span><span class="stat-value">${displayValue}</span></li>`;
      })
      .join("")}</ul>`;
  }

  container.innerHTML = `
        <h4>${title} <span class="section-score">${Math.round(
    ensureNumber(score)
  )}</span></h4>
        ${setInfoHtml ? `<div class="set-info">${setInfoHtml}</div>` : ""}
        <div class="effects-content">${effectsListHtml}</div>
    `;
}

function createBaseModal() {
  removeAllModals();
  const modal = createElement("div", "modal-overlay", { id: "optimalModal" });
  const content = createElement("div", "modal-content", {
    id: "optimalModalContent",
  });
  const closeButton = createElement("button", "modal-close", {
    id: "closeOptimalModal",
    text: "✕",
  });

  content.appendChild(closeButton);
  modal.appendChild(content);
  document.body.appendChild(modal);

  closeButton.onclick = removeAllModals;
  modal.addEventListener("click", (e) => {
    if (e.target === modal) removeAllModals();
  });

  const escListener = (e) => {
    if (e.key === "Escape") removeAllModals();
  };
  document.addEventListener("keydown", escListener);
  modal._escListener = escListener;

  activeModal = modal;
  return { modal, content };
}

function renderRegistrationEffectInResults() {
  const registrationContainer = document.getElementById(
    "registrationEffectSection"
  );
  if (!registrationContainer) return;

  if (!currentlyUsedSpirit) {
    registrationContainer.style.display = "none";
    return;
  }

  // modifiedSpirits에서 현재 사용 중인 스피릿의 레벨을 찾아서 사용
  const modifiedSpirit = modifiedSpirits.find(
    (s) => s.name === currentlyUsedSpirit
  );
  const currentLevel = modifiedSpirit ? modifiedSpirit.stats[0].level : 25;

  const registrationBonus = calculateRegistrationBonusAtLevel(
    currentlyUsedSpirit,
    currentLevel
  );

  if (registrationBonus.stats.length === 0) {
    registrationContainer.innerHTML = `
      <h4>등록 효과 <span class="section-score">0</span></h4>
      <div class="set-info">
        <span class="registration-spirit-tag">사용중: ${currentlyUsedSpirit}</span>
      </div>
      <div class="effects-content">
        <p class="no-effects">등록 효과가 없습니다</p>
      </div>
    `;
    registrationContainer.style.display = "block";
    return;
  }

  const visibleStats = registrationBonus.stats;

  const visibleStatsHtml = `<ul class="effects-list">${visibleStats
    .map((stat) => {
      const isPercent = PERCENT_STATS.includes(stat.key);
      const numericValue = Math.round(ensureNumber(stat.value));
      const displayValue = isPercent
        ? `${numericValue}%`
        : numericValue.toLocaleString();

      // SPECIAL_STAT_CLASSES를 사용하여 다른 섹션과 동일한 스타일 적용
      const highlightClass = SPECIAL_STAT_CLASSES[stat.key] || "";

      return `<li class="${highlightClass}"><span class="stat-name">${stat.name}</span><span class="stat-value">${displayValue}</span></li>`;
    })
    .join("")}</ul>`;

  registrationContainer.innerHTML = `
    <h4>등록 효과 <span class="section-score">${registrationBonus.totalScore}</span></h4>
    <div class="set-info">
      <span class="registration-spirit-tag">사용중: ${currentlyUsedSpirit}</span>
    </div>
    <div class="effects-content">
      ${visibleStatsHtml}
    </div>
  `;

  registrationContainer.style.display = "block";
}

function toggleMoreStats() {
  const hiddenStats = document.getElementById("hiddenRegistrationStats");
  const moreButton = document.querySelector(".more-stats-button");

  if (hiddenStats && moreButton) {
    if (hiddenStats.style.display === "none") {
      hiddenStats.style.display = "block";
      const hiddenCount = hiddenStats.querySelectorAll("li").length;
      moreButton.textContent = `${hiddenCount}개 숨기기`;
    } else {
      hiddenStats.style.display = "none";
      const hiddenCount = hiddenStats.querySelectorAll("li").length;
      moreButton.textContent = `+${hiddenCount}개 더 보기`;
    }
  }
}

function updateAllScoresAndDisplay() {
  if (!currentResult) return;

  modifiedSpirits.forEach((s, i) => {
  });

  const recalculatedBind = recalculateBindScore(modifiedSpirits);
  const gradeScore = ensureNumber(currentResult.gradeScore);
  const factionScore = ensureNumber(currentResult.factionScore);

  const bondCombinedScore = Math.round(
    gradeScore + factionScore + recalculatedBind.bindScore
  );

  // modifiedSpirits에서 현재 사용 중인 스피릿의 레벨을 찾아서 사용
  const modifiedSpirit = modifiedSpirits.find(
    (s) => s.name === currentlyUsedSpirit
  );
  const currentLevel = modifiedSpirit ? modifiedSpirit.stats[0].level : 25;

  const registrationBonus = calculateRegistrationBonusAtLevel(
    currentlyUsedSpirit,
    currentLevel
  );
  const registrationScore = registrationBonus.totalScore;
  const totalCombinedScore = bondCombinedScore + registrationScore;

  const scoreDisplayHtml =
    registrationScore > 0
      ? `<span class="score-value">${totalCombinedScore.toLocaleString()} (${bondCombinedScore.toLocaleString()})</span>`
      : `<span class="score-value">${bondCombinedScore.toLocaleString()}</span>`;

  // 새로운 헤더 형식으로 업데이트
  let combinedScoreText;
  let formulaText;

  if (registrationScore > 0) {
    combinedScoreText = `조합 합산: ${totalCombinedScore.toLocaleString()} (${bondCombinedScore.toLocaleString()})`;
    formulaText = `합산 = 등록 효과 + 결속 합산 (등급 효과 + 세력 효과 + 결속 효과)<br>피해저항관통 + 피해저항 + (대인피해% × 10) + (대인방어% × 10)`;
  } else {
    combinedScoreText = `조합 합산: ${bondCombinedScore.toLocaleString()}`;
    formulaText = `합산 = 결속 합산 (등급 효과 + 세력 효과 + 결속 효과)<br>피해저항관통 + 피해저항 + (대인피해% × 10) + (대인방어% × 10)`;
  }

  const headerElement = document.getElementById("optimalHeader");
  if (headerElement) {
    const titleElement = headerElement.querySelector(".modal-main-title");
    if (titleElement) {
      titleElement.innerHTML = `
        ${combinedScoreText}
        <span class="score-formula">${formulaText}</span>
      `;
    }
  }

  renderEffects(
    "optimalBindEffects",
    "결속 효과",
    recalculatedBind.bindStats,
    recalculatedBind.bindScore
  );
  renderRegistrationEffectInResults();
  renderSpiritDetailsTable(
    modifiedSpirits,
    currentResult.gradeEffects || [],
    currentResult.factionEffects || []
  );

  window.toggleMoreStats = toggleMoreStats;
}

function saveCombination() {
  if (!currentResult || !modifiedSpirits || modifiedSpirits.length === 0) {
    alert("저장할 조합 데이터가 없습니다.");
    return;
  }

  const recalculatedBind = recalculateBindScore(modifiedSpirits);
  const gradeScore = ensureNumber(currentResult.gradeScore);
  const factionScore = ensureNumber(currentResult.factionScore);

  // modifiedSpirits에서 현재 사용 중인 스피릿의 레벨을 찾아서 사용
  const modifiedSpirit = modifiedSpirits.find(
    (s) => s.name === currentlyUsedSpirit
  );
  const currentLevel = modifiedSpirit ? modifiedSpirit.stats[0].level : 25;

  const registrationBonus = calculateRegistrationBonusAtLevel(
    currentlyUsedSpirit,
    currentLevel
  );
  const registrationScore = registrationBonus.totalScore;
  const totalScoreWithRegistration = Math.round(
    gradeScore + factionScore + recalculatedBind.bindScore + registrationScore
  );

  const newResult = {
    ...currentResult,
    spirits: modifiedSpirits.map((spirit) => ({
      ...spirit,
      stats: [{ level: spirit.stats[0].level }],
    })),
    bindScore: recalculatedBind.bindScore,
    bindStats: recalculatedBind.bindStats,
    gradeScore: gradeScore,
    factionScore: factionScore,
    scoreWithBind: Math.round(
      gradeScore + factionScore + recalculatedBind.bindScore
    ),
    registrationScore: registrationScore,
    totalScoreWithRegistration: totalScoreWithRegistration,
    selectedUsedSpirit: currentlyUsedSpirit,
    combination: modifiedSpirits.map((s) => s.name),
    timestamp: new Date().toLocaleString("sv-SE"),
    id: Date.now(),
  };

  addHistory(newResult);

  alert("조합이 기록에 저장되었습니다!");

  setTimeout(() => {
    if (modifiedSpirits[0]?.type) {
      renderHistoryTabs(modifiedSpirits[0].type);
    }
  }, 100);
}

function handleHistoryDelete(category, id, event) {
  event.stopPropagation();

  if (confirm("이 기록을 삭제하시겠습니까?")) {
    const success = removeHistory(category, id);
    if (success) {
      const history = getHistoryForCategory(category);

      if (currentResult && currentResult.id === id) {
        if (history.length > 0) {
          const firstEntry = history[0];
          currentlyUsedSpirit = firstEntry.selectedUsedSpirit || null;
          currentResult = JSON.parse(JSON.stringify(firstEntry));
          modifiedSpirits = JSON.parse(JSON.stringify(firstEntry.spirits));
          updateResultView(firstEntry, false);
        } else {
          currentlyUsedSpirit = null;
          currentResult = null;
          modifiedSpirits = [];

          const headerElement = document.getElementById("optimalHeader");
          if (headerElement) {
            headerElement.innerHTML = `
              <div class="optimal-header-left">
                <h3 class="modal-main-title">조합 합산: 저장된 기록이 없습니다</h3>
              </div>
              <div class="optimal-header-right">
                <button class="header-save-button" onclick="saveCombination()">조합 저장</button>
              </div>
            `;
          }

          const combinationContainer = document.getElementById(
            "combinationResultsContainer"
          );
          if (combinationContainer) {
            combinationContainer.innerHTML =
              '<p class="no-data-message">기록이 없습니다.</p>';
          }
        }
      }

      renderHistoryTabs(category);
    } else {
      alert("기록 삭제에 실패했습니다.");
    }
  }
}

// Modal long press functions
function handleModalContainerMouseDown(e) {
  const target = e.target;

  if (!target.classList.contains("level-btn")) return;

  const action = target.dataset.action;
  if (action !== "level-down" && action !== "level-up") return;

  e.preventDefault();
  e.stopPropagation();

  const spiritName = target.dataset.spirit;
  if (!spiritName) return;

  // 이전 상태 정리
  if (modalLongPressState.timeoutId) {
    clearTimeout(modalLongPressState.timeoutId);
  }
  if (modalLongPressState.intervalId) {
    clearInterval(modalLongPressState.intervalId);
  }

  // 길게 누르기 상태 설정
  modalLongPressState.isPressed = false;
  modalLongPressState.button = target;
  modalLongPressState.spiritName = spiritName;
  modalLongPressState.action = action;
  modalLongPressState.hintHovered = false;
  modalLongPressState.mouseDownTime = Date.now();

  // 300ms 후에 길게 누르기 시작
  modalLongPressState.timeoutId = setTimeout(() => {
    if (modalLongPressState.button === target) {
      startModalLongPress();
    }
  }, 300);
}

// 모바일 터치 이벤트 핸들러 (모달)
function handleModalContainerTouchStart(e) {
  const touch = e.touches[0];
  handleModalContainerMouseDown({
    target: e.target,
    preventDefault: () => e.preventDefault(),
    stopPropagation: () => e.stopPropagation(),
  });
}

function handleModalGlobalTouchEnd(e) {
  const touch = e.changedTouches[0];

  // 터치 위치로 가상의 마우스 이벤트 생성
  const fakeEvent = {
    target: document.elementFromPoint(touch.clientX, touch.clientY),
    clientX: touch.clientX,
    clientY: touch.clientY,
    type: "touchend",
  };


  handleModalGlobalMouseUp(fakeEvent);
}

function startModalLongPress() {
  if (!modalLongPressState.button) return;


  modalLongPressState.isPressed = true;

  // 힌트 요소 생성
  try {
    createModalHint();
  } catch (error) {
    Logger.error("createModalHint 에러:", error);
  }

  // 연속 증감 함수
  const performModalLevelChange = () => {
    if (!modalLongPressState.isPressed) {
      return false;
    }

    const spiritIndex = modifiedSpirits.findIndex(
      (s) => s.name === modalLongPressState.spiritName
    );
    if (spiritIndex === -1) return false;

    // 고정 레벨 환수는 레벨 변경 불가
    if (isFixedLevelSpirit(modalLongPressState.spiritName)) {
      return false;
    }

    const spirit = modifiedSpirits[spiritIndex];
    const currentLevel = spirit.stats[0].level;
    let changed = false;

    if (
      modalLongPressState.action === "level-down" &&
      spirit.stats[0].level > 0
    ) {
      spirit.stats[0].level = Math.max(0, spirit.stats[0].level - 1);
      changed = true;
    } else if (
      modalLongPressState.action === "level-up" &&
      spirit.stats[0].level < 25
    ) {
      spirit.stats[0].level = Math.min(25, spirit.stats[0].level + 1);
      changed = true;
    }

    if (changed) {
      // UI 업데이트
      const levelDisplay = modalLongPressState.button
        .closest(".spirit-info-item-with-level")
        .querySelector(".spirit-info-level");
      if (levelDisplay) {
        levelDisplay.textContent = `Lv.${spirit.stats[0].level}`;
      }

      const levelInput = modalLongPressState.button
        .closest(".spirit-info-item-with-level")
        .querySelector(".level-input");
      if (levelInput) {
        levelInput.value = spirit.stats[0].level;
      }

      updateAllScoresAndDisplay();
      return true;
    }
    return false;
  };

  // 첫 번째 변경 즉시 실행
  performModalLevelChange();

  // 연속 증감 시작
  modalLongPressState.intervalId = setInterval(() => {
    if (!performModalLevelChange()) {
      stopModalLongPress();
    }
  }, 200);
}

function stopModalLongPress() {
  if (modalLongPressState.intervalId) {
    clearInterval(modalLongPressState.intervalId);
    modalLongPressState.intervalId = null;
  }

  if (modalLongPressState.timeoutId) {
    clearTimeout(modalLongPressState.timeoutId);
    modalLongPressState.timeoutId = null;
  }

  removeModalHint();

  modalLongPressState.isPressed = false;
  modalLongPressState.hintHovered = false;
  modalLongPressState.bridgeElement = null;
  modalLongPressState.button = null;
  modalLongPressState.spiritName = null;
  modalLongPressState.action = null;
  modalLongPressState.mouseDownTime = null;
}

function createModalHint() {
  if (!modalLongPressState.button) return;

  const targetValue = modalLongPressState.action === "level-down" ? 0 : 25;
  const hintText = targetValue.toString();

  const hint = document.createElement("div");
  hint.className = "level-hint";
  hint.textContent = hintText;

  // 버튼 바로 옆에 힌트 배치
  const buttonRect = modalLongPressState.button.getBoundingClientRect();

  hint.style.position = "fixed";
  hint.style.top = buttonRect.top + "px";
  hint.style.zIndex = "2100"; // 모달(2000) + 모달 내용(+10) 보다 높은 z-index
  hint.style.color = "white";
  hint.style.padding = "0px 4px";
  hint.style.margin = "0";
  hint.style.border = "none";
  hint.style.borderRadius = "3px";
  hint.style.fontSize = "10px";
  hint.style.fontWeight = "bold";
  hint.style.pointerEvents = "auto";
  hint.style.cursor = "pointer";
  hint.style.whiteSpace = "nowrap";
  hint.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
  hint.style.textAlign = "center";
  hint.style.height = buttonRect.height + "px";
  hint.style.width = "30px"; // 약간 더 넓게
  hint.style.display = "flex";
  hint.style.alignItems = "center";
  hint.style.justifyContent = "center";
  hint.style.transition = "all 0.2s ease";

  if (modalLongPressState.action === "level-down") {
    hint.style.left = buttonRect.left - 30 + "px"; // 힌트 크기(30px)만큼 왼쪽으로
    hint.style.backgroundColor = "#f44336";
  } else {
    hint.style.left = buttonRect.right + "px"; // 버튼 바로 오른쪽
    hint.style.backgroundColor = "#4CAF50";
  }

  // 버튼과 같은 높이로 맞추기
  hint.style.lineHeight = buttonRect.height + "px";

  document.body.appendChild(hint);
  modalLongPressState.hintElement = hint;
  modalLongPressState.hintHovered = false;

  // 브리지 영역 생성
  const bridge = document.createElement("div");
  bridge.className = "hint-bridge";
  bridge.style.position = "fixed";
  bridge.style.top = buttonRect.top + "px";
  bridge.style.height = buttonRect.height + "px";
  bridge.style.zIndex = "2099"; // 힌트보다 약간 낮게
  bridge.style.backgroundColor = "transparent";
  bridge.style.pointerEvents = "auto";

  if (modalLongPressState.action === "level-down") {
    bridge.style.left = buttonRect.left - 35 + "px"; // 힌트 크기에 맞게 조정
    bridge.style.width = 35 + buttonRect.width + "px";
  } else {
    bridge.style.left = buttonRect.left + "px";
    bridge.style.width = buttonRect.width + 35 + "px"; // 힌트 크기에 맞게 조정
  }

  document.body.appendChild(bridge);
  modalLongPressState.bridgeElement = bridge;

  // 이벤트 리스너 추가
  const handleHintEnter = () => {
    if (modalLongPressState.isPressed) {
      modalLongPressState.hintHovered = true;
      hint.style.transform = "scale(1.2)";
      hint.style.fontSize = "12px";
      hint.style.fontWeight = "900";
      hint.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    }
  };

  const handleHintLeave = () => {
    if (modalLongPressState.isPressed) {
      modalLongPressState.hintHovered = false;
      hint.style.transform = "scale(1)";
      hint.style.fontSize = "10px";
      hint.style.fontWeight = "bold";
      hint.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
    }
  };

  const handleHintMouseUp = () => {
    if (modalLongPressState.isPressed && modalLongPressState.hintHovered) {
      const targetValue = modalLongPressState.action === "level-down" ? 0 : 25;
      const spiritIndex = modifiedSpirits.findIndex(
        (s) => s.name === modalLongPressState.spiritName
      );
      if (spiritIndex !== -1) {
        modifiedSpirits[spiritIndex].stats[0].level = targetValue;

        // UI 업데이트
        const levelDisplay = modalLongPressState.button
          .closest(".spirit-info-item-with-level")
          .querySelector(".spirit-info-level");
        if (levelDisplay) {
          levelDisplay.textContent = `Lv.${targetValue}`;
        }

        const levelInput = modalLongPressState.button
          .closest(".spirit-info-item-with-level")
          .querySelector(".level-input");
        if (levelInput) {
          levelInput.value = targetValue;
        }

        updateAllScoresAndDisplay();
      }
      stopModalLongPress();
    }
  };

  hint.addEventListener("mouseenter", handleHintEnter);
  hint.addEventListener("mouseup", handleHintMouseUp);
  hint.addEventListener("mouseleave", handleHintLeave);

  // 터치 이벤트 (모바일 지원)
  hint.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      handleHintEnter();
    },
    { passive: false }
  );

  hint.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      handleHintMouseUp();
    },
    { passive: false }
  );

  // 브리지 터치 이벤트 (모바일 지원)
  bridge.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      handleHintEnter();
    },
    { passive: false }
  );

  bridge.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );
}

function removeModalHint() {
  if (modalLongPressState.hintElement) {
    document.body.removeChild(modalLongPressState.hintElement);
    modalLongPressState.hintElement = null;
  }

  if (modalLongPressState.bridgeElement) {
    document.body.removeChild(modalLongPressState.bridgeElement);
    modalLongPressState.bridgeElement = null;
  }
}

function handleModalGlobalMouseUp(e) {
  // 길게 누르기가 시작되지 않았다면 짧은 클릭으로 처리
  if (modalLongPressState.timeoutId && !modalLongPressState.isPressed) {
    clearTimeout(modalLongPressState.timeoutId);

    // 짧은 클릭 처리
    const spiritIndex = modifiedSpirits.findIndex(
      (s) => s.name === modalLongPressState.spiritName
    );
    if (spiritIndex !== -1) {
      const spirit = modifiedSpirits[spiritIndex];

      const oldLevel = spirit.stats[0].level;
      if (
        modalLongPressState.action === "level-down" &&
        spirit.stats[0].level > 0
      ) {
        spirit.stats[0].level = Math.max(0, spirit.stats[0].level - 1);
      } else if (
        modalLongPressState.action === "level-up" &&
        spirit.stats[0].level < 25
      ) {
        spirit.stats[0].level = Math.min(25, spirit.stats[0].level + 1);
      }

      // UI 업데이트
      const levelDisplay = modalLongPressState.button
        .closest(".spirit-info-item-with-level")
        .querySelector(".spirit-info-level");
      if (levelDisplay) {
        levelDisplay.textContent = `Lv.${spirit.stats[0].level}`;
      }

      const levelInput = modalLongPressState.button
        .closest(".spirit-info-item-with-level")
        .querySelector(".level-input");
      if (levelInput) {
        levelInput.value = spirit.stats[0].level;
      }

      updateAllScoresAndDisplay();
    }

    modalLongPressState.timeoutId = null;
    modalLongPressState.button = null;
    modalLongPressState.spiritName = null;
    modalLongPressState.action = null;
    modalLongPressState.mouseDownTime = null;
    return;
  }

  // 길게 누르기가 활성화된 상태라면 중지
  if (modalLongPressState.isPressed) {
    // 터치 이벤트인 경우 힌트와의 충돌 감지
    if (e.type === "touchend" && modalLongPressState.hintElement) {
      const hintRect = modalLongPressState.hintElement.getBoundingClientRect();
      const isWithinHint =
        e.clientX >= hintRect.left &&
        e.clientX <= hintRect.right &&
        e.clientY >= hintRect.top &&
        e.clientY <= hintRect.bottom;

      if (isWithinHint) {
        modalLongPressState.hintHovered = true;
      }
    }

    // 힌트에 마우스가 올려져 있다면 해당 값으로 적용
    if (modalLongPressState.hintHovered) {
      const targetValue = modalLongPressState.action === "level-down" ? 0 : 25;
      const spiritIndex = modifiedSpirits.findIndex(
        (s) => s.name === modalLongPressState.spiritName
      );
      if (spiritIndex !== -1) {
        modifiedSpirits[spiritIndex].stats[0].level = targetValue;

        // UI 업데이트
        const levelDisplay = modalLongPressState.button
          .closest(".spirit-info-item-with-level")
          .querySelector(".spirit-info-level");
        if (levelDisplay) {
          levelDisplay.textContent = `Lv.${targetValue}`;
        }

        const levelInput = modalLongPressState.button
          .closest(".spirit-info-item-with-level")
          .querySelector(".level-input");
        if (levelInput) {
          levelInput.value = targetValue;
        }

        updateAllScoresAndDisplay();
      }
    }
    stopModalLongPress();
  }
}

function handleSpiritGridClick(e, spirits) {
  const target = e.target;

  if (target.classList.contains("level-btn")) {
    // mousedown으로 처리하므로 여기서는 아무것도 하지 않음
    return;
  }

  if (target.classList.contains("level-input")) {
    const spiritName = target.dataset.spirit;
    let newLevel = parseInt(target.value, 10);

    if (isNaN(newLevel) || newLevel < 0) newLevel = 0;
    if (newLevel > 25) newLevel = 25;

    const spiritIndex = modifiedSpirits.findIndex((s) => s.name === spiritName);
    if (spiritIndex !== -1) {
      modifiedSpirits[spiritIndex].stats[0].level = newLevel;

      const levelDisplay = target
        .closest(".spirit-info-item-with-level")
        .querySelector(".spirit-info-level");
      if (levelDisplay) {
        levelDisplay.textContent = `Lv.${newLevel}`;
      }

      target.value = newLevel;
      updateAllScoresAndDisplay();
    }
    return;
  }

  const spiritItem = target.closest(".spirit-info-item-with-level");
  if (spiritItem && !target.closest(".spirit-level-control")) {
    const spiritName = spiritItem.dataset.spiritName;

    if (currentlyUsedSpirit === spiritName) {
      currentlyUsedSpirit = null;
    } else {
      currentlyUsedSpirit = spiritName;
    }

    document
      .querySelectorAll(".spirit-info-item-with-level")
      .forEach((item) => {
        item.classList.remove("selected-used-spirit");
      });

    if (currentlyUsedSpirit) {
      spiritItem.classList.add("selected-used-spirit");
    }

    updateAllScoresAndDisplay();
  }
}

export function showResultModal(result, isFromRanking = false) {
  if (
    !result ||
    !Array.isArray(result.combination) ||
    result.combination.length === 0
  ) {
    alert("계산 결과 데이터가 올바르지 않습니다.");
    return;
  }

  const { modal, content } = createBaseModal();
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  currentlyUsedSpirit = result.selectedUsedSpirit || null;
  currentResult = JSON.parse(JSON.stringify(result));
  modifiedSpirits = JSON.parse(JSON.stringify(result.spirits));

  renderResultContent(result, content, isFromRanking);
  setTimeout(() => {
    try {
      if (window.adfit && typeof window.adfit.render === "function") {
        const adContainers = document.querySelectorAll(
          "#optimalModalContent .kakao_ad_area"
        );
        adContainers.forEach((adElement) => {
          window.adfit.render(adElement);
        });
      } else {
        Logger.warn(
          "Kakao AdFit script (window.adfit) not yet loaded or not available."
        );
      }
    } catch (error) {
      Logger.error("Kakao AdFit: Error rendering ads in modal:", error);
    }
  }, 100);
}

function renderResultContent(result, container, isFromRanking) {
  const headerDiv = createElement("div", "optimal-header", {
    id: "optimalHeader",
  });
  const combinationContainer = createElement(
    "div",
    "combination-results-container",
    { id: "combinationResultsContainer" }
  );

  const spiritsGridHtml = modifiedSpirits
    .map((spirit) => {
      const isSelected = currentlyUsedSpirit === spirit.name;
      return `
      <div class="spirit-info-item-with-level ${
        isSelected ? "selected-used-spirit" : ""
      }" data-spirit-name="${spirit.name}">
          <div class="spirit-image-container">
              <img src="${spirit.image}" alt="${spirit.name}" loading="lazy">
          </div>
          <div class="spirit-info-details">
              <div class="spirit-info-name">${spirit.name}</div>
              <div class="spirit-info-level">Lv.${spirit.stats[0].level}</div>
          </div>
          ${
            !isFromRanking
              ? isFixedLevelSpirit(spirit.name)
                ? `<div class="spirit-level-control">
                    <div class="fixed-level-control">
                      <span class="fixed-level-label">25 (고정)</span>
                    </div>
                  </div>`
                : `<div class="spirit-level-control">
                    <button class="level-btn minus-btn" data-action="level-down" data-spirit="${spirit.name}">-</button>
                    <input type="number" class="level-input" min="0" max="25" value="${spirit.stats[0].level}" data-spirit="${spirit.name}">
                    <button class="level-btn plus-btn" data-action="level-up" data-spirit="${spirit.name}">+</button>
                  </div>`
              : ""
          }
      </div>`;
    })
    .join("");

  combinationContainer.innerHTML = `<div class="spirits-grid-container">${spiritsGridHtml}</div>`;

  const resultsContainer = createElement("div", "results-container");
  resultsContainer.innerHTML = `
        <div class="results-section" id="registrationEffectSection" style="display: none;"></div>
        <div class="results-section" id="optimalGradeEffects"></div>
        <div class="results-section" id="optimalFactionEffects"></div>
        <div class="results-section" id="optimalBindEffects"></div>
    `;
  const detailsContainer = createElement("div", "spirit-details-container", {
    id: "optimalSpiritsDetails",
  });

  const kakaoAdResultModalDesktop = createElement(
    "div",
    "kakao-ad-modal-container desktop-modal-ad",
    {}
  );

  kakaoAdResultModalDesktop.innerHTML = `
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-avif2d68afxV6xpn"
          data-ad-width="728"
          data-ad-height="90"></ins>
  `;
  container.appendChild(kakaoAdResultModalDesktop);

  const kakaoAdResultModalMobile = createElement(
    "div",
    "kakao-ad-modal-container mobile-modal-ad",
    {}
  );

  kakaoAdResultModalMobile.innerHTML = `
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-wnVEYOHZjycPISXg"
          data-ad-width="320"
          data-ad-height="50"></ins>
  `;
  container.appendChild(kakaoAdResultModalMobile);
  container.append(headerDiv);
  if (!isFromRanking) {
    const historyContainer = createElement("div", "history-tabs-container", {
      id: "historyContainer",
    });
    container.appendChild(historyContainer);
  }

  container.append(combinationContainer, resultsContainer, detailsContainer);

  // 지원 메시지를 모달 상단에 추가
  addSupportMessageToModal(container);

  setTimeout(() => {
    updateResultView(result, isFromRanking);

    if (!isFromRanking) {
      if (
        result.spirits &&
        result.spirits.length > 0 &&
        result.spirits[0].type
      ) {
        renderHistoryTabs(result.spirits[0].type);
      }
    }
  }, 10);
}

function updateResultView(result, isFromRanking) {
  const { gradeScore, factionScore, gradeEffects, factionEffects } = result;

  // 결속 효과를 다시 계산 (대인방어% 등의 10배 계산 적용)
  const recalculatedBind = recalculateBindScore(modifiedSpirits);
  const bindScore = recalculatedBind.bindScore;
  const bindStats = recalculatedBind.bindStats;

  const registrationScore = result.registrationScore || 0;
  const totalScore =
    result.totalScoreWithRegistration ||
    Math.round(
      ensureNumber(gradeScore) +
        ensureNumber(factionScore) +
        ensureNumber(bindScore)
    );

  const scoreDisplayHtml =
    registrationScore > 0
      ? `<span class="score-value">${totalScore.toLocaleString()} (${(
          totalScore - registrationScore
        ).toLocaleString()})</span>`
      : `<span class="score-value">${totalScore.toLocaleString()}</span>`;

  let combinedScoreText;
  let formulaText;

  if (registrationScore > 0) {
    combinedScoreText = `조합 합산: ${totalScore.toLocaleString()} (${(
      totalScore - registrationScore
    ).toLocaleString()})`;
    formulaText = `합산 = 등록 효과 + 결속 합산 (등급 효과 + 세력 효과 + 결속 효과)<br>피해저항관통 + 피해저항 + (대인피해% × 10) + (대인방어% × 10)`;
  } else {
    combinedScoreText = `조합 합산: ${totalScore.toLocaleString()}`;
    formulaText = `합산 = 결속 합산 (등급 효과 + 세력 효과 + 결속 효과)<br>피해저항관통 + 피해저항 + (대인피해% × 10) + (대인방어% × 10)`;
  }

  document.getElementById("optimalHeader").innerHTML = `
        <div class="optimal-header-left">
          <h3 class="modal-main-title">
            ${combinedScoreText}
            <span class="score-formula">${formulaText}</span>
          </h3>
        </div>
        <div class="optimal-header-right">
          ${
            !isFromRanking
              ? `<button id="saveCombinationBtn" class="header-save-button">조합 저장</button>`
              : ""
          }
        </div>
    `;

  const spiritsGridHtml = modifiedSpirits
    .map((spirit) => {
      const isSelected = currentlyUsedSpirit === spirit.name;
      return `
      <div class="spirit-info-item-with-level ${
        isSelected ? "selected-used-spirit" : ""
      }" data-spirit-name="${spirit.name}">
          <div class="spirit-image-container">
              <img src="${spirit.image}" alt="${spirit.name}" loading="lazy">
          </div>
          <div class="spirit-info-details">
              <div class="spirit-info-name">${spirit.name}</div>
              <div class="spirit-info-level">Lv.${spirit.stats[0].level}</div>
          </div>
          ${
            !isFromRanking
              ? isFixedLevelSpirit(spirit.name)
                ? `<div class="spirit-level-control">
                    <div class="fixed-level-control">
                      <span class="fixed-level-label">25 (고정)</span>
                    </div>
                  </div>`
                : `<div class="spirit-level-control">
                    <button class="level-btn minus-btn" data-action="level-down" data-spirit="${spirit.name}">-</button>
                    <input type="number" class="level-input" min="0" max="25" value="${spirit.stats[0].level}" data-spirit="${spirit.name}">
                    <button class="level-btn plus-btn" data-action="level-up" data-spirit="${spirit.name}">+</button>
                  </div>`
              : ""
          }
      </div>`;
    })
    .join("");

  const combinationContainer = document.getElementById(
    "combinationResultsContainer"
  );
  combinationContainer.innerHTML = `<div class="spirits-grid-container">${spiritsGridHtml}</div>`;

  const spiritsGridContainer = combinationContainer.querySelector(
    ".spirits-grid-container"
  );
  if (!isFromRanking) {
    spiritsGridContainer.addEventListener("click", (e) =>
      handleSpiritGridClick(e, modifiedSpirits)
    );
    spiritsGridContainer.addEventListener("input", (e) =>
      handleSpiritGridClick(e, modifiedSpirits)
    );
    // Long press functionality
    spiritsGridContainer.addEventListener(
      "mousedown",
      handleModalContainerMouseDown
    );
    spiritsGridContainer.addEventListener(
      "touchstart",
      handleModalContainerTouchStart,
      { passive: false }
    );
    document.addEventListener("mouseup", handleModalGlobalMouseUp);
    document.addEventListener("touchend", handleModalGlobalTouchEnd);
  }

  const saveBtn = document.getElementById("saveCombinationBtn");
  if (saveBtn && !isFromRanking) {
    saveBtn.onclick = saveCombination;
  }

  // modifiedSpirits를 사용하여 gradeCounts와 factionCounts 계산 (history에서 복원 시 정확한 데이터 사용)
  renderEffects("optimalGradeEffects", "등급 효과", gradeEffects || [], gradeScore, {
    gradeCounts: modifiedSpirits.reduce((acc, s) => {
      if (s.grade) acc[s.grade] = (acc[s.grade] || 0) + 1;
      return acc;
    }, {}),
  });
  renderEffects(
    "optimalFactionEffects",
    "세력 효과",
    factionEffects || [],
    factionScore,
    {
      factionCounts: modifiedSpirits.reduce((acc, s) => {
        if (s.influence) acc[s.influence] = (acc[s.influence] || 0) + 1;
        return acc;
      }, {}),
    }
  );

  renderEffects("optimalBindEffects", "결속 효과", bindStats, bindScore);
  renderRegistrationEffectInResults();

  renderSpiritDetailsTable(modifiedSpirits, gradeEffects || [], factionEffects || []);

  window.toggleMoreStats = toggleMoreStats;
}

function renderHistoryTabs(category) {
  const history = getHistoryForCategory(category);
  const container = document.getElementById("historyContainer");
  if (!container) return;

  if (history.length === 0) {
    container.innerHTML = `<p class="no-history-message">${category} 카테고리에 저장된 기록이 없습니다.</p>`;
    return;
  }

  let highestScore = -1,
    highestScoreId = null;
  const newestId = history.length > 0 ? history[0].id : null;

  history.forEach((entry) => {
    const score =
      entry.totalScoreWithRegistration ||
      Math.round(
        ensureNumber(entry.gradeScore) +
          ensureNumber(entry.factionScore) +
          ensureNumber(entry.bindScore)
      );

    if (score > highestScore) {
      highestScore = score;
      highestScoreId = entry.id;
    }
  });

  const tabsHtml = Array(5)
    .fill(null)
    .map((_, index) => {
      const entry = history[index];
      if (!entry) return `<div class="history-tab-placeholder"></div>`;

      const totalScore =
        entry.totalScoreWithRegistration ||
        Math.round(
          ensureNumber(entry.gradeScore) +
            ensureNumber(entry.factionScore) +
            ensureNumber(entry.bindScore)
        );
      const bondScore = Math.round(
        ensureNumber(entry.gradeScore) +
          ensureNumber(entry.factionScore) +
          ensureNumber(entry.bindScore)
      );

      const isNewest = entry.id === newestId;
      const isBest = entry.id === highestScoreId;

      const scoreDisplay =
        entry.registrationScore > 0
          ? `${totalScore.toLocaleString()}\n(${bondScore.toLocaleString()})`
          : totalScore.toLocaleString();

      return `<div class="history-tab ${isBest ? "best" : ""} ${
        isNewest ? "newest active" : ""
      }" data-history-id="${entry.id}">
            <div class="history-delete-btn" data-category="${category}" data-id="${
        entry.id
      }" title="기록 삭제">×</div>
            <div class="tab-indicators">
                ${isNewest ? '<span class="current-marker">New</span>' : ""}
                ${isBest ? '<span class="best-marker">Best</span>' : ""}
            </div>
            <div class="tab-main-info">
                <span class="tab-score">${scoreDisplay}</span>
                <span class="tab-timestamp">${entry.timestamp.substring(
                  5,
                  16
                )}</span>
            </div>
        </div>`;
    })
    .join("");

  container.innerHTML = `<div class="history-tabs">${tabsHtml}</div>`;

  container.querySelectorAll(".history-tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      if (e.target.classList.contains("history-delete-btn")) {
        const deleteCategory = e.target.dataset.category;
        const deleteId = parseInt(e.target.dataset.id, 10);
        handleHistoryDelete(deleteCategory, deleteId, e);
        return;
      }

      container
        .querySelectorAll(".history-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const clickedId = parseInt(tab.dataset.historyId, 10);
      const selectedEntry = history.find((entry) => entry.id === clickedId);
      if (selectedEntry) {
        currentlyUsedSpirit = selectedEntry.selectedUsedSpirit || null;
        currentResult = JSON.parse(JSON.stringify(selectedEntry));
        modifiedSpirits = JSON.parse(JSON.stringify(selectedEntry.spirits));
        updateResultView(selectedEntry, false);
      }
    });
  });
}

function renderSpiritDetailsTable(spirits, gradeEffects = [], factionEffects = []) {
  const container = document.getElementById("optimalSpiritsDetails");
  if (!container) {
    return;
  }

  const allStatKeys = new Set();
  spirits.forEach((spirit) => {
    const fullSpiritData = globalState.allSpirits.find(
      (s) => s.name === spirit.name && s.type === spirit.type
    );

    if (!fullSpiritData) {
      return;
    }

    const actualLevel = spirit.stats[0].level;
    const levelStats = fullSpiritData.stats.find(
      (s) => s.level === actualLevel
    );

    if (levelStats?.bindStat)
      Object.keys(levelStats.bindStat).forEach((key) => allStatKeys.add(key));
  });

  // 등급효과와 세력효과의 스탯 키도 추가
  gradeEffects.forEach((effect) => {
    if (effect.key) allStatKeys.add(effect.key);
  });
  factionEffects.forEach((effect) => {
    if (effect.key) allStatKeys.add(effect.key);
  });

  if (allStatKeys.size === 0) {
    container.innerHTML =
      "<h4>상세 스탯 비교</h4><p>선택된 환수의 장착 효과 스탯 정보가 없습니다.</p>";
    return;
  }

  // 환산합산에 계산되는 스탯들 (맨 위에 표시)
  const scoreContributingStats = [
    "damageResistance",
    "damageResistancePenetration",
    "pvpDamagePercent",
    "pvpDefensePercent",
  ];

  // 스탯 키를 정렬: 환산합산 스탯 먼저, 나머지는 알파벳 순
  const allStatKeysArray = [...allStatKeys];
  const priorityStats = allStatKeysArray.filter((key) =>
    scoreContributingStats.includes(key)
  );
  const otherStats = allStatKeysArray
    .filter((key) => !scoreContributingStats.includes(key))
    .sort();

  // 환산합산 스탯도 순서대로 정렬
  const sortedPriorityStats = scoreContributingStats.filter((key) =>
    priorityStats.includes(key)
  );
  const sortedStatKeys = [...sortedPriorityStats, ...otherStats];

  let tableHtml = `
        <h4>상세 스탯 비교</h4>
        <div class="table-wrapper">
            <table class="spirits-stats-table">
                <thead>
                    <tr>
                        <th>능력치</th>
                        ${spirits
                          .map(
                            (s) =>
                              `<th><img src="${s.image}" class="spirit-thumbnail" alt="${s.name}" title="${s.name}" loading="lazy"><br><span class="spirit-table-name">${s.name}</span></th>`
                          )
                          .join("")}
                        <th class="stat-total-header">결속 합산</th>
                        <th class="stat-total-header">총 합산</th>
                    </tr>
                </thead>
                <tbody>
    `;

  sortedStatKeys.forEach((statKey) => {
    const highlightClass = SPECIAL_STAT_CLASSES[statKey] || "";
    let bindTotalValue = 0; // 결속 효과 합산
    let gradeTotalValue = 0; // 등급 효과 합산
    let factionTotalValue = 0; // 세력 효과 합산

    let cellsHtml = "";
    const spiritValues = [];

    // 결속 효과 (bindStat) 합산
    spirits.forEach((spirit) => {
      const fullSpiritData = globalState.allSpirits.find(
        (s) => s.name === spirit.name && s.type === spirit.type
      );
      const actualLevel = spirit.stats[0].level;
      const levelStats = fullSpiritData?.stats.find(
        (s) => s.level === actualLevel
      );

      const value = ensureNumber(levelStats?.bindStat?.[statKey] || 0);
      bindTotalValue += value;
      spiritValues.push({ name: spirit.name, level: actualLevel, value });

      // 모든 값은 정수로 표시
      const displayValue = PERCENT_STATS.includes(statKey)
        ? `${Math.round(value)}%`
        : Math.round(value).toLocaleString();

      cellsHtml += `<td>${value > 0 ? displayValue : "-"}</td>`;
    });

    // 등급 효과 합산
    const gradeEffect = gradeEffects.find((e) => e.key === statKey);
    if (gradeEffect) {
      gradeTotalValue = ensureNumber(gradeEffect.value || 0);
    }

    // 세력 효과 합산
    const factionEffect = factionEffects.find((e) => e.key === statKey);
    if (factionEffect) {
      factionTotalValue = ensureNumber(factionEffect.value || 0);
    }

    // 전체 합산: 결속 + 등급 + 세력
    const totalValue = bindTotalValue + gradeTotalValue + factionTotalValue;

    // 결속 합산 표시 값 계산 (모든 값은 정수로 표시)
    let bindDisplayValue;
    if (statKey === "pvpDamagePercent" || statKey === "pvpDefensePercent") {
      bindDisplayValue =
        bindTotalValue > 0
          ? `${Math.round(bindTotalValue * 10).toLocaleString()}`
          : "-";
    } else if (PERCENT_STATS.includes(statKey)) {
      bindDisplayValue = `${Math.round(bindTotalValue)}%`;
    } else {
      bindDisplayValue = Math.round(bindTotalValue).toLocaleString();
    }

    // 총 합산 표시 값 계산 (모든 값은 정수로 표시)
    let totalDisplayValue;
    if (statKey === "pvpDamagePercent" || statKey === "pvpDefensePercent") {
      totalDisplayValue =
        totalValue > 0 ? `${Math.round(totalValue * 10).toLocaleString()}` : "-";
    } else if (PERCENT_STATS.includes(statKey)) {
      totalDisplayValue = `${Math.round(totalValue)}%`;
    } else {
      totalDisplayValue = Math.round(totalValue).toLocaleString();
    }

    tableHtml += `
        <tr class="${highlightClass}">
            <th>${STATS_MAPPING[statKey] || statKey}</th>
            ${cellsHtml}
            <td class="stat-total stat-bind-total">${
              bindTotalValue > 0 ? bindDisplayValue : "-"
            }</td>
            <td class="stat-total stat-total-sum">${
              totalValue > 0 ? totalDisplayValue : "-"
            }</td>
        </tr>`;
  });

  tableHtml += `</tbody></table></div>`;
  container.innerHTML = tableHtml;
}

export function removeAllModals() {
  // Clean up modal long press state
  stopModalLongPress();
  document.removeEventListener("mouseup", handleModalGlobalMouseUp);

  if (activeModal) {
    document.removeEventListener("keydown", activeModal._escListener);
    activeModal.remove();
    activeModal = null;
  }
  currentlyUsedSpirit = null;
  currentResult = null;
  modifiedSpirits = [];
  delete window.toggleMoreStats;
  document.body.style.overflow = "auto";
}
