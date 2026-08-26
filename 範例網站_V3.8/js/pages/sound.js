AppEvents.on('page:initialize',({page})=>{
  if(page!=='sound')return;
  PageBootstrap.openPracticeFromQuery();
  setTimeout(()=>{
    const modal=document.getElementById('soundPackModal');
    if(modal){
      modal.hidden=false;
      AudioModule?.packs?.();
    }
  },80);
});
