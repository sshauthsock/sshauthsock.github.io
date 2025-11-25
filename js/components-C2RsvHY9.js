import{L as g,E as L,a as x}from"./utils-x5ORUUhl.js";function S(e,o,r={}){if(!e){g.error("[ErrorRecovery] Container not provided");return}const{onRetry:a=null,onGoHome:n=()=>{window.location.href="/"},title:t="오류가 발생했습니다",message:i=null}=r,d=i||L.getUserFriendlyMessage(o?.message||""),s=`error-${Date.now()}`;e.innerHTML=`
    <div class="error-recovery-container" id="${s}">
      <div class="error-recovery-content">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">${t}</h2>
        <p class="error-message">${d}</p>
        
        <div class="error-actions">
          ${a?'<button class="btn btn-primary error-retry-btn">다시 시도</button>':""}
          <button class="btn btn-secondary error-home-btn">홈으로 가기</button>
          <button class="btn btn-link error-reload-btn">페이지 새로고침</button>
        </div>
        
        
      </div>
    </div>
  `;const l=e.querySelector(`#${s}`);if(a){const p=l.querySelector(".error-retry-btn");p&&p.addEventListener("click",()=>{if(g.log("[ErrorRecovery] Retry button clicked"),typeof a=="function")try{a()}catch(f){g.error("[ErrorRecovery] Retry failed:",f),S(e,f,r)}})}const u=l.querySelector(".error-home-btn");u&&u.addEventListener("click",()=>{g.log("[ErrorRecovery] Go home button clicked"),typeof n=="function"&&n()});const h=l.querySelector(".error-reload-btn");if(h&&h.addEventListener("click",()=>{g.log("[ErrorRecovery] Reload button clicked"),window.location.reload()}),!document.getElementById("error-recovery-styles")){const p=document.createElement("style");p.id="error-recovery-styles",p.textContent=`
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
    `,document.head.appendChild(p)}}function c(e,o,r={}){const a=document.createElement(e);return o&&(Array.isArray(o)?a.classList.add(...o):a.className=o),Object.entries(r).forEach(([n,t])=>{n==="text"||n==="textContent"?a.textContent=t:n==="html"||n==="innerHTML"?a.innerHTML=t:a.setAttribute(n,t)}),a}function H(e,o){let r;return function(...a){const n=this;clearTimeout(r),r=setTimeout(()=>e.apply(n,a),o)}}function N(e){if(!e||!Array.isArray(e.stats))return{hasFullRegistration:!1,hasFullBind:!1,hasLevel25Bind:!1};const o=e.stats.find(t=>t.level===25),r=!!(o?.registrationStat&&Object.keys(o.registrationStat).length>0),a=!!(o?.bindStat&&Object.keys(o.bindStat).length>0);return{hasFullRegistration:r,hasFullBind:a,hasLevel25Bind:a}}function U(e,o){if(!e?.stats)return!1;for(const r of e.stats)if(r?.registrationStat?.[o]!==void 0||r?.bindStat?.[o]!==void 0)return!0;return!1}function G(e){if(e==null)return 0;const o=parseFloat(String(e).replace(/,/g,""));return isNaN(o)?0:o}const W={결의:"assets/img/bond/결의.jpg",고요:"assets/img/bond/고요.jpg",의지:"assets/img/bond/의지.jpg",침착:"assets/img/bond/침착.jpg",냉정:"assets/img/bond/냉정.jpg",활력:"assets/img/bond/활력.jpg"},P={experienceGainIncrease:"경험치획득증가",lootAcquisitionIncrease:"전리품획득증가",movementSpeed:"이동속도",damageResistancePenetration:"피해저항관통",healthIncreasePercent:"체력증가%",magicIncreasePercent:"마력증가%",damageResistance:"피해저항",pvpDamagePercent:"대인피해%",pvpDefensePercent:"대인방어%",pvpDamage:"대인피해",pvpDefense:"대인방어",statusEffectAccuracy:"상태이상적중",statusEffectResistance:"상태이상저항",normalMonsterAdditionalDamage:"일반몬스터추가피해",normalMonsterPenetration:"일반몬스터관통",normalMonsterResistance:"일반몬스터저항",bossMonsterAdditionalDamage:"보스몬스터추가피해",bossMonsterPenetration:"보스몬스터관통",bossMonsterResistance:"보스몬스터저항",criticalPowerPercent:"치명위력%",destructionPowerIncrease:"파괴력증가",destructionPowerPercent:"파괴력증가%",criticalDamageResistance:"치명피해저항",criticalResistance:"치명저항",armorStrength:"무장도",strength:"힘",agility:"민첩",intelligence:"지력",power:"위력",damageAbsorption:"피해흡수",healthIncrease:"체력증가",magicIncrease:"마력증가",healthPotionEnhancement:"체력시약향상",magicPotionEnhancement:"마력시약향상",damageIncrease:"피해증가",healthRecoveryImprovement:"체력회복향상",magicRecoveryImprovement:"마력회복향상",criticalChance:"치명확률",criticalPower:"치명위력"},M=[["결의","고요","의지"],["침착","냉정","활력"]],z=["pvpDamagePercent","pvpDefensePercent","criticalPowerPercent","healthIncreasePercent","magicIncreasePercent","destructionPowerPercent"],V=["damageResistance","damageResistancePenetration","pvpDamagePercent","pvpDefensePercent"],$=["냉정의 수호","침착의 수호","결의의 수호","고요의 수호","활력의 수호","의지의 수호","냉정의 탑승","침착의 탑승","결의의 탑승","고요의 탑승","활력의 탑승","의지의 탑승","냉정의 변신","침착의 변신","결의의 변신","고요의 변신","활력의 변신","의지의 변신"];function K(e){return $.includes(e)}function w(e,o){const r=o(e),a=["img-wrapper"];r.selected&&a.push("selected");const n=c("div",a,{"data-spirit-name":e.name}),t=c("div","img-box");if(n.appendChild(t),r.selected){const s=c("div","center-check-mark",{text:"✓"});t.appendChild(s)}r.registrationCompleted&&t.classList.add("registration-completed"),r.bondCompleted&&t.classList.add("bond-completed");const i=c("img","",{src:`${e.image}`,alt:e.name,loading:"lazy"});if(i.addEventListener("error",function(){if(i.src.endsWith(".webp")){const s=e.image.replace(/\.webp$/i,".jpg");i.src=s}},{once:!0}),t.appendChild(i),r.level25BindAvailable){const s=c("div","level25-indicator");t.appendChild(s)}const d=c("small","img-name",{text:e.name});return n.appendChild(d),n}function I(e,o,r){const a=c("div","image-container-grid");return e.forEach(n=>{const t=w(n,r);t.addEventListener("click",()=>o(n)),a.appendChild(t)}),a}function R(e,o,r){const a=c("div","image-container-grouped"),n=e.reduce((s,l)=>((s[l.influence||"기타"]=s[l.influence||"기타"]||[]).push(l),s),{}),t=(s,l)=>{const u=c("div","influence-group"),h=c("div","header-wrapper"),p=c("h3","influence-header",{text:`${s} (${l.length})`});h.appendChild(p),u.appendChild(h);const f=c("div","influence-items");return l.forEach(m=>{const v=w(m,r);v.addEventListener("click",()=>o(m)),f.appendChild(v)}),u.appendChild(f),u},i=new Set;M.forEach(s=>{const l=c("div","influence-row");let u=!1;s.forEach(h=>{n[h]&&(l.appendChild(t(h,n[h])),i.add(h),u=!0)}),u&&a.appendChild(l)});const d=Object.keys(n).filter(s=>!i.has(s)).sort();if(d.length>0){const s=c("div","influence-row");d.forEach(l=>s.appendChild(t(l,n[l]))),a.appendChild(s)}return a}function J({container:e,spirits:o,onSpiritClick:r,getSpiritState:a,groupByInfluence:n}){if(e.innerHTML="",o.length===0){e.innerHTML='<p class="empty-state-message">조건에 맞는 환수가 없습니다.</p>';return}let t;n?t=R(o,r,a):t=I(o,r,a),e.appendChild(t)}function X(e,o,r){const a=c("div","stat-filter-container"),n=c("select","stat-filter",{id:"statFilter"});n.appendChild(c("option","",{value:"",text:"능력치 필터"}));const t=c("button","clear-filter-btn",{text:"초기화"});t.style.display="none",A(n,o);const i=function(){const l=this.value;t.style.display=l?"block":"none",r(l)},d=()=>{n.value="",t.style.display="none",r("")};return n.addEventListener("change",i),t.addEventListener("click",d),a.append(n,t),e.appendChild(a),{statFilter:n,clearBtn:t,cleanup:()=>{n.removeEventListener("change",i),t.removeEventListener("click",d),a.remove()}}}function A(e,o){const r=new Set;o.forEach(a=>a.stats.forEach(n=>{n.bindStat&&Object.keys(n.bindStat).forEach(t=>r.add(t)),n.registrationStat&&Object.keys(n.registrationStat).forEach(t=>r.add(t))})),[...r].sort().forEach(a=>e.appendChild(c("option","",{value:a,text:P[a]||a})))}let b=null;function E(e){return e.replace(/\d+$/,"")}function Y(e,o,r,a,n){k();const t=c("div","modal-overlay",{id:"modernChakResultsModal"}),i=c("div","modal-content");if(t.appendChild(i),document.body.appendChild(t),!document.querySelector('link[href*="chakra-results-modern.css"]')){const m=document.createElement("link");m.rel="stylesheet",m.href="public/assets/css/chakra-results-modern.css",document.head.appendChild(m)}const d=c("button","modal-close",{text:"✕"});d.addEventListener("click",k),i.appendChild(d);const s=c("div","kakao-ad-modal-container desktop-modal-ad");s.innerHTML=`
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-aOM3JPGvOLhHlyoS"
          data-ad-width="728"
          data-ad-height="90"></ins>
  `,i.appendChild(s);const l=c("div","kakao-ad-modal-container mobile-modal-ad");l.innerHTML=`
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-epbkjAaeHSxv0MYl"
          data-ad-width="320"
          data-ad-height="50"></ins>
  `,i.appendChild(l);const u=c("div","modal-header"),h=c("h3","",{text:r});u.appendChild(h),i.appendChild(u);const p=c("div","modern-chakra-container");i.appendChild(p),T(e,o,p,a,n),t.style.display="flex",document.body.style.overflow="hidden";const f=m=>{m.key==="Escape"&&k()};document.addEventListener("keydown",f),t._escListener=f,b=t,t.addEventListener("click",m=>{m.target===t&&k()}),setTimeout(()=>{try{const m=s.querySelector(".kakao_ad_area"),v=l.querySelector(".kakao_ad_area");window.adfit&&(m&&window.adfit.render(m),v&&window.adfit.render(v))}catch(m){console.error("Kakao AdFit: Error rendering ads in Chak modal:",m)}},100)}function T(e,o,r,a,n){const t=B(e,a);if(Object.keys(t).length===0){r.innerHTML=`
      <div class="chakra-empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">검색 결과가 없습니다</div>
        <div class="empty-state-description">선택된 능력치를 찾을 수 없습니다.<br>다른 능력치를 선택해보세요.</div>
      </div>
    `;return}const i=c("div","chakra-results-tabs"),d=c("div","chakra-results-content"),s=_(o);r.appendChild(s),r.appendChild(i),r.appendChild(d),Object.entries(t).forEach(([l,u],h)=>{const p=c("div","chakra-tab",{"data-stat":l,text:l}),f=c("span","chakra-tab-badge",{text:`${u.length}곳`});p.appendChild(f);const m=c("div","chakra-tab-panel",{"data-stat":l});h===0&&(p.classList.add("active"),m.classList.add("active")),j(m,u,o,n),i.appendChild(p),d.appendChild(m),p.addEventListener("click",()=>{i.querySelectorAll(".chakra-tab").forEach(v=>v.classList.remove("active")),d.querySelectorAll(".chakra-tab-panel").forEach(v=>v.classList.remove("active")),p.classList.add("active"),m.classList.add("active")})}),x(r)}function _(e,o,r){const a=q(e),n=c("div","quick-stats-summary"),t=c("div","summary-title");t.innerHTML=`
    <span class="summary-icon">📊</span>
    현재 적용된 능력치 요약
  `;const i=c("div","stats-summary-grid");return Object.keys(a).length===0?i.innerHTML='<div style="grid-column: 1/-1; text-align: center; color: #64748b;">적용된 능력치가 없습니다</div>':Object.entries(a).sort((d,s)=>s[1]-d[1]).forEach(([d,s])=>{const l=c("div","summary-stat-item");l.innerHTML=`
          <span class="summary-stat-name">${d}</span>
          <span class="summary-stat-value">+${s}</span>
        `,i.appendChild(l)}),n.appendChild(t),n.appendChild(i),n}function j(e,o,r,a){const n=o.reduce((i,d)=>{const s=d.part.split("_")[0];return(i[s]=i[s]||[]).push(d),i},{}),t=c("div","equipment-parts-grid");Object.entries(n).forEach(([i,d])=>{const s=c("div","equipment-part-card"),l=D(d,r);l.fullyUpgraded>0?s.classList.add("fully-upgraded"):l.partiallyUpgraded>0&&s.classList.add("has-upgrades");const u=c("div","equipment-card-header");u.innerHTML=`
      <div class="equipment-part-name">
        ${O(i)}
      </div>
      <div class="equipment-progress-info">
        <div class="progress-percentage">${l.progressPercentage}%</div>
        <div>${l.upgradedCount}/${d.length} 강화</div>
      </div>
    `;const h=c("div","upgrade-levels-container");d.sort((p,f)=>{const m=parseInt(p.level.replace(/\D/g,""),10),v=parseInt(f.level.replace(/\D/g,""),10);return m-v}).forEach(p=>{const f=`${p.statName}_${p.part}_${p.level}_${p.index}`,m=r[f]||{isUnlocked:!1,level:0},v=c("div","upgrade-level-row");let y="level-unused",C="미강화";m.isUnlocked&&(m.level===3?(y="level-complete",C="완료"):(y="level-partial",C=`${m.level}/3`)),v.innerHTML=`
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
        `,v.addEventListener("click",()=>{a(p.part,p.level),v.style.background="#dbeafe",setTimeout(()=>{v.style.background=""},300)}),h.appendChild(v)}),s.appendChild(u),s.appendChild(h),t.appendChild(s)}),e.appendChild(t)}function D(e,o){let r=0,a=0,n=0;e.forEach(i=>{const d=`${i.statName}_${i.part}_${i.level}_${i.index}`,s=o[d]||{isUnlocked:!1,level:0};s.isUnlocked&&(r++,s.level===3?a++:n++)});const t=Math.round(r/e.length*100);return{upgradedCount:r,fullyUpgraded:a,partiallyUpgraded:n,progressPercentage:t,totalCount:e.length}}function O(e){return{목걸이:"목걸이",반지:"반지",팔찌:"팔찌",벨트:"벨트",신발:"신발",장갑:"장갑"}[e]||e}function q(e,o){const r={};return Object.entries(e).forEach(([a,n])=>{if(!n.isUnlocked||n.level===0)return;const t=a.split("_");if(t.length<4)return;const i=t[0],d=E(i),s=10,l=n.level/3,u=Math.round(s*l);r[d]=(r[d]||0)+u}),r}function B(e,o){const r={};e.constants.parts.forEach(n=>{const t=n.split("_")[0];e.constants.levels.forEach(i=>{const d=`lv${i.replace("+","")}`,s=e.equipment[t]?.[d]||{};let l=0;Object.entries(s).forEach(([u,h])=>{const p=E(u);o.includes(p)&&(r[p]||(r[p]=[]),r[p].push({part:n,level:i,statName:u,maxValue:h,index:l,cardId:`${u}_${n}_${i}_${l}`})),l++})})});const a={};return Object.keys(r).sort().forEach(n=>{a[n]=r[n].sort((t,i)=>{const d=t.part.split("_")[0],s=i.part.split("_")[0];if(d!==s)return d.localeCompare(s);const l=parseInt(t.level.replace(/\D/g,""),10),u=parseInt(i.level.replace(/\D/g,""),10);return l-u})}),a}function k(){b&&(document.removeEventListener("keydown",b._escListener),b.remove(),b=null),document.body.style.overflow="auto"}export{V as E,W as F,z as P,P as S,X as a,U as b,c,N as d,G as e,H as f,Y as g,K as i,J as r,S as s};
