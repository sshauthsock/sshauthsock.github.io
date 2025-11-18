import{L as g,E as w,a as x}from"./utils-CDZab3B1.js";function S(n,l,r={}){if(!n){g.error("[ErrorRecovery] Container not provided");return}const{onRetry:a=null,onGoHome:t=()=>{window.location.href="/"},title:e="오류가 발생했습니다",message:o=null}=r,c=o||w.getUserFriendlyMessage(l?.message||""),s=`error-${Date.now()}`;n.innerHTML=`
    <div class="error-recovery-container" id="${s}">
      <div class="error-recovery-content">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">${e}</h2>
        <p class="error-message">${c}</p>
        
        <div class="error-actions">
          ${a?'<button class="btn btn-primary error-retry-btn">다시 시도</button>':""}
          <button class="btn btn-secondary error-home-btn">홈으로 가기</button>
          <button class="btn btn-link error-reload-btn">페이지 새로고침</button>
        </div>
        
        
      </div>
    </div>
  `;const i=n.querySelector(`#${s}`);if(a){const p=i.querySelector(".error-retry-btn");p&&p.addEventListener("click",()=>{if(g.log("[ErrorRecovery] Retry button clicked"),typeof a=="function")try{a()}catch(f){g.error("[ErrorRecovery] Retry failed:",f),S(n,f,r)}})}const u=i.querySelector(".error-home-btn");u&&u.addEventListener("click",()=>{g.log("[ErrorRecovery] Go home button clicked"),typeof t=="function"&&t()});const v=i.querySelector(".error-reload-btn");if(v&&v.addEventListener("click",()=>{g.log("[ErrorRecovery] Reload button clicked"),window.location.reload()}),!document.getElementById("error-recovery-styles")){const p=document.createElement("style");p.id="error-recovery-styles",p.textContent=`
      .error-recovery-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
        padding: 2rem;
      }
      .error-recovery-content {
        text-align: center;
        max-width: 500px;
        background: #fff;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .error-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
      }
      .error-title {
        color: #e74c3c;
        margin-bottom: 1rem;
        font-size: 1.5rem;
      }
      .error-message {
        color: #666;
        margin-bottom: 2rem;
        line-height: 1.6;
      }
      .error-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      .error-actions .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s;
      }
      .error-actions .btn-primary {
        background: #3498db;
        color: white;
      }
      .error-actions .btn-primary:hover {
        background: #2980b9;
      }
      .error-actions .btn-secondary {
        background: #95a5a6;
        color: white;
      }
      .error-actions .btn-secondary:hover {
        background: #7f8c8d;
      }
      .error-actions .btn-link {
        background: transparent;
        color: #3498db;
        text-decoration: underline;
      }
      .error-actions .btn-link:hover {
        color: #2980b9;
      }
      .error-details {
        margin-top: 2rem;
        text-align: left;
        border-top: 1px solid #eee;
        padding-top: 1rem;
      }
      .error-details summary {
        cursor: pointer;
        color: #666;
        margin-bottom: 0.5rem;
      }
      .error-stack {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
        font-size: 0.875rem;
        color: #333;
        max-height: 300px;
        overflow-y: auto;
      }
    `,document.head.appendChild(p)}}function d(n,l,r={}){const a=document.createElement(n);return l&&(Array.isArray(l)?a.classList.add(...l):a.className=l),Object.entries(r).forEach(([t,e])=>{t==="text"||t==="textContent"?a.textContent=e:t==="html"||t==="innerHTML"?a.innerHTML=e:a.setAttribute(t,e)}),a}function H(n){if(!n||!Array.isArray(n.stats))return{hasFullRegistration:!1,hasFullBind:!1,hasLevel25Bind:!1};const l=n.stats.find(e=>e.level===25),r=!!(l?.registrationStat&&Object.keys(l.registrationStat).length>0),a=!!(l?.bindStat&&Object.keys(l.bindStat).length>0);return{hasFullRegistration:r,hasFullBind:a,hasLevel25Bind:a}}function N(n,l){if(!n?.stats)return!1;for(const r of n.stats)if(r?.registrationStat?.[l]!==void 0||r?.bindStat?.[l]!==void 0)return!0;return!1}const U={결의:"assets/img/bond/결의.jpg",고요:"assets/img/bond/고요.jpg",의지:"assets/img/bond/의지.jpg",침착:"assets/img/bond/침착.jpg",냉정:"assets/img/bond/냉정.jpg",활력:"assets/img/bond/활력.jpg"},P={experienceGainIncrease:"경험치획득증가",lootAcquisitionIncrease:"전리품획득증가",movementSpeed:"이동속도",damageResistancePenetration:"피해저항관통",healthIncreasePercent:"체력증가%",magicIncreasePercent:"마력증가%",damageResistance:"피해저항",pvpDamagePercent:"대인피해%",pvpDefensePercent:"대인방어%",pvpDamage:"대인피해",pvpDefense:"대인방어",statusEffectAccuracy:"상태이상적중",statusEffectResistance:"상태이상저항",normalMonsterAdditionalDamage:"일반몬스터추가피해",normalMonsterPenetration:"일반몬스터관통",normalMonsterResistance:"일반몬스터저항",bossMonsterAdditionalDamage:"보스몬스터추가피해",bossMonsterPenetration:"보스몬스터관통",bossMonsterResistance:"보스몬스터저항",criticalPowerPercent:"치명위력%",destructionPowerIncrease:"파괴력증가",destructionPowerPercent:"파괴력증가%",criticalDamageResistance:"치명피해저항",criticalResistance:"치명저항",armorStrength:"무장도",strength:"힘",agility:"민첩",intelligence:"지력",power:"위력",damageAbsorption:"피해흡수",healthIncrease:"체력증가",magicIncrease:"마력증가",healthPotionEnhancement:"체력시약향상",magicPotionEnhancement:"마력시약향상",damageIncrease:"피해증가",healthRecoveryImprovement:"체력회복향상",magicRecoveryImprovement:"마력회복향상",criticalChance:"치명확률",criticalPower:"치명위력"},M=[["결의","고요","의지"],["침착","냉정","활력"]],G=["pvpDamagePercent","pvpDefensePercent","criticalPowerPercent","healthIncreasePercent","magicIncreasePercent","destructionPowerPercent"],z=["damageResistance","damageResistancePenetration","pvpDamagePercent","pvpDefensePercent"],$=["냉정의 수호","침착의 수호","결의의 수호","고요의 수호","활력의 수호","의지의 수호","냉정의 탑승","침착의 탑승","결의의 탑승","고요의 탑승","활력의 탑승","의지의 탑승","냉정의 변신","침착의 변신","결의의 변신","고요의 변신","활력의 변신","의지의 변신"];function V(n){return $.includes(n)}function L(n,l){const r=l(n),a=["img-wrapper"];r.selected&&a.push("selected");const t=d("div",a,{"data-spirit-name":n.name}),e=d("div","img-box");if(t.appendChild(e),r.selected){const s=d("div","center-check-mark",{text:"✓"});e.appendChild(s)}r.registrationCompleted&&e.classList.add("registration-completed"),r.bondCompleted&&e.classList.add("bond-completed");const o=d("img","",{src:`${n.image}`,alt:n.name,loading:"lazy"});if(e.appendChild(o),r.level25BindAvailable){const s=d("div","level25-indicator");e.appendChild(s)}const c=d("small","img-name",{text:n.name});return t.appendChild(c),t}function I(n,l,r){const a=d("div","image-container-grid");return n.forEach(t=>{const e=L(t,r);e.addEventListener("click",()=>l(t)),a.appendChild(e)}),a}function R(n,l,r){const a=d("div","image-container-grouped"),t=n.reduce((s,i)=>((s[i.influence||"기타"]=s[i.influence||"기타"]||[]).push(i),s),{}),e=(s,i)=>{const u=d("div","influence-group"),v=d("div","header-wrapper"),p=d("h3","influence-header",{text:`${s} (${i.length})`});v.appendChild(p),u.appendChild(v);const f=d("div","influence-items");return i.forEach(m=>{const h=L(m,r);h.addEventListener("click",()=>l(m)),f.appendChild(h)}),u.appendChild(f),u},o=new Set;M.forEach(s=>{const i=d("div","influence-row");let u=!1;s.forEach(v=>{t[v]&&(i.appendChild(e(v,t[v])),o.add(v),u=!0)}),u&&a.appendChild(i)});const c=Object.keys(t).filter(s=>!o.has(s)).sort();if(c.length>0){const s=d("div","influence-row");c.forEach(i=>s.appendChild(e(i,t[i]))),a.appendChild(s)}return a}function W({container:n,spirits:l,onSpiritClick:r,getSpiritState:a,groupByInfluence:t}){if(n.innerHTML="",l.length===0){n.innerHTML='<p class="empty-state-message">조건에 맞는 환수가 없습니다.</p>';return}let e;t?e=R(l,r,a):e=I(l,r,a),n.appendChild(e)}function K(n,l,r){const a=d("div","stat-filter-container"),t=d("select","stat-filter",{id:"statFilter"});t.appendChild(d("option","",{value:"",text:"능력치 필터"}));const e=d("button","clear-filter-btn",{text:"초기화"});e.style.display="none",A(t,l);const o=function(){const i=this.value;e.style.display=i?"block":"none",r(i)},c=()=>{t.value="",e.style.display="none",r("")};return t.addEventListener("change",o),e.addEventListener("click",c),a.append(t,e),n.appendChild(a),{statFilter:t,clearBtn:e,cleanup:()=>{t.removeEventListener("change",o),e.removeEventListener("click",c),a.remove()}}}function A(n,l){const r=new Set;l.forEach(a=>a.stats.forEach(t=>{t.bindStat&&Object.keys(t.bindStat).forEach(e=>r.add(e)),t.registrationStat&&Object.keys(t.registrationStat).forEach(e=>r.add(e))})),[...r].sort().forEach(a=>n.appendChild(d("option","",{value:a,text:P[a]||a})))}let b=null;function E(n){return n.replace(/\d+$/,"")}function J(n,l,r,a,t){k();const e=d("div","modal-overlay",{id:"modernChakResultsModal"}),o=d("div","modal-content");if(e.appendChild(o),document.body.appendChild(e),!document.querySelector('link[href*="chakra-results-modern.css"]')){const m=document.createElement("link");m.rel="stylesheet",m.href="public/assets/css/chakra-results-modern.css",document.head.appendChild(m)}const c=d("button","modal-close",{text:"✕"});c.addEventListener("click",k),o.appendChild(c);const s=d("div","kakao-ad-modal-container desktop-modal-ad");s.innerHTML=`
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-aOM3JPGvOLhHlyoS"
          data-ad-width="728"
          data-ad-height="90"></ins>
  `,o.appendChild(s);const i=d("div","kakao-ad-modal-container mobile-modal-ad");i.innerHTML=`
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-epbkjAaeHSxv0MYl"
          data-ad-width="320"
          data-ad-height="50"></ins>
  `,o.appendChild(i);const u=d("div","modal-header"),v=d("h3","",{text:r});u.appendChild(v),o.appendChild(u);const p=d("div","modern-chakra-container");o.appendChild(p),_(n,l,p,a,t),e.style.display="flex",document.body.style.overflow="hidden";const f=m=>{m.key==="Escape"&&k()};document.addEventListener("keydown",f),e._escListener=f,b=e,e.addEventListener("click",m=>{m.target===e&&k()}),setTimeout(()=>{try{const m=s.querySelector(".kakao_ad_area"),h=i.querySelector(".kakao_ad_area");window.adfit&&(m&&window.adfit.render(m),h&&window.adfit.render(h))}catch(m){console.error("Kakao AdFit: Error rendering ads in Chak modal:",m)}},100)}function _(n,l,r,a,t){const e=B(n,a);if(Object.keys(e).length===0){r.innerHTML=`
      <div class="chakra-empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">검색 결과가 없습니다</div>
        <div class="empty-state-description">선택된 능력치를 찾을 수 없습니다.<br>다른 능력치를 선택해보세요.</div>
      </div>
    `;return}const o=d("div","chakra-results-tabs"),c=d("div","chakra-results-content"),s=T(l);r.appendChild(s),r.appendChild(o),r.appendChild(c),Object.entries(e).forEach(([i,u],v)=>{const p=d("div","chakra-tab",{"data-stat":i,text:i}),f=d("span","chakra-tab-badge",{text:`${u.length}곳`});p.appendChild(f);const m=d("div","chakra-tab-panel",{"data-stat":i});v===0&&(p.classList.add("active"),m.classList.add("active")),j(m,u,l,t),o.appendChild(p),c.appendChild(m),p.addEventListener("click",()=>{o.querySelectorAll(".chakra-tab").forEach(h=>h.classList.remove("active")),c.querySelectorAll(".chakra-tab-panel").forEach(h=>h.classList.remove("active")),p.classList.add("active"),m.classList.add("active")})}),x(r)}function T(n,l,r){const a=q(n),t=d("div","quick-stats-summary"),e=d("div","summary-title");e.innerHTML=`
    <span class="summary-icon">📊</span>
    현재 적용된 능력치 요약
  `;const o=d("div","stats-summary-grid");return Object.keys(a).length===0?o.innerHTML='<div style="grid-column: 1/-1; text-align: center; color: #64748b;">적용된 능력치가 없습니다</div>':Object.entries(a).sort((c,s)=>s[1]-c[1]).forEach(([c,s])=>{const i=d("div","summary-stat-item");i.innerHTML=`
          <span class="summary-stat-name">${c}</span>
          <span class="summary-stat-value">+${s}</span>
        `,o.appendChild(i)}),t.appendChild(e),t.appendChild(o),t}function j(n,l,r,a){const t=l.reduce((o,c)=>{const s=c.part.split("_")[0];return(o[s]=o[s]||[]).push(c),o},{}),e=d("div","equipment-parts-grid");Object.entries(t).forEach(([o,c])=>{const s=d("div","equipment-part-card"),i=D(c,r);i.fullyUpgraded>0?s.classList.add("fully-upgraded"):i.partiallyUpgraded>0&&s.classList.add("has-upgrades");const u=d("div","equipment-card-header");u.innerHTML=`
      <div class="equipment-part-name">
        ${O(o)}
      </div>
      <div class="equipment-progress-info">
        <div class="progress-percentage">${i.progressPercentage}%</div>
        <div>${i.upgradedCount}/${c.length} 강화</div>
      </div>
    `;const v=d("div","upgrade-levels-container");c.sort((p,f)=>{const m=parseInt(p.level.replace(/\D/g,""),10),h=parseInt(f.level.replace(/\D/g,""),10);return m-h}).forEach(p=>{const f=`${p.statName}_${p.part}_${p.level}_${p.index}`,m=r[f]||{isUnlocked:!1,level:0},h=d("div","upgrade-level-row");let y="level-unused",C="미강화";m.isUnlocked&&(m.level===3?(y="level-complete",C="완료"):(y="level-partial",C=`${m.level}/3`)),h.innerHTML=`
          <div class="level-indicator ${y}">
            ${p.level}
          </div>
          <div class="level-details">
            <div class="level-stat-info">
              <div class="level-stat-name">${E(p.statName)}</div>
              <div class="level-stat-value">+${p.maxValue}</div>
            </div>
            <div class="level-status-badge status-${y.replace("level-","")}">
              ${C}
            </div>
          </div>
        `,h.addEventListener("click",()=>{a(p.part,p.level),h.style.background="#dbeafe",setTimeout(()=>{h.style.background=""},300)}),v.appendChild(h)}),s.appendChild(u),s.appendChild(v),e.appendChild(s)}),n.appendChild(e)}function D(n,l){let r=0,a=0,t=0;n.forEach(o=>{const c=`${o.statName}_${o.part}_${o.level}_${o.index}`,s=l[c]||{isUnlocked:!1,level:0};s.isUnlocked&&(r++,s.level===3?a++:t++)});const e=Math.round(r/n.length*100);return{upgradedCount:r,fullyUpgraded:a,partiallyUpgraded:t,progressPercentage:e,totalCount:n.length}}function O(n){return{목걸이:"목걸이",반지:"반지",팔찌:"팔찌",벨트:"벨트",신발:"신발",장갑:"장갑"}[n]||n}function q(n,l){const r={};return Object.entries(n).forEach(([a,t])=>{if(!t.isUnlocked||t.level===0)return;const e=a.split("_");if(e.length<4)return;const o=e[0],c=E(o),s=10,i=t.level/3,u=Math.round(s*i);r[c]=(r[c]||0)+u}),r}function B(n,l){const r={};n.constants.parts.forEach(t=>{const e=t.split("_")[0];n.constants.levels.forEach(o=>{const c=`lv${o.replace("+","")}`,s=n.equipment[e]?.[c]||{};let i=0;Object.entries(s).forEach(([u,v])=>{const p=E(u);l.includes(p)&&(r[p]||(r[p]=[]),r[p].push({part:t,level:o,statName:u,maxValue:v,index:i,cardId:`${u}_${t}_${o}_${i}`})),i++})})});const a={};return Object.keys(r).sort().forEach(t=>{a[t]=r[t].sort((e,o)=>{const c=e.part.split("_")[0],s=o.part.split("_")[0];if(c!==s)return c.localeCompare(s);const i=parseInt(e.level.replace(/\D/g,""),10),u=parseInt(o.level.replace(/\D/g,""),10);return i-u})}),a}function k(){b&&(document.removeEventListener("keydown",b._escListener),b.remove(),b=null),document.body.style.overflow="auto"}export{z as E,U as F,G as P,P as S,K as a,N as b,d as c,H as d,J as e,V as i,W as r,S as s};
