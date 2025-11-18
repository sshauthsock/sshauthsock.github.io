/**
 * SessionStorage 용량 관리 유틸리티
 * 브라우저의 SessionStorage 용량 제한을 관리하고 초과 시 자동으로 오래된 항목 제거
 */
class StorageManager {
  /**
   * SessionStorage 최대 용량 반환 (5MB)
   * 대부분의 브라우저에서 5-10MB 제한
   * @returns {number} 최대 용량 (바이트)
   */
  static getMaxSize() {
    return 5 * 1024 * 1024; // 5MB
  }

  /**
   * 현재 사용 중인 SessionStorage 용량 계산
   * @returns {number} 사용 중인 용량 (바이트)
   */
  static getUsedSize() {
    let total = 0;
    for (let key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key)) {
        // 키와 값의 길이를 모두 계산 (UTF-16 인코딩 기준)
        total += sessionStorage[key].length + key.length;
      }
    }
    return total;
  }

  /**
   * 추가 저장 가능 여부 확인
   * @param {number} size - 저장하려는 데이터 크기 (바이트)
   * @returns {boolean} 저장 가능 여부
   */
  static canStore(size) {
    return this.getUsedSize() + size < this.getMaxSize();
  }

  /**
   * SessionStorage에 안전하게 항목 저장
   * 용량 초과 시 오래된 항목 자동 제거
   * @param {string} key - 저장할 키
   * @param {string} value - 저장할 값 (문자열)
   * @returns {boolean} 저장 성공 여부
   */
  static setItem(key, value) {
    // 저장하려는 데이터 크기 계산
    const size = new Blob([value]).size;
    
    // 용량 초과 시 오래된 항목 제거
    if (!this.canStore(size)) {
      console.warn(`[Storage] Storage nearly full (${(this.getUsedSize() / 1024 / 1024).toFixed(2)}MB used). Clearing oldest items...`);
      // 공간이 확보될 때까지 오래된 항목 제거
      while (!this.canStore(size) && sessionStorage.length > 0) {
        this.clearOldest();
      }
    }

    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (e) {
      // QUOTA_EXCEEDED_ERR 등 에러 처리
      console.error(`[Storage] Failed to store ${key}:`, e);
      // 추가 시도: 오래된 항목 하나 더 제거 후 재시도
      if (sessionStorage.length > 0) {
        this.clearOldest();
        try {
          sessionStorage.setItem(key, value);
          return true;
        } catch (retryError) {
          console.error(`[Storage] Retry failed for ${key}:`, retryError);
          return false;
        }
      }
      return false;
    }
  }

  /**
   * 가장 오래된 항목 제거 (FIFO 방식)
   * SessionStorage는 삽입 순서를 유지하므로 첫 번째 항목이 가장 오래된 항목
   */
  static clearOldest() {
    if (sessionStorage.length === 0) {
      return;
    }
    
    // 첫 번째 항목 제거
    const firstKey = sessionStorage.key(0);
    if (firstKey) {
      sessionStorage.removeItem(firstKey);
      console.log(`[Storage] Removed oldest item: ${firstKey}`);
    }
  }

  /**
   * SessionStorage에서 항목 가져오기
   * @param {string} key - 가져올 키
   * @returns {string|null} 저장된 값 또는 null
   */
  static getItem(key) {
    return sessionStorage.getItem(key);
  }

  /**
   * SessionStorage에서 항목 제거
   * @param {string} key - 제거할 키
   */
  static removeItem(key) {
    sessionStorage.removeItem(key);
  }

  /**
   * SessionStorage 전체 비우기
   */
  static clear() {
    sessionStorage.clear();
  }

  /**
   * 현재 저장된 항목 수 반환
   * @returns {number} 항목 수
   */
  static getItemCount() {
    return sessionStorage.length;
  }

  /**
   * 저장소 사용률 반환 (0-1 사이의 값)
   * @returns {number} 사용률 (0.0 ~ 1.0)
   */
  static getUsageRatio() {
    return this.getUsedSize() / this.getMaxSize();
  }
}

export default StorageManager;

