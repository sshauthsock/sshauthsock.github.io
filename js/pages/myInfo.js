import { state as globalState } from "../state.js";
import { createElement, debounce } from "../utils.js";
import { renderSpiritGrid } from "../components/spritGrid.js";
import * as api from "../api.js";
import { isFixedLevelSpirit } from "../constants.js";
import Logger from "../utils/logger.js";

// 분리된 모듈 import
import { pageState, elements } from "./myInfo/state.js";
import {
  STATS_CONFIG,
  ENGRAVING_REGISTRATION_STATS,
  COLUMN_1_STATS,
  COLUMN_2_STATS,
  COLUMN_3_STATS,
  MOBILE_STAT_NAME_MAP,
  SPECIAL_STAT_CLASSES,
  SECONDARY_STAT_CLASSES,
} from "./myInfo/constants.js";
import { isMobile, showImageLoadError, getHTML } from "./myInfo/ui/renderer.js";
import {
  getProfiles,
  saveProfiles,
  getCurrentProfileId,
  setCurrentProfileId,
  createProfile,
  updateProfile,
  deleteProfile,
  saveProfileData,
  loadProfileData,
  renderProfileSelect,
  showProfileModal,
} from "./myInfo/profileManager.js";
import {
  loadUserStats,
  saveUserStats,
  loadSavedData,
  saveData,
} from "./myInfo/dataManager.js";
import {
  getExpTable,
  calculateExpFromTable,
  generateSoulExpHash,
  updateSoulExp,
} from "./myInfo/expCalculator.js";
import {
  updateTotalStats,
  updateKeyStats,
  generateTotalStatsHash,
  generateBondCacheKey,
} from "./myInfo/statCalculator.js";
import {
  renderStats,
  createStatItem,
  handleStatEdit,
  updateStatItems,
  updateStatItemsWithValues,
} from "./myInfo/statUI.js";
import {
  showEngravingModal,
  getEngravingData,
  createEngravingItem,
} from "./myInfo/engravingManager.js";
import {
  getSpiritsForCategory,
  renderBondSlots,
  renderActiveSpiritSelect,
  renderSpiritList,
  setCategoryForSelection,
  handleSpiritSelect,
  removeBondSpirit,
  updatePopupActiveState,
  showSpiritLevelPopup,
  closeSpiritLevelPopup,
  stopPopupLongPress,
} from "./myInfo/spiritManager.js";
import { setupEventListeners } from "./myInfo/eventHandlers.js";

// 상수, 상태, UI 함수는 분리된 모듈에서 import됨
// getHTML()은 ui/renderer.js에서 import됨

// renderStats, createStatItem, handleStatEdit는 statUI.js에서 import됨
// updateStatItems, updateStatItemsWithValues는 statUI.js에서 import됨
// updateTotalStats, updateKeyStats, generateTotalStatsHash, generateBondCacheKey는 statCalculator.js에서 import됨
// getExpTable, calculateExpFromTable, generateSoulExpHash, updateSoulExp는 expCalculator.js에서 import됨

// handleStatEdit 래퍼 (콜백 전달)
function handleStatEditWrapper(item, statKey, valueSpan) {
  handleStatEdit(
    item,
    statKey,
    valueSpan,
    getSpiritsForCategory,
    debouncedUpdateTotalStats,
    updateKeyStats
  );
}

// 프로파일 관리 함수들
// 프로파일 및 데이터 관리 함수들은 분리된 모듈에서 import됨

// renderBondSlots는 spiritManager.js에서 import됨 (중복 정의 제거됨)
// 래퍼 함수로 콜백 전달
function renderBondSlotsWrapper(category) {
  renderBondSlots(
    category,
    setCategoryForSelectionWrapper,
    (category, index, slot, event) => {
      showSpiritLevelPopup(category, index, slot, event, {
        renderBondSlots: renderBondSlotsWrapper,
        updateTotalStats,
        updateSoulExp,
        debouncedUpdateTotalStats,
        debouncedUpdateSoulExp,
        updateStatItemsWithValues,
        removeBondSpirit: removeBondSpiritWrapper,
      });
    }
  );
}

// renderActiveSpiritSelect는 spiritManager.js에서 import됨 (중복 정의 제거됨)

// getSpiritsForCategory는 spiritManager.js에서 import됨 (중복 정의 제거됨)

// renderSpiritList는 spiritManager.js에서 import됨 (중복 정의 제거됨)
// 래퍼 함수로 콜백 전달
function renderSpiritListWrapper() {
  renderSpiritList(handleSpiritSelectWrapper);
}

// setCategoryForSelection은 spiritManager.js에서 import됨 (중복 정의 제거됨)
// 래퍼 함수로 콜백 전달
function setCategoryForSelectionWrapper(category) {
  setCategoryForSelection(category);
  renderSpiritListWrapper();
}

// handleSpiritSelect는 spiritManager.js에서 import됨 (중복 정의 제거됨)
// 래퍼 함수로 콜백 전달
function handleSpiritSelectWrapper(spirit) {
  handleSpiritSelect(
    spirit,
    renderBondSlotsWrapper,
    renderSpiritListWrapper,
    debouncedUpdateTotalStats,
    debouncedUpdateSoulExp
  );
}

// currentPopup, currentPopupOverlay, popupLongPressState는 spiritManager.js에서 관리됨
// showSpiritLevelPopup은 spiritManager.js에서 import됨 (중복 정의 제거됨)
// showSpiritLevelPopup 함수는 spiritManager.js로 이동됨
// startPopupLongPress, stopPopupLongPress, createPopupHint, removePopupHint는 spiritManager.js로 이동됨

// showSpiritLevelPopup 함수 본문은 spiritManager.js로 이동됨 (149-949줄 제거됨)

// updatePopupActiveState는 spiritManager.js에서 import됨 (중복 정의 제거됨)
// startPopupLongPress, stopPopupLongPress, createPopupHint, removePopupHint는 spiritManager.js로 이동됨

// updateStatItems, updateStatItemsWithValues는 statUI.js에서 import됨 (중복 정의 제거됨)

// updateKeyStats는 statCalculator.js에서 import됨 (중복 정의 제거됨)

// removeBondSpirit는 spiritManager.js에서 import됨 (중복 정의 제거됨)
// 래퍼 함수로 콜백 전달
function removeBondSpiritWrapper(category, index) {
  removeBondSpirit(
    category,
    index,
    renderBondSlotsWrapper,
    renderActiveSpiritSelect,
    renderSpiritListWrapper,
    debouncedUpdateTotalStats,
    debouncedUpdateSoulExp
  );
}

// updateTotalStats는 statCalculator.js에서 import됨 (중복 정의 제거됨)
// getExpTable, calculateExpFromTable, generateSoulExpHash, updateSoulExp는 expCalculator.js에서 import됨 (중복 정의 제거됨)
// generateTotalStatsHash, generateBondCacheKey는 statCalculator.js에서 import됨 (중복 정의 제거됨)

// updateSoulExp는 expCalculator.js에서 import됨
// renderProfileSelect와 showProfileModal은 profileManager.js에서 import됨
// showProfileModal은 콜백을 받도록 변경되었으므로, 호출하는 곳에서 콜백 전달 필요
// setupEventListeners는 eventHandlers.js에서 import됨 (중복 정의 제거됨)
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
  // loadSavedData는 내부에서 loadProfileData를 호출하므로 콜백 전달
  loadSavedData({
    renderBondSlots: renderBondSlotsWrapper,
    renderActiveSpiritSelect,
    renderStats: () => renderStats(handleStatEditWrapper),
    updateTotalStats: () =>
      updateTotalStats(getSpiritsForCategory, updateStatItemsWithValues),
    updateSoulExp: () => updateSoulExp(getSpiritsForCategory),
  });

  // 프로파일 UI 초기화
  renderProfileSelect();

  renderStats(handleStatEditWrapper);

  // 각 카테고리별 렌더링
  const categories = ["수호", "탑승", "변신"];
  categories.forEach((category) => {
    renderBondSlotsWrapper(category);
    renderActiveSpiritSelect(category);
  });

  renderSpiritListWrapper();

  // 전역 이미지 로드 에러 감지 (spiritGrid 이미지 포함)
  const handleImageError = (event) => {
    if (event.target.tagName === "IMG" && event.target.src) {
      const img = event.target;

      // WebP 로드 실패 시 원본으로 폴백
      if (
        img.src.endsWith(".webp") &&
        img.dataset.fallbackAttempted !== "true"
      ) {
        const originalPath = img.src.replace(/\.webp$/i, ".jpg");
        img.dataset.fallbackAttempted = "true";
        img.src = originalPath;
        return; // 폴백 시도 중이므로 에러 처리 스킵
      }

      pageState.imageLoadErrors.add(img.src);
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
  setupEventListeners({
    renderBondSlotsWrapper,
    renderActiveSpiritSelect,
    renderSpiritListWrapper,
    handleStatEditWrapper,
    debouncedUpdateTotalStats,
  });

  // 경험치 테이블 미리 로드 (localStorage 캐싱 사용)
  getExpTable().catch((error) => {
    Logger.error("Error preloading exp table:", error);
  });

  // 초기 로딩 시에는 즉시 실행 (Promise.all로 완료 대기)
  // 에러가 발생해도 페이지는 표시되도록 처리
  // baselineStats가 없으면 현재 계산값으로 초기화
  Promise.all([
    updateTotalStats(getSpiritsForCategory, updateStatItemsWithValues),
    updateSoulExp(getSpiritsForCategory),
  ])
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
      updateKeyStats(
        allStats,
        calc.allTotalStats,
        {},
        true,
        updateStatItemsWithValues
      ); // forceZeroChange = true (증감 0)

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
const debouncedUpdateTotalStats = debounce(() => {
  updateTotalStats(getSpiritsForCategory, updateStatItemsWithValues);
}, 800);
const debouncedUpdateSoulExp = debounce(() => {
  updateSoulExp(getSpiritsForCategory);
}, 800);

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

  // 팝업 및 오버레이 제거 (spiritManager.js에서 관리)
  closeSpiritLevelPopup();

  // 팝업 롱프레스 상태 초기화 (touchMoveHandler도 내부에서 처리됨)
  stopPopupLongPress();

  // elements 초기화
  Object.keys(elements).forEach((key) => {
    delete elements[key];
  });
}
