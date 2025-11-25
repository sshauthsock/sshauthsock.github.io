import { createElement, ensureNumber } from "../utils.js";
import { STATS_MAPPING, PERCENT_STATS } from "../constants.js";
import { addSupportMessageToModal } from "../utils/supportMessage.js";

let activeModal = null;

function getDisplayName(statName) {
  return statName.replace(/\d+$/, "");
}

export function showChakResultsModal(
  chakData,
  currentStatState,
  title,
  statsToFind,
  onSelectLocation
) {
  removeAllModals();
  const modal = createElement("div", "modal-overlay", {
    id: "chakResultsModal",
  });
  const content = createElement("div", "modal-content");
  modal.appendChild(content);
  document.body.appendChild(modal);

  const closeButton = createElement("button", "modal-close", { text: "✕" });
  closeButton.addEventListener("click", removeAllModals);
  content.appendChild(closeButton);

  // Kakao Ads - Desktop
  const kakaoAdChakModalDesktop = createElement(
    "div",
    "kakao-ad-modal-container desktop-modal-ad"
  );
  kakaoAdChakModalDesktop.innerHTML = `
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-aOM3JPGvOLhHlyoS"
          data-ad-width="728"
          data-ad-height="90"></ins>
  `;
  content.appendChild(kakaoAdChakModalDesktop);

  // Kakao Ads - Mobile
  const kakaoAdChakModalMobile = createElement(
    "div",
    "kakao-ad-modal-container mobile-modal-ad"
  );
  kakaoAdChakModalMobile.innerHTML = `
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-epbkjAaeHSxv0MYl"
          data-ad-width="320"
          data-ad-height="50"></ins>
  `;
  content.appendChild(kakaoAdChakModalMobile);

  const modalHeader = createElement("div", "modal-header");
  const modalTitle = createElement("h3", "", { text: title });
  modalHeader.appendChild(modalTitle);
  content.appendChild(modalHeader);

  const mainContainer = createElement("div", "optimize-container"); // 최적화/검색 결과를 담을 컨테이너
  content.appendChild(mainContainer);

  const descriptionPanel = createElement("div", "optimize-description");
  mainContainer.appendChild(descriptionPanel);

  const resultsContainer = createElement("div", "optimize-results-container");
  mainContainer.appendChild(resultsContainer);

  renderResultsPanel(
    chakData,
    currentStatState,
    resultsContainer,
    statsToFind,
    onSelectLocation
  );
  renderDescriptionPanel(
    chakData,
    currentStatState,
    descriptionPanel,
    statsToFind
  );

  // 지원 메시지를 모달 상단에 추가
  addSupportMessageToModal(mainContainer);

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  const escListener = (e) => {
    if (e.key === "Escape") removeAllModals();
  };
  document.addEventListener("keydown", escListener);
  modal._escListener = escListener;
  activeModal = modal;

  modal.addEventListener("click", (e) => {
    if (e.target === modal) removeAllModals();
  });

  // Render Kakao Ads
  setTimeout(() => {
    try {
      const desktopAdElement =
        kakaoAdChakModalDesktop.querySelector(".kakao_ad_area");
      const mobileAdElement =
        kakaoAdChakModalMobile.querySelector(".kakao_ad_area");

      if (window.adfit) {
        if (desktopAdElement) window.adfit.render(desktopAdElement);
        if (mobileAdElement) window.adfit.render(mobileAdElement);
      }
    } catch (error) {
      console.error("Kakao AdFit: Error rendering ads in Chak modal:", error);
    }
  }, 100);
}

function renderResultsPanel(
  chakData,
  currentStatState,
  container,
  statsToFind,
  onSelectLocation
) {
  container.innerHTML = "";

  const groupedResults = groupChakStatsByDisplayName(chakData, statsToFind);

  if (Object.keys(groupedResults).length === 0) {
    container.innerHTML = `<p class="no-matches">선택된 능력치를 찾을 수 없습니다.</p>`;
    return;
  }

  Object.entries(groupedResults).forEach(([statDisplayName, locations]) => {
    const compactGroup = createElement("div", "compact-group");
    const header = createElement("div", "compact-stat-title", {
      html: `
        <span class="stat-name-section">${statDisplayName}
            <span class="stat-count">(${locations.length}곳)</span>
        </span>
        <span class="toggle-icon">+</span>
      `,
    });
    const content = createElement("div", "stat-group-content");
    content.style.maxHeight = "1000px";

    header.addEventListener("click", () => {
      if (content.style.maxHeight === "0px") {
        content.style.maxHeight = content.scrollHeight + "px";
        header.querySelector(".toggle-icon").textContent = "-";
      } else {
        content.style.maxHeight = "0px";
        header.querySelector(".toggle-icon").textContent = "+";
      }
    });

    const partsOrder = chakData.constants.parts;
    const groupedByPart = locations.reduce((acc, loc) => {
      const partName = loc.part.split("_")[0];
      (acc[partName] = acc[partName] || []).push(loc);
      return acc;
    }, {});

    partsOrder.forEach((partName) => {
      const partLocations = groupedByPart[partName];
      if (!partLocations || partLocations.length === 0) return;

      const partSection = createElement("div", "part-section");
      const partHeader = createElement("div", "part-header", {
        html: `<span>${partName}</span> <span class="stat-info">(${partLocations.length}곳)</span>`,
      });
      partSection.appendChild(partHeader);

      const compactLocations = createElement("div", "compact-locations");
      partLocations.forEach((item) => {
        const cardId = `${item.statName}_${item.part}_${item.level}_${item.index}`; // 백엔드 로직에 따라 cardId 구성
        const statState = currentStatState[cardId] || {
          isUnlocked: false,
          level: 0,
        };

        const locationCard = createElement("div", "compact-location", {
          "data-part-id": item.part,
          "data-level": item.level,
        });

        let statusClass = "location-unused";
        if (statState.isUnlocked) {
          statusClass =
            statState.level === 3 ? "location-complete" : "location-partial";
        }
        locationCard.classList.add(statusClass);

        locationCard.innerHTML = `
          <div class="loc-header">
            <span class="loc-part" title="${item.part.replace(
              /_\d+$/,
              ""
            )}">${item.part.replace(/_\d+$/, "")}</span>
            <span class="loc-level">${item.level}</span>
          </div>
          <div class="loc-details">
            <span class="loc-max-value">+${item.maxValue}</span>
          </div>
        `;
        locationCard.addEventListener("click", () =>
          onSelectLocation(item.part, item.level)
        );
        compactLocations.appendChild(locationCard);
      });
      partSection.appendChild(compactLocations);
      content.appendChild(partSection);
    });

    compactGroup.append(header, content);
    container.appendChild(compactGroup);
  });
}

function renderDescriptionPanel(
  chakData,
  currentStatState,
  container,
  statsToFind
) {
  container.innerHTML = "";

  const summary = calculateCurrentSummary(currentStatState, chakData);

  const priorityStatsHtml = statsToFind
    .map((stat) => `<span class="priority-stat">${stat}</span>`)
    .join("");

  container.innerHTML = `
    <div class="preset-summary">
        <div class="preset-header">
            <h4>적용된 능력치 요약</h4>
        </div>
        <div class="preset-stats">${
          priorityStatsHtml || "<p>선택된 능력치가 없습니다.</p>"
        }</div>
        <div class="preset-resources">
            <div class="resource-req-title">필요 자원 (현재 적용 상태)</div>
            <div class="resource-req-items">
                <div class="resource-req-item">
                    <img src="assets/img/gold-button.jpg" class="resource-icon-img-small" loading="lazy">
                    <span>${summary.goldConsumed.toLocaleString()}</span>
                </div>
                <div class="resource-req-item">
                    <img src="assets/img/fivecolored-beads.jpg" class="resource-icon-img-small" loading="lazy">
                    <span>${summary.ballConsumed.toLocaleString()}</span>
                </div>
            </div>
        </div>
    </div>
  `;
}

function calculateCurrentSummary(currentStatState, chakData) {
  let goldConsumed = 0;
  let ballConsumed = 0;

  for (const cardId in currentStatState) {
    const state = currentStatState[cardId];
    if (!state.isUnlocked) continue;

    if (state.isFirst) {
      ballConsumed += state.level * chakData.costs["upgradeFirst"];
    } else {
      goldConsumed += chakData.costs["unlockOther"];
      if (state.level >= 1) {
        ballConsumed += chakData.costs["upgradeOther0"];
      }
      if (state.level >= 2) {
        ballConsumed += chakData.costs["upgradeOther1"];
      }
      if (state.level >= 3) {
        ballConsumed += chakData.costs["upgradeOther2"];
      }
    }
  }
  return { goldConsumed, ballConsumed };
}

function groupChakStatsByDisplayName(chakData, statsToFind) {
  const results = {};
  chakData.constants.parts.forEach((partId, partIndex) => {
    const dataKeyPart = partId.split("_")[0];
    chakData.constants.levels.forEach((level) => {
      const levelKey = `lv${level.replace("+", "")}`;
      const statsOnItem = chakData.equipment[dataKeyPart]?.[levelKey] || {};

      let statIndex = 0;
      Object.entries(statsOnItem).forEach(([statName, maxValue]) => {
        const displayName = getDisplayName(statName);
        if (statsToFind.includes(displayName)) {
          if (!results[displayName]) results[displayName] = [];
          results[displayName].push({
            part: partId,
            level: level,
            statName: statName,
            maxValue: maxValue,
            index: statIndex,
            cardId: `${statName}_${partId}_${level}_${statIndex}`,
          });
        }
        statIndex++;
      });
    });
  });

  const sortedResults = {};
  Object.keys(results)
    .sort()
    .forEach((displayName) => {
      sortedResults[displayName] = results[displayName].sort((a, b) => {
        const partA = a.part.split("_")[0];
        const partB = b.part.split("_")[0];
        if (partA !== partB) return partA.localeCompare(partB);

        const levelNumA = parseInt(a.level.replace(/\D/g, ""), 10);
        const levelNumB = parseInt(b.level.replace(/\D/g, ""), 10);
        return levelNumA - levelNumB;
      });
    });
  return sortedResults;
}

export function removeAllModals() {
  if (activeModal) {
    document.removeEventListener("keydown", activeModal._escListener);
    activeModal.remove();
    activeModal = null;
  }
  document.body.style.overflow = "auto";
}
