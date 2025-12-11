// Service Worker for 오프라인 지원 및 PWA 기능
// 버전: 업데이트 시 이 값을 변경하여 캐시 무효화
const CACHE_VERSION = 'v20251211004515';
const CACHE_NAME = `bayeon-hwayeon-${CACHE_VERSION}`;

// CORS 문제 해결을 위해 fetch 이벤트 리스너 완전히 제거
// 모든 네트워크 요청은 브라우저가 직접 처리하도록 함

// 설치 이벤트: 초기 캐시 생성
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // 기본 정적 리소스 캐싱
        return cache.addAll(["/", "/index.html"]).catch((err) => {
          // 일부 실패해도 계속 진행
        });
      })
      .then(() => {
        // 설치 완료 후 즉시 활성화 (기존 Service Worker 대기 없이)
        return self.skipWaiting();
      })
  );
});

// 활성화 이벤트: 이전 캐시 정리
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // 현재 버전이 아닌 캐시 삭제
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // 모든 클라이언트에 즉시 제어권 부여
        return self.clients.claim();
      })
  );
});

// fetch 이벤트 리스너 제거
// 모든 네트워크 요청은 브라우저가 직접 처리하도록 함
// CORS 요청이 정상적으로 작동하도록 함

// 메시지 이벤트: 클라이언트와 통신
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CACHE_URLS") {
    // 동적으로 캐시할 URL 목록 받기
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
