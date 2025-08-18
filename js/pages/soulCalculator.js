// js/pages/soulCalculator.js

import { createElement } from "../utils.js";
import { showLoading, hideLoading } from "../loadingIndicator.js";
import * as api from "../api.js";

const pageState = {
  expTable: null, // 서버에서 불러온 경험치 테이블
  currentType: "legend", // 현재 선택된 환수혼 종류 (전설/불멸)
  currentLevel: 0, // 현재 레벨
  targetLevel: 1, // 목표 레벨
  souls: { high: 0, mid: 0, low: 0 }, // 보유 환수혼 개수
};
const elements = {}; // DOM 요소 참조를 저장할 객체

/**
 * 페이지의 기본 HTML 구조를 반환합니다.
 */
function getHTML() {
  return `
    <div class="container soul-container">
      <div class="left card">
        <h3>환수 성장 경험치 테이블</h3>
        <div class="exp-type-tabs">
          <div class="exp-tab active" data-type="legend">전설</div>
          <div class="exp-tab" data-type="immortal">불멸</div>
        </div>
        <div class="tables-container">
          <div class="table-half">
            <table>
              <thead><tr><th>Lv</th><th>경험치</th></tr></thead>
              <tbody id="expTableLeft"></tbody>
            </table>
          </div>
          <div class="table-half">
            <table>
              <thead><tr><th>Lv</th><th>경험치</th></tr></thead>
              <tbody id="expTableRight"></tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="right card">
        <h2>환수혼 계산기</h2>
        <div class="calculator-form">
          <div class="input-row">
            <div class="input-group type-select">
              <label>종류:</label>
              <select id="expType" class="form-control">
                <option value="legend">전설</option>
                <option value="immortal">불멸</option>
              </select>
            </div>
            <div class="input-group">
              <label>현재:</label>
              <input type="number" id="currentLevel" min="0" max="24" value="0" class="form-control">
            </div>
            <div class="input-group">
              <label>목표:</label>
              <input type="number" id="targetLevel" min="1" max="25" value="1" class="form-control">
            </div>
          </div>
          <div class="soul-panel">
            <div class="soul-item">
              <img src="assets/img/high-soul.jpg" alt="최상급">
              <label>최상급 (1000)</label>
              <input type="number" id="highSoul" min="0" value="0" class="form-control">
            </div>
            <div class="soul-item">
              <img src="assets/img/mid-soul.jpg" alt="상급 (100)">
              <label>상급 (100)</label>
              <input type="number" id="midSoul" min="0" value="0" class="form-control">
            </div>
            <div class="soul-item">
              <img src="assets/img/low-soul.jpg" alt="하급 (10)">
              <label>하급 (10)</label>
              <input type="number" id="lowSoul" min="0" value="0" class="form-control">
            </div>
          </div>
          <div class="calc-btn">
            <button id="calculateBtn" class="btn btn-primary">계산</button>
          </div>
        </div>
        <div class="results-panel hidden" id="resultsPanel">
        </div>
      </div>
    </div>
  `;
}

/**
 * 경험치 테이블을 렌더링합니다.
 */
function renderExpTable() {
  if (!pageState.expTable || !elements.expTableLeft || !elements.expTableRight)
    return;
  const expData = pageState.expTable[pageState.currentType];
  if (!expData) return;

  elements.expTableLeft.innerHTML = "";
  elements.expTableRight.innerHTML = "";

  expData.forEach((exp, lv) => {
    const row = createElement("tr", "", {
      html: `<td>${lv}</td><td>${exp.toLocaleString()}</td>`,
    });
    if (lv <= 13) {
      elements.expTableLeft.appendChild(row);
    } else {
      elements.expTableRight.appendChild(row);
    }
  });
  highlightTableRows(); // 현재 및 목표 레벨 강조
}

/**
 * 계산 결과를 패널에 렌더링합니다.
 * @param {object} result - 백엔드에서 반환된 계산 결과 객체
 */
function renderCalculationResult(result) {
  if (!result || !result.required || !result.maxLevelInfo) {
    elements.resultsPanel.innerHTML = `<p class="error-message">잘못된 계산 결과입니다.</p>`;
    elements.resultsPanel.classList.remove("hidden");
    return;
  }

  const { required, maxLevelInfo } = result;
  const typeName =
    { legend: "전설", immortal: "불멸" }[pageState.currentType] || "알 수 없음";

  const formatNumber = (num) => (Number(num) || 0).toLocaleString();

  const requiredSectionHtml = createRequiredSoulsSection(
    required,
    typeName,
    formatNumber
  );
  const maxLevelSectionHtml = createMaxLevelInfoSection(
    maxLevelInfo,
    typeName,
    formatNumber
  );

  elements.resultsPanel.innerHTML = `
        <div class="result-column">
            ${requiredSectionHtml}
        </div>
        <div class="result-column">
            ${maxLevelSectionHtml}
        </div>
    `;
  elements.resultsPanel.classList.remove("hidden");
}

/**
 * 필요 환수혼 섹션 HTML을 생성합니다.
 */
function createRequiredSoulsSection(required, typeName, formatNumber) {
  let neededHtml = "";
  if (!required.isSufficient && required.needed) {
    neededHtml = `
            <div class="sub-title">추가 필요 (최적 조합)</div>
            <div class="data-row"><span><img src="assets/img/high-soul.jpg" class="soul-icon">최상급</span><span class="data-value">${formatNumber(
              required.needed.high
            )}개</span></div>
            <div class="data-row"><span><img src="assets/img/mid-soul.jpg" class="soul-icon">상급</span><span class="data-value">${formatNumber(
              required.needed.mid
            )}개</span></div>
            <div class="data-row"><span><img src="assets/img/low-soul.jpg" class="soul-icon">하급</span><span class="data-value">${formatNumber(
              required.needed.low
            )}개</span></div>
        `;
  } else {
    neededHtml = `<div class="sub-title sufficient">보유한 환수혼으로 충분합니다!</div>`;
  }

  return `
        <div class="result-box">
            <div class="result-title required-title">필요 환수혼 <span class="type-badge">${typeName}</span></div>
            <div class="result-section">
                <div class="data-row">
                    <span>레벨 ${pageState.currentLevel} → ${
    pageState.targetLevel
  }</span>
                    <span class="data-value highlight">${formatNumber(
                      required.exp
                    )}exp</span>
                </div>
            </div>
            <div class="sub-title">총 필요 환수혼</div>
            <div class="data-row"><span><img src="assets/img/high-soul.jpg" class="soul-icon">최상급</span><span class="data-value">${formatNumber(
              required.souls.high
            )}개</span></div>
            <div class="data-row"><span><img src="assets/img/mid-soul.jpg" class="soul-icon">상급</span><span class="data-value">${formatNumber(
              required.souls.mid
            )}개</span></div>
            <div class="data-row"><span><img src="assets/img/low-soul.jpg" class="soul-icon">하급</span><span class="data-value">${formatNumber(
              required.souls.low
            )}개</span></div>
            ${neededHtml}
        </div>
    `;
}

/**
 * 도달 가능 레벨 섹션 HTML을 생성합니다.
 */
function createMaxLevelInfoSection(maxLevelInfo, typeName, formatNumber) {
  let maxLevelProgressHtml = "";
  if (
    maxLevelInfo.level < 25 &&
    maxLevelInfo.nextLevelExp !== undefined &&
    maxLevelInfo.nextLevelExp > 0
  ) {
    maxLevelProgressHtml = `
            <div class="data-row"><span>다음 레벨 진행도</span><span class="data-value">${
              maxLevelInfo.progressPercent || 0
            }%</span></div>
            <div class="data-row"><span>남은 경험치</span><span class="data-value">${formatNumber(
              maxLevelInfo.remainingExp
            )} / ${formatNumber(maxLevelInfo.nextLevelExp)}</span></div>
        `;
  } else if (maxLevelInfo.level === 25) {
    maxLevelProgressHtml = `<div class="data-row"><span class="sufficient">최대 레벨 (25) 달성 완료!</span></div>`;
  }

  const targetStatusHtml = maxLevelInfo.isTargetReachable
    ? `<span class="sufficient">목표 레벨 ${pageState.targetLevel} 달성 가능!</span>`
    : `<span class="insufficient">목표 레벨 ${
        pageState.targetLevel
      }까지 ${formatNumber(maxLevelInfo.expShortage)} 경험치 부족</span>`;

  return `
        <div class="result-box">
            <div class="result-title max-title">도달 가능 레벨 <span class="type-badge">${typeName}</span></div>
            <div class="result-section">
                <div class="data-row"><span>보유 환수혼</span><span class="data-value highlight">${formatNumber(
                  maxLevelInfo.ownedExp
                )}exp</span></div>
            </div>
            <div class="result-section">
                <div class="data-row"><span>최대 도달 레벨</span><span class="data-value highlight">${
                  maxLevelInfo.level
                }</span></div>
                ${maxLevelProgressHtml}
            </div>
            <div class="result-section">${targetStatusHtml}</div>
        </div>
    `;
}

/**
 * 경험치 테이블에서 현재 및 목표 레벨에 해당하는 행을 강조 표시합니다.
 */
function highlightTableRows() {
  if (!elements.container) return;
  const allRows = elements.container.querySelectorAll(
    "#expTableLeft tr, #expTableRight tr"
  );

  allRows.forEach((row) =>
    row.classList.remove("current-level", "target-level")
  );

  const current = pageState.currentLevel;
  const target = pageState.targetLevel;

  if (allRows[current]) allRows[current].classList.add("current-level");
  if (allRows[target]) allRows[target].classList.add("target-level");
}

/**
 * 환수혼 종류(전설/불멸) 변경 이벤트를 처리합니다.
 */
function handleTypeChange(newType) {
  pageState.currentType = newType;
  elements.expType.value = newType;

  elements.container.querySelectorAll(".exp-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.type === newType);
  });

  renderExpTable();
  elements.resultsPanel.classList.add("hidden");
}

/**
 * 입력 필드(현재 레벨, 목표 레벨)의 유효성을 검사하고 상태를 업데이트합니다.
 */
function validateInputs() {
  let current = parseInt(elements.currentLevel.value, 10);
  let target = parseInt(elements.targetLevel.value, 10);

  if (isNaN(current) || current < 0) current = 0;
  if (current > 24) current = 24;

  if (isNaN(target) || target < 1) target = 1;
  if (target > 25) target = 25;

  if (target <= current) {
    target = current + 1;
    if (target > 25) target = 25;
  }

  elements.currentLevel.value = current;
  elements.targetLevel.value = target;

  pageState.currentLevel = current;
  pageState.targetLevel = target;
  highlightTableRows();
  elements.resultsPanel.classList.add("hidden");
}

/**
 * 계산 버튼 클릭 이벤트를 처리하고 백엔드에 계산 요청을 보냅니다.
 */
async function handleCalculate() {
  validateInputs();

  pageState.souls = {
    high: parseInt(elements.highSoul.value, 10) || 0,
    mid: parseInt(elements.midSoul.value, 10) || 0,
    low: parseInt(elements.lowSoul.value, 10) || 0,
  };

  showLoading(
    elements.resultsPanel,
    "계산 중...",
    "환수혼 소모량을 계산하고 있습니다."
  );

  try {
    const result = await api.calculateSoul({
      type: pageState.currentType,
      currentLevel: pageState.currentLevel,
      targetLevel: pageState.targetLevel,
      ownedSouls: pageState.souls,
    });
    renderCalculationResult(result);
  } catch (error) {
    alert(`계산 오류: ${error.message}`);
    console.error("Soul calculation failed:", error);
    elements.resultsPanel.classList.add("hidden");
  } finally {
    hideLoading();
  }
}

/**
 * 페이지의 모든 주요 이벤트 리스너를 설정합니다.
 */
function setupEventListeners() {
  elements.expType.addEventListener("change", (e) =>
    handleTypeChange(e.target.value)
  );

  elements.container.querySelectorAll(".exp-tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      handleTypeChange(e.currentTarget.dataset.type);
    });
  });

  elements.currentLevel.addEventListener("change", validateInputs);
  elements.targetLevel.addEventListener("change", validateInputs);

  elements.highSoul.addEventListener("change", handleCalculate);
  elements.midSoul.addEventListener("change", handleCalculate);
  elements.lowSoul.addEventListener("change", handleCalculate);

  elements.calculateBtn.addEventListener("click", handleCalculate);
}

/**
 * 페이지 초기화 함수.
 * @param {HTMLElement} container - 페이지 내용이 렌더링될 DOM 요소
 */
export async function init(container) {
  container.innerHTML = getHTML();

  elements.container = container;
  elements.expTableLeft = container.querySelector("#expTableLeft");
  elements.expTableRight = container.querySelector("#expTableRight");
  elements.expType = container.querySelector("#expType");
  elements.currentLevel = container.querySelector("#currentLevel");
  elements.targetLevel = container.querySelector("#targetLevel");
  elements.highSoul = container.querySelector("#highSoul");
  elements.midSoul = container.querySelector("#midSoul");
  elements.lowSoul = container.querySelector("#lowSoul");
  elements.calculateBtn = container.querySelector("#calculateBtn");
  elements.resultsPanel = container.querySelector("#resultsPanel");

  setupEventListeners();

  showLoading(container, "경험치 테이블 로딩 중...");
  try {
    pageState.expTable = await api.fetchSoulExpTable();
    renderExpTable();
    validateInputs();
  } catch (error) {
    console.error("Failed to load soul exp table:", error);
    container.innerHTML = `<p class="error-message">경험치 데이터를 불러오는 데 실패했습니다: ${error.message}</p>`;
  } finally {
    hideLoading();
  }

  console.log("환수혼 계산 페이지 초기화 완료.");
}

/**
 * 이 페이지에 대한 도움말 콘텐츠 HTML을 반환합니다.
 * main.js에서 호출하여 도움말 툴팁에 주입됩니다.
 */
export function getHelpContentHTML() {
  return `
        <div class="content-block">
            <h2>환수혼 계산기 사용 안내</h2>
            <p>환수혼 계산기는 보유한 환수혼(최상급, 상급, 하급)을 기준으로 특정 환수 레벨까지 도달하는 데 필요한 경험치와 환수혼 개수를 계산해줍니다. 또한, 보유 환수혼으로 얼마나 레벨업 할 수 있는지도 알려드립니다.</p>

            <h3>🔎 페이지 기능 설명</h3>
            <ul>
                <li><strong>환수 성장 경험치 테이블:</strong> 좌측에서 전설/불멸 환수 종류별 레벨업에 필요한 총 경험치를 한눈에 확인할 수 있습니다. 현재 레벨과 목표 레벨에 해당하는 행은 색상으로 강조됩니다.</li>
                <li><strong>환수혼 종류:</strong> '전설' 또는 '불멸' 중 육성하려는 환수의 종류를 선택하세요.</li>
                <li><strong>현재 / 목표 레벨:</strong> 육성하려는 환수의 현재 레벨과 목표 레벨을 입력하세요. (현재 레벨은 0~24, 목표 레벨은 1~25)</li>
                <li><strong>보유 환수혼 개수:</strong> 현재 인벤토리에 보유 중인 '최상급', '상급', '하급' 환수혼 개수를 입력하세요. (최상급=1000exp, 상급=100exp, 하급=10exp)</li>
                <li><strong>계산 버튼:</strong> '계산' 버튼을 클릭하면 아래 두 가지 결과를 즉시 확인할 수 있습니다.
                    <ul>
                        <li><strong>필요 환수혼:</strong> 목표 레벨까지 도달하기 위한 총 필요 경험치와 이를 충족시키는 데 필요한 최적 환수혼 조합(최상급 우선 사용)을 보여줍니다. 보유 환수혼이 부족하다면, 추가로 필요한 환수혼 개수도 알려드립니다.</li>
                        <li><strong>도달 가능 레벨:</strong> 현재 보유한 환수혼으로 도달할 수 있는 최대 레벨과, 다음 레벨까지 남은 경험치 및 진행도를 상세하게 보여줍니다.</li>
                    </ul>
                </li>
            </ul>

            <h3>💡 환수혼 활용 팁</h3>
            <ul>
                <li><strong>환수혼 획득처:</strong> 환수 소환 시 중복 환수 분해, 영웅의 길 보상, 환수 던전, 비서: 환수 보물상자, 이벤트 등을 통해 환수혼을 획득할 수 있습니다.</li>
                <li><strong>효율적인 육성:</strong> 계산기를 통해 정확한 필요량을 파악하고, 불필요한 환수혼 낭비를 줄일 수 있습니다. 특정 레벨 구간에서는 하급/상급 혼으로 마무리하는 것이 더 효율적일 때도 있습니다.</li>
                <li><strong>최대 레벨 25의 중요성:</strong> 환수의 25레벨 장착 효과는 캐릭터에게 매우 강력한 시너지를 제공하므로, 주요 환수는 25레벨까지 육성하는 것을 권장합니다.</li>
            </ul>
        </div>
    `;
}

/**
 * 페이지 정리 함수.
 */
export function cleanup() {
  if (elements.expType)
    elements.expType.removeEventListener("change", handleTypeChange);
  if (elements.container) {
    elements.container.querySelectorAll(".exp-tab").forEach((tab) => {
      tab.removeEventListener("click", handleTypeChange);
    });
  }
  if (elements.currentLevel)
    elements.currentLevel.removeEventListener("change", validateInputs);
  if (elements.targetLevel)
    elements.targetLevel.removeEventListener("change", validateInputs);
  if (elements.highSoul)
    elements.highSoul.removeEventListener("change", handleCalculate);
  if (elements.midSoul)
    elements.midSoul.removeEventListener("change", handleCalculate);
  if (elements.lowSoul)
    elements.lowSoul.removeEventListener("change", handleCalculate);
  if (elements.calculateBtn)
    elements.calculateBtn.removeEventListener("click", handleCalculate);

  console.log("환수혼 계산 페이지 정리 완료.");
}
