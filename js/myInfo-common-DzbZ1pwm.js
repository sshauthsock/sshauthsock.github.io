import{c as b}from"./components-KK9vAy1z.js";import{L as f}from"./utils-C4S-LQYV.js";import{f as k}from"./main-DS_ca-kn.js";const e={currentCategory:"수호",currentProfileId:null,bondSpirits:{수호:[],탑승:[],변신:[]},activeSpirits:{수호:null,탑승:null,변신:null},userStats:{},baselineStats:{},baselineKeyStats:{tachaeTotal:0,statusEffectResistance:0,statusEffectAccuracy:0},expTable:null,lastSoulExpCalculation:null,lastSoulExpHash:null,bondCalculationCache:new Map,lastTotalStatsCalculation:null,lastTotalStatsHash:null,savedSoulExp:0,baselineSoulExpHash:null,recentlyEditedStats:new Set,isSavingBaseline:!1,isInitialLoad:!0,isUpdatingTotalStats:!1,baselineStatsHash:null,removedSpiritLevels:{},engravingData:{수호:{},탑승:{},변신:{}},imageLoadErrors:new Set,imageLoadErrorShown:!1,imageObserver:null},y={},E=[{key:"damageResistancePenetration",name:"피해저항관통"},{key:"damageResistance",name:"피해저항"},{key:"pvpDamagePercent",name:"대인피해%"},{key:"pvpDefensePercent",name:"대인방어%"},{key:"pvpDamage",name:"대인피해"},{key:"pvpDefense",name:"대인방어"},{key:"statusEffectAccuracy",name:"상태이상적중"},{key:"statusEffectResistance",name:"상태이상저항"},{key:"normalMonsterPenetration",name:"일반몬스터 관통"},{key:"normalMonsterAdditionalDamage",name:"일반몬스터 추가피해"},{key:"bossMonsterPenetration",name:"보스몬스터 관통"},{key:"bossMonsterAdditionalDamage",name:"보스몬스터 추가피해"},{key:"criticalPowerPercent",name:"치명위력%"},{key:"criticalChance",name:"치명확률%"},{key:"power",name:"위력"},{key:"movementSpeed",name:"이동속도"},{key:"damageAbsorption",name:"피해흡수"},{key:"criticalResistance",name:"치명저항"},{key:"criticalDamageResistance",name:"치명피해저항"},{key:"experienceGainIncrease",name:"경험치 획득증가"},{key:"normalMonsterResistance",name:"일반몬스터 저항"},{key:"bossMonsterResistance",name:"보스몬스터 저항"}],q=[{key:"healthIncrease",name:"체력증가"},{key:"magicIncrease",name:"마력증가"},{key:"criticalChance",name:"치명확률"},{key:"criticalResistance",name:"치명저항"},{key:"healthPotionEnhancement",name:"체력시약향상"},{key:"magicPotionEnhancement",name:"마력시약향상"},{key:"pvpDefense",name:"대인방어"},{key:"damageAbsorption",name:"피해흡수"},{key:"power",name:"위력"},{key:"criticalDamageResistance",name:"치명피해저항"},{key:"castingEnhancement",name:"시전향상"},{key:"bossMonsterAdditionalDamage",name:"보스몬스터 추가피해"},{key:"normalMonsterAdditionalDamage",name:"일반몬스터 추가피해"},{key:"damageResistancePenetration",name:"피해저항관통"},{key:"statusEffectResistance",name:"상태이상저항"},{key:"statusEffectAccuracy",name:"상태이상적중"}],G=E.slice(0,8),U=E.slice(8,16),j=E.slice(16),X={피해저항관통:"피저관",피해저항:"피저","대인피해%":"대피%","대인방어%":"대방%",대인피해:"대피",대인방어:"대방",상태이상적중:"상이적",상태이상저항:"상이저","일반몬스터 관통":"일몬관","일반몬스터 추가피해":"일몬추","보스몬스터 관통":"보몬관","보스몬스터 추가피해":"보몬추","치명위력%":"치위%","치명확률%":"치확%",위력:"위력",이동속도:"이속",피해흡수:"피흡",치명저항:"치저",치명피해저항:"치피저","경험치 획득증가":"경획","일반몬스터 저항":"일몬저","보스몬스터 저항":"보몬저"},F={damageResistance:"stat-damage-resistance",damageResistancePenetration:"stat-damage-resistance-penetration",pvpDefensePercent:"stat-pvp-defense-percent",pvpDamagePercent:"stat-pvp-damage-percent"},z={pvpDamage:"stat-pvp-damage",pvpDefense:"stat-pvp-defense",statusEffectAccuracy:"stat-status-effect-accuracy",statusEffectResistance:"stat-status-effect-resistance",damageAbsorption:"stat-damage-absorption"};function Y(){return window.innerWidth<=768}function Z(){if(e.imageLoadErrorShown)return;e.imageLoadErrorShown=!0;const t=b("div");if(t.style.cssText=`
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
  `,t.textContent="일부 이미지가 로드되지 않았습니다. Ctrl+Shift+R을 눌러 새로고침해주세요.",!document.getElementById("image-error-animation-style")){const a=b("style");a.id="image-error-animation-style",a.textContent=`
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
    `,document.head.appendChild(a)}document.body.appendChild(t),setTimeout(()=>{t.parentNode&&(t.style.animation="slideDown 0.3s ease-out reverse",setTimeout(()=>{t.parentNode&&t.remove()},300))},5e3),t.addEventListener("click",()=>{t.parentNode&&(t.style.animation="slideDown 0.3s ease-out reverse",setTimeout(()=>{t.parentNode&&t.remove()},300))})}function V(){return`
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
  `}function v(){const t=localStorage.getItem("myInfo_profiles");if(t)try{return JSON.parse(t)}catch(a){return f.error("Error loading profiles:",a),[]}return[]}function I(t){localStorage.setItem("myInfo_profiles",JSON.stringify(t))}function N(){return localStorage.getItem("myInfo_currentProfileId")||null}function h(t){t?localStorage.setItem("myInfo_currentProfileId",t):localStorage.removeItem("myInfo_currentProfileId"),e.currentProfileId=t}function w(t){const a=v(),i={id:`profile_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,name:t||`프로파일 ${a.length+1}`,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};return a.push(i),I(a),i}function H(t,a){const s=v(),i=s.find(o=>o.id===t);return i?(Object.assign(i,a),i.updatedAt=new Date().toISOString(),I(s),i):null}function W(t,a={}){const i=v().filter(o=>o.id!==t);I(i),localStorage.removeItem(`myInfo_profile_${t}`),e.currentProfileId===t&&(i.length>0?(h(i[0].id),D(i[0].id,a)):(h(null),e.userStats={},e.bondSpirits={수호:[],탑승:[],변신:[]},e.activeSpirits={수호:null,탑승:null,변신:null},e.baselineStats={},e.baselineKeyStats={tachaeTotal:0,statusEffectResistance:0,statusEffectAccuracy:0},e.savedSoulExp=0,e.engravingData={수호:{},탑승:{},변신:{}},e.baselineStatsHash=null,e.baselineSoulExpHash=null))}function _(t){const a={userStats:e.userStats,bondSpirits:e.bondSpirits,activeSpirits:e.activeSpirits,baselineStats:e.baselineStats,baselineKeyStats:e.baselineKeyStats,savedSoulExp:e.savedSoulExp,engravingData:e.engravingData,baselineStatsHash:e.baselineStatsHash,baselineSoulExpHash:e.baselineSoulExpHash};localStorage.setItem(`myInfo_profile_${t}`,JSON.stringify(a)),H(t,{updatedAt:new Date().toISOString()})}function D(t,a={}){const s=localStorage.getItem(`myInfo_profile_${t}`);if(s)try{const i=JSON.parse(s);if(e.userStats=i.userStats||{},e.bondSpirits=i.bondSpirits||{수호:[],탑승:[],변신:[]},e.activeSpirits=i.activeSpirits||{수호:null,탑승:null,변신:null},e.baselineStats=i.baselineStats||{},e.baselineKeyStats=i.baselineKeyStats||{tachaeTotal:0,statusEffectResistance:0,statusEffectAccuracy:0},e.savedSoulExp=i.savedSoulExp||0,e.engravingData=i.engravingData||{수호:{},탑승:{},변신:{}},e.baselineStatsHash=i.baselineStatsHash||null,e.baselineSoulExpHash=i.baselineSoulExpHash||null,e.lastTotalStatsHash=null,e.lastTotalStatsCalculation=null,e.lastSoulExpHash=null,e.lastSoulExpCalculation=null,e.isInitialLoad=!0,a.renderBondSlots&&(a.renderBondSlots("수호"),a.renderBondSlots("탑승"),a.renderBondSlots("변신")),a.renderActiveSpiritSelect&&(a.renderActiveSpiritSelect("수호"),a.renderActiveSpiritSelect("탑승"),a.renderActiveSpiritSelect("변신")),a.renderStats&&a.renderStats(),a.updateTotalStats){const o=a.updateTotalStats();o&&typeof o.then=="function"?o.then(()=>{e.isInitialLoad=!1}).catch(()=>{e.isInitialLoad=!1}):e.isInitialLoad=!1}else e.isInitialLoad=!1;a.updateSoulExp&&a.updateSoulExp()}catch(i){f.error("Error loading profile data:",i)}}function P(){const t=y.profileSelect;if(!t)return;const a=v(),s=e.currentProfileId;t.innerHTML='<option value="">프로파일 없음</option>',a.forEach(o=>{const n=b("option");n.value=o.id,n.textContent=o.name,o.id===s&&(n.selected=!0),t.appendChild(n)});const i=s!==null;y.editProfileBtn&&(y.editProfileBtn.disabled=!i),y.deleteProfileBtn&&(y.deleteProfileBtn.disabled=!i)}function Q(t,a=null,s={}){const i=b("div","my-info-profile-modal"),o=a?v().find(r=>r.id===a):null;i.innerHTML=`
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
               value="${o?o.name:""}" 
               placeholder="프로파일 이름을 입력하세요" maxlength="50">
      </div>
      <div class="my-info-profile-modal-actions">
        <button class="my-info-profile-btn" id="profileModalCancelBtn">취소</button>
        <button class="my-info-profile-btn primary" id="profileModalSaveBtn">
          ${t==="create"?"생성":"저장"}
        </button>
      </div>
    </div>
  `,document.body.appendChild(i);const n=()=>i.remove();i.querySelector(".my-info-profile-modal-close").addEventListener("click",n),i.querySelector("#profileModalCancelBtn").addEventListener("click",n),i.addEventListener("click",r=>{r.target===i&&n()}),i.querySelector("#profileModalSaveBtn").addEventListener("click",()=>{const d=i.querySelector("#profileNameInput").value.trim();if(!d){alert("프로파일 이름을 입력해주세요.");return}if(t==="create"){const m=w(d),S=JSON.parse(JSON.stringify(e.bondSpirits)),l=JSON.parse(JSON.stringify(e.activeSpirits)),g=JSON.parse(JSON.stringify(e.engravingData));e.userStats={},e.baselineStats={},e.baselineKeyStats={tachaeTotal:0,statusEffectResistance:0,statusEffectAccuracy:0},e.savedSoulExp=0,e.baselineStatsHash=null,e.baselineSoulExpHash=null,e.bondSpirits=S,e.activeSpirits=l,e.engravingData=g,e.lastTotalStatsHash=null,e.lastTotalStatsCalculation=null,e.lastSoulExpHash=null,e.lastSoulExpCalculation=null,e.isInitialLoad=!0,h(m.id),_(m.id),P(),s.renderBondSlots&&(s.renderBondSlots("수호"),s.renderBondSlots("탑승"),s.renderBondSlots("변신")),s.renderActiveSpiritSelect&&(s.renderActiveSpiritSelect("수호"),s.renderActiveSpiritSelect("탑승"),s.renderActiveSpiritSelect("변신")),s.renderStats&&s.renderStats(),s.updateTotalStats&&s.updateTotalStats(),s.updateSoulExp&&s.updateSoulExp(),alert("프로파일이 생성되었습니다. 나의 스탯을 새로 입력해주세요.")}else t==="edit"&&a&&(H(a,{name:d}),P(),alert("프로파일 이름이 수정되었습니다."));n()}),i.querySelector("#profileNameInput").addEventListener("keydown",r=>{r.key==="Enter"&&i.querySelector("#profileModalSaveBtn").click()}),setTimeout(()=>{i.querySelector("#profileNameInput").focus(),i.querySelector("#profileNameInput").select()},100)}function ee(){if(e.currentProfileId)return;const t=localStorage.getItem("myInfo_userStats");if(t)try{e.userStats=JSON.parse(t)}catch(a){f.error("Error loading user stats:",a),e.userStats={}}}function te(){e.currentProfileId||localStorage.setItem("myInfo_userStats",JSON.stringify(e.userStats))}function ae(t={}){const a=N();if(e.currentProfileId=a,a)D(a,t);else{const s=localStorage.getItem("myInfo_bondSpirits");if(s)try{e.bondSpirits=JSON.parse(s)}catch(l){f.error("Error loading bond spirits:",l)}const i=localStorage.getItem("myInfo_activeSpirits");if(i)try{e.activeSpirits=JSON.parse(i)}catch(l){f.error("Error loading active spirits:",l)}const o=localStorage.getItem("myInfo_baselineStats");if(o)try{e.baselineStats=JSON.parse(o)}catch(l){f.error("Error loading baseline stats:",l)}const n=localStorage.getItem("myInfo_savedSoulExp");if(n)try{e.savedSoulExp=parseInt(n,10)||0}catch(l){f.error("Error loading saved soul exp:",l)}const r=localStorage.getItem("myInfo_engravingData");if(r)try{e.engravingData=JSON.parse(r)}catch(l){f.error("Error loading engraving data:",l),e.engravingData={수호:{},탑승:{},변신:{}}}const d=localStorage.getItem("myInfo_baselineKeyStats");if(d)try{e.baselineKeyStats=JSON.parse(d)}catch(l){f.error("Error loading baseline key stats:",l)}const m=localStorage.getItem("myInfo_baselineStatsHash");m&&(e.baselineStatsHash=m);const S=localStorage.getItem("myInfo_baselineSoulExpHash");S&&(e.baselineSoulExpHash=S)}}function ie(){e.currentProfileId?_(e.currentProfileId):(localStorage.setItem("myInfo_bondSpirits",JSON.stringify(e.bondSpirits)),localStorage.setItem("myInfo_activeSpirits",JSON.stringify(e.activeSpirits)),localStorage.setItem("myInfo_baselineStats",JSON.stringify(e.baselineStats)),localStorage.setItem("myInfo_baselineKeyStats",JSON.stringify(e.baselineKeyStats)),localStorage.setItem("myInfo_savedSoulExp",e.savedSoulExp.toString()),localStorage.setItem("myInfo_engravingData",JSON.stringify(e.engravingData)),e.baselineStatsHash&&localStorage.setItem("myInfo_baselineStatsHash",e.baselineStatsHash),e.baselineSoulExpHash&&localStorage.setItem("myInfo_baselineSoulExpHash",e.baselineSoulExpHash))}async function M(){if(e.expTable)return e.expTable;try{return e.expTable=await k(),e.expTable}catch(t){return f.error("Error fetching exp table:",t),null}}function O(t,a,s,i){if(!t||!t[a])return 0;const o=t[a];let n=0;if(i>s&&i<o.length)for(let r=s+1;r<=i;r++)n+=o[r]||0;return n}function B(){return["수호","탑승","변신"].map(s=>[...e.bondSpirits[s]||[]].sort((n,r)=>{const d=(n.name||"").localeCompare(r.name||"");return d!==0?d:(n.level||25)-(r.level||25)}).map(n=>`${n.name}:${n.level||25}`).join(",")).join("|")}async function se(t){const a=y.soulExpInfo;if(!a)return;const s=B(),i=e.baselineSoulExpHash&&s===e.baselineSoulExpHash;if(e.lastSoulExpHash===s&&e.lastSoulExpCalculation&&!i){a.innerHTML=e.lastSoulExpCalculation;return}a.innerHTML="<p class='text-center text-sm text-light'>계산 중...</p>";try{const o=await M();if(!o){a.innerHTML="<p class='text-center text-sm text-light'>경험치 테이블을 불러올 수 없습니다.</p>";return}let n=0;const r={},d=["수호","탑승","변신"];for(const c of d){const p=e.bondSpirits[c]||[];let u=0;for(const x of p){if(!x.level||x.level===0)continue;const T=t(c).find(L=>L.name===x.name);if(!T)continue;const A=T.grade==="불멸"?"immortal":"legend",C=O(o,A,0,x.level);u+=C}r[c]=u,n+=u}if(n===0){const c="<p class='text-center text-sm text-light'>초기화할 환수가 없습니다.</p>";a.innerHTML=c,e.lastSoulExpCalculation=c,e.lastSoulExpHash=s;return}const S=Math.ceil(n/1e3);let l='<div class="my-info-soul-exp-grid">';d.forEach(c=>{const p=r[c]||0;l+=`
        <div class="my-info-soul-exp-category-item">
          <div class="my-info-soul-exp-category-label">${c}</div>
          <div class="my-info-soul-exp-category-value">${p.toLocaleString()} exp</div>
        </div>
      `}),l+=`
      <div class="my-info-soul-exp-total-item">
        <div class="my-info-soul-exp-total-label">총합</div>
        <div class="my-info-soul-exp-total-value">${n.toLocaleString()} exp</div>
      </div>
    `;let g=!1;if(e.baselineSoulExpHash&&s===e.baselineSoulExpHash&&(g=!0),e.savedSoulExp>0){let c=n-e.savedSoulExp;g&&(c=0);let p="",u="";c>0?(p=`+${c.toLocaleString()} exp (부족)`,u="#e74c3c"):c<0?(p=`${c.toLocaleString()} exp (여유)`,u="#4CAF50"):(p="0 exp (동일)",u="var(--text-secondary)"),l+=`
        <div class="my-info-soul-exp-baseline-item">
          <div class="my-info-soul-exp-baseline-label">기준 대비</div>
          <div class="my-info-soul-exp-baseline-value" style="color: ${u};">
            ${p}
          </div>
          <div class="my-info-soul-exp-baseline-text">
            기준: ${e.savedSoulExp.toLocaleString()} exp
          </div>
        </div>
      `}else l+=`
        <div class="my-info-soul-exp-baseline-item" style="opacity: 0.5;">
          <div class="my-info-soul-exp-baseline-label">기준 대비</div>
          <div class="my-info-soul-exp-baseline-value">-</div>
        </div>
      `;l+=`
      <div class="my-info-soul-exp-need-item">
        <div class="my-info-soul-exp-need-label">필요경험치</div>
        <div class="my-info-soul-exp-need-value">
          <img src="assets/img/high-soul.jpg" alt="최상급 환수혼" loading="lazy">
          <span>약 <strong>${S.toLocaleString()}</strong>개</span>
        </div>
      </div>
    `,l+="</div>",a.innerHTML=l,e.lastSoulExpCalculation=l,e.lastSoulExpHash=s}catch(o){f.error("Error updating soul exp:",o),a.innerHTML="<p class='text-center text-sm text-light'>계산 중 오류가 발생했습니다.</p>"}}export{G as C,q as E,X as M,E as S,Q as a,te as b,O as c,W as d,y as e,B as f,v as g,ie as h,Z as i,Y as j,U as k,D as l,j as m,F as n,z as o,e as p,V as q,P as r,h as s,ee as t,se as u,ae as v,M as w};
