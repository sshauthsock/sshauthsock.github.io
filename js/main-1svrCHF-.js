const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["js/page-spiritInfo-BB849n9U.js","js/components-D5VgX-mO.js","js/utils-CDZab3B1.js","js/page-bondCalculator-DewSlsKv.js","js/page-spiritRanking-Bx5CMU_Z.js","js/page-soulCalculator-BlLjr7V9.js","js/page-chakCalculator-9DTQRrew.js"])))=>i.map(i=>d[i]);
import{S as C,L as c,t as m,b as S,E,m as R,c as B,e as T,i as J}from"./utils-CDZab3B1.js";import{s as N}from"./components-D5VgX-mO.js";const F="modulepreload",G=function(e){return"/"+e},M={},v=function(t,n,o){let r=Promise.resolve();if(n&&n.length>0){let u=function(p){return Promise.all(p.map(l=>Promise.resolve(l).then(h=>({status:"fulfilled",value:h}),h=>({status:"rejected",reason:h}))))};document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),a=s?.nonce||s?.getAttribute("nonce");r=u(n.map(p=>{if(p=G(p),p in M)return;M[p]=!0;const l=p.endsWith(".css"),h=l?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${p}"]${h}`))return;const g=document.createElement("link");if(g.rel=l?"stylesheet":F,l||(g.as="script"),g.crossOrigin="",g.href=p,a&&g.setAttribute("nonce",a),document.head.appendChild(g),l)return new Promise((j,U)=>{g.addEventListener("load",j),g.addEventListener("error",()=>U(new Error(`Unable to preload CSS for ${p}`)))})}))}function d(s){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=s,window.dispatchEvent(a),!a.defaultPrevented)throw s}return r.then(s=>{for(const a of s||[])a.status==="rejected"&&d(a.reason);return t().catch(d)})},w="https://wind-app-backend-y7qnnpfkrq-du.a.run.app";async function x(e){if(!e.ok){const t=await e.json().catch(()=>({error:"서버 응답을 읽을 수 없습니다."})),n=new Error(t.error||`서버 오류: ${e.statusText}`);throw E.handle(n,`API ${e.status}`),n}return e.json()}async function P(e,t,n=!1){const o=C.getItem(e);if(o)try{return c.log(`[Cache] Using sessionStorage cached data for key: ${e}`),JSON.parse(o)}catch(h){c.error(`[Cache Error] Failed to parse sessionStorage data for ${e}, fetching fresh.`,h),C.removeItem(e)}const r=performance.now(),d=await fetch(t),s=await x(d),a=performance.now()-r;m(t,a,!0);let u=s;n&&Array.isArray(s)&&(u=S(s));const p=JSON.stringify(u);return C.setItem(e,p)||c.warn(`[Cache] Failed to save to sessionStorage for ${e}. Data will not be cached.`),u}async function V(e,t){const n=R.get(e);if(n)return c.log(`[Cache] Using memory cached data for key: ${e}`),n;const o=performance.now(),r=await fetch(t),d=await x(r),s=performance.now()-o;m(t,s,!0);let a=JSON.parse(JSON.stringify(d));if(e.includes("/api/rankings")&&Array.isArray(a.rankings)){const u=e.includes("type=bond")?"bond":e.includes("type=stat")?"stat":null;u==="bond"?a.rankings=a.rankings.map(p=>{let l=p;return Array.isArray(l.spirits)&&(l.spirits=S(l.spirits)),l.bindStat!==void 0&&l.bindStats===void 0&&(l.bindStats=l.bindStat),l}):u==="stat"&&(a.rankings=S(a.rankings))}return R.set(e,a),a}async function W(){return P("allSpiritsData",`${w}/api/alldata`,!0)}async function te(e){const t=performance.now();try{const n=await fetch(`${w}/api/calculate/bond`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({creatures:e})}),o=await x(n),r=performance.now()-t;return m("/api/calculate/bond",r,!0),o&&Array.isArray(o.spirits)&&(o.spirits=S(o.spirits)),o}catch(n){const o=performance.now()-t;throw m("/api/calculate/bond",o,!1),E.handle(n,"calculateOptimalCombination"),n}}async function ne(e,t,n=""){let o=`${w}/api/rankings?category=${encodeURIComponent(e)}&type=${encodeURIComponent(t)}`;return t==="stat"&&n&&(o+=`&statKey=${encodeURIComponent(n)}`),V(o,o)}async function oe(){return P("soulExpTable",`${w}/api/soul/exp-table`)}async function ae(e){const t=performance.now();try{const n=await fetch(`${w}/api/calculate/soul`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}),o=await x(n),r=performance.now()-t;return m("/api/calculate/soul",r,!0),o}catch(n){const o=performance.now()-t;throw m("/api/calculate/soul",o,!1),E.handle(n,"calculateSoul"),n}}async function re(){return P("chakData",`${w}/api/chak/data`)}async function ie(e){const t=performance.now();try{const n=await fetch(`${w}/api/calculate/chak`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}),o=await x(n),r=performance.now()-t;return m("/api/calculate/chak",r,!0),o}catch(n){const o=performance.now()-t;throw m("/api/calculate/chak",o,!1),E.handle(n,"calculateChak"),n}}const y={allSpirits:[],currentPageModule:null};function Z(e){y.allSpirits=e}const O="loading-indicator-style";let i=null;function q(){if(document.getElementById(O))return;const e=document.createElement("style");e.id=O,e.textContent=`
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
    `,document.head.appendChild(e)}function A(e,t="처리 중...",n="잠시만 기다려주세요."){if(!e){console.warn("Loading indicator container not provided.");return}i&&(i.remove(),i=null),q(),i=document.createElement("div"),i.className="loading-overlay",i.innerHTML=`
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">${t}</div>
            <div class="loading-subtext">${n}</div>
            <div class="loading-progress-container" id="loading-progress-container">
                <div class="loading-progress-bar">
                    <div class="loading-progress-fill" id="loading-progress-fill"></div>
                </div>
                <div class="loading-progress-text" id="loading-progress-text"></div>
            </div>
        </div>
    `,e.style.position="relative",e.appendChild(i),requestAnimationFrame(()=>{i?.classList.add("visible")})}function se(e,t="처리 중...",n="잠시만 기다려주세요.",o=0,r=""){if(A(e,t,n),i){const d=i.querySelector("#loading-progress-container"),s=i.querySelector("#loading-progress-fill"),a=i.querySelector("#loading-progress-text");d&&s&&a&&(d.classList.add("visible"),s.style.width=`${Math.min(100,Math.max(0,o))}%`,r?a.textContent=r:a.textContent=`${Math.round(o)}%`)}}function le(e,t=""){if(!i)return;const n=i.querySelector("#loading-progress-fill"),o=i.querySelector("#loading-progress-text");n&&(n.style.width=`${Math.min(100,Math.max(0,e))}%`),o&&(t?o.textContent=t:o.textContent=`${Math.round(e)}%`)}function z(){i&&(i.classList.remove("visible"),setTimeout(()=>{i&&(i.remove(),i=null)},300))}function K(e="text",t={}){q();const n=document.createElement("div");return n.className=`skeleton skeleton-${e}`,t.width&&(n.style.width=typeof t.width=="number"?`${t.width}px`:t.width),t.height&&(n.style.height=typeof t.height=="number"?`${t.height}px`:t.height),t.className&&(n.className+=` ${t.className}`),n}function ce(e,t="text",n={}){return Array.from({length:e},()=>K(t,n))}const Q={spiritInfo:()=>v(()=>import("./page-spiritInfo-BB849n9U.js").then(e=>e.a),__vite__mapDeps([0,1,2])),bondCalculator:()=>v(()=>import("./page-bondCalculator-DewSlsKv.js").then(e=>e.b),__vite__mapDeps([3,1,2])),spiritRanking:()=>v(()=>import("./page-spiritRanking-Bx5CMU_Z.js"),__vite__mapDeps([4,1,2,0,3])),soulCalculator:()=>v(()=>import("./page-soulCalculator-BlLjr7V9.js"),__vite__mapDeps([5,1,2])),chakCalculator:()=>v(()=>import("./page-chakCalculator-9DTQRrew.js"),__vite__mapDeps([6,1,2]))},b=document.getElementById("app-container"),L=document.getElementById("mainTabs"),_=document.getElementById("helpBtn"),f=document.getElementById("helpTooltip"),D=document.getElementById("closeHelp"),$=document.getElementById("currentHelpTitle"),k=document.getElementById("pageSpecificHelpContent");_&&f&&D&&$&&k?(_.addEventListener("click",e=>{e.stopPropagation(),f.style.display=f.style.display==="block"?"none":"block",document.body.style.overflow=f.style.display==="block"?"hidden":"auto"}),D.addEventListener("click",e=>{e.stopPropagation(),f.style.display="none",document.body.style.overflow="auto"}),document.addEventListener("click",e=>{!_.contains(e.target)&&!f.contains(e.target)&&f.style.display==="block"&&(f.style.display="none",document.body.style.overflow="auto")})):c.error("Help button or related tooltip elements not found in DOM for initialization.");async function I(){const e=L.querySelector(".tab.active"),t=e?e.dataset.page:"spiritInfo",n=e?e.textContent:"환수 정보";if(y.currentPageModule?.cleanup)try{y.currentPageModule.cleanup(),c.log("[Router] Cleaned up previous page.")}catch(o){c.error("[Router] Error during page cleanup:",o)}b.innerHTML="",A(b,"페이지 로딩 중...","필요한 모듈을 불러오고 있습니다...");try{const o=Q[t];if(!o)throw new Error(`'${t}' 페이지를 찾을 수 없습니다.`);const r=await o();if(y.currentPageModule=r,r.init){if((!Array.isArray(y.allSpirits)||y.allSpirits.length===0)&&c.warn("Global spirits data is empty or not an array when routing. This might cause errors on pages depending on it."),await r.init(b),c.log(`[Router] Initialized page: ${t}`),$&&k?($.textContent=`${n} 도움말`,r.getHelpContentHTML?k.innerHTML=r.getHelpContentHTML():k.innerHTML='<div class="content-block"><p class="text-center text-light mt-md">이 페이지에 대한 특정 도움말은 없습니다.</p></div>'):c.error("Help tooltip specific content elements not found for update within route()."),typeof gtag=="function"){const d=`/bayeon-hwayeon/${t}`;document.title=`바연화연 | ${n}`,gtag("event","page_view",{page_title:n,page_path:d}),c.log(`[GA4] Page view event sent for: ${d}`);const s=performance.now();setTimeout(()=>{const a=performance.now()-s;B(t,a)},100)}}else c.warn(`Page module '${t}' does not have an init() function.`),b.innerHTML='<p class="error-message">페이지를 초기화할 수 없습니다. (init 함수 없음)</p>'}catch(o){c.error(`[Router] Failed to load or initialize page '${t}':`,o),T.handleError(o,{type:"page_routing",pageName:t}),N(b,o,{title:"페이지 로드 실패",onRetry:()=>{I()}})}finally{z()}}const H=document.querySelector(".footer-report-btn");H&&typeof gtag=="function"&&H.addEventListener("click",()=>{gtag("event","interaction",{event_category:"footer_action",event_label:"Report Button Click",event_action:"Click",link_url:"https://open.kakao.com/o/gZdiGDsh",page_location:window.location.href,page_title:document.title}),c.log("GA4: Report button click event sent.")});L.addEventListener("click",e=>{e.target.matches(".tab")&&!e.target.classList.contains("active")&&(L.querySelector(".tab.active")?.classList.remove("active"),e.target.classList.add("active"),I())});async function X(){T.init(),J();const e=performance.now();A(b,"초기 데이터 로딩 중","서버에서 환수 정보를 불러오고 있습니다...");try{const n=(await W()).map(r=>{const d=r.image.replace(/^images\//,"assets/img/");return{...r,image:d}});Z(n),c.log("Global state (allSpirits) updated:",y.allSpirits),await I();const o=performance.now()-e;B("app_initialization",o)}catch(t){c.error("애플리케이션 초기화 실패:",t),T.handleError(t,{type:"app_initialization"}),N(b,t,{title:"애플리케이션 초기화 실패",onRetry:()=>{window.location.reload()}})}finally{z()}}X();export{se as a,A as b,te as c,ie as d,oe as e,re as f,ae as g,z as h,ne as i,ce as j,y as s,le as u};
