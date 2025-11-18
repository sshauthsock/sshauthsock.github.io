// js/pages/spiritInfo.js

import { state as globalState } from "../state.js";
import {
  createElement,
  checkSpiritStats,
  checkItemForStatEffect,
} from "../utils.js";
import { showInfo as showSpiritInfoModal } from "../modalHandler.js";
import { renderSpiritGrid } from "../components/spritGrid.js";
import { createStatFilter } from "../components/statFilter.js";
import { INFLUENCE_ROWS, STATS_MAPPING } from "../constants.js";

const pageState = {
  currentCategory: "수호",
  groupByInfluence: false,
  currentStatFilter: "",
};
const elements = {};

function getHTML() {
  return `
    <div class="sub-tabs" id="spiritInfoSubTabs">
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
    <div id="spiritGridContainer"></div>
    `;
}

function extractNumberFromImage(imagePath) {
  if (!imagePath) return Infinity;
  const match = imagePath.match(/\d+/);
  return match ? parseInt(match[0], 10) : Infinity;
}

function render() {
  let spiritsToDisplay = getSpiritsForCurrentState();

  if (pageState.currentStatFilter) {
    spiritsToDisplay = spiritsToDisplay.filter((spirit) =>
      checkItemForStatEffect(spirit, pageState.currentStatFilter)
    );
  }

  renderSpiritGrid({
    container: elements.spiritGridContainer,
    spirits: spiritsToDisplay,
    onSpiritClick: handleSpiritClick,
    getSpiritState: getSpiritVisualState,
    groupByInfluence: pageState.groupByInfluence,
  });
}

function handleSpiritClick(spirit) {
  if (spirit) {
    showSpiritInfoModal(spirit, pageState.currentStatFilter);
  }
}

function getSpiritVisualState(spirit) {
  const { hasFullRegistration, hasFullBind, hasLevel25Bind } =
    checkSpiritStats(spirit);
  return {
    selected: false,
    registrationCompleted: hasFullRegistration,
    bondCompleted: hasFullBind,
    level25BindAvailable: hasLevel25Bind,
  };
}

function getSpiritsForCurrentState() {
  const filteredSpirits = globalState.allSpirits.filter(
    (s) => s.type === pageState.currentCategory
  );
  const gradeOrder = { 전설: 1, 불멸: 2 };
  filteredSpirits.sort((a, b) => {
    const orderA = gradeOrder[a.grade] || 99;
    const orderB = gradeOrder[b.grade] || 99;
    if (orderA !== orderB) return orderA - orderB;
    return extractNumberFromImage(a.image) - extractNumberFromImage(b.image);
  });
  return filteredSpirits;
}

function handleContainerClick(e) {
  const tab = e.target.closest(".sub-tabs .tab");
  if (tab && !tab.classList.contains("active")) {
    elements.subTabs.querySelector(".tab.active").classList.remove("active");
    tab.classList.add("active");
    pageState.currentCategory = tab.dataset.category;
    render();
  }
}

function handleToggleChange(e) {
  pageState.groupByInfluence = e.target.checked;
  render();
}

function initStatFilter() {
  const filterContainer = elements.viewToggleContainer.querySelector(
    ".stat-filter-container"
  );
  createStatFilter(filterContainer, globalState.allSpirits, (newStatKey) => {
    pageState.currentStatFilter = newStatKey;
    render();
  });
}

export function init(container) {
  container.innerHTML = getHTML();

  elements.container = container;
  elements.subTabs = container.querySelector("#spiritInfoSubTabs");
  elements.influenceToggle = container.querySelector("#influenceToggle");
  elements.viewToggleContainer = container.querySelector(
    ".view-toggle-container"
  );
  elements.spiritGridContainer = container.querySelector(
    "#spiritGridContainer"
  );

  elements.container.addEventListener("click", handleContainerClick);
  elements.influenceToggle.addEventListener("change", handleToggleChange);

  initStatFilter();

  render();
}

export function getHelpContentHTML() {
  return `
        <div class="content-block">
            <h2>환수 정보 사용 안내</h2>
            <p>환수를 클릭하시면 해당 환수의 <strong>장착 정보</strong>와 <strong>결속 정보</strong>를 상세히 확인하실 수 있습니다.</p>
            <p>또한, <strong>환산 합산</strong>은 다음과 같이 계산됩니다: 피해저항 + 피해저항관통 + (대인피해% * 10) + (대인방어% * 10).</p>

            <h3>🔎 페이지 기능 설명</h3>
            <ul>
                <li><strong>카테고리 선택:</strong> 상단의 '수호', '탑승', '변신' 탭을 클릭하여 원하는 환수 종류의 정보를 확인하세요.</li>
                <li><strong>세력별 보기:</strong> '세력별 보기' 토글을 켜면 환수들을 소속 세력(결의, 고요 등)별로 그룹화하여 볼 수 있습니다. 세력 시너지를 파악하는 데 유용합니다.</li>
                <li><strong>능력치 필터:</strong> 특정 능력치(예: '피해저항관통', '치명위력%')를 가진 환수만 보고 싶을 때 사용하세요. 드롭다운에서 원하는 스탯을 선택하거나 검색하여 필터링할 수 있습니다.</li>
                <li><strong>환수 클릭:</strong> 목록에서 원하는 환수를 클릭하면 해당 환수의 상세 능력치, 등록 및 장착 효과, 그리고 레벨별 스탯 변화를 모달 창으로 확인할 수 있습니다.</li>
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
}
