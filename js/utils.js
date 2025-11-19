export function createElement(tag, className, attributes = {}) {
  const element = document.createElement(tag);
  if (className) {
    if (Array.isArray(className)) {
      element.classList.add(...className);
    } else {
      element.className = className;
    }
  }
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "text" || key === "textContent") {
      element.textContent = value;
    } else if (key === "html" || key === "innerHTML") {
      element.innerHTML = value;
    } else {
      element.setAttribute(key, value);
    }
  });
  return element;
}

export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

export function checkSpiritStats(spirit) {
  if (!spirit || !Array.isArray(spirit.stats)) {
    return {
      hasFullRegistration: false,
      hasFullBind: false,
      hasLevel25Bind: false,
    };
  }
  const level25Stat = spirit.stats.find((s) => s.level === 25);

  const hasFullRegistration = !!(
    level25Stat?.registrationStat &&
    Object.keys(level25Stat.registrationStat).length > 0
  );
  const hasFullBind = !!(
    level25Stat?.bindStat && Object.keys(level25Stat.bindStat).length > 0
  );
  const hasLevel25Bind = hasFullBind;

  return { hasFullRegistration, hasFullBind, hasLevel25Bind };
}

export function checkItemForStatEffect(item, statKey) {
  if (!item?.stats) return false;
  for (const stat of item.stats) {
    if (
      stat?.registrationStat?.[statKey] !== undefined ||
      stat?.bindStat?.[statKey] !== undefined
    ) {
      return true;
    }
  }
  return false;
}

export function getNextMonthLastThursday() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const lastDayOfNextMonth = new Date(
    nextMonth.getFullYear(),
    nextMonth.getMonth() + 1,
    0
  );

  let lastThursday = lastDayOfNextMonth;

  while (lastThursday.getDay() !== 4) {
    lastThursday.setDate(lastThursday.getDate() - 1);
  }

  lastThursday.setHours(0, 0, 0, 0);

  return lastThursday;
}

/**
 * 숫자로 변환하는 유틸리티 함수
 * undefined, null, NaN을 0으로 변환하고 쉼표를 제거한 후 파싱
 * @param {any} value - 변환할 값
 * @returns {number} 변환된 숫자 (변환 실패 시 0)
 */
export function ensureNumber(value) {
  if (value === undefined || value === null) return 0;
  const num = parseFloat(String(value).replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
}