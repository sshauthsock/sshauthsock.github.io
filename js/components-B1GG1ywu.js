import{L as g,E as w,a as x}from"./utils-DIa4fKeE.js";function S(t,o,r={}){if(!t){g.error("[ErrorRecovery] Container not provided");return}const{onRetry:a=null,onGoHome:n=()=>{window.location.href="/"},title:e="오류가 발생했습니다",message:i=null}=r,c=i||w.getUserFriendlyMessage(o?.message||""),s=`error-${Date.now()}`;t.innerHTML=`
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
  `;const l=t.querySelector(`#${s}`);if(a){const p=l.querySelector(".error-retry-btn");p&&p.addEventListener("click",()=>{if(g.log("[ErrorRecovery] Retry button clicked"),typeof a=="function")try{a()}catch(f){g.error("[ErrorRecovery] Retry failed:",f),S(t,f,r)}})}const u=l.querySelector(".error-home-btn");u&&u.addEventListener("click",()=>{g.log("[ErrorRecovery] Go home button clicked"),typeof n=="function"&&n()});const h=l.querySelector(".error-reload-btn");if(h&&h.addEventListener("click",()=>{g.log("[ErrorRecovery] Reload button clicked"),window.location.reload()}),!document.getElementById("error-recovery-styles")){const p=document.createElement("style");p.id="error-recovery-styles",p.textContent=`
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
    `,document.head.appendChild(p)}}function d(t,o,r={}){const a=document.createElement(t);return o&&(Array.isArray(o)?a.classList.add(...o):a.className=o),Object.entries(r).forEach(([n,e])=>{n==="text"||n==="textContent"?a.textContent=e:n==="html"||n==="innerHTML"?a.innerHTML=e:a.setAttribute(n,e)}),a}function H(t){if(!t||!Array.isArray(t.stats))return{hasFullRegistration:!1,hasFullBind:!1,hasLevel25Bind:!1};const o=t.stats.find(e=>e.level===25),r=!!(o?.registrationStat&&Object.keys(o.registrationStat).length>0),a=!!(o?.bindStat&&Object.keys(o.bindStat).length>0);return{hasFullRegistration:r,hasFullBind:a,hasLevel25Bind:a}}function N(t,o){if(!t?.stats)return!1;for(const r of t.stats)if(r?.registrationStat?.[o]!==void 0||r?.bindStat?.[o]!==void 0)return!0;return!1}function U(t){if(t==null)return 0;const o=parseFloat(String(t).replace(/,/g,""));return isNaN(o)?0:o}const G={결의:"assets/img/bond/결의.jpg",고요:"assets/img/bond/고요.jpg",의지:"assets/img/bond/의지.jpg",침착:"assets/img/bond/침착.jpg",냉정:"assets/img/bond/냉정.jpg",활력:"assets/img/bond/활력.jpg"},P={experienceGainIncrease:"경험치획득증가",lootAcquisitionIncrease:"전리품획득증가",movementSpeed:"이동속도",damageResistancePenetration:"피해저항관통",healthIncreasePercent:"체력증가%",magicIncreasePercent:"마력증가%",damageResistance:"피해저항",pvpDamagePercent:"대인피해%",pvpDefensePercent:"대인방어%",pvpDamage:"대인피해",pvpDefense:"대인방어",statusEffectAccuracy:"상태이상적중",statusEffectResistance:"상태이상저항",normalMonsterAdditionalDamage:"일반몬스터추가피해",normalMonsterPenetration:"일반몬스터관통",normalMonsterResistance:"일반몬스터저항",bossMonsterAdditionalDamage:"보스몬스터추가피해",bossMonsterPenetration:"보스몬스터관통",bossMonsterResistance:"보스몬스터저항",criticalPowerPercent:"치명위력%",destructionPowerIncrease:"파괴력증가",destructionPowerPercent:"파괴력증가%",criticalDamageResistance:"치명피해저항",criticalResistance:"치명저항",armorStrength:"무장도",strength:"힘",agility:"민첩",intelligence:"지력",power:"위력",damageAbsorption:"피해흡수",healthIncrease:"체력증가",magicIncrease:"마력증가",healthPotionEnhancement:"체력시약향상",magicPotionEnhancement:"마력시약향상",damageIncrease:"피해증가",healthRecoveryImprovement:"체력회복향상",magicRecoveryImprovement:"마력회복향상",criticalChance:"치명확률",criticalPower:"치명위력"},M=[["결의","고요","의지"],["침착","냉정","활력"]],z=["pvpDamagePercent","pvpDefensePercent","criticalPowerPercent","healthIncreasePercent","magicIncreasePercent","destructionPowerPercent"],V=["damageResistance","damageResistancePenetration","pvpDamagePercent","pvpDefensePercent"],$=["냉정의 수호","침착의 수호","결의의 수호","고요의 수호","활력의 수호","의지의 수호","냉정의 탑승","침착의 탑승","결의의 탑승","고요의 탑승","활력의 탑승","의지의 탑승","냉정의 변신","침착의 변신","결의의 변신","고요의 변신","활력의 변신","의지의 변신"];function W(t){return $.includes(t)}function L(t,o){const r=o(t),a=["img-wrapper"];r.selected&&a.push("selected");const n=d("div",a,{"data-spirit-name":t.name}),e=d("div","img-box");if(n.appendChild(e),r.selected){const s=d("div","center-check-mark",{text:"✓"});e.appendChild(s)}r.registrationCompleted&&e.classList.add("registration-completed"),r.bondCompleted&&e.classList.add("bond-completed");const i=d("img","",{src:`${t.image}`,alt:t.name,loading:"lazy"});if(e.appendChild(i),r.level25BindAvailable){const s=d("div","level25-indicator");e.appendChild(s)}const c=d("small","img-name",{text:t.name});return n.appendChild(c),n}function I(t,o,r){const a=d("div","image-container-grid");return t.forEach(n=>{const e=L(n,r);e.addEventListener("click",()=>o(n)),a.appendChild(e)}),a}function R(t,o,r){const a=d("div","image-container-grouped"),n=t.reduce((s,l)=>((s[l.influence||"기타"]=s[l.influence||"기타"]||[]).push(l),s),{}),e=(s,l)=>{const u=d("div","influence-group"),h=d("div","header-wrapper"),p=d("h3","influence-header",{text:`${s} (${l.length})`});h.appendChild(p),u.appendChild(h);const f=d("div","influence-items");return l.forEach(m=>{const v=L(m,r);v.addEventListener("click",()=>o(m)),f.appendChild(v)}),u.appendChild(f),u},i=new Set;M.forEach(s=>{const l=d("div","influence-row");let u=!1;s.forEach(h=>{n[h]&&(l.appendChild(e(h,n[h])),i.add(h),u=!0)}),u&&a.appendChild(l)});const c=Object.keys(n).filter(s=>!i.has(s)).sort();if(c.length>0){const s=d("div","influence-row");c.forEach(l=>s.appendChild(e(l,n[l]))),a.appendChild(s)}return a}function K({container:t,spirits:o,onSpiritClick:r,getSpiritState:a,groupByInfluence:n}){if(t.innerHTML="",o.length===0){t.innerHTML='<p class="empty-state-message">조건에 맞는 환수가 없습니다.</p>';return}let e;n?e=R(o,r,a):e=I(o,r,a),t.appendChild(e)}function J(t,o,r){const a=d("div","stat-filter-container"),n=d("select","stat-filter",{id:"statFilter"});n.appendChild(d("option","",{value:"",text:"능력치 필터"}));const e=d("button","clear-filter-btn",{text:"초기화"});e.style.display="none",A(n,o);const i=function(){const l=this.value;e.style.display=l?"block":"none",r(l)},c=()=>{n.value="",e.style.display="none",r("")};return n.addEventListener("change",i),e.addEventListener("click",c),a.append(n,e),t.appendChild(a),{statFilter:n,clearBtn:e,cleanup:()=>{n.removeEventListener("change",i),e.removeEventListener("click",c),a.remove()}}}function A(t,o){const r=new Set;o.forEach(a=>a.stats.forEach(n=>{n.bindStat&&Object.keys(n.bindStat).forEach(e=>r.add(e)),n.registrationStat&&Object.keys(n.registrationStat).forEach(e=>r.add(e))})),[...r].sort().forEach(a=>t.appendChild(d("option","",{value:a,text:P[a]||a})))}let b=null;function E(t){return t.replace(/\d+$/,"")}function X(t,o,r,a,n){k();const e=d("div","modal-overlay",{id:"modernChakResultsModal"}),i=d("div","modal-content");if(e.appendChild(i),document.body.appendChild(e),!document.querySelector('link[href*="chakra-results-modern.css"]')){const m=document.createElement("link");m.rel="stylesheet",m.href="public/assets/css/chakra-results-modern.css",document.head.appendChild(m)}const c=d("button","modal-close",{text:"✕"});c.addEventListener("click",k),i.appendChild(c);const s=d("div","kakao-ad-modal-container desktop-modal-ad");s.innerHTML=`
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-aOM3JPGvOLhHlyoS"
          data-ad-width="728"
          data-ad-height="90"></ins>
  `,i.appendChild(s);const l=d("div","kakao-ad-modal-container mobile-modal-ad");l.innerHTML=`
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-epbkjAaeHSxv0MYl"
          data-ad-width="320"
          data-ad-height="50"></ins>
  `,i.appendChild(l);const u=d("div","modal-header"),h=d("h3","",{text:r});u.appendChild(h),i.appendChild(u);const p=d("div","modern-chakra-container");i.appendChild(p),_(t,o,p,a,n),e.style.display="flex",document.body.style.overflow="hidden";const f=m=>{m.key==="Escape"&&k()};document.addEventListener("keydown",f),e._escListener=f,b=e,e.addEventListener("click",m=>{m.target===e&&k()}),setTimeout(()=>{try{const m=s.querySelector(".kakao_ad_area"),v=l.querySelector(".kakao_ad_area");window.adfit&&(m&&window.adfit.render(m),v&&window.adfit.render(v))}catch(m){console.error("Kakao AdFit: Error rendering ads in Chak modal:",m)}},100)}function _(t,o,r,a,n){const e=B(t,a);if(Object.keys(e).length===0){r.innerHTML=`
      <div class="chakra-empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">검색 결과가 없습니다</div>
        <div class="empty-state-description">선택된 능력치를 찾을 수 없습니다.<br>다른 능력치를 선택해보세요.</div>
      </div>
    `;return}const i=d("div","chakra-results-tabs"),c=d("div","chakra-results-content"),s=T(o);r.appendChild(s),r.appendChild(i),r.appendChild(c),Object.entries(e).forEach(([l,u],h)=>{const p=d("div","chakra-tab",{"data-stat":l,text:l}),f=d("span","chakra-tab-badge",{text:`${u.length}곳`});p.appendChild(f);const m=d("div","chakra-tab-panel",{"data-stat":l});h===0&&(p.classList.add("active"),m.classList.add("active")),j(m,u,o,n),i.appendChild(p),c.appendChild(m),p.addEventListener("click",()=>{i.querySelectorAll(".chakra-tab").forEach(v=>v.classList.remove("active")),c.querySelectorAll(".chakra-tab-panel").forEach(v=>v.classList.remove("active")),p.classList.add("active"),m.classList.add("active")})}),x(r)}function T(t,o,r){const a=q(t),n=d("div","quick-stats-summary"),e=d("div","summary-title");e.innerHTML=`
    <span class="summary-icon">📊</span>
    현재 적용된 능력치 요약
  `;const i=d("div","stats-summary-grid");return Object.keys(a).length===0?i.innerHTML='<div style="grid-column: 1/-1; text-align: center; color: #64748b;">적용된 능력치가 없습니다</div>':Object.entries(a).sort((c,s)=>s[1]-c[1]).forEach(([c,s])=>{const l=d("div","summary-stat-item");l.innerHTML=`
          <span class="summary-stat-name">${c}</span>
          <span class="summary-stat-value">+${s}</span>
        `,i.appendChild(l)}),n.appendChild(e),n.appendChild(i),n}function j(t,o,r,a){const n=o.reduce((i,c)=>{const s=c.part.split("_")[0];return(i[s]=i[s]||[]).push(c),i},{}),e=d("div","equipment-parts-grid");Object.entries(n).forEach(([i,c])=>{const s=d("div","equipment-part-card"),l=D(c,r);l.fullyUpgraded>0?s.classList.add("fully-upgraded"):l.partiallyUpgraded>0&&s.classList.add("has-upgrades");const u=d("div","equipment-card-header");u.innerHTML=`
      <div class="equipment-part-name">
        ${O(i)}
      </div>
      <div class="equipment-progress-info">
        <div class="progress-percentage">${l.progressPercentage}%</div>
        <div>${l.upgradedCount}/${c.length} 강화</div>
      </div>
    `;const h=d("div","upgrade-levels-container");c.sort((p,f)=>{const m=parseInt(p.level.replace(/\D/g,""),10),v=parseInt(f.level.replace(/\D/g,""),10);return m-v}).forEach(p=>{const f=`${p.statName}_${p.part}_${p.level}_${p.index}`,m=r[f]||{isUnlocked:!1,level:0},v=d("div","upgrade-level-row");let y="level-unused",C="미강화";m.isUnlocked&&(m.level===3?(y="level-complete",C="완료"):(y="level-partial",C=`${m.level}/3`)),v.innerHTML=`
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
        `,v.addEventListener("click",()=>{a(p.part,p.level),v.style.background="#dbeafe",setTimeout(()=>{v.style.background=""},300)}),h.appendChild(v)}),s.appendChild(u),s.appendChild(h),e.appendChild(s)}),t.appendChild(e)}function D(t,o){let r=0,a=0,n=0;t.forEach(i=>{const c=`${i.statName}_${i.part}_${i.level}_${i.index}`,s=o[c]||{isUnlocked:!1,level:0};s.isUnlocked&&(r++,s.level===3?a++:n++)});const e=Math.round(r/t.length*100);return{upgradedCount:r,fullyUpgraded:a,partiallyUpgraded:n,progressPercentage:e,totalCount:t.length}}function O(t){return{목걸이:"목걸이",반지:"반지",팔찌:"팔찌",벨트:"벨트",신발:"신발",장갑:"장갑"}[t]||t}function q(t,o){const r={};return Object.entries(t).forEach(([a,n])=>{if(!n.isUnlocked||n.level===0)return;const e=a.split("_");if(e.length<4)return;const i=e[0],c=E(i),s=10,l=n.level/3,u=Math.round(s*l);r[c]=(r[c]||0)+u}),r}function B(t,o){const r={};t.constants.parts.forEach(n=>{const e=n.split("_")[0];t.constants.levels.forEach(i=>{const c=`lv${i.replace("+","")}`,s=t.equipment[e]?.[c]||{};let l=0;Object.entries(s).forEach(([u,h])=>{const p=E(u);o.includes(p)&&(r[p]||(r[p]=[]),r[p].push({part:n,level:i,statName:u,maxValue:h,index:l,cardId:`${u}_${n}_${i}_${l}`})),l++})})});const a={};return Object.keys(r).sort().forEach(n=>{a[n]=r[n].sort((e,i)=>{const c=e.part.split("_")[0],s=i.part.split("_")[0];if(c!==s)return c.localeCompare(s);const l=parseInt(e.level.replace(/\D/g,""),10),u=parseInt(i.level.replace(/\D/g,""),10);return l-u})}),a}function k(){b&&(document.removeEventListener("keydown",b._escListener),b.remove(),b=null),document.body.style.overflow="auto"}export{V as E,G as F,z as P,P as S,J as a,N as b,d as c,H as d,U as e,X as f,W as i,K as r,S as s};
