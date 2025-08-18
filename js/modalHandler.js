import { createElement } from "./utils.js";
import { state as globalState } from "./state.js";
import {
  FACTION_ICONS,
  STATS_MAPPING,
  PERCENT_STATS,
  EFFECTIVE_STATS,
} from "./constants.js";

let activeModal = null;

function ensureNumber(value) {
  if (value === undefined || value === null) return 0;
  const num = parseFloat(String(value).replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
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
    console.error("모달을 표시할 환수 데이터가 없습니다.");
    return;
  }

  const { modal, content } = createBaseModal();
  document.body.style.overflow = "hidden";

  const initialLevel = isRankingMode ? 25 : 0;
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

  const closeBtn = createElement("button", "modal-close-btn", { text: "✕" });
  closeBtn.addEventListener("click", removeAllModals);
  container.appendChild(closeBtn);

  const kakaoAdSpiritInfoModalDesktop = createElement(
    "div",
    "kakao-ad-modal-container desktop-modal-ad"
  );
  kakaoAdSpiritInfoModalDesktop.innerHTML = `
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-NsxEDVcaO6e1i2Gs"
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
          data-ad-unit="DAN-09D9k8dFdlWpHbvG"
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
  const title = createElement("h3", "", { text: spiritData.name });
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
  const bindCol = createStatsColumn("장착 효과", "bindList", "bind-sum");
  statsContainer.appendChild(registrationCol);
  statsContainer.appendChild(bindCol);
  container.appendChild(statsContainer);

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

        console.log(
          "Kakao AdFit: Ads re-rendered (both mobile/desktop) in Spirit Info modal."
        );
      } else {
        console.warn(
          "Kakao AdFit script not yet loaded or available for re-rendering."
        );
      }
    } catch (error) {
      console.error(
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
  const levelInputContainer = createElement("div", "level-input-container");

  const minBtn = createElement("button", ["level-btn", "min-btn"], {
    text: "min",
  });
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
  const maxBtn = createElement("button", ["level-btn", "max-btn"], {
    text: "max",
  });

  levelInputContainer.append(minBtn, minusBtn, levelInput, plusBtn, maxBtn);
  levelControl.appendChild(levelInputContainer);

  const updateLevel = (newLevel) => {
    let validatedLevel = parseInt(newLevel, 10);
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
  };

  minBtn.addEventListener("click", () => updateLevel(0));
  minusBtn.addEventListener("click", () => updateLevel(currentLevel - 1));
  plusBtn.addEventListener("click", () => updateLevel(currentLevel + 1));
  maxBtn.addEventListener("click", () => updateLevel(25));
  levelInput.addEventListener("change", (e) => updateLevel(e.target.value));

  return levelControl;
}

function createStatsColumn(title, listId, sumId) {
  const column = createElement("div", "stats-column");
  column.innerHTML = `
        <div class="stats-header">
            ${title}
            <span id="${sumId}" class="stats-sum">합산: 0</span>
        </div>
        <ul id="${listId}" class="stats-list"></ul>
    `;
  return column;
}

function displayStats(spiritData, level, highlightStat) {
  const registrationList = document.getElementById("registrationList");
  const bindList = document.getElementById("bindList");

  if (!registrationList || !bindList) {
    console.error("Stat lists not found in DOM.");
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
  listElement.innerHTML = "";
  const statEntries = Object.entries(stats);

  if (statEntries.length === 0) {
    listElement.innerHTML = "<li>효과 없음</li>";
    return;
  }

  statEntries
    .sort((a, b) => {
      const nameA = STATS_MAPPING[a[0]] || a[0];
      const nameB = STATS_MAPPING[b[0]] || b[0];
      return nameA.localeCompare(nameB);
    })
    .forEach(([key, value]) => {
      const displayKey = STATS_MAPPING[key] || key;
      const isPercent = PERCENT_STATS.includes(key);
      const displayValue = isPercent
        ? `${ensureNumber(value)}%`
        : ensureNumber(value);

      const li = createElement("li");

      if (highlightStat && key === highlightStat) {
        li.classList.add("stat-highlight");
      }

      if (EFFECTIVE_STATS.includes(key)) {
        li.classList.add("stat-effective");
      }

      li.innerHTML = `
        <span class="stat-key">${displayKey}</span>
        <span class="stat-value">${displayValue}</span>
      `;
      listElement.appendChild(li);
    });
}

function calculateStatsSum(stats) {
  if (!stats) return 0;
  const resistance = ensureNumber(stats.damageResistance);
  const penetration = ensureNumber(stats.damageResistancePenetration);
  return Math.round(resistance + penetration);
}

export function removeAllModals() {
  if (activeModal) {
    document.removeEventListener("keydown", activeModal._escListener);
    activeModal.remove();
    activeModal = null;
  }
  document.body.style.overflow = "auto";
}
