package main

import (
	"log"
	"math/rand"
	"sort"
	"sync"
)

// 유전 알고리즘 설정값
const (
	populationSize  = 100 // 인구(조합)의 수
	maxGenerations  = 30  // 최대 세대 수
	eliteSize       = 10  // 다음 세대로 바로 전달될 상위 엘리트 조합의 수
	mutationRate    = 0.2 // 돌연변이 확률
	combinationSize = 6   // 최종 조합의 크기 (선택할 환수의 수)
)

// Individual: 하나의 조합(개체)과 그 점수를 저장하는 구조체
type Individual struct {
	Combination []CreatureInput
	Result      CalculationResult
	Fitness     float64
}

// findOptimalCombinationWithGA: 유전 알고리즘을 실행하여 최적 조합을 찾는 메인 함수
// allCreatureData를 인자로 받도록 수정
func findOptimalCombinationWithGA(selectedCreatures []CreatureInput, category string, allCreatureData []CreatureInfo) CalculationResult {
	// rand.Seed(time.Now().UnixNano()) // Moved to main.go to be initialized once at app start

	// 1. 초기 인구(Population) 생성
	// selectedCreatures는 사용자가 선택한 전체 환수 목록이며, 이 중에서 6개를 조합해야 합니다.
	// 초기 인구는 이 selectedCreatures 풀에서 무작위로 생성됩니다.
	population := generateInitialPopulation(selectedCreatures)
	log.Printf("Initial population of %d generated from %d selected creatures.", len(population), len(selectedCreatures))

	var bestIndividual Individual
	// Initialize bestIndividual with a very low fitness to ensure it gets updated
	bestIndividual.Fitness = -1.0

	for gen := 0; gen < maxGenerations; gen++ {
		// 2. 각 개체(조합)의 적합도(Fitness) 평가
		// allCreatureData를 evaluatePopulation에 전달
		evaluatedPopulation := evaluatePopulation(population, category, allCreatureData)

		// 3. 점수(Fitness) 기준으로 정렬 (내림차순)
		sort.Slice(evaluatedPopulation, func(i, j int) bool {
			return evaluatedPopulation[i].Fitness > evaluatedPopulation[j].Fitness
		})

		// 현재 세대의 최고 점수 개체가 전체 최고보다 좋으면 업데이트
		if evaluatedPopulation[0].Fitness > bestIndividual.Fitness {
			bestIndividual = evaluatedPopulation[0]
			log.Printf("Generation %d: New best fitness found: %.2f (Combination: %v)", gen, bestIndividual.Fitness, bestIndividual.Result.Combination)
		}

		// 4. 다음 세대 생성
		// allCreatures (즉, selectedCreatures)를 createNextGeneration에 전달
		nextPopulation := createNextGeneration(evaluatedPopulation, selectedCreatures)
		population = nextPopulation
	}

	log.Printf("Finished GA. Best fitness: %.2f (Combination: %v)", bestIndividual.Fitness, bestIndividual.Result.Combination)
	return bestIndividual.Result
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

// createNextGeneration: 현재 세대를 기반으로 다음 세대를 생성
// allCreatures (selectedCreatures 전체 풀)를 인자로 받도록 수정
func createNextGeneration(evaluatedPopulation []Individual, allCreatures []CreatureInput) [][]CreatureInput {
	nextPopulation := make([][]CreatureInput, 0, populationSize)

	// Elitism: 상위 N개의 엘리트는 그대로 다음 세대로 전달
	for i := 0; i < eliteSize; i++ {
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
