class ErrorHandler {
  static handle(error, context = '') {
    const errorInfo = {
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      context,
      timestamp: new Date().toISOString(),
    };

    // 개발 환경에서만 콘솔 출력
    if (import.meta.env.DEV) {
      console.error(`[Error] ${context}:`, errorInfo);
    }

    // Google Analytics에 에러 전송
    if (typeof gtag === 'function') {
      gtag('event', 'exception', {
        description: errorInfo.message,
        fatal: false,
      });
    }

    return errorInfo;
  }

  static showUserFriendlyMessage(error, container) {
    const errorInfo = this.handle(error);
    
    const userMessage = this.getUserFriendlyMessage(errorInfo.message);
    
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <h3>오류가 발생했습니다</h3>
          <p>${userMessage}</p>
          <button onclick="location.reload()">새로고침</button>
        </div>
      `;
    }
  }

  static getUserFriendlyMessage(errorMessage) {
    // 404 에러 처리 (리소스를 찾을 수 없음)
    if (
      errorMessage.includes('404') ||
      errorMessage.includes('Failed to load resource') ||
      errorMessage.includes('the server responded with a status of 404') ||
      errorMessage.includes('Not Found') ||
      errorMessage.includes('Failed to fetch dynamically imported module') ||
      errorMessage.includes('Loading chunk') && errorMessage.includes('failed')
    ) {
      return '메시지를 로드할수없습니다. Ctrl+Shift+R 을 눌러서 다시 시도해보세요.';
    }

    // 서버 연결 실패 관련 에러 메시지
    const serverConnectionErrors = [
      'Failed to fetch',
      'NetworkError',
      'Network request failed',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_NETWORK_CHANGED',
      'ERR_CONNECTION_REFUSED',
      'ERR_CONNECTION_TIMED_OUT',
      'ERR_CONNECTION_RESET',
      'dynamically imported module', // 동적 import 관련 (404가 아닌 경우)
    ];

    // 서버 연결 실패인지 확인
    for (const errorKey of serverConnectionErrors) {
      if (errorMessage.includes(errorKey)) {
        return '현재 서버 점검중 입니다.';
      }
    }

    // 타임아웃 에러
    if (errorMessage.includes('timeout')) {
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }

    // 기타 에러
    return '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
}

export default ErrorHandler;


