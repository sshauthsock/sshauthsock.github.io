import{a as h,f as y,h as S,s as D}from"./index-MvYk2PFn.js";import{b as u}from"./utils-CHsLvtYz.js";import{s as C}from"./modalHandler-BfURuJ04.js";import{S as m,F as k}from"./constants-r0ry0Tln.js";import{s as E}from"./resultModal-CV8Rcakm.js";import"./supportMessage-C6tx5lCv.js";const d={currentCategory:"수호",currentRankingType:"bond",currentStatKey:"bind",currentLoadedRankings:[]},r={},T={수호:{전설:{2:{damageResistance:100,pvpDefensePercent:1},3:{damageResistance:200,pvpDefensePercent:2},4:{damageResistance:350,pvpDefensePercent:3.5},5:{damageResistance:550,pvpDefensePercent:5.5}},불멸:{2:{damageResistance:150,pvpDefensePercent:1.5},3:{damageResistance:300,pvpDefensePercent:3},4:{damageResistance:525,pvpDefensePercent:5.25},5:{damageResistance:825,pvpDefensePercent:8.25}}},탑승:{전설:{2:{damageResistancePenetration:100,pvpDamagePercent:1},3:{damageResistancePenetration:200,pvpDamagePercent:2},4:{damageResistancePenetration:350,pvpDamagePercent:3.5},5:{damageResistancePenetration:550,pvpDamagePercent:5.5}},불멸:{2:{damageResistancePenetration:150,pvpDamagePercent:1.5},3:{damageResistancePenetration:300,pvpDamagePercent:3},4:{damageResistancePenetration:525,pvpDamagePercent:5.25},5:{damageResistancePenetration:825,pvpDamagePercent:8.25}}},변신:{전설:{2:{damageResistance:50,damageResistancePenetration:50,pvpDefensePercent:.5,pvpDamagePercent:.5},3:{damageResistance:100,damageResistancePenetration:100,pvpDefensePercent:1,pvpDamagePercent:1},4:{damageResistance:175,damageResistancePenetration:175,pvpDefensePercent:1.75,pvpDamagePercent:1.75},5:{damageResistance:275,damageResistancePenetration:275,pvpDefensePercent:2.75,pvpDamagePercent:2.75}},불멸:{2:{damageResistance:75,damageResistancePenetration:75,pvpDefensePercent:.75,pvpDamagePercent:.75},3:{damageResistance:150,damageResistancePenetration:150,pvpDefensePercent:1.5,pvpDamagePercent:1.5},4:{damageResistance:262,damageResistancePenetration:262,pvpDefensePercent:2.62,pvpDamagePercent:2.62},5:{damageResistance:412,damageResistancePenetration:412,pvpDefensePercent:4.12,pvpDamagePercent:4.12}}}},L={결의:{2:{damageResistance:200},3:{damageResistance:400},4:{damageResistance:600},5:{damageResistance:800}},고요:{2:{damageResistancePenetration:200},3:{damageResistancePenetration:400},4:{damageResistancePenetration:600},5:{damageResistancePenetration:800}},의지:{2:{pvpDamagePercent:2},3:{pvpDamagePercent:4},4:{pvpDamagePercent:6},5:{pvpDamagePercent:8}},침착:{2:{pvpDefensePercent:2},3:{pvpDefensePercent:4},4:{pvpDefensePercent:6},5:{pvpDefensePercent:8}},냉정:{2:{damageResistance:100,damageResistancePenetration:100},3:{damageResistance:200,damageResistancePenetration:200},4:{damageResistance:300,damageResistancePenetration:300},5:{damageResistance:400,damageResistancePenetration:400}},활력:{2:{pvpDamagePercent:1,pvpDefensePercent:1},3:{pvpDamagePercent:2,pvpDefensePercent:2},4:{pvpDamagePercent:3,pvpDefensePercent:3},5:{pvpDamagePercent:4,pvpDefensePercent:4}}};function $(e,s){const a=[],t=T[s];return t&&Object.entries(e).forEach(([n,i])=>{const c=t[n];if(!c)return;let o=0;for(let l=2;l<=i;l++)c[l.toString()]&&(o=l);if(o>0){const l=c[o.toString()];Object.entries(l).forEach(([p,g])=>{a.push({key:p,name:m[p]||p,value:g})})}}),a}function M(e,s){const a=[];return Object.entries(e).forEach(([t,n])=>{const i=L[t];if(!i)return;let c=0;for(let o=2;o<=n;o++)i[o.toString()]&&(c=o);if(c>0){const o=i[c.toString()];Object.entries(o).forEach(([l,p])=>{a.push({key:l,name:m[l]||l,value:p})})}}),a}function A(){return`
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
  `}async function v(){h(r.rankingsContainer,"랭킹 데이터 로딩 중",`${d.currentCategory} ${d.currentRankingType==="bond"?"결속":"능력치"} 랭킹을 불러오고 있습니다.`);try{const e=await y(d.currentCategory,d.currentRankingType,d.currentStatKey);d.currentLoadedRankings=e.rankings||[],j(d.currentLoadedRankings)}catch(e){console.error("랭킹 데이터 로드 실패:",e),r.rankingsContainer.innerHTML='<p class="error-message">서버 점검중입니다.</p>'}finally{S()}}function j(e){d.currentRankingType==="bond"?x(e):H(e)}function x(e){const s=r.rankingsContainer;if(!s)return;if(e.length===0){s.innerHTML='<p class="no-data-message">결속 랭킹 데이터가 없습니다.</p>';return}const a=`
    <div class="ranking-table-container">
      <table class="ranking-table">
        <thead><tr><th>순위</th><th>조합</th><th>등급/세력</th><th>환산 점수</th><th class="action-column">상세</th></tr></thead>
        <tbody>
          ${e.map((t,n)=>`
            <tr class="ranking-row">
              <td class="rank-column"><div class="rank-badge rank-${n+1}">${n+1}</div></td>
              <td class="spirits-column"><div class="spirits-container">${t.spirits.map(i=>`<img src="${i.image}" alt="${i.name}" title="${i.name}" class="spirit-image" data-spirit-name="${i.name}">`).join("")}</div></td>
              <td class="faction-column"><div class="faction-tags">${N(t)}</div></td>
              <td class="score-column">
                <div class="total-score">${Math.round(t.scoreWithBind)}</div>
                <div class="score-breakdown">(등급: ${Math.round(t.gradeScore)} | 세력: ${Math.round(t.factionScore)} | 장착: ${Math.round(t.bindScore)})</div>
              </td>
              <td class="action-column">
                <button class="btn btn-sm btn-info view-ranking-details" data-index="${n}">상세보기</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>`;s.innerHTML=a}function H(e){const s=r.rankingsContainer;if(!s)return;if(e.length===0){s.innerHTML='<p class="no-data-message">능력치 랭킹 데이터가 없습니다.</p>';return}let t=`<h3 class="stat-ranking-title">${r.statSelector.selectedOptions[0].text} 랭킹</h3><div class="stat-grid-container">`;e.forEach((n,i)=>{let c="";i===0?c="top-1":i===1?c="top-2":i===2&&(c="top-3");const o=typeof n.value=="number"&&!isNaN(n.value)?n.value.toLocaleString():n.value!==void 0&&n.value!==null?String(n.value):"N/A";t+=`
      <div class="stat-card ${c}" data-spirit-name="${n.name}">
        <div class="rank-number">${i+1}</div>
        <div class="spirit-image-container"><img src="${n.image}" alt="${n.name}" class="spirit-image"></div>
        <div class="spirit-name">${n.name}</div>
        <div class="spirit-stat">${o}</div>
      </div>
    `}),t+="</div>",s.innerHTML=t}function N(e){let s="";return e.gradeCounts&&(s+=Object.entries(e.gradeCounts).filter(([,a])=>a>=2).map(([a,t])=>`<span class="grade-tag grade-tag-${a==="전설"?"legend":"immortal"}">${a} x${t}</span>`).join(" ")),e.factionCounts&&(s+=Object.entries(e.factionCounts).filter(([,a])=>a>=2).map(([a,t])=>{const n=k[a]||"";return`<span class="faction-tag" title="${a}">
                    <img src="${n}" class="faction-icon" alt="${a}">
                    ${a} x${t}
                  </span>`}).join(" ")),s}function O(){const e=r.statSelector;e.innerHTML="",e.appendChild(u("option","",{value:"bind",text:"장착효과(환산)"})),e.appendChild(u("option","",{value:"registration",text:"등록효과(환산)"})),Object.keys(m).sort().forEach(a=>{e.appendChild(u("option","",{value:a,text:m[a]}))}),e.value=d.currentStatKey}function w(){r.container.addEventListener("click",P),r.statSelector.addEventListener("change",R),r.rankingsContainer.addEventListener("click",b)}function P(e){const s=e.target.closest("#rankingCategoryTabs .tab");if(s&&!s.classList.contains("active")){r.subTabs.querySelector(".tab.active").classList.remove("active"),s.classList.add("active"),d.currentCategory=s.dataset.category,document.getElementById("rankingCategoryTitle").textContent=d.currentCategory,v();return}const a=e.target.closest(".ranking-type-selector .filter-btn");if(a&&!a.classList.contains("active")){r.container.querySelector(".ranking-type-selector .filter-btn.active").classList.remove("active"),a.classList.add("active"),d.currentRankingType=a.dataset.type,r.statSelectorContainer.style.display=d.currentRankingType==="stat"?"flex":"none",document.getElementById("rankingTypeTitle").textContent=a.textContent,v();return}const t=e.target.closest(".spirit-image, .stat-card");if(t&&!e.target.classList.contains("view-ranking-details")){const n=t.alt||t.dataset.spiritName,i=D.allSpirits.find(c=>c.name===n);i&&C(i,null,!0)}}function b(e){const s=e.target;if(s.classList.contains("view-ranking-details")){const a=parseInt(s.dataset.index,10),t=d.currentLoadedRankings[a];if(t){const n=t.spirits.map(g=>({...g,stats:[{level:25}]})),i={};t.spirits.forEach(g=>{const f=g.grade;i[f]=(i[f]||0)+1});const c={};t.spirits.forEach(g=>{if(g.influence){const f=g.influence;c[f]=(c[f]||0)+1}});let o=t.gradeEffects||[],l=t.factionEffects||[];Array.isArray(o)||(o=[]),Array.isArray(l)||(l=[]),o.length===0&&(o=$(i,d.currentCategory)),l.length===0&&(l=M(c));const p={combination:t.spirits.map(g=>g.name),gradeScore:t.gradeScore,factionScore:t.factionScore,bindScore:t.bindScore,gradeEffects:o,factionEffects:l,bindStats:t.bindStats||t.bindStat,spirits:n,gradeCounts:i,factionCounts:c};E(p,!0)}else console.error("랭킹 상세 데이터를 찾을 수 없습니다:",a),alert("랭킹 상세 정보를 불러오는 데 실패했습니다.")}}function R(e){d.currentStatKey=e.target.value,v()}async function K(e){e.innerHTML=A(),r.container=e,r.subTabs=e.querySelector("#rankingCategoryTabs"),r.rankingsContainer=e.querySelector("#rankingsContainer"),r.statSelectorContainer=e.querySelector("#statSelectorContainer"),r.statSelector=e.querySelector("#statSelector"),O(),w(),await v()}function U(){return`
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
    `}function W(){r.container&&r.container.removeEventListener("click",P),r.statSelector&&r.statSelector.removeEventListener("change",R),r.rankingsContainer&&r.rankingsContainer.removeEventListener("click",b)}export{W as cleanup,U as getHelpContentHTML,K as init};
