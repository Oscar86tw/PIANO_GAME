AppEvents.on('page:initialize',({page})=>{
  if(page!=='progress')return;
  PageBootstrap.init('progress');
  if(typeof renderProgressPath==='function')renderProgressPath();
  AICoachModule?.adaptive?.();
});
