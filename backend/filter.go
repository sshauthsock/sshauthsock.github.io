package main

import (
	"log"
	"sort"
)

// filterCreaturesWithPvpStats: 대인방어%나 대인피해%가 있는 환수만 필터링
// BindStat 또는 RegistrationStat 중 하나라도 pvpDamagePercent 또는 pvpDefensePercent가 있으면 포함
func filterCreaturesWithPvpStats(selectedCreatures []CreatureInput, allCreatureData []CreatureInfo) []CreatureInput {
	// CreatureInfo 맵 생성
	creatureMap := make(map[string]CreatureInfo)
	for i := range allCreatureData {
		creatureMap[allCreatureData[i].Name] = allCreatureData[i]
	}

	var filteredCreatures []CreatureInput
	var removedCount int

	for _, creatureInput := range selectedCreatures {
		creatureInfo, ok := creatureMap[creatureInput.Name]
		if !ok {
			// CreatureInfo를 찾을 수 없으면 제외
			removedCount++
			continue
		}

		// 해당 레벨의 StatValue 찾기
		var levelStat *StatValue
		for i := range creatureInfo.Stats {
			if creatureInfo.Stats[i].Level == creatureInput.Level {
				levelStat = &creatureInfo.Stats[i]
				break
			}
		}

		if levelStat == nil {
			removedCount++
			continue
		}

		// BindStat 또는 RegistrationStat에 대인방어%나 대인피해%가 있는지 확인
		hasPvpStats := false

		// BindStat 확인
		if levelStat.BindStat != nil {
			if pvpDamage, ok := levelStat.BindStat["pvpDamagePercent"]; ok && ToFloat(pvpDamage) > 0 {
				hasPvpStats = true
			}
			if pvpDefense, ok := levelStat.BindStat["pvpDefensePercent"]; ok && ToFloat(pvpDefense) > 0 {
				hasPvpStats = true
			}
		}

		// RegistrationStat 확인
		if !hasPvpStats && levelStat.RegistrationStat != nil {
			if pvpDamage, ok := levelStat.RegistrationStat["pvpDamagePercent"]; ok && ToFloat(pvpDamage) > 0 {
				hasPvpStats = true
			}
			if pvpDefense, ok := levelStat.RegistrationStat["pvpDefensePercent"]; ok && ToFloat(pvpDefense) > 0 {
				hasPvpStats = true
			}
		}

		if hasPvpStats {
			filteredCreatures = append(filteredCreatures, creatureInput)
		} else {
			removedCount++
		}
	}

	if removedCount > 0 {
		log.Printf("Filtered out %d creatures without PvP stats (pvpDamagePercent or pvpDefensePercent). Remaining: %d creatures", 
			removedCount, len(filteredCreatures))
	}

	return filteredCreatures
}

// selectTopPriorityCreatures: 우선순위가 높은 상위 N개 환수만 선택
// 우선순위: 대인피해%+대인방어% 합계 → 불멸 등급 → BindScore
func selectTopPriorityCreatures(creatures []CreatureInput, allCreatureData []CreatureInfo, topN int) []CreatureInput {
	if len(creatures) <= topN {
		return creatures
	}

	// CreatureInfo 맵 생성
	creatureMap := make(map[string]CreatureInfo)
	for i := range allCreatureData {
		creatureMap[allCreatureData[i].Name] = allCreatureData[i]
	}

	type CreatureWithPriority struct {
		Creature    CreatureInput
		PvpStatsSum float64
		HasImmortal bool
		BindScore   float64
	}

	var creaturesWithPriority []CreatureWithPriority

	for _, creatureInput := range creatures {
		creatureInfo, ok := creatureMap[creatureInput.Name]
		if !ok {
			continue
		}

		// 해당 레벨의 StatValue 찾기
		var levelStat *StatValue
		for i := range creatureInfo.Stats {
			if creatureInfo.Stats[i].Level == creatureInput.Level {
				levelStat = &creatureInfo.Stats[i]
				break
			}
		}

		if levelStat == nil || levelStat.BindStat == nil {
			continue
		}

		// BindScore 계산
		bindScoreMap := make(map[string]float64)
		for k, v := range levelStat.BindStat {
			bindScoreMap[k] = ToFloat(v)
		}
		bindScore := calculateScore(bindScoreMap)

		// 대인피해%와 대인방어% 값 계산
		pvpDamageValue := 0.0
		pvpDefenseValue := 0.0
		if levelStat.BindStat != nil {
			if pvpDamage, ok := levelStat.BindStat["pvpDamagePercent"]; ok {
				pvpDamageValue = ToFloat(pvpDamage)
			}
			if pvpDefense, ok := levelStat.BindStat["pvpDefensePercent"]; ok {
				pvpDefenseValue = ToFloat(pvpDefense)
			}
		}
		pvpStatsSum := pvpDamageValue + pvpDefenseValue

		hasImmortal := creatureInfo.Grade == "불멸"

		creaturesWithPriority = append(creaturesWithPriority, CreatureWithPriority{
			Creature:    creatureInput,
			PvpStatsSum: pvpStatsSum,
			HasImmortal: hasImmortal,
			BindScore:   bindScore,
		})
	}

	// 우선순위 정렬: PvP 스탯 합계 → 불멸 등급 → BindScore
	sort.Slice(creaturesWithPriority, func(i, j int) bool {
		cpI := creaturesWithPriority[i]
		cpJ := creaturesWithPriority[j]

		// 1단계: PvP 스탯 합계가 높은 순
		if cpI.PvpStatsSum != cpJ.PvpStatsSum {
			return cpI.PvpStatsSum > cpJ.PvpStatsSum
		}

		// 2단계: 불멸환수 우선
		if cpI.HasImmortal != cpJ.HasImmortal {
			return cpI.HasImmortal
		}

		// 3단계: BindScore 높은 순
		return cpI.BindScore > cpJ.BindScore
	})

	// 상위 N개만 선택
	result := make([]CreatureInput, 0, topN)
	for i := 0; i < topN && i < len(creaturesWithPriority); i++ {
		result = append(result, creaturesWithPriority[i].Creature)
	}

	log.Printf("Selected top %d priority creatures from %d candidates", len(result), len(creatures))
	return result
}

