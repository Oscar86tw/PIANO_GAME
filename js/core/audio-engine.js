
(function(){
  let ctx=null,buffers=new Map(),ready=false,loadingPromise=null;
  let masterGain=null,pianoGain=null,metroGain=null;

  const sampleNotes=['A0','C1','D#1','F#1','A1','C2','D#2','F#2','A2','C3','D#3','F#3','A3','C4','D#4','F#4','A4','C5','D#5','F#5','A5','C6','D#6','F#6','A6','C7','D#7','F#7','A7','C8'];
  const semi={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};

  const VOL_KEY='piano-audio-mixer-v55';
  let volumes={master:1,piano:1.35,metronome:.72};

  function loadVolumes(){
    try{
      const x=JSON.parse(localStorage.getItem(VOL_KEY)||'null');
      if(x&&typeof x==='object'){
        volumes.master=Number.isFinite(Number(x.master))?Number(x.master):volumes.master;
        volumes.piano=Number.isFinite(Number(x.piano))?Number(x.piano):volumes.piano;
        volumes.metronome=Number.isFinite(Number(x.metronome))?Number(x.metronome):volumes.metronome;
      }
    }catch(e){}
    volumes.master=Math.max(0,Math.min(1.5,volumes.master));
    volumes.piano=Math.max(0,Math.min(2,volumes.piano));
    volumes.metronome=Math.max(0,Math.min(1.5,volumes.metronome));
  }
  loadVolumes();

  function parseNote(n){
    const m=String(n).trim().match(/^([A-G])([#b]?)(-?\d)$/);
    return m?{name:m[1]+m[2],octave:Number(m[3])}:null;
  }
  function noteToMidi(n){
    const p=parseNote(n);
    if(!p||semi[p.name]==null)return 60;
    return (p.octave+1)*12+semi[p.name];
  }
  function midiToNote(m){
    const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    return names[(m%12+12)%12]+(Math.floor(m/12)-1);
  }
  function freqToMidi(freq){return Math.round(69+12*Math.log2(freq/440))}
  function nearest(m){
    let best=null,d=Infinity;
    for(const [x] of buffers){const q=Math.abs(x-m);if(q<d){d=q;best=x}}
    return best;
  }

  function applyVolumes(){
    if(!ctx)return;
    const t=ctx.currentTime;
    masterGain?.gain?.setTargetAtTime(volumes.master,t,.01);
    pianoGain?.gain?.setTargetAtTime(volumes.piano,t,.01);
    metroGain?.gain?.setTargetAtTime(volumes.metronome,t,.01);
  }

  async function init(){
    if(!ctx){
      ctx=new (window.AudioContext||window.webkitAudioContext)();
      masterGain=ctx.createGain();
      pianoGain=ctx.createGain();
      metroGain=ctx.createGain();
      pianoGain.connect(masterGain);
      metroGain.connect(masterGain);
      masterGain.connect(ctx.destination);
      applyVolumes();
    }
    if(ctx.state==='suspended')await ctx.resume();
    return ctx;
  }

  async function load(){
    if(ready)return true;
    if(loadingPromise)return loadingPromise;
    loadingPromise=(async()=>{
      const c=await init();
      const rows=await Promise.all(sampleNotes.map(async n=>{
        try{
          const url=AppBase+'assets/piano/'+n.replace('#','s')+'.mp3';
          const ab=await fetch(url,{cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error(`${r.status} ${url}`);return r.arrayBuffer()});
          const decoded=await c.decodeAudioData(ab);
          return {midi:noteToMidi(n),buffer:decoded,note:n,ok:true};
        }catch(error){return {note:n,ok:false,error:String(error?.message||error)}}
      }));
      buffers.clear();rows.filter(x=>x.ok).forEach(x=>buffers.set(x.midi,x.buffer));
      ready=buffers.size>0;
      Events.emit('audio:health',health());
      if(!ready)ErrorClient.report('Audio','所有鋼琴 sample 都載入失敗，將使用合成音 fallback');
      return ready;
    })();
    try{return await loadingPromise}finally{loadingPromise=null}
  }

  function synth(note,velocity=.8,delaySec=0,duration=.5){
    if(!ctx)return null;
    const midi=noteToMidi(note),freq=440*Math.pow(2,(midi-69)/12);
    const osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
    const start=ctx.currentTime+Math.max(0,Number(delaySec)||0),dur=Math.max(.08,Number(duration)||.5);
    osc.type='triangle';osc.frequency.setValueAtTime(freq,start);
    filter.type='lowpass';filter.frequency.setValueAtTime(2600,start);
    gain.gain.setValueAtTime(.0001,start);
    gain.gain.exponentialRampToValueAtTime(Math.max(.04,Math.min(.42,velocity*.34)),start+.012);
    gain.gain.exponentialRampToValueAtTime(.0001,start+dur);
    osc.connect(filter).connect(gain).connect(pianoGain);
    osc.start(start);osc.stop(start+dur+.04);
    return {source:osc,gain,start,note,fallback:true};
  }

  async function play(note,velocity=.92,delaySec=0,duration=.8){
    await init();await load();
    const midi=noteToMidi(note),base=nearest(midi),buffer=base==null?null:buffers.get(base);
    if(!buffer)return synth(note,velocity,delaySec,duration);

    const source=ctx.createBufferSource(),gain=ctx.createGain();
    source.buffer=buffer;source.playbackRate.value=Math.pow(2,(midi-base)/12);
    const start=ctx.currentTime+Math.max(0,Number(delaySec)||0),dur=Math.max(.08,Number(duration)||.8);
    gain.gain.setValueAtTime(Math.max(.08,Math.min(1.35,velocity)),start);
    gain.gain.exponentialRampToValueAtTime(.001,start+dur);
    source.connect(gain).connect(pianoGain);
    source.start(start);source.stop(start+dur+.08);
    return {source,gain,start,note,baseMidi:base,fallback:false};
  }

  async function click(accent=false,delaySec=0){
    await init();
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    const start=ctx.currentTime+Math.max(0,Number(delaySec)||0);
    osc.type='sine';osc.frequency.setValueAtTime(accent?1450:1050,start);
    gain.gain.setValueAtTime(accent?.16:.10,start);
    gain.gain.exponentialRampToValueAtTime(.001,start+.055);
    osc.connect(gain).connect(metroGain);
    osc.start(start);osc.stop(start+.065);
    return {source:osc,gain,start};
  }

  function setVolume(type,value){
    if(!(type in volumes))return volumes;
    volumes[type]=Math.max(0,Math.min(type==='piano'?2:1.5,Number(value)||0));
    try{localStorage.setItem(VOL_KEY,JSON.stringify(volumes))}catch(e){}
    applyVolumes();
    Events.emit('audio:volume',{...volumes});
    return {...volumes};
  }
  function getVolumes(){return {...volumes}}
  function stopHandle(h){try{h?.source?.stop?.()}catch(e){}}
  function health(){
    return {ready,loadedSamples:buffers.size,expectedSamples:sampleNotes.length,fallbackAvailable:true,volumes:getVolumes()};
  }

  window.AudioEngine={
    init,load,preload:load,play,click,stopHandle,health,
    setVolume,getVolumes,
    isReady:()=>ready,context:()=>ctx,
    noteToMidi,midiToNote,freqToMidi
  };
})();
