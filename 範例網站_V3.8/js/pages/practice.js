AppEvents.on('page:initialize',({page})=>{
  if(page!=='practice')return;
  PageBootstrap.openPracticeFromQuery();
});
