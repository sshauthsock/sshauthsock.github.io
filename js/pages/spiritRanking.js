// js/pages/spiritRanking.js

import { state as globalState } from "../state.js";
import { createElement } from "../utils.js";
import * as api from "../api.js";
import { showInfo as showSpiritInfoModal } from "../modalHandler.js";
import { showLoading, hideLoading } from "../loadingIndicator.js";
import { STATS_MAPPING, FACTION_ICONS } from "../constants.js";
import { showResultModal as showOptimalResultModal } from "../resultModal.js";

const pageState = {
  currentCategory: "수호",
  currentRankingType: "bond",
  currentStatKey: "bind",
  currentLoadedRankings: [],
};
const elements = {};

function getHTML() {
  return `
    <div class="sub-tabs" id="rankingCategoryTabs">
        <div class="tab active" data-category="수호">수호</div>
        <div class="tab" data-category="탑승">탑승</div>
        <div class="tab" data-category="변신">변신</div>
    </div>
    <div class="filters-container">
        <div class="filter-section">
            <div class="filter-label">랭킹 종류:</div>
            <div class="filter-buttons ranking-type-selector">
                <button class="filter-btn active" data-type="bond">결속 랭킹</button>
                <button class="filter-btn" data-type="stat">능력치 랭킹</button>
            </div>
                    <a href="https://open.kakao.com/o/sUSXtUYe" target="_blank" class="kakao-gift-btn">
            <img src="assets/img/gift.png" alt="카카오 선물하기 아이콘"
                style="height: 20px; vertical-align: middle; margin-right: 5px;">
            개발자에게 카톡 선물하기
        </a>
        </div>
        <div class="filter-section" id="statSelectorContainer" style="display: none;">
            <label for="statSelector" class="filter-label">능력치:</label>
            <select id="statSelector" class="stat-selector"></select>
        </div>
    </div>
    <div class="ranking-container">
        <h1 class="ranking-title">환수 <span id="rankingCategoryTitle">수호</span> <span id="rankingTypeTitle">결속</span> 랭킹</h1>
        <div id="rankingsContainer" class="rankings-list"></div>
    </div>
  `;
}

/**
 * 랭킹 데이터를 로드하고 렌더링합니다. 캐싱 전략을 사용합니다.
 */
async function loadAndRenderRankings() {
  showLoading(
    elements.rankingsContainer,
    "랭킹 데이터 로딩 중",
    `${pageState.currentCategory} ${
      pageState.currentRankingType === "bond" ? "결속" : "능력치"
    } 랭킹을 불러오고 있습니다.`
  );
  try {
    const data = await api.fetchRankings(
      pageState.currentCategory,
      pageState.currentRankingType,
      pageState.currentStatKey
    );
    pageState.currentLoadedRankings = data.rankings || []; // <--- 랭킹 데이터를 pageState에 저장
    renderRankings(pageState.currentLoadedRankings); // <--- 저장된 데이터로 렌더링
  } catch (error) {
    console.error("랭킹 데이터 로드 실패:", error);
    // elements.rankingsContainer.innerHTML = `<p class="error-message">랭킹 데이터를 불러오는 데 실패했습니다: ${error.message}</p>`;
    elements.rankingsContainer.innerHTML = `<p class="error-message">서버 점검중입니다.</p>`;
  } finally {
    hideLoading();
  }
}

function renderRankings(rankingsData) {
  if (pageState.currentRankingType === "bond") {
    renderBondRankings(rankingsData);
  } else {
    renderStatRankings(rankingsData);
  }
}

function renderBondRankings(rankings) {
  const container = elements.rankingsContainer;
  if (!container) return;

  if (rankings.length === 0) {
    container.innerHTML = `<p class="no-data-message">결속 랭킹 데이터가 없습니다.</p>`;
    return;
  }

  // <th class="action-column">상세</th> <--- 헤더에 상세보기 열 추가
  const tableHtml = `
    <div class="ranking-table-container">
      <table class="ranking-table">
        <thead><tr><th>순위</th><th>조합</th><th>등급/세력</th><th>환산 점수</th><th class="action-column">상세</th></tr></thead>
        <tbody>
          ${rankings
            .map(
              (ranking, index) => `
            <tr class="ranking-row">
              <td class="rank-column"><div class="rank-badge rank-${
                index + 1
              }">${index + 1}</div></td>
              <td class="spirits-column"><div class="spirits-container">${ranking.spirits
                .map(
                  (spirit) =>
                    `<img src="${spirit.image}" alt="${spirit.name}" title="${spirit.name}" class="spirit-image" data-spirit-name="${spirit.name}">`
                )
                .join("")}</div></td>
              <td class="faction-column"><div class="faction-tags">${renderSetInfo(
                ranking
              )}</div></td>
              <td class="score-column">
                <div class="total-score">${Math.round(
                  ranking.scoreWithBind
                )}</div>
                <div class="score-breakdown">(등급: ${Math.round(
                  ranking.gradeScore
                )} | 세력: ${Math.round(
                ranking.factionScore
              )} | 장착: ${Math.round(ranking.bindScore)})</div>
              </td>
              <td class="action-column">
                <button class="btn btn-sm btn-info view-ranking-details" data-index="${index}">상세보기</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
  container.innerHTML = tableHtml;
}

/**
 * 능력치 랭킹을 카드 그리드 형태로 렌더링합니다.
 * @param {Array<object>} rankings - 능력치 랭킹 데이터
 */
function renderStatRankings(rankings) {
  const container = elements.rankingsContainer;
  if (!container) return;

  if (rankings.length === 0) {
    container.innerHTML = `<p class="no-data-message">능력치 랭킹 데이터가 없습니다.</p>`;
    return;
  }

  const statDisplayName = elements.statSelector.selectedOptions[0].text;
  let html = `<h3 class="stat-ranking-title">${statDisplayName} 랭킹</h3><div class="stat-grid-container">`;

  rankings.forEach((ranking, index) => {
    let rankClass = "";
    if (index === 0) rankClass = "top-1";
    else if (index === 1) rankClass = "top-2";
    else if (index === 2) rankClass = "top-3";

    const displayValue =
      typeof ranking.value === "number" && !isNaN(ranking.value)
        ? ranking.value.toLocaleString()
        : ranking.value !== undefined && ranking.value !== null
        ? String(ranking.value)
        : "N/A";

    html += `
      <div class="stat-card ${rankClass}" data-spirit-name="${ranking.name}">
        <div class="rank-number">${index + 1}</div>
        <div class="spirit-image-container"><img src="${ranking.image}" alt="${
      ranking.name
    }" class="spirit-image"></div>
        <div class="spirit-name">${ranking.name}</div>
        <div class="spirit-stat">${displayValue}</div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

/**
 * 랭킹 항목의 등급 및 세력 세트 효과 정보를 렌더링합니다.
 * @param {object} ranking - 랭킹 항목 데이터
 * @returns {string} HTML 문자열
 */
function renderSetInfo(ranking) {
  let info = "";
  if (ranking.gradeCounts) {
    info += Object.entries(ranking.gradeCounts)
      .filter(([, count]) => count >= 2)
      .map(
        ([grade, count]) =>
          `<span class="grade-tag grade-tag-${
            grade === "전설" ? "legend" : "immortal"
          }">${grade} x${count}</span>`
      )
      .join(" ");
  }
  if (ranking.factionCounts) {
    info += Object.entries(ranking.factionCounts)
      .filter(([, count]) => count >= 2)
      .map(([faction, count]) => {
        const iconPath = FACTION_ICONS[faction] || "";
        return `<span class="faction-tag" title="${faction}">
                    <img src="${iconPath}" class="faction-icon" alt="${faction}">
                    ${faction} x${count}
                  </span>`;
      })
      .join(" ");
  }
  return info;
}

function initStatFilter() {
  const statSelector = elements.statSelector;
  statSelector.innerHTML = "";

  statSelector.appendChild(
    createElement("option", "", { value: "bind", text: "장착효과(환산)" })
  );
  statSelector.appendChild(
    createElement("option", "", {
      value: "registration",
      text: "등록효과(환산)",
    })
  );

  const allStatKeys = Object.keys(STATS_MAPPING).sort();
  allStatKeys.forEach((key) => {
    statSelector.appendChild(
      createElement("option", "", { value: key, text: STATS_MAPPING[key] })
    );
  });

  statSelector.value = pageState.currentStatKey;
}

/**
 * 페이지의 모든 주요 이벤트 리스너를 설정합니다.
 */
function setupEventListeners() {
  elements.container.addEventListener("click", handleContainerClick);
  elements.statSelector.addEventListener("change", handleStatChange);
  // <--- 새로 추가: 랭킹 컨테이너에 클릭 이벤트 위임 설정
  elements.rankingsContainer.addEventListener("click", handleRankingAction); // <--- 이 라인 추가
}

/**
 * 컨테이너 내의 클릭 이벤트를 처리합니다.
 */
function handleContainerClick(e) {
  const subTab = e.target.closest("#rankingCategoryTabs .tab");
  if (subTab && !subTab.classList.contains("active")) {
    elements.subTabs.querySelector(".tab.active").classList.remove("active");
    subTab.classList.add("active");
    pageState.currentCategory = subTab.dataset.category;
    document.getElementById("rankingCategoryTitle").textContent =
      pageState.currentCategory;
    loadAndRenderRankings();
    return;
  }

  const typeBtn = e.target.closest(".ranking-type-selector .filter-btn");
  if (typeBtn && !typeBtn.classList.contains("active")) {
    elements.container
      .querySelector(".ranking-type-selector .filter-btn.active")
      .classList.remove("active");
    typeBtn.classList.add("active");
    pageState.currentRankingType = typeBtn.dataset.type;
    elements.statSelectorContainer.style.display =
      pageState.currentRankingType === "stat" ? "flex" : "none";
    document.getElementById("rankingTypeTitle").textContent =
      typeBtn.textContent;
    loadAndRenderRankings();
    return;
  }

  // 개별 환수 이미지/카드 클릭 시 (결속 랭킹의 이미지 or 능력치 랭킹의 카드)
  // 상세보기 버튼 클릭과는 별개로 동작합니다.
  const spiritElement = e.target.closest(".spirit-image, .stat-card");
  if (spiritElement && !e.target.classList.contains("view-ranking-details")) {
    // <--- 상세보기 버튼 클릭과 중복 방지
    const spiritName = spiritElement.alt || spiritElement.dataset.spiritName;
    const spiritData = globalState.allSpirits.find(
      (s) => s.name === spiritName
    );
    if (spiritData) {
      showSpiritInfoModal(spiritData, null, true);
    }
  }
}

/**
 * 랭킹 컨테이너 내에서 발생하는 클릭 이벤트를 처리합니다. (상세보기 버튼 등)
 * @param {Event} e - 클릭 이벤트 객체
 */
function handleRankingAction(e) {
  const target = e.target;
  if (target.classList.contains("view-ranking-details")) {
    const index = parseInt(target.dataset.index, 10);
    const selectedRankingData = pageState.currentLoadedRankings[index];

    if (selectedRankingData) {
      const dataForModal = {
        combination: selectedRankingData.spirits,
        gradeScore: selectedRankingData.gradeScore,
        factionScore: selectedRankingData.factionScore,
        bindScore: selectedRankingData.bindScore,
        gradeEffects: selectedRankingData.gradeEffects, // <-- 이 값이 무엇인지 확인
        factionEffects: selectedRankingData.factionEffects, // <-- 이 값이 무엇인지 확인
        bindStats:
          selectedRankingData.bindStats || selectedRankingData.bindStat, // <-- 이 값이 무엇인지 확인
        spirits: selectedRankingData.spirits,
      };
      // console.log(
      //   "Debug: DataForModal contents for Ranking Details:",
      //   dataForModal
      // );
      showOptimalResultModal(dataForModal, true);
    } else {
      console.error("랭킹 상세 데이터를 찾을 수 없습니다:", index);
      alert("랭킹 상세 정보를 불러오는 데 실패했습니다.");
    }
  }
}

/**
 * 스탯 필터 드롭다운 변경 이벤트를 처리합니다.
 */
function handleStatChange(e) {
  pageState.currentStatKey = e.target.value;
  loadAndRenderRankings();
}

/**
 * 페이지 초기화 함수.
 * @param {HTMLElement} container - 페이지 내용이 렌더링될 DOM 요소
 */
export async function init(container) {
  container.innerHTML = getHTML();

  elements.container = container;
  elements.subTabs = container.querySelector("#rankingCategoryTabs");
  elements.rankingsContainer = container.querySelector("#rankingsContainer");
  elements.statSelectorContainer = container.querySelector(
    "#statSelectorContainer"
  );
  elements.statSelector = container.querySelector("#statSelector");

  initStatFilter();
  setupEventListeners();

  await loadAndRenderRankings();

  // console.log("환수 랭킹 페이지 초기화 완료.");
}

/**
 * 이 페이지에 대한 도움말 콘텐츠 HTML을 반환합니다.
 * main.js에서 호출하여 도움말 툴팁에 주입됩니다.
 */
export function getHelpContentHTML() {
  return `
        <div class="content-block">
            <h2>환수 랭킹 정보 사용 안내</h2>
            <p>'바연화연'의 환수 랭킹 페이지에서는 다양한 기준(결속 점수, 특정 능력치)으로 환수의 순위를 확인할 수 있습니다. 다른 유저들의 최상위 조합이나 강력한 환수 스탯을 참고하여 여러분의 육성 목표를 세워보세요.</p>
            <p>모든 랭킹은 25레벨 환수를 기준으로 계산됩니다.</p>

            <h3>🔎 페이지 기능 설명</h3>
            <ul>
                <li><strong>카테고리 선택:</strong> '수호', '탑승', '변신' 탭을 클릭하여 해당 종류의 환수 랭킹을 확인하세요.</li>
                <li><strong>랭킹 종류 선택:</strong> '결속 랭킹' 또는 '능력치 랭킹' 중 원하는 랭킹 기준을 선택하세요.
                    <ul>
                        <li><strong>결속 랭킹:</strong> 등급, 세력, 장착 효과를 종합한 '환산 점수'를 기준으로 5마리 환수 조합의 순위를 보여줍니다. 각 조합의 구성 환수, 등급/세력 시너지, 점수 상세 내역을 확인할 수 있습니다.
                            <br>👉 <strong>'상세보기' 버튼</strong>을 클릭하여 해당 조합의 모든 능력치 합계 및 개별 환수의 장착 효과를 '결속 결과' 모달과 동일하게 확인할 수 있습니다.
                        </li>
                        <li><strong>능력치 랭킹:</strong> 특정 능력치(예: '피해저항관통', '대인방어%')를 가장 높게 올려주는 환수의 순위를 보여줍니다.</li>
                    </ul>
                </li>
                <li><strong>능력치 선택 (능력치 랭킹 선택 시):</strong> 능력치 랭킹을 선택하면 나타나는 드롭다운에서 '장착효과(환산)', '등록효과(환산)' 또는 원하는 특정 능력치를 선택하여 해당 능력치 랭킹을 볼 수 있습니다.</li>
                <li><strong>환수/조합 클릭:</strong>
                    <ul>
                        <li>결속 랭킹에서 조합 내 환수 이미지를 클릭하거나, 능력치 랭킹에서 환수 카드를 클릭하면 해당 환수의 25레벨 상세 정보를 모달 창으로 확인할 수 있습니다.</li>
                        <li>랭킹 모드에서는 환수 상세 정보의 레벨이 25로 고정됩니다.</li>
                    </ul>
                </li>
            </ul>

            <h3>💡 랭킹 활용 팁</h3>
            <ul>
                <li><strong>최고 효율 조합 벤치마킹:</strong> 결속 랭킹을 통해 상위권 유저들이 어떤 환수 조합으로 시너지를 내는지 파악하고 자신의 육성 방향을 정하는 데 참고할 수 있습니다.</li>
                <li><strong>핵심 스탯 환수 찾기:</strong> 능력치 랭킹을 활용하여 특정 스탯(예: '치명위력%', '파괴력증가')을 극대화하기 위해 어떤 환수를 육성해야 할지 알아볼 수 있습니다.</li>
                <li><strong>메타 파악:</strong> 특정 능력치 랭킹이 높거나 결속 랭킹에 자주 등장하는 환수들을 통해 현재 게임 내 핵심 스탯 메타가 무엇인지 파악할 수 있습니다.</li>
            </ul>
        </div>
    `;
}

/**
 * 페이지 정리 함수.
 */
export function cleanup() {
  if (elements.container) {
    elements.container.removeEventListener("click", handleContainerClick);
  }
  if (elements.statSelector) {
    elements.statSelector.removeEventListener("change", handleStatChange);
  }
  // <--- 새로 추가: 이벤트 리스너 제거
  if (elements.rankingsContainer) {
    elements.rankingsContainer.removeEventListener(
      "click",
      handleRankingAction
    );
  }
  // console.log("환수 랭킹 페이지 정리 완료.");
}
