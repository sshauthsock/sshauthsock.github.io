import { createElement, ensureNumber } from "./utils.js";
import { state as globalState } from "./state.js";
import {
  FACTION_ICONS,
  STATS_MAPPING,
  PERCENT_STATS,
  EFFECTIVE_STATS,
  isFixedLevelSpirit,
} from "./constants.js";
import { addSupportMessageToModal } from "./utils/supportMessage.js";
import Logger from "./utils/logger.js";

let activeModal = null;

// 길게 누르기 기능을 위한 상태 변수
let spiritInfoLongPressState = {
  isPressed: false,
  intervalId: null,
  timeoutId: null,
  hintElement: null,
  bridgeElement: null,
  hintHovered: false,
  button: null,
  container: null,
  spiritData: null,
  currentLevel: 0,
  highlightStat: null,
  action: null, // 'increment' or 'decrement'
  mouseDownTime: null,
};

// ensureNumber는 utils.js에서 import

// 길게 누르기 기능 함수들
function handleSpiritInfoContainerMouseDown(event) {
  const button = event.target.closest(".minus-btn, .plus-btn");
  if (!button) return;

  event.preventDefault();

  const levelControl = button.closest(".level-control");
  if (!levelControl) return;

  const container = document.getElementById("spirit-info-modal");
  if (!container) return;

  // 현재 모달에서 spiritData와 currentLevel 찾기
  const levelInput = levelControl.querySelector(".level-input");
  if (!levelInput) return;

  const currentLevel = parseInt(levelInput.value) || 0;

  // 전역 변수에서 현재 모달의 spiritData 가져오기
  const spiritData = globalState.currentModalSpirit || null;
  const highlightStat = globalState.currentModalHighlightStat || null;

  const action = button.classList.contains("plus-btn")
    ? "increment"
    : "decrement";

  // 상태 설정
  spiritInfoLongPressState.isPressed = true;
  spiritInfoLongPressState.button = button;
  spiritInfoLongPressState.container = container;
  spiritInfoLongPressState.spiritData = spiritData;
  spiritInfoLongPressState.currentLevel = currentLevel;
  spiritInfoLongPressState.highlightStat = highlightStat;
  spiritInfoLongPressState.action = action;
  spiritInfoLongPressState.mouseDownTime = Date.now();

  // 300ms 후 길게 누르기 시작
  spiritInfoLongPressState.timeoutId = setTimeout(() => {
    if (spiritInfoLongPressState.isPressed) {
      startSpiritInfoLongPress();
    }
  }, 300);
}

// 모바일 터치 이벤트 핸들러 (환수정보 모달)
function handleSpiritInfoContainerTouchStart(e) {
  const touch = e.touches[0];
  handleSpiritInfoContainerMouseDown({
    target: e.target,
    preventDefault: () => e.preventDefault(),
    stopPropagation: () => e.stopPropagation(),
  });
}

function handleSpiritInfoGlobalTouchUp(e) {
  const touch = e.changedTouches[0];

  // 터치 위치로 가상의 마우스 이벤트 생성
  const fakeEvent = {
    target: document.elementFromPoint(touch.clientX, touch.clientY),
    clientX: touch.clientX,
    clientY: touch.clientY,
    type: "touchend",
  };

  handleSpiritInfoGlobalMouseUp(fakeEvent);
}

function startSpiritInfoLongPress() {
  // 고정 레벨 환수는 레벨 변경 불가
  if (isFixedLevelSpirit(spiritInfoLongPressState.spiritData.name)) {
    return;
  }

  createSpiritInfoHint();

  // 200ms 간격으로 레벨 변경
  spiritInfoLongPressState.intervalId = setInterval(() => {
    if (
      !spiritInfoLongPressState.isPressed ||
      !spiritInfoLongPressState.spiritData
    )
      return;

    let newLevel = spiritInfoLongPressState.currentLevel;
    if (spiritInfoLongPressState.action === "increment") {
      newLevel = Math.min(25, spiritInfoLongPressState.currentLevel + 1);
    } else {
      newLevel = Math.max(0, spiritInfoLongPressState.currentLevel - 1);
    }

    if (newLevel !== spiritInfoLongPressState.currentLevel) {
      spiritInfoLongPressState.currentLevel = newLevel;

      // 레벨 입력 필드 업데이트
      const levelInput =
        spiritInfoLongPressState.container.querySelector(".level-input");
      if (levelInput) {
        levelInput.value = newLevel;
      }

      // 스탯만 업데이트 (모달 구조 유지)
      updateSpiritInfoStats(
        spiritInfoLongPressState.spiritData,
        newLevel,
        spiritInfoLongPressState.highlightStat
      );
    }

    // 최대/최소값에 도달하면 멈춤
    if (newLevel === 25 || newLevel === 0) {
      stopSpiritInfoLongPress();
    }
  }, 200);
}

function createSpiritInfoHint() {
  if (spiritInfoLongPressState.hintElement) return;

  const button = spiritInfoLongPressState.button;
  const rect = button.getBoundingClientRect();

  const hint = document.createElement("div");
  hint.className = "long-press-hint";
  hint.style.position = "fixed";
  hint.style.zIndex = "2150";
  hint.style.pointerEvents = "auto";
  hint.style.padding = "4px 10px";
  hint.style.borderRadius = "4px";
  hint.style.fontSize = "12px";
  hint.style.fontWeight = "600";
  hint.style.cursor = "pointer";
  hint.style.userSelect = "none";
  hint.style.height = "24px";
  hint.style.display = "flex";
  hint.style.alignItems = "center";
  hint.style.justifyContent = "center";
  hint.style.minWidth = "38px";
  hint.style.border = "none";
  hint.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
  hint.style.transition = "all 0.2s ease";

  const isPlus = spiritInfoLongPressState.action === "increment";

  if (isPlus) {
    // + 버튼 오른쪽, 수직 중앙 정렬 - 새로운 plus-btn 스타일과 일치
    hint.style.left = rect.right + 8 + "px";
    hint.style.top = rect.top + (rect.height - 24) / 2 + "px";
    hint.innerHTML =
      '<span class="hint-btn max-hint" data-value="25" style="color: white; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">MAX</span>';
    hint.style.background = "linear-gradient(135deg, #4ecdc4, #44a08d)";
    hint.style.border = "1px solid rgba(78, 205, 196, 0.3)";
    hint.style.color = "white";
  } else {
    // - 버튼 왼쪽, 수직 중앙 정렬 - 새로운 minus-btn 스타일과 일치
    hint.style.left = rect.left - 46 + "px";
    hint.style.top = rect.top + (rect.height - 24) / 2 + "px";
    hint.innerHTML =
      '<span class="hint-btn min-hint" data-value="0" style="color: white; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">MIN</span>';
    hint.style.background = "linear-gradient(135deg, #ff6b6b, #ee5a52)";
    hint.style.border = "1px solid rgba(255, 107, 107, 0.3)";
    hint.style.color = "white";
  }

  // 호버 효과 - 새로운 버튼 스타일과 일치
  hint.addEventListener("mouseenter", () => {
    if (isPlus) {
      hint.style.background = "linear-gradient(135deg, #26d0ce, #2eb398)";
      hint.style.boxShadow = "0 3px 6px rgba(68, 160, 141, 0.3)";
      hint.style.transform = "translateY(-1px)";
    } else {
      hint.style.background = "linear-gradient(135deg, #ff5252, #e53935)";
      hint.style.boxShadow = "0 3px 6px rgba(238, 90, 82, 0.3)";
      hint.style.transform = "translateY(-1px)";
    }
  });

  hint.addEventListener("mouseleave", () => {
    if (isPlus) {
      hint.style.background = "linear-gradient(135deg, #4ecdc4, #44a08d)";
      hint.style.boxShadow = "0 2px 4px rgba(68, 160, 141, 0.2)";
      hint.style.transform = "translateY(0)";
    } else {
      hint.style.background = "linear-gradient(135deg, #ff6b6b, #ee5a52)";
      hint.style.boxShadow = "0 2px 4px rgba(238, 90, 82, 0.2)";
      hint.style.transform = "translateY(0)";
    }
  });

  // 터치 이벤트 (모바일 지원)
  hint.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();

      if (isPlus) {
        hint.style.background = "linear-gradient(135deg, #26d0ce, #2eb398)";
        hint.style.boxShadow = "0 3px 6px rgba(68, 160, 141, 0.3)";
        hint.style.transform = "translateY(-1px)";
      } else {
        hint.style.background = "linear-gradient(135deg, #ff5252, #e53935)";
        hint.style.boxShadow = "0 3px 6px rgba(238, 90, 82, 0.3)";
        hint.style.transform = "translateY(-1px)";
      }
    },
    { passive: false }
  );

  hint.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();

      if (isPlus) {
        hint.style.background = "linear-gradient(135deg, #4ecdc4, #44a08d)";
        hint.style.boxShadow = "0 2px 4px rgba(68, 160, 141, 0.2)";
        hint.style.transform = "translateY(0)";
      } else {
        hint.style.background = "linear-gradient(135deg, #ff6b6b, #ee5a52)";
        hint.style.boxShadow = "0 2px 4px rgba(238, 90, 82, 0.2)";
        hint.style.transform = "translateY(0)";
      }
    },
    { passive: false }
  );

  // 힌트와 버튼 사이의 연결 영역 생성
  const bridge = document.createElement("div");
  bridge.className = "hint-bridge";
  bridge.style.position = "fixed";
  bridge.style.zIndex = "2149";
  bridge.style.pointerEvents = "auto";
  bridge.style.backgroundColor = "transparent";
  bridge.style.top = rect.top - 5 + "px";
  bridge.style.height = rect.height + 10 + "px";

  if (isPlus) {
    bridge.style.left = rect.right + "px";
    bridge.style.width = "54px"; // 힌트까지의 거리 (8px 간격 + 38px 힌트 너비 + 8px 여유)
  } else {
    bridge.style.left = rect.left - 46 + "px";
    bridge.style.width = "46px"; // 힌트부터 버튼까지의 거리
  }

  // 이벤트 핸들러
  const hintBtn = hint.querySelector(".hint-btn");
  hintBtn.addEventListener("mouseenter", () => {
    spiritInfoLongPressState.hintHovered = true;
  });

  hintBtn.addEventListener("mouseleave", () => {
    spiritInfoLongPressState.hintHovered = false;
  });

  // 터치 이벤트 (모바일 지원)
  hintBtn.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      spiritInfoLongPressState.hintHovered = true;
    },
    { passive: false }
  );

  hintBtn.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );

  bridge.addEventListener("mouseenter", () => {
    spiritInfoLongPressState.hintHovered = true;
  });

  bridge.addEventListener("mouseleave", () => {
    spiritInfoLongPressState.hintHovered = false;
  });

  // bridge 터치 이벤트 (모바일 지원)
  bridge.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      spiritInfoLongPressState.hintHovered = true;
    },
    { passive: false }
  );

  bridge.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );

  document.body.appendChild(hint);
  document.body.appendChild(bridge);

  spiritInfoLongPressState.hintElement = hint;
  spiritInfoLongPressState.bridgeElement = bridge;
}

function handleSpiritInfoGlobalMouseUp(event) {
  // 길게 누르기가 시작되지 않았고 timeout도 없다면 아무것도 하지 않음
  if (
    !spiritInfoLongPressState.isPressed &&
    !spiritInfoLongPressState.timeoutId
  )
    return;

  const mouseUpTime = Date.now();
  const pressDuration = mouseUpTime - spiritInfoLongPressState.mouseDownTime;
  const wasShortClick = pressDuration < 300;

  // 길게 누르기가 시작되지 않았다면 timeout만 취소하고 종료
  if (
    !spiritInfoLongPressState.isPressed &&
    spiritInfoLongPressState.timeoutId
  ) {
    clearTimeout(spiritInfoLongPressState.timeoutId);
    spiritInfoLongPressState.timeoutId = null;
    spiritInfoLongPressState.button = null;
    spiritInfoLongPressState.container = null;
    spiritInfoLongPressState.spiritData = null;
    spiritInfoLongPressState.action = null;
    spiritInfoLongPressState.mouseDownTime = null;
    return;
  }

  // 터치 이벤트인 경우 힌트와의 충돌 감지
  if (event.type === "touchend" && spiritInfoLongPressState.hintElement) {
    const hintRect =
      spiritInfoLongPressState.hintElement.getBoundingClientRect();
    const isWithinHint =
      event.clientX >= hintRect.left &&
      event.clientX <= hintRect.right &&
      event.clientY >= hintRect.top &&
      event.clientY <= hintRect.bottom;

    if (isWithinHint) {
      spiritInfoLongPressState.hintHovered = true;
    }
  }

  // 힌트가 있고 힌트 위에서 마우스를 뗐다면 (긴 누르기 후 힌트 클릭)
  if (
    spiritInfoLongPressState.hintElement &&
    spiritInfoLongPressState.hintHovered
  ) {
    const hintBtn =
      spiritInfoLongPressState.hintElement.querySelector(".hint-btn");
    if (hintBtn) {
      const targetValue = parseInt(hintBtn.dataset.value);
      if (spiritInfoLongPressState.spiritData && !isNaN(targetValue)) {
        // 레벨 입력 필드 업데이트
        const levelInput =
          spiritInfoLongPressState.container.querySelector(".level-input");
        if (levelInput) {
          levelInput.value = targetValue;
        }

        // 스탯만 업데이트 (모달 구조 유지)
        updateSpiritInfoStats(
          spiritInfoLongPressState.spiritData,
          targetValue,
          spiritInfoLongPressState.highlightStat
        );
      }
    }

    // 힌트 클릭 후 길게 누르기 중지
    stopSpiritInfoLongPress();
  }
  // 짧은 클릭이면서 힌트가 없는 경우 (일반 클릭)
  else if (
    wasShortClick &&
    !spiritInfoLongPressState.hintElement &&
    spiritInfoLongPressState.spiritData
  ) {
    let newLevel = spiritInfoLongPressState.currentLevel;
    if (spiritInfoLongPressState.action === "increment") {
      newLevel = Math.min(25, spiritInfoLongPressState.currentLevel + 1);
    } else {
      newLevel = Math.max(0, spiritInfoLongPressState.currentLevel - 1);
    }

    if (newLevel !== spiritInfoLongPressState.currentLevel) {
      // 레벨 입력 필드 업데이트
      const levelInput =
        spiritInfoLongPressState.container.querySelector(".level-input");
      if (levelInput) {
        levelInput.value = newLevel;
      }

      // 스탯만 업데이트 (모달 구조 유지)
      updateSpiritInfoStats(
        spiritInfoLongPressState.spiritData,
        newLevel,
        spiritInfoLongPressState.highlightStat
      );
    }
  }

  stopSpiritInfoLongPress();
}

// 더 이상 사용하지 않음 - 각 함수에서 직접 레벨과 스탯 업데이트

function updateSpiritInfoStats(spiritData, level, highlightStat) {
  // 고정 레벨 환수는 항상 25레벨로 설정
  if (isFixedLevelSpirit(spiritData.name)) {
    level = 25;
  }

  // 기존 displayStats 함수와 동일한 로직 사용
  const levelStats = spiritData.stats.find((s) => s.level === level);
  if (!levelStats) return;

  const regStats = levelStats.registrationStat || {};
  const bindStats = levelStats.bindStat || {};

  // 등록 효과 업데이트
  const registrationList = document.getElementById("registrationList");
  const registrationSum = document.getElementById("registration-sum");
  if (registrationList && registrationSum) {
    updateStatsList(registrationList, registrationSum, regStats, highlightStat);
  }

  // 장착 효과 업데이트
  const bindList = document.getElementById("bindList");
  const bindSum = document.getElementById("bind-sum");
  if (bindList && bindSum) {
    updateStatsList(bindList, bindSum, bindStats, highlightStat);
  }
}

function updateStatsList(listElement, sumElement, stats, highlightStat) {
  const statEntries = Object.entries(stats);
  const parentContainer = listElement.parentElement;

  if (statEntries.length === 0) {
    // effects-content 형식으로 "효과 없음" 표시
    parentContainer.innerHTML = '<p class="no-effects">효과 없음</p>';
    sumElement.textContent = `합산: 0`;
    return;
  }

  let totalSum = 0;
  let effectsListHtml = "";

  // 환산합산에 계산되는 스탯들 (맨 위에 표시)
  const scoreContributingStats = [
    "damageResistance",
    "damageResistancePenetration",
    "pvpDamagePercent",
    "pvpDefensePercent",
  ];

  // 기존 displayStatDetails와 동일한 정렬 및 스타일 적용
  // 환산합산 스탯을 맨 위로, 나머지는 알파벳 순
  statEntries
    .sort((a, b) => {
      const keyA = a[0];
      const keyB = b[0];
      const aIsPriority = scoreContributingStats.includes(keyA);
      const bIsPriority = scoreContributingStats.includes(keyB);

      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;
      if (aIsPriority && bIsPriority) {
        // 둘 다 우선순위 스탯이면 정의된 순서대로
        return (
          scoreContributingStats.indexOf(keyA) -
          scoreContributingStats.indexOf(keyB)
        );
      }
      // 둘 다 일반 스탯이면 알파벳 순
      const nameA = STATS_MAPPING[keyA] || keyA;
      const nameB = STATS_MAPPING[keyB] || keyB;
      return nameA.localeCompare(nameB);
    })
    .forEach(([key, value]) => {
      const numericValue = ensureNumber(value);
      if (numericValue <= 0) return;

      const displayKey = STATS_MAPPING[key] || key;
      const isPercent = PERCENT_STATS.includes(key);
      const roundedValue = Math.round(numericValue);
      const displayValue = isPercent
        ? `${roundedValue}%`
        : roundedValue.toLocaleString();

      let highlightClass = "";

      // 하이라이트 스탯 클래스
      if (highlightStat && key === highlightStat) {
        highlightClass += " stat-highlight";
      }

      // 효과적인 스탯 클래스
      if (EFFECTIVE_STATS.includes(key)) {
        highlightClass += " stat-effective";
        // 합산 계산: 대인피해%와 대인방어%는 10을 곱함
        if (key === "pvpDamagePercent" || key === "pvpDefensePercent") {
          totalSum += numericValue * 10;
        } else {
          totalSum += numericValue;
        }
      }

      // 특별한 스탯별 클래스 추가
      if (key === "damageResistance") {
        highlightClass += " stat-damage-resistance";
      } else if (key === "damageResistancePenetration") {
        highlightClass += " stat-damage-resistance-penetration";
      } else if (key === "pvpDamagePercent") {
        highlightClass += " stat-pvp-damage-percent";
      } else if (key === "pvpDefensePercent") {
        highlightClass += " stat-pvp-defense-percent";
      }

      // effects-content 형식의 HTML 구조 사용
      effectsListHtml += `<li class="${highlightClass.trim()}"><span class="stat-name">${displayKey}</span><span class="stat-value">${displayValue}</span></li>`;
    });

  // effects-content 형식으로 업데이트
  parentContainer.innerHTML = `<ul class="effects-list">${effectsListHtml}</ul>`;

  // 새로운 리스트 엘리먼트에 ID 설정
  const newListElement = parentContainer.querySelector(".effects-list");
  if (newListElement && listElement.id) {
    newListElement.id = listElement.id;
  }

  sumElement.textContent = `합산: ${totalSum.toLocaleString()}`;
}

function stopSpiritInfoLongPress() {
  if (spiritInfoLongPressState.timeoutId) {
    clearTimeout(spiritInfoLongPressState.timeoutId);
  }

  if (spiritInfoLongPressState.intervalId) {
    clearInterval(spiritInfoLongPressState.intervalId);
  }

  if (spiritInfoLongPressState.hintElement) {
    spiritInfoLongPressState.hintElement.remove();
  }

  if (spiritInfoLongPressState.bridgeElement) {
    spiritInfoLongPressState.bridgeElement.remove();
  }

  spiritInfoLongPressState.isPressed = false;
  spiritInfoLongPressState.intervalId = null;
  spiritInfoLongPressState.timeoutId = null;
  spiritInfoLongPressState.hintElement = null;
  spiritInfoLongPressState.bridgeElement = null;
  spiritInfoLongPressState.hintHovered = false;
  spiritInfoLongPressState.button = null;
  spiritInfoLongPressState.container = null;
  spiritInfoLongPressState.spiritData = null;
  spiritInfoLongPressState.currentLevel = 0;
  spiritInfoLongPressState.highlightStat = null;
  spiritInfoLongPressState.action = null;
  spiritInfoLongPressState.mouseDownTime = null;
}

function createBaseModal() {
  removeAllModals();
  const modal = createElement("div", "spirit-modal-overlay", {
    id: "spirit-info-modal",
  });
  const content = createElement("div", "spirit-modal-content");
  modal.appendChild(content);
  document.body.appendChild(modal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) removeAllModals();
  });

  const escListener = (e) => {
    if (e.key === "Escape") removeAllModals();
  };
  document.addEventListener("keydown", escListener);
  modal._escListener = escListener;

  activeModal = modal;
  return { modal, content };
}

export function showInfo(
  spiritData,
  highlightStat = null,
  isRankingMode = false
) {
  if (!spiritData) {
    Logger.error("모달을 표시할 환수 데이터가 없습니다.");
    return;
  }

  const { modal, content } = createBaseModal();
  document.body.style.overflow = "hidden";

  // 고정 레벨 환수는 항상 25레벨, 랭킹 모드도 25레벨, 나머지는 0레벨
  let initialLevel = 0;
  if (isRankingMode || isFixedLevelSpirit(spiritData.name)) {
    initialLevel = 25;
  }

  renderSpiritInfo(
    content,
    spiritData,
    initialLevel,
    highlightStat,
    isRankingMode
  );

  modal.style.display = "flex";
}

function renderSpiritInfo(
  container,
  spiritData,
  level,
  highlightStat,
  isRankingMode
) {
  container.innerHTML = "";

  // 고정 레벨 환수는 항상 25레벨로 설정
  if (isFixedLevelSpirit(spiritData.name)) {
    level = 25;
  }

  // 전역 mouseup 이벤트 리스너 추가 (한 번만 추가)
  if (!document._spiritInfoMouseUpAdded) {
    document.addEventListener("mouseup", handleSpiritInfoGlobalMouseUp);
    document._spiritInfoMouseUpAdded = true;
  }

  // 전역 touchend 이벤트 리스너 추가 (한 번만 추가)
  if (!document._spiritInfoTouchEndAdded) {
    document.addEventListener("touchend", handleSpiritInfoGlobalTouchUp);
    document._spiritInfoTouchEndAdded = true;
  }

  const closeBtn = createElement("button", "modal-close-btn", { text: "✕" });
  closeBtn.addEventListener("click", removeAllModals);
  container.appendChild(closeBtn);

  const kakaoAdSpiritInfoModalDesktop = createElement(
    "div",
    "kakao-ad-modal-container desktop-modal-ad"
  );
  kakaoAdSpiritInfoModalDesktop.innerHTML = `
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-aOM3JPGvOLhHlyoS"
          data-ad-width="728"
          data-ad-height="90"></ins>
  `;
  container.appendChild(kakaoAdSpiritInfoModalDesktop);

  const kakaoAdSpiritInfoModalMobile = createElement(
    "div",
    "kakao-ad-modal-container mobile-modal-ad"
  );
  kakaoAdSpiritInfoModalMobile.innerHTML = `
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-epbkjAaeHSxv0MYl"
          data-ad-width="320"
          data-ad-height="50"></ins>
  `;
  container.appendChild(kakaoAdSpiritInfoModalMobile);

  const header = createElement("div", "spirit-modal-header");
  const img = createElement("img", "spirit-modal-image", {
    src: `${spiritData.image}`,
    alt: spiritData.name,
  });
  header.appendChild(img);

  const titleSection = createElement("div", "spirit-modal-title-section");
  const title = createElement("h3", "");
  const titleText = createElement("span", "", { text: spiritData.name });
  title.appendChild(titleText);
  titleSection.appendChild(title);

  if (spiritData.influence && FACTION_ICONS[spiritData.influence]) {
    const factionIcon = createElement("img", "influence-icon", {
      src: FACTION_ICONS[spiritData.influence],
      alt: spiritData.influence,
      title: spiritData.influence,
    });
    title.appendChild(factionIcon);
  }

  const levelControl = isRankingMode
    ? createFixedLevelControl()
    : createEditableLevelControl(container, spiritData, level, highlightStat);

  titleSection.appendChild(levelControl);
  header.appendChild(titleSection);
  container.appendChild(header);

  const statsContainer = createElement("div", "stats-container");
  const registrationCol = createStatsColumn(
    "등록 효과",
    "registrationList",
    "registration-sum"
  );
  const bindCol = createStatsColumn("결속 효과", "bindList", "bind-sum");
  statsContainer.appendChild(registrationCol);
  statsContainer.appendChild(bindCol);
  container.appendChild(statsContainer);

  // 지원 메시지를 모달 상단에 추가
  addSupportMessageToModal(container);

  displayStats(spiritData, level, highlightStat);

  setTimeout(() => {
    try {
      if (window.adfit && typeof window.adfit.render === "function") {
        const desktopAdIns =
          kakaoAdSpiritInfoModalDesktop.querySelector(".kakao_ad_area");
        const mobileAdIns =
          kakaoAdSpiritInfoModalMobile.querySelector(".kakao_ad_area");

        if (desktopAdIns) window.adfit.render(desktopAdIns);
        if (mobileAdIns) window.adfit.render(mobileAdIns);
      } else {
        Logger.warn(
          "Kakao AdFit script not yet loaded or available for re-rendering."
        );
      }
    } catch (error) {
      Logger.error(
        "Kakao AdFit: Error re-rendering ad after level change:",
        error
      );
    }
  }, 100);
}

function createFixedLevelControl() {
  const levelControl = createElement("div", "level-control");
  const levelDisplay = createElement("div", "fixed-level-display");
  levelDisplay.innerHTML = `<strong>레벨: 25</strong> (랭킹 기준)`;
  levelControl.appendChild(levelDisplay);
  return levelControl;
}

function createEditableLevelControl(
  container,
  spiritData,
  currentLevel,
  highlightStat
) {
  const levelControl = createElement("div", "level-control");

  // 고정 레벨 환수는 특별한 UI 표시
  if (isFixedLevelSpirit(spiritData.name)) {
    const fixedLevelContainer = createElement("div", "fixed-level-control");
    const fixedLevelLabel = createElement("span", "fixed-level-label", {
      text: "25 (고정)",
    });
    fixedLevelContainer.appendChild(fixedLevelLabel);
    levelControl.appendChild(fixedLevelContainer);
    return levelControl;
  }

  const levelInputContainer = createElement("div", "level-input-container");

  const minusBtn = createElement("button", ["level-btn", "minus-btn"], {
    text: "-",
  });
  const levelInput = createElement("input", "level-input", {
    type: "number",
    min: "0",
    max: "25",
    value: String(currentLevel),
  });
  const plusBtn = createElement("button", ["level-btn", "plus-btn"], {
    text: "+",
  });

  levelInputContainer.append(minusBtn, levelInput, plusBtn);
  levelControl.appendChild(levelInputContainer);

  // 현재 모달의 spiritData를 전역에서 접근할 수 있도록 저장
  globalState.currentModalSpirit = spiritData;
  globalState.currentModalHighlightStat = highlightStat;

  // mousedown 이벤트로 길게 누르기 기능 처리 (한 번만 추가)
  levelInputContainer._mousedownHandlerAdded = true;
  levelInputContainer.addEventListener(
    "mousedown",
    handleSpiritInfoContainerMouseDown
  );

  // 모바일 터치 이벤트 추가
  levelInputContainer.addEventListener(
    "touchstart",
    handleSpiritInfoContainerTouchStart,
    { passive: false }
  );

  // 입력 필드 변경 이벤트만 유지
  levelInput.addEventListener("change", (e) => {
    let validatedLevel = parseInt(e.target.value, 10);
    if (isNaN(validatedLevel) || validatedLevel < 0) validatedLevel = 0;
    if (validatedLevel > 25) validatedLevel = 25;

    if (validatedLevel !== currentLevel) {
      renderSpiritInfo(
        container,
        spiritData,
        validatedLevel,
        highlightStat,
        false
      );
    }
  });

  return levelControl;
}

function createStatsColumn(title, listId, sumId) {
  const column = createElement("div", "stats-column");
  column.innerHTML = `
        <h4>${title} <span id="${sumId}" class="section-score">합산: 0</span></h4>
        <div class="effects-content">
            <ul id="${listId}" class="effects-list"></ul>
        </div>
    `;
  return column;
}

function displayStats(spiritData, level, highlightStat) {
  const registrationList = document.getElementById("registrationList");
  const bindList = document.getElementById("bindList");

  if (!registrationList || !bindList) {
    Logger.error("Stat lists not found in DOM.");
    return;
  }

  const levelStat = spiritData.stats.find((s) => s.level === level);
  const regStats = levelStat?.registrationStat || {};
  const bindStats = levelStat?.bindStat || {};

  displayStatDetails(registrationList, regStats, highlightStat);
  displayStatDetails(bindList, bindStats, highlightStat);

  document.getElementById(
    "registration-sum"
  ).textContent = `합산: ${calculateStatsSum(regStats)}`;
  document.getElementById("bind-sum").textContent = `합산: ${calculateStatsSum(
    bindStats
  )}`;
}

function displayStatDetails(listElement, stats, highlightStat) {
  const statEntries = Object.entries(stats);
  const parentContainer = listElement.parentElement;

  if (statEntries.length === 0) {
    // effects-content 형식으로 "효과 없음" 표시
    parentContainer.innerHTML = '<p class="no-effects">효과 없음</p>';
    return;
  }

  // 환산합산에 계산되는 스탯들 (맨 위에 표시)
  const scoreContributingStats = [
    "damageResistance",
    "damageResistancePenetration",
    "pvpDamagePercent",
    "pvpDefensePercent",
  ];

  let effectsListHtml = "";

  statEntries
    .sort((a, b) => {
      const keyA = a[0];
      const keyB = b[0];
      const aIsPriority = scoreContributingStats.includes(keyA);
      const bIsPriority = scoreContributingStats.includes(keyB);

      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;
      if (aIsPriority && bIsPriority) {
        // 둘 다 우선순위 스탯이면 정의된 순서대로
        return (
          scoreContributingStats.indexOf(keyA) -
          scoreContributingStats.indexOf(keyB)
        );
      }
      // 둘 다 일반 스탯이면 알파벳 순
      const nameA = STATS_MAPPING[keyA] || keyA;
      const nameB = STATS_MAPPING[keyB] || keyB;
      return nameA.localeCompare(nameB);
    })
    .forEach(([key, value]) => {
      const numericValue = ensureNumber(value);
      if (numericValue <= 0) return;

      const displayKey = STATS_MAPPING[key] || key;
      const isPercent = PERCENT_STATS.includes(key);
      const roundedValue = Math.round(numericValue);
      const displayValue = isPercent
        ? `${roundedValue}%`
        : roundedValue.toLocaleString();

      let highlightClass = "";

      if (highlightStat && key === highlightStat) {
        highlightClass += " stat-highlight";
      }

      if (EFFECTIVE_STATS.includes(key)) {
        highlightClass += " stat-effective";
      }

      // 특별한 스탯별 클래스 추가
      if (key === "damageResistance") {
        highlightClass += " stat-damage-resistance";
      } else if (key === "damageResistancePenetration") {
        highlightClass += " stat-damage-resistance-penetration";
      } else if (key === "pvpDamagePercent") {
        highlightClass += " stat-pvp-damage-percent";
      } else if (key === "pvpDefensePercent") {
        highlightClass += " stat-pvp-defense-percent";
      }

      // effects-content 형식의 HTML 구조 사용 (stat-name, stat-value)
      effectsListHtml += `<li class="${highlightClass.trim()}"><span class="stat-name">${displayKey}</span><span class="stat-value">${displayValue}</span></li>`;
    });

  // effects-content 형식으로 업데이트
  parentContainer.innerHTML = `<ul class="effects-list">${effectsListHtml}</ul>`;

  // 새로운 리스트 엘리먼트에 ID 설정
  const newListElement = parentContainer.querySelector(".effects-list");
  if (newListElement && listElement.id) {
    newListElement.id = listElement.id;
  }
}

function calculateStatsSum(stats) {
  if (!stats) return 0;
  const resistance = ensureNumber(stats.damageResistance);
  const penetration = ensureNumber(stats.damageResistancePenetration);
  const pvpDamage = ensureNumber(stats.pvpDamagePercent);
  const pvpDefense = ensureNumber(stats.pvpDefensePercent);

  return Math.round(
    resistance + penetration + pvpDamage * 10 + pvpDefense * 10
  );
}

export function removeAllModals() {
  // 길게 누르기 상태 정리
  stopSpiritInfoLongPress();

  // 전역 이벤트 리스너 제거
  if (document._spiritInfoMouseUpAdded) {
    document.removeEventListener("mouseup", handleSpiritInfoGlobalMouseUp);
    document._spiritInfoMouseUpAdded = false;
  }

  if (activeModal) {
    document.removeEventListener("keydown", activeModal._escListener);
    activeModal.remove();
    activeModal = null;
  }
  document.body.style.overflow = "auto";

  // 전역 상태 정리
  if (globalState.currentModalSpirit) {
    delete globalState.currentModalSpirit;
  }
  if (globalState.currentModalHighlightStat) {
    delete globalState.currentModalHighlightStat;
  }
}
