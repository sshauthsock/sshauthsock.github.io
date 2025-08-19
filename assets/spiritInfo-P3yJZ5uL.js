import{s as g}from"./index-BFDEfZgD.js";import{c as f,a as p}from"./utils-CHsLvtYz.js";import{s as v}from"./modalHandler-CAxpF0W0.js";import{c as S,r as b}from"./statFilter-C1yLqHyh.js";import"./constants-lx1P6xCQ.js";const r={currentCategory:"수호",groupByInfluence:!1,currentStatFilter:""},i={};function m(){return`
    <div class="sub-tabs" id="spiritInfoSubTabs">
        <div class="tab active" data-category="수호">수호</div>
        <div class="tab" data-category="탑승">탑승</div>
        <div class="tab" data-category="변신">변신</div>
    </div>
    <div class="view-toggle-container">
        <label class="toggle-switch">
            <input type="checkbox" id="influenceToggle">
            <span class="slider round"></span>
        </label>
        <span class="toggle-label">세력별 보기</span>
        <div class="stat-filter-container"></div>
        <a href="https://open.kakao.com/o/sUSXtUYe" target="_blank" class="kakao-gift-btn">
            <img src="assets/img/gift.png" alt="카카오 선물하기 아이콘"
                style="height: 20px; vertical-align: middle; margin-right: 5px;">
            개발자에게 카톡 선물하기
        </a>
    </div>
    <div id="spiritGridContainer"></div>
    `}function c(t){if(!t)return 1/0;const e=t.match(/\d+/);return e?parseInt(e[0],10):1/0}function s(){let t=C();r.currentStatFilter&&(t=t.filter(e=>p(e,r.currentStatFilter))),b({container:i.spiritGridContainer,spirits:t,onSpiritClick:h,getSpiritState:y,groupByInfluence:r.groupByInfluence})}function h(t){t&&v(t,r.currentStatFilter)}function y(t){const{hasFullRegistration:e,hasFullBind:n,hasLevel25Bind:a}=f(t);return{selected:!1,registrationCompleted:e,bondCompleted:n,level25BindAvailable:a}}function C(){const t=g.allSpirits.filter(n=>n.type===r.currentCategory),e={전설:1,불멸:2};return t.sort((n,a)=>{const o=e[n.grade]||99,l=e[a.grade]||99;return o!==l?o-l:c(n.image)-c(a.image)}),t}function u(t){const e=t.target.closest(".sub-tabs .tab");e&&!e.classList.contains("active")&&(i.subTabs.querySelector(".tab.active").classList.remove("active"),e.classList.add("active"),r.currentCategory=e.dataset.category,s())}function d(t){r.groupByInfluence=t.target.checked,s()}function T(){const t=i.viewToggleContainer.querySelector(".stat-filter-container");S(t,g.allSpirits,e=>{r.currentStatFilter=e,s()})}function q(t){t.innerHTML=m(),i.container=t,i.subTabs=t.querySelector("#spiritInfoSubTabs"),i.influenceToggle=t.querySelector("#influenceToggle"),i.viewToggleContainer=t.querySelector(".view-toggle-container"),i.spiritGridContainer=t.querySelector("#spiritGridContainer"),i.container.addEventListener("click",u),i.influenceToggle.addEventListener("change",d),T(),s()}function w(){return`
        <div class="content-block">
            <h2>환수 정보 사용 안내</h2>
            <p>환수를 클릭하시면 해당 환수의 <strong>장착 정보</strong>와 <strong>결속 정보</strong>를 상세히 확인하실 수 있습니다.</p>
            <p>또한, <strong>환산 합산</strong>은 다음과 같이 계산됩니다: 피해저항 + 피해저항관통 + (대인피해% * 10) + (대인방어% * 10).</p>

            <h3>🔎 페이지 기능 설명</h3>
            <ul>
                <li><strong>카테고리 선택:</strong> 상단의 '수호', '탑승', '변신' 탭을 클릭하여 원하는 환수 종류의 정보를 확인하세요.</li>
                <li><strong>세력별 보기:</strong> '세력별 보기' 토글을 켜면 환수들을 소속 세력(결의, 고요 등)별로 그룹화하여 볼 수 있습니다. 세력 시너지를 파악하는 데 유용합니다.</li>
                <li><strong>능력치 필터:</strong> 특정 능력치(예: '피해저항관통', '치명위력%')를 가진 환수만 보고 싶을 때 사용하세요. 드롭다운에서 원하는 스탯을 선택하거나 검색하여 필터링할 수 있습니다.</li>
                <li><strong>환수 클릭:</strong> 목록에서 원하는 환수를 클릭하면 해당 환수의 상세 능력치, 등록 및 장착 효과, 그리고 레벨별 스탯 변화를 모달 창으로 확인할 수 있습니다.</li>
            </ul>
        </div>
    `}function x(){i.container&&i.container.removeEventListener("click",u),i.influenceToggle&&i.influenceToggle.removeEventListener("change",d)}export{x as cleanup,w as getHelpContentHTML,q as init};
