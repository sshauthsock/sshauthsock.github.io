import{b as u}from"./utils-CHsLvtYz.js";import{a as I,e as z,h as T,g as V}from"./index-BFDEfZgD.js";let b=null;function J(e){return e.replace(/\d+$/,"")}function _(e,t,n,a,o){k();const r=u("div","modal-overlay",{id:"chakResultsModal"}),c=u("div","modal-content");r.appendChild(c),document.body.appendChild(r);const i=u("button","modal-close",{text:"✕"});i.addEventListener("click",k),c.appendChild(i);const d=u("div","modal-header"),p=u("h3","",{text:n});d.appendChild(p),c.appendChild(d);const v=u("div","optimize-container");c.appendChild(v);const h=u("div","optimize-description");v.appendChild(h);const y=u("div","optimize-results-container");v.appendChild(y),G(e,t,y,a,o),Q(e,t,h,a),r.style.display="flex",document.body.style.overflow="hidden";const m=f=>{f.key==="Escape"&&k()};document.addEventListener("keydown",m),r._escListener=m,b=r,r.addEventListener("click",f=>{f.target===r&&k()})}function G(e,t,n,a,o){n.innerHTML="";const r=X(e,a);if(Object.keys(r).length===0){n.innerHTML='<p class="no-matches">선택된 능력치를 찾을 수 없습니다.</p>';return}Object.entries(r).forEach(([c,i])=>{const d=u("div","compact-group"),p=u("div","compact-stat-title",{html:`
        <span class="stat-name-section">${c}
            <span class="stat-count">(${i.length}곳)</span>
        </span>
        <span class="toggle-icon">+</span>
      `}),v=u("div","stat-group-content");v.style.maxHeight="1000px",p.addEventListener("click",()=>{v.style.maxHeight==="0px"?(v.style.maxHeight=v.scrollHeight+"px",p.querySelector(".toggle-icon").textContent="-"):(v.style.maxHeight="0px",p.querySelector(".toggle-icon").textContent="+")});const h=e.constants.parts,y=i.reduce((m,f)=>{const S=f.part.split("_")[0];return(m[S]=m[S]||[]).push(f),m},{});h.forEach(m=>{const f=y[m];if(!f||f.length===0)return;const S=u("div","part-section"),K=u("div","part-header",{html:`<span>${m}</span> <span class="stat-info">(${f.length}곳)</span>`});S.appendChild(K);const O=u("div","compact-locations");f.forEach(g=>{const R=`${g.statName}_${g.part}_${g.level}_${g.index}`,x=t[R]||{isUnlocked:!1,level:0},$=u("div","compact-location",{"data-part-id":g.part,"data-level":g.level});let H="location-unused";x.isUnlocked&&(H=x.level===3?"location-complete":"location-partial"),$.classList.add(H),$.innerHTML=`
          <div class="loc-header">
            <span class="loc-part" title="${g.part.replace(/_\d+$/,"")}">${g.part.replace(/_\d+$/,"")}</span>
            <span class="loc-level">${g.level}</span>
          </div>
          <div class="loc-details">
            <span class="loc-max-value">+${g.maxValue}</span>
          </div>
        `,$.addEventListener("click",()=>o(g.part,g.level)),O.appendChild($)}),S.appendChild(O),v.appendChild(S)}),d.append(p,v),n.appendChild(d)})}function Q(e,t,n,a){n.innerHTML="";const o=W(t,e),r=a.map(c=>`<span class="priority-stat">${c}</span>`).join("");n.innerHTML=`
    <div class="preset-summary">
        <div class="preset-header">
            <h4>적용된 능력치 요약</h4>
        </div>
        <div class="preset-stats">${r||"<p>선택된 능력치가 없습니다.</p>"}</div>
        <div class="preset-resources">
            <div class="resource-req-title">필요 자원 (현재 적용 상태)</div>
            <div class="resource-req-items">
                <div class="resource-req-item">
                    <img src="assets/img/gold-button.jpg" class="resource-icon-img-small">
                    <span>${o.goldConsumed.toLocaleString()}</span>
                </div>
                <div class="resource-req-item">
                    <img src="assets/img/fivecolored-beads.jpg" class="resource-icon-img-small">
                    <span>${o.ballConsumed.toLocaleString()}</span>
                </div>
            </div>
        </div>
    </div>
  `}function W(e,t){let n=0,a=0;for(const o in e){const r=e[o];r.isUnlocked&&(r.isFirst?a+=r.level*t.costs.upgradeFirst:(n+=t.costs.unlockOther,r.level>=1&&(a+=t.costs.upgradeOther0),r.level>=2&&(a+=t.costs.upgradeOther1),r.level>=3&&(a+=t.costs.upgradeOther2)))}return{goldConsumed:n,ballConsumed:a}}function X(e,t){const n={};e.constants.parts.forEach((o,r)=>{const c=o.split("_")[0];e.constants.levels.forEach(i=>{const d=`lv${i.replace("+","")}`,p=e.equipment[c]?.[d]||{};let v=0;Object.entries(p).forEach(([h,y])=>{const m=J(h);t.includes(m)&&(n[m]||(n[m]=[]),n[m].push({part:o,level:i,statName:h,maxValue:y,index:v,cardId:`${h}_${o}_${i}_${v}`})),v++})})});const a={};return Object.keys(n).sort().forEach(o=>{a[o]=n[o].sort((r,c)=>{const i=r.part.split("_")[0],d=c.part.split("_")[0];if(i!==d)return i.localeCompare(d);const p=parseInt(r.level.replace(/\D/g,""),10),v=parseInt(c.level.replace(/\D/g,""),10);return p-v})}),a}function k(){b&&(document.removeEventListener("keydown",b._escListener),b.remove(),b=null),document.body.style.overflow="auto"}const l={chakData:null,selectedPart:null,selectedLevel:null,userResources:{goldButton:1e4,colorBall:1e4},statState:{},allAvailableStats:[],selectedStats:[]},s={};function Y(){return`
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
  `}async function ie(e){e.innerHTML=Y(),s.container=e,s.equipmentSelector=e.querySelector("#equipment-selector"),s.levelSelector=e.querySelector("#level-selector"),s.statsDisplay=e.querySelector("#stats-display"),s.summaryDisplay=e.querySelector("#summary-display"),s.goldButton=e.querySelector("#gold-button"),s.colorBall=e.querySelector("#color-ball"),s.bossPresetBtn=e.querySelector("#boss-preset-btn"),s.pvpPresetBtn=e.querySelector("#pvp-preset-btn"),s.searchInput=e.querySelector("#search-input"),s.searchButton=e.querySelector("#search-button"),s.statOptions=e.querySelector("#stat-options"),s.selectedStats=e.querySelector("#selected-stats"),s.resourceSummary=e.querySelector("#resource-summary"),I(e,"착 데이터 로딩 중...","서버에서 착 정보를 불러오고 있습니다...");try{l.chakData=await z(),le(),ae(),Z(),L(),C(),s.equipmentSelector.addEventListener("click",q),s.levelSelector.addEventListener("click",q),s.statsDisplay.addEventListener("click",U),s.goldButton.addEventListener("input",E),s.colorBall.addEventListener("input",E),s.bossPresetBtn.addEventListener("click",()=>B("boss")),s.pvpPresetBtn.addEventListener("click",()=>B("pvp")),ne()}catch(t){console.error("Chak page init error:",t),e.innerHTML='<p class="error-message">서버 점검중입니다</p>'}finally{T()}}function de(){s.equipmentSelector&&s.equipmentSelector.removeEventListener("click",q),s.levelSelector&&s.levelSelector.removeEventListener("click",q),s.statsDisplay&&s.statsDisplay.removeEventListener("click",U),s.goldButton&&s.goldButton.removeEventListener("input",E),s.colorBall&&s.colorBall.removeEventListener("input",E),s.bossPresetBtn&&s.bossPresetBtn.removeEventListener("click",()=>B("boss")),s.pvpPresetBtn&&s.pvpPresetBtn.removeEventListener("click",()=>B("pvp")),s.searchInput&&s.searchInput.removeEventListener("click",e=>e.stopPropagation()),s.searchInput&&s.searchInput.removeEventListener("input",()=>P(s.searchInput.value)),s.searchButton&&s.searchButton.removeEventListener("click",N),document.removeEventListener("click",()=>{s.statOptions.style.display="none"})}function Z(){const{parts:e,levels:t}=l.chakData.constants;l.selectedPart=`${e[0]}_0`,l.selectedLevel=t[0],s.equipmentSelector.innerHTML="",s.levelSelector.innerHTML="",e.forEach((n,a)=>{const o=`${n}_${a}`,r=u("button","selector-btn equip-btn",{text:n,"data-part-id":o});s.equipmentSelector.appendChild(r)}),t.forEach(n=>{const a=u("button","selector-btn level-btn",{"data-level":n});a.innerHTML=`
            <div class="level-text">${n}</div>
            <div class="level-progress-container">
                <div class="level-status"></div>
                <div class="level-progress-bar empty" style="width: 0%;"></div>
            </div>
            <div class="progress-dots">
                ${[...Array(4)].map(()=>'<span class="progress-dot gray"></span>').join("")}
            </div>
        `,s.levelSelector.appendChild(a)}),M()}function L(){if(!l.selectedPart||!l.selectedLevel)return;const e=l.selectedPart.split("_")[0],t=`lv${l.selectedLevel.replace("+","")}`,n=l.chakData.equipment[e]?.[t]||{};s.statsDisplay.innerHTML="";let a=0;Object.entries(n).forEach(([o,r])=>{const c=`${o}_${l.selectedPart}_${l.selectedLevel}_${a}`,i=l.statState[c]||{level:0,value:0,isUnlocked:!1,isFirst:!1},d=ee(o,r,i,c,a);s.statsDisplay.appendChild(d),a++}),A(),w()}function ee(e,t,n,a,o){const r=e.replace(/\d+$/,""),c=u("div","stat-card",{"data-card-id":a,"data-stat-index":o,"data-stat-name":e});return c.innerHTML=`
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
    `,j(c,n,t),c}function j(e,t,n){e.querySelector(".value-display").textContent=`${t.value} / ${n}`,e.querySelector(".progress-display").textContent=`강화 단계: ${t.level}/3`;const a=e.querySelector(".progress-dots");a.innerHTML=[...Array(3)].map((o,r)=>{let c="gray";return t.isUnlocked&&(c=r<t.level?"blue":"yellow"),`<span class="progress-dot ${c}"></span>`}).join(""),D(e,t)}function A(){const e=Object.values(l.statState).some(t=>t.part===l.selectedPart&&t.partLevel===l.selectedLevel&&t.isFirst);s.statsDisplay.querySelectorAll(".stat-card").forEach(t=>{const n=t.dataset.cardId,a=l.statState[n]||{level:0,isUnlocked:!1,isFirst:!1};D(t,a,e)})}function D(e,t,n=null){const a=e.querySelector(".action-btn");if(!a)return;a.disabled=!1;const o=n??Object.values(l.statState).some(r=>r.part===l.selectedPart&&r.partLevel===l.selectedLevel&&r.isFirst);if(t.isUnlocked)if(t.level>=3)a.innerHTML="<span>완료</span>",a.disabled=!0;else{const r=t.isFirst?"upgradeFirst":`upgradeOther${t.level}`,c=l.chakData.costs[r];a.innerHTML=`<img src="assets/img/fivecolored-beads.jpg" class="btn-icon"> <span>강화 ${c}</span>`}else{const r=o?"unlockOther":"unlockFirst",c=l.chakData.costs[r],i=o?"gold-button.jpg":"fivecolored-beads.jpg";a.innerHTML=`<img src="assets/img/${i}" class="btn-icon"> <span>선택 ${c}</span>`}}function M(){s.equipmentSelector.querySelectorAll(".selector-btn").forEach(e=>{const t=e.dataset.partId===l.selectedPart;e.classList.toggle("active",t),e.classList.toggle("bg-sky-500",t)}),s.levelSelector.querySelectorAll(".selector-btn").forEach(e=>{const t=e.dataset.level===l.selectedLevel;e.classList.toggle("active",t),e.classList.toggle("bg-emerald-500",t)})}function w(){s.levelSelector.querySelectorAll(".level-btn").forEach(e=>{const t=e.dataset.level,n=l.selectedPart.split("_")[0],a=`lv${t.replace("+","")}`,o=l.chakData.equipment[n]?.[a]||{},r=e.querySelector(".progress-dots");if(!r)return;r.innerHTML="";const c=Object.entries(o),i=Math.min(4,c.length);for(let d=0;d<i;d++){const[p]=c[d],v=`${p}_${l.selectedPart}_${t}_${d}`,h=l.statState[v]||{isUnlocked:!1,level:0},y=u("span","progress-dot");h.isUnlocked?y.classList.add(h.level===3?"blue":"yellow"):y.classList.add("gray"),r.appendChild(y)}te(e,Object.values(o).length)})}function te(e,t){const n=e.dataset.level,a=e.querySelector(".level-progress-bar"),o=e.querySelector(".level-status");if(!a||!o||t===0){a&&(a.style.width="0%"),o&&(o.textContent="");return}let r=0,c=0;Object.values(l.statState).forEach(p=>{p.part===l.selectedPart&&p.partLevel===n&&p.isUnlocked&&(r+=p.level,c++)});const i=t*3,d=i>0?Math.round(r/i*100):0;a.style.width=`${d}%`,a.className="level-progress-bar",d===0?a.classList.add("empty"):d<100?a.classList.add("partial"):a.classList.add("complete"),o.textContent=c>0?`${c}/${t} (${d}%)`:""}async function C(){I(s.summaryDisplay,"합계 계산 중...");try{const e=await V({statState:l.statState,userResources:l.userResources}),{summary:t,resources:n}=e;let a=Object.keys(t).length>0?`<div class="summary-section"><div class="stat-list">${Object.entries(t).sort((o,r)=>r[1]-o[1]).map(([o,r])=>`<div class="stat-item"><span class="stat-name">${o}</span><span class="stat-value">+${r}</span></div>`).join("")}</div></div>`:"<p>능력치가 개방되지 않았습니다.</p>";s.summaryDisplay.innerHTML=a,s.resourceSummary.innerHTML=`
            <div class="resource-summary-item">
                <img src="assets/img/gold-button.jpg" class="resource-icon-img-small">
                <span class="resource-details">
                    <span class="${n.goldButton.remaining<0?"resource-negative":""}">${n.goldButton.remaining.toLocaleString()}</span> 보유 / <span>${n.goldButton.consumed.toLocaleString()}</span> 소모
                </span>
            </div>
            <div class="resource-summary-item">
                <img src="assets/img/fivecolored-beads.jpg" class="resource-icon-img-small">
                <span class="resource-details">
                    <span class="${n.colorBall.remaining<0?"resource-negative":""}">${n.colorBall.remaining.toLocaleString()}</span> 보유 / <span>${n.colorBall.consumed.toLocaleString()}</span> 소모
                </span>
            </div>
        `}catch(e){alert(`합계 계산 오류: ${e.message}`),console.error("Chak summary calculation failed:",e),s.summaryDisplay.innerHTML='<p class="error-message">계산 중 오류가 발생했습니다.</p>'}finally{T()}}function q(e){const t=e.target.closest(".selector-btn");t&&(t.classList.contains("equip-btn")?l.selectedPart=t.dataset.partId:t.classList.contains("level-btn")&&(l.selectedLevel=t.dataset.level),M(),L())}function U(e){const t=e.target.closest(".stat-card");if(!t)return;const n=t.dataset.cardId,a=t.dataset.statName;if(!a)return;const o=l.selectedPart.split("_")[0],r=`lv${l.selectedLevel.replace("+","")}`,c=(l.chakData.equipment[o]?.[r]||{})[a];if(c===void 0){console.error(`Max value not found for ${a}`);return}let i=JSON.parse(JSON.stringify(l.statState[n]||{level:0,value:0,isUnlocked:!1,isFirst:!1,part:l.selectedPart,partLevel:l.selectedLevel,statName:a,maxValue:c}));if(e.target.closest(".action-btn")){if(i.level>=3)return;if(i.isUnlocked)i.level++;else{const d=Object.values(l.statState).some(p=>p.part===l.selectedPart&&p.partLevel===l.selectedLevel&&p.isFirst);i.isFirst=!d,i.isUnlocked=!0,i.level=0}}else if(e.target.closest(".redistribute-btn")){delete l.statState[n],L(),C();return}else return;i.value=se(i.maxValue,i.level,i.isUnlocked,i.isFirst),l.statState[n]=i,j(t,i,c),A(),w(),C()}function se(e,t,n,a){return n?a?Math.floor(e/3*t):t===0?0:t===1?Math.floor(e/15)+Math.floor(e/3):Math.floor(e/15)+Math.floor(e/3)*t:0}function E(){l.userResources={goldButton:parseInt(s.goldButton.value,10)||0,colorBall:parseInt(s.colorBall.value,10)||0},C()}function le(){const e=new Set;for(const t in l.chakData.equipment)for(const n in l.chakData.equipment[t])for(const a in l.chakData.equipment[t][n])e.add(a.replace(/\d+$/,""));l.allAvailableStats=Array.from(e).sort()}function ae(){s.statOptions.innerHTML="",l.allAvailableStats.forEach(e=>{const t=u("div","stat-option",{text:e});t.addEventListener("click",n=>{n.stopPropagation(),F(e)}),s.statOptions.appendChild(t)})}function ne(){s.searchInput.addEventListener("click",e=>{e.stopPropagation(),s.statOptions.style.display="block",P(s.searchInput.value)}),s.searchInput.addEventListener("input",()=>P(s.searchInput.value)),s.searchButton.addEventListener("click",N),document.addEventListener("click",()=>{s.statOptions.style.display="none"})}function P(e){const t=s.statOptions.querySelectorAll(".stat-option");e=e.toLowerCase(),t.forEach(n=>{n.style.display=n.textContent.toLowerCase().includes(e)?"flex":"none"})}function F(e){const t=l.selectedStats.indexOf(e);t===-1?l.selectedStats.push(e):l.selectedStats.splice(t,1),re(),s.statOptions.style.display="none",s.searchInput.value="",P("")}function re(){s.selectedStats.innerHTML="",l.selectedStats.forEach(e=>{const t=u("div","stat-chip",{html:`${e} <span class="remove-stat">×</span>`});t.querySelector(".remove-stat").addEventListener("click",()=>F(e)),s.selectedStats.appendChild(t)})}function B(e){const a=e==="boss"?["피해저항관통","보스몬스터추가피해","치명위력%","파괴력증가","파괴력증가%","경험치획득증가","전리품획득증가"]:["피해저항관통","피해저항","대인방어","대인피해","대인피해%","대인방어%","체력증가","체력증가%","마력증가","마력증가%","치명저항","치명피해저항","상태이상적중","상태이상저항"],o=e==="boss"?"보스용 추천 조합":"PvP용 추천 조합";_(l.chakData,l.statState,o,a,(r,c)=>{l.selectedPart=r,l.selectedLevel=c,M(),L()})}function N(){if(l.selectedStats.length===0){alert("검색할 능력치를 선택해주세요.");return}_(l.chakData,l.statState,"검색 결과",l.selectedStats,(e,t)=>{l.selectedPart=e,l.selectedLevel=t,M(),L()})}function pe(){return`
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
    `}export{de as cleanup,pe as getHelpContentHTML,ie as init};
