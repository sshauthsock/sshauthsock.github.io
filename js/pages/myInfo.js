import { state as globalState } from "../state.js";
import { createElement, debounce } from "../utils.js";
import { renderSpiritGrid } from "../components/spritGrid.js";
import * as api from "../api.js";
import { isFixedLevelSpirit } from "../constants.js";
import Logger from "../utils/logger.js";

const pageState = {
  currentCategory: "수호", // 오른쪽 그리드에서 보여줄 카테고리
  // 결속 환수: 각 카테고리별 최대 6개
  bondSpirits: {
    수호: [], // [{ name, level, ...spirit }]
    탑승: [],
    변신: [],
  },
  // 사용 중인 환수: 각 카테고리별 1개
  activeSpirits: {
    수호: null, // { name, level, ...spirit }
    탑승: null,
    변신: null,
  },
  userStats: {}, // 사용자 기본 스탯
  baselineStats: {}, // 저장된 기준 스탯 (합산 결과)
  expTable: null, // 경험치 테이블 (캐시)
  lastSoulExpCalculation: null, // 마지막 경험치 계산 결과 (캐시)
  lastSoulExpHash: null, // 마지막 계산 시 사용된 데이터 해시
  bondCalculationCache: new Map(), // 결속 계산 결과 캐시
  lastTotalStatsCalculation: null, // 마지막 합산 스탯 계산 결과 (캐시)
  lastTotalStatsHash: null, // 마지막 합산 스탯 계산 시 사용된 데이터 해시
  savedSoulExp: 0, // 저장된 기준 총 환수혼 경험치
  recentlyEditedStats: new Set(), // 방금 편집한 스탯 목록 (updateTotalStats에서 업데이트하지 않도록)
  isSavingBaseline: false, // 기준값 저장 중 플래그
};

const elements = {};

// 스탯 정의
const STATS_CONFIG = [
  // 1컬럼
  { key: "damageResistancePenetration", name: "피해저항관통" },
  { key: "damageResistance", name: "피해저항" },
  { key: "pvpDamagePercent", name: "대인피해%" },
  { key: "pvpDefensePercent", name: "대인방어%" },
  { key: "pvpDamage", name: "대인피해" },
  { key: "pvpDefense", name: "대인방어" },
  { key: "statusEffectAccuracy", name: "상태이상적중" },
  { key: "statusEffectResistance", name: "상태이상저항" },
  // 2컬럼
  { key: "normalMonsterPenetration", name: "일반몬스터 관통" },
  { key: "normalMonsterAdditionalDamage", name: "일반몬스터 추가피해" },
  { key: "bossMonsterPenetration", name: "보스몬스터 관통" },
  { key: "bossMonsterAdditionalDamage", name: "보스몬스터 추가피해" },
  { key: "criticalPowerPercent", name: "치명위력%" },
  { key: "criticalChance", name: "치명확률%" },
  { key: "power", name: "위력" },
  { key: "movementSpeed", name: "이동속도" },
  // 3컬럼
  { key: "damageAbsorption", name: "피해흡수" },
  { key: "criticalResistance", name: "치명저항" },
  { key: "criticalDamageResistance", name: "치명피해저항" },
  { key: "experienceGainIncrease", name: "경험치 획득증가" },
  { key: "normalMonsterResistance", name: "일반몬스터 저항" },
  { key: "bossMonsterResistance", name: "보스몬스터 저항" },
];

const COLUMN_1_STATS = STATS_CONFIG.slice(0, 8);
const COLUMN_2_STATS = STATS_CONFIG.slice(8, 16);
const COLUMN_3_STATS = STATS_CONFIG.slice(16);

function getHTML() {
  return `
    <style>
      .my-info-container {
        max-width: 1600px;
        margin: 0 auto;
        padding: var(--space-md) var(--space-lg);
      }

      .my-info-top-section {
        display: flex;
        gap: var(--space-md);
        margin-bottom: var(--space-lg);
        height: 50vh;
        min-height: 500px;
      }

      .my-info-spirit-section-wrapper {
        flex: 0 0 45%;
        min-width: 0;
        display: flex;
        gap: var(--space-sm);
        overflow: hidden;
      }

      .my-info-stats-section-wrapper {
        flex: 0 0 55%;
        min-width: 0;
        overflow: visible;
      }

      .my-info-left-panel {
        flex: 0 0 38%;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
        overflow-y: auto;
      }

      .my-info-right-panel {
        flex: 0 0 62%;
        min-width: 0;
        overflow-y: auto;
      }

      .my-info-stats-section {
        background: var(--bg-white);
        border-radius: var(--radius-md);
        padding: var(--space-lg);
        box-shadow: var(--shadow-md);
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .my-info-key-stats-section {
        margin-top: var(--space-md);
        padding-top: var(--space-md);
        border-top: 1px solid var(--border-light);
        flex-shrink: 0;
      }

      .my-info-key-stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-sm);
        margin-top: var(--space-sm);
      }

      .my-info-key-stat-item {
        display: flex;
        flex-direction: column;
        padding: var(--space-sm);
        background: var(--bg-gray);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-light);
      }

      .my-info-key-stat-label {
        font-size: 11px;
        color: var(--text-secondary);
        margin-bottom: 4px;
        font-weight: 500;
      }

      .my-info-key-stat-value-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-sm);
      }

      .my-info-key-stat-value {
        font-size: 18px;
        font-weight: 700;
        color: var(--text-primary);
      }

      .my-info-key-stat-change {
        font-size: 12px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
        white-space: nowrap;
      }

      .my-info-key-stat-change.positive {
        color: var(--color-secondary, #4CAF50);
        background: rgba(76, 175, 80, 0.1);
      }

      .my-info-key-stat-change.negative {
        color: var(--color-danger, #e74c3c);
        background: rgba(231, 76, 60, 0.1);
      }

      .my-info-key-stat-change.neutral {
        color: var(--text-secondary);
      }

      .my-info-section-title {
        font-size: 12px;
        font-weight: 600;
        margin-bottom: var(--space-sm);
        color: var(--text-primary);
        border-bottom: 1px solid var(--color-primary);
        padding-bottom: 4px;
      }

      .my-info-save-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 6px 14px;
        font-size: 12px;
        font-weight: 600;
        color: white;
        background: var(--color-primary);
        border: none;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        gap: 4px;
      }

      .my-info-save-btn:hover {
        background: var(--color-primary-dark, #2563eb);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .my-info-save-btn:active {
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .my-info-info-btn {
        width: 24px;
        height: 24px;
        border-radius: 6px;
        border: none;
        background: transparent;
        color: var(--color-primary);
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .my-info-info-btn:hover {
        background: var(--bg-gray, #f5f5f5);
        color: var(--color-primary);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      .my-info-info-btn:active {
        transform: translateY(0);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
      }

      .my-info-stats-list {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 6px;
        margin-top: var(--space-sm);
        width: 100%;
        align-items: start;
      }

      .my-info-stats-column {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .my-info-stat-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        cursor: pointer;
        padding: 6px 8px;
        background-color: var(--bg-white);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        transition: var(--transition-normal);
        min-width: 0;
        position: relative;
      }

      .my-info-stat-item:hover {
        background-color: var(--bg-gray);
        border-color: var(--color-primary);
      }

      .my-info-stat-item.editing {
        background-color: var(--color-primary-light);
        border-color: var(--color-primary);
      }

      .my-info-stat-name {
        font-size: 11px;
        font-weight: 500;
        color: var(--text-secondary);
        white-space: nowrap;
      }

      .my-info-stat-value {
        font-size: 11px;
        font-weight: 600;
        color: var(--text-primary);
        min-width: 50px;
        text-align: right;
        display: flex;
        align-items: center;
        gap: 3px;
      }

      .my-info-stat-total {
        font-weight: 700;
        color: var(--text-primary);
      }

      .my-info-stat-change {
        font-size: 11px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
      }

      .my-info-stat-change.positive {
        color: #4CAF50;
        background: rgba(76, 175, 80, 0.15);
        font-weight: 700;
      }

      .my-info-stat-change.negative {
        color: #e74c3c;
        background: rgba(231, 76, 60, 0.15);
        font-weight: 700;
      }

      .my-info-stat-change.neutral {
        color: var(--text-secondary, #666);
        background: rgba(128, 128, 128, 0.1);
      }

      .my-info-stat-item input.my-info-stat-input {
        width: 80px;
        padding: 4px 8px;
        border: 2px solid var(--color-primary);
        border-radius: 4px;
        font-size: 14px;
        font-weight: 600;
        background-color: var(--bg-white);
        outline: none;
        text-align: center;
      }

      .my-info-category-card {
        background: var(--bg-white);
        border-radius: var(--radius-md);
        padding: 2px;
        box-shadow: var(--shadow-md);
        flex: 1;
        min-height: 0;
        max-height: 100%;
        display: flex;
        flex-direction: column;
      }

      .my-info-category-title {
        font-size: 11px;
        font-weight: 600;
        margin-bottom: 1px;
        margin-top: 0;
        color: var(--text-primary);
        border-bottom: 1px solid var(--color-primary);
        padding-bottom: 1px;
        padding-top: 2px;
      }

      .my-info-bond-slots {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 1px;
        margin-bottom: 0;
        flex: 1;
        min-height: 0;
        padding: 0;
      }

      .my-info-bond-slot {
        aspect-ratio: 1;
        border: 1px dashed var(--border-light);
        border-radius: 3px;
        background: var(--bg-gray);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: var(--transition-normal);
        position: relative;
        overflow: hidden;
        min-width: 0;
        max-width: 100%;
        max-height: 100%;
        transform: scale(0.9);
      }

      .my-info-bond-slot.highlight {
        border: 2px solid var(--color-secondary, #4CAF50);
        background: rgba(76, 175, 80, 0.2);
        animation: pulse 0.5s ease-in-out;
        box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      .my-info-bond-slot:hover {
        border-color: var(--color-primary);
        background: var(--color-primary-light);
      }

      .my-info-bond-slot.filled {
        border: 1px solid var(--color-primary);
        border-style: solid;
      }

      .my-info-bond-slot.filled.used-spirit {
        border: 2px solid var(--color-secondary, #4CAF50);
        box-shadow: 0 0 8px rgba(76, 175, 80, 0.6);
        position: relative;
      }

      .my-info-bond-slot.filled.used-spirit::after {
        content: "사용중";
        position: absolute;
        top: 2px;
        left: 2px;
        background: var(--color-secondary, #4CAF50);
        color: white;
        font-size: 8px;
        font-weight: 600;
        padding: 1px 3px;
        border-radius: 2px;
        z-index: 5;
      }

      .my-info-bond-slot img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        pointer-events: none;
      }

      /* 환수 그리드 이미지 크기 축소 및 여백 제거 */
      #myInfoSpiritGrid {
        padding: 0 !important;
        margin: 0 !important;
      }

      #myInfoSpiritGrid .image-container-grid {
        gap: 2px !important;
        padding: 2px !important;
        margin: 0 !important;
        box-shadow: none !important;
        border-radius: 0 !important;
      }

      #myInfoSpiritGrid .img-wrapper {
        transform: scale(0.85);
        padding: 0 !important;
        margin: 0 !important;
        border: none !important;
      }

      #myInfoSpiritGrid .img-box {
        transform: scale(0.85);
        padding: 0 !important;
        margin: 0 !important;
      }

      #myInfoSpiritGrid .img-wrapper img {
        padding: 1px !important;
        border: 1px solid var(--border-light) !important;
        margin: 0 !important;
      }

      #myInfoSpiritGrid .img-name {
        font-size: 8px !important;
        min-height: 12px !important;
        padding: 0 1px !important;
        margin: 0 !important;
        line-height: 1 !important;
      }


      .my-info-spirit-section {
        background: var(--bg-white);
        border-radius: var(--radius-md);
        padding: var(--space-md);
        box-shadow: var(--shadow-md);
      }

      .my-info-spirit-tabs {
        display: flex;
        gap: 6px;
        margin-bottom: var(--space-md);
        border-bottom: 1px solid var(--border-light);
      }

      .my-info-spirit-tab {
        padding: 6px 12px;
        font-size: 11px;
        cursor: pointer;
        border: none;
        background: transparent;
        font-weight: 500;
        color: var(--text-secondary);
        border-bottom: 2px solid transparent;
        transition: var(--transition-normal);
      }

      .my-info-spirit-tab:hover {
        color: var(--color-primary);
        background-color: var(--bg-gray);
      }

      .my-info-spirit-tab.active {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
        font-weight: 600;
      }

      .my-info-spirit-popup {
        position: fixed;
        z-index: 1000;
        background: var(--bg-white);
        border: 2px solid var(--color-primary);
        border-radius: var(--radius-md);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: var(--space-md);
        min-width: 200px;
        max-width: 300px;
      }

      .my-info-spirit-popup::before {
        content: '';
        position: absolute;
        top: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 8px solid var(--color-primary);
      }

      .my-info-spirit-popup-header {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-bottom: var(--space-sm);
        padding-bottom: var(--space-sm);
        border-bottom: 1px solid var(--border-light);
      }

      .my-info-spirit-popup-header img {
        width: 40px;
        height: 40px;
        object-fit: contain;
        border-radius: 4px;
        border: 1px solid var(--border-light);
      }

      .my-info-spirit-popup-name {
        font-weight: 600;
        font-size: 14px;
        color: var(--text-primary);
        flex: 1;
      }

      .my-info-spirit-popup-level {
        margin-top: var(--space-sm);
        margin-bottom: var(--space-sm);
      }

      .my-info-spirit-popup-actions {
        display: flex;
        gap: 4px;
        margin-top: var(--space-sm);
      }

      .my-info-spirit-popup-action-btn {
        flex: 1;
        padding: 4px 8px;
        font-size: 11px;
        border-radius: 4px;
        border: 1px solid var(--border-medium);
        cursor: pointer;
        transition: var(--transition-normal);
        white-space: nowrap;
      }

      .my-info-spirit-popup-action-btn.active {
        background: var(--color-secondary, #4CAF50);
        color: white;
        border-color: var(--color-secondary, #4CAF50);
      }

      .my-info-spirit-popup-action-btn.remove {
        background: var(--color-danger, #e74c3c);
        color: white;
        border-color: var(--color-danger, #e74c3c);
      }

      .my-info-spirit-popup-action-btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
      }

      .my-info-spirit-popup-close {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 20px;
        height: 20px;
        background: var(--color-danger);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }

      .my-info-soul-exp-info {
        display: flex;
        gap: var(--space-lg);
        margin-top: var(--space-md);
        flex-wrap: wrap;
      }

      .my-info-soul-exp-item {
        flex: 1;
        min-width: 200px;
        background: var(--bg-gray);
        padding: var(--space-md);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-light);
      }

      .my-info-soul-exp-label {
        font-size: 12px;
        color: var(--text-secondary);
        margin-bottom: 4px;
      }

      .my-info-soul-exp-value {
        font-size: 16px;
        font-weight: 700;
        color: var(--text-primary);
      }

      .my-info-selected-spirits {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid var(--border-light);
      }

      .my-info-selected-spirits h3 {
        font-size: 16px;
        margin-bottom: 10px;
        color: var(--text-primary);
      }

      .my-info-selected-spirits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
      }

      .my-info-selected-spirit-card {
        padding: 10px;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        background: var(--bg-gray);
      }

      .my-info-selected-spirit-name {
        font-weight: 600;
        margin-bottom: 5px;
        color: var(--text-primary);
      }

      .my-info-spirit-level-select {
        width: 100%;
        padding: 4px;
        border: 1px solid var(--border-medium);
        border-radius: 4px;
        background-color: var(--bg-white);
        font-size: 14px;
      }

      .my-info-remove-spirit {
        margin-top: 5px;
        width: 100%;
        padding: 4px;
        background: var(--color-danger);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: var(--transition-normal);
      }

      .my-info-remove-spirit:hover {
        background: var(--color-danger-dark);
      }

      @media (max-width: 768px) {
        .my-info-top-section {
          flex-direction: column;
          height: auto;
          min-height: auto;
        }

        .my-info-spirit-section-wrapper {
          flex-direction: column;
        }

        .my-info-stats-list {
          grid-template-columns: 1fr;
        }

        .my-info-stats-column {
          width: 100%;
        }

        .my-info-total-stats-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>

    <div class="my-info-container">
    <div class="my-info-top-section">
      <!-- 왼쪽: 환수 섹션 (50%) -->
      <div class="my-info-spirit-section-wrapper">
        <!-- 왼쪽: 수호/탑승/변신 카드 (40%) -->
        <div class="my-info-left-panel">
          <!-- 수호 카드 -->
          <div class="my-info-category-card" data-category="수호">
            <h2 class="my-info-category-title">수호</h2>
            <div class="my-info-bond-slots" id="bondSlots수호"></div>
          </div>

          <!-- 탑승 카드 -->
          <div class="my-info-category-card" data-category="탑승">
            <h2 class="my-info-category-title">탑승</h2>
            <div class="my-info-bond-slots" id="bondSlots탑승"></div>
          </div>

          <!-- 변신 카드 -->
          <div class="my-info-category-card" data-category="변신">
            <h2 class="my-info-category-title">변신</h2>
            <div class="my-info-bond-slots" id="bondSlots변신"></div>
          </div>
        </div>

        <!-- 오른쪽: 전체 환수 선택 그리드 (60%) -->
        <div class="my-info-right-panel">
          <div class="my-info-spirit-section">
            <div class="my-info-spirit-tabs">
              <button class="my-info-spirit-tab active" data-category="수호">수호</button>
              <button class="my-info-spirit-tab" data-category="탑승">탑승</button>
              <button class="my-info-spirit-tab" data-category="변신">변신</button>
            </div>
            <div id="myInfoSpiritGrid"></div>
          </div>
        </div>
      </div>

      <!-- 오른쪽: 기본 스탯 섹션 (50%) -->
      <div class="my-info-stats-section-wrapper">
        <div class="my-info-stats-section">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm);">
            <h2 class="my-info-section-title" style="margin: 0;">나의 스탯</h2>
            <div style="display: flex; align-items: center; gap: 8px; position: relative;">
              <button id="saveBaselineBtn" class="my-info-save-btn">
                <span>저장</span>
              </button>
              <button id="saveInfoBtn" class="my-info-info-btn">ℹ️</button>
              <div id="saveInfoTooltip" class="my-info-info-tooltip" style="
                display: none;
                position: absolute;
                top: 100%;
                right: 0;
                margin-top: 4px;
                background: var(--bg-white, #fff);
                border: 1px solid var(--border-light, #ddd);
                border-radius: 6px;
                padding: 8px 12px;
                font-size: 11px;
                color: var(--text-primary, #333);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                max-width: 250px;
                line-height: 1.4;
                white-space: normal;
              ">
                저장 시 현재 스탯이 기준이 되며, 이후 변경사항을 확인할 수 있습니다.
              </div>
            </div>
          </div>
          <div class="my-info-stats-list">
            <!-- 1컬럼 -->
            <div class="my-info-stats-column" id="statsColumn1"></div>
            <!-- 2컬럼 -->
            <div class="my-info-stats-column" id="statsColumn2"></div>
            <!-- 3컬럼 -->
            <div class="my-info-stats-column" id="statsColumn3"></div>
          </div>
          
          <!-- 주요 스탯 변화 섹션 -->
          <div class="my-info-key-stats-section">
            <div class="my-info-key-stats-grid" id="keyStatsGrid">
              <div class="my-info-key-stat-item">
                <div class="my-info-key-stat-label">환산타채 합</div>
                <div class="my-info-key-stat-value-wrapper">
                  <div class="my-info-key-stat-value" id="keyStatTachae">-</div>
                  <div class="my-info-key-stat-change" id="keyStatTachaeChange">-</div>
                </div>
              </div>
              <div class="my-info-key-stat-item">
                <div class="my-info-key-stat-label">상태이상저항</div>
                <div class="my-info-key-stat-value-wrapper">
                  <div class="my-info-key-stat-value" id="keyStatResistance">-</div>
                  <div class="my-info-key-stat-change" id="keyStatResistanceChange">-</div>
                </div>
              </div>
              <div class="my-info-key-stat-item">
                <div class="my-info-key-stat-label">상태이상적중</div>
                <div class="my-info-key-stat-value-wrapper">
                  <div class="my-info-key-stat-value" id="keyStatAccuracy">-</div>
                  <div class="my-info-key-stat-change" id="keyStatAccuracyChange">-</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 환수 혼 경험치 섹션 -->
    <div class="my-info-stats-section">
      <h2 class="my-info-section-title">환수 초기화 시 환수 혼 경험치</h2>
      <div id="soulExpInfo"></div>
    </div>
    </div>
  `;
}

function renderStats() {
  const column1 = elements.statsColumn1;
  const column2 = elements.statsColumn2;
  const column3 = elements.statsColumn3;

  column1.innerHTML = "";
  column2.innerHTML = "";
  column3.innerHTML = "";

  COLUMN_1_STATS.forEach((stat) => {
    const item = createStatItem(stat);
    column1.appendChild(item);
  });

  COLUMN_2_STATS.forEach((stat) => {
    const item = createStatItem(stat);
    column2.appendChild(item);
  });

  COLUMN_3_STATS.forEach((stat) => {
    const item = createStatItem(stat);
    column3.appendChild(item);
  });
}

function createStatItem(stat) {
  const item = createElement("div", "my-info-stat-item");
  item.dataset.stat = stat.key;

  const name = createElement("span", "my-info-stat-name");
  name.textContent = stat.name;

  const valueContainer = createElement("span", "my-info-stat-value");

  // 기본값은 숨김 (더블클릭 편집용으로만 사용)
  const baseValue = createElement("span", "my-info-stat-base");
  baseValue.textContent = pageState.userStats[stat.key] || "0";
  baseValue.style.display = "none";

  // 합산값을 메인으로 표시
  const totalValue = createElement("span", "my-info-stat-total");
  totalValue.textContent = "0";

  // 증감 표시
  const changeValue = createElement("span", "my-info-stat-change");
  changeValue.style.display = "none";

  valueContainer.appendChild(totalValue);
  valueContainer.appendChild(changeValue);

  item.appendChild(name);
  item.appendChild(valueContainer);

  // 클릭 한 번으로 수정
  item.addEventListener("click", (e) => {
    // 증감 표시 클릭은 무시
    if (e.target.classList.contains("my-info-stat-change")) {
      return;
    }
    // 이미 편집 중이면 무시
    if (item.classList.contains("editing")) {
      return;
    }
    // input 클릭은 무시
    if (e.target.classList.contains("my-info-stat-input")) {
      return;
    }
    // 클릭 한 번으로 편집 시작
    handleStatEdit(item, stat.key, baseValue);
  });

  return item;
}

function handleStatEdit(item, statKey, valueSpan) {
  // 현재 총합값 계산 (기본값 + 결속값 + 활성값)
  const currentBaseValue = pageState.userStats[statKey] || 0;
  let currentBondValue = 0;
  let currentActiveValue = 0;

  if (pageState.lastTotalStatsCalculation) {
    currentBondValue =
      pageState.lastTotalStatsCalculation.allBondStats[statKey] || 0;
    currentActiveValue =
      pageState.lastTotalStatsCalculation.allActiveStats[statKey] || 0;
  }

  const currentTotalValue =
    currentBaseValue + currentBondValue + currentActiveValue;

  item.classList.add("editing");
  const input = createElement("input", "my-info-stat-input");
  input.type = "number";
  input.value = currentTotalValue; // 총합값을 입력 필드에 표시
  input.step = "1";
  input.min = "0";

  // totalValue와 changeValue는 숨기지 않고 input과 함께 표시
  const valueContainer = item.querySelector(".my-info-stat-value");
  const totalValueSpan = item.querySelector(".my-info-stat-total");
  const changeValueSpan = item.querySelector(".my-info-stat-change");

  // input을 totalValueSpan 앞에 삽입 (값이 실시간으로 보이도록)
  if (totalValueSpan && totalValueSpan.parentNode) {
    totalValueSpan.parentNode.insertBefore(input, totalValueSpan);
  } else {
    valueContainer.appendChild(input);
  }

  // input 스타일 조정 (인라인으로 표시)
  input.style.display = "inline-block";
  input.style.width = "80px";
  input.style.marginRight = "4px";

  // totalValueSpan과 changeValueSpan은 계속 표시 (값이 실시간으로 업데이트됨)
  if (totalValueSpan) {
    totalValueSpan.style.display = "inline";
  }
  if (changeValueSpan) {
    changeValueSpan.style.display = "inline";
  }

  input.focus();
  input.select();

  let isFinishing = false; // 중복 호출 방지 플래그

  // 입력값이 변경될 때마다 즉시 반영
  const updateValueInRealTime = () => {
    // 사용자가 입력한 값 = 총합값
    const inputTotalValue = parseFloat(input.value) || 0;

    // 현재 캐시된 결속/활성 스탯 가져오기
    let bondValue = 0;
    let activeValue = 0;

    if (pageState.lastTotalStatsCalculation) {
      bondValue =
        pageState.lastTotalStatsCalculation.allBondStats[statKey] || 0;
      activeValue =
        pageState.lastTotalStatsCalculation.allActiveStats[statKey] || 0;
    } else {
      // 캐시가 없으면 간단히 활성 스탯만 계산
      const categories = ["수호", "탑승", "변신"];
      for (const category of categories) {
        const active = pageState.activeSpirits[category];
        if (active) {
          const spirit = getSpiritsForCategory(category).find(
            (s) => s.name === active.name
          );
          if (spirit) {
            const levelStat = spirit.stats?.find(
              (s) => s.level === active.level
            );
            if (
              levelStat?.registrationStat &&
              levelStat.registrationStat[statKey]
            ) {
              const numValue =
                typeof levelStat.registrationStat[statKey] === "number"
                  ? levelStat.registrationStat[statKey]
                  : parseFloat(levelStat.registrationStat[statKey]) || 0;
              activeValue += numValue;
            }
          }
        }
      }
    }

    // 사용자가 입력한 값이 총합값이므로 그대로 사용
    const totalValue = inputTotalValue;

    // 기준값 가져오기
    const baselineValue = pageState.baselineStats.hasOwnProperty(statKey)
      ? pageState.baselineStats[statKey]
      : totalValue;

    // 증감값 계산
    const changeValue = totalValue - baselineValue;

    // totalValueSpan 업데이트 (즉시 반영, 편집 중에도 표시됨)
    if (totalValueSpan) {
      const formattedValue = Math.round(totalValue).toLocaleString();
      totalValueSpan.textContent = formattedValue;
      totalValueSpan.style.display = "inline";
      totalValueSpan.style.visibility = "visible";
    }

    // changeValueSpan 업데이트 (편집 중에도 표시됨)
    if (changeValueSpan) {
      const absChangeValue = Math.abs(changeValue);
      if (absChangeValue > 0.01) {
        const roundedChange = Math.round(changeValue);
        changeValueSpan.textContent = `(${
          roundedChange > 0 ? "+" : ""
        }${roundedChange.toLocaleString()})`;
        changeValueSpan.className = `my-info-stat-change ${
          changeValue > 0 ? "positive" : "negative"
        }`;
        changeValueSpan.style.display = "inline";
        changeValueSpan.style.visibility = "visible";
        // 인라인 스타일 제거 (CSS 클래스가 적용되도록)
        changeValueSpan.style.color = "";
        changeValueSpan.style.background = "";
      } else {
        changeValueSpan.textContent = "(0)";
        changeValueSpan.className = "my-info-stat-change neutral";
        changeValueSpan.style.display = "inline";
        changeValueSpan.style.visibility = "visible";
        // 인라인 스타일 제거 (CSS 클래스가 적용되도록)
        changeValueSpan.style.color = "";
        changeValueSpan.style.background = "";
      }
    }
  };

  // input 이벤트 리스너 추가 (입력값이 변경될 때마다 즉시 반영)
  input.addEventListener("input", updateValueInRealTime);

  // 초기값도 즉시 반영
  updateValueInRealTime();

  const finishEdit = () => {
    // 이미 처리 중이면 무시
    if (isFinishing) {
      return;
    }
    isFinishing = true;

    // input.value를 먼저 읽어서 저장 (input 제거 전에)
    const inputTotalValue = parseFloat(input.value) || 0; // 사용자가 입력한 값 = 총합값

    // input 제거 (계산 전에 제거)
    if (input.parentNode) {
      input.remove();
    }

    // 현재 캐시된 결속/활성 스탯 가져오기
    let bondValue = 0;
    let activeValue = 0;

    if (pageState.lastTotalStatsCalculation) {
      bondValue =
        pageState.lastTotalStatsCalculation.allBondStats[statKey] || 0;
      activeValue =
        pageState.lastTotalStatsCalculation.allActiveStats[statKey] || 0;
    } else {
      // 캐시가 없으면 간단히 활성 스탯만 계산
      const categories = ["수호", "탑승", "변신"];
      for (const category of categories) {
        const active = pageState.activeSpirits[category];
        if (active) {
          const spirit = getSpiritsForCategory(category).find(
            (s) => s.name === active.name
          );
          if (spirit) {
            const levelStat = spirit.stats?.find(
              (s) => s.level === active.level
            );
            if (
              levelStat?.registrationStat &&
              levelStat.registrationStat[statKey]
            ) {
              const numValue =
                typeof levelStat.registrationStat[statKey] === "number"
                  ? levelStat.registrationStat[statKey]
                  : parseFloat(levelStat.registrationStat[statKey]) || 0;
              activeValue += numValue;
            }
          }
        }
      }
    }

    // 사용자가 입력한 값이 총합값이므로, 기본값을 역산
    const newBaseValue = inputTotalValue - bondValue - activeValue;

    // userStats에 기본값 저장
    pageState.userStats[statKey] = Math.max(0, newBaseValue); // 음수 방지
    saveUserStats();

    // baseValue 업데이트 (기본값으로 저장)
    valueSpan.textContent = Math.max(0, newBaseValue).toString();

    // 총합값은 사용자가 입력한 값 그대로 사용
    const totalValue = inputTotalValue;

    // 기준값 가져오기
    const baselineValue = pageState.baselineStats.hasOwnProperty(statKey)
      ? pageState.baselineStats[statKey]
      : totalValue;

    // 증감값 계산
    const changeValue = totalValue - baselineValue;

    // totalValueSpan 업데이트 (강제로 직접 설정)
    if (totalValueSpan) {
      const formattedValue = Math.round(totalValue).toLocaleString();

      // 여러 방법으로 강제 업데이트
      totalValueSpan.textContent = formattedValue;
      totalValueSpan.innerText = formattedValue;
      totalValueSpan.style.display = "inline";
      totalValueSpan.style.visibility = "visible";

      // 데이터 속성에 저장 (보호 플래그)
      const editTimestamp = Date.now();
      totalValueSpan.dataset.lastEditedValue = formattedValue;
      totalValueSpan.dataset.lastEditedTime = editTimestamp.toString();
      totalValueSpan.dataset.isManuallyEdited = "true";

      // 디버깅 로그
      console.log(`[${statKey}] finishEdit - 값 업데이트:`, {
        입력한_총합값: inputTotalValue,
        계산된_기본값: newBaseValue,
        bondValue,
        activeValue,
        totalValue,
        formattedValue,
        실제_DOM_값: totalValueSpan.textContent,
      });
    }

    // changeValueSpan 업데이트
    if (changeValueSpan) {
      const absChangeValue = Math.abs(changeValue);
      if (absChangeValue > 0.01) {
        const roundedChange = Math.round(changeValue);
        changeValueSpan.textContent = `(${
          roundedChange > 0 ? "+" : ""
        }${roundedChange.toLocaleString()})`;
        changeValueSpan.className = `my-info-stat-change ${
          changeValue > 0 ? "positive" : "negative"
        }`;
        changeValueSpan.style.display = "inline";
        changeValueSpan.style.visibility = "visible";
        // 인라인 스타일 제거 (CSS 클래스가 적용되도록)
        changeValueSpan.style.color = "";
        changeValueSpan.style.background = "";
      } else {
        changeValueSpan.textContent = "(0)";
        changeValueSpan.className = "my-info-stat-change neutral";
        changeValueSpan.style.display = "inline";
        changeValueSpan.style.visibility = "visible";
      }
    }

    item.classList.remove("editing");

    // 방금 편집한 스탯을 플래그에 추가 (updateTotalStats에서 업데이트하지 않도록)
    // 일정 시간 후 자동으로 제거하여 이후 업데이트가 가능하도록 함
    pageState.recentlyEditedStats.add(statKey);
    setTimeout(() => {
      pageState.recentlyEditedStats.delete(statKey);
    }, 500); // 500ms 후 자동 제거

    // 주요 스탯만 업데이트 (전체 스탯 리스트는 업데이트하지 않음)
    if (pageState.lastTotalStatsCalculation) {
      const calc = pageState.lastTotalStatsCalculation;
      updateKeyStats(STATS_CONFIG, calc.allBondStats, calc.allActiveStats);
    } else {
      // 캐시가 없으면 최소한의 계산만 수행
      const categories = ["수호", "탑승", "변신"];
      const allBondStats = {};
      const allActiveStats = {};

      // 활성 스탯만 간단히 계산
      for (const category of categories) {
        const active = pageState.activeSpirits[category];
        if (active) {
          const spirit = getSpiritsForCategory(category).find(
            (s) => s.name === active.name
          );
          if (spirit) {
            const levelStat = spirit.stats?.find(
              (s) => s.level === active.level
            );
            if (levelStat?.registrationStat) {
              Object.entries(levelStat.registrationStat).forEach(
                ([key, value]) => {
                  const numValue =
                    typeof value === "number" ? value : parseFloat(value) || 0;
                  allActiveStats[key] = (allActiveStats[key] || 0) + numValue;
                }
              );
            }
          }
        }
      }

      // 주요 스탯만 업데이트
      updateKeyStats(STATS_CONFIG, allBondStats, allActiveStats);
    }
  };

  input.addEventListener("blur", finishEdit);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      finishEdit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      // Escape 키는 편집 취소
      if (input.parentNode) {
        input.remove();
      }
      if (totalValueSpan) {
        totalValueSpan.style.display = "inline";
      }
      if (changeValueSpan) {
        changeValueSpan.style.display = "inline";
      }
      item.classList.remove("editing");
    }
  });
}

function loadUserStats() {
  const saved = localStorage.getItem("myInfo_userStats");
  if (saved) {
    try {
      pageState.userStats = JSON.parse(saved);
    } catch (e) {
      Logger.error("Error loading user stats:", e);
      pageState.userStats = {};
    }
  }
}

function saveUserStats() {
  localStorage.setItem("myInfo_userStats", JSON.stringify(pageState.userStats));
}

function loadSavedData() {
  // 결속 환수 로드
  const savedBond = localStorage.getItem("myInfo_bondSpirits");
  if (savedBond) {
    try {
      pageState.bondSpirits = JSON.parse(savedBond);
    } catch (e) {
      Logger.error("Error loading bond spirits:", e);
    }
  }

  // 사용 환수 로드
  const savedActive = localStorage.getItem("myInfo_activeSpirits");
  if (savedActive) {
    try {
      pageState.activeSpirits = JSON.parse(savedActive);
    } catch (e) {
      Logger.error("Error loading active spirits:", e);
    }
  }

  // 기준 스탯 로드
  const savedBaseline = localStorage.getItem("myInfo_baselineStats");
  if (savedBaseline) {
    try {
      pageState.baselineStats = JSON.parse(savedBaseline);
    } catch (e) {
      Logger.error("Error loading baseline stats:", e);
    }
  }

  // 저장된 환수혼 경험치 로드
  const savedSoulExp = localStorage.getItem("myInfo_savedSoulExp");
  if (savedSoulExp) {
    try {
      pageState.savedSoulExp = parseInt(savedSoulExp, 10) || 0;
    } catch (e) {
      Logger.error("Error loading saved soul exp:", e);
    }
  }
}

function saveData() {
  localStorage.setItem(
    "myInfo_bondSpirits",
    JSON.stringify(pageState.bondSpirits)
  );
  localStorage.setItem(
    "myInfo_activeSpirits",
    JSON.stringify(pageState.activeSpirits)
  );
  localStorage.setItem(
    "myInfo_baselineStats",
    JSON.stringify(pageState.baselineStats)
  );
  localStorage.setItem(
    "myInfo_savedSoulExp",
    pageState.savedSoulExp.toString()
  );
}

function renderBondSlots(category) {
  const container = elements[`bondSlots${category}`];
  if (!container) return;

  container.innerHTML = "";
  const bondSpirits = pageState.bondSpirits[category] || [];

  // 6개 슬롯 생성 (2행 3열)
  for (let i = 0; i < 6; i++) {
    const slot = createElement("div", "my-info-bond-slot");
    slot.dataset.slotIndex = i;
    slot.dataset.category = category;

    if (bondSpirits[i]) {
      const spirit = bondSpirits[i];
      slot.classList.add("filled");

      // 사용 중인 환수인지 확인
      const active = pageState.activeSpirits[category];
      if (active && active.name === spirit.name) {
        slot.classList.add("used-spirit");
      }

      const img = createElement("img");
      img.src = spirit.image;
      img.alt = spirit.name;
      slot.appendChild(img);

      // 레벨 표시
      const levelBadge = createElement("div");
      levelBadge.className = "level-badge";
      levelBadge.style.position = "absolute";
      levelBadge.style.bottom = "1px";
      levelBadge.style.left = "1px";
      levelBadge.style.background = "rgba(0,0,0,0.7)";
      levelBadge.style.color = "white";
      levelBadge.style.padding = "1px 3px";
      levelBadge.style.borderRadius = "2px";
      levelBadge.style.fontSize = "9px";
      levelBadge.style.fontWeight = "600";
      levelBadge.textContent = `Lv.${spirit.level || 25}`;
      levelBadge.style.pointerEvents = "none";
      slot.appendChild(levelBadge);

      // x 버튼 제거 (팝업에서 제거 가능)
    } else {
      slot.textContent = "+";
      slot.style.fontSize = "16px";
      slot.style.color = "var(--text-light)";
    }

    slot.addEventListener("click", (e) => {
      // 제거 버튼 클릭이 아닌 경우에만 처리
      if (
        e.target.classList.contains("remove-btn") ||
        e.target.closest(".remove-btn")
      ) {
        return;
      }

      if (!bondSpirits[i]) {
        // 슬롯이 비어있으면 오른쪽 그리드에서 선택하도록
        setCategoryForSelection(category);
      } else {
        // 결속 환수 이미지 클릭 시 레벨 수정 팝업 표시
        showSpiritLevelPopup(category, i, slot, e);
      }
    });

    container.appendChild(slot);
  }
}

function renderActiveSpiritSelect(category) {
  // 드롭다운이 제거되었으므로 이 함수는 더 이상 필요 없음
  // 하지만 호출되는 곳이 있을 수 있으므로 빈 함수로 유지
}

function getSpiritsForCategory(category) {
  const allCreatures = Array.isArray(globalState.allSpirits)
    ? globalState.allSpirits
    : [];
  return allCreatures.filter((s) => s.type === category);
}

function renderSpiritList() {
  const spirits = getSpiritsForCategory(pageState.currentCategory);

  if (spirits.length === 0) {
    elements.spiritGrid.innerHTML =
      "<p class='text-center text-sm text-light mt-lg'>환수 데이터를 불러오는 중...</p>";
    return;
  }

  // 현재 카테고리의 결속 환수 목록 가져오기 (최신 상태 보장)
  const currentCategory = pageState.currentCategory;
  const bondSpirits = pageState.bondSpirits[currentCategory] || [];
  const bondSpiritNames = new Set(bondSpirits.map((s) => s.name));

  // 사용 중인 환수 확인
  const active = pageState.activeSpirits[currentCategory];
  const activeSpiritName = active ? active.name : null;

  renderSpiritGrid({
    container: elements.spiritGrid,
    spirits: spirits,
    onSpiritClick: handleSpiritSelect,
    getSpiritState: (spirit) => {
      // 결속 슬롯에 포함되어 있는지 확인
      const isInBond = bondSpiritNames.has(spirit.name);
      // 사용 중인 환수인지 확인 (결속에 포함되어 있어야 함)
      const isUsed = isInBond && activeSpiritName === spirit.name;

      return {
        selected: isInBond,
        registrationCompleted: isUsed, // 사용 중인 환수는 registrationCompleted로 표시
        bondCompleted: false,
        level25BindAvailable: false,
      };
    },
    groupByInfluence: false,
  });
}

function setCategoryForSelection(category) {
  pageState.currentCategory = category;
  elements.spiritTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.category === category);
  });
  renderSpiritList();
}

function handleSpiritSelect(spirit) {
  if (!spirit) return;

  const category = pageState.currentCategory;
  const bondSpirits = pageState.bondSpirits[category] || [];

  // 이미 결속에 포함되어 있는지 확인
  const existingIndex = bondSpirits.findIndex((s) => s.name === spirit.name);

  if (existingIndex !== -1) {
    // 이미 있으면 제거
    bondSpirits.splice(existingIndex, 1);
    pageState.bondSpirits[category] = bondSpirits;
    saveData();
    renderBondSlots(category);
    renderSpiritList();

    // 캐시 무효화
    pageState.lastTotalStatsHash = null;
    pageState.lastSoulExpHash = null;

    // 디바운스된 업데이트
    debouncedUpdateTotalStats();
    debouncedUpdateSoulExp();
  } else {
    // 없으면 추가 (최대 6개)
    if (bondSpirits.length < 6) {
      bondSpirits.push({
        ...spirit,
        level: 25, // 기본값 25
      });
      pageState.bondSpirits[category] = bondSpirits;
      saveData();

      // 새로 추가된 슬롯 인덱스
      const newIndex = bondSpirits.length - 1;

      // 슬롯 렌더링
      renderBondSlots(category);

      // 새로 추가된 슬롯 하이라이트
      const container = elements[`bondSlots${category}`];
      if (container) {
        const newSlot = container.children[newIndex];
        if (newSlot) {
          newSlot.classList.add("highlight");
          setTimeout(() => {
            newSlot.classList.remove("highlight");
          }, 1000);
        }
      }

      renderSpiritList();

      // 캐시 무효화
      pageState.lastTotalStatsHash = null;
      pageState.lastSoulExpHash = null;

      // 디바운스된 업데이트
      debouncedUpdateTotalStats();
      debouncedUpdateSoulExp();
    } else {
      alert("결속 슬롯은 최대 6개까지 선택할 수 있습니다.");
      return;
    }
  }
}

let currentPopup = null;

// 길게 누르기를 위한 상태 변수들
let popupLongPressState = {
  isPressed: false,
  intervalId: null,
  timeoutId: null,
  hintElement: null,
  bridgeElement: null,
  hintHovered: false,
  button: null,
  spirit: null,
  category: null,
  index: null,
  action: null,
  mouseDownTime: null,
  touchStartTime: null,
  touchMoveHandler: null,
  ignoreMouseUp: false,
};

function showSpiritLevelPopup(category, index, slot, event) {
  const bondSpirits = pageState.bondSpirits[category] || [];
  const spirit = bondSpirits[index];
  if (!spirit) return;

  // 기존 팝업 제거
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }

  // 팝업 생성
  const popup = createElement("div", "my-info-spirit-popup");

  // 클릭 위치 기준으로 팝업 위치 설정
  const rect = slot.getBoundingClientRect();
  const popupWidth = 250; // 예상 너비
  const popupHeight = 180; // 예상 높이

  // 기본 위치: 슬롯 아래 중앙
  let left = rect.left + rect.width / 2 - popupWidth / 2;
  let top = rect.bottom + 10;

  // 화면 밖으로 나가지 않도록 조정
  if (left < 10) {
    left = 10; // 왼쪽 여백
  } else if (left + popupWidth > window.innerWidth - 10) {
    left = window.innerWidth - popupWidth - 10; // 오른쪽 여백
  }

  if (top + popupHeight > window.innerHeight - 10) {
    top = rect.top - popupHeight - 10; // 위쪽에 표시
    if (top < 10) {
      top = 10; // 최소 여백
    }
  }

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;

  const active = pageState.activeSpirits[category];
  const isActive = active && active.name === spirit.name;
  const isFixed = isFixedLevelSpirit(spirit.name);

  popup.innerHTML = `
    <button class="my-info-spirit-popup-close">×</button>
    <div class="my-info-spirit-popup-header">
      <img src="${spirit.image}" alt="${spirit.name}">
      <div class="my-info-spirit-popup-name">${spirit.name}</div>
    </div>
    <div class="spirit-level-control">
      ${
        isFixed
          ? `<div class="fixed-level-control">
              <span class="fixed-level-label">25 (고정)</span>
            </div>`
          : `<button class="level-btn minus-btn" data-action="level-down">-</button>
            <input type="number" class="level-input" min="0" max="25" value="${
              spirit.level || 25
            }">
            <button class="level-btn plus-btn" data-action="level-up">+</button>`
      }
    </div>
    <div class="my-info-spirit-popup-actions">
      <button class="my-info-spirit-popup-action-btn ${
        isActive ? "active" : ""
      }" data-action="set-active">
        ${isActive ? "✓ 사용 중" : "사용 중"}
      </button>
      <button class="my-info-spirit-popup-action-btn remove" data-action="remove">제거</button>
    </div>
  `;

  document.body.appendChild(popup);
  currentPopup = popup;

  // 이벤트 리스너
  const closeBtn = popup.querySelector(".my-info-spirit-popup-close");

  // 레벨 컨트롤 이벤트 (고정 레벨이 아닌 경우)
  if (!isFixed) {
    const levelInput = popup.querySelector(".level-input");
    const minusBtn = popup.querySelector(".minus-btn");
    const plusBtn = popup.querySelector(".plus-btn");

    levelInput.focus();
    levelInput.select();

    // 길게 누르기 기능을 위한 mousedown/touchstart 이벤트
    const setupLongPress = (btn, action) => {
      const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // 이전 상태 정리
        if (popupLongPressState.timeoutId) {
          clearTimeout(popupLongPressState.timeoutId);
        }
        if (popupLongPressState.intervalId) {
          clearInterval(popupLongPressState.intervalId);
        }

        // 길게 누르기 상태 설정
        popupLongPressState.isPressed = false;
        popupLongPressState.button = btn;
        popupLongPressState.spirit = spirit;
        popupLongPressState.category = category;
        popupLongPressState.index = index;
        popupLongPressState.action = action;
        popupLongPressState.hintHovered = false;
        popupLongPressState.mouseDownTime = Date.now();

        // 300ms 후에 길게 누르기 시작
        popupLongPressState.timeoutId = setTimeout(() => {
          if (popupLongPressState.button === btn) {
            startPopupLongPress();
          }
        }, 300);
      };

      const handleTouchStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        popupLongPressState.touchStartTime = Date.now();
        handleMouseDown(e);
      };

      btn.addEventListener("mousedown", handleMouseDown);
      btn.addEventListener("touchstart", handleTouchStart, { passive: false });
    };

    setupLongPress(minusBtn, "level-down");
    setupLongPress(plusBtn, "level-up");

    // 레벨 입력 변경 시 자동 저장
    levelInput.addEventListener("change", () => {
      let level = parseInt(levelInput.value, 10) || 25;
      if (level < 0) level = 0;
      if (level > 25) level = 25;
      levelInput.value = level;
      spirit.level = level;
      saveData();
      renderBondSlots(category);
      updatePopupActiveState(popup, category, spirit);

      // 캐시 무효화하지 않고 디바운싱된 업데이트만 호출
      // (해시 기반 캐시가 자동으로 변경사항을 감지함)
      debouncedUpdateTotalStats();
      debouncedUpdateSoulExp();
    });
  }

  // 전역 mouseup/touchend 이벤트로 길게 누르기 중지
  const handleGlobalMouseUp = (e) => {
    // ignoreMouseUp 플래그가 true면 무시
    if (popupLongPressState.ignoreMouseUp) {
      return;
    }

    // 길게 누르기가 시작되지 않았다면 timeout만 취소하고 짧은 클릭 처리
    if (popupLongPressState.timeoutId && !popupLongPressState.isPressed) {
      clearTimeout(popupLongPressState.timeoutId);
      popupLongPressState.timeoutId = null;

      // 짧은 클릭인지 확인 (300ms 이내)
      const clickDuration = popupLongPressState.mouseDownTime
        ? Date.now() - popupLongPressState.mouseDownTime
        : 0;
      const isShortClick = clickDuration > 0 && clickDuration < 300;

      // 짧은 클릭 처리
      if (
        isShortClick &&
        popupLongPressState.category !== null &&
        popupLongPressState.index !== null
      ) {
        // 최신 spirit 객체 가져오기
        const bondSpirits =
          pageState.bondSpirits[popupLongPressState.category] || [];
        const currentSpirit = bondSpirits[popupLongPressState.index];

        if (currentSpirit) {
          let level =
            currentSpirit.level !== undefined && currentSpirit.level !== null
              ? currentSpirit.level
              : 25;
          let changed = false;

          if (popupLongPressState.action === "level-down" && level > 0) {
            level = Math.max(0, level - 1);
            changed = true;
          } else if (popupLongPressState.action === "level-up" && level < 25) {
            level = Math.min(25, level + 1);
            changed = true;
          }

          if (changed) {
            currentSpirit.level = level;
            const levelInput = popup.querySelector(".level-input");
            if (levelInput) {
              levelInput.value = level;
            }
            saveData();
            renderBondSlots(popupLongPressState.category);
            updatePopupActiveState(
              popup,
              popupLongPressState.category,
              currentSpirit
            );

            // 캐시 무효화
            pageState.lastTotalStatsHash = null;
            pageState.lastSoulExpHash = null;
            debouncedUpdateTotalStats();
            debouncedUpdateSoulExp();
          }
        }
      }

      // 상태 초기화
      popupLongPressState.button = null;
      popupLongPressState.spirit = null;
      popupLongPressState.category = null;
      popupLongPressState.index = null;
      popupLongPressState.action = null;
      popupLongPressState.mouseDownTime = null;
      return;
    }

    // 길게 누르기가 활성화된 상태라면 중지
    if (popupLongPressState.isPressed) {
      // 터치 이벤트인 경우 힌트와의 충돌 감지
      if (e.type === "touchend" && popupLongPressState.hintElement) {
        const touch = e.changedTouches?.[0] || e;
        const hintRect =
          popupLongPressState.hintElement.getBoundingClientRect();
        const isWithinHint =
          touch.clientX >= hintRect.left &&
          touch.clientX <= hintRect.right &&
          touch.clientY >= hintRect.top &&
          touch.clientY <= hintRect.bottom;

        if (isWithinHint) {
          popupLongPressState.hintHovered = true;
        }
      }

      // 힌트에 마우스가 올려져 있다면 해당 값으로 적용
      if (
        popupLongPressState.hintHovered &&
        popupLongPressState.category !== null &&
        popupLongPressState.index !== null
      ) {
        const targetValue =
          popupLongPressState.action === "level-down" ? 0 : 25;
        // 최신 spirit 객체 가져오기
        const bondSpirits =
          pageState.bondSpirits[popupLongPressState.category] || [];
        const currentSpirit = bondSpirits[popupLongPressState.index];

        if (currentSpirit) {
          currentSpirit.level = targetValue;
          const levelInput = popup.querySelector(".level-input");
          if (levelInput) {
            levelInput.value = targetValue;
          }
          saveData();
          renderBondSlots(popupLongPressState.category);
          updatePopupActiveState(
            popup,
            popupLongPressState.category,
            currentSpirit
          );

          // 캐시 무효화
          pageState.lastTotalStatsHash = null;
          pageState.lastSoulExpHash = null;
          debouncedUpdateTotalStats();
          debouncedUpdateSoulExp();
        }
      }

      stopPopupLongPress();
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // 상태가 남아있으면 초기화
    if (popupLongPressState.button || popupLongPressState.timeoutId) {
      popupLongPressState.button = null;
      popupLongPressState.spirit = null;
      popupLongPressState.category = null;
      popupLongPressState.index = null;
      popupLongPressState.action = null;
      popupLongPressState.mouseDownTime = null;
      popupLongPressState.touchStartTime = null;
      if (popupLongPressState.timeoutId) {
        clearTimeout(popupLongPressState.timeoutId);
        popupLongPressState.timeoutId = null;
      }
    }
  };

  const handleGlobalTouchEnd = (e) => {
    // 가상의 마우스 이벤트로 변환하여 handleGlobalMouseUp 호출
    const touch = e.changedTouches[0];
    const fakeEvent = {
      ...e,
      type: "touchend",
      clientX: touch.clientX,
      clientY: touch.clientY,
      changedTouches: [touch],
    };

    handleGlobalMouseUp(fakeEvent);
  };

  document.addEventListener("mouseup", handleGlobalMouseUp);
  document.addEventListener("touchend", handleGlobalTouchEnd, {
    passive: false,
  });

  // 팝업이 닫힐 때 이벤트 리스너 제거
  const cleanup = () => {
    stopPopupLongPress();
    document.removeEventListener("mouseup", handleGlobalMouseUp);
    document.removeEventListener("touchend", handleGlobalTouchEnd);
    popup.remove();
    currentPopup = null;
  };

  // closeBtn 클릭 시 cleanup 호출
  closeBtn.addEventListener("click", cleanup);

  // 외부 클릭 시에도 cleanup
  const closeOnOutsideClick = (e) => {
    if (!popup.contains(e.target) && !slot.contains(e.target)) {
      cleanup();
      document.removeEventListener("click", closeOnOutsideClick);
    }
  };

  const setActiveBtn = popup.querySelector("[data-action='set-active']");
  setActiveBtn.addEventListener("click", () => {
    const active = pageState.activeSpirits[category];
    if (active && active.name === spirit.name) {
      pageState.activeSpirits[category] = null;
    } else {
      const level = isFixed
        ? 25
        : parseInt(popup.querySelector(".level-input")?.value, 10) ||
          spirit.level ||
          25;
      pageState.activeSpirits[category] = {
        ...spirit,
        level: level,
      };
      spirit.level = level;
    }
    saveData();
    renderBondSlots(category);
    updatePopupActiveState(popup, category, spirit);

    // 캐시 무효화
    pageState.lastTotalStatsHash = null;
    pageState.lastSoulExpHash = null;
    debouncedUpdateTotalStats();
    debouncedUpdateSoulExp();
  });

  const removeBtn = popup.querySelector("[data-action='remove']");
  removeBtn.addEventListener("click", () => {
    stopPopupLongPress();
    removeBondSpirit(category, index);
    cleanup();
  });
}

function updatePopupActiveState(popup, category, spirit) {
  const active = pageState.activeSpirits[category];
  const isActive = active && active.name === spirit.name;
  const setActiveBtn = popup.querySelector("[data-action='set-active']");
  if (setActiveBtn) {
    if (isActive) {
      setActiveBtn.textContent = "✓ 사용 중";
      setActiveBtn.classList.add("active");
    } else {
      setActiveBtn.textContent = "사용 중";
      setActiveBtn.classList.remove("active");
    }
  }
}

function startPopupLongPress() {
  if (!popupLongPressState.button || !popupLongPressState.spirit) return;

  // 고정 레벨 환수는 레벨 변경 불가
  if (isFixedLevelSpirit(popupLongPressState.spirit.name)) {
    return;
  }

  popupLongPressState.isPressed = true;

  // 힌트 생성 직후 발생하는 mouseup 무시하기 위한 플래그 설정
  popupLongPressState.ignoreMouseUp = true;
  setTimeout(() => {
    popupLongPressState.ignoreMouseUp = false;
  }, 100);

  // 힌트 생성
  createPopupHint();

  // 연속 증감 함수
  const performLevelChange = () => {
    if (
      !popupLongPressState.isPressed ||
      popupLongPressState.category === null ||
      popupLongPressState.index === null
    ) {
      return false;
    }

    // 최신 spirit 객체 가져오기
    const bondSpirits =
      pageState.bondSpirits[popupLongPressState.category] || [];
    const currentSpirit = bondSpirits[popupLongPressState.index];

    if (!currentSpirit) {
      return false;
    }

    const currentLevel =
      currentSpirit.level !== undefined && currentSpirit.level !== null
        ? currentSpirit.level
        : 25;
    let changed = false;

    if (popupLongPressState.action === "level-down" && currentLevel > 0) {
      currentSpirit.level = Math.max(0, currentLevel - 1);
      changed = true;
    } else if (popupLongPressState.action === "level-up" && currentLevel < 25) {
      currentSpirit.level = Math.min(25, currentLevel + 1);
      changed = true;
    }

    if (changed) {
      saveData();
      const levelInput = currentPopup?.querySelector(".level-input");
      if (levelInput) {
        levelInput.value = currentSpirit.level;
      }
      renderBondSlots(popupLongPressState.category);
      updatePopupActiveState(
        currentPopup,
        popupLongPressState.category,
        currentSpirit
      );

      // 캐시 무효화하지 않고 디바운싱된 업데이트만 호출
      // (해시 기반 캐시가 자동으로 변경사항을 감지함)
      debouncedUpdateTotalStats();
      debouncedUpdateSoulExp();

      return true;
    }
    return false;
  };

  // 첫 번째 변경 즉시 실행
  performLevelChange();

  // 연속 증감 시작 (200ms 간격)
  popupLongPressState.intervalId = setInterval(() => {
    if (!performLevelChange()) {
      stopPopupLongPress();
    }
  }, 200);
}

function stopPopupLongPress() {
  if (popupLongPressState.intervalId) {
    clearInterval(popupLongPressState.intervalId);
    popupLongPressState.intervalId = null;
  }

  if (popupLongPressState.timeoutId) {
    clearTimeout(popupLongPressState.timeoutId);
    popupLongPressState.timeoutId = null;
  }

  removePopupHint();

  if (popupLongPressState.touchMoveHandler) {
    document.removeEventListener(
      "touchmove",
      popupLongPressState.touchMoveHandler
    );
    popupLongPressState.touchMoveHandler = null;
  }

  popupLongPressState.isPressed = false;
  popupLongPressState.hintHovered = false;
  popupLongPressState.bridgeElement = null;
  popupLongPressState.button = null;
  popupLongPressState.spirit = null;
  popupLongPressState.category = null;
  popupLongPressState.index = null;
  popupLongPressState.action = null;
  popupLongPressState.mouseDownTime = null;
  popupLongPressState.touchStartTime = null;
  popupLongPressState.ignoreMouseUp = false;
}

function createPopupHint() {
  if (!popupLongPressState.button) return;

  const targetValue = popupLongPressState.action === "level-down" ? 0 : 25;
  const hintText = targetValue.toString();

  const hint = createElement("div", "level-hint");
  hint.textContent = hintText;

  // 버튼 바로 옆에 힌트 배치
  const buttonRect = popupLongPressState.button.getBoundingClientRect();

  hint.style.position = "fixed";
  hint.style.top = buttonRect.top + "px";
  hint.style.zIndex = "1001";
  hint.style.color = "white";
  hint.style.padding = "0px 4px";
  hint.style.margin = "0";
  hint.style.border = "none";
  hint.style.borderRadius = "3px";
  hint.style.fontSize = "10px";
  hint.style.fontWeight = "bold";
  hint.style.pointerEvents = "none";
  hint.style.cursor = "pointer";
  hint.style.whiteSpace = "nowrap";
  hint.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
  hint.style.textAlign = "center";
  hint.style.height = buttonRect.height + "px";
  hint.style.lineHeight = buttonRect.height + "px";
  hint.style.width = "32px";
  hint.style.display = "flex";
  hint.style.alignItems = "center";
  hint.style.justifyContent = "center";
  hint.style.transition = "all 0.2s ease";

  if (popupLongPressState.action === "level-down") {
    hint.style.left = buttonRect.left - 36 + "px";
    hint.style.backgroundColor = "#f44336";
  } else {
    hint.style.left = buttonRect.right + 4 + "px";
    hint.style.backgroundColor = "#4CAF50";
  }

  document.body.appendChild(hint);
  popupLongPressState.hintElement = hint;
  popupLongPressState.hintHovered = false;

  // 브리지 영역 생성
  const bridge = createElement("div", "hint-bridge");
  bridge.style.position = "fixed";
  bridge.style.top = buttonRect.top + "px";
  bridge.style.height = buttonRect.height + "px";
  bridge.style.zIndex = "1000";
  bridge.style.backgroundColor = "transparent";
  bridge.style.pointerEvents = "none";

  if (popupLongPressState.action === "level-down") {
    bridge.style.left = buttonRect.left - 36 + "px";
    bridge.style.width = 36 + buttonRect.width + 4 + "px";
  } else {
    bridge.style.left = buttonRect.left + "px";
    bridge.style.width = buttonRect.width + 4 + 32 + "px";
  }

  document.body.appendChild(bridge);
  popupLongPressState.bridgeElement = bridge;

  // 힌트 이벤트 리스너
  const handleHintEnter = () => {
    if (popupLongPressState.isPressed) {
      popupLongPressState.hintHovered = true;
      hint.style.transform = "scale(1.2)";
      hint.style.fontSize = "12px";
      hint.style.fontWeight = "900";
      hint.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    }
  };

  const handleHintLeave = () => {
    if (popupLongPressState.isPressed) {
      popupLongPressState.hintHovered = false;
      hint.style.transform = "scale(1)";
      hint.style.fontSize = "10px";
      hint.style.fontWeight = "bold";
      hint.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
    }
  };

  const handleHintMouseUp = () => {
    if (popupLongPressState.isPressed) {
      if (popupLongPressState.hintHovered) {
        const targetValue =
          popupLongPressState.action === "level-down" ? 0 : 25;
        if (popupLongPressState.spirit) {
          popupLongPressState.spirit.level = targetValue;
          const levelInput = currentPopup?.querySelector(".level-input");
          if (levelInput) {
            levelInput.value = targetValue;
          }
          saveData();
          renderBondSlots(popupLongPressState.category);
          updatePopupActiveState(
            currentPopup,
            popupLongPressState.category,
            popupLongPressState.spirit
          );

          // 캐시 무효화
          pageState.lastTotalStatsHash = null;
          pageState.lastSoulExpHash = null;
          debouncedUpdateTotalStats();
          debouncedUpdateSoulExp();
        }
      }
      stopPopupLongPress();
    }
  };

  hint.addEventListener("mouseenter", handleHintEnter);
  hint.addEventListener("mouseup", handleHintMouseUp);
  hint.addEventListener("mouseleave", (e) => {
    if (!bridge.contains(e.relatedTarget) && e.relatedTarget !== bridge) {
      handleHintLeave();
    }
  });

  hint.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleHintEnter();
    },
    { passive: false }
  );

  hint.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleHintMouseUp();
    },
    { passive: false }
  );

  // 브리지 이벤트
  bridge.addEventListener("mouseleave", (e) => {
    // 브리지에서 힌트로 이동하는 경우는 제외
    if (!hint.contains(e.relatedTarget) && e.relatedTarget !== hint) {
      handleHintLeave();
    }
  });

  bridge.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleHintEnter(); // 브리지도 hover 상태로 설정
    },
    { passive: false }
  );

  bridge.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      // 브리지에서는 값 적용하지 않음 (힌트로만 적용)
    },
    { passive: false }
  );

  // 터치 이동 처리
  const handleTouchMove = (e) => {
    if (!popupLongPressState.isPressed) return;

    const touch = e.touches[0];
    const elementUnderTouch = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );
    const hint = popupLongPressState.hintElement;
    const bridge = popupLongPressState.bridgeElement;

    if (!hint) return;

    const isOnHint =
      elementUnderTouch === hint || hint.contains(elementUnderTouch);
    const isOnBridge = elementUnderTouch === bridge;

    if (isOnHint || isOnBridge) {
      if (!popupLongPressState.hintHovered) {
        hint.style.pointerEvents = "auto";
        bridge.style.pointerEvents = "auto";
        popupLongPressState.hintHovered = true;
        hint.style.transform = "scale(1.2)";
        hint.style.fontSize = "12px";
        hint.style.fontWeight = "900";
        hint.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      }
    } else {
      if (popupLongPressState.hintHovered) {
        hint.style.pointerEvents = "none";
        bridge.style.pointerEvents = "none";
        popupLongPressState.hintHovered = false;
        hint.style.transform = "scale(1)";
        hint.style.fontSize = "10px";
        hint.style.fontWeight = "bold";
        hint.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)";
      }
    }
  };

  popupLongPressState.touchMoveHandler = handleTouchMove;
  document.addEventListener("touchmove", handleTouchMove, { passive: false });

  // 모든 이벤트 리스너 추가 후 pointerEvents 활성화 (버튼 방해 방지)
  // setTimeout을 사용하여 다음 이벤트 루프에서 활성화
  setTimeout(() => {
    if (hint && popupLongPressState.isPressed) {
      hint.style.pointerEvents = "auto";
    }
    if (bridge && popupLongPressState.isPressed) {
      bridge.style.pointerEvents = "auto";
    }
  }, 0);
}

function removePopupHint() {
  if (popupLongPressState.hintElement) {
    popupLongPressState.hintElement.remove();
    popupLongPressState.hintElement = null;
  }
  if (popupLongPressState.bridgeElement) {
    popupLongPressState.bridgeElement.remove();
    popupLongPressState.bridgeElement = null;
  }
}

function updateStatItems() {
  // 캐시된 계산 결과가 없으면 재계산
  if (!pageState.lastTotalStatsHash) {
    debouncedUpdateTotalStats();
    return;
  }

  // 캐시된 값으로 스탯 아이템만 업데이트
  // 실제 계산은 updateTotalStats에서 수행되므로 여기서는 스킵
  // 대신 updateTotalStats가 호출되도록 함
  debouncedUpdateTotalStats();
}

function updateStatItemsWithValues(
  allStats,
  allBondStats,
  allActiveStats,
  forceZeroChange = false
) {
  if (!elements.container) {
    return;
  }

  allStats.forEach((stat) => {
    // 나의 스탯은 전체 모든 점수를 합산한 스탯 (userStats + allBondStats + allActiveStats)
    const baseValue = pageState.userStats[stat.key] || 0;
    const bondValue = allBondStats[stat.key] || 0;
    const activeValue = allActiveStats[stat.key] || 0;
    const totalValue = baseValue + bondValue + activeValue;

    // 기준값과 비교
    const baselineValue = pageState.baselineStats.hasOwnProperty(stat.key)
      ? pageState.baselineStats[stat.key]
      : totalValue; // 기준값이 없으면 현재 값을 기준으로 설정하여 증감 0 표시

    // forceZeroChange가 true이면 changeValue를 강제로 0으로 설정
    let changeValue = forceZeroChange
      ? 0
      : Math.round((totalValue - baselineValue) * 100) / 100;

    // 해당 스탯 아이템 찾기
    const statItem = elements.container.querySelector(
      `[data-stat="${stat.key}"]`
    );
    if (!statItem) {
      return;
    }

    const valueContainer = statItem.querySelector(".my-info-stat-value");
    const baseValueSpan = statItem.querySelector(".my-info-stat-base");
    const totalValueSpan = statItem.querySelector(".my-info-stat-total");
    const changeValueSpan = statItem.querySelector(".my-info-stat-change");

    if (!valueContainer || !totalValueSpan || !changeValueSpan) {
      return;
    }

    // 편집 중인 경우 업데이트하지 않음
    if (statItem.classList.contains("editing")) {
      return;
    }

    // 방금 편집이 완료된 스탯은 업데이트하지 않음
    if (
      pageState.recentlyEditedStats &&
      pageState.recentlyEditedStats.has(stat.key)
    ) {
      return;
    }

    // finishEdit에서 방금 설정한 값이 있는지 확인 (데이터 속성으로 확인)
    const lastEditedValue = totalValueSpan.dataset.lastEditedValue;
    const lastEditedTime = totalValueSpan.dataset.lastEditedTime
      ? parseInt(totalValueSpan.dataset.lastEditedTime, 10)
      : 0;
    const isManuallyEdited = totalValueSpan.dataset.isManuallyEdited === "true";

    // 수동 편집 플래그가 있으면, 방금 편집한 경우(1초 이내)에만 업데이트하지 않음
    // 1초가 지나면 정상적으로 업데이트되도록 허용
    if (isManuallyEdited && lastEditedTime) {
      const timeSinceEdit = Date.now() - lastEditedTime;
      if (timeSinceEdit < 1000) {
        // 1초 이내에 편집한 경우에만 보호
        return;
      }
      // 1초가 지났으면 플래그 제거하여 정상 업데이트 허용
      delete totalValueSpan.dataset.isManuallyEdited;
      delete totalValueSpan.dataset.lastEditedValue;
      delete totalValueSpan.dataset.lastEditedTime;
    }

    // 합산값을 메인으로 표시
    const formattedTotalValue = Math.round(totalValue).toLocaleString();
    totalValueSpan.textContent = formattedTotalValue;
    totalValueSpan.style.display = "inline";
    totalValueSpan.style.visibility = "visible";

    // 증감 표시 (소수점 제거, 괄호 안에)
    const absChangeValue = Math.abs(changeValue);
    if (absChangeValue > 0.01) {
      const roundedChange = Math.round(changeValue);
      changeValueSpan.textContent = `(${
        roundedChange > 0 ? "+" : ""
      }${roundedChange.toLocaleString()})`;
      changeValueSpan.className = `my-info-stat-change ${
        changeValue > 0 ? "positive" : "negative"
      }`;
      changeValueSpan.style.display = "inline";
      changeValueSpan.style.visibility = "visible";
      // 인라인 스타일 제거 (CSS 클래스가 적용되도록)
      changeValueSpan.style.color = "";
      changeValueSpan.style.background = "";
    } else {
      // changeValue가 0이면 "(0)"으로 표시
      changeValueSpan.textContent = "(0)";
      changeValueSpan.className = "my-info-stat-change neutral";
      changeValueSpan.style.display = "inline";
      changeValueSpan.style.visibility = "visible";
      // 인라인 스타일 제거 (CSS 클래스가 적용되도록)
      changeValueSpan.style.color = "";
      changeValueSpan.style.background = "";
    }
  });

  // 주요 스탯 변화 업데이트
  updateKeyStats(allStats, allBondStats, allActiveStats);
}

function updateKeyStats(allStats, allBondStats, allActiveStats) {
  // 환산타채 합 계산: 피해저항관통 + 피해저항 + (대인피해% × 10) + (대인방어% × 10)
  const getTotalValue = (key) => {
    const baseValue = pageState.userStats[key] || 0;
    const bondValue = allBondStats[key] || 0;
    const activeValue = allActiveStats[key] || 0;
    return baseValue + bondValue + activeValue;
  };

  const damageResistancePenetration = getTotalValue(
    "damageResistancePenetration"
  );
  const damageResistance = getTotalValue("damageResistance");
  const pvpDamagePercent = getTotalValue("pvpDamagePercent");
  const pvpDefensePercent = getTotalValue("pvpDefensePercent");
  const tachaeTotal =
    damageResistancePenetration +
    damageResistance +
    pvpDamagePercent * 10 +
    pvpDefensePercent * 10;

  // 상태이상저항
  const statusEffectResistance = getTotalValue("statusEffectResistance");

  // 상태이상적중
  const statusEffectAccuracy = getTotalValue("statusEffectAccuracy");

  // 기준값 가져오기
  const getBaselineValue = (key) => {
    return pageState.baselineStats[key] || 0;
  };

  const baselineDamageResistancePenetration = getBaselineValue(
    "damageResistancePenetration"
  );
  const baselineDamageResistance = getBaselineValue("damageResistance");
  const baselinePvpDamagePercent = getBaselineValue("pvpDamagePercent");
  const baselinePvpDefensePercent = getBaselineValue("pvpDefensePercent");
  const baselineTachaeTotal =
    baselineDamageResistancePenetration +
    baselineDamageResistance +
    baselinePvpDamagePercent * 10 +
    baselinePvpDefensePercent * 10;

  const baselineStatusEffectResistance = getBaselineValue(
    "statusEffectResistance"
  );
  const baselineStatusEffectAccuracy = getBaselineValue("statusEffectAccuracy");

  // 변화값 계산
  const tachaeChange = tachaeTotal - baselineTachaeTotal;
  const resistanceChange =
    statusEffectResistance - baselineStatusEffectResistance;
  const accuracyChange = statusEffectAccuracy - baselineStatusEffectAccuracy;

  // UI 업데이트
  const tachaeValueEl = elements.container.querySelector("#keyStatTachae");
  const tachaeChangeEl = elements.container.querySelector(
    "#keyStatTachaeChange"
  );
  const resistanceValueEl =
    elements.container.querySelector("#keyStatResistance");
  const resistanceChangeEl = elements.container.querySelector(
    "#keyStatResistanceChange"
  );
  const accuracyValueEl = elements.container.querySelector("#keyStatAccuracy");
  const accuracyChangeEl = elements.container.querySelector(
    "#keyStatAccuracyChange"
  );

  if (tachaeValueEl) {
    tachaeValueEl.textContent = Math.round(tachaeTotal).toLocaleString();
  }
  if (tachaeChangeEl) {
    if (Math.abs(tachaeChange) > 0.01) {
      tachaeChangeEl.textContent =
        tachaeChange > 0
          ? `+${Math.round(tachaeChange).toLocaleString()}`
          : `${Math.round(tachaeChange).toLocaleString()}`;
      tachaeChangeEl.className = `my-info-key-stat-change ${
        tachaeChange > 0 ? "positive" : "negative"
      }`;
      tachaeChangeEl.style.display = "block";
    } else {
      tachaeChangeEl.textContent = "0";
      tachaeChangeEl.className = "my-info-key-stat-change neutral";
      tachaeChangeEl.style.display = "block";
    }
  }

  if (resistanceValueEl) {
    resistanceValueEl.textContent = Math.round(
      statusEffectResistance
    ).toLocaleString();
  }
  if (resistanceChangeEl) {
    if (Math.abs(resistanceChange) > 0.01) {
      resistanceChangeEl.textContent =
        resistanceChange > 0
          ? `+${Math.round(resistanceChange).toLocaleString()}`
          : `${Math.round(resistanceChange).toLocaleString()}`;
      resistanceChangeEl.className = `my-info-key-stat-change ${
        resistanceChange > 0 ? "positive" : "negative"
      }`;
      resistanceChangeEl.style.display = "block";
    } else {
      resistanceChangeEl.textContent = "0";
      resistanceChangeEl.className = "my-info-key-stat-change neutral";
      resistanceChangeEl.style.display = "block";
    }
  }

  if (accuracyValueEl) {
    accuracyValueEl.textContent =
      Math.round(statusEffectAccuracy).toLocaleString();
  }
  if (accuracyChangeEl) {
    if (Math.abs(accuracyChange) > 0.01) {
      accuracyChangeEl.textContent =
        accuracyChange > 0
          ? `+${Math.round(accuracyChange).toLocaleString()}`
          : `${Math.round(accuracyChange).toLocaleString()}`;
      accuracyChangeEl.className = `my-info-key-stat-change ${
        accuracyChange > 0 ? "positive" : "negative"
      }`;
      accuracyChangeEl.style.display = "block";
    } else {
      accuracyChangeEl.textContent = "0";
      accuracyChangeEl.className = "my-info-key-stat-change neutral";
      accuracyChangeEl.style.display = "block";
    }
  }
}

function removeBondSpirit(category, index) {
  const bondSpirits = pageState.bondSpirits[category] || [];
  const spirit = bondSpirits[index];

  // 제거되는 환수가 사용 중인 환수인지 확인
  const active = pageState.activeSpirits[category];
  if (active && active.name === spirit.name) {
    pageState.activeSpirits[category] = null;
  }

  bondSpirits.splice(index, 1);
  pageState.bondSpirits[category] = bondSpirits;
  saveData();
  renderBondSlots(category);
  renderActiveSpiritSelect(category);
  renderSpiritList();

  // 캐시 무효화
  pageState.lastTotalStatsHash = null;
  pageState.lastSoulExpHash = null;

  // 디바운스된 업데이트
  debouncedUpdateTotalStats();
  debouncedUpdateSoulExp();
}

async function updateTotalStats() {
  // 기준값 저장 중이면 업데이트하지 않음
  if (pageState.isSavingBaseline) {
    return;
  }

  // 캐시 확인
  const currentHash = generateTotalStatsHash();
  if (
    pageState.lastTotalStatsHash === currentHash &&
    pageState.lastTotalStatsCalculation
  ) {
    // 이미 계산된 경우 저장된 계산 결과로 스탯 아이템만 업데이트
    const calc = pageState.lastTotalStatsCalculation;
    updateStatItemsWithValues(
      calc.allStats,
      calc.allBondStats,
      calc.allActiveStats,
      false
    );
    updateKeyStats(calc.allStats, calc.allBondStats, calc.allActiveStats);
    return;
  }

  try {
    // 각 카테고리별 결속 계산
    const categories = ["수호", "탑승", "변신"];
    const allBondStats = {};
    const allActiveStats = {};

    // 결속 스탯 합산 (직접 계산 - 최대 6개만 선택되므로 API 호출 불필요)
    for (const category of categories) {
      const bondSpirits = pageState.bondSpirits[category] || [];
      if (bondSpirits.length > 0) {
        for (const bondSpirit of bondSpirits) {
          const spirit = getSpiritsForCategory(category).find(
            (s) => s.name === bondSpirit.name
          );
          if (spirit) {
            const level =
              bondSpirit.level !== undefined && bondSpirit.level !== null
                ? bondSpirit.level
                : 25;
            const levelStat = spirit.stats?.find((s) => s.level === level);
            if (levelStat?.bindStat) {
              Object.entries(levelStat.bindStat).forEach(([key, value]) => {
                const numValue =
                  typeof value === "number" ? value : parseFloat(value) || 0;
                allBondStats[key] = (allBondStats[key] || 0) + numValue;
              });
            }
          }
        }
      }
    }

    // 사용 환수 스탯 합산
    for (const category of categories) {
      const active = pageState.activeSpirits[category];
      if (active) {
        const spirit = getSpiritsForCategory(category).find(
          (s) => s.name === active.name
        );
        if (spirit) {
          const levelStat = spirit.stats?.find((s) => s.level === active.level);
          if (levelStat?.registrationStat) {
            Object.entries(levelStat.registrationStat).forEach(
              ([key, value]) => {
                const numValue =
                  typeof value === "number" ? value : parseFloat(value) || 0;
                allActiveStats[key] = (allActiveStats[key] || 0) + numValue;
              }
            );
          }
        }
      }
    }

    // 합산 스탯은 기본 스탯 섹션에 통합되어 표시됨
    const allStats = [...STATS_CONFIG];

    // 기본 스탯 아이템에 합산값과 증감 표시 업데이트
    updateStatItemsWithValues(allStats, allBondStats, allActiveStats);

    // 결과 캐싱
    pageState.lastTotalStatsHash = currentHash;
    pageState.lastTotalStatsCalculation = {
      allStats,
      allBondStats,
      allActiveStats,
    };
  } catch (error) {
    Logger.error("Error updating total stats:", error);
    // 에러가 발생해도 페이지는 표시되도록 (컨테이너를 덮어쓰지 않음)
    // 스탯 계산은 실패했지만 기본 UI는 유지됨
  }
}

// 경험치 테이블 가져오기 (localStorage 캐싱 사용)
async function getExpTable() {
  if (pageState.expTable) {
    return pageState.expTable;
  }

  try {
    // api.fetchSoulExpTable()는 이미 fetchWithSessionCache를 사용하여 localStorage에 캐싱됨
    pageState.expTable = await api.fetchSoulExpTable();
    return pageState.expTable;
  } catch (error) {
    Logger.error("Error fetching exp table:", error);
    return null;
  }
}

// 경험치 테이블을 사용하여 직접 계산
function calculateExpFromTable(expTable, type, currentLevel, targetLevel) {
  if (!expTable || !expTable[type]) {
    return 0;
  }

  const table = expTable[type];
  let totalExp = 0;

  if (targetLevel > currentLevel && targetLevel < table.length) {
    for (let i = currentLevel + 1; i <= targetLevel; i++) {
      totalExp += table[i] || 0;
    }
  }

  return totalExp;
}

// 데이터 해시 생성 (캐시 무효화 확인용)
function generateSoulExpHash() {
  const categories = ["수호", "탑승", "변신"];
  const hashData = categories
    .map((category) => {
      const bondSpirits = pageState.bondSpirits[category] || [];
      return bondSpirits.map((s) => `${s.name}:${s.level || 25}`).join(",");
    })
    .join("|");
  return hashData;
}

// 합산 스탯 데이터 해시 생성
function generateTotalStatsHash() {
  const categories = ["수호", "탑승", "변신"];
  const hashParts = [];

  // 결속 환수 해시
  categories.forEach((category) => {
    const bondSpirits = pageState.bondSpirits[category] || [];
    if (bondSpirits.length > 0) {
      hashParts.push(
        `${category}_bond:${bondSpirits
          .map((s) => `${s.name}:${s.level || 25}`)
          .join(",")}`
      );
    }
  });

  // 사용 환수 해시
  categories.forEach((category) => {
    const active = pageState.activeSpirits[category];
    if (active) {
      hashParts.push(`${category}_active:${active.name}:${active.level || 25}`);
    }
  });

  // 기본 스탯 해시
  const userStatsStr = Object.entries(pageState.userStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join(",");
  hashParts.push(`userStats:${userStatsStr}`);

  return hashParts.join("|");
}

// 결속 계산 캐시 키 생성
function generateBondCacheKey(category, bondSpirits) {
  const spiritsKey = bondSpirits
    .map((s) => `${s.name}:${s.level || 25}`)
    .sort()
    .join(",");
  return `${category}_${spiritsKey}`;
}

async function updateSoulExp() {
  const container = elements.soulExpInfo;

  // 캐시 확인
  const currentHash = generateSoulExpHash();
  if (
    pageState.lastSoulExpHash === currentHash &&
    pageState.lastSoulExpCalculation
  ) {
    container.innerHTML = pageState.lastSoulExpCalculation;
    return;
  }

  container.innerHTML =
    "<p class='text-center text-sm text-light'>계산 중...</p>";

  try {
    // 경험치 테이블 가져오기 (localStorage 캐싱 사용)
    const expTable = await getExpTable();
    if (!expTable) {
      container.innerHTML =
        "<p class='text-center text-sm text-light'>경험치 테이블을 불러올 수 없습니다.</p>";
      return;
    }

    let totalExp = 0;
    const categoryExp = {};

    // 각 카테고리별로 결속 환수들의 경험치 합산
    const categories = ["수호", "탑승", "변신"];

    for (const category of categories) {
      const bondSpirits = pageState.bondSpirits[category] || [];
      let categoryTotal = 0;

      for (const spirit of bondSpirits) {
        if (!spirit.level || spirit.level === 0) continue;

        // 환수 등급 확인
        const spiritData = getSpiritsForCategory(category).find(
          (s) => s.name === spirit.name
        );
        if (!spiritData) continue;

        const grade = spiritData.grade;
        const expType = grade === "불멸" ? "immortal" : "legend";

        // 경험치 테이블을 사용하여 직접 계산 (API 호출 없음)
        const exp = calculateExpFromTable(expTable, expType, 0, spirit.level);
        categoryTotal += exp;
      }

      categoryExp[category] = categoryTotal;
      totalExp += categoryTotal;
    }

    // 결과 표시
    if (totalExp === 0) {
      const emptyHtml =
        "<p class='text-center text-sm text-light'>초기화할 환수가 없습니다.</p>";
      container.innerHTML = emptyHtml;
      pageState.lastSoulExpCalculation = emptyHtml;
      pageState.lastSoulExpHash = currentHash;
      return;
    }

    let html = `<div class="my-info-soul-exp-info">`;

    categories.forEach((category) => {
      if (categoryExp[category] > 0) {
        html += `
          <div class="my-info-soul-exp-item">
            <div class="my-info-soul-exp-label">${category}</div>
            <div class="my-info-soul-exp-value">${categoryExp[
              category
            ].toLocaleString()} exp</div>
          </div>
        `;
      }
    });

    html += `
      <div class="my-info-soul-exp-item" style="background: var(--color-primary-light);">
        <div class="my-info-soul-exp-label">총합</div>
        <div class="my-info-soul-exp-value" style="color: var(--color-primary);">${totalExp.toLocaleString()} exp</div>
      </div>
    `;

    // 저장된 기준 환수혼과 비교
    if (pageState.savedSoulExp > 0) {
      const diff = totalExp - pageState.savedSoulExp;
      let diffText = "";
      let diffColor = "";

      if (diff > 0) {
        diffText = `+${diff.toLocaleString()} exp (부족)`;
        diffColor = "#e74c3c"; // 빨간색
      } else if (diff < 0) {
        diffText = `${diff.toLocaleString()} exp (여유)`;
        diffColor = "#4CAF50"; // 초록색
      } else {
        diffText = "0 exp (동일)";
        diffColor = "var(--text-secondary)";
      }

      html += `
        <div class="my-info-soul-exp-item" style="background: var(--bg-gray); border: 1px solid var(--border-medium);">
          <div class="my-info-soul-exp-label">기준 대비</div>
          <div class="my-info-soul-exp-value" style="color: ${diffColor};">
            ${diffText}
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
            저장된 기준: ${pageState.savedSoulExp.toLocaleString()} exp
          </div>
        </div>
      `;
    }

    html += `</div>`;
    container.innerHTML = html;

    // 결과 캐싱
    pageState.lastSoulExpCalculation = html;
    pageState.lastSoulExpHash = currentHash;
  } catch (error) {
    Logger.error("Error updating soul exp:", error);
    container.innerHTML =
      "<p class='text-center text-sm text-light'>계산 중 오류가 발생했습니다.</p>";
  }
}

function setupEventListeners() {
  // 환수 카테고리 탭 (오른쪽 그리드)
  elements.spiritTabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      const category = e.target.dataset.category;
      if (category && category !== pageState.currentCategory) {
        elements.spiritTabs.forEach((t) => t.classList.remove("active"));
        e.target.classList.add("active");
        pageState.currentCategory = category;
        renderSpiritList();
      }
    });
  });

  // 정보 아이콘 클릭 이벤트
  const infoBtn = elements.container?.querySelector("#saveInfoBtn");
  const infoTooltip = elements.container?.querySelector("#saveInfoTooltip");
  if (infoBtn && infoTooltip) {
    infoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = infoTooltip.style.display === "block";
      infoTooltip.style.display = isVisible ? "none" : "block";
    });

    // 외부 클릭 시 툴팁 닫기
    document.addEventListener("click", (e) => {
      if (
        infoBtn &&
        infoTooltip &&
        !infoBtn.contains(e.target) &&
        !infoTooltip.contains(e.target)
      ) {
        infoTooltip.style.display = "none";
      }
    });
  }

  // 기준값 저장 버튼
  const saveBtn = elements.container?.querySelector("#saveBaselineBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async () => {
      pageState.isSavingBaseline = true;

      try {
        // 현재 스탯 계산
        const allStats = [...STATS_CONFIG];
        const allBondStats = {};
        const allActiveStats = {};

        // 결속 스탯 계산 (직접 계산 - 최대 6개만 선택되므로 API 호출 불필요)
        const categories = ["수호", "탑승", "변신"];
        for (const category of categories) {
          const bondSpirits = pageState.bondSpirits[category] || [];
          if (bondSpirits.length > 0) {
            for (const bondSpirit of bondSpirits) {
              const spirit = getSpiritsForCategory(category).find(
                (s) => s.name === bondSpirit.name
              );
              if (spirit) {
                const level =
                  bondSpirit.level !== undefined && bondSpirit.level !== null
                    ? bondSpirit.level
                    : 25;
                const levelStat = spirit.stats?.find((s) => s.level === level);
                if (levelStat?.bindStat) {
                  Object.entries(levelStat.bindStat).forEach(([key, value]) => {
                    const numValue =
                      typeof value === "number"
                        ? value
                        : parseFloat(value) || 0;
                    allBondStats[key] = (allBondStats[key] || 0) + numValue;
                  });
                }
              }
            }
          }
        }

        // 활성 스탯 계산
        for (const category of categories) {
          const active = pageState.activeSpirits[category];
          if (active) {
            const spirit = getSpiritsForCategory(category).find(
              (s) => s.name === active.name
            );
            if (spirit) {
              const levelStat = spirit.stats?.find(
                (s) => s.level === active.level
              );
              if (levelStat?.registrationStat) {
                Object.entries(levelStat.registrationStat).forEach(
                  ([key, value]) => {
                    const numValue =
                      typeof value === "number"
                        ? value
                        : parseFloat(value) || 0;
                    allActiveStats[key] = (allActiveStats[key] || 0) + numValue;
                  }
                );
              }
            }
          }
        }

        // 스탯 기준값 저장
        allStats.forEach((stat) => {
          const baseValue = pageState.userStats[stat.key] || 0;
          const bondValue = allBondStats[stat.key] || 0;
          const activeValue = allActiveStats[stat.key] || 0;
          pageState.baselineStats[stat.key] =
            baseValue + bondValue + activeValue;
        });

        // 환수혼 경험치 기준값도 함께 저장
        const expTable = pageState.expTable;
        if (expTable) {
          let totalExp = 0;
          for (const category of categories) {
            const bondSpirits = pageState.bondSpirits[category] || [];
            for (const spirit of bondSpirits) {
              if (!spirit.level || spirit.level === 0) continue;
              const spiritData = getSpiritsForCategory(category).find(
                (s) => s.name === spirit.name
              );
              if (!spiritData) continue;
              const grade = spiritData.grade;
              const expType = grade === "불멸" ? "immortal" : "legend";
              const exp = calculateExpFromTable(
                expTable,
                expType,
                0,
                spirit.level
              );
              totalExp += exp;
            }
          }
          pageState.savedSoulExp = totalExp;
        }

        saveData();

        // 모든 수동 편집 플래그 제거
        const allStatItems =
          elements.container?.querySelectorAll("[data-stat]");
        if (allStatItems) {
          allStatItems.forEach((item) => {
            const totalValueSpan = item.querySelector(".my-info-stat-total");
            if (totalValueSpan) {
              delete totalValueSpan.dataset.isManuallyEdited;
              delete totalValueSpan.dataset.lastEditedValue;
              delete totalValueSpan.dataset.lastEditedTime;
            }
          });
        }

        // recentlyEditedStats 초기화
        if (pageState.recentlyEditedStats) {
          pageState.recentlyEditedStats.clear();
        }

        // 캐시 무효화 및 업데이트
        pageState.lastTotalStatsHash = null;
        pageState.lastTotalStatsCalculation = null;

        // 증감을 0으로 표시하기 위해 forceZeroChange=true로 업데이트
        updateStatItemsWithValues(allStats, allBondStats, allActiveStats, true);
        updateKeyStats(allStats, allBondStats, allActiveStats);

        // 저장 피드백
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML =
          '<span style="font-size: 14px; margin-right: 4px;">✓</span><span>저장됨</span>';
        saveBtn.style.background = "var(--color-secondary, #4CAF50)";
        setTimeout(() => {
          saveBtn.innerHTML = originalText;
          saveBtn.style.background = "var(--color-primary)";
        }, 1500);
      } catch (error) {
        Logger.error("Error saving baseline:", error);
      } finally {
        setTimeout(() => {
          pageState.isSavingBaseline = false;
        }, 500);
      }
    });
  }
}

export function init(container) {
  cleanup();

  container.innerHTML = getHTML();

  elements.container = container;
  elements.statsColumn1 = container.querySelector("#statsColumn1");
  elements.statsColumn2 = container.querySelector("#statsColumn2");
  elements.statsColumn3 = container.querySelector("#statsColumn3");
  elements.spiritGrid = container.querySelector("#myInfoSpiritGrid");
  elements.spiritTabs = container.querySelectorAll(".my-info-spirit-tab");
  elements.totalStatsGrid = container.querySelector("#totalStatsGrid");
  elements.soulExpInfo = container.querySelector("#soulExpInfo");

  // 결속 슬롯 요소들
  elements.bondSlots수호 = container.querySelector("#bondSlots수호");
  elements.bondSlots탑승 = container.querySelector("#bondSlots탑승");
  elements.bondSlots변신 = container.querySelector("#bondSlots변신");

  loadUserStats();
  loadSavedData();

  renderStats();

  // 각 카테고리별 렌더링
  const categories = ["수호", "탑승", "변신"];
  categories.forEach((category) => {
    renderBondSlots(category);
    renderActiveSpiritSelect(category);
  });

  renderSpiritList();

  // 이벤트 리스너 먼저 설정 (페이지가 표시되도록)
  setupEventListeners();

  // 경험치 테이블 미리 로드 (localStorage 캐싱 사용)
  getExpTable().catch((error) => {
    Logger.error("Error preloading exp table:", error);
  });

  // 초기 로딩 시에는 즉시 실행 (Promise.all로 완료 대기)
  // 에러가 발생해도 페이지는 표시되도록 처리
  Promise.all([updateTotalStats(), updateSoulExp()])
    .then(() => {
      // 초기 로드 후 baselineStats가 있으면 증감을 다시 계산
      if (Object.keys(pageState.baselineStats).length > 0) {
        // baselineStats가 있으면 스탯을 다시 업데이트하여 증감을 올바르게 표시
        debouncedUpdateTotalStats();
      }
    })
    .catch((error) => {
      Logger.error("Error initializing stats:", error);
      // 에러가 발생해도 기본 스탯은 표시되도록
      // 스탯 아이템이 이미 렌더링되었으므로 페이지는 표시됨
    });
}

// 디바운스된 업데이트 함수들 (800ms 디바운스 - 레벨 변경 시 과도한 API 호출 방지)
const debouncedUpdateTotalStats = debounce(updateTotalStats, 800);
const debouncedUpdateSoulExp = debounce(updateSoulExp, 800);

export function getHelpContentHTML() {
  return `
    <div class="content-block">
      <h2>내정보 페이지 사용 안내</h2>
      <p>내정보 페이지에서는 사용자의 기본 스탯을 입력하고, 현재 사용 중인 환수를 선택하여 합산 스탯을 확인할 수 있습니다.</p>
      
      <h3>🔎 페이지 기능 설명</h3>
      <ul>
        <li><strong>기본 스탯 입력:</strong> 각 스탯 값을 클릭하면 편집할 수 있으며, 자동으로 저장됩니다.</li>
        <li><strong>사용 중인 환수 선택:</strong> 수호/탑승/변신 탭에서 현재 사용 중인 환수를 선택하고 레벨을 설정할 수 있습니다.</li>
        <li><strong>합산 스탯:</strong> 기본 스탯과 환수 결속 효과를 합산한 총 스탯을 확인할 수 있습니다.</li>
        <li><strong>환수 혼 경험치:</strong> 선택한 환수들을 초기화할 경우 획득할 수 있는 환수 혼 경험치를 계산합니다.</li>
      </ul>
    </div>
  `;
}

export function cleanup() {
  // 정리 작업
}
