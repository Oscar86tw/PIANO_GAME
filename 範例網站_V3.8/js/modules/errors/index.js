
/* V3.8 OWNER: errors
   Full error monitor UI/persistence presentation extracted from app-core.js.
   Core keeps only error-client.js so every page can still report failures.
*/
(function(){
  let started=false;
  let toastTimer=null;
  const $=id=>document.getElementById(id);

  function records(){return window.AppErrorClient?.all?.()||[]}

  function safeText(s){
    return String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function format(rec){
    if(!rec)return '目前沒有錯誤紀錄。';
    return [
      'PIANO LEARNING 錯誤回報',
      '版本：'+rec.version,
      '時間：'+rec.localTime,
      '功能：'+rec.area,
      '標題：'+rec.title,
      '錯誤：'+rec.message,
      '建議：'+rec.advice,
      '網址：'+rec.url,
      '瀏覽器：'+rec.userAgent,
      rec.stack?'詳細：\n'+rec.stack:''
    ].filter(Boolean).join('\n');
  }

  async function copy(text){
    const status=$('errorCopyStatus');
    try{
      await navigator.clipboard.writeText(text);
      if(status)status.textContent='已複製，可以直接貼給 AI。';
    }catch(e){
      if(status)status.textContent='瀏覽器不允許自動複製，請手動選取詳細錯誤。';
    }
  }

  function showToast(rec){
    const toast=$('appErrorToast');
    if(!toast)return;
    clearTimeout(toastTimer);
    if($('appErrorToastArea'))$('appErrorToastArea').textContent=rec.area;
    if($('appErrorToastTitle'))$('appErrorToastTitle').textContent=rec.title;
    if($('appErrorToastMessage'))$('appErrorToastMessage').textContent=rec.message;
    toast.hidden=false;
    toastTimer=setTimeout(()=>{toast.hidden=true},8000);
  }

  function render(){
    const root=$('errorLogList');
    const rows=records();
    const n=rows.length,latest=rows[n-1];

    if($('errorCountBadge'))$('errorCountBadge').textContent=String(n);
    $('errorMonitorBtn')?.classList.toggle('has-error',n>0);
    if($('errorTotalValue'))$('errorTotalValue').textContent=String(n);
    if($('errorLastTimeValue'))$('errorLastTimeValue').textContent=latest?.localTime||'—';
    if($('errorLastAreaValue'))$('errorLastAreaValue').textContent=latest?.area||'—';
    if($('errorHealthValue')){
      $('errorHealthValue').textContent=n?'有錯誤':'正常';
      $('errorHealthValue').classList.toggle('bad',n>0);
    }

    if(!root)return;
    root.innerHTML='';
    if(!n){
      root.innerHTML='<div class="error-log-empty">目前系統沒有偵測到錯誤。</div>';
      if($('errorCopyStatus'))$('errorCopyStatus').textContent='沒有錯誤紀錄。';
      return;
    }
    [...rows].reverse().forEach(rec=>{
      const row=document.createElement('article');
      row.className='error-log-item';
      row.innerHTML=`<div class="error-log-item-head"><strong>${safeText(rec.area)}｜${safeText(rec.title)}</strong><span>${safeText(rec.localTime)}</span></div>
        <div class="error-message">${safeText(rec.message)}</div>
        <div class="error-advice">建議：${safeText(rec.advice)}</div>
        <details><summary>顯示詳細錯誤</summary><pre>${safeText(rec.stack||'無 stack 資訊')}</pre></details>`;
      root.appendChild(row);
    });
  }

  function open(){
    const modal=$('errorMonitorModal');
    if(modal){modal.hidden=false;render()}
  }
  function close(){
    const modal=$('errorMonitorModal');
    if(modal)modal.hidden=true;
  }

  function bind(){
    $('errorMonitorBtn')?.addEventListener('click',open);
    $('closeErrorMonitorBtn')?.addEventListener('click',close);
    document.querySelectorAll('[data-close-error-monitor]').forEach(x=>x.addEventListener('click',close));

    $('openErrorFromToastBtn')?.addEventListener('click',()=>{
      if($('appErrorToast'))$('appErrorToast').hidden=true;
      open();
    });
    $('closeErrorToastBtn')?.addEventListener('click',()=>{
      if($('appErrorToast'))$('appErrorToast').hidden=true;
    });
    $('copyLatestErrorBtn')?.addEventListener('click',()=>copy(format(AppErrorClient.latest())));
    $('copyAllErrorsBtn')?.addEventListener('click',()=>{
      const rows=records();
      const text=rows.length?rows.map((x,i)=>`===== ERROR ${i+1} =====\n${format(x)}`).join('\n\n'):'目前沒有錯誤紀錄。';
      copy(text);
    });
    $('clearErrorsBtn')?.addEventListener('click',()=>{
      AppErrorClient.clear();
      render();
      if($('errorCopyStatus'))$('errorCopyStatus').textContent='錯誤紀錄已清除。';
    });
    $('repairScoreBtn')?.addEventListener('click',()=>{
      let ok=false;
      try{ok=typeof ensureScoreVisible==='function'&&ensureScoreVisible('錯誤監控手動修復',true)}
      catch(e){AppErrorClient.report('樂譜顯示',e,{title:'錯誤監控修復失敗'})}
      if($('errorCopyStatus'))$('errorCopyStatus').textContent=ok?'樂譜已重新建立，音符顯示正常。':'重新建立後仍異常，請複製錯誤資訊給 AI。';
    });
  }

  function onRecorded(e){
    render();
    if(e?.detail)showToast(e.detail);
  }

  window.ErrorModule={
    started:false,
    async start(){
      if(started)return;
      started=true;this.started=true;
      bind();
      render();
      window.addEventListener('piano:error-recorded',onRecorded);
      AppEvents?.emit?.('errors:module-ready',{count:records().length});
    },
    async stop(){
      started=false;this.started=false;
      window.removeEventListener('piano:error-recorded',onRecorded);
    },
    report(area,error,options){return AppErrorClient.report(area,error,options)},
    repairScore(){return AppEvents.emit('error:repair-score')},
    render,open,close,
    latest(){return AppErrorClient.latest()},
    all(){return records()},
    format,
    health(){return window.ModuleHealth?.check?.()}
  };

  // Compatibility APIs used by errors page bootstrap.
  window.renderErrorMonitor=render;
})();
