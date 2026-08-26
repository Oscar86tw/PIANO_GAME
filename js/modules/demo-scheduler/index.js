window.DemoScheduler={
  enabled:false,timeline:[],timer:null,nextIndex:0,handles:[],lookAheadSec:.10,

  async enable(eventsOrTimeline){
    this.enabled=true;
    this.timeline=Array.isArray(eventsOrTimeline)&&eventsOrTimeline.length&&eventsOrTimeline[0]?.startBeat!=null
      ? eventsOrTimeline
      : EventTimeline.build(eventsOrTimeline||[]);
    await AudioEngine.preload();
    this.resetSchedule();
    this.scheduler();
  },

  disable(){
    this.enabled=false;
    if(this.timer)clearTimeout(this.timer);
    this.timer=null;this.cancelScheduled();
  },

  cancelScheduled(){
    this.handles.forEach(h=>AudioEngine.stopHandle(h));
    this.handles=[];
  },

  resetSchedule(){
    this.cancelScheduled();
    const beat=TransportMaster.currentBeat();
    this.nextIndex=this.timeline.findIndex(x=>x.startBeat>=beat-.01);
    if(this.nextIndex<0)this.nextIndex=this.timeline.length;
  },

  async scheduler(){
    if(!this.enabled)return;
    if(!TransportMaster.isRunning()){
      this.timer=setTimeout(()=>this.scheduler(),30);return;
    }
    const c=AudioEngine.context();
    if(!c){this.timer=setTimeout(()=>this.scheduler(),30);return}

    while(this.nextIndex<this.timeline.length){
      const row=this.timeline[this.nextIndex];
      const when=TransportMaster.ctxTimeForBeat(row.startBeat);
      if(when>c.currentTime+this.lookAheadSec)break;

      if(when>=c.currentTime-.025 && row.note!=='REST'){
        const arr=Array.isArray(row.note)?row.note:[row.note];
        const sec=Math.max(.08,row.duration*TransportMaster.beatDuration()*.88);
        for(const n of arr){
          const h=await AudioEngine.play(n,.72,Math.max(0,when-c.currentTime),sec);
          if(h)this.handles.push(h);
        }
      }
      this.nextIndex++;
    }

    this.handles=this.handles.filter(h=>h.start>c.currentTime-.2);
    this.timer=setTimeout(()=>this.scheduler(),20);
  }
};

['tempo','seek','resume','start'].forEach(name=>Events.on('transport:'+name,()=>{
  if(DemoScheduler.enabled)DemoScheduler.resetSchedule();
}));
Events.on('transport:pause',()=>{if(DemoScheduler.enabled)DemoScheduler.cancelScheduled()});
Events.on('transport:stop',()=>DemoScheduler.disable());