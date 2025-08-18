const BASE_URL =
  "https://wind-app-backend-462093198351.asia-northeast3.run.app";

const memoryCache = {};

function _transformSpiritImagePath(spirit) {
  if (spirit && typeof spirit.image === "string") {
    const transformedImage = spirit.image.replace(/^images\//, "assets/img/");
    return { ...spirit, image: transformedImage };
  }
  return spirit;
}

function _transformSpiritsArrayPaths(spiritsArray) {
  if (!Array.isArray(spiritsArray)) {
    return spiritsArray;
  }
  return spiritsArray.map(_transformSpiritImagePath);
}

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "서버 응답을 읽을 수 없습니다." }));
    console.error(
      `API Error ${response.status}:`,
      errorData.error || response.statusText,
      errorData
    );
    throw new Error(errorData.error || `서버 오류: ${response.statusText}`);
  }
  return response.json();
}

async function fetchWithSessionCache(key, url, shouldTransformSpirits = false) {
  const cachedItem = sessionStorage.getItem(key);
  if (cachedItem) {
    try {
      console.log(`[Cache] Using sessionStorage cached data for key: ${key}`);
      return JSON.parse(cachedItem);
    } catch (e) {
      console.error(
        `[Cache Error] Failed to parse sessionStorage data for ${key}, fetching fresh.`,
        e
      );
      sessionStorage.removeItem(key);
    }
  }

  const response = await fetch(url);
  const rawData = await handleResponse(response);

  let processedData = rawData;
  if (shouldTransformSpirits && Array.isArray(rawData)) {
    processedData = _transformSpiritsArrayPaths(rawData);
  }

  try {
    sessionStorage.setItem(key, JSON.stringify(processedData));
  } catch (e) {
    console.error(
      `[Cache Error] Failed to save to sessionStorage for ${key}:`,
      e
    );
  }

  return processedData;
}

async function fetchWithMemoryCache(key, url) {
  if (memoryCache[key]) {
    console.log(`[Cache] Using memory cached data for key: ${key}`);
    return memoryCache[key];
  }

  const response = await fetch(url);
  const rawData = await handleResponse(response);

  let transformedData = JSON.parse(JSON.stringify(rawData));

  if (key.includes("/api/rankings")) {
    if (Array.isArray(transformedData.rankings)) {
      const type = key.includes("type=bond")
        ? "bond"
        : key.includes("type=stat")
        ? "stat"
        : null;

      if (type === "bond") {
        transformedData.rankings = transformedData.rankings.map(
          (rankingItem) => {
            let item = rankingItem;
            if (Array.isArray(item.spirits)) {
              item.spirits = _transformSpiritsArrayPaths(item.spirits);
            }
            if (item.bindStat !== undefined && item.bindStats === undefined) {
              item.bindStats = item.bindStat;
            }
            return item;
          }
        );
      } else if (type === "stat") {
        transformedData.rankings = _transformSpiritsArrayPaths(
          transformedData.rankings
        );
      }
    }
  }

  memoryCache[key] = transformedData;
  return transformedData;
}

export async function fetchAllSpirits() {
  return fetchWithSessionCache(
    "allSpiritsData",
    `${BASE_URL}/api/alldata`,
    true
  );
}

export async function calculateOptimalCombination(creatures) {
  const response = await fetch(`${BASE_URL}/api/calculate/bond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ creatures }),
  });
  const result = await handleResponse(response);
  if (result && Array.isArray(result.spirits)) {
    result.spirits = _transformSpiritsArrayPaths(result.spirits);
  }
  return result;
}

export async function fetchRankings(category, type, statKey = "") {
  let url = `${BASE_URL}/api/rankings?category=${encodeURIComponent(
    category
  )}&type=${encodeURIComponent(type)}`;
  if (type === "stat" && statKey) {
    url += `&statKey=${encodeURIComponent(statKey)}`;
  }
  return fetchWithMemoryCache(url, url);
}

export async function fetchSoulExpTable() {
  return fetchWithSessionCache(
    "soulExpTable",
    `${BASE_URL}/api/soul/exp-table`
  );
}

export async function calculateSoul(data) {
  const response = await fetch(`${BASE_URL}/api/calculate/soul`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function fetchChakData() {
  return fetchWithSessionCache("chakData", `${BASE_URL}/api/chak/data`);
}

export async function calculateChak(data) {
  const response = await fetch(`${BASE_URL}/api/calculate/chak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}
