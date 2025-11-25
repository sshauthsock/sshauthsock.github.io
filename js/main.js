import * as api from "./api.js";
import { setAllSpirits, state as globalState } from "./state.js";
import { showLoading, hideLoading } from "./loadingIndicator.js";
import ErrorHandler from "./utils/errorHandler.js";
import Logger from "./utils/logger.js";
import {
  initPerformanceMonitoring,
  trackPageLoadPerformance,
  trackUserAction,
} from "./utils/performanceMonitor.js";
import errorBoundary from "./utils/errorBoundary.js";
import { showErrorRecoveryUI } from "./components/errorRecovery.js";
import { initServiceWorker } from "./utils/serviceWorker.js";

const pageModules = {
  spiritInfo: () => import("./pages/spiritInfo.js"),
  bondCalculator: () => import("./pages/bondCalculator.js"),
  spiritRanking: () => import("./pages/spiritRanking.js"),
  soulCalculator: () => import("./pages/soulCalculator.js"),
  chakCalculator: () => import("./pages/chakCalculator.js"),
  myInfo: () => import("./pages/myInfo.js"),
};

const appContainer = document.getElementById("app-container");
const mainTabs = document.getElementById("mainTabs");

const helpBtn = document.getElementById("helpBtn");
const helpTooltip = document.getElementById("helpTooltip");
const closeHelpBtn = document.getElementById("closeHelp");
const currentHelpTitle = document.getElementById("currentHelpTitle");
const pageSpecificHelpContent = document.getElementById(
  "pageSpecificHelpContent"
);

if (
  helpBtn &&
  helpTooltip &&
  closeHelpBtn &&
  currentHelpTitle &&
  pageSpecificHelpContent
) {
  helpBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    helpTooltip.style.display =
      helpTooltip.style.display === "block" ? "none" : "block";

    document.body.style.overflow =
      helpTooltip.style.display === "block" ? "hidden" : "auto";
  });

  closeHelpBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    helpTooltip.style.display = "none";
    document.body.style.overflow = "auto";
  });

  document.addEventListener("click", (event) => {
    if (
      !helpBtn.contains(event.target) &&
      !helpTooltip.contains(event.target)
    ) {
      if (helpTooltip.style.display === "block") {
        helpTooltip.style.display = "none";
        document.body.style.overflow = "auto";
      }
    }
  });
} else {
  Logger.error(
    "Help button or related tooltip elements not found in DOM for initialization."
  );
}

async function route() {
  const activeTab = mainTabs.querySelector(".tab.active");
  const pageName = activeTab ? activeTab.dataset.page : "spiritInfo";
  const pageTitle = activeTab ? activeTab.textContent : "환수 정보";

  if (globalState.currentPageModule?.cleanup) {
    try {
      globalState.currentPageModule.cleanup(); // 현재 활성화된 페이지 모듈의 cleanup 호출
      Logger.log(`[Router] Cleaned up previous page.`);
    } catch (e) {
      Logger.error("[Router] Error during page cleanup:", e);
    }
  }

  appContainer.innerHTML = "";
  showLoading(
    appContainer,
    "페이지 로딩 중...",
    "필요한 모듈을 불러오고 있습니다..."
  );

  try {
    const moduleLoader = pageModules[pageName];
    if (!moduleLoader) {
      throw new Error(`'${pageName}' 페이지를 찾을 수 없습니다.`);
    }

    const pageModule = await moduleLoader();
    globalState.currentPageModule = pageModule;

    if (pageModule.init) {
      if (
        !Array.isArray(globalState.allSpirits) ||
        globalState.allSpirits.length === 0
      ) {
        Logger.warn(
          "Global spirits data is empty or not an array when routing. This might cause errors on pages depending on it."
        );
      }

      await pageModule.init(appContainer);
      Logger.log(`[Router] Initialized page: ${pageName}`);

      if (currentHelpTitle && pageSpecificHelpContent) {
        currentHelpTitle.textContent = `${pageTitle} 도움말`;

        if (pageModule.getHelpContentHTML) {
          pageSpecificHelpContent.innerHTML = pageModule.getHelpContentHTML();
        } else {
          pageSpecificHelpContent.innerHTML = `<div class="content-block"><p class="text-center text-light mt-md">이 페이지에 대한 특정 도움말은 없습니다.</p></div>`;
        }
      } else {
        Logger.error(
          "Help tooltip specific content elements not found for update within route()."
        );
      }

      if (typeof gtag === "function") {
        const pagePath = `/bayeon-hwayeon/${pageName}`;
        document.title = `바연화연 | ${pageTitle}`;

        gtag("event", "page_view", {
          page_title: pageTitle,
          page_path: pagePath,
        });
        Logger.log(`[GA4] Page view event sent for: ${pagePath}`);

        // 페이지 로드 성능 추적
        const pageLoadStart = performance.now();
        setTimeout(() => {
          const pageLoadDuration = performance.now() - pageLoadStart;
          trackPageLoadPerformance(pageName, pageLoadDuration);
        }, 100);
      }
    } else {
      Logger.warn(
        `Page module '${pageName}' does not have an init() function.`
      );
      appContainer.innerHTML = `<p class="error-message">페이지를 초기화할 수 없습니다. (init 함수 없음)</p>`;
    }
  } catch (error) {
    Logger.error(
      `[Router] Failed to load or initialize page '${pageName}':`,
      error
    );
    errorBoundary.handleError(error, { type: "page_routing", pageName });

    // 에러 복구 UI 표시
    showErrorRecoveryUI(appContainer, error, {
      title: "페이지 로드 실패",
      onRetry: () => {
        route();
      },
    });
  } finally {
    hideLoading();
  }
}
const footerReportBtn = document.querySelector(".footer-report-btn");

if (footerReportBtn && typeof gtag === "function") {
  footerReportBtn.addEventListener("click", () => {
    gtag("event", "interaction", {
      event_category: "footer_action",
      event_label: "Report Button Click",
      event_action: "Click",
      link_url: "https://open.kakao.com/o/gZdiGDsh",
      page_location: window.location.href,
      page_title: document.title,
    });
    Logger.log("GA4: Report button click event sent.");
  });
}

mainTabs.addEventListener("click", (e) => {
  if (e.target.matches(".tab") && !e.target.classList.contains("active")) {
    mainTabs.querySelector(".tab.active")?.classList.remove("active");
    e.target.classList.add("active");
    route();
  }
});

/**
 * 전역 이미지 에러 핸들러 설정 (WebP 폴백)
 * WebP 이미지 로드 실패 시 자동으로 원본 이미지로 폴백
 */
function setupGlobalImageFallback() {
  // 전역 에러 이벤트 리스너 (capture phase)
  document.addEventListener(
    "error",
    function (event) {
      if (event.target.tagName === "IMG" && event.target.src) {
        const img = event.target;
        // 이미 폴백 시도했거나 원본 경로면 스킵
        if (
          img.dataset.fallbackAttempted === "true" ||
          !img.src.endsWith(".webp")
        ) {
          return;
        }

        // WebP에서 원본으로 폴백
        const originalPath = img.src.replace(/\.webp$/i, ".jpg");
        img.dataset.fallbackAttempted = "true";
        img.src = originalPath;
      }
    },
    true
  ); // capture phase에서 실행

  // 동적으로 추가되는 이미지들도 감지
  if (document.body) {
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            // Element node
            // 직접 추가된 img 태그
            if (
              node.tagName === "IMG" &&
              node.src &&
              node.src.endsWith(".webp")
            ) {
              node.addEventListener(
                "error",
                function () {
                  if (this.dataset.fallbackAttempted !== "true") {
                    const originalPath = this.src.replace(/\.webp$/i, ".jpg");
                    this.dataset.fallbackAttempted = "true";
                    this.src = originalPath;
                  }
                },
                { once: true }
              );
            }
            // 자식 요소 중 img 태그 찾기
            const images =
              node.querySelectorAll &&
              node.querySelectorAll('img[src$=".webp"]');
            if (images) {
              images.forEach(function (img) {
                if (img.dataset.fallbackHandlerAdded !== "true") {
                  img.addEventListener(
                    "error",
                    function () {
                      if (this.dataset.fallbackAttempted !== "true") {
                        const originalPath = this.src.replace(
                          /\.webp$/i,
                          ".jpg"
                        );
                        this.dataset.fallbackAttempted = "true";
                        this.src = originalPath;
                      }
                    },
                    { once: true }
                  );
                  img.dataset.fallbackHandlerAdded = "true";
                }
              });
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

async function initializeApp() {
  // 에러 바운더리 초기화
  errorBoundary.init();

  // 성능 모니터링 초기화
  initPerformanceMonitoring();

  // Service Worker 초기화 (오프라인 지원)
  initServiceWorker();

  // 전역 이미지 폴백 핸들러 설정
  setupGlobalImageFallback();

  const initStartTime = performance.now();
  showLoading(
    appContainer,
    "초기 데이터 로딩 중",
    "서버에서 환수 정보를 불러오고 있습니다..."
  );

  try {
    const allSpiritsRaw = await api.fetchAllSpirits();

    // 이미지 경로 변환 유틸리티 함수 사용
    const { transformSpiritsArrayPaths } = await import("./utils/imagePath.js");
    const allSpiritsTransformed = transformSpiritsArrayPaths(allSpiritsRaw);
    setAllSpirits(allSpiritsTransformed);
    Logger.log("Global state (allSpirits) updated:", globalState.allSpirits);

    await route();

    // 초기화 성능 추적
    const initDuration = performance.now() - initStartTime;
    trackPageLoadPerformance("app_initialization", initDuration);
  } catch (error) {
    Logger.error("애플리케이션 초기화 실패:", error);
    errorBoundary.handleError(error, { type: "app_initialization" });

    // 에러 복구 UI 표시
    showErrorRecoveryUI(appContainer, error, {
      title: "애플리케이션 초기화 실패",
      onRetry: () => {
        window.location.reload();
      },
    });
  } finally {
    hideLoading();
  }
}

initializeApp();
