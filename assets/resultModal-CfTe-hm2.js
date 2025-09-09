import{b as m}from"./utils-CHsLvtYz.js";import{s as $}from"./index-CbYi3XH9.js";import{F as T,P as b,S as I}from"./constants-lx1P6xCQ.js";const E="savedOptimalCombinations",C="combinationCounter",A=5;function k(){try{const t=localStorage.getItem(E),e=t?JSON.parse(t):{수호:[],탑승:[],변신:[]};return e.수호||(e.수호=[]),e.탑승||(e.탑승=[]),e.변신||(e.변신=[]),e}catch(t){return console.error("Failed to load history from localStorage:",t),{수호:[],탑승:[],변신:[]}}}function _(){try{const t=localStorage.getItem(C),e=t?JSON.parse(t):{수호:0,탑승:0,변신:0};return e.수호===void 0&&(e.수호=0),e.탑승===void 0&&(e.탑승=0),e.변신===void 0&&(e.변신=0),e}catch(t){return console.error("Failed to load counter from localStorage:",t),{수호:0,탑승:0,변신:0}}}function N(t,e){try{localStorage.setItem(E,JSON.stringify(t)),localStorage.setItem(C,JSON.stringify(e))}catch(a){console.error("기록 저장 실패:",a),alert("조합 기록 저장에 실패했습니다. 저장 공간이 부족할 수 있습니다.")}}function V(t){if(!t||!t.spirits||t.spirits.length===0||!t.spirits[0].type){console.warn("Invalid result data provided to addResult:",t);return}const e=t.spirits[0].type;if(!["수호","탑승","변신"].includes(e)){console.warn(`Invalid category '${e}' for history storage.`);return}const a=k(),r=_();r[e]===void 0&&(r[e]=0),r[e]++;const o=(r[e]-1)%A,i=new Date,c={...t,timestamp:i.toLocaleString("sv-SE"),id:i.getTime()};a[e][o]=c,N(a,r)}function O(t){const e=k();if(!e[t])return console.warn(`Attempted to retrieve history for unknown category: ${t}`),[];const a=e[t].filter(Boolean);return a.sort((r,o)=>o.id-r.id),a}let h=null;const w={damageResistance:"stat-damage-resistance",damageResistancePenetration:"stat-damage-resistance-penetration",pvpDefensePercent:"stat-pvp-defense-percent",pvpDamagePercent:"stat-pvp-damage-percent"};function f(t){if(t==null)return 0;const e=parseFloat(String(t).replace(/,/g,""));return isNaN(e)?0:e}function S(t,e,a,r,o={}){const i=document.getElementById(t);if(!i)return;let c="";o.gradeCounts?c=Object.entries(o.gradeCounts).filter(([,n])=>n>=2).map(([n,s])=>`<span class="grade-tag grade-tag-${n==="전설"?"legend":"immortal"}">${n}x${s}</span>`).join(" "):o.factionCounts&&(c=Object.entries(o.factionCounts).filter(([,n])=>n>=2).map(([n,s])=>{const p=T[n]||"";return`<span class="faction-tag" title="${n}"><img src="${p}" class="faction-icon" alt="${n}">x${s}</span>`}).join(" "));const l=Array.isArray(a)?a:[];let d='<p class="no-effects">효과 없음</p>';l.length>0&&(d=`<ul class="effects-list">${l.map(n=>{const p=b.includes(n.key)?`${f(n.value)}%`:f(n.value).toLocaleString();return`<li class="${w[n.key]||""}"><span class="stat-name">${n.name}</span><span class="stat-value">${p}</span></li>`}).join("")}</ul>`),i.innerHTML=`
        <h4>${e} <span class="section-score">${Math.round(f(r))}</span></h4>
        ${c?`<div class="set-info">${c}</div>`:""}
        <div class="effects-content">${d}</div>
    `}function R(){g();const t=m("div","modal-overlay",{id:"optimalModal"}),e=m("div","modal-content",{id:"optimalModalContent"}),a=m("button","modal-close",{id:"closeOptimalModal",text:"✕"});e.appendChild(a),t.appendChild(e),document.body.appendChild(t),a.onclick=g,t.addEventListener("click",o=>{o.target===t&&g()});const r=o=>{o.key==="Escape"&&g()};return document.addEventListener("keydown",r),t._escListener=r,h=t,{modal:t,content:e}}function Y(t,e=!1){if(!t||!Array.isArray(t.combination)||t.combination.length===0){alert("계산 결과 데이터가 올바르지 않습니다.");return}const{modal:a,content:r}=R();a.style.display="flex",document.body.style.overflow="hidden",D(t,r,e),setTimeout(()=>{try{window.adfit&&typeof window.adfit.render=="function"?document.querySelectorAll("#optimalModalContent .kakao_ad_area").forEach(i=>{window.adfit.render(i)}):console.warn("Kakao AdFit script (window.adfit) not yet loaded or not available.")}catch(o){console.error("Kakao AdFit: Error rendering ads in modal:",o)}},100)}function D(t,e,a){const r=m("div","optimal-header",{id:"optimalHeader"}),o=m("div","combination-results-container",{id:"combinationResultsContainer"}),i=m("div","results-container");i.innerHTML=`
        <div class="results-section" id="optimalGradeEffects"></div>
        <div class="results-section" id="optimalFactionEffects"></div>
        <div class="results-section" id="optimalBindEffects"></div>
    `;const c=m("div","spirit-details-container",{id:"optimalSpiritsDetails"}),l=m("div","kakao-ad-modal-container desktop-modal-ad",{});l.innerHTML=`
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-avif2d68afxV6xpn"
          data-ad-width="728"
          data-ad-height="90"></ins>
  `,e.appendChild(l);const d=m("div","kakao-ad-modal-container mobile-modal-ad",{});if(d.innerHTML=`
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-wnVEYOHZjycPISXg"
          data-ad-width="320"
          data-ad-height="50"></ins>
  `,e.appendChild(d),e.append(r),!a){const n=m("div","history-tabs-container",{id:"historyContainer"});e.appendChild(n)}if(e.append(o,i,c),L(t),!a)if(t.spirits&&t.spirits.length>0&&t.spirits[0].type)B(t.spirits[0].type);else{console.warn("History cannot be rendered: missing spirit type in result.",t);const n=document.getElementById("historyContainer");n&&(n.innerHTML='<p class="no-history-message">기록을 불러올 수 없습니다.</p>')}}function L(t,e){const{gradeScore:a,factionScore:r,bindScore:o,gradeEffects:i,factionEffects:c,bindStats:l,spirits:d}=t,n=Math.round(f(a)+f(r)+f(o));document.getElementById("optimalHeader").innerHTML=`
        <h3 class="modal-main-title">${d[0].type} 결속 최적 조합</h3>
        <div class="modal-score-display">
            <span class="score-title">종합 점수</span>
            <span class="score-value">${n}</span>
            <span class="score-breakdown">
                (등급: ${Math.round(f(a))} 
                + 세력: ${Math.round(f(r))} 
                + 장착: ${Math.round(f(o))})
            </span>
        </div>
    `,document.getElementById("combinationResultsContainer").innerHTML=`
        <div class="spirits-grid-container">${d.map(s=>`
                <div class="spirit-info-item" title="${s.name} (Lv.${s.stats[0].level})">
                    <img src="${s.image}" alt="${s.name}">
                    <div class="spirit-info-details">
                        <div class="spirit-info-name">${s.name}</div>
                        <div class="spirit-info-level">Lv.${s.stats[0].level}</div>
                    </div>
                </div>`).join("")}
        </div>
    `,S("optimalGradeEffects","등급 효과",i,a,{gradeCounts:d.reduce((s,p)=>(s[p.grade]=(s[p.grade]||0)+1,s),{})}),S("optimalFactionEffects","세력 효과",c,r,{factionCounts:d.reduce((s,p)=>(p.influence&&(s[p.influence]=(s[p.influence]||0)+1),s),{})}),S("optimalBindEffects","장착 효과",l,o),P(d)}function B(t){const e=O(t),a=document.getElementById("historyContainer");if(!a)return;if(e.length===0){a.innerHTML=`<p class="no-history-message">${t} 카테고리에 저장된 기록이 없습니다.</p>`;return}let r=-1,o=null;const i=e.length>0?e[0].id:null;e.forEach(l=>{const d=Math.round(f(l.gradeScore)+f(l.factionScore)+f(l.bindScore));d>r&&(r=d,o=l.id)});const c=Array(5).fill(null).map((l,d)=>{const n=e[d];if(!n)return'<div class="history-tab-placeholder"></div>';const s=Math.round(f(n.gradeScore)+f(n.factionScore)+f(n.bindScore)),p=n.id===i,u=n.id===o;return`<button class="history-tab ${u?"best":""} ${p?"newest active":""}" data-history-id="${n.id}">
            <div class="tab-indicators">
                ${p?'<span class="current-marker">최신</span>':""}
                ${u?'<span class="best-marker">최고</span>':""}
            </div>
            <div class="tab-main-info">
                <span class="tab-score">${s}</span>
                <span class="tab-timestamp">${n.timestamp.substring(5,16)}</span>
            </div>
        </button>`}).join("");a.innerHTML=`<div class="history-tabs">${c}</div>`,a.querySelectorAll(".history-tab").forEach(l=>{l.addEventListener("click",()=>{a.querySelectorAll(".history-tab").forEach(s=>s.classList.remove("active")),l.classList.add("active");const d=parseInt(l.dataset.historyId,10),n=e.find(s=>s.id===d);n&&L(n)})})}function P(t){const e=document.getElementById("optimalSpiritsDetails");if(!e)return;const a=new Set;if(t.forEach(i=>{const c=$.allSpirits.find(n=>n.name===i.name&&n.type===i.type);if(!c)return;const l=i.level||25,d=c.stats.find(n=>n.level===l);d?.bindStat&&Object.keys(d.bindStat).forEach(n=>a.add(n))}),a.size===0){e.innerHTML="<h4>상세 스탯 비교</h4><p>선택된 환수의 장착 효과 스탯 정보가 없습니다.</p>";return}const r=[...a].sort();let o=`
        <h4>상세 스탯 비교</h4>
        <div class="table-wrapper">
            <table class="spirits-stats-table">
                <thead>
                    <tr>
                        <th>능력치</th>
                        ${t.map(i=>`<th><img src="${i.image}" class="spirit-thumbnail" alt="${i.name}" title="${i.name}"><br><span class="spirit-table-name">${i.name}</span></th>`).join("")}
                        <th class="stat-total-header">합산</th>
                    </tr>
                </thead>
                <tbody>
    `;r.forEach(i=>{const c=w[i]||"";let l=0,d="";t.forEach(s=>{const p=$.allSpirits.find(y=>y.name===s.name&&y.type===s.type),u=s.stats[0].level,M=p?.stats.find(y=>y.level===u),v=f(M?.bindStat?.[i]);l+=v;const H=b.includes(i)?`${v}%`:v.toLocaleString();d+=`<td>${v>0?H:"-"}</td>`});const n=b.includes(i)?`${l.toFixed(2)}%`:l.toLocaleString();o+=`
        <tr class="${c}">
            <th>${I[i]||i}</th>
            ${d}
            <td class="stat-total">${l>0?n:"-"}</td>
        </tr>`}),o+="</tbody></table></div>",e.innerHTML=o}function g(){h&&(document.removeEventListener("keydown",h._escListener),h.remove(),h=null),document.body.style.overflow="auto"}export{V as a,Y as s};
