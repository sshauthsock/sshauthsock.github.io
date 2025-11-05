import{b as v}from"./utils-CHsLvtYz.js";import{a as O,e as F,h as I,g as N}from"./index-MvYk2PFn.js";import{a as R}from"./supportMessage-C6tx5lCv.js";let b=null;function T(e){return e.replace(/\d+$/,"")}function D(e,t,a,n,i){k();const c=v("div","modal-overlay",{id:"modernChakResultsModal"}),r=v("div","modal-content");if(c.appendChild(r),document.body.appendChild(c),!document.querySelector('link[href*="chakra-results-modern.css"]')){const u=document.createElement("link");u.rel="stylesheet",u.href="public/assets/css/chakra-results-modern.css",document.head.appendChild(u)}const o=v("button","modal-close",{text:"✕"});o.addEventListener("click",k),r.appendChild(o);const d=v("div","modal-header"),p=v("h3","",{text:a});d.appendChild(p),r.appendChild(d);const m=v("div","modern-chakra-container");r.appendChild(m),K(e,t,m,n,i),c.style.display="flex",document.body.style.overflow="hidden";const h=u=>{u.key==="Escape"&&k()};document.addEventListener("keydown",h),c._escListener=h,b=c,c.addEventListener("click",u=>{u.target===c&&k()})}function K(e,t,a,n,i){const c=W(e,n);if(Object.keys(c).length===0){a.innerHTML=`
      <div class="chakra-empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">검색 결과가 없습니다</div>
        <div class="empty-state-description">선택된 능력치를 찾을 수 없습니다.<br>다른 능력치를 선택해보세요.</div>
      </div>
    `;return}const r=v("div","chakra-results-tabs"),o=v("div","chakra-results-content"),d=V(t);a.appendChild(d),a.appendChild(r),a.appendChild(o),Object.entries(c).forEach(([p,m],h)=>{const u=v("div","chakra-tab",{"data-stat":p,text:p}),y=v("span","chakra-tab-badge",{text:`${m.length}곳`});u.appendChild(y);const f=v("div","chakra-tab-panel",{"data-stat":p});h===0&&(u.classList.add("active"),f.classList.add("active")),G(f,m,t,i),r.appendChild(u),o.appendChild(f),u.addEventListener("click",()=>{r.querySelectorAll(".chakra-tab").forEach(g=>g.classList.remove("active")),o.querySelectorAll(".chakra-tab-panel").forEach(g=>g.classList.remove("active")),u.classList.add("active"),f.classList.add("active")})}),R(a)}function V(e,t,a){const n=Q(e),i=v("div","quick-stats-summary"),c=v("div","summary-title");c.innerHTML=`
    <span class="summary-icon">📊</span>
    현재 적용된 능력치 요약
  `;const r=v("div","stats-summary-grid");return Object.keys(n).length===0?r.innerHTML='<div style="grid-column: 1/-1; text-align: center; color: #64748b;">적용된 능력치가 없습니다</div>':Object.entries(n).sort((o,d)=>d[1]-o[1]).forEach(([o,d])=>{const p=v("div","summary-stat-item");p.innerHTML=`
          <span class="summary-stat-name">${o}</span>
          <span class="summary-stat-value">+${d}</span>
        `,r.appendChild(p)}),i.appendChild(c),i.appendChild(r),i}function G(e,t,a,n){const i=t.reduce((r,o)=>{const d=o.part.split("_")[0];return(r[d]=r[d]||[]).push(o),r},{}),c=v("div","equipment-parts-grid");Object.entries(i).forEach(([r,o])=>{const d=v("div","equipment-part-card"),p=J(o,a);p.fullyUpgraded>0?d.classList.add("fully-upgraded"):p.partiallyUpgraded>0&&d.classList.add("has-upgrades");const m=v("div","equipment-card-header");m.innerHTML=`
      <div class="equipment-part-name">
        ${z(r)}
      </div>
      <div class="equipment-progress-info">
        <div class="progress-percentage">${p.progressPercentage}%</div>
        <div>${p.upgradedCount}/${o.length} 강화</div>
      </div>
    `;const h=v("div","upgrade-levels-container");o.sort((u,y)=>{const f=parseInt(u.level.replace(/\D/g,""),10),g=parseInt(y.level.replace(/\D/g,""),10);return f-g}).forEach(u=>{const y=`${u.statName}_${u.part}_${u.level}_${u.index}`,f=a[y]||{isUnlocked:!1,level:0},g=v("div","upgrade-level-row");let L="level-unused",M="미강화";f.isUnlocked&&(f.level===3?(L="level-complete",M="완료"):(L="level-partial",M=`${f.level}/3`)),g.innerHTML=`
          <div class="level-indicator ${L}">
            ${u.level}
          </div>
          <div class="level-details">
            <div class="level-stat-info">
              <div class="level-stat-name">${T(u.statName)}</div>
              <div class="level-stat-value">+${u.maxValue}</div>
            </div>
            <div class="level-status-badge status-${L.replace("level-","")}">
              ${M}
            </div>
          </div>
        `,g.addEventListener("click",()=>{n(u.part,u.level),g.style.background="#dbeafe",setTimeout(()=>{g.style.background=""},300)}),h.appendChild(g)}),d.appendChild(m),d.appendChild(h),c.appendChild(d)}),e.appendChild(c)}function J(e,t){let a=0,n=0,i=0;e.forEach(r=>{const o=`${r.statName}_${r.part}_${r.level}_${r.index}`,d=t[o]||{isUnlocked:!1,level:0};d.isUnlocked&&(a++,d.level===3?n++:i++)});const c=Math.round(a/e.length*100);return{upgradedCount:a,fullyUpgraded:n,partiallyUpgraded:i,progressPercentage:c,totalCount:e.length}}function z(e){return{목걸이:"목걸이",반지:"반지",팔찌:"팔찌",벨트:"벨트",신발:"신발",장갑:"장갑"}[e]||e}function Q(e,t){const a={};return Object.entries(e).forEach(([n,i])=>{if(!i.isUnlocked||i.level===0)return;const c=n.split("_");if(c.length<4)return;const r=c[0],o=T(r),d=10,p=i.level/3,m=Math.round(d*p);a[o]=(a[o]||0)+m}),a}function W(e,t){const a={};e.constants.parts.forEach(i=>{const c=i.split("_")[0];e.constants.levels.forEach(r=>{const o=`lv${r.replace("+","")}`,d=e.equipment[c]?.[o]||{};let p=0;Object.entries(d).forEach(([m,h])=>{const u=T(m);t.includes(u)&&(a[u]||(a[u]=[]),a[u].push({part:i,level:r,statName:m,maxValue:h,index:p,cardId:`${m}_${i}_${r}_${p}`})),p++})})});const n={};return Object.keys(a).sort().forEach(i=>{n[i]=a[i].sort((c,r)=>{const o=c.part.split("_")[0],d=r.part.split("_")[0];if(o!==d)return o.localeCompare(d);const p=parseInt(c.level.replace(/\D/g,""),10),m=parseInt(r.level.replace(/\D/g,""),10);return p-m})}),n}function k(){b&&(document.removeEventListener("keydown",b._escListener),b.remove(),b=null),document.body.style.overflow="auto"}const l={chakData:null,selectedPart:null,selectedLevel:null,userResources:{goldButton:1e4,colorBall:1e4},statState:{},allAvailableStats:[],selectedStats:[]},s={};function X(){return`
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
  `}async function oe(e){e.innerHTML=X(),s.container=e,s.equipmentSelector=e.querySelector("#equipment-selector"),s.levelSelector=e.querySelector("#level-selector"),s.statsDisplay=e.querySelector("#stats-display"),s.summaryDisplay=e.querySelector("#summary-display"),s.goldButton=e.querySelector("#gold-button"),s.colorBall=e.querySelector("#color-ball"),s.bossPresetBtn=e.querySelector("#boss-preset-btn"),s.pvpPresetBtn=e.querySelector("#pvp-preset-btn"),s.searchInput=e.querySelector("#search-input"),s.searchButton=e.querySelector("#search-button"),s.statOptions=e.querySelector("#stat-options"),s.selectedStats=e.querySelector("#selected-stats"),s.resourceSummary=e.querySelector("#resource-summary"),O(e,"착 데이터 로딩 중...","서버에서 착 정보를 불러오고 있습니다...");try{l.chakData=await F(),se(),ae(),Y(),S(),$(),s.equipmentSelector.addEventListener("click",C),s.levelSelector.addEventListener("click",C),s.statsDisplay.addEventListener("click",A),s.goldButton.addEventListener("input",E),s.colorBall.addEventListener("input",E),s.bossPresetBtn.addEventListener("click",()=>P("boss")),s.pvpPresetBtn.addEventListener("click",()=>P("pvp")),le()}catch(t){console.error("Chak page init error:",t),e.innerHTML='<p class="error-message">서버 점검중입니다</p>'}finally{I()}}function de(){s.equipmentSelector&&s.equipmentSelector.removeEventListener("click",C),s.levelSelector&&s.levelSelector.removeEventListener("click",C),s.statsDisplay&&s.statsDisplay.removeEventListener("click",A),s.goldButton&&s.goldButton.removeEventListener("input",E),s.colorBall&&s.colorBall.removeEventListener("input",E),s.bossPresetBtn&&s.bossPresetBtn.removeEventListener("click",()=>P("boss")),s.pvpPresetBtn&&s.pvpPresetBtn.removeEventListener("click",()=>P("pvp")),s.searchInput&&s.searchInput.removeEventListener("click",e=>e.stopPropagation()),s.searchInput&&s.searchInput.removeEventListener("input",()=>q(s.searchInput.value)),s.searchButton&&s.searchButton.removeEventListener("click",w),document.removeEventListener("click",()=>{s.statOptions.style.display="none"})}function Y(){const{parts:e,levels:t}=l.chakData.constants;l.selectedPart=`${e[0]}_0`,l.selectedLevel=t[0],s.equipmentSelector.innerHTML="",s.levelSelector.innerHTML="",e.forEach((a,n)=>{const i=`${a}_${n}`,c=v("button","selector-btn equip-btn",{text:a,"data-part-id":i});s.equipmentSelector.appendChild(c)}),t.forEach(a=>{const n=v("button","selector-btn level-btn",{"data-level":a});n.innerHTML=`
            <div class="level-text">${a}</div>
            <div class="level-progress-container">
                <div class="level-status"></div>
                <div class="level-progress-bar empty" style="width: 0%;"></div>
            </div>
            <div class="progress-dots">
                ${[...Array(4)].map(()=>'<span class="progress-dot gray"></span>').join("")}
            </div>
        `,s.levelSelector.appendChild(n)}),B()}function S(){if(!l.selectedPart||!l.selectedLevel)return;const e=l.selectedPart.split("_")[0],t=`lv${l.selectedLevel.replace("+","")}`,a=l.chakData.equipment[e]?.[t]||{};s.statsDisplay.innerHTML="";let n=0;Object.entries(a).forEach(([i,c])=>{const r=`${i}_${l.selectedPart}_${l.selectedLevel}_${n}`,o=l.statState[r]||{level:0,value:0,isUnlocked:!1,isFirst:!1},d=Z(i,c,o,r,n);s.statsDisplay.appendChild(d),n++}),x(),j()}function Z(e,t,a,n,i){const c=e.replace(/\d+$/,""),r=v("div","stat-card",{"data-card-id":n,"data-stat-index":i,"data-stat-name":e});return r.innerHTML=`
        <div class="card-header">
            <h3>${c}</h3>
            <button class="redistribute-btn" title="초기화">↻</button>
        </div>
        <p class="value-display">${a.value} / ${t}</p>
        <div class="progress-container">
            <div class="progress-dots"></div>
            <p class="progress-display">강화 단계: ${a.level}/3</p>
        </div>
        <button class="action-btn"></button>
    `,_(r,a,t),r}function _(e,t,a){e.querySelector(".value-display").textContent=`${t.value} / ${a}`,e.querySelector(".progress-display").textContent=`강화 단계: ${t.level}/3`;const n=e.querySelector(".progress-dots");n.innerHTML=[...Array(3)].map((i,c)=>{let r="gray";return t.isUnlocked&&(r=c<t.level?"blue":"yellow"),`<span class="progress-dot ${r}"></span>`}).join(""),H(e,t)}function x(){const e=Object.values(l.statState).some(t=>t.part===l.selectedPart&&t.partLevel===l.selectedLevel&&t.isFirst);s.statsDisplay.querySelectorAll(".stat-card").forEach(t=>{const a=t.dataset.cardId,n=l.statState[a]||{level:0,isUnlocked:!1,isFirst:!1};H(t,n,e)})}function H(e,t,a=null){const n=e.querySelector(".action-btn");if(!n)return;n.disabled=!1;const i=a??Object.values(l.statState).some(c=>c.part===l.selectedPart&&c.partLevel===l.selectedLevel&&c.isFirst);if(t.isUnlocked)if(t.level>=3)n.innerHTML="<span>완료</span>",n.disabled=!0;else{const c=t.isFirst?"upgradeFirst":`upgradeOther${t.level}`,r=l.chakData.costs[c];n.innerHTML=`<img src="assets/img/fivecolored-beads.jpg" class="btn-icon"> <span>강화 ${r}</span>`}else{const c=i?"unlockOther":"unlockFirst",r=l.chakData.costs[c],o=i?"gold-button.jpg":"fivecolored-beads.jpg";n.innerHTML=`<img src="assets/img/${o}" class="btn-icon"> <span>선택 ${r}</span>`}}function B(){s.equipmentSelector.querySelectorAll(".selector-btn").forEach(e=>{const t=e.dataset.partId===l.selectedPart;e.classList.toggle("active",t),e.classList.toggle("bg-sky-500",t)}),s.levelSelector.querySelectorAll(".selector-btn").forEach(e=>{const t=e.dataset.level===l.selectedLevel;e.classList.toggle("active",t),e.classList.toggle("bg-emerald-500",t)})}function j(){s.levelSelector.querySelectorAll(".level-btn").forEach(e=>{const t=e.dataset.level,a=l.selectedPart.split("_")[0],n=`lv${t.replace("+","")}`,i=l.chakData.equipment[a]?.[n]||{},c=e.querySelector(".progress-dots");if(!c)return;c.innerHTML="";const r=Object.entries(i),o=Math.min(4,r.length);for(let d=0;d<o;d++){const[p]=r[d],m=`${p}_${l.selectedPart}_${t}_${d}`,h=l.statState[m]||{isUnlocked:!1,level:0},u=v("span","progress-dot");h.isUnlocked?u.classList.add(h.level===3?"blue":"yellow"):u.classList.add("gray"),c.appendChild(u)}ee(e,Object.values(i).length)})}function ee(e,t){const a=e.dataset.level,n=e.querySelector(".level-progress-bar"),i=e.querySelector(".level-status");if(!n||!i||t===0){n&&(n.style.width="0%"),i&&(i.textContent="");return}let c=0,r=0;Object.values(l.statState).forEach(p=>{p.part===l.selectedPart&&p.partLevel===a&&p.isUnlocked&&(c+=p.level,r++)});const o=t*3,d=o>0?Math.round(c/o*100):0;n.style.width=`${d}%`,n.className="level-progress-bar",d===0?n.classList.add("empty"):d<100?n.classList.add("partial"):n.classList.add("complete"),i.textContent=r>0?`${r}/${t} (${d}%)`:""}async function $(){O(s.summaryDisplay,"합계 계산 중...");try{const e=await N({statState:l.statState,userResources:l.userResources}),{summary:t,resources:a}=e;let n=Object.keys(t).length>0?`<div class="summary-section"><div class="stat-list">${Object.entries(t).sort((i,c)=>c[1]-i[1]).map(([i,c])=>`<div class="stat-item"><span class="stat-name">${i}</span><span class="stat-value">+${c}</span></div>`).join("")}</div></div>`:"<p>능력치가 개방되지 않았습니다.</p>";s.summaryDisplay.innerHTML=n,s.resourceSummary.innerHTML=`
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
        `}catch(e){alert(`합계 계산 오류: ${e.message}`),console.error("Chak summary calculation failed:",e),s.summaryDisplay.innerHTML='<p class="error-message">계산 중 오류가 발생했습니다.</p>'}finally{I()}}function C(e){const t=e.target.closest(".selector-btn");t&&(t.classList.contains("equip-btn")?l.selectedPart=t.dataset.partId:t.classList.contains("level-btn")&&(l.selectedLevel=t.dataset.level),B(),S())}function A(e){const t=e.target.closest(".stat-card");if(!t)return;const a=t.dataset.cardId,n=t.dataset.statName;if(!n)return;const i=l.selectedPart.split("_")[0],c=`lv${l.selectedLevel.replace("+","")}`,r=(l.chakData.equipment[i]?.[c]||{})[n];if(r===void 0){console.error(`Max value not found for ${n}`);return}let o=JSON.parse(JSON.stringify(l.statState[a]||{level:0,value:0,isUnlocked:!1,isFirst:!1,part:l.selectedPart,partLevel:l.selectedLevel,statName:n,maxValue:r}));if(e.target.closest(".action-btn")){if(o.level>=3)return;if(o.isUnlocked)o.level++;else{const d=Object.values(l.statState).some(p=>p.part===l.selectedPart&&p.partLevel===l.selectedLevel&&p.isFirst);o.isFirst=!d,o.isUnlocked=!0,o.level=0}}else if(e.target.closest(".redistribute-btn")){delete l.statState[a],S(),$();return}else return;o.value=te(o.maxValue,o.level,o.isUnlocked,o.isFirst),l.statState[a]=o,_(t,o,r),x(),j(),$()}function te(e,t,a,n){return a?Math.floor(n?e/3*t:t===0?e/15:e/3*t):0}function E(){l.userResources={goldButton:parseInt(s.goldButton.value,10)||0,colorBall:parseInt(s.colorBall.value,10)||0},$()}function se(){const e=new Set;for(const t in l.chakData.equipment)for(const a in l.chakData.equipment[t])for(const n in l.chakData.equipment[t][a])e.add(n.replace(/\d+$/,""));l.allAvailableStats=Array.from(e).sort()}function ae(){s.statOptions.innerHTML="",l.allAvailableStats.forEach(e=>{const t=v("div","stat-option",{text:e});t.addEventListener("click",a=>{a.stopPropagation(),U(e)}),s.statOptions.appendChild(t)})}function le(){s.searchInput.addEventListener("click",e=>{e.stopPropagation(),s.statOptions.style.display="block",q(s.searchInput.value)}),s.searchInput.addEventListener("input",()=>q(s.searchInput.value)),s.searchButton.addEventListener("click",w),document.addEventListener("click",()=>{s.statOptions.style.display="none"})}function q(e){const t=s.statOptions.querySelectorAll(".stat-option");e=e.toLowerCase(),t.forEach(a=>{a.style.display=a.textContent.toLowerCase().includes(e)?"flex":"none"})}function U(e){const t=l.selectedStats.indexOf(e);t===-1?l.selectedStats.push(e):l.selectedStats.splice(t,1),ne(),s.statOptions.style.display="none",s.searchInput.value="",q("")}function ne(){s.selectedStats.innerHTML="",l.selectedStats.forEach(e=>{const t=v("div","stat-chip",{html:`${e} <span class="remove-stat">×</span>`});t.querySelector(".remove-stat").addEventListener("click",()=>U(e)),s.selectedStats.appendChild(t)})}function P(e){const n=e==="boss"?["피해저항관통","보스몬스터추가피해","치명위력%","파괴력증가","파괴력증가%","경험치획득증가","전리품획득증가"]:["피해저항관통","피해저항","대인방어","대인피해","대인피해%","대인방어%","체력증가","체력증가%","마력증가","마력증가%","치명저항","치명피해저항","상태이상적중","상태이상저항"],i=e==="boss"?"보스용 추천 조합":"PvP용 추천 조합";D(l.chakData,l.statState,i,n,(c,r)=>{l.selectedPart=c,l.selectedLevel=r,B(),S()})}function w(){if(l.selectedStats.length===0){alert("검색할 능력치를 선택해주세요.");return}D(l.chakData,l.statState,"검색 결과",l.selectedStats,(e,t)=>{l.selectedPart=e,l.selectedLevel=t,B(),S()})}function ue(){return`
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
    `}export{de as cleanup,ue as getHelpContentHTML,oe as init};
