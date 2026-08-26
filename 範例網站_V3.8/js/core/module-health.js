
(function(){
  const health={ok:true,module:null,missing:[],warnings:[],checkedAt:null};

  function visible(el){
    if(!el)return false;
    const st=getComputedStyle(el);
    return st.display!=='none'&&st.visibility!=='hidden';
  }

  function check(){
    const module=window.PAGE_MODULE||'home';
    const def=window.ModuleRegistry?.current?.();
    const missing=(def?.required||[]).filter(id=>!document.getElementById(id));
    const warnings=[];

    // Page ownership checks
    if(module==='practice'){
      if(!document.getElementById('scrollingScore'))warnings.push('右手譜面容器缺失');
      if(!document.getElementById('scrollingBassScore'))warnings.push('左手譜面容器缺失');
    }
    if(module==='library'&&!document.getElementById('songList'))warnings.push('曲庫列表沒有載入');
    if(module==='import'&&!document.getElementById('photoImportCard'))warnings.push('拍照樂譜模組沒有載入');
    if(module==='sound'&&!document.getElementById('soundPackList'))warnings.push('音色包列表沒有載入');

    // Unrelated active page checks
    const unrelated=[];
    if(module!=='practice' && document.getElementById('practiceView') && visible(document.getElementById('practiceView')))unrelated.push('practiceView');
    if(module!=='home' && document.getElementById('coursesPanel') && visible(document.getElementById('coursesPanel')))unrelated.push('coursesPanel');
    if(unrelated.length)warnings.push('非本頁模組仍在顯示：'+unrelated.join(', '));

    health.ok=missing.length===0&&warnings.length===0;
    health.module=module;
    health.missing=missing;
    health.warnings=warnings;
    health.checkedAt=new Date().toLocaleString('zh-TW',{hour12:false});
    const loader=window.ModuleLoader?.status?.();
    if(loader){
      const missingModules=(loader.required||[]).filter(name=>name!=='home'&&!loader.started.includes(name));
      if(missingModules.length){
        warnings.push('尚未啟動必要模組：'+missingModules.join(', '));
        health.ok=false;
        health.warnings=warnings;
      }
    }

    const text=document.getElementById('moduleHealthText');
    const btn=document.getElementById('moduleHealthBtn');
    if(text)text.textContent=health.ok?'OK':'ERROR';
    if(btn){
      btn.classList.toggle('is-ok',health.ok);
      btn.classList.toggle('is-error',!health.ok);
      const loaderInfo=window.ModuleLoader?.status?.();
      const lazyText=loaderInfo?`；已載入：${loaderInfo.loaded.join(', ')||'core only'}；已啟動：${loaderInfo.started.join(', ')||'無'}`:'';
      btn.title=health.ok?`${def?.label||module} 模組正常${lazyText}`:
        `缺少：${missing.join(', ')||'無'}；警告：${warnings.join(' / ')||'無'}${lazyText}`;
    }

    if(!health.ok && typeof window.reportAppError==='function'){
      try{
        window.reportAppError('Module Health',
          `頁面 ${module} 模組檢查失敗`,
          {title:'模組初始化異常',detail:JSON.stringify({missing,warnings})});
      }catch(e){}
    }
    return {...health};
  }

  function show(){
    const h=check();
    const msg=h.ok
      ? `V3.5 Module Health：${h.module} 正常\n檢查時間：${h.checkedAt}`
      : `V3.5 Module Health：${h.module} 異常\n缺少：${h.missing.join(', ')||'無'}\n警告：${h.warnings.join(' / ')||'無'}\n檢查時間：${h.checkedAt}`;
    alert(msg);
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('#moduleHealthBtn'))show();
  });

  window.addEventListener('load',()=>setTimeout(check,120));

  window.ModuleHealth={check,show,state:health};
})();
