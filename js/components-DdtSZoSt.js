import{E,a as D}from"./utils-CrhYKkLj.js";function S(e,i,t={}){if(!e)return;const{onRetry:r=null,onGoHome:n=()=>{window.location.href="/"},title:a="오류가 발생했습니다",message:c=null}=t,l=c||E.getUserFriendlyMessage(i?.message||""),s=`error-${Date.now()}`;e.innerHTML=`
    <div class="error-recovery-container" id="${s}">
      <div class="error-recovery-content">
        <div class="error-icon">⚠️</div>
        <h2 class="error-title">${a}</h2>
        <p class="error-message">${l}</p>
        
        <div class="error-actions">
          ${r?'<button class="btn btn-primary error-retry-btn">다시 시도</button>':""}
          <button class="btn btn-secondary error-home-btn">홈으로 가기</button>
          <button class="btn btn-link error-reload-btn">페이지 새로고침</button>
        </div>
        
        
      </div>
    </div>
  `;const o=e.querySelector(`#${s}`);if(r){const m=o.querySelector(".error-retry-btn");m&&m.addEventListener("click",()=>{if(typeof r=="function")try{r()}catch(u){S(e,u,t)}})}const p=o.querySelector(".error-home-btn");p&&p.addEventListener("click",()=>{typeof n=="function"&&n()});const v=o.querySelector(".error-reload-btn");if(v&&v.addEventListener("click",()=>{window.location.reload()}),!document.getElementById("error-recovery-styles")){const m=document.createElement("style");m.id="error-recovery-styles",m.textContent=`
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
    `,document.head.appendChild(m)}}function d(e,i,t={}){const r=document.createElement(e);return i&&(Array.isArray(i)?r.classList.add(...i):r.className=i),Object.entries(t).forEach(([n,a])=>{n==="text"||n==="textContent"?r.textContent=a:n==="html"||n==="innerHTML"?r.innerHTML=a:r.setAttribute(n,a)}),r}function q(e,i){let t;return function(...r){const n=this;clearTimeout(t),t=setTimeout(()=>e.apply(n,r),i)}}function B(e){if(!e||!Array.isArray(e.stats))return{hasFullRegistration:!1,hasFullBind:!1,hasLevel25Bind:!1};const i=e.stats.find(a=>a.level===25),t=!!(i?.registrationStat&&Object.keys(i.registrationStat).length>0),r=!!(i?.bindStat&&Object.keys(i.bindStat).length>0);return{hasFullRegistration:t,hasFullBind:r,hasLevel25Bind:r}}function H(e,i){if(!e?.stats)return!1;for(const t of e.stats)if(t?.registrationStat?.[i]!==void 0||t?.bindStat?.[i]!==void 0)return!0;return!1}function N(e){if(e==null)return 0;const i=parseFloat(String(e).replace(/,/g,""));return isNaN(i)?0:i}const U={결의:"assets/img/bond/결의.jpg",고요:"assets/img/bond/고요.jpg",의지:"assets/img/bond/의지.jpg",침착:"assets/img/bond/침착.jpg",냉정:"assets/img/bond/냉정.jpg",활력:"assets/img/bond/활력.jpg"},x={experienceGainIncrease:"경험치획득증가",lootAcquisitionIncrease:"전리품획득증가",movementSpeed:"이동속도",damageResistancePenetration:"피해저항관통",healthIncreasePercent:"체력증가%",magicIncreasePercent:"마력증가%",damageResistance:"피해저항",pvpDamagePercent:"대인피해%",pvpDefensePercent:"대인방어%",pvpDamage:"대인피해",pvpDefense:"대인방어",statusEffectAccuracy:"상태이상적중",statusEffectResistance:"상태이상저항",normalMonsterAdditionalDamage:"일반몬스터추가피해",normalMonsterPenetration:"일반몬스터관통",normalMonsterResistance:"일반몬스터저항",bossMonsterAdditionalDamage:"보스몬스터추가피해",bossMonsterPenetration:"보스몬스터관통",bossMonsterResistance:"보스몬스터저항",criticalPowerPercent:"치명위력%",destructionPowerIncrease:"파괴력증가",destructionPowerPercent:"파괴력증가%",criticalDamageResistance:"치명피해저항",criticalResistance:"치명저항",armorStrength:"무장도",strength:"힘",agility:"민첩",intelligence:"지력",power:"위력",damageAbsorption:"피해흡수",healthIncrease:"체력증가",magicIncrease:"마력증가",healthPotionEnhancement:"체력시약향상",magicPotionEnhancement:"마력시약향상",damageIncrease:"피해증가",healthRecoveryImprovement:"체력회복향상",magicRecoveryImprovement:"마력회복향상",criticalChance:"치명확률",criticalPower:"치명위력",castingEnhancement:"시전향상"},C=[["결의","고요","의지"],["침착","냉정","활력"]],W=["pvpDamagePercent","pvpDefensePercent","criticalPowerPercent","healthIncreasePercent","magicIncreasePercent","destructionPowerPercent"],z=["damageResistance","damageResistancePenetration","pvpDamagePercent","pvpDefensePercent"],k=["냉정의 수호","침착의 수호","결의의 수호","고요의 수호","활력의 수호","의지의 수호","냉정의 탑승","침착의 탑승","결의의 탑승","고요의 탑승","활력의 탑승","의지의 탑승","냉정의 변신","침착의 변신","결의의 변신","고요의 변신","활력의 변신","의지의 변신"];function V(e){return k.includes(e)}const J={수호:{전설:{2:{power:150},3:{power:150,experienceGainIncrease:10},4:{power:150,experienceGainIncrease:10,damageResistancePenetration:100},5:{power:150,experienceGainIncrease:10,damageResistancePenetration:100,statusEffectResistance:150},6:{power:150,experienceGainIncrease:10,damageResistancePenetration:100,statusEffectResistance:150,damageResistance:100}},불멸:{2:{damageResistancePenetration:200},3:{damageResistancePenetration:200,damageResistance:150},4:{damageResistancePenetration:200,damageResistance:150,experienceGainIncrease:15},5:{damageResistancePenetration:200,damageResistance:150,experienceGainIncrease:15,pvpDamagePercent:20},6:{damageResistancePenetration:200,damageResistance:150,experienceGainIncrease:15,pvpDamagePercent:20,pvpDefensePercent:20}}},탑승:{전설:{2:{normalMonsterAdditionalDamage:50},3:{normalMonsterAdditionalDamage:50,bossMonsterAdditionalDamage:50},4:{normalMonsterAdditionalDamage:50,bossMonsterAdditionalDamage:50,damageResistancePenetration:50},5:{normalMonsterAdditionalDamage:50,bossMonsterAdditionalDamage:50,damageResistancePenetration:50,statusEffectAccuracy:50},6:{normalMonsterAdditionalDamage:50,bossMonsterAdditionalDamage:50,damageResistancePenetration:50,statusEffectAccuracy:50,damageResistance:50}},불멸:{2:{damageResistancePenetration:150},3:{damageResistancePenetration:150,damageResistance:150},4:{damageResistancePenetration:150,damageResistance:150,movementSpeed:5},5:{damageResistancePenetration:150,damageResistance:150,movementSpeed:5,pvpDamagePercent:20},6:{damageResistancePenetration:150,damageResistance:150,movementSpeed:5,pvpDamagePercent:20,pvpDefensePercent:20}}},변신:{전설:{2:{magicIncreasePercent:3},3:{magicIncreasePercent:3,healthIncreasePercent:3},4:{magicIncreasePercent:3,healthIncreasePercent:3,damageResistancePenetration:100},5:{magicIncreasePercent:3,healthIncreasePercent:3,damageResistancePenetration:100,movementSpeed:3},6:{magicIncreasePercent:3,healthIncreasePercent:3,damageResistancePenetration:100,movementSpeed:3,damageResistance:100}},불멸:{2:{damageResistancePenetration:150},3:{damageResistancePenetration:150,damageResistance:150},4:{damageResistancePenetration:150,damageResistance:150,criticalPowerPercent:30},5:{damageResistancePenetration:150,damageResistance:150,criticalPowerPercent:30,pvpDamagePercent:20},6:{damageResistancePenetration:150,damageResistance:150,criticalPowerPercent:30,pvpDamagePercent:20,pvpDefensePercent:20}}}},K={수호:{결의:{2:{damageResistance:50,normalMonsterAdditionalDamage:100,experienceGainIncrease:4},3:{damageResistance:80,normalMonsterAdditionalDamage:150,experienceGainIncrease:6},4:{damageResistance:130,normalMonsterAdditionalDamage:250,experienceGainIncrease:10},5:{damageResistance:150,normalMonsterAdditionalDamage:270,experienceGainIncrease:12},6:{damageResistance:200,normalMonsterAdditionalDamage:400,experienceGainIncrease:15}},고요:{2:{damageResistance:50,bossMonsterAdditionalDamage:100,experienceGainIncrease:4},3:{damageResistance:80,bossMonsterAdditionalDamage:150,experienceGainIncrease:6},4:{damageResistance:130,bossMonsterAdditionalDamage:250,experienceGainIncrease:10},5:{damageResistance:150,bossMonsterAdditionalDamage:270,experienceGainIncrease:12},6:{damageResistance:200,bossMonsterAdditionalDamage:400,experienceGainIncrease:15}},의지:{2:{damageResistance:50,criticalDamageResistance:100,experienceGainIncrease:4},3:{damageResistance:80,criticalDamageResistance:150,experienceGainIncrease:6},4:{damageResistance:130,criticalDamageResistance:250,experienceGainIncrease:10},5:{damageResistance:150,criticalDamageResistance:270,experienceGainIncrease:12},6:{damageResistance:200,criticalDamageResistance:400,experienceGainIncrease:15}},침착:{2:{damageResistancePenetration:30,damageAbsorption:700,experienceGainIncrease:4},3:{damageResistancePenetration:50,damageAbsorption:1200,experienceGainIncrease:6},4:{damageResistancePenetration:80,damageAbsorption:2e3,experienceGainIncrease:10},5:{damageResistancePenetration:90,damageAbsorption:2200,experienceGainIncrease:12},6:{damageResistancePenetration:130,damageAbsorption:3e3,experienceGainIncrease:15}},냉정:{2:{damageResistancePenetration:30,pvpDefense:1e3,experienceGainIncrease:4},3:{damageResistancePenetration:50,pvpDefense:1500,experienceGainIncrease:6},4:{damageResistancePenetration:80,pvpDefense:2500,experienceGainIncrease:10},5:{damageResistancePenetration:90,pvpDefense:2700,experienceGainIncrease:12},6:{damageResistancePenetration:130,pvpDefense:4e3,experienceGainIncrease:15}},활력:{2:{damageResistancePenetration:30,castingEnhancement:100,experienceGainIncrease:4},3:{damageResistancePenetration:50,castingEnhancement:150,experienceGainIncrease:6},4:{damageResistancePenetration:80,castingEnhancement:250,experienceGainIncrease:10},5:{damageResistancePenetration:90,castingEnhancement:270,experienceGainIncrease:12},6:{damageResistancePenetration:130,castingEnhancement:400,experienceGainIncrease:15}}},탑승:{결의:{2:{magicIncreasePercent:1,castingEnhancement:60,criticalPower:250},3:{magicIncreasePercent:1,castingEnhancement:90,criticalPower:500},4:{magicIncreasePercent:2,castingEnhancement:150,criticalPower:750},5:{magicIncreasePercent:2,castingEnhancement:170,criticalPower:850},6:{magicIncreasePercent:3,castingEnhancement:200,criticalPower:1200}},고요:{2:{healthIncreasePercent:1,criticalChance:200,destructionPowerIncrease:7e3},3:{healthIncreasePercent:1,criticalChance:400,destructionPowerIncrease:12e3},4:{healthIncreasePercent:2,criticalChance:600,destructionPowerIncrease:15e3},5:{healthIncreasePercent:2,criticalChance:700,destructionPowerIncrease:21e3},6:{healthIncreasePercent:3,criticalChance:1e3,destructionPowerIncrease:25e3}},의지:{2:{magicIncreasePercent:1,damageAbsorption:500,criticalDamageResistance:60},3:{magicIncreasePercent:1,damageAbsorption:700,criticalDamageResistance:90},4:{magicIncreasePercent:2,damageAbsorption:1200,criticalDamageResistance:150},5:{magicIncreasePercent:2,damageAbsorption:1300,criticalDamageResistance:170},6:{magicIncreasePercent:3,damageAbsorption:2e3,criticalDamageResistance:250}},침착:{2:{magicIncreasePercent:1,damageIncrease:5,magicRecoveryImprovement:3},3:{magicIncreasePercent:1,damageIncrease:7,magicRecoveryImprovement:4},4:{magicIncreasePercent:2,damageIncrease:12,magicRecoveryImprovement:7},5:{magicIncreasePercent:2,damageIncrease:14,magicRecoveryImprovement:8},6:{magicIncreasePercent:3,damageIncrease:20,magicRecoveryImprovement:12}},냉정:{2:{criticalPowerPercent:5,healthIncreasePercent:1,pvpDefense:600},3:{criticalPowerPercent:7,healthIncreasePercent:1,pvpDefense:900},4:{criticalPowerPercent:12,healthIncreasePercent:2,pvpDefense:1500},5:{criticalPowerPercent:14,healthIncreasePercent:2,pvpDefense:1700},6:{criticalPowerPercent:20,healthIncreasePercent:3,pvpDefense:2500}},활력:{2:{healthIncreasePercent:1,power:50,healthRecoveryImprovement:3},3:{healthIncreasePercent:1,power:70,healthRecoveryImprovement:4},4:{healthIncreasePercent:2,power:120,healthRecoveryImprovement:7},5:{healthIncreasePercent:2,power:140,healthRecoveryImprovement:8},6:{healthIncreasePercent:3,power:200,healthRecoveryImprovement:12}}},변신:{결의:{2:{damageResistancePenetration:30,damageAbsorption:700,movementSpeed:1},3:{damageResistancePenetration:50,damageAbsorption:1200,movementSpeed:1},4:{damageResistancePenetration:80,damageAbsorption:2e3,movementSpeed:3},5:{damageResistancePenetration:90,damageAbsorption:2200,movementSpeed:3},6:{damageResistancePenetration:130,damageAbsorption:3e3,movementSpeed:4}},고요:{2:{damageResistancePenetration:30,pvpDefense:1e3,movementSpeed:1},3:{damageResistancePenetration:50,pvpDefense:1500,movementSpeed:1},4:{damageResistancePenetration:80,pvpDefense:2500,movementSpeed:3},5:{damageResistancePenetration:90,pvpDefense:2700,movementSpeed:3},6:{damageResistancePenetration:130,pvpDefense:4e3,movementSpeed:4}},의지:{2:{damageResistance:50,criticalDamageResistance:120,movementSpeed:1},3:{damageResistance:80,criticalDamageResistance:200,movementSpeed:1},4:{damageResistance:130,criticalDamageResistance:300,movementSpeed:3},5:{damageResistance:150,criticalDamageResistance:370,movementSpeed:3},6:{damageResistance:200,criticalDamageResistance:450,movementSpeed:4}},침착:{2:{damageResistance:50,normalMonsterAdditionalDamage:120,movementSpeed:1},3:{damageResistance:80,normalMonsterAdditionalDamage:200,movementSpeed:1},4:{damageResistance:130,normalMonsterAdditionalDamage:300,movementSpeed:3},5:{damageResistance:150,normalMonsterAdditionalDamage:350,movementSpeed:3},6:{damageResistance:200,normalMonsterAdditionalDamage:450,movementSpeed:4}},냉정:{2:{damageResistancePenetration:30,castingEnhancement:100,movementSpeed:1},3:{damageResistancePenetration:50,castingEnhancement:150,movementSpeed:1},4:{damageResistancePenetration:80,castingEnhancement:250,movementSpeed:3},5:{damageResistancePenetration:90,castingEnhancement:270,movementSpeed:3},6:{damageResistancePenetration:130,castingEnhancement:400,movementSpeed:4}},활력:{2:{damageResistance:50,bossMonsterAdditionalDamage:120,movementSpeed:1},3:{damageResistance:80,bossMonsterAdditionalDamage:200,movementSpeed:1},4:{damageResistance:130,bossMonsterAdditionalDamage:300,movementSpeed:3},5:{damageResistance:150,bossMonsterAdditionalDamage:350,movementSpeed:3},6:{damageResistance:200,bossMonsterAdditionalDamage:450,movementSpeed:4}}}};function y(e,i){const t=i(e),r=["img-wrapper"];t.selected&&r.push("selected");const n=d("div",r,{"data-spirit-name":e.name}),a=d("div","img-box");if(n.appendChild(a),t.selected){const s=d("div","center-check-mark",{text:"✓"});a.appendChild(s)}t.registrationCompleted&&a.classList.add("registration-completed"),t.bondCompleted&&a.classList.add("bond-completed");const c=d("img","",{src:`${e.image}`,alt:e.name,loading:"lazy"});if(c.addEventListener("error",function(){if(c.src.endsWith(".webp")){const s=e.image.replace(/\.webp$/i,".jpg");c.src=s}},{once:!0}),a.appendChild(c),t.level25BindAvailable){const s=d("div","level25-indicator");a.appendChild(s)}const l=d("small","img-name",{text:e.name});return n.appendChild(l),n}function w(e,i,t){const r=d("div","image-container-grid");return e.forEach(n=>{const a=y(n,t);a.addEventListener("click",()=>i(n)),r.appendChild(a)}),r}function A(e,i,t){const r=d("div","image-container-grouped"),n=e.reduce((s,o)=>((s[o.influence||"기타"]=s[o.influence||"기타"]||[]).push(o),s),{}),a=(s,o)=>{const p=d("div","influence-group"),v=d("div","header-wrapper"),m=d("h3","influence-header",{text:`${s} (${o.length})`});v.appendChild(m),p.appendChild(v);const u=d("div","influence-items");return o.forEach(g=>{const h=y(g,t);h.addEventListener("click",()=>i(g)),u.appendChild(h)}),p.appendChild(u),p},c=new Set;C.forEach(s=>{const o=d("div","influence-row");let p=!1;s.forEach(v=>{n[v]&&(o.appendChild(a(v,n[v])),c.add(v),p=!0)}),p&&r.appendChild(o)});const l=Object.keys(n).filter(s=>!c.has(s)).sort();if(l.length>0){const s=d("div","influence-row");l.forEach(o=>s.appendChild(a(o,n[o]))),r.appendChild(s)}return r}function X({container:e,spirits:i,onSpiritClick:t,getSpiritState:r,groupByInfluence:n}){if(e.innerHTML="",i.length===0){e.innerHTML='<p class="empty-state-message">조건에 맞는 환수가 없습니다.</p>';return}let a;n?a=A(i,t,r):a=w(i,t,r),e.appendChild(a)}function Y(e,i,t){const r=d("div","stat-filter-container"),n=d("select","stat-filter",{id:"statFilter"});n.appendChild(d("option","",{value:"",text:"능력치 필터"}));const a=d("button","clear-filter-btn",{text:"초기화"});a.style.display="none",M(n,i);const c=function(){const o=this.value;a.style.display=o?"block":"none",t(o)},l=()=>{n.value="",a.style.display="none",t("")};return n.addEventListener("change",c),a.addEventListener("click",l),r.append(n,a),e.appendChild(r),{statFilter:n,clearBtn:a,cleanup:()=>{n.removeEventListener("change",c),a.removeEventListener("click",l),r.remove()}}}function M(e,i){const t=new Set;i.forEach(r=>r.stats.forEach(n=>{n.bindStat&&Object.keys(n.bindStat).forEach(a=>t.add(a)),n.registrationStat&&Object.keys(n.registrationStat).forEach(a=>t.add(a))})),[...t].sort().forEach(r=>e.appendChild(d("option","",{value:r,text:x[r]||r})))}let f=null;function I(e){return e.replace(/\d+$/,"")}function Q(e,i,t,r,n){R();const a=d("div","modal-overlay",{id:"modernChakResultsModal"}),c=d("div","modal-content");if(a.appendChild(c),document.body.appendChild(a),!document.querySelector('link[href*="chakra-results-modern.css"]')){const g=document.createElement("link");g.rel="stylesheet",g.href="public/assets/css/chakra-results-modern.css",document.head.appendChild(g)}const l=d("button","modal-close",{text:"✕"});l.addEventListener("click",R),c.appendChild(l);const s=d("div","kakao-ad-modal-container desktop-modal-ad");s.innerHTML=`
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-aOM3JPGvOLhHlyoS"
          data-ad-width="728"
          data-ad-height="90"></ins>
  `,c.appendChild(s);const o=d("div","kakao-ad-modal-container mobile-modal-ad");o.innerHTML=`
      <ins class="kakao_ad_area"
          data-ad-unit="DAN-epbkjAaeHSxv0MYl"
          data-ad-width="320"
          data-ad-height="50"></ins>
  `,c.appendChild(o);const p=d("div","modal-header"),v=d("h3","",{text:t});p.appendChild(v),c.appendChild(p);const m=d("div","modern-chakra-container");c.appendChild(m),G(e,i,m,r,n),a.style.display="flex",document.body.style.overflow="hidden";const u=g=>{g.key==="Escape"&&R()};document.addEventListener("keydown",u),a._escListener=u,f=a,a.addEventListener("click",g=>{g.target===a&&R()}),setTimeout(()=>{try{const g=s.querySelector(".kakao_ad_area"),h=o.querySelector(".kakao_ad_area");window.adfit&&(g&&window.adfit.render(g),h&&window.adfit.render(h))}catch{}},100)}function G(e,i,t,r,n){const a=F(e,r);if(Object.keys(a).length===0){t.innerHTML=`
      <div class="chakra-empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">검색 결과가 없습니다</div>
        <div class="empty-state-description">선택된 능력치를 찾을 수 없습니다.<br>다른 능력치를 선택해보세요.</div>
      </div>
    `;return}const c=d("div","chakra-results-tabs"),l=d("div","chakra-results-content"),s=L(i);t.appendChild(s),t.appendChild(c),t.appendChild(l),Object.entries(a).forEach(([o,p],v)=>{const m=d("div","chakra-tab",{"data-stat":o,text:o}),u=d("span","chakra-tab-badge",{text:`${p.length}곳`});m.appendChild(u);const g=d("div","chakra-tab-panel",{"data-stat":o});v===0&&(m.classList.add("active"),g.classList.add("active")),$(g,p,i,n),c.appendChild(m),l.appendChild(g),m.addEventListener("click",()=>{c.querySelectorAll(".chakra-tab").forEach(h=>h.classList.remove("active")),l.querySelectorAll(".chakra-tab-panel").forEach(h=>h.classList.remove("active")),m.classList.add("active"),g.classList.add("active")})}),D(t)}function L(e,i,t){const r=j(e),n=d("div","quick-stats-summary"),a=d("div","summary-title");a.innerHTML=`
    <span class="summary-icon">📊</span>
    현재 적용된 능력치 요약
  `;const c=d("div","stats-summary-grid");return Object.keys(r).length===0?c.innerHTML='<div style="grid-column: 1/-1; text-align: center; color: #64748b;">적용된 능력치가 없습니다</div>':Object.entries(r).sort((l,s)=>s[1]-l[1]).forEach(([l,s])=>{const o=d("div","summary-stat-item");o.innerHTML=`
          <span class="summary-stat-name">${l}</span>
          <span class="summary-stat-value">+${s}</span>
        `,c.appendChild(o)}),n.appendChild(a),n.appendChild(c),n}function $(e,i,t,r){const n=i.reduce((c,l)=>{const s=l.part.split("_")[0];return(c[s]=c[s]||[]).push(l),c},{}),a=d("div","equipment-parts-grid");Object.entries(n).forEach(([c,l])=>{const s=d("div","equipment-part-card"),o=T(l,t);o.fullyUpgraded>0?s.classList.add("fully-upgraded"):o.partiallyUpgraded>0&&s.classList.add("has-upgrades");const p=d("div","equipment-card-header");p.innerHTML=`
      <div class="equipment-part-name">
        ${_(c)}
      </div>
      <div class="equipment-progress-info">
        <div class="progress-percentage">${o.progressPercentage}%</div>
        <div>${o.upgradedCount}/${l.length} 강화</div>
      </div>
    `;const v=d("div","upgrade-levels-container");l.sort((m,u)=>{const g=parseInt(m.level.replace(/\D/g,""),10),h=parseInt(u.level.replace(/\D/g,""),10);return g-h}).forEach(m=>{const u=`${m.statName}_${m.part}_${m.level}_${m.index}`,g=t[u]||{isUnlocked:!1,level:0},h=d("div","upgrade-level-row");let P="level-unused",b="미강화";g.isUnlocked&&(g.level===3?(P="level-complete",b="완료"):(P="level-partial",b=`${g.level}/3`)),h.innerHTML=`
          <div class="level-indicator ${P}">
            ${m.level}
          </div>
          <div class="level-details">
            <div class="level-stat-info">
              <div class="level-stat-name">${I(m.statName)}</div>
              <div class="level-stat-value">+${m.maxValue}</div>
            </div>
            <div class="level-status-badge status-${P.replace("level-","")}">
              ${b}
            </div>
          </div>
        `,h.addEventListener("click",()=>{r(m.part,m.level),h.style.background="#dbeafe",setTimeout(()=>{h.style.background=""},300)}),v.appendChild(h)}),s.appendChild(p),s.appendChild(v),a.appendChild(s)}),e.appendChild(a)}function T(e,i){let t=0,r=0,n=0;e.forEach(c=>{const l=`${c.statName}_${c.part}_${c.level}_${c.index}`,s=i[l]||{isUnlocked:!1,level:0};s.isUnlocked&&(t++,s.level===3?r++:n++)});const a=Math.round(t/e.length*100);return{upgradedCount:t,fullyUpgraded:r,partiallyUpgraded:n,progressPercentage:a,totalCount:e.length}}function _(e){return{목걸이:"목걸이",반지:"반지",팔찌:"팔찌",벨트:"벨트",신발:"신발",장갑:"장갑"}[e]||e}function j(e,i){const t={};return Object.entries(e).forEach(([r,n])=>{if(!n.isUnlocked||n.level===0)return;const a=r.split("_");if(a.length<4)return;const c=a[0],l=I(c),s=10,o=n.level/3,p=Math.round(s*o);t[l]=(t[l]||0)+p}),t}function F(e,i){const t={};e.constants.parts.forEach(n=>{const a=n.split("_")[0];e.constants.levels.forEach(c=>{const l=`lv${c.replace("+","")}`,s=e.equipment[a]?.[l]||{};let o=0;Object.entries(s).forEach(([p,v])=>{const m=I(p);i.includes(m)&&(t[m]||(t[m]=[]),t[m].push({part:n,level:c,statName:p,maxValue:v,index:o,cardId:`${p}_${n}_${c}_${o}`})),o++})})});const r={};return Object.keys(t).sort().forEach(n=>{r[n]=t[n].sort((a,c)=>{const l=a.part.split("_")[0],s=c.part.split("_")[0];if(l!==s)return l.localeCompare(s);const o=parseInt(a.level.replace(/\D/g,""),10),p=parseInt(c.level.replace(/\D/g,""),10);return o-p})}),r}function R(){f&&(document.removeEventListener("keydown",f._escListener),f.remove(),f=null),document.body.style.overflow="auto"}export{z as E,K as F,J as G,W as P,x as S,U as a,Y as b,d as c,H as d,N as e,B as f,q as g,Q as h,V as i,X as r,S as s};
