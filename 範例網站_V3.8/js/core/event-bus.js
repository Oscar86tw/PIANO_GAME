
(function(){
  const listeners=new Map(), history=[];
  const MAX_HISTORY=100;

  function on(type,fn){
    if(!listeners.has(type))listeners.set(type,new Set());
    listeners.get(type).add(fn);
    return ()=>off(type,fn);
  }
  function once(type,fn){
    const un=on(type,(payload,meta)=>{un();fn(payload,meta)});
    return un;
  }
  function off(type,fn){listeners.get(type)?.delete(fn)}
  function emit(type,payload={}){
    const meta={type,at:Date.now(),module:window.PAGE_MODULE||'unknown'};
    history.push({meta,payload});
    if(history.length>MAX_HISTORY)history.shift();
    for(const fn of [...(listeners.get(type)||[])]){
      try{fn(payload,meta)}
      catch(err){
        console.error('[AppEvents]',type,err);
        try{window.reportAppError?.('EventBus',err,{title:`事件 ${type} 處理失敗`})}catch(e){}
      }
    }
    return meta;
  }
  window.AppEvents={
    on,once,off,emit,
    getHistory:()=>history.slice(),
    clearHistory:()=>{history.length=0}
  };
})();
