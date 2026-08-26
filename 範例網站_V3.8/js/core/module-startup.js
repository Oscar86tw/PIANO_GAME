
(function(){
  async function boot(){
    try{
      AppEvents.emit('app:module-loading',{page:PAGE_MODULE,required:ModuleLoader.requiredForPage()});
      const started=await ModuleLoader.startForPage();
      AppEvents.emit('app:modules-ready',{started,page:PAGE_MODULE});

      // Page scripts listen to this and run only after their owned modules exist.
      AppEvents.emit('page:initialize',{page:PAGE_MODULE});

      setTimeout(()=>ModuleHealth?.check?.(),80);
    }catch(err){
      console.error(err);
      AppEvents.emit('error:report',{
        area:'ModuleLoader',
        error:err,
        options:{title:'模組按需載入失敗'}
      });
    }
  }
  window.addEventListener('load',()=>setTimeout(boot,20));
})();
