/**
 * LRU (Least Recently Used) Cache 구현
 * 최근에 사용된 항목을 유지하고 오래된 항목을 자동으로 제거
 */
class LRUCache {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * 캐시에서 값을 가져옴
   * 사용된 항목은 최신 항목으로 이동 (LRU)
   * @param {string} key - 캐시 키
   * @returns {any|null} 캐시된 값 또는 null
   */
  get(key) {
    if (this.cache.has(key)) {
      // 사용된 항목을 맨 뒤로 이동(LRU)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return null;
  }

  /**
   * 캐시에 값을 저장
   * 최대 크기를 초과하면 가장 오래된 항목 제거
   * @param {string} key - 캐시 키
   * @param {any} value - 저장할 값
   */
  set(key, value) {
    if (this.cache.has(key)) {
      // 이미 존재하는 키면 기존 항목 제거 후 새로 추가 (최신으로 이동)
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 최대 크기 초과 시 가장 오래된 항목 제거 (첫 번째 항목)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  /**
   * 캐시에서 특정 키 제거
   * @param {string} key - 제거할 캐시 키
   * @returns {boolean} 제거 성공 여부
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * 캐시 전체 비우기
   */
  clear() {
    this.cache.clear();
  }

  /**
   * 현재 캐시 크기 반환
   * @returns {number} 캐시 항목 수
   */
  size() {
    return this.cache.size;
  }

  /**
   * 캐시에 키가 존재하는지 확인
   * @param {string} key - 확인할 캐시 키
   * @returns {boolean} 존재 여부
   */
  has(key) {
    return this.cache.has(key);
  }
}

// 기본 크기 50인 LRU Cache 인스턴스 생성 및 export
export const memoryCache = new LRUCache(50);
