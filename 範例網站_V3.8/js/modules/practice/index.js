/* V3.6 OWNER: practice */
window.PracticeModule={
  started:false,
  async start(){if(this.started)return;this.started=true;AppEvents.emit('practice:module-ready')},
  async stop(){this.started=false},
  open(songId,label='PLAY'){return AppEvents.emit('practice:open',{songId,label})},
  render(){return AppEvents.emit('practice:render')},
  repair(){return AppEvents.emit('practice:repair')},
  ready(){return AppEvents.emit('practice:ready')},
  health(){return ModuleHealth?.check?.()}
};
