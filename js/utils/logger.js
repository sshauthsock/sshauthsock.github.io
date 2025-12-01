/**
 * 로깅 유틸리티
 * 모든 로그 출력 비활성화
 */
class Logger {
  static isDev() {
    return false;
  }

  static log(...args) {
    // 로그 비활성화
  }

  static error(...args) {
    // 로그 비활성화
  }

  static warn(...args) {
    // 로그 비활성화
  }

  static info(...args) {
    // 로그 비활성화
  }

  static debug(...args) {
    // 로그 비활성화
  }

  /**
   * 그룹 로그
   */
  static group(...args) {
    // 로그 비활성화
  }

  static groupEnd() {
    // 로그 비활성화
  }

  /**
   * 조건부 로그
   */
  static logIf(condition, ...args) {
    // 로그 비활성화
  }
}

export default Logger;

