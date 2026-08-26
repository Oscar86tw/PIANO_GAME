AppEvents.on('page:initialize',({page})=>{
  if(page!=='home')return;
  PageBootstrap.init('courses');
});
