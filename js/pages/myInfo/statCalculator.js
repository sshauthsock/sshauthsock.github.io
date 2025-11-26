/**
 * 스탯 계산 모듈
 * 환수 결속/활성 스탯 계산 및 합산
 */

import { pageState, elements } from "./state.js";
import { STATS_CONFIG, MOBILE_STAT_NAME_MAP } from "./constants.js";
import { GRADE_SET_EFFECTS, FACTION_SET_EFFECTS } from "../../constants.js";
import { createElement } from "../../utils.js";
import { isMobile } from "./ui/renderer.js";
import Logger from "../../utils/logger.js";

/**
 * 합산 스탯 데이터 해시 생성
 * @returns {string} 해시 문자열
 */
export function generateTotalStatsHash(getSpiritsForCategory) {
  const categories = ["수호", "탑승", "변신"];
  const hashParts = [];

  // 결속 환수 해시 (정렬하여 순서에 무관하게 동일한 해시 생성)
  // updateTotalStats와 동일한 로직으로 등급/세력 집계
  categories.forEach((category) => {
    const bondSpirits = pageState.bondSpirits[category] || [];

    // 등급/세력 집계를 해시에 포함 (등급/세력 효과 계산을 위해)
    const gradeCounts = {};
    const factionCounts = {};

    // 결속 환수의 등급/세력 집계
    if (bondSpirits.length > 0 && getSpiritsForCategory) {
      bondSpirits.forEach((bondSpirit) => {
        const spirit = getSpiritsForCategory(category).find(
          (s) => s.name === bondSpirit.name
        );
        if (spirit) {
          if (spirit.grade) {
            gradeCounts[spirit.grade] = (gradeCounts[spirit.grade] || 0) + 1;
          }
          if (spirit.influence) {
            factionCounts[spirit.influence] =
              (factionCounts[spirit.influence] || 0) + 1;
          }
        }
      });
    }

    // active 환수도 등급/세력 집계에 포함 (결속 슬롯에 없을 경우)
    const active = pageState.activeSpirits[category];
    if (active && active.name && getSpiritsForCategory) {
      const isInBond = bondSpirits.some((s) => s.name === active.name);
      if (!isInBond) {
        const activeSpirit = getSpiritsForCategory(category).find(
          (s) => s.name === active.name
        );
        if (activeSpirit) {
          if (activeSpirit.grade) {
            gradeCounts[activeSpirit.grade] =
              (gradeCounts[activeSpirit.grade] || 0) + 1;
          }
          if (activeSpirit.influence) {
            factionCounts[activeSpirit.influence] =
              (factionCounts[activeSpirit.influence] || 0) + 1;
          }
        }
      }
    }

    // 등급/세력 집계를 해시에 포함
    const gradeStr = Object.entries(gradeCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([grade, count]) => `${grade}:${count}`)
      .join(",");
    const factionStr = Object.entries(factionCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([faction, count]) => `${faction}:${count}`)
      .join(",");

    if (bondSpirits.length > 0) {
      // 환수 이름과 레벨로 정렬하여 일관된 해시 생성
      const sortedBondSpirits = [...bondSpirits].sort((a, b) => {
        const nameCompare = (a.name || "").localeCompare(b.name || "");
        if (nameCompare !== 0) return nameCompare;
        return (a.level || 25) - (b.level || 25);
      });

      hashParts.push(
        `${category}_bond:${sortedBondSpirits
          .map((s) => `${s.name}:${s.level || 25}`)
          .join(",")}|grades:${gradeStr}|factions:${factionStr}`
      );
    } else if (gradeStr || factionStr) {
      // bondSpirits가 없어도 active 환수로 인해 등급/세력 집계가 있을 수 있음
      hashParts.push(
        `${category}_bond:|grades:${gradeStr}|factions:${factionStr}`
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

  // 각인 데이터 해시 (JSON.stringify로 정확한 직렬화)
  categories.forEach((category) => {
    const engravingData = pageState.engravingData[category] || {};
    if (Object.keys(engravingData).length > 0) {
      // 각인 데이터를 정렬하여 일관된 해시 생성
      const sortedEngraving = Object.entries(engravingData)
        .sort(([a], [b]) => a.localeCompare(b))
        .reduce((acc, [spiritName, stats]) => {
          acc[spiritName] = stats;
          return acc;
        }, {});
      const engravingStr = JSON.stringify(sortedEngraving);
      hashParts.push(`${category}_engraving:${engravingStr}`);
    }
  });

  // 기본 스탯 해시
  const userStatsStr = Object.entries(pageState.userStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(",");
  hashParts.push(`userStats:${userStatsStr}`);

  // 각인 데이터 해시 추가 (각인 변경 시 캐시 무효화를 위해)
  const engravingStr = JSON.stringify(pageState.engravingData);
  hashParts.push(`engravingData:${engravingStr}`);

  return hashParts.join("|");
}

/**
 * 결속 계산 캐시 키 생성
 * @param {string} category - 카테고리
 * @param {Array} bondSpirits - 결속 환수 배열
 * @returns {string} 캐시 키
 */
export function generateBondCacheKey(category, bondSpirits) {
  const spiritsKey = bondSpirits
    .map((s) => `${s.name}:${s.level || 25}`)
    .sort()
    .join(",");
  return `${category}_${spiritsKey}`;
}

/**
 * 주요 스탯 업데이트 (환산타채 합, 각인 효과 등)
 * @param {Array} allStats - 모든 스탯 설정
 * @param {Object} allTotalStats - 전체 스탯 합산값
 * @param {Object} allActiveStats - 활성 스탯 (사용하지 않지만 호환성을 위해 유지)
 * @param {boolean} forceZeroChange - 증감을 0으로 강제 설정
 * @param {Function} updateStatItemsWithValues - 스탯 아이템 업데이트 함수
 */
export function updateKeyStats(
  allStats,
  allTotalStats,
  allActiveStats,
  forceZeroChange = false,
  updateStatItemsWithValues
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
  // 각인 등록효과는 사용 중인 환수(activeSpirits)에만 적용됨
  const registrationStats = {};
  const categories = ["수호", "탑승", "변신"];
  categories.forEach((category) => {
    const active = pageState.activeSpirits[category];
    if (active && active.name) {
      // engravingData에서 해당 환수의 각인 데이터 가져오기
      const categoryEngravingData = pageState.engravingData[category] || {};
      const engraving = categoryEngravingData[active.name] || {};

      // 새로운 데이터 구조: { registration: [...], bind: {...} }
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

      // 기존 데이터 구조 호환성 (하위 호환)
      // registration과 bind 속성이 없으면 기존 구조로 간주
      if (
        !engraving.registration &&
        !engraving.bind &&
        Object.keys(engraving).length > 0
      ) {
        Object.entries(engraving).forEach(([statKey, engravingData]) => {
          let registrationValue = 0;
          if (typeof engravingData === "object" && engravingData !== null) {
            registrationValue = engravingData.registration || 0;
          } else {
            registrationValue = engravingData || 0;
          }
          const numValue =
            typeof registrationValue === "number"
              ? registrationValue
              : parseFloat(registrationValue) || 0;
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

      // 새로운 데이터 구조: { registration: [...], bind: {...} }
      if (engraving.bind) {
        Object.entries(engraving.bind).forEach(([statKey, value]) => {
          const numValue =
            typeof value === "number" ? value : parseFloat(value) || 0;
          if (numValue > 0) {
            bindStats[statKey] = (bindStats[statKey] || 0) + numValue;
          }
        });
      }

      // 기존 데이터 구조 호환성 (하위 호환)
      // registration과 bind 속성이 없으면 기존 구조로 간주
      if (
        !engraving.registration &&
        !engraving.bind &&
        Object.keys(engraving).length > 0
      ) {
        Object.entries(engraving).forEach(([statKey, engravingData]) => {
          let bindValue = 0;
          if (typeof engravingData === "object" && engravingData !== null) {
            bindValue = engravingData.bind || 0;
          } else {
            bindValue = engravingData || 0;
          }
          const numValue =
            typeof bindValue === "number"
              ? bindValue
              : parseFloat(bindValue) || 0;
          if (numValue > 0) {
            bindStats[statKey] = (bindStats[statKey] || 0) + numValue;
          }
        });
      }
    });
  });

  // 변화값 계산
  // 디버깅: 환산타채 합 계산 값 확인
  // baseline이 설정되지 않은 경우 (기준값 저장 버튼을 누르지 않은 경우)는 이상값 감지하지 않음
  const hasBaseline =
    pageState.baselineKeyStats.tachaeTotal !== undefined &&
    pageState.baselineKeyStats.tachaeTotal !== null &&
    pageState.baselineKeyStats.tachaeTotal !== 0;

  // baseline이 설정되어 있고, 차이가 1000 이상일 때만 이상값 감지
  if (hasBaseline && Math.abs(tachaeTotal - baselineTachaeTotal) > 1000) {
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
      baselineTachaeTotal = recalculatedBaseline;
      // 재계산된 값을 저장 (저장 버튼을 눌러야 실제로 저장됨)
      pageState.baselineKeyStats.tachaeTotal = recalculatedBaseline;
    }
  }

  const tachaeChange = forceZeroChange ? 0 : tachaeTotal - baselineTachaeTotal;

  // UI 업데이트
  const tachaeValueEl = elements.container?.querySelector("#keyStatTachae");
  const tachaeChangeEl = elements.container?.querySelector(
    "#keyStatTachaeChange"
  );
  const registrationListEl = elements.container?.querySelector(
    "#keyStatRegistrationList"
  );
  const bindListEl = elements.container?.querySelector("#keyStatBindList");

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

/**
 * 전체 스탯 계산 (baseline 저장과 현재 계산에서 공통으로 사용)
 * @param {Function} getSpiritsForCategory - 카테고리별 환수 가져오기 함수
 * @returns {Object} { allTotalStats, allBondStats, allActiveStats }
 */
export function calculateTotalStats(getSpiritsForCategory) {
  // 각 카테고리별 결속 계산
  const categories = ["수호", "탑승", "변신"];
  const allBondStats = {};
  const allActiveStats = {};
  const allTotalStats = {}; // 새로운 전체 스탯 변수

  // 각 카테고리별로 계산
  for (const category of categories) {
    const bondSpirits = pageState.bondSpirits[category] || [];
    if (bondSpirits.length === 0) continue;

    // 등급별 개수 집계
    const gradeCounts = {};
    const factionCounts = {};

    // 결속 환수의 장착효과 합산 및 등급/세력 집계
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
            // 모든 스탯은 정수로 반올림
            const numValue =
              typeof value === "number" ? value : parseFloat(value) || 0;
            const roundedValue = Math.round(numValue);
            allBondStats[key] = (allBondStats[key] || 0) + roundedValue;
            allTotalStats[key] = (allTotalStats[key] || 0) + roundedValue;
          });
        }
      }
    }

    // 사용 중인 환수가 결속 슬롯에 없을 경우를 대비해 등급/세력 집계에 추가
    const active = pageState.activeSpirits[category];
    if (active && active.name) {
      // 사용 중인 환수가 결속 슬롯에 있는지 확인
      const isInBond = bondSpirits.some((s) => s.name === active.name);
      if (!isInBond) {
        // 결속 슬롯에 없으면 등급/세력 집계에 추가
        const activeSpirit = getSpiritsForCategory(category).find(
          (s) => s.name === active.name
        );
        if (activeSpirit) {
          if (activeSpirit.grade) {
            gradeCounts[activeSpirit.grade] =
              (gradeCounts[activeSpirit.grade] || 0) + 1;
          }
          if (activeSpirit.influence) {
            factionCounts[activeSpirit.influence] =
              (factionCounts[activeSpirit.influence] || 0) + 1;
          }
        }
      }
    }

    // 등급효과 계산
    const categoryGradeEffects = GRADE_SET_EFFECTS[category];
    const gradeEffectsApplied = {};
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
            // 모든 스탯은 정수로 반올림
            const roundedValue = Math.round(value);
            allTotalStats[statKey] =
              (allTotalStats[statKey] || 0) + roundedValue;
            // 로그를 위한 등급효과 기록
            if (!gradeEffectsApplied[statKey]) gradeEffectsApplied[statKey] = 0;
            gradeEffectsApplied[statKey] += roundedValue;
          });
        }
      });
    }

    // 세력효과 계산
    const factionEffectsApplied = {};
    const categoryFactionEffects = FACTION_SET_EFFECTS[category];
    if (categoryFactionEffects) {
      Object.entries(factionCounts).forEach(([faction, count]) => {
        const factionRules = categoryFactionEffects[faction];
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
            // 모든 스탯은 정수로 반올림
            const roundedValue = Math.round(value);
            allTotalStats[statKey] =
              (allTotalStats[statKey] || 0) + roundedValue;
            // 로그를 위한 세력효과 기록
            if (!factionEffectsApplied[statKey])
              factionEffectsApplied[statKey] = 0;
            factionEffectsApplied[statKey] += roundedValue;
          });
        }
      });
    }

    // 등급/세력 효과 로그 출력
    if (
      Object.keys(gradeEffectsApplied).length > 0 ||
      Object.keys(factionEffectsApplied).length > 0
    ) {
    }

    // 사용 중인 환수의 등록효과 추가
    if (active) {
      const spirit = getSpiritsForCategory(category).find(
        (s) => s.name === active.name
      );
      if (spirit) {
        const levelStat = spirit.stats?.find((s) => s.level === active.level);
        if (levelStat?.registrationStat) {
          Object.entries(levelStat.registrationStat).forEach(([key, value]) => {
            // 모든 스탯은 정수로 반올림
            const numValue =
              typeof value === "number" ? value : parseFloat(value) || 0;
            const roundedValue = Math.round(numValue);
            allActiveStats[key] = (allActiveStats[key] || 0) + roundedValue;
            allTotalStats[key] = (allTotalStats[key] || 0) + roundedValue;
          });
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
          // 모든 스탯은 정수로 반올림
          const numValue =
            typeof value === "number" ? value : parseFloat(value) || 0;
          const roundedValue = Math.round(numValue);
          if (roundedValue > 0) {
            allTotalStats[statKey] =
              (allTotalStats[statKey] || 0) + roundedValue;
          }
        });
      }

      // 기존 데이터 구조 호환성 (하위 호환)
      if (
        !engraving.registration &&
        !engraving.bind &&
        Object.keys(engraving).length > 0
      ) {
        Object.entries(engraving).forEach(([statKey, engravingData]) => {
          let bindValue = 0;
          if (typeof engravingData === "object" && engravingData !== null) {
            bindValue = engravingData.bind || 0;
          } else {
            bindValue = engravingData || 0;
          }
          const numValue =
            typeof bindValue === "number"
              ? bindValue
              : parseFloat(bindValue) || 0;
          if (numValue > 0) {
            allTotalStats[statKey] = (allTotalStats[statKey] || 0) + numValue;
          }
        });
      }
    }

    // 사용 중인 환수의 각인 등록효과 (배열의 모든 항목 합산)
    if (active) {
      const engraving = pageState.engravingData[category]?.[active.name] || {};

      // 새로운 데이터 구조: { registration: [...], bind: {...} }
      if (Array.isArray(engraving.registration)) {
        engraving.registration.forEach((regItem) => {
          const statKey = regItem.statKey;
          const value = regItem.value || 0;
          // 모든 스탯은 정수로 반올림
          const numValue =
            typeof value === "number" ? value : parseFloat(value) || 0;
          const roundedValue = Math.round(numValue);
          if (roundedValue > 0 && statKey) {
            allTotalStats[statKey] =
              (allTotalStats[statKey] || 0) + roundedValue;
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
            allTotalStats[statKey] =
              (allTotalStats[statKey] || 0) + registrationValue;
          }
        });
      }
    }
  }

  return { allTotalStats, allBondStats, allActiveStats };
}

/**
 * 전체 스탯 업데이트
 * @param {Function} getSpiritsForCategory - 카테고리별 환수 가져오기 함수
 * @param {Function} updateStatItemsWithValues - 스탯 아이템 업데이트 함수
 */
export async function updateTotalStats(
  getSpiritsForCategory,
  updateStatItemsWithValues
) {
  // 기준값 저장 중이면 업데이트하지 않음
  if (pageState.isSavingBaseline) {
    return Promise.resolve();
  }

  // 이미 실행 중이면 중복 호출 방지
  if (pageState.isUpdatingTotalStats) {
    return Promise.resolve();
  }

  pageState.isUpdatingTotalStats = true;

  // 캐시 확인
  const currentHash = generateTotalStatsHash(getSpiritsForCategory);
  if (
    pageState.lastTotalStatsHash === currentHash &&
    pageState.lastTotalStatsCalculation
  ) {
    // 이미 계산된 경우 저장된 계산 결과로 스탯 아이템만 업데이트
    const calc = pageState.lastTotalStatsCalculation;

    // baseline 비교 수행 (캐시된 결과를 사용할 때도 baseline 비교 필요)
    let shouldForceZeroChange = pageState.isInitialLoad;
    if (pageState.baselineStatsHash) {
      if (currentHash === pageState.baselineStatsHash) {
        shouldForceZeroChange = true;
      } else {
        // 해시가 불일치하더라도 실제 계산값이 baseline과 동일한지 확인
        const allStatsForCheck = [...STATS_CONFIG];
        let isActuallySame = true;

        for (const stat of allStatsForCheck) {
          const baseValue = pageState.userStats[stat.key] || 0;
          const totalStatsValue =
            (calc.allTotalStats || calc.allBondStats)[stat.key] || 0;
          const currentValue = Math.round(baseValue + totalStatsValue);
          const baselineValue = pageState.baselineStats.hasOwnProperty(stat.key)
            ? pageState.baselineStats[stat.key]
            : currentValue;

          if (Math.abs(currentValue - baselineValue) > 0.5) {
            isActuallySame = false;
            break;
          }
        }

        if (isActuallySame) {
          const getTotalValue = (key) => {
            const baseValue = pageState.userStats[key] || 0;
            const totalStatsValue =
              (calc.allTotalStats || calc.allBondStats)[key] || 0;
            return Math.round(baseValue + totalStatsValue);
          };

          const currentTachae = Math.round(
            getTotalValue("damageResistancePenetration") +
              getTotalValue("damageResistance") +
              Math.round(Math.round(getTotalValue("pvpDamagePercent")) * 10) +
              Math.round(Math.round(getTotalValue("pvpDefensePercent")) * 10)
          );

          const baselineTachae = pageState.baselineKeyStats.tachaeTotal || 0;
          if (Math.abs(currentTachae - baselineTachae) > 0.5) {
            isActuallySame = false;
          }
        }

        shouldForceZeroChange = isActuallySame;
      }
    }

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
      shouldForceZeroChange,
      updateStatItemsWithValues
    );
    pageState.isUpdatingTotalStats = false;
    return Promise.resolve();
  }

  try {
    // 공통 계산 함수 사용
    const { allTotalStats, allBondStats, allActiveStats } = calculateTotalStats(
      getSpiritsForCategory
    );

    // baselineStatsHash와 currentHash 비교하여 baselineStats 자동 업데이트
    // (사용중 환수 변경 등으로 저장된 상태로 돌아온 경우)
    let shouldForceZeroChange = pageState.isInitialLoad;

    // baselineStatsHash는 저장 버튼을 눌렀을 때만 업데이트되므로
    // 여기서는 해시 비교만 하고 baselineStats는 변경하지 않음
    // 증감 계산은 항상 저장된 baselineStats와 현재 계산값을 비교하여 수행
    if (pageState.baselineStatsHash) {
      if (currentHash === pageState.baselineStatsHash) {
        // 현재 상태가 저장된 baseline과 일치하면 증감을 0으로 표시
        shouldForceZeroChange = true;
      } else {
        // 해시가 불일치하더라도 실제 계산값이 baseline과 동일한지 확인
        // (해시 생성 로직 변경 등으로 해시가 달라졌을 수 있음)
        const allStatsForCheck = [...STATS_CONFIG];
        let isActuallySame = true;

        for (const stat of allStatsForCheck) {
          const baseValue = pageState.userStats[stat.key] || 0;
          const totalStatsValue = allTotalStats[stat.key] || 0;
          const currentValue = Math.round(baseValue + totalStatsValue);
          // baseline이 없으면 현재 값을 baseline으로 사용 (증감 0)
          // baseline이 있으면 저장된 값과 비교
          const baselineValue = pageState.baselineStats.hasOwnProperty(stat.key)
            ? pageState.baselineStats[stat.key]
            : currentValue;

          // 정수 비교이므로 0.5 사용 (반올림 오차 고려)
          if (Math.abs(currentValue - baselineValue) > 0.5) {
            isActuallySame = false;
            break;
          }
        }

        // 주요 스탯도 확인 (환산타채 합 등)
        if (isActuallySame) {
          const getTotalValue = (key) => {
            const baseValue = pageState.userStats[key] || 0;
            const totalStatsValue = allTotalStats[key] || 0;
            return Math.round(baseValue + totalStatsValue);
          };

          const currentTachae = Math.round(
            getTotalValue("damageResistancePenetration") +
              getTotalValue("damageResistance") +
              Math.round(Math.round(getTotalValue("pvpDamagePercent")) * 10) +
              Math.round(Math.round(getTotalValue("pvpDefensePercent")) * 10)
          );

          const baselineTachae = pageState.baselineKeyStats.tachaeTotal || 0;
          // 정수 비교이므로 0.5 사용 (반올림 오차 고려)
          if (Math.abs(currentTachae - baselineTachae) > 0.5) {
            isActuallySame = false;
          }
        }

        shouldForceZeroChange = isActuallySame;
      }
    } else {
      // baselineStatsHash가 없으면 초기화 (저장 버튼을 누르기 전까지는 해시 설정 안 함)
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
    updateKeyStats(
      allStats,
      allTotalStats,
      {},
      shouldForceZeroChange,
      updateStatItemsWithValues
    );

    // 결과 캐싱
    pageState.lastTotalStatsHash = currentHash;
    pageState.lastTotalStatsCalculation = {
      allStats,
      allBondStats,
      allActiveStats,
      allTotalStats, // 새로운 전체 스탯 변수
    };
  } catch (error) {
    Logger.error("Error updating total stats:", error);
    // 에러가 발생해도 페이지는 표시되도록 (컨테이너를 덮어쓰지 않음)
    // 스탯 계산은 실패했지만 기본 UI는 유지됨
  } finally {
    pageState.isUpdatingTotalStats = false;
  }
}
