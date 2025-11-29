/**
 * 프로파일 관리 모듈
 * 프로파일 CRUD 및 UI 관리
 */

import { pageState, elements } from "./state.js";
import { createElement } from "../../utils.js";
import Logger from "../../utils/logger.js";
import { isFixedLevelSpirit } from "../../constants.js";

/**
 * 프로파일 목록 가져오기
 * @returns {Array} 프로파일 배열
 */
export function getProfiles() {
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

/**
 * 프로파일 목록 저장
 * @param {Array} profiles - 프로파일 배열
 */
export function saveProfiles(profiles) {
  localStorage.setItem("myInfo_profiles", JSON.stringify(profiles));
}

/**
 * 현재 프로파일 ID 가져오기
 * @returns {string|null} 프로파일 ID
 */
export function getCurrentProfileId() {
  const saved = localStorage.getItem("myInfo_currentProfileId");
  return saved || null;
}

/**
 * 현재 프로파일 ID 설정
 * @param {string|null} profileId - 프로파일 ID
 */
export function setCurrentProfileId(profileId) {
  if (profileId) {
    localStorage.setItem("myInfo_currentProfileId", profileId);
  } else {
    localStorage.removeItem("myInfo_currentProfileId");
  }
  pageState.currentProfileId = profileId;
}

/**
 * 새 프로파일 생성
 * @param {string} name - 프로파일 이름
 * @returns {Object} 생성된 프로파일 객체
 */
export function createProfile(name) {
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

/**
 * 프로파일 업데이트
 * @param {string} profileId - 프로파일 ID
 * @param {Object} updates - 업데이트할 속성들
 * @returns {Object|null} 업데이트된 프로파일 또는 null
 */
export function updateProfile(profileId, updates) {
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

/**
 * 프로파일 삭제
 * @param {string} profileId - 프로파일 ID
 * @param {Object} callbacks - UI 업데이트 콜백 함수들 (선택적)
 */
export function deleteProfile(profileId, callbacks = {}) {
  const profiles = getProfiles();
  const filtered = profiles.filter((p) => p.id !== profileId);
  saveProfiles(filtered);

  // 프로파일 데이터 삭제
  localStorage.removeItem(`myInfo_profile_${profileId}`);

  // 현재 프로파일이 삭제된 경우 첫 번째 프로파일 선택
  if (pageState.currentProfileId === profileId) {
    if (filtered.length > 0) {
      setCurrentProfileId(filtered[0].id);
      loadProfileData(filtered[0].id, callbacks);
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
      pageState.baselineSoulExpHash = null;
    }
  }
}

/**
 * 프로파일 데이터 저장
 * @param {string} profileId - 프로파일 ID
 */
export function saveProfileData(profileId) {
  const profileData = {
    userStats: pageState.userStats,
    bondSpirits: pageState.bondSpirits,
    activeSpirits: pageState.activeSpirits,
    baselineStats: pageState.baselineStats,
    baselineKeyStats: pageState.baselineKeyStats,
    savedSoulExp: pageState.savedSoulExp,
    engravingData: pageState.engravingData,
    baselineStatsHash: pageState.baselineStatsHash,
    baselineSoulExpHash: pageState.baselineSoulExpHash,
  };
  localStorage.setItem(
    `myInfo_profile_${profileId}`,
    JSON.stringify(profileData)
  );

  // 프로파일 업데이트 시간 갱신
  updateProfile(profileId, { updatedAt: new Date().toISOString() });
}

/**
 * 프로파일 데이터 로드
 * @param {string} profileId - 프로파일 ID
 * @param {Object} callbacks - UI 업데이트 콜백 함수들 (선택적)
 */
export function loadProfileData(profileId, callbacks = {}) {
  const saved = localStorage.getItem(`myInfo_profile_${profileId}`);
  if (saved) {
    try {
      const profileData = JSON.parse(saved);
      pageState.userStats = profileData.userStats || {};
      const loadedBondSpirits = profileData.bondSpirits || {
        수호: [],
        탑승: [],
        변신: [],
      };
      // 고정 레벨 환수의 레벨을 항상 25로 설정
      const categories = ["수호", "탑승", "변신"];
      for (const category of categories) {
        if (loadedBondSpirits[category]) {
          loadedBondSpirits[category] = loadedBondSpirits[category].map(
            (spirit) => {
              if (isFixedLevelSpirit(spirit.name)) {
                return { ...spirit, level: 25 };
              }
              return spirit;
            }
          );
        }
      }
      pageState.bondSpirits = loadedBondSpirits;

      const loadedActiveSpirits = profileData.activeSpirits || {
        수호: null,
        탑승: null,
        변신: null,
      };
      // 고정 레벨 환수의 레벨을 항상 25로 설정
      for (const category of categories) {
        if (
          loadedActiveSpirits[category] &&
          isFixedLevelSpirit(loadedActiveSpirits[category].name)
        ) {
          loadedActiveSpirits[category] = {
            ...loadedActiveSpirits[category],
            level: 25,
          };
        }
      }
      pageState.activeSpirits = loadedActiveSpirits;
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
      pageState.baselineSoulExpHash = profileData.baselineSoulExpHash || null;

      // 캐시 무효화 (프로파일 전환 시 새로운 데이터로 재계산)
      pageState.lastTotalStatsHash = null;
      pageState.lastTotalStatsCalculation = null;
      pageState.lastSoulExpHash = null;
      pageState.lastSoulExpCalculation = null;

      // 프로파일 로드 시 증감 0으로 초기화 (새로고침과 동일하게 처리)
      pageState.isInitialLoad = true;

      // 데이터 로드 후 UI 업데이트 (콜백 함수 사용)
      if (callbacks.renderBondSlots) {
        callbacks.renderBondSlots("수호");
        callbacks.renderBondSlots("탑승");
        callbacks.renderBondSlots("변신");
      }
      if (callbacks.renderActiveSpiritSelect) {
        callbacks.renderActiveSpiritSelect("수호");
        callbacks.renderActiveSpiritSelect("탑승");
        callbacks.renderActiveSpiritSelect("변신");
      }
      if (callbacks.renderStats) {
        callbacks.renderStats();
      }
      // 프로파일 로드 시 스탯 업데이트 (증감 0으로 표시)
      if (callbacks.updateTotalStats) {
        // updateTotalStats는 함수이므로 호출
        const result = callbacks.updateTotalStats();
        if (result && typeof result.then === "function") {
          result
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
      } else {
        pageState.isInitialLoad = false;
      }
      if (callbacks.updateSoulExp) {
        callbacks.updateSoulExp();
      }
    } catch (e) {
      Logger.error("Error loading profile data:", e);
    }
  }
}

/**
 * 프로파일 선택 드롭다운 렌더링
 */
export function renderProfileSelect() {
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

/**
 * 프로파일 모달 표시
 * @param {string} mode - 모드 ("create" | "edit")
 * @param {string|null} profileId - 프로파일 ID (edit 모드일 때)
 * @param {Object} callbacks - UI 업데이트 콜백 함수들 (선택적)
 */
export function showProfileModal(mode, profileId = null, callbacks = {}) {
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
      pageState.baselineSoulExpHash = null;

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

      // UI 업데이트 (콜백 함수 사용)
      renderProfileSelect();
      if (callbacks.renderBondSlots) {
        callbacks.renderBondSlots("수호");
        callbacks.renderBondSlots("탑승");
        callbacks.renderBondSlots("변신");
      }
      if (callbacks.renderActiveSpiritSelect) {
        callbacks.renderActiveSpiritSelect("수호");
        callbacks.renderActiveSpiritSelect("탑승");
        callbacks.renderActiveSpiritSelect("변신");
      }
      if (callbacks.renderStats) {
        callbacks.renderStats();
      }
      if (callbacks.updateTotalStats) {
        // updateTotalStats는 함수이므로 호출
        callbacks.updateTotalStats();
      }
      if (callbacks.updateSoulExp) {
        // updateSoulExp는 함수이므로 호출
        callbacks.updateSoulExp();
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
