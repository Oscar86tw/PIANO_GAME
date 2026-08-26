
const NOTE_INDEX=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const $=id=>document.getElementById(id);
const noteToMidi=n=>{const m=n.match(/^([A-G]#?)(-?\d)$/);return m?(+m[2]+1)*12+NOTE_INDEX.indexOf(m[1]):null};
const midiToNote=m=>NOTE_INDEX[(m%12+12)%12]+(Math.floor(m/12)-1);
const midiToHz=m=>440*Math.pow(2,(m-69)/12);
const hzToMidi=h=>Math.round(69+12*Math.log2(h/440));
const fmt=t=>{t=Math.max(0,Math.ceil(t));return `${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`};

const PATTERNS={
  scale:['C4','D4','E4','F4','G4','A4','B4','C5','B4','A4','G4','F4','E4','D4','C4'],
  triad:['C4','E4','G4','E4','C4','D4','F4','A4','F4','D4','E4','G4','B4','G4','E4'],
  twinkle:['C4','C4','G4','G4','A4','A4','G4','F4','F4','E4','E4','D4','D4','C4'],
  ode:['E4','E4','F4','G4','G4','F4','E4','D4','C4','C4','D4','E4','E4','D4','D4'],
  mary:['E4','D4','C4','D4','E4','E4','E4','D4','D4','D4','E4','G4','G4'],
  jingle:['E4','E4','E4','E4','E4','E4','E4','G4','C4','D4','E4'],
  canon:['D4','A4','B4','F#4','G4','D4','G4','A4'],
  minuet:['G4','D4','E4','F#4','G4','D4','G4','B4','C5','A4','B4','C5','D5'],
  fur:['E5','D#5','E5','D#5','E5','B4','D5','C5','A4'],
  bach:['C4','D4','E4','F4','G4','A4','B4','C5','D5','C5','B4','A4','G4']
};
function loopPattern(key,count){
  const p=PATTERNS[key]||PATTERNS.scale, out=[];
  for(let i=0;i<count;i++) out.push(p[i%p.length]);
  return out;
}
const groups=[
 ['BEGINNER',[
  ['Five Finger Warm-up','scale',80,45],['C Major Steps','scale',84,48],['Mary Had a Little Lamb','mary',88,52],
  ['Hot Cross Buns','triad',84,46],['Ode Mini','ode',90,55],['Twinkle Mini','twinkle',86,58],
  ['Right Hand Starter','scale',82,50],['Left Hand Starter','triad',78,50],['Quarter Note Quest','mary',92,52],['Easy Sight Read 1','scale',88,56]
 ]],
 ['EASY',[
  ['Twinkle Twinkle Little Star','twinkle',96,65],['Ode to Joy','ode',100,68],['Jingle Bells','jingle',104,70],
  ['C Major Scale Challenge','scale',108,60],['Simple Waltz','triad',92,72],['Morning Exercise','scale',96,66],
  ['Canon Theme Easy','canon',90,74],['Minuet Theme Easy','minuet',94,76],['Sight Read 2','scale',108,68],['Rhythm Runner 1','mary',112,62]
 ]],
 ['NORMAL',[
  ['Ode to Joy Arcade','ode',108,75],['Canon in D Theme','canon',104,82],['Minuet in G Theme','minuet',110,80],
  ['Für Elise Theme','fur',112,78],['Bach Step Run','bach',116,84],['Scale Speed Run','scale',120,72],
  ['Broken Chord Road','triad',118,76],['Sight Read 3','scale',116,80],['Rhythm Runner 2','ode',122,74],['Classic Mix 1','minuet',114,86]
 ]],
 ['HARD',[
  ['Für Elise Rush','fur',126,92],['Canon Speed','canon',128,95],['Bach Runner','bach',132,96],
  ['Chromatic Reflex','scale',136,88],['Arpeggio Attack','triad',134,90],['Minuet Turbo','minuet',130,94],
  ['Sight Read 4','scale',132,90],['Rhythm Runner 3','ode',138,88],['Classic Mix 2','bach',136,98],['Octave Road','scale',140,92]
 ]],
 ['MASTER',[
  ['Piano Boss 1','fur',148,100],['Bach Boss','bach',152,105],['Canon Master','canon',150,102],
  ['Arpeggio Boss','triad',154,96],['Sight Read Master','scale',150,100],['Rhythm Boss','ode',156,98],
  ['Endurance 1','bach',146,120],['Endurance 2','scale',150,125],['Classic Boss Mix','minuet',158,110],['FINAL STAGE','fur',162,130]
 ]]
];

const SONGS={}; let no=1;
groups.forEach(([level,arr])=>arr.forEach(([title,pat,bpm,duration],idx)=>{
  const noteCount=Math.max(20,Math.round(duration*bpm/60*0.62));
  const notes=loopPattern(pat,noteCount);
  SONGS[`s${no}`]={id:`s${no}`,no,level,title,bpm,duration,notes,stars:groups.findIndex(g=>g[0]===level)+1};
  no++;
}));

const state={
  song:'s21',level:'NORMAL',index:0,score:0,combo:0,maxCombo:0,attempts:0,hits:0,
  running:false,paused:false,startAt:0,pauseAt:0,totalPause:0,lastAccepted:0,
  stream:null,audio:null,raf:null,gameRaf:null,judged:new Set(),hitNotes:new Set()
};
const modeSelect=$('modeSelect'), inputSelect=$('inputSelect');

function currentSong(){return SONGS[state.song]}
function songsForLevel(){return Object.values(SONGS).filter(s=>s.level===state.level)}

function buildDifficultyTabs(){
  document.querySelectorAll('#difficultyTabs button').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.level===state.level);
    btn.onclick=()=>{state.level=btn.dataset.level;state.song=songsForLevel()[0].id;buildDifficultyTabs();buildSongCards();resetGame();}
  });
}
function buildSongCards(){
  const root=$('songCards'); root.innerHTML='';
  const songs=songsForLevel(); $('libraryCount').textContent=`${songs.length} SONGS`;
  songs.forEach(s=>{
    const b=document.createElement('button'); b.type='button'; b.className='song-card'+(s.id===state.song?' active':'');
    b.innerHTML=`<span class="number">#${String(s.no).padStart(2,'0')}</span><strong>${s.title}</strong>
      <small>${'★'.repeat(s.stars)} ${s.level}</small><div class="meta"><span>BPM ${s.bpm}</span><span>${fmt(s.duration)}</span><span>${s.notes.length} NOTES</span></div>`;
    b.onclick=()=>{state.song=s.id;buildSongCards();resetGame()};
    root.appendChild(b);
  });
}
function rankFor(acc){return acc>=95?'S':acc>=88?'A':acc>=78?'B':acc>=65?'C':'D'}
function elapsed(){
  if(!state.running&&!state.paused) return 0;
  const now=state.paused?state.pauseAt:performance.now();
  return Math.max(0,(now-state.startAt-state.totalPause)/1000);
}
function updateClock(){
  const s=currentSong(), e=elapsed(), left=Math.max(0,s.duration-e);
  $('elapsedTime').textContent=fmt(e); $('timeLeft').textContent=fmt(left);
  $('durationInfo').textContent=fmt(s.duration);
  $('progressBar').style.width=`${Math.min(100,e/s.duration*100)}%`;
  $('timeLeft').classList.toggle('time-warning',state.running&&left<=10);
  const measure=Math.min(Math.max(1,Math.floor(e/(60/s.bpm*4))+1),Math.ceil(s.duration/(60/s.bpm*4)));
  const totalMeasures=Math.ceil(s.duration/(60/s.bpm*4));
  $('measureInfo').textContent=`${measure} / ${totalMeasures}`;
}
function renderSong(){
  const s=currentSong();
  $('songTitle').textContent=s.title;
  $('difficulty').textContent=`${'★'.repeat(s.stars)} ${s.level}`;
  $('bpmInfo').textContent=`BPM ${s.bpm}`;
  $('durationInfo').textContent=fmt(s.duration);
  $('noteTotal').textContent=s.notes.length;
  $('noteIndex').textContent=Math.min(state.index+1,s.notes.length);
  $('expectedNote').textContent=state.running&&state.index<s.notes.length?s.notes[state.index]:'—';
  $('expectedHz').textContent=state.running&&state.index<s.notes.length?`${midiToHz(noteToMidi(s.notes[state.index])).toFixed(1)} Hz`:'WAIT';
  updateClock(); renderHighway();
}
function noteTiming(i){
  const s=currentSong();
  return (i+1)*s.duration/(s.notes.length+1);
}
function renderHighway(){
  const s=currentSong(), root=$('noteStream'); root.innerHTML='';
  const e=elapsed(), travel=3.0, H=360;
  for(let i=0;i<s.notes.length;i++){
    const t=noteTiming(i), dt=t-e;
    if(dt<-0.45||dt>travel) continue;
    const d=document.createElement('div');
    d.className='fall-note timed'+(state.hitNotes.has(i)?' hit':'')+(state.judged.has(i)&&!state.hitNotes.has(i)?' miss':'');
    d.textContent=s.notes[i];
    const p=1-(dt/travel); d.style.top=`${Math.max(-30,Math.min(H,p*H))}px`;
    root.appendChild(d);
  }
}
function updateStats(){
  const acc=state.attempts?Math.round(state.hits/state.attempts*100):null;
  $('score').textContent=String(state.score).padStart(6,'0'); $('combo').textContent=state.combo;
  $('accuracy').textContent=acc===null?'--%':`${acc}%`;
  const sc=acc===null?0:acc>=90?3:acc>=75?2:acc>=55?1:0;
  $('stars').textContent='★'.repeat(sc)+'☆'.repeat(3-sc); $('rankOrb').textContent=acc===null?'S':rankFor(acc);
}
function setJudge(text,type=''){
  const e=$('judge');e.textContent=text;e.className='judge'+(type?' '+type:'');void e.offsetWidth;e.classList.add('pop');
  setTimeout(()=>e.classList.remove('pop'),300);
}
async function startGame(){
  if(state.running)return;
  await countdown();
  Object.assign(state,{index:0,score:0,combo:0,maxCombo:0,attempts:0,hits:0,running:true,paused:false,totalPause:0,lastAccepted:0});
  state.startAt=performance.now(); state.judged=new Set(); state.hitNotes=new Set();
  $('resultCard').hidden=true; $('pauseBtn').textContent='PAUSE'; setJudge('GO!'); updateStats(); renderSong();
  $('hint').textContent='TIME ATTACK! 音符會照時間持續前進，彈錯也不會停。';
  gameLoop();
}
function countdown(){return new Promise(resolve=>{const el=$('countdown');el.hidden=false;let n=3;el.textContent=n;const t=setInterval(()=>{n--;if(n===0)el.textContent='GO!';else if(n<0){clearInterval(t);el.hidden=true;resolve()}else el.textContent=n},650)})}
function resetGame(){
  state.running=false;state.paused=false; if(state.gameRaf) cancelAnimationFrame(state.gameRaf);
  Object.assign(state,{index:0,score:0,combo:0,maxCombo:0,attempts:0,hits:0,totalPause:0});
  state.judged=new Set();state.hitNotes=new Set();updateStats();renderSong();setJudge('READY?');
  $('heardNote').textContent='—';$('heardHz').textContent='0 Hz';$('pauseBtn').textContent='PAUSE';
}
function gameLoop(){
  if(!state.running||state.paused)return;
  const s=currentSong(), e=elapsed();
  // mark notes that passed the late window
  while(state.index<s.notes.length && e-noteTiming(state.index)>0.28){
    if(!state.judged.has(state.index)){
      state.judged.add(state.index); state.attempts++; state.combo=0; setJudge('MISS!','bad');
    }
    state.index++;
  }
  updateStats(); renderSong();
  if(e>=s.duration){finish();return}
  state.gameRaf=requestAnimationFrame(gameLoop);
}
function finish(){
  state.running=false;state.paused=false;if(state.gameRaf)cancelAnimationFrame(state.gameRaf);
  const acc=state.attempts?Math.round(state.hits/state.attempts*100):0, stars=acc>=90?3:acc>=75?2:acc>=55?1:0, rank=rankFor(acc);
  $('resultRank').textContent=`RANK ${rank}`;$('resultStars').textContent='★'.repeat(stars)+'☆'.repeat(3-stars);
  $('resultText').textContent=`SCORE ${state.score} ｜ ACCURACY ${acc}% ｜ MAX COMBO ${state.maxCombo}`;
  $('resultCard').hidden=false; setJudge('TIME UP!','good'); updateClock();
}
function togglePause(){
  if(!state.running && !state.paused)return;
  if(!state.paused){
    state.paused=true; state.pauseAt=performance.now(); $('pauseBtn').textContent='RESUME'; setJudge('PAUSE');
    if(state.gameRaf)cancelAnimationFrame(state.gameRaf);
  }else{
    state.totalPause+=performance.now()-state.pauseAt; state.paused=false; $('pauseBtn').textContent='PAUSE'; setJudge('GO!');
    gameLoop();
  }
}
function flashKey(note){
  document.querySelectorAll('.key,.black').forEach(k=>k.classList.toggle('active',k.dataset.note===note));
  setTimeout(()=>document.querySelectorAll(`[data-note="${note}"]`).forEach(k=>k.classList.remove('active')),180);
}
function acceptNote(note,hz=0){
  $('heardNote').textContent=note;$('heardHz').textContent=hz?`${hz.toFixed(1)} Hz`:'SCREEN KEY';flashKey(note);
  if(!state.running||state.paused||modeSelect.value==='free')return;
  const now=performance.now(); if(now-state.lastAccepted<110)return;
  const s=currentSong(), e=elapsed(); let best=-1,bestDelta=999;
  for(let i=Math.max(0,state.index-1);i<Math.min(s.notes.length,state.index+4);i++){
    if(state.judged.has(i))continue;
    const delta=Math.abs(e-noteTiming(i));
    if(delta<bestDelta){bestDelta=delta;best=i}
  }
  if(best<0)return;
  state.lastAccepted=now;
  if(bestDelta<=0.28 && note===s.notes[best]){
    state.judged.add(best);state.hitNotes.add(best);state.attempts++;state.hits++;state.combo++;state.maxCombo=Math.max(state.maxCombo,state.combo);
    let bonus=0,judge='GREAT!';
    if(bestDelta<=0.08){bonus=180;judge='MARVELOUS!'} else if(bestDelta<=0.16){bonus=120;judge='PERFECT!'} else bonus=70;
    state.score+=100+bonus+Math.min(300,state.combo*8); setJudge(judge,'good');
    $('comboBurst').textContent=state.combo>=2?`${state.combo} COMBO!`:'';
    if(best===state.index) while(state.judged.has(state.index)&&state.index<s.notes.length) state.index++;
  }else{
    state.combo=0;state.score=Math.max(0,state.score-15);setJudge(bestDelta>0.28?(e<noteTiming(best)?'TOO EARLY!':'TOO LATE!'):'WRONG NOTE!','bad');
  }
  updateStats();renderSong();
}
$('startBtn').addEventListener('click',startGame);
$('pauseBtn').addEventListener('click',togglePause);
$('resetBtn').addEventListener('click',resetGame);
$('againBtn').addEventListener('click',startGame);
inputSelect.addEventListener('change',()=>{
  $('inputBadge').textContent=inputSelect.value==='mic'?'MIC MODE':'TOUCH MODE';
  $('hint').textContent=inputSelect.value==='mic'?'請啟動 MIC，再開始挑戰。':'可以直接點下方琴鍵測試時間判定。';
});
function buildKeyboard(){
  const root=$('keyboard');let whitePos=0;
  for(let midi=48;midi<=72;midi++){
    const note=midiToNote(midi),black=note.includes('#');
    if(!black){
      const k=document.createElement('button');k.type='button';k.className='key';k.dataset.note=note;k.textContent=note;k.onclick=()=>acceptNote(note);root.appendChild(k);whitePos++;
    }else{
      const k=document.createElement('button');k.type='button';k.className='black';k.dataset.note=note;k.textContent=note.replace(/\d/,'');k.style.left=`${whitePos*52-17}px`;k.onclick=()=>acceptNote(note);root.appendChild(k);
    }
  }
}
async function startMicrophone(){
  try{
    if(state.stream)state.stream.getTracks().forEach(t=>t.stop());
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    state.stream=stream;const AC=window.AudioContext||window.webkitAudioContext,ctx=new AC();state.audio=ctx;await ctx.resume();
    const analyser=ctx.createAnalyser();analyser.fftSize=4096;analyser.smoothingTimeConstant=.12;ctx.createMediaStreamSource(stream).connect(analyser);
    const buf=new Float32Array(analyser.fftSize);$('audioStatus').textContent='🟢 MIC LIVE';$('micBtn').textContent='MIC LIVE';
    $('hint').textContent='麥克風已連線。音符會依歌曲時間持續跑動。';
    const loop=()=>{
      analyser.getFloatTimeDomainData(buf);let rms=0;for(const v of buf)rms+=v*v;rms=Math.sqrt(rms/buf.length);
      $('levelMeter').style.width=`${Math.min(100,rms*700)}%`;
      if(rms>.012){const hz=autoCorrelate(buf,ctx.sampleRate);if(hz>55&&hz<1800){const note=midiToNote(hzToMidi(hz));$('heardNote').textContent=note;$('heardHz').textContent=`${hz.toFixed(1)} Hz`;if(inputSelect.value==='mic')acceptNote(note,hz)}}
      state.raf=requestAnimationFrame(loop);
    };
    if(state.raf)cancelAnimationFrame(state.raf);loop();
  }catch(err){console.error(err);$('audioStatus').textContent='🔴 MIC ERROR';$('hint').textContent='無法取得麥克風權限。請使用 HTTPS 並允許麥克風。'}
}
$('micBtn').addEventListener('click',startMicrophone);
function autoCorrelate(buffer,sampleRate){
  const size=buffer.length;let rms=0;for(let i=0;i<size;i++)rms+=buffer[i]*buffer[i];rms=Math.sqrt(rms/size);if(rms<.01)return-1;
  let r1=0,r2=size-1,th=.18;for(let i=0;i<size/2;i++){if(Math.abs(buffer[i])<th){r1=i;break}}
  for(let i=1;i<size/2;i++){if(Math.abs(buffer[size-i])<th){r2=size-i;break}}
  const b=buffer.slice(r1,r2),n=b.length,c=new Array(n).fill(0);
  for(let lag=0;lag<n;lag++){let sum=0;for(let i=0;i<n-lag;i++)sum+=b[i]*b[i+lag];c[lag]=sum}
  let d=0;while(d+1<n&&c[d]>c[d+1])d++;let max=-1,pos=-1;for(let i=d;i<n;i++){if(c[i]>max){max=c[i];pos=i}}
  if(pos<=0)return-1;let T0=pos;const x1=c[T0-1]||c[T0],x2=c[T0],x3=c[T0+1]||c[T0],a=(x1+x3-2*x2)/2,bv=(x3-x1)/2;if(a)T0-=bv/(2*a);return sampleRate/T0;
}
buildDifficultyTabs();buildSongCards();buildKeyboard();renderSong();updateStats();
