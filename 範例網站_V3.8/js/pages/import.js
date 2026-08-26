AppEvents.on('page:initialize',({page})=>{
  if(page!=='import')return;
  PageBootstrap.init('import');
  ImportModule?.reloadPhotos?.();
});
