/**
 * 스탯 UI 렌더링 모듈
 * 스탯 표시 및 편집 UI 관리
 */

import { pageState, elements } from "./state.js";
import {
  COLUMN_1_STATS,
  COLUMN_2_STATS,
  COLUMN_3_STATS,
  MOBILE_STAT_NAME_MAP,
  SPECIAL_STAT_CLASSES,
  SECONDARY_STAT_CLASSES,
  STATS_CONFIG,
} from "./constants.js";
import { createElement } from "../../utils.js";
import { isMobile } from "./ui/renderer.js";

/**
 * 스탯 목록 렌더링
 * @param {Function} handleStatEditCallback - 스탯 편집 핸들러 콜백
 */
export function renderStats(handleStatEditCallback) {
  const column1 = elements.statsColumn1;
  const column2 = elements.statsColumn2;
  const column3 = elements.statsColumn3;

  if (!column1 || !column2 || !column3) return;

  column1.innerHTML = "";
  column2.innerHTML = "";
  column3.innerHTML = "";

  COLUMN_1_STATS.forEach((stat) => {
    const item = createStatItem(stat, handleStatEditCallback);
    column1.appendChild(item);
  });

  COLUMN_2_STATS.forEach((stat) => {
    const item = createStatItem(stat, handleStatEditCallback);
    column2.appendChild(item);
  });

  COLUMN_3_STATS.forEach((stat) => {
    const item = createStatItem(stat, handleStatEditCallback);
    column3.appendChild(item);
  });
}

/**
 * 스탯 아이템 생성
 * @param {Object} stat - 스탯 설정 객체
 * @param {Function} handleStatEditCallback - 스탯 편집 핸들러 콜백
 * @returns {HTMLElement} 스탯 아이템 요소
 */
export function createStatItem(stat, handleStatEditCallback) {
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
  if (handleStatEditCallback) {
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
      handleStatEditCallback(item, stat.key, baseValue);
    });
  }

  return item;
}

/**
 * 스탯 편집 핸들러
 * @param {HTMLElement} item - 스탯 아이템 요소
 * @param {string} statKey - 스탯 키
 * @param {HTMLElement} valueSpan - 기본값 스팬 요소
 * @param {Function} getSpiritsForCategory - 카테고리별 환수 가져오기 함수
 * @param {Function} debouncedUpdateTotalStats - 디바운스된 스탯 업데이트 함수
 * @param {Function} updateKeyStats - 주요 스탯 업데이트 함수
 */
export function handleStatEdit(
  item,
  statKey,
  valueSpan,
  getSpiritsForCategory,
  debouncedUpdateTotalStats,
  updateKeyStats
) {
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
        if (active && getSpiritsForCategory) {
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

    }

    // 스탯 업데이트 (합산합 재계산)
    if (debouncedUpdateTotalStats) {
      debouncedUpdateTotalStats();
    }

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
    if (updateKeyStats && pageState.lastTotalStatsCalculation) {
      const calc = pageState.lastTotalStatsCalculation;
      updateKeyStats(STATS_CONFIG, calc.allTotalStats || calc.allBondStats, {});
    } else if (updateKeyStats) {
      // 캐시가 없으면 최소한의 계산만 수행
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

/**
 * 스탯 아이템 업데이트 (캐시 확인)
 * @param {Function} debouncedUpdateTotalStats - 디바운스된 스탯 업데이트 함수
 */
export function updateStatItems(debouncedUpdateTotalStats) {
  // 캐시된 계산 결과가 없으면 재계산
  if (!pageState.lastTotalStatsHash) {
    if (debouncedUpdateTotalStats) {
      debouncedUpdateTotalStats();
    }
    return;
  }

  // 캐시된 값으로 스탯 아이템만 업데이트
  // 실제 계산은 updateTotalStats에서 수행되므로 여기서는 스킵
  // 대신 updateTotalStats가 호출되도록 함
  if (debouncedUpdateTotalStats) {
    debouncedUpdateTotalStats();
  }
}

/**
 * 스탯 아이템 값 업데이트
 * @param {Array} allStats - 모든 스탯 설정
 * @param {Object} allTotalStats - 전체 스탯 합산값
 * @param {Object} allActiveStats - 활성 스탯 (사용하지 않지만 호환성을 위해 유지)
 * @param {boolean} forceZeroChange - 증감을 0으로 강제 설정
 * @param {Function} updateKeyStats - 주요 스탯 업데이트 함수 (선택적)
 */
export function updateStatItemsWithValues(
  allStats,
  allTotalStats,
  allActiveStats,
  forceZeroChange = false,
  updateKeyStats = null
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
  if (updateKeyStats) {
    updateKeyStats(allStats, allTotalStats, {}, forceZeroChange, updateStatItemsWithValues);
  }
}

