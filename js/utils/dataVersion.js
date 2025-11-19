/**
 * 데이터 버전 관리
 * 업데이트 재개 시 버전을 변경하면 자동으로 새 데이터를 로드합니다.
 */

// 데이터 버전 (업데이트 재개 시 이 값을 변경)
export const DATA_VERSION = "2024-01-15";

/**
 * 버전이 포함된 캐시 키 생성
 * @param {string} baseKey - 기본 캐시 키
 * @returns {string} 버전이 포함된 캐시 키
 */
export function getVersionedKey(baseKey) {
  return `${baseKey}_v${DATA_VERSION}`;
}

/**
 * 이전 버전의 캐시 키 찾기
 * @param {string} baseKey - 기본 캐시 키
 * @param {Storage} storage - localStorage 또는 sessionStorage
 * @returns {string[]} 이전 버전 캐시 키 배열
 */
export function getOldVersionKeys(baseKey, storage) {
  const oldKeys = [];
  const currentVersionedKey = getVersionedKey(baseKey);
  
  // storage의 모든 키를 확인
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (key && key.startsWith(baseKey + "_v") && key !== currentVersionedKey) {
      oldKeys.push(key);
    }
  }
  
  return oldKeys;
}

/**
 * 이전 버전 캐시 삭제
 * @param {string} baseKey - 기본 캐시 키
 * @param {Storage} storage - localStorage 또는 sessionStorage
 */
export function clearOldVersions(baseKey, storage) {
  const oldKeys = getOldVersionKeys(baseKey, storage);
  oldKeys.forEach(key => {
    storage.removeItem(key);
  });
  return oldKeys.length;
}

