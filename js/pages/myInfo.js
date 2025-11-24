import { state as globalState } from "../state.js";
import { createElement, debounce } from "../utils.js";
import { renderSpiritGrid } from "../components/spritGrid.js";
import * as api from "../api.js";
import { isFixedLevelSpirit } from "../constants.js";
import Logger from "../utils/logger.js";

const pageState = {
  currentCategory: "수호", // 오른쪽 그리드에서 보여줄 카테고리
  currentProfileId: null, // 현재 선택된 프로파일 ID
  // 결속 환수: 각 카테고리별 최대 6개
  bondSpirits: {
    수호: [], // [{ name, level, ...spirit }]
    탑승: [],
    변신: [],
  },
  // 사용 중인 환수: 각 카테고리별 1개
  activeSpirits: {
    수호: null, // { name, level, ...spirit }
    탑승: null,
    변신: null,
  },
  userStats: {}, // 사용자 기본 스탯
  baselineStats: {}, // 저장된 기준 스탯 (합산 결과)
  baselineKeyStats: {
    tachaeTotal: 0, // 환산타채 합 기준값
    statusEffectResistance: 0, // 상태이상저항 기준값
    statusEffectAccuracy: 0, // 상태이상적중 기준값
  },
  expTable: null, // 경험치 테이블 (캐시)
  lastSoulExpCalculation: null, // 마지막 경험치 계산 결과 (캐시)
  lastSoulExpHash: null, // 마지막 계산 시 사용된 데이터 해시
  bondCalculationCache: new Map(), // 결속 계산 결과 캐시
  lastTotalStatsCalculation: null, // 마지막 합산 스탯 계산 결과 (캐시)
  lastTotalStatsHash: null, // 마지막 합산 스탯 계산 시 사용된 데이터 해시
  savedSoulExp: 0, // 저장된 기준 총 환수혼 경험치
  recentlyEditedStats: new Set(), // 방금 편집한 스탯 목록 (updateTotalStats에서 업데이트하지 않도록)
  isSavingBaseline: false, // 기준값 저장 중 플래그
  isInitialLoad: true, // 초기 로딩 플래그 (저장된 값 표시용)
  isUpdatingTotalStats: false, // updateTotalStats 실행 중 플래그 (중복 호출 방지)
  baselineStatsHash: null, // baselineStats 저장 시점의 해시값
  engravingData: {
    // 각인 데이터: { 카테고리: { 환수이름: { 스탯키: 각인점수 } } }
    수호: {},
    탑승: {},
    변신: {},
  },
  imageLoadErrors: new Set(), // 이미지 로드 실패 추적
  imageLoadErrorShown: false, // 이미지 로드 실패 메시지 표시 여부
  imageObserver: null, // 이미지 로드 에러 감지용 MutationObserver
};

const elements = {};

// 스탯 정의
const STATS_CONFIG = [
  // 1컬럼
  { key: "damageResistancePenetration", name: "피해저항관통" },
  { key: "damageResistance", name: "피해저항" },
  { key: "pvpDamagePercent", name: "대인피해%" },
  { key: "pvpDefensePercent", name: "대인방어%" },
  { key: "pvpDamage", name: "대인피해" },
  { key: "pvpDefense", name: "대인방어" },
  { key: "statusEffectAccuracy", name: "상태이상적중" },
  { key: "statusEffectResistance", name: "상태이상저항" },
  // 2컬럼
  { key: "normalMonsterPenetration", name: "일반몬스터 관통" },
  { key: "normalMonsterAdditionalDamage", name: "일반몬스터 추가피해" },
  { key: "bossMonsterPenetration", name: "보스몬스터 관통" },
  { key: "bossMonsterAdditionalDamage", name: "보스몬스터 추가피해" },
  { key: "criticalPowerPercent", name: "치명위력%" },
  { key: "criticalChance", name: "치명확률%" },
  { key: "power", name: "위력" },
  { key: "movementSpeed", name: "이동속도" },
  // 3컬럼
  { key: "damageAbsorption", name: "피해흡수" },
  { key: "criticalResistance", name: "치명저항" },
  { key: "criticalDamageResistance", name: "치명피해저항" },
  { key: "experienceGainIncrease", name: "경험치 획득증가" },
  { key: "normalMonsterResistance", name: "일반몬스터 저항" },
  { key: "bossMonsterResistance", name: "보스몬스터 저항" },
];

// 환수 각인 등록효과에 사용 가능한 스탯 리스트
const ENGRAVING_REGISTRATION_STATS = [
  { key: "healthIncrease", name: "체력증가" },
  { key: "magicIncrease", name: "마력증가" },
  { key: "criticalChance", name: "치명확률" },
  { key: "criticalResistance", name: "치명저항" },
  { key: "healthPotionEnhancement", name: "체력시약향상" },
  { key: "magicPotionEnhancement", name: "마력시약향상" },
  { key: "pvpDefense", name: "대인방어" },
  { key: "damageAbsorption", name: "피해흡수" },
  { key: "power", name: "위력" },
  { key: "criticalDamageResistance", name: "치명피해저항" },
  { key: "castingEnhancement", name: "시전향상" },
  { key: "bossMonsterAdditionalDamage", name: "보스몬스터 추가피해" },
  { key: "normalMonsterAdditionalDamage", name: "일반몬스터 추가피해" },
  { key: "damageResistancePenetration", name: "피해저항관통" },
  { key: "statusEffectResistance", name: "상태이상저항" },
  { key: "statusEffectAccuracy", name: "상태이상적중" },
];

const COLUMN_1_STATS = STATS_CONFIG.slice(0, 8);
const COLUMN_2_STATS = STATS_CONFIG.slice(8, 16);
const COLUMN_3_STATS = STATS_CONFIG.slice(16);

// 모바일 스탯 이름 간소화 매핑
const MOBILE_STAT_NAME_MAP = {
  피해저항관통: "피저관",
  피해저항: "피저",
  "대인피해%": "대피%",
  "대인방어%": "대방%",
  대인피해: "대피",
  대인방어: "대방",
  상태이상적중: "상이적",
  상태이상저항: "상이저",
  "일반몬스터 관통": "일몬관",
  "일반몬스터 추가피해": "일몬추",
  "보스몬스터 관통": "보몬관",
  "보스몬스터 추가피해": "보몬추",
  "치명위력%": "치위%",
  "치명확률%": "치확%",
  위력: "위력",
  이동속도: "이속",
  피해흡수: "피흡",
  치명저항: "치저",
  치명피해저항: "치피저",
  "경험치 획득증가": "경획",
  "일반몬스터 저항": "일몬저",
  "보스몬스터 저항": "보몬저",
};

// 모바일 감지 함수
function isMobile() {
  return window.innerWidth <= 768;
}

// 이미지 로드 실패 메시지 표시
function showImageLoadError() {
  if (pageState.imageLoadErrorShown) return;

  pageState.imageLoadErrorShown = true;

  // 메시지 표시
  const message = createElement("div");
  message.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ff6b35;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-size: 14px;
    font-weight: 600;
    max-width: 90%;
    text-align: center;
    animation: slideDown 0.3s ease-out;
  `;
  message.textContent =
    "일부 이미지가 로드되지 않았습니다. Ctrl+Shift+R을 눌러 새로고침해주세요.";

  // 애니메이션 스타일 추가
  if (!document.getElementById("image-error-animation-style")) {
    const style = createElement("style");
    style.id = "image-error-animation-style";
    style.textContent = `
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(message);

  // 5초 후 자동으로 제거
  setTimeout(() => {
    if (message.parentNode) {
      message.style.animation = "slideDown 0.3s ease-out reverse";
      setTimeout(() => {
        if (message.parentNode) {
          message.remove();
        }
      }, 300);
    }
  }, 5000);

  // 클릭 시 제거
  message.addEventListener("click", () => {
    if (message.parentNode) {
      message.style.animation = "slideDown 0.3s ease-out reverse";
      setTimeout(() => {
        if (message.parentNode) {
          message.remove();
        }
      }, 300);
    }
  });
}

function getHTML() {
  return `
    <div class="my-info-container">
    <div class="my-info-top-section">
      <!-- 왼쪽: 환수 섹션 (50%) -->
      <div class="my-info-spirit-section-wrapper">
        <!-- 왼쪽: 수호/탑승/변신 카드 (40%) -->
        <div class="my-info-left-panel">
          <!-- 수호 카드 -->
          <div class="my-info-category-card" data-category="수호">
            <h2 class="my-info-category-title">수호</h2>
            <div class="my-info-bond-slots" id="bondSlots수호"></div>
          </div>

          <!-- 탑승 카드 -->
          <div class="my-info-category-card" data-category="탑승">
            <h2 class="my-info-category-title">탑승</h2>
            <div class="my-info-bond-slots" id="bondSlots탑승"></div>
          </div>

          <!-- 변신 카드 -->
          <div class="my-info-category-card" data-category="변신">
            <h2 class="my-info-category-title">변신</h2>
            <div class="my-info-bond-slots" id="bondSlots변신"></div>
          </div>
        </div>

        <!-- 오른쪽: 전체 환수 선택 그리드 (60%) -->
        <div class="my-info-right-panel">
          <div class="my-info-spirit-section">
            <div class="my-info-spirit-tabs">
              <button class="my-info-spirit-tab active" data-category="수호">수호</button>
              <button class="my-info-spirit-tab" data-category="탑승">탑승</button>
              <button class="my-info-spirit-tab" data-category="변신">변신</button>
            </div>
            <div id="myInfoSpiritGrid"></div>
          </div>
        </div>
      </div>

      <!-- 오른쪽: 기본 스탯 섹션 (50%) -->
      <div class="my-info-stats-section-wrapper">
        <div class="my-info-stats-section">
          <!-- 프로파일 선택 섹션 (통합) -->
          <div class="my-info-profile-section" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: var(--space-xs); flex: 1;">
              <label class="my-info-profile-label">설정:</label>
              <select class="my-info-profile-select" id="profileSelect">
                <option value="">설정 없음</option>
              </select>
              <div class="my-info-profile-actions">
                <button class="my-info-profile-btn primary" id="createProfileBtn" title="새 프로파일">+</button>
                <button class="my-info-profile-btn" id="editProfileBtn" disabled title="이름 수정">✏️</button>
                <button class="my-info-profile-btn danger" id="deleteProfileBtn" disabled>삭제</button>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button id="saveBaselineBtn" class="my-info-save-btn">
                <span>저장</span>
              </button>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm); margin-top: var(--space-xs); position: relative;">
            <h2 class="my-info-section-title" style="margin: 0; flex: 0 0 auto;">나의 스탯</h2>
            <!-- 환산타채 합 -->
            <div class="my-info-key-stat-item" style="max-width: 300px; min-width: 250px; margin: 0; flex: 0 0 auto; left: 50%; transform: translateX(-50%);">
              <div class="my-info-key-stat-label">환산타채 합</div>
              <div class="my-info-key-stat-value-wrapper">
                <div class="my-info-key-stat-value" id="keyStatTachae">-</div>
                <div class="my-info-key-stat-change" id="keyStatTachaeChange">-</div>
              </div>
            </div>
          </div>
          <div class="my-info-stats-list">
            <!-- 1컬럼 -->
            <div class="my-info-stats-column" id="statsColumn1"></div>
            <!-- 2컬럼 -->
            <div class="my-info-stats-column" id="statsColumn2"></div>
            <!-- 3컬럼 -->
            <div class="my-info-stats-column" id="statsColumn3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 영역 -->
    <div class="my-info-bottom-section">
      <!-- 왼쪽: 환수 혼 경험치 -->
      <div class="my-info-bottom-left">
        <div class="my-info-stats-section">
          <h2 class="my-info-section-title">환수 초기화 시 환수 혼 경험치</h2>
          <div id="soulExpInfo"></div>
        </div>
      </div>

      <!-- 오른쪽: 각인 등록효과, 각인 장착효과 -->
      <div class="my-info-bottom-right">
        <div class="my-info-key-stats-section">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <h2 class="my-info-section-title">각인 효과</h2>
            <div class="my-info-engraving-notice" style="font-size: 9px; color: var(--text-secondary); padding: 0 2px;">
              ⚠️ 각인 정보는 레벨에 따른 스탯 자동으로 계산 안됩니다. 직접 입력해야합니다.
            </div>
          </div>
          <div class="my-info-key-stats-grid" id="keyStatsGrid">
            <div class="my-info-key-stat-item">
              <div class="my-info-key-stat-label">각인 등록효과</div>
              <div class="my-info-key-stat-registration-list" id="keyStatRegistrationList"></div>
            </div>
            <div class="my-info-key-stat-item">
              <div class="my-info-key-stat-label">각인 장착효과</div>
              <div class="my-info-key-stat-bind-list" id="keyStatBindList"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  `;
}

function renderStats() {
  const column1 = elements.statsColumn1;
  const column2 = elements.statsColumn2;
  const column3 = elements.statsColumn3;

  column1.innerHTML = "";
  column2.innerHTML = "";
  column3.innerHTML = "";

  COLUMN_1_STATS.forEach((stat) => {
    const item = createStatItem(stat);
    column1.appendChild(item);
  });

  COLUMN_2_STATS.forEach((stat) => {
    const item = createStatItem(stat);
    column2.appendChild(item);
  });

  COLUMN_3_STATS.forEach((stat) => {
    const item = createStatItem(stat);
    column3.appendChild(item);
  });
}

// 주요 스탯 클래스 정의 (resultModal.js와 동일)
const SPECIAL_STAT_CLASSES = {
  damageResistance: "stat-damage-resistance",
  damageResistancePenetration: "stat-damage-resistance-penetration",
  pvpDefensePercent: "stat-pvp-defense-percent",
  pvpDamagePercent: "stat-pvp-damage-percent",
};

// 보조 스탯 클래스 정의 (주요 스탯보다 더 연하게 표시)
const SECONDARY_STAT_CLASSES = {
  pvpDamage: "stat-pvp-damage",
  pvpDefense: "stat-pvp-defense",
  statusEffectAccuracy: "stat-status-effect-accuracy",
  statusEffectResistance: "stat-status-effect-resistance",
  damageAbsorption: "stat-damage-absorption",
};

function createStatItem(stat) {
  const item = createElement("div", "my-info-stat-item");
  item.dataset.stat = stat.key;

  // 주요 스탯에 특별한 클래스 추가
  const specialClass = SPECIAL_STAT_CLASSES[stat.key];
  if (specialClass) {
    item.classList.add(specialClass);
  }

  // 보조 스탯에 클래스 추가 (주요 스탯보다 더 연하게)
  const secondaryClass = SECONDARY_STAT_CLASSES[stat.key];
  if (secondaryClass) {
    item.classList.add(secondaryClass);
  }

  const name = createElement("span", "my-info-stat-name");
  // 모바일에서 간소화된 이름 사용
  const displayName =
    isMobile() && MOBILE_STAT_NAME_MAP[stat.name]
      ? MOBILE_STAT_NAME_MAP[stat.name]
      : stat.name;
  name.textContent = displayName;

  const valueContainer = createElement("span", "my-info-stat-value");

  // 기본값은 숨김 (더블클릭 편집용으로만 사용)
  const baseValue = createElement("span", "my-info-stat-base");
  // 현재 프로파일의 userStats에서 값을 가져옴
  const currentUserStatValue =
    pageState.userStats && pageState.userStats[stat.key] !== undefined
      ? pageState.userStats[stat.key]
      : 0;
  baseValue.textContent = currentUserStatValue.toString();
  baseValue.style.display = "none";

  // 합산값을 메인으로 표시
  const totalValue = createElement("span", "my-info-stat-total");
  totalValue.textContent = "0";

  // 증감 표시
  const changeValue = createElement("span", "my-info-stat-change");
  changeValue.style.display = "none";

  valueContainer.appendChild(totalValue);
  valueContainer.appendChild(changeValue);

  item.appendChild(name);
  item.appendChild(valueContainer);

  // 클릭 한 번으로 수정
  item.addEventListener("click", (e) => {
    // 증감 표시 클릭은 무시
    if (e.target.classList.contains("my-info-stat-change")) {
      return;
    }
    // 이미 편집 중이면 무시
    if (item.classList.contains("editing")) {
      return;
    }
    // input 클릭은 무시
    if (e.target.classList.contains("my-info-stat-input")) {
      return;
    }
    // 클릭 한 번으로 편집 시작
    handleStatEdit(item, stat.key, baseValue);
  });

  return item;
}

function handleStatEdit(item, statKey, valueSpan) {
  // 화면에 표시된 총합값을 읽어옴 (저장된 값 또는 계산된 값)
  const totalValueSpan = item.querySelector(".my-info-stat-total");
  let currentTotalValue = 0;

  if (totalValueSpan && totalValueSpan.textContent) {
    // 화면에 표시된 값을 파싱 (콤마 제거)
    const displayedText = totalValueSpan.textContent.replace(/,/g, "");
    currentTotalValue = parseFloat(displayedText) || 0;
  } else {
    // 화면에 값이 없으면 계산된 값 사용
    const currentBaseValue = pageState.userStats[statKey] || 0;
    let currentTotalStatsValue = 0;

    if (pageState.lastTotalStatsCalculation) {
      currentTotalStatsValue =
        pageState.lastTotalStatsCalculation.allTotalStats?.[statKey] || 0;
    }

    currentTotalValue = currentBaseValue + currentTotalStatsValue;
  }

  item.classList.add("editing");
  const input = createElement("input", "my-info-stat-input");
  input.type = "number";
  input.value = currentTotalValue; // 총합값을 입력 필드에 표시
  input.step = "1";
  input.min = "0";

  // totalValue와 changeValue는 숨기지 않고 input과 함께 표시
  const valueContainer = item.querySelector(".my-info-stat-value");
  const changeValueSpan = item.querySelector(".my-info-stat-change");

  // input을 totalValueSpan 앞에 삽입 (값이 실시간으로 보이도록)
  if (totalValueSpan && totalValueSpan.parentNode) {
    totalValueSpan.parentNode.insertBefore(input, totalValueSpan);
  } else {
    valueContainer.appendChild(input);
  }

  // input 스타일 조정 (인라인으로 표시)
  input.style.display = "inline-block";
  input.style.width = "80px";
  input.style.marginRight = "4px";

  // totalValueSpan과 changeValueSpan은 계속 표시 (값이 실시간으로 업데이트됨)
  if (totalValueSpan) {
    totalValueSpan.style.display = "inline";
  }
  if (changeValueSpan) {
    changeValueSpan.style.display = "inline";
  }

  input.focus();
  input.select();

  let isFinishing = false; // 중복 호출 방지 플래그

  // 입력값이 변경될 때마다 즉시 반영
  const updateValueInRealTime = () => {
    // 사용자가 입력한 값 = 총합값
    const inputTotalValue = parseFloat(input.value) || 0;

    // 현재 캐시된 결속/활성 스탯 가져오기
    let bondValue = 0;
    let activeValue = 0;

    if (pageState.lastTotalStatsCalculation) {
      bondValue =
        pageState.lastTotalStatsCalculation.allBondStats[statKey] || 0;
      activeValue =
        pageState.lastTotalStatsCalculation.allActiveStats[statKey] || 0;
    } else {
      // 캐시가 없으면 간단히 활성 스탯만 계산
      const categories = ["수호", "탑승", "변신"];
      for (const category of categories) {
        const active = pageState.activeSpirits[category];
        if (active) {
          const spirit = getSpiritsForCategory(category).find(
            (s) => s.name === active.name
          );
          if (spirit) {
            const levelStat = spirit.stats?.find(
              (s) => s.level === active.level
            );
            if (
              levelStat?.registrationStat &&
              levelStat.registrationStat[statKey]
            ) {
              const numValue =
                typeof levelStat.registrationStat[statKey] === "number"
                  ? levelStat.registrationStat[statKey]
                  : parseFloat(levelStat.registrationStat[statKey]) || 0;
              activeValue += numValue;
            }
          }
        }
      }
    }

    // 사용자가 입력한 값이 총합값이므로 그대로 사용
    const totalValue = inputTotalValue;

    // 기준값 가져오기
    const baselineValue = pageState.baselineStats.hasOwnProperty(statKey)
      ? pageState.baselineStats[statKey]
      : totalValue;

    // 증감값 계산
    const changeValue = totalValue - baselineValue;

    // totalValueSpan 업데이트 (즉시 반영, 편집 중에도 표시됨)
    if (totalValueSpan) {
      const formattedValue = Math.round(totalValue).toLocaleString();
      totalValueSpan.textContent = formattedValue;
      totalValueSpan.style.display = "inline";
      totalValueSpan.style.visibility = "visible";
    }

    // changeValueSpan 업데이트 (편집 중에도 표시됨)
    if (changeValueSpan) {
      const absChangeValue = Math.abs(changeValue);
      if (absChangeValue > 0.01) {
        const roundedChange = Math.round(changeValue);
        changeValueSpan.textContent = `(${
          roundedChange > 0 ? "+" : ""
        }${roundedChange.toLocaleString()})`;
        changeValueSpan.className = `my-info-stat-change ${
          changeValue > 0 ? "positive" : "negative"
        }`;
        changeValueSpan.style.display = "inline";
        changeValueSpan.style.visibility = "visible";
        // 인라인 스타일 제거 (CSS 클래스가 적용되도록)
        changeValueSpan.style.color = "";
        changeValueSpan.style.background = "";
      } else {
        changeValueSpan.textContent = "(0)";
        changeValueSpan.className = "my-info-stat-change neutral";
        changeValueSpan.style.display = "inline";
        changeValueSpan.style.visibility = "visible";
        // 인라인 스타일 제거 (CSS 클래스가 적용되도록)
        changeValueSpan.style.color = "";
        changeValueSpan.style.background = "";
      }
    }
  };

  // input 이벤트 리스너 추가 (입력값이 변경될 때마다 즉시 반영)
  input.addEventListener("input", updateValueInRealTime);

  // 초기값도 즉시 반영
  updateValueInRealTime();

  const finishEdit = () => {
    // 이미 처리 중이면 무시
    if (isFinishing) {
      return;
    }
    isFinishing = true;

    // input.value를 먼저 읽어서 저장 (input 제거 전에)
    const inputTotalValue = parseFloat(input.value) || 0; // 사용자가 입력한 값 = 총합값

    // input 제거 (계산 전에 제거)
    if (input.parentNode) {
      input.remove();
    }

    // 현재 캐시된 전체 스탯 가져오기 (allTotalStats 사용)
    let totalStatsValue = 0;

    if (pageState.lastTotalStatsCalculation) {
      totalStatsValue =
        pageState.lastTotalStatsCalculation.allTotalStats?.[statKey] || 0;
    }

    // 사용자가 입력한 값이 총합값이므로, 기본값을 역산
    // totalValue = baseValue + allTotalStats
    // 따라서 baseValue = totalValue - allTotalStats
    const newBaseValue = inputTotalValue - totalStatsValue;

    // userStats에 기본값 저장
    pageState.userStats[statKey] = Math.max(0, newBaseValue); // 음수 방지
    // saveUserStats() 제거: 저장 버튼을 눌러야 저장됨

    // baseValue 업데이트 (기본값으로 저장)
    valueSpan.textContent = Math.max(0, newBaseValue).toString();

    // 총합값은 사용자가 입력한 값 그대로 사용
    const totalValue = inputTotalValue;

    // 기준값 가져오기
    const baselineValue = pageState.baselineStats.hasOwnProperty(statKey)
      ? pageState.baselineStats[statKey]
      : totalValue;

    // 증감값 계산
    const changeValue = totalValue - baselineValue;

    // totalValueSpan 업데이트 (강제로 직접 설정)
    if (totalValueSpan) {
      const formattedValue = Math.round(totalValue).toLocaleString();

      // 여러 방법으로 강제 업데이트
      totalValueSpan.textContent = formattedValue;
      totalValueSpan.innerText = formattedValue;
      totalValueSpan.style.display = "inline";
      totalValueSpan.style.visibility = "visible";

      // 데이터 속성에 저장 (보호 플래그)
      const editTimestamp = Date.now();
      totalValueSpan.dataset.lastEditedValue = formattedValue;
      totalValueSpan.dataset.lastEditedTime = editTimestamp.toString();
      totalValueSpan.dataset.isManuallyEdited = "true";

      // 디버깅 로그
      console.log(`[${statKey}] finishEdit - 값 업데이트:`, {
        입력한_총합값: inputTotalValue,
        계산된_기본값: newBaseValue,
        totalStatsValue,
        totalValue,
        formattedValue,
        실제_DOM_값: totalValueSpan.textContent,
      });
    }

    // 스탯 업데이트 (합산합 재계산)
    debouncedUpdateTotalStats();

    // changeValueSpan 업데이트
    if (changeValueSpan) {
      const absChangeValue = Math.abs(changeValue);
      if (absChangeValue > 0.01) {
        const roundedChange = Math.round(changeValue);
        changeValueSpan.textContent = `(${
          roundedChange > 0 ? "+" : ""
        }${roundedChange.toLocaleString()})`;
        changeValueSpan.className = `my-info-stat-change ${
          changeValue > 0 ? "positive" : "negative"
        }`;
        changeValueSpan.style.display = "inline";
        changeValueSpan.style.visibility = "visible";
        // 인라인 스타일 제거 (CSS 클래스가 적용되도록)
        changeValueSpan.style.color = "";
        changeValueSpan.style.background = "";
      } else {
        changeValueSpan.textContent = "(0)";
        changeValueSpan.className = "my-info-stat-change neutral";
        changeValueSpan.style.display = "inline";
        changeValueSpan.style.visibility = "visible";
      }
    }

    item.classList.remove("editing");

    // 방금 편집한 스탯을 플래그에 추가 (updateTotalStats에서 업데이트하지 않도록)
    // 일정 시간 후 자동으로 제거하여 이후 업데이트가 가능하도록 함
    pageState.recentlyEditedStats.add(statKey);
    setTimeout(() => {
      pageState.recentlyEditedStats.delete(statKey);
    }, 500); // 500ms 후 자동 제거

    // 주요 스탯만 업데이트 (전체 스탯 리스트는 업데이트하지 않음)
    if (pageState.lastTotalStatsCalculation) {
      const calc = pageState.lastTotalStatsCalculation;
      updateKeyStats(STATS_CONFIG, calc.allTotalStats || calc.allBondStats, {});
    } else {
      // 캐시가 없으면 최소한의 계산만 수행
      const categories = ["수호", "탑승", "변신"];
      const allBondStats = {};
      const allActiveStats = {};

      // 활성 스탯만 간단히 계산
      for (const category of categories) {
        const active = pageState.activeSpirits[category];
        if (active) {
          const spirit = getSpiritsForCategory(category).find(
            (s) => s.name === active.name
          );
          if (spirit) {
            const levelStat = spirit.stats?.find(
              (s) => s.level === active.level
            );
            if (levelStat?.registrationStat) {
              Object.entries(levelStat.registrationStat).forEach(
                ([key, value]) => {
                  const numValue =
                    typeof value === "number" ? value : parseFloat(value) || 0;
                  allActiveStats[key] = (allActiveStats[key] || 0) + numValue;
                }
              );
            }
          }
        }
      }

      // 주요 스탯만 업데이트 (빈 객체 전달, 실제 계산은 updateTotalStats에서 수행)
      updateKeyStats(STATS_CONFIG, {}, {});
    }
  };

  input.addEventListener("blur", finishEdit);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      finishEdit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      // Escape 키는 편집 취소
      if (input.parentNode) {
        input.remove();
      }
      if (totalValueSpan) {
        totalValueSpan.style.display = "inline";
      }
      if (changeValueSpan) {
        changeValueSpan.style.display = "inline";
      }
      item.classList.remove("editing");
    }
  });
}

// 프로파일 관리 함수들
function getProfiles() {
  const saved = localStorage.getItem("myInfo_profiles");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      Logger.error("Error loading profiles:", e);
      return [];
    }
  }
  return [];
}

function saveProfiles(profiles) {
  localStorage.setItem("myInfo_profiles", JSON.stringify(profiles));
}

function getCurrentProfileId() {
  const saved = localStorage.getItem("myInfo_currentProfileId");
  return saved || null;
}

function setCurrentProfileId(profileId) {
  if (profileId) {
    localStorage.setItem("myInfo_currentProfileId", profileId);
  } else {
    localStorage.removeItem("myInfo_currentProfileId");
  }
  pageState.currentProfileId = profileId;
}

function createProfile(name) {
  const profiles = getProfiles();
  const profileId = `profile_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  const newProfile = {
    id: profileId,
    name: name || `프로파일 ${profiles.length + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  profiles.push(newProfile);
  saveProfiles(profiles);
  return newProfile;
}

function updateProfile(profileId, updates) {
  const profiles = getProfiles();
  const profile = profiles.find((p) => p.id === profileId);
  if (profile) {
    Object.assign(profile, updates);
    profile.updatedAt = new Date().toISOString();
    saveProfiles(profiles);
    return profile;
  }
  return null;
}

function deleteProfile(profileId) {
  const profiles = getProfiles();
  const filtered = profiles.filter((p) => p.id !== profileId);
  saveProfiles(filtered);

  // 프로파일 데이터 삭제
  localStorage.removeItem(`myInfo_profile_${profileId}`);

  // 현재 프로파일이 삭제된 경우 첫 번째 프로파일 선택
  if (pageState.currentProfileId === profileId) {
    if (filtered.length > 0) {
      setCurrentProfileId(filtered[0].id);
      loadProfileData(filtered[0].id);
    } else {
      setCurrentProfileId(null);
      // 기본값으로 초기화
      pageState.userStats = {};
      pageState.bondSpirits = { 수호: [], 탑승: [], 변신: [] };
      pageState.activeSpirits = { 수호: null, 탑승: null, 변신: null };
      pageState.baselineStats = {};
      pageState.baselineKeyStats = {
        tachaeTotal: 0,
        statusEffectResistance: 0,
        statusEffectAccuracy: 0,
      };
      pageState.savedSoulExp = 0;
      pageState.engravingData = { 수호: {}, 탑승: {}, 변신: {} };
      pageState.baselineStatsHash = null;
    }
  }
}

function saveProfileData(profileId) {
  const profileData = {
    userStats: pageState.userStats,
    bondSpirits: pageState.bondSpirits,
    activeSpirits: pageState.activeSpirits,
    baselineStats: pageState.baselineStats,
    baselineKeyStats: pageState.baselineKeyStats,
    savedSoulExp: pageState.savedSoulExp,
    engravingData: pageState.engravingData,
    baselineStatsHash: pageState.baselineStatsHash,
  };
  localStorage.setItem(
    `myInfo_profile_${profileId}`,
    JSON.stringify(profileData)
  );

  // 프로파일 업데이트 시간 갱신
  updateProfile(profileId, { updatedAt: new Date().toISOString() });
}

function loadProfileData(profileId) {
  const saved = localStorage.getItem(`myInfo_profile_${profileId}`);
  if (saved) {
    try {
      const profileData = JSON.parse(saved);
      pageState.userStats = profileData.userStats || {};
      pageState.bondSpirits = profileData.bondSpirits || {
        수호: [],
        탑승: [],
        변신: [],
      };
      pageState.activeSpirits = profileData.activeSpirits || {
        수호: null,
        탑승: null,
        변신: null,
      };
      pageState.baselineStats = profileData.baselineStats || {};
      pageState.baselineKeyStats = profileData.baselineKeyStats || {
        tachaeTotal: 0,
        statusEffectResistance: 0,
        statusEffectAccuracy: 0,
      };
      pageState.savedSoulExp = profileData.savedSoulExp || 0;
      pageState.engravingData = profileData.engravingData || {
        수호: {},
        탑승: {},
        변신: {},
      };
      pageState.baselineStatsHash = profileData.baselineStatsHash || null;

      // 캐시 무효화 (프로파일 전환 시 새로운 데이터로 재계산)
      pageState.lastTotalStatsHash = null;
      pageState.lastTotalStatsCalculation = null;
      pageState.lastSoulExpHash = null;
      pageState.lastSoulExpCalculation = null;

      // 프로파일 로드 시 증감 0으로 초기화 (새로고침과 동일하게 처리)
      pageState.isInitialLoad = true;

      // 데이터 로드 후 UI 업데이트
      if (typeof renderBondSlots === "function") {
        renderBondSlots("수호");
        renderBondSlots("탑승");
        renderBondSlots("변신");
      }
      if (typeof renderActiveSpiritSelect === "function") {
        renderActiveSpiritSelect("수호");
        renderActiveSpiritSelect("탑승");
        renderActiveSpiritSelect("변신");
      }
      if (typeof renderStats === "function") {
        renderStats();
      }
      // 프로파일 로드 시 스탯 업데이트 (증감 0으로 표시)
      // updateTotalStats 완료 후 isInitialLoad를 false로 설정하여 이후 변경사항이 반영되도록 함
      if (typeof updateTotalStats === "function") {
        updateTotalStats()
          .then(() => {
            // 초기 로딩 완료 - 이후 변경사항은 증감으로 표시
            pageState.isInitialLoad = false;
          })
          .catch(() => {
            // 에러 발생 시에도 플래그 해제 (무한 루프 방지)
            pageState.isInitialLoad = false;
          });
      } else {
        pageState.isInitialLoad = false;
      }
      if (typeof updateSoulExp === "function") {
        updateSoulExp();
      }
    } catch (e) {
      Logger.error("Error loading profile data:", e);
    }
  }
}

function loadUserStats() {
  // 프로파일이 있으면 loadProfileData에서 이미 로드됨
  if (pageState.currentProfileId) {
    return;
  }

  // 프로파일이 없으면 기존 방식으로 로드 (하위 호환성)
  const saved = localStorage.getItem("myInfo_userStats");
  if (saved) {
    try {
      pageState.userStats = JSON.parse(saved);
    } catch (e) {
      Logger.error("Error loading user stats:", e);
      pageState.userStats = {};
    }
  }
}

function saveUserStats() {
  // 저장 버튼을 눌러야 저장됨 (자동 저장 제거)
  // 프로파일이 없으면 기존 방식으로 저장 (하위 호환성)
  if (!pageState.currentProfileId) {
    localStorage.setItem(
      "myInfo_userStats",
      JSON.stringify(pageState.userStats)
    );
  }
}

function loadSavedData() {
  // 현재 프로파일 ID 로드
  const currentProfileId = getCurrentProfileId();
  pageState.currentProfileId = currentProfileId;

  if (currentProfileId) {
    // 프로파일 데이터 로드
    loadProfileData(currentProfileId);
  } else {
    // 프로파일이 없으면 기존 방식으로 로드 (하위 호환성)
    const savedBond = localStorage.getItem("myInfo_bondSpirits");
    if (savedBond) {
      try {
        pageState.bondSpirits = JSON.parse(savedBond);
      } catch (e) {
        Logger.error("Error loading bond spirits:", e);
      }
    }

    const savedActive = localStorage.getItem("myInfo_activeSpirits");
    if (savedActive) {
      try {
        pageState.activeSpirits = JSON.parse(savedActive);
      } catch (e) {
        Logger.error("Error loading active spirits:", e);
      }
    }

    const savedBaseline = localStorage.getItem("myInfo_baselineStats");
    if (savedBaseline) {
      try {
        pageState.baselineStats = JSON.parse(savedBaseline);
      } catch (e) {
        Logger.error("Error loading baseline stats:", e);
      }
    }

    const savedSoulExp = localStorage.getItem("myInfo_savedSoulExp");
    if (savedSoulExp) {
      try {
        pageState.savedSoulExp = parseInt(savedSoulExp, 10) || 0;
      } catch (e) {
        Logger.error("Error loading saved soul exp:", e);
      }
    }

    const savedEngraving = localStorage.getItem("myInfo_engravingData");
    if (savedEngraving) {
      try {
        pageState.engravingData = JSON.parse(savedEngraving);
      } catch (e) {
        Logger.error("Error loading engraving data:", e);
        pageState.engravingData = { 수호: {}, 탑승: {}, 변신: {} };
      }
    }

    const savedBaselineKeyStats = localStorage.getItem(
      "myInfo_baselineKeyStats"
    );
    if (savedBaselineKeyStats) {
      try {
        pageState.baselineKeyStats = JSON.parse(savedBaselineKeyStats);
      } catch (e) {
        Logger.error("Error loading baseline key stats:", e);
      }
    }

    const savedBaselineStatsHash = localStorage.getItem(
      "myInfo_baselineStatsHash"
    );
    if (savedBaselineStatsHash) {
      pageState.baselineStatsHash = savedBaselineStatsHash;
    }
  }
}

function saveData() {
  if (pageState.currentProfileId) {
    // 프로파일이 있으면 프로파일 데이터로 저장 (userStats 포함)
    saveProfileData(pageState.currentProfileId);
  } else {
    // 프로파일이 없으면 기존 방식으로 저장 (하위 호환성)
    localStorage.setItem(
      "myInfo_bondSpirits",
      JSON.stringify(pageState.bondSpirits)
    );
    localStorage.setItem(
      "myInfo_activeSpirits",
      JSON.stringify(pageState.activeSpirits)
    );
    localStorage.setItem(
      "myInfo_baselineStats",
      JSON.stringify(pageState.baselineStats)
    );
    localStorage.setItem(
      "myInfo_baselineKeyStats",
      JSON.stringify(pageState.baselineKeyStats)
    );
    localStorage.setItem(
      "myInfo_savedSoulExp",
      pageState.savedSoulExp.toString()
    );
    localStorage.setItem(
      "myInfo_engravingData",
      JSON.stringify(pageState.engravingData)
    );
    if (pageState.baselineStatsHash) {
      localStorage.setItem(
        "myInfo_baselineStatsHash",
        pageState.baselineStatsHash
      );
    }
    // userStats는 saveUserStats에서 별도로 저장됨
  }
}

function renderBondSlots(category) {
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
      img.src = spirit.image;
      img.alt = spirit.name;
      img.onerror = () => {
        pageState.imageLoadErrors.add(spirit.image);
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

      // x 버튼 제거 (팝업에서 제거 가능)
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
        setCategoryForSelection(category);
      } else {
        // 결속 환수 이미지 클릭 시 레벨 수정 팝업 표시
        showSpiritLevelPopup(category, i, slot, e);
      }
    });

    container.appendChild(slot);
  }
}

function renderActiveSpiritSelect(category) {
  // 드롭다운이 제거되었으므로 이 함수는 더 이상 필요 없음
  // 하지만 호출되는 곳이 있을 수 있으므로 빈 함수로 유지
}

function getSpiritsForCategory(category) {
  const allCreatures = Array.isArray(globalState.allSpirits)
    ? globalState.allSpirits
    : [];
  return allCreatures.filter((s) => s.type === category);
}

function renderSpiritList() {
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

function setCategoryForSelection(category) {
  pageState.currentCategory = category;
  elements.spiritTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.category === category);
  });
  renderSpiritList();
}

function handleSpiritSelect(spirit) {
  if (!spirit) return;

  const category = pageState.currentCategory;
  const bondSpirits = pageState.bondSpirits[category] || [];

  // 이미 결속에 포함되어 있는지 확인
  const existingIndex = bondSpirits.findIndex((s) => s.name === spirit.name);

  if (existingIndex !== -1) {
    // 이미 있으면 제거
    bondSpirits.splice(existingIndex, 1);
    pageState.bondSpirits[category] = bondSpirits;

    // 초기 로딩 플래그 해제 (사용자가 환수를 제거했으므로 증감 표시)
    pageState.isInitialLoad = false;

    // 저장 버튼을 눌러야 저장됨 (자동 저장 제거)

    renderBondSlots(category);
    renderSpiritList();

    // 캐시 무효화
    pageState.lastTotalStatsHash = null;
    pageState.lastTotalStatsCalculation = null;
    pageState.lastSoulExpHash = null;
    pageState.lastSoulExpCalculation = null;

    // 디바운스된 업데이트
    debouncedUpdateTotalStats();
    debouncedUpdateSoulExp();
  } else {
    // 없으면 추가 (최대 6개)
    if (bondSpirits.length < 6) {
      bondSpirits.push({
        ...spirit,
        level: 25, // 기본값 25
      });
      pageState.bondSpirits[category] = bondSpirits;

      // 초기 로딩 플래그 해제 (사용자가 환수를 추가했으므로 증감 표시)
      pageState.isInitialLoad = false;

      // 저장 버튼을 눌러야 저장됨 (자동 저장 제거)

      // 새로 추가된 슬롯 인덱스
      const newIndex = bondSpirits.length - 1;

      // 슬롯 렌더링
      renderBondSlots(category);

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

      renderSpiritList();

      // 캐시 무효화
      pageState.lastTotalStatsHash = null;
      pageState.lastSoulExpHash = null;

      // 디바운스된 업데이트
      debouncedUpdateTotalStats();
      debouncedUpdateSoulExp();
    } else {
      alert("결속 슬롯은 최대 6개까지 선택할 수 있습니다.");
      return;
    }
  }
}

let currentPopup = null;
let currentPopupOverlay = null;

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

function showSpiritLevelPopup(category, index, slot, event) {
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
          <img src="${spirit.image}" alt="${spirit.name}">
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
            startPopupLongPress();
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

      renderBondSlots(category);
      updatePopupActiveState(popup, category, spirit);

      // 초기 로딩 플래그 해제 (사용자가 레벨을 변경했으므로 증감 표시)
      pageState.isInitialLoad = false;

      // 캐시 무효화 (레벨 변경 시 재계산 필요)
      pageState.lastTotalStatsHash = null;
      pageState.lastTotalStatsCalculation = null;
      pageState.lastSoulExpHash = null;
      pageState.lastSoulExpCalculation = null;

      // 디바운싱된 업데이트 호출
      debouncedUpdateTotalStats();
      debouncedUpdateSoulExp();
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

            // 저장 버튼을 눌러야 저장됨 (자동 저장 제거)

            renderBondSlots(popupLongPressState.category);
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
            debouncedUpdateTotalStats();
            debouncedUpdateSoulExp();
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
          renderBondSlots(popupLongPressState.category);
          updatePopupActiveState(
            popup,
            popupLongPressState.category,
            currentSpirit
          );

          // 캐시 무효화
          pageState.lastTotalStatsHash = null;
          pageState.lastSoulExpHash = null;
          debouncedUpdateTotalStats();
          debouncedUpdateSoulExp();
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

    console.log(`[사용중 환수 변경] 카테고리: ${category}`);
    console.log(`  이전 사용중:`, previousActive);
    console.log(`  현재 클릭한 환수:`, spirit.name);

    if (active && active.name === spirit.name) {
      // 같은 환수를 다시 클릭하면 사용중 해제
      pageState.activeSpirits[category] = null;
      console.log(`  → 사용중 해제`);
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
      console.log(`  → 새 사용중:`, pageState.activeSpirits[category]);
      setActiveBtn.textContent = "사용중";
      setActiveBtn.classList.add("active");
      setActiveBtn.textContent = "사용중";
      setActiveBtn.classList.add("active");
      console.log(
        `  → 각인 데이터:`,
        pageState.engravingData[category]?.[spirit.name]
      );
      console.log(`  → 각인 데이터 확인:`, {
        category,
        spiritName: spirit.name,
        engravingData: pageState.engravingData[category],
        targetEngraving: pageState.engravingData[category]?.[spirit.name],
      });
    }

    // 초기 로딩 플래그 해제 (사용자가 사용중 환수를 변경했으므로 증감 표시)
    pageState.isInitialLoad = false;

    // 저장 버튼을 눌러야 저장됨 (자동 저장 제거)

    renderBondSlots(category);
    updatePopupActiveState(popup, category, spirit);

    // 캐시 무효화 및 즉시 업데이트 (사용중 환수 변경 시 각인 등록효과가 즉시 반영되어야 함)
    pageState.lastTotalStatsHash = null;
    pageState.lastTotalStatsCalculation = null;
    pageState.lastSoulExpHash = null;
    pageState.lastSoulExpCalculation = null;
    updateTotalStats();
    updateSoulExp();
  });

  const removeBtn = popup.querySelector("[data-action='remove']");
  removeBtn.addEventListener("click", () => {
    stopPopupLongPress();
    removeBondSpirit(category, index);
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

  // 등록효과와 장착효과 데이터 가져오기
  function getEngravingData() {
    const currentEngraving =
      pageState.engravingData[category]?.[spirit.name] || {};

    let registrationItems = [];
    let bindStats = {};

    if (
      currentEngraving.registration !== undefined ||
      currentEngraving.bind !== undefined
    ) {
      registrationItems = Array.isArray(currentEngraving.registration)
        ? currentEngraving.registration
        : [];
      bindStats = currentEngraving.bind || {};
    } else if (Object.keys(currentEngraving).length > 0) {
      Object.entries(currentEngraving).forEach(([statKey, engravingData]) => {
        if (typeof engravingData === "object" && engravingData !== null) {
          if (engravingData.registration !== undefined) {
            registrationItems.push({
              statKey: statKey,
              value: engravingData.registration,
            });
          }
          if (engravingData.bind !== undefined) {
            bindStats[statKey] = engravingData.bind;
          }
        } else {
          registrationItems.push({
            statKey: statKey,
            value: engravingData,
          });
        }
      });
    }

    return { registrationItems, bindStats };
  }

  // 등록효과 탭 렌더링
  function renderRegistrationTab() {
    if (!registrationContainer) return;
    registrationContainer.innerHTML = "";
    const { registrationItems } = getEngravingData();

    registrationItems.forEach((regItem, index) => {
      const statKey = regItem.statKey || "";
      const value = regItem.value || "";
      const item = createEngravingItem(
        statKey,
        value,
        "",
        "registration",
        index
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

    const { bindStats } = getEngravingData();

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

  // 각인 항목 생성 (showEngravingModal의 함수 재사용)
  function createEngravingItem(
    statKey = "",
    registrationValue = "",
    bindValue = "",
    type = "registration",
    registrationIndex = null
  ) {
    const item = createElement("div", "my-info-engraving-item");
    item.dataset.type = type;
    if (registrationIndex !== null) {
      item.dataset.registrationIndex = registrationIndex;
    }

    const statSelect = createElement("select", "my-info-engraving-stat-select");
    statSelect.innerHTML = '<option value="">스탯 선택</option>';
    const statsList =
      type === "registration" ? ENGRAVING_REGISTRATION_STATS : STATS_CONFIG;
    statsList.forEach((stat) => {
      const option = createElement("option");
      option.value = stat.key;
      option.textContent = stat.name;
      if (stat.key === statKey) {
        option.selected = true;
      }
      statSelect.appendChild(option);
    });

    if (type === "registration") {
      const registrationLabel = createElement(
        "span",
        "my-info-engraving-value-label"
      );
      registrationLabel.textContent = "등록:";
      const registrationInput = createElement(
        "input",
        "my-info-engraving-value-input"
      );
      registrationInput.type = "number";
      registrationInput.min = "0";
      registrationInput.value = registrationValue;
      registrationInput.placeholder = "등록";

      statSelect.addEventListener("change", () => {
        renderBindTab();
      });

      item.appendChild(statSelect);
      item.appendChild(registrationLabel);
      item.appendChild(registrationInput);
    } else {
      const statName =
        STATS_CONFIG.find((s) => s.key === statKey)?.name || statKey;
      const statLabel = createElement("span", "my-info-engraving-value-label");
      statLabel.textContent = statName;
      statLabel.style.fontWeight = "600";
      statLabel.style.minWidth = "100px";

      item.dataset.statKey = statKey;

      const bindLabel = createElement("span", "my-info-engraving-value-label");
      bindLabel.textContent = "합산:";
      const bindInput = createElement("input", "my-info-engraving-value-input");
      bindInput.type = "number";
      bindInput.min = "0";
      bindInput.value = bindValue;
      bindInput.placeholder = "합산값";

      item.appendChild(statLabel);
      item.appendChild(bindLabel);
      item.appendChild(bindInput);
    }

    if (type === "registration") {
      const removeBtn = createElement("button", "my-info-engraving-remove-btn");
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", () => {
        item.remove();
        if (addBtn) {
          const newCount = registrationContainer.querySelectorAll(
            '.my-info-engraving-item[data-type="registration"]'
          ).length;
          addBtn.disabled = newCount >= 4;
          addBtn.textContent = `+ 등록효과 추가 (${newCount}/4)`;
        }
        renderBindTab();
      });
      item.appendChild(removeBtn);
    }

    return item;
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
      const item = createEngravingItem("", "", "", "registration");
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
      pageState.engravingData[category][spirit.name] = engravingData;

      pageState.isInitialLoad = false;

      updateTotalStats();
      renderBondSlots(category);
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
      pageState.engravingData[category][spirit.name] = engravingData;

      pageState.isInitialLoad = false;

      updateTotalStats();
      renderBondSlots(category);
    });
  }
}

// 각인 설정 모달 표시
function showEngravingModal(category, spiritName, spirit) {
  // 기존 모달 제거
  const existingModal = document.querySelector(".my-info-engraving-modal");
  if (existingModal) {
    existingModal.remove();
  }

  // 현재 각인 데이터 가져오기
  const currentEngraving =
    pageState.engravingData[category]?.[spiritName] || {};

  // 등록효과 개수 확인 (새 데이터 구조)
  const registrationCount = Array.isArray(currentEngraving.registration)
    ? currentEngraving.registration.length
    : 0;

  // 모달 생성
  const modal = createElement("div", "my-info-engraving-modal");
  modal.innerHTML = `
    <div class="kakao-ad-engraving-container">
      <ins class="kakao_ad_area" style="display:none;"
          data-ad-unit="DAN-kZBVsx56qwzvnaxx"
          data-ad-width="728"
          data-ad-height="90"></ins>
    </div>
    <div class="my-info-engraving-modal-content">
      <div class="my-info-engraving-modal-header">
        <div class="my-info-engraving-modal-title">${spiritName} 각인 설정</div>
        <button class="my-info-engraving-modal-close">×</button>
      </div>
      <div class="my-info-engraving-tabs">
        <button class="my-info-engraving-tab active" data-tab="registration">등록효과</button>
        <button class="my-info-engraving-tab" data-tab="bind">장착효과</button>
      </div>
      <div class="my-info-engraving-tab-content active" id="registrationTab">
        <div id="registrationItemsContainer"></div>
        <button class="my-info-engraving-add-btn" id="addEngravingBtn" ${
          registrationCount >= 4 ? "disabled" : ""
        }>
          + 등록효과 추가 (${registrationCount}/4)
        </button>
      </div>
      <div class="my-info-engraving-tab-content" id="bindTab">
        <div id="bindItemsContainer"></div>
      </div>
      <button class="my-info-engraving-save-btn" id="saveEngravingBtn">저장</button>
    </div>
  `;

  document.body.appendChild(modal);

  // 광고 렌더링
  setTimeout(() => {
    try {
      const adElement = modal.querySelector(
        ".kakao-ad-engraving-container .kakao_ad_area"
      );
      if (
        adElement &&
        window.adfit &&
        typeof window.adfit.render === "function"
      ) {
        adElement.style.display = "block";
        window.adfit.render(adElement);
      }
    } catch (error) {
      Logger.error(
        "Kakao AdFit: Error rendering ad in engraving modal:",
        error
      );
    }
  }, 100);

  const registrationContainer = modal.querySelector(
    "#registrationItemsContainer"
  );
  const bindContainer = modal.querySelector("#bindItemsContainer");
  const addBtn = modal.querySelector("#addEngravingBtn");
  const saveBtn = modal.querySelector("#saveEngravingBtn");
  const closeBtn = modal.querySelector(".my-info-engraving-modal-close");
  const tabs = modal.querySelectorAll(".my-info-engraving-tab");
  const tabContents = modal.querySelectorAll(".my-info-engraving-tab-content");

  // 등록효과와 장착효과 데이터 가져오기
  function getEngravingData() {
    const currentEngraving =
      pageState.engravingData[category]?.[spiritName] || {};

    // 기존 데이터 구조 호환성 처리
    let registrationItems = [];
    let bindStats = {};

    // 새로운 데이터 구조 확인 (registration 또는 bind 속성이 있으면)
    if (
      currentEngraving.registration !== undefined ||
      currentEngraving.bind !== undefined
    ) {
      // 새로운 데이터 구조
      registrationItems = Array.isArray(currentEngraving.registration)
        ? currentEngraving.registration
        : [];
      bindStats = currentEngraving.bind || {};
    } else if (Object.keys(currentEngraving).length > 0) {
      // 기존 데이터 구조 변환 (빈 객체가 아닌 경우만)
      Object.entries(currentEngraving).forEach(([statKey, engravingData]) => {
        if (typeof engravingData === "object" && engravingData !== null) {
          // { registration: value, bind: value } 형태
          if (engravingData.registration !== undefined) {
            registrationItems.push({
              statKey: statKey,
              value: engravingData.registration,
            });
          }
          if (engravingData.bind !== undefined) {
            bindStats[statKey] = engravingData.bind;
          }
        } else {
          // 단일 값 형태 (등록효과로 간주)
          registrationItems.push({
            statKey: statKey,
            value: engravingData,
          });
        }
      });
    }

    return { registrationItems, bindStats };
  }

  // 등록효과 탭 렌더링
  function renderRegistrationTab() {
    registrationContainer.innerHTML = "";
    const { registrationItems } = getEngravingData();

    // 등록효과 항목 렌더링 (각 항목을 개별적으로 표시)
    registrationItems.forEach((regItem, index) => {
      const statKey = regItem.statKey || "";
      const value = regItem.value || "";
      const item = createEngravingItem(
        statKey,
        value,
        "",
        "registration",
        index
      );
      registrationContainer.appendChild(item);
    });

    // 추가 버튼 상태 업데이트
    if (addBtn) {
      const registrationCount = registrationItems.length;
      addBtn.disabled = registrationCount >= 4;
      addBtn.textContent = `+ 등록효과 추가 (${registrationCount}/4)`;
    }
  }

  // 장착효과 탭 렌더링 (등록효과에 있는 고유한 스탯만 표시)
  function renderBindTab() {
    bindContainer.innerHTML = "";

    // 등록효과 컨테이너에서 현재 입력된 값들을 가져옴
    const registrationItemsElements = registrationContainer.querySelectorAll(
      '.my-info-engraving-item[data-type="registration"]'
    );

    // 등록효과에서 고유한 스탯 추출 (스탯이 선택된 경우 모두 포함)
    const uniqueStats = new Set();
    registrationItemsElements.forEach((item) => {
      const statSelect = item.querySelector(".my-info-engraving-stat-select");
      const statKey = statSelect?.value || "";

      // 스탯이 선택된 경우 모두 포함 (값은 나중에 입력 가능)
      if (statKey) {
        uniqueStats.add(statKey);
      }
    });

    // 저장된 장착효과 데이터 가져오기
    const { bindStats } = getEngravingData();

    // 고유한 스탯별로 장착효과 항목 생성
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

  // 각인 항목 생성
  function createEngravingItem(
    statKey = "",
    registrationValue = "",
    bindValue = "",
    type = "registration", // "registration" 또는 "bind"
    registrationIndex = null // 등록효과 항목의 인덱스
  ) {
    const item = createElement("div", "my-info-engraving-item");
    item.dataset.type = type;
    if (registrationIndex !== null) {
      item.dataset.registrationIndex = registrationIndex;
    }

    // 스탯 선택 드롭다운
    const statSelect = createElement("select", "my-info-engraving-stat-select");
    statSelect.innerHTML = '<option value="">스탯 선택</option>';
    const statsList =
      type === "registration" ? ENGRAVING_REGISTRATION_STATS : STATS_CONFIG;
    statsList.forEach((stat) => {
      const option = createElement("option");
      option.value = stat.key;
      option.textContent = stat.name;
      if (stat.key === statKey) {
        option.selected = true;
      }
      statSelect.appendChild(option);
    });

    if (type === "registration") {
      // 등록효과: 개별 항목
      const registrationLabel = createElement(
        "span",
        "my-info-engraving-value-label"
      );
      registrationLabel.textContent = "등록:";
      const registrationInput = createElement(
        "input",
        "my-info-engraving-value-input"
      );
      registrationInput.type = "number";
      registrationInput.min = "0";
      registrationInput.value = registrationValue;
      registrationInput.placeholder = "등록";

      // 스탯 선택 변경 시 장착효과 탭 업데이트
      statSelect.addEventListener("change", () => {
        renderBindTab();
      });

      item.appendChild(statSelect);
      item.appendChild(registrationLabel);
      item.appendChild(registrationInput);
    } else {
      // 장착효과: 합산값 (스탯은 고정)
      const statName =
        STATS_CONFIG.find((s) => s.key === statKey)?.name || statKey;
      const statLabel = createElement("span", "my-info-engraving-value-label");
      statLabel.textContent = statName;
      statLabel.style.fontWeight = "600";
      statLabel.style.minWidth = "100px";

      // statKey를 data 속성에 저장
      item.dataset.statKey = statKey;

      const bindLabel = createElement("span", "my-info-engraving-value-label");
      bindLabel.textContent = "합산:";
      const bindInput = createElement("input", "my-info-engraving-value-input");
      bindInput.type = "number";
      bindInput.min = "0";
      bindInput.value = bindValue;
      bindInput.placeholder = "합산값";

      item.appendChild(statLabel);
      item.appendChild(bindLabel);
      item.appendChild(bindInput);
    }

    // 제거 버튼 (등록효과에만 표시)
    if (type === "registration") {
      const removeBtn = createElement("button", "my-info-engraving-remove-btn");
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", () => {
        item.remove();
        // 제거 후 버튼 상태만 업데이트 (렌더링은 하지 않음)
        if (addBtn) {
          const newCount = registrationContainer.querySelectorAll(
            '.my-info-engraving-item[data-type="registration"]'
          ).length;
          addBtn.disabled = newCount >= 4;
          addBtn.textContent = `+ 등록효과 추가 (${newCount}/4)`;
        }
        // 장착효과 탭 업데이트 (등록효과 변경 반영)
        renderBindTab();
      });
      item.appendChild(removeBtn);
    }

    return item;
  }

  // 탭 전환 기능
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab;

      // 탭 활성화
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // 탭 컨텐츠 표시
      tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === `${targetTab}Tab`) {
          content.classList.add("active");
        }
      });
    });
  });

  // 초기 렌더링
  renderEngravingItems();

  // 각인 추가 버튼 (등록효과만 추가)
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      // 현재 등록효과 항목 수 확인
      const currentRegistrationItems = registrationContainer.querySelectorAll(
        '.my-info-engraving-item[data-type="registration"]'
      );
      if (currentRegistrationItems.length >= 4) {
        return;
      }
      const item = createEngravingItem("", "", "", "registration");
      registrationContainer.appendChild(item);
      // 등록효과 변경 시 장착효과 탭도 업데이트
      renderBindTab();
      // 버튼 상태만 업데이트
      if (addBtn) {
        const newCount = registrationContainer.querySelectorAll(
          '.my-info-engraving-item[data-type="registration"]'
        ).length;
        addBtn.disabled = newCount >= 4;
        addBtn.textContent = `+ 등록효과 추가 (${newCount}/4)`;
      }
    });
  }

  // 저장 버튼
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const registrationItems = []; // 등록효과 배열
      const bindStats = {}; // 장착효과 객체 (스탯별 합산값)

      // 등록효과 항목 수집
      const registrationItemsElements = registrationContainer.querySelectorAll(
        '.my-info-engraving-item[data-type="registration"]'
      );
      registrationItemsElements.forEach((item) => {
        const statSelect = item.querySelector(".my-info-engraving-stat-select");
        const valueInput = item.querySelector(".my-info-engraving-value-input");
        const statKey = statSelect.value;
        const value = parseFloat(valueInput.value) || 0;

        // 스탯이 선택된 경우 값이 0이어도 저장 (나중에 입력할 수 있도록)
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
        // statKey를 data 속성에서 가져옴
        const statKey = item.dataset.statKey;
        if (!statKey) return;

        const valueInput = item.querySelector(".my-info-engraving-value-input");
        const value = parseFloat(valueInput.value) || 0;

        // 값이 0이어도 저장 (나중에 입력할 수 있도록)
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
      pageState.engravingData[category][spiritName] = engravingData;

      // 초기 로딩 플래그 해제 (사용자가 각인을 변경했으므로 증감 표시)
      pageState.isInitialLoad = false;

      // 저장 버튼을 눌러야 저장됨 (자동 저장 제거)

      // 스탯 업데이트
      updateTotalStats();

      // 모달 닫기
      modal.remove();
    });
  }

  // 닫기 버튼
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.remove();
    });
  }

  // 외부 클릭 시 닫기
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function updatePopupActiveState(popup, category, spirit) {
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

function startPopupLongPress() {
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
  createPopupHint();

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
      renderBondSlots(popupLongPressState.category);
      updatePopupActiveState(
        currentPopup,
        popupLongPressState.category,
        currentSpirit
      );

      // 초기 로딩 플래그 해제 (사용자가 레벨을 변경했으므로 증감 표시)
      pageState.isInitialLoad = false;

      // 캐시 무효화 (레벨 변경 시 재계산 필요)
      pageState.lastTotalStatsHash = null;
      pageState.lastTotalStatsCalculation = null;
      pageState.lastSoulExpHash = null;
      pageState.lastSoulExpCalculation = null;

      // 디바운싱된 업데이트 호출
      debouncedUpdateTotalStats();
      debouncedUpdateSoulExp();

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

function stopPopupLongPress() {
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

function createPopupHint() {
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

          renderBondSlots(popupLongPressState.category);
          updatePopupActiveState(
            currentPopup,
            popupLongPressState.category,
            popupLongPressState.spirit
          );

          // 캐시 무효화
          pageState.lastTotalStatsHash = null;
          pageState.lastSoulExpHash = null;
          debouncedUpdateTotalStats();
          debouncedUpdateSoulExp();
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

function updateStatItems() {
  // 캐시된 계산 결과가 없으면 재계산
  if (!pageState.lastTotalStatsHash) {
    debouncedUpdateTotalStats();
    return;
  }

  // 캐시된 값으로 스탯 아이템만 업데이트
  // 실제 계산은 updateTotalStats에서 수행되므로 여기서는 스킵
  // 대신 updateTotalStats가 호출되도록 함
  debouncedUpdateTotalStats();
}

function updateStatItemsWithValues(
  allStats,
  allTotalStats, // 새로운 전체 스탯 변수 (allBondStats 대신)
  allActiveStats, // 사용하지 않지만 호환성을 위해 유지
  forceZeroChange = false
) {
  if (!elements.container) {
    return;
  }

  allStats.forEach((stat) => {
    // 나의 스탯은 전체 모든 점수를 합산한 스탯 (userStats + allTotalStats)
    const baseValue = pageState.userStats[stat.key] || 0;
    const totalStatsValue = allTotalStats[stat.key] || 0;
    // 모든 수치는 정수이므로 반올림
    const calculatedTotalValue = Math.round(baseValue + totalStatsValue);

    // 기준값과 비교
    const baselineValue = pageState.baselineStats.hasOwnProperty(stat.key)
      ? pageState.baselineStats[stat.key]
      : calculatedTotalValue; // 기준값이 없으면 현재 값을 기준으로 설정하여 증감 0 표시

    // 초기 로딩 시 저장된 값이 있으면 저장된 값을 표시, 아니면 계산된 값 표시
    const hasBaseline = pageState.baselineStats.hasOwnProperty(stat.key);
    const displayValue =
      pageState.isInitialLoad && hasBaseline
        ? baselineValue
        : calculatedTotalValue;

    // forceZeroChange가 true이면 changeValue를 강제로 0으로 설정
    // 모든 수치는 정수이므로 소수점 처리 없이 반올림
    let changeValue = forceZeroChange
      ? 0
      : Math.round(calculatedTotalValue - baselineValue);

    // 디버깅: 상태이상저항, 상태이상적중, 경험치획득증가만 로그 출력
    if (
      !forceZeroChange &&
      (stat.key === "statusEffectResistance" ||
        stat.key === "statusEffectAccuracy" ||
        stat.key === "experienceGainIncrease")
    ) {
      console.log(`[스탯 증감] ${stat.name}:`, {
        statKey: stat.key,
        baseValue,
        totalStatsValue,
        calculatedTotalValue,
        baselineValue,
        changeValue,
        hasBaseline,
        isInitialLoad: pageState.isInitialLoad,
        activeSpirits: Object.entries(pageState.activeSpirits)
          .map(([cat, active]) =>
            active ? `${cat}: ${active.name} Lv${active.level}` : null
          )
          .filter(Boolean),
      });
    }

    // 해당 스탯 아이템 찾기
    const statItem = elements.container.querySelector(
      `[data-stat="${stat.key}"]`
    );
    if (!statItem) {
      return;
    }

    const valueContainer = statItem.querySelector(".my-info-stat-value");
    const baseValueSpan = statItem.querySelector(".my-info-stat-base");
    const totalValueSpan = statItem.querySelector(".my-info-stat-total");
    const changeValueSpan = statItem.querySelector(".my-info-stat-change");

    if (!valueContainer || !totalValueSpan || !changeValueSpan) {
      return;
    }

    // 편집 중인 경우 업데이트하지 않음
    if (statItem.classList.contains("editing")) {
      return;
    }

    // 방금 편집이 완료된 스탯은 업데이트하지 않음
    if (
      pageState.recentlyEditedStats &&
      pageState.recentlyEditedStats.has(stat.key)
    ) {
      return;
    }

    // finishEdit에서 방금 설정한 값이 있는지 확인 (데이터 속성으로 확인)
    const lastEditedValue = totalValueSpan.dataset.lastEditedValue;
    const lastEditedTime = totalValueSpan.dataset.lastEditedTime
      ? parseInt(totalValueSpan.dataset.lastEditedTime, 10)
      : 0;
    const isManuallyEdited = totalValueSpan.dataset.isManuallyEdited === "true";

    // 수동 편집 플래그가 있으면, 방금 편집한 경우(1초 이내)에만 업데이트하지 않음
    // 1초가 지나면 정상적으로 업데이트되도록 허용
    if (isManuallyEdited && lastEditedTime) {
      const timeSinceEdit = Date.now() - lastEditedTime;
      if (timeSinceEdit < 1000) {
        // 1초 이내에 편집한 경우에만 보호
        return;
      }
      // 1초가 지났으면 플래그 제거하여 정상 업데이트 허용
      delete totalValueSpan.dataset.isManuallyEdited;
      delete totalValueSpan.dataset.lastEditedValue;
      delete totalValueSpan.dataset.lastEditedTime;
    }

    // 합산값을 메인으로 표시 (저장된 값 또는 계산된 값)
    const formattedTotalValue = Math.round(displayValue).toLocaleString();
    totalValueSpan.textContent = formattedTotalValue;
    totalValueSpan.style.display = "inline";
    totalValueSpan.style.visibility = "visible";

    // 증감 표시 (소수점 제거, 괄호 안에)
    const absChangeValue = Math.abs(changeValue);
    if (absChangeValue > 0.01) {
      const roundedChange = Math.round(changeValue);
      changeValueSpan.textContent = `(${
        roundedChange > 0 ? "+" : ""
      }${roundedChange.toLocaleString()})`;
      changeValueSpan.className = `my-info-stat-change ${
        changeValue > 0 ? "positive" : "negative"
      }`;
      changeValueSpan.style.display = "inline";
      changeValueSpan.style.visibility = "visible";
      // 인라인 스타일 제거 (CSS 클래스가 적용되도록)
      changeValueSpan.style.color = "";
      changeValueSpan.style.background = "";
    } else {
      // changeValue가 0이면 "(0)"으로 표시
      changeValueSpan.textContent = "(0)";
      changeValueSpan.className = "my-info-stat-change neutral";
      changeValueSpan.style.display = "inline";
      changeValueSpan.style.visibility = "visible";
      // 인라인 스타일 제거 (CSS 클래스가 적용되도록)
      changeValueSpan.style.color = "";
      changeValueSpan.style.background = "";
    }
  });

  // 주요 스탯 변화 업데이트
  updateKeyStats(allStats, allTotalStats, {});
}

function updateKeyStats(
  allStats,
  allTotalStats,
  allActiveStats,
  forceZeroChange = false
) {
  // 환산타채 합 계산: 피해저항관통 + 피해저항 + (대인피해% × 10) + (대인방어% × 10)
  // 항상 계산된 값 사용 (저장 시와 동일한 방식)
  const getTotalValue = (key) => {
    // 저장 시와 동일한 방식으로 계산: userStats + allTotalStats (정수로 반올림)
    const baseValue = pageState.userStats[key] || 0;
    const totalStatsValue = allTotalStats[key] || 0;
    return Math.round(baseValue + totalStatsValue);
  };

  const damageResistancePenetration = getTotalValue(
    "damageResistancePenetration"
  );
  const damageResistance = getTotalValue("damageResistance");
  const pvpDamagePercent = getTotalValue("pvpDamagePercent");
  const pvpDefensePercent = getTotalValue("pvpDefensePercent");
  // 환산타채 합 계산: 모든 계산 결과를 정수로 반올림
  // pvpDamagePercent * 10 계산 전에 먼저 정수화
  const tachaeTotal = Math.round(
    damageResistancePenetration +
      damageResistance +
      Math.round(Math.round(pvpDamagePercent) * 10) +
      Math.round(Math.round(pvpDefensePercent) * 10)
  );

  // 기준값 가져오기 (저장된 baselineStats 값 사용)
  const getBaselineValue = (key) => {
    // 저장된 값이 있으면 사용, 없으면 0
    return pageState.baselineStats.hasOwnProperty(key)
      ? pageState.baselineStats[key]
      : 0;
  };

  const baselineDamageResistancePenetration = getBaselineValue(
    "damageResistancePenetration"
  );
  const baselineDamageResistance = getBaselineValue("damageResistance");
  const baselinePvpDamagePercent = getBaselineValue("pvpDamagePercent");
  const baselinePvpDefensePercent = getBaselineValue("pvpDefensePercent");
  // 환산타채 합 기준값: 저장된 값이 있으면 사용, 없으면 개별 스탯으로 계산
  let baselineTachaeTotal = 0;
  if (
    pageState.baselineKeyStats.tachaeTotal !== undefined &&
    pageState.baselineKeyStats.tachaeTotal !== null
  ) {
    // 저장된 값이 있으면 사용
    baselineTachaeTotal = pageState.baselineKeyStats.tachaeTotal;
  } else {
    // 저장된 값이 없으면 개별 스탯으로 계산 (하위 호환성, 정수로 반올림)
    // pvpDamagePercent * 10 계산 전에 먼저 정수화
    baselineTachaeTotal = Math.round(
      baselineDamageResistancePenetration +
        baselineDamageResistance +
        Math.round(Math.round(baselinePvpDamagePercent) * 10) +
        Math.round(Math.round(baselinePvpDefensePercent) * 10)
    );
  }

  // 각인 등록효과 계산 (모든 카테고리의 사용 중인 환수)
  const registrationStats = {};
  const categories = ["수호", "탑승", "변신"];
  categories.forEach((category) => {
    const active = pageState.activeSpirits[category];
    if (active) {
      const engraving = pageState.engravingData[category]?.[active.name] || {};
      if (Array.isArray(engraving.registration)) {
        engraving.registration.forEach((regItem) => {
          const statKey = regItem.statKey;
          const value = regItem.value || 0;
          const numValue =
            typeof value === "number" ? value : parseFloat(value) || 0;
          if (numValue > 0 && statKey) {
            registrationStats[statKey] =
              (registrationStats[statKey] || 0) + numValue;
          }
        });
      }
    }
  });

  // 각인 장착효과 계산 (모든 결속 환수 - 사용중 환수는 결속에 포함되어 있으므로 결속 환수만 계산)
  const bindStats = {};
  categories.forEach((category) => {
    // 결속 환수의 각인 장착효과 (모든 슬롯에 배치된 환수)
    const bondSpirits = pageState.bondSpirits[category] || [];
    bondSpirits.forEach((bondSpirit) => {
      const engraving =
        pageState.engravingData[category]?.[bondSpirit.name] || {};
      if (engraving.bind) {
        Object.entries(engraving.bind).forEach(([statKey, value]) => {
          const numValue =
            typeof value === "number" ? value : parseFloat(value) || 0;
          if (numValue > 0) {
            bindStats[statKey] = (bindStats[statKey] || 0) + numValue;
          }
        });
      }
    });
  });

  // 변화값 계산
  // 디버깅: 환산타채 합 계산 값 확인
  if (Math.abs(tachaeTotal - baselineTachaeTotal) > 1000) {
    console.error("[환산타채 합 계산] 이상값 감지:", {
      tachaeTotal,
      baselineTachaeTotal,
      change: tachaeTotal - baselineTachaeTotal,
      damageResistancePenetration,
      damageResistance,
      pvpDamagePercent,
      pvpDefensePercent,
      baselineDamageResistancePenetration,
      baselineDamageResistance,
      baselinePvpDamagePercent,
      baselinePvpDefensePercent,
      savedTachaeTotal: pageState.baselineKeyStats.tachaeTotal,
      baselineStats_pvpDamagePercent: pageState.baselineStats.pvpDamagePercent,
      baselineStats_pvpDefensePercent:
        pageState.baselineStats.pvpDefensePercent,
    });

    // 문제 해결: baselineKeyStats.tachaeTotal이 잘못 저장되었을 수 있으므로 재계산
    // 개별 스탯 기준값으로 재계산 (정수로 반올림)
    // pvpDamagePercent * 10 계산 전에 먼저 정수화
    const recalculatedBaseline = Math.round(
      baselineDamageResistancePenetration +
        baselineDamageResistance +
        Math.round(Math.round(baselinePvpDamagePercent) * 10) +
        Math.round(Math.round(baselinePvpDefensePercent) * 10)
    );

    // 재계산된 값이 더 합리적이면 사용
    if (
      Math.abs(recalculatedBaseline - tachaeTotal) <
      Math.abs(baselineTachaeTotal - tachaeTotal)
    ) {
      console.warn("[환산타채 합 계산] 기준값 재계산:", {
        old: baselineTachaeTotal,
        new: recalculatedBaseline,
      });
      baselineTachaeTotal = recalculatedBaseline;
      // 재계산된 값을 저장 (저장 버튼을 눌러야 실제로 저장됨)
      pageState.baselineKeyStats.tachaeTotal = recalculatedBaseline;
      // saveData() 제거: 저장 버튼을 눌러야 저장됨
    }
  }

  const tachaeChange = forceZeroChange ? 0 : tachaeTotal - baselineTachaeTotal;

  // UI 업데이트
  const tachaeValueEl = elements.container.querySelector("#keyStatTachae");
  const tachaeChangeEl = elements.container.querySelector(
    "#keyStatTachaeChange"
  );
  const registrationListEl = elements.container.querySelector(
    "#keyStatRegistrationList"
  );
  const bindListEl = elements.container.querySelector("#keyStatBindList");

  if (tachaeValueEl) {
    tachaeValueEl.textContent = Math.round(tachaeTotal).toLocaleString();
  }
  if (tachaeChangeEl) {
    if (Math.abs(tachaeChange) > 0.01) {
      tachaeChangeEl.textContent =
        tachaeChange > 0
          ? `+${Math.round(tachaeChange).toLocaleString()}`
          : `${Math.round(tachaeChange).toLocaleString()}`;
      tachaeChangeEl.className = `my-info-key-stat-change ${
        tachaeChange > 0 ? "positive" : "negative"
      }`;
      tachaeChangeEl.style.display = "block";
    } else {
      tachaeChangeEl.textContent = "0";
      tachaeChangeEl.className = "my-info-key-stat-change neutral";
      tachaeChangeEl.style.display = "block";
    }
  }

  // 각인 등록효과 표시
  if (registrationListEl) {
    registrationListEl.innerHTML = "";
    const registrationEntries = Object.entries(registrationStats).sort(
      (a, b) => b[1] - a[1]
    );
    if (registrationEntries.length === 0) {
      registrationListEl.innerHTML =
        '<div style="color: var(--text-secondary); font-size: 9px; padding: 4px;">등록효과 없음</div>';
    } else {
      registrationEntries.forEach(([statKey, value]) => {
        const fullStatName =
          STATS_CONFIG.find((s) => s.key === statKey)?.name || statKey;
        // 모바일에서 간소화된 이름 사용
        const statName =
          isMobile() && MOBILE_STAT_NAME_MAP[fullStatName]
            ? MOBILE_STAT_NAME_MAP[fullStatName]
            : fullStatName;
        const item = createElement("div", "my-info-key-stat-registration-item");
        const nameEl = createElement(
          "span",
          "my-info-key-stat-registration-item-name"
        );
        nameEl.textContent = statName;
        const valueEl = createElement(
          "span",
          "my-info-key-stat-registration-item-value"
        );
        valueEl.textContent = Math.round(value).toLocaleString();
        item.appendChild(nameEl);
        item.appendChild(valueEl);
        registrationListEl.appendChild(item);
      });
    }
  }

  // 각인 장착효과 표시
  if (bindListEl) {
    bindListEl.innerHTML = "";
    const bindEntries = Object.entries(bindStats).sort((a, b) => b[1] - a[1]);
    if (bindEntries.length === 0) {
      bindListEl.innerHTML =
        '<div style="color: var(--text-secondary); font-size: 9px; padding: 4px;">장착효과 없음</div>';
    } else {
      bindEntries.forEach(([statKey, value]) => {
        const fullStatName =
          STATS_CONFIG.find((s) => s.key === statKey)?.name || statKey;
        // 모바일에서 간소화된 이름 사용
        const statName =
          isMobile() && MOBILE_STAT_NAME_MAP[fullStatName]
            ? MOBILE_STAT_NAME_MAP[fullStatName]
            : fullStatName;
        const item = createElement("div", "my-info-key-stat-bind-item");
        const nameEl = createElement("span", "my-info-key-stat-bind-item-name");
        nameEl.textContent = statName;
        const valueEl = createElement(
          "span",
          "my-info-key-stat-bind-item-value"
        );
        valueEl.textContent = Math.round(value).toLocaleString();
        item.appendChild(nameEl);
        item.appendChild(valueEl);
        bindListEl.appendChild(item);
      });
    }
  }
}

function removeBondSpirit(category, index) {
  const bondSpirits = pageState.bondSpirits[category] || [];
  const spirit = bondSpirits[index];

  // 제거되는 환수가 사용 중인 환수인지 확인
  const active = pageState.activeSpirits[category];
  if (active && active.name === spirit.name) {
    pageState.activeSpirits[category] = null;
  }

  bondSpirits.splice(index, 1);
  pageState.bondSpirits[category] = bondSpirits;

  // 저장 버튼을 눌러야 저장됨 (자동 저장 제거)

  renderBondSlots(category);
  renderActiveSpiritSelect(category);
  renderSpiritList();

  // 캐시 무효화
  pageState.lastTotalStatsHash = null;
  pageState.lastTotalStatsCalculation = null;
  pageState.lastSoulExpHash = null;
  pageState.lastSoulExpCalculation = null;

  // 디바운스된 업데이트
  debouncedUpdateTotalStats();
  debouncedUpdateSoulExp();
}

async function updateTotalStats() {
  // 기준값 저장 중이면 업데이트하지 않음
  if (pageState.isSavingBaseline) {
    return Promise.resolve();
  }

  // 이미 실행 중이면 중복 호출 방지
  if (pageState.isUpdatingTotalStats) {
    console.log("[updateTotalStats] 이미 실행 중이므로 중복 호출 방지");
    return Promise.resolve();
  }

  pageState.isUpdatingTotalStats = true;
  console.log("[updateTotalStats] 시작");

  // 캐시 확인
  const currentHash = generateTotalStatsHash();
  if (
    pageState.lastTotalStatsHash === currentHash &&
    pageState.lastTotalStatsCalculation
  ) {
    // 이미 계산된 경우 저장된 계산 결과로 스탯 아이템만 업데이트
    const calc = pageState.lastTotalStatsCalculation;
    // 초기 로딩 시에는 증감을 0으로 표시
    const shouldForceZeroChange = pageState.isInitialLoad;
    updateStatItemsWithValues(
      calc.allStats,
      calc.allTotalStats || calc.allBondStats, // allTotalStats 우선 사용
      {}, // allActiveStats는 사용하지 않음
      shouldForceZeroChange
    );
    updateKeyStats(
      calc.allStats,
      calc.allTotalStats || calc.allBondStats,
      {},
      shouldForceZeroChange
    );
    pageState.isUpdatingTotalStats = false;
    return Promise.resolve();
  }

  try {
    // 각 카테고리별 결속 계산
    const categories = ["수호", "탑승", "변신"];
    const allBondStats = {};
    const allActiveStats = {};
    const allTotalStats = {}; // 새로운 전체 스탯 변수

    // 등급효과와 세력효과 계산을 위한 상수 (spiritRanking.js에서 가져옴)
    const GRADE_SET_EFFECTS = {
      수호: {
        전설: {
          2: { damageResistance: 100, pvpDefensePercent: 1 },
          3: { damageResistance: 200, pvpDefensePercent: 2 },
          4: { damageResistance: 350, pvpDefensePercent: 3.5 },
          5: { damageResistance: 550, pvpDefensePercent: 5.5 },
        },
        불멸: {
          2: { damageResistance: 150, pvpDefensePercent: 1.5 },
          3: { damageResistance: 300, pvpDefensePercent: 3 },
          4: { damageResistance: 525, pvpDefensePercent: 5.25 },
          5: { damageResistance: 825, pvpDefensePercent: 8.25 },
        },
      },
      탑승: {
        전설: {
          2: { damageResistancePenetration: 100, pvpDamagePercent: 1 },
          3: { damageResistancePenetration: 200, pvpDamagePercent: 2 },
          4: { damageResistancePenetration: 350, pvpDamagePercent: 3.5 },
          5: { damageResistancePenetration: 550, pvpDamagePercent: 5.5 },
        },
        불멸: {
          2: { damageResistancePenetration: 150, pvpDamagePercent: 1.5 },
          3: { damageResistancePenetration: 300, pvpDamagePercent: 3 },
          4: { damageResistancePenetration: 525, pvpDamagePercent: 5.25 },
          5: { damageResistancePenetration: 825, pvpDamagePercent: 8.25 },
        },
      },
      변신: {
        전설: {
          2: {
            damageResistance: 50,
            damageResistancePenetration: 50,
            pvpDefensePercent: 0.5,
            pvpDamagePercent: 0.5,
          },
          3: {
            damageResistance: 100,
            damageResistancePenetration: 100,
            pvpDefensePercent: 1,
            pvpDamagePercent: 1,
          },
          4: {
            damageResistance: 175,
            damageResistancePenetration: 175,
            pvpDefensePercent: 1.75,
            pvpDamagePercent: 1.75,
          },
          5: {
            damageResistance: 275,
            damageResistancePenetration: 275,
            pvpDefensePercent: 2.75,
            pvpDamagePercent: 2.75,
          },
        },
        불멸: {
          2: {
            damageResistance: 75,
            damageResistancePenetration: 75,
            pvpDefensePercent: 0.75,
            pvpDamagePercent: 0.75,
          },
          3: {
            damageResistance: 150,
            damageResistancePenetration: 150,
            pvpDefensePercent: 1.5,
            pvpDamagePercent: 1.5,
          },
          4: {
            damageResistance: 262,
            damageResistancePenetration: 262,
            pvpDefensePercent: 2.62,
            pvpDamagePercent: 2.62,
          },
          5: {
            damageResistance: 412,
            damageResistancePenetration: 412,
            pvpDefensePercent: 4.12,
            pvpDamagePercent: 4.12,
          },
        },
      },
    };

    const FACTION_SET_EFFECTS = {
      결의: {
        2: { damageResistance: 200 },
        3: { damageResistance: 400 },
        4: { damageResistance: 600 },
        5: { damageResistance: 800 },
      },
      고요: {
        2: { damageResistancePenetration: 200 },
        3: { damageResistancePenetration: 400 },
        4: { damageResistancePenetration: 600 },
        5: { damageResistancePenetration: 800 },
      },
      의지: {
        2: { pvpDamagePercent: 2 },
        3: { pvpDamagePercent: 4 },
        4: { pvpDamagePercent: 6 },
        5: { pvpDamagePercent: 8 },
      },
      침착: {
        2: { pvpDefensePercent: 2 },
        3: { pvpDefensePercent: 4 },
        4: { pvpDefensePercent: 6 },
        5: { pvpDefensePercent: 8 },
      },
      냉정: {
        2: { damageResistance: 100, damageResistancePenetration: 100 },
        3: { damageResistance: 200, damageResistancePenetration: 200 },
        4: { damageResistance: 300, damageResistancePenetration: 300 },
        5: { damageResistance: 400, damageResistancePenetration: 400 },
      },
      활력: {
        2: { pvpDamagePercent: 1, pvpDefensePercent: 1 },
        3: { pvpDamagePercent: 2, pvpDefensePercent: 2 },
        4: { pvpDamagePercent: 3, pvpDefensePercent: 3 },
        5: { pvpDamagePercent: 4, pvpDefensePercent: 4 },
      },
    };

    // 각 카테고리별로 계산
    for (const category of categories) {
      const bondSpirits = pageState.bondSpirits[category] || [];
      if (bondSpirits.length === 0) continue;

      // 등급별 개수 집계
      const gradeCounts = {};
      const factionCounts = {};

      // 결속 환수의 장착효과 합산
      for (const bondSpirit of bondSpirits) {
        const spirit = getSpiritsForCategory(category).find(
          (s) => s.name === bondSpirit.name
        );
        if (spirit) {
          // 등급 집계
          if (spirit.grade) {
            gradeCounts[spirit.grade] = (gradeCounts[spirit.grade] || 0) + 1;
          }
          // 세력 집계
          if (spirit.influence) {
            factionCounts[spirit.influence] =
              (factionCounts[spirit.influence] || 0) + 1;
          }

          const level =
            bondSpirit.level !== undefined && bondSpirit.level !== null
              ? bondSpirit.level
              : 25;
          const levelStat = spirit.stats?.find((s) => s.level === level);
          if (levelStat?.bindStat) {
            Object.entries(levelStat.bindStat).forEach(([key, value]) => {
              const numValue =
                typeof value === "number" ? value : parseFloat(value) || 0;
              allBondStats[key] = (allBondStats[key] || 0) + numValue;
              allTotalStats[key] = (allTotalStats[key] || 0) + numValue;
            });
          }
        }
      }

      // 등급효과 계산
      const categoryGradeEffects = GRADE_SET_EFFECTS[category];
      if (categoryGradeEffects) {
        Object.entries(gradeCounts).forEach(([grade, count]) => {
          const gradeRules = categoryGradeEffects[grade];
          if (!gradeRules) return;

          let highestStep = 0;
          for (let step = 2; step <= count; step++) {
            if (gradeRules[step.toString()]) {
              highestStep = step;
            }
          }

          if (highestStep > 0) {
            const stepEffects = gradeRules[highestStep.toString()];
            Object.entries(stepEffects).forEach(([statKey, value]) => {
              allTotalStats[statKey] = (allTotalStats[statKey] || 0) + value;
            });
          }
        });
      }

      // 세력효과 계산
      Object.entries(factionCounts).forEach(([faction, count]) => {
        const factionRules = FACTION_SET_EFFECTS[faction];
        if (!factionRules) return;

        let highestStep = 0;
        for (let step = 2; step <= count; step++) {
          if (factionRules[step.toString()]) {
            highestStep = step;
          }
        }

        if (highestStep > 0) {
          const stepEffects = factionRules[highestStep.toString()];
          Object.entries(stepEffects).forEach(([statKey, value]) => {
            allTotalStats[statKey] = (allTotalStats[statKey] || 0) + value;
          });
        }
      });

      // 사용 중인 환수의 등록효과 추가
      const active = pageState.activeSpirits[category];
      if (active) {
        const spirit = getSpiritsForCategory(category).find(
          (s) => s.name === active.name
        );
        if (spirit) {
          const levelStat = spirit.stats?.find((s) => s.level === active.level);
          if (levelStat?.registrationStat) {
            Object.entries(levelStat.registrationStat).forEach(
              ([key, value]) => {
                const numValue =
                  typeof value === "number" ? value : parseFloat(value) || 0;
                allActiveStats[key] = (allActiveStats[key] || 0) + numValue;
                allTotalStats[key] = (allTotalStats[key] || 0) + numValue;
              }
            );
          }
        }
      }

      // 각인 점수 계산
      // 모든 결속 환수의 각인 장착효과 (합산값)
      for (const bondSpirit of bondSpirits) {
        const engraving =
          pageState.engravingData[category]?.[bondSpirit.name] || {};

        // 새로운 데이터 구조: { registration: [...], bind: {...} }
        if (engraving.bind) {
          Object.entries(engraving.bind).forEach(([statKey, value]) => {
            const numValue =
              typeof value === "number" ? value : parseFloat(value) || 0;
            if (numValue > 0) {
              allTotalStats[statKey] = (allTotalStats[statKey] || 0) + numValue;
            }
          });
        }

        // 기존 데이터 구조 호환성 (하위 호환)
        if (!engraving.registration && !engraving.bind) {
          Object.entries(engraving).forEach(([statKey, engravingData]) => {
            let bindValue = 0;
            if (typeof engravingData === "object" && engravingData !== null) {
              bindValue = engravingData.bind || 0;
            } else {
              bindValue = engravingData || 0;
            }
            if (bindValue > 0) {
              allTotalStats[statKey] =
                (allTotalStats[statKey] || 0) + bindValue;
            }
          });
        }
      }

      // 사용 중인 환수의 각인 등록효과 (배열의 모든 항목 합산)
      if (active) {
        const engraving =
          pageState.engravingData[category]?.[active.name] || {};

        // 디버깅: 각인 등록효과 계산 확인
        if (engraving && Object.keys(engraving).length > 0) {
          console.log(
            `[각인 등록효과] 카테고리: ${category}, 환수: ${active.name}, 레벨: ${active.level}`,
            engraving
          );
        }

        // 새로운 데이터 구조: { registration: [...], bind: {...} }
        if (Array.isArray(engraving.registration)) {
          engraving.registration.forEach((regItem) => {
            const statKey = regItem.statKey;
            const value = regItem.value || 0;
            const numValue =
              typeof value === "number" ? value : parseFloat(value) || 0;
            if (numValue > 0 && statKey) {
              const beforeValue = allTotalStats[statKey] || 0;
              allTotalStats[statKey] = (allTotalStats[statKey] || 0) + numValue;
              console.log(
                `[각인 등록효과 추가] ${statKey}: ${beforeValue} + ${numValue} = ${allTotalStats[statKey]}`
              );
            }
          });
        }

        // 기존 데이터 구조 호환성 (하위 호환)
        if (!engraving.registration && !engraving.bind) {
          Object.entries(engraving).forEach(([statKey, engravingData]) => {
            let registrationValue = 0;
            if (typeof engravingData === "object" && engravingData !== null) {
              registrationValue = engravingData.registration || 0;
            } else {
              registrationValue = engravingData || 0;
            }
            if (registrationValue > 0) {
              const beforeValue = allTotalStats[statKey] || 0;
              allTotalStats[statKey] =
                (allTotalStats[statKey] || 0) + registrationValue;
              console.log(
                `[각인 등록효과 추가 (하위호환)] ${statKey}: ${beforeValue} + ${registrationValue} = ${allTotalStats[statKey]}`
              );
            }
          });
        }
      } else {
        // 디버깅: 사용중 환수가 없는 경우
        console.log(`[각인 등록효과] 카테고리: ${category}, 사용중 환수 없음`);
      }
    }

    // baselineStatsHash와 currentHash 비교하여 baselineStats 자동 업데이트
    // (사용중 환수 변경 등으로 저장된 상태로 돌아온 경우)
    let shouldForceZeroChange = pageState.isInitialLoad;

    console.log("[updateTotalStats] 해시 비교:", {
      baselineStatsHash: pageState.baselineStatsHash,
      currentHash: currentHash,
      일치: pageState.baselineStatsHash === currentHash,
      isInitialLoad: pageState.isInitialLoad,
    });

    // baselineStatsHash는 저장 버튼을 눌렀을 때만 업데이트되므로
    // 여기서는 해시 비교만 하고 baselineStats는 변경하지 않음
    // 증감 계산은 항상 저장된 baselineStats와 현재 계산값을 비교하여 수행
    if (pageState.baselineStatsHash) {
      if (currentHash === pageState.baselineStatsHash) {
        // 현재 상태가 저장된 baseline과 일치하면 증감을 0으로 표시
        console.log(
          "[updateTotalStats] baselineStatsHash 일치 - 증감 0으로 표시"
        );
        shouldForceZeroChange = true;
      } else {
        console.log("[updateTotalStats] baselineStatsHash 불일치 - 증감 계산");
        // 해시가 불일치하면 증감을 계산하여 표시
        shouldForceZeroChange = false;
      }
    } else {
      // baselineStatsHash가 없으면 초기화 (저장 버튼을 누르기 전까지는 해시 설정 안 함)
      console.log("[updateTotalStats] baselineStatsHash 없음");
      shouldForceZeroChange = pageState.isInitialLoad;
    }

    // 합산 스탯은 기본 스탯 섹션에 통합되어 표시됨
    const allStats = [...STATS_CONFIG];

    // 기본 스탯 아이템에 합산값과 증감 표시 업데이트
    // allTotalStats를 사용하여 최종 스탯 계산
    // 초기 로딩 시에는 증감을 0으로 표시
    updateStatItemsWithValues(
      allStats,
      allTotalStats,
      {},
      shouldForceZeroChange
    );
    updateKeyStats(allStats, allTotalStats, {}, shouldForceZeroChange);

    // 결과 캐싱
    pageState.lastTotalStatsHash = currentHash;
    pageState.lastTotalStatsCalculation = {
      allStats,
      allBondStats,
      allActiveStats,
      allTotalStats, // 새로운 전체 스탯 변수
    };
    console.log("[updateTotalStats] 완료");
  } catch (error) {
    Logger.error("Error updating total stats:", error);
    // 에러가 발생해도 페이지는 표시되도록 (컨테이너를 덮어쓰지 않음)
    // 스탯 계산은 실패했지만 기본 UI는 유지됨
  } finally {
    pageState.isUpdatingTotalStats = false;
  }
}

// 경험치 테이블 가져오기 (localStorage 캐싱 사용)
async function getExpTable() {
  if (pageState.expTable) {
    return pageState.expTable;
  }

  try {
    // api.fetchSoulExpTable()는 이미 fetchWithSessionCache를 사용하여 localStorage에 캐싱됨
    pageState.expTable = await api.fetchSoulExpTable();
    return pageState.expTable;
  } catch (error) {
    Logger.error("Error fetching exp table:", error);
    return null;
  }
}

// 경험치 테이블을 사용하여 직접 계산
function calculateExpFromTable(expTable, type, currentLevel, targetLevel) {
  if (!expTable || !expTable[type]) {
    return 0;
  }

  const table = expTable[type];
  let totalExp = 0;

  if (targetLevel > currentLevel && targetLevel < table.length) {
    for (let i = currentLevel + 1; i <= targetLevel; i++) {
      totalExp += table[i] || 0;
    }
  }

  return totalExp;
}

// 데이터 해시 생성 (캐시 무효화 확인용)
function generateSoulExpHash() {
  const categories = ["수호", "탑승", "변신"];
  const hashData = categories
    .map((category) => {
      const bondSpirits = pageState.bondSpirits[category] || [];
      return bondSpirits.map((s) => `${s.name}:${s.level || 25}`).join(",");
    })
    .join("|");
  return hashData;
}

// 합산 스탯 데이터 해시 생성
function generateTotalStatsHash() {
  const categories = ["수호", "탑승", "변신"];
  const hashParts = [];

  // 결속 환수 해시
  categories.forEach((category) => {
    const bondSpirits = pageState.bondSpirits[category] || [];
    if (bondSpirits.length > 0) {
      hashParts.push(
        `${category}_bond:${bondSpirits
          .map((s) => `${s.name}:${s.level || 25}`)
          .join(",")}`
      );
    }
  });

  // 사용 환수 해시
  categories.forEach((category) => {
    const active = pageState.activeSpirits[category];
    if (active) {
      hashParts.push(`${category}_active:${active.name}:${active.level || 25}`);
    }
  });

  // 각인 데이터 해시
  categories.forEach((category) => {
    const engravingData = pageState.engravingData[category] || {};
    if (Object.keys(engravingData).length > 0) {
      const engravingStr = Object.entries(engravingData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([spiritName, stats]) => {
          const statsStr = Object.entries(stats)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => `${k}:${v}`)
            .join(",");
          return `${spiritName}:{${statsStr}}`;
        })
        .join("|");
      hashParts.push(`${category}_engraving:${engravingStr}`);
    }
  });

  // 기본 스탯 해시
  const userStatsStr = Object.entries(pageState.userStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(",");
  hashParts.push(`userStats:${userStatsStr}`);

  return hashParts.join("|");
}

// 결속 계산 캐시 키 생성
function generateBondCacheKey(category, bondSpirits) {
  const spiritsKey = bondSpirits
    .map((s) => `${s.name}:${s.level || 25}`)
    .sort()
    .join(",");
  return `${category}_${spiritsKey}`;
}

async function updateSoulExp() {
  const container = elements.soulExpInfo;

  // 캐시 확인
  const currentHash = generateSoulExpHash();
  if (
    pageState.lastSoulExpHash === currentHash &&
    pageState.lastSoulExpCalculation
  ) {
    container.innerHTML = pageState.lastSoulExpCalculation;
    return;
  }

  container.innerHTML =
    "<p class='text-center text-sm text-light'>계산 중...</p>";

  try {
    // 경험치 테이블 가져오기 (localStorage 캐싱 사용)
    const expTable = await getExpTable();
    if (!expTable) {
      container.innerHTML =
        "<p class='text-center text-sm text-light'>경험치 테이블을 불러올 수 없습니다.</p>";
      return;
    }

    let totalExp = 0;
    const categoryExp = {};

    // 각 카테고리별로 결속 환수들의 경험치 합산
    const categories = ["수호", "탑승", "변신"];

    for (const category of categories) {
      const bondSpirits = pageState.bondSpirits[category] || [];
      let categoryTotal = 0;

      for (const spirit of bondSpirits) {
        if (!spirit.level || spirit.level === 0) continue;

        // 환수 등급 확인
        const spiritData = getSpiritsForCategory(category).find(
          (s) => s.name === spirit.name
        );
        if (!spiritData) continue;

        const grade = spiritData.grade;
        const expType = grade === "불멸" ? "immortal" : "legend";

        // 경험치 테이블을 사용하여 직접 계산 (API 호출 없음)
        const exp = calculateExpFromTable(expTable, expType, 0, spirit.level);
        categoryTotal += exp;
      }

      categoryExp[category] = categoryTotal;
      totalExp += categoryTotal;
    }

    // 결과 표시
    if (totalExp === 0) {
      const emptyHtml =
        "<p class='text-center text-sm text-light'>초기화할 환수가 없습니다.</p>";
      container.innerHTML = emptyHtml;
      pageState.lastSoulExpCalculation = emptyHtml;
      pageState.lastSoulExpHash = currentHash;
      return;
    }

    // 환수혼 이미지(최상급 환수혼) 필요 개수 계산
    // 환수혼 계산기 참고: 최상급 = 1000 exp
    const SOUL_IMAGE_EXP = 1000; // 최상급 환수혼 경험치
    const soulImageCount = Math.ceil(totalExp / SOUL_IMAGE_EXP);

    // 그리드 형식으로 변경 (3열 2행)
    let html = `<div class="my-info-soul-exp-grid">`;

    // 첫 번째 행: 수호, 탑승, 변신
    categories.forEach((category) => {
      const exp = categoryExp[category] || 0;
      html += `
        <div class="my-info-soul-exp-category-item">
          <div class="my-info-soul-exp-category-label">${category}</div>
          <div class="my-info-soul-exp-category-value">${exp.toLocaleString()} exp</div>
        </div>
      `;
    });

    // 두 번째 행: 총합, 기준 대비, 필요경험치
    html += `
      <div class="my-info-soul-exp-total-item">
        <div class="my-info-soul-exp-total-label">총합</div>
        <div class="my-info-soul-exp-total-value">${totalExp.toLocaleString()} exp</div>
      </div>
    `;

    // 기준 대비 정보
    if (pageState.savedSoulExp > 0) {
      const diff = totalExp - pageState.savedSoulExp;
      let diffText = "";
      let diffColor = "";

      if (diff > 0) {
        diffText = `+${diff.toLocaleString()} exp (부족)`;
        diffColor = "#e74c3c";
      } else if (diff < 0) {
        diffText = `${diff.toLocaleString()} exp (여유)`;
        diffColor = "#4CAF50";
      } else {
        diffText = "0 exp (동일)";
        diffColor = "var(--text-secondary)";
      }

      html += `
        <div class="my-info-soul-exp-baseline-item">
          <div class="my-info-soul-exp-baseline-label">기준 대비</div>
          <div class="my-info-soul-exp-baseline-value" style="color: ${diffColor};">
            ${diffText}
          </div>
          <div class="my-info-soul-exp-baseline-text">
            기준: ${pageState.savedSoulExp.toLocaleString()} exp
          </div>
        </div>
      `;
    } else {
      // 기준이 없으면 빈 공간
      html += `
        <div class="my-info-soul-exp-baseline-item" style="opacity: 0.5;">
          <div class="my-info-soul-exp-baseline-label">기준 대비</div>
          <div class="my-info-soul-exp-baseline-value">-</div>
        </div>
      `;
    }

    // 필요경험치
    html += `
      <div class="my-info-soul-exp-need-item">
        <div class="my-info-soul-exp-need-label">필요경험치</div>
        <div class="my-info-soul-exp-need-value">
          <img src="assets/img/high-soul.jpg" alt="최상급 환수혼">
          <span>약 <strong>${soulImageCount.toLocaleString()}</strong>개</span>
        </div>
      </div>
    `;

    html += `</div>`;
    container.innerHTML = html;

    // 결과 캐싱
    pageState.lastSoulExpCalculation = html;
    pageState.lastSoulExpHash = currentHash;
  } catch (error) {
    Logger.error("Error updating soul exp:", error);
    container.innerHTML =
      "<p class='text-center text-sm text-light'>계산 중 오류가 발생했습니다.</p>";
  }
}

function renderProfileSelect() {
  const select = elements.profileSelect;
  if (!select) return;

  const profiles = getProfiles();
  const currentProfileId = pageState.currentProfileId;

  select.innerHTML = '<option value="">프로파일 없음</option>';
  profiles.forEach((profile) => {
    const option = createElement("option");
    option.value = profile.id;
    option.textContent = profile.name;
    if (profile.id === currentProfileId) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  // 버튼 활성화/비활성화
  const hasProfile = currentProfileId !== null;
  if (elements.editProfileBtn) elements.editProfileBtn.disabled = !hasProfile;
  if (elements.deleteProfileBtn)
    elements.deleteProfileBtn.disabled = !hasProfile;
}

function showProfileModal(mode, profileId = null) {
  const modal = createElement("div", "my-info-profile-modal");
  const profile = profileId
    ? getProfiles().find((p) => p.id === profileId)
    : null;

  modal.innerHTML = `
    <div class="my-info-profile-modal-content">
      <div class="my-info-profile-modal-header">
        <div class="my-info-profile-modal-title">
          ${
            mode === "create"
              ? "새 프로파일 생성"
              : mode === "edit"
              ? "프로파일 이름 수정"
              : ""
          }
        </div>
        <button class="my-info-profile-modal-close">×</button>
      </div>
      <div class="my-info-profile-form-group">
        <label class="my-info-profile-form-label">프로파일 이름</label>
        <input type="text" class="my-info-profile-form-input" id="profileNameInput" 
               value="${profile ? profile.name : ""}" 
               placeholder="프로파일 이름을 입력하세요" maxlength="50">
      </div>
      <div class="my-info-profile-modal-actions">
        <button class="my-info-profile-btn" id="profileModalCancelBtn">취소</button>
        <button class="my-info-profile-btn primary" id="profileModalSaveBtn">
          ${mode === "create" ? "생성" : "저장"}
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();

  modal
    .querySelector(".my-info-profile-modal-close")
    .addEventListener("click", closeModal);
  modal
    .querySelector("#profileModalCancelBtn")
    .addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  modal.querySelector("#profileModalSaveBtn").addEventListener("click", () => {
    const nameInput = modal.querySelector("#profileNameInput");
    const name = nameInput.value.trim();

    if (!name) {
      alert("프로파일 이름을 입력해주세요.");
      return;
    }

    if (mode === "create") {
      const newProfile = createProfile(name);

      // 환수 레벨, 각인, 사용중은 현재 상태에서 복사 (깊은 복사)
      const currentBondSpirits = JSON.parse(
        JSON.stringify(pageState.bondSpirits)
      );
      const currentActiveSpirits = JSON.parse(
        JSON.stringify(pageState.activeSpirits)
      );
      const currentEngravingData = JSON.parse(
        JSON.stringify(pageState.engravingData)
      );

      // 나의 스탯은 새로 시작 (초기화)
      pageState.userStats = {};
      pageState.baselineStats = {};
      pageState.baselineKeyStats = {
        tachaeTotal: 0,
        statusEffectResistance: 0,
        statusEffectAccuracy: 0,
      };
      pageState.savedSoulExp = 0;
      pageState.baselineStatsHash = null;

      // 환수 데이터 복사
      pageState.bondSpirits = currentBondSpirits;
      pageState.activeSpirits = currentActiveSpirits;
      pageState.engravingData = currentEngravingData;

      // 캐시 무효화
      pageState.lastTotalStatsHash = null;
      pageState.lastTotalStatsCalculation = null;
      pageState.lastSoulExpHash = null;
      pageState.lastSoulExpCalculation = null;

      // 초기 로딩 플래그 설정 (증감 0으로 표시)
      pageState.isInitialLoad = true;

      setCurrentProfileId(newProfile.id);

      // 새 프로파일 데이터 저장
      saveProfileData(newProfile.id);

      // UI 업데이트
      renderProfileSelect();
      if (typeof renderBondSlots === "function") {
        renderBondSlots("수호");
        renderBondSlots("탑승");
        renderBondSlots("변신");
      }
      if (typeof renderActiveSpiritSelect === "function") {
        renderActiveSpiritSelect("수호");
        renderActiveSpiritSelect("탑승");
        renderActiveSpiritSelect("변신");
      }
      if (typeof renderStats === "function") {
        renderStats();
      }
      if (typeof updateTotalStats === "function") {
        updateTotalStats();
      }
      if (typeof updateSoulExp === "function") {
        updateSoulExp();
      }

      alert("프로파일이 생성되었습니다. 나의 스탯을 새로 입력해주세요.");
    } else if (mode === "edit" && profileId) {
      updateProfile(profileId, { name });
      renderProfileSelect();
      alert("프로파일 이름이 수정되었습니다.");
    }

    closeModal();
  });

  // Enter 키로 저장
  modal.querySelector("#profileNameInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      modal.querySelector("#profileModalSaveBtn").click();
    }
  });

  // 포커스
  setTimeout(() => {
    modal.querySelector("#profileNameInput").focus();
    modal.querySelector("#profileNameInput").select();
  }, 100);
}

function setupEventListeners() {
  // 프로파일 선택
  if (elements.profileSelect) {
    elements.profileSelect.addEventListener("change", (e) => {
      const profileId = e.target.value || null;
      setCurrentProfileId(profileId);

      if (profileId) {
        loadProfileData(profileId);
        // 프로파일 전환 후 스탯 업데이트는 loadProfileData에서 처리됨
      } else {
        // 프로파일 없음으로 전환 시 기존 데이터 유지
        renderProfileSelect();
      }
    });
  }

  // 새 프로파일 생성
  if (elements.createProfileBtn) {
    elements.createProfileBtn.addEventListener("click", () => {
      showProfileModal("create");
    });
  }

  // 프로파일 이름 수정
  if (elements.editProfileBtn) {
    elements.editProfileBtn.addEventListener("click", () => {
      if (pageState.currentProfileId) {
        showProfileModal("edit", pageState.currentProfileId);
      }
    });
  }

  // 프로파일 삭제
  if (elements.deleteProfileBtn) {
    elements.deleteProfileBtn.addEventListener("click", () => {
      if (pageState.currentProfileId) {
        const profile = getProfiles().find(
          (p) => p.id === pageState.currentProfileId
        );
        if (
          profile &&
          confirm(`"${profile.name}" 프로파일을 삭제하시겠습니까?`)
        ) {
          deleteProfile(pageState.currentProfileId);
          renderProfileSelect();
          alert("프로파일이 삭제되었습니다.");
        }
      }
    });
  }

  // 환수 카테고리 탭 (오른쪽 그리드)
  elements.spiritTabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      const category = e.target.dataset.category;
      if (category && category !== pageState.currentCategory) {
        elements.spiritTabs.forEach((t) => t.classList.remove("active"));
        e.target.classList.add("active");
        pageState.currentCategory = category;
        renderSpiritList();
      }
    });
  });

  // 기준값 저장 버튼
  const saveBtn = elements.container?.querySelector("#saveBaselineBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      pageState.isSavingBaseline = true;

      try {
        // updateTotalStats와 동일한 로직으로 allTotalStats 계산
        const allStats = [...STATS_CONFIG];
        const allTotalStats = {}; // updateTotalStats와 동일한 변수 사용

        // 등급효과와 세력효과 계산을 위한 상수
        const GRADE_SET_EFFECTS = {
          수호: {
            전설: {
              2: { damageResistance: 100, pvpDefensePercent: 1 },
              3: { damageResistance: 200, pvpDefensePercent: 2 },
              4: { damageResistance: 350, pvpDefensePercent: 3.5 },
              5: { damageResistance: 550, pvpDefensePercent: 5.5 },
            },
            불멸: {
              2: { damageResistance: 150, pvpDefensePercent: 1.5 },
              3: { damageResistance: 300, pvpDefensePercent: 3 },
              4: { damageResistance: 525, pvpDefensePercent: 5.25 },
              5: { damageResistance: 825, pvpDefensePercent: 8.25 },
            },
          },
          탑승: {
            전설: {
              2: { damageResistancePenetration: 100, pvpDamagePercent: 1 },
              3: { damageResistancePenetration: 200, pvpDamagePercent: 2 },
              4: { damageResistancePenetration: 350, pvpDamagePercent: 3.5 },
              5: { damageResistancePenetration: 550, pvpDamagePercent: 5.5 },
            },
            불멸: {
              2: { damageResistancePenetration: 150, pvpDamagePercent: 1.5 },
              3: { damageResistancePenetration: 300, pvpDamagePercent: 3 },
              4: { damageResistancePenetration: 525, pvpDamagePercent: 5.25 },
              5: { damageResistancePenetration: 825, pvpDamagePercent: 8.25 },
            },
          },
          변신: {
            전설: {
              2: {
                damageResistance: 50,
                damageResistancePenetration: 50,
                pvpDefensePercent: 0.5,
                pvpDamagePercent: 0.5,
              },
              3: {
                damageResistance: 100,
                damageResistancePenetration: 100,
                pvpDefensePercent: 1,
                pvpDamagePercent: 1,
              },
              4: {
                damageResistance: 175,
                damageResistancePenetration: 175,
                pvpDefensePercent: 1.75,
                pvpDamagePercent: 1.75,
              },
              5: {
                damageResistance: 275,
                damageResistancePenetration: 275,
                pvpDefensePercent: 2.75,
                pvpDamagePercent: 2.75,
              },
            },
            불멸: {
              2: {
                damageResistance: 75,
                damageResistancePenetration: 75,
                pvpDefensePercent: 0.75,
                pvpDamagePercent: 0.75,
              },
              3: {
                damageResistance: 150,
                damageResistancePenetration: 150,
                pvpDefensePercent: 1.5,
                pvpDamagePercent: 1.5,
              },
              4: {
                damageResistance: 262,
                damageResistancePenetration: 262,
                pvpDefensePercent: 2.62,
                pvpDamagePercent: 2.62,
              },
              5: {
                damageResistance: 412,
                damageResistancePenetration: 412,
                pvpDefensePercent: 4.12,
                pvpDamagePercent: 4.12,
              },
            },
          },
        };

        const FACTION_SET_EFFECTS = {
          결의: {
            2: { damageResistance: 200 },
            3: { damageResistance: 400 },
            4: { damageResistance: 600 },
            5: { damageResistance: 800 },
          },
          고요: {
            2: { damageResistancePenetration: 200 },
            3: { damageResistancePenetration: 400 },
            4: { damageResistancePenetration: 600 },
            5: { damageResistancePenetration: 800 },
          },
          의지: {
            2: { pvpDamagePercent: 2 },
            3: { pvpDamagePercent: 4 },
            4: { pvpDamagePercent: 6 },
            5: { pvpDamagePercent: 8 },
          },
          침착: {
            2: { pvpDefensePercent: 2 },
            3: { pvpDefensePercent: 4 },
            4: { pvpDefensePercent: 6 },
            5: { pvpDefensePercent: 8 },
          },
          냉정: {
            2: { damageResistance: 100, damageResistancePenetration: 100 },
            3: { damageResistance: 200, damageResistancePenetration: 200 },
            4: { damageResistance: 300, damageResistancePenetration: 300 },
            5: { damageResistance: 400, damageResistancePenetration: 400 },
          },
          활력: {
            2: { pvpDamagePercent: 1, pvpDefensePercent: 1 },
            3: { pvpDamagePercent: 2, pvpDefensePercent: 2 },
            4: { pvpDamagePercent: 3, pvpDefensePercent: 3 },
            5: { pvpDamagePercent: 4, pvpDefensePercent: 4 },
          },
        };

        // 각 카테고리별로 계산 (updateTotalStats와 동일한 로직)
        const categories = ["수호", "탑승", "변신"];
        for (const category of categories) {
          const bondSpirits = pageState.bondSpirits[category] || [];
          if (bondSpirits.length === 0) continue;

          // 등급별 개수 집계
          const gradeCounts = {};
          const factionCounts = {};

          // 결속 환수의 장착효과 합산
          for (const bondSpirit of bondSpirits) {
            const spirit = getSpiritsForCategory(category).find(
              (s) => s.name === bondSpirit.name
            );
            if (spirit) {
              // 등급 집계
              if (spirit.grade) {
                gradeCounts[spirit.grade] =
                  (gradeCounts[spirit.grade] || 0) + 1;
              }
              // 세력 집계
              if (spirit.influence) {
                factionCounts[spirit.influence] =
                  (factionCounts[spirit.influence] || 0) + 1;
              }

              const level =
                bondSpirit.level !== undefined && bondSpirit.level !== null
                  ? bondSpirit.level
                  : 25;
              const levelStat = spirit.stats?.find((s) => s.level === level);
              if (levelStat?.bindStat) {
                Object.entries(levelStat.bindStat).forEach(([key, value]) => {
                  const numValue =
                    typeof value === "number" ? value : parseFloat(value) || 0;
                  allTotalStats[key] = (allTotalStats[key] || 0) + numValue;
                });
              }
            }
          }

          // 등급효과 계산
          const categoryGradeEffects = GRADE_SET_EFFECTS[category];
          if (categoryGradeEffects) {
            Object.entries(gradeCounts).forEach(([grade, count]) => {
              const gradeRules = categoryGradeEffects[grade];
              if (!gradeRules) return;

              let highestStep = 0;
              for (let step = 2; step <= count; step++) {
                if (gradeRules[step.toString()]) {
                  highestStep = step;
                }
              }

              if (highestStep > 0) {
                const stepEffects = gradeRules[highestStep.toString()];
                Object.entries(stepEffects).forEach(([statKey, value]) => {
                  allTotalStats[statKey] =
                    (allTotalStats[statKey] || 0) + value;
                });
              }
            });
          }

          // 세력효과 계산
          Object.entries(factionCounts).forEach(([faction, count]) => {
            const factionRules = FACTION_SET_EFFECTS[faction];
            if (!factionRules) return;

            let highestStep = 0;
            for (let step = 2; step <= count; step++) {
              if (factionRules[step.toString()]) {
                highestStep = step;
              }
            }

            if (highestStep > 0) {
              const stepEffects = factionRules[highestStep.toString()];
              Object.entries(stepEffects).forEach(([statKey, value]) => {
                allTotalStats[statKey] = (allTotalStats[statKey] || 0) + value;
              });
            }
          });

          // 사용 중인 환수의 등록효과 추가
          const active = pageState.activeSpirits[category];
          if (active) {
            const spirit = getSpiritsForCategory(category).find(
              (s) => s.name === active.name
            );
            if (spirit) {
              const levelStat = spirit.stats?.find(
                (s) => s.level === active.level
              );
              if (levelStat?.registrationStat) {
                Object.entries(levelStat.registrationStat).forEach(
                  ([key, value]) => {
                    const numValue =
                      typeof value === "number"
                        ? value
                        : parseFloat(value) || 0;
                    allTotalStats[key] = (allTotalStats[key] || 0) + numValue;
                  }
                );
              }
            }
          }

          // 각인 점수 계산
          // 모든 결속 환수의 각인 장착효과
          for (const bondSpirit of bondSpirits) {
            const engraving =
              pageState.engravingData[category]?.[bondSpirit.name] || {};

            // 새로운 데이터 구조: { registration: [...], bind: {...} }
            if (engraving.bind) {
              Object.entries(engraving.bind).forEach(([statKey, value]) => {
                const numValue =
                  typeof value === "number" ? value : parseFloat(value) || 0;
                if (numValue > 0) {
                  allTotalStats[statKey] =
                    (allTotalStats[statKey] || 0) + numValue;
                }
              });
            }

            // 기존 데이터 구조 호환성 (하위 호환)
            if (!engraving.registration && !engraving.bind) {
              Object.entries(engraving).forEach(([statKey, engravingData]) => {
                let bindValue = 0;
                if (
                  typeof engravingData === "object" &&
                  engravingData !== null
                ) {
                  bindValue = engravingData.bind || 0;
                } else {
                  bindValue = engravingData || 0;
                }
                if (bindValue > 0) {
                  allTotalStats[statKey] =
                    (allTotalStats[statKey] || 0) + bindValue;
                }
              });
            }
          }

          // 사용 중인 환수의 각인 등록효과
          if (active) {
            const engraving =
              pageState.engravingData[category]?.[active.name] || {};

            // 새로운 데이터 구조: { registration: [...], bind: {...} }
            if (Array.isArray(engraving.registration)) {
              engraving.registration.forEach((regItem) => {
                const statKey = regItem.statKey;
                const value = regItem.value || 0;
                const numValue =
                  typeof value === "number" ? value : parseFloat(value) || 0;
                if (numValue > 0 && statKey) {
                  allTotalStats[statKey] =
                    (allTotalStats[statKey] || 0) + numValue;
                }
              });
            }

            // 기존 데이터 구조 호환성 (하위 호환)
            if (!engraving.registration && !engraving.bind) {
              Object.entries(engraving).forEach(([statKey, engravingData]) => {
                let registrationValue = 0;
                if (
                  typeof engravingData === "object" &&
                  engravingData !== null
                ) {
                  registrationValue = engravingData.registration || 0;
                } else {
                  registrationValue = engravingData || 0;
                }
                if (registrationValue > 0) {
                  allTotalStats[statKey] =
                    (allTotalStats[statKey] || 0) + registrationValue;
                }
              });
            }
          }
        }

        // 스탯 기준값 저장 - 항상 계산된 값을 사용 (저장 시점의 정확한 계산값)
        // 화면 표시값이 아닌 실제 계산값을 저장하여 일관성 보장
        allStats.forEach((stat) => {
          // 항상 계산된 값을 사용 (화면 표시값이 아닌 실제 계산값)
          const baseValue = pageState.userStats[stat.key] || 0;
          const totalStatsValue = allTotalStats[stat.key] || 0;
          const totalValue = Math.round(baseValue + totalStatsValue);

          const oldBaseline = pageState.baselineStats[stat.key];
          pageState.baselineStats[stat.key] = totalValue;

          // 디버깅: 상태이상저항, 상태이상적중, 경험치획득증가만 로그 출력
          if (
            stat.key === "statusEffectResistance" ||
            stat.key === "statusEffectAccuracy" ||
            stat.key === "experienceGainIncrease"
          ) {
            console.log(`[저장] ${stat.name}:`, {
              oldBaseline,
              newBaseline: totalValue,
              baseValue,
              totalStatsValue,
              activeSpirits: Object.entries(pageState.activeSpirits)
                .map(([cat, active]) =>
                  active ? `${cat}: ${active.name} Lv${active.level}` : null
                )
                .filter(Boolean),
            });
          }
        });

        // 주요 스탯 기준값 저장 (환산타채 합 등)
        // 저장 시점의 계산된 값을 사용 (화면 표시값이 아닌 계산된 값)
        const getTotalValueForSave = (key) => {
          // 항상 계산된 값을 사용 (저장 시와 동일한 방식, 정수로 반올림)
          const baseValue = pageState.userStats[key] || 0;
          const totalStatsValue = allTotalStats[key] || 0;
          return Math.round(baseValue + totalStatsValue);
        };

        // 개별 스탯 기준값을 사용하여 환산타채 합 계산 (일관성 보장)
        const savedDamageResistancePenetration =
          pageState.baselineStats.damageResistancePenetration !== undefined
            ? pageState.baselineStats.damageResistancePenetration
            : getTotalValueForSave("damageResistancePenetration");
        const savedDamageResistance =
          pageState.baselineStats.damageResistance !== undefined
            ? pageState.baselineStats.damageResistance
            : getTotalValueForSave("damageResistance");
        const savedPvpDamagePercent =
          pageState.baselineStats.pvpDamagePercent !== undefined
            ? pageState.baselineStats.pvpDamagePercent
            : getTotalValueForSave("pvpDamagePercent");
        const savedPvpDefensePercent =
          pageState.baselineStats.pvpDefensePercent !== undefined
            ? pageState.baselineStats.pvpDefensePercent
            : getTotalValueForSave("pvpDefensePercent");

        // 환산타채 합 계산: 개별 스탯 기준값 사용 (정수로 반올림)
        // getTotalValueForSave가 이미 정수화하지만, pvpDamagePercent * 10 계산 전에 먼저 정수화
        const savedTachaeTotal = Math.round(
          Math.round(savedDamageResistancePenetration) +
            Math.round(savedDamageResistance) +
            Math.round(Math.round(savedPvpDamagePercent) * 10) +
            Math.round(Math.round(savedPvpDefensePercent) * 10)
        );

        pageState.baselineKeyStats.tachaeTotal = savedTachaeTotal;
        pageState.baselineKeyStats.statusEffectResistance =
          getTotalValueForSave("statusEffectResistance");
        pageState.baselineKeyStats.statusEffectAccuracy = getTotalValueForSave(
          "statusEffectAccuracy"
        );

        // 환수혼 경험치 기준값도 함께 저장
        const expTable = pageState.expTable;
        if (expTable) {
          let totalExp = 0;
          for (const category of categories) {
            const bondSpirits = pageState.bondSpirits[category] || [];
            for (const spirit of bondSpirits) {
              if (!spirit.level || spirit.level === 0) continue;
              const spiritData = getSpiritsForCategory(category).find(
                (s) => s.name === spirit.name
              );
              if (!spiritData) continue;
              const grade = spiritData.grade;
              const expType = grade === "불멸" ? "immortal" : "legend";
              const exp = calculateExpFromTable(
                expTable,
                expType,
                0,
                spirit.level
              );
              totalExp += exp;
            }
          }
          pageState.savedSoulExp = totalExp;
        }

        // userStats도 함께 저장
        saveUserStats();

        // baselineStatsHash 저장 (저장 시점의 해시값)
        const currentHash = generateTotalStatsHash();
        pageState.baselineStatsHash = currentHash;
        console.log("[저장] baselineStatsHash 업데이트:", currentHash);

        saveData();

        // 저장 후에는 화면에 표시된 총합값을 유지하면서 증감만 0으로 업데이트
        // 각 스탯의 총합값은 그대로 유지하고, 증감만 업데이트
        allStats.forEach((stat) => {
          const statItem = elements.container?.querySelector(
            `[data-stat="${stat.key}"]`
          );
          if (statItem) {
            const totalValueSpan = statItem.querySelector(
              ".my-info-stat-total"
            );
            const changeValueSpan = statItem.querySelector(
              ".my-info-stat-change"
            );

            if (totalValueSpan && changeValueSpan) {
              // 현재 화면에 표시된 총합값 유지 (이미 저장된 baselineStats와 동일)
              // 증감만 0으로 업데이트
              changeValueSpan.textContent = "(0)";
              changeValueSpan.className = "my-info-stat-change neutral";
              changeValueSpan.style.display = "inline";
              changeValueSpan.style.visibility = "visible";

              // 수동 편집 플래그는 유지 (사용자가 입력한 값이므로)
            }
          }
        });

        // recentlyEditedStats 초기화
        if (pageState.recentlyEditedStats) {
          pageState.recentlyEditedStats.clear();
        }

        // 캐시 무효화
        pageState.lastTotalStatsHash = null;
        pageState.lastTotalStatsCalculation = null;

        // 주요 스탯 변화 업데이트 (증감은 0으로)
        // updateTotalStats를 호출하여 allTotalStats를 다시 계산
        // 저장 후에는 환산합 증감도 0으로 설정
        updateKeyStats(allStats, allTotalStats, {}, true); // forceZeroChange = true
        debouncedUpdateTotalStats();

        // 저장 피드백
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML =
          '<span style="font-size: 14px; margin-right: 4px;">✓</span><span>저장됨</span>';
        saveBtn.style.background = "var(--color-secondary, #4CAF50)";
        setTimeout(() => {
          saveBtn.innerHTML = originalText;
          saveBtn.style.background = "var(--color-primary)";
        }, 1500);
      } catch (error) {
        Logger.error("Error saving baseline:", error);
      } finally {
        setTimeout(() => {
          pageState.isSavingBaseline = false;
        }, 500);
      }
    });
  }
}

export function init(container) {
  cleanup();

  container.innerHTML = getHTML();

  elements.container = container;
  elements.statsColumn1 = container.querySelector("#statsColumn1");
  elements.statsColumn2 = container.querySelector("#statsColumn2");
  elements.statsColumn3 = container.querySelector("#statsColumn3");
  elements.spiritGrid = container.querySelector("#myInfoSpiritGrid");
  elements.spiritTabs = container.querySelectorAll(".my-info-spirit-tab");
  elements.totalStatsGrid = container.querySelector("#totalStatsGrid");
  elements.soulExpInfo = container.querySelector("#soulExpInfo");
  elements.profileSelect = container.querySelector("#profileSelect");
  elements.createProfileBtn = container.querySelector("#createProfileBtn");
  elements.editProfileBtn = container.querySelector("#editProfileBtn");
  elements.deleteProfileBtn = container.querySelector("#deleteProfileBtn");

  // 결속 슬롯 요소들
  elements.bondSlots수호 = container.querySelector("#bondSlots수호");
  elements.bondSlots탑승 = container.querySelector("#bondSlots탑승");
  elements.bondSlots변신 = container.querySelector("#bondSlots변신");

  loadUserStats();
  loadSavedData();

  // 프로파일 UI 초기화
  renderProfileSelect();

  renderStats();

  // 각 카테고리별 렌더링
  const categories = ["수호", "탑승", "변신"];
  categories.forEach((category) => {
    renderBondSlots(category);
    renderActiveSpiritSelect(category);
  });

  renderSpiritList();

  // 전역 이미지 로드 에러 감지 (spiritGrid 이미지 포함)
  const handleImageError = (event) => {
    if (event.target.tagName === "IMG" && event.target.src) {
      pageState.imageLoadErrors.add(event.target.src);
      showImageLoadError();
    }
  };

  // 기존 이미지들에 에러 핸들러 추가
  const allImages = container.querySelectorAll("img");
  allImages.forEach((img) => {
    if (!img.onerror) {
      img.addEventListener("error", handleImageError);
    }
  });

  // 새로 추가되는 이미지들도 감지하기 위한 MutationObserver
  pageState.imageObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          // Element node
          if (node.tagName === "IMG") {
            node.addEventListener("error", handleImageError);
          }
          // 자식 요소 중 이미지 찾기
          const images = node.querySelectorAll && node.querySelectorAll("img");
          if (images) {
            images.forEach((img) => {
              img.addEventListener("error", handleImageError);
            });
          }
        }
      });
    });
  });

  pageState.imageObserver.observe(container, {
    childList: true,
    subtree: true,
  });

  // 이벤트 리스너 먼저 설정 (페이지가 표시되도록)
  setupEventListeners();

  // 경험치 테이블 미리 로드 (localStorage 캐싱 사용)
  getExpTable().catch((error) => {
    Logger.error("Error preloading exp table:", error);
  });

  // 초기 로딩 시에는 즉시 실행 (Promise.all로 완료 대기)
  // 에러가 발생해도 페이지는 표시되도록 처리
  // baselineStats가 없으면 현재 계산값으로 초기화
  Promise.all([updateTotalStats(), updateSoulExp()])
    .then(() => {
      const allStats = [...STATS_CONFIG];
      const calc = pageState.lastTotalStatsCalculation;

      if (!calc || !calc.allTotalStats) {
        return;
      }

      // baselineStats가 비어있으면 현재 계산값으로 초기화하여 증감 0으로 시작
      if (Object.keys(pageState.baselineStats).length === 0) {
        // 계산된 allTotalStats를 사용하여 baselineStats 초기화
        allStats.forEach((stat) => {
          const baseValue = pageState.userStats[stat.key] || 0;
          const totalStatsValue = calc.allTotalStats[stat.key] || 0;
          const totalValue = Math.round(baseValue + totalStatsValue);
          pageState.baselineStats[stat.key] = totalValue;
        });

        // 주요 스탯 기준값 초기화 (모든 계산 결과를 정수로 반올림)
        const initDamageResistancePenetration = Math.round(
          (pageState.userStats.damageResistancePenetration || 0) +
            (calc.allTotalStats.damageResistancePenetration || 0)
        );
        const initDamageResistance = Math.round(
          (pageState.userStats.damageResistance || 0) +
            (calc.allTotalStats.damageResistance || 0)
        );
        const initPvpDamagePercent = Math.round(
          (pageState.userStats.pvpDamagePercent || 0) +
            (calc.allTotalStats.pvpDamagePercent || 0)
        );
        const initPvpDefensePercent = Math.round(
          (pageState.userStats.pvpDefensePercent || 0) +
            (calc.allTotalStats.pvpDefensePercent || 0)
        );
        // pvpDamagePercent * 10 계산 전에 먼저 정수화
        const initTachaeTotal = Math.round(
          initDamageResistancePenetration +
            initDamageResistance +
            Math.round(initPvpDamagePercent * 10) +
            Math.round(initPvpDefensePercent * 10)
        );

        pageState.baselineKeyStats.tachaeTotal = initTachaeTotal;
        pageState.baselineKeyStats.statusEffectResistance = Math.round(
          (pageState.userStats.statusEffectResistance || 0) +
            (calc.allTotalStats.statusEffectResistance || 0)
        );
        pageState.baselineKeyStats.statusEffectAccuracy = Math.round(
          (pageState.userStats.statusEffectAccuracy || 0) +
            (calc.allTotalStats.statusEffectAccuracy || 0)
        );

        // saveData() 제거: 저장 버튼을 눌러야 저장됨 (초기화는 메모리에만 저장)
      }

      // 저장된 값 표시 및 증감 0으로 설정
      updateStatItemsWithValues(
        allStats,
        calc.allTotalStats,
        {},
        true // forceZeroChange = true (증감 0)
      );
      updateKeyStats(allStats, calc.allTotalStats, {}, true); // forceZeroChange = true (증감 0)

      // 초기 로딩 완료
      pageState.isInitialLoad = false;
    })
    .catch((error) => {
      Logger.error("Error initializing stats:", error);
      // 에러가 발생해도 기본 스탯은 표시되도록
      // 스탯 아이템이 이미 렌더링되었으므로 페이지는 표시됨
      // 초기 로딩 완료 플래그는 에러 발생 시에도 설정 (무한 루프 방지)
      pageState.isInitialLoad = false;
    });
}

// 디바운스된 업데이트 함수들 (800ms 디바운스 - 레벨 변경 시 과도한 API 호출 방지)
const debouncedUpdateTotalStats = debounce(updateTotalStats, 800);
const debouncedUpdateSoulExp = debounce(updateSoulExp, 800);

export function getHelpContentHTML() {
  return `
    <div class="content-block">
      <h2>내정보 페이지 사용 안내</h2>
      <p>내정보 페이지에서는 사용자의 기본 스탯을 입력하고, 환수를 결속하여 합산 스탯을 확인할 수 있습니다. 여러 프로파일을 생성하여 PvP, PvE 등 다양한 설정을 관리할 수 있습니다.</p>
      
      <h3>프로파일 관리</h3>
      <ul>
        <li><strong>프로파일 생성:</strong> <strong>+</strong> 버튼을 클릭하여 새로운 프로파일을 생성합니다 (예: PvP, PvE, 보스 등)</li>
        <li><strong>프로파일 선택:</strong> 드롭다운에서 원하는 프로파일을 선택하면 해당 프로파일의 설정이 로드됩니다</li>
        <li><strong>프로파일 수정:</strong> <strong>✏️</strong> 버튼으로 프로파일 이름을 변경할 수 있습니다</li>
        <li><strong>프로파일 삭제:</strong> <strong>삭제</strong> 버튼으로 불필요한 프로파일을 제거할 수 있습니다</li>
        <li>각 프로파일은 독립적으로 환수 결속, 스탯, 각인 정보를 저장합니다</li>
      </ul>

      <h3>환수 결속 관리</h3>
      <ul>
        <li><strong>환수 추가:</strong> 오른쪽 환수 그리드에서 환수 이미지를 클릭하면 왼쪽 결속 슬롯에 추가됩니다 (카테고리별 최대 6개)</li>
        <li><strong>환수 레벨 조정:</strong> 결속 슬롯의 환수 이미지를 클릭하면 팝업이 열리며, 레벨 버튼(-/+) 또는 직접 입력으로 레벨을 조정할 수 있습니다</li>
        <li><strong>사용하기/사용중:</strong> 환수 팝업에서 <strong>사용하기</strong> 버튼을 클릭하면 해당 환수가 활성화됩니다 (주황색 테두리로 표시)</li>
        <li><strong>결속 제거:</strong> <strong>결속 제거</strong> 버튼으로 결속 슬롯에서 환수를 제거할 수 있습니다</li>
        <li>각 카테고리(수호/탑승/변신)별로 하나의 환수만 활성화할 수 있습니다</li>
      </ul>

      <h3>스탯 입력 및 저장</h3>
      <ul>
        <li><strong>기본 스탯 입력:</strong> <strong>나의 스탯</strong> 섹션에서 각 스탯 값을 클릭하여 직접 입력합니다</li>
        <li><strong>저장 버튼:</strong> 현재 입력한 스탯과 환수 설정을 기준값으로 저장합니다</li>
        <li><strong>증감 표시:</strong> 저장 후 환수 레벨 변경, 각인 변경 등으로 스탯이 변하면 증감값이 표시됩니다
          <ul>
            <li>🟢 <strong>초록색</strong>: 스탯 증가</li>
            <li>🔴 <strong>빨간색</strong>: 스탯 감소</li>
            <li>⚪ <strong>회색</strong>: 변화 없음</li>
          </ul>
        </li>
        <li><strong>환산타채 합:</strong> 상단 중앙에 표시되며, 저장 후 변경사항에 따른 증감도 함께 표시됩니다</li>
      </ul>

      <h3>각인 설정</h3>
      <ul>
        <li><strong>각인 등록:</strong> 환수 이미지 클릭 → 팝업에서 <strong>등록효과</strong> 탭 선택 → 스탯 선택 및 값 입력 (최대 4개)</li>
        <li><strong>각인 장착:</strong> <strong>장착효과</strong> 탭에서 각인 장착 스탯을 입력합니다</li>
        <li><strong>등록효과 가능 스탯:</strong> 체력증가, 마력증가, 치명확률, 치명저항, 체력시약향상, 마력시약향상, 대인방어, 피해흡수, 위력, 치명피해저항, 시전향상, 보스몬스터 추가피해, 일반몬스터 추가피해, 피해저항관통, 상태이상저항, 상태이상적중</li>
        <li>⚠️ <strong>주의:</strong> 각인 정보는 환수 레벨에 따라 자동으로 계산되지 않으므로 직접 입력해야 합니다</li>
        <li>설정 후 <strong>각인 저장</strong> 버튼을 클릭하여 저장합니다</li>
      </ul>

      <h3>환수 혼 경험치</h3>
      <ul>
        <li>하단 왼쪽 섹션에서 환수 초기화 시 획득 가능한 경험치를 확인할 수 있습니다</li>
        <li>수호/탑승/변신 카테고리별 경험치와 총합, 기준 대비 필요 경험치가 표시됩니다</li>
        <li>결속 슬롯에 추가된 모든 환수의 경험치가 합산되어 표시됩니다</li>
      </ul>

      <h3>💡 사용 팁</h3>
      <ul>
        <li>프로파일을 활용하여 PvP용, PvE용 등 다양한 설정을 따로 관리하세요</li>
        <li>스탯을 입력한 후 반드시 <strong>저장</strong> 버튼을 클릭해야 증감 기능이 정상 작동합니다</li>
        <li>환수 레벨을 변경하면 즉시 스탯 증감이 반영됩니다</li>
        <li>각인 설정은 환수별로 독립적으로 저장되며, 프로파일별로 관리됩니다</li>
        <li>우측 하단의 <strong>?</strong> 도움말 버튼을 클릭하면 상세한 사용 가이드를 확인할 수 있습니다</li>
      </ul>
    </div>
  `;
}

export function cleanup() {
  // 이미지 Observer 정리
  if (pageState.imageObserver) {
    pageState.imageObserver.disconnect();
    pageState.imageObserver = null;
  }

  // 이미지 로드 에러 상태 초기화
  pageState.imageLoadErrors.clear();
  pageState.imageLoadErrorShown = false;

  // 팝업 및 오버레이 제거
  if (currentPopup) {
    const closeBtn = currentPopup.querySelector(".my-info-spirit-popup-close");
    if (closeBtn) {
      // 팝업 내부의 cleanup 함수 호출 (이벤트 리스너 제거)
      closeBtn.click();
    } else {
      currentPopup.remove();
    }
    currentPopup = null;
  }
  if (currentPopupOverlay) {
    currentPopupOverlay.remove();
    currentPopupOverlay = null;
  }

  // 팝업 롱프레스 상태 초기화
  stopPopupLongPress();

  // touchmove 이벤트 리스너 제거
  if (popupLongPressState.touchMoveHandler) {
    document.removeEventListener(
      "touchmove",
      popupLongPressState.touchMoveHandler
    );
    popupLongPressState.touchMoveHandler = null;
  }

  // elements 초기화
  Object.keys(elements).forEach((key) => {
    delete elements[key];
  });
}
