AppEvents.on('page:initialize',({page})=>{
  if(page!=='library')return;
  PageBootstrap.init('songs');
  LibraryModule?.render?.();
});
