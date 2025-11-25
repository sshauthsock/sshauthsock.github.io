import{c as g}from"./components-C2RsvHY9.js";import{L as d}from"./utils-x5ORUUhl.js";import{f as L}from"./main-Bgn-9pGL.js";const e={currentCategory:"수호",currentProfileId:null,bondSpirits:{수호:[],탑승:[],변신:[]},activeSpirits:{수호:null,탑승:null,변신:null},userStats:{},baselineStats:{},baselineKeyStats:{tachaeTotal:0,statusEffectResistance:0,statusEffectAccuracy:0},expTable:null,lastSoulExpCalculation:null,lastSoulExpHash:null,bondCalculationCache:new Map,lastTotalStatsCalculation:null,lastTotalStatsHash:null,savedSoulExp:0,recentlyEditedStats:new Set,isSavingBaseline:!1,isInitialLoad:!0,isUpdatingTotalStats:!1,baselineStatsHash:null,engravingData:{수호:{},탑승:{},변신:{}},imageLoadErrors:new Set,imageLoadErrorShown:!1,imageObserver:null},y={},b=[{key:"damageResistancePenetration",name:"피해저항관통"},{key:"damageResistance",name:"피해저항"},{key:"pvpDamagePercent",name:"대인피해%"},{key:"pvpDefensePercent",name:"대인방어%"},{key:"pvpDamage",name:"대인피해"},{key:"pvpDefense",name:"대인방어"},{key:"statusEffectAccuracy",name:"상태이상적중"},{key:"statusEffectResistance",name:"상태이상저항"},{key:"normalMonsterPenetration",name:"일반몬스터 관통"},{key:"normalMonsterAdditionalDamage",name:"일반몬스터 추가피해"},{key:"bossMonsterPenetration",name:"보스몬스터 관통"},{key:"bossMonsterAdditionalDamage",name:"보스몬스터 추가피해"},{key:"criticalPowerPercent",name:"치명위력%"},{key:"criticalChance",name:"치명확률%"},{key:"power",name:"위력"},{key:"movementSpeed",name:"이동속도"},{key:"damageAbsorption",name:"피해흡수"},{key:"criticalResistance",name:"치명저항"},{key:"criticalDamageResistance",name:"치명피해저항"},{key:"experienceGainIncrease",name:"경험치 획득증가"},{key:"normalMonsterResistance",name:"일반몬스터 저항"},{key:"bossMonsterResistance",name:"보스몬스터 저항"}],$=[{key:"healthIncrease",name:"체력증가"},{key:"magicIncrease",name:"마력증가"},{key:"criticalChance",name:"치명확률"},{key:"criticalResistance",name:"치명저항"},{key:"healthPotionEnhancement",name:"체력시약향상"},{key:"magicPotionEnhancement",name:"마력시약향상"},{key:"pvpDefense",name:"대인방어"},{key:"damageAbsorption",name:"피해흡수"},{key:"power",name:"위력"},{key:"criticalDamageResistance",name:"치명피해저항"},{key:"castingEnhancement",name:"시전향상"},{key:"bossMonsterAdditionalDamage",name:"보스몬스터 추가피해"},{key:"normalMonsterAdditionalDamage",name:"일반몬스터 추가피해"},{key:"damageResistancePenetration",name:"피해저항관통"},{key:"statusEffectResistance",name:"상태이상저항"},{key:"statusEffectAccuracy",name:"상태이상적중"}],K=b.slice(0,8),q=b.slice(8,16),G=b.slice(16),U={피해저항관통:"피저관",피해저항:"피저","대인피해%":"대피%","대인방어%":"대방%",대인피해:"대피",대인방어:"대방",상태이상적중:"상이적",상태이상저항:"상이저","일반몬스터 관통":"일몬관","일반몬스터 추가피해":"일몬추","보스몬스터 관통":"보몬관","보스몬스터 추가피해":"보몬추","치명위력%":"치위%","치명확률%":"치확%",위력:"위력",이동속도:"이속",피해흡수:"피흡",치명저항:"치저",치명피해저항:"치피저","경험치 획득증가":"경획","일반몬스터 저항":"일몬저","보스몬스터 저항":"보몬저"},j={damageResistance:"stat-damage-resistance",damageResistancePenetration:"stat-damage-resistance-penetration",pvpDefensePercent:"stat-pvp-defense-percent",pvpDamagePercent:"stat-pvp-damage-percent"},X={pvpDamage:"stat-pvp-damage",pvpDefense:"stat-pvp-defense",statusEffectAccuracy:"stat-status-effect-accuracy",statusEffectResistance:"stat-status-effect-resistance",damageAbsorption:"stat-damage-absorption"};function z(){return window.innerWidth<=768}function F(){if(e.imageLoadErrorShown)return;e.imageLoadErrorShown=!0;const t=g("div");if(t.style.cssText=`
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #ff6b35;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-size: 14px;
    font-weight: 600;
    max-width: 90%;
    text-align: center;
    animation: slideDown 0.3s ease-out;
  `,t.textContent="일부 이미지가 로드되지 않았습니다. Ctrl+Shift+R을 눌러 새로고침해주세요.",!document.getElementById("image-error-animation-style")){const a=g("style");a.id="image-error-animation-style",a.textContent=`
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    `,document.head.appendChild(a)}document.body.appendChild(t),setTimeout(()=>{t.parentNode&&(t.style.animation="slideDown 0.3s ease-out reverse",setTimeout(()=>{t.parentNode&&t.remove()},300))},5e3),t.addEventListener("click",()=>{t.parentNode&&(t.style.animation="slideDown 0.3s ease-out reverse",setTimeout(()=>{t.parentNode&&t.remove()},300))})}function Y(){return`
    <div class="my-info-container">
    <div class="my-info-top-section">
      <!-- 왼쪽: 환수 섹션 (50%) -->
      <div class="my-info-spirit-section-wrapper">
        <!-- 왼쪽: 수호/탑승/변신 카드 (40%) -->
        <div class="my-info-left-panel">
          <!-- 수호 카드 -->
          <div class="my-info-category-card" data-category="수호">
            <h2 class="my-info-category-title">수호</h2>
            <div class="my-info-bond-slots" id="bondSlots수호"></div>
          </div>

          <!-- 탑승 카드 -->
          <div class="my-info-category-card" data-category="탑승">
            <h2 class="my-info-category-title">탑승</h2>
            <div class="my-info-bond-slots" id="bondSlots탑승"></div>
          </div>

          <!-- 변신 카드 -->
          <div class="my-info-category-card" data-category="변신">
            <h2 class="my-info-category-title">변신</h2>
            <div class="my-info-bond-slots" id="bondSlots변신"></div>
          </div>
        </div>

        <!-- 오른쪽: 전체 환수 선택 그리드 (60%) -->
        <div class="my-info-right-panel">
          <div class="my-info-spirit-section">
            <div class="my-info-spirit-tabs">
              <button class="my-info-spirit-tab active" data-category="수호">수호</button>
              <button class="my-info-spirit-tab" data-category="탑승">탑승</button>
              <button class="my-info-spirit-tab" data-category="변신">변신</button>
            </div>
            <div id="myInfoSpiritGrid"></div>
          </div>
        </div>
      </div>

      <!-- 오른쪽: 기본 스탯 섹션 (50%) -->
      <div class="my-info-stats-section-wrapper">
        <div class="my-info-stats-section">
          <!-- 프로파일 선택 섹션 (통합) -->
          <div class="my-info-profile-section" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: var(--space-xs); flex: 1;">
              <label class="my-info-profile-label">설정:</label>
              <select class="my-info-profile-select" id="profileSelect">
                <option value="">설정 없음</option>
              </select>
              <div class="my-info-profile-actions">
                <button class="my-info-profile-btn primary" id="createProfileBtn" title="새 프로파일">+</button>
                <button class="my-info-profile-btn" id="editProfileBtn" disabled title="이름 수정">✏️</button>
                <button class="my-info-profile-btn danger" id="deleteProfileBtn" disabled>삭제</button>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button id="saveBaselineBtn" class="my-info-save-btn">
                <span>저장</span>
              </button>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-sm); margin-top: var(--space-xs); position: relative;">
            <h2 class="my-info-section-title" style="margin: 0; flex: 0 0 auto;">나의 스탯</h2>
            <!-- 환산타채 합 -->
            <div class="my-info-key-stat-item" style="max-width: 300px; min-width: 250px; margin: 0; flex: 0 0 auto; left: 50%; transform: translateX(-50%);">
              <div class="my-info-key-stat-label">환산타채 합</div>
              <div class="my-info-key-stat-value-wrapper">
                <div class="my-info-key-stat-value" id="keyStatTachae">-</div>
                <div class="my-info-key-stat-change" id="keyStatTachaeChange">-</div>
              </div>
            </div>
          </div>
          <div class="my-info-stats-list">
            <!-- 1컬럼 -->
            <div class="my-info-stats-column" id="statsColumn1"></div>
            <!-- 2컬럼 -->
            <div class="my-info-stats-column" id="statsColumn2"></div>
            <!-- 3컬럼 -->
            <div class="my-info-stats-column" id="statsColumn3"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 영역 -->
    <div class="my-info-bottom-section">
      <!-- 왼쪽: 환수 혼 경험치 -->
      <div class="my-info-bottom-left">
        <div class="my-info-stats-section">
          <h2 class="my-info-section-title">환수 초기화 시 환수 혼 경험치</h2>
          <div id="soulExpInfo"></div>
        </div>
      </div>

      <!-- 오른쪽: 각인 등록효과, 각인 장착효과 -->
      <div class="my-info-bottom-right">
        <div class="my-info-key-stats-section">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <h2 class="my-info-section-title">각인 효과</h2>
            <div class="my-info-engraving-notice" style="font-size: 9px; color: var(--text-secondary); padding: 0 2px;">
              ⚠️ 각인 정보는 레벨에 따른 스탯 자동으로 계산 안됩니다. 직접 입력해야합니다.
            </div>
          </div>
          <div class="my-info-key-stats-grid" id="keyStatsGrid">
            <div class="my-info-key-stat-item">
              <div class="my-info-key-stat-label">각인 등록효과</div>
              <div class="my-info-key-stat-registration-list" id="keyStatRegistrationList"></div>
            </div>
            <div class="my-info-key-stat-item">
              <div class="my-info-key-stat-label">각인 장착효과</div>
              <div class="my-info-key-stat-bind-list" id="keyStatBindList"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  `}function S(){const t=localStorage.getItem("myInfo_profiles");if(t)try{return JSON.parse(t)}catch(a){return d.error("Error loading profiles:",a),[]}return[]}function h(t){localStorage.setItem("myInfo_profiles",JSON.stringify(t))}function k(){return localStorage.getItem("myInfo_currentProfileId")||null}function x(t){t?localStorage.setItem("myInfo_currentProfileId",t):localStorage.removeItem("myInfo_currentProfileId"),e.currentProfileId=t}function N(t){const a=S(),i={id:`profile_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,name:t||`프로파일 ${a.length+1}`,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};return a.push(i),h(a),i}function T(t,a){const s=S(),i=s.find(n=>n.id===t);return i?(Object.assign(i,a),i.updatedAt=new Date().toISOString(),h(s),i):null}function V(t,a={}){const i=S().filter(n=>n.id!==t);h(i),localStorage.removeItem(`myInfo_profile_${t}`),e.currentProfileId===t&&(i.length>0?(x(i[0].id),_(i[0].id,a)):(x(null),e.userStats={},e.bondSpirits={수호:[],탑승:[],변신:[]},e.activeSpirits={수호:null,탑승:null,변신:null},e.baselineStats={},e.baselineKeyStats={tachaeTotal:0,statusEffectResistance:0,statusEffectAccuracy:0},e.savedSoulExp=0,e.engravingData={수호:{},탑승:{},변신:{}},e.baselineStatsHash=null))}function P(t){const a={userStats:e.userStats,bondSpirits:e.bondSpirits,activeSpirits:e.activeSpirits,baselineStats:e.baselineStats,baselineKeyStats:e.baselineKeyStats,savedSoulExp:e.savedSoulExp,engravingData:e.engravingData,baselineStatsHash:e.baselineStatsHash};localStorage.setItem(`myInfo_profile_${t}`,JSON.stringify(a)),T(t,{updatedAt:new Date().toISOString()})}function _(t,a={}){const s=localStorage.getItem(`myInfo_profile_${t}`);if(s)try{const i=JSON.parse(s);if(e.userStats=i.userStats||{},e.bondSpirits=i.bondSpirits||{수호:[],탑승:[],변신:[]},e.activeSpirits=i.activeSpirits||{수호:null,탑승:null,변신:null},e.baselineStats=i.baselineStats||{},e.baselineKeyStats=i.baselineKeyStats||{tachaeTotal:0,statusEffectResistance:0,statusEffectAccuracy:0},e.savedSoulExp=i.savedSoulExp||0,e.engravingData=i.engravingData||{수호:{},탑승:{},변신:{}},e.baselineStatsHash=i.baselineStatsHash||null,e.lastTotalStatsHash=null,e.lastTotalStatsCalculation=null,e.lastSoulExpHash=null,e.lastSoulExpCalculation=null,e.isInitialLoad=!0,a.renderBondSlots&&(a.renderBondSlots("수호"),a.renderBondSlots("탑승"),a.renderBondSlots("변신")),a.renderActiveSpiritSelect&&(a.renderActiveSpiritSelect("수호"),a.renderActiveSpiritSelect("탑승"),a.renderActiveSpiritSelect("변신")),a.renderStats&&a.renderStats(),a.updateTotalStats){const n=a.updateTotalStats();n&&typeof n.then=="function"?n.then(()=>{e.isInitialLoad=!1}).catch(()=>{e.isInitialLoad=!1}):e.isInitialLoad=!1}else e.isInitialLoad=!1;a.updateSoulExp&&a.updateSoulExp()}catch(i){d.error("Error loading profile data:",i)}}function I(){const t=y.profileSelect;if(!t)return;const a=S(),s=e.currentProfileId;t.innerHTML='<option value="">프로파일 없음</option>',a.forEach(n=>{const l=g("option");l.value=n.id,l.textContent=n.name,n.id===s&&(l.selected=!0),t.appendChild(l)});const i=s!==null;y.editProfileBtn&&(y.editProfileBtn.disabled=!i),y.deleteProfileBtn&&(y.deleteProfileBtn.disabled=!i)}function W(t,a=null,s={}){const i=g("div","my-info-profile-modal"),n=a?S().find(r=>r.id===a):null;i.innerHTML=`
    <div class="my-info-profile-modal-content">
      <div class="my-info-profile-modal-header">
        <div class="my-info-profile-modal-title">
          ${t==="create"?"새 프로파일 생성":t==="edit"?"프로파일 이름 수정":""}
        </div>
        <button class="my-info-profile-modal-close">×</button>
      </div>
      <div class="my-info-profile-form-group">
        <label class="my-info-profile-form-label">프로파일 이름</label>
        <input type="text" class="my-info-profile-form-input" id="profileNameInput" 
               value="${n?n.name:""}" 
               placeholder="프로파일 이름을 입력하세요" maxlength="50">
      </div>
      <div class="my-info-profile-modal-actions">
        <button class="my-info-profile-btn" id="profileModalCancelBtn">취소</button>
        <button class="my-info-profile-btn primary" id="profileModalSaveBtn">
          ${t==="create"?"생성":"저장"}
        </button>
      </div>
    </div>
  `,document.body.appendChild(i);const l=()=>i.remove();i.querySelector(".my-info-profile-modal-close").addEventListener("click",l),i.querySelector("#profileModalCancelBtn").addEventListener("click",l),i.addEventListener("click",r=>{r.target===i&&l()}),i.querySelector("#profileModalSaveBtn").addEventListener("click",()=>{const m=i.querySelector("#profileNameInput").value.trim();if(!m){alert("프로파일 이름을 입력해주세요.");return}if(t==="create"){const u=N(m),o=JSON.parse(JSON.stringify(e.bondSpirits)),c=JSON.parse(JSON.stringify(e.activeSpirits)),f=JSON.parse(JSON.stringify(e.engravingData));e.userStats={},e.baselineStats={},e.baselineKeyStats={tachaeTotal:0,statusEffectResistance:0,statusEffectAccuracy:0},e.savedSoulExp=0,e.baselineStatsHash=null,e.bondSpirits=o,e.activeSpirits=c,e.engravingData=f,e.lastTotalStatsHash=null,e.lastTotalStatsCalculation=null,e.lastSoulExpHash=null,e.lastSoulExpCalculation=null,e.isInitialLoad=!0,x(u.id),P(u.id),I(),s.renderBondSlots&&(s.renderBondSlots("수호"),s.renderBondSlots("탑승"),s.renderBondSlots("변신")),s.renderActiveSpiritSelect&&(s.renderActiveSpiritSelect("수호"),s.renderActiveSpiritSelect("탑승"),s.renderActiveSpiritSelect("변신")),s.renderStats&&s.renderStats(),s.updateTotalStats&&s.updateTotalStats(),s.updateSoulExp&&s.updateSoulExp(),alert("프로파일이 생성되었습니다. 나의 스탯을 새로 입력해주세요.")}else t==="edit"&&a&&(T(a,{name:m}),I(),alert("프로파일 이름이 수정되었습니다."));l()}),i.querySelector("#profileNameInput").addEventListener("keydown",r=>{r.key==="Enter"&&i.querySelector("#profileModalSaveBtn").click()}),setTimeout(()=>{i.querySelector("#profileNameInput").focus(),i.querySelector("#profileNameInput").select()},100)}function Q(){if(e.currentProfileId)return;const t=localStorage.getItem("myInfo_userStats");if(t)try{e.userStats=JSON.parse(t)}catch(a){d.error("Error loading user stats:",a),e.userStats={}}}function Z(){e.currentProfileId||localStorage.setItem("myInfo_userStats",JSON.stringify(e.userStats))}function ee(t={}){const a=k();if(e.currentProfileId=a,a)_(a,t);else{const s=localStorage.getItem("myInfo_bondSpirits");if(s)try{e.bondSpirits=JSON.parse(s)}catch(o){d.error("Error loading bond spirits:",o)}const i=localStorage.getItem("myInfo_activeSpirits");if(i)try{e.activeSpirits=JSON.parse(i)}catch(o){d.error("Error loading active spirits:",o)}const n=localStorage.getItem("myInfo_baselineStats");if(n)try{e.baselineStats=JSON.parse(n)}catch(o){d.error("Error loading baseline stats:",o)}const l=localStorage.getItem("myInfo_savedSoulExp");if(l)try{e.savedSoulExp=parseInt(l,10)||0}catch(o){d.error("Error loading saved soul exp:",o)}const r=localStorage.getItem("myInfo_engravingData");if(r)try{e.engravingData=JSON.parse(r)}catch(o){d.error("Error loading engraving data:",o),e.engravingData={수호:{},탑승:{},변신:{}}}const m=localStorage.getItem("myInfo_baselineKeyStats");if(m)try{e.baselineKeyStats=JSON.parse(m)}catch(o){d.error("Error loading baseline key stats:",o)}const u=localStorage.getItem("myInfo_baselineStatsHash");u&&(e.baselineStatsHash=u)}}function te(){e.currentProfileId?P(e.currentProfileId):(localStorage.setItem("myInfo_bondSpirits",JSON.stringify(e.bondSpirits)),localStorage.setItem("myInfo_activeSpirits",JSON.stringify(e.activeSpirits)),localStorage.setItem("myInfo_baselineStats",JSON.stringify(e.baselineStats)),localStorage.setItem("myInfo_baselineKeyStats",JSON.stringify(e.baselineKeyStats)),localStorage.setItem("myInfo_savedSoulExp",e.savedSoulExp.toString()),localStorage.setItem("myInfo_engravingData",JSON.stringify(e.engravingData)),e.baselineStatsHash&&localStorage.setItem("myInfo_baselineStatsHash",e.baselineStatsHash))}async function w(){if(e.expTable)return e.expTable;try{return e.expTable=await L(),e.expTable}catch(t){return d.error("Error fetching exp table:",t),null}}function M(t,a,s,i){if(!t||!t[a])return 0;const n=t[a];let l=0;if(i>s&&i<n.length)for(let r=s+1;r<=i;r++)l+=n[r]||0;return l}function O(){return["수호","탑승","변신"].map(s=>(e.bondSpirits[s]||[]).map(n=>`${n.name}:${n.level||25}`).join(",")).join("|")}async function ae(t){const a=y.soulExpInfo;if(!a)return;const s=O();if(e.lastSoulExpHash===s&&e.lastSoulExpCalculation){a.innerHTML=e.lastSoulExpCalculation;return}a.innerHTML="<p class='text-center text-sm text-light'>계산 중...</p>";try{const i=await w();if(!i){a.innerHTML="<p class='text-center text-sm text-light'>경험치 테이블을 불러올 수 없습니다.</p>";return}let n=0;const l={},r=["수호","탑승","변신"];for(const c of r){const f=e.bondSpirits[c]||[];let p=0;for(const v of f){if(!v.level||v.level===0)continue;const E=t(c).find(C=>C.name===v.name);if(!E)continue;const D=E.grade==="불멸"?"immortal":"legend",A=M(i,D,0,v.level);p+=A}l[c]=p,n+=p}if(n===0){const c="<p class='text-center text-sm text-light'>초기화할 환수가 없습니다.</p>";a.innerHTML=c,e.lastSoulExpCalculation=c,e.lastSoulExpHash=s;return}const u=Math.ceil(n/1e3);let o='<div class="my-info-soul-exp-grid">';if(r.forEach(c=>{const f=l[c]||0;o+=`
        <div class="my-info-soul-exp-category-item">
          <div class="my-info-soul-exp-category-label">${c}</div>
          <div class="my-info-soul-exp-category-value">${f.toLocaleString()} exp</div>
        </div>
      `}),o+=`
      <div class="my-info-soul-exp-total-item">
        <div class="my-info-soul-exp-total-label">총합</div>
        <div class="my-info-soul-exp-total-value">${n.toLocaleString()} exp</div>
      </div>
    `,e.savedSoulExp>0){const c=n-e.savedSoulExp;let f="",p="";c>0?(f=`+${c.toLocaleString()} exp (부족)`,p="#e74c3c"):c<0?(f=`${c.toLocaleString()} exp (여유)`,p="#4CAF50"):(f="0 exp (동일)",p="var(--text-secondary)"),o+=`
        <div class="my-info-soul-exp-baseline-item">
          <div class="my-info-soul-exp-baseline-label">기준 대비</div>
          <div class="my-info-soul-exp-baseline-value" style="color: ${p};">
            ${f}
          </div>
          <div class="my-info-soul-exp-baseline-text">
            기준: ${e.savedSoulExp.toLocaleString()} exp
          </div>
        </div>
      `}else o+=`
        <div class="my-info-soul-exp-baseline-item" style="opacity: 0.5;">
          <div class="my-info-soul-exp-baseline-label">기준 대비</div>
          <div class="my-info-soul-exp-baseline-value">-</div>
        </div>
      `;o+=`
      <div class="my-info-soul-exp-need-item">
        <div class="my-info-soul-exp-need-label">필요경험치</div>
        <div class="my-info-soul-exp-need-value">
          <img src="assets/img/high-soul.jpg" alt="최상급 환수혼" loading="lazy">
          <span>약 <strong>${u.toLocaleString()}</strong>개</span>
        </div>
      </div>
    `,o+="</div>",a.innerHTML=o,e.lastSoulExpCalculation=o,e.lastSoulExpHash=s}catch(i){d.error("Error updating soul exp:",i),a.innerHTML="<p class='text-center text-sm text-light'>계산 중 오류가 발생했습니다.</p>"}}export{K as C,$ as E,U as M,b as S,W as a,Z as b,M as c,V as d,y as e,te as f,S as g,F as h,z as i,q as j,G as k,_ as l,j as m,X as n,Y as o,e as p,Q as q,I as r,x as s,ee as t,ae as u,w as v};
