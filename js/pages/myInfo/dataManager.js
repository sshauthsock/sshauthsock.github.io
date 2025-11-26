/**
 * 데이터 저장/로드 관리
 * localStorage를 사용한 데이터 영속성 관리
 */

import { pageState } from "./state.js";
import Logger from "../../utils/logger.js";
import {
  getCurrentProfileId,
  loadProfileData,
  saveProfileData,
} from "./profileManager.js";

/**
 * 사용자 기본 스탯 로드
 */
export function loadUserStats() {
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

/**
 * 사용자 기본 스탯 저장
 */
export function saveUserStats() {
  // 저장 버튼을 눌러야 저장됨 (자동 저장 제거)
  // 프로파일이 없으면 기존 방식으로 저장 (하위 호환성)
  if (!pageState.currentProfileId) {
    localStorage.setItem(
      "myInfo_userStats",
      JSON.stringify(pageState.userStats)
    );
  }
}

/**
 * 저장된 데이터 로드 (프로파일 기반 또는 기존 방식)
 * @param {Object} callbacks - UI 업데이트 콜백 함수들 (선택적)
 */
export function loadSavedData(callbacks = {}) {
  // 현재 프로파일 ID 로드
  const currentProfileId = getCurrentProfileId();
  pageState.currentProfileId = currentProfileId;

  if (currentProfileId) {
    // 프로파일 데이터 로드
    loadProfileData(currentProfileId, callbacks);
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

    const savedBaselineSoulExpHash = localStorage.getItem(
      "myInfo_baselineSoulExpHash"
    );
    if (savedBaselineSoulExpHash) {
      pageState.baselineSoulExpHash = savedBaselineSoulExpHash;
    }
  }
}

/**
 * 데이터 저장 (프로파일 기반 또는 기존 방식)
 */
export function saveData() {
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
    if (pageState.baselineSoulExpHash) {
      localStorage.setItem(
        "myInfo_baselineSoulExpHash",
        pageState.baselineSoulExpHash
      );
    }
    // userStats는 saveUserStats에서 별도로 저장됨
  }
}

