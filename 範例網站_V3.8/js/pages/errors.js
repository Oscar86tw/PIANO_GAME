function escapeEvent(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function renderEventHistory(){
  const root=document.getElementById('eventHistoryList');
  if(!root||!window.AppEvents)return;
  const rows=AppEvents.getHistory().slice(-40).reverse();
  root.innerHTML='';
  if(!rows.length){
    root.innerHTML='<div class="error-log-empty">尚無模組事件。</div>';
    return;
  }
  rows.forEach(row=>{
    const div=document.createElement('div');
    div.className='event-history-row';
    const t=new Date(row.meta.at).toLocaleTimeString('zh-TW',{hour12:false});
    div.innerHTML=`<strong>${row.meta.type}</strong><span>${row.meta.module} · ${t}</span><code>${escapeEvent(JSON.stringify(row.payload))}</code>`;
    root.appendChild(div);
  });
}
document.getElementById('refreshEventHistoryBtn')?.addEventListener('click',renderEventHistory);

AppEvents.on('module:loaded',renderEventHistory);
AppEvents.on('module:started',renderEventHistory);

AppEvents.on('page:initialize',({page})=>{
  if(page!=='errors')return;
  PageBootstrap.openPracticeFromQuery();
  setTimeout(()=>{
    const modal=document.getElementById('errorMonitorModal');
    if(modal){
      modal.hidden=false;
      if(typeof renderErrorMonitor==='function')renderErrorMonitor();
    }
    renderEventHistory();
  },80);
});


function renderLazyModuleStatus(){
  const root=document.getElementById('lazyModuleStatus');
  if(!root||!window.ModuleLoader)return;
  const s=ModuleLoader.status();
  root.innerHTML=`
    <div><small>本頁需要</small><b>${(s.required||[]).join(' + ')||'core only'}</b></div>
    <div><small>已下載</small><b>${(s.loaded||[]).join(' + ')||'core only'}</b></div>
    <div><small>已啟動</small><b>${(s.started||[]).join(' + ')||'無'}</b></div>
    <div><small>載入中</small><b>${(s.loading||[]).join(' + ')||'無'}</b></div>`;
}
document.getElementById('refreshLazyStatusBtn')?.addEventListener('click',renderLazyModuleStatus);
AppEvents.on('module:loaded',renderLazyModuleStatus);
AppEvents.on('module:started',renderLazyModuleStatus);
AppEvents.on('app:modules-ready',renderLazyModuleStatus);
