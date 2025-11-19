class x{static handle(e,r=""){const n={message:e.message||"알 수 없는 오류가 발생했습니다.",context:r,timestamp:new Date().toISOString()};return typeof gtag=="function"&&gtag("event","exception",{description:n.message,fatal:!1}),n}static showUserFriendlyMessage(e,r){const n=this.handle(e),a=this.getUserFriendlyMessage(n.message);r&&(r.innerHTML=`
        <div class="error-message">
          <h3>오류가 발생했습니다</h3>
          <p>${a}</p>
          <button onclick="location.reload()">새로고침</button>
        </div>
      `)}static getUserFriendlyMessage(e){const r=["Failed to fetch","NetworkError","Network request failed","ERR_INTERNET_DISCONNECTED","ERR_NETWORK_CHANGED","ERR_CONNECTION_REFUSED","ERR_CONNECTION_TIMED_OUT","ERR_CONNECTION_RESET","Failed to fetch dynamically imported module","dynamically imported module"];for(const n of r)if(e.includes(n))return"현재 서버 점검중 입니다.";return e.includes("timeout")?"요청 시간이 초과되었습니다. 다시 시도해주세요.":"일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}}class I{constructor(e=50){this.cache=new Map,this.maxSize=e}get(e){if(this.cache.has(e)){const r=this.cache.get(e);return this.cache.delete(e),this.cache.set(e,r),r}return null}set(e,r){if(this.cache.has(e))this.cache.delete(e);else if(this.cache.size>=this.maxSize){const n=this.cache.keys().next().value;this.cache.delete(n)}this.cache.set(e,r)}delete(e){return this.cache.delete(e)}clear(){this.cache.clear()}size(){return this.cache.size}has(e){return this.cache.has(e)}}const W=new I(50);class o{static isDev(){return!1}static log(...e){this.isDev()&&console.log(...e)}static error(...e){console.error(...e)}static warn(...e){this.isDev()&&console.warn(...e)}static info(...e){this.isDev()&&console.info(...e)}static debug(...e){this.isDev()&&console.debug(...e)}static group(...e){this.isDev()&&console.group(...e)}static groupEnd(){this.isDev()&&console.groupEnd()}static logIf(e,...r){this.isDev()&&e&&console.log(...r)}}class P{static getStorage(){return this.isLocalStorageAvailable()?localStorage:(o.warn("[Storage] localStorage not available, using sessionStorage as fallback"),sessionStorage)}static isLocalStorageAvailable(){try{const e="__localStorage_test__";return localStorage.setItem(e,e),localStorage.removeItem(e),!0}catch{return!1}}static getMaxSize(){return 5*1024*1024}static getUsedSize(){const e=this.getStorage();let r=0;for(let n in e)e.hasOwnProperty(n)&&(r+=e[n].length+n.length);return r}static canStore(e){return this.getUsedSize()+e<this.getMaxSize()}static setItem(e,r){const n=this.getStorage(),a=new Blob([r]).size;if(!this.canStore(a))for(o.warn(`[Storage] Storage nearly full (${(this.getUsedSize()/1024/1024).toFixed(2)}MB used). Clearing oldest items...`);!this.canStore(a)&&n.length>0;)this.clearOldest();try{return n.setItem(e,r),!0}catch(s){if(o.error(`[Storage] Failed to store ${e}:`,s),n.length>0){this.clearOldest();try{return n.setItem(e,r),!0}catch(i){return o.error(`[Storage] Retry failed for ${e}:`,i),!1}}return!1}}static clearOldest(){const e=this.getStorage();if(e.length===0)return;const r=e.key(0);r&&(e.removeItem(r),o.log(`[Storage] Removed oldest item: ${r}`))}static getItem(e){return this.getStorage().getItem(e)}static removeItem(e){this.getStorage().removeItem(e)}static clear(){this.getStorage().clear()}static getItemCount(){return this.getStorage().length}static getUsageRatio(){return this.getUsedSize()/this.getMaxSize()}}const p=new Map;function b(t){if(!t||typeof t!="string")return t;if(p.has(t))return p.get(t);const e=t.replace(/^images\//,"assets/img/");return p.set(t,e),e}function S(t){return!t||typeof t.image!="string"?t:{...t,image:b(t.image)}}function k(t){return Array.isArray(t)?t.map(S):t}const L=Object.freeze(Object.defineProperty({__proto__:null,transformImagePath:b,transformSpiritImagePath:S,transformSpiritsArrayPaths:k},Symbol.toStringTag,{value:"Module"}));function z(t,e,r=!0){typeof gtag=="function"&&gtag("event","api_performance",{event_category:"API",event_label:t,value:Math.round(e),success:r,api_endpoint:t,response_time_ms:Math.round(e)})}function U(t,e,r={}){typeof gtag=="function"&&gtag("event","calculation_performance",{event_category:"Calculation",event_label:t,value:Math.round(e),calculation_type:t,duration_ms:Math.round(e),...r})}function A(t,e,r={}){typeof gtag=="function"&&gtag("event","user_action",{event_category:e,event_label:t,action:t,category:e,...r})}function j(t,e){typeof gtag=="function"&&gtag("event","page_load_performance",{event_category:"Page Load",event_label:t,value:Math.round(e),page_name:t,load_time_ms:Math.round(e)})}function D(){if(typeof gtag=="function"){if("PerformanceObserver"in window){try{new PerformanceObserver(e=>{const r=e.getEntries(),n=r[r.length-1];gtag("event","web_vitals",{event_category:"Web Vitals",event_label:"LCP",value:Math.round(n.renderTime||n.loadTime),metric_name:"LCP",metric_value:Math.round(n.renderTime||n.loadTime)})}).observe({entryTypes:["largest-contentful-paint"]})}catch{}try{new PerformanceObserver(e=>{e.getEntries().forEach(n=>{gtag("event","web_vitals",{event_category:"Web Vitals",event_label:"FID",value:Math.round(n.processingStart-n.startTime),metric_name:"FID",metric_value:Math.round(n.processingStart-n.startTime)})})}).observe({entryTypes:["first-input"]})}catch{}try{let t=0;new PerformanceObserver(r=>{r.getEntries().forEach(a=>{a.hadRecentInput||(t+=a.value)}),gtag("event","web_vitals",{event_category:"Web Vitals",event_label:"CLS",value:Math.round(t*1e3),metric_name:"CLS",metric_value:t})}).observe({entryTypes:["layout-shift"]})}catch{}}window.addEventListener("load",()=>{if(window.performance&&window.performance.timing){const t=window.performance.timing,e=t.loadEventEnd-t.navigationStart;gtag("event","page_load",{event_category:"Performance",event_label:"Page Load",value:Math.round(e),load_time_ms:Math.round(e),dom_content_loaded:t.domContentLoadedEventEnd-t.navigationStart,dom_complete:t.domComplete-t.navigationStart})}})}}function F(){D()}const g="2024-01-15";function C(t){return`${t}_v${g}`}function B(t,e){const r=[],n=C(t);for(let a=0;a<e.length;a++){const s=e.key(a);s&&s.startsWith(t+"_v")&&s!==n&&r.push(s)}return r}function V(t,e){const r=B(t,e);return r.forEach(n=>{e.removeItem(n)}),r.length}const O="BayeonHwayeonDB",T=1,l="cache";let y=null,m=null;function v(){return m||(m=new Promise((t,e)=>{if(!window.indexedDB){const n=new Error("IndexedDB is not supported in this browser");o.error("[IndexedDB] IndexedDB not supported:",n),e(n);return}const r=indexedDB.open(O,T);r.onerror=()=>{o.error("[IndexedDB] Failed to open database:",r.error),e(r.error)},r.onsuccess=()=>{y=r.result,o.log("[IndexedDB] Database opened successfully"),t(y)},r.onupgradeneeded=n=>{const a=n.target.result;a.objectStoreNames.contains(l)&&a.deleteObjectStore(l);const s=a.createObjectStore(l,{keyPath:"key"});s.createIndex("version","version",{unique:!1}),s.createIndex("timestamp","timestamp",{unique:!1}),o.log("[IndexedDB] Database upgraded, object store created")}}),m)}async function q(t,e){try{const r=await v(),n=`${t}_v${g}`,s=r.transaction([l],"readwrite").objectStore(l),i={key:n,data:e,version:g,timestamp:Date.now()};return new Promise((c,u)=>{const d=s.put(i);d.onsuccess=()=>{o.debug(`[IndexedDB] Saved data for key: ${n}`),c(!0)},d.onerror=()=>{o.error(`[IndexedDB] Failed to save data for key: ${n}:`,d.error),u(d.error)}})}catch(r){return o.error(`[IndexedDB] Error saving data for key: ${t}:`,r),!1}}async function H(t){try{const e=await v(),r=`${t}_v${g}`,a=e.transaction([l],"readonly").objectStore(l);return new Promise((s,i)=>{const c=a.get(r);c.onsuccess=()=>{const u=c.result;u&&u.data?(o.debug(`[IndexedDB] Retrieved data for key: ${r}`),s(u.data)):(o.debug(`[IndexedDB] No data found for key: ${r}`),s(null))},c.onerror=()=>{o.error(`[IndexedDB] Failed to get data for key: ${r}:`,c.error),i(c.error)}})}catch(e){return o.error(`[IndexedDB] Error getting data for key: ${t}:`,e),null}}async function K(t){try{const a=(await v()).transaction([l],"readwrite").objectStore(l).index("version"),s=`${t}_v${g}`;let i=0;return new Promise((c,u)=>{const d=a.openCursor();d.onsuccess=E=>{const f=E.target.result;if(f){const h=f.value;h.key.startsWith(t+"_v")&&h.key!==s&&(f.delete(),i++,o.debug(`[IndexedDB] Deleted old version: ${h.key}`)),f.continue()}else i>0&&o.log(`[IndexedDB] Cleared ${i} old version(s) of ${t}`),c(i)},d.onerror=()=>{o.error(`[IndexedDB] Failed to clear old versions for key: ${t}:`,d.error),u(d.error)}})}catch(e){return o.error(`[IndexedDB] Error clearing old versions for key: ${t}:`,e),0}}function Y(){return!!window.indexedDB}class M{constructor(){this.errorCount=0,this.maxErrors=5,this.errorResetTime=6e4,this.lastErrorTime=null}init(){window.addEventListener("error",e=>{this.handleError(e.error||new Error(e.message),{filename:e.filename,lineno:e.lineno,colno:e.colno,type:"window_error"})}),window.addEventListener("unhandledrejection",e=>{const r=e.reason instanceof Error?e.reason:new Error(String(e.reason));this.handleError(r,{type:"unhandled_promise_rejection",promise:e.promise}),e.preventDefault()}),window.addEventListener("rejectionhandled",e=>{o.log("[ErrorBoundary] Promise rejection was handled:",e.reason)}),o.log("[ErrorBoundary] Error boundary initialized")}handleError(e,r={}){const n=Date.now();if(this.lastErrorTime&&n-this.lastErrorTime>this.errorResetTime&&(this.errorCount=0),this.lastErrorTime=n,this.errorCount++,this.errorCount>this.maxErrors){o.error(`[ErrorBoundary] Too many errors (${this.errorCount}). Preventing further error handling.`);return}const a={message:e.message||"알 수 없는 오류",stack:e.stack,name:e.name,...r,timestamp:new Date().toISOString(),errorCount:this.errorCount};return x.handle(e,`ErrorBoundary: ${r.type||"unknown"}`),typeof gtag=="function"&&gtag("event","exception",{description:a.message,fatal:!0,error_type:r.type||"unknown",error_count:this.errorCount}),a}safeExecute(e,r="unknown",n=null){try{return e()}catch(a){return this.handleError(a,{type:"safe_execute",context:r}),n&&typeof n=="function"?n(a):null}}async safeExecuteAsync(e,r="unknown",n=null){try{return await e()}catch(a){return this.handleError(a,{type:"safe_execute_async",context:r}),n&&typeof n=="function"?await n(a):null}}resetErrorCount(){this.errorCount=0,this.lastErrorTime=null,o.log("[ErrorBoundary] Error count reset")}}const G=new M,R="/sw.js";async function $(){if(!("serviceWorker"in navigator))return o.warn("[Service Worker] Service Worker is not supported in this browser."),!1;try{const t=await navigator.serviceWorker.register(R,{scope:"/"});return o.log("[Service Worker] Registered successfully:",t.scope),t.addEventListener("updatefound",()=>{const e=t.installing;e&&e.addEventListener("statechange",()=>{e.state==="installed"&&navigator.serviceWorker.controller&&(o.log("[Service Worker] New version available. Reload to update."),N())})}),t.active&&o.log("[Service Worker] Active and controlling page"),navigator.serviceWorker.addEventListener("controllerchange",()=>{o.log("[Service Worker] New controller activated. Reloading page...")}),!0}catch(t){return o.error("[Service Worker] Registration failed:",t),!1}}async function w(){if("serviceWorker"in navigator)try{await(await navigator.serviceWorker.ready).update(),o.log("[Service Worker] Update check completed")}catch(t){o.error("[Service Worker] Update check failed:",t)}}function N(){const t=document.createElement("div");if(t.id="sw-update-notification",t.innerHTML=`
    <div class="sw-update-content">
      <div class="sw-update-icon">🔄</div>
      <div class="sw-update-text">
        <strong>새 버전이 사용 가능합니다</strong>
        <p>업데이트를 적용하려면 새로고침하세요.</p>
      </div>
      <div class="sw-update-actions">
        <button class="sw-update-btn sw-update-now" onclick="window.location.reload()">지금 업데이트</button>
        <button class="sw-update-btn sw-update-later" onclick="this.closest('#sw-update-notification').remove()">나중에</button>
      </div>
    </div>
  `,!document.getElementById("sw-update-styles")){const r=document.createElement("style");r.id="sw-update-styles",r.textContent=`
      #sw-update-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        max-width: 400px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInUp 0.3s ease-out;
        font-family: 'Noto Sans KR', sans-serif;
      }
      @keyframes slideInUp {
        from {
          transform: translateY(100px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }
      .sw-update-content {
        padding: 20px;
        display: flex;
        align-items: flex-start;
        gap: 15px;
      }
      .sw-update-icon {
        font-size: 2rem;
        flex-shrink: 0;
      }
      .sw-update-text {
        flex: 1;
      }
      .sw-update-text strong {
        display: block;
        font-size: 1.1rem;
        color: #333;
        margin-bottom: 5px;
      }
      .sw-update-text p {
        margin: 0;
        font-size: 0.9rem;
        color: #666;
      }
      .sw-update-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
        width: 100%;
      }
      .sw-update-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      .sw-update-now {
        background: #3498db;
        color: white;
      }
      .sw-update-now:hover {
        background: #2980b9;
      }
      .sw-update-later {
        background: #ecf0f1;
        color: #7f8c8d;
      }
      .sw-update-later:hover {
        background: #bdc3c7;
      }
      @media (max-width: 768px) {
        #sw-update-notification {
          bottom: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }
      }
    `,document.head.appendChild(r)}const e=document.getElementById("sw-update-notification");e&&e.remove(),document.body.appendChild(t),setTimeout(()=>{t.parentNode&&(t.style.animation="slideInUp 0.3s ease-out reverse",setTimeout(()=>t.remove(),300))},1e4)}function J(){$(),setInterval(()=>{w()},3600*1e3),document.addEventListener("visibilitychange",()=>{document.hidden||w()})}function Q(t){t.querySelector(".modal-support-banner")}window.closeSupportBanner=function(){const t=document.getElementById("modalSupportBanner");t&&(t.style.animation="supportBannerSlideOut 0.3s ease-in",setTimeout(()=>{t.remove()},300))};const _=document.createElement("style");_.textContent=`
  @keyframes supportBannerSlideOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
`;document.head.appendChild(_);export{x as E,o as L,P as S,Q as a,k as b,V as c,K as d,H as e,j as f,C as g,G as h,Y as i,F as j,J as k,A as l,W as m,U as n,L as o,q as s,z as t};
