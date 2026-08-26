/* V3.6 OWNER: library */
window.LibraryModule={
  started:false,
  async start(){if(this.started)return;this.started=true;AppEvents.emit('library:render')},
  async stop(){this.started=false},
  render(){return AppEvents.emit('library:render')},
  health(){return ModuleHealth?.check?.()}
};
