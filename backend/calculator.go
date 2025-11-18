package main

import (
	"reflect"
	"sort"
	"strconv"
	"unicode"
)

var percentStats = map[string]bool{
	"healthIncreasePercent":   true,
	"magicIncreasePercent":    true,
	"criticalPowerPercent":    true,
	"pvpDamagePercent":        true,
	"pvpDefensePercent":       true,
	"destructionPowerPercent": true,
}
var statsMapping = map[string]string{
	"experienceGainIncrease":        "경험치획득증가",
	"lootAcquisitionIncrease":       "전리품획득증가",
	"movementSpeed":                 "이동속도",
	"damageResistancePenetration":   "피해저항관통",
	"healthIncreasePercent":         "체력증가%",
	"magicIncreasePercent":    	     "마력증가%",
	"damageResistance":              "피해저항",
	"pvpDamagePercent":              "대인피해%",
	"pvpDefensePercent":             "대인방어%",
	"pvpDamage":                     "대인피해",
	"pvpDefense":                    "대인방어",
	"statusEffectAccuracy":          "상태이상적중",
	"statusEffectResistance":        "상태이상저항",
	"normalMonsterAdditionalDamage": "일반몬스터추가피해",
	"normalMonsterPenetration":      "일반몬스터관통",
	"normalMonsterResistance":       "일반몬스터저항",
	"bossMonsterAdditionalDamage":   "보스몬스터추가피해",
	"bossMonsterPenetration":      	 "보스몬스터관통",
	"bossMonsterResistance":         "보스몬스터저항",
	"criticalPowerPercent":          "치명위력%",
	"destructionPowerIncrease":      "파괴력증가",
	"destructionPowerPercent":       "파괴력증가%",
	"criticalDamageResistance":      "치명피해저항",
	"criticalResistance":            "치명저항",
	"armorStrength":                 "무장도",
	"strength":                      "힘",
	"agility":                       "민첩",
	"intelligence":                  "지력",
	"power":                         "위력",
	"damageAbsorption":              "피해흡수",
	"healthIncrease":                "체력증가",
	"magicIncrease":                 "마력증가",
	"healthPotionEnhancement":       "체력시약향상",
	"magicPotionEnhancement":        "마력시약향상",
	"damageIncrease":                "피해증가",
	"healthRecoveryImprovement":     "체력회복향상",
	"magicRecoveryImprovement":      "마력회복향상",
	"criticalChance":                "치명확률",
	"criticalPower":                 "치명위력",
}
var gradeSetEffects = map[string]map[string]map[string]map[string]float64{
	"수호": {
		"전설": {
			"2": {"power": 150},
			"3": {"power": 150, "experienceGainIncrease": 10},
			"4": {"power": 150, "experienceGainIncrease": 10, "damageResistancePenetration": 100},
			"5": {"power": 150, "experienceGainIncrease": 10, "damageResistancePenetration": 100, "statusEffectResistance": 150},
			"6": {"power": 150, "experienceGainIncrease": 10, "damageResistancePenetration": 100, "statusEffectResistance": 150, "damageResistance": 100},
		},
		"불멸": {
			"2": {"damageResistancePenetration": 200},
			"3": {"damageResistancePenetration": 200, "damageResistance": 150},
			"4": {"damageResistancePenetration": 200, "damageResistance": 150, "experienceGainIncrease": 15},
			"5": {"damageResistancePenetration": 200, "damageResistance": 150, "experienceGainIncrease": 15, "pvpDamagePercent": 20},
			"6": {"damageResistancePenetration": 200, "damageResistance": 150, "experienceGainIncrease": 15, "pvpDamagePercent": 20, "pvpDefensePercent": 20},
		},
	},
	"탑승": {
		"전설": {
			"2": {"normalMonsterAdditionalDamage": 50},
			"3": {"normalMonsterAdditionalDamage": 50, "bossMonsterAdditionalDamage": 50},
			"4": {"normalMonsterAdditionalDamage": 50, "bossMonsterAdditionalDamage": 50, "damageResistancePenetration": 50},
			"5": {"normalMonsterAdditionalDamage": 50, "bossMonsterAdditionalDamage": 50, "damageResistancePenetration": 50, "statusEffectAccuracy": 50},
			"6": {"normalMonsterAdditionalDamage": 50, "bossMonsterAdditionalDamage": 50, "damageResistancePenetration": 50, "statusEffectAccuracy": 50, "damageResistance": 50},
		},
		"불멸": {
			"2": {"damageResistancePenetration": 150},
			"3": {"damageResistancePenetration": 150, "damageResistance": 150},
			"4": {"damageResistancePenetration": 150, "damageResistance": 150, "movementSpeed": 5},
			"5": {"damageResistancePenetration": 150, "damageResistance": 150, "movementSpeed": 5, "pvpDamagePercent": 20},
			"6": {"damageResistancePenetration": 150, "damageResistance": 150, "movementSpeed": 5, "pvpDamagePercent": 20, "pvpDefensePercent": 20},
		},
	},
	"변신": {
		"전설": {
			"2": {"magicIncreasePercent": 3},
			"3": {"magicIncreasePercent": 3, "healthIncreasePercent": 3},
			"4": {"magicIncreasePercent": 3, "healthIncreasePercent": 3, "damageResistancePenetration": 100},
			"5": {"magicIncreasePercent": 3, "healthIncreasePercent": 3, "damageResistancePenetration": 100, "movementSpeed": 3},
			"6": {"magicIncreasePercent": 3, "healthIncreasePercent": 3, "damageResistancePenetration": 100, "movementSpeed": 3, "damageResistance": 100},
		},
		"불멸": {
			"2": {"damageResistancePenetration": 150},
			"3": {"damageResistancePenetration": 150, "damageResistance": 150},
			"4": {"damageResistancePenetration": 150, "damageResistance": 150, "criticalPowerPercent": 30},
			"5": {"damageResistancePenetration": 150, "damageResistance": 150, "criticalPowerPercent": 30, "pvpDamagePercent": 20},
			"6": {"damageResistancePenetration": 150, "damageResistance": 150, "criticalPowerPercent": 30, "pvpDamagePercent": 20, "pvpDefensePercent": 20},
		},
	},
}

type FactionEffectStep struct {
	CriticalChance                int `json:"criticalChance,omitempty"`
	HealthIncreasePercent         int `json:"healthIncreasePercent,omitempty"`
	DestructionPowerIncrease      int `json:"destructionPowerIncrease,omitempty"`
	Count                         int `json:"count"` // This field is mandatory for determining the step
	MagicIncreasePercent          int `json:"magicIncreasePercent,omitempty"`
	DamageIncrease                int `json:"damageIncrease,omitempty"`
	MagicRecoveryIncrease         int `json:"magicRecoveryIncrease,omitempty"`
	CriticalPowerPercent          int `json:"criticalPowerPercent,omitempty"`
	PvpDefense                    int `json:"pvpDefense,omitempty"`
	DamageAbsorption              int `json:"damageAbsorption,omitempty"`
	CriticalDamageResistance      int `json:"criticalDamageResistance,omitempty"`
	Power                         int `json:"power,omitempty"`
	HealthRecoveryIncrease        int `json:"healthRecoveryIncrease,omitempty"`
	CriticalPower                 int `json:"criticalPower,omitempty"`
	CastingSpeedIncrease          int `json:"castingSpeedIncrease,omitempty"`
	DamageResistance              int `json:"damageResistance,omitempty"`
	BossMonsterAdditionalDamage   int `json:"bossMonsterAdditionalDamage,omitempty"`
	MovementSpeed                 int `json:"movementSpeed,omitempty"`
	NormalMonsterAdditionalDamage int `json:"normalMonsterAdditionalDamage,omitempty"`
	DamageResistancePenetration   int `json:"damageResistancePenetration,omitempty"`
	ExperienceGainIncrease        int `json:"experienceGainIncrease,omitempty"`
}

var factionSetEffects = map[string]map[string][]FactionEffectStep{
	"탑승": {
		"고요": {
			{CriticalChance: 200, HealthIncreasePercent: 1, DestructionPowerIncrease: 7000, Count: 2},
			{CriticalChance: 400, HealthIncreasePercent: 1, DestructionPowerIncrease: 12000, Count: 3},
			{Count: 4, DestructionPowerIncrease: 15000, HealthIncreasePercent: 2, CriticalChance: 600},
			{CriticalChance: 700, DestructionPowerIncrease: 21000, Count: 5, HealthIncreasePercent: 2},
			{Count: 6, DestructionPowerIncrease: 25000, CriticalChance: 1000, HealthIncreasePercent: 3},
		},
		"침착": {
			{MagicIncreasePercent: 1, DamageIncrease: 5, Count: 2, MagicRecoveryIncrease: 3},
			{Count: 3, DamageIncrease: 7, MagicIncreasePercent: 1, MagicRecoveryIncrease: 4},
			{MagicIncreasePercent: 2, Count: 4, MagicRecoveryIncrease: 7, DamageIncrease: 12},
			{DamageIncrease: 14, Count: 5, MagicRecoveryIncrease: 8, MagicIncreasePercent: 2},
			{DamageIncrease: 20, MagicRecoveryIncrease: 12, Count: 6, MagicIncreasePercent: 3},
		},
		"냉정": {
			{CriticalPowerPercent: 5, Count: 2, PvpDefense: 600, HealthIncreasePercent: 1},
			{HealthIncreasePercent: 1, Count: 3, PvpDefense: 900, CriticalPowerPercent: 7},
			{HealthIncreasePercent: 2, Count: 4, PvpDefense: 1500, CriticalPowerPercent: 12},
			{HealthIncreasePercent: 2, CriticalPowerPercent: 14, Count: 5, PvpDefense: 1700},
			{CriticalPowerPercent: 20, PvpDefense: 2500, HealthIncreasePercent: 3, Count: 6},
		},
		"의지": {
			{MagicIncreasePercent: 1, Count: 2, DamageAbsorption: 500, CriticalDamageResistance: 60},
			{Count: 3, DamageAbsorption: 700, CriticalDamageResistance: 90, MagicIncreasePercent: 1},
			{DamageAbsorption: 1200, CriticalDamageResistance: 150, Count: 4, MagicIncreasePercent: 2},
			{CriticalDamageResistance: 170, DamageAbsorption: 1300, MagicIncreasePercent: 2, Count: 5},
			{Count: 6, MagicIncreasePercent: 3, CriticalDamageResistance: 250, DamageAbsorption: 2000},
		},
		"활력": {
			{HealthRecoveryIncrease: 3, HealthIncreasePercent: 1, Power: 50, Count: 2},
			{HealthRecoveryIncrease: 4, Power: 70, HealthIncreasePercent: 1, Count: 3},
			{HealthIncreasePercent: 2, Power: 120, HealthRecoveryIncrease: 7, Count: 4},
			{Count: 5, HealthRecoveryIncrease: 8, Power: 140, HealthIncreasePercent: 2},
			{Power: 200, Count: 6, HealthRecoveryIncrease: 12, HealthIncreasePercent: 3},
		},
		"결의": {
			{MagicIncreasePercent: 1, CastingSpeedIncrease: 60, CriticalPower: 250, Count: 2},
			{CriticalPower: 500, CastingSpeedIncrease: 90, Count: 3, MagicIncreasePercent: 1},
			{CastingSpeedIncrease: 150, Count: 4, MagicIncreasePercent: 2, CriticalPower: 750},
			{CriticalPower: 850, CastingSpeedIncrease: 170, MagicIncreasePercent: 2, Count: 5},
			{CriticalPower: 1200, CastingSpeedIncrease: 200, Count: 6, MagicIncreasePercent: 3},
		},
	},
	"변신": {
		"활력": {
			{DamageResistance: 50, BossMonsterAdditionalDamage: 120, MovementSpeed: 1, Count: 2},
			{DamageResistance: 80, MovementSpeed: 1, BossMonsterAdditionalDamage: 200, Count: 3},
			{MovementSpeed: 3, BossMonsterAdditionalDamage: 300, Count: 4, DamageResistance: 130},
			{MovementSpeed: 3, Count: 5, DamageResistance: 150, BossMonsterAdditionalDamage: 350},
			{DamageResistance: 200, MovementSpeed: 4, Count: 6, BossMonsterAdditionalDamage: 450},
		},
		"침착": {
			{Count: 2, DamageResistance: 50, MovementSpeed: 1, NormalMonsterAdditionalDamage: 120},
			{Count: 3, NormalMonsterAdditionalDamage: 200, MovementSpeed: 1, DamageResistance: 80},
			{NormalMonsterAdditionalDamage: 300, MovementSpeed: 3, Count: 4, DamageResistance: 130},
			{NormalMonsterAdditionalDamage: 350, MovementSpeed: 3, DamageResistance: 150, Count: 5},
			{Count: 6, DamageResistance: 200, NormalMonsterAdditionalDamage: 450, MovementSpeed: 4},
		},
		"고요": {
			{DamageResistancePenetration: 30, PvpDefense: 1000, Count: 2, MovementSpeed: 1},
			{DamageResistancePenetration: 50, PvpDefense: 1500, MovementSpeed: 1, Count: 3},
			{MovementSpeed: 3, Count: 4, DamageResistancePenetration: 80, PvpDefense: 2500},
			{MovementSpeed: 3, Count: 5, DamageResistancePenetration: 90, PvpDefense: 2800},
			{MovementSpeed: 4, Count: 6, DamageResistancePenetration: 130, PvpDefense: 4000},
		},
		"의지": {
			{DamageResistance: 50, MovementSpeed: 1, Count: 2, CriticalDamageResistance: 120},
			{MovementSpeed: 1, CriticalDamageResistance: 200, Count: 3, DamageResistance: 80},
			{Count: 4, CriticalDamageResistance: 300, DamageResistance: 130, MovementSpeed: 3},
			{MovementSpeed: 3, Count: 5, DamageResistance: 150, CriticalDamageResistance: 370},
			{Count: 6, MovementSpeed: 4, CriticalDamageResistance: 450, DamageResistance: 200},
		},
		"결의": {
			{DamageResistancePenetration: 30, MovementSpeed: 1, DamageAbsorption: 700, Count: 2},
			{Count: 3, MovementSpeed: 1, DamageAbsorption: 1200, DamageResistancePenetration: 50},
			{MovementSpeed: 3, DamageAbsorption: 2000, Count: 4, DamageResistancePenetration: 80},
			{DamageResistancePenetration: 90, MovementSpeed: 3, DamageAbsorption: 2300, Count: 5},
			{DamageAbsorption: 3000, MovementSpeed: 4, Count: 6, DamageResistancePenetration: 130},
		},
		"냉정": {
			{Count: 2, DamageResistancePenetration: 30, CastingSpeedIncrease: 100, MovementSpeed: 1},
			{Count: 3, DamageResistancePenetration: 50, MovementSpeed: 1, CastingSpeedIncrease: 150},
			{CastingSpeedIncrease: 250, DamageResistancePenetration: 80, MovementSpeed: 3, Count: 4},
			{CastingSpeedIncrease: 270, MovementSpeed: 3, Count: 5, DamageResistancePenetration: 90},
			{Count: 6, MovementSpeed: 4, CastingSpeedIncrease: 400, DamageResistancePenetration: 130},
		},
	},
	"수호": {
		"침착": {
			{DamageResistancePenetration: 30, ExperienceGainIncrease: 4, DamageAbsorption: 700, Count: 2},
			{DamageAbsorption: 1200, DamageResistancePenetration: 50, Count: 3, ExperienceGainIncrease: 6},
			{DamageResistancePenetration: 80, ExperienceGainIncrease: 10, Count: 4, DamageAbsorption: 2000},
			{ExperienceGainIncrease: 12, DamageAbsorption: 2200, DamageResistancePenetration: 90, Count: 5},
			{ExperienceGainIncrease: 15, DamageAbsorption: 3000, Count: 6, DamageResistancePenetration: 130},
		},
		"결의": {
			{DamageResistance: 50, NormalMonsterAdditionalDamage: 100, Count: 2, ExperienceGainIncrease: 4},
			{Count: 3, ExperienceGainIncrease: 6, DamageResistance: 80, NormalMonsterAdditionalDamage: 150},
			{NormalMonsterAdditionalDamage: 250, Count: 4, DamageResistance: 130, ExperienceGainIncrease: 10},
			{DamageResistance: 150, NormalMonsterAdditionalDamage: 270, ExperienceGainIncrease: 12, Count: 5},
			{ExperienceGainIncrease: 15, DamageResistance: 200, Count: 6, NormalMonsterAdditionalDamage: 400},
		},
		"냉정": {
			{Count: 2, DamageResistancePenetration: 30, PvpDefense: 1000, ExperienceGainIncrease: 4},
			{DamageResistancePenetration: 50, Count: 3, ExperienceGainIncrease: 6, PvpDefense: 1500},
			{DamageResistancePenetration: 80, PvpDefense: 2500, ExperienceGainIncrease: 10, Count: 4},
			{Count: 5, DamageResistancePenetration: 90, ExperienceGainIncrease: 12, PvpDefense: 2700},
			{ExperienceGainIncrease: 15, DamageResistancePenetration: 130, PvpDefense: 4000, Count: 6},
		},
		"고요": {
			{ExperienceGainIncrease: 4, Count: 2, BossMonsterAdditionalDamage: 100, DamageResistance: 50},
			{Count: 3, DamageResistance: 80, ExperienceGainIncrease: 6, BossMonsterAdditionalDamage: 150},
			{ExperienceGainIncrease: 10, Count: 4, DamageResistance: 130, BossMonsterAdditionalDamage: 250},
			{Count: 5, DamageResistance: 150, BossMonsterAdditionalDamage: 270, ExperienceGainIncrease: 12},
			{BossMonsterAdditionalDamage: 400, ExperienceGainIncrease: 15, Count: 6, DamageResistance: 200},
		},
		"의지": {
			{Count: 2, CriticalDamageResistance: 100, DamageResistance: 50, ExperienceGainIncrease: 4},
			{CriticalDamageResistance: 150, DamageResistance: 80, ExperienceGainIncrease: 6, Count: 3},
			{ExperienceGainIncrease: 10, DamageResistance: 130, Count: 4, CriticalDamageResistance: 250},
			{ExperienceGainIncrease: 12, DamageResistance: 150, Count: 5, CriticalDamageResistance: 270},
			{DamageResistance: 200, CriticalDamageResistance: 400, Count: 6, ExperienceGainIncrease: 15},
		},
		"활력": {
			{CastingSpeedIncrease: 100, Count: 2, ExperienceGainIncrease: 4, DamageResistancePenetration: 30},
			{ExperienceGainIncrease: 6, Count: 3, CastingSpeedIncrease: 150, DamageResistancePenetration: 50},
			{Count: 4, ExperienceGainIncrease: 10, CastingSpeedIncrease: 250, DamageResistancePenetration: 80},
			{CastingSpeedIncrease: 270, Count: 5, ExperienceGainIncrease: 12, DamageResistancePenetration: 90},
			{Count: 6, ExperienceGainIncrease: 15, CastingSpeedIncrease: 400, DamageResistancePenetration: 130},
		},
	},
}

func calculateCombinationStats(combination []CreatureInput, category string, allCreatureData []CreatureInfo) CalculationResult {
	
	totalBondStats := make(map[string]float64)

	totalDisplayStats := make(map[string]float64)


	gradeCounts := make(map[string]int)
	factionCounts := make(map[string]int)

	var combinationSpirits []CreatureInfo
	var combinationNames []string

	creatureMap := make(map[string]CreatureInfo)
	for i := range allCreatureData {
		creatureMap[allCreatureData[i].Name] = allCreatureData[i]
	}

	for _, selected := range combination {
		combinationNames = append(combinationNames, selected.Name)

		creatureData, ok := creatureMap[selected.Name]
		if !ok {
			// log.Printf("Warning: Creature data not found for %s during combination calculation. Skipping.", selected.Name)
			continue
		}

		var levelStat *StatValue
		// Find the StatValue for the selected.Level
		for i := range creatureData.Stats {
			if creatureData.Stats[i].Level == selected.Level {
				levelStat = &creatureData.Stats[i]
				break
			}
		}

		// Prepare creature info for the response, including selected level
		spiritForResponse := CreatureInfo{
			Grade:     creatureData.Grade,
			Type:      creatureData.Type,
			Influence: creatureData.Influence,
			Name:      creatureData.Name,
			Image:     creatureData.Image,
			// SelectedLevel: selected.Level,
			Stats: []StatValue{},
		}
		if levelStat != nil {
			spiritForResponse.Stats = append(spiritForResponse.Stats, *levelStat)
		}
		combinationSpirits = append(combinationSpirits, spiritForResponse)

		// Count grades and factions for set effects
		gradeCounts[creatureData.Grade]++
		factionCounts[creatureData.Influence]++

		if levelStat == nil {
			// log.Printf("Warning: Stats for %s at level %d not found. Using zero stats for calculation.", selected.Name, selected.Level)
			continue // Skip stat accumulation for this creature if its level stats are not found
		}


		if levelStat.BindStat != nil {
			for key, value := range levelStat.BindStat {
				parsedValue := ToFloat(value)
				totalBondStats[key] += parsedValue   
				totalDisplayStats[key] += parsedValue 

			}
		}
	}



	totalGradeEffects := calculateGradeEffects(gradeCounts, category)
	totalFactionEffects := calculateFactionEffects(factionCounts, category)

	// Assuming 'calculateScore' uses the specific stats as defined in problem (pvp, dmg resistance)
	gradeScore := calculateScore(totalGradeEffects)
	factionScore := calculateScore(totalFactionEffects)
	bindScore := calculateScore(totalBondStats)

	finalScore := gradeScore + factionScore + bindScore

	result := CalculationResult{
		Combination:    combinationNames,
		Spirits:        combinationSpirits,
		GradeEffects:   toStatDetailSlice(totalGradeEffects),
		FactionEffects: toStatDetailSlice(totalFactionEffects),
		BindStats:      toStatDetailSlice(totalDisplayStats), // Display all accumulated stats from bond + registration
		GradeScore:     gradeScore,
		FactionScore:   factionScore,
		BindScore:      bindScore, // Score is only from bindStat as per definition
		ScoreWithBind:  finalScore,
	}
	return result
}

func calculateGradeEffects(gradeCounts map[string]int, category string) map[string]float64 {
	effects := make(map[string]float64)
	categoryEffects, ok := gradeSetEffects[category]
	if !ok {
		return effects // No rules for this category
	}

	for grade, count := range gradeCounts {
		gradeRules, ok := categoryEffects[grade]
		if !ok {
			continue // No rules for this grade in this category
		}

		highestStep := 0
		// Find the highest set effect step achieved
		for step := 2; step <= count; step++ { // Set effects typically start from 2 items
			if _, exists := gradeRules[strconv.Itoa(step)]; exists {
				highestStep = step
			}
		}

		if highestStep > 0 {
			stepEffects := gradeRules[strconv.Itoa(highestStep)]
			for stat, value := range stepEffects {
				effects[stat] += value
			}
		}
	}
	return effects
}

func calculateFactionEffects(factionCounts map[string]int, category string) map[string]float64 {
	effects := make(map[string]float64)
	categoryRules, ok := factionSetEffects[category]
	if !ok {
		return effects // No rules for this category
	}

	for faction, count := range factionCounts {
		factionRules, ok := categoryRules[faction]
		if !ok {
			continue // No rules for this faction in this category
		}

		var bestStep FactionEffectStep
		// Find the best (highest count) faction effect step achieved
		for _, stepRule := range factionRules {
			if count >= stepRule.Count && stepRule.Count > bestStep.Count {
				bestStep = stepRule
			}
		}

		if bestStep.Count > 0 {
			val := reflect.ValueOf(bestStep)
			typ := reflect.TypeOf(bestStep)

			for i := 0; i < val.NumField(); i++ {
				field := typ.Field(i)
				fieldName := field.Name
				fieldValue := val.Field(i).Interface()

				if fieldName == "Count" {
					continue // 'Count' field is for rule matching, not a stat
				}

				// Convert struct field name to camelCase for map key (first letter lowercase)
				runes := []rune(fieldName)
				if len(runes) > 0 {
					runes[0] = unicode.ToLower(runes[0])
				}
				statName := string(runes)

				if intValue, ok := fieldValue.(int); ok && intValue != 0 {
					effects[statName] += float64(intValue)
				}
			}
		}
	}
	return effects
}

// calculateScore: 환수결속 점수 계산 공식
// 피해저항관통 + 피해저항 + (대인피해% × 10) + (대인방어% × 10)
// 이 공식을 등급 효과, 세력 효과, 결속 효과 각각에 적용하여 합산
func calculateScore(stats map[string]float64) float64 {
	return stats["damageResistancePenetration"] +
		stats["damageResistance"] +
		(stats["pvpDamagePercent"] * 10) +
		(stats["pvpDefensePercent"] * 10)
}

// toStatDetailSlice converts a map of stats to a slice of StatDetail for frontend display.
func toStatDetailSlice(m map[string]float64) []StatDetail {
	details := make([]StatDetail, 0, len(m))
	for key, value := range m {
		// Only include non-zero values
		if value == 0 {
			continue
		}

		koreanName, ok := statsMapping[key]
		if !ok {
			koreanName = key // Use English key if no Korean mapping found
		}

		details = append(details, StatDetail{
			Name:  koreanName,
			Key:   key,
			Value: value,
		})
	}
	// Sort details by Korean name for consistent order
	sort.Slice(details, func(i, j int) bool {
		return details[i].Name < details[j].Name
	})
	return details
}
