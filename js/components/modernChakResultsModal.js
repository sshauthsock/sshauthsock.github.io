import { createElement } from "../utils.js";
import { STATS_MAPPING, PERCENT_STATS } from "../constants.js";
import { addSupportMessageToModal } from "../utils/supportMessage.js";

let activeModal = null;

function ensureNumber(value) {
  if (value === undefined || value === null) return 0;
  const num = parseFloat(String(value).replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
}

function getDisplayName(statName) {
  return statName.replace(/\d+$/, "");
}

export function showModernChakResultsModal(
  chakData,
  currentStatState,
  title,
  statsToFind,
  onSelectLocation
) {
  removeAllModals();

  // Create modal
  const modal = createElement("div", "modal-overlay", {
    id: "modernChakResultsModal",
  });
  const content = createElement("div", "modal-content");
  modal.appendChild(content);
  document.body.appendChild(modal);

  // Add modern CSS
  if (!document.querySelector('link[href*="chakra-results-modern.css"]')) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "public/assets/css/chakra-results-modern.css";
    document.head.appendChild(link);
  }

  // Close button
  const closeButton = createElement("button", "modal-close", { text: "✕" });
  closeButton.addEventListener("click", removeAllModals);
  content.appendChild(closeButton);

  // Modal header
  const modalHeader = createElement("div", "modal-header");
  const modalTitle = createElement("h3", "", { text: title });
  modalHeader.appendChild(modalTitle);
  content.appendChild(modalHeader);

  // Main container
  const mainContainer = createElement("div", "modern-chakra-container");
  content.appendChild(mainContainer);

  // Render the new UI
  renderModernChakraResults(
    chakData,
    currentStatState,
    mainContainer,
    statsToFind,
    onSelectLocation
  );

  // Show modal
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Event listeners
  const escListener = (e) => {
    if (e.key === "Escape") removeAllModals();
  };
  document.addEventListener("keydown", escListener);
  modal._escListener = escListener;
  activeModal = modal;

  modal.addEventListener("click", (e) => {
    if (e.target === modal) removeAllModals();
  });
}

function renderModernChakraResults(
  chakData,
  currentStatState,
  container,
  statsToFind,
  onSelectLocation
) {
  const groupedResults = groupChakStatsByDisplayName(chakData, statsToFind);

  if (Object.keys(groupedResults).length === 0) {
    container.innerHTML = `
      <div class="chakra-empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">검색 결과가 없습니다</div>
        <div class="empty-state-description">선택된 능력치를 찾을 수 없습니다.<br>다른 능력치를 선택해보세요.</div>
      </div>
    `;
    return;
  }

  // Create tabs container
  const tabsContainer = createElement("div", "chakra-results-tabs");
  const contentContainer = createElement("div", "chakra-results-content");

  // Create summary panel
  const summaryPanel = createSummaryPanel(
    currentStatState,
    chakData,
    statsToFind
  );
  container.appendChild(summaryPanel);

  container.appendChild(tabsContainer);
  container.appendChild(contentContainer);

  // Create tabs for each stat
  Object.entries(groupedResults).forEach(
    ([statDisplayName, locations], index) => {
      // Create tab
      const tab = createElement("div", "chakra-tab", {
        "data-stat": statDisplayName,
        text: statDisplayName,
      });

      const badge = createElement("span", "chakra-tab-badge", {
        text: `${locations.length}곳`,
      });
      tab.appendChild(badge);

      // Create tab panel
      const panel = createElement("div", "chakra-tab-panel", {
        "data-stat": statDisplayName,
      });

      if (index === 0) {
        tab.classList.add("active");
        panel.classList.add("active");
      }

      // Render equipment grid for this stat
      renderEquipmentGrid(panel, locations, currentStatState, onSelectLocation);

      tabsContainer.appendChild(tab);
      contentContainer.appendChild(panel);

      // Tab click handler
      tab.addEventListener("click", () => {
        // Remove active from all tabs and panels
        tabsContainer
          .querySelectorAll(".chakra-tab")
          .forEach((t) => t.classList.remove("active"));
        contentContainer
          .querySelectorAll(".chakra-tab-panel")
          .forEach((p) => p.classList.remove("active"));

        // Add active to clicked tab and corresponding panel
        tab.classList.add("active");
        panel.classList.add("active");
      });
    }
  );

  // 지원 메시지를 모달 상단에 추가
  addSupportMessageToModal(container);
}

function createSummaryPanel(currentStatState, chakData, statsToFind) {
  const summary = calculateCurrentSummary(currentStatState, chakData);

  const summaryContainer = createElement("div", "quick-stats-summary");

  const title = createElement("div", "summary-title");
  title.innerHTML = `
    <span class="summary-icon">📊</span>
    현재 적용된 능력치 요약
  `;

  const statsGrid = createElement("div", "stats-summary-grid");

  if (Object.keys(summary).length === 0) {
    statsGrid.innerHTML =
      '<div style="grid-column: 1/-1; text-align: center; color: #64748b;">적용된 능력치가 없습니다</div>';
  } else {
    Object.entries(summary)
      .sort((a, b) => b[1] - a[1])
      .forEach(([stat, value]) => {
        const statItem = createElement("div", "summary-stat-item");
        statItem.innerHTML = `
          <span class="summary-stat-name">${stat}</span>
          <span class="summary-stat-value">+${value}</span>
        `;
        statsGrid.appendChild(statItem);
      });
  }

  summaryContainer.appendChild(title);
  summaryContainer.appendChild(statsGrid);

  return summaryContainer;
}

function renderEquipmentGrid(
  container,
  locations,
  currentStatState,
  onSelectLocation
) {
  // Group by equipment part
  const groupedByPart = locations.reduce((acc, loc) => {
    const partName = loc.part.split("_")[0];
    (acc[partName] = acc[partName] || []).push(loc);
    return acc;
  }, {});

  const equipmentGrid = createElement("div", "equipment-parts-grid");

  Object.entries(groupedByPart).forEach(([partName, partLocations]) => {
    const partCard = createElement("div", "equipment-part-card");

    // Calculate upgrade status
    const upgradeStats = calculatePartUpgradeStatus(
      partLocations,
      currentStatState
    );

    // Add status class
    if (upgradeStats.fullyUpgraded > 0) {
      partCard.classList.add("fully-upgraded");
    } else if (upgradeStats.partiallyUpgraded > 0) {
      partCard.classList.add("has-upgrades");
    }

    // Card header
    const header = createElement("div", "equipment-card-header");
    header.innerHTML = `
      <div class="equipment-part-name">
        ${getPartDisplayName(partName)}
      </div>
      <div class="equipment-progress-info">
        <div class="progress-percentage">${
          upgradeStats.progressPercentage
        }%</div>
        <div>${upgradeStats.upgradedCount}/${partLocations.length} 강화</div>
      </div>
    `;

    // Upgrade levels container
    const levelsContainer = createElement("div", "upgrade-levels-container");

    partLocations
      .sort((a, b) => {
        const levelA = parseInt(a.level.replace(/\D/g, ""), 10);
        const levelB = parseInt(b.level.replace(/\D/g, ""), 10);
        return levelA - levelB;
      })
      .forEach((item) => {
        const cardId = `${item.statName}_${item.part}_${item.level}_${item.index}`;
        const statState = currentStatState[cardId] || {
          isUnlocked: false,
          level: 0,
        };

        const levelRow = createElement("div", "upgrade-level-row");

        let statusClass = "level-unused";
        let statusText = "미강화";

        if (statState.isUnlocked) {
          if (statState.level === 3) {
            statusClass = "level-complete";
            statusText = "완료";
          } else {
            statusClass = "level-partial";
            statusText = `${statState.level}/3`;
          }
        }

        levelRow.innerHTML = `
          <div class="level-indicator ${statusClass}">
            ${item.level}
          </div>
          <div class="level-details">
            <div class="level-stat-info">
              <div class="level-stat-name">${getDisplayName(
                item.statName
              )}</div>
              <div class="level-stat-value">+${item.maxValue}</div>
            </div>
            <div class="level-status-badge status-${statusClass.replace(
              "level-",
              ""
            )}">
              ${statusText}
            </div>
          </div>
        `;

        levelRow.addEventListener("click", () => {
          onSelectLocation(item.part, item.level);
          // Add visual feedback
          levelRow.style.background = "#dbeafe";
          setTimeout(() => {
            levelRow.style.background = "";
          }, 300);
        });

        levelsContainer.appendChild(levelRow);
      });

    partCard.appendChild(header);
    partCard.appendChild(levelsContainer);
    equipmentGrid.appendChild(partCard);
  });

  container.appendChild(equipmentGrid);
}

function calculatePartUpgradeStatus(partLocations, currentStatState) {
  let upgradedCount = 0;
  let fullyUpgraded = 0;
  let partiallyUpgraded = 0;

  partLocations.forEach((item) => {
    const cardId = `${item.statName}_${item.part}_${item.level}_${item.index}`;
    const statState = currentStatState[cardId] || {
      isUnlocked: false,
      level: 0,
    };

    if (statState.isUnlocked) {
      upgradedCount++;
      if (statState.level === 3) {
        fullyUpgraded++;
      } else {
        partiallyUpgraded++;
      }
    }
  });

  const progressPercentage = Math.round(
    (upgradedCount / partLocations.length) * 100
  );

  return {
    upgradedCount,
    fullyUpgraded,
    partiallyUpgraded,
    progressPercentage,
    totalCount: partLocations.length,
  };
}

function getPartDisplayName(partName) {
  const names = {
    목걸이: "목걸이",
    반지: "반지",
    팔찌: "팔찌",
    벨트: "벨트",
    신발: "신발",
    장갑: "장갑",
  };
  return names[partName] || partName;
}

function calculateCurrentSummary(currentStatState, chakData) {
  const summary = {};

  Object.entries(currentStatState).forEach(([cardId, state]) => {
    if (!state.isUnlocked || state.level === 0) return;

    // Parse cardId to get stat info
    const parts = cardId.split("_");
    if (parts.length < 4) return;

    const statName = parts[0];
    const displayName = getDisplayName(statName);

    // Calculate value based on level (this is a simplified calculation)
    const baseValue = 10; // This should be calculated based on actual data
    const levelMultiplier = state.level / 3;
    const value = Math.round(baseValue * levelMultiplier);

    summary[displayName] = (summary[displayName] || 0) + value;
  });

  return summary;
}

function groupChakStatsByDisplayName(chakData, statsToFind) {
  const results = {};

  chakData.constants.parts.forEach((partId) => {
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

  // Sort results
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
