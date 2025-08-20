const HISTORY_KEY = "savedOptimalCombinations";
const COUNTER_KEY = "combinationCounter";
const MAX_HISTORY = 5;

function loadHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    const history = saved
      ? JSON.parse(saved)
      : { 수호: [], 탑승: [], 변신: [] };
    if (!history.수호) history.수호 = [];
    if (!history.탑승) history.탑승 = [];
    if (!history.변신) history.변신 = [];
    return history;
  } catch (e) {
    console.error("Failed to load history from localStorage:", e);
    return { 수호: [], 탑승: [], 변신: [] };
  }
}

function loadCounter() {
  try {
    const saved = localStorage.getItem(COUNTER_KEY);
    const counter = saved ? JSON.parse(saved) : { 수호: 0, 탑승: 0, 변신: 0 };
    if (counter.수호 === undefined) counter.수호 = 0;
    if (counter.탑승 === undefined) counter.탑승 = 0;
    if (counter.변신 === undefined) counter.변신 = 0;
    return counter;
  } catch (e) {
    console.error("Failed to load counter from localStorage:", e);
    return { 수호: 0, 탑승: 0, 변신: 0 };
  }
}

function saveHistory(history, counter) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    localStorage.setItem(COUNTER_KEY, JSON.stringify(counter));
  } catch (e) {
    console.error("기록 저장 실패:", e);
    alert("조합 기록 저장에 실패했습니다. 저장 공간이 부족할 수 있습니다.");
  }
}

export function addResult(result) {
  if (
    !result ||
    !result.spirits ||
    result.spirits.length === 0 ||
    !result.spirits[0].type
  ) {
    console.warn("Invalid result data provided to addResult:", result);
    return;
  }

  const category = result.spirits[0].type;
  if (!["수호", "탑승", "변신"].includes(category)) {
    console.warn(`Invalid category '${category}' for history storage.`);
    return;
  }

  const history = loadHistory();
  const counter = loadCounter();

  if (counter[category] === undefined) {
    counter[category] = 0;
  }
  counter[category]++;

  const index = (counter[category] - 1) % MAX_HISTORY;

  const now = new Date();
  const newEntry = {
    ...result,
    timestamp: now.toLocaleString("sv-SE"),
    id: now.getTime(),
  };

  history[category][index] = newEntry;

  saveHistory(history, counter);
}

export function getHistoryForCategory(category) {
  const history = loadHistory();
  if (!history[category]) {
    console.warn(
      `Attempted to retrieve history for unknown category: ${category}`
    );
    return [];
  }
  const filteredHistory = history[category].filter(Boolean);
  filteredHistory.sort((a, b) => b.id - a.id);
  return filteredHistory;
}
