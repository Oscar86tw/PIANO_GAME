
window.Metronome={
  enabled:false,timer:null,nextBeat:null,timeSig:4,handles:[],lookAheadSec:.09,

  async enable(timeSig=4){
    this.enabled=true;this.timeSig=Number(timeSig)||4;
    await AudioEngine.init();
    this.resetSchedule();
    this.scheduler();
    Events.emit('metronome:status',{on:true,bpm:TransportMaster.bpm()});
  },
  disable(){
    this.enabled=false;
    if(this.timer)clearTimeout(this.timer);this.timer=null;
    this.cancelScheduled();this.nextBeat=null;
    Events.emit('metronome:status',{on:false,bpm:TransportMaster.bpm()});
  },
  get running(){return this.enabled},
  start(_bpm=80,timeSig=4){return this.enable(timeSig)},
  stop(){return this.disable()},
  toggle(_bpm,timeSig=4){return this.enabled?this.disable():this.enable(timeSig)},

  cancelScheduled(){
    this.handles.forEach(h=>AudioEngine.stopHandle(h));
    this.handles=[];
  },
  resetSchedule(){
    this.cancelScheduled();
    const beat=TransportMaster.currentBeat();
    this.nextBeat=Math.max(0,Math.ceil(beat-1e-5));
  },
  async scheduler(){
    if(!this.enabled)return;
    if(!TransportMaster.isRunning()){
      this.timer=setTimeout(()=>this.scheduler(),35);return;
    }
    const c=AudioEngine.context();
    if(!c){this.timer=setTimeout(()=>this.scheduler(),35);return}
    const nowBeat=TransportMaster.currentBeat();
    if(this.nextBeat==null||this.nextBeat<nowBeat-.25)this.nextBeat=Math.ceil(nowBeat);

    while(true){
      const when=TransportMaster.ctxTimeForBeat(this.nextBeat);
      if(when>c.currentTime+this.lookAheadSec)break;
      if(when>=c.currentTime-.02){
        const h=await AudioEngine.click(this.nextBeat%this.timeSig===0,Math.max(0,when-c.currentTime));
        if(h)this.handles.push(h);
        Events.emit('metronome:beat',{beat:this.nextBeat,bpm:TransportMaster.bpm()});
      }
      this.nextBeat++;
    }
    this.handles=this.handles.filter(h=>h.start>c.currentTime-.1);
    this.timer=setTimeout(()=>this.scheduler(),25);
  }
};

Events.on('transport:tempo',()=>{if(Metronome.enabled)Metronome.resetSchedule()});
Events.on('transport:seek',()=>{if(Metronome.enabled)Metronome.resetSchedule()});
Events.on('transport:pause',()=>{if(Metronome.enabled)Metronome.cancelScheduled()});
Events.on('transport:resume',()=>{if(Metronome.enabled)Metronome.resetSchedule()});
Events.on('transport:start',()=>{if(Metronome.enabled)Metronome.resetSchedule()});
