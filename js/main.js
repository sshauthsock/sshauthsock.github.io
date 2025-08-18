import * as api from "./api.js";
import { setAllSpirits } from "./state.js";
import { showLoading, hideLoading } from "./loadingIndicator.js";

const pageModules = {
  spiritInfo: () => import("./pages/spiritInfo.js"),
  bondCalculator: () => import("./pages/bondCalculator.js"),
  spiritRanking: () => import("./pages/spiritRanking.js"),
  soulCalculator: () => import("./pages/soulCalculator.js"),
  chakCalculator: () => import("./pages/chakCalculator.js"),
};

const appContainer = document.getElementById("app-container");
const mainTabs = document.getElementById("mainTabs");
let currentPageModule = null;

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
  console.error(
    "Help button or related tooltip elements not found in DOM for initialization."
  );
}

async function route() {
  const activeTab = mainTabs.querySelector(".tab.active");
  const pageName = activeTab ? activeTab.dataset.page : "spiritInfo";
  const pageTitle = activeTab ? activeTab.textContent : "환수 정보";

  if (currentPageModule?.cleanup) {
    try {
      currentPageModule.cleanup();
      console.log(`[Router] Cleaned up previous page.`);
    } catch (e) {
      console.error("[Router] Error during page cleanup:", e);
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
    currentPageModule = pageModule;

    if (pageModule.init) {
      await pageModule.init(appContainer);
      console.log(`[Router] Initialized page: ${pageName}`);

      if (currentHelpTitle && pageSpecificHelpContent) {
        currentHelpTitle.textContent = `${pageTitle} 도움말`;

        if (pageModule.getHelpContentHTML) {
          pageSpecificHelpContent.innerHTML = pageModule.getHelpContentHTML();
        } else {
          pageSpecificHelpContent.innerHTML = `<div class="content-block"><p class="text-center text-light mt-md">이 페이지에 대한 특정 도움말은 없습니다.</p></div>`;
        }
      } else {
        console.error(
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
        console.log(`[GA4] Page view event sent for: ${pagePath}`);
      }
    } else {
      console.warn(
        `Page module '${pageName}' does not have an init() function.`
      );
      appContainer.innerHTML = `<p class="error-message">페이지를 초기화할 수 없습니다. (init 함수 없음)</p>`;
    }
  } catch (error) {
    console.error(
      `[Router] Failed to load or initialize page '${pageName}':`,
      error
    );
    appContainer.innerHTML = `<p class="error-message">페이지를 불러오는 중 오류가 발생했습니다: ${error.message}</p>`;
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
    console.log("GA4: Report button click event sent.");
  });
}

mainTabs.addEventListener("click", (e) => {
  if (e.target.matches(".tab") && !e.target.classList.contains("active")) {
    mainTabs.querySelector(".tab.active")?.classList.remove("active");
    e.target.classList.add("active");
    route();
  }
});

async function initializeApp() {
  showLoading(
    appContainer,
    "초기 데이터 로딩 중",
    "서버에서 환수 정보를 불러오고 있습니다..."
  );

  try {
    const allSpiritsRaw = await api.fetchAllSpirits();

    const allSpiritsTransformed = allSpiritsRaw.map((spirit) => {
      const transformedImage = spirit.image.replace(/^images\//, "assets/img/");
      return {
        ...spirit,
        image: transformedImage,
      };
    });
    setAllSpirits(allSpiritsTransformed);

    await route();
  } catch (error) {
    console.error("애플리케이션 초기화 실패:", error);
    appContainer.innerHTML = `<p class="error-message">애플리케이션 초기화 실패: 데이터를 불러오는 데 실패했습니다. (${error.message})</p>`;
  } finally {
    hideLoading();
  }
}

initializeApp();
