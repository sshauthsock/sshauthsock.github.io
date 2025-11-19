package main

import (
	"fmt"
	"strings"
	"unicode"
)

// 입력 검증 상수
const (
	MaxCreaturesPerRequest = 100  // 최대 환수 개수
	MaxCreatureNameLength  = 50   // 최대 환수 이름 길이
	MinLevel               = 0    // 최소 레벨
	MaxLevel               = 25   // 최대 레벨
	MaxSoulCount           = 10000 // 최대 환수혼 개수
	MaxChakStatStateSize   = 100   // 최대 착 스탯 상태 개수
)

// validateBondRequest: 결속 계산 요청 검증
func validateBondRequest(req *BondCalculationRequest) error {
	// Creatures 배열 검증
	if len(req.Creatures) == 0 {
		return fmt.Errorf("creatures array cannot be empty")
	}

	if len(req.Creatures) > MaxCreaturesPerRequest {
		return fmt.Errorf("too many creatures: maximum %d allowed, got %d", MaxCreaturesPerRequest, len(req.Creatures))
	}

	// 각 환수 검증
	creatureNames := make(map[string]bool)
	for i, creature := range req.Creatures {
		// 이름 검증
		if strings.TrimSpace(creature.Name) == "" {
			return fmt.Errorf("creature name at index %d cannot be empty", i)
		}

		if len(creature.Name) > MaxCreatureNameLength {
			return fmt.Errorf("creature name at index %d is too long: maximum %d characters, got %d", i, MaxCreatureNameLength, len(creature.Name))
		}

		// 이름에 유효하지 않은 문자 검증 (XSS 방지)
		if !isValidCreatureName(creature.Name) {
			return fmt.Errorf("creature name at index %d contains invalid characters", i)
		}

		// 레벨 검증
		if creature.Level < MinLevel || creature.Level > MaxLevel {
			return fmt.Errorf("creature level at index %d is out of range: must be between %d and %d, got %d", i, MinLevel, MaxLevel, creature.Level)
		}

		// 중복 환수 검증 (같은 이름과 레벨 조합)
		key := fmt.Sprintf("%s:%d", creature.Name, creature.Level)
		if creatureNames[key] {
			return fmt.Errorf("duplicate creature at index %d: %s (level %d)", i, creature.Name, creature.Level)
		}
		creatureNames[key] = true
	}

	return nil
}

// validateSoulRequest: 환수혼 계산 요청 검증
func validateSoulRequest(req *SoulCalculationRequest) error {
	// Type 검증
	if strings.TrimSpace(req.Type) == "" {
		return fmt.Errorf("type cannot be empty")
	}

	// 환수혼 타입: legend(전설) 또는 immortal(불멸)
	validTypes := map[string]bool{
		"legend":   true, // 전설
		"immortal": true, // 불멸
	}
	if !validTypes[req.Type] {
		return fmt.Errorf("invalid type: must be one of [legend, immortal], got %s", req.Type)
	}

	// CurrentLevel 검증
	if req.CurrentLevel < MinLevel || req.CurrentLevel > MaxLevel {
		return fmt.Errorf("currentLevel is out of range: must be between %d and %d, got %d", MinLevel, MaxLevel, req.CurrentLevel)
	}

	// TargetLevel 검증
	if req.TargetLevel < MinLevel || req.TargetLevel > MaxLevel {
		return fmt.Errorf("targetLevel is out of range: must be between %d and %d, got %d", MinLevel, MaxLevel, req.TargetLevel)
	}

	// TargetLevel이 CurrentLevel보다 작거나 같으면 안 됨
	if req.TargetLevel <= req.CurrentLevel {
		return fmt.Errorf("targetLevel must be greater than currentLevel: currentLevel=%d, targetLevel=%d", req.CurrentLevel, req.TargetLevel)
	}

	// OwnedSouls 검증
	if req.OwnedSouls.High < 0 || req.OwnedSouls.High > MaxSoulCount {
		return fmt.Errorf("ownedSouls.high is out of range: must be between 0 and %d, got %d", MaxSoulCount, req.OwnedSouls.High)
	}
	if req.OwnedSouls.Mid < 0 || req.OwnedSouls.Mid > MaxSoulCount {
		return fmt.Errorf("ownedSouls.mid is out of range: must be between 0 and %d, got %d", MaxSoulCount, req.OwnedSouls.Mid)
	}
	if req.OwnedSouls.Low < 0 || req.OwnedSouls.Low > MaxSoulCount {
		return fmt.Errorf("ownedSouls.low is out of range: must be between 0 and %d, got %d", MaxSoulCount, req.OwnedSouls.Low)
	}

	return nil
}

// validateChakRequest: 착 계산 요청 검증
func validateChakRequest(req *ChakCalculationRequest) error {
	// StatState 검증: 빈 상태는 허용 (초기 로드 시 빈 상태로 요청 가능)
	// 하지만 값이 있을 때는 검증 수행
	if len(req.StatState) > MaxChakStatStateSize {
		return fmt.Errorf("statState is too large: maximum %d entries allowed, got %d", MaxChakStatStateSize, len(req.StatState))
	}

	// 각 StatState 항목 검증
	for key, stat := range req.StatState {
		// Key 검증
		if strings.TrimSpace(key) == "" {
			return fmt.Errorf("statState key cannot be empty")
		}

		// Level 검증
		if stat.Level < 0 || stat.Level > MaxLevel {
			return fmt.Errorf("statState[%s].level is out of range: must be between 0 and %d, got %d", key, MaxLevel, stat.Level)
		}

		// Value 검증 (음수 허용 가능하지만 너무 큰 값은 제한)
		if stat.Value < -1000000 || stat.Value > 1000000 {
			return fmt.Errorf("statState[%s].value is out of range: must be between -1000000 and 1000000, got %d", key, stat.Value)
		}

		// Part 검증 (비어있으면 안 됨)
		if strings.TrimSpace(stat.Part) == "" {
			return fmt.Errorf("statState[%s].part cannot be empty", key)
		}

		// PartLevel 검증 (비어있으면 안 됨)
		if strings.TrimSpace(stat.PartLevel) == "" {
			return fmt.Errorf("statState[%s].partLevel cannot be empty", key)
		}

		// StatName 검증 (비어있으면 안 됨)
		if strings.TrimSpace(stat.StatName) == "" {
			return fmt.Errorf("statState[%s].statName cannot be empty", key)
		}

		// MaxValue 검증
		if stat.MaxValue < 0 || stat.MaxValue > 1000000 {
			return fmt.Errorf("statState[%s].maxValue is out of range: must be between 0 and 1000000, got %d", key, stat.MaxValue)
		}
	}

	// UserResources 검증
	if req.UserResources.GoldButton < 0 || req.UserResources.GoldButton > 100000000 {
		return fmt.Errorf("userResources.goldButton is out of range: must be between 0 and 100000000, got %d", req.UserResources.GoldButton)
	}
	if req.UserResources.ColorBall < 0 || req.UserResources.ColorBall > 100000000 {
		return fmt.Errorf("userResources.colorBall is out of range: must be between 0 and 100000000, got %d", req.UserResources.ColorBall)
	}

	return nil
}

// isValidCreatureName: 환수 이름 유효성 검증 (XSS 방지)
func isValidCreatureName(name string) bool {
	// 빈 문자열 체크
	if len(name) == 0 {
		return false
	}

	// 위험한 문자 체크 (XSS 방지)
	// ":"는 환수 이름에 사용될 수 있으므로 제외
	dangerousChars := []string{"<", ">", "&", "\"", "'", "/", "\\", "{", "}", "[", "]", "(", ")", "`", "$", "%"}
	for _, char := range dangerousChars {
		if strings.Contains(name, char) {
			return false
		}
	}

	// 한글, 영문, 숫자, 공백, 하이픈, 언더스코어, 콜론, 점만 허용
	for _, r := range name {
		// 한글 범위 (가-힣, ㄱ-ㅎ, ㅏ-ㅣ)
		isHangul := (r >= 0xAC00 && r <= 0xD7A3) || // 완성형 한글 (가-힣)
			(r >= 0x3131 && r <= 0x318E) || // 자모 (ㄱ-ㅎ, ㅏ-ㅣ)
			(r >= 0x1100 && r <= 0x11FF)    // 초성/중성/종성
		// 영문자 (A-Z, a-z)
		isLetter := (r >= 'A' && r <= 'Z') || (r >= 'a' && r <= 'z')
		// 숫자 (0-9)
		isNumber := r >= '0' && r <= '9'
		// 공백
		isSpace := unicode.IsSpace(r)
		// 허용된 특수문자 (하이픈, 언더스코어, 점, 콜론)
		isAllowedSpecial := r == '-' || r == '_' || r == '.' || r == ':'

		// 허용된 문자가 아니면 false
		if !isHangul && !isLetter && !isNumber && !isSpace && !isAllowedSpecial {
			return false
		}
	}

	return true
}

