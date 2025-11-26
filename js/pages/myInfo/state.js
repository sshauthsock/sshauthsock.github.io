/**
 * myInfo 페이지의 전역 상태 관리
 * pageState와 elements 객체를 관리합니다.
 */

/**
 * 페이지 상태 객체
 * 모든 모듈에서 공유되는 상태를 저장합니다.
 */
export const pageState = {
  currentCategory: "수호", // 오른쪽 그리드에서 보여줄 카테고리
  currentProfileId: null, // 현재 선택된 프로파일 ID
  // 결속 환수: 각 카테고리별 최대 6개
  bondSpirits: {
    수호: [], // [{ name, level, ...spirit }]
    탑승: [],
    변신: [],
  },
  // 사용 중인 환수: 각 카테고리별 1개
  activeSpirits: {
    수호: null, // { name, level, ...spirit }
    탑승: null,
    변신: null,
  },
  userStats: {}, // 사용자 기본 스탯
  baselineStats: {}, // 저장된 기준 스탯 (합산 결과)
  baselineKeyStats: {
    tachaeTotal: 0, // 환산타채 합 기준값
    statusEffectResistance: 0, // 상태이상저항 기준값
    statusEffectAccuracy: 0, // 상태이상적중 기준값
  },
  expTable: null, // 경험치 테이블 (캐시)
  lastSoulExpCalculation: null, // 마지막 경험치 계산 결과 (캐시)
  lastSoulExpHash: null, // 마지막 계산 시 사용된 데이터 해시
  bondCalculationCache: new Map(), // 결속 계산 결과 캐시
  lastTotalStatsCalculation: null, // 마지막 합산 스탯 계산 결과 (캐시)
  lastTotalStatsHash: null, // 마지막 합산 스탯 계산 시 사용된 데이터 해시
  savedSoulExp: 0, // 저장된 기준 총 환수혼 경험치
  baselineSoulExpHash: null, // baselineSoulExp 저장 시점의 해시값
  recentlyEditedStats: new Set(), // 방금 편집한 스탯 목록 (updateTotalStats에서 업데이트하지 않도록)
  isSavingBaseline: false, // 기준값 저장 중 플래그
  isInitialLoad: true, // 초기 로딩 플래그 (저장된 값 표시용)
  isUpdatingTotalStats: false, // updateTotalStats 실행 중 플래그 (중복 호출 방지)
  baselineStatsHash: null, // baselineStats 저장 시점의 해시값
  removedSpiritLevels: {}, // 제거된 환수의 레벨 정보 {category: {spiritName: level}}
  engravingData: {
    // 각인 데이터: { 카테고리: { 환수이름: { 스탯키: 각인점수 } } }
    수호: {},
    탑승: {},
    변신: {},
  },
  imageLoadErrors: new Set(), // 이미지 로드 실패 추적
  imageLoadErrorShown: false, // 이미지 로드 실패 메시지 표시 여부
  imageObserver: null, // 이미지 로드 에러 감지용 MutationObserver
};

/**
 * DOM 요소 참조 객체
 * 페이지의 주요 DOM 요소들을 저장합니다.
 */
export const elements = {};

