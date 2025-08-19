import{a as T,c as k,h as x,s as h}from"./index-DX-UovPW.js";import{b as v,a as F,c as A}from"./utils-CHsLvtYz.js";import{a as O,s as q}from"./resultModal-z94XDZDX.js";import{c as w,r as H}from"./statFilter-C1yLqHyh.js";import"./constants-lx1P6xCQ.js";const i={currentCategory:"수호",selectedSpirits:new Map,groupByInfluence:!1,currentStatFilter:""},a={};function N(){return`
    <div class="sub-tabs" id="bondCategoryTabs">
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
    <div class="bond-container">
        <div class="main-content">
            <div class="left-panel">
                <div class="section-header">
                    <h2 class="section-title">전체 환수 목록</h2>
                    <div class="selection-controls">
                        <button id="selectAllBtn" class="btn btn-sm btn-primary">전체선택</button>
                        <button id="clearAllSelectionBtn" class="btn btn-sm btn-danger">전체해제</button>
                    </div>
                </div>
                <div id="spiritListContainer" class="spirit-selection"></div>
            </div>
            <div class="right-panel">
                <div class="selected-spirits-container">
                    <div class="selected-spirits-header">
                        <h3 class="selection-title">선택된 환수 (<span id="selectedCount">0</span>)</h3>
                    </div>
                    <div id="selectedSpiritsList" class="selected-spirits"></div>
                    <div class="header-controls">
                        <div class="level-batch-control">
                            <label>일괄 레벨:</label>
                            <input type="number" id="batchLevelInput" min="0" max="25" value="0">
                            <button id="applyBatchLevelBtn" class="btn btn-sm btn-primary">적용</button>
                        </div>
                        <div class="calculate-btn-small">
                            <button id="findOptimalBtn" class="btn btn-warning">최적 조합 찾기</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`}function o(){m(),P(),f()}function m(){let e=b();i.currentStatFilter&&(e=e.filter(t=>F(t,i.currentStatFilter))),H({container:a.spiritListContainer,spirits:e,onSpiritClick:U,getSpiritState:t=>{const{hasFullRegistration:n,hasFullBind:l,hasLevel25Bind:s}=A(t);return{selected:i.selectedSpirits.has(t.name),registrationCompleted:n,bondCompleted:l,level25BindAvailable:s}},groupByInfluence:i.groupByInfluence})}function b(){const e=n=>n?parseInt(n.match(/\d+/)?.[0]||"999",10):999,t=h.allSpirits.filter(n=>n.type===i.currentCategory);return t.sort((n,l)=>{const s={전설:1,불멸:2},r=s[n.grade]||99,c=s[l.grade]||99;return r!==c?r-c:e(n.image)-e(l.image)}),t}function P(){const e=a.selectedSpiritsList;e.innerHTML="";const t=[...i.selectedSpirits.values()].filter(s=>s.type===i.currentCategory);a.selectedCount.textContent=t.length;const n=document.getElementById("mobileSelectedCount");n&&(n.textContent=t.length);const l=document.getElementById("selectedSpiritsMobile");if(l&&(l.innerHTML=""),t.length===0){e.innerHTML="<p class='text-center text-sm text-light mt-lg'>선택된 환수가 없습니다.</p>",l&&(l.innerHTML="<p class='text-center text-sm text-light mt-lg'>선택된 환수가 없습니다.</p>");return}t.forEach(s=>{const r=v("div","selected-spirit-card",{"data-spirit-name":s.name});if(r.innerHTML=`
        <button class="remove-spirit" data-action="remove" title="선택 해제">×</button>
        <div class="selected-spirit-header">
            <img src="${s.image}" alt="${s.name}">
            <div class="spirit-info">
                <div class="spirit-name">${s.name}</div>
            </div>
        </div>
        <div class="spirit-level-control">
            <button class="level-btn min-btn" data-action="min-level" title="레벨 0으로 설정">0</button>
            <button class="level-btn minus-btn" data-action="level-down" title="레벨 감소">-</button>
            <input type="number" class="level-input" min="0" max="25" value="${s.level}">
            <button class="level-btn plus-btn" data-action="level-up" title="레벨 증가">+</button>
            <button class="level-btn max-btn" data-action="max-level" title="레벨 25로 설정">25</button>
        </div>
        `,e.appendChild(r),l){const c=v("div","selected-spirit-card",{"data-spirit-name":s.name});c.innerHTML=r.innerHTML,l.appendChild(c)}})}function f(){localStorage.setItem("bondCalculatorState",JSON.stringify({category:i.currentCategory,spirits:[...i.selectedSpirits.values()],groupByInfluence:i.groupByInfluence,currentStatFilter:i.currentStatFilter}))}function $(){const e=localStorage.getItem("bondCalculatorState");if(e)try{const t=JSON.parse(e);i.currentCategory=t.category||"수호",i.selectedSpirits=new Map((t.spirits||[]).map(n=>[n.name,n])),i.groupByInfluence=t.groupByInfluence||!1,i.currentStatFilter=t.currentStatFilter||""}catch(t){console.error("Error loading state from storage, resetting:",t),i.selectedSpirits=new Map,i.groupByInfluence=!1,i.currentStatFilter=""}}function R(){const e=a.container.querySelector(".stat-filter-container");w(e,h.allSpirits,l=>{i.currentStatFilter=l,m()});const t=a.container.querySelector("#statFilter"),n=a.container.querySelector(".clear-filter-btn");t&&(t.value=i.currentStatFilter),n&&(n.style.display=i.currentStatFilter?"inline-flex":"none")}function S(){const e=document.getElementById("panelToggleContainer"),t=e?e.querySelector(".right-panel"):null;t&&(t.classList.toggle("collapsed"),e.querySelector(".toggle-icon").textContent=t.classList.contains("collapsed")?"▲":"▼")}function y(){p("mobileBatchLevel")}function B(){G("mobileBatchLevel")}function L(){g()}function J(){a.container.addEventListener("click",C),a.influenceToggle.addEventListener("change",E),a.selectedSpiritsList.addEventListener("input",u),a.selectAllBtn.addEventListener("click",I),a.clearAllSelectionBtn.addEventListener("click",M),a.applyBatchLevelBtn.addEventListener("click",()=>p("batchLevelInput")),a.findOptimalBtn.addEventListener("click",g);const e=document.getElementById("panelToggleBtn"),t=document.getElementById("selectedSpiritsMobile"),n=document.getElementById("applyMobileBatchLevelBtn"),l=document.getElementById("setMaxMobileBatchLevelBtn"),s=document.getElementById("findOptimalMobileBtn");e&&e.addEventListener("click",S),t&&t.addEventListener("input",u),n&&n.addEventListener("click",y),l&&l.addEventListener("click",B),s&&s.addEventListener("click",L)}function U(e){if(!e)return;const t=e.name;i.selectedSpirits.has(t)?i.selectedSpirits.delete(t):i.selectedSpirits.set(t,{...e,level:0}),o()}function C(e){const t=e.target,n=t.closest("#bondCategoryTabs .tab");if(n&&!n.classList.contains("active")){a.bondCategoryTabs.querySelector(".tab.active").classList.remove("active"),n.classList.add("active"),i.currentCategory=n.dataset.category,o();return}t.matches("#applyBatchLevelBtn")?p("batchLevelInput"):t.matches("#findOptimalBtn")&&g();const l=t.closest(".selected-spirit-card");if(!l)return;const s=l.dataset.spiritName,r=i.selectedSpirits.get(s);if(!r)return;const c=t.dataset.action;let d=!1;switch(c){case"remove":i.selectedSpirits.delete(s),d=!0;break;case"min-level":r.level!==0&&(r.level=0,d=!0);break;case"level-down":r.level>0&&(r.level=Math.max(0,r.level-1),d=!0);break;case"level-up":r.level<25&&(r.level=Math.min(25,r.level+1),d=!0);break;case"max-level":r.level!==25&&(r.level=25,d=!0);break}d&&o()}function E(e){i.groupByInfluence=e.target.checked,f(),m()}function u(e){if(e.target.matches(".level-input")){const t=e.target.closest(".selected-spirit-card"),n=i.selectedSpirits.get(t.dataset.spiritName);if(n){let l=parseInt(e.target.value,10);(isNaN(l)||l<0)&&(l=0),l>25&&(l=25),n.level=l,e.target.value=l,f()}}}function M(){b().forEach(t=>{i.selectedSpirits.has(t.name)&&i.selectedSpirits.delete(t.name)}),o()}function I(){b().forEach(t=>{i.selectedSpirits.has(t.name)||i.selectedSpirits.set(t.name,{...t,level:0})}),o()}function p(e){const t=document.getElementById(e),n=parseInt(t.value,10);if(isNaN(n)||n<0||n>25){alert("0에서 25 사이의 레벨을 입력해주세요.");return}i.selectedSpirits.forEach(l=>{l.type===i.currentCategory&&(l.level=n)}),o()}function G(e){const t=document.getElementById(e);t&&(t.value=25,p(e))}async function g(){const e=[...i.selectedSpirits.values()].filter(n=>n.type===i.currentCategory).map(n=>({name:n.name,level:n.level}));if(e.length===0){alert("현재 탭에서 선택된 환수가 없습니다.");return}const t=document.getElementById("app-container");T(t,"최적 조합 계산 중","유전 알고리즘이 실행 중입니다...");try{const n=await k(e);if(!n||!n.spirits)throw new Error("API에서 유효한 응답을 받지 못했습니다.");O(n),q(n,!1)}catch(n){alert(`계산 오류: ${n.message}`),console.error("Optimal combination calculation failed:",n)}finally{x()}}function D(e){e.innerHTML=N();const t=`
    <button class="panel-toggle-button" id="panelToggleBtn">
        선택된 환수 <span id="mobileSelectedCount">0</span>개 <span class="toggle-icon">▲</span>
    </button>
    <div class="right-panel collapsed">
        <div class="selected-spirits-container">
            <div class="selected-spirits-header">
                <h3>선택된 환수</h3>
                <div class="header-controls">
                    <div class="level-batch-control">
                        <label>일괄 레벨 설정:</label>
                        <input type="number" id="mobileBatchLevel" min="0" max="25" value="0">
                        <button id="applyMobileBatchLevelBtn" class="btn btn-primary apply-level-btn">적용</button>
                        <button id="setMaxMobileBatchLevelBtn" class="btn btn-warning max-level-btn">Max</button>
                    </div>
                    <div class="calculate-btn-small">
                        <button id="findOptimalMobileBtn" class="btn btn-secondary">찾기</button>
                    </div>
                </div>
            </div>
            <div id="selectedSpiritsMobile" class="selected-spirits"></div>
        </div>
    </div>`,n=v("div","panel-toggle-container",{id:"panelToggleContainer"});n.innerHTML=t,document.body.appendChild(n);const l=a;l.container=e,l.bondCategoryTabs=e.querySelector("#bondCategoryTabs"),l.spiritListContainer=e.querySelector("#spiritListContainer"),l.selectedSpiritsList=e.querySelector("#selectedSpiritsList"),l.selectedCount=e.querySelector("#selectedCount"),l.selectAllBtn=e.querySelector("#selectAllBtn"),l.clearAllSelectionBtn=e.querySelector("#clearAllSelectionBtn"),l.batchLevelInput=e.querySelector("#batchLevelInput"),l.applyBatchLevelBtn=e.querySelector("#applyBatchLevelBtn"),l.findOptimalBtn=e.querySelector("#findOptimalBtn"),l.influenceToggle=e.querySelector("#influenceToggle"),$(),e.querySelectorAll(".sub-tabs .tab").forEach(s=>{s.classList.toggle("active",s.dataset.category===i.currentCategory)}),a.influenceToggle.checked=i.groupByInfluence,J(),R(),o()}function K(){return`
        <div class="content-block">
            <h2>환수 결속 계산기 사용 안내</h2>
            <p>환수 결속 시스템은 5마리 환수의 조합을 통해 다양한 능력치 시너지를 얻는 핵심 콘텐츠입니다. '바연화연'의 결속 계산기는 여러분이 보유한 환수들로 달성할 수 있는 최적의 조합을 찾아드립니다.</p>
            <p>이 계산기는 <strong>피해저항, 피해저항관통, 대인피해%*10, 대인방어%*10</strong>를 합산한 '환산 점수'를 기준으로 최적의 조합을 찾아내며, 유전 알고리즘을 통해 수많은 경우의 수를 빠르게 탐색합니다.</p>

            <h3>🔎 페이지 기능 설명</h3>
            <ul>
                <li><strong>카테고리 선택:</strong> '수호', '탑승', '변신' 탭을 클릭하여 해당 종류의 환수 목록을 확인하세요. 결속 조합은 동일 카테고리 내에서만 가능합니다.</li>
                <li><strong>환수 선택:</strong> 좌측 '전체 환수 목록'에서 결속 조합에 사용할 환수를 클릭하여 선택하세요. 선택된 환수는 우측 '선택된 환수' 목록에 추가됩니다. (레벨은 0으로 자동 설정됩니다.)</li>
                <li><strong>전체 선택/해제:</strong> '현재 탭 전체 선택' 또는 '현재 탭 전체 해제' 버튼을 사용하여 해당 카테고리의 모든 환수를 한 번에 선택하거나 해제할 수 있습니다.</li>
                <li><strong>환수 레벨 조절:</strong> 우측 선택된 환수 목록에서 각 환수의 레벨을 0~25 사이로 조절할 수 있습니다. '일괄 레벨 적용' 기능으로 모든 환수의 레벨을 한 번에 변경할 수도 있습니다.</li>
                <li><strong>최적 조합 찾기:</strong> '최적 조합 찾기' 버튼을 클릭하면 선택된 환수들 중 가장 높은 환산 점수를 내는 5마리 조합을 찾아 모달 창으로 표시합니다.</li>
                <li><strong>결과 모달 확인:</strong>
                    <ul>
                        <li><strong>종합 점수:</strong> 등급 효과, 세력 효과, 장착 효과를 모두 합산한 총 환산 점수를 보여줍니다.</li>
                        <li><strong>조합 환수:</strong> 선택된 5마리 환수의 목록을 보여주며, 각 환수의 레벨도 표시됩니다.</li>
                        <li><strong>효과별 스탯:</strong> 등급, 세력, 장착 효과로 인해 증가하는 능력치 목록과 합산 점수를 확인할 수 있습니다.</li>
                        <li><strong>상세 스탯 비교:</strong> 선택된 5마리 환수 각각의 상세 장착 스탯과 총합을 비교하여 볼 수 있습니다.</li>
                    </ul>
                </li>
                <li><strong>기록 탭:</strong> 이전에 계산했던 최적 조합 결과들을 기록 탭에서 다시 확인하고 비교할 수 있습니다. '최신', '최고' 점수를 쉽게 파악할 수 있습니다.</li>
            </ul>

            <h3>💡 결속 시스템 팁 & 전략</h3>
            <ul>
                <li><strong>PvE와 PvP 조합:</strong> 보스 사냥을 위한 조합(피해저항관통, 보스몬스터추가피해)과 PvP를 위한 조합(대인방어%, 피해저해)은 스탯 우선순위가 다릅니다. 목표에 맞는 조합을 찾아보세요.</li>
                <li><strong>등급 시너지 vs 세력 시너지:</strong> 전설/불멸 환수 갯수에 따른 등급 시너지와 같은 세력 환수 갯수에 따른 세력 시너지을 모두 고려하는 것이 중요합니다. 때로는 낮은 등급이라도 세력 시너지를 맞추는 것이 더 유리할 수 있습니다.</li>
                <li><strong>고레벨 환수의 중요성:</strong> 장착 효과는 환수 레벨에 따라 크게 증가하므로, 주요 환수는 25레벨까지 육성하는 것이 중요합니다.</li>
                <li><strong>모든 환수 활용:</strong> 단순히 보유 환수 중 강한 환수 5마리를 고르는 것이 아니라, 결속 계산기를 통해 예상치 못한 조합이 더 좋은 결과를 낼 수도 있습니다.</li>
            </ul>
        </div>
    `}function Q(){a.container&&a.container.removeEventListener("click",C),a.influenceToggle&&a.influenceToggle.removeEventListener("change",E),a.selectedSpiritsList&&a.selectedSpiritsList.removeEventListener("input",u),a.selectAllBtn&&a.selectAllBtn.removeEventListener("click",I),a.clearAllSelectionBtn&&a.clearAllSelectionBtn.removeEventListener("click",M),a.applyBatchLevelBtn.removeEventListener("click",()=>p("batchLevelInput")),a.findOptimalBtn.removeEventListener("click",g);const e=document.getElementById("panelToggleBtn"),t=document.getElementById("selectedSpiritsMobile"),n=document.getElementById("applyMobileBatchLevelBtn"),l=document.getElementById("setMaxMobileBatchLevelBtn"),s=document.getElementById("findOptimalMobileBtn");e&&e.removeEventListener("click",S),t&&t.removeEventListener("input",u),n&&n.removeEventListener("click",y),l&&l.removeEventListener("click",B),s&&s.removeEventListener("click",L);const r=document.getElementById("panelToggleContainer");r&&r.remove()}export{Q as cleanup,K as getHelpContentHTML,D as init};
