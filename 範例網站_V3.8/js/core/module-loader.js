
(function(){
  const loaded=new Set(), loading=new Map(), started=new Set();

  const defs={
    home:{deps:[],global:null,src:null},
    library:{deps:[],global:'LibraryModule',src:'js/modules/library/index.js'},
    importer:{deps:[],global:'ImportModule',src:'js/modules/importer/index.js'},
    practice:{deps:['audio','errors'],global:'PracticeModule',src:'js/modules/practice/index.js'},
    audio:{deps:[],global:'AudioModule',src:'js/modules/audio/index.js'},
    ai:{deps:[],global:'AICoachModule',src:'js/modules/ai/index.js'},
    errors:{deps:[],global:'ErrorModule',src:'js/modules/errors/index.js'}
  };

  function moduleUrl(name){
    const def=defs[name];
    if(!def?.src)return null;
    return (window.APP_BASE||'')+def.src+'?v=3.7';
  }

  function loadScript(name){
    const def=defs[name];
    if(!def) return Promise.reject(new Error(`未知模組：${name}`));
    if(!def.src){loaded.add(name);return Promise.resolve(true)}
    if(loaded.has(name) || (def.global && window[def.global])){
      loaded.add(name);return Promise.resolve(true);
    }
    if(loading.has(name))return loading.get(name);

    const promise=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src=moduleUrl(name);
      s.async=true;
      s.dataset.lazyModule=name;
      s.onload=()=>{
        if(def.global && !window[def.global]){
          reject(new Error(`模組 ${name} 已下載，但沒有建立 ${def.global}`));
          return;
        }
        loaded.add(name);
        AppEvents.emit('module:loaded',{name,src:s.src});
        resolve(true);
      };
      s.onerror=()=>reject(new Error(`模組檔案載入失敗：${name} (${s.src})`));
      document.head.appendChild(s);
    }).finally(()=>loading.delete(name));

    loading.set(name,promise);
    return promise;
  }

  async function start(name){
    if(started.has(name))return true;
    const def=defs[name];
    if(!def)throw new Error(`未知模組：${name}`);

    for(const dep of def.deps)await start(dep);
    await loadScript(name);

    const api=def.global?window[def.global]:null;
    if(def.global&&!api)throw new Error(`模組 API 未載入：${def.global}`);
    if(api?.start)await api.start();

    started.add(name);
    AppEvents.emit('module:started',{name});
    return true;
  }

  async function stop(name){
    if(!started.has(name))return;
    const def=defs[name],api=def?.global?window[def.global]:null;
    if(api?.stop)await api.stop();
    started.delete(name);
    AppEvents.emit('module:stopped',{name});
  }

  function requiredForPage(page=window.PAGE_MODULE||'home'){
    return ({
      home:['home'],
      library:['library'],
      import:['importer'],
      progress:['ai'],
      practice:['practice','ai'],
      sound:['audio','errors'],
      errors:['errors','practice']
    })[page]||[];
  }

  async function startForPage(){
    const names=requiredForPage();
    for(const name of names)await start(name);
    return [...started];
  }

  window.ModuleLoader={
    loadScript,start,stop,startForPage,requiredForPage,
    status:()=>({
      page:window.PAGE_MODULE||'home',
      required:requiredForPage(),
      loaded:[...loaded],
      loading:[...loading.keys()],
      started:[...started],
      available:Object.keys(defs)
    })
  };
})();
