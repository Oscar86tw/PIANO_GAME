
(function(){
  function removeNode(id){
    const el=document.getElementById(id);
    if(el)el.remove();
  }

  function pruneHomePanels(keepPanel){
    ['coursesPanel','songsPanel','importPanel','quickPanel','progressPanel'].forEach(id=>{
      if(id!==keepPanel)removeNode(id);
    });
  }

  function pruneModals(module){
    if(module!=='sound') removeNode('soundPackModal');
    if(module!=='errors') removeNode('errorMonitorModal');

    // Toast is useful on every page, but keep the full error modal only on errors/practice.
    if(!['practice','errors','sound'].includes(module)){
      removeNode('appErrorToast');
    }
  }

  function isolate(){
    const module=window.PAGE_MODULE||'home';

    if(module==='home'){
      removeNode('practiceView');
      pruneHomePanels('coursesPanel');
    }else if(module==='library'){
      removeNode('practiceView');
      pruneHomePanels('songsPanel');
    }else if(module==='import'){
      removeNode('practiceView');
      pruneHomePanels('importPanel');
    }else if(module==='progress'){
      removeNode('practiceView');
      pruneHomePanels('progressPanel');
    }else{
      removeNode('homeView');
    }

    pruneModals(module);
    document.documentElement.dataset.isolated='true';
  }

  // Core legacy listeners are already attached when this script runs.
  // We prune after initialization so older code does not crash while binding IDs.
  window.addEventListener('DOMContentLoaded',()=>{
    setTimeout(isolate,0);
  });

  window.PageIsolation={run:isolate};
})();
