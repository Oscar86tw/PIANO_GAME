
(function(){
  window.MODULAR_NAVIGATION_ACTIVE=true;

  function routeForTab(tab){
    const r=window.MODULE_ROUTES||{};
    return ({
      courses:r.home,
      songs:r.library,
      import:r.importer,
      quick:r.practice,
      progress:r.progress
    })[tab]||null;
  }

  document.addEventListener('click',function(e){
    const tab=e.target.closest('.home-tabs .tab');
    if(!tab)return;
    const target=routeForTab(tab.dataset.tab);
    if(!target)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    location.href=target;
  },true);

  window.ModularNavigation={
    go(name){
      if(window.AppEvents)return AppEvents.emit('navigate:module',{name});
      const url=(window.MODULE_ROUTES||{})[name];
      if(url)location.href=url;
    }
  };
})();
