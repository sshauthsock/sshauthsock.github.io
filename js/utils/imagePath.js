/**
 * 이미지 경로 변환 유틸리티
 * images/ 경로를 assets/img/로 변환하고 결과를 캐싱하여 성능 최적화
 * WebP 형식 지원 (브라우저 호환성 확인 후 자동 선택)
 */

// 이미지 경로 변환 결과 캐시 (중복 변환 방지)
const IMAGE_PATH_CACHE = new Map();

// WebP 지원 여부 캐시 (한 번만 확인)
let webpSupported = null;

/**
 * 브라우저의 WebP 지원 여부 확인
 * @returns {boolean} WebP 지원 여부
 */
function checkWebPSupport() {
  if (webpSupported !== null) {
    return webpSupported;
  }

  // 브라우저 환경에서만 확인
  if (typeof document === 'undefined') {
    webpSupported = false;
    return false;
  }

  // Canvas를 사용한 WebP 지원 확인
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  
  return webpSupported;
}

/**
 * 원본 이미지 경로 추출 (WebP에서 원본으로)
 * @param {string} imagePath - 이미지 경로
 * @returns {string} 원본 이미지 경로
 */
function getOriginalImagePath(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') {
    return imagePath;
  }
  
  // WebP 경로를 원본으로 변환
  if (imagePath.endsWith('.webp')) {
    return imagePath.replace(/\.webp$/i, '.jpg');
  }
  
  return imagePath;
}

/**
 * 이미지 경로를 WebP로 변환 (지원하는 경우)
 * @param {string} imagePath - 원본 이미지 경로
 * @returns {string} WebP 경로 또는 원본 경로
 */
function convertToWebPPath(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') {
    return imagePath;
  }

  // 이미 WebP이면 그대로 반환
  if (imagePath.endsWith('.webp')) {
    return imagePath;
  }

  // WebP를 지원하지 않으면 원본 반환
  if (!checkWebPSupport()) {
    return imagePath;
  }

  // 확장자를 .webp로 변경
  const extMatch = imagePath.match(/\.(jpg|jpeg|png)$/i);
  if (extMatch) {
    return imagePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  }

  return imagePath;
}

/**
 * 단일 이미지 경로 변환
 * images/로 시작하는 경로를 assets/img/로 변환하고 WebP 지원
 * @param {string} imagePath - 변환할 이미지 경로
 * @param {boolean} useWebP - WebP 사용 여부 (기본값: true, 브라우저 지원 시)
 * @returns {string} 변환된 이미지 경로
 */
export function transformImagePath(imagePath, useWebP = true) {
  if (!imagePath || typeof imagePath !== 'string') {
    return imagePath;
  }

  // 캐시 키 생성 (useWebP 포함)
  const cacheKey = `${imagePath}:${useWebP}`;
  
  // 캐시 확인
  if (IMAGE_PATH_CACHE.has(cacheKey)) {
    return IMAGE_PATH_CACHE.get(cacheKey);
  }

  // 변환: images/로 시작하면 assets/img/로 변경
  let transformed = imagePath.replace(/^images\//, 'assets/img/');
  
  // WebP 변환 (지원하는 경우)
  if (useWebP) {
    transformed = convertToWebPPath(transformed);
  }
  
  // 캐시 저장
  IMAGE_PATH_CACHE.set(cacheKey, transformed);
  
  return transformed;
}

/**
 * 환수 객체의 이미지 경로 변환
 * @param {Object} spirit - 환수 객체
 * @param {boolean} useWebP - WebP 사용 여부 (기본값: true)
 * @returns {Object} 이미지 경로가 변환된 환수 객체
 */
export function transformSpiritImagePath(spirit, useWebP = true) {
  if (!spirit || typeof spirit.image !== 'string') {
    return spirit;
  }
  return {
    ...spirit,
    image: transformImagePath(spirit.image, useWebP),
  };
}

/**
 * 환수 배열의 이미지 경로 일괄 변환
 * @param {Array} spiritsArray - 환수 객체 배열
 * @param {boolean} useWebP - WebP 사용 여부 (기본값: true)
 * @returns {Array} 이미지 경로가 변환된 환수 객체 배열
 */
export function transformSpiritsArrayPaths(spiritsArray, useWebP = true) {
  if (!Array.isArray(spiritsArray)) {
    return spiritsArray;
  }
  return spiritsArray.map(spirit => transformSpiritImagePath(spirit, useWebP));
}

/**
 * 캐시 초기화 (테스트 또는 디버깅용)
 */
export function clearImagePathCache() {
  IMAGE_PATH_CACHE.clear();
}

/**
 * 현재 캐시 크기 반환
 * @returns {number} 캐시된 항목 수
 */
export function getCacheSize() {
  return IMAGE_PATH_CACHE.size;
}

/**
 * 이미지 로드 실패 시 원본으로 폴백하는 이벤트 핸들러 생성
 * @param {string} originalPath - 원본 이미지 경로
 * @returns {Function} 에러 핸들러 함수
 */
export function createImageFallbackHandler(originalPath) {
  return function(event) {
    const img = event.target;
    // 이미 원본 경로이면 재시도하지 않음
    if (img.src === originalPath || img.dataset.fallbackAttempted === 'true') {
      return;
    }
    
    // WebP 경로에서 원본으로 폴백
    if (img.src.endsWith('.webp')) {
      const fallbackPath = originalPath || img.src.replace(/\.webp$/i, '.jpg');
      img.dataset.fallbackAttempted = 'true';
      img.src = fallbackPath;
    }
  };
}

/**
 * 이미지 요소에 폴백 핸들러 추가
 * @param {HTMLImageElement} img - 이미지 요소
 * @param {string} originalPath - 원본 이미지 경로 (선택사항)
 */
export function addImageFallback(img, originalPath = null) {
  if (!img || !(img instanceof HTMLImageElement)) {
    return;
  }
  
  // 원본 경로가 없으면 현재 src에서 추출
  if (!originalPath) {
    originalPath = getOriginalImagePath(img.src);
  }
  
  // 이미 핸들러가 추가되었는지 확인
  if (img.dataset.fallbackHandlerAdded === 'true') {
    return;
  }
  
  const handler = createImageFallbackHandler(originalPath);
  img.addEventListener('error', handler, { once: true });
  img.dataset.fallbackHandlerAdded = 'true';
  img.dataset.originalPath = originalPath;
}

