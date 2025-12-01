/**
 * Export/Import 데이터 검증 유틸리티
 * 보안 및 데이터 무결성 검증
 */

import Logger from "../../utils/logger.js";

// 제한 상수
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_SPIRITS_PER_CATEGORY = 6;
export const MAX_SPIRIT_NAME_LENGTH = 100;
export const MIN_LEVEL = 0;
export const MAX_LEVEL = 25;
export const MAX_STAT_VALUE = 1000000000; // 10억
export const MIN_STAT_VALUE = -1000000000; // -10억
export const MAX_ENGRAVING_STATS = 4;
export const MAX_CSV_LINES = 10000;
export const MAX_JSON_DEPTH = 10;

/**
 * 환수명 검증 (XSS 방지)
 * @param {string} name - 환수명
 * @returns {boolean} 유효 여부
 */
export function isValidSpiritName(name) {
  if (!name || typeof name !== "string") {
    return false;
  }

  if (name.length === 0 || name.length > MAX_SPIRIT_NAME_LENGTH) {
    return false;
  }

  // 위험한 문자 체크 (XSS 방지)
  const dangerousChars = ["<", ">", "&", '"', "'", "/", "\\", "{", "}", "[", "]", "(", ")", "`", "$", "%"];
  for (const char of dangerousChars) {
    if (name.includes(char)) {
      return false;
    }
  }

  // 한글, 영문, 숫자, 공백, 하이픈, 언더스코어, 점, 콜론만 허용
  for (const char of name) {
    const code = char.charCodeAt(0);
    const isHangul =
      (code >= 0xac00 && code <= 0xd7a3) || // 완성형 한글
      (code >= 0x3131 && code <= 0x318e) || // 자모
      (code >= 0x1100 && code <= 0x11ff); // 초성/중성/종성
    const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
    const isNumber = code >= 48 && code <= 57;
    const isSpace = /\s/.test(char);
    const isAllowedSpecial = ["-", "_", ".", ":"].includes(char);

    if (!isHangul && !isLetter && !isNumber && !isSpace && !isAllowedSpecial) {
      return false;
    }
  }

  return true;
}

/**
 * 레벨 검증
 * @param {number} level - 레벨
 * @returns {boolean} 유효 여부
 */
export function isValidLevel(level) {
  const numLevel = Number(level);
  return (
    !isNaN(numLevel) &&
    Number.isInteger(numLevel) &&
    numLevel >= MIN_LEVEL &&
    numLevel <= MAX_LEVEL
  );
}

/**
 * 스탯 값 검증
 * @param {number} value - 스탯 값
 * @returns {boolean} 유효 여부
 */
export function isValidStatValue(value) {
  const numValue = Number(value);
  return (
    !isNaN(numValue) &&
    numValue >= MIN_STAT_VALUE &&
    numValue <= MAX_STAT_VALUE &&
    isFinite(numValue)
  );
}

/**
 * 각인 데이터 검증 (boolean 반환)
 * @param {Object} engraving - 각인 데이터
 * @returns {boolean} 유효 여부
 */
export function isValidEngraving(engraving) {
  if (!engraving || typeof engraving !== "object") {
    return false;
  }

  // registration 검증 (배열 또는 객체 형태 모두 지원)
  if (engraving.registration !== undefined && engraving.registration !== null) {
    if (Array.isArray(engraving.registration)) {
      // 배열 형태: [{ statKey: "체력증가", value: 100 }, ...]
      if (engraving.registration.length > MAX_ENGRAVING_STATS) {
        return false;
      }
      for (const item of engraving.registration) {
        if (!item || typeof item !== "object") {
          return false;
        }
        const statKey = item.statKey || item.key;
        const value = item.value;
        if (!statKey || !isValidSpiritName(statKey) || !isValidStatValue(value)) {
          return false;
        }
      }
    } else if (typeof engraving.registration === "object") {
      // 객체 형태: { "체력증가": 100, ... }
      const regKeys = Object.keys(engraving.registration);
      if (regKeys.length > MAX_ENGRAVING_STATS) {
        return false;
      }
      for (const [key, value] of Object.entries(engraving.registration)) {
        if (!isValidSpiritName(key) || !isValidStatValue(value)) {
          return false;
        }
      }
    } else {
      return false;
    }
  }

  // bind 검증 (항상 객체 형태)
  if (engraving.bind !== undefined && engraving.bind !== null) {
    if (typeof engraving.bind !== "object" || Array.isArray(engraving.bind)) {
      return false;
    }
    for (const [key, value] of Object.entries(engraving.bind)) {
      if (!isValidSpiritName(key) || !isValidStatValue(value)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * 각인 데이터 검증 (에러 메시지 포함)
 * @param {Object} engraving - 각인 데이터
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateEngraving(engraving) {
  // 각인 데이터가 없거나 null이면 유효한 것으로 간주 (빈 각인 허용)
  if (!engraving || engraving === null) {
    return { valid: true };
  }
  
  if (typeof engraving !== "object") {
    return { valid: false, error: "각인 데이터가 올바르지 않습니다." };
  }
  
  // 빈 객체도 유효한 것으로 간주
  if (Object.keys(engraving).length === 0) {
    return { valid: true };
  }

  // registration 검증 (배열 또는 객체 형태 모두 지원)
  if (engraving.registration !== undefined && engraving.registration !== null) {
    if (Array.isArray(engraving.registration)) {
      // 배열 형태: [{ statKey: "체력증가", value: 100 }, ...]
      if (engraving.registration.length > MAX_ENGRAVING_STATS) {
        return { valid: false, error: `등록효과가 ${MAX_ENGRAVING_STATS}개를 초과합니다.` };
      }
      for (const item of engraving.registration) {
        if (!item || typeof item !== "object") {
          return { valid: false, error: "등록효과 항목이 올바르지 않습니다." };
        }
        const statKey = item.statKey || item.key;
        const value = item.value;
        if (!statKey) {
          return { valid: false, error: "등록효과 스탯명이 없습니다." };
        }
        if (!isValidSpiritName(statKey)) {
          return { valid: false, error: `등록효과 스탯명이 유효하지 않습니다: ${statKey}` };
        }
        if (!isValidStatValue(value)) {
          return { valid: false, error: `등록효과 값이 유효하지 않습니다: ${value}` };
        }
      }
    } else if (typeof engraving.registration === "object") {
      // 객체 형태: { "체력증가": 100, ... }
      const regKeys = Object.keys(engraving.registration);
      if (regKeys.length > MAX_ENGRAVING_STATS) {
        return { valid: false, error: `등록효과가 ${MAX_ENGRAVING_STATS}개를 초과합니다.` };
      }
      for (const [key, value] of Object.entries(engraving.registration)) {
        if (!isValidSpiritName(key)) {
          return { valid: false, error: `등록효과 스탯명이 유효하지 않습니다: ${key}` };
        }
        if (!isValidStatValue(value)) {
          return { valid: false, error: `등록효과 값이 유효하지 않습니다: ${value}` };
        }
      }
    } else {
      return { valid: false, error: "등록효과 형식이 올바르지 않습니다." };
    }
  }

  // bind 검증 (항상 객체 형태)
  if (engraving.bind !== undefined && engraving.bind !== null) {
    if (typeof engraving.bind !== "object" || Array.isArray(engraving.bind)) {
      return { valid: false, error: "장착효과 형식이 올바르지 않습니다." };
    }
    for (const [key, value] of Object.entries(engraving.bind)) {
      if (!isValidSpiritName(key)) {
        return { valid: false, error: `장착효과 스탯명이 유효하지 않습니다: ${key}` };
      }
      if (!isValidStatValue(value)) {
        return { valid: false, error: `장착효과 값이 유효하지 않습니다: ${value}` };
      }
    }
  }

  return { valid: true };
}

/**
 * 환수 데이터 검증
 * @param {Object} spirit - 환수 데이터
 * @param {string} category - 카테고리
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateSpirit(spirit, category) {
  if (!spirit || typeof spirit !== "object") {
    return { valid: false, error: "환수 데이터가 올바르지 않습니다." };
  }

  if (!spirit.name || typeof spirit.name !== "string") {
    return { valid: false, error: "환수명이 올바르지 않습니다." };
  }

  if (!isValidSpiritName(spirit.name)) {
    return { valid: false, error: `환수명에 허용되지 않은 문자가 포함되어 있습니다: ${spirit.name}` };
  }

  if (!isValidLevel(spirit.level)) {
    return { valid: false, error: `레벨이 올바르지 않습니다: ${spirit.level}` };
  }

  if (spirit.engraving && !isValidEngraving(spirit.engraving)) {
    return { valid: false, error: "각인 데이터가 올바르지 않습니다." };
  }

  if (!["수호", "탑승", "변신"].includes(category)) {
    return { valid: false, error: `올바르지 않은 카테고리입니다: ${category}` };
  }

  return { valid: true };
}

/**
 * 사용자 스탯 검증
 * @param {Object} userStats - 사용자 스탯
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateUserStats(userStats) {
  if (!userStats || typeof userStats !== "object") {
    return { valid: false, error: "스탯 데이터가 올바르지 않습니다." };
  }

  // 스탯 키 개수 제한
  const statKeys = Object.keys(userStats);
  if (statKeys.length > 100) {
    return { valid: false, error: "스탯 개수가 너무 많습니다." };
  }

  for (const [key, value] of Object.entries(userStats)) {
    if (!isValidSpiritName(key)) {
      return { valid: false, error: `스탯 키에 허용되지 않은 문자가 포함되어 있습니다: ${key}` };
    }

    if (!isValidStatValue(value)) {
      return { valid: false, error: `스탯 값이 올바르지 않습니다: ${key}=${value}` };
    }
  }

  return { valid: true };
}

/**
 * JSON 데이터 구조 검증
 * @param {Object} data - Import할 데이터
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateImportData(data) {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "데이터 형식이 올바르지 않습니다." };
  }

  const categories = ["수호", "탑승", "변신"];

  // spirits 검증
  if (data.spirits) {
    if (typeof data.spirits !== "object") {
      return { valid: false, error: "환수 데이터 형식이 올바르지 않습니다." };
    }

    for (const category of categories) {
      const spirits = data.spirits[category];
      if (spirits) {
        if (!Array.isArray(spirits)) {
          return { valid: false, error: `${category} 환수 데이터가 배열이 아닙니다.` };
        }

        if (spirits.length > MAX_SPIRITS_PER_CATEGORY) {
          return { valid: false, error: `${category} 환수가 너무 많습니다. (최대 ${MAX_SPIRITS_PER_CATEGORY}개)` };
        }

        for (let i = 0; i < spirits.length; i++) {
          const validation = validateSpirit(spirits[i], category);
          if (!validation.valid) {
            return { valid: false, error: `${category} 환수 ${i + 1}: ${validation.error}` };
          }
        }
      }
    }
  }

  // activeSpirits 검증
  if (data.activeSpirits) {
    if (typeof data.activeSpirits !== "object") {
      return { valid: false, error: "사용중 환수 데이터 형식이 올바르지 않습니다." };
    }

    for (const category of categories) {
      const activeSpirit = data.activeSpirits[category];
      if (activeSpirit !== null && activeSpirit !== undefined) {
        if (typeof activeSpirit !== "object") {
          return { valid: false, error: `${category} 사용중 환수 데이터 형식이 올바르지 않습니다.` };
        }

        if (activeSpirit.name) {
          const validation = validateSpirit(activeSpirit, category);
          if (!validation.valid) {
            return { valid: false, error: `${category} 사용중 환수: ${validation.error}` };
          }
        }
      }
    }
  }

  // userStats 검증
  if (data.userStats) {
    const validation = validateUserStats(data.userStats);
    if (!validation.valid) {
      return validation;
    }
  }

  return { valid: true };
}

/**
 * 파일 크기 검증
 * @param {File} file - 파일
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateFileSize(file) {
  if (!file) {
    return { valid: false, error: "파일이 선택되지 않았습니다." };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. (최대 ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "파일이 비어있습니다." };
  }

  return { valid: true };
}

/**
 * 파일 형식 검증
 * @param {File} file - 파일
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateFileType(file) {
  if (!file) {
    return { valid: false, error: "파일이 선택되지 않았습니다." };
  }

  const fileName = file.name.toLowerCase();
  const isValidJSON = fileName.endsWith(".json");
  const isValidCSV = fileName.endsWith(".csv");

  if (!isValidJSON && !isValidCSV) {
    return { valid: false, error: "JSON 또는 CSV 파일만 가져올 수 있습니다." };
  }

  // MIME 타입 검증 (추가 보안)
  const validMimeTypes = [
    "application/json",
    "text/json",
    "text/csv",
    "text/plain",
  ];
  if (file.type && !validMimeTypes.includes(file.type)) {
    Logger.warn(`의심스러운 MIME 타입: ${file.type}`);
    // MIME 타입이 없거나 다른 경우에도 파일 확장자로 판단하므로 경고만
  }

  return { valid: true };
}

/**
 * JSON 깊이 검증 (순환 참조 및 깊은 중첩 방지)
 * @param {any} obj - 검증할 객체
 * @param {number} depth - 현재 깊이
 * @param {Set} visited - 방문한 객체 (순환 참조 방지)
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateJSONDepth(obj, depth = 0, visited = new WeakSet()) {
  if (depth > MAX_JSON_DEPTH) {
    return { valid: false, error: `JSON 깊이가 너무 깊습니다. (최대 ${MAX_JSON_DEPTH}단계)` };
  }

  if (obj === null || typeof obj !== "object") {
    return { valid: true };
  }

  // 순환 참조 방지
  if (visited.has(obj)) {
    return { valid: false, error: "순환 참조가 감지되었습니다." };
  }

  visited.add(obj);

  try {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const validation = validateJSONDepth(item, depth + 1, visited);
        if (!validation.valid) {
          return validation;
        }
      }
    } else {
      for (const value of Object.values(obj)) {
        const validation = validateJSONDepth(value, depth + 1, visited);
        if (!validation.valid) {
          return validation;
        }
      }
    }
  } finally {
    visited.delete(obj);
  }

  return { valid: true };
}

/**
 * 파일명 안전화 (경로 탐색 공격 방지)
 * @param {string} fileName - 원본 파일명
 * @returns {string} 안전한 파일명
 */
export function sanitizeFileName(fileName) {
  if (!fileName || typeof fileName !== "string") {
    return "myInfo_export";
  }

  // 경로 탐색 문자 제거
  let sanitized = fileName
    .replace(/[\/\\\?\*\|"<>:]/g, "_")
    .replace(/\.\./g, "_")
    .trim();

  // 파일명 길이 제한
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200);
  }

  // 빈 문자열 처리
  if (sanitized.length === 0) {
    sanitized = "myInfo_export";
  }

  return sanitized;
}

/**
 * CSV 라인 수 검증
 * @param {number} lineCount - 라인 수
 * @returns {Object} { valid: boolean, error?: string }
 */
export function validateCSVLineCount(lineCount) {
  if (lineCount > MAX_CSV_LINES) {
    return {
      valid: false,
      error: `CSV 파일이 너무 큽니다. (최대 ${MAX_CSV_LINES}줄)`,
    };
  }

  return { valid: true };
}

