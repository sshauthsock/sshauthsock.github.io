function n(e){e.querySelector(".modal-support-banner")}window.closeSupportBanner=function(){const e=document.getElementById("modalSupportBanner");e&&(e.style.animation="supportBannerSlideOut 0.3s ease-in",setTimeout(()=>{e.remove()},300))};const t=document.createElement("style");t.textContent=`
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
`;document.head.appendChild(t);export{n as a};
