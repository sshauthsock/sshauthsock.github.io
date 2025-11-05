const e=[{icon:"💡",text:"서버 운영비 지원을 위해 광고 한 번씩 클릭해주세요!"},{icon:"🙏",text:"무료 서비스 유지를 위해 애드블록 해제와 광고 클릭 부탁드립니다!"},{icon:"💖",text:"서비스가 도움되셨다면 광고 클릭으로 응원해주세요!"},{icon:"☕",text:"커피 한 잔 값으로 광고 클릭 한 번 부탁드려요!"},{icon:"🎯",text:"서버 운영비가 부족합니다. 광고 클릭으로 도움주세요!"}];function s(){const t=Math.floor(Math.random()*e.length);return e[t]}function a(){const t=s();return`
    <div class="modal-support-banner" id="modalSupportBanner">
      <div class="support-message">
        <span class="support-icon">${t.icon}</span>
        <span class="support-text">${t.text}</span>
      </div>
      <button class="support-close" onclick="closeSupportBanner()" title="닫기">
        ×
      </button>
    </div>
  `}function r(t){if(t.querySelector(".modal-support-banner"))return;const o=a();t.insertAdjacentHTML("afterbegin",o)}window.closeSupportBanner=function(){const t=document.getElementById("modalSupportBanner");t&&(t.style.animation="supportBannerSlideOut 0.3s ease-in",setTimeout(()=>{t.remove()},300))};const n=document.createElement("style");n.textContent=`
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
`;document.head.appendChild(n);export{r as a};
