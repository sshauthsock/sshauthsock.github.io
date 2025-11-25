/**
 * myInfo 페이지에서 사용하는 모든 상수 정의
 */

// 스탯 정의
export const STATS_CONFIG = [
  // 1컬럼
  { key: "damageResistancePenetration", name: "피해저항관통" },
  { key: "damageResistance", name: "피해저항" },
  { key: "pvpDamagePercent", name: "대인피해%" },
  { key: "pvpDefensePercent", name: "대인방어%" },
  { key: "pvpDamage", name: "대인피해" },
  { key: "pvpDefense", name: "대인방어" },
  { key: "statusEffectAccuracy", name: "상태이상적중" },
  { key: "statusEffectResistance", name: "상태이상저항" },
  // 2컬럼
  { key: "normalMonsterPenetration", name: "일반몬스터 관통" },
  { key: "normalMonsterAdditionalDamage", name: "일반몬스터 추가피해" },
  { key: "bossMonsterPenetration", name: "보스몬스터 관통" },
  { key: "bossMonsterAdditionalDamage", name: "보스몬스터 추가피해" },
  { key: "criticalPowerPercent", name: "치명위력%" },
  { key: "criticalChance", name: "치명확률%" },
  { key: "power", name: "위력" },
  { key: "movementSpeed", name: "이동속도" },
  // 3컬럼
  { key: "damageAbsorption", name: "피해흡수" },
  { key: "criticalResistance", name: "치명저항" },
  { key: "criticalDamageResistance", name: "치명피해저항" },
  { key: "experienceGainIncrease", name: "경험치 획득증가" },
  { key: "normalMonsterResistance", name: "일반몬스터 저항" },
  { key: "bossMonsterResistance", name: "보스몬스터 저항" },
];

// 환수 각인 등록효과에 사용 가능한 스탯 리스트
export const ENGRAVING_REGISTRATION_STATS = [
  { key: "healthIncrease", name: "체력증가" },
  { key: "magicIncrease", name: "마력증가" },
  { key: "criticalChance", name: "치명확률" },
  { key: "criticalResistance", name: "치명저항" },
  { key: "healthPotionEnhancement", name: "체력시약향상" },
  { key: "magicPotionEnhancement", name: "마력시약향상" },
  { key: "pvpDefense", name: "대인방어" },
  { key: "damageAbsorption", name: "피해흡수" },
  { key: "power", name: "위력" },
  { key: "criticalDamageResistance", name: "치명피해저항" },
  { key: "castingEnhancement", name: "시전향상" },
  { key: "bossMonsterAdditionalDamage", name: "보스몬스터 추가피해" },
  { key: "normalMonsterAdditionalDamage", name: "일반몬스터 추가피해" },
  { key: "damageResistancePenetration", name: "피해저항관통" },
  { key: "statusEffectResistance", name: "상태이상저항" },
  { key: "statusEffectAccuracy", name: "상태이상적중" },
];

// 컬럼별 스탯 분리
export const COLUMN_1_STATS = STATS_CONFIG.slice(0, 8);
export const COLUMN_2_STATS = STATS_CONFIG.slice(8, 16);
export const COLUMN_3_STATS = STATS_CONFIG.slice(16);

// 모바일 스탯 이름 간소화 매핑
export const MOBILE_STAT_NAME_MAP = {
  피해저항관통: "피저관",
  피해저항: "피저",
  "대인피해%": "대피%",
  "대인방어%": "대방%",
  대인피해: "대피",
  대인방어: "대방",
  상태이상적중: "상이적",
  상태이상저항: "상이저",
  "일반몬스터 관통": "일몬관",
  "일반몬스터 추가피해": "일몬추",
  "보스몬스터 관통": "보몬관",
  "보스몬스터 추가피해": "보몬추",
  "치명위력%": "치위%",
  "치명확률%": "치확%",
  위력: "위력",
  이동속도: "이속",
  피해흡수: "피흡",
  치명저항: "치저",
  치명피해저항: "치피저",
  "경험치 획득증가": "경획",
  "일반몬스터 저항": "일몬저",
  "보스몬스터 저항": "보몬저",
};

// 주요 스탯 클래스 정의
export const SPECIAL_STAT_CLASSES = {
  damageResistance: "stat-damage-resistance",
  damageResistancePenetration: "stat-damage-resistance-penetration",
  pvpDefensePercent: "stat-pvp-defense-percent",
  pvpDamagePercent: "stat-pvp-damage-percent",
};

// 보조 스탯 클래스 정의 (주요 스탯보다 더 연하게 표시)
export const SECONDARY_STAT_CLASSES = {
  pvpDamage: "stat-pvp-damage",
  pvpDefense: "stat-pvp-defense",
  statusEffectAccuracy: "stat-status-effect-accuracy",
  statusEffectResistance: "stat-status-effect-resistance",
  damageAbsorption: "stat-damage-absorption",
};
