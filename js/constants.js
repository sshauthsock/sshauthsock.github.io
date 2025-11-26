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
  castingEnhancement: "시전향상",
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

// 등급 세트 효과 정의
export const GRADE_SET_EFFECTS = {
  수호: {
    전설: {
      2: { power: 150 },
      3: { power: 150, experienceGainIncrease: 10 },
      4: {
        power: 150,
        experienceGainIncrease: 10,
        damageResistancePenetration: 100,
      },
      5: {
        power: 150,
        experienceGainIncrease: 10,
        damageResistancePenetration: 100,
        statusEffectResistance: 150,
      },
      6: {
        power: 150,
        experienceGainIncrease: 10,
        damageResistancePenetration: 100,
        statusEffectResistance: 150,
        damageResistance: 100,
      },
    },
    불멸: {
      2: { damageResistancePenetration: 200 },
      3: { damageResistancePenetration: 200, damageResistance: 150 },
      4: {
        damageResistancePenetration: 200,
        damageResistance: 150,
        experienceGainIncrease: 15,
      },
      5: {
        damageResistancePenetration: 200,
        damageResistance: 150,
        experienceGainIncrease: 15,
        pvpDamagePercent: 20,
      },
      6: {
        damageResistancePenetration: 200,
        damageResistance: 150,
        experienceGainIncrease: 15,
        pvpDamagePercent: 20,
        pvpDefensePercent: 20,
      },
    },
  },
  탑승: {
    전설: {
      2: { normalMonsterAdditionalDamage: 50 },
      3: { normalMonsterAdditionalDamage: 50, bossMonsterAdditionalDamage: 50 },
      4: {
        normalMonsterAdditionalDamage: 50,
        bossMonsterAdditionalDamage: 50,
        damageResistancePenetration: 50,
      },
      5: {
        normalMonsterAdditionalDamage: 50,
        bossMonsterAdditionalDamage: 50,
        damageResistancePenetration: 50,
        statusEffectAccuracy: 50,
      },
      6: {
        normalMonsterAdditionalDamage: 50,
        bossMonsterAdditionalDamage: 50,
        damageResistancePenetration: 50,
        statusEffectAccuracy: 50,
        damageResistance: 50,
      },
    },
    불멸: {
      2: { damageResistancePenetration: 150 },
      3: { damageResistancePenetration: 150, damageResistance: 150 },
      4: {
        damageResistancePenetration: 150,
        damageResistance: 150,
        movementSpeed: 5,
      },
      5: {
        damageResistancePenetration: 150,
        damageResistance: 150,
        movementSpeed: 5,
        pvpDamagePercent: 20,
      },
      6: {
        damageResistancePenetration: 150,
        damageResistance: 150,
        movementSpeed: 5,
        pvpDamagePercent: 20,
        pvpDefensePercent: 20,
      },
    },
  },
  변신: {
    전설: {
      2: { magicIncreasePercent: 3 },
      3: { magicIncreasePercent: 3, healthIncreasePercent: 3 },
      4: {
        magicIncreasePercent: 3,
        healthIncreasePercent: 3,
        damageResistancePenetration: 100,
      },
      5: {
        magicIncreasePercent: 3,
        healthIncreasePercent: 3,
        damageResistancePenetration: 100,
        movementSpeed: 3,
      },
      6: {
        magicIncreasePercent: 3,
        healthIncreasePercent: 3,
        damageResistancePenetration: 100,
        movementSpeed: 3,
        damageResistance: 100,
      },
    },
    불멸: {
      2: { damageResistancePenetration: 150 },
      3: { damageResistancePenetration: 150, damageResistance: 150 },
      4: {
        damageResistancePenetration: 150,
        damageResistance: 150,
        criticalPowerPercent: 30,
      },
      5: {
        damageResistancePenetration: 150,
        damageResistance: 150,
        criticalPowerPercent: 30,
        pvpDamagePercent: 20,
      },
      6: {
        damageResistancePenetration: 150,
        damageResistance: 150,
        criticalPowerPercent: 30,
        pvpDamagePercent: 20,
        pvpDefensePercent: 20,
      },
    },
  },
};

// 세력 세트 효과 정의 (카테고리별로 다름)
export const FACTION_SET_EFFECTS = {
  수호: {
    결의: {
      2: {
        damageResistance: 50,
        normalMonsterAdditionalDamage: 100,
        experienceGainIncrease: 4,
      },
      3: {
        damageResistance: 80,
        normalMonsterAdditionalDamage: 150,
        experienceGainIncrease: 6,
      },
      4: {
        damageResistance: 130,
        normalMonsterAdditionalDamage: 250,
        experienceGainIncrease: 10,
      },
      5: {
        damageResistance: 150,
        normalMonsterAdditionalDamage: 270,
        experienceGainIncrease: 12,
      },
      6: {
        damageResistance: 200,
        normalMonsterAdditionalDamage: 400,
        experienceGainIncrease: 15,
      },
    },
    고요: {
      2: {
        damageResistance: 50,
        bossMonsterAdditionalDamage: 100,
        experienceGainIncrease: 4,
      },
      3: {
        damageResistance: 80,
        bossMonsterAdditionalDamage: 150,
        experienceGainIncrease: 6,
      },
      4: {
        damageResistance: 130,
        bossMonsterAdditionalDamage: 250,
        experienceGainIncrease: 10,
      },
      5: {
        damageResistance: 150,
        bossMonsterAdditionalDamage: 270,
        experienceGainIncrease: 12,
      },
      6: {
        damageResistance: 200,
        bossMonsterAdditionalDamage: 400,
        experienceGainIncrease: 15,
      },
    },
    의지: {
      2: {
        damageResistance: 50,
        criticalDamageResistance: 100,
        experienceGainIncrease: 4,
      },
      3: {
        damageResistance: 80,
        criticalDamageResistance: 150,
        experienceGainIncrease: 6,
      },
      4: {
        damageResistance: 130,
        criticalDamageResistance: 250,
        experienceGainIncrease: 10,
      },
      5: {
        damageResistance: 150,
        criticalDamageResistance: 270,
        experienceGainIncrease: 12,
      },
      6: {
        damageResistance: 200,
        criticalDamageResistance: 400,
        experienceGainIncrease: 15,
      },
    },
    침착: {
      2: {
        damageResistancePenetration: 30,
        damageAbsorption: 700,
        experienceGainIncrease: 4,
      },
      3: {
        damageResistancePenetration: 50,
        damageAbsorption: 1200,
        experienceGainIncrease: 6,
      },
      4: {
        damageResistancePenetration: 80,
        damageAbsorption: 2000,
        experienceGainIncrease: 10,
      },
      5: {
        damageResistancePenetration: 90,
        damageAbsorption: 2200,
        experienceGainIncrease: 12,
      },
      6: {
        damageResistancePenetration: 130,
        damageAbsorption: 3000,
        experienceGainIncrease: 15,
      },
    },
    냉정: {
      2: {
        damageResistancePenetration: 30,
        pvpDefense: 1000,
        experienceGainIncrease: 4,
      },
      3: {
        damageResistancePenetration: 50,
        pvpDefense: 1500,
        experienceGainIncrease: 6,
      },
      4: {
        damageResistancePenetration: 80,
        pvpDefense: 2500,
        experienceGainIncrease: 10,
      },
      5: {
        damageResistancePenetration: 90,
        pvpDefense: 2700,
        experienceGainIncrease: 12,
      },
      6: {
        damageResistancePenetration: 130,
        pvpDefense: 4000,
        experienceGainIncrease: 15,
      },
    },
    활력: {
      2: {
        damageResistancePenetration: 30,
        castingEnhancement: 100,
        experienceGainIncrease: 4,
      },
      3: {
        damageResistancePenetration: 50,
        castingEnhancement: 150,
        experienceGainIncrease: 6,
      },
      4: {
        damageResistancePenetration: 80,
        castingEnhancement: 250,
        experienceGainIncrease: 10,
      },
      5: {
        damageResistancePenetration: 90,
        castingEnhancement: 270,
        experienceGainIncrease: 12,
      },
      6: {
        damageResistancePenetration: 130,
        castingEnhancement: 400,
        experienceGainIncrease: 15,
      },
    },
  },
  탑승: {
    결의: {
      2: {
        magicIncreasePercent: 1,
        castingEnhancement: 60,
        criticalPower: 250,
      },
      3: {
        magicIncreasePercent: 1,
        castingEnhancement: 90,
        criticalPower: 500,
      },
      4: {
        magicIncreasePercent: 2,
        castingEnhancement: 150,
        criticalPower: 750,
      },
      5: {
        magicIncreasePercent: 2,
        castingEnhancement: 170,
        criticalPower: 850,
      },
      6: {
        magicIncreasePercent: 3,
        castingEnhancement: 200,
        criticalPower: 1200,
      },
    },
    고요: {
      2: {
        healthIncreasePercent: 1,
        criticalChance: 200,
        destructionPowerIncrease: 7000,
      },
      3: {
        healthIncreasePercent: 1,
        criticalChance: 400,
        destructionPowerIncrease: 12000,
      },
      4: {
        healthIncreasePercent: 2,
        criticalChance: 600,
        destructionPowerIncrease: 15000,
      },
      5: {
        healthIncreasePercent: 2,
        criticalChance: 700,
        destructionPowerIncrease: 21000,
      },
      6: {
        healthIncreasePercent: 3,
        criticalChance: 1000,
        destructionPowerIncrease: 25000,
      },
    },
    의지: {
      2: {
        magicIncreasePercent: 1,
        damageAbsorption: 500,
        criticalDamageResistance: 60,
      },
      3: {
        magicIncreasePercent: 1,
        damageAbsorption: 700,
        criticalDamageResistance: 90,
      },
      4: {
        magicIncreasePercent: 2,
        damageAbsorption: 1200,
        criticalDamageResistance: 150,
      },
      5: {
        magicIncreasePercent: 2,
        damageAbsorption: 1300,
        criticalDamageResistance: 170,
      },
      6: {
        magicIncreasePercent: 3,
        damageAbsorption: 2000,
        criticalDamageResistance: 250,
      },
    },
    침착: {
      2: {
        magicIncreasePercent: 1,
        damageIncrease: 5,
        magicRecoveryImprovement: 3,
      },
      3: {
        magicIncreasePercent: 1,
        damageIncrease: 7,
        magicRecoveryImprovement: 4,
      },
      4: {
        magicIncreasePercent: 2,
        damageIncrease: 12,
        magicRecoveryImprovement: 7,
      },
      5: {
        magicIncreasePercent: 2,
        damageIncrease: 14,
        magicRecoveryImprovement: 8,
      },
      6: {
        magicIncreasePercent: 3,
        damageIncrease: 20,
        magicRecoveryImprovement: 12,
      },
    },
    냉정: {
      2: { criticalPowerPercent: 5, healthIncreasePercent: 1, pvpDefense: 600 },
      3: { criticalPowerPercent: 7, healthIncreasePercent: 1, pvpDefense: 900 },
      4: {
        criticalPowerPercent: 12,
        healthIncreasePercent: 2,
        pvpDefense: 1500,
      },
      5: {
        criticalPowerPercent: 14,
        healthIncreasePercent: 2,
        pvpDefense: 1700,
      },
      6: {
        criticalPowerPercent: 20,
        healthIncreasePercent: 3,
        pvpDefense: 2500,
      },
    },
    활력: {
      2: { healthIncreasePercent: 1, power: 50, healthRecoveryImprovement: 3 },
      3: { healthIncreasePercent: 1, power: 70, healthRecoveryImprovement: 4 },
      4: { healthIncreasePercent: 2, power: 120, healthRecoveryImprovement: 7 },
      5: { healthIncreasePercent: 2, power: 140, healthRecoveryImprovement: 8 },
      6: {
        healthIncreasePercent: 3,
        power: 200,
        healthRecoveryImprovement: 12,
      },
    },
  },
  변신: {
    결의: {
      2: {
        damageResistancePenetration: 30,
        damageAbsorption: 700,
        movementSpeed: 1,
      },
      3: {
        damageResistancePenetration: 50,
        damageAbsorption: 1200,
        movementSpeed: 1,
      },
      4: {
        damageResistancePenetration: 80,
        damageAbsorption: 2000,
        movementSpeed: 3,
      },
      5: {
        damageResistancePenetration: 90,
        damageAbsorption: 2200,
        movementSpeed: 3,
      },
      6: {
        damageResistancePenetration: 130,
        damageAbsorption: 3000,
        movementSpeed: 4,
      },
    },
    고요: {
      2: {
        damageResistancePenetration: 30,
        pvpDefense: 1000,
        movementSpeed: 1,
      },
      3: {
        damageResistancePenetration: 50,
        pvpDefense: 1500,
        movementSpeed: 1,
      },
      4: {
        damageResistancePenetration: 80,
        pvpDefense: 2500,
        movementSpeed: 3,
      },
      5: {
        damageResistancePenetration: 90,
        pvpDefense: 2700,
        movementSpeed: 3,
      },
      6: {
        damageResistancePenetration: 130,
        pvpDefense: 4000,
        movementSpeed: 4,
      },
    },
    의지: {
      2: {
        damageResistance: 50,
        criticalDamageResistance: 120,
        movementSpeed: 1,
      },
      3: {
        damageResistance: 80,
        criticalDamageResistance: 200,
        movementSpeed: 1,
      },
      4: {
        damageResistance: 130,
        criticalDamageResistance: 300,
        movementSpeed: 3,
      },
      5: {
        damageResistance: 150,
        criticalDamageResistance: 370,
        movementSpeed: 3,
      },
      6: {
        damageResistance: 200,
        criticalDamageResistance: 450,
        movementSpeed: 4,
      },
    },
    침착: {
      2: {
        damageResistance: 50,
        normalMonsterAdditionalDamage: 120,
        movementSpeed: 1,
      },
      3: {
        damageResistance: 80,
        normalMonsterAdditionalDamage: 200,
        movementSpeed: 1,
      },
      4: {
        damageResistance: 130,
        normalMonsterAdditionalDamage: 300,
        movementSpeed: 3,
      },
      5: {
        damageResistance: 150,
        normalMonsterAdditionalDamage: 350,
        movementSpeed: 3,
      },
      6: {
        damageResistance: 200,
        normalMonsterAdditionalDamage: 450,
        movementSpeed: 4,
      },
    },
    냉정: {
      2: {
        damageResistancePenetration: 30,
        castingEnhancement: 100,
        movementSpeed: 1,
      },
      3: {
        damageResistancePenetration: 50,
        castingEnhancement: 150,
        movementSpeed: 1,
      },
      4: {
        damageResistancePenetration: 80,
        castingEnhancement: 250,
        movementSpeed: 3,
      },
      5: {
        damageResistancePenetration: 90,
        castingEnhancement: 270,
        movementSpeed: 3,
      },
      6: {
        damageResistancePenetration: 130,
        castingEnhancement: 400,
        movementSpeed: 4,
      },
    },
    활력: {
      2: {
        damageResistance: 50,
        bossMonsterAdditionalDamage: 120,
        movementSpeed: 1,
      },
      3: {
        damageResistance: 80,
        bossMonsterAdditionalDamage: 200,
        movementSpeed: 1,
      },
      4: {
        damageResistance: 130,
        bossMonsterAdditionalDamage: 300,
        movementSpeed: 3,
      },
      5: {
        damageResistance: 150,
        bossMonsterAdditionalDamage: 350,
        movementSpeed: 3,
      },
      6: {
        damageResistance: 200,
        bossMonsterAdditionalDamage: 450,
        movementSpeed: 4,
      },
    },
  },
};
