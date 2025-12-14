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
// 보장 사항:
// 1. 불멸환수가 6개 이상이면 불멸환수를 우선적으로 포함
// 2. 대인피해%/대인방어%가 있는 환수를 우선적으로 포함
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
		HasPvpStats bool
		BindScore   float64
	}

	var creaturesWithPriority []CreatureWithPriority
	var immortalCreatures []CreatureWithPriority
	var pvpCreatures []CreatureWithPriority
	var otherCreatures []CreatureWithPriority

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

		// 대인피해%와 대인방어% 값 계산 (BindStat 및 RegistrationStat 모두 확인)
		pvpDamageValue := 0.0
		pvpDefenseValue := 0.0
		hasPvpStats := false
		
		// BindStat 확인
		if levelStat.BindStat != nil {
			if pvpDamage, ok := levelStat.BindStat["pvpDamagePercent"]; ok {
				pvpDamageValue = ToFloat(pvpDamage)
				if pvpDamageValue > 0 {
					hasPvpStats = true
				}
			}
			if pvpDefense, ok := levelStat.BindStat["pvpDefensePercent"]; ok {
				pvpDefenseValue = ToFloat(pvpDefense)
				if pvpDefenseValue > 0 {
					hasPvpStats = true
				}
			}
		}
		
		// RegistrationStat 확인 (BindStat에 없으면 RegistrationStat에서 확인)
		if levelStat.RegistrationStat != nil {
			if pvpDamage, ok := levelStat.RegistrationStat["pvpDamagePercent"]; ok {
				damageVal := ToFloat(pvpDamage)
				if damageVal > 0 {
					pvpDamageValue = damageVal
					hasPvpStats = true
				}
			}
			if pvpDefense, ok := levelStat.RegistrationStat["pvpDefensePercent"]; ok {
				defenseVal := ToFloat(pvpDefense)
				if defenseVal > 0 {
					pvpDefenseValue = defenseVal
					hasPvpStats = true
				}
			}
		}
		
		pvpStatsSum := pvpDamageValue + pvpDefenseValue

		hasImmortal := creatureInfo.Grade == "불멸"

		creatureWithPriority := CreatureWithPriority{
			Creature:    creatureInput,
			PvpStatsSum: pvpStatsSum,
			HasImmortal: hasImmortal,
			HasPvpStats: hasPvpStats,
			BindScore:   bindScore,
		}

		creaturesWithPriority = append(creaturesWithPriority, creatureWithPriority)

		// 카테고리별 분류
		if hasImmortal {
			immortalCreatures = append(immortalCreatures, creatureWithPriority)
		}
		if hasPvpStats {
			pvpCreatures = append(pvpCreatures, creatureWithPriority)
		}
		if !hasImmortal && !hasPvpStats {
			otherCreatures = append(otherCreatures, creatureWithPriority)
		}
	}

	// 우선순위 정렬 함수
	sortPriority := func(cpI, cpJ CreatureWithPriority) bool {
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
	}

	// 각 카테고리별 정렬
	sort.Slice(immortalCreatures, func(i, j int) bool {
		return sortPriority(immortalCreatures[i], immortalCreatures[j])
	})
	sort.Slice(pvpCreatures, func(i, j int) bool {
		return sortPriority(pvpCreatures[i], pvpCreatures[j])
	})
	sort.Slice(otherCreatures, func(i, j int) bool {
		return sortPriority(otherCreatures[i], otherCreatures[j])
	})

	// 결과 구성: 우선순위 보장
	result := make([]CreatureInput, 0, topN)
	used := make(map[string]bool)

	// 1. 불멸환수가 6개 이상이면 불멸환수를 우선적으로 포함
	// 대인피해%/대인방어%가 있는 불멸환수를 우선적으로 선택
	if len(immortalCreatures) >= 6 {
		// 불멸환수 중 대인피해%/대인방어%가 있는 것과 없는 것 분리
		var immortalWithPvp []CreatureWithPriority
		var immortalWithoutPvp []CreatureWithPriority
		for _, immortal := range immortalCreatures {
			if immortal.HasPvpStats {
				immortalWithPvp = append(immortalWithPvp, immortal)
			} else {
				immortalWithoutPvp = append(immortalWithoutPvp, immortal)
			}
		}
		
		// 대인피해%/대인방어%가 있는 불멸환수 우선 포함
		for i := 0; i < len(immortalWithPvp) && len(result) < 6 && len(result) < topN; i++ {
			if !used[immortalWithPvp[i].Creature.Name] {
				result = append(result, immortalWithPvp[i].Creature)
				used[immortalWithPvp[i].Creature.Name] = true
			}
		}
		
		// 나머지는 대인피해%/대인방어%가 없는 불멸환수로 채움
		for i := 0; i < len(immortalWithoutPvp) && len(result) < 6 && len(result) < topN; i++ {
			if !used[immortalWithoutPvp[i].Creature.Name] {
				result = append(result, immortalWithoutPvp[i].Creature)
				used[immortalWithoutPvp[i].Creature.Name] = true
			}
		}
		
		log.Printf("Guaranteed %d immortal creatures in selection (%d with PvP stats, %d without)", 
			len(result), len(immortalWithPvp), len(immortalWithoutPvp))
	}

	// 2. 대인피해%/대인방어%가 있는 환수를 우선적으로 포함
	for _, pvpCreature := range pvpCreatures {
		if len(result) >= topN {
			break
		}
		if !used[pvpCreature.Creature.Name] {
			result = append(result, pvpCreature.Creature)
			used[pvpCreature.Creature.Name] = true
		}
	}

	// 3. 나머지는 전체 우선순위 정렬 후 선택
	sort.Slice(creaturesWithPriority, func(i, j int) bool {
		return sortPriority(creaturesWithPriority[i], creaturesWithPriority[j])
	})

	for _, creature := range creaturesWithPriority {
		if len(result) >= topN {
			break
		}
		if !used[creature.Creature.Name] {
			result = append(result, creature.Creature)
			used[creature.Creature.Name] = true
		}
	}

	log.Printf("Selected %d priority creatures from %d candidates (Immortal: %d, PvP: %d, Other: %d)", 
		len(result), len(creatures), len(immortalCreatures), len(pvpCreatures), len(otherCreatures))
	return result
}

