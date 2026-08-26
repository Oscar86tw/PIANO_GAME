
(function(){
  let state={
    running:false,
    bpm:80,
    anchorBeat:0,
    anchorTime:0,
    pausedBeat:0,
    generation:0
  };

  async function ensure(){return AudioEngine.init()}
  function clampBpm(v){return Math.max(30,Math.min(240,Number(v)||80))}
  function ctx(){return AudioEngine.context()}

  function currentBeat(atTime=null){
    if(!state.running)return state.pausedBeat;
    const c=ctx();if(!c)return state.anchorBeat;
    const now=atTime==null?c.currentTime:atTime;
    return state.anchorBeat+(now-state.anchorTime)*state.bpm/60;
  }

  async function start(bpm=80,beat=0){
    const c=await ensure();
    state.bpm=clampBpm(bpm);
    state.anchorBeat=Math.max(0,Number(beat)||0);
    state.pausedBeat=state.anchorBeat;
    state.anchorTime=c.currentTime+.06;
    state.running=true;
    state.generation++;
    Events.emit('transport:start',snapshot());
    return snapshot();
  }

  async function resume(){
    if(state.running)return snapshot();
    const c=await ensure();
    state.anchorBeat=state.pausedBeat;
    state.anchorTime=c.currentTime+.04;
    state.running=true;
    state.generation++;
    Events.emit('transport:resume',snapshot());
    return snapshot();
  }

  function pause(){
    if(!state.running)return snapshot();
    state.pausedBeat=Math.max(0,currentBeat());
    state.running=false;state.generation++;
    Events.emit('transport:pause',snapshot());
    return snapshot();
  }

  function stop(){
    state.running=false;state.anchorBeat=0;state.pausedBeat=0;state.generation++;
    Events.emit('transport:stop',snapshot());
  }

  function seek(beat=0){
    const b=Math.max(0,Number(beat)||0),c=ctx();
    state.pausedBeat=b;state.anchorBeat=b;
    if(state.running&&c)state.anchorTime=c.currentTime;
    state.generation++;
    Events.emit('transport:seek',snapshot());
    return snapshot();
  }

  function setBpm(next){
    const bpm=clampBpm(next),c=ctx(),beat=currentBeat();
    state.bpm=bpm;state.pausedBeat=beat;state.anchorBeat=beat;
    if(state.running&&c)state.anchorTime=c.currentTime;
    state.generation++;
    Events.emit('transport:tempo',snapshot());
    return snapshot();
  }

  function ctxTimeForBeat(beat){
    const c=ctx();if(!c)return 0;
    if(!state.running)return c.currentTime;
    return state.anchorTime+(Number(beat)-state.anchorBeat)*60/state.bpm;
  }

  function beatDuration(){return 60/state.bpm}
  function snapshot(){
    return {running:state.running,bpm:state.bpm,beat:currentBeat(),generation:state.generation};
  }

  window.TransportMaster={
    start,resume,pause,stop,seek,setBpm,currentBeat,ctxTimeForBeat,beatDuration,snapshot,
    isRunning:()=>state.running,bpm:()=>state.bpm,generation:()=>state.generation
  };
})();
