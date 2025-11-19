/**
 * IndexedDB 유틸리티
 * 큰 데이터를 영구 저장하기 위한 IndexedDB 래퍼
 */
import Logger from "./logger.js";
import { DATA_VERSION } from "./dataVersion.js";

const DB_NAME = "BayeonHwayeonDB";
const DB_VERSION = 1;
const STORE_NAME = "cache";

let dbInstance = null;
let dbPromise = null;

/**
 * IndexedDB 데이터베이스 초기화
 * @returns {Promise<IDBDatabase>} 데이터베이스 인스턴스
 */
function initDB() {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    // IndexedDB 지원 여부 확인
    if (!window.indexedDB) {
      const error = new Error("IndexedDB is not supported in this browser");
      Logger.error("[IndexedDB] IndexedDB not supported:", error);
      reject(error);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      Logger.error("[IndexedDB] Failed to open database:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      Logger.log("[IndexedDB] Database opened successfully");
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // 기존 object store가 있으면 삭제
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      
      // 새로운 object store 생성
      const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "key" });
      objectStore.createIndex("version", "version", { unique: false });
      objectStore.createIndex("timestamp", "timestamp", { unique: false });
      
      Logger.log("[IndexedDB] Database upgraded, object store created");
    };
  });

  return dbPromise;
}

/**
 * IndexedDB에 데이터 저장
 * @param {string} key - 저장할 키
 * @param {any} data - 저장할 데이터
 * @returns {Promise<boolean>} 저장 성공 여부
 */
export async function setItem(key, data) {
  try {
    const db = await initDB();
    
    // 버전이 포함된 키 생성
    const versionedKey = `${key}_v${DATA_VERSION}`;
    
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    const item = {
      key: versionedKey,
      data: data,
      version: DATA_VERSION,
      timestamp: Date.now(),
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(item);
      
      request.onsuccess = () => {
        Logger.debug(`[IndexedDB] Saved data for key: ${versionedKey}`);
        resolve(true);
      };
      
      request.onerror = () => {
        Logger.error(`[IndexedDB] Failed to save data for key: ${versionedKey}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    Logger.error(`[IndexedDB] Error saving data for key: ${key}:`, error);
    return false;
  }
}

/**
 * IndexedDB에서 데이터 가져오기
 * @param {string} key - 가져올 키
 * @returns {Promise<any|null>} 저장된 데이터 또는 null
 */
export async function getItem(key) {
  try {
    const db = await initDB();
    
    // 버전이 포함된 키 생성
    const versionedKey = `${key}_v${DATA_VERSION}`;
    
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.get(versionedKey);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.data) {
          Logger.debug(`[IndexedDB] Retrieved data for key: ${versionedKey}`);
          resolve(result.data);
        } else {
          Logger.debug(`[IndexedDB] No data found for key: ${versionedKey}`);
          resolve(null);
        }
      };
      
      request.onerror = () => {
        Logger.error(`[IndexedDB] Failed to get data for key: ${versionedKey}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    Logger.error(`[IndexedDB] Error getting data for key: ${key}:`, error);
    return null;
  }
}

/**
 * IndexedDB에서 데이터 삭제
 * @param {string} key - 삭제할 키
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export async function removeItem(key) {
  try {
    const db = await initDB();
    
    // 버전이 포함된 키 생성
    const versionedKey = `${key}_v${DATA_VERSION}`;
    
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(versionedKey);
      
      request.onsuccess = () => {
        Logger.debug(`[IndexedDB] Deleted data for key: ${versionedKey}`);
        resolve(true);
      };
      
      request.onerror = () => {
        Logger.error(`[IndexedDB] Failed to delete data for key: ${versionedKey}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    Logger.error(`[IndexedDB] Error deleting data for key: ${key}:`, error);
    return false;
  }
}

/**
 * 이전 버전의 데이터 삭제
 * @param {string} baseKey - 기본 키 (버전 제외)
 * @returns {Promise<number>} 삭제된 항목 수
 */
export async function clearOldVersions(baseKey) {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("version");
    
    // 현재 버전이 아닌 모든 항목 찾기
    const currentVersionedKey = `${baseKey}_v${DATA_VERSION}`;
    let deletedCount = 0;
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const item = cursor.value;
          // baseKey로 시작하고 현재 버전이 아닌 항목 삭제
          if (item.key.startsWith(baseKey + "_v") && item.key !== currentVersionedKey) {
            cursor.delete();
            deletedCount++;
            Logger.debug(`[IndexedDB] Deleted old version: ${item.key}`);
          }
          cursor.continue();
        } else {
          if (deletedCount > 0) {
            Logger.log(`[IndexedDB] Cleared ${deletedCount} old version(s) of ${baseKey}`);
          }
          resolve(deletedCount);
        }
      };
      
      request.onerror = () => {
        Logger.error(`[IndexedDB] Failed to clear old versions for key: ${baseKey}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    Logger.error(`[IndexedDB] Error clearing old versions for key: ${baseKey}:`, error);
    return 0;
  }
}

/**
 * IndexedDB 사용 가능 여부 확인
 * @returns {boolean} 사용 가능 여부
 */
export function isAvailable() {
  return !!window.indexedDB;
}

/**
 * IndexedDB 데이터베이스 삭제 (디버깅용)
 * @returns {Promise<boolean>} 삭제 성공 여부
 */
export async function clear() {
  try {
    if (dbInstance) {
      dbInstance.close();
      dbInstance = null;
      dbPromise = null;
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      
      request.onsuccess = () => {
        Logger.log("[IndexedDB] Database deleted successfully");
        resolve(true);
      };
      
      request.onerror = () => {
        Logger.error("[IndexedDB] Failed to delete database:", request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    Logger.error("[IndexedDB] Error clearing database:", error);
    return false;
  }
}

