import{f as L}from"./components-C2RsvHY9.js";import{L as v}from"./utils-x5ORUUhl.js";import{o as D,q as O,t as R,r as k,p as e,v as x,u as p,e as a,h as W,S as G}from"./myInfo-common-DGiNC5LG.js";import{a as f,u as q}from"./myInfo-statCalculator-B6U9dMgm.js";import{r as T,u as c,h as w}from"./myInfo-statUI-D9BNfbGD.js";import{r as F,a as H,s as K,b as N,h as V,c as y,g as i,d as j,e as U,f as z}from"./myInfo-spiritManager-BqPas-0x.js";import{s as _}from"./myInfo-eventHandlers-CoLg-3Vq.js";import"./main-Bgn-9pGL.js";import"./myInfo-engravingManager-Bl8avFnj.js";function b(t,n,l){w(t,n,l,i,d,q)}function u(t){F(t,$,(n,l,P,r)=>{K(n,l,P,r,{renderBondSlots:u,updateTotalStats:f,updateSoulExp:p,debouncedUpdateTotalStats:d,debouncedUpdateSoulExp:E,updateStatItemsWithValues:c,removeBondSpirit:Q})})}function g(){H(J)}function $(t){N(t),g()}function J(t){V(t,u,g,d,E)}function Q(t,n){U(t,n,u,y,g,d,E)}function it(t){X(),t.innerHTML=D(),a.container=t,a.statsColumn1=t.querySelector("#statsColumn1"),a.statsColumn2=t.querySelector("#statsColumn2"),a.statsColumn3=t.querySelector("#statsColumn3"),a.spiritGrid=t.querySelector("#myInfoSpiritGrid"),a.spiritTabs=t.querySelectorAll(".my-info-spirit-tab"),a.totalStatsGrid=t.querySelector("#totalStatsGrid"),a.soulExpInfo=t.querySelector("#soulExpInfo"),a.profileSelect=t.querySelector("#profileSelect"),a.createProfileBtn=t.querySelector("#createProfileBtn"),a.editProfileBtn=t.querySelector("#editProfileBtn"),a.deleteProfileBtn=t.querySelector("#deleteProfileBtn"),a.bondSlots수호=t.querySelector("#bondSlots수호"),a.bondSlots탑승=t.querySelector("#bondSlots탑승"),a.bondSlots변신=t.querySelector("#bondSlots변신"),O(),R({renderBondSlots:u,renderActiveSpiritSelect:y,renderStats:()=>T(b),updateTotalStats:()=>f(i,c),updateSoulExp:()=>p(i)}),k(),T(b),["수호","탑승","변신"].forEach(r=>{u(r)}),g();const l=r=>{if(r.target.tagName==="IMG"&&r.target.src){const s=r.target;if(s.src.endsWith(".webp")&&s.dataset.fallbackAttempted!=="true"){const o=s.src.replace(/\.webp$/i,".jpg");s.dataset.fallbackAttempted="true",s.src=o;return}e.imageLoadErrors.add(s.src),W()}};t.querySelectorAll("img").forEach(r=>{r.onerror||r.addEventListener("error",l)}),e.imageObserver=new MutationObserver(r=>{r.forEach(s=>{s.addedNodes.forEach(o=>{if(o.nodeType===1){o.tagName==="IMG"&&o.addEventListener("error",l);const S=o.querySelectorAll&&o.querySelectorAll("img");S&&S.forEach(m=>{m.addEventListener("error",l)})}})})}),e.imageObserver.observe(t,{childList:!0,subtree:!0}),_({renderBondSlotsWrapper:u,renderActiveSpiritSelect:y,renderSpiritListWrapper:g,handleStatEditWrapper:b,debouncedUpdateTotalStats:d}),x().catch(r=>{v.error("Error preloading exp table:",r)}),Promise.all([f(i,c),p(i)]).then(()=>{const r=[...G],s=e.lastTotalStatsCalculation;if(!(!s||!s.allTotalStats)){if(Object.keys(e.baselineStats).length===0){r.forEach(h=>{const I=e.userStats[h.key]||0,C=s.allTotalStats[h.key]||0,A=Math.round(I+C);e.baselineStats[h.key]=A});const o=Math.round((e.userStats.damageResistancePenetration||0)+(s.allTotalStats.damageResistancePenetration||0)),S=Math.round((e.userStats.damageResistance||0)+(s.allTotalStats.damageResistance||0)),m=Math.round((e.userStats.pvpDamagePercent||0)+(s.allTotalStats.pvpDamagePercent||0)),M=Math.round((e.userStats.pvpDefensePercent||0)+(s.allTotalStats.pvpDefensePercent||0)),B=Math.round(o+S+Math.round(m*10)+Math.round(M*10));e.baselineKeyStats.tachaeTotal=B,e.baselineKeyStats.statusEffectResistance=Math.round((e.userStats.statusEffectResistance||0)+(s.allTotalStats.statusEffectResistance||0)),e.baselineKeyStats.statusEffectAccuracy=Math.round((e.userStats.statusEffectAccuracy||0)+(s.allTotalStats.statusEffectAccuracy||0))}c(r,s.allTotalStats,{},!0),q(r,s.allTotalStats,{},!0),e.isInitialLoad=!1}}).catch(r=>{v.error("Error initializing stats:",r),e.isInitialLoad=!1})}const d=L(()=>{f(i,c)},800),E=L(()=>{p(i)},800);function nt(){return`
    <div class="content-block">
      <h2>내정보 페이지 사용 안내</h2>
      <p>내정보 페이지에서는 사용자의 기본 스탯을 입력하고, 환수를 결속하여 합산 스탯을 확인할 수 있습니다. 여러 프로파일을 생성하여 PvP, PvE 등 다양한 설정을 관리할 수 있습니다.</p>
      
      <h3>프로파일 관리</h3>
      <ul>
        <li><strong>프로파일 생성:</strong> <strong>+</strong> 버튼을 클릭하여 새로운 프로파일을 생성합니다 (예: PvP, PvE, 보스 등)</li>
        <li><strong>프로파일 선택:</strong> 드롭다운에서 원하는 프로파일을 선택하면 해당 프로파일의 설정이 로드됩니다</li>
        <li><strong>프로파일 수정:</strong> <strong>✏️</strong> 버튼으로 프로파일 이름을 변경할 수 있습니다</li>
        <li><strong>프로파일 삭제:</strong> <strong>삭제</strong> 버튼으로 불필요한 프로파일을 제거할 수 있습니다</li>
        <li>각 프로파일은 독립적으로 환수 결속, 스탯, 각인 정보를 저장합니다</li>
      </ul>

      <h3>환수 결속 관리</h3>
      <ul>
        <li><strong>환수 추가:</strong> 오른쪽 환수 그리드에서 환수 이미지를 클릭하면 왼쪽 결속 슬롯에 추가됩니다 (카테고리별 최대 6개)</li>
        <li><strong>환수 레벨 조정:</strong> 결속 슬롯의 환수 이미지를 클릭하면 팝업이 열리며, 레벨 버튼(-/+) 또는 직접 입력으로 레벨을 조정할 수 있습니다</li>
        <li><strong>사용하기/사용중:</strong> 환수 팝업에서 <strong>사용하기</strong> 버튼을 클릭하면 해당 환수가 활성화됩니다 (주황색 테두리로 표시)</li>
        <li><strong>결속 제거:</strong> <strong>결속 제거</strong> 버튼으로 결속 슬롯에서 환수를 제거할 수 있습니다</li>
        <li>각 카테고리(수호/탑승/변신)별로 하나의 환수만 활성화할 수 있습니다</li>
      </ul>

      <h3>스탯 입력 및 저장</h3>
      <ul>
        <li><strong>기본 스탯 입력:</strong> <strong>나의 스탯</strong> 섹션에서 각 스탯 값을 클릭하여 직접 입력합니다</li>
        <li><strong>저장 버튼:</strong> 현재 입력한 스탯과 환수 설정을 기준값으로 저장합니다</li>
        <li><strong>증감 표시:</strong> 저장 후 환수 레벨 변경, 각인 변경 등으로 스탯이 변하면 증감값이 표시됩니다
          <ul>
            <li>🟢 <strong>초록색</strong>: 스탯 증가</li>
            <li>🔴 <strong>빨간색</strong>: 스탯 감소</li>
            <li>⚪ <strong>회색</strong>: 변화 없음</li>
          </ul>
        </li>
        <li><strong>환산타채 합:</strong> 상단 중앙에 표시되며, 저장 후 변경사항에 따른 증감도 함께 표시됩니다</li>
      </ul>

      <h3>각인 설정</h3>
      <ul>
        <li><strong>각인 등록:</strong> 환수 이미지 클릭 → 팝업에서 <strong>등록효과</strong> 탭 선택 → 스탯 선택 및 값 입력 (최대 4개)</li>
        <li><strong>각인 장착:</strong> <strong>장착효과</strong> 탭에서 각인 장착 스탯을 입력합니다</li>
        <li><strong>등록효과 가능 스탯:</strong> 체력증가, 마력증가, 치명확률, 치명저항, 체력시약향상, 마력시약향상, 대인방어, 피해흡수, 위력, 치명피해저항, 시전향상, 보스몬스터 추가피해, 일반몬스터 추가피해, 피해저항관통, 상태이상저항, 상태이상적중</li>
        <li>⚠️ <strong>주의:</strong> 각인 정보는 환수 레벨에 따라 자동으로 계산되지 않으므로 직접 입력해야 합니다</li>
        <li>설정 후 <strong>각인 저장</strong> 버튼을 클릭하여 저장합니다</li>
      </ul>

      <h3>환수 혼 경험치</h3>
      <ul>
        <li>하단 왼쪽 섹션에서 환수 초기화 시 획득 가능한 경험치를 확인할 수 있습니다</li>
        <li>수호/탑승/변신 카테고리별 경험치와 총합, 기준 대비 필요 경험치가 표시됩니다</li>
        <li>결속 슬롯에 추가된 모든 환수의 경험치가 합산되어 표시됩니다</li>
      </ul>

      <h3>💡 사용 팁</h3>
      <ul>
        <li>프로파일을 활용하여 PvP용, PvE용 등 다양한 설정을 따로 관리하세요</li>
        <li>스탯을 입력한 후 반드시 <strong>저장</strong> 버튼을 클릭해야 증감 기능이 정상 작동합니다</li>
        <li>환수 레벨을 변경하면 즉시 스탯 증감이 반영됩니다</li>
        <li>각인 설정은 환수별로 독립적으로 저장되며, 프로파일별로 관리됩니다</li>
        <li>우측 하단의 <strong>?</strong> 도움말 버튼을 클릭하면 상세한 사용 가이드를 확인할 수 있습니다</li>
      </ul>
    </div>
  `}function X(){e.imageObserver&&(e.imageObserver.disconnect(),e.imageObserver=null),e.imageLoadErrors.clear(),e.imageLoadErrorShown=!1,z(),j(),Object.keys(a).forEach(t=>{delete a[t]})}export{X as cleanup,nt as getHelpContentHTML,it as init};
