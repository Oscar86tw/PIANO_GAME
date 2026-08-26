
(function(){
  const safe=fn=>{try{return fn()}catch(e){AppEvents.emit('error:report',{area:'EventBridge',error:e});return null}};

  AppEvents.on('navigate:module',({name})=>{
    const url=(window.MODULE_ROUTES||{})[name];
    if(url)location.href=url;
  });

  AppEvents.on('practice:open',({songId,label='PLAY'})=>safe(()=>openPractice(songId,label)));
  AppEvents.on('practice:render',()=>safe(()=>renderStaticScore()));
  AppEvents.on('practice:repair',()=>safe(()=>ensureScoreVisible('event:repair',true)));
  AppEvents.on('practice:ready',()=>safe(()=>enterReadyState()));

  AppEvents.on('audio:voice',({id})=>safe(()=>setPianoVoice(id)));
  AppEvents.on('audio:quality',({quality})=>safe(()=>setPianoQuality(quality)));
  AppEvents.on('audio:packs:render',()=>safe(()=>renderSoundPackManager()));

  AppEvents.on('library:render',()=>safe(()=>renderSongList()));

  AppEvents.on('ai:coach:render',()=>safe(()=>renderAiCoach()));
  AppEvents.on('ai:adaptive:render',()=>safe(()=>renderAdaptiveReady()));

  AppEvents.on('error:report',({area,error,options})=>safe(()=>window.ErrorModule?.report?.(area,error,options||{})||window.AppErrorClient?.report?.(area,error,options||{})));
  AppEvents.on('error:repair-score',()=>safe(()=>ensureScoreVisible('event:error:repair-score',true)));

  window.EventBridge={ready:true};
})();
