// Service Worker for 오프라인 지원 및 PWA 기능
// 버전: 업데이트 시 이 값을 변경하여 캐시 무효화
const CACHE_VERSION = 'v20251201135520';
const CACHE_NAME = `bayeon-hwayeon-${CACHE_VERSION}`;

// 캐시할 정적 리소스 목록
// 주의: 빌드 후 실제 경로로 변경됨 (Vite가 해시 추가)
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  // CSS와 JS는 빌드 시 해시가 추가되므로 동적으로 캐싱
  // 이미지는 assets/img/ 경로 사용
];

// 네트워크 우선 전략을 사용할 API 엔드포인트 (계산 API)
const NETWORK_FIRST_PATTERNS = [
  /\/api\/calculate\//,  // 계산 API는 항상 네트워크 우선
];

// 캐시 우선 전략을 사용할 API 엔드포인트 (데이터 로딩 API)
const CACHE_FIRST_PATTERNS = [
  /\/api\/alldata/,
  /\/api\/rankings/,
  /\/api\/soul\/exp-table/,
  /\/api\/chak\/data/,
];

// 설치 이벤트: 초기 캐시 생성
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // 기본 정적 리소스 캐싱
        return cache.addAll(STATIC_CACHE_URLS).catch((err) => {
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
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
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

// fetch 이벤트: 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 같은 origin이 아니면 처리하지 않음
  // API 요청은 CORS가 설정되어 있으므로 처리
  const isApiRequest = url.pathname.startsWith('/api/');
  const isSameOrigin = url.origin === location.origin;
  
  // 외부 리소스는 처리하지 않음 (Google Fonts, 외부 스크립트 등)
  if (!isSameOrigin && !isApiRequest) {
    return; // 외부 리소스는 브라우저가 처리
  }

  // GET 요청만 캐싱 (POST는 네트워크 우선)
  if (request.method !== 'GET') {
    // POST 요청은 네트워크로 직접 전달 (에러 핸들링 포함)
    event.respondWith(
      fetch(request).catch((error) => {
        throw error; // 에러를 다시 throw하여 브라우저가 처리하도록
      })
    );
    return;
  }

  // API 요청 처리
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      handleApiRequest(request).catch((error) => {
        throw error;
      })
    );
    return;
  }

  // 정적 리소스 처리 (HTML, CSS, JS, 이미지 등)
  // 같은 origin만 처리
  if (isSameOrigin) {
    event.respondWith(
      handleStaticRequest(request).catch((error) => {
        // 에러 발생 시에도 캐시된 리소스 시도
        return caches.match(request).catch(() => {
          throw error;
        });
      })
    );
  }
});

/**
 * API 요청 처리
 * - 계산 API: Network First (항상 최신 데이터 필요)
 * - 데이터 로딩 API: Stale-While-Revalidate (캐시 있으면 먼저 사용, 백그라운드 갱신)
 */
async function handleApiRequest(request) {
  const url = request.url;

  // 계산 API는 네트워크 우선
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url))) {
    return networkFirst(request);
  }

  // 데이터 로딩 API는 Stale-While-Revalidate
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url))) {
    return staleWhileRevalidate(request);
  }

  // 기본값: 네트워크 우선
  return networkFirst(request);
}

/**
 * 정적 리소스 처리
 * HTML과 JavaScript는 Network Only (항상 최신 버전, 캐시 사용 안 함)
 * CSS와 이미지는 Network First (최신 버전 보장, 캐시는 오프라인 대비용)
 */
async function handleStaticRequest(request) {
  const url = new URL(request.url);
  const isJavaScript = url.pathname.endsWith('.js') || request.destination === 'script';
  const isHTML = request.destination === 'document' || request.mode === 'navigate';
  
  // HTML과 JavaScript는 Network Only 전략 (항상 네트워크에서 가져오기, 캐시 사용 안 함)
  if (isHTML || isJavaScript) {
    try {
      // 네트워크에서 직접 가져오기 (캐시 우회)
      const networkResponse = await fetch(request, {
        cache: 'no-store' // 브라우저 캐시도 우회
      });
      
      if (networkResponse && networkResponse.ok) {
        // 성공한 응답만 캐시에 저장 (오프라인 대비)
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (error) {
      // 네트워크 실패 시에만 캐시 사용 (오프라인 대비)
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // HTML 문서 요청인 경우 오프라인 페이지 반환
      if (isHTML) {
        // 캐시된 index.html이 있으면 사용
        const cachedIndex = await caches.match('/index.html') || await caches.match('/');
        if (cachedIndex) {
          return cachedIndex;
        }
        
        // 없으면 간단한 오프라인 페이지
        return new Response(
          `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>오프라인 - 바연화연</title>
  <style>
    body {
      font-family: 'Noto Sans KR', sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }
    .offline-container {
      max-width: 500px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 20px;
    }
    p {
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .retry-btn {
      background: white;
      color: #667eea;
      border: none;
      padding: 12px 30px;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .retry-btn:hover {
      transform: scale(1.05);
    }
  </style>
</head>
<body>
  <div class="offline-container">
    <h1>📡 오프라인 상태</h1>
    <p>인터넷 연결을 확인해주세요.</p>
    <p>일부 기능은 오프라인에서도 사용할 수 있습니다.</p>
    <button class="retry-btn" onclick="window.location.reload()">다시 시도</button>
  </div>
</body>
</html>`,
          {
            headers: { 'Content-Type': 'text/html' },
            status: 200,
            statusText: 'OK',
          }
        );
      }
      
      throw error;
    }
  }
  
  // CSS, 이미지 등 기타 리소스는 Network First (최신 버전 보장)
  // 캐시는 오프라인 대비용으로만 사용
  try {
    // 네트워크에서 먼저 시도 (캐시 우회)
    const networkResponse = await fetch(request, {
      cache: 'no-cache' // 브라우저 캐시 우회
    });
    
    // 성공한 응답은 캐시에 저장 (오프라인 대비)
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // 네트워크 실패 시에만 캐시 사용 (오프라인 대비)
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 캐시도 없으면 에러 반환
    return new Response(null, { status: 408, statusText: 'Request Timeout' });
  }
}

/**
 * Network First 전략
 * 네트워크를 먼저 시도하고, 실패하면 캐시 사용
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // 성공한 응답은 캐시에 저장
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // 네트워크 실패 시 캐시에서 가져오기
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // 캐시도 없으면 에러 반환
    throw error;
  }
}

/**
 * Stale-While-Revalidate 전략
 * 캐시가 있으면 먼저 반환하고, 백그라운드에서 네트워크로 갱신
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await caches.match(request);

  // 백그라운드에서 네트워크로 갱신 (비동기)
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    // 백그라운드 fetch 실패는 무시
  });

  // 캐시가 있으면 즉시 반환, 없으면 네트워크 응답 대기
  return cachedResponse || fetchPromise;
}

// 메시지 이벤트: 클라이언트와 통신
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    // 동적으로 캐시할 URL 목록 받기
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

