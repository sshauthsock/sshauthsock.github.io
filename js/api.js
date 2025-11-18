import ErrorHandler from "./utils/errorHandler.js";
import { memoryCache } from "./utils/cache.js";
import StorageManager from "./utils/storage.js";
import {
  transformSpiritsArrayPaths,
  transformSpiritImagePath,
} from "./utils/imagePath.js";
import Logger from "./utils/logger.js";

// 환경별 API URL 설정
// 우선순위: import.meta.env.VITE_API_BASE_URL > __API_BASE_URL__ > 기본값
// 개발 모드: .env의 VITE_API_BASE_URL 사용 (코드 수정 불필요)
// 프로덕션 빌드: 빌드 시점의 환경 변수 또는 기본값 사용
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof __API_BASE_URL__ !== "undefined" ? __API_BASE_URL__ : null) ||
  "https://wind-app-backend-y7qnnpfkrq-du.a.run.app";

// 이미지 경로 변환 함수는 utils/imagePath.js로 이동
// _transformSpiritImagePath, _transformSpiritsArrayPaths는 더 이상 사용하지 않음

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "서버 응답을 읽을 수 없습니다." }));

    const error = new Error(
      errorData.error || `서버 오류: ${response.statusText}`
    );
    ErrorHandler.handle(error, `API ${response.status}`);
    throw error;
  }
  return response.json();
}

async function fetchWithSessionCache(key, url, shouldTransformSpirits = false) {
  const cachedItem = StorageManager.getItem(key);
  if (cachedItem) {
    try {
      Logger.log(`[Cache] Using sessionStorage cached data for key: ${key}`);
      return JSON.parse(cachedItem);
    } catch (e) {
      Logger.error(
        `[Cache Error] Failed to parse sessionStorage data for ${key}, fetching fresh.`,
        e
      );
      StorageManager.removeItem(key);
    }
  }

  const response = await fetch(url);
  const rawData = await handleResponse(response);

  let processedData = rawData;
  if (shouldTransformSpirits && Array.isArray(rawData)) {
    processedData = transformSpiritsArrayPaths(rawData);
  }

  // StorageManager를 통해 안전하게 저장 (용량 체크 및 자동 정리)
  const jsonString = JSON.stringify(processedData);
  const saved = StorageManager.setItem(key, jsonString);
  if (!saved) {
    Logger.warn(
      `[Cache] Failed to save to sessionStorage for ${key}. Data will not be cached.`
    );
  }

  return processedData;
}

async function fetchWithMemoryCache(key, url) {
  const cachedData = memoryCache.get(key);
  if (cachedData) {
    Logger.log(`[Cache] Using memory cached data for key: ${key}`);
    return cachedData;
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
              item.spirits = transformSpiritsArrayPaths(item.spirits);
            }
            if (item.bindStat !== undefined && item.bindStats === undefined) {
              item.bindStats = item.bindStat;
            }
            return item;
          }
        );
      } else if (type === "stat") {
        transformedData.rankings = transformSpiritsArrayPaths(
          transformedData.rankings
        );
      }
    }
  }

  memoryCache.set(key, transformedData);
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
  try {
    const response = await fetch(`${BASE_URL}/api/calculate/bond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatures }),
    });
    const result = await handleResponse(response);

    if (result && Array.isArray(result.spirits)) {
      result.spirits = transformSpiritsArrayPaths(result.spirits);
    }
    return result;
  } catch (error) {
    ErrorHandler.handle(error, "calculateOptimalCombination");
    throw error;
  }
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
  try {
    const response = await fetch(`${BASE_URL}/api/calculate/soul`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    ErrorHandler.handle(error, "calculateSoul");
    throw error;
  }
}

export async function fetchChakData() {
  return fetchWithSessionCache("chakData", `${BASE_URL}/api/chak/data`);
}

export async function calculateChak(data) {
  try {
    const response = await fetch(`${BASE_URL}/api/calculate/chak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  } catch (error) {
    ErrorHandler.handle(error, "calculateChak");
    throw error;
  }
}
