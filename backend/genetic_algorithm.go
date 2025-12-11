package main

import (
	"log"
	"math/rand"
	"sort"
	"sync"
)

// 유전 알고리즘 설정값
// Render.com 무료 플랜 타임아웃(약 2분)을 고려하여 최적화
const (
	populationSize  = 150 // 인구(조합)의 수 (200 → 150: 더 빠른 수렴)
	maxGenerations  = 80  // 최대 세대 수 (100 → 80: 타임아웃 내 완료 보장)
	eliteSize       = 20  // 다음 세대로 바로 전달될 상위 엘리트 조합의 수 (증가: 우수한 조합 보존)
	mutationRate    = 0.3 // 돌연변이 확률 (증가: 더 다양한 조합 탐색)
	combinationSize = 6   // 최종 조합의 크기 (선택할 환수의 수)
)

// Individual: 하나의 조합(개체)과 그 점수를 저장하는 구조체
type Individual struct {
	Combination []CreatureInput
	Result      CalculationResult
	Fitness     float64
}

// CreatureScore: 각 환수의 BindScore와 우선순위 정보를 저장하는 구조체
type CreatureScore struct {
	Creature    CreatureInput
	BindScore   float64
	HasImmortal bool
	HasPvpStats bool
	PvpStatsSum float64 // 대인피해% + 대인방어% 합계 (우선순위 1)
	Priority    int     // 우선순위 (더 이상 사용하지 않음, 호환성을 위해 유지)
}

// PrecomputedScores: 사전 계산된 점수 정보
type PrecomputedScores struct {
	CreatureScores      map[string]CreatureScore // 환수별 BindScore
	MaxGradeScore       float64                  // 등급효과 최대값
	MinGradeScore       float64                  // 등급효과 최소값
	MaxFactionScore     float64                  // 세력효과 최대값
	MinFactionScore     float64                  // 세력효과 최소값
	PrioritizedCreatures []CreatureInput         // 우선순위 정렬된 환수 목록
	ImmortalOnly        bool                     // 불멸환수만 사용해야 하는지 여부
	ImmortalCreatures   []CreatureInput          // 불멸환수 목록 (ImmortalOnly가 true일 때만 사용)
}

// findOptimalCombinationWithGA: 유전 알고리즘을 실행하여 최적 조합을 찾는 메인 함수
// allCreatureData를 인자로 받도록 수정
func findOptimalCombinationWithGA(selectedCreatures []CreatureInput, category string, allCreatureData []CreatureInfo) CalculationResult {
	// rand.Seed(time.Now().UnixNano()) // Moved to main.go to be initialized once at app start

	// 0. 사전 계산: 각 환수의 BindScore, 등급/세력효과 최대/최소값 계산
	precomputed := precomputeScores(selectedCreatures, category, allCreatureData)
	log.Printf("Precomputed scores: MaxGrade=%.2f, MinGrade=%.2f, MaxFaction=%.2f, MinFaction=%.2f, ImmortalOnly=%v",
		precomputed.MaxGradeScore, precomputed.MinGradeScore, precomputed.MaxFactionScore, precomputed.MinFactionScore, precomputed.ImmortalOnly)

	// 1. 우선순위 기반 초기 인구(Population) 생성
	if precomputed.ImmortalOnly {
		log.Printf("Using %d immortal creatures only for combination generation", len(precomputed.ImmortalCreatures))
	}
	population := generateInitialPopulationWithPriority(precomputed.PrioritizedCreatures)
	log.Printf("Initial population of %d generated from %d prioritized creatures.", len(population), len(precomputed.PrioritizedCreatures))

	var bestIndividual Individual
	// Initialize bestIndividual with a very low fitness to ensure it gets updated
	bestIndividual.Fitness = -1.0

	for gen := 0; gen < maxGenerations; gen++ {
		// 2. 각 개체(조합)의 적합도(Fitness) 평가 (필터링 포함)
		// allCreatureData와 precomputed를 evaluatePopulation에 전달
		evaluatedPopulation := evaluatePopulationWithFiltering(population, category, allCreatureData, precomputed, bestIndividual.Fitness)

		// 3. 점수(Fitness) 기준으로 정렬 (내림차순)
		sort.Slice(evaluatedPopulation, func(i, j int) bool {
			return evaluatedPopulation[i].Fitness > evaluatedPopulation[j].Fitness
		})

		// 현재 세대의 최고 점수 개체가 전체 최고보다 좋으면 업데이트
		if len(evaluatedPopulation) > 0 && evaluatedPopulation[0].Fitness > bestIndividual.Fitness {
			bestIndividual = evaluatedPopulation[0]
			log.Printf("Generation %d: New best fitness found: %.2f (Combination: %v)", gen, bestIndividual.Fitness, bestIndividual.Result.Combination)
		}

		// 4. 다음 세대 생성
		// 모든 조합(불멸+전설 혼합)을 탐색하도록 전체 환수 풀 사용
		nextPopulation := createNextGeneration(evaluatedPopulation, selectedCreatures, precomputed)
		population = nextPopulation
	}

	log.Printf("Finished GA. Best fitness: %.2f (Combination: %v)", bestIndividual.Fitness, bestIndividual.Result.Combination)
	return bestIndividual.Result
}

// precomputeScores: 사전 계산 - 각 환수의 BindScore, 등급/세력효과 최대/최소값 계산
func precomputeScores(selectedCreatures []CreatureInput, category string, allCreatureData []CreatureInfo) PrecomputedScores {
	precomputed := PrecomputedScores{
		CreatureScores: make(map[string]CreatureScore),
	}

	// CreatureInfo 맵 생성
	creatureMap := make(map[string]CreatureInfo)
	for i := range allCreatureData {
		creatureMap[allCreatureData[i].Name] = allCreatureData[i]
	}

	// 각 환수의 BindScore 계산 및 우선순위 정보 수집
	var creatureScoresList []CreatureScore
	for _, creatureInput := range selectedCreatures {
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
		bindScore := calculateScore(convertToFloatMap(levelStat.BindStat))

		// 우선순위 정보 확인
		hasImmortal := creatureInfo.Grade == "불멸"
		
		// 대인피해%와 대인방어% 값 계산 (우선순위 1: 이 값이 높은 환수 우선)
		pvpDamageValue := 0.0
		pvpDefenseValue := 0.0
		hasPvpStats := false
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
		// PvP 스탯 합계 (대인피해% + 대인방어%)
		pvpStatsSum := pvpDamageValue + pvpDefenseValue

		creatureScore := CreatureScore{
			Creature:    creatureInput,
			BindScore:   bindScore,
			HasImmortal: hasImmortal,
			HasPvpStats: hasPvpStats,
			PvpStatsSum: pvpStatsSum,
			Priority:    0, // Priority는 더 이상 사용하지 않음, 대신 PvP 스탯 값과 불멸 여부로 정렬
		}

		precomputed.CreatureScores[creatureInput.Name] = creatureScore
		creatureScoresList = append(creatureScoresList, creatureScore)
	}

	// 우선순위 정렬 (사용자 요청 방식):
	// 1단계: 대인피해%와 대인방어% 합계가 높은 순 (PvP 스탯 우선)
	// 2단계: 불멸환수 우선
	// 3단계: BindScore (전체 환산 합) 높은 순
	sort.Slice(creatureScoresList, func(i, j int) bool {
		csI := creatureScoresList[i]
		csJ := creatureScoresList[j]
		
		// 1단계: PvP 스탯 합계가 높은 순
		if csI.PvpStatsSum != csJ.PvpStatsSum {
			return csI.PvpStatsSum > csJ.PvpStatsSum
		}
		
		// 2단계: 불멸환수 우선
		if csI.HasImmortal != csJ.HasImmortal {
			return csI.HasImmortal // true가 false보다 앞에 옴
		}
		
		// 3단계: BindScore 높은 순
		return csI.BindScore > csJ.BindScore
	})
	
	// 정렬 결과 로그 출력 (상위 10개만)
	if len(creatureScoresList) > 0 {
		log.Printf("Top 10 prioritized creatures (PvP Stats Sum → Immortal → BindScore):")
		for i := 0; i < 10 && i < len(creatureScoresList); i++ {
			cs := creatureScoresList[i]
			log.Printf("  %d. %s (PvP: %.2f, Immortal: %v, BindScore: %.2f)", 
				i+1, cs.Creature.Name, cs.PvpStatsSum, cs.HasImmortal, cs.BindScore)
		}
	}

	// 불멸환수 개수 확인 (로깅용)
	immortalCount := 0
	var immortalCreatures []CreatureInput
	for _, cs := range creatureScoresList {
		if cs.HasImmortal {
			immortalCount++
			immortalCreatures = append(immortalCreatures, cs.Creature)
		}
	}

	// ImmortalOnly 제한 제거: 모든 조합(불멸+전설 혼합)을 탐색하도록 함
	// 불멸환수가 6개 이상이어도 불멸 4개+전설 2개 같은 조합이 더 높은 점수를 낼 수 있음
	precomputed.ImmortalOnly = false
	precomputed.ImmortalCreatures = immortalCreatures // 참고용으로만 저장
	
	// 우선순위 정렬된 환수 목록 생성 (불멸+전설 모두 포함)
	precomputed.PrioritizedCreatures = make([]CreatureInput, len(creatureScoresList))
	for i, cs := range creatureScoresList {
		precomputed.PrioritizedCreatures[i] = cs.Creature
	}
	
	log.Printf("Found %d immortal creatures, %d legendary creatures. Exploring all combinations (immortal+legendary mix allowed)", 
		immortalCount, len(creatureScoresList)-immortalCount)

	// 등급효과 최대/최소값 계산
	precomputed.MaxGradeScore, precomputed.MinGradeScore = calculateMaxMinGradeScores(selectedCreatures, category, allCreatureData)

	// 세력효과 최대/최소값 계산
	precomputed.MaxFactionScore, precomputed.MinFactionScore = calculateMaxMinFactionScores(selectedCreatures, category, allCreatureData)

	return precomputed
}

// convertToFloatMap: map[string]interface{}를 map[string]float64로 변환
func convertToFloatMap(m map[string]interface{}) map[string]float64 {
	result := make(map[string]float64)
	for k, v := range m {
		result[k] = ToFloat(v)
	}
	return result
}

// calculateMaxMinGradeScores: 등급효과의 최대/최소값 계산
func calculateMaxMinGradeScores(selectedCreatures []CreatureInput, category string, allCreatureData []CreatureInfo) (float64, float64) {
	creatureMap := make(map[string]CreatureInfo)
	for i := range allCreatureData {
		creatureMap[allCreatureData[i].Name] = allCreatureData[i]
	}

	// 등급별 개수 집계
	gradeCounts := make(map[string]int)
	for _, creatureInput := range selectedCreatures {
		if creatureInfo, ok := creatureMap[creatureInput.Name]; ok {
			gradeCounts[creatureInfo.Grade]++
		}
	}

	// 최대값: 가능한 가장 높은 등급효과 (불멸 6개)
	maxGradeCounts := make(map[string]int)
	if gradeCounts["불멸"] >= 6 {
		maxGradeCounts["불멸"] = 6
	} else if gradeCounts["불멸"] > 0 {
		maxGradeCounts["불멸"] = gradeCounts["불멸"]
		if gradeCounts["전설"] > 0 {
			remaining := 6 - gradeCounts["불멸"]
			if remaining > gradeCounts["전설"] {
				maxGradeCounts["전설"] = gradeCounts["전설"]
			} else {
				maxGradeCounts["전설"] = remaining
			}
		}
	} else if gradeCounts["전설"] >= 6 {
		maxGradeCounts["전설"] = 6
	}

	// 최소값: 가능한 가장 낮은 등급효과 (전설만 사용)
	minGradeCounts := make(map[string]int)
	if gradeCounts["전설"] >= 6 {
		minGradeCounts["전설"] = 6
	} else {
		minGradeCounts["전설"] = gradeCounts["전설"]
		if gradeCounts["불멸"] > 0 {
			remaining := 6 - gradeCounts["전설"]
			if remaining > gradeCounts["불멸"] {
				minGradeCounts["불멸"] = gradeCounts["불멸"]
			} else {
				minGradeCounts["불멸"] = remaining
			}
		}
	}

	maxGradeEffects := calculateGradeEffects(maxGradeCounts, category)
	minGradeEffects := calculateGradeEffects(minGradeCounts, category)

	return calculateScore(maxGradeEffects), calculateScore(minGradeEffects)
}

// calculateMaxMinFactionScores: 세력효과의 최대/최소값 계산
func calculateMaxMinFactionScores(selectedCreatures []CreatureInput, category string, allCreatureData []CreatureInfo) (float64, float64) {
	creatureMap := make(map[string]CreatureInfo)
	for i := range allCreatureData {
		creatureMap[allCreatureData[i].Name] = allCreatureData[i]
	}

	// 세력별 개수 집계
	factionCounts := make(map[string]int)
	for _, creatureInput := range selectedCreatures {
		if creatureInfo, ok := creatureMap[creatureInput.Name]; ok {
			factionCounts[creatureInfo.Influence]++
		}
	}

	// 최대값: 가장 많은 세력의 6개 조합
	// 최소값: 가장 적은 세력의 6개 조합
	// 실제로는 모든 가능한 세력 조합을 고려해야 하지만, 간단하게 구현
	maxFactionCounts := make(map[string]int)
	minFactionCounts := make(map[string]int)

	// 세력을 개수 순으로 정렬
	type FactionCount struct {
		Faction string
		Count   int
	}
	var factions []FactionCount
	for faction, count := range factionCounts {
		factions = append(factions, FactionCount{Faction: faction, Count: count})
	}
	sort.Slice(factions, func(i, j int) bool {
		return factions[i].Count > factions[j].Count
	})

	// 최대값: 가장 많은 세력부터 6개 채우기
	remaining := 6
	for _, fc := range factions {
		if remaining <= 0 {
			break
		}
		if fc.Count >= remaining {
			maxFactionCounts[fc.Faction] = remaining
			remaining = 0
		} else {
			maxFactionCounts[fc.Faction] = fc.Count
			remaining -= fc.Count
		}
	}

	// 최소값: 가장 적은 세력부터 6개 채우기 (뒤에서부터)
	remaining = 6
	for i := len(factions) - 1; i >= 0; i-- {
		if remaining <= 0 {
			break
		}
		fc := factions[i]
		if fc.Count >= remaining {
			minFactionCounts[fc.Faction] = remaining
			remaining = 0
		} else {
			minFactionCounts[fc.Faction] = fc.Count
			remaining -= fc.Count
		}
	}

	maxFactionEffects := calculateFactionEffects(maxFactionCounts, category)
	minFactionEffects := calculateFactionEffects(minFactionCounts, category)

	return calculateScore(maxFactionEffects), calculateScore(minFactionEffects)
}

// generateInitialPopulation: 무작위로 초기 조합들을 생성
func generateInitialPopulation(creatures []CreatureInput) [][]CreatureInput {
	population := make([][]CreatureInput, populationSize)
	// Ensure there are enough creatures to form combinations
	if len(creatures) < combinationSize {
		// If not enough unique creatures to pick 6, just return combinations of what's available
		// This edge case should ideally be handled by the caller (frontend) to prevent GA if < 6
		log.Printf("Warning: Not enough creatures (%d) to form a %d-size combination. Adjusting initial population generation.", len(creatures), combinationSize)
		// Fallback: Just return one or few combinations of what's available
		if len(creatures) == 0 {
			return [][]CreatureInput{}
		}
		for i := 0; i < populationSize; i++ {
			combo := make([]CreatureInput, 0, combinationSize)
			shuffledCreatures := make([]CreatureInput, len(creatures))
			copy(shuffledCreatures, creatures)
			rand.Shuffle(len(shuffledCreatures), func(j, k int) {
				shuffledCreatures[j], shuffledCreatures[k] = shuffledCreatures[k], shuffledCreatures[j]
			})
			for k := 0; k < combinationSize && k < len(shuffledCreatures); k++ {
				combo = append(combo, shuffledCreatures[k])
			}
			population[i] = combo
		}
		return population
	}

	for i := 0; i < populationSize; i++ {
		// Create a mutable copy to shuffle
		shuffledCreatures := make([]CreatureInput, len(creatures))
		copy(shuffledCreatures, creatures)

		// 무작위로 6개의 생물을 선택하여 조합을 만듦
		rand.Shuffle(len(shuffledCreatures), func(j, k int) {
			shuffledCreatures[j], shuffledCreatures[k] = shuffledCreatures[k], shuffledCreatures[j]
		})
		combination := make([]CreatureInput, combinationSize)
		copy(combination, shuffledCreatures[:combinationSize])
		population[i] = combination
	}
	return population
}

// generateInitialPopulationWithPriority: 우선순위 기반으로 초기 조합들을 생성
// 사용자 요청 방식: 대인피해%/대인방어% 높은 환수 → 불멸환수 → BindScore 높은 순으로 우선 선택
func generateInitialPopulationWithPriority(prioritizedCreatures []CreatureInput) [][]CreatureInput {
	population := make([][]CreatureInput, populationSize)
	
	if len(prioritizedCreatures) < combinationSize {
		// 환수가 부족한 경우 기존 로직 사용
		return generateInitialPopulation(prioritizedCreatures)
	}

	// 상위 우선순위 환수들을 더 많이 포함하도록 조합 생성
	// 불멸환수와 전설환수를 모두 고려하되, 우선순위 높은 환수에 가중치 부여
	topN := 30 // 상위 30개 환수에 가중치 부여 (불멸+전설 혼합)
	if topN > len(prioritizedCreatures) {
		topN = len(prioritizedCreatures)
	}
	topCreatures := prioritizedCreatures[:topN]
	remainingCreatures := prioritizedCreatures[topN:]

	for i := 0; i < populationSize; i++ {
		combination := make([]CreatureInput, 0, combinationSize)
		used := make(map[string]bool)

		// 상위 환수들을 더 많이 포함하도록 가중치 부여
		selectionPool := make([]CreatureInput, 0)
		
		// 상위 환수들을 4배 더 많이 풀에 추가 (가중치 증가)
		for j := 0; j < 4; j++ {
			selectionPool = append(selectionPool, topCreatures...)
		}
		// 나머지 환수도 풀에 추가 (불멸+전설 모두 포함)
		selectionPool = append(selectionPool, remainingCreatures...)

		// 풀을 섞어서 무작위 선택
		rand.Shuffle(len(selectionPool), func(j, k int) {
			selectionPool[j], selectionPool[k] = selectionPool[k], selectionPool[j]
		})

		// 조합 생성 (중복 제외)
		for _, creature := range selectionPool {
			if len(combination) >= combinationSize {
				break
			}
			if !used[creature.Name] {
				combination = append(combination, creature)
				used[creature.Name] = true
			}
		}

		// 부족하면 전체 목록에서 채우기
		if len(combination) < combinationSize {
			for _, creature := range prioritizedCreatures {
				if len(combination) >= combinationSize {
					break
				}
				if !used[creature.Name] {
					combination = append(combination, creature)
					used[creature.Name] = true
				}
			}
		}

		population[i] = combination
	}

	return population
}

// evaluatePopulation: 고루틴을 사용해 인구 전체를 병렬로 평가
// allCreatureData를 인자로 받도록 수정
func evaluatePopulation(population [][]CreatureInput, category string, allCreatureData []CreatureInfo) []Individual {
	var wg sync.WaitGroup
	// 채널을 버퍼링하여 고루틴이 블로킹 없이 결과를 보낼 수 있도록 함
	evaluatedChan := make(chan Individual, len(population))

	for _, combination := range population {
		wg.Add(1)
		go func(combo []CreatureInput) {
			defer wg.Done()
			// calculateCombinationStats 호출 시 allCreatureData 전달
			result := calculateCombinationStats(combo, category, allCreatureData)
			evaluatedChan <- Individual{
				Combination: combo,
				Result:      result,
				Fitness:     result.ScoreWithBind,
			}
		}(combination)
	}

	// 모든 고루틴이 끝날 때까지 기다림
	wg.Wait()
	close(evaluatedChan)

	// 채널에서 모든 결과를 수집
	evaluatedPopulation := make([]Individual, 0, len(population))
	for ind := range evaluatedChan {
		evaluatedPopulation = append(evaluatedPopulation, ind)
	}
	return evaluatedPopulation
}

// evaluatePopulationWithFiltering: 필터링을 포함한 인구 평가
func evaluatePopulationWithFiltering(population [][]CreatureInput, category string, allCreatureData []CreatureInfo, precomputed PrecomputedScores, currentBestFitness float64) []Individual {
	var wg sync.WaitGroup
	evaluatedChan := make(chan Individual, len(population))

	// CreatureInfo 맵 생성 (등급 확인용)
	creatureMap := make(map[string]CreatureInfo)
	for i := range allCreatureData {
		creatureMap[allCreatureData[i].Name] = allCreatureData[i]
	}

	for _, combination := range population {
		wg.Add(1)
		go func(combo []CreatureInput) {
			defer wg.Done()

			// ImmortalOnly 제한 제거: 모든 조합(불멸+전설 혼합)을 평가

			// 필터링: 이론적 최대값 계산
			var totalBindScore float64
			for _, creature := range combo {
				if cs, ok := precomputed.CreatureScores[creature.Name]; ok {
					totalBindScore += cs.BindScore
				}
			}

			// 이론적 최대값 = BindScore 합 + 등급효과 최대값 + 세력효과 최대값
			theoreticalMax := totalBindScore + precomputed.MaxGradeScore + precomputed.MaxFactionScore

			// 현재 최고 점수보다 낮으면 계산하지 않고 제외
			if theoreticalMax < currentBestFitness && currentBestFitness > 0 {
				return // 필터링: 계산하지 않음
			}

			// 실제 계산
			result := calculateCombinationStats(combo, category, allCreatureData)
			evaluatedChan <- Individual{
				Combination: combo,
				Result:      result,
				Fitness:     result.ScoreWithBind,
			}
		}(combination)
	}

	wg.Wait()
	close(evaluatedChan)

	evaluatedPopulation := make([]Individual, 0, len(population))
	for ind := range evaluatedChan {
		evaluatedPopulation = append(evaluatedPopulation, ind)
	}
	return evaluatedPopulation
}

// createNextGeneration: 현재 세대를 기반으로 다음 세대를 생성
// allCreatures (selectedCreatures 전체 풀)를 인자로 받도록 수정
func createNextGeneration(evaluatedPopulation []Individual, allCreatures []CreatureInput, precomputed PrecomputedScores) [][]CreatureInput {
	nextPopulation := make([][]CreatureInput, 0, populationSize)

	// Elitism: 상위 N개의 엘리트는 그대로 다음 세대로 전달
	for i := 0; i < eliteSize && i < len(evaluatedPopulation); i++ {
		nextPopulation = append(nextPopulation, evaluatedPopulation[i].Combination)
	}

	// 나머지 인구는 선택, 교차, 변이를 통해 생성
	for len(nextPopulation) < populationSize {
		// 5. 선택 (Tournament Selection)
		parent1 := tournamentSelection(evaluatedPopulation, 5)
		parent2 := tournamentSelection(evaluatedPopulation, 5)

		// 6. 교차 (Crossover)
		child := crossover(parent1, parent2)

		// 7. 변이 (Mutation)
		// mutate 함수 호출 시 allCreatures 전달
		if rand.Float64() < mutationRate {
			mutate(child, allCreatures)
		}

		// ImmortalOnly 제한 제거: 모든 조합(불멸+전설 혼합)을 허용

		nextPopulation = append(nextPopulation, child)
	}
	return nextPopulation
}

// tournamentSelection: 토너먼트 방식으로 우수한 부모를 선택
func tournamentSelection(population []Individual, tournamentSize int) []CreatureInput {
	// 토너먼트에 참여할 개체를 무작위로 선택
	best := population[rand.Intn(len(population))]
	for i := 1; i < tournamentSize; i++ {
		next := population[rand.Intn(len(population))]
		if next.Fitness > best.Fitness {
			best = next
		}
	}
	return best.Combination
}

// crossover: 두 부모의 유전자를 섞어 자식을 생성 (One-point crossover)
func crossover(parent1, parent2 []CreatureInput) []CreatureInput {
	child := make([]CreatureInput, combinationSize)
	used := make(map[string]bool)

	// 부모1로부터 절반의 유전자를 가져옴
	crossoverPoint := combinationSize / 2
	for i := 0; i < crossoverPoint; i++ {
		child[i] = parent1[i]
		used[parent1[i].Name] = true
	}

	// 부모2로부터 나머지 유전자를 가져옴 (중복 제외)
	childIndex := crossoverPoint
	for _, creature := range parent2 {
		if childIndex >= combinationSize {
			break
		}
		if !used[creature.Name] { // Only add if not already in child
			child[childIndex] = creature
			used[creature.Name] = true
			childIndex++
		}
	}

	// 만약 자식의 유전자가 부족하면, 부모1의 나머지 유전자로 채움 (could be redundant if parent1 also has duplicates)
	// A more robust way to fill remaining if not enough unique from parent2:
	// Iterate through allCreatures (the full pool of selectable creatures)
	// to find unused ones if childIndex < combinationSize
	// For simplicity and assuming parents are derived from a common pool, this fallback to parent1 is okay.
	for _, creature := range parent1 {
		if childIndex >= combinationSize {
			break
		}
		if !used[creature.Name] {
			child[childIndex] = creature
			used[creature.Name] = true
			childIndex++
		}
	}

	return child
}

// mutate: 조합의 일부를 무작위로 변경
// allCreatures (selectedCreatures 전체 풀)를 인자로 받도록 수정
func mutate(combination []CreatureInput, allCreatures []CreatureInput) {
	if len(allCreatures) <= combinationSize {
		// Not enough creatures to perform a meaningful mutation by swapping with an external one
		return
	}

	// 조합에 포함되지 않은 생물 목록 생성
	usedNames := make(map[string]bool)
	for _, c := range combination {
		usedNames[c.Name] = true
	}
	unusedCreatures := make([]CreatureInput, 0)
	for _, c := range allCreatures {
		if !usedNames[c.Name] {
			unusedCreatures = append(unusedCreatures, c)
		}
	}

	if len(unusedCreatures) == 0 {
		// All available creatures are already in the combination, no mutation possible
		return
	}

	// 무작위로 하나의 유전자를 교체
	mutationIndex := rand.Intn(combinationSize)
	newCreatureIndex := rand.Intn(len(unusedCreatures))
	combination[mutationIndex] = unusedCreatures[newCreatureIndex]
}
