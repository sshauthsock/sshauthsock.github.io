const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["js/page-spiritInfo-D2c59i7j.js","js/components-BjOx5pFp.js","js/utils-JAo0VknW.js","js/page-bondCalculator-DZcRsMDE.js","js/page-spiritRanking-BRVlNDOY.js","js/page-soulCalculator-RPTh0660.js","js/page-chakCalculator-60JWuvSG.js","js/page-myInfo-BxgyDaqH.js","js/myInfo-common-BIt13A9w.js","js/myInfo-statCalculator-zVueTLpp.js","js/myInfo-spiritManager-4pmZfm_a.js","js/myInfo-engravingManager-DgI1Ifee.js","js/myInfo-statUI-DQ1sj9dL.js","js/myInfo-eventHandlers-ClTb1eXW.js"])))=>i.map(i=>d[i]);
import{S as x,c as W,g as G,L as p,t as v,b as w,E as P,i as J,d as K,e as Y,m as L,s as Z,f as U,h as C,j as Q,k as X}from"./utils-JAo0VknW.js";import{s as z}from"./components-BjOx5pFp.js";const tt="modulepreload",et=function(t){return"/"+t},O={},h=function(e,a,n){let i=Promise.resolve();if(a&&a.length>0){let f=function(d){return Promise.all(d.map(c=>Promise.resolve(c).then(g=>({status:"fulfilled",value:g}),g=>({status:"rejected",reason:g}))))};document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),r=s?.nonce||s?.getAttribute("nonce");i=f(a.map(d=>{if(d=et(d),d in O)return;O[d]=!0;const c=d.endsWith(".css"),g=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${g}`))return;const u=document.createElement("link");if(u.rel=c?"stylesheet":tt,c||(u.as="script"),u.crossOrigin="",u.href=d,r&&u.setAttribute("nonce",r),document.head.appendChild(u),c)return new Promise((_,S)=>{u.addEventListener("load",_),u.addEventListener("error",()=>S(new Error(`Unable to preload CSS for ${d}`)))})}))}function o(s){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=s,window.dispatchEvent(r),!r.defaultPrevented)throw s}return i.then(s=>{for(const r of s||[])r.status==="rejected"&&o(r.reason);return e().catch(o)})},k="https://bayeon-hwayeon-backend.onrender.com";async function E(t){if(!t.ok){const e=await t.json().catch(()=>({error:"서버 응답을 읽을 수 없습니다."})),a=t.status===404?`404: ${e.error||t.statusText||"리소스를 찾을 수 없습니다"}`:e.error||`서버 오류: ${t.statusText}`,n=new Error(a);throw P.handle(n,`API ${t.status}`),n}return t.json()}async function D(t,e,a=!1){const n=G(t),i=x.getStorage();W(t,i);const o=x.getItem(n);if(p.debug(`[Cache Debug] Checking cache for key: ${n}, Found: ${o?"YES":"NO"}, Length: ${o?o.length:0}`),o)try{return p.log(`[Cache HIT] Using cached data for key: ${n} (URL: ${e})`),JSON.parse(o)}catch{x.removeItem(n)}const s=performance.now(),r=await fetch(e),f=await E(r),d=performance.now()-s;v(e,d,!0);let c=f;t.startsWith("rankings_")?c=q(f,t):a&&Array.isArray(f)&&(c=w(f));const g=JSON.stringify(c),u=new Blob([g]).size;p.debug(`[Cache Debug] Attempting to save cache for key: ${n}, Data size: ${(u/1024).toFixed(2)}KB`);const _=x.setItem(n,g),S=x.getItem(n);return p.debug(`[Cache Debug] Save result: ${_?"SUCCESS":"FAILED"}, Verify: ${S?"FOUND":"NOT FOUND"}, Verify length: ${S?S.length:0}`),_?p.log(`[Cache SAVED] Successfully cached data for key: ${n} (URL: ${e}), Size: ${(u/1024).toFixed(2)}KB`):p.error(`[Cache FAILED] Failed to save cached data for ${n} (URL: ${e}). Data will not be cached. Size: ${(u/1024).toFixed(2)}KB`),c}function q(t,e){if(!t||!t.rankings)return t;const a=e.includes("_bond")?"bond":e.includes("_stat")?"stat":null;return a==="bond"?t.rankings=t.rankings.map(n=>{let i={...n};return Array.isArray(i.spirits)&&(i.spirits=w(i.spirits)),i.bindStat!==void 0&&i.bindStats===void 0&&(i.bindStats=i.bindStat),i}):a==="stat"&&(t.rankings=w(t.rankings)),t}async function nt(t,e){if(!J())return at(e,e);await K(t);const a=await Y(t);if(a)return L.set(e,a),a;const n=performance.now(),i=await fetch(e),o=await E(i),s=performance.now()-n;v(e,s,!0);let r=q(o,t);return await Z(t,r)&&L.set(e,r),r}async function at(t,e){const a=L.get(t);if(a)return a;const n=performance.now(),i=await fetch(e),o=await E(i),s=performance.now()-n;v(e,s,!0);let r=JSON.parse(JSON.stringify(o));if(t.includes("/api/rankings")&&Array.isArray(r.rankings)){const f=t.includes("type=bond")?"bond":t.includes("type=stat")?"stat":null;f==="bond"?r.rankings=r.rankings.map(d=>{let c=d;return Array.isArray(c.spirits)&&(c.spirits=w(c.spirits)),c.bindStat!==void 0&&c.bindStats===void 0&&(c.bindStats=c.bindStat),c}):f==="stat"&&(r.rankings=w(r.rankings))}return L.set(t,r),r}async function it(){return D("allSpiritsData",`${k}/api/alldata`,!0)}async function ut(t){const e=performance.now();try{const a=await fetch(`${k}/api/calculate/bond`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({creatures:t})}),n=await E(a),i=performance.now()-e;return v("/api/calculate/bond",i,!0),n&&Array.isArray(n.spirits)&&(n.spirits=w(n.spirits)),n}catch(a){const n=performance.now()-e;throw v("/api/calculate/bond",n,!1),P.handle(a,"calculateOptimalCombination"),a}}async function ft(t,e,a=""){let n=`${k}/api/rankings?category=${encodeURIComponent(t)}&type=${encodeURIComponent(e)}`;e==="stat"&&a&&(n+=`&statKey=${encodeURIComponent(a)}`);const i=`rankings_${t}_${e}${a?`_${a}`:""}`;return nt(i,n)}async function gt(){return D("soulExpTable",`${k}/api/soul/exp-table`)}async function mt(t){const e=performance.now();try{const a=await fetch(`${k}/api/calculate/soul`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}),n=await E(a),i=performance.now()-e;return v("/api/calculate/soul",i,!0),n}catch(a){const n=performance.now()-e;throw v("/api/calculate/soul",n,!1),P.handle(a,"calculateSoul"),a}}async function ht(){return D("chakData",`${k}/api/chak/data`)}const y={allSpirits:[],currentPageModule:null};function rt(t){y.allSpirits=t}const N="loading-indicator-style";let l=null;function F(){if(document.getElementById(N))return;const t=document.createElement("style");t.id=N,t.textContent=`
        .loading-overlay {
            position: absolute; /* Changed from fixed to absolute for #app-container */
            top: 0; left: 0; width: 100%; height: 100%;
            background-color: rgba(255, 255, 255, 0.8);
            display: flex; justify-content: center; align-items: center;
            z-index: 10000; backdrop-filter: blur(4px);
            opacity: 0; visibility: hidden; transition: opacity 0.3s, visibility 0.3s;
        }
        .loading-overlay.visible { opacity: 1; visibility: visible; }
        .loading-container {
            background-color: #ffffff; border-radius: 15px; padding: 30px;
            text-align: center; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            max-width: 400px; width: 90%;
        }
        .loading-spinner {
            border: 5px solid #e0e0e0; width: 60px; height: 60px;
            border-radius: 50%; border-top-color: #3498db;
            margin: 0 auto 20px; animation: spin 1.2s linear infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .loading-text { margin: 15px 0; color: #333; font-size: 20px; font-weight: bold; }
        .loading-subtext { color: #666; font-size: 14px; margin-bottom: 5px; }
        .loading-progress-container {
            margin-top: 20px;
            display: none;
        }
        .loading-progress-container.visible {
            display: block;
        }
        .loading-progress-bar {
            width: 100%; height: 8px; background-color: #e0e0e0;
            border-radius: 4px; overflow: hidden; margin-bottom: 8px;
        }
        .loading-progress-fill {
            height: 100%; background: linear-gradient(90deg, #3498db, #2ecc71);
            border-radius: 4px; transition: width 0.3s ease;
            width: 0%;
        }
        .loading-progress-text {
            color: #666; font-size: 12px; margin-top: 5px;
        }
        .skeleton {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: skeleton-loading 1.5s ease-in-out infinite;
            border-radius: 4px;
        }
        @keyframes skeleton-loading {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }
        .skeleton-text {
            height: 16px; margin-bottom: 8px;
        }
        .skeleton-title {
            height: 24px; width: 60%; margin-bottom: 16px;
        }
        .skeleton-card {
            height: 120px; margin-bottom: 16px;
        }
        .skeleton-image {
            width: 100px; height: 100px; border-radius: 8px;
        }
    `,document.head.appendChild(t)}function R(t,e="처리 중...",a="잠시만 기다려주세요."){t&&(l&&(l.remove(),l=null),F(),l=document.createElement("div"),l.className="loading-overlay",l.innerHTML=`
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">${e}</div>
            <div class="loading-subtext">${a}</div>
            <div class="loading-progress-container" id="loading-progress-container">
                <div class="loading-progress-bar">
                    <div class="loading-progress-fill" id="loading-progress-fill"></div>
                </div>
                <div class="loading-progress-text" id="loading-progress-text"></div>
            </div>
        </div>
    `,t.style.position="relative",t.appendChild(l),requestAnimationFrame(()=>{l?.classList.add("visible")}))}function yt(t,e="처리 중...",a="잠시만 기다려주세요.",n=0,i=""){if(R(t,e,a),l){const o=l.querySelector("#loading-progress-container"),s=l.querySelector("#loading-progress-fill"),r=l.querySelector("#loading-progress-text");o&&s&&r&&(o.classList.add("visible"),s.style.width=`${Math.min(100,Math.max(0,n))}%`,i?r.textContent=i:r.textContent=`${Math.round(n)}%`)}}function bt(t,e=""){if(!l)return;const a=l.querySelector("#loading-progress-fill"),n=l.querySelector("#loading-progress-text");a&&(a.style.width=`${Math.min(100,Math.max(0,t))}%`),n&&(e?n.textContent=e:n.textContent=`${Math.round(t)}%`)}function V(){l&&(l.classList.remove("visible"),setTimeout(()=>{l&&(l.remove(),l=null)},300))}function ot(t="text",e={}){F();const a=document.createElement("div");return a.className=`skeleton skeleton-${t}`,e.width&&(a.style.width=typeof e.width=="number"?`${e.width}px`:e.width),e.height&&(a.style.height=typeof e.height=="number"?`${e.height}px`:e.height),e.className&&(a.className+=` ${e.className}`),a}function vt(t,e="text",a={}){return Array.from({length:t},()=>ot(e,a))}const st={spiritInfo:()=>h(()=>import("./page-spiritInfo-D2c59i7j.js").then(t=>t.a),__vite__mapDeps([0,1,2])),bondCalculator:()=>h(()=>import("./page-bondCalculator-DZcRsMDE.js").then(t=>t.b),__vite__mapDeps([3,1,2])),spiritRanking:()=>h(()=>import("./page-spiritRanking-BRVlNDOY.js"),__vite__mapDeps([4,1,2,0,3])),soulCalculator:()=>h(()=>import("./page-soulCalculator-RPTh0660.js"),__vite__mapDeps([5,1,2])),chakCalculator:()=>h(()=>import("./page-chakCalculator-60JWuvSG.js"),__vite__mapDeps([6,1,2])),myInfo:()=>h(()=>import("./page-myInfo-BxgyDaqH.js"),__vite__mapDeps([7,1,2,8,9,10,11,12,13]))},b=document.getElementById("app-container"),T=document.getElementById("mainTabs"),A=document.getElementById("helpBtn"),m=document.getElementById("helpTooltip"),B=document.getElementById("closeHelp"),I=document.getElementById("currentHelpTitle"),$=document.getElementById("pageSpecificHelpContent");A&&m&&B&&I&&$&&(A.addEventListener("click",t=>{t.stopPropagation(),m.style.display=m.style.display==="block"?"none":"block",document.body.style.overflow=m.style.display==="block"?"hidden":"auto"}),B.addEventListener("click",t=>{t.stopPropagation(),m.style.display="none",document.body.style.overflow="auto"}),document.addEventListener("click",t=>{!A.contains(t.target)&&!m.contains(t.target)&&m.style.display==="block"&&(m.style.display="none",document.body.style.overflow="auto")}));async function M(){const t=T.querySelector(".tab.active"),e=t?t.dataset.page:"spiritInfo",a=t?t.textContent:"환수 정보";if(y.currentPageModule?.cleanup)try{y.currentPageModule.cleanup(),p.log("[Router] Cleaned up previous page.")}catch{}b.innerHTML="",R(b,"페이지 로딩 중...","필요한 모듈을 불러오고 있습니다...");try{const n=st[e];if(!n)throw new Error(`'${e}' 페이지를 찾을 수 없습니다.`);const i=await n();if(y.currentPageModule=i,i.init){if((!Array.isArray(y.allSpirits)||y.allSpirits.length===0)&&p.warn("Global spirits data is empty or not an array when routing. This might cause errors on pages depending on it."),await i.init(b),p.log(`[Router] Initialized page: ${e}`),I&&$?(I.textContent=`${a} 도움말`,i.getHelpContentHTML?$.innerHTML=i.getHelpContentHTML():$.innerHTML='<div class="content-block"><p class="text-center text-light mt-md">이 페이지에 대한 특정 도움말은 없습니다.</p></div>'):p.error("Help tooltip specific content elements not found for update within route()."),typeof gtag=="function"){const o=`/bayeon-hwayeon/${e}`;document.title=`바연화연 | ${a}`,gtag("event","page_view",{page_title:a,page_path:o}),p.log(`[GA4] Page view event sent for: ${o}`);const s=performance.now();setTimeout(()=>{const r=performance.now()-s;U(e,r)},100)}}else p.warn(`Page module '${e}' does not have an init() function.`),b.innerHTML='<p class="error-message">페이지를 초기화할 수 없습니다. (init 함수 없음)</p>'}catch(n){C.handleError(n,{type:"page_routing",pageName:e}),z(b,n,{title:"페이지 로드 실패",onRetry:()=>{M()}})}finally{V()}}const H=document.querySelector(".footer-report-btn");H&&typeof gtag=="function"&&H.addEventListener("click",()=>{gtag("event","interaction",{event_category:"footer_action",event_label:"Report Button Click",event_action:"Click",link_url:"https://open.kakao.com/o/gZdiGDsh",page_location:window.location.href,page_title:document.title})});T.addEventListener("click",t=>{t.target.matches(".tab")&&!t.target.classList.contains("active")&&(T.querySelector(".tab.active")?.classList.remove("active"),t.target.classList.add("active"),M())});function ct(){document.addEventListener("error",function(t){if(t.target.tagName==="IMG"&&t.target.src){const e=t.target;if(e.dataset.fallbackAttempted==="true"||!e.src.endsWith(".webp"))return;const a=e.src.replace(/\.webp$/i,".jpg");e.dataset.fallbackAttempted="true",e.src=a}},!0),document.body&&new MutationObserver(function(e){e.forEach(function(a){a.addedNodes.forEach(function(n){if(n.nodeType===1){n.tagName==="IMG"&&n.src&&n.src.endsWith(".webp")&&n.addEventListener("error",function(){if(this.dataset.fallbackAttempted!=="true"){const o=this.src.replace(/\.webp$/i,".jpg");this.dataset.fallbackAttempted="true",this.src=o}},{once:!0});const i=n.querySelectorAll&&n.querySelectorAll('img[src$=".webp"]');i&&i.forEach(function(o){o.dataset.fallbackHandlerAdded!=="true"&&(o.addEventListener("error",function(){if(this.dataset.fallbackAttempted!=="true"){const s=this.src.replace(/\.webp$/i,".jpg");this.dataset.fallbackAttempted="true",this.src=s}},{once:!0}),o.dataset.fallbackHandlerAdded="true")})}})})}).observe(document.body,{childList:!0,subtree:!0})}async function lt(){C.init(),Q(),X(),ct();const t=performance.now();R(b,"초기 데이터 로딩 중","서버에서 환수 정보를 불러오고 있습니다...");try{const e=await it(),{transformSpiritsArrayPaths:a}=await h(async()=>{const{transformSpiritsArrayPaths:o}=await import("./utils-JAo0VknW.js").then(s=>s.o);return{transformSpiritsArrayPaths:o}},__vite__mapDeps([2,1])),n=a(e);rt(n),p.log("Global state (allSpirits) updated:",y.allSpirits),await M();const i=performance.now()-t;U("app_initialization",i)}catch(e){C.handleError(e,{type:"app_initialization"}),z(b,e,{title:"애플리케이션 초기화 실패",onRetry:()=>{window.location.reload()}})}finally{V()}}lt();export{yt as a,R as b,ut as c,ht as d,mt as e,gt as f,ft as g,V as h,vt as i,y as s,bt as u};
