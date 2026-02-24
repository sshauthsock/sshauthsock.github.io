import{c as j,i as z}from"./components-K-_Tu490.js";import{f as pe,s as K}from"./main-Db1MuKHz.js";import{L as E}from"./utils-C57Sp-PS.js";import{c as Y}from"./myInfo-statCalculator-CZ2zs_8H.js";import{g as Z}from"./myInfo-spiritManager-DbkdsTGS.js";const e={currentCategory:"수호",currentProfileId:null,bondSpirits:{수호:[],탑승:[],변신:[]},activeSpirits:{수호:null,탑승:null,변신:null},userStats:{},baselineStats:{},baselineKeyStats:{tachaeTotal:0,statusEffectResistance:0,statusEffectAccuracy:0},expTable:null,lastSoulExpCalculation:null,lastSoulExpHash:null,bondCalculationCache:new Map,lastTotalStatsCalculation:null,lastTotalStatsHash:null,savedSoulExp:0,baselineSoulExpHash:null,recentlyEditedStats:new Set,isSavingBaseline:!1,isInitialLoad:!0,isUpdatingTotalStats:!1,baselineStatsHash:null,removedSpiritLevels:{},engravingData:{수호:{},탑승:{},변신:{}},imageLoadErrors:new Set,imageLoadErrorShown:!1,imageObserver:null},_={},H=[{key:"damageResistancePenetration",name:"피해저항관통"},{key:"damageResistance",name:"피해저항"},{key:"pvpDamagePercent",name:"대인피해%"},{key:"pvpDefensePercent",name:"대인방어%"},{key:"pvpDamage",name:"대인피해"},{key:"pvpDefense",name:"대인방어"},{key:"statusEffectAccuracy",name:"상태이상적중"},{key:"statusEffectResistance",name:"상태이상저항"},{key:"normalMonsterPenetration",name:"일반몬스터 관통"},{key:"normalMonsterAdditionalDamage",name:"일반몬스터 추가피해"},{key:"bossMonsterPenetration",name:"보스몬스터 관통"},{key:"bossMonsterAdditionalDamage",name:"보스몬스터 추가피해"},{key:"criticalPowerPercent",name:"치명위력%"},{key:"criticalChance",name:"치명확률%"},{key:"power",name:"위력"},{key:"movementSpeed",name:"이동속도"},{key:"damageAbsorption",name:"피해흡수"},{key:"criticalResistance",name:"치명저항"},{key:"criticalDamageResistance",name:"치명피해저항"},{key:"experienceGainIncrease",name:"경험치 획득증가"},{key:"normalMonsterResistance",name:"일반몬스터 저항"},{key:"bossMonsterResistance",name:"보스몬스터 저항"}],Oe=[{key:"healthIncrease",name:"체력증가"},{key:"magicIncrease",name:"마력증가"},{key:"criticalChance",name:"치명확률"},{key:"criticalResistance",name:"치명저항"},{key:"healthPotionEnhancement",name:"체력시약향상"},{key:"magicPotionEnhancement",name:"마력시약향상"},{key:"pvpDefense",name:"대인방어"},{key:"damageAbsorption",name:"피해흡수"},{key:"power",name:"위력"},{key:"criticalDamageResistance",name:"치명피해저항"},{key:"castingEnhancement",name:"시전향상"},{key:"bossMonsterAdditionalDamage",name:"보스몬스터 추가피해"},{key:"normalMonsterAdditionalDamage",name:"일반몬스터 추가피해"},{key:"damageResistancePenetration",name:"피해저항관통"},{key:"statusEffectResistance",name:"상태이상저항"},{key:"statusEffectAccuracy",name:"상태이상적중"}],_e=H.slice(0,8),Me=H.slice(8,16),He=H.slice(16),Pe={피해저항관통:"피저관",피해저항:"피저","대인피해%":"대피%","대인방어%":"대방%",대인피해:"대피",대인방어:"대방",상태이상적중:"상이적",상태이상저항:"상이저","일반몬스터 관통":"일몬관","일반몬스터 추가피해":"일몬추","보스몬스터 관통":"보몬관","보스몬스터 추가피해":"보몬추","치명위력%":"치위%","치명확률%":"치확%",위력:"위력",이동속도:"이속",피해흡수:"피흡",치명저항:"치저",치명피해저항:"치피저","경험치 획득증가":"경획","일반몬스터 저항":"일몬저","보스몬스터 저항":"보몬저"},Ve={damageResistance:"stat-damage-resistance",damageResistancePenetration:"stat-damage-resistance-penetration",pvpDefensePercent:"stat-pvp-defense-percent",pvpDamagePercent:"stat-pvp-damage-percent"},Be={pvpDamage:"stat-pvp-damage",pvpDefense:"stat-pvp-defense",statusEffectAccuracy:"stat-status-effect-accuracy",statusEffectResistance:"stat-status-effect-resistance",damageAbsorption:"stat-damage-absorption"};function Re(){return window.innerWidth<=768}function De(){if(e.imageLoadErrorShown)return;e.imageLoadErrorShown=!0;const t=j("div");if(t.style.cssText=`
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
  `,t.textContent="일부 이미지가 로드되지 않았습니다. Ctrl+Shift+R을 눌러 새로고침해주세요.",!document.getElementById("image-error-animation-style")){const n=j("style");n.id="image-error-animation-style",n.textContent=`
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
    `,document.head.appendChild(n)}document.body.appendChild(t),setTimeout(()=>{t.parentNode&&(t.style.animation="slideDown 0.3s ease-out reverse",setTimeout(()=>{t.parentNode&&t.remove()},300))},5e3),t.addEventListener("click",()=>{t.parentNode&&(t.style.animation="slideDown 0.3s ease-out reverse",setTimeout(()=>{t.parentNode&&t.remove()},300))})}function je(){return`
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
          <div class="my-info-profile-section">
            <div class="my-info-profile-section-left">
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
            <div class="my-info-profile-section-right">
              <div class="my-info-data-menu">
                <button id="dataMenuBtn" class="my-info-menu-btn" title="데이터 관리">
                  <span class="my-info-btn-icon">⚙️</span>
                  <span class="my-info-btn-text">데이터</span>
                  <span class="my-info-menu-arrow">▼</span>
                </button>
                <div id="dataMenuDropdown" class="my-info-menu-dropdown">
                  <button id="copyClipboardBtn" class="my-info-menu-item">
                    <span class="my-info-menu-icon">📋</span>
                    <span>클립보드 복사</span>
                  </button>
                  <button id="pasteClipboardBtn" class="my-info-menu-item">
                    <span class="my-info-menu-icon">📄</span>
                    <span>클립보드 붙여넣기</span>
                  </button>
                  <div class="my-info-menu-divider"></div>
                  <button id="exportJSONBtn" class="my-info-menu-item">
                    <span class="my-info-menu-icon">📥</span>
                    <span>JSON 내보내기</span>
                  </button>
                  <button id="exportCSVBtn" class="my-info-menu-item">
                    <span class="my-info-menu-icon">📥</span>
                    <span>CSV 내보내기</span>
                  </button>
                  <div class="my-info-menu-divider"></div>
                  <button id="importBtn" class="my-info-menu-item">
                    <span class="my-info-menu-icon">📤</span>
                    <span>파일 가져오기</span>
                  </button>
                </div>
              </div>
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
  `}function O(){const t=localStorage.getItem("myInfo_profiles");if(t)try{return JSON.parse(t)}catch{return[]}return[]}function Q(t){localStorage.setItem("myInfo_profiles",JSON.stringify(t))}function U(){return localStorage.getItem("myInfo_currentProfileId")||null}function q(t){t?localStorage.setItem("myInfo_currentProfileId",t):localStorage.removeItem("myInfo_currentProfileId"),e.currentProfileId=t}function Se(t){const n=O(),i={id:`profile_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,name:t||`프로파일 ${n.length+1}`,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};return n.push(i),Q(n),i}function ie(t,n){const a=O(),i=a.find(s=>s.id===t);return i?(Object.assign(i,n),i.updatedAt=new Date().toISOString(),Q(a),i):null}function Ke(t,n={}){const i=O().filter(s=>s.id!==t);Q(i),localStorage.removeItem(`myInfo_profile_${t}`),e.currentProfileId===t&&(i.length>0?(q(i[0].id),re(i[0].id,n)):(q(null),e.userStats={},e.bondSpirits={수호:[],탑승:[],변신:[]},e.activeSpirits={수호:null,탑승:null,변신:null},e.baselineStats={},e.baselineKeyStats={tachaeTotal:0,statusEffectResistance:0,statusEffectAccuracy:0},e.savedSoulExp=0,e.engravingData={수호:{},탑승:{},변신:{}},e.baselineStatsHash=null,e.baselineSoulExpHash=null))}function se(t){const n={userStats:e.userStats,bondSpirits:e.bondSpirits,activeSpirits:e.activeSpirits,baselineStats:e.baselineStats,baselineKeyStats:e.baselineKeyStats,savedSoulExp:e.savedSoulExp,engravingData:e.engravingData,baselineStatsHash:e.baselineStatsHash,baselineSoulExpHash:e.baselineSoulExpHash};localStorage.setItem(`myInfo_profile_${t}`,JSON.stringify(n)),ie(t,{updatedAt:new Date().toISOString()})}function re(t,n={}){const a=localStorage.getItem(`myInfo_profile_${t}`);if(a)try{const i=JSON.parse(a);e.userStats=i.userStats||{};const s=i.bondSpirits||{수호:[],탑승:[],변신:[]},c=["수호","탑승","변신"];for(const o of c)s[o]&&(s[o]=s[o].map(l=>z(l.name)?{...l,level:25}:l));e.bondSpirits=s;const r=i.activeSpirits||{수호:null,탑승:null,변신:null};for(const o of c)r[o]&&z(r[o].name)&&(r[o]={...r[o],level:25});if(e.activeSpirits=r,e.baselineStats=i.baselineStats||{},e.baselineKeyStats=i.baselineKeyStats||{tachaeTotal:0,statusEffectResistance:0,statusEffectAccuracy:0},e.savedSoulExp=i.savedSoulExp||0,e.engravingData=i.engravingData||{수호:{},탑승:{},변신:{}},e.baselineStatsHash=i.baselineStatsHash||null,e.baselineSoulExpHash=i.baselineSoulExpHash||null,e.lastTotalStatsHash=null,e.lastTotalStatsCalculation=null,e.lastSoulExpHash=null,e.lastSoulExpCalculation=null,e.isInitialLoad=!0,n.renderBondSlots&&(n.renderBondSlots("수호"),n.renderBondSlots("탑승"),n.renderBondSlots("변신")),n.renderActiveSpiritSelect&&(n.renderActiveSpiritSelect("수호"),n.renderActiveSpiritSelect("탑승"),n.renderActiveSpiritSelect("변신")),n.renderStats&&n.renderStats(),n.updateTotalStats){const o=n.updateTotalStats();o&&typeof o.then=="function"?o.then(()=>{e.isInitialLoad=!1}).catch(()=>{e.isInitialLoad=!1}):e.isInitialLoad=!1}else e.isInitialLoad=!1;n.updateSoulExp&&(e.lastSoulExpHash=null,e.lastSoulExpCalculation=null,n.updateSoulExp())}catch{}}function te(){const t=_.profileSelect;if(!t)return;const n=O(),a=e.currentProfileId;t.innerHTML='<option value="">프로파일 없음</option>',n.forEach(s=>{const c=j("option");c.value=s.id,c.textContent=s.name,s.id===a&&(c.selected=!0),t.appendChild(c)});const i=a!==null;_.editProfileBtn&&(_.editProfileBtn.disabled=!i),_.deleteProfileBtn&&(_.deleteProfileBtn.disabled=!i)}function Je(t,n=null,a={}){const i=j("div","my-info-profile-modal"),s=n?O().find(r=>r.id===n):null;i.innerHTML=`
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
               value="${s?s.name:""}" 
               placeholder="프로파일 이름을 입력하세요" maxlength="50">
      </div>
      <div class="my-info-profile-modal-actions">
        <button class="my-info-profile-btn" id="profileModalCancelBtn">취소</button>
        <button class="my-info-profile-btn primary" id="profileModalSaveBtn">
          ${t==="create"?"생성":"저장"}
        </button>
      </div>
    </div>
  `,document.body.appendChild(i);const c=()=>i.remove();i.querySelector(".my-info-profile-modal-close").addEventListener("click",c),i.querySelector("#profileModalCancelBtn").addEventListener("click",c),i.addEventListener("click",r=>{r.target===i&&c()}),i.querySelector("#profileModalSaveBtn").addEventListener("click",()=>{const o=i.querySelector("#profileNameInput").value.trim();if(!o){alert("프로파일 이름을 입력해주세요.");return}if(t==="create"){const l=Se(o),f=JSON.parse(JSON.stringify(e.bondSpirits)),d=JSON.parse(JSON.stringify(e.activeSpirits)),u=JSON.parse(JSON.stringify(e.engravingData));e.userStats={},e.baselineStats={},e.baselineKeyStats={tachaeTotal:0,statusEffectResistance:0,statusEffectAccuracy:0},e.savedSoulExp=0,e.baselineStatsHash=null,e.baselineSoulExpHash=null,e.bondSpirits=f,e.activeSpirits=d,e.engravingData=u,e.lastTotalStatsHash=null,e.lastTotalStatsCalculation=null,e.lastSoulExpHash=null,e.lastSoulExpCalculation=null,e.isInitialLoad=!0,q(l.id),se(l.id),te(),a.renderBondSlots&&(a.renderBondSlots("수호"),a.renderBondSlots("탑승"),a.renderBondSlots("변신")),a.renderActiveSpiritSelect&&(a.renderActiveSpiritSelect("수호"),a.renderActiveSpiritSelect("탑승"),a.renderActiveSpiritSelect("변신")),a.renderStats&&a.renderStats(),a.updateTotalStats&&a.updateTotalStats(),a.updateSoulExp&&a.updateSoulExp(),alert("프로파일이 생성되었습니다. 나의 스탯을 새로 입력해주세요.")}else t==="edit"&&n&&(ie(n,{name:o}),te(),alert("프로파일 이름이 수정되었습니다."));c()}),i.querySelector("#profileNameInput").addEventListener("keydown",r=>{r.key==="Enter"&&i.querySelector("#profileModalSaveBtn").click()}),setTimeout(()=>{i.querySelector("#profileNameInput").focus(),i.querySelector("#profileNameInput").select()},100)}function ke(){if(e.currentProfileId)return;const t=localStorage.getItem("myInfo_userStats");if(t)try{e.userStats=JSON.parse(t)}catch{e.userStats={}}}function Fe(){e.currentProfileId||localStorage.setItem("myInfo_userStats",JSON.stringify(e.userStats))}function Ue(t={}){const n=U();if(e.currentProfileId=n,n)re(n,t);else{const a=localStorage.getItem("myInfo_bondSpirits");if(a)try{e.bondSpirits=JSON.parse(a)}catch{}const i=localStorage.getItem("myInfo_activeSpirits");if(i)try{e.activeSpirits=JSON.parse(i)}catch{}const s=localStorage.getItem("myInfo_baselineStats");if(s)try{e.baselineStats=JSON.parse(s)}catch{}const c=localStorage.getItem("myInfo_savedSoulExp");if(c)try{e.savedSoulExp=parseInt(c,10)||0}catch{}const r=localStorage.getItem("myInfo_engravingData");if(r)try{e.engravingData=JSON.parse(r)}catch{e.engravingData={수호:{},탑승:{},변신:{}}}const o=localStorage.getItem("myInfo_baselineKeyStats");if(o)try{e.baselineKeyStats=JSON.parse(o)}catch{}const l=localStorage.getItem("myInfo_baselineStatsHash");l&&(e.baselineStatsHash=l);const f=localStorage.getItem("myInfo_baselineSoulExpHash");f&&(e.baselineSoulExpHash=f)}}function Xe(){e.currentProfileId?se(e.currentProfileId):(localStorage.setItem("myInfo_bondSpirits",JSON.stringify(e.bondSpirits)),localStorage.setItem("myInfo_activeSpirits",JSON.stringify(e.activeSpirits)),localStorage.setItem("myInfo_baselineStats",JSON.stringify(e.baselineStats)),localStorage.setItem("myInfo_baselineKeyStats",JSON.stringify(e.baselineKeyStats)),localStorage.setItem("myInfo_savedSoulExp",e.savedSoulExp.toString()),localStorage.setItem("myInfo_engravingData",JSON.stringify(e.engravingData)),e.baselineStatsHash&&localStorage.setItem("myInfo_baselineStatsHash",e.baselineStatsHash),e.baselineSoulExpHash&&localStorage.setItem("myInfo_baselineSoulExpHash",e.baselineSoulExpHash))}async function me(){if(e.expTable)return e.expTable;try{return e.expTable=await pe(),e.expTable}catch{return null}}function ve(t,n,a,i){if(!t||!t[n])return 0;const s=t[n];let c=0;if(i>a&&i<s.length)for(let r=a+1;r<=i;r++)c+=s[r]||0;return c}function ye(){return["수호","탑승","변신"].map(a=>[...e.bondSpirits[a]||[]].sort((c,r)=>{const o=(c.name||"").localeCompare(r.name||"");return o!==0?o:(c.level||25)-(r.level||25)}).map(c=>`${c.name}:${c.level||25}`).join(",")).join("|")}async function Ge(t,n=!1){const a=_.soulExpInfo;if(!a)return;const i=ye(),s=e.baselineSoulExpHash&&i===e.baselineSoulExpHash;if(!n&&e.lastSoulExpHash===i&&e.lastSoulExpCalculation&&!s){a.innerHTML=e.lastSoulExpCalculation;return}e.lastSoulExpHash!==i&&(e.lastSoulExpHash=null,e.lastSoulExpCalculation=null),a.innerHTML="<p class='text-center text-sm text-light'>계산 중...</p>";try{const c=await me();if(!c){a.innerHTML="<p class='text-center text-sm text-light'>경험치 테이블을 불러올 수 없습니다.</p>";return}let r=0;const o={},l=["수호","탑승","변신"];for(const b of l){const h=e.bondSpirits[b]||[];let y=0;for(const v of h){if(z(v.name)){v.level=25;continue}if(!v.level||v.level===0)continue;const S=t(b).find(x=>x.name===v.name);if(!S)continue;const A=S.grade==="불멸"?"immortal":"legend",m=ve(c,A,0,v.level);y+=m}o[b]=y,r+=y}if(r===0){const b="<p class='text-center text-sm text-light'>초기화할 환수가 없습니다.</p>";a.innerHTML=b,e.lastSoulExpCalculation=b,e.lastSoulExpHash=i;return}const d=Math.ceil(r/1e3);let u='<div class="my-info-soul-exp-grid">';l.forEach(b=>{const h=o[b]||0;u+=`
        <div class="my-info-soul-exp-category-item">
          <div class="my-info-soul-exp-category-label">${b}</div>
          <div class="my-info-soul-exp-category-value">${h.toLocaleString()} exp</div>
        </div>
      `}),u+=`
      <div class="my-info-soul-exp-total-item">
        <div class="my-info-soul-exp-total-label">총합</div>
        <div class="my-info-soul-exp-total-value">${r.toLocaleString()} exp</div>
      </div>
    `;let g=!1;if(e.baselineSoulExpHash&&i===e.baselineSoulExpHash&&(g=!0),e.savedSoulExp>0){let b=r-e.savedSoulExp;g&&(b=0);let h="",y="";b>0?(h=`+${b.toLocaleString()} exp (부족)`,y="#e74c3c"):b<0?(h=`${b.toLocaleString()} exp (여유)`,y="#4CAF50"):(h="0 exp (동일)",y="var(--text-secondary)"),u+=`
        <div class="my-info-soul-exp-baseline-item">
          <div class="my-info-soul-exp-baseline-label">기준 대비</div>
          <div class="my-info-soul-exp-baseline-value" style="color: ${y};">
            ${h}
          </div>
          <div class="my-info-soul-exp-baseline-text">
            기준: ${e.savedSoulExp.toLocaleString()} exp
          </div>
        </div>
      `}else u+=`
        <div class="my-info-soul-exp-baseline-item" style="opacity: 0.7;">
          <div class="my-info-soul-exp-baseline-label">기준 대비</div>
          <div class="my-info-soul-exp-baseline-value" style="color: var(--text-secondary);">
            기준 미설정
          </div>
          <div class="my-info-soul-exp-baseline-text">
            현재: ${r.toLocaleString()} exp (저장 버튼으로 기준 설정)
          </div>
        </div>
      `;u+=`
      <div class="my-info-soul-exp-need-item">
        <div class="my-info-soul-exp-need-label">필요경험치</div>
        <div class="my-info-soul-exp-need-value">
          <img src="assets/img/high-soul.jpg" alt="최상급 환수혼" loading="lazy">
          <span>약 <strong>${d.toLocaleString()}</strong>개</span>
        </div>
      </div>
    `,u+="</div>",a.innerHTML=u,e.lastSoulExpCalculation=u,e.lastSoulExpHash=i}catch{a.innerHTML="<p class='text-center text-sm text-light'>계산 중 오류가 발생했습니다.</p>"}}const J=10*1024*1024,N=6,ge=100,he=0,be=25,Ee=1e9,xe=-1e9,M=4,ne=1e4,ae=10;function $(t){if(!t||typeof t!="string"||t.length===0||t.length>ge)return!1;const n=["<",">","&",'"',"'","/","\\","{","}","[","]","(",")","`","$","%"];for(const a of n)if(t.includes(a))return!1;for(const a of t){const i=a.charCodeAt(0),s=i>=44032&&i<=55203||i>=12593&&i<=12686||i>=4352&&i<=4607,c=i>=65&&i<=90||i>=97&&i<=122,r=i>=48&&i<=57,o=/\s/.test(a),l=["-","_",".",":"].includes(a);if(!s&&!c&&!r&&!o&&!l)return!1}return!0}function oe(t){const n=Number(t);return!isNaN(n)&&Number.isInteger(n)&&n>=he&&n<=be}function C(t){const n=Number(t);return!isNaN(n)&&n>=xe&&n<=Ee&&isFinite(n)}function Ie(t){if(!t||typeof t!="object")return!1;if(t.registration!==void 0&&t.registration!==null)if(Array.isArray(t.registration)){if(t.registration.length>M)return!1;for(const n of t.registration){if(!n||typeof n!="object")return!1;const a=n.statKey||n.key,i=n.value;if(!a||!$(a)||!C(i))return!1}}else if(typeof t.registration=="object"){if(Object.keys(t.registration).length>M)return!1;for(const[a,i]of Object.entries(t.registration))if(!$(a)||!C(i))return!1}else return!1;if(t.bind!==void 0&&t.bind!==null){if(typeof t.bind!="object"||Array.isArray(t.bind))return!1;for(const[n,a]of Object.entries(t.bind))if(!$(n)||!C(a))return!1}return!0}function le(t){if(!t||t===null)return{valid:!0};if(typeof t!="object")return{valid:!1,error:"각인 데이터가 올바르지 않습니다."};if(Object.keys(t).length===0)return{valid:!0};if(t.registration!==void 0&&t.registration!==null)if(Array.isArray(t.registration)){if(t.registration.length>M)return{valid:!1,error:`등록효과가 ${M}개를 초과합니다.`};for(const n of t.registration){if(!n||typeof n!="object")return{valid:!1,error:"등록효과 항목이 올바르지 않습니다."};const a=n.statKey||n.key,i=n.value;if(!a)return{valid:!1,error:"등록효과 스탯명이 없습니다."};if(!$(a))return{valid:!1,error:`등록효과 스탯명이 유효하지 않습니다: ${a}`};if(!C(i))return{valid:!1,error:`등록효과 값이 유효하지 않습니다: ${i}`}}}else if(typeof t.registration=="object"){if(Object.keys(t.registration).length>M)return{valid:!1,error:`등록효과가 ${M}개를 초과합니다.`};for(const[a,i]of Object.entries(t.registration)){if(!$(a))return{valid:!1,error:`등록효과 스탯명이 유효하지 않습니다: ${a}`};if(!C(i))return{valid:!1,error:`등록효과 값이 유효하지 않습니다: ${i}`}}}else return{valid:!1,error:"등록효과 형식이 올바르지 않습니다."};if(t.bind!==void 0&&t.bind!==null){if(typeof t.bind!="object"||Array.isArray(t.bind))return{valid:!1,error:"장착효과 형식이 올바르지 않습니다."};for(const[n,a]of Object.entries(t.bind)){if(!$(n))return{valid:!1,error:`장착효과 스탯명이 유효하지 않습니다: ${n}`};if(!C(a))return{valid:!1,error:`장착효과 값이 유효하지 않습니다: ${a}`}}}return{valid:!0}}function k(t,n){return!t||typeof t!="object"?{valid:!1,error:"환수 데이터가 올바르지 않습니다."}:!t.name||typeof t.name!="string"?{valid:!1,error:"환수명이 올바르지 않습니다."}:$(t.name)?oe(t.level)?t.engraving&&!Ie(t.engraving)?{valid:!1,error:"각인 데이터가 올바르지 않습니다."}:["수호","탑승","변신"].includes(n)?{valid:!0}:{valid:!1,error:`올바르지 않은 카테고리입니다: ${n}`}:{valid:!1,error:`레벨이 올바르지 않습니다: ${t.level}`}:{valid:!1,error:`환수명에 허용되지 않은 문자가 포함되어 있습니다: ${t.name}`}}function ee(t){if(!t||typeof t!="object")return{valid:!1,error:"스탯 데이터가 올바르지 않습니다."};if(Object.keys(t).length>100)return{valid:!1,error:"스탯 개수가 너무 많습니다."};for(const[a,i]of Object.entries(t)){if(!$(a))return{valid:!1,error:`스탯 키에 허용되지 않은 문자가 포함되어 있습니다: ${a}`};if(!C(i))return{valid:!1,error:`스탯 값이 올바르지 않습니다: ${a}=${i}`}}return{valid:!0}}function ce(t){if(!t||typeof t!="object")return{valid:!1,error:"데이터 형식이 올바르지 않습니다."};const n=["수호","탑승","변신"];if(t.spirits){if(typeof t.spirits!="object")return{valid:!1,error:"환수 데이터 형식이 올바르지 않습니다."};for(const a of n){const i=t.spirits[a];if(i){if(!Array.isArray(i))return{valid:!1,error:`${a} 환수 데이터가 배열이 아닙니다.`};if(i.length>N)return{valid:!1,error:`${a} 환수가 너무 많습니다. (최대 ${N}개)`};for(let s=0;s<i.length;s++){const c=k(i[s],a);if(!c.valid)return{valid:!1,error:`${a} 환수 ${s+1}: ${c.error}`}}}}}if(t.activeSpirits){if(typeof t.activeSpirits!="object")return{valid:!1,error:"사용중 환수 데이터 형식이 올바르지 않습니다."};for(const a of n){const i=t.activeSpirits[a];if(i!=null){if(typeof i!="object")return{valid:!1,error:`${a} 사용중 환수 데이터 형식이 올바르지 않습니다.`};if(i.name){const s=k(i,a);if(!s.valid)return{valid:!1,error:`${a} 사용중 환수: ${s.error}`}}}}}if(t.userStats){const a=ee(t.userStats);if(!a.valid)return a}return{valid:!0}}function fe(t){return t?t.size>J?{valid:!1,error:`파일 크기가 너무 큽니다. (최대 ${J/1024/1024}MB)`}:t.size===0?{valid:!1,error:"파일이 비어있습니다."}:{valid:!0}:{valid:!1,error:"파일이 선택되지 않았습니다."}}function de(t){if(!t)return{valid:!1,error:"파일이 선택되지 않았습니다."};const n=t.name.toLowerCase(),a=n.endsWith(".json"),i=n.endsWith(".csv");if(!a&&!i)return{valid:!1,error:"JSON 또는 CSV 파일만 가져올 수 있습니다."};const s=["application/json","text/json","text/csv","text/plain"];return t.type&&!s.includes(t.type)&&E.warn(`의심스러운 MIME 타입: ${t.type}`),{valid:!0}}function F(t,n=0,a=new WeakSet){if(n>ae)return{valid:!1,error:`JSON 깊이가 너무 깊습니다. (최대 ${ae}단계)`};if(t===null||typeof t!="object")return{valid:!0};if(a.has(t))return{valid:!1,error:"순환 참조가 감지되었습니다."};a.add(t);try{if(Array.isArray(t))for(const i of t){const s=F(i,n+1,a);if(!s.valid)return s}else for(const i of Object.values(t)){const s=F(i,n+1,a);if(!s.valid)return s}}finally{a.delete(t)}return{valid:!0}}function ue(t){if(!t||typeof t!="string")return"myInfo_export";let n=t.replace(/[\/\\\?\*\|"<>:]/g,"_").replace(/\.\./g,"_").trim();return n.length>200&&(n=n.substring(0,200)),n.length===0&&(n="myInfo_export"),n}function Ae(t){return t>ne?{valid:!1,error:`CSV 파일이 너무 큽니다. (최대 ${ne}줄)`}:{valid:!0}}function W(){const t=U(),n=O(),a=t?n.find(r=>r.id===t):null,i={수호:[],탑승:[],변신:[]};["수호","탑승","변신"].forEach(r=>{(e.bondSpirits[r]||[]).forEach(l=>{const f=e.engravingData[r]?.[l.name];let d=[];f&&f.registration&&(Array.isArray(f.registration)?d=f.registration.map(g=>({statKey:g.statKey||"",value:g.value||0})):typeof f.registration=="object"&&(d=Object.entries(f.registration).map(([g,b])=>({statKey:g,value:b||0}))));const u=f&&f.bind?f.bind:{};i[r].push({name:l.name,level:l.level||0,engraving:{registration:d,bind:u}})})});const c={version:"1.0",exportDate:new Date().toISOString(),profile:a?{id:a.id,name:a.name}:null,data:{spirits:i,activeSpirits:{수호:e.activeSpirits.수호?{name:e.activeSpirits.수호.name,level:e.activeSpirits.수호.level||0}:null,탑승:e.activeSpirits.탑승?{name:e.activeSpirits.탑승.name,level:e.activeSpirits.탑승.level||0}:null,변신:e.activeSpirits.변신?{name:e.activeSpirits.변신.name,level:e.activeSpirits.변신.level||0}:null},userStats:e.userStats}};return JSON.stringify(c,null,2)}async function ze(){try{const t=W();return await navigator.clipboard.writeText(t),E.log("클립보드에 복사되었습니다."),!0}catch{try{const n=document.createElement("textarea");n.value=W(),n.style.position="fixed",n.style.left="-999999px",n.style.top="-999999px",document.body.appendChild(n),n.focus(),n.select();const a=document.execCommand("copy");if(document.body.removeChild(n),a)return E.log("클립보드에 복사되었습니다."),!0;throw new Error("복사 실패")}catch{return alert("클립보드 복사에 실패했습니다. 브라우저 권한을 확인해주세요."),!1}}}async function qe(t={}){try{const n=await navigator.clipboard.readText();if(!n||!n.trim())return alert("클립보드가 비어있습니다."),!1;let a;try{a=JSON.parse(n)}catch(o){return alert(`클립보드 내용이 올바른 JSON 형식이 아닙니다: ${o.message}`),!1}if(n.length>J)return alert("클립보드 내용이 너무 큽니다."),!1;const i=F(a);if(!i.valid)return alert(i.error),!1;if(a.version&&a.version!=="1.0"&&!confirm(`이 데이터는 버전 ${a.version} 형식입니다. 계속하시겠습니까?`))return!1;if(!a.data)return alert("잘못된 데이터 형식입니다."),!1;const s=a.data,c=ce(s);if(!c.valid)return alert(c.error),!1;const r=Array.isArray(K.allSpirits)?K.allSpirits:[];if(s.spirits){const o=["수호","탑승","변신"];e.bondSpirits={수호:[],탑승:[],변신:[]},e.engravingData={수호:{},탑승:{},변신:{}},o.forEach(l=>{const f=s.spirits[l]||[];f.length>N&&(E.warn(`${l} 환수가 너무 많습니다. 최대 ${N}개만 사용합니다.`),f.splice(N)),f.forEach(d=>{const u=k(d,l);if(!u.valid){E.warn(`환수 검증 실패: ${u.error}`);return}const g=r.find(b=>b.name===d.name&&b.type===l);if(g)if(e.bondSpirits[l].push({...g,level:d.level||0}),d.engraving)if(le(d.engraving).valid){let h=[];d.engraving.registration&&(Array.isArray(d.engraving.registration)?h=d.engraving.registration:typeof d.engraving.registration=="object"&&(h=Object.entries(d.engraving.registration).map(([y,v])=>({statKey:y,value:v||0})))),e.engravingData[l][d.name]={registration:h,bind:d.engraving.bind||{}}}else E.warn(`각인 데이터 검증 실패: ${d.name}`),e.engravingData[l][d.name]||(e.engravingData[l][d.name]={registration:[],bind:{}});else e.engravingData[l][d.name]||(e.engravingData[l][d.name]={registration:[],bind:{}});else E.warn(`환수를 찾을 수 없습니다: ${d.name} (${l})`),e.bondSpirits[l].push({name:d.name,level:d.level||0})})})}if(s.activeSpirits){const o=s.activeSpirits,l=["수호","탑승","변신"];e.activeSpirits={수호:null,탑승:null,변신:null},l.forEach(f=>{const d=o[f];if(d&&d.name){const u=r.find(g=>g.name===d.name&&g.type===f);u?e.activeSpirits[f]={...u,level:d.level||0}:(E.warn(`사용중 환수를 찾을 수 없습니다: ${d.name} (${f})`),e.activeSpirits[f]={name:d.name,level:d.level||0})}})}else e.activeSpirits={수호:null,탑승:null,변신:null};if(s.userStats){const o=ee(s.userStats);o.valid?e.userStats=s.userStats:(E.warn(`스탯 검증 실패: ${o.error}`),e.userStats={})}else e.userStats={};if(e.baselineStats={},e.baselineKeyStats={tachaeTotal:0,statusEffectResistance:0,statusEffectAccuracy:0},e.savedSoulExp=0,e.baselineStatsHash=null,e.baselineSoulExpHash=null,e.lastTotalStatsHash=null,e.lastTotalStatsCalculation=null,e.lastSoulExpHash=null,e.lastSoulExpCalculation=null,e.isInitialLoad=!0,t.renderBondSlots&&(t.renderBondSlots("수호"),t.renderBondSlots("탑승"),t.renderBondSlots("변신")),t.renderActiveSpiritSelect&&(t.renderActiveSpiritSelect("수호"),t.renderActiveSpiritSelect("탑승"),t.renderActiveSpiritSelect("변신")),t.renderStats&&t.renderStats(),t.updateTotalStats){const o=t.updateTotalStats();o&&typeof o.then=="function"?o.then(()=>{const{allTotalStats:l}=Y(Z),f=g=>{const b=e.userStats[g]||0,h=l[g]||0;return Math.round(b+h)},d=Math.round(f("damageResistancePenetration")+f("damageResistance")+Math.round(Math.round(f("pvpDamagePercent"))*10)+Math.round(Math.round(f("pvpDefensePercent"))*10));e.baselineKeyStats.tachaeTotal=d,e.baselineKeyStats.statusEffectResistance=f("statusEffectResistance"),e.baselineKeyStats.statusEffectAccuracy=f("statusEffectAccuracy"),[...H].forEach(g=>{const b=e.userStats[g.key]||0,h=l[g.key]||0;e.baselineStats[g.key]=Math.round(b+h)}),e.isInitialLoad=!1}).catch(l=>{E.error("Error updating stats after paste:",l),e.isInitialLoad=!1}):e.isInitialLoad=!1}else e.isInitialLoad=!1;return t.updateSoulExp&&(e.lastSoulExpHash=null,e.lastSoulExpCalculation=null,t.updateSoulExp()),E.log("클립보드에서 데이터를 가져왔습니다."),!0}catch(n){return n.name==="NotAllowedError"?alert("클립보드 접근 권한이 필요합니다. 브라우저 설정에서 권한을 허용해주세요."):alert(`클립보드에서 데이터를 가져오는 중 오류가 발생했습니다: ${n.message}`),!1}}function We(){try{const t=W(),n=new Blob([t],{type:"application/json"}),a=URL.createObjectURL(n),i=document.createElement("a"),s=U(),c=O(),r=s?c.find(f=>f.id===s):null,o=r?`myInfo_${r.name}_${new Date().toISOString().split("T")[0]}.json`:`myInfo_${new Date().toISOString().split("T")[0]}.json`,l=ue(o);i.href=a,i.download=l,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(a),E.log("JSON export completed")}catch{alert("JSON 내보내기 중 오류가 발생했습니다.")}}function Te(){const t=["수호","탑승","변신"],n=[];return n.push("카테고리,환수명,레벨,활성화,등록효과1,등록효과2,등록효과3,등록효과4,장착효과"),t.forEach(a=>{(e.bondSpirits[a]||[]).forEach(s=>{const c=e.activeSpirits[a]?.name===s.name,r=e.engravingData[a]?.[s.name]||{};let o=[];r.registration&&(Array.isArray(r.registration)?o=r.registration:typeof r.registration=="object"&&(o=Object.entries(r.registration).map(([u,g])=>({statKey:u,value:g||0}))));const l=[];for(let u=0;u<4;u++)if(u<o.length&&o[u]){const g=o[u];l.push(`${g.statKey||""}:${g.value||0}`)}else l.push("");const f=r.bind||{},d=Object.entries(f).map(([u,g])=>`${u}:${g}`).join(";");n.push([a,s.name,s.level||0,c?"Y":"N",l[0]||"",l[1]||"",l[2]||"",l[3]||"",d||""].map(u=>`"${String(u).replace(/"/g,'""')}"`).join(","))})}),n.push(""),n.push("=== 사용중 환수 ==="),n.push("카테고리,환수명,레벨"),t.forEach(a=>{const i=e.activeSpirits[a];i&&n.push([a,i.name,i.level||0].map(s=>`"${String(s).replace(/"/g,'""')}"`).join(","))}),n.push(""),n.push("=== 전체 스탯 ==="),n.push("스탯명,값"),Object.entries(e.userStats).forEach(([a,i])=>{n.push([`"${a}"`,`"${i}"`].join(","))}),n.join(`
`)}function Ye(){try{const t=Te(),n=new Blob(["\uFEFF"+t],{type:"text/csv;charset=utf-8;"}),a=URL.createObjectURL(n),i=document.createElement("a"),s=U(),c=O(),r=s?c.find(f=>f.id===s):null,o=r?`myInfo_${r.name}_${new Date().toISOString().split("T")[0]}.csv`:`myInfo_${new Date().toISOString().split("T")[0]}.csv`,l=ue(o);i.href=a,i.download=l,document.body.appendChild(i),i.click(),document.body.removeChild(i),URL.revokeObjectURL(a),E.log("CSV export completed")}catch{alert("CSV 내보내기 중 오류가 발생했습니다.")}}async function Ze(t,n={}){return new Promise((a,i)=>{const s=fe(t);if(!s.valid){alert(s.error),i(new Error(s.error));return}const c=de(t);if(!c.valid){alert(c.error),i(new Error(c.error));return}const r=new FileReader;r.onload=o=>{try{const l=o.target.result;if(l.length>J)throw new Error("파일 크기가 너무 큽니다.");let f;try{f=JSON.parse(l)}catch(h){throw new Error(`JSON 파싱 오류: ${h.message}`)}const d=F(f);if(!d.valid)throw new Error(d.error);if(f.version&&f.version!=="1.0"&&!confirm(`이 파일은 버전 ${f.version} 형식입니다. 계속하시겠습니까?`)){a(!1);return}if(!f.data)throw new Error("잘못된 파일 형식입니다.");const u=f.data,g=ce(u);if(!g.valid)throw new Error(g.error);const b=Array.isArray(K.allSpirits)?K.allSpirits:[];if(u.spirits){const h=["수호","탑승","변신"];e.bondSpirits={수호:[],탑승:[],변신:[]},e.engravingData={수호:{},탑승:{},변신:{}},h.forEach(y=>{const v=u.spirits[y]||[];v.length>N&&(E.warn(`${y} 환수가 너무 많습니다. 최대 ${N}개만 사용합니다.`),v.splice(N)),v.forEach(p=>{const S=k(p,y);if(!S.valid){E.warn(`환수 검증 실패: ${S.error}`);return}const I=b.find(A=>A.name===p.name&&A.type===y);if(I)if(e.bondSpirits[y].push({...I,level:p.level||0}),p.engraving){const A=le(p.engraving);if(A.valid){let m=[];p.engraving.registration&&(Array.isArray(p.engraving.registration)?m=p.engraving.registration:typeof p.engraving.registration=="object"&&(m=Object.entries(p.engraving.registration).map(([x,T])=>({statKey:x,value:T||0})))),e.engravingData[y][p.name]={registration:m,bind:p.engraving.bind||{}},E.log(`각인 데이터 저장: ${y} - ${p.name}`,{registration:m,bind:p.engraving.bind||{}})}else E.warn(`각인 데이터 검증 실패: ${p.name} - ${A.error||"알 수 없는 오류"}`),e.engravingData[y][p.name]||(e.engravingData[y][p.name]={registration:[],bind:{}})}else e.engravingData[y][p.name]||(e.engravingData[y][p.name]={registration:[],bind:{}});else E.warn(`환수를 찾을 수 없습니다: ${p.name} (${y})`),e.bondSpirits[y].push({name:p.name,level:p.level||0})})})}else{const h=["수호","탑승","변신"],y=u.bondSpirits||{수호:[],탑승:[],변신:[]};e.bondSpirits={수호:[],탑승:[],변신:[]},e.engravingData=u.engravingData||{수호:{},탑승:{},변신:{}},h.forEach(v=>{(y[v]||[]).forEach(S=>{const I=b.find(A=>A.name===S.name&&A.type===v);I?e.bondSpirits[v].push({...I,level:S.level||I.level||0}):(E.warn(`환수를 찾을 수 없습니다: ${S.name} (${v})`),e.bondSpirits[v].push({name:S.name,level:S.level||0}))})})}if(u.activeSpirits){const h=u.activeSpirits,y=["수호","탑승","변신"];e.activeSpirits={수호:null,탑승:null,변신:null},y.forEach(v=>{const p=h[v];if(p&&p.name){const S=b.find(I=>I.name===p.name&&I.type===v);S?e.activeSpirits[v]={...S,level:p.level||0}:(E.warn(`사용중 환수를 찾을 수 없습니다: ${p.name} (${v})`),e.activeSpirits[v]={name:p.name,level:p.level||0})}})}else e.activeSpirits={수호:null,탑승:null,변신:null};if(u.userStats){const h=ee(u.userStats);h.valid?e.userStats=u.userStats:(E.warn(`스탯 검증 실패: ${h.error}`),e.userStats={})}else e.userStats={};if(e.baselineStats={},e.baselineKeyStats={tachaeTotal:0,statusEffectResistance:0,statusEffectAccuracy:0},e.savedSoulExp=0,e.baselineStatsHash=null,e.baselineSoulExpHash=null,e.lastTotalStatsHash=null,e.lastTotalStatsCalculation=null,e.lastSoulExpHash=null,e.lastSoulExpCalculation=null,e.isInitialLoad=!0,n.renderBondSlots&&(n.renderBondSlots("수호"),n.renderBondSlots("탑승"),n.renderBondSlots("변신")),n.renderActiveSpiritSelect&&(n.renderActiveSpiritSelect("수호"),n.renderActiveSpiritSelect("탑승"),n.renderActiveSpiritSelect("변신")),n.renderStats&&n.renderStats(),n.updateTotalStats){const h=n.updateTotalStats();h&&typeof h.then=="function"?h.then(()=>{const{allTotalStats:y}=Y(Z),v=I=>{const A=e.userStats[I]||0,m=y[I]||0;return Math.round(A+m)},p=Math.round(v("damageResistancePenetration")+v("damageResistance")+Math.round(Math.round(v("pvpDamagePercent"))*10)+Math.round(Math.round(v("pvpDefensePercent"))*10));e.baselineKeyStats.tachaeTotal=p,e.baselineKeyStats.statusEffectResistance=v("statusEffectResistance"),e.baselineKeyStats.statusEffectAccuracy=v("statusEffectAccuracy"),[...H].forEach(I=>{const A=e.userStats[I.key]||0,m=y[I.key]||0;e.baselineStats[I.key]=Math.round(A+m)}),e.isInitialLoad=!1,a(!0)}).catch(y=>{E.error("Error updating stats after import:",y),e.isInitialLoad=!1,a(!0)}):(e.isInitialLoad=!1,a(!0))}else e.isInitialLoad=!1,a(!0);n.updateSoulExp&&(e.lastSoulExpHash=null,e.lastSoulExpCalculation=null,n.updateSoulExp()),E.log("JSON import completed")}catch(l){alert(`JSON 가져오기 중 오류가 발생했습니다: ${l.message}`),i(l)}},r.onerror=()=>{const o=new Error("파일 읽기 실패");alert("파일을 읽을 수 없습니다."),i(o)},r.readAsText(t)})}async function Qe(t,n={}){return new Promise((a,i)=>{const s=fe(t);if(!s.valid){alert(s.error),i(new Error(s.error));return}const c=de(t);if(!c.valid){alert(c.error),i(new Error(c.error));return}const r=new FileReader;r.onload=o=>{try{const f=o.target.result.split(`
`).filter(v=>v.trim()),d=Ae(f.length);if(!d.valid)throw new Error(d.error);if(f.length===0||!f[0].includes("카테고리"))throw new Error("잘못된 CSV 형식입니다.");const u={수호:[],탑승:[],변신:[]},g={수호:null,탑승:null,변신:null},b={수호:{},탑승:{},변신:{}},h={};let y="spirits";for(let v=1;v<f.length;v++){const p=f[v].trim();if(!p)continue;if(p.startsWith("=== 사용중 환수 ===")){y="activeSpirits",v++;continue}else if(p.startsWith("=== 전체 스탯 ===")){y="userStats",v++;continue}else if(p.startsWith("==="))continue;const S=[];let I="",A=!1;for(let m=0;m<p.length;m++){const x=p[m];x==='"'?A&&p[m+1]==='"'?(I+='"',m++):A=!A:x===","&&!A?(S.push(I),I=""):I+=x}if(S.push(I),y==="spirits"){if(S.length<3)continue;const m=S[0].replace(/"/g,"").trim(),x=S[1].replace(/"/g,"").trim(),T=parseInt(S[2].replace(/"/g,""))||0,P=S[3]?.replace(/"/g,"").trim()==="Y";if(!["수호","탑승","변신"].includes(m))continue;if(!$(x)){E.warn(`환수명 검증 실패: ${x}`);continue}if(!oe(T)){E.warn(`레벨 검증 실패: ${T}`);continue}if(u[m].length>=N){E.warn(`${m} 환수가 최대 개수에 도달했습니다.`);continue}const V=allSpirits.find(w=>w.name===x&&w.type===m);if(V){const w={...V,level:T};u[m].push(w),P&&(g[m]=w)}else{E.warn(`환수를 찾을 수 없습니다: ${x} (${m})`);const w={name:x,level:T};u[m].push(w),P&&(g[m]=w)}if(S.length>4){const w={registration:[],bind:{}};for(let L=4;L<8&&L<S.length;L++)if(S[L]&&S[L].replace(/"/g,"").trim()){const B=S[L].replace(/"/g,"").trim();if(B.includes(":")){const[X,G]=B.split(":"),R=X.trim(),D=parseFloat(G.trim())||0;$(R)&&C(D)&&w.registration.push({statKey:R,value:D})}}if(S[8]&&S[8].replace(/"/g,"")){const L=S[8].replace(/"/g,"").trim();L&&L.split(";").forEach(B=>{if(B.includes(":")){const[X,G]=B.split(":"),R=X.trim(),D=parseFloat(G.trim())||0;$(R)&&C(D)&&(w.bind[R]=D)}})}b[m][x]=w,E.log(`CSV 각인 데이터 저장: ${m} - ${x}`,w)}}else if(y==="activeSpirits"){if(S.length<3)continue;const m=S[0].replace(/"/g,""),x=S[1].replace(/"/g,""),T=parseInt(S[2].replace(/"/g,""))||0;if(["수호","탑승","변신"].includes(m)){const P=allSpirits.find(V=>V.name===x&&V.type===m);P?g[m]={...P,level:T}:(E.warn(`사용중 환수를 찾을 수 없습니다: ${x} (${m})`),g[m]={name:x,level:T})}}else if(y==="userStats"){if(S.length<2)continue;const m=S[0].replace(/"/g,"").trim(),x=parseFloat(S[1].replace(/"/g,"").trim())||0;$(m)&&C(x)?h[m]=x:E.warn(`스탯 검증 실패: ${m}=${x}`)}}if(e.bondSpirits=u,e.activeSpirits=g,e.engravingData=b,e.userStats=h,e.baselineStats={},e.baselineKeyStats={tachaeTotal:0,statusEffectResistance:0,statusEffectAccuracy:0},e.savedSoulExp=0,e.baselineStatsHash=null,e.baselineSoulExpHash=null,e.lastTotalStatsHash=null,e.lastTotalStatsCalculation=null,e.lastSoulExpHash=null,e.lastSoulExpCalculation=null,e.isInitialLoad=!0,n.renderBondSlots&&(n.renderBondSlots("수호"),n.renderBondSlots("탑승"),n.renderBondSlots("변신")),n.renderActiveSpiritSelect&&(n.renderActiveSpiritSelect("수호"),n.renderActiveSpiritSelect("탑승"),n.renderActiveSpiritSelect("변신")),n.updateTotalStats){const v=n.updateTotalStats();v&&typeof v.then=="function"?v.then(()=>{const{allTotalStats:p}=Y(Z),S=m=>{const x=e.userStats[m]||0,T=p[m]||0;return Math.round(x+T)},I=Math.round(S("damageResistancePenetration")+S("damageResistance")+Math.round(Math.round(S("pvpDamagePercent"))*10)+Math.round(Math.round(S("pvpDefensePercent"))*10));e.baselineKeyStats.tachaeTotal=I,e.baselineKeyStats.statusEffectResistance=S("statusEffectResistance"),e.baselineKeyStats.statusEffectAccuracy=S("statusEffectAccuracy"),[...H].forEach(m=>{const x=e.userStats[m.key]||0,T=p[m.key]||0;e.baselineStats[m.key]=Math.round(x+T)}),e.isInitialLoad=!1,a(!0)}).catch(p=>{E.error("Error updating stats after import:",p),e.isInitialLoad=!1,a(!0)}):(e.isInitialLoad=!1,a(!0))}else e.isInitialLoad=!1,a(!0);n.updateSoulExp&&(e.lastSoulExpHash=null,e.lastSoulExpCalculation=null,n.updateSoulExp()),E.log("CSV import completed")}catch(l){alert(`CSV 가져오기 중 오류가 발생했습니다: ${l.message}`),i(l)}},r.onerror=()=>{const o=new Error("파일 읽기 실패");alert("파일을 읽을 수 없습니다."),i(o)},r.readAsText(t,"UTF-8")})}function et(t,n){const a=document.createElement("input");a.type="file",a.accept=t,a.style.display="none",a.addEventListener("change",i=>{const s=i.target.files[0];s&&n(s),document.body.removeChild(a)}),document.body.appendChild(a),a.click()}export{je as A,ke as B,_e as C,Ue as D,Oe as E,me as F,Pe as M,H as S,Je as a,qe as b,ze as c,Ke as d,_ as e,Xe as f,O as g,We as h,Ye as i,et as j,ve as k,re as l,Fe as m,ye as n,Ze as o,e as p,Qe as q,te as r,q as s,De as t,Ge as u,Re as v,Me as w,He as x,Ve as y,Be as z};
