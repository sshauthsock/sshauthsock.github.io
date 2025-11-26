import{g as k,s as C,i as E}from"./main-DS_ca-kn.js";import{c as m,S as p,G as T,F as L,a as $}from"./components-KK9vAy1z.js";import{s as R}from"./page-spiritInfo-D44TnKxK.js";import{s as M}from"./page-bondCalculator-Da93mZMi.js";import{E as h}from"./utils-C4S-LQYV.js";const d={currentCategory:"수호",currentRankingType:"bond",currentStatKey:"bind",currentLoadedRankings:[]},i={};function x(t,a){const e=[],n=T[a];return n&&Object.entries(t).forEach(([s,r])=>{const o=n[s];if(!o)return;let l=0;for(let c=2;c<=r;c++)o[c.toString()]&&(l=c);if(l>0){const c=o[l.toString()];Object.entries(c).forEach(([f,g])=>{e.push({key:f,name:p[f]||f,value:g})})}}),e}function w(t,a){const e=[],n=L[a];return n&&Object.entries(t).forEach(([s,r])=>{const o=n[s];if(!o)return;let l=0;for(let c=2;c<=r;c++)o[c.toString()]&&(l=c);if(l>0){const c=o[l.toString()];Object.entries(c).forEach(([f,g])=>{e.push({key:f,name:p[f]||f,value:g})})}}),e}function H(){return`
    <div class="sub-tabs" id="rankingCategoryTabs">
        <div class="tab active" data-category="수호">수호</div>
        <div class="tab" data-category="탑승">탑승</div>
        <div class="tab" data-category="변신">변신</div>
    </div>
    <div class="filters-container">
        <div class="filter-section">
            <div class="filter-label">랭킹 종류:</div>
            <div class="filter-buttons ranking-type-selector">
                <button class="filter-btn active" data-type="bond">결속 랭킹</button>
                <button class="filter-btn" data-type="stat">능력치 랭킹</button>
            </div>
                    <a href="https://open.kakao.com/o/sUSXtUYe" target="_blank" class="kakao-gift-btn">
            <img src="assets/img/gift.png" alt="카카오 선물하기 아이콘" loading="lazy"
                style="height: 20px; vertical-align: middle; margin-right: 5px;">
            개발자에게 카톡 선물하기
        </a>
        </div>
        <div class="filter-section" id="statSelectorContainer" style="display: none;">
            <label for="statSelector" class="filter-label">능력치:</label>
            <select id="statSelector" class="stat-selector"></select>
        </div>
    </div>
    <div class="ranking-container">
        <h1 class="ranking-title">환수 <span id="rankingCategoryTitle">수호</span> <span id="rankingTypeTitle">결속</span> 랭킹</h1>
        <div id="rankingsContainer" class="rankings-list"></div>
    </div>
  `}async function v(){A();try{const t=await k(d.currentCategory,d.currentRankingType,d.currentStatKey);d.currentLoadedRankings=t.rankings||[],F(d.currentLoadedRankings)}catch(t){h.handle(t,"랭킹 데이터 로드"),i.rankingsContainer.innerHTML=`
      <div class="error-message" style="text-align: center; padding: 2rem;">
        <h3>${h.getUserFriendlyMessage(t.message)}</h3>
      </div>
    `}}function A(){i.rankingsContainer.innerHTML="";for(let t=0;t<10;t++){const a=document.createElement("div");a.className="ranking-item skeleton-card",a.style.padding="16px",a.style.marginBottom="16px",a.style.borderRadius="8px",a.style.backgroundColor="#fff";const e=E(3,"text",{width:"100%"});e[0].style.width="60%",e[1].style.width="80%",e[2].style.width="40%",a.append(...e),i.rankingsContainer.appendChild(a)}}function F(t){d.currentRankingType==="bond"?N(t):j(t)}function N(t){const a=i.rankingsContainer;if(!a)return;if(t.length===0){a.innerHTML='<p class="no-data-message">결속 랭킹 데이터가 없습니다.</p>';return}const e=`
    <div class="ranking-table-container">
      <table class="ranking-table">
        <thead><tr><th>순위</th><th>조합</th><th>등급/세력</th><th>환산 점수</th><th class="action-column">상세</th></tr></thead>
        <tbody>
          ${t.map((n,s)=>`
            <tr class="ranking-row">
              <td class="rank-column"><div class="rank-badge rank-${s+1}">${s+1}</div></td>
              <td class="spirits-column"><div class="spirits-container">${n.spirits.map(r=>`<img src="${r.image}" alt="${r.name}" title="${r.name}" class="spirit-image" data-spirit-name="${r.name}" loading="lazy">`).join("")}</div></td>
              <td class="faction-column"><div class="faction-tags">${O(n)}</div></td>
              <td class="score-column">
                <div class="total-score">${Math.round(n.scoreWithBind)}</div>
                <div class="score-breakdown">(등급: ${Math.round(n.gradeScore)} | 세력: ${Math.round(n.factionScore)} | 장착: ${Math.round(n.bindScore)})</div>
              </td>
              <td class="action-column">
                <button class="btn btn-sm btn-info view-ranking-details" data-index="${s}">상세보기</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;a.innerHTML=e}function j(t){const a=i.rankingsContainer;if(!a)return;if(t.length===0){a.innerHTML='<p class="no-data-message">능력치 랭킹 데이터가 없습니다.</p>';return}let n=`<h3 class="stat-ranking-title">${i.statSelector.selectedOptions[0].text} 랭킹</h3><div class="stat-grid-container">`;t.forEach((s,r)=>{let o="";r===0?o="top-1":r===1?o="top-2":r===2&&(o="top-3");const l=typeof s.value=="number"&&!isNaN(s.value)?s.value.toLocaleString():s.value!==void 0&&s.value!==null?String(s.value):"N/A";n+=`
      <div class="stat-card ${o}" data-spirit-name="${s.name}">
        <div class="rank-number">${r+1}</div>
        <div class="spirit-image-container"><img src="${s.image}" alt="${s.name}" class="spirit-image" loading="lazy"></div>
        <div class="spirit-name">${s.name}</div>
        <div class="spirit-stat">${l}</div>
      </div>
    `}),n+="</div>",a.innerHTML=n}function O(t){let a="";return t.gradeCounts&&(a+=Object.entries(t.gradeCounts).filter(([,e])=>e>=2).map(([e,n])=>`<span class="grade-tag grade-tag-${e==="전설"?"legend":"immortal"}">${e} x${n}</span>`).join(" ")),t.factionCounts&&(a+=Object.entries(t.factionCounts).filter(([,e])=>e>=2).map(([e,n])=>{const s=$[e]||"";return`<span class="faction-tag" title="${e}">
                    <img src="${s}" class="faction-icon" alt="${e}" loading="lazy">
                    ${e} x${n}
                  </span>`}).join(" ")),a}function I(){const t=i.statSelector;t.innerHTML="",t.appendChild(m("option","",{value:"bind",text:"장착효과(환산)"})),t.appendChild(m("option","",{value:"registration",text:"등록효과(환산)"})),Object.keys(p).sort().forEach(e=>{t.appendChild(m("option","",{value:e,text:p[e]}))}),t.value=d.currentStatKey}function _(){i.container.addEventListener("click",y),i.statSelector.addEventListener("change",S),i.rankingsContainer.addEventListener("click",b)}function y(t){const a=t.target.closest("#rankingCategoryTabs .tab");if(a&&!a.classList.contains("active")){i.subTabs.querySelector(".tab.active").classList.remove("active"),a.classList.add("active"),d.currentCategory=a.dataset.category,document.getElementById("rankingCategoryTitle").textContent=d.currentCategory,v();return}const e=t.target.closest(".ranking-type-selector .filter-btn");if(e&&!e.classList.contains("active")){i.container.querySelector(".ranking-type-selector .filter-btn.active").classList.remove("active"),e.classList.add("active"),d.currentRankingType=e.dataset.type,i.statSelectorContainer.style.display=d.currentRankingType==="stat"?"flex":"none",document.getElementById("rankingTypeTitle").textContent=e.textContent,v();return}const n=t.target.closest(".spirit-image, .stat-card");if(n&&!t.target.classList.contains("view-ranking-details")){const s=n.alt||n.dataset.spiritName,r=C.allSpirits.find(o=>o.name===s);r&&R(r,null,!0)}}function b(t){const a=t.target;if(a.classList.contains("view-ranking-details")){const e=parseInt(a.dataset.index,10),n=d.currentLoadedRankings[e];if(n){const s=n.spirits.map(g=>({...g,stats:[{level:25}]})),r={};n.spirits.forEach(g=>{const u=g.grade;r[u]=(r[u]||0)+1});const o={};n.spirits.forEach(g=>{if(g.influence){const u=g.influence;o[u]=(o[u]||0)+1}});let l=n.gradeEffects||[],c=n.factionEffects||[];Array.isArray(l)||(l=[]),Array.isArray(c)||(c=[]),l.length===0&&(l=x(r,d.currentCategory)),c.length===0&&(c=w(o,d.currentCategory));const f={combination:n.spirits.map(g=>g.name),gradeScore:n.gradeScore,factionScore:n.factionScore,bindScore:n.bindScore,gradeEffects:l,factionEffects:c,bindStats:n.bindStats||n.bindStat,spirits:s,gradeCounts:r,factionCounts:o};M(f,!0)}else console.error("랭킹 상세 데이터를 찾을 수 없습니다:",e),alert("랭킹 상세 정보를 불러오는 데 실패했습니다.")}}function S(t){d.currentStatKey=t.target.value,v()}async function P(t){t.innerHTML=H(),i.container=t,i.subTabs=t.querySelector("#rankingCategoryTabs"),i.rankingsContainer=t.querySelector("#rankingsContainer"),i.statSelectorContainer=t.querySelector("#statSelectorContainer"),i.statSelector=t.querySelector("#statSelector"),I(),_(),await v()}function U(){return`
        <div class="content-block">
            <h2>환수 랭킹 정보 사용 안내</h2>
            <p>'바연화연'의 환수 랭킹 페이지에서는 다양한 기준(결속 점수, 특정 능력치)으로 환수의 순위를 확인할 수 있습니다. 다른 유저들의 최상위 조합이나 강력한 환수 스탯을 참고하여 여러분의 육성 목표를 세워보세요.</p>
            <p>모든 랭킹은 25레벨 환수를 기준으로 계산됩니다.</p>

            <h3>🔎 페이지 기능 설명</h3>
            <ul>
                <li><strong>카테고리 선택:</strong> '수호', '탑승', '변신' 탭을 클릭하여 해당 종류의 환수 랭킹을 확인하세요.</li>
                <li><strong>랭킹 종류 선택:</strong> '결속 랭킹' 또는 '능력치 랭킹' 중 원하는 랭킹 기준을 선택하세요.
                    <ul>
                        <li><strong>결속 랭킹:</strong> 등급, 세력, 장착 효과를 종합한 '환산 점수'를 기준으로 5마리 환수 조합의 순위를 보여줍니다. 각 조합의 구성 환수, 등급/세력 시너지, 점수 상세 내역을 확인할 수 있습니다.
                            <br>👉 <strong>'상세보기' 버튼</strong>을 클릭하여 해당 조합의 모든 능력치 합계 및 개별 환수의 장착 효과를 '결속 결과' 모달과 동일하게 확인할 수 있습니다.
                        </li>
                        <li><strong>능력치 랭킹:</strong> 특정 능력치(예: '피해저항관통', '대인방어%')를 가장 높게 올려주는 환수의 순위를 보여줍니다.</li>
                    </ul>
                </li>
                <li><strong>능력치 선택 (능력치 랭킹 선택 시):</strong> 능력치 랭킹을 선택하면 나타나는 드롭다운에서 '장착효과(환산)', '등록효과(환산)' 또는 원하는 특정 능력치를 선택하여 해당 능력치 랭킹을 볼 수 있습니다.</li>
                <li><strong>환수/조합 클릭:</strong>
                    <ul>
                        <li>결속 랭킹에서 조합 내 환수 이미지를 클릭하거나, 능력치 랭킹에서 환수 카드를 클릭하면 해당 환수의 상세 정보를 모달 창으로 확인할 수 있습니다.</li>
                        <li>랭킹 모드에서 열리는 환수 상세 정보는 고정 레벨 시스템으로, 18개 파벌 환수(냉정, 침착, 결의, 고요, 활력, 의지)는 25레벨로 고정되고 레벨 조정이 불가능합니다.</li>
                        <li>고정 레벨 환수가 아닌 경우 +/- 버튼으로 레벨 조정이 가능하며, 장기 누르기 기능과 모바일 터치도 지원합니다.</li>
                    </ul>
                </li>
            </ul>

            <h3>💡 랭킹 활용 팁</h3>
            <ul>
                <li><strong>최고 효율 조합 벤치마킹:</strong> 결속 랭킹을 통해 상위권 유저들이 어떤 환수 조합으로 시너지를 내는지 파악하고 자신의 육성 방향을 정하는 데 참고할 수 있습니다.</li>
                <li><strong>핵심 스탯 환수 찾기:</strong> 능력치 랭킹을 활용하여 특정 스탯(예: '치명위력%', '파괴력증가')을 극대화하기 위해 어떤 환수를 육성해야 할지 알아볼 수 있습니다.</li>
                <li><strong>메타 파악:</strong> 특정 능력치 랭킹이 높거나 결속 랭킹에 자주 등장하는 환수들을 통해 현재 게임 내 핵심 스탯 메타가 무엇인지 파악할 수 있습니다.</li>
            </ul>
        </div>
    `}function K(){i.container&&i.container.removeEventListener("click",y),i.statSelector&&i.statSelector.removeEventListener("change",S),i.rankingsContainer&&i.rankingsContainer.removeEventListener("click",b)}export{K as cleanup,U as getHelpContentHTML,P as init};
