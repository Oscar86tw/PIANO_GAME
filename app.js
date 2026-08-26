
const $=id=>document.getElementById(id);

const songs = {
  twinkle:{title:'Twinkle Twinkle Little Star',level:'Beginner',bpm:84,duration:48,notes:['C4','C4','G4','G4','A4','A4','G4','F4','F4','E4','E4','D4','D4','C4']},
  ode:{title:'Ode to Joy',level:'Easy',bpm:96,duration:52,notes:['E4','E4','F4','G4','G4','F4','E4','D4','C4','C4','D4','E4','E4','D4','D4']},
  mary:{title:'Mary Had a Little Lamb',level:'Beginner',bpm:88,duration:46,notes:['E4','D4','C4','D4','E4','E4','E4','D4','D4','D4','E4','G4','G4']},
  scale:{title:'C Major Scale',level:'Beginner',bpm:80,duration:40,notes:['C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4']},
  canon:{title:'Canon Theme',level:'Normal',bpm:92,duration:62,notes:['D4','A4','B4','F#4','G4','D4','G4','A4','D4','F#4','A4','B4']},
  sight:{title:'Sight Reading Practice',level:'Easy',bpm:90,duration:55,notes:['C4','E4','D4','F4','E4','G4','F4','A4','G4','E4','D4','C4']}
};

const library = [
  ['twinkle','Twinkle Twinkle Little Star','Beginner','00:48'],
  ['mary','Mary Had a Little Lamb','Beginner','00:46'],
  ['scale','C Major Scale','Beginner','00:40'],
  ['ode','Ode to Joy','Easy','00:52'],
  ['sight','Sight Reading Practice','Easy','00:55'],
  ['canon','Canon Theme','Normal','01:02']
];

let state = {
  song:'twinkle',running:false,paused:false,startAt:0,pauseStart:0,pauseTotal:0,
  speed:1,mode:'play',hand:'right',micStream:null,audioCtx:null,analyser:null,
  audioRaf:0,gameRaf:0,metroOn:false,metroTimer:null,assistTimer:null,assistBeat:0,
  judged:new Set(),goodStreak:0,tempoBpm:null,tempoManual:false,
  performanceLog:[],lastCapturedAt:0,currentTargetIndex:-1,demoSoundOn:false,pianoBuffers:new Map(),pianoLoading:false,pianoReady:false,demoPlayed:new Set(),demoVolume:0.45,pianoVoices:new Set()
};

function showView(name){
  $('homeView').classList.toggle('active',name==='home');
  $('practiceView').classList.toggle('active',name==='practice');
}

document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    $(btn.dataset.tab+'Panel').classList.add('active');
  });
});

function renderSongList(level='all'){
  const root=$('songList'); root.innerHTML='';
  library.filter(x=>level==='all'||x[2].toLowerCase()===level).forEach(([id,title,lvl,duration])=>{
    const b=document.createElement('button');
    b.className='song-row'; b.type='button';
    b.innerHTML=`<span><strong>${title}</strong><small>${songs[id].bpm} BPM</small></span><span class="level">${lvl}</span><span class="duration">${duration}</span>`;
    b.addEventListener('click',()=>openPractice(id,'PLAY'));
    root.appendChild(b);
  });
}
renderSongList();

document.querySelectorAll('.filter').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); renderSongList(btn.dataset.level);
  });
});
document.querySelectorAll('.course-card').forEach(btn=>{
  btn.addEventListener('click',()=>openPractice(btn.dataset.song,'LEARN'));
});
$('quickStart').addEventListener('click',()=>openPractice('sight','5 MIN'));

function openPractice(songId,label='PLAY'){
  state.song=songId; state.running=false; state.paused=false; state.pauseTotal=0; state.judged=new Set(); state.goodStreak=0;
  state.performanceLog=[]; state.lastCapturedAt=0; state.currentTargetIndex=-1; state.demoPlayed=new Set();
  state.tempoManual=false; state.tempoBpm=songs[songId].bpm;
  $('tempoInput').value=state.tempoBpm;
  $('practiceTitle').textContent=songs[songId].title;
  $('practiceModeLabel').textContent=label;
  showView('practice');
  renderStaticScore();
  setTimeout(startPractice,250);
}

$('backBtn').addEventListener('click',()=>{
  stopPractice(); showView('home');
});
$('pauseBtn').addEventListener('click',()=>{
  if(!state.running) return;
  state.paused=!state.paused;
  if(state.paused){
    state.pauseStart=performance.now(); stopMetronome(false); stopAllPianoVoices()
  }else{
    state.pauseTotal+=performance.now()-state.pauseStart;
    if(state.metroOn) startMetronome();
  }
});

$('speedSelect').addEventListener('change',()=>{
  state.speed=parseFloat($('speedSelect').value)||1;
  if(!state.tempoManual){ state.tempoBpm=songs[state.song].bpm; $('tempoInput').value=state.tempoBpm; }
  renderStaticScore(); restartPractice();
});
$('practiceMode').addEventListener('change',()=>{state.mode=$('practiceMode').value;});
$('handSelect').addEventListener('change',()=>{state.hand=$('handSelect').value;});
$('micBtn').addEventListener('click',startMicrophone);
$('metroBtn').addEventListener('click',()=>{
  state.metroOn=!state.metroOn;
  $('metroBtn').textContent='節拍器：'+(state.metroOn?'開':'關');
  if(state.metroOn && state.running && !state.paused) startMetronome(); else stopMetronome(false);
});

function setTempo(v,manual=true){
  const bpm=Math.max(30,Math.min(240,Math.round(Number(v)||songs[state.song].bpm)));
  state.tempoBpm=bpm; state.tempoManual=manual;
  $('tempoInput').value=bpm;
  if(state.metroOn && state.running && !state.paused) startMetronome();
  if(!$('rhythmAssist').hidden) $('assistBpm').textContent=effectiveBpm()+' BPM';
}
$('tempoInput').addEventListener('change',()=>setTempo($('tempoInput').value,true));
$('tempoMinus').addEventListener('click',()=>setTempo((state.tempoBpm||songs[state.song].bpm)-1,true));
$('tempoPlus').addEventListener('click',()=>setTempo((state.tempoBpm||songs[state.song].bpm)+1,true));
$('tempoReset').addEventListener('click',()=>setTempo(songs[state.song].bpm,false));


const LOCAL_PIANO_SAMPLES = [
  ['A0',21],['C1',24],['D#1',27],['F#1',30],
  ['A1',33],['C2',36],['D#2',39],['F#2',42],
  ['A2',45],['C3',48],['D#3',51],['F#3',54],
  ['A3',57],['C4',60],['D#4',63],['F#4',66],
  ['A4',69],['C5',72],['D#5',75],['F#5',78],
  ['A5',81],['C6',84],['D#6',87],['F#6',90],
  ['A6',93],['C7',96],['D#7',99],['F#7',102],
  ['A7',105],['C8',108]
];

function setSampleStatus(text,kind=''){
  const el=$('pianoSampleStatus');
  if(!el) return;
  el.textContent=text;
  el.className='sample-status'+(kind?' '+kind:'');
}

function ensureAudioContext(){
  if(!state.audioCtx){
    const AC=window.AudioContext||window.webkitAudioContext;
    state.audioCtx=new AC();
  }
  return state.audioCtx;
}

function noteToMidi(note){
  const names={'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11};
  const m=note.match(/^([A-G]#?)(-?\d)$/);
  if(!m) return 60;
  return (Number(m[2])+1)*12+names[m[1]];
}

function sampleFileFor(noteName){
  return 'assets/piano/'+noteName.replace('#','s')+'.mp3';
}

async function loadLocalPianoSamples(){
  if(state.pianoReady) return true;
  if(state.pianoLoading) return false;

  state.pianoLoading=true;
  setSampleStatus('本地鋼琴音色：載入中…','loading');
  const ctx=ensureAudioContext();

  try{
    await ctx.resume();
    let loaded=0;

    for(const [noteName,midi] of LOCAL_PIANO_SAMPLES){
      if(state.pianoBuffers.has(midi)){ loaded++; continue; }
      const res=await fetch(sampleFileFor(noteName),{cache:'force-cache'});
      if(!res.ok) throw new Error('Sample missing: '+noteName);
      const arr=await res.arrayBuffer();
      const buffer=await ctx.decodeAudioData(arr);
      state.pianoBuffers.set(midi,buffer);
      loaded++;
      setSampleStatus(`本地鋼琴音色：${loaded}/${LOCAL_PIANO_SAMPLES.length}`,'loading');
    }

    state.pianoReady=true;
    setSampleStatus('本地鋼琴音色：已就緒','ready');
    return true;
  }catch(err){
    console.error(err);
    state.pianoReady=false;
    setSampleStatus('本地鋼琴音色：載入失敗，請確認 assets/piano 已上傳','error');
    return false;
  }finally{
    state.pianoLoading=false;
  }
}

function nearestPianoSample(targetMidi){
  let best=null,bestDist=999;
  for(const [noteName,midi] of LOCAL_PIANO_SAMPLES){
    const d=Math.abs(targetMidi-midi);
    if(d<bestDist){ best={noteName,midi}; bestDist=d; }
  }
  return best;
}

function stopAllPianoVoices(){
  for(const voice of state.pianoVoices){
    try{voice.stop()}catch(e){}
  }
  state.pianoVoices.clear();
}

function playLocalPiano(note,velocity=0.85,duration=1.1){
  if(!state.demoSoundOn || !state.pianoReady) return;
  const ctx=ensureAudioContext();
  const targetMidi=noteToMidi(note);
  const sample=nearestPianoSample(targetMidi);
  const buffer=state.pianoBuffers.get(sample.midi);
  if(!buffer) return;

  const src=ctx.createBufferSource();
  const gain=ctx.createGain();
  src.buffer=buffer;
  src.playbackRate.value=Math.pow(2,(targetMidi-sample.midi)/12);
  gain.gain.value=Math.max(0,Math.min(1,state.demoVolume))*velocity;
  src.connect(gain).connect(ctx.destination);

  const now=ctx.currentTime;
  src.start(now);
  state.pianoVoices.add(src);

  // Gentle release without cutting the sample abruptly.
  gain.gain.setValueAtTime(gain.gain.value,now+Math.max(.15,duration*.65));
  gain.gain.exponentialRampToValueAtTime(.001,now+duration);
  src.stop(now+Math.min(buffer.duration/playbackRateSafe(src.playbackRate.value),duration+.25));
  src.onended=()=>state.pianoVoices.delete(src);
}

function playbackRateSafe(v){ return Math.max(.25,Math.min(4,v||1)); }

async function toggleDemoSound(){
  const btn=$('demoSoundBtn');

  if(!state.demoSoundOn){
    btn.disabled=true;
    btn.textContent='本地鋼琴載入中…';

    const ok=await loadLocalPianoSamples();
    btn.disabled=false;

    if(!ok){
      btn.textContent='譜面鋼琴聲：關';
      return;
    }

    state.demoSoundOn=true;
    state.demoPlayed=new Set();
    btn.textContent='譜面鋼琴聲：開';
    btn.classList.add('is-on');

    // Immediate test note, so the user knows audio is working.
    playLocalPiano('C4',0.9,1.0);
  }else{
    state.demoSoundOn=false;
    btn.textContent='譜面鋼琴聲：關';
    btn.classList.remove('is-on');
    state.demoPlayed=new Set();
    stopAllPianoVoices();
  }
}

$('demoSoundBtn').addEventListener('click',toggleDemoSound);

$('demoVolume').addEventListener('input',()=>{
  state.demoVolume=Math.max(0,Math.min(1,parseFloat($('demoVolume').value)||0));
});

function playScoreSample(note){
  playLocalPiano(note,0.86,1.0);
}

function scoreBpm(){ return Math.max(30,Math.round(songs[state.song].bpm*state.speed)); }
function effectiveBpm(){
  const base=state.tempoManual ? state.tempoBpm : songs[state.song].bpm;
  return Math.max(30,Math.round(base*state.speed));
}
function effectiveDuration(){ return songs[state.song].duration/state.speed; }
function elapsed(){
  if(!state.running) return 0;
  const now=state.paused?state.pauseStart:performance.now();
  return Math.max(0,(now-state.startAt-state.pauseTotal)/1000);
}
function noteTime(i){
  const s=songs[state.song]; return (i+1)*effectiveDuration()/(s.notes.length+1);
}

const degree={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
function noteY(note){
  const m=note.match(/^([A-G])#?(\d)$/); if(!m) return 120;
  const step=(+m[2])*7+degree[m[1]];
  const base=4*7+degree.E; // E4 bottom staff line
  const half=15; // px per line/space on desktop
  return 138 - (step-base)*(half/2);
}
function fingerFor(i){ return [1,2,3,4,5,4,3,2][i%8]; }

function renderStaticScore(){
  const root=$('scrollingScore'); root.innerHTML='';
  const s=songs[state.song];
  const pxPerSec=150;
  const lead=window.innerWidth<600?260:380;
  const totalWidth=lead+effectiveDuration()*pxPerSec+400;
  root.style.width=totalWidth+'px';
  root.dataset.lead=lead;
  root.dataset.pxPerSec=pxPerSec;
  s.notes.forEach((note,i)=>{
    const n=document.createElement('div');
    n.className='music-note'; n.dataset.i=i;
    n.style.left=(lead+noteTime(i)*pxPerSec)+'px';
    n.style.top=noteY(note)+'px';
    n.innerHTML='<span class="note-head"></span><span class="note-stem"></span>';
    root.appendChild(n);
    const f=document.createElement('div');
    f.className='finger'; f.style.left=n.style.left; f.textContent=fingerFor(i);
    root.appendChild(f);
  });
  const bars=Math.ceil(effectiveDuration()/(60/scoreBpm()*4));
  for(let i=1;i<=bars;i++){
    const line=document.createElement('div');
    line.className='measure-line';
    line.style.left=(lead+i*(60/scoreBpm()*4)*pxPerSec)+'px';
    root.appendChild(line);
  }
}

function startPractice(){
  stopAnimationOnly();
  state.running=true; state.paused=false; state.pauseTotal=0; state.startAt=performance.now();
  state.judged=new Set(); state.goodStreak=0; state.performanceLog=[]; state.lastCapturedAt=0; state.currentTargetIndex=-1; state.demoPlayed=new Set(); state.demoPlayed=new Set();
  $('recordCount').textContent='0'; $('playedNote').textContent='—'; $('timingDelta').textContent='—'; $('scoreNote').textContent='—';
  if(state.metroOn) startMetronome();
  gameLoop();
}
function restartPractice(){ if($('practiceView').classList.contains('active')){renderStaticScore(); startPractice();} }
function stopAnimationOnly(){ if(state.gameRaf) cancelAnimationFrame(state.gameRaf); state.gameRaf=0; }
function stopPractice(){ state.running=false; stopAnimationOnly(); stopMetronome(false); hideAssist(); stopAllPianoVoices() }

function gameLoop(){
  if(!state.running){return}
  if(state.paused){state.gameRaf=requestAnimationFrame(gameLoop);return}
  const e=elapsed(), s=songs[state.song], root=$('scrollingScore');
  const pxPerSec=+root.dataset.pxPerSec;
  const playhead=$('staffWindow').clientWidth*.22;
  const lead=+root.dataset.lead;
  const x=playhead-lead-e*pxPerSec;
  root.style.transform=`translateX(${x}px)`;
  $('topProgressBar').style.width=Math.min(100,e/effectiveDuration()*100)+'%';

  let nearest=-1,delta=99;
  s.notes.forEach((note,i)=>{
    const expected=noteTime(i);
    const d=Math.abs(e-expected);
    const el=root.querySelector(`.music-note[data-i="${i}"]`);
    if(el) el.classList.toggle('current',d<0.22);
    if(d<delta){delta=d;nearest=i}
    if(el && e-expected>0.35) el.classList.add('passed');
    if(state.demoSoundOn && !state.demoPlayed.has(i) && e>=expected){
      state.demoPlayed.add(i); playScoreSample(note);
    }

    if(e-expected>0.42 && !state.judged.has(i)){
      state.judged.add(i);
      logPerformance({
        index:i, expectedNote:note, playedNote:null,
        expectedTime:expected, playedTime:null,
        timingErrorMs:null, pitchCorrect:false, rhythmCorrect:false,
        result:'miss'
      });
      if(el) el.classList.add('timing-error');
      flash('miss'); showAssist(); state.goodStreak=0;
    }
  });
  state.currentTargetIndex=nearest;
  if(nearest>=0) $('scoreNote').textContent=s.notes[nearest];
  if(e>=effectiveDuration()){savePracticeSummary();stopPractice();return}
  state.gameRaf=requestAnimationFrame(gameLoop);
}

function flash(kind){
  const t=$('feedbackTint');
  t.className='feedback-tint '+kind+' show';
  clearTimeout(t._timer);
  t._timer=setTimeout(()=>t.className='feedback-tint',180);
}
function showAssist(){
  const r=$('rhythmAssist'); r.hidden=false; $('assistBpm').textContent=effectiveBpm()+' BPM';
  state.assistBeat=0; updateAssist();
  clearInterval(state.assistTimer);
  state.assistTimer=setInterval(()=>{state.assistBeat=(state.assistBeat+1)%4;updateAssist()},60000/effectiveBpm());
}
function hideAssist(){
  $('rhythmAssist').hidden=true; clearInterval(state.assistTimer); state.assistTimer=null;
}
function updateAssist(){
  document.querySelectorAll('#rhythmAssist span').forEach((x,i)=>x.classList.toggle('active',i===state.assistBeat));
}

async function startMicrophone(){
  try{
    if(state.micStream) state.micStream.getTracks().forEach(t=>t.stop());
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    state.micStream=stream;
    const AC=window.AudioContext||window.webkitAudioContext;
    const ctx=ensureAudioContext(); state.audioCtx=ctx; await ctx.resume();
    const analyser=ctx.createAnalyser(); analyser.fftSize=4096; analyser.smoothingTimeConstant=.05;
    ctx.createMediaStreamSource(stream).connect(analyser); state.analyser=analyser;
    $('micBtn').textContent='麥克風已連線';
    micLoop();
  }catch(e){
    $('micBtn').textContent='麥克風未授權';
  }
}
function micLoop(){
  if(!state.analyser||!state.audioCtx) return;
  const buf=new Float32Array(state.analyser.fftSize);
  state.analyser.getFloatTimeDomainData(buf);
  let rms=0; for(const v of buf) rms+=v*v; rms=Math.sqrt(rms/buf.length);
  if(rms>.012){
    const hz=autoCorrelate(buf,state.audioCtx.sampleRate);
    if(hz>55&&hz<1800){
      const note=midiToNote(Math.round(69+12*Math.log2(hz/440)));
      $('heardNote').textContent=note;
      judgeInput(note);
    }
  }
  state.audioRaf=requestAnimationFrame(micLoop);
}

function logPerformance(entry){
  state.performanceLog.push({
    songId:state.song,
    songTitle:songs[state.song].title,
    bpm:songs[state.song].bpm,
    metronomeBpm:effectiveBpm(),
    speed:state.speed,
    hand:state.hand,
    mode:state.mode,
    ...entry
  });
  $('recordCount').textContent=state.performanceLog.length;
}
function savePracticeSummary(){
  const completed=state.performanceLog.length;
  const pitchOk=state.performanceLog.filter(x=>x.pitchCorrect).length;
  const rhythmOk=state.performanceLog.filter(x=>x.rhythmCorrect).length;
  const exact=state.performanceLog.filter(x=>x.pitchCorrect&&x.rhythmCorrect).length;
  const summary={
    date:new Date().toISOString(),
    songId:state.song,
    songTitle:songs[state.song].title,
    scoreBpm:songs[state.song].bpm,
    metronomeBpm:effectiveBpm(),
    speed:state.speed,
    totalRecords:completed,
    pitchAccuracy:completed?Math.round(pitchOk/completed*100):0,
    rhythmAccuracy:completed?Math.round(rhythmOk/completed*100):0,
    exactAccuracy:completed?Math.round(exact/completed*100):0,
    events:state.performanceLog
  };
  try{
    const key='pianoLearningPracticeHistory';
    const old=JSON.parse(localStorage.getItem(key)||'[]');
    old.push(summary);
    localStorage.setItem(key,JSON.stringify(old.slice(-100)));
  }catch(e){}
}
function judgeInput(note){
  if(!state.running||state.paused) return;
  const now=performance.now();
  if(now-state.lastCapturedAt<90) return; // avoid duplicate frames from one keystroke
  state.lastCapturedAt=now;

  const s=songs[state.song], e=elapsed();
  let best=-1,bestDelta=999;
  s.notes.forEach((n,i)=>{
    if(state.judged.has(i)) return;
    const d=Math.abs(e-noteTime(i));
    if(d<bestDelta){bestDelta=d;best=i}
  });
  if(best<0) return;

  const expected=s.notes[best];
  const expectedTime=noteTime(best);
  const timingError=e-expectedTime;
  const timingErrorMs=Math.round(timingError*1000);
  const pitchCorrect=note===expected;
  // rhythm window: ±180 ms. Exact score matching requires BOTH pitch and timing.
  const rhythmCorrect=Math.abs(timingError)<=0.18;

  $('scoreNote').textContent=expected;
  $('playedNote').textContent=note;
  $('timingDelta').textContent=(timingErrorMs>0?'+':'')+timingErrorMs+' ms';

  const el=$('scrollingScore').querySelector(`.music-note[data-i="${best}"]`);

  if(Math.abs(timingError)<=0.42){
    state.judged.add(best);
    logPerformance({
      index:best,
      expectedNote:expected,
      playedNote:note,
      expectedTime:+expectedTime.toFixed(3),
      playedTime:+e.toFixed(3),
      timingErrorMs,
      pitchCorrect,
      rhythmCorrect,
      result:(pitchCorrect&&rhythmCorrect)?'exact':pitchCorrect?'timing_error':'pitch_error'
    });

    if(pitchCorrect && rhythmCorrect){
      if(el) el.classList.add('matched');
      flash('ok'); state.goodStreak++;
      if(state.goodStreak>=4) hideAssist();
    }else if(pitchCorrect){
      if(el) el.classList.add('timing-error');
      flash(timingError<0?'early':'late'); showAssist(); state.goodStreak=0;
    }else{
      if(el) el.classList.add('pitch-error');
      // Wrong pitch: keep feedback quiet; only color the note / background lightly.
      flash('early'); state.goodStreak=0;
    }
  }
}

function midiToNote(m){
  const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  return names[(m%12+12)%12]+(Math.floor(m/12)-1);
}
function autoCorrelate(buffer,sampleRate){
  const size=buffer.length;let rms=0;
  for(let i=0;i<size;i++)rms+=buffer[i]*buffer[i];
  rms=Math.sqrt(rms/size); if(rms<.01)return-1;
  let r1=0,r2=size-1,th=.18;
  for(let i=0;i<size/2;i++){if(Math.abs(buffer[i])<th){r1=i;break}}
  for(let i=1;i<size/2;i++){if(Math.abs(buffer[size-i])<th){r2=size-i;break}}
  const b=buffer.slice(r1,r2),n=b.length,c=new Array(n).fill(0);
  for(let lag=0;lag<n;lag++){let sum=0;for(let i=0;i<n-lag;i++)sum+=b[i]*b[i+lag];c[lag]=sum}
  let d=0;while(d+1<n&&c[d]>c[d+1])d++;
  let max=-1,pos=-1;for(let i=d;i<n;i++){if(c[i]>max){max=c[i];pos=i}}
  return pos>0?sampleRate/pos:-1;
}

function metroClick(accent){
  if(!state.audioCtx) state.audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  const ctx=state.audioCtx, osc=ctx.createOscillator(), gain=ctx.createGain();
  osc.frequency.value=accent?1100:820;
  gain.gain.setValueAtTime(.0001,ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.12,ctx.currentTime+.005);
  gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.06);
  osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+.07);
}
function startMetronome(){
  stopMetronome(false);
  let beat=0; const tick=()=>{metroClick(beat%4===0);beat=(beat+1)%4};
  tick(); state.metroTimer=setInterval(tick,60000/effectiveBpm());
}
function stopMetronome(update=true){clearInterval(state.metroTimer);state.metroTimer=null;if(update){state.metroOn=false;$('metroBtn').textContent='節拍器：關'}}

window.addEventListener('resize',()=>{ if($('practiceView').classList.contains('active')) renderStaticScore(); });
