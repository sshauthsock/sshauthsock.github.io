/**
 * 로깅 유틸리티
 * 개발 환경에서만 로그를 출력하고, 프로덕션에서는 제거됩니다.
 */
class Logger {
  static isDev() {
    return import.meta.env.DEV;
  }

  static log(...args) {
    if (this.isDev()) {
      console.log(...args);
    }
  }

  static error(...args) {
    // 에러는 항상 출력 (프로덕션에서도 디버깅 필요)
    console.error(...args);
  }

  static warn(...args) {
    if (this.isDev()) {
      console.warn(...args);
    }
  }

  static info(...args) {
    if (this.isDev()) {
      console.info(...args);
    }
  }

  static debug(...args) {
    if (this.isDev()) {
      console.debug(...args);
    }
  }

  /**
   * 그룹 로그 (개발 환경에서만)
   */
  static group(...args) {
    if (this.isDev()) {
      console.group(...args);
    }
  }

  static groupEnd() {
    if (this.isDev()) {
      console.groupEnd();
    }
  }

  /**
   * 조건부 로그 (개발 환경에서만)
   */
  static logIf(condition, ...args) {
    if (this.isDev() && condition) {
      console.log(...args);
    }
  }
}

export default Logger;

