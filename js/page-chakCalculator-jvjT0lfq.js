import{c as p,f as P}from"./components-B1GG1ywu.js";import{b as $,f as H,h as q,d as A}from"./main-dJC9VFyd.js";import{E as k}from"./utils-DIa4fKeE.js";const a={chakData:null,selectedPart:null,selectedLevel:null,userResources:{goldButton:1e4,colorBall:1e4},statState:{},allAvailableStats:[],selectedStats:[]},s={};function j(){return`
    <div class="layout-container chak-container">
      <div class="equipment-section">
        <div class="panel equipment-panel">
          <h3>장비 부위</h3>
          <div id="equipment-selector" class="button-grid"></div>
        </div>
      </div>
      <div class="level-info-section">
        <div class="panel level-panel">
          <h3>강화 레벨</h3>
          <div id="level-selector" class="level-buttons"></div>
        </div>
        <div class="panel enhancement-panel">
          <h3>능력치 정보</h3>
          <div id="stats-display" class="stats-grid"></div>
        </div>
      </div>
      <div class="panel summary-panel">
        <div class="tool-section">
            <div class="preset-section">
                <button id="boss-preset-btn" class="btn btn-secondary boss-btn">보스용 조합</button>
                <button id="pvp-preset-btn" class="btn btn-primary pvp-btn">피빕용 조합</button>
            </div>
            <div class="search-section">
                <div class="search-input-container">
                    <input id="search-input" placeholder="능력치 검색..." class="search-input">
                    <button id="search-button" class="search-btn">검색</button>
                </div>
                <div class="dropdown-container">
                    <div id="stat-options" class="stat-options"></div>
                </div>
                <div class="selected-stats" id="selected-stats"></div>
            </div>
        </div>
        <h3>능력치 합계 및 자원 현황</h3>
        <div class="resources-section">
          <label class="resource-label">보유 수량</label>
          <div class="resource-inputs">
            <div class="resource-input">
              <img src="assets/img/gold-button.jpg" alt="황금단추" class="resource-icon-img">
              <input type="number" id="gold-button" value="10000" min="0">
            </div>
            <div class="resource-input">
              <img src="assets/img/fivecolored-beads.jpg" alt="오색구슬" class="resource-icon-img">
              <input type="number" id="color-ball" value="10000" min="0">
            </div>
          </div>
          <div class="resource-status">
            <div id="resource-summary"></div>
          </div>
        </div>
        <div id="summary-display" class="summary-box">
          <p>능력치가 개방되면 여기에 합계가 표시됩니다.</p>
        </div>
      </div>
    </div>
  `}async function G(e){e.innerHTML=j(),s.container=e,s.equipmentSelector=e.querySelector("#equipment-selector"),s.levelSelector=e.querySelector("#level-selector"),s.statsDisplay=e.querySelector("#stats-display"),s.summaryDisplay=e.querySelector("#summary-display"),s.goldButton=e.querySelector("#gold-button"),s.colorBall=e.querySelector("#color-ball"),s.bossPresetBtn=e.querySelector("#boss-preset-btn"),s.pvpPresetBtn=e.querySelector("#pvp-preset-btn"),s.searchInput=e.querySelector("#search-input"),s.searchButton=e.querySelector("#search-button"),s.statOptions=e.querySelector("#stat-options"),s.selectedStats=e.querySelector("#selected-stats"),s.resourceSummary=e.querySelector("#resource-summary"),$(e,"착 데이터 로딩 중...","서버에서 착 정보를 불러오고 있습니다...");try{a.chakData=await H(),w(),K(),x(),v(),m(!0),s.equipmentSelector.addEventListener("click",g),s.levelSelector.addEventListener("click",g),s.statsDisplay.addEventListener("click",D),s.goldButton.addEventListener("input",h),s.colorBall.addEventListener("input",h),s.bossPresetBtn.addEventListener("click",()=>S("boss")),s.pvpPresetBtn.addEventListener("click",()=>S("pvp")),N()}catch(t){k.handle(t,"Chak page init"),e.innerHTML=`
      <div class="error-message" style="text-align: center; padding: 2rem;">
        <h3>${k.getUserFriendlyMessage(t.message)}</h3>
      </div>
    `}finally{q()}}function Q(){s.equipmentSelector&&s.equipmentSelector.removeEventListener("click",g),s.levelSelector&&s.levelSelector.removeEventListener("click",g),s.statsDisplay&&s.statsDisplay.removeEventListener("click",D),s.goldButton&&s.goldButton.removeEventListener("input",h),s.colorBall&&s.colorBall.removeEventListener("input",h),s.bossPresetBtn&&s.bossPresetBtn.removeEventListener("click",()=>S("boss")),s.pvpPresetBtn&&s.pvpPresetBtn.removeEventListener("click",()=>S("pvp")),s.searchInput&&s.searchInput.removeEventListener("click",e=>e.stopPropagation()),s.searchInput&&s.searchInput.removeEventListener("input",()=>y(s.searchInput.value)),s.searchButton&&s.searchButton.removeEventListener("click",O),document.removeEventListener("click",()=>{s.statOptions.style.display="none"})}function x(){const{parts:e,levels:t}=a.chakData.constants;a.selectedPart=`${e[0]}_0`,a.selectedLevel=t[0],s.equipmentSelector.innerHTML="",s.levelSelector.innerHTML="",e.forEach((n,l)=>{const i=`${n}_${l}`,r=p("button","selector-btn equip-btn",{text:n,"data-part-id":i});s.equipmentSelector.appendChild(r)}),t.forEach(n=>{const l=p("button","selector-btn level-btn",{"data-level":n});l.innerHTML=`
            <div class="level-text">${n}</div>
            <div class="level-progress-container">
                <div class="level-status"></div>
                <div class="level-progress-bar empty" style="width: 0%;"></div>
            </div>
            <div class="progress-dots">
                ${[...Array(4)].map(()=>'<span class="progress-dot gray"></span>').join("")}
            </div>
        `,s.levelSelector.appendChild(l)}),f()}function v(){if(!a.selectedPart||!a.selectedLevel)return;const e=a.selectedPart.split("_")[0],t=`lv${a.selectedLevel.replace("+","")}`,n=a.chakData.equipment[e]?.[t]||{};s.statsDisplay.innerHTML="";let l=0;Object.entries(n).forEach(([i,r])=>{const o=`${i}_${a.selectedPart}_${a.selectedLevel}_${l}`,c=a.statState[o]||{level:0,value:0,isUnlocked:!1,isFirst:!1},d=F(i,r,c,o,l);s.statsDisplay.appendChild(d),l++}),B(),C()}function F(e,t,n,l,i){const r=e.replace(/\d+$/,""),o=p("div","stat-card",{"data-card-id":l,"data-stat-index":i,"data-stat-name":e});return o.innerHTML=`
        <div class="card-header">
            <h3>${r}</h3>
            <button class="redistribute-btn" title="초기화">↻</button>
        </div>
        <p class="value-display">${n.value} / ${t}</p>
        <div class="progress-container">
            <div class="progress-dots"></div>
            <p class="progress-display">강화 단계: ${n.level}/3</p>
        </div>
        <button class="action-btn"></button>
    `,E(o,n,t),o}function E(e,t,n){e.querySelector(".value-display").textContent=`${t.value} / ${n}`,e.querySelector(".progress-display").textContent=`강화 단계: ${t.level}/3`;const l=e.querySelector(".progress-dots");l.innerHTML=[...Array(3)].map((i,r)=>{let o="gray";return t.isUnlocked&&(o=r<t.level?"blue":"yellow"),`<span class="progress-dot ${o}"></span>`}).join(""),M(e,t)}function B(){const e=Object.values(a.statState).some(t=>t.part===a.selectedPart&&t.partLevel===a.selectedLevel&&t.isFirst);s.statsDisplay.querySelectorAll(".stat-card").forEach(t=>{const n=t.dataset.cardId,l=a.statState[n]||{level:0,isUnlocked:!1,isFirst:!1};M(t,l,e)})}function M(e,t,n=null){const l=e.querySelector(".action-btn");if(!l)return;l.disabled=!1;const i=n??Object.values(a.statState).some(r=>r.part===a.selectedPart&&r.partLevel===a.selectedLevel&&r.isFirst);if(t.isUnlocked)if(t.level>=3)l.innerHTML="<span>완료</span>",l.disabled=!0;else{const r=t.isFirst?"upgradeFirst":`upgradeOther${t.level}`,o=a.chakData.costs[r];l.innerHTML=`<img src="assets/img/fivecolored-beads.jpg" class="btn-icon"> <span>강화 ${o}</span>`}else{const r=i?"unlockOther":"unlockFirst",o=a.chakData.costs[r],c=i?"gold-button.jpg":"fivecolored-beads.jpg";l.innerHTML=`<img src="assets/img/${c}" class="btn-icon"> <span>선택 ${o}</span>`}}function f(){s.equipmentSelector.querySelectorAll(".selector-btn").forEach(e=>{const t=e.dataset.partId===a.selectedPart;e.classList.toggle("active",t),e.classList.toggle("bg-sky-500",t)}),s.levelSelector.querySelectorAll(".selector-btn").forEach(e=>{const t=e.dataset.level===a.selectedLevel;e.classList.toggle("active",t),e.classList.toggle("bg-emerald-500",t)})}function C(){s.levelSelector.querySelectorAll(".level-btn").forEach(e=>{const t=e.dataset.level,n=a.selectedPart.split("_")[0],l=`lv${t.replace("+","")}`,i=a.chakData.equipment[n]?.[l]||{},r=e.querySelector(".progress-dots");if(!r)return;r.innerHTML="";const o=Object.entries(i),c=Math.min(4,o.length);for(let d=0;d<c;d++){const[u]=o[d],I=`${u}_${a.selectedPart}_${t}_${d}`,L=a.statState[I]||{isUnlocked:!1,level:0},b=p("span","progress-dot");L.isUnlocked?b.classList.add(L.level===3?"blue":"yellow"):b.classList.add("gray"),r.appendChild(b)}_(e,Object.values(i).length)})}function _(e,t){const n=e.dataset.level,l=e.querySelector(".level-progress-bar"),i=e.querySelector(".level-status");if(!l||!i||t===0){l&&(l.style.width="0%"),i&&(i.textContent="");return}let r=0,o=0;Object.values(a.statState).forEach(u=>{u.part===a.selectedPart&&u.partLevel===n&&u.isUnlocked&&(r+=u.level,o++)});const c=t*3,d=c>0?Math.round(r/c*100):0;l.style.width=`${d}%`,l.className="level-progress-bar",d===0?l.classList.add("empty"):d<100?l.classList.add("partial"):l.classList.add("complete"),i.textContent=o>0?`${o}/${t} (${d}%)`:""}async function m(e=!1){if(e||Object.keys(a.statState).length===0){s.summaryDisplay.innerHTML="<p>능력치가 개방되면 여기에 합계가 표시됩니다.</p>",s.resourceSummary.innerHTML="";return}$(s.summaryDisplay,"합계 계산 중...");try{const t=await A({statState:a.statState,userResources:a.userResources}),{summary:n,resources:l}=t;let i=Object.keys(n).length>0?`<div class="summary-section"><div class="stat-list">${Object.entries(n).sort((r,o)=>o[1]-r[1]).map(([r,o])=>`<div class="stat-item"><span class="stat-name">${r}</span><span class="stat-value">+${o}</span></div>`).join("")}</div></div>`:"<p>능력치가 개방되지 않았습니다.</p>";s.summaryDisplay.innerHTML=i,s.resourceSummary.innerHTML=`
            <div class="resource-summary-item">
                <img src="assets/img/gold-button.jpg" class="resource-icon-img-small">
                <span class="resource-details">
                    <span class="${l.goldButton.remaining<0?"resource-negative":""}">${l.goldButton.remaining.toLocaleString()}</span> 보유 / <span>${l.goldButton.consumed.toLocaleString()}</span> 소모
                </span>
            </div>
            <div class="resource-summary-item">
                <img src="assets/img/fivecolored-beads.jpg" class="resource-icon-img-small">
                <span class="resource-details">
                    <span class="${l.colorBall.remaining<0?"resource-negative":""}">${l.colorBall.remaining.toLocaleString()}</span> 보유 / <span>${l.colorBall.consumed.toLocaleString()}</span> 소모
                </span>
            </div>
        `}catch(t){alert(`합계 계산 오류: ${t.message}`),console.error("Chak summary calculation failed:",t),s.summaryDisplay.innerHTML='<p class="error-message">계산 중 오류가 발생했습니다.</p>'}finally{q()}}function g(e){const t=e.target.closest(".selector-btn");t&&(t.classList.contains("equip-btn")?a.selectedPart=t.dataset.partId:t.classList.contains("level-btn")&&(a.selectedLevel=t.dataset.level),f(),v())}function D(e){const t=e.target.closest(".stat-card");if(!t)return;const n=t.dataset.cardId,l=t.dataset.statName;if(!l)return;const i=a.selectedPart.split("_")[0],r=`lv${a.selectedLevel.replace("+","")}`,o=(a.chakData.equipment[i]?.[r]||{})[l];if(o===void 0){console.error(`Max value not found for ${l}`);return}let c=JSON.parse(JSON.stringify(a.statState[n]||{level:0,value:0,isUnlocked:!1,isFirst:!1,part:a.selectedPart,partLevel:a.selectedLevel,statName:l,maxValue:o}));if(e.target.closest(".action-btn")){if(c.level>=3)return;if(c.isUnlocked)c.level++;else{const d=Object.values(a.statState).some(u=>u.part===a.selectedPart&&u.partLevel===a.selectedLevel&&u.isFirst);c.isFirst=!d,c.isUnlocked=!0,c.level=0}}else if(e.target.closest(".redistribute-btn")){delete a.statState[n],v(),m();return}else return;c.value=U(c.maxValue,c.level,c.isUnlocked,c.isFirst),a.statState[n]=c,E(t,c,o),B(),C(),m()}function U(e,t,n,l){return n?Math.floor(l?e/3*t:t===0?e/15:e/3*t):0}function h(){a.userResources={goldButton:parseInt(s.goldButton.value,10)||0,colorBall:parseInt(s.colorBall.value,10)||0},m()}function w(){const e=new Set;for(const t in a.chakData.equipment)for(const n in a.chakData.equipment[t])for(const l in a.chakData.equipment[t][n])e.add(l.replace(/\d+$/,""));a.allAvailableStats=Array.from(e).sort()}function K(){s.statOptions.innerHTML="",a.allAvailableStats.forEach(e=>{const t=p("div","stat-option",{text:e});t.addEventListener("click",n=>{n.stopPropagation(),T(e)}),s.statOptions.appendChild(t)})}function N(){s.searchInput.addEventListener("click",e=>{e.stopPropagation(),s.statOptions.style.display="block",y(s.searchInput.value)}),s.searchInput.addEventListener("input",()=>y(s.searchInput.value)),s.searchButton.addEventListener("click",O),document.addEventListener("click",()=>{s.statOptions.style.display="none"})}function y(e){const t=s.statOptions.querySelectorAll(".stat-option");e=e.toLowerCase(),t.forEach(n=>{n.style.display=n.textContent.toLowerCase().includes(e)?"flex":"none"})}function T(e){const t=a.selectedStats.indexOf(e);t===-1?a.selectedStats.push(e):a.selectedStats.splice(t,1),R(),s.statOptions.style.display="none",s.searchInput.value="",y("")}function R(){s.selectedStats.innerHTML="",a.selectedStats.forEach(e=>{const t=p("div","stat-chip",{html:`${e} <span class="remove-stat">×</span>`});t.querySelector(".remove-stat").addEventListener("click",()=>T(e)),s.selectedStats.appendChild(t)})}function S(e){const l=e==="boss"?["피해저항관통","보스몬스터추가피해","치명위력%","파괴력증가","파괴력증가%","경험치획득증가","전리품획득증가"]:["피해저항관통","피해저항","대인방어","대인피해","대인피해%","대인방어%","체력증가","체력증가%","마력증가","마력증가%","치명저항","치명피해저항","상태이상적중","상태이상저항"],i=e==="boss"?"보스용 추천 조합":"PvP용 추천 조합";P(a.chakData,a.statState,i,l,(r,o)=>{a.selectedPart=r,a.selectedLevel=o,f(),v()})}function O(){if(a.selectedStats.length===0){alert("검색할 능력치를 선택해주세요.");return}P(a.chakData,a.statState,"검색 결과",a.selectedStats,(e,t)=>{a.selectedPart=e,a.selectedLevel=t,f(),v()})}function W(){return`
        <div class="content-block">
            <h2>착(장비 강화) 시스템 및 계산기 사용 안내</h2>
            <p>바람의나라: 연의 '착' 시스템은 장비 부위별로 추가 능력치를 개방하고 강화하여 캐릭터를 세밀하게 육성할 수 있는 핵심 콘텐츠입니다. '바연화연'의 착 계산기는 각 부위의 스탯 정보를 확인하고, 원하는 스탯을 가진 부위를 찾아 효과적으로 강화 계획을 세울 수 있도록 돕습니다.</p>

            <h3>🔎 페이지 기능 설명</h3>
            <ul>
                <li><strong>장비 부위 선택:</strong> 좌측 '장비 부위' 섹션에서 강화하려는 부위(투구, 갑옷 등)를 선택하세요.</li>
                <li><strong>강화 레벨 선택:</strong> 선택한 장비 부위의 '강화 레벨'을 선택하세요. 각 레벨별로 개방할 수 있는 능력치가 다릅니다. 레벨별 진행도(개방된 스탯 수)도 확인할 수 있습니다.</li>
                <li><strong>능력치 정보:</strong> 선택된 부위와 레벨에서 개방 가능한 능력치 목록이 표시됩니다.
                    <ul>
                        <li><strong>개방/강화:</strong> 각 스탯 카드 하단의 버튼을 클릭하여 능력치를 개방하거나 강화할 수 있습니다. 첫 번째 능력치 개방은 오색구슬, 이후 능력치 개방은 황금단추가 필요합니다. 강화에는 모두 오색구슬이 소모됩니다.</li>
                        <li><strong>초기화(↻):</strong> 개방된 능력치를 초기화하여 다른 능력치로 재개방할 수 있습니다.</li>
                    </ul>
                </li>
                <li><strong>보유 자원 입력:</strong> '황금 단추'와 '오색 구슬'의 보유 수량을 입력하여 현재 자원으로 개방/강화 가능한 능력치를 파악하고, 총 소모량을 추적할 수 있습니다.</li>
                <li><strong>능력치 합계 및 자원 현황:</strong> 개방된 모든 착 능력치의 총합과, 누적된 황금 단추/오색 구슬 소모량을 실시간으로 보여줍니다.</li>
                <li><strong>프리셋 조합 (보스용, PvP용):</strong> '보스용 조합', 'PvP용 조합' 버튼을 클릭하면 해당 목적에 맞는 추천 스탯들을 가진 착 부위/레벨 목록을 모달 창으로 보여줍니다.</li>
                <li><strong>능력치 검색:</strong> '능력치 검색' 입력창에 원하는 스탯을 입력하거나 선택하여 해당 스탯이 부여되는 모든 착 부위/레벨 목록을 모달 창으로 확인할 수 있습니다.</li>
                <li><strong>모달 내 링크 이동:</strong> 프리셋 또는 검색 결과 모달에서 특정 스탯 위치(예: 투구+1의 피해저항관통)를 클릭하면, 해당 착 부위와 레벨 뷰로 자동으로 이동하여 편리하게 강화 계획을 세울 수 있습니다.</li>
            </ul>

            <h3>💡 착 시스템 팁 & 전략</h3>
            <ul>
                <li><strong>첫 번째 착 개방의 중요성:</strong> 각 착 부위/레벨에서 첫 번째로 개방하는 능력치는 다른 능력치와 비용 및 증가량이 다릅니다. 일반적으로 첫 번째는 오색구슬로, 이후는 황금단추로 개방됩니다.</li>
                <li><strong>비용 효율성:</strong> 착 시스템은 많은 자원을 소모하므로, 필요한 스탯을 파악하고 계획적으로 개방/강화하는 것이 중요합니다. 계산기를 활용하여 자원 소모량을 미리 예측하세요.</li>
                <li><strong>상황별 착 세팅:</strong> 보스 사냥, 일반 사냥, PvP 등 상황에 따라 중요하게 작용하는 착 능력치가 다릅니다. 여러 조합을 시뮬레이션하여 최적의 세팅을 찾아보세요.</li>
            </ul>
        </div>
    `}export{Q as cleanup,W as getHelpContentHTML,G as init};
