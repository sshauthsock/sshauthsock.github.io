const styleId = "loading-indicator-style";
let loadingOverlay = null;
let loadingProgressInterval = null;

function initStyles() {
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
        .loading-overlay {
            position: absolute; /* Changed from fixed to absolute for #app-container */
            top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(255, 255, 255, 0.8);
            display: flex; justify-content: center; align-items: center;
            z-index: 10000; backdrop-filter: blur(4px);
            opacity: 0; visibility: hidden; transition: opacity 0.3s, visibility 0.3s;
        }
        .loading-overlay.visible { opacity: 1; visibility: visible; }
        .loading-container {
            background-color: #ffffff; border-radius: 15px; padding: 30px;
            text-align: center; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            max-width: 400px; width: 90%;
        }
        .loading-spinner {
            border: 5px solid #e0e0e0; width: 60px; height: 60px;
            border-radius: 50%; border-top-color: #3498db;
            margin: 0 auto 20px; animation: spin 1.2s linear infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .loading-text { margin: 15px 0; color: #333; font-size: 20px; font-weight: bold; }
        .loading-subtext { color: #666; font-size: 14px; margin-bottom: 5px; }
        .loading-progress-container {
            margin-top: 20px;
            display: none;
        }
        .loading-progress-container.visible {
            display: block;
        }
        .loading-progress-bar {
            width: 100%; height: 8px; background-color: #e0e0e0;
            border-radius: 4px; overflow: hidden; margin-bottom: 8px;
        }
        .loading-progress-fill {
            height: 100%; background: linear-gradient(90deg, #3498db, #2ecc71);
            border-radius: 4px; transition: width 0.3s ease;
            width: 0%;
        }
        .loading-progress-text {
            color: #666; font-size: 12px; margin-top: 5px;
        }
        .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: skeleton-loading 1.5s ease-in-out infinite;
            border-radius: 4px;
        }
        @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        .skeleton-text {
            height: 16px; margin-bottom: 8px;
        }
        .skeleton-title {
            height: 24px; width: 60%; margin-bottom: 16px;
        }
        .skeleton-card {
            height: 120px; margin-bottom: 16px;
        }
        .skeleton-image {
            width: 100px; height: 100px; border-radius: 8px;
        }
    `;
  document.head.appendChild(style);
}

export function showLoading(
  container,
  text = "처리 중...",
  subText = "잠시만 기다려주세요."
) {
  if (!container) {
    console.warn("Loading indicator container not provided.");
    return;
  }

  if (loadingOverlay) {
    loadingOverlay.remove();
    loadingOverlay = null;
  }

  if (loadingProgressInterval) {
    clearInterval(loadingProgressInterval);
    loadingProgressInterval = null;
  }

  initStyles();

  loadingOverlay = document.createElement("div");
  loadingOverlay.className = "loading-overlay";
  loadingOverlay.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">${text}</div>
            <div class="loading-subtext">${subText}</div>
            <div class="loading-progress-container" id="loading-progress-container">
                <div class="loading-progress-bar">
                    <div class="loading-progress-fill" id="loading-progress-fill"></div>
                </div>
                <div class="loading-progress-text" id="loading-progress-text"></div>
            </div>
        </div>
    `;
  container.style.position = "relative";
  container.appendChild(loadingOverlay);

  requestAnimationFrame(() => {
    loadingOverlay?.classList.add("visible");
  });
}

/**
 * 진행률 표시와 함께 로딩 표시
 * @param {HTMLElement} container - 로딩을 표시할 컨테이너
 * @param {string} text - 메인 텍스트
 * @param {string} subText - 서브 텍스트
 * @param {number} progress - 진행률 (0-100)
 * @param {string} progressText - 진행률 텍스트 (예: "3/10 완료")
 */
export function showLoadingWithProgress(
  container,
  text = "처리 중...",
  subText = "잠시만 기다려주세요.",
  progress = 0,
  progressText = ""
) {
  showLoading(container, text, subText);

  if (loadingOverlay) {
    const progressContainer = loadingOverlay.querySelector("#loading-progress-container");
    const progressFill = loadingOverlay.querySelector("#loading-progress-fill");
    const progressTextEl = loadingOverlay.querySelector("#loading-progress-text");

    if (progressContainer && progressFill && progressTextEl) {
      progressContainer.classList.add("visible");
      progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
      if (progressText) {
        progressTextEl.textContent = progressText;
      } else {
        progressTextEl.textContent = `${Math.round(progress)}%`;
      }
    }
  }
}

/**
 * 진행률 업데이트
 * @param {number} progress - 진행률 (0-100)
 * @param {string} progressText - 진행률 텍스트 (선택사항)
 */
export function updateLoadingProgress(progress, progressText = "") {
  if (!loadingOverlay) return;

  const progressFill = loadingOverlay.querySelector("#loading-progress-fill");
  const progressTextEl = loadingOverlay.querySelector("#loading-progress-text");

  if (progressFill) {
    progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  if (progressTextEl) {
    if (progressText) {
      progressTextEl.textContent = progressText;
    } else {
      progressTextEl.textContent = `${Math.round(progress)}%`;
    }
  }
}

export function hideLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.remove("visible");
    setTimeout(() => {
      if (loadingOverlay) {
        loadingOverlay.remove();
        loadingOverlay = null;
      }
    }, 300); // transition 시간과 맞춤
  }

  if (loadingProgressInterval) {
    clearInterval(loadingProgressInterval);
    loadingProgressInterval = null;
  }
}

/**
 * 스켈레톤 UI 생성
 * @param {string} type - 스켈레톤 타입 ('text', 'title', 'card', 'image')
 * @param {object} options - 추가 옵션 (width, height 등)
 * @returns {HTMLElement} 스켈레톤 요소
 */
export function createSkeleton(type = "text", options = {}) {
  initStyles();

  const skeleton = document.createElement("div");
  skeleton.className = `skeleton skeleton-${type}`;

  if (options.width) {
    skeleton.style.width = typeof options.width === "number" ? `${options.width}px` : options.width;
  }
  if (options.height) {
    skeleton.style.height = typeof options.height === "number" ? `${options.height}px` : options.height;
  }
  if (options.className) {
    skeleton.className += ` ${options.className}`;
  }

  return skeleton;
}

/**
 * 여러 스켈레톤 요소 생성
 * @param {number} count - 생성할 개수
 * @param {string} type - 스켈레톤 타입
 * @param {object} options - 추가 옵션
 * @returns {HTMLElement[]} 스켈레톤 요소 배열
 */
export function createSkeletons(count, type = "text", options = {}) {
  return Array.from({ length: count }, () => createSkeleton(type, options));
}
