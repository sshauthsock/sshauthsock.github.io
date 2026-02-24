import{B,e as L,g as x}from"./main-Db1MuKHz.js";import{E as R}from"./utils-C57Sp-PS.js";import"./components-K-_Tu490.js";const c={},A={server:"서버",server_name:"서버",character_name:"캐릭터명",character_date_create:"캐릭터 생성일",character_class_group_name:"직업 계열",character_class_name:"직업",character_nation:"국가",character_gender:"성별",character_exp:"경험치",character_level:"레벨",ocid:"캐릭터 식별자",level:"레벨",job_name:"직업",guild_name:"길드명",date:"날짜",world_name:"월드",exp:"경험치",popularity:"인기도",nickname:"닉네임",name:"이름"};function C(e){if(typeof e!="string"||!e)return e;const r=e.includes(".")?e.split(".").pop():e;return A[r]??e}function I(e){if(e==null||e==="")return"-";const r=String(e).trim(),t=r.match(/^(\d{4})-(\d{2})-(\d{2})/);if(t){const s=t[1],n=parseInt(t[2],10),a=parseInt(t[3],10);return`${s}년 ${n}월 ${a}일`}return r}function M(e){if(e==null||e==="")return"-";const r=Number(e);return Number.isNaN(r)?String(e):r.toLocaleString("ko-KR")}function O(e,r){if(r==null||r==="-")return r;const t=e.includes(".")?e.split(".").pop():e,s=/date|create|_at$/i.test(t),n=/exp|character_exp/i.test(t),a=/level|character_level/i.test(t);return s?I(r):n||a?M(r):r}function P(e){if(e==null||typeof e=="string"||typeof e!="object")return e;try{return JSON.parse(JSON.stringify(e))}catch{return e}}function i(e){return e==null?"-":typeof e=="string"?e:typeof e=="object"?JSON.stringify(e):String(e)}function b(e,r=""){if(e==null)return[];if(typeof e!="object")return[[i(r),i(e)]];const t=[];return Object.keys(e).forEach(n=>{const a=r?`${r}.${n}`:n,l=e[n];l!==null&&typeof l=="object"&&!Array.isArray(l)?t.push(...b(l,a)):Array.isArray(l)?t.push([i(a),JSON.stringify(l)]):t.push([i(a),i(l)])}),t}function H(){return`
    <div class="character-search-page">
      <section class="char-search-section card char-search-card">
        <h2 class="char-search-title">수행자 검색</h2>
        <p class="char-search-desc">캐릭터명을 입력하면 모든 서버를 조회한 뒤, 레벨·경험치가 가장 높은 서버의 정보만 표시합니다.</p>
        <div class="char-search-form">
          <input type="text" id="characterNameInput" class="char-search-input" placeholder="캐릭터 이름 입력" maxlength="12" autocomplete="off" />
          <button type="button" id="characterSearchBtn" class="btn btn-primary char-search-btn">검색</button>
        </div>
        <div id="characterSearchMessage" class="char-search-message" aria-live="polite"></div>
      </section>
      <section id="characterResultSection" class="char-result-section card">
        <div class="char-result-header">
          <h2 class="char-result-title">검색 결과</h2>
        </div>
        <div id="characterResultBody" class="char-result-body">
          <p class="char-result-empty">캐릭터명을 입력한 뒤 검색하면 결과가 여기에 표시됩니다.</p>
        </div>
        <details class="char-result-raw-wrap">
          <summary class="char-result-raw-summary">원본 JSON 보기</summary>
          <pre id="characterResultRaw" class="char-result-raw"></pre>
        </details>
      </section>
    </div>
  `}function m(e,r=!1){const t=c.message;t&&(t.textContent=e==null?"":i(e),t.className="char-search-message"+(r?" char-search-message--error":""))}function f(e,r=!1){const t=c.resultBody,s=c.resultRaw;if(!t)return;t.innerHTML="";const n=document.createElement("p");n.className="char-result-empty"+(r?" char-result-empty--error":""),n.textContent=e==null?"":i(e),t.appendChild(n),s&&(s.textContent="")}function T(e){const r=c.resultSection,t=c.resultBody,s=c.resultRaw;if(!(!r||!t))try{const n=P(e),a=typeof n=="object"&&n!==null?JSON.stringify(n,null,2):i(n),l=a==="[object Object]"||typeof a=="string"&&a.trim()==="",u=l?"응답을 표시할 수 없습니다. (잘못된 응답 형식)":a;s&&(s.textContent=u);const d=Array.isArray(n)?n.flatMap((o,h)=>b(o,`[${h}]`)):b(n);if(t.innerHTML="",d.length===0&&!l)t.innerHTML='<p class="char-result-empty">표시할 항목이 없습니다.</p>';else if(l){const o=document.createElement("p");o.className="char-result-empty",o.textContent=u,t.appendChild(o)}else{const o=document.createElement("ul");o.className="char-result-list",d.forEach(h=>{const _=typeof h[0]=="string"?h[0]:i(h[0]),N=C(_),v=typeof h[1]=="string"?h[1]:i(h[1]),S=O(_,v),p=document.createElement("li");p.className="char-result-row";const y=document.createElement("span");y.className="char-result-label",y.textContent=N;const g=document.createElement("span");g.className="char-result-value",g.textContent=S,p.appendChild(y),p.appendChild(g),o.appendChild(p)}),t.appendChild(o)}}catch{f("결과 표시 중 오류가 났습니다.",!0)}}function $(e){if(!Array.isArray(e)||e.length===0)return null;const r=t=>t==null?0:Number(t);return e.reduce((t,s)=>{const n=r(s.character_level),a=r(s.character_exp),l=r(t.character_level),u=r(t.character_exp);return n>l||n===l&&a>u?s:t})}function q(e){return new Promise(r=>setTimeout(r,e))}async function E(){if(c.searchInProgress)return;const r=(c.nameInput?.value??"").trim().slice(0,12);if(!r){m("캐릭터 이름을 입력하세요.",!0),f("캐릭터 이름을 입력하세요.",!0);return}c.searchInProgress=!0,c.searchBtn&&(c.searchBtn.disabled=!0),m("모든 서버 조회 중..."),f("모든 서버를 조회 중입니다.",!1);try{const t=[],s=B;for(let a=0;a<s.length;a++){const l=s[a];try{const u=await L(r,l),d=u?.ocid??(typeof u=="string"?u:null);if(!d)continue;const o=await x({ocid:d});o&&typeof o=="object"&&t.push(o)}catch{}a<s.length-1&&await q(250)}const n=$(t);if(m(""),!n){f("조회 결과가 없습니다. 해당 캐릭터가 어떤 서버에도 없거나, 일시적인 오류일 수 있습니다.",!1);return}T(n)}catch(t){const s=t?.message||"검색에 실패했습니다.";m(s,!0),f(s,!0),R.handle(t,"characterSearch")}finally{c.searchInProgress=!1,c.searchBtn&&(c.searchBtn.disabled=!1)}}function w(e){e.key==="Enter"&&E()}function J(){c.searchBtn?.addEventListener("click",E),c.nameInput?.addEventListener("keydown",w)}function K(){c.searchBtn?.removeEventListener("click",E),c.nameInput?.removeEventListener("keydown",w)}function F(e){e.innerHTML=H(),c.nameInput=e.querySelector("#characterNameInput"),c.searchBtn=e.querySelector("#characterSearchBtn"),c.message=e.querySelector("#characterSearchMessage"),c.resultSection=e.querySelector("#characterResultSection"),c.resultBody=e.querySelector("#characterResultBody"),c.resultRaw=e.querySelector("#characterResultRaw"),J()}function k(){return`
    <div class="content-block">
      <h2>수행자 검색 사용 안내</h2>
      <p>넥슨 오픈 API(<code>GET /baramy/v1/character/basic</code>)를 사용해 바람의나라: 연 캐릭터 기본 정보를 조회합니다.</p>
      <h3>사용 방법</h3>
      <ul>
        <li>캐릭터 이름을 입력한 뒤 검색 버튼을 누르거나 Enter를 치세요.</li>
        <li>넥슨 API 키는 <strong>백엔드 서버</strong> 환경 변수 <code>NEXON_OPEN_API_KEY</code>로 설정해야 합니다.</li>
      </ul>
    </div>
  `}function z(){K()}export{z as cleanup,k as getHelpContentHTML,F as init};
