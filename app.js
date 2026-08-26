const SONGS = {
  twinkle: { title:'Twinkle Twinkle Little Star', notes:['C4','C4','G4','G4','A4','A4','G4','F4','F4','E4','E4','D4','D4','C4'] },
  ode: { title:'Ode to Joy', notes:['E4','E4','F4','G4','G4','F4','E4','D4','C4','C4','D4','E4','E4','D4','D4'] },
  scale: { title:'C Major Scale', notes:['C4','D4','E4','F4','G4','A4','B4','C5'] }
};
const NOTE_INDEX = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const noteToMidi = note => {
  const m = note.match(/^([A-G]#?)(-?\d)$/); if(!m) return null;
  return (Number(m[2])+1)*12 + NOTE_INDEX.indexOf(m[1]);
};
const midiToNote = midi => NOTE_INDEX[(midi%12+12)%12] + (Math.floor(midi/12)-1);
const midiToHz = midi => 440*Math.pow(2,(midi-69)/12);
const hzToMidi = hz => Math.round(69+12*Math.log2(hz/440));

const $ = id => document.getElementById(id);
const songSelect=$('songSelect'), modeSelect=$('modeSelect'), inputSelect=$('inputSelect');
const state={song:'twinkle',index:0,score:0,combo:0,attempts:0,hits:0,running:false,lastAccepted:0,audio:null,stream:null,raf:null};

Object.entries(SONGS).forEach(([id,s])=>{const o=document.createElement('option');o.value=id;o.textContent=s.title;songSelect.appendChild(o)});

function renderSong(){
  const s=SONGS[state.song]; $('songTitle').textContent=s.title; $('noteTotal').textContent=s.notes.length; $('noteIndex').textContent=state.index;
  $('expectedNote').textContent=state.running && state.index<s.notes.length?s.notes[state.index]:'—';
  $('expectedHz').textContent=state.running && state.index<s.notes.length?`${midiToHz(noteToMidi(s.notes[state.index])).toFixed(1)} Hz`:'等待開始';
  $('progressBar').style.width=`${Math.min(100,state.index/s.notes.length*100)}%`;
  $('noteStream').innerHTML=s.notes.map((n,i)=>`<span class="music-note ${i<state.index?'done':''} ${i===state.index&&state.running?'current':''}" title="${n}">♪</span>`).join('');
  requestAnimationFrame(()=>{const cur=document.querySelector('.music-note.current'); if(cur) cur.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'})});
}
function updateStats(){
  $('score').textContent=state.score; $('combo').textContent=state.combo;
  const acc=state.attempts?Math.round(state.hits/state.attempts*100):null; $('accuracy').textContent=acc===null?'—':`${acc}%`;
  const starCount=acc===null?0:acc>=90?3:acc>=75?2:acc>=55?1:0; $('stars').textContent='★'.repeat(starCount)+'☆'.repeat(3-starCount);
}
function setJudge(text,type=''){const e=$('judge');e.textContent=text;e.className='judge'+(type?' '+type:'')}
function startGame(){state.index=0;state.score=0;state.combo=0;state.attempts=0;state.hits=0;state.running=true;state.lastAccepted=0;$('resultCard').hidden=true;setJudge('GO!');updateStats();renderSong();$('hint').textContent='開始了！看現在要彈的音，直接在真鋼琴上彈。'}
function resetGame(){state.running=false;state.index=0;state.score=0;state.combo=0;state.attempts=0;state.hits=0;updateStats();renderSong();setJudge('READY');$('heardNote').textContent='—';$('heardHz').textContent='0 Hz'}
function finish(){state.running=false;const acc=state.attempts?Math.round(state.hits/state.attempts*100):0;const starCount=acc>=90?3:acc>=75?2:acc>=55?1:0;$('resultStars').textContent='★'.repeat(starCount)+'☆'.repeat(3-starCount);$('resultText').textContent=`得分 ${state.score}｜正確率 ${acc}%｜最高連續表現 ${state.combo} Combo。`;$('resultCard').hidden=false;setJudge('FINISH','good');renderSong();$('resultCard').scrollIntoView({behavior:'smooth',block:'center'})}
function flashKey(note){document.querySelectorAll('.key,.black').forEach(k=>k.classList.toggle('active',k.dataset.note===note));setTimeout(()=>document.querySelectorAll(`[data-note="${note}"]`).forEach(k=>k.classList.remove('active')),180)}
function acceptNote(note,hz=0){
  $('heardNote').textContent=note;$('heardHz').textContent=hz?`${hz.toFixed(1)} Hz`:'畫面琴鍵';flashKey(note);
  if(!state.running||modeSelect.value==='free') return;
  const now=performance.now(); if(now-state.lastAccepted<220)return;
  const expected=SONGS[state.song].notes[state.index]; state.attempts++;
  if(note===expected){state.lastAccepted=now;state.hits++;state.combo++;state.score+=100+Math.min(100,state.combo*5);state.index++;setJudge(state.combo>=4?`PERFECT ×${state.combo}`:'PERFECT','good');
    if(state.index>=SONGS[state.song].notes.length){updateStats();finish();return;}
  }else{state.combo=0;state.score=Math.max(0,state.score-10);setJudge(`TRY ${expected}`,'bad')}
  updateStats();renderSong();
}

songSelect.addEventListener('change',()=>{state.song=songSelect.value;resetGame()});
$('startBtn').addEventListener('click',startGame);$('resetBtn').addEventListener('click',resetGame);$('againBtn').addEventListener('click',startGame);
inputSelect.addEventListener('change',()=>{$('hint').textContent=inputSelect.value==='mic'?'真鋼琴模式：請先啟動麥克風。':'測試模式：直接點畫面琴鍵即可。'});

function buildKeyboard(){
  const root=$('keyboard'); const start=48,end=72; let whitePos=0;
  for(let midi=start;midi<=end;midi++){
    const note=midiToNote(midi), black=note.includes('#');
    if(!black){const k=document.createElement('button');k.type='button';k.className='key';k.dataset.note=note;k.textContent=note;k.addEventListener('click',()=>acceptNote(note));root.appendChild(k);whitePos++}
    else{const k=document.createElement('button');k.type='button';k.className='black';k.dataset.note=note;k.textContent=note.replace(/\d/,'');k.style.left=`${whitePos*52-17}px`;k.addEventListener('click',()=>acceptNote(note));root.appendChild(k)}
  }
}

async function startMicrophone(){
  try{
    if(state.stream){state.stream.getTracks().forEach(t=>t.stop());state.stream=null}
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});state.stream=stream;
    const AC=window.AudioContext||window.webkitAudioContext; const ctx=new AC();state.audio=ctx;await ctx.resume();
    const analyser=ctx.createAnalyser();analyser.fftSize=4096;analyser.smoothingTimeConstant=0.15;ctx.createMediaStreamSource(stream).connect(analyser);
    const buf=new Float32Array(analyser.fftSize);$('audioStatus').textContent='🟢 麥克風收音中';$('micBtn').textContent='重新啟動收音';$('hint').textContent='已開始收音。建議把裝置放在鋼琴附近，環境越安靜辨識越穩定。';
    const loop=()=>{analyser.getFloatTimeDomainData(buf);let rms=0;for(const v of buf)rms+=v*v;rms=Math.sqrt(rms/buf.length);$('levelMeter').style.width=`${Math.min(100,rms*700)}%`;
      if(rms>.012){const hz=autoCorrelate(buf,ctx.sampleRate);if(hz>55&&hz<1800){const midi=hzToMidi(hz),note=midiToNote(midi);$('heardNote').textContent=note;$('heardHz').textContent=`${hz.toFixed(1)} Hz`;if(inputSelect.value==='mic')acceptNote(note,hz)}}
      state.raf=requestAnimationFrame(loop)}; if(state.raf)cancelAnimationFrame(state.raf);loop();
  }catch(err){console.error(err);$('audioStatus').textContent='🔴 無法使用麥克風';$('hint').textContent='瀏覽器沒有取得麥克風權限。GitHub Pages 必須使用 HTTPS；請確認允許此網站使用麥克風。'}
}
$('micBtn').addEventListener('click',startMicrophone);

function autoCorrelate(buffer,sampleRate){
  const size=buffer.length;let rms=0;for(let i=0;i<size;i++)rms+=buffer[i]*buffer[i];rms=Math.sqrt(rms/size);if(rms<.01)return -1;
  let r1=0,r2=size-1,th=.18;for(let i=0;i<size/2;i++){if(Math.abs(buffer[i])<th){r1=i;break}}for(let i=1;i<size/2;i++){if(Math.abs(buffer[size-i])<th){r2=size-i;break}}
  const b=buffer.slice(r1,r2),n=b.length,c=new Array(n).fill(0);for(let lag=0;lag<n;lag++){let sum=0;for(let i=0;i<n-lag;i++)sum+=b[i]*b[i+lag];c[lag]=sum}
  let d=0;while(d+1<n&&c[d]>c[d+1])d++;let max=-1,pos=-1;for(let i=d;i<n;i++){if(c[i]>max){max=c[i];pos=i}}if(pos<=0)return -1;
  let T0=pos;const x1=c[T0-1]||c[T0],x2=c[T0],x3=c[T0+1]||c[T0],a=(x1+x3-2*x2)/2,bv=(x3-x1)/2;if(a)T0-=bv/(2*a);return sampleRate/T0;
}

buildKeyboard();renderSong();updateStats();
