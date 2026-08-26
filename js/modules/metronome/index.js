
window.Metronome={
  running:false,timer:null,bpm:80,beat:0,timeSig:4,
  async start(bpm=80,timeSig=4){
    this.stop();
    this.running=true;this.bpm=Number(bpm)||80;this.timeSig=Number(timeSig)||4;this.beat=0;
    await AudioEngine.init();
    const tick=()=>{
      if(!this.running)return;
      AudioEngine.click(this.beat%this.timeSig===0);
      Events.emit('metronome:beat',{beat:this.beat,bpm:this.bpm});
      this.beat++;
    };
    tick();
    this.timer=setInterval(tick,60000/this.bpm);
    Events.emit('metronome:status',{on:true,bpm:this.bpm});
  },
  stop(){
    this.running=false;
    if(this.timer)clearInterval(this.timer);
    this.timer=null;
    Events.emit('metronome:status',{on:false,bpm:this.bpm});
  },
  toggle(bpm,timeSig=4){
    return this.running?this.stop():this.start(bpm,timeSig);
  }
};
