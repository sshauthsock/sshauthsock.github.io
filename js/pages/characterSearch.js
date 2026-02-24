// 수행자 검색 (넥슨 오픈 API - 바람의나라:연 캐릭터 기본 정보)
import * as api from "../api.js";
import Logger from "../utils/logger.js";
import ErrorHandler from "../utils/errorHandler.js";

const elements = {};

/** API 필드명 → 한글 라벨 (바람의나라:연 기본정보 API 기준) */
const FIELD_LABELS = {
  server: "서버",
  server_name: "서버",
  character_name: "캐릭터명",
  character_date_create: "캐릭터 생성일",
  character_class_group_name: "직업 계열",
  character_class_name: "직업",
  character_nation: "국가",
  character_gender: "성별",
  character_exp: "경험치",
  character_level: "레벨",
  ocid: "캐릭터 식별자",
  level: "레벨",
  job_name: "직업",
  guild_name: "길드명",
  date: "날짜",
  world_name: "월드",
  exp: "경험치",
  popularity: "인기도",
  nickname: "닉네임",
  name: "이름",
};

/** 키(경로)를 사용자용 한글 라벨로 변환 */
function toFriendlyLabel(keyStr) {
  if (typeof keyStr !== "string" || !keyStr) return keyStr;
  const lastKey = keyStr.includes(".") ? keyStr.split(".").pop() : keyStr;
  return FIELD_LABELS[lastKey] ?? keyStr;
}

/** ISO 날짜 문자열을 읽기 쉬운 한글 형식으로 (예: 2020년 7월 26일) */
function formatDateValue(val) {
  if (val == null || val === "") return "-";
  const s = String(val).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    const y = m[1];
    const month = parseInt(m[2], 10);
    const day = parseInt(m[3], 10);
    return `${y}년 ${month}월 ${day}일`;
  }
  return s;
}

/** 숫자에 천 단위 구분 (예: 864663352413 → 864,663,352,413) */
function formatNumberValue(val) {
  if (val == null || val === "") return "-";
  const n = Number(val);
  if (Number.isNaN(n)) return String(val);
  return n.toLocaleString("ko-KR");
}

/** 필드 키에 따라 값 표시 포맷 적용 */
function toFriendlyValue(keyStr, valStr) {
  if (valStr == null || valStr === "-") return valStr;
  const lastKey = keyStr.includes(".") ? keyStr.split(".").pop() : keyStr;
  const isDate = /date|create|_at$/i.test(lastKey);
  const isExp = /exp|character_exp/i.test(lastKey);
  const isLevel = /level|character_level/i.test(lastKey);
  if (isDate) return formatDateValue(valStr);
  if (isExp || isLevel) return formatNumberValue(valStr);
  return valStr;
}

/** API 응답을 항상 직렬화 가능한 형태로 정규화 ( [object Object] 방지 ) */
function normalizePayload(data) {
  if (data === null || data === undefined) return data;
  if (typeof data === "string") return data;
  if (typeof data !== "object") return data;
  try {
    return JSON.parse(JSON.stringify(data));
  } catch (_) {
    return data;
  }
}

/** DOM/표시용으로만 사용. 반환값은 항상 문자열 ( [object Object] 완전 방지 ) */
function ensureString(val) {
  if (val === null || val === undefined) return "-";
  if (typeof val === "string") return val;
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

/** 객체를 [키문자열, 값문자열] 행 배열로 변환. 둘 다 항상 문자열만 반환 */
function flattenForDisplay(obj, prefix = "") {
  if (obj === null || obj === undefined) return [];
  if (typeof obj !== "object") return [[ensureString(prefix), ensureString(obj)]];
  const rows = [];
  const keys = Object.keys(obj);
  keys.forEach((key) => {
    const label = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      rows.push(...flattenForDisplay(val, label));
    } else if (Array.isArray(val)) {
      rows.push([ensureString(label), JSON.stringify(val)]);
    } else {
      rows.push([ensureString(label), ensureString(val)]);
    }
  });
  return rows;
}

function getHTML() {
  return `
    <div class="character-search-page">
      <section class="char-search-section card char-search-card">
        <h2 class="char-search-title">수행자 검색</h2>
        <p class="char-search-desc">캐릭터명을 입력하면 모든 서버를 조회한 뒤, 레벨·경험치가 가장 높은 서버의 정보만 표시합니다.</p>
        <div class="char-search-form">
          <input type="text" id="characterNameInput" class="char-search-input" placeholder="캐릭터 이름 입력" maxlength="12" autocomplete="off" />
          <button type="button" id="characterSearchBtn" class="btn btn-primary char-search-btn">검색</button>
        </div>
        <div id="characterSearchMessage" class="char-search-message" aria-live="polite"></div>
      </section>
      <section id="characterResultSection" class="char-result-section card">
        <div class="char-result-header">
          <h2 class="char-result-title">검색 결과</h2>
        </div>
        <div id="characterResultBody" class="char-result-body">
          <p class="char-result-empty">캐릭터명을 입력한 뒤 검색하면 결과가 여기에 표시됩니다.</p>
        </div>
        <details class="char-result-raw-wrap">
          <summary class="char-result-raw-summary">원본 JSON 보기</summary>
          <pre id="characterResultRaw" class="char-result-raw"></pre>
        </details>
      </section>
    </div>
  `;
}

function showMessage(msg, isError = false) {
  const el = elements.message;
  if (!el) return;
  el.textContent = msg == null ? "" : ensureString(msg);
  el.className = "char-search-message" + (isError ? " char-search-message--error" : "");
}

/** 결과창에만 메시지 표시 (조회 없음 / 에러 시) */
function showResultMessage(message, isError = false) {
  const body = elements.resultBody;
  const rawPre = elements.resultRaw;
  if (!body) return;
  body.innerHTML = "";
  const p = document.createElement("p");
  p.className = "char-result-empty" + (isError ? " char-result-empty--error" : "");
  p.textContent = message == null ? "" : ensureString(message);
  body.appendChild(p);
  if (rawPre) rawPre.textContent = "";
}

function showResult(data) {
  const section = elements.resultSection;
  const body = elements.resultBody;
  const rawPre = elements.resultRaw;
  if (!section || !body) return;
  try {
    const normalized = normalizePayload(data);
    // 표시용 문자열은 여기서 한 번만 생성. 객체는 절대 DOM에 직접 넣지 않음
    const rawStr =
      typeof normalized === "object" && normalized !== null
        ? JSON.stringify(normalized, null, 2)
        : ensureString(normalized);

    const badResponse = rawStr === "[object Object]" || (typeof rawStr === "string" && rawStr.trim() === "");
    const displayStr = badResponse ? "응답을 표시할 수 없습니다. (잘못된 응답 형식)" : rawStr;

    if (rawPre) {
      rawPre.textContent = displayStr;
    }

    const rows = Array.isArray(normalized)
      ? normalized.flatMap((item, i) => flattenForDisplay(item, `[${i}]`))
      : flattenForDisplay(normalized);

    body.innerHTML = "";
    if (rows.length === 0 && !badResponse) {
      body.innerHTML = '<p class="char-result-empty">표시할 항목이 없습니다.</p>';
    } else if (badResponse) {
      const p = document.createElement("p");
      p.className = "char-result-empty";
      p.textContent = displayStr;
      body.appendChild(p);
    } else {
      const list = document.createElement("ul");
      list.className = "char-result-list";
      rows.forEach((pair) => {
        const rawKey = typeof pair[0] === "string" ? pair[0] : ensureString(pair[0]);
        const labelStr = toFriendlyLabel(rawKey);
        const rawVal = typeof pair[1] === "string" ? pair[1] : ensureString(pair[1]);
        const valStr = toFriendlyValue(rawKey, rawVal);
        const li = document.createElement("li");
        li.className = "char-result-row";
        const label = document.createElement("span");
        label.className = "char-result-label";
        label.textContent = labelStr;
        const val = document.createElement("span");
        val.className = "char-result-value";
        val.textContent = valStr;
        li.appendChild(label);
        li.appendChild(val);
        list.appendChild(li);
      });
      body.appendChild(list);
    }
  } catch (e) {
    Logger.error("characterSearch showResult", e);
    showResultMessage("결과 표시 중 오류가 났습니다.", true);
  }
}

/** 레벨(우선) → 경험치 순으로 가장 높은 캐릭터 1건 선택. API는 character_level, character_exp 필드 사용 */
function pickBestByLevelAndExp(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const toNum = (v) => (v === null || v === undefined ? 0 : Number(v));
  return candidates.reduce((best, cur) => {
    const curLevel = toNum(cur.character_level);
    const curExp = toNum(cur.character_exp);
    const bestLevel = toNum(best.character_level);
    const bestExp = toNum(best.character_exp);
    if (curLevel > bestLevel) return cur;
    if (curLevel === bestLevel && curExp > bestExp) return cur;
    return best;
  });
}

/** ms 밀리초 대기 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function doSearch() {
  if (elements.searchInProgress) {
    return;
  }
  const input = elements.nameInput;
  const name = (input?.value ?? "").trim().slice(0, 12);
  if (!name) {
    showMessage("캐릭터 이름을 입력하세요.", true);
    showResultMessage("캐릭터 이름을 입력하세요.", true);
    return;
  }

  elements.searchInProgress = true;
  if (elements.searchBtn) {
    elements.searchBtn.disabled = true;
  }
  showMessage("모든 서버 조회 중...");
  showResultMessage("모든 서버를 조회 중입니다.", false);

  try {
    const candidates = [];
    const servers = api.BARAMY_SERVER_NAMES;

    for (let i = 0; i < servers.length; i++) {
      const serverName = servers[i];
      try {
        const ocidData = await api.fetchCharacterOcid(name, serverName);
        const ocid = ocidData?.ocid ?? (typeof ocidData === "string" ? ocidData : null);
        if (!ocid) continue;
        const basic = await api.fetchCharacterBasic({ ocid });
        if (basic && typeof basic === "object") candidates.push(basic);
      } catch (_) {
        // 해당 서버 조회 실패 시 무시하고 다음 서버 진행
      }
      if (i < servers.length - 1) await delay(250);
    }

    const result = pickBestByLevelAndExp(candidates);
    showMessage("");

    if (!result) {
      showResultMessage("조회 결과가 없습니다. 해당 캐릭터가 어떤 서버에도 없거나, 일시적인 오류일 수 있습니다.", false);
      return;
    }
    showResult(result);
  } catch (error) {
    const errMsg = error?.message || "검색에 실패했습니다.";
    showMessage(errMsg, true);
    showResultMessage(errMsg, true);
    ErrorHandler.handle(error, "characterSearch");
  } finally {
    elements.searchInProgress = false;
    if (elements.searchBtn) {
      elements.searchBtn.disabled = false;
    }
  }
}

function handleKeydown(e) {
  if (e.key === "Enter") doSearch();
}

function bindEvents() {
  elements.searchBtn?.addEventListener("click", doSearch);
  elements.nameInput?.addEventListener("keydown", handleKeydown);
}

function unbindEvents() {
  elements.searchBtn?.removeEventListener("click", doSearch);
  elements.nameInput?.removeEventListener("keydown", handleKeydown);
}

export function init(container) {
  container.innerHTML = getHTML();
  elements.nameInput = container.querySelector("#characterNameInput");
  elements.searchBtn = container.querySelector("#characterSearchBtn");
  elements.message = container.querySelector("#characterSearchMessage");
  elements.resultSection = container.querySelector("#characterResultSection");
  elements.resultBody = container.querySelector("#characterResultBody");
  elements.resultRaw = container.querySelector("#characterResultRaw");
  bindEvents();
}

export function getHelpContentHTML() {
  return `
    <div class="content-block">
      <h2>수행자 검색 사용 안내</h2>
      <p>넥슨 오픈 API(<code>GET /baramy/v1/character/basic</code>)를 사용해 바람의나라: 연 캐릭터 기본 정보를 조회합니다.</p>
      <h3>사용 방법</h3>
      <ul>
        <li>캐릭터 이름을 입력한 뒤 검색 버튼을 누르거나 Enter를 치세요.</li>
        <li>넥슨 API 키는 <strong>백엔드 서버</strong> 환경 변수 <code>NEXON_OPEN_API_KEY</code>로 설정해야 합니다.</li>
      </ul>
    </div>
  `;
}

export function cleanup() {
  unbindEvents();
}
