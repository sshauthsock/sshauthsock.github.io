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

/**
 * 페이지의 기본 HTML 구조를 반환합니다.
 */
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

/**
 * 이미지 경로에서 숫자 부분을 추출하여 정렬에 사용합니다.
 * @param {string} imagePath - 환수 이미지 경로
 * @returns {number} 이미지 경로 내 숫자 (없으면 Infinity)
 */
function extractNumberFromImage(imagePath) {
  if (!imagePath) return Infinity;
  const match = imagePath.match(/\d+/);
  return match ? parseInt(match[0], 10) : Infinity;
}

/**
 * 페이지의 주요 콘텐츠 (환수 그리드)를 렌더링합니다.
 * 필터 및 그룹화 설정에 따라 다르게 표시됩니다.
 */
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

/**
 * 환수 클릭 시 해당 환수의 상세 정보를 모달로 표시합니다.
 * @param {object} spirit - 클릭된 환수 데이터
 */
function handleSpiritClick(spirit) {
  if (spirit) {
    showSpiritInfoModal(spirit, pageState.currentStatFilter);
  }
}

/**
 * 각 환수의 시각적 상태(선택 여부, 등록/장착 완료 여부)를 반환합니다.
 * @param {object} spirit - 환수 데이터
 * @returns {object} 환수의 시각적 상태를 나타내는 객체
 */
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

/**
 * 현재 페이지 상태(카테고리)에 따라 환수 목록을 필터링하고 정렬합니다.
 * @returns {Array<object>} 필터링 및 정렬된 환수 배열
 */
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

/**
 * 컨테이너 내의 클릭 이벤트를 처리합니다. (서브 탭 변경 등)
 */
function handleContainerClick(e) {
  const tab = e.target.closest(".sub-tabs .tab");
  if (tab && !tab.classList.contains("active")) {
    elements.subTabs.querySelector(".tab.active").classList.remove("active");
    tab.classList.add("active");
    pageState.currentCategory = tab.dataset.category;
    render();
  }
}

/**
 * '세력별 보기' 토글 변경 이벤트를 처리합니다.
 */
function handleToggleChange(e) {
  pageState.groupByInfluence = e.target.checked;
  render();
}

/**
 * 스탯 필터 드롭다운을 초기화하고 이벤트 리스너를 설정합니다.
 */
function initStatFilter() {
  const filterContainer = elements.viewToggleContainer.querySelector(
    ".stat-filter-container"
  );
  createStatFilter(filterContainer, globalState.allSpirits, (newStatKey) => {
    pageState.currentStatFilter = newStatKey;
    render();
  });
}

/**
 * 페이지 초기화 함수.
 * @param {HTMLElement} container - 페이지 내용이 렌더링될 DOM 요소
 */
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
  console.log("환수 정보 페이지 초기화 완료.");
}

/**
 * 이 페이지에 대한 도움말 콘텐츠 HTML을 반환합니다.
 * main.js에서 호출하여 도움말 툴팁에 주입됩니다.
 */
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

/**
 * 페이지 정리 함수.
 */
export function cleanup() {
  if (elements.container) {
    elements.container.removeEventListener("click", handleContainerClick);
  }
  if (elements.influenceToggle) {
    elements.influenceToggle.removeEventListener("change", handleToggleChange);
  }
  console.log("환수 정보 페이지 정리 완료.");
}
