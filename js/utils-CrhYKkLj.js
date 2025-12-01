import{s as S}from"./components-DdtSZoSt.js";class v{static handle(e,r=""){const n={message:e.message||"알 수 없는 오류가 발생했습니다.",context:r,timestamp:new Date().toISOString()};return typeof gtag=="function"&&gtag("event","exception",{description:n.message,fatal:!1}),n}static showUserFriendlyMessage(e,r){const n=this.handle(e),o=this.getUserFriendlyMessage(n.message);r&&(r.innerHTML=`
        <div class="error-message">
          <h3>오류가 발생했습니다</h3>
          <p>${o}</p>
          <button onclick="location.reload()">새로고침</button>
        </div>
      `)}static getUserFriendlyMessage(e){if(e.includes("404")||e.includes("Failed to load resource")||e.includes("the server responded with a status of 404")||e.includes("Not Found")||e.includes("Failed to fetch dynamically imported module")||e.includes("Loading chunk")&&e.includes("failed"))return"메시지를 로드할수없습니다. Ctrl+Shift+R 을 눌러서 다시 시도해보세요.";const r=["Failed to fetch","NetworkError","Network request failed","ERR_INTERNET_DISCONNECTED","ERR_NETWORK_CHANGED","ERR_CONNECTION_REFUSED","ERR_CONNECTION_TIMED_OUT","ERR_CONNECTION_RESET","dynamically imported module"];for(const n of r)if(e.includes(n))return"현재 서버 점검중 입니다.";return e.includes("timeout")?"요청 시간이 초과되었습니다. 다시 시도해주세요.":"일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."}}class T{constructor(e=50){this.cache=new Map,this.maxSize=e}get(e){if(this.cache.has(e)){const r=this.cache.get(e);return this.cache.delete(e),this.cache.set(e,r),r}return null}set(e,r){if(this.cache.has(e))this.cache.delete(e);else if(this.cache.size>=this.maxSize){const n=this.cache.keys().next().value;this.cache.delete(n)}this.cache.set(e,r)}delete(e){return this.cache.delete(e)}clear(){this.cache.clear()}size(){return this.cache.size}has(e){return this.cache.has(e)}}const U=new T(50);class s{static isDev(){return!1}static log(...e){}static error(...e){}static warn(...e){}static info(...e){}static debug(...e){}static group(...e){}static groupEnd(){}static logIf(e,...r){}}class j{static getStorage(){return this.isLocalStorageAvailable()?localStorage:sessionStorage}static isLocalStorageAvailable(){try{const e="__localStorage_test__";return localStorage.setItem(e,e),localStorage.removeItem(e),!0}catch{return!1}}static getMaxSize(){return 5*1024*1024}static getUsedSize(){const e=this.getStorage();let r=0;for(let n in e)e.hasOwnProperty(n)&&(r+=e[n].length+n.length);return r}static canStore(e){return this.getUsedSize()+e<this.getMaxSize()}static setItem(e,r){const n=this.getStorage(),o=new Blob([r]).size;if(!this.canStore(o))for(s.warn(`[Storage] Storage nearly full (${(this.getUsedSize()/1024/1024).toFixed(2)}MB used). Clearing oldest items...`);!this.canStore(o)&&n.length>0;)this.clearOldest();try{return n.setItem(e,r),!0}catch{if(n.length>0){this.clearOldest();try{return n.setItem(e,r),!0}catch{return!1}}return!1}}static clearOldest(){const e=this.getStorage();if(e.length===0)return;const r=e.key(0);r&&e.removeItem(r)}static getItem(e){return this.getStorage().getItem(e)}static removeItem(e){this.getStorage().removeItem(e)}static clear(){this.getStorage().clear()}static getItemCount(){return this.getStorage().length}static getUsageRatio(){return this.getUsedSize()/this.getMaxSize()}}const y=new Map;let g=null;function O(){if(g!==null)return g;if(typeof document>"u")return g=!1,!1;const t=document.createElement("canvas");return t.width=1,t.height=1,g=t.toDataURL("image/webp").indexOf("data:image/webp")===0,g}function N(t){return!t||typeof t!="string"||t.endsWith(".webp")||!O()?t:t.match(/\.(jpg|jpeg|png)$/i)?t.replace(/\.(jpg|jpeg|png)$/i,".webp"):t}function E(t,e=!0){if(!t||typeof t!="string")return t;const r=`${t}:${e}`;if(y.has(r))return y.get(r);let n=t.replace(/^images\//,"assets/img/");return e&&(n=N(n)),y.set(r,n),n}function I(t,e=!0){return!t||typeof t.image!="string"?t:{...t,image:E(t.image,e)}}function M(t,e=!0){return Array.isArray(t)?t.map(r=>I(r,e)):t}const V=Object.freeze(Object.defineProperty({__proto__:null,transformImagePath:E,transformSpiritImagePath:I,transformSpiritsArrayPaths:M},Symbol.toStringTag,{value:"Module"}));function q(t,e,r=!0){typeof gtag=="function"&&gtag("event","api_performance",{event_category:"API",event_label:t,value:Math.round(e),success:r,api_endpoint:t,response_time_ms:Math.round(e)})}function K(t,e,r={}){typeof gtag=="function"&&gtag("event","calculation_performance",{event_category:"Calculation",event_label:t,value:Math.round(e),calculation_type:t,duration_ms:Math.round(e),...r})}function H(t,e,r={}){typeof gtag=="function"&&gtag("event","user_action",{event_category:e,event_label:t,action:t,category:e,...r})}function Y(t,e){typeof gtag=="function"&&gtag("event","page_load_performance",{event_category:"Page Load",event_label:t,value:Math.round(e),page_name:t,load_time_ms:Math.round(e)})}function R(){if(typeof gtag=="function"){if("PerformanceObserver"in window){try{new PerformanceObserver(e=>{const r=e.getEntries(),n=r[r.length-1];gtag("event","web_vitals",{event_category:"Web Vitals",event_label:"LCP",value:Math.round(n.renderTime||n.loadTime),metric_name:"LCP",metric_value:Math.round(n.renderTime||n.loadTime)})}).observe({entryTypes:["largest-contentful-paint"]})}catch{}try{new PerformanceObserver(e=>{e.getEntries().forEach(n=>{gtag("event","web_vitals",{event_category:"Web Vitals",event_label:"FID",value:Math.round(n.processingStart-n.startTime),metric_name:"FID",metric_value:Math.round(n.processingStart-n.startTime)})})}).observe({entryTypes:["first-input"]})}catch{}try{let t=0;new PerformanceObserver(r=>{r.getEntries().forEach(o=>{o.hadRecentInput||(t+=o.value)}),gtag("event","web_vitals",{event_category:"Web Vitals",event_label:"CLS",value:Math.round(t*1e3),metric_name:"CLS",metric_value:t})}).observe({entryTypes:["layout-shift"]})}catch{}}window.addEventListener("load",()=>{if(window.performance&&window.performance.timing){const t=window.performance.timing,e=t.loadEventEnd-t.navigationStart;gtag("event","page_load",{event_category:"Performance",event_label:"Page Load",value:Math.round(e),load_time_ms:Math.round(e),dom_content_loaded:t.domContentLoadedEventEnd-t.navigationStart,dom_complete:t.domComplete-t.navigationStart})}})}}function G(){R()}const f="2024-01-15";function B(t){return`${t}_v${f}`}function L(t,e){const r=[],n=B(t);for(let o=0;o<e.length;o++){const a=e.key(o);a&&a.startsWith(t+"_v")&&a!==n&&r.push(a)}return r}function J(t,e){const r=L(t,e);return r.forEach(n=>{e.removeItem(n)}),r.length}const D="BayeonHwayeonDB",z=1,l="cache";let _=null,m=null;function b(){return m||(m=new Promise((t,e)=>{if(!window.indexedDB){const n=new Error("IndexedDB is not supported in this browser");e(n);return}const r=indexedDB.open(D,z);r.onerror=()=>{s.error("[IndexedDB] Failed to open database:",r.error),e(r.error)},r.onsuccess=()=>{_=r.result,t(_)},r.onupgradeneeded=n=>{const o=n.target.result;o.objectStoreNames.contains(l)&&o.deleteObjectStore(l);const a=o.createObjectStore(l,{keyPath:"key"});a.createIndex("version","version",{unique:!1}),a.createIndex("timestamp","timestamp",{unique:!1})}}),m)}async function Q(t,e){try{const r=await b(),n=`${t}_v${f}`,a=r.transaction([l],"readwrite").objectStore(l),i={key:n,data:e,version:f,timestamp:Date.now()};return new Promise((c,u)=>{const d=a.put(i);d.onsuccess=()=>{s.debug(`[IndexedDB] Saved data for key: ${n}`),c(!0)},d.onerror=()=>{s.error(`[IndexedDB] Failed to save data for key: ${n}:`,d.error),u(d.error)}})}catch{return!1}}async function X(t){try{const e=await b(),r=`${t}_v${f}`,o=e.transaction([l],"readonly").objectStore(l);return new Promise((a,i)=>{const c=o.get(r);c.onsuccess=()=>{const u=c.result;u&&u.data?(s.debug(`[IndexedDB] Retrieved data for key: ${r}`),a(u.data)):(s.debug(`[IndexedDB] No data found for key: ${r}`),a(null))},c.onerror=()=>{s.error(`[IndexedDB] Failed to get data for key: ${r}:`,c.error),i(c.error)}})}catch{return null}}async function Z(t){try{const o=(await b()).transaction([l],"readwrite").objectStore(l).index("version"),a=`${t}_v${f}`;let i=0;return new Promise((c,u)=>{const d=o.openCursor();d.onsuccess=C=>{const p=C.target.result;if(p){const w=p.value;w.key.startsWith(t+"_v")&&w.key!==a&&(p.delete(),i++,s.debug(`[IndexedDB] Deleted old version: ${w.key}`)),p.continue()}else i>0&&s.log(`[IndexedDB] Cleared ${i} old version(s) of ${t}`),c(i)},d.onerror=()=>{s.error(`[IndexedDB] Failed to clear old versions for key: ${t}:`,d.error),u(d.error)}})}catch{return 0}}function ee(){return!!window.indexedDB}class W{constructor(){this.errorCount=0,this.maxErrors=5,this.errorResetTime=6e4,this.lastErrorTime=null}init(){window.addEventListener("error",e=>{const r=e.message||"",n=r.includes("404")||r.includes("Failed to load resource")||r.includes("the server responded with a status of 404")||r.includes("Not Found")||e.target&&e.target.tagName&&(e.target.tagName==="SCRIPT"||e.target.tagName==="LINK"||e.target.tagName==="IMG");if(n){const o=v.getUserFriendlyMessage(r),a=document.getElementById("app-container");a&&!a.querySelector(".error-recovery-container")&&S(a,new Error(r),{title:"리소스 로드 실패",message:o,onRetry:()=>{window.location.reload(!0)}})}this.handleError(e.error||new Error(e.message),{filename:e.filename,lineno:e.lineno,colno:e.colno,type:"window_error",is404:n})}),window.addEventListener("unhandledrejection",e=>{const r=e.reason instanceof Error?e.reason:new Error(String(e.reason)),n=r.message||String(e.reason),o=n.includes("404")||n.includes("Failed to load resource")||n.includes("the server responded with a status of 404")||n.includes("Not Found")||n.includes("Failed to fetch dynamically imported module")||n.includes("Loading chunk")&&n.includes("failed");if(o){const a=v.getUserFriendlyMessage(n),i=document.getElementById("app-container");i&&!i.querySelector(".error-recovery-container")&&S(i,r,{title:"리소스 로드 실패",message:a,onRetry:()=>{window.location.reload(!0)}})}this.handleError(r,{type:"unhandled_promise_rejection",promise:e.promise,is404:o}),e.preventDefault()}),window.addEventListener("rejectionhandled",e=>{s.log("[ErrorBoundary] Promise rejection was handled:",e.reason)})}handleError(e,r={}){const n=Date.now();if(this.lastErrorTime&&n-this.lastErrorTime>this.errorResetTime&&(this.errorCount=0),this.lastErrorTime=n,this.errorCount++,this.errorCount>this.maxErrors){s.error(`[ErrorBoundary] Too many errors (${this.errorCount}). Preventing further error handling.`);return}const o={message:e.message||"알 수 없는 오류",stack:e.stack,name:e.name,...r,timestamp:new Date().toISOString(),errorCount:this.errorCount};return v.handle(e,`ErrorBoundary: ${r.type||"unknown"}`),typeof gtag=="function"&&gtag("event","exception",{description:o.message,fatal:!0,error_type:r.type||"unknown",error_count:this.errorCount}),o}safeExecute(e,r="unknown",n=null){try{return e()}catch(o){return this.handleError(o,{type:"safe_execute",context:r}),n&&typeof n=="function"?n(o):null}}async safeExecuteAsync(e,r="unknown",n=null){try{return await e()}catch(o){return this.handleError(o,{type:"safe_execute_async",context:r}),n&&typeof n=="function"?await n(o):null}}resetErrorCount(){this.errorCount=0,this.lastErrorTime=null}}const te=new W,F="/sw.js";let x=!1;async function $(){if(!("serviceWorker"in navigator))return!1;try{const t=await navigator.serviceWorker.register(F,{scope:"/"});return s.log("[Service Worker] Registered successfully:",t.scope),t._updateFoundListenerAdded||(t._updateFoundListenerAdded=!0,t.addEventListener("updatefound",()=>{const e=t.installing;e&&e.addEventListener("statechange",()=>{e.state==="installed"&&(navigator.serviceWorker.controller&&!x?(s.log("[Service Worker] New version available. Reload to update."),x=!0,A(),e.postMessage({type:"SKIP_WAITING"})):s.log("[Service Worker] First installation completed."))})})),t.active&&s.log("[Service Worker] Active and controlling page"),navigator.serviceWorker._controllerChangeListenerAdded||(navigator.serviceWorker._controllerChangeListenerAdded=!0,navigator.serviceWorker.addEventListener("controllerchange",()=>{s.log("[Service Worker] New controller activated. Reloading page..."),x=!1,window.location.reload()})),!0}catch{return!1}}async function h(){if("serviceWorker"in navigator)try{await(await navigator.serviceWorker.ready).update(),s.log("[Service Worker] Update check completed")}catch{}}function A(){const t=document.getElementById("sw-update-notification");t&&t.remove();const e=document.createElement("div");if(e.id="sw-update-notification",e.innerHTML=`
    <div class="sw-update-content">
      <div class="sw-update-icon">🔄</div>
      <div class="sw-update-text">
        <strong>새 버전이 사용 가능합니다</strong>
        <p>업데이트를 적용하려면 새로고침하세요. (Ctrl+Shift+R 또는 Cmd+Shift+R)</p>
      </div>
      <div class="sw-update-actions">
        <button class="sw-update-btn sw-update-now" id="sw-update-now-btn">지금 업데이트</button>
        <button class="sw-update-btn sw-update-later" id="sw-update-later-btn">나중에</button>
      </div>
    </div>
  `,e.querySelector("#sw-update-now-btn").addEventListener("click",()=>{window.location.reload()}),e.querySelector("#sw-update-later-btn").addEventListener("click",()=>{e.style.animation="slideInUp 0.3s ease-out reverse",setTimeout(()=>e.remove(),300)}),!document.getElementById("sw-update-styles")){const r=document.createElement("style");r.id="sw-update-styles",r.textContent=`
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
        padding: 16px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .sw-update-icon {
        font-size: 1.5rem;
        flex-shrink: 0;
        line-height: 1;
      }
      .sw-update-text {
        flex: 1;
        min-width: 0;
      }
      .sw-update-text strong {
        display: block;
        font-size: 1rem;
        color: #333;
        margin-bottom: 4px;
        font-weight: 600;
      }
      .sw-update-text p {
        margin: 0;
        font-size: 0.875rem;
        color: #666;
        line-height: 1.4;
      }
      .sw-update-actions {
        display: flex;
        flex-direction: row;
        gap: 8px;
        margin-top: 12px;
        width: 100%;
      }
      .sw-update-btn {
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        flex: 1;
        white-space: nowrap;
      }
      .sw-update-now {
        background: #3498db;
        color: white;
      }
      .sw-update-now:hover {
        background: #2980b9;
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
      }
      .sw-update-now:active {
        transform: translateY(0);
      }
      .sw-update-later {
        background: #ecf0f1;
        color: #7f8c8d;
      }
      .sw-update-later:hover {
        background: #bdc3c7;
      }
      .sw-update-later:active {
        transform: translateY(0);
      }
      @media (max-width: 768px) {
        #sw-update-notification {
          bottom: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
          border-radius: 10px;
        }
        .sw-update-content {
          padding: 12px;
          gap: 10px;
          flex-direction: column;
        }
        .sw-update-icon {
          font-size: 1.25rem;
          align-self: flex-start;
        }
        .sw-update-text {
          width: 100%;
        }
        .sw-update-text strong {
          font-size: 0.95rem;
          margin-bottom: 3px;
        }
        .sw-update-text p {
          font-size: 0.8rem;
        }
        .sw-update-actions {
          flex-direction: column;
          gap: 6px;
          margin-top: 10px;
        }
        .sw-update-btn {
          padding: 10px 14px;
          font-size: 0.875rem;
          width: 100%;
        }
      }
      @media (max-width: 480px) {
        #sw-update-notification {
          bottom: 8px;
          right: 8px;
          left: 8px;
          border-radius: 8px;
        }
        .sw-update-content {
          padding: 10px;
          gap: 8px;
        }
        .sw-update-icon {
          font-size: 1.1rem;
        }
        .sw-update-text strong {
          font-size: 0.9rem;
        }
        .sw-update-text p {
          font-size: 0.75rem;
        }
        .sw-update-btn {
          padding: 8px 12px;
          font-size: 0.8rem;
        }
      }
    `,document.head.appendChild(r)}document.body.appendChild(e),setTimeout(()=>{e.parentNode&&(e.style.animation="slideInUp 0.3s ease-out reverse",setTimeout(()=>e.remove(),300))},1e4)}function re(){$(),setTimeout(()=>{h()},2e3),setInterval(()=>{h()},300*1e3),document.addEventListener("visibilitychange",()=>{document.hidden||h()}),window.addEventListener("focus",()=>{h()})}function ne(t){t.querySelector(".modal-support-banner")}window.closeSupportBanner=function(){const t=document.getElementById("modalSupportBanner");t&&(t.style.animation="supportBannerSlideOut 0.3s ease-in",setTimeout(()=>{t.remove()},300))};const k=document.createElement("style");k.textContent=`
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
`;document.head.appendChild(k);export{v as E,s as L,j as S,ne as a,M as b,J as c,Z as d,X as e,Y as f,B as g,te as h,ee as i,G as j,re as k,H as l,U as m,K as n,V as o,Q as s,q as t};
