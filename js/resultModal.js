import { createElement } from "./utils.js";
import { getHistoryForCategory } from "./historyManager.js";
import { state as globalState } from "./state.js";
import { FACTION_ICONS, STATS_MAPPING, PERCENT_STATS } from "./constants.js";

let activeModal = null;

const SPECIAL_STAT_CLASSES = {
  damageResistance: "stat-damage-resistance",
  damageResistancePenetration: "stat-damage-resistance-penetration",
  pvpDefensePercent: "stat-pvp-defense-percent",
  pvpDamagePercent: "stat-pvp-damage-percent",
};

function ensureNumber(value) {
  if (value === undefined || value === null) return 0;
  const num = parseFloat(String(value).replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
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
        return `<span class="faction-tag" title="${faction}"><img src="${iconPath}" class="faction-icon" alt="${faction}">x${count}</span>`;
      })
      .join(" ");
  }

  const validEffects = Array.isArray(effects) ? effects : [];

  let effectsListHtml = '<p class="no-effects">효과 없음</p>';
  if (validEffects.length > 0) {
    effectsListHtml = `<ul class="effects-list">${validEffects
      .map((stat) => {
        const isPercent = PERCENT_STATS.includes(stat.key);
        const displayValue = isPercent
          ? `${ensureNumber(stat.value)}%`
          : ensureNumber(stat.value).toLocaleString();

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

export function showResultModal(result, isFromRanking = false) {
  // console.log(
  //   "#################################result in showResultModal:",
  //   result
  // );

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
        // console.log("Kakao AdFit: Ads re-rendered in modal.");
      } else {
        console.warn(
          "Kakao AdFit script (window.adfit) not yet loaded or not available."
        );
      }
    } catch (error) {
      console.error("Kakao AdFit: Error rendering ads in modal:", error);
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
  const resultsContainer = createElement("div", "results-container");
  resultsContainer.innerHTML = `
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

  updateResultView(result, isFromRanking);

  if (!isFromRanking) {
    if (result.spirits && result.spirits.length > 0 && result.spirits[0].type) {
      renderHistoryTabs(result.spirits[0].type);
    } else {
      console.warn(
        "History cannot be rendered: missing spirit type in result.",
        result
      );
      const historyContainer = document.getElementById("historyContainer");
      if (historyContainer) {
        historyContainer.innerHTML = `<p class="no-history-message">기록을 불러올 수 없습니다.</p>`;
      }
    }
  }
}

function updateResultView(result, isFromRanking) {
  const {
    gradeScore,
    factionScore,
    bindScore,
    gradeEffects,
    factionEffects,
    bindStats,
    spirits,
  } = result;

  const combinedScore = Math.round(
    ensureNumber(gradeScore) +
      ensureNumber(factionScore) +
      ensureNumber(bindScore)
  );

  document.getElementById("optimalHeader").innerHTML = `
        <h3 class="modal-main-title">${spirits[0].type} 결속 최적 조합</h3>
        <div class="modal-score-display">
            <span class="score-title">종합 점수</span>
            <span class="score-value">${combinedScore}</span>
            <span class="score-breakdown">
                (등급: ${Math.round(ensureNumber(gradeScore))} 
                + 세력: ${Math.round(ensureNumber(factionScore))} 
                + 장착: ${Math.round(ensureNumber(bindScore))})
            </span>
        </div>
    `;

  document.getElementById("combinationResultsContainer").innerHTML = `
        <div class="spirits-grid-container">${spirits
          .map(
            (spirit) => `
                <div class="spirit-info-item" title="${spirit.name} (Lv.${spirit.stats[0].level})">
                    <img src="${spirit.image}" alt="${spirit.name}">
                    <div class="spirit-info-details">
                        <div class="spirit-info-name">${spirit.name}</div>
                        <div class="spirit-info-level">Lv.${spirit.stats[0].level}</div>
                    </div>
                </div>`
          )
          .join("")}
        </div>
    `;

  renderEffects("optimalGradeEffects", "등급 효과", gradeEffects, gradeScore, {
    gradeCounts: spirits.reduce((acc, s) => {
      acc[s.grade] = (acc[s.grade] || 0) + 1;
      return acc;
    }, {}),
  });
  renderEffects(
    "optimalFactionEffects",
    "세력 효과",
    factionEffects,
    factionScore,
    {
      factionCounts: spirits.reduce((acc, s) => {
        if (s.influence) acc[s.influence] = (acc[s.influence] || 0) + 1;
        return acc;
      }, {}),
    }
  );

  // console.log("######Rendering bind effects with stats:", bindStats);
  // console.log("Bind score:", bindScore);

  renderEffects("optimalBindEffects", "결속 효과", bindStats, bindScore);

  renderSpiritDetailsTable(spirits);
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
    const score = Math.round(
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

      const score = Math.round(
        ensureNumber(entry.gradeScore) +
          ensureNumber(entry.factionScore) +
          ensureNumber(entry.bindScore)
      );
      const isNewest = entry.id === newestId;
      const isBest = entry.id === highestScoreId;

      return `<button class="history-tab ${isBest ? "best" : ""} ${
        isNewest ? "newest active" : ""
      }" data-history-id="${entry.id}">
            <div class="tab-indicators">
                ${isNewest ? '<span class="current-marker">최신</span>' : ""}
                ${isBest ? '<span class="best-marker">최고</span>' : ""}
            </div>
            <div class="tab-main-info">
                <span class="tab-score">${score}</span>
                <span class="tab-timestamp">${entry.timestamp.substring(
                  5,
                  16
                )}</span>
            </div>
        </button>`;
    })
    .join("");

  container.innerHTML = `<div class="history-tabs">${tabsHtml}</div>`;

  container.querySelectorAll(".history-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      container
        .querySelectorAll(".history-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const clickedId = parseInt(tab.dataset.historyId, 10);
      const selectedEntry = history.find((entry) => entry.id === clickedId);
      if (selectedEntry) {
        updateResultView(selectedEntry, false);
      }
    });
  });
}

function renderSpiritDetailsTable(spirits) {
  // console.log("Rendering spirit details table for spirits:", spirits);
  const container = document.getElementById("optimalSpiritsDetails");
  if (!container) return;

  const allStatKeys = new Set();
  spirits.forEach((spirit) => {
    const fullSpiritData = globalState.allSpirits.find(
      (s) => s.name === spirit.name && s.type === spirit.type
    );

    // console.log("globalState.allSpirits:", globalState.allSpirits);
    // console.log("fullSpiritData ,", fullSpiritData);

    if (!fullSpiritData) return;

    const actualLevel = spirit.level || 25;
    const levelStats = fullSpiritData.stats.find(
      (s) => s.level === actualLevel
    );

    if (levelStats?.bindStat)
      Object.keys(levelStats.bindStat).forEach((key) => allStatKeys.add(key));
  });

  if (allStatKeys.size === 0) {
    container.innerHTML =
      "<h4>상세 스탯 비교</h4><p>선택된 환수의 장착 효과 스탯 정보가 없습니다.</p>";
    return;
  }

  const sortedStatKeys = [...allStatKeys].sort();

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
                              `<th><img src="${s.image}" class="spirit-thumbnail" alt="${s.name}" title="${s.name}"><br><span class="spirit-table-name">${s.name}</span></th>`
                          )
                          .join("")}
                        <th class="stat-total-header">합산</th>
                    </tr>
                </thead>
                <tbody>
    `;

  sortedStatKeys.forEach((statKey) => {
    const highlightClass = SPECIAL_STAT_CLASSES[statKey] || "";
    let totalValue = 0;

    let cellsHtml = "";
    spirits.forEach((spirit) => {
      const fullSpiritData = globalState.allSpirits.find(
        (s) => s.name === spirit.name && s.type === spirit.type
      );
      const actualLevel = spirit.stats[0].level;
      const levelStats = fullSpiritData?.stats.find(
        (s) => s.level === actualLevel
      );

      const value = ensureNumber(levelStats?.bindStat?.[statKey]);
      totalValue += value;

      const displayValue = PERCENT_STATS.includes(statKey)
        ? `${value}%`
        : value.toLocaleString();

      cellsHtml += `<td>${value > 0 ? displayValue : "-"}</td>`;
    });

    const totalDisplayValue = PERCENT_STATS.includes(statKey)
      ? `${totalValue.toFixed(2)}%`
      : totalValue.toLocaleString();

    tableHtml += `
        <tr class="${highlightClass}">
            <th>${STATS_MAPPING[statKey] || statKey}</th>
            ${cellsHtml}
            <td class="stat-total">${
              totalValue > 0 ? totalDisplayValue : "-"
            }</td>
        </tr>`;
  });

  tableHtml += `</tbody></table></div>`;
  container.innerHTML = tableHtml;
}

export function removeAllModals() {
  if (activeModal) {
    document.removeEventListener("keydown", activeModal._escListener);
    activeModal.remove();
    activeModal = null;
  }
  document.body.style.overflow = "auto";
}
