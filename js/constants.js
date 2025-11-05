export const FACTION_ICONS = {
  결의: "assets/img/bond/결의.jpg",
  고요: "assets/img/bond/고요.jpg",
  의지: "assets/img/bond/의지.jpg",
  침착: "assets/img/bond/침착.jpg",
  냉정: "assets/img/bond/냉정.jpg",
  활력: "assets/img/bond/활력.jpg",
};

export const STATS_MAPPING = {
  experienceGainIncrease: "경험치획득증가",
  lootAcquisitionIncrease: "전리품획득증가",
  movementSpeed: "이동속도",
  damageResistancePenetration: "피해저항관통",
  healthIncreasePercent: "체력증가%",
  magicIncreasePercent: "마력증가%",
  damageResistance: "피해저항",
  pvpDamagePercent: "대인피해%",
  pvpDefensePercent: "대인방어%",
  pvpDamage: "대인피해",
  pvpDefense: "대인방어",
  statusEffectAccuracy: "상태이상적중",
  statusEffectResistance: "상태이상저항",
  normalMonsterAdditionalDamage: "일반몬스터추가피해",
  normalMonsterPenetration: "일반몬스터관통",
  normalMonsterResistance: "일반몬스터저항",
  bossMonsterAdditionalDamage: "보스몬스터추가피해",
  bossMonsterPenetration: "보스몬스터관통",
  bossMonsterResistance: "보스몬스터저항",
  criticalPowerPercent: "치명위력%",
  destructionPowerIncrease: "파괴력증가",
  destructionPowerPercent: "파괴력증가%",
  criticalDamageResistance: "치명피해저항",
  criticalResistance: "치명저항",
  armorStrength: "무장도",
  strength: "힘",
  agility: "민첩",
  intelligence: "지력",
  power: "위력",
  damageAbsorption: "피해흡수",
  healthIncrease: "체력증가",
  magicIncrease: "마력증가",
  healthPotionEnhancement: "체력시약향상",
  magicPotionEnhancement: "마력시약향상",
  damageIncrease: "피해증가",
  healthRecoveryImprovement: "체력회복향상",
  magicRecoveryImprovement: "마력회복향상",
  criticalChance: "치명확률",
  criticalPower: "치명위력",
};

export const GRADE_ORDER = {
  전설: 1,
  불멸: 2,
};

export const INFLUENCE_ROWS = [
  ["결의", "고요", "의지"],
  ["침착", "냉정", "활력"],
];

export const PERCENT_STATS = [
  "pvpDamagePercent",
  "pvpDefensePercent",
  "criticalPowerPercent",
  "healthIncreasePercent",
  "magicIncreasePercent",
  "destructionPowerPercent",
];

export const EFFECTIVE_STATS = [
  "damageResistance",
  "damageResistancePenetration",
  "pvpDamagePercent",
  "pvpDefensePercent",
];

// 25레벨 고정 환수들 (레벨 변경 불가)
export const FIXED_LEVEL_SPIRITS = [
  "냉정의 수호",
  "침착의 수호",
  "결의의 수호",
  "고요의 수호",
  "활력의 수호",
  "의지의 수호",
  "냉정의 탑승",
  "침착의 탑승",
  "결의의 탑승",
  "고요의 탑승",
  "활력의 탑승",
  "의지의 탑승",
  "냉정의 변신",
  "침착의 변신",
  "결의의 변신",
  "고요의 변신",
  "활력의 변신",
  "의지의 변신",
];

// 환수가 레벨 고정인지 확인하는 함수
export function isFixedLevelSpirit(spiritName) {
  return FIXED_LEVEL_SPIRITS.includes(spiritName);
}
