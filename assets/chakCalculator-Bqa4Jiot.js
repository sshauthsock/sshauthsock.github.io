import{b as v}from"./utils-CHsLvtYz.js";import{a as _,e as F,h as O,g as N}from"./index-DMxw-PSo.js";import{a as K}from"./supportMessage-DQwvUf77.js";let b=null;function T(e){return e.replace(/\d+$/,"")}function A(e,t,a,n,i){L();const o=v("div","modal-overlay",{id:"modernChakResultsModal"}),r=v("div","modal-content");if(o.appendChild(r),document.body.appendChild(o),!document.querySelector('link[href*="chakra-results-modern.css"]')){const m=document.createElement("link");m.rel="stylesheet",m.href="public/assets/css/chakra-results-modern.css",document.head.appendChild(m)}const c=v("button","modal-close",{text:"✕"});c.addEventListener("click",L),r.appendChild(c);const d=v("div","kakao-ad-modal-container desktop-modal-ad");d.innerHTML=`
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-aOM3JPGvOLhHlyoS"
          data-ad-width="728"
          data-ad-height="90"></ins>
  `,r.appendChild(d);const u=v("div","kakao-ad-modal-container mobile-modal-ad");u.innerHTML=`
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-epbkjAaeHSxv0MYl"
          data-ad-width="320"
          data-ad-height="50"></ins>
  `,r.appendChild(u);const h=v("div","modal-header"),f=v("h3","",{text:a});h.appendChild(f),r.appendChild(h);const p=v("div","modern-chakra-container");r.appendChild(p),R(e,t,p,n,i),o.style.display="flex",document.body.style.overflow="hidden";const y=m=>{m.key==="Escape"&&L()};document.addEventListener("keydown",y),o._escListener=y,b=o,o.addEventListener("click",m=>{m.target===o&&L()}),setTimeout(()=>{try{const m=d.querySelector(".kakao_ad_area"),g=u.querySelector(".kakao_ad_area");window.adfit&&(m&&window.adfit.render(m),g&&window.adfit.render(g))}catch(m){console.error("Kakao AdFit: Error rendering ads in Chak modal:",m)}},100)}function R(e,t,a,n,i){const o=Q(e,n);if(Object.keys(o).length===0){a.innerHTML=`
      <div class="chakra-empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">검색 결과가 없습니다</div>
        <div class="empty-state-description">선택된 능력치를 찾을 수 없습니다.<br>다른 능력치를 선택해보세요.</div>
      </div>
    `;return}const r=v("div","chakra-results-tabs"),c=v("div","chakra-results-content"),d=V(t);a.appendChild(d),a.appendChild(r),a.appendChild(c),Object.entries(o).forEach(([u,h],f)=>{const p=v("div","chakra-tab",{"data-stat":u,text:u}),y=v("span","chakra-tab-badge",{text:`${h.length}곳`});p.appendChild(y);const m=v("div","chakra-tab-panel",{"data-stat":u});f===0&&(p.classList.add("active"),m.classList.add("active")),G(m,h,t,i),r.appendChild(p),c.appendChild(m),p.addEventListener("click",()=>{r.querySelectorAll(".chakra-tab").forEach(g=>g.classList.remove("active")),c.querySelectorAll(".chakra-tab-panel").forEach(g=>g.classList.remove("active")),p.classList.add("active"),m.classList.add("active")})}),K(a)}function V(e,t,a){const n=Y(e),i=v("div","quick-stats-summary"),o=v("div","summary-title");o.innerHTML=`
    <span class="summary-icon">📊</span>
    현재 적용된 능력치 요약
  `;const r=v("div","stats-summary-grid");return Object.keys(n).length===0?r.innerHTML='<div style="grid-column: 1/-1; text-align: center; color: #64748b;">적용된 능력치가 없습니다</div>':Object.entries(n).sort((c,d)=>d[1]-c[1]).forEach(([c,d])=>{const u=v("div","summary-stat-item");u.innerHTML=`
          <span class="summary-stat-name">${c}</span>
          <span class="summary-stat-value">+${d}</span>
        `,r.appendChild(u)}),i.appendChild(o),i.appendChild(r),i}function G(e,t,a,n){const i=t.reduce((r,c)=>{const d=c.part.split("_")[0];return(r[d]=r[d]||[]).push(c),r},{}),o=v("div","equipment-parts-grid");Object.entries(i).forEach(([r,c])=>{const d=v("div","equipment-part-card"),u=J(c,a);u.fullyUpgraded>0?d.classList.add("fully-upgraded"):u.partiallyUpgraded>0&&d.classList.add("has-upgrades");const h=v("div","equipment-card-header");h.innerHTML=`
      <div class="equipment-part-name">
        ${z(r)}
      </div>
      <div class="equipment-progress-info">
        <div class="progress-percentage">${u.progressPercentage}%</div>
        <div>${u.upgradedCount}/${c.length} 강화</div>
      </div>
    `;const f=v("div","upgrade-levels-container");c.sort((p,y)=>{const m=parseInt(p.level.replace(/\D/g,""),10),g=parseInt(y.level.replace(/\D/g,""),10);return m-g}).forEach(p=>{const y=`${p.statName}_${p.part}_${p.level}_${p.index}`,m=a[y]||{isUnlocked:!1,level:0},g=v("div","upgrade-level-row");let k="level-unused",B="미강화";m.isUnlocked&&(m.level===3?(k="level-complete",B="완료"):(k="level-partial",B=`${m.level}/3`)),g.innerHTML=`
          <div class="level-indicator ${k}">
            ${p.level}
          </div>
          <div class="level-details">
            <div class="level-stat-info">
              <div class="level-stat-name">${T(p.statName)}</div>
              <div class="level-stat-value">+${p.maxValue}</div>
            </div>
            <div class="level-status-badge status-${k.replace("level-","")}">
              ${B}
            </div>
          </div>
        `,g.addEventListener("click",()=>{n(p.part,p.level),g.style.background="#dbeafe",setTimeout(()=>{g.style.background=""},300)}),f.appendChild(g)}),d.appendChild(h),d.appendChild(f),o.appendChild(d)}),e.appendChild(o)}function J(e,t){let a=0,n=0,i=0;e.forEach(r=>{const c=`${r.statName}_${r.part}_${r.level}_${r.index}`,d=t[c]||{isUnlocked:!1,level:0};d.isUnlocked&&(a++,d.level===3?n++:i++)});const o=Math.round(a/e.length*100);return{upgradedCount:a,fullyUpgraded:n,partiallyUpgraded:i,progressPercentage:o,totalCount:e.length}}function z(e){return{목걸이:"목걸이",반지:"반지",팔찌:"팔찌",벨트:"벨트",신발:"신발",장갑:"장갑"}[e]||e}function Y(e,t){const a={};return Object.entries(e).forEach(([n,i])=>{if(!i.isUnlocked||i.level===0)return;const o=n.split("_");if(o.length<4)return;const r=o[0],c=T(r),d=10,u=i.level/3,h=Math.round(d*u);a[c]=(a[c]||0)+h}),a}function Q(e,t){const a={};e.constants.parts.forEach(i=>{const o=i.split("_")[0];e.constants.levels.forEach(r=>{const c=`lv${r.replace("+","")}`,d=e.equipment[o]?.[c]||{};let u=0;Object.entries(d).forEach(([h,f])=>{const p=T(h);t.includes(p)&&(a[p]||(a[p]=[]),a[p].push({part:i,level:r,statName:h,maxValue:f,index:u,cardId:`${h}_${i}_${r}_${u}`})),u++})})});const n={};return Object.keys(a).sort().forEach(i=>{n[i]=a[i].sort((o,r)=>{const c=o.part.split("_")[0],d=r.part.split("_")[0];if(c!==d)return c.localeCompare(d);const u=parseInt(o.level.replace(/\D/g,""),10),h=parseInt(r.level.replace(/\D/g,""),10);return u-h})}),n}function L(){b&&(document.removeEventListener("keydown",b._escListener),b.remove(),b=null),document.body.style.overflow="auto"}const l={chakData:null,selectedPart:null,selectedLevel:null,userResources:{goldButton:1e4,colorBall:1e4},statState:{},allAvailableStats:[],selectedStats:[]},s={};function W(){return`
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
  `}async function ce(e){e.innerHTML=W(),s.container=e,s.equipmentSelector=e.querySelector("#equipment-selector"),s.levelSelector=e.querySelector("#level-selector"),s.statsDisplay=e.querySelector("#stats-display"),s.summaryDisplay=e.querySelector("#summary-display"),s.goldButton=e.querySelector("#gold-button"),s.colorBall=e.querySelector("#color-ball"),s.bossPresetBtn=e.querySelector("#boss-preset-btn"),s.pvpPresetBtn=e.querySelector("#pvp-preset-btn"),s.searchInput=e.querySelector("#search-input"),s.searchButton=e.querySelector("#search-button"),s.statOptions=e.querySelector("#stat-options"),s.selectedStats=e.querySelector("#selected-stats"),s.resourceSummary=e.querySelector("#resource-summary"),_(e,"착 데이터 로딩 중...","서버에서 착 정보를 불러오고 있습니다...");try{l.chakData=await F(),se(),ae(),X(),S(),$(),s.equipmentSelector.addEventListener("click",C),s.levelSelector.addEventListener("click",C),s.statsDisplay.addEventListener("click",j),s.goldButton.addEventListener("input",E),s.colorBall.addEventListener("input",E),s.bossPresetBtn.addEventListener("click",()=>P("boss")),s.pvpPresetBtn.addEventListener("click",()=>P("pvp")),le()}catch(t){console.error("Chak page init error:",t),e.innerHTML='<p class="error-message">서버 점검중입니다</p>'}finally{O()}}function de(){s.equipmentSelector&&s.equipmentSelector.removeEventListener("click",C),s.levelSelector&&s.levelSelector.removeEventListener("click",C),s.statsDisplay&&s.statsDisplay.removeEventListener("click",j),s.goldButton&&s.goldButton.removeEventListener("input",E),s.colorBall&&s.colorBall.removeEventListener("input",E),s.bossPresetBtn&&s.bossPresetBtn.removeEventListener("click",()=>P("boss")),s.pvpPresetBtn&&s.pvpPresetBtn.removeEventListener("click",()=>P("pvp")),s.searchInput&&s.searchInput.removeEventListener("click",e=>e.stopPropagation()),s.searchInput&&s.searchInput.removeEventListener("input",()=>q(s.searchInput.value)),s.searchButton&&s.searchButton.removeEventListener("click",U),document.removeEventListener("click",()=>{s.statOptions.style.display="none"})}function X(){const{parts:e,levels:t}=l.chakData.constants;l.selectedPart=`${e[0]}_0`,l.selectedLevel=t[0],s.equipmentSelector.innerHTML="",s.levelSelector.innerHTML="",e.forEach((a,n)=>{const i=`${a}_${n}`,o=v("button","selector-btn equip-btn",{text:a,"data-part-id":i});s.equipmentSelector.appendChild(o)}),t.forEach(a=>{const n=v("button","selector-btn level-btn",{"data-level":a});n.innerHTML=`
            <div class="level-text">${a}</div>
            <div class="level-progress-container">
                <div class="level-status"></div>
                <div class="level-progress-bar empty" style="width: 0%;"></div>
            </div>
            <div class="progress-dots">
                ${[...Array(4)].map(()=>'<span class="progress-dot gray"></span>').join("")}
            </div>
        `,s.levelSelector.appendChild(n)}),M()}function S(){if(!l.selectedPart||!l.selectedLevel)return;const e=l.selectedPart.split("_")[0],t=`lv${l.selectedLevel.replace("+","")}`,a=l.chakData.equipment[e]?.[t]||{};s.statsDisplay.innerHTML="";let n=0;Object.entries(a).forEach(([i,o])=>{const r=`${i}_${l.selectedPart}_${l.selectedLevel}_${n}`,c=l.statState[r]||{level:0,value:0,isUnlocked:!1,isFirst:!1},d=Z(i,o,c,r,n);s.statsDisplay.appendChild(d),n++}),I(),x()}function Z(e,t,a,n,i){const o=e.replace(/\d+$/,""),r=v("div","stat-card",{"data-card-id":n,"data-stat-index":i,"data-stat-name":e});return r.innerHTML=`
        <div class="card-header">
            <h3>${o}</h3>
            <button class="redistribute-btn" title="초기화">↻</button>
        </div>
        <p class="value-display">${a.value} / ${t}</p>
        <div class="progress-container">
            <div class="progress-dots"></div>
            <p class="progress-display">강화 단계: ${a.level}/3</p>
        </div>
        <button class="action-btn"></button>
    `,D(r,a,t),r}function D(e,t,a){e.querySelector(".value-display").textContent=`${t.value} / ${a}`,e.querySelector(".progress-display").textContent=`강화 단계: ${t.level}/3`;const n=e.querySelector(".progress-dots");n.innerHTML=[...Array(3)].map((i,o)=>{let r="gray";return t.isUnlocked&&(r=o<t.level?"blue":"yellow"),`<span class="progress-dot ${r}"></span>`}).join(""),H(e,t)}function I(){const e=Object.values(l.statState).some(t=>t.part===l.selectedPart&&t.partLevel===l.selectedLevel&&t.isFirst);s.statsDisplay.querySelectorAll(".stat-card").forEach(t=>{const a=t.dataset.cardId,n=l.statState[a]||{level:0,isUnlocked:!1,isFirst:!1};H(t,n,e)})}function H(e,t,a=null){const n=e.querySelector(".action-btn");if(!n)return;n.disabled=!1;const i=a??Object.values(l.statState).some(o=>o.part===l.selectedPart&&o.partLevel===l.selectedLevel&&o.isFirst);if(t.isUnlocked)if(t.level>=3)n.innerHTML="<span>완료</span>",n.disabled=!0;else{const o=t.isFirst?"upgradeFirst":`upgradeOther${t.level}`,r=l.chakData.costs[o];n.innerHTML=`<img src="assets/img/fivecolored-beads.jpg" class="btn-icon"> <span>강화 ${r}</span>`}else{const o=i?"unlockOther":"unlockFirst",r=l.chakData.costs[o],c=i?"gold-button.jpg":"fivecolored-beads.jpg";n.innerHTML=`<img src="assets/img/${c}" class="btn-icon"> <span>선택 ${r}</span>`}}function M(){s.equipmentSelector.querySelectorAll(".selector-btn").forEach(e=>{const t=e.dataset.partId===l.selectedPart;e.classList.toggle("active",t),e.classList.toggle("bg-sky-500",t)}),s.levelSelector.querySelectorAll(".selector-btn").forEach(e=>{const t=e.dataset.level===l.selectedLevel;e.classList.toggle("active",t),e.classList.toggle("bg-emerald-500",t)})}function x(){s.levelSelector.querySelectorAll(".level-btn").forEach(e=>{const t=e.dataset.level,a=l.selectedPart.split("_")[0],n=`lv${t.replace("+","")}`,i=l.chakData.equipment[a]?.[n]||{},o=e.querySelector(".progress-dots");if(!o)return;o.innerHTML="";const r=Object.entries(i),c=Math.min(4,r.length);for(let d=0;d<c;d++){const[u]=r[d],h=`${u}_${l.selectedPart}_${t}_${d}`,f=l.statState[h]||{isUnlocked:!1,level:0},p=v("span","progress-dot");f.isUnlocked?p.classList.add(f.level===3?"blue":"yellow"):p.classList.add("gray"),o.appendChild(p)}ee(e,Object.values(i).length)})}function ee(e,t){const a=e.dataset.level,n=e.querySelector(".level-progress-bar"),i=e.querySelector(".level-status");if(!n||!i||t===0){n&&(n.style.width="0%"),i&&(i.textContent="");return}let o=0,r=0;Object.values(l.statState).forEach(u=>{u.part===l.selectedPart&&u.partLevel===a&&u.isUnlocked&&(o+=u.level,r++)});const c=t*3,d=c>0?Math.round(o/c*100):0;n.style.width=`${d}%`,n.className="level-progress-bar",d===0?n.classList.add("empty"):d<100?n.classList.add("partial"):n.classList.add("complete"),i.textContent=r>0?`${r}/${t} (${d}%)`:""}async function $(){_(s.summaryDisplay,"합계 계산 중...");try{const e=await N({statState:l.statState,userResources:l.userResources}),{summary:t,resources:a}=e;let n=Object.keys(t).length>0?`<div class="summary-section"><div class="stat-list">${Object.entries(t).sort((i,o)=>o[1]-i[1]).map(([i,o])=>`<div class="stat-item"><span class="stat-name">${i}</span><span class="stat-value">+${o}</span></div>`).join("")}</div></div>`:"<p>능력치가 개방되지 않았습니다.</p>";s.summaryDisplay.innerHTML=n,s.resourceSummary.innerHTML=`
            <div class="resource-summary-item">
                <img src="assets/img/gold-button.jpg" class="resource-icon-img-small">
                <span class="resource-details">
                    <span class="${a.goldButton.remaining<0?"resource-negative":""}">${a.goldButton.remaining.toLocaleString()}</span> 보유 / <span>${a.goldButton.consumed.toLocaleString()}</span> 소모
                </span>
            </div>
            <div class="resource-summary-item">
                <img src="assets/img/fivecolored-beads.jpg" class="resource-icon-img-small">
                <span class="resource-details">
                    <span class="${a.colorBall.remaining<0?"resource-negative":""}">${a.colorBall.remaining.toLocaleString()}</span> 보유 / <span>${a.colorBall.consumed.toLocaleString()}</span> 소모
                </span>
            </div>
        `}catch(e){alert(`합계 계산 오류: ${e.message}`),console.error("Chak summary calculation failed:",e),s.summaryDisplay.innerHTML='<p class="error-message">계산 중 오류가 발생했습니다.</p>'}finally{O()}}function C(e){const t=e.target.closest(".selector-btn");t&&(t.classList.contains("equip-btn")?l.selectedPart=t.dataset.partId:t.classList.contains("level-btn")&&(l.selectedLevel=t.dataset.level),M(),S())}function j(e){const t=e.target.closest(".stat-card");if(!t)return;const a=t.dataset.cardId,n=t.dataset.statName;if(!n)return;const i=l.selectedPart.split("_")[0],o=`lv${l.selectedLevel.replace("+","")}`,r=(l.chakData.equipment[i]?.[o]||{})[n];if(r===void 0){console.error(`Max value not found for ${n}`);return}let c=JSON.parse(JSON.stringify(l.statState[a]||{level:0,value:0,isUnlocked:!1,isFirst:!1,part:l.selectedPart,partLevel:l.selectedLevel,statName:n,maxValue:r}));if(e.target.closest(".action-btn")){if(c.level>=3)return;if(c.isUnlocked)c.level++;else{const d=Object.values(l.statState).some(u=>u.part===l.selectedPart&&u.partLevel===l.selectedLevel&&u.isFirst);c.isFirst=!d,c.isUnlocked=!0,c.level=0}}else if(e.target.closest(".redistribute-btn")){delete l.statState[a],S(),$();return}else return;c.value=te(c.maxValue,c.level,c.isUnlocked,c.isFirst),l.statState[a]=c,D(t,c,r),I(),x(),$()}function te(e,t,a,n){return a?Math.floor(n?e/3*t:t===0?e/15:e/3*t):0}function E(){l.userResources={goldButton:parseInt(s.goldButton.value,10)||0,colorBall:parseInt(s.colorBall.value,10)||0},$()}function se(){const e=new Set;for(const t in l.chakData.equipment)for(const a in l.chakData.equipment[t])for(const n in l.chakData.equipment[t][a])e.add(n.replace(/\d+$/,""));l.allAvailableStats=Array.from(e).sort()}function ae(){s.statOptions.innerHTML="",l.allAvailableStats.forEach(e=>{const t=v("div","stat-option",{text:e});t.addEventListener("click",a=>{a.stopPropagation(),w(e)}),s.statOptions.appendChild(t)})}function le(){s.searchInput.addEventListener("click",e=>{e.stopPropagation(),s.statOptions.style.display="block",q(s.searchInput.value)}),s.searchInput.addEventListener("input",()=>q(s.searchInput.value)),s.searchButton.addEventListener("click",U),document.addEventListener("click",()=>{s.statOptions.style.display="none"})}function q(e){const t=s.statOptions.querySelectorAll(".stat-option");e=e.toLowerCase(),t.forEach(a=>{a.style.display=a.textContent.toLowerCase().includes(e)?"flex":"none"})}function w(e){const t=l.selectedStats.indexOf(e);t===-1?l.selectedStats.push(e):l.selectedStats.splice(t,1),ne(),s.statOptions.style.display="none",s.searchInput.value="",q("")}function ne(){s.selectedStats.innerHTML="",l.selectedStats.forEach(e=>{const t=v("div","stat-chip",{html:`${e} <span class="remove-stat">×</span>`});t.querySelector(".remove-stat").addEventListener("click",()=>w(e)),s.selectedStats.appendChild(t)})}function P(e){const n=e==="boss"?["피해저항관통","보스몬스터추가피해","치명위력%","파괴력증가","파괴력증가%","경험치획득증가","전리품획득증가"]:["피해저항관통","피해저항","대인방어","대인피해","대인피해%","대인방어%","체력증가","체력증가%","마력증가","마력증가%","치명저항","치명피해저항","상태이상적중","상태이상저항"],i=e==="boss"?"보스용 추천 조합":"PvP용 추천 조합";A(l.chakData,l.statState,i,n,(o,r)=>{l.selectedPart=o,l.selectedLevel=r,M(),S()})}function U(){if(l.selectedStats.length===0){alert("검색할 능력치를 선택해주세요.");return}A(l.chakData,l.statState,"검색 결과",l.selectedStats,(e,t)=>{l.selectedPart=e,l.selectedLevel=t,M(),S()})}function ue(){return`
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
    `}export{de as cleanup,ue as getHelpContentHTML,ce as init};
