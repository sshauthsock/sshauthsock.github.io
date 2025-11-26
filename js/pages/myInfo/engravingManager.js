/**
 * 각인 관리 모듈
 * 각인 등록효과 및 장착효과 관리
 */

import { pageState } from "./state.js";
import { ENGRAVING_REGISTRATION_STATS, STATS_CONFIG } from "./constants.js";
import { createElement } from "../../utils.js";
import Logger from "../../utils/logger.js";

/**
 * 각인 항목 생성
 * @param {string} statKey - 스탯 키
 * @param {string} registrationValue - 등록효과 값
 * @param {string} bindValue - 장착효과 값
 * @param {string} type - "registration" 또는 "bind"
 * @param {number|null} registrationIndex - 등록효과 항목의 인덱스
 * @param {Function} onStatSelectChange - 스탯 선택 변경 콜백
 * @param {Function} onRemove - 제거 버튼 클릭 콜백
 * @returns {HTMLElement} 각인 항목 요소
 */
export function createEngravingItem(
  statKey = "",
  registrationValue = "",
  bindValue = "",
  type = "registration",
  registrationIndex = null,
  onStatSelectChange = null,
  onRemove = null
) {
  const item = createElement("div", "my-info-engraving-item");
  item.dataset.type = type;
  if (registrationIndex !== null) {
    item.dataset.registrationIndex = registrationIndex;
  }

  // 스탯 선택 드롭다운
  const statSelect = createElement("select", "my-info-engraving-stat-select");
  statSelect.innerHTML = '<option value="">스탯 선택</option>';
  const statsList =
    type === "registration" ? ENGRAVING_REGISTRATION_STATS : STATS_CONFIG;
  statsList.forEach((stat) => {
    const option = createElement("option");
    option.value = stat.key;
    option.textContent = stat.name;
    if (stat.key === statKey) {
      option.selected = true;
    }
    statSelect.appendChild(option);
  });

  if (type === "registration") {
    // 등록효과: 개별 항목
    const registrationLabel = createElement(
      "span",
      "my-info-engraving-value-label"
    );
    registrationLabel.textContent = "등록:";
    const registrationInput = createElement(
      "input",
      "my-info-engraving-value-input"
    );
    registrationInput.type = "number";
    registrationInput.min = "0";
    registrationInput.value = registrationValue;
    registrationInput.placeholder = "등록";

    // 스탯 선택 변경 시 콜백 호출
    if (onStatSelectChange) {
      statSelect.addEventListener("change", onStatSelectChange);
    }

    item.appendChild(statSelect);
    item.appendChild(registrationLabel);
    item.appendChild(registrationInput);
  } else {
    // 장착효과: 합산값 (스탯은 고정)
    const statName =
      STATS_CONFIG.find((s) => s.key === statKey)?.name || statKey;
    const statLabel = createElement("span", "my-info-engraving-value-label");
    statLabel.textContent = statName;
    statLabel.style.fontWeight = "600";
    statLabel.style.minWidth = "100px";

    // statKey를 data 속성에 저장
    item.dataset.statKey = statKey;

    const bindLabel = createElement("span", "my-info-engraving-value-label");
    bindLabel.textContent = "합산:";
    const bindInput = createElement("input", "my-info-engraving-value-input");
    bindInput.type = "number";
    bindInput.min = "0";
    bindInput.value = bindValue;
    bindInput.placeholder = "합산값";

    item.appendChild(statLabel);
    item.appendChild(bindLabel);
    item.appendChild(bindInput);
  }

  // 제거 버튼 (등록효과에만 표시)
  if (type === "registration" && onRemove) {
    const removeBtn = createElement("button", "my-info-engraving-remove-btn");
    removeBtn.textContent = "×";
    removeBtn.addEventListener("click", () => {
      onRemove(item);
    });
    item.appendChild(removeBtn);
  }

  return item;
}

/**
 * 각인 데이터 가져오기 (기존 데이터 구조 호환성 처리)
 * @param {string} category - 카테고리
 * @param {string} spiritName - 환수 이름
 * @returns {Object} { registrationItems, bindStats }
 */
export function getEngravingData(category, spiritName) {
  const currentEngraving =
    pageState.engravingData[category]?.[spiritName] || {};

  // 기존 데이터 구조 호환성 처리
  let registrationItems = [];
  let bindStats = {};

  // 새로운 데이터 구조 확인 (registration 또는 bind 속성이 있으면)
  if (
    currentEngraving.registration !== undefined ||
    currentEngraving.bind !== undefined
  ) {
    // 새로운 데이터 구조
    registrationItems = Array.isArray(currentEngraving.registration)
      ? currentEngraving.registration
      : [];
    bindStats = currentEngraving.bind || {};
  } else if (Object.keys(currentEngraving).length > 0) {
    // 기존 데이터 구조 변환 (빈 객체가 아닌 경우만)
    Object.entries(currentEngraving).forEach(([statKey, engravingData]) => {
      if (typeof engravingData === "object" && engravingData !== null) {
        // { registration: value, bind: value } 형태
        if (engravingData.registration !== undefined) {
          registrationItems.push({
            statKey: statKey,
            value: engravingData.registration,
          });
        }
        if (engravingData.bind !== undefined) {
          bindStats[statKey] = engravingData.bind;
        }
      } else {
        // 단일 값 형태 (등록효과로 간주)
        registrationItems.push({
          statKey: statKey,
          value: engravingData,
        });
      }
    });
  }

  return { registrationItems, bindStats };
}

/**
 * 각인 모달 표시
 * @param {string} category - 카테고리
 * @param {string} spiritName - 환수 이름
 * @param {Object} spirit - 환수 객체
 * @param {Function} onSave - 저장 콜백
 */
export function showEngravingModal(category, spiritName, spirit, onSave) {
  // 기존 모달 제거
  const existingModal = document.querySelector(".my-info-engraving-modal");
  if (existingModal) {
    existingModal.remove();
  }

  // 현재 각인 데이터 가져오기
  const currentEngraving =
    pageState.engravingData[category]?.[spiritName] || {};

  // 등록효과 개수 확인 (새 데이터 구조)
  const registrationCount = Array.isArray(currentEngraving.registration)
    ? currentEngraving.registration.length
    : 0;

  // 모달 생성
  const modal = createElement("div", "my-info-engraving-modal");
  modal.innerHTML = `
    <div class="kakao-ad-engraving-container">
      <ins class="kakao_ad_area" style="display:none;"
          data-ad-unit="DAN-kZBVsx56qwzvnaxx"
          data-ad-width="728"
          data-ad-height="90"></ins>
    </div>
    <div class="my-info-engraving-modal-content">
      <div class="my-info-engraving-modal-header">
        <div class="my-info-engraving-modal-title">${spiritName} 각인 설정</div>
        <button class="my-info-engraving-modal-close">×</button>
      </div>
      <div class="my-info-engraving-tabs">
        <button class="my-info-engraving-tab active" data-tab="registration">등록효과</button>
        <button class="my-info-engraving-tab" data-tab="bind">장착효과</button>
      </div>
      <div class="my-info-engraving-tab-content active" id="registrationTab">
        <div id="registrationItemsContainer"></div>
        <button class="my-info-engraving-add-btn" id="addEngravingBtn" ${
          registrationCount >= 4 ? "disabled" : ""
        }>
          + 등록효과 추가 (${registrationCount}/4)
        </button>
      </div>
      <div class="my-info-engraving-tab-content" id="bindTab">
        <div id="bindItemsContainer"></div>
      </div>
      <button class="my-info-engraving-save-btn" id="saveEngravingBtn">저장</button>
    </div>
  `;

  document.body.appendChild(modal);

  // 광고 렌더링
  setTimeout(() => {
    try {
      const adElement = modal.querySelector(
        ".kakao-ad-engraving-container .kakao_ad_area"
      );
      if (
        adElement &&
        window.adfit &&
        typeof window.adfit.render === "function"
      ) {
        adElement.style.display = "block";
        window.adfit.render(adElement);
      }
    } catch (error) {
      Logger.error(
        "Kakao AdFit: Error rendering ad in engraving modal:",
        error
      );
    }
  }, 100);

  const registrationContainer = modal.querySelector(
    "#registrationItemsContainer"
  );
  const bindContainer = modal.querySelector("#bindItemsContainer");
  const addBtn = modal.querySelector("#addEngravingBtn");
  const saveBtn = modal.querySelector("#saveEngravingBtn");
  const closeBtn = modal.querySelector(".my-info-engraving-modal-close");
  const tabs = modal.querySelectorAll(".my-info-engraving-tab");
  const tabContents = modal.querySelectorAll(".my-info-engraving-tab-content");

  // 등록효과 탭 렌더링
  function renderRegistrationTab() {
    if (!registrationContainer) return;
    registrationContainer.innerHTML = "";
    const { registrationItems } = getEngravingData(category, spiritName);

    // 등록효과 항목 렌더링 (각 항목을 개별적으로 표시)
    registrationItems.forEach((regItem, index) => {
      const statKey = regItem.statKey || "";
      const value = regItem.value || "";
      const item = createEngravingItem(
        statKey,
        value,
        "",
        "registration",
        index,
        () => renderBindTab(), // 스탯 선택 변경 시 장착효과 탭 업데이트
        (item) => {
          // 제거 버튼 클릭
          item.remove();
          // 제거 후 버튼 상태만 업데이트
          if (addBtn) {
            const newCount = registrationContainer.querySelectorAll(
              '.my-info-engraving-item[data-type="registration"]'
            ).length;
            addBtn.disabled = newCount >= 4;
            addBtn.textContent = `+ 등록효과 추가 (${newCount}/4)`;
          }
          // 장착효과 탭 업데이트
          renderBindTab();
        }
      );
      registrationContainer.appendChild(item);
    });

    // 추가 버튼 상태 업데이트
    if (addBtn) {
      const registrationCount = registrationItems.length;
      addBtn.disabled = registrationCount >= 4;
      addBtn.textContent = `+ 등록효과 추가 (${registrationCount}/4)`;
    }
  }

  // 장착효과 탭 렌더링 (등록효과에 있는 고유한 스탯만 표시)
  function renderBindTab() {
    if (!bindContainer) return;
    bindContainer.innerHTML = "";

    // 등록효과 컨테이너에서 현재 입력된 값들을 가져옴
    const registrationItemsElements = registrationContainer.querySelectorAll(
      '.my-info-engraving-item[data-type="registration"]'
    );

    // 등록효과에서 고유한 스탯 추출 (스탯이 선택된 경우 모두 포함)
    const uniqueStats = new Set();
    registrationItemsElements.forEach((item) => {
      const statSelect = item.querySelector(".my-info-engraving-stat-select");
      const statKey = statSelect?.value || "";

      // 스탯이 선택된 경우 모두 포함 (값은 나중에 입력 가능)
      if (statKey) {
        uniqueStats.add(statKey);
      }
    });

    // 저장된 장착효과 데이터 가져오기
    const { bindStats } = getEngravingData(category, spiritName);

    // 고유한 스탯별로 장착효과 항목 생성
    uniqueStats.forEach((statKey) => {
      const currentValue = bindStats[statKey] || "";
      const item = createEngravingItem(statKey, "", currentValue, "bind");
      bindContainer.appendChild(item);
    });
  }

  // 전체 렌더링
  function renderEngravingItems() {
    renderRegistrationTab();
    renderBindTab();
  }

  // 탭 전환 기능
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab;

      // 탭 활성화
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // 탭 컨텐츠 표시
      tabContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === `${targetTab}Tab`) {
          content.classList.add("active");
        }
      });
    });
  });

  // 초기 렌더링
  renderEngravingItems();

  // 각인 추가 버튼 (등록효과만 추가)
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      // 현재 등록효과 항목 수 확인
      const currentRegistrationItems = registrationContainer.querySelectorAll(
        '.my-info-engraving-item[data-type="registration"]'
      );
      if (currentRegistrationItems.length >= 4) {
        return;
      }
      const item = createEngravingItem(
        "",
        "",
        "",
        "registration",
        null,
        () => renderBindTab(), // 스탯 선택 변경 시 장착효과 탭 업데이트
        (item) => {
          // 제거 버튼 클릭
          item.remove();
          // 제거 후 버튼 상태만 업데이트
          if (addBtn) {
            const newCount = registrationContainer.querySelectorAll(
              '.my-info-engraving-item[data-type="registration"]'
            ).length;
            addBtn.disabled = newCount >= 4;
            addBtn.textContent = `+ 등록효과 추가 (${newCount}/4)`;
          }
          // 장착효과 탭 업데이트
          renderBindTab();
        }
      );
      registrationContainer.appendChild(item);
      // 등록효과 변경 시 장착효과 탭도 업데이트
      renderBindTab();
      // 버튼 상태만 업데이트
      if (addBtn) {
        const newCount = registrationContainer.querySelectorAll(
          '.my-info-engraving-item[data-type="registration"]'
        ).length;
        addBtn.disabled = newCount >= 4;
        addBtn.textContent = `+ 등록효과 추가 (${newCount}/4)`;
      }
    });
  }

  // 저장 버튼
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const registrationItems = []; // 등록효과 배열
      const bindStats = {}; // 장착효과 객체 (스탯별 합산값)

      // 등록효과 항목 수집
      const registrationItemsElements = registrationContainer.querySelectorAll(
        '.my-info-engraving-item[data-type="registration"]'
      );
      registrationItemsElements.forEach((item) => {
        const statSelect = item.querySelector(".my-info-engraving-stat-select");
        const valueInput = item.querySelector(".my-info-engraving-value-input");
        const statKey = statSelect.value;
        const value = parseFloat(valueInput.value) || 0;

        // 스탯이 선택된 경우 값이 0이어도 저장 (나중에 입력할 수 있도록)
        if (statKey) {
          registrationItems.push({
            statKey: statKey,
            value: value,
          });
        }
      });

      // 장착효과 항목 수집
      const bindItemsElements = bindContainer.querySelectorAll(
        '.my-info-engraving-item[data-type="bind"]'
      );
      bindItemsElements.forEach((item) => {
        // statKey를 data 속성에서 가져옴
        const statKey = item.dataset.statKey;
        if (!statKey) return;

        const valueInput = item.querySelector(".my-info-engraving-value-input");
        const value = parseFloat(valueInput.value) || 0;

        // 값이 0이어도 저장 (나중에 입력할 수 있도록)
        bindStats[statKey] = value;
      });

      // 각인 데이터 저장
      const engravingData = {
        registration: registrationItems,
        bind: bindStats,
      };

      if (!pageState.engravingData[category]) {
        pageState.engravingData[category] = {};
      }
      pageState.engravingData[category][spiritName] = engravingData;

      // 초기 로딩 플래그 해제 (사용자가 각인을 변경했으므로 증감 표시)
      pageState.isInitialLoad = false;

      // 캐시 무효화 (각인 변경 시 재계산 필요)
      pageState.lastTotalStatsHash = null;
      pageState.lastTotalStatsCalculation = null;

      // 모달 닫기
      modal.remove();

      // 저장 콜백 호출 (모달 닫은 후 호출)
      if (onSave) {
        onSave(engravingData);
      }
    });
  }

  // 닫기 버튼
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      modal.remove();
    });
  }

  // 외부 클릭 시 닫기
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

