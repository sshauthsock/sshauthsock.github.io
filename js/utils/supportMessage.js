/**
 * 모달 상단에 광고 지원 메시지를 표시하는 유틸리티
 */

// 지원 메시지 표시 여부를 결정하는 로직
function shouldShowSupportMessage() {
  // 테스트를 위해 항상 true 반환 (나중에 원래대로 수정 필요)
  return true;

  // const lastShown = localStorage.getItem('lastSupportMessageShown');
  // const now = Date.now();

  // // 10분마다 한 번씩만 표시
  // if (!lastShown || (now - parseInt(lastShown)) > 10 * 60 * 1000) {
  //   // 30% 확률로 표시
  //   if (Math.random() < 0.3) {
  //     localStorage.setItem('lastSupportMessageShown', now.toString());
  //     return true;
  //   }
  // }

  // return false;
}

// 다양한 지원 메시지 목록
const supportMessages = [
  {
    icon: "💡",
    text: "서버 운영비 지원을 위해 광고 한 번씩 클릭해주세요!",
  },
  {
    icon: "🙏",
    text: "무료 서비스 유지를 위해 애드블록 해제와 광고 클릭 부탁드립니다!",
  },
  {
    icon: "💖",
    text: "서비스가 도움되셨다면 광고 클릭으로 응원해주세요!",
  },
  {
    icon: "☕",
    text: "커피 한 잔 값으로 광고 클릭 한 번 부탁드려요!",
  },
  {
    icon: "🎯",
    text: "서버 운영비가 부족합니다. 광고 클릭으로 도움주세요!",
  },
];

// 랜덤 메시지 선택
function getRandomSupportMessage() {
  const randomIndex = Math.floor(Math.random() * supportMessages.length);
  return supportMessages[randomIndex];
}

// 지원 메시지 배너 HTML 생성
function createSupportBannerHTML() {
  const message = getRandomSupportMessage();

  return `
    <div class="modal-support-banner" id="modalSupportBanner">
      <div class="support-message">
        <span class="support-icon">${message.icon}</span>
        <span class="support-text">${message.text}</span>
      </div>
      <button class="support-close" onclick="closeSupportBanner()" title="닫기">
        ×
      </button>
    </div>
  `;
}

// 지원 메시지를 모달에 추가하는 함수
export function addSupportMessageToModal(modalContentElement) {
  if (!shouldShowSupportMessage()) {
    return;
  }

  // 이미 지원 메시지가 있다면 추가하지 않음
  if (modalContentElement.querySelector(".modal-support-banner")) {
    return;
  }

  // 모달 콘텐츠 최상단에 지원 메시지 추가
  const supportBannerHTML = createSupportBannerHTML();
  modalContentElement.insertAdjacentHTML("afterbegin", supportBannerHTML);
}

// 지원 배너 닫기 함수 (전역으로 등록)
window.closeSupportBanner = function () {
  const banner = document.getElementById("modalSupportBanner");
  if (banner) {
    banner.style.animation = "supportBannerSlideOut 0.3s ease-in";
    setTimeout(() => {
      banner.remove();
    }, 300);
  }
};

// 슬라이드 아웃 애니메이션을 CSS에 추가하기 위한 스타일 삽입
const slideOutStyle = document.createElement("style");
slideOutStyle.textContent = `
  @keyframes supportBannerSlideOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
`;
document.head.appendChild(slideOutStyle);
