
(function(){
  let ctx=null, buffers=new Map(), ready=false;
  const sampleNotes=['A0','C1','D#1','F#1','A1','C2','D#2','F#2','A2','C3','D#3','F#3','A3','C4','D#4','F#4','A4','C5','D#5','F#5','A5','C6','D#6','F#6','A6','C7','D#7','F#7','A7','C8'];
  const semi={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};

  function noteToMidi(n){
    const m=String(n).match(/^([A-G])(#?)(-?\d)$/);
    return m?(Number(m[3])+1)*12+semi[m[1]+m[2]]:60;
  }
  function midiToNote(m){
    const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    return names[(m%12+12)%12]+(Math.floor(m/12)-1);
  }
  function freqToMidi(freq){
    return Math.round(69+12*Math.log2(freq/440));
  }
  function nearest(m){
    let best=60,d=999;
    for(const [x] of buffers){
      const q=Math.abs(x-m);
      if(q<d){d=q;best=x}
    }
    return best;
  }
  async function init(){
    if(!ctx)ctx=new (window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==='suspended')await ctx.resume();
    return ctx;
  }
  async function load(){
    if(ready)return true;
    const c=await init();
    let ok=0;
    for(const n of sampleNotes){
      try{
        const url=AppBase+'assets/piano/'+n.replace('#','s')+'.mp3';
        const ab=await fetch(url).then(r=>{if(!r.ok)throw new Error(url);return r.arrayBuffer()});
        buffers.set(noteToMidi(n),await c.decodeAudioData(ab));
        ok++;
      }catch(e){}
    }
    ready=ok>0;
    if(!ready)ErrorClient.report('Audio','鋼琴 sample 載入失敗');
    return ready;
  }
  async function play(note,velocity=.8,delaySec=0,duration=.8){
    if(!ready)await load();
    if(!ready)return false;
    const c=await init(), midi=noteToMidi(note), base=nearest(midi), buffer=buffers.get(base);
    if(!buffer)return false;

    const source=c.createBufferSource(), gain=c.createGain();
    source.buffer=buffer;
    source.playbackRate.value=Math.pow(2,(midi-base)/12);
    const start=c.currentTime+Math.max(0,Number(delaySec)||0);
    const dur=Math.max(.08,Number(duration)||.8);
    gain.gain.setValueAtTime(Math.max(.04,Math.min(1,velocity)),start);
    gain.gain.exponentialRampToValueAtTime(.001,start+dur);
    source.connect(gain).connect(c.destination);
    source.start(start);
    source.stop(start+dur+.08);
    return true;
  }
  async function click(accent=false,delaySec=0){
    const c=await init();
    const osc=c.createOscillator(), gain=c.createGain();
    const start=c.currentTime+Math.max(0,Number(delaySec)||0);
    osc.type='sine';
    osc.frequency.setValueAtTime(accent?1450:1050,start);
    gain.gain.setValueAtTime(accent?.12:.07,start);
    gain.gain.exponentialRampToValueAtTime(.001,start+.055);
    osc.connect(gain).connect(c.destination);
    osc.start(start);osc.stop(start+.065);
  }

  window.AudioEngine={
    init,load,play,click,
    isReady:()=>ready,
    context:()=>ctx,
    noteToMidi,midiToNote,freqToMidi
  };
})();
