import{a as m,f as b,h as y,s as h}from"./index-DfmrwgZp.js";import{b as d}from"./utils-CHsLvtYz.js";import{s as S}from"./modalHandler-C2_yJzgD.js";import{S as g,F as k}from"./constants-lx1P6xCQ.js";import{s as C}from"./resultModal-CTpKTSlC.js";const r={currentCategory:"수호",currentRankingType:"bond",currentStatKey:"bind",currentLoadedRankings:[]},n={};function $(){return`
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
            <img src="assets/img/gift.png" alt="카카오 선물하기 아이콘"
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
  `}async function c(){m(n.rankingsContainer,"랭킹 데이터 로딩 중",`${r.currentCategory} ${r.currentRankingType==="bond"?"결속":"능력치"} 랭킹을 불러오고 있습니다.`);try{const t=await b(r.currentCategory,r.currentRankingType,r.currentStatKey);r.currentLoadedRankings=t.rankings||[],L(r.currentLoadedRankings)}catch(t){console.error("랭킹 데이터 로드 실패:",t),n.rankingsContainer.innerHTML='<p class="error-message">서버 점검중입니다.</p>'}finally{y()}}function L(t){r.currentRankingType==="bond"?T(t):R(t)}function T(t){const s=n.rankingsContainer;if(!s)return;if(t.length===0){s.innerHTML='<p class="no-data-message">결속 랭킹 데이터가 없습니다.</p>';return}const a=`
    <div class="ranking-table-container">
      <table class="ranking-table">
        <thead><tr><th>순위</th><th>조합</th><th>등급/세력</th><th>환산 점수</th><th class="action-column">상세</th></tr></thead>
        <tbody>
          ${t.map((e,i)=>`
            <tr class="ranking-row">
              <td class="rank-column"><div class="rank-badge rank-${i+1}">${i+1}</div></td>
              <td class="spirits-column"><div class="spirits-container">${e.spirits.map(o=>`<img src="${o.image}" alt="${o.name}" title="${o.name}" class="spirit-image" data-spirit-name="${o.name}">`).join("")}</div></td>
              <td class="faction-column"><div class="faction-tags">${E(e)}</div></td>
              <td class="score-column">
                <div class="total-score">${Math.round(e.scoreWithBind)}</div>
                <div class="score-breakdown">(등급: ${Math.round(e.gradeScore)} | 세력: ${Math.round(e.factionScore)} | 장착: ${Math.round(e.bindScore)})</div>
              </td>
              <td class="action-column">
                <button class="btn btn-sm btn-info view-ranking-details" data-index="${i}">상세보기</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;s.innerHTML=a}function R(t){const s=n.rankingsContainer;if(!s)return;if(t.length===0){s.innerHTML='<p class="no-data-message">능력치 랭킹 데이터가 없습니다.</p>';return}let e=`<h3 class="stat-ranking-title">${n.statSelector.selectedOptions[0].text} 랭킹</h3><div class="stat-grid-container">`;t.forEach((i,o)=>{let l="";o===0?l="top-1":o===1?l="top-2":o===2&&(l="top-3");const f=typeof i.value=="number"&&!isNaN(i.value)?i.value.toLocaleString():i.value!==void 0&&i.value!==null?String(i.value):"N/A";e+=`
      <div class="stat-card ${l}" data-spirit-name="${i.name}">
        <div class="rank-number">${o+1}</div>
        <div class="spirit-image-container"><img src="${i.image}" alt="${i.name}" class="spirit-image"></div>
        <div class="spirit-name">${i.name}</div>
        <div class="spirit-stat">${f}</div>
      </div>
    `}),e+="</div>",s.innerHTML=e}function E(t){let s="";return t.gradeCounts&&(s+=Object.entries(t.gradeCounts).filter(([,a])=>a>=2).map(([a,e])=>`<span class="grade-tag grade-tag-${a==="전설"?"legend":"immortal"}">${a} x${e}</span>`).join(" ")),t.factionCounts&&(s+=Object.entries(t.factionCounts).filter(([,a])=>a>=2).map(([a,e])=>{const i=k[a]||"";return`<span class="faction-tag" title="${a}">
                    <img src="${i}" class="faction-icon" alt="${a}">
                    ${a} x${e}
                  </span>`}).join(" ")),s}function M(){const t=n.statSelector;t.innerHTML="",t.appendChild(d("option","",{value:"bind",text:"장착효과(환산)"})),t.appendChild(d("option","",{value:"registration",text:"등록효과(환산)"})),Object.keys(g).sort().forEach(a=>{t.appendChild(d("option","",{value:a,text:g[a]}))}),t.value=r.currentStatKey}function x(){n.container.addEventListener("click",u),n.statSelector.addEventListener("change",v),n.rankingsContainer.addEventListener("click",p)}function u(t){const s=t.target.closest("#rankingCategoryTabs .tab");if(s&&!s.classList.contains("active")){n.subTabs.querySelector(".tab.active").classList.remove("active"),s.classList.add("active"),r.currentCategory=s.dataset.category,document.getElementById("rankingCategoryTitle").textContent=r.currentCategory,c();return}const a=t.target.closest(".ranking-type-selector .filter-btn");if(a&&!a.classList.contains("active")){n.container.querySelector(".ranking-type-selector .filter-btn.active").classList.remove("active"),a.classList.add("active"),r.currentRankingType=a.dataset.type,n.statSelectorContainer.style.display=r.currentRankingType==="stat"?"flex":"none",document.getElementById("rankingTypeTitle").textContent=a.textContent,c();return}const e=t.target.closest(".spirit-image, .stat-card");if(e&&!t.target.classList.contains("view-ranking-details")){const i=e.alt||e.dataset.spiritName,o=h.allSpirits.find(l=>l.name===i);o&&S(o,null,!0)}}function p(t){const s=t.target;if(s.classList.contains("view-ranking-details")){const a=parseInt(s.dataset.index,10),e=r.currentLoadedRankings[a];if(e){const i={combination:e.spirits,gradeScore:e.gradeScore,factionScore:e.factionScore,bindScore:e.bindScore,gradeEffects:e.gradeEffects,factionEffects:e.factionEffects,bindStats:e.bindStats||e.bindStat,spirits:e.spirits};C(i,!0)}else console.error("랭킹 상세 데이터를 찾을 수 없습니다:",a),alert("랭킹 상세 정보를 불러오는 데 실패했습니다.")}}function v(t){r.currentStatKey=t.target.value,c()}async function q(t){t.innerHTML=$(),n.container=t,n.subTabs=t.querySelector("#rankingCategoryTabs"),n.rankingsContainer=t.querySelector("#rankingsContainer"),n.statSelectorContainer=t.querySelector("#statSelectorContainer"),n.statSelector=t.querySelector("#statSelector"),M(),x(),await c()}function A(){return`
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
                        <li>결속 랭킹에서 조합 내 환수 이미지를 클릭하거나, 능력치 랭킹에서 환수 카드를 클릭하면 해당 환수의 25레벨 상세 정보를 모달 창으로 확인할 수 있습니다.</li>
                        <li>랭킹 모드에서는 환수 상세 정보의 레벨이 25로 고정됩니다.</li>
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
    `}function K(){n.container&&n.container.removeEventListener("click",u),n.statSelector&&n.statSelector.removeEventListener("change",v),n.rankingsContainer&&n.rankingsContainer.removeEventListener("click",p)}export{K as cleanup,A as getHelpContentHTML,q as init};
