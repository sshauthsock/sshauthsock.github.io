import{g as T}from"./components-DdtSZoSt.js";import{A as I,B as A,D,r as N,p as e,F as R,u as p,e as o,t as k,S as V}from"./myInfo-common-BYcV_FJt.js";import{u as c,a as L}from"./myInfo-statCalculator-BzggkQhQ.js";import{r as v,u as n,h as W}from"./myInfo-statUI-iSml9w23.js";import{r as x,a as G,s as w,b as J,h as F,c as b,g as l,d as H,e as K,f as j}from"./myInfo-spiritManager-EfOtZO4k.js";import{s as U}from"./myInfo-eventHandlers-CMzneYSf.js";import"./utils-CrhYKkLj.js";import"./main-CCVrUopr.js";import"./myInfo-engravingManager-CI6NAWT1.js";function y(t,g,i){W(t,g,i,l,f,L)}function u(t){x(t,_,(g,i,P,s)=>{w(g,i,P,s,{renderBondSlots:u,updateTotalStats:c,updateSoulExp:p,debouncedUpdateTotalStats:f,debouncedUpdateSoulExp:E,updateStatItemsWithValues:n,removeBondSpirit:z,getSpiritsForCategory:l})})}function S(){G($)}function _(t){J(t),S()}function $(t){F(t,u,S,f,E,c,n,l)}function z(t,g){K(t,g,u,b,S,f,E,c,n,l)}function at(t){Q(),t.innerHTML=I(),o.container=t,o.statsColumn1=t.querySelector("#statsColumn1"),o.statsColumn2=t.querySelector("#statsColumn2"),o.statsColumn3=t.querySelector("#statsColumn3"),o.spiritGrid=t.querySelector("#myInfoSpiritGrid"),o.spiritTabs=t.querySelectorAll(".my-info-spirit-tab"),o.totalStatsGrid=t.querySelector("#totalStatsGrid"),o.soulExpInfo=t.querySelector("#soulExpInfo"),o.profileSelect=t.querySelector("#profileSelect"),o.createProfileBtn=t.querySelector("#createProfileBtn"),o.editProfileBtn=t.querySelector("#editProfileBtn"),o.deleteProfileBtn=t.querySelector("#deleteProfileBtn"),o.bondSlots수호=t.querySelector("#bondSlots수호"),o.bondSlots탑승=t.querySelector("#bondSlots탑승"),o.bondSlots변신=t.querySelector("#bondSlots변신"),A(),D({renderBondSlots:u,renderActiveSpiritSelect:b,renderStats:()=>v(y),updateTotalStats:()=>c(l,n),updateSoulExp:()=>p(l)}),N(),v(y),["수호","탑승","변신"].forEach(s=>{u(s)}),S();const i=s=>{if(s.target.tagName==="IMG"&&s.target.src){const r=s.target;if(r.src.endsWith(".webp")&&r.dataset.fallbackAttempted!=="true"){const a=r.src.replace(/\.webp$/i,".jpg");r.dataset.fallbackAttempted="true",r.src=a;return}e.imageLoadErrors.add(r.src),k()}};t.querySelectorAll("img").forEach(s=>{s.onerror||s.addEventListener("error",i)}),e.imageObserver=new MutationObserver(s=>{s.forEach(r=>{r.addedNodes.forEach(a=>{if(a.nodeType===1){a.tagName==="IMG"&&a.addEventListener("error",i);const d=a.querySelectorAll&&a.querySelectorAll("img");d&&d.forEach(m=>{m.addEventListener("error",i)})}})})}),e.imageObserver.observe(t,{childList:!0,subtree:!0}),U({renderBondSlotsWrapper:u,renderActiveSpiritSelect:b,renderSpiritListWrapper:S,handleStatEditWrapper:y}),R().catch(s=>{}),Promise.all([c(l,n),p(l)]).then(()=>{const s=[...V],r=e.lastTotalStatsCalculation;if(!(!r||!r.allTotalStats)){if(Object.keys(e.baselineStats).length===0){s.forEach(h=>{const M=e.userStats[h.key]||0,O=r.allTotalStats[h.key]||0,B=Math.round(M+O);e.baselineStats[h.key]=B});const a=Math.round((e.userStats.damageResistancePenetration||0)+(r.allTotalStats.damageResistancePenetration||0)),d=Math.round((e.userStats.damageResistance||0)+(r.allTotalStats.damageResistance||0)),m=Math.round((e.userStats.pvpDamagePercent||0)+(r.allTotalStats.pvpDamagePercent||0)),q=Math.round((e.userStats.pvpDefensePercent||0)+(r.allTotalStats.pvpDefensePercent||0)),C=Math.round(a+d+Math.round(m*10)+Math.round(q*10));e.baselineKeyStats.tachaeTotal=C,e.baselineKeyStats.statusEffectResistance=Math.round((e.userStats.statusEffectResistance||0)+(r.allTotalStats.statusEffectResistance||0)),e.baselineKeyStats.statusEffectAccuracy=Math.round((e.userStats.statusEffectAccuracy||0)+(r.allTotalStats.statusEffectAccuracy||0))}n(s,r.allTotalStats,{},!0),L(s,r.allTotalStats,{},!0),e.isInitialLoad=!1}}).catch(s=>{e.isInitialLoad=!1})}const f=T(()=>{c(l,n)},800),E=T(()=>{p(l)},800);function it(){return`
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

      <h3>데이터 관리</h3>
      <ul>
        <li><strong>⚙️ 데이터 메뉴:</strong> 프로파일 섹션 오른쪽의 <strong>데이터</strong> 버튼을 클릭하면 데이터 관리 메뉴가 표시됩니다</li>
        <li><strong>클립보드 복사:</strong> 현재 설정된 환수, 레벨, 각인, 스탯 정보를 JSON 형식으로 클립보드에 복사합니다</li>
        <li><strong>클립보드 붙여넣기:</strong> 클립보드에 복사된 JSON 데이터를 가져와서 현재 데이터를 대체합니다</li>
        <li><strong>JSON 내보내기:</strong> 현재 데이터를 JSON 파일로 다운로드합니다 (환수, 레벨, 각인, 스탯 정보 포함)</li>
        <li><strong>CSV 내보내기:</strong> 현재 데이터를 CSV 파일로 다운로드합니다 (엑셀 등에서 열어볼 수 있음)</li>
        <li><strong>파일 가져오기:</strong> 이전에 내보낸 JSON 또는 CSV 파일을 선택하여 데이터를 불러옵니다</li>
        <li>⚠️ <strong>주의:</strong> 가져오기 후에는 현재 계산된 값이 기준값으로 자동 설정되어 증감이 0으로 표시됩니다. 기준값을 변경하려면 <strong>저장</strong> 버튼을 클릭하세요</li>
        <li>가져오기/붙여넣기 시 환수 정보(이름, 레벨), 각인 정보, 사용중 환수, 전체 스탯만 처리되며, 계산된 값들은 페이지에서 자동으로 계산됩니다</li>
      </ul>

      <h3>💡 사용 팁</h3>
      <ul>
        <li>프로파일을 활용하여 PvP용, PvE용 등 다양한 설정을 따로 관리하세요</li>
        <li>스탯을 입력한 후 반드시 <strong>저장</strong> 버튼을 클릭해야 증감 기능이 정상 작동합니다</li>
        <li>환수 레벨을 변경하면 즉시 스탯 증감이 반영됩니다</li>
        <li>각인 설정은 환수별로 독립적으로 저장되며, 프로파일별로 관리됩니다</li>
        <li>데이터를 백업하려면 <strong>데이터</strong> 메뉴에서 JSON 또는 CSV로 내보내기를 사용하세요</li>
        <li>다른 기기나 브라우저에서도 동일한 설정을 사용하려면 내보낸 파일을 가져오기로 불러오세요</li>
        <li>우측 하단의 <strong>?</strong> 도움말 버튼을 클릭하면 상세한 사용 가이드를 확인할 수 있습니다</li>
      </ul>
    </div>
  `}function Q(){e.imageObserver&&(e.imageObserver.disconnect(),e.imageObserver=null),e.imageLoadErrors.clear(),e.imageLoadErrorShown=!1,j(),H(),Object.keys(o).forEach(t=>{delete o[t]})}export{Q as cleanup,it as getHelpContentHTML,at as init};
