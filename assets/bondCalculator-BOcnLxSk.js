import{a as y,c as B,h as C,s as u}from"./index-DfmrwgZp.js";import{b as g,a as L,c as k}from"./utils-CHsLvtYz.js";import{a as H,s as M}from"./resultModal-CTpKTSlC.js";import{c as E,r as T}from"./statFilter-C1yLqHyh.js";import"./constants-lx1P6xCQ.js";const a={currentCategory:"수호",selectedSpirits:new Map,groupByInfluence:!1,currentStatFilter:""},s={},n={};function I(){return`
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
    </div>`}function p(){v(),x(),b()}function v(){let e=m();a.currentStatFilter&&(e=e.filter(t=>L(t,a.currentStatFilter))),T({container:s.spiritListContainer,spirits:e,onSpiritClick:R,getSpiritState:t=>{const{hasFullRegistration:i,hasFullBind:l,hasLevel25Bind:r}=k(t);return{selected:a.selectedSpirits.has(t.name),registrationCompleted:i,bondCompleted:l,level25BindAvailable:r}},groupByInfluence:a.groupByInfluence})}function m(){const e=l=>l?parseInt(l.match(/\d+/)?.[0]||"999",10):999,i=(Array.isArray(u.allSpirits)?u.allSpirits:[]).filter(l=>l.type===a.currentCategory);return i.sort((l,r)=>{const c={전설:1,불멸:2},o=c[l.grade]||99,d=c[r.grade]||99;return o!==d?o-d:e(l.image)-e(r.image)}),i}function x(){const e=s.selectedSpiritsList;e.innerHTML="";const t=[...a.selectedSpirits.values()].filter(r=>r.type===a.currentCategory);s.selectedCount.textContent=t.length;const i=document.getElementById("mobileSelectedCount");i&&(i.textContent=t.length);const l=document.getElementById("selectedSpiritsMobile");if(l&&(l.innerHTML=""),t.length===0){e.innerHTML="<p class='text-center text-sm text-light mt-lg'>선택된 환수가 없습니다.</p>",l&&(l.innerHTML="<p class='text-center text-sm text-light mt-lg'>선택된 환수가 없습니다.</p>");return}t.forEach(r=>{const c=g("div","selected-spirit-card");if(c.dataset.spiritName=r.name,c.innerHTML=`
        <button class="remove-spirit" data-action="remove" title="선택 해제">×</button>
        <div class="selected-spirit-header">
            <img src="${r.image}" alt="${r.name}">
            <div class="spirit-info">
                <div class="spirit-name">${r.name}</div>
            </div>
        </div>
        <div class="spirit-level-control">
            <button class="level-btn min-btn" data-action="min-level" title="레벨 0으로 설정">0</button>
            <button class="level-btn minus-btn" data-action="level-down" title="레벨 감소">-</button>
            <input type="number" class="level-input" min="0" max="25" value="${r.level}">
            <button class="level-btn plus-btn" data-action="level-up" title="레벨 증가">+</button>
            <button class="level-btn max-btn" data-action="max-level" title="레벨 25로 설정">25</button>
        </div>
        `,e.appendChild(c),l){const o=g("div","selected-spirit-card");o.dataset.spiritName=r.name,o.innerHTML=c.innerHTML,l.appendChild(o)}})}function b(){localStorage.setItem("bondCalculatorState",JSON.stringify({category:a.currentCategory,spirits:[...a.selectedSpirits.values()],groupByInfluence:a.groupByInfluence,currentStatFilter:a.currentStatFilter}))}function A(){const e=localStorage.getItem("bondCalculatorState");if(e)try{const t=JSON.parse(e);a.currentCategory=t.category||"수호",a.selectedSpirits=new Map((t.spirits||[]).map(i=>[i.name,i])),a.groupByInfluence=t.groupByInfluence||!1,a.currentStatFilter=t.currentStatFilter||""}catch(t){console.error("Error loading state from storage, resetting:",t),a.selectedSpirits=new Map,a.groupByInfluence=!1,a.currentStatFilter=""}}function F(){const e=s.container.querySelector(".stat-filter-container"),t=Array.isArray(u.allSpirits)?u.allSpirits:[];E(e,t,r=>{a.currentStatFilter=r,v()});const i=s.container.querySelector("#statFilter"),l=s.container.querySelector(".clear-filter-btn");i&&(i.value=a.currentStatFilter),l&&(l.style.display=a.currentStatFilter?"inline-flex":"none")}function O(){const e=document.getElementById("panelToggleContainer"),t=e?e.querySelector(".right-panel"):null;t&&(t.classList.toggle("collapsed"),e.querySelector(".toggle-icon").textContent=t.classList.contains("collapsed")?"▲":"▼")}function q(){f("mobileBatchLevel")}function w(){X("mobileBatchLevel")}function N(){h()}function P(){n.containerClickHandler=$,s.container.addEventListener("click",n.containerClickHandler),n.bondCategoryTabsClickHandler=c=>{const d=c.target.closest(".tab");d&&!d.classList.contains("active")&&(s.bondCategoryTabs.querySelector(".tab.active")?.classList.remove("active"),d.classList.add("active"),a.currentCategory=d.dataset.category,p())},s.bondCategoryTabs.addEventListener("click",n.bondCategoryTabsClickHandler),n.influenceToggleChangeHandler=J,s.influenceToggle.addEventListener("change",n.influenceToggleChangeHandler),n.selectedSpiritsListInputHandler=S,s.selectedSpiritsList.addEventListener("input",n.selectedSpiritsListInputHandler),n.selectAllClickHandler=G,s.selectAllBtn.addEventListener("click",n.selectAllClickHandler),n.clearAllSelectionClickHandler=U,s.clearAllSelectionBtn.addEventListener("click",n.clearAllSelectionClickHandler),n.applyBatchLevelClickHandler=()=>f("batchLevelInput"),s.applyBatchLevelBtn.addEventListener("click",n.applyBatchLevelClickHandler),n.findOptimalClickHandler=h,s.findOptimalBtn.addEventListener("click",n.findOptimalClickHandler);const e=document.getElementById("panelToggleBtn"),t=document.getElementById("selectedSpiritsMobile"),i=document.getElementById("applyMobileBatchLevelBtn"),l=document.getElementById("setMaxMobileBatchLevelBtn"),r=document.getElementById("findOptimalMobileBtn");e&&(n.panelToggleBtnClickHandler=O,e.addEventListener("click",n.panelToggleBtnClickHandler)),t&&(n.mobileSelectedSpiritsListInputHandler=S,t.addEventListener("input",n.mobileSelectedSpiritsListInputHandler)),i&&(n.applyMobileBatchLevelClickHandler=q,i.addEventListener("click",n.applyMobileBatchLevelClickHandler)),l&&(n.setMaxMobileBatchLevelClickHandler=w,l.addEventListener("click",n.setMaxMobileBatchLevelClickHandler)),r&&(n.findOptimalMobileClickHandler=N,r.addEventListener("click",n.findOptimalMobileClickHandler))}function R(e){if(!e)return;const t=e.name;a.selectedSpirits.has(t)?a.selectedSpirits.delete(t):a.selectedSpirits.set(t,{...e,level:0}),p()}function $(e){const t=e.target,i=t.closest(".selected-spirit-card");if(i){const l=i.dataset.spiritName,r=a.selectedSpirits.get(l);if(!r){console.warn("Selected spirit not found in pageState for:",l);return}const c=t.dataset.action;let o=!1;switch(c){case"remove":a.selectedSpirits.delete(l),o=!0;break;case"min-level":r.level!==0&&(r.level=0,o=!0);break;case"level-down":r.level>0&&(r.level=Math.max(0,r.level-1),o=!0);break;case"level-up":r.level<25&&(r.level=Math.min(25,r.level+1),o=!0);break;case"max-level":r.level!==25&&(r.level=25,o=!0);break}o&&p()}}function J(e){a.groupByInfluence=e.target.checked,b(),v()}function S(e){if(e.target.matches(".level-input")){const t=e.target.closest(".selected-spirit-card"),i=a.selectedSpirits.get(t.dataset.spiritName);if(i){let l=parseInt(e.target.value,10);(isNaN(l)||l<0)&&(l=0),l>25&&(l=25),i.level=l,e.target.value=l,b()}}}function U(){m().forEach(t=>{a.selectedSpirits.has(t.name)&&a.selectedSpirits.delete(t.name)}),p()}function G(){m().forEach(t=>{a.selectedSpirits.has(t.name)||a.selectedSpirits.set(t.name,{...t,level:0})}),p()}function f(e){const t=document.getElementById(e),i=parseInt(t.value,10);if(isNaN(i)||i<0||i>25){alert("0에서 25 사이의 레벨을 입력해주세요.");return}a.selectedSpirits.forEach(l=>{l.type===a.currentCategory&&(l.level=i)}),p()}function X(e){const t=document.getElementById(e);t&&(t.value=25,f(e))}async function h(){const e=[...a.selectedSpirits.values()].filter(i=>i.type===a.currentCategory).map(i=>({name:i.name,level:i.level}));if(e.length===0){alert("현재 탭에서 선택된 환수가 없습니다.");return}const t=document.getElementById("app-container");y(t,"최적 조합 계산 중","유전 알고리즘이 실행 중입니다...");try{const i=await B(e);if(!i||!i.spirits)throw new Error("API에서 유효한 응답을 받지 못했습니다.");H(i),M(i,!1)}catch(i){alert("서버 점검중입니다"),console.error("Optimal combination calculation failed:",i)}finally{C()}}function Q(e){Y(),e.innerHTML=I();const t=`
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
    </div>`,i=g("div","panel-toggle-container",{id:"panelToggleContainer"});i.innerHTML=t,document.body.appendChild(i);const l=s;l.container=e,l.bondCategoryTabs=e.querySelector("#bondCategoryTabs"),l.spiritListContainer=e.querySelector("#spiritListContainer"),l.selectedSpiritsList=e.querySelector("#selectedSpiritsList"),l.selectedCount=e.querySelector("#selectedCount"),l.selectAllBtn=e.querySelector("#selectAllBtn"),l.clearAllSelectionBtn=e.querySelector("#clearAllSelectionBtn"),l.batchLevelInput=e.querySelector("#batchLevelInput"),l.applyBatchLevelBtn=e.querySelector("#applyBatchLevelBtn"),l.findOptimalBtn=e.querySelector("#findOptimalBtn"),l.influenceToggle=e.querySelector("#influenceToggle"),A(),e.querySelectorAll(".sub-tabs .tab").forEach(r=>{r.classList.toggle("active",r.dataset.category===a.currentCategory)}),s.influenceToggle.checked=a.groupByInfluence,P(),F(),p()}function V(){return`
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
    `}function Y(){if(s.container){s.bondCategoryTabs&&n.bondCategoryTabsClickHandler&&s.bondCategoryTabs.removeEventListener("click",n.bondCategoryTabsClickHandler),s.container&&n.containerClickHandler&&s.container.removeEventListener("click",n.containerClickHandler),s.influenceToggle&&n.influenceToggleChangeHandler&&s.influenceToggle.removeEventListener("change",n.influenceToggleChangeHandler),s.selectedSpiritsList&&n.selectedSpiritsListInputHandler&&s.selectedSpiritsList.removeEventListener("input",n.selectedSpiritsListInputHandler),s.selectAllBtn&&n.selectAllClickHandler&&s.selectAllBtn.removeEventListener("click",n.selectAllClickHandler),s.clearAllSelectionBtn&&n.clearAllSelectionClickHandler&&s.clearAllSelectionBtn.removeEventListener("click",n.clearAllSelectionClickHandler),s.applyBatchLevelBtn&&n.applyBatchLevelClickHandler&&s.applyBatchLevelBtn.removeEventListener("click",n.applyBatchLevelClickHandler),s.findOptimalBtn&&n.findOptimalClickHandler&&s.findOptimalBtn.removeEventListener("click",n.findOptimalClickHandler);const e=document.getElementById("panelToggleBtn"),t=document.getElementById("selectedSpiritsMobile"),i=document.getElementById("applyMobileBatchLevelBtn"),l=document.getElementById("setMaxMobileBatchLevelBtn"),r=document.getElementById("findOptimalMobileBtn");e&&n.panelToggleBtnClickHandler&&e.removeEventListener("click",n.panelToggleBtnClickHandler),t&&n.mobileSelectedSpiritsListInputHandler&&t.removeEventListener("input",n.mobileSelectedSpiritsListInputHandler),i&&n.applyMobileBatchLevelClickHandler&&i.removeEventListener("click",n.applyMobileBatchLevelClickHandler),l&&n.setMaxMobileBatchLevelClickHandler&&l.removeEventListener("click",n.setMaxMobileBatchLevelClickHandler),r&&n.findOptimalMobileClickHandler&&r.removeEventListener("click",n.findOptimalMobileClickHandler);const c=document.getElementById("panelToggleContainer");c&&c.remove()}}export{Y as cleanup,V as getHelpContentHTML,Q as init};
