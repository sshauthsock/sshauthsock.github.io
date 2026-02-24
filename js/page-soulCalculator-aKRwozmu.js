import{c as b}from"./components-K-_Tu490.js";import{b as u,f,h as v,i as y}from"./main-Db1MuKHz.js";import{E as o}from"./utils-C57Sp-PS.js";const a={expTable:null,currentType:"legend",currentLevel:0,targetLevel:1,souls:{high:0,mid:0,low:0}},l={};function x(){return`
    <div class="container soul-container">
      <div class="left card">
        <h3>환수 성장 경험치 테이블</h3>
        <div class="exp-type-tabs">
          <div class="exp-tab active" data-type="legend">전설</div>
          <div class="exp-tab" data-type="immortal">불멸</div>
        </div>
        <div class="tables-container">
          <div class="table-half">
            <table>
              <thead><tr><th>Lv</th><th>경험치</th></tr></thead>
              <tbody id="expTableLeft"></tbody>
            </table>
          </div>
          <div class="table-half">
            <table>
              <thead><tr><th>Lv</th><th>경험치</th></tr></thead>
              <tbody id="expTableRight"></tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="right card">
        <h2>환수혼 계산기</h2>
        <div class="calculator-form">
          <div class="input-row">
            <div class="input-group type-select">
              <label>종류:</label>
              <select id="expType" class="form-control">
                <option value="legend">전설</option>
                <option value="immortal">불멸</option>
              </select>
            </div>
            <div class="input-group">
              <label>현재:</label>
              <input type="number" id="currentLevel" min="0" max="24" value="0" class="form-control">
            </div>
            <div class="input-group">
              <label>목표:</label>
              <input type="number" id="targetLevel" min="1" max="25" value="1" class="form-control">
            </div>
          </div>
          <div class="soul-panel">
            <div class="soul-item">
              <img src="assets/img/high-soul.jpg" alt="최상급" loading="lazy">
              <label>최상급 (1000)</label>
              <input type="number" id="highSoul" min="0" value="0" class="form-control">
            </div>
            <div class="soul-item">
              <img src="assets/img/mid-soul.jpg" alt="상급 (100)" loading="lazy">
              <label>상급 (100)</label>
              <input type="number" id="midSoul" min="0" value="0" class="form-control">
            </div>
            <div class="soul-item">
              <img src="assets/img/low-soul.jpg" alt="하급 (10)" loading="lazy">
              <label>하급 (10)</label>
              <input type="number" id="lowSoul" min="0" value="0" class="form-control">
            </div>
          </div>
          <div class="calc-btn">
            <button id="calculateBtn" class="btn btn-primary">계산</button>
          </div>
        </div>
        <div class="results-panel hidden" id="resultsPanel">
        </div>
      </div>
    </div>
  `}function p(){if(!a.expTable||!l.expTableLeft||!l.expTableRight)return;const e=a.expTable[a.currentType];e&&(l.expTableLeft.innerHTML="",l.expTableRight.innerHTML="",e.forEach((s,t)=>{const i=b("tr","",{html:`<td>${t}</td><td>${s.toLocaleString()}</td>`});t<=13?l.expTableLeft.appendChild(i):l.expTableRight.appendChild(i)}),g())}function S(e){if(!e||!e.required||!e.maxLevelInfo){l.resultsPanel.innerHTML='<p class="error-message">잘못된 계산 결과입니다.</p>',l.resultsPanel.classList.remove("hidden");return}const{required:s,maxLevelInfo:t}=e,i={legend:"전설",immortal:"불멸"}[a.currentType]||"알 수 없음",c=L=>(Number(L)||0).toLocaleString(),h=T(s,i,c),m=w(t,i,c);l.resultsPanel.innerHTML=`
        <div class="result-column">
            ${h}
        </div>
        <div class="result-column">
            ${m}
        </div>
    `,l.resultsPanel.classList.remove("hidden")}function T(e,s,t){let i="";return!e.isSufficient&&e.needed?i=`
            <div class="sub-title">추가 필요 (최적 조합)</div>
            <div class="data-row"><span><img src="assets/img/high-soul.jpg" class="soul-icon" loading="lazy">최상급</span><span class="data-value">${t(e.needed.high)}개</span></div>
            <div class="data-row"><span><img src="assets/img/mid-soul.jpg" class="soul-icon" loading="lazy">상급</span><span class="data-value">${t(e.needed.mid)}개</span></div>
            <div class="data-row"><span><img src="assets/img/low-soul.jpg" class="soul-icon" loading="lazy">하급</span><span class="data-value">${t(e.needed.low)}개</span></div>
        `:i='<div class="sub-title sufficient">보유한 환수혼으로 충분합니다!</div>',`
        <div class="result-box">
            <div class="result-title required-title">필요 환수혼 <span class="type-badge">${s}</span></div>
            <div class="result-section">
                <div class="data-row">
                    <span>레벨 ${a.currentLevel} → ${a.targetLevel}</span>
                    <span class="data-value highlight">${t(e.exp)}exp</span>
                </div>
            </div>
            <div class="sub-title">총 필요 환수혼</div>
            <div class="data-row"><span><img src="assets/img/high-soul.jpg" class="soul-icon" loading="lazy">최상급</span><span class="data-value">${t(e.souls.high)}개</span></div>
            <div class="data-row"><span><img src="assets/img/mid-soul.jpg" class="soul-icon" loading="lazy">상급</span><span class="data-value">${t(e.souls.mid)}개</span></div>
            <div class="data-row"><span><img src="assets/img/low-soul.jpg" class="soul-icon" loading="lazy">하급</span><span class="data-value">${t(e.souls.low)}개</span></div>
            ${i}
        </div>
    `}function w(e,s,t){let i="";e.level<25&&e.nextLevelExp!==void 0&&e.nextLevelExp>0?i=`
            <div class="data-row"><span>다음 레벨 진행도</span><span class="data-value">${e.progressPercent||0}%</span></div>
            <div class="data-row"><span>남은 경험치</span><span class="data-value">${t(e.remainingExp)} / ${t(e.nextLevelExp)}</span></div>
        `:e.level===25&&(i='<div class="data-row"><span class="sufficient">최대 레벨 (25) 달성 완료!</span></div>');const c=e.isTargetReachable?`<span class="sufficient">목표 레벨 ${a.targetLevel} 달성 가능!</span>`:`<span class="insufficient">목표 레벨 ${a.targetLevel}까지 ${t(e.expShortage)} 경험치 부족</span>`;return`
        <div class="result-box">
            <div class="result-title max-title">도달 가능 레벨 <span class="type-badge">${s}</span></div>
            <div class="result-section">
                <div class="data-row"><span>보유 환수혼</span><span class="data-value highlight">${t(e.ownedExp)}exp</span></div>
            </div>
            <div class="result-section">
                <div class="data-row"><span>최대 도달 레벨</span><span class="data-value highlight">${e.level}</span></div>
                ${i}
            </div>
            <div class="result-section">${c}</div>
        </div>
    `}function g(){if(!l.container)return;const e=l.container.querySelectorAll("#expTableLeft tr, #expTableRight tr");e.forEach(i=>i.classList.remove("current-level","target-level"));const s=a.currentLevel,t=a.targetLevel;e[s]&&e[s].classList.add("current-level"),e[t]&&e[t].classList.add("target-level")}function d(e){a.currentType=e,l.expType.value=e,l.container.querySelectorAll(".exp-tab").forEach(s=>{s.classList.toggle("active",s.dataset.type===e)}),p(),l.resultsPanel.classList.add("hidden")}function r(){let e=parseInt(l.currentLevel.value,10),s=parseInt(l.targetLevel.value,10);(isNaN(e)||e<0)&&(e=0),e>24&&(e=24),(isNaN(s)||s<1)&&(s=1),s>25&&(s=25),s<=e&&(s=e+1,s>25&&(s=25)),l.currentLevel.value=e,l.targetLevel.value=s,a.currentLevel=e,a.targetLevel=s,g(),l.resultsPanel.classList.add("hidden")}async function n(){r(),a.souls={high:parseInt(l.highSoul.value,10)||0,mid:parseInt(l.midSoul.value,10)||0,low:parseInt(l.lowSoul.value,10)||0},u(l.resultsPanel,"계산 중...","환수혼 소모량을 계산하고 있습니다.");try{const e=await y({type:a.currentType,currentLevel:a.currentLevel,targetLevel:a.targetLevel,ownedSouls:a.souls});S(e)}catch(e){alert(`계산 오류: ${e.message}`),l.resultsPanel.classList.add("hidden")}finally{v()}}function E(){l.expType.addEventListener("change",e=>d(e.target.value)),l.container.querySelectorAll(".exp-tab").forEach(e=>{e.addEventListener("click",s=>{d(s.currentTarget.dataset.type)})}),l.currentLevel.addEventListener("change",r),l.targetLevel.addEventListener("change",r),l.highSoul.addEventListener("change",n),l.midSoul.addEventListener("change",n),l.lowSoul.addEventListener("change",n),l.calculateBtn.addEventListener("click",n)}async function R(e){e.innerHTML=x(),l.container=e,l.expTableLeft=e.querySelector("#expTableLeft"),l.expTableRight=e.querySelector("#expTableRight"),l.expType=e.querySelector("#expType"),l.currentLevel=e.querySelector("#currentLevel"),l.targetLevel=e.querySelector("#targetLevel"),l.highSoul=e.querySelector("#highSoul"),l.midSoul=e.querySelector("#midSoul"),l.lowSoul=e.querySelector("#lowSoul"),l.calculateBtn=e.querySelector("#calculateBtn"),l.resultsPanel=e.querySelector("#resultsPanel"),E(),u(e,"경험치 테이블 로딩 중...");try{a.expTable=await f(),p(),r()}catch(s){o.handle(s,"Soul exp table load"),e.innerHTML=`
      <div class="error-message" style="text-align: center; padding: 2rem;">
        <h3>${o.getUserFriendlyMessage(s.message)}</h3>
      </div>
    `}finally{v()}}function q(){return`
        <div class="content-block">
            <h2>환수혼 계산기 사용 안내</h2>
            <p>환수혼 계산기는 보유한 환수혼(최상급, 상급, 하급)을 기준으로 특정 환수 레벨까지 도달하는 데 필요한 경험치와 환수혼 개수를 계산해줍니다. 또한, 보유 환수혼으로 얼마나 레벨업 할 수 있는지도 알려드립니다.</p>

            <h3>🔎 페이지 기능 설명</h3>
            <ul>
                <li><strong>환수 성장 경험치 테이블:</strong> 좌측에서 전설/불멸 환수 종류별 레벨업에 필요한 총 경험치를 한눈에 확인할 수 있습니다. 현재 레벨과 목표 레벨에 해당하는 행은 색상으로 강조됩니다.</li>
                <li><strong>환수혼 종류:</strong> '전설' 또는 '불멸' 중 육성하려는 환수의 종류를 선택하세요.</li>
                <li><strong>현재 / 목표 레벨:</strong> 육성하려는 환수의 현재 레벨과 목표 레벨을 입력하세요. (현재 레벨은 0~24, 목표 레벨은 1~25)</li>
                <li><strong>보유 환수혼 개수:</strong> 현재 인벤토리에 보유 중인 '최상급', '상급', '하급' 환수혼 개수를 입력하세요. (최상급=1000exp, 상급=100exp, 하급=10exp)</li>
                <li><strong>계산 버튼:</strong> '계산' 버튼을 클릭하면 아래 두 가지 결과를 즉시 확인할 수 있습니다.
                    <ul>
                        <li><strong>필요 환수혼:</strong> 목표 레벨까지 도달하기 위한 총 필요 경험치와 이를 충족시키는 데 필요한 최적 환수혼 조합(최상급 우선 사용)을 보여줍니다. 보유 환수혼이 부족하다면, 추가로 필요한 환수혼 개수도 알려드립니다.</li>
                        <li><strong>도달 가능 레벨:</strong> 현재 보유한 환수혼으로 도달할 수 있는 최대 레벨과, 다음 레벨까지 남은 경험치 및 진행도를 상세하게 보여줍니다.</li>
                    </ul>
                </li>
            </ul>

            <h3>💡 환수혼 활용 팁</h3>
            <ul>
                <li><strong>환수혼 획득처:</strong> 환수 소환 시 중복 환수 분해, 영웅의 길 보상, 환수 던전, 비서: 환수 보물상자, 이벤트 등을 통해 환수혼을 획득할 수 있습니다.</li>
                <li><strong>효율적인 육성:</strong> 계산기를 통해 정확한 필요량을 파악하고, 불필요한 환수혼 낭비를 줄일 수 있습니다. 특정 레벨 구간에서는 하급/상급 혼으로 마무리하는 것이 더 효율적일 때도 있습니다.</li>
                <li><strong>최대 레벨 25의 중요성:</strong> 환수의 25레벨 장착 효과는 캐릭터에게 매우 강력한 시너지를 제공하므로, 주요 환수는 25레벨까지 육성하는 것을 권장합니다.</li>
            </ul>
        </div>
    `}function M(){l.expType&&l.expType.removeEventListener("change",d),l.container&&l.container.querySelectorAll(".exp-tab").forEach(e=>{e.removeEventListener("click",d)}),l.currentLevel&&l.currentLevel.removeEventListener("change",r),l.targetLevel&&l.targetLevel.removeEventListener("change",r),l.highSoul&&l.highSoul.removeEventListener("change",n),l.midSoul&&l.midSoul.removeEventListener("change",n),l.lowSoul&&l.lowSoul.removeEventListener("change",n),l.calculateBtn&&l.calculateBtn.removeEventListener("click",n)}export{M as cleanup,q as getHelpContentHTML,R as init};
