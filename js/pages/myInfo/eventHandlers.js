/**
 * 이벤트 핸들러 모듈
 * 모든 이벤트 리스너 등록 및 관리
 */

import { pageState, elements } from "./state.js";
import { STATS_CONFIG } from "./constants.js";
import {
  getProfiles,
  setCurrentProfileId,
  loadProfileData,
  renderProfileSelect,
  showProfileModal,
  deleteProfile,
} from "./profileManager.js";
import { saveUserStats, saveData } from "./dataManager.js";
import {
  calculateExpFromTable,
  updateSoulExp,
  generateSoulExpHash,
} from "./expCalculator.js";
import {
  updateTotalStats,
  updateKeyStats,
  generateTotalStatsHash,
  calculateTotalStats,
} from "./statCalculator.js";
import { renderStats, updateStatItemsWithValues } from "./statUI.js";
import { getSpiritsForCategory } from "./spiritManager.js";

// updateTotalStats와 updateStatItemsWithValues를 직접 사용하기 위해 전역으로 접근 가능하도록
let globalGetSpiritsForCategory = null;
let globalUpdateStatItemsWithValues = null;
import { GRADE_SET_EFFECTS, FACTION_SET_EFFECTS } from "../../constants.js";
import Logger from "../../utils/logger.js";

/**
 * 이벤트 리스너 설정
 * @param {Object} callbacks - 콜백 함수들
 * @param {Function} callbacks.renderBondSlotsWrapper - 결속 슬롯 렌더링 래퍼
 * @param {Function} callbacks.renderActiveSpiritSelect - 사용중 환수 선택 렌더링
 * @param {Function} callbacks.renderSpiritListWrapper - 환수 리스트 렌더링 래퍼
 * @param {Function} callbacks.handleStatEditWrapper - 스탯 편집 핸들러 래퍼
 * @param {Function} callbacks.debouncedUpdateTotalStats - 디바운스된 스탯 업데이트
 */
export function setupEventListeners(callbacks) {
  const {
    renderBondSlotsWrapper,
    renderActiveSpiritSelect,
    renderSpiritListWrapper,
    handleStatEditWrapper,
    debouncedUpdateTotalStats,
  } = callbacks;

  // 프로파일 선택
  if (elements.profileSelect) {
    elements.profileSelect.addEventListener("change", (e) => {
      const profileId = e.target.value || null;
      setCurrentProfileId(profileId);

      if (profileId) {
        // 콜백 전달 (updateTotalStats와 updateSoulExp는 콜백을 받는 함수이므로 래퍼로 전달)
        loadProfileData(profileId, {
          renderBondSlots: renderBondSlotsWrapper,
          renderActiveSpiritSelect,
          renderStats: () => renderStats(handleStatEditWrapper),
          updateTotalStats: () =>
            updateTotalStats(getSpiritsForCategory, updateStatItemsWithValues),
          updateSoulExp: () => updateSoulExp(getSpiritsForCategory),
        });
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
      // 콜백 전달 (아직 분리되지 않은 함수들은 나중에 import로 변경)
      showProfileModal("create", null, {
        renderBondSlots: renderBondSlotsWrapper,
        renderActiveSpiritSelect,
        renderStats: () => renderStats(handleStatEditWrapper),
        updateTotalStats: () =>
          updateTotalStats(getSpiritsForCategory, updateStatItemsWithValues),
        updateSoulExp: () => updateSoulExp(getSpiritsForCategory),
      });
    });
  }

  // 프로파일 이름 수정
  if (elements.editProfileBtn) {
    elements.editProfileBtn.addEventListener("click", () => {
      if (pageState.currentProfileId) {
        showProfileModal("edit", pageState.currentProfileId, {
          renderBondSlots: renderBondSlotsWrapper,
          renderActiveSpiritSelect,
          renderStats: () => renderStats(handleStatEditWrapper),
          updateTotalStats: () =>
            updateTotalStats(getSpiritsForCategory, updateStatItemsWithValues),
          updateSoulExp: () => {
            const { updateSoulExp } = require("./expCalculator.js");
            updateSoulExp(getSpiritsForCategory);
          },
        });
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
          deleteProfile(pageState.currentProfileId, {
            renderBondSlots: renderBondSlotsWrapper,
            renderActiveSpiritSelect,
            renderStats: () => renderStats(handleStatEditWrapper),
            updateTotalStats: () =>
              updateTotalStats(
                getSpiritsForCategory,
                updateStatItemsWithValues
              ),
            updateSoulExp: () => {
              const { updateSoulExp } = require("./expCalculator.js");
              updateSoulExp(getSpiritsForCategory);
            },
          });
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
        renderSpiritListWrapper();
      }
    });
  });

  // 기준값 저장 버튼
  const saveBtn = elements.container?.querySelector("#saveBaselineBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      pageState.isSavingBaseline = true;

      try {
        // updateTotalStats와 완전히 동일한 로직으로 allTotalStats 계산
        const allStats = [...STATS_CONFIG];
        const { allTotalStats } = calculateTotalStats(getSpiritsForCategory);

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
          const categories = ["수호", "탑승", "변신"];
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
        const currentHash = generateTotalStatsHash(getSpiritsForCategory);
        pageState.baselineStatsHash = currentHash;

        // baselineSoulExpHash 저장 (저장 시점의 해시값)
        const currentSoulExpHash = generateSoulExpHash();
        pageState.baselineSoulExpHash = currentSoulExpHash;

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

        // 저장 완료 후 즉시 업데이트 (isSavingBaseline 플래그 해제 후)
        pageState.isSavingBaseline = false;

        // 즉시 updateTotalStats 호출하여 증감 반영 (저장된 baseline 기준)
        if (globalGetSpiritsForCategory && globalUpdateStatItemsWithValues) {
          updateTotalStats(
            globalGetSpiritsForCategory,
            globalUpdateStatItemsWithValues
          );
        }

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
        pageState.isSavingBaseline = false;
      }
    });
  }
}
