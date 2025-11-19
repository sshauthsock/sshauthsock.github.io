import ErrorHandler from "./utils/errorHandler.js";
import { memoryCache } from "./utils/cache.js";
import StorageManager from "./utils/storage.js";
import {
  transformSpiritsArrayPaths,
  transformSpiritImagePath,
} from "./utils/imagePath.js";
import Logger from "./utils/logger.js";
import { trackApiPerformance } from "./utils/performanceMonitor.js";
import { getVersionedKey, clearOldVersions } from "./utils/dataVersion.js";
import * as IndexedDB from "./utils/indexedDB.js";

// 환경별 API URL 설정
// 우선순위: import.meta.env.VITE_API_BASE_URL > __API_BASE_URL__ > 기본값
// 개발 모드: .env의 VITE_API_BASE_URL 사용 (코드 수정 불필요)
// 프로덕션 빌드: 빌드 시점의 환경 변수 또는 기본값 사용
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof __API_BASE_URL__ !== "undefined" ? __API_BASE_URL__ : null) ||
  "https://bayeon-hwayeon-backend.onrender.com";

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

/**
 * 영구 캐싱을 사용한 데이터 페치 (localStorage 기반, 폴백: sessionStorage)
 * 데이터 버전 관리 포함
 */
async function fetchWithSessionCache(key, url, shouldTransformSpirits = false) {
  // 버전이 포함된 캐시 키 사용
  const versionedKey = getVersionedKey(key);
  
  // localStorage 상태 확인 (개발 모드에서만)
  const storage = StorageManager.getStorage();
  const isLocalStorage = storage === localStorage;
  Logger.debug(`[Cache Debug] Storage type: ${isLocalStorage ? 'localStorage' : 'sessionStorage'}, Key: ${versionedKey}, Base key: ${key}`);
  
  // 이전 버전 캐시 자동 삭제
  const clearedCount = clearOldVersions(key, storage);
  if (clearedCount > 0) {
    Logger.log(`[Cache] Cleared ${clearedCount} old version(s) of ${key}`);
  }
  
  // 캐시 확인 (개발 모드에서만)
  const cachedItem = StorageManager.getItem(versionedKey);
  Logger.debug(`[Cache Debug] Checking cache for key: ${versionedKey}, Found: ${cachedItem ? 'YES' : 'NO'}, Length: ${cachedItem ? cachedItem.length : 0}`);
  
  if (cachedItem) {
    try {
      // 캐시 히트 로그 (개발 모드에서만)
      Logger.log(`[Cache HIT] Using cached data for key: ${versionedKey} (URL: ${url})`);
      const cachedData = JSON.parse(cachedItem);
      
      // 캐시된 데이터는 이미 변환되어 있으므로 그대로 반환
      // (저장 시점에 이미 변환된 데이터를 저장하므로)
      return cachedData;
    } catch (e) {
      Logger.error(
        `[Cache Error] Failed to parse cached data for ${versionedKey}, fetching fresh.`,
        e
      );
      StorageManager.removeItem(versionedKey);
    }
  }

  // 캐시 미스 로그 (개발 모드에서만)
  Logger.log(`[Cache MISS] No cached data for key: ${versionedKey} (URL: ${url}), fetching from API...`);
  const startTime = performance.now();
  const response = await fetch(url);
  const rawData = await handleResponse(response);
  const duration = performance.now() - startTime;
  
  // API 성능 추적
  trackApiPerformance(url, duration, true);

  let processedData = rawData;
  
  // 랭킹 데이터인 경우 이미지 경로 변환
  if (key.startsWith("rankings_")) {
    processedData = transformRankingsData(rawData, key);
  } else if (shouldTransformSpirits && Array.isArray(rawData)) {
    // 일반 배열 데이터인 경우
    processedData = transformSpiritsArrayPaths(rawData);
  }

  // StorageManager를 통해 안전하게 저장 (용량 체크 및 자동 정리)
  // 버전이 포함된 키로 저장
  const jsonString = JSON.stringify(processedData);
  const dataSize = new Blob([jsonString]).size;
  Logger.debug(`[Cache Debug] Attempting to save cache for key: ${versionedKey}, Data size: ${(dataSize / 1024).toFixed(2)}KB`);
  
  const saved = StorageManager.setItem(versionedKey, jsonString);
  
  // 저장 후 확인 (개발 모드에서만)
  const verifyItem = StorageManager.getItem(versionedKey);
  Logger.debug(`[Cache Debug] Save result: ${saved ? 'SUCCESS' : 'FAILED'}, Verify: ${verifyItem ? 'FOUND' : 'NOT FOUND'}, Verify length: ${verifyItem ? verifyItem.length : 0}`);
  
  if (saved) {
    // 캐시 저장 성공 로그 (개발 모드에서만)
    Logger.log(`[Cache SAVED] Successfully cached data for key: ${versionedKey} (URL: ${url}), Size: ${(dataSize / 1024).toFixed(2)}KB`);
  } else {
    // 캐시 저장 실패 로그 (에러는 항상 출력)
    Logger.error(
      `[Cache FAILED] Failed to save cached data for ${versionedKey} (URL: ${url}). Data will not be cached. Size: ${(dataSize / 1024).toFixed(2)}KB`
    );
  }

  return processedData;
}

/**
 * 랭킹 데이터의 이미지 경로 변환
 * @param {object} data - 랭킹 데이터
 * @param {string} key - 캐시 키 (랭킹 타입 확인용)
 * @returns {object} 변환된 데이터
 */
function transformRankingsData(data, key) {
  if (!data || !data.rankings) {
    return data;
  }
  
  const type = key.includes("_bond") ? "bond" : key.includes("_stat") ? "stat" : null;
  
  if (type === "bond") {
    // 결속 랭킹: rankings 배열의 각 항목의 spirits 배열 변환
    data.rankings = data.rankings.map((rankingItem) => {
      let item = { ...rankingItem };
      if (Array.isArray(item.spirits)) {
        item.spirits = transformSpiritsArrayPaths(item.spirits);
      }
      if (item.bindStat !== undefined && item.bindStats === undefined) {
        item.bindStats = item.bindStat;
      }
      return item;
    });
  } else if (type === "stat") {
    // 능력치 랭킹: rankings 배열 자체가 환수 배열
    data.rankings = transformSpiritsArrayPaths(data.rankings);
  }
  
  return data;
}

/**
 * IndexedDB를 사용한 데이터 페치 (큰 데이터용)
 * 랭킹 데이터 등 큰 데이터를 IndexedDB에 영구 저장
 */
async function fetchWithIndexedDBCache(key, url) {
  // IndexedDB 사용 가능 여부 확인
  if (!IndexedDB.isAvailable()) {
    Logger.warn(`[IndexedDB] IndexedDB not available, falling back to memory cache for key: ${key}`);
    return fetchWithMemoryCache(url, url);
  }
  
  // 이전 버전 캐시 자동 삭제
  const clearedCount = await IndexedDB.clearOldVersions(key);
  if (clearedCount > 0) {
    Logger.log(`[IndexedDB] Cleared ${clearedCount} old version(s) of ${key}`);
  }
  
  // 캐시 확인
  const cachedData = await IndexedDB.getItem(key);
  if (cachedData) {
    Logger.log(`[IndexedDB Cache HIT] Using cached data for key: ${key} (URL: ${url})`);
    // 메모리 캐시에도 저장 (빠른 접근용)
    memoryCache.set(url, cachedData);
    return cachedData;
  }

  Logger.log(`[IndexedDB Cache MISS] No cached data for key: ${key} (URL: ${url}), fetching from API...`);
  const startTime = performance.now();
  const response = await fetch(url);
  const rawData = await handleResponse(response);
  const duration = performance.now() - startTime;
  
  // API 성능 추적
  trackApiPerformance(url, duration, true);

  // 랭킹 데이터 이미지 경로 변환
  let transformedData = transformRankingsData(rawData, key);

  // IndexedDB에 저장
  const saved = await IndexedDB.setItem(key, transformedData);
  if (saved) {
    Logger.log(`[IndexedDB Cache SAVED] Successfully cached data for key: ${key} (URL: ${url})`);
    // 메모리 캐시에도 저장 (빠른 접근용)
    memoryCache.set(url, transformedData);
  } else {
    Logger.error(`[IndexedDB Cache FAILED] Failed to save cached data for ${key} (URL: ${url})`);
  }

  return transformedData;
}

async function fetchWithMemoryCache(key, url) {
  const cachedData = memoryCache.get(key);
  if (cachedData) {
    Logger.log(`[Cache] Using memory cached data for key: ${key}`);
    return cachedData;
  }

  const startTime = performance.now();
  const response = await fetch(url);
  const rawData = await handleResponse(response);
  const duration = performance.now() - startTime;
  
  // API 성능 추적
  trackApiPerformance(url, duration, true);

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
  const startTime = performance.now();
  try {
    const response = await fetch(`${BASE_URL}/api/calculate/bond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatures }),
    });
    const result = await handleResponse(response);
    const duration = performance.now() - startTime;

    // API 성능 추적
    trackApiPerformance("/api/calculate/bond", duration, true);

    if (result && Array.isArray(result.spirits)) {
      result.spirits = transformSpiritsArrayPaths(result.spirits);
    }
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    trackApiPerformance("/api/calculate/bond", duration, false);
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
  
  // 랭킹 데이터는 크기가 너무 커서 (7-8MB) localStorage 용량 제한을 초과함
  // IndexedDB를 사용하여 영구 캐싱
  const cacheKey = `rankings_${category}_${type}${statKey ? `_${statKey}` : ''}`;
  return fetchWithIndexedDBCache(cacheKey, url);
}

export async function fetchSoulExpTable() {
  return fetchWithSessionCache(
    "soulExpTable",
    `${BASE_URL}/api/soul/exp-table`
  );
}

export async function calculateSoul(data) {
  const startTime = performance.now();
  try {
    const response = await fetch(`${BASE_URL}/api/calculate/soul`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    const duration = performance.now() - startTime;
    
    // API 성능 추적
    trackApiPerformance("/api/calculate/soul", duration, true);
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    trackApiPerformance("/api/calculate/soul", duration, false);
    ErrorHandler.handle(error, "calculateSoul");
    throw error;
  }
}

export async function fetchChakData() {
  return fetchWithSessionCache("chakData", `${BASE_URL}/api/chak/data`);
}

export async function calculateChak(data) {
  const startTime = performance.now();
  try {
    const response = await fetch(`${BASE_URL}/api/calculate/chak`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    const duration = performance.now() - startTime;
    
    // API 성능 추적
    trackApiPerformance("/api/calculate/chak", duration, true);
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    trackApiPerformance("/api/calculate/chak", duration, false);
    ErrorHandler.handle(error, "calculateChak");
    throw error;
  }
}
