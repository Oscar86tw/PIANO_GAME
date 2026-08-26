/* V3.6 OWNER: audio */
window.AudioModule={
  started:false,
  async start(){if(this.started)return;this.started=true;AppEvents.emit('audio:module-ready')},
  async stop(){this.started=false},
  voice(id){return AppEvents.emit('audio:voice',{id})},
  quality(quality){return AppEvents.emit('audio:quality',{quality})},
  packs(){return AppEvents.emit('audio:packs:render')},
  health(){return ModuleHealth?.check?.()}
};
