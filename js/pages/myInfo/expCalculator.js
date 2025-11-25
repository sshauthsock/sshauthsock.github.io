/**
 * 경험치 계산 모듈
 * 환수 초기화 시 획득 가능한 경험치 계산
 */

import { pageState, elements } from "./state.js";
import * as api from "../../api.js";
import Logger from "../../utils/logger.js";

/**
 * 경험치 테이블 가져오기 (localStorage 캐싱 사용)
 * @returns {Promise<Object|null>} 경험치 테이블 또는 null
 */
export async function getExpTable() {
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

/**
 * 경험치 테이블을 사용하여 직접 계산
 * @param {Object} expTable - 경험치 테이블
 * @param {string} type - 경험치 타입 ("legend" | "immortal")
 * @param {number} currentLevel - 현재 레벨
 * @param {number} targetLevel - 목표 레벨
 * @returns {number} 필요한 경험치
 */
export function calculateExpFromTable(expTable, type, currentLevel, targetLevel) {
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

/**
 * 데이터 해시 생성 (캐시 무효화 확인용)
 * @returns {string} 해시 문자열
 */
export function generateSoulExpHash() {
  const categories = ["수호", "탑승", "변신"];
  const hashData = categories
    .map((category) => {
      const bondSpirits = pageState.bondSpirits[category] || [];
      return bondSpirits.map((s) => `${s.name}:${s.level || 25}`).join(",");
    })
    .join("|");
  return hashData;
}

/**
 * 환수 혼 경험치 업데이트 및 표시
 * @param {Function} getSpiritsForCategory - 카테고리별 환수 가져오기 함수
 */
export async function updateSoulExp(getSpiritsForCategory) {
  const container = elements.soulExpInfo;
  if (!container) return;

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

