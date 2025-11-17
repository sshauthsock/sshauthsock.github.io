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
    const messages = {
      'Failed to fetch': '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.',
      'NetworkError': '네트워크 오류가 발생했습니다.',
      'timeout': '요청 시간이 초과되었습니다. 다시 시도해주세요.',
    };

    for (const [key, message] of Object.entries(messages)) {
      if (errorMessage.includes(key)) {
        return message;
      }
    }

    return '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
}

export default ErrorHandler;

