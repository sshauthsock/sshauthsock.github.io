package main

import (
	"log"
	"strconv"
	"strings"
)

// ToFloat safely converts an interface{} value to float64.
// This is used for values read from Firestore which could be int64, float64, string etc.
func ToFloat(v interface{}) float64 {
	if v == nil {
		return 0.0
	}
	switch val := v.(type) {
	case float64:
		return val
	case float32:
		return float64(val)
	case int:
		return float64(val)
	case int32:
		return float64(val)
	case int64:
		return float64(val)
	case string:
		// 문자열인 경우 콤마 제거 후 파싱 시도
		cleanString := strings.ReplaceAll(val, ",", "")
		parsedFloat, err := strconv.ParseFloat(cleanString, 64)
		if err != nil {
			log.Printf("Warning: ToFloat: Could not parse string value '%s' to float. Error: %v", val, err)
			return 0.0
		}
		return parsedFloat
	case bool: // Firestore에서 bool도 올 수 있으므로 처리 (예: "is_active": true)
		if val {
			return 1.0
		}
		return 0.0
	case map[string]interface{}: // JSON 객체로 넘어오는 경우 (오류 가능성)
		log.Printf("Warning: ToFloat: Received map[string]interface{} type, which cannot be converted to float: %v", val)
		return 0.0
	case []interface{}: // JSON 배열로 넘어오는 경우 (오류 가능성)
		log.Printf("Warning: ToFloat: Received []interface{} type, which cannot be converted to float: %v", val)
		return 0.0
	default:
		// 예상치 못한 다른 타입이 들어온 경우 경고 로깅
		log.Printf("Warning: ToFloat: Unsupported type for conversion: %T. Value: %v", v, v)
		return 0.0
	}
}
