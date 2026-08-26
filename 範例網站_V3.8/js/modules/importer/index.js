/* V3.6 OWNER: importer */
window.ImportModule={
  started:false,
  async start(){if(this.started)return;this.started=true;if(typeof loadPhotoScores==='function')await loadPhotoScores();AppEvents.emit('importer:module-ready')},
  async stop(){this.started=false},
  reloadPhotos(){return typeof loadPhotoScores==='function'?loadPhotoScores():null},
  health(){return ModuleHealth?.check?.()}
};
