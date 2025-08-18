// js/components/spiritGrid.js

import { createElement } from "../utils.js";
import { INFLUENCE_ROWS } from "../constants.js";
import { checkSpiritStats } from "../utils.js";

function createImageWrapper(spirit, getSpiritState) {
  const state = getSpiritState(spirit);

  const wrapperClasses = ["img-wrapper"];
  if (state.selected) {
    wrapperClasses.push("selected");
  }

  const wrapper = createElement("div", wrapperClasses, {
    "data-spirit-name": spirit.name,
  });

  const imgBox = createElement("div", "img-box");
  wrapper.appendChild(imgBox);

  if (state.selected) {
    const checkMark = createElement("div", "center-check-mark", { text: "✓" });
    imgBox.appendChild(checkMark);
  }

  if (state.registrationCompleted)
    imgBox.classList.add("registration-completed");
  if (state.bondCompleted) imgBox.classList.add("bond-completed");

  const img = createElement("img", "", {
    src: `${spirit.image}`,
    alt: spirit.name,
    loading: "lazy",
  });
  imgBox.appendChild(img);

  if (state.level25BindAvailable) {
    const level25Indicator = createElement("div", "level25-indicator");
    imgBox.appendChild(level25Indicator);
  }

  const nameLabel = createElement("small", "img-name", { text: spirit.name });
  wrapper.appendChild(nameLabel);

  return wrapper;
}

function displayAllPets(spirits, onSpiritClick, getSpiritState) {
  const grid = createElement("div", "image-container-grid");
  spirits.forEach((spirit) => {
    const wrapper = createImageWrapper(spirit, getSpiritState);
    wrapper.addEventListener("click", () => onSpiritClick(spirit)); // 클릭 이벤트 리스너
    grid.appendChild(wrapper);
  });
  return grid;
}

function displayPetsByInfluence(spirits, onSpiritClick, getSpiritState) {
  const container = createElement("div", "image-container-grouped");

  const grouped = spirits.reduce((acc, spirit) => {
    (acc[spirit.influence || "기타"] =
      acc[spirit.influence || "기타"] || []).push(spirit);
    return acc;
  }, {});

  const createInfluenceGroup = (influence, items) => {
    const group = createElement("div", "influence-group");
    const headerWrapper = createElement("div", "header-wrapper");

    const header = createElement("h3", "influence-header", {
      text: `${influence} (${items.length})`,
    });
    headerWrapper.appendChild(header);
    group.appendChild(headerWrapper);

    const itemsWrapper = createElement("div", "influence-items");
    items.forEach((item) => {
      const wrapper = createImageWrapper(item, getSpiritState);
      wrapper.addEventListener("click", () => onSpiritClick(item));
      itemsWrapper.appendChild(wrapper);
    });
    group.appendChild(itemsWrapper);
    return group;
  };

  const processed = new Set();
  INFLUENCE_ROWS.forEach((rowInfluences) => {
    const rowEl = createElement("div", "influence-row");
    let hasContent = false;
    rowInfluences.forEach((inf) => {
      if (grouped[inf]) {
        rowEl.appendChild(createInfluenceGroup(inf, grouped[inf]));
        processed.add(inf);
        hasContent = true;
      }
    });
    if (hasContent) container.appendChild(rowEl);
  });

  const others = Object.keys(grouped)
    .filter((inf) => !processed.has(inf))
    .sort();
  if (others.length > 0) {
    const otherRow = createElement("div", "influence-row");
    others.forEach((inf) =>
      otherRow.appendChild(createInfluenceGroup(inf, grouped[inf]))
    );
    container.appendChild(otherRow);
  }
  return container;
}

export function renderSpiritGrid({
  container,
  spirits,
  onSpiritClick,
  getSpiritState,
  groupByInfluence,
}) {
  container.innerHTML = "";

  if (spirits.length === 0) {
    container.innerHTML = `<p class="empty-state-message">조건에 맞는 환수가 없습니다.</p>`;
    return;
  }

  let gridElement;
  if (groupByInfluence) {
    gridElement = displayPetsByInfluence(
      spirits,
      onSpiritClick,
      getSpiritState
    );
  } else {
    gridElement = displayAllPets(spirits, onSpiritClick, getSpiritState);
  }
  container.appendChild(gridElement);
}
