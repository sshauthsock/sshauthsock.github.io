/**
 * 내정보 데이터 Export/Import 모듈
 * JSON 및 CSV 형식 지원
 */

import { pageState } from "./state.js";
import { getCurrentProfileId, getProfiles } from "./profileManager.js";
import { state as globalState } from "../../state.js";
import Logger from "../../utils/logger.js";
import {
  validateFileSize,
  validateFileType,
  validateImportData,
  validateJSONDepth,
  validateCSVLineCount,
  sanitizeFileName,
  validateSpirit,
  validateUserStats,
  isValidSpiritName,
  isValidLevel,
  isValidStatValue,
  isValidEngraving,
  validateEngraving,
  MAX_SPIRITS_PER_CATEGORY,
  MAX_ENGRAVING_STATS,
  MAX_FILE_SIZE,
} from "./exportImportValidation.js";
import { calculateTotalStats } from "./statCalculator.js";
import { getSpiritsForCategory } from "./spiritManager.js";
import { STATS_CONFIG } from "./constants.js";

/**
 * 현재 프로파일 데이터를 JSON으로 Export
 * 환수 정보(카테고리별 환수명, 레벨, 각인), 사용중 환수, 전체 스탯만 포함
 * @returns {string} JSON 문자열
 */
export function exportToJSON() {
  const profileId = getCurrentProfileId();
  const profiles = getProfiles();
  const currentProfile = profileId
    ? profiles.find((p) => p.id === profileId)
    : null;

  // 카테고리별 환수 정보 정리 (환수명, 레벨, 각인정보)
  const spiritsByCategory = {
    수호: [],
    탑승: [],
    변신: [],
  };

  const categories = ["수호", "탑승", "변신"];
  categories.forEach((category) => {
    const bondSpirits = pageState.bondSpirits[category] || [];
    bondSpirits.forEach((spirit) => {
      const engraving = pageState.engravingData[category]?.[spirit.name];
      
      // registration을 배열 형태로 유지 (옵션1, 옵션2, 옵션3, 옵션4 개별 저장)
      let registrationArray = [];
      if (engraving && engraving.registration) {
        if (Array.isArray(engraving.registration)) {
          // 배열 형태 그대로 유지
          registrationArray = engraving.registration.map((item) => ({
            statKey: item.statKey || "",
            value: item.value || 0,
          }));
        } else if (typeof engraving.registration === "object") {
          // 객체 형태를 배열로 변환 (기존 호환성)
          registrationArray = Object.entries(engraving.registration).map(
            ([statKey, value]) => ({
              statKey: statKey,
              value: value || 0,
            })
          );
        }
      }
      
      // bind 데이터 가져오기
      const bindObj = (engraving && engraving.bind) ? engraving.bind : {};
      
      // 각인 정보 항상 포함 (빈 배열/객체여도 포함)
      spiritsByCategory[category].push({
        name: spirit.name,
        level: spirit.level || 0,
        engraving: {
          registration: registrationArray,
          bind: bindObj,
        },
      });
    });
  });

  const exportData = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    profile: currentProfile
      ? {
          id: currentProfile.id,
          name: currentProfile.name,
        }
      : null,
    data: {
      // 카테고리별 환수 정보 (환수명, 레벨, 각인정보)
      spirits: spiritsByCategory,
      // 사용중 환수
      activeSpirits: {
        수호: pageState.activeSpirits.수호
          ? {
              name: pageState.activeSpirits.수호.name,
              level: pageState.activeSpirits.수호.level || 0,
            }
          : null,
        탑승: pageState.activeSpirits.탑승
          ? {
              name: pageState.activeSpirits.탑승.name,
              level: pageState.activeSpirits.탑승.level || 0,
            }
          : null,
        변신: pageState.activeSpirits.변신
          ? {
              name: pageState.activeSpirits.변신.name,
              level: pageState.activeSpirits.변신.level || 0,
            }
          : null,
      },
      // 전체 스탯
      userStats: pageState.userStats,
    },
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * 클립보드에 JSON 텍스트 복사
 */
export async function copyToClipboard() {
  try {
    const jsonData = exportToJSON();
    await navigator.clipboard.writeText(jsonData);
    Logger.log("클립보드에 복사되었습니다.");
    return true;
  } catch (error) {
    Logger.error("Error copying to clipboard:", error);
    // Fallback: 구형 브라우저 지원
    try {
      const textArea = document.createElement("textarea");
      textArea.value = exportToJSON();
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        Logger.log("클립보드에 복사되었습니다.");
        return true;
      } else {
        throw new Error("복사 실패");
      }
    } catch (fallbackError) {
      Logger.error("Error copying to clipboard (fallback):", fallbackError);
      alert("클립보드 복사에 실패했습니다. 브라우저 권한을 확인해주세요.");
      return false;
    }
  }
}

/**
 * 클립보드에서 텍스트 읽어서 JSON import
 */
export async function pasteFromClipboard(callbacks = {}) {
  try {
    const text = await navigator.clipboard.readText();
    if (!text || !text.trim()) {
      alert("클립보드가 비어있습니다.");
      return false;
    }

    // JSON 파싱 시도
    let importData;
    try {
      importData = JSON.parse(text);
    } catch (parseError) {
      alert(`클립보드 내용이 올바른 JSON 형식이 아닙니다: ${parseError.message}`);
      return false;
    }

    // 파일 크기 검증 (대략적인 검사)
    if (text.length > MAX_FILE_SIZE) {
      alert("클립보드 내용이 너무 큽니다.");
      return false;
    }

    // JSON 깊이 검증
    const depthValidation = validateJSONDepth(importData);
    if (!depthValidation.valid) {
      alert(depthValidation.error);
      return false;
    }

    // 버전 체크
    if (importData.version && importData.version !== "1.0") {
      if (
        !confirm(
          `이 데이터는 버전 ${importData.version} 형식입니다. 계속하시겠습니까?`
        )
      ) {
        return false;
      }
    }

    // 데이터 검증
    if (!importData.data) {
      alert("잘못된 데이터 형식입니다.");
      return false;
    }

    const data = importData.data;

    // Import 데이터 검증
    const dataValidation = validateImportData(data);
    if (!dataValidation.valid) {
      alert(dataValidation.error);
      return false;
    }

    // 환수 정보 import
    const allSpirits = Array.isArray(globalState.allSpirits)
      ? globalState.allSpirits
      : [];

    if (data.spirits) {
      const categories = ["수호", "탑승", "변신"];
      pageState.bondSpirits = { 수호: [], 탑승: [], 변신: [] };
      pageState.engravingData = { 수호: {}, 탑승: {}, 변신: {} };

      categories.forEach((category) => {
        const spirits = data.spirits[category] || [];
        if (spirits.length > MAX_SPIRITS_PER_CATEGORY) {
          Logger.warn(
            `${category} 환수가 너무 많습니다. 최대 ${MAX_SPIRITS_PER_CATEGORY}개만 사용합니다.`
          );
          spirits.splice(MAX_SPIRITS_PER_CATEGORY);
        }

        spirits.forEach((spiritData) => {
          const validation = validateSpirit(spiritData, category);
          if (!validation.valid) {
            Logger.warn(`환수 검증 실패: ${validation.error}`);
            return;
          }

          const fullSpirit = allSpirits.find(
            (s) => s.name === spiritData.name && s.type === category
          );

          if (fullSpirit) {
            pageState.bondSpirits[category].push({
              ...fullSpirit,
              level: spiritData.level || 0,
            });

            if (spiritData.engraving) {
              const engravingValidation = validateEngraving(spiritData.engraving);
              if (engravingValidation.valid) {
                let registrationArray = [];
                if (spiritData.engraving.registration) {
                  if (Array.isArray(spiritData.engraving.registration)) {
                    registrationArray = spiritData.engraving.registration;
                  } else if (typeof spiritData.engraving.registration === "object") {
                    registrationArray = Object.entries(spiritData.engraving.registration).map(
                      ([statKey, value]) => ({
                        statKey: statKey,
                        value: value || 0,
                      })
                    );
                  }
                }

                pageState.engravingData[category][spiritData.name] = {
                  registration: registrationArray,
                  bind: spiritData.engraving.bind || {},
                };
              } else {
                Logger.warn(`각인 데이터 검증 실패: ${spiritData.name}`);
                if (!pageState.engravingData[category][spiritData.name]) {
                  pageState.engravingData[category][spiritData.name] = {
                    registration: [],
                    bind: {},
                  };
                }
              }
            } else {
              if (!pageState.engravingData[category][spiritData.name]) {
                pageState.engravingData[category][spiritData.name] = {
                  registration: [],
                  bind: {},
                };
              }
            }
          } else {
            Logger.warn(
              `환수를 찾을 수 없습니다: ${spiritData.name} (${category})`
            );
            pageState.bondSpirits[category].push({
              name: spiritData.name,
              level: spiritData.level || 0,
            });
          }
        });
      });
    }

    // 사용중 환수 import
    if (data.activeSpirits) {
      const activeSpirits = data.activeSpirits;
      const categories = ["수호", "탑승", "변신"];
      pageState.activeSpirits = { 수호: null, 탑승: null, 변신: null };

      categories.forEach((category) => {
        const activeSpiritData = activeSpirits[category];
        if (activeSpiritData && activeSpiritData.name) {
          const fullSpirit = allSpirits.find(
            (s) => s.name === activeSpiritData.name && s.type === category
          );

          if (fullSpirit) {
            pageState.activeSpirits[category] = {
              ...fullSpirit,
              level: activeSpiritData.level || 0,
            };
          } else {
            Logger.warn(
              `사용중 환수를 찾을 수 없습니다: ${activeSpiritData.name} (${category})`
            );
            pageState.activeSpirits[category] = {
              name: activeSpiritData.name,
              level: activeSpiritData.level || 0,
            };
          }
        }
      });
    } else {
      pageState.activeSpirits = {
        수호: null,
        탑승: null,
        변신: null,
      };
    }

    // 전체 스탯 import
    if (data.userStats) {
      const statsValidation = validateUserStats(data.userStats);
      if (statsValidation.valid) {
        pageState.userStats = data.userStats;
      } else {
        Logger.warn(`스탯 검증 실패: ${statsValidation.error}`);
        pageState.userStats = {};
      }
    } else {
      pageState.userStats = {};
    }

    // 계산된 값들은 초기화
    pageState.baselineStats = {};
    pageState.baselineKeyStats = {
      tachaeTotal: 0,
      statusEffectResistance: 0,
      statusEffectAccuracy: 0,
    };
    pageState.savedSoulExp = 0;
    pageState.baselineStatsHash = null;
    pageState.baselineSoulExpHash = null;

    // 캐시 무효화
    pageState.lastTotalStatsHash = null;
    pageState.lastTotalStatsCalculation = null;
    pageState.lastSoulExpHash = null;
    pageState.lastSoulExpCalculation = null;
    pageState.isInitialLoad = true;

    // UI 업데이트
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
      const result = callbacks.updateTotalStats();
      if (result && typeof result.then === "function") {
        result
          .then(() => {
            // 붙여넣기 후 현재 계산된 환산타채 합을 기준값으로 설정 (증감 0으로 표시)
            const { allTotalStats } = calculateTotalStats(getSpiritsForCategory);
            
            const getTotalValue = (key) => {
              const baseValue = pageState.userStats[key] || 0;
              const totalStatsValue = allTotalStats[key] || 0;
              return Math.round(baseValue + totalStatsValue);
            };
            
            const currentTachaeTotal = Math.round(
              getTotalValue("damageResistancePenetration") +
              getTotalValue("damageResistance") +
              Math.round(Math.round(getTotalValue("pvpDamagePercent")) * 10) +
              Math.round(Math.round(getTotalValue("pvpDefensePercent")) * 10)
            );
            
            pageState.baselineKeyStats.tachaeTotal = currentTachaeTotal;
            pageState.baselineKeyStats.statusEffectResistance = getTotalValue("statusEffectResistance");
            pageState.baselineKeyStats.statusEffectAccuracy = getTotalValue("statusEffectAccuracy");
            
            // 개별 스탯 기준값도 설정
            const allStats = [...STATS_CONFIG];
            allStats.forEach((stat) => {
              const baseValue = pageState.userStats[stat.key] || 0;
              const totalStatsValue = allTotalStats[stat.key] || 0;
              pageState.baselineStats[stat.key] = Math.round(baseValue + totalStatsValue);
            });
            
            pageState.isInitialLoad = false;
          })
          .catch((error) => {
            Logger.error("Error updating stats after paste:", error);
            pageState.isInitialLoad = false;
          });
      } else {
        pageState.isInitialLoad = false;
      }
    } else {
      pageState.isInitialLoad = false;
    }

    if (callbacks.updateSoulExp) {
      pageState.lastSoulExpHash = null;
      pageState.lastSoulExpCalculation = null;
      callbacks.updateSoulExp();
    }

    Logger.log("클립보드에서 데이터를 가져왔습니다.");
    return true;
  } catch (error) {
    Logger.error("Error pasting from clipboard:", error);
    if (error.name === "NotAllowedError") {
      alert("클립보드 접근 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요.");
    } else {
      alert(`클립보드에서 데이터를 가져오는 중 오류가 발생했습니다: ${error.message}`);
    }
    return false;
  }
}

/**
 * JSON 파일 다운로드
 */
export function downloadJSON() {
  try {
    const jsonData = exportToJSON();
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const profileId = getCurrentProfileId();
    const profiles = getProfiles();
    const currentProfile = profileId
      ? profiles.find((p) => p.id === profileId)
      : null;
    const baseFileName = currentProfile
      ? `myInfo_${currentProfile.name}_${new Date().toISOString().split("T")[0]}.json`
      : `myInfo_${new Date().toISOString().split("T")[0]}.json`;
    const fileName = sanitizeFileName(baseFileName);
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Logger.log("JSON export completed");
  } catch (error) {
    Logger.error("Error exporting JSON:", error);
    alert("JSON 내보내기 중 오류가 발생했습니다.");
  }
}

/**
 * CSV로 Export
 * 카테고리별 환수 정보(환수명, 레벨, 각인), 사용중 환수, 전체 스탯
 * @returns {string} CSV 문자열
 */
export function exportToCSV() {
  const categories = ["수호", "탑승", "변신"];
  const rows = [];

  // 헤더
  rows.push("카테고리,환수명,레벨,활성화,등록효과1,등록효과2,등록효과3,등록효과4,장착효과");

  // 카테고리별 환수 데이터
  categories.forEach((category) => {
    const bondSpirits = pageState.bondSpirits[category] || [];
    bondSpirits.forEach((spirit) => {
      const isActive =
        pageState.activeSpirits[category]?.name === spirit.name;
      const engraving = pageState.engravingData[category]?.[spirit.name] || {};
      
      // 등록효과를 배열로 처리 (옵션1, 옵션2, 옵션3, 옵션4 개별 저장)
      let registrationArray = [];
      if (engraving.registration) {
        if (Array.isArray(engraving.registration)) {
          registrationArray = engraving.registration;
        } else if (typeof engraving.registration === "object") {
          // 객체 형태를 배열로 변환 (기존 호환성)
          registrationArray = Object.entries(engraving.registration).map(
            ([statKey, value]) => ({
              statKey: statKey,
              value: value || 0,
            })
          );
        }
      }
      
      // 등록효과를 옵션1~4로 개별 처리 (최대 4개)
      const regArray = [];
      for (let i = 0; i < 4; i++) {
        if (i < registrationArray.length && registrationArray[i]) {
          const item = registrationArray[i];
          regArray.push(`${item.statKey || ""}:${item.value || 0}`);
        } else {
          regArray.push("");
        }
      }

      // 장착효과
      const bindStats = engraving.bind || {};
      const bindStatsStr = Object.entries(bindStats)
        .map(([key, value]) => `${key}:${value}`)
        .join(";");

      rows.push(
        [
          category,
          spirit.name,
          spirit.level || 0,
          isActive ? "Y" : "N",
          regArray[0] || "",
          regArray[1] || "",
          regArray[2] || "",
          regArray[3] || "",
          bindStatsStr || "",
        ]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      );
    });
  });

  // 사용중 환수 섹션
  rows.push("");
  rows.push("=== 사용중 환수 ===");
  rows.push("카테고리,환수명,레벨");
  categories.forEach((category) => {
    const activeSpirit = pageState.activeSpirits[category];
    if (activeSpirit) {
      rows.push(
        [
          category,
          activeSpirit.name,
          activeSpirit.level || 0,
        ]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      );
    }
  });

  // 전체 스탯 섹션
  rows.push("");
  rows.push("=== 전체 스탯 ===");
  rows.push("스탯명,값");
  Object.entries(pageState.userStats).forEach(([key, value]) => {
    rows.push(
      [`"${key}"`, `"${value}"`].join(",")
    );
  });

  return rows.join("\n");
}

/**
 * CSV 파일 다운로드
 */
export function downloadCSV() {
  try {
    const csvData = exportToCSV();
    const blob = new Blob(["\uFEFF" + csvData], {
      type: "text/csv;charset=utf-8;",
    }); // BOM 추가로 한글 깨짐 방지
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const profileId = getCurrentProfileId();
    const profiles = getProfiles();
    const currentProfile = profileId
      ? profiles.find((p) => p.id === profileId)
      : null;
    const baseFileName = currentProfile
      ? `myInfo_${currentProfile.name}_${new Date().toISOString().split("T")[0]}.csv`
      : `myInfo_${new Date().toISOString().split("T")[0]}.csv`;
    const fileName = sanitizeFileName(baseFileName);
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Logger.log("CSV export completed");
  } catch (error) {
    Logger.error("Error exporting CSV:", error);
    alert("CSV 내보내기 중 오류가 발생했습니다.");
  }
}

/**
 * JSON 파일 Import
 * @param {File} file - JSON 파일
 * @param {Object} callbacks - UI 업데이트 콜백 함수들
 * @returns {Promise<boolean>} 성공 여부
 */
export async function importFromJSON(file, callbacks = {}) {
  return new Promise((resolve, reject) => {
    // 파일 크기 및 형식 검증
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      alert(sizeValidation.error);
      reject(new Error(sizeValidation.error));
      return;
    }

    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) {
      alert(typeValidation.error);
      reject(new Error(typeValidation.error));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const fileContent = e.target.result;
        
        // JSON 파싱 전 깊이 검증 (대략적인 검사)
        if (fileContent.length > MAX_FILE_SIZE) {
          throw new Error("파일 크기가 너무 큽니다.");
        }

        let importData;
        try {
          importData = JSON.parse(fileContent);
        } catch (parseError) {
          throw new Error(`JSON 파싱 오류: ${parseError.message}`);
        }

        // JSON 깊이 검증
        const depthValidation = validateJSONDepth(importData);
        if (!depthValidation.valid) {
          throw new Error(depthValidation.error);
        }

        // 버전 체크 (선택적)
        if (importData.version && importData.version !== "1.0") {
          if (
            !confirm(
              `이 파일은 버전 ${importData.version} 형식입니다. 계속하시겠습니까?`
            )
          ) {
            resolve(false);
            return;
          }
        }

        // 데이터 검증
        if (!importData.data) {
          throw new Error("잘못된 파일 형식입니다.");
        }

        const data = importData.data;

        // Import 데이터 검증
        const dataValidation = validateImportData(data);
        if (!dataValidation.valid) {
          throw new Error(dataValidation.error);
        }

        // 환수 정보 import (새 형식 또는 기존 형식 지원)
        // 실제 환수 객체를 찾아서 병합 (이미지 경로 등 전체 정보 포함)
        const allSpirits = Array.isArray(globalState.allSpirits)
          ? globalState.allSpirits
          : [];

        if (data.spirits) {
          // 새 형식: spirits 객체 사용
          const categories = ["수호", "탑승", "변신"];
          pageState.bondSpirits = { 수호: [], 탑승: [], 변신: [] };
          pageState.engravingData = { 수호: {}, 탑승: {}, 변신: {} };

          categories.forEach((category) => {
            const spirits = data.spirits[category] || [];
            // 카테고리별 환수 개수 제한
            if (spirits.length > MAX_SPIRITS_PER_CATEGORY) {
              Logger.warn(
                `${category} 환수가 너무 많습니다. 최대 ${MAX_SPIRITS_PER_CATEGORY}개만 사용합니다.`
              );
              spirits.splice(MAX_SPIRITS_PER_CATEGORY);
            }

            spirits.forEach((spiritData) => {
              // 추가 검증 (이미 validateImportData에서 검증했지만 이중 체크)
              const validation = validateSpirit(spiritData, category);
              if (!validation.valid) {
                Logger.warn(`환수 검증 실패: ${validation.error}`);
                return; // 잘못된 환수는 건너뛰기
              }

              // 실제 환수 객체 찾기
              const fullSpirit = allSpirits.find(
                (s) => s.name === spiritData.name && s.type === category
              );

              if (fullSpirit) {
                // 전체 환수 정보와 레벨, 각인 정보 병합
                pageState.bondSpirits[category].push({
                  ...fullSpirit,
                  level: spiritData.level || 0,
                });

                // 각인 데이터 처리 (있으면 저장, 없으면 빈 객체로 초기화)
                if (spiritData.engraving) {
                  // 각인 데이터도 검증
                  const engravingValidation = validateEngraving(spiritData.engraving);
                  if (engravingValidation.valid) {
                    // registration을 배열 형태로 변환 (객체면 변환)
                    let registrationArray = [];
                    if (spiritData.engraving.registration) {
                      if (Array.isArray(spiritData.engraving.registration)) {
                        registrationArray = spiritData.engraving.registration;
                      } else if (typeof spiritData.engraving.registration === "object") {
                        // 객체를 배열로 변환
                        registrationArray = Object.entries(spiritData.engraving.registration).map(
                          ([statKey, value]) => ({
                            statKey: statKey,
                            value: value || 0,
                          })
                        );
                      }
                    }
                    
                    pageState.engravingData[category][spiritData.name] = {
                      registration: registrationArray,
                      bind: spiritData.engraving.bind || {},
                    };
                    Logger.log(`각인 데이터 저장: ${category} - ${spiritData.name}`, {
                      registration: registrationArray,
                      bind: spiritData.engraving.bind || {},
                    });
                  } else {
                    Logger.warn(`각인 데이터 검증 실패: ${spiritData.name} - ${engravingValidation.error || '알 수 없는 오류'}`);
                    // 검증 실패해도 빈 객체로 초기화 (나중에 수정 가능하도록)
                    if (!pageState.engravingData[category][spiritData.name]) {
                      pageState.engravingData[category][spiritData.name] = {
                        registration: [],
                        bind: {},
                      };
                    }
                  }
                } else {
                  // 각인 데이터가 없어도 빈 객체로 초기화
                  if (!pageState.engravingData[category][spiritData.name]) {
                    pageState.engravingData[category][spiritData.name] = {
                      registration: [],
                      bind: {},
                    };
                  }
                }
              } else {
                Logger.warn(
                  `환수를 찾을 수 없습니다: ${spiritData.name} (${category})`
                );
                // 환수를 찾을 수 없어도 기본 정보만 저장
                pageState.bondSpirits[category].push({
                  name: spiritData.name,
                  level: spiritData.level || 0,
                });
              }
            });
          });
        } else {
          // 기존 형식 호환성 유지
          const categories = ["수호", "탑승", "변신"];
          const importedBondSpirits = data.bondSpirits || {
            수호: [],
            탑승: [],
            변신: [],
          };

          pageState.bondSpirits = { 수호: [], 탑승: [], 변신: [] };
          pageState.engravingData = data.engravingData || {
            수호: {},
            탑승: {},
            변신: {},
          };

          // 기존 형식도 실제 환수 객체와 병합
          categories.forEach((category) => {
            const spirits = importedBondSpirits[category] || [];
            spirits.forEach((spiritData) => {
              const fullSpirit = allSpirits.find(
                (s) => s.name === spiritData.name && s.type === category
              );

              if (fullSpirit) {
                pageState.bondSpirits[category].push({
                  ...fullSpirit,
                  level: spiritData.level || fullSpirit.level || 0,
                });
              } else {
                Logger.warn(
                  `환수를 찾을 수 없습니다: ${spiritData.name} (${category})`
                );
                pageState.bondSpirits[category].push({
                  name: spiritData.name,
                  level: spiritData.level || 0,
                });
              }
            });
          });
        }

        // 사용중 환수 import (실제 환수 객체와 병합)
        if (data.activeSpirits) {
          const activeSpirits = data.activeSpirits;
          const categories = ["수호", "탑승", "변신"];
          pageState.activeSpirits = { 수호: null, 탑승: null, 변신: null };

          categories.forEach((category) => {
            const activeSpiritData = activeSpirits[category];
            if (activeSpiritData && activeSpiritData.name) {
              // 실제 환수 객체 찾기
              const fullSpirit = allSpirits.find(
                (s) => s.name === activeSpiritData.name && s.type === category
              );

              if (fullSpirit) {
                pageState.activeSpirits[category] = {
                  ...fullSpirit,
                  level: activeSpiritData.level || 0,
                };
              } else {
                Logger.warn(
                  `사용중 환수를 찾을 수 없습니다: ${activeSpiritData.name} (${category})`
                );
                pageState.activeSpirits[category] = {
                  name: activeSpiritData.name,
                  level: activeSpiritData.level || 0,
                };
              }
            }
          });
        } else {
          pageState.activeSpirits = {
            수호: null,
            탑승: null,
            변신: null,
          };
        }

        // 전체 스탯 import (검증된 데이터만)
        if (data.userStats) {
          const statsValidation = validateUserStats(data.userStats);
          if (statsValidation.valid) {
            pageState.userStats = data.userStats;
          } else {
            Logger.warn(`스탯 검증 실패: ${statsValidation.error}`);
            pageState.userStats = {}; // 잘못된 스탯은 무시
          }
        } else {
          pageState.userStats = {};
        }

        // 계산된 값들은 초기화 (페이지에서 자동 계산됨)
        pageState.baselineStats = {};
        pageState.baselineKeyStats = {
          tachaeTotal: 0,
          statusEffectResistance: 0,
          statusEffectAccuracy: 0,
        };
        pageState.savedSoulExp = 0;
        pageState.baselineStatsHash = null;
        pageState.baselineSoulExpHash = null;

        // 캐시 무효화
        pageState.lastTotalStatsHash = null;
        pageState.lastTotalStatsCalculation = null;
        pageState.lastSoulExpHash = null;
        pageState.lastSoulExpCalculation = null;
        pageState.isInitialLoad = true;

        // UI 업데이트
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
          const result = callbacks.updateTotalStats();
          if (result && typeof result.then === "function") {
            result
              .then(() => {
                // 가져오기 후 현재 계산된 환산타채 합을 기준값으로 설정 (증감 0으로 표시)
                const { allTotalStats } = calculateTotalStats(getSpiritsForCategory);
                
                const getTotalValue = (key) => {
                  const baseValue = pageState.userStats[key] || 0;
                  const totalStatsValue = allTotalStats[key] || 0;
                  return Math.round(baseValue + totalStatsValue);
                };
                
                const currentTachaeTotal = Math.round(
                  getTotalValue("damageResistancePenetration") +
                  getTotalValue("damageResistance") +
                  Math.round(Math.round(getTotalValue("pvpDamagePercent")) * 10) +
                  Math.round(Math.round(getTotalValue("pvpDefensePercent")) * 10)
                );
                
                pageState.baselineKeyStats.tachaeTotal = currentTachaeTotal;
                pageState.baselineKeyStats.statusEffectResistance = getTotalValue("statusEffectResistance");
                pageState.baselineKeyStats.statusEffectAccuracy = getTotalValue("statusEffectAccuracy");
                
                // 개별 스탯 기준값도 설정
                const allStats = [...STATS_CONFIG];
                allStats.forEach((stat) => {
                  const baseValue = pageState.userStats[stat.key] || 0;
                  const totalStatsValue = allTotalStats[stat.key] || 0;
                  pageState.baselineStats[stat.key] = Math.round(baseValue + totalStatsValue);
                });
                
                pageState.isInitialLoad = false;
                resolve(true);
              })
              .catch((error) => {
                Logger.error("Error updating stats after import:", error);
                pageState.isInitialLoad = false;
                resolve(true);
              });
          } else {
            pageState.isInitialLoad = false;
            resolve(true);
          }
        } else {
          pageState.isInitialLoad = false;
          resolve(true);
        }

        if (callbacks.updateSoulExp) {
          // 캐시를 강제로 무효화하고 업데이트
          pageState.lastSoulExpHash = null;
          pageState.lastSoulExpCalculation = null;
          callbacks.updateSoulExp();
        }

        Logger.log("JSON import completed");
      } catch (error) {
        Logger.error("Error importing JSON:", error);
        alert(`JSON 가져오기 중 오류가 발생했습니다: ${error.message}`);
        reject(error);
      }
    };

    reader.onerror = () => {
      const error = new Error("파일 읽기 실패");
      Logger.error("Error reading file:", error);
      alert("파일을 읽을 수 없습니다.");
      reject(error);
    };

    reader.readAsText(file);
  });
}

/**
 * CSV 파일 Import (기본적인 환수 정보만)
 * @param {File} file - CSV 파일
 * @param {Object} callbacks - UI 업데이트 콜백 함수들
 * @returns {Promise<boolean>} 성공 여부
 */
export async function importFromCSV(file, callbacks = {}) {
  return new Promise((resolve, reject) => {
    // 파일 크기 및 형식 검증
    const sizeValidation = validateFileSize(file);
    if (!sizeValidation.valid) {
      alert(sizeValidation.error);
      reject(new Error(sizeValidation.error));
      return;
    }

    const typeValidation = validateFileType(file);
    if (!typeValidation.valid) {
      alert(typeValidation.error);
      reject(new Error(typeValidation.error));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const lines = csvText.split("\n").filter((line) => line.trim());

        // CSV 라인 수 검증
        const lineCountValidation = validateCSVLineCount(lines.length);
        if (!lineCountValidation.valid) {
          throw new Error(lineCountValidation.error);
        }

        // 헤더 확인
        if (lines.length === 0 || !lines[0].includes("카테고리")) {
          throw new Error("잘못된 CSV 형식입니다.");
        }

        // 환수 데이터 초기화
        const newBondSpirits = { 수호: [], 탑승: [], 변신: [] };
        const newActiveSpirits = { 수호: null, 탑승: null, 변신: null };
        const newEngravingData = { 수호: {}, 탑승: {}, 변신: {} };
        const newUserStats = {};

        // CSV 파싱 (간단한 파싱 - 쌍따옴표 처리)
        let currentSection = "spirits"; // spirits, activeSpirits, userStats
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // 섹션 변경 감지
          if (line.startsWith("=== 사용중 환수 ===")) {
            currentSection = "activeSpirits";
            i++; // 헤더 라인 스킵
            continue;
          } else if (line.startsWith("=== 전체 스탯 ===")) {
            currentSection = "userStats";
            i++; // 헤더 라인 스킵
            continue;
          } else if (line.startsWith("===")) {
            continue;
          }

          // 간단한 CSV 파싱 (쌍따옴표 내부의 쉼표 처리)
          const cells = [];
          let currentCell = "";
          let inQuotes = false;

          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              if (inQuotes && line[j + 1] === '"') {
                currentCell += '"';
                j++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === "," && !inQuotes) {
              cells.push(currentCell);
              currentCell = "";
            } else {
              currentCell += char;
            }
          }
          cells.push(currentCell);

          if (currentSection === "spirits") {
            // 환수 정보 섹션
            if (cells.length < 3) continue;

            const category = cells[0].replace(/"/g, "").trim();
            const spiritName = cells[1].replace(/"/g, "").trim();
            const level = parseInt(cells[2].replace(/"/g, "")) || 0;
            const isActive = cells[3]?.replace(/"/g, "").trim() === "Y";

            if (!["수호", "탑승", "변신"].includes(category)) continue;

            // 환수명 및 레벨 검증
            if (!isValidSpiritName(spiritName)) {
              Logger.warn(`환수명 검증 실패: ${spiritName}`);
              continue; // 잘못된 환수명은 건너뛰기
            }

            if (!isValidLevel(level)) {
              Logger.warn(`레벨 검증 실패: ${level}`);
              continue; // 잘못된 레벨은 건너뛰기
            }

            // 카테고리별 환수 개수 제한
            if (newBondSpirits[category].length >= MAX_SPIRITS_PER_CATEGORY) {
              Logger.warn(`${category} 환수가 최대 개수에 도달했습니다.`);
              continue;
            }

            // 실제 환수 객체 찾기
            const fullSpirit = allSpirits.find(
              (s) => s.name === spiritName && s.type === category
            );

            if (fullSpirit) {
              // 전체 환수 정보와 레벨 병합
              const spiritInfo = {
                ...fullSpirit,
                level: level,
              };
              newBondSpirits[category].push(spiritInfo);

              if (isActive) {
                newActiveSpirits[category] = spiritInfo;
              }
            } else {
              Logger.warn(
                `환수를 찾을 수 없습니다: ${spiritName} (${category})`
              );
              // 환수를 찾을 수 없어도 기본 정보만 저장
              const spiritInfo = {
                name: spiritName,
                level: level,
              };
              newBondSpirits[category].push(spiritInfo);

              if (isActive) {
                newActiveSpirits[category] = spiritInfo;
              }
            }

            // 각인 정보 파싱
            if (cells.length > 4) {
              const engraving = {
                registration: [], // 배열로 저장 (옵션1, 옵션2, 옵션3, 옵션4)
                bind: {},
              };

              // 등록효과를 배열로 저장 (옵션1, 옵션2, 옵션3, 옵션4 개별 저장)
              for (let j = 4; j < 8 && j < cells.length; j++) {
                if (cells[j] && cells[j].replace(/"/g, "").trim()) {
                  const regStat = cells[j].replace(/"/g, "").trim();
                  if (regStat.includes(":")) {
                    const [key, value] = regStat.split(":");
                    const statKey = key.trim();
                    const statValue = parseFloat(value.trim()) || 0;
                    
                    // 검증
                    if (isValidSpiritName(statKey) && isValidStatValue(statValue)) {
                      engraving.registration.push({
                        statKey: statKey,
                        value: statValue,
                      });
                    }
                  }
                }
              }

              // 장착효과
              if (cells[8] && cells[8].replace(/"/g, "")) {
                const bindStats = cells[8].replace(/"/g, "").trim();
                if (bindStats) {
                  bindStats.split(";").forEach((stat) => {
                    if (stat.includes(":")) {
                      const [key, value] = stat.split(":");
                      const statKey = key.trim();
                      const statValue = parseFloat(value.trim()) || 0;
                      
                      // 검증
                      if (isValidSpiritName(statKey) && isValidStatValue(statValue)) {
                        engraving.bind[statKey] = statValue;
                      }
                    }
                  });
                }
              }

              // 각인 정보 저장 (등록효과 또는 장착효과가 있으면 저장, 없어도 빈 객체로 초기화)
              newEngravingData[category][spiritName] = engraving;
              Logger.log(`CSV 각인 데이터 저장: ${category} - ${spiritName}`, engraving);
            }
          } else if (currentSection === "activeSpirits") {
            // 사용중 환수 섹션
            if (cells.length < 3) continue;

            const category = cells[0].replace(/"/g, "");
            const spiritName = cells[1].replace(/"/g, "");
            const level = parseInt(cells[2].replace(/"/g, "")) || 0;

            if (["수호", "탑승", "변신"].includes(category)) {
              // 실제 환수 객체 찾기
              const fullSpirit = allSpirits.find(
                (s) => s.name === spiritName && s.type === category
              );

              if (fullSpirit) {
                newActiveSpirits[category] = {
                  ...fullSpirit,
                  level: level,
                };
              } else {
                Logger.warn(
                  `사용중 환수를 찾을 수 없습니다: ${spiritName} (${category})`
                );
                newActiveSpirits[category] = {
                  name: spiritName,
                  level: level,
                };
              }
            }
          } else if (currentSection === "userStats") {
            // 전체 스탯 섹션
            if (cells.length < 2) continue;

            const statKey = cells[0].replace(/"/g, "").trim();
            const statValue = parseFloat(cells[1].replace(/"/g, "").trim()) || 0;

            // 검증
            if (isValidSpiritName(statKey) && isValidStatValue(statValue)) {
              newUserStats[statKey] = statValue;
            } else {
              Logger.warn(`스탯 검증 실패: ${statKey}=${statValue}`);
            }
          }
        }

        // 데이터 적용
        pageState.bondSpirits = newBondSpirits;
        pageState.activeSpirits = newActiveSpirits;
        pageState.engravingData = newEngravingData;
        pageState.userStats = newUserStats;

        // 계산된 값들은 초기화 (페이지에서 자동 계산됨)
        pageState.baselineStats = {};
        pageState.baselineKeyStats = {
          tachaeTotal: 0,
          statusEffectResistance: 0,
          statusEffectAccuracy: 0,
        };
        pageState.savedSoulExp = 0;
        pageState.baselineStatsHash = null;
        pageState.baselineSoulExpHash = null;

        // 캐시 무효화
        pageState.lastTotalStatsHash = null;
        pageState.lastTotalStatsCalculation = null;
        pageState.lastSoulExpHash = null;
        pageState.lastSoulExpCalculation = null;
        pageState.isInitialLoad = true;

        // UI 업데이트
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
        if (callbacks.updateTotalStats) {
          const result = callbacks.updateTotalStats();
          if (result && typeof result.then === "function") {
            result
              .then(() => {
                // 가져오기 후 현재 계산된 환산타채 합을 기준값으로 설정 (증감 0으로 표시)
                const { allTotalStats } = calculateTotalStats(getSpiritsForCategory);
                
                const getTotalValue = (key) => {
                  const baseValue = pageState.userStats[key] || 0;
                  const totalStatsValue = allTotalStats[key] || 0;
                  return Math.round(baseValue + totalStatsValue);
                };
                
                const currentTachaeTotal = Math.round(
                  getTotalValue("damageResistancePenetration") +
                  getTotalValue("damageResistance") +
                  Math.round(Math.round(getTotalValue("pvpDamagePercent")) * 10) +
                  Math.round(Math.round(getTotalValue("pvpDefensePercent")) * 10)
                );
                
                pageState.baselineKeyStats.tachaeTotal = currentTachaeTotal;
                pageState.baselineKeyStats.statusEffectResistance = getTotalValue("statusEffectResistance");
                pageState.baselineKeyStats.statusEffectAccuracy = getTotalValue("statusEffectAccuracy");
                
                // 개별 스탯 기준값도 설정
                const allStats = [...STATS_CONFIG];
                allStats.forEach((stat) => {
                  const baseValue = pageState.userStats[stat.key] || 0;
                  const totalStatsValue = allTotalStats[stat.key] || 0;
                  pageState.baselineStats[stat.key] = Math.round(baseValue + totalStatsValue);
                });
                
                pageState.isInitialLoad = false;
                resolve(true);
              })
              .catch((error) => {
                Logger.error("Error updating stats after import:", error);
                pageState.isInitialLoad = false;
                resolve(true);
              });
          } else {
            pageState.isInitialLoad = false;
            resolve(true);
          }
        } else {
          pageState.isInitialLoad = false;
          resolve(true);
        }

        if (callbacks.updateSoulExp) {
          // 캐시를 강제로 무효화하고 업데이트
          pageState.lastSoulExpHash = null;
          pageState.lastSoulExpCalculation = null;
          callbacks.updateSoulExp();
        }

        Logger.log("CSV import completed");
      } catch (error) {
        Logger.error("Error importing CSV:", error);
        alert(`CSV 가져오기 중 오류가 발생했습니다: ${error.message}`);
        reject(error);
      }
    };

    reader.onerror = () => {
      const error = new Error("파일 읽기 실패");
      Logger.error("Error reading file:", error);
      alert("파일을 읽을 수 없습니다.");
      reject(error);
    };

    reader.readAsText(file, "UTF-8");
  });
}

/**
 * 파일 선택 다이얼로그 표시
 * @param {string} accept - 허용할 파일 형식 (예: ".json,.csv")
 * @param {Function} onFileSelected - 파일 선택 시 콜백
 */
export function showFileInput(accept, onFileSelected) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.style.display = "none";

  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelected(file);
    }
    document.body.removeChild(input);
  });

  document.body.appendChild(input);
  input.click();
}

