package main

import (
	"log"
	"sync"
)

// findOptimalCombinationExhaustive: 모든 조합을 탐색하여 최적 조합을 찾는 함수
// 결정적이고 정확한 결과를 보장 (시간이 더 걸릴 수 있음)
func findOptimalCombinationExhaustive(selectedCreatures []CreatureInput, category string, allCreatureData []CreatureInfo) CalculationResult {
	log.Printf("Using exhaustive search to find optimal combination from %d selected creatures of type '%s'", len(selectedCreatures), category)

	// 모든 6개 조합 생성
	combinations := generateCreatureCombinations(selectedCreatures, 6)
	log.Printf("Generated %d combinations to evaluate (each combination has exactly 6 creatures)", len(combinations))
	
	// 검증: 첫 번째 조합이 정확히 6개인지 확인
	if len(combinations) > 0 {
		if len(combinations[0]) != 6 {
			log.Printf("ERROR: First combination has %d creatures, expected 6!", len(combinations[0]))
		} else {
			log.Printf("Verified: Each combination contains exactly 6 creatures")
		}
	}

	// 병렬로 모든 조합 평가
	var wg sync.WaitGroup
	resultsChan := make(chan CalculationResult, len(combinations))

	// 동시에 실행할 고루틴 수 제한 (너무 많으면 메모리 부족)
	maxWorkers := 100
	semaphore := make(chan struct{}, maxWorkers)

	for _, combo := range combinations {
		wg.Add(1)
		semaphore <- struct{}{} // 세마포어 획득
		go func(combination []CreatureInput) {
			defer wg.Done()
			defer func() { <-semaphore }() // 세마포어 해제

			result := calculateCombinationStats(combination, category, allCreatureData)
			resultsChan <- result
		}(combo)
	}

	// 모든 고루틴 완료 대기
	go func() {
		wg.Wait()
		close(resultsChan)
	}()

	// 최고 점수 조합 찾기 및 상위 조합들 수집
	var bestResult CalculationResult
	bestScore := -1.0
	count := 0
	
	// 상위 5개 조합 수집 (디버깅용)
	type ScoredResult struct {
		Result CalculationResult
		Score  float64
	}
	topResults := make([]ScoredResult, 0, 5)

	for result := range resultsChan {
		count++
		score := result.ScoreWithBind
		
		if score > bestScore {
			bestScore = score
			bestResult = result
		}
		
		// 상위 5개 유지
		if len(topResults) < 5 {
			topResults = append(topResults, ScoredResult{Result: result, Score: score})
			// 정렬
			for i := len(topResults) - 1; i > 0 && topResults[i].Score > topResults[i-1].Score; i-- {
				topResults[i], topResults[i-1] = topResults[i-1], topResults[i]
			}
		} else if score > topResults[4].Score {
			topResults[4] = ScoredResult{Result: result, Score: score}
			// 정렬
			for i := 4; i > 0 && topResults[i].Score > topResults[i-1].Score; i-- {
				topResults[i], topResults[i-1] = topResults[i-1], topResults[i]
			}
		}
	}

	log.Printf("Evaluated %d combinations. Best score: %.2f (Combination: %v)", count, bestScore, bestResult.Combination)
	log.Printf("Best result details - GradeScore: %.2f, FactionScore: %.2f, BindScore: %.2f", 
		bestResult.GradeScore, bestResult.FactionScore, bestResult.BindScore)
	
	// 상위 5개 조합 로그 출력
	log.Printf("Top 5 combinations:")
	for i, tr := range topResults {
		log.Printf("  %d. Score: %.2f (Grade: %.2f, Faction: %.2f, Bind: %.2f) - %v", 
			i+1, tr.Score, tr.Result.GradeScore, tr.Result.FactionScore, tr.Result.BindScore, tr.Result.Combination)
	}
	
	return bestResult
}

// generateCreatureCombinations: CreatureInput 리스트에서 k개를 선택하는 모든 조합 생성
func generateCreatureCombinations(items []CreatureInput, k int) [][]CreatureInput {
	if k > len(items) {
		return [][]CreatureInput{}
	}
	if k == 0 {
		return [][]CreatureInput{{}}
	}
	if k == len(items) {
		result := make([]CreatureInput, len(items))
		copy(result, items)
		return [][]CreatureInput{result}
	}

	var combinations [][]CreatureInput
	generateCreatureCombinationsRecursive(items, k, 0, []CreatureInput{}, &combinations)
	return combinations
}

// generateCreatureCombinationsRecursive: 재귀적으로 조합 생성
// 정확히 k개의 환수를 선택하는 모든 조합 생성
func generateCreatureCombinationsRecursive(items []CreatureInput, k, start int, current []CreatureInput, result *[][]CreatureInput) {
	if len(current) == k {
		// 정확히 k개가 되면 조합 완성
		combo := make([]CreatureInput, k)
		copy(combo, current)
		*result = append(*result, combo)
		return
	}

	// 남은 항목 수가 부족하면 중단
	remaining := k - len(current)
	if remaining > len(items)-start {
		return
	}

	// 현재 위치부터 남은 항목들을 선택
	for i := start; i <= len(items)-remaining; i++ {
		generateCreatureCombinationsRecursive(items, k, i+1, append(current, items[i]), result)
	}
}

