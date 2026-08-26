/* V3.6 OWNER: ai */
window.AICoachModule={
  started:false,
  async start(){if(this.started)return;this.started=true;AppEvents.emit('ai:module-ready')},
  async stop(){this.started=false},
  coach(){return AppEvents.emit('ai:coach:render')},
  adaptive(){return AppEvents.emit('ai:adaptive:render')},
  health(){return ModuleHealth?.check?.()}
};
