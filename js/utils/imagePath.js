/**
 * 이미지 경로 변환 유틸리티
 * images/ 경로를 assets/img/로 변환하고 결과를 캐싱하여 성능 최적화
 */

// 이미지 경로 변환 결과 캐시 (중복 변환 방지)
const IMAGE_PATH_CACHE = new Map();

/**
 * 단일 이미지 경로 변환
 * images/로 시작하는 경로를 assets/img/로 변환
 * @param {string} imagePath - 변환할 이미지 경로
 * @returns {string} 변환된 이미지 경로
 */
export function transformImagePath(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') {
    return imagePath;
  }

  // 캐시 확인
  if (IMAGE_PATH_CACHE.has(imagePath)) {
    return IMAGE_PATH_CACHE.get(imagePath);
  }

  // 변환: images/로 시작하면 assets/img/로 변경
  const transformed = imagePath.replace(/^images\//, 'assets/img/');
  
  // 캐시 저장
  IMAGE_PATH_CACHE.set(imagePath, transformed);
  
  return transformed;
}

/**
 * 환수 객체의 이미지 경로 변환
 * @param {Object} spirit - 환수 객체
 * @returns {Object} 이미지 경로가 변환된 환수 객체
 */
export function transformSpiritImagePath(spirit) {
  if (!spirit || typeof spirit.image !== 'string') {
    return spirit;
  }
  return {
    ...spirit,
    image: transformImagePath(spirit.image),
  };
}

/**
 * 환수 배열의 이미지 경로 일괄 변환
 * @param {Array} spiritsArray - 환수 객체 배열
 * @returns {Array} 이미지 경로가 변환된 환수 객체 배열
 */
export function transformSpiritsArrayPaths(spiritsArray) {
  if (!Array.isArray(spiritsArray)) {
    return spiritsArray;
  }
  return spiritsArray.map(transformSpiritImagePath);
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

