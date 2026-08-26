
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


const curriculum = {
  prep:{
    name:'預備級',
    summary:'建立鋼琴方向感、基本拍感、五線譜起步與正確坐姿。',
    items:{
      notes:['鍵盤高低音方向','中央 C','高音譜號 C–G'],
      rhythm:['穩定四分音符','二分音符','4 拍脈動'],
      technique:['坐姿與手型','手指編號 1–5','放鬆落鍵'],
      scales:['五指位置 C–G','反向五指練習'],
      chords:['聽辨高低音','C 大三和弦入門'],
      sight:['2–4 小節超短視奏'],
      ear:['高/低音辨認','相同/不同旋律'],
      repertoire:['單手短曲','固定手位兒歌']
    }
  },
  1:{name:'Level 1',summary:'建立基本識譜、節奏、五指技巧與簡單雙手配合。',items:{
    notes:['高音譜表音域擴展','低音譜號入門','升降記號'],
    rhythm:['四分/二分/全音符','四分休止符','2/4、3/4、4/4'],
    technique:['連奏與斷奏','左右手五指型','基本力度'],
    scales:['C/G/F 大調五指型','一個八度音階入門'],
    chords:['I 和弦','C/G/F 基本和弦'],
    sight:['固定手位視奏','簡單節奏視奏'],
    ear:['拍點模仿','旋律方向辨認'],
    repertoire:['簡單古典/民謠','左右手輪流']
  }},
  2:{name:'Level 2',summary:'加強低音譜號、手位移動、八分音符與基礎和弦。',items:{
    notes:['雙譜表閱讀','跨越中央 C','更多升降音'],
    rhythm:['八分音符','附點二分音符','弱起概念'],
    technique:['換手位','拇指穿指入門','簡單踏板'],
    scales:['C/G/D/F 大調','A/D 小調入門'],
    chords:['I–V7','分解和弦入門'],
    sight:['不固定手位短譜','雙手簡單視奏'],
    ear:['節奏回拍','大小調色彩'],
    repertoire:['簡易古典主題','流行旋律配簡單和弦']
  }},
  3:{name:'Level 3',summary:'建立完整一個八度音階、三連音、雙手協調與基礎樂句。',items:{
    notes:['更寬音域','臨時記號','八度記號'],
    rhythm:['三連音','附點四分+八分','切分入門'],
    technique:['音階指法','手腕轉移','聲部平衡'],
    scales:['大調/和聲小調一個八度','主和弦琶音'],
    chords:['I–IV–V','轉位入門'],
    sight:['較長雙手視奏','簡單調號'],
    ear:['旋律記憶','強弱拍辨認'],
    repertoire:['古典小品','電影/動畫簡易改編']
  }},
  4:{name:'Level 4',summary:'擴充調號、兩個八度音階、踏板與伴奏型。',items:{
    notes:['多升降號調性','和弦音型閱讀'],
    rhythm:['十六分音符入門','切分節奏','複拍子入門'],
    technique:['兩個八度音階','旋律歌唱性','踏板換和聲'],
    scales:['兩個八度大/小調','琶音擴展'],
    chords:['七和弦入門','伴奏型變化'],
    sight:['雙手不同節奏','多調性視奏'],
    ear:['終止式感受','旋律錯音辨識'],
    repertoire:['古典舞曲','抒情曲與流行伴奏']
  }},
  5:{name:'Level 5',summary:'中級核心：速度、平衡、和聲理解、視奏與聽力全面提升。',items:{
    notes:['多聲部閱讀','裝飾音入門'],
    rhythm:['複合拍子','複雜切分','速度變化'],
    technique:['快速音階','重複音','聲部控制'],
    scales:['常用大/小調兩個八度以上','反向/半音階入門'],
    chords:['屬七和弦','和聲進行分析'],
    sight:['限時視奏','多聲部簡譜'],
    ear:['音程辨認','節奏/旋律複述'],
    repertoire:['巴洛克/古典/浪漫/現代各類作品']
  }},
  6:{name:'Level 6',summary:'進階技巧、風格理解與更高速度的音階、琶音及視奏。',items:{
    notes:['多譜號與複雜織體','裝飾記號'],
    rhythm:['不規則重音','複合節奏層次'],
    technique:['八度技巧入門','快速琶音','旋律與伴奏分層'],
    scales:['更多調性與半音階','琶音轉位'],
    chords:['擴展和弦','和聲功能'],
    sight:['調性變化視奏','快速掃譜'],
    ear:['和弦性質','終止式辨識'],
    repertoire:['較完整奏鳴曲樂章','印象派/近現代入門']
  }},
  7:{name:'Level 7',summary:'高階控制：速度、音色、複雜和聲、風格與舞台完整度。',items:{
    notes:['高密度譜面閱讀','多聲部獨立'],
    rhythm:['跨拍型態','多層節奏'],
    technique:['快速八度','大跳','細緻音色控制'],
    scales:['全調性音階/琶音深化','三度/六度概念'],
    chords:['調性轉換','擴張和聲'],
    sight:['高難度即時視奏','風格辨識'],
    ear:['複雜音程/和弦','旋律與低音追蹤'],
    repertoire:['大型作品節選','完整舞台演奏訓練']
  }},
  8:{name:'Level 8',summary:'高級演奏準備：完整技巧、音樂詮釋、快速視奏與自主練習能力。',items:{
    notes:['複雜總譜式閱讀','高密度和聲'],
    rhythm:['自由速度與精準脈動並存','複雜節拍'],
    technique:['高速度音階琶音','八度/和弦/大跳綜合技巧'],
    scales:['全調性綜合技術','快速音階與琶音'],
    chords:['進階和聲與轉調','伴奏即興基礎'],
    sight:['高階限時視奏','快速抓結構'],
    ear:['和聲/節奏/旋律整合聽辨'],
    repertoire:['高級曲目','完整演奏與錄音檢討']
  }}
};

const categoryNames={
  notes:'識譜',rhythm:'節奏',technique:'技巧',scales:'音階・琶音',
  chords:'和弦・和聲',sight:'視奏',ear:'聽力',repertoire:'曲目・演奏'
};

function renderCurriculum(){
  const level=$('levelFilter').value;
  const cat=$('categoryFilter').value;
  const data=curriculum[level];
  $('curriculumSummary').innerHTML=`<b>${data.name}</b>　${data.summary}`;
  const root=$('curriculumGrid'); root.innerHTML='';
  Object.entries(data.items).forEach(([key,skills],idx)=>{
    if(cat!=='all' && cat!==key) return;
    const card=document.createElement('button');
    card.type='button'; card.className='course-card curriculum-card';
    const demoSongs=['twinkle','ode','mary','scale','canon','sight'];
    card.dataset.song=demoSongs[idx%demoSongs.length];
    card.innerHTML=`<span class="course-icon">${['𝄞','♩','✋','↗','♬','👀','👂','♫'][idx]}</span>
      <b>${categoryNames[key]}</b>
      <small>${data.name}</small>
      <span class="course-category">${categoryNames[key]}</span>
      <ul class="skill-list">${skills.map(s=>`<li>${s}</li>`).join('')}</ul>`;
    card.addEventListener('click',()=>openPractice(card.dataset.song,'LEARN'));
    root.appendChild(card);
  });
}

let state = {
  song:'twinkle',running:false,paused:false,startAt:0,pauseStart:0,pauseTotal:0,
  speed:1,mode:'play',hand:'right',micStream:null,audioCtx:null,analyser:null,
  audioRaf:0,gameRaf:0,metroOn:false,metroTimer:null,assistTimer:null,assistBeat:0,
  judged:new Set(),goodStreak:0,tempoBpm:null,tempoManual:false,lastMasterBeat:-1,
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
$('levelFilter').addEventListener('change',renderCurriculum);
$('categoryFilter').addEventListener('change',renderCurriculum);
renderCurriculum();


document.querySelectorAll('.filter').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); renderSongList(btn.dataset.level);
  });
});
$('quickStart').addEventListener('click',()=>openPractice('sight','5 MIN'));

function openPractice(songId,label='PLAY'){
  state.song=songId; state.running=false; state.paused=false; state.pauseTotal=0; state.judged=new Set(); state.goodStreak=0;
  state.performanceLog=[]; state.lastCapturedAt=0; state.currentTargetIndex=-1; state.demoPlayed=new Set();
  state.tempoManual=false; state.tempoBpm=songs[songId].bpm; state.speed=1; state.lastMasterBeat=-1;
  $('tempoInput').value=state.tempoBpm;
  $('speedSelect').value='1';
  $('practiceTitle').textContent=songs[songId].title;
  $('practiceModeLabel').textContent=label;
  showView('practice');
  renderStaticScore();
  enterReadyState();
}


function fmtTime(sec){
  sec=Math.max(0,Math.floor(sec||0));
  return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
}
function enterReadyState(){
  state.running=false; state.paused=false; state.pauseTotal=0; state.lastMasterBeat=-1;
  $('prepareBanner').classList.remove('running');
  $('topProgressBar').style.width='0%';
  $('transportTime').textContent='00:00';
  $('playBtn').classList.remove('active');
  $('pauseTransportBtn').classList.remove('active');
  if(state.metroOn) stopMetronome(false);
  hideAssist();
}
function playFromCurrent(){
  if(!state.running){
    startPractice();
  }else if(state.paused){
    state.pauseTotal+=performance.now()-state.pauseStart;
    state.paused=false;
    $('pauseTransportBtn').classList.remove('active');
    $('playBtn').classList.add('active');
  }
  $('prepareBanner').classList.add('running');
}
function pausePractice(){
  if(!state.running || state.paused) return;
  state.paused=true;
  state.pauseStart=performance.now();
  $('pauseTransportBtn').classList.add('active');
  $('playBtn').classList.remove('active');
  stopAllPianoVoices();
}
function seekTo(sec){
  sec=Math.max(0,Math.min(effectiveDuration(),sec));
  const now=performance.now();
  state.startAt=now-sec*1000;
  state.pauseTotal=0;
  if(state.paused) state.pauseStart=now;
  state.lastMasterBeat=-1;
  state.demoPlayed=new Set();
  state.judged=new Set([...state.judged].filter(i=>noteTime(i)<sec));
  renderStaticScore();
}
function rewindMeasure(){
  const current=state.running?elapsed():0;
  const measure=beatSeconds()*4;
  seekTo(Math.max(0,current-measure));
}
function renderRecordDrawer(){
  const log=state.performanceLog||[];
  const exact=log.filter(x=>x.pitchCorrect&&x.rhythmCorrect).length;
  const pitch=log.filter(x=>x.pitchCorrect).length;
  const rhythm=log.filter(x=>x.rhythmCorrect).length;
  $('recordSummary').textContent=log.length
    ? `共 ${log.length} 筆｜音高正確 ${Math.round(pitch/log.length*100)}%｜節拍正確 ${Math.round(rhythm/log.length*100)}%｜完全吻合 ${Math.round(exact/log.length*100)}%`
    : '尚未有彈奏紀錄。';
  const root=$('recordList'); root.innerHTML='';
  log.slice(-40).reverse().forEach(x=>{
    const row=document.createElement('div'); row.className='record-row';
    const exactOk=x.pitchCorrect&&x.rhythmCorrect;
    row.innerHTML=`<b>#${x.index+1}</b><span>譜 ${x.expectedNote||'—'} → 彈 ${x.playedNote||'—'}</span>
      <span class="${exactOk?'ok':'bad'}">${exactOk?'吻合':'需練習'}</span>
      <span>${x.timingErrorMs==null?'MISS':(x.timingErrorMs>0?'+':'')+x.timingErrorMs+' ms'}</span>`;
    root.appendChild(row);
  });
}
$('readyPlayBtn').addEventListener('click',playFromCurrent);
$('playBtn').addEventListener('click',playFromCurrent);
$('pauseTransportBtn').addEventListener('click',pausePractice);
$('rewindBtn').addEventListener('click',rewindMeasure);
$('recordBtn').addEventListener('click',()=>{
  renderRecordDrawer();
  $('recordDrawer').hidden=!$('recordDrawer').hidden;
  $('recordBtn').classList.toggle('active',!$('recordDrawer').hidden);
});
$('closeRecordBtn').addEventListener('click',()=>{
  $('recordDrawer').hidden=true;
  $('recordBtn').classList.remove('active');
});

$('backBtn').addEventListener('click',()=>{
  stopPractice(); showView('home');
});
$('pauseBtn').addEventListener('click',pausePractice);

$('speedSelect').addEventListener('change',()=>{
  state.speed=parseFloat($('speedSelect').value)||1;
  // Speed presets directly change the master BPM.
  state.tempoManual=false;
  state.tempoBpm=Math.max(30,Math.round(songs[state.song].bpm*state.speed));
  $('tempoInput').value=state.tempoBpm;
  renderStaticScore();
  if(state.running) restartPractice();
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
  state.tempoBpm=bpm;
  state.tempoManual=manual;
  $('tempoInput').value=bpm;

  // Keep speed selector approximately reflecting the chosen master tempo.
  const ratio=bpm/songs[state.song].bpm;
  if(Math.abs(ratio-.5)<.03) $('speedSelect').value='0.5';
  else if(Math.abs(ratio-.75)<.03) $('speedSelect').value='0.75';
  else if(Math.abs(ratio-1)<.03) $('speedSelect').value='1';

  renderStaticScore();
  if(state.running) restartPractice();
  if(!$('rhythmAssist').hidden) $('assistBpm').textContent=effectiveBpm()+' BPM';
}
$('tempoInput').addEventListener('change',()=>setTempo($('tempoInput').value,true));
$('tempoMinus').addEventListener('click',()=>setTempo((state.tempoBpm||songs[state.song].bpm)-1,true));
$('tempoPlus').addEventListener('click',()=>setTempo((state.tempoBpm||songs[state.song].bpm)+1,true));
$('tempoReset').addEventListener('click',()=>{ $('speedSelect').value='1'; state.speed=1; setTempo(songs[state.song].bpm,false); });


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

function scoreBpm(){ return Math.max(30,Math.round(songs[state.song].bpm)); }

// Single master tempo for EVERYTHING:
// metronome, scrolling score, note arrival, demo piano and microphone timing.
function effectiveBpm(){
  return Math.max(30,Math.min(240,Math.round(state.tempoBpm || songs[state.song].bpm)));
}
function beatSeconds(){ return 60/effectiveBpm(); }

// Current demo songs use one quarter-note beat per note.
// Add 2 extra beats: one count-in beat before first note and one release beat at the end.
function effectiveDuration(){
  return (songs[state.song].notes.length + 2) * beatSeconds();
}
function elapsed(){
  if(!state.running) return 0;
  const now=state.paused?state.pauseStart:performance.now();
  return Math.max(0,(now-state.startAt-state.pauseTotal)/1000);
}
function noteTime(i){
  // First note arrives on beat 1, exactly one beat after transport starts.
  return (i+1)*beatSeconds();
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
  const bars=Math.ceil((songs[state.song].notes.length+1)/4);
  for(let i=1;i<=bars;i++){
    const line=document.createElement('div');
    line.className='measure-line';
    line.style.left=(lead+i*(beatSeconds()*4)*pxPerSec)+'px';
    root.appendChild(line);
  }
}

function startPractice(){
  stopAnimationOnly();
  state.running=true; state.paused=false; state.pauseTotal=0; state.startAt=performance.now();
  $('prepareBanner').classList.add('running');
  $('playBtn').classList.add('active');
  $('pauseTransportBtn').classList.remove('active');
  state.judged=new Set(); state.goodStreak=0; state.performanceLog=[]; state.lastCapturedAt=0; state.currentTargetIndex=-1; state.demoPlayed=new Set(); state.lastMasterBeat=-1;
  $('recordCount').textContent='0'; $('playedNote').textContent='—'; $('timingDelta').textContent='—'; $('scoreNote').textContent='—';
  startMetronome();
  gameLoop();
}
function restartPractice(){
  if(!$('practiceView').classList.contains('active')) return;
  renderStaticScore();
  if(state.running) startPractice();
  else enterReadyState();
}
function stopAnimationOnly(){ if(state.gameRaf) cancelAnimationFrame(state.gameRaf); state.gameRaf=0; }
function stopPractice(){ state.running=false; state.paused=false; stopAnimationOnly(); stopMetronome(false); hideAssist(); $('playBtn')?.classList.remove('active'); $('pauseTransportBtn')?.classList.remove('active'); stopAllPianoVoices() }

function updateMasterBeat(e){
  const beatIndex=Math.floor(e/beatSeconds());

  if(beatIndex!==state.lastMasterBeat){
    state.lastMasterBeat=beatIndex;

    // Metronome click is generated from exactly the same beat index that drives score movement.
    if(state.metroOn) metroClick(beatIndex%4===0);

    // Rhythm-assist dots also follow the same master beat.
    if(!$('rhythmAssist').hidden){
      state.assistBeat=beatIndex%4;
      updateAssist();
      $('assistBpm').textContent=effectiveBpm()+' BPM';
    }
  }
}

function gameLoop(){
  if(!state.running){return}
  if(state.paused){state.gameRaf=requestAnimationFrame(gameLoop);return}
  const e=elapsed(), s=songs[state.song], root=$('scrollingScore');
  updateMasterBeat(e);
  const pxPerSec=+root.dataset.pxPerSec;
  const playhead=$('staffWindow').clientWidth*.22;
  const lead=+root.dataset.lead;
  const x=playhead-lead-e*pxPerSec;
  root.style.transform=`translateX(${x}px)`;
  $('topProgressBar').style.width=Math.min(100,e/effectiveDuration()*100)+'%';
  $('transportTime').textContent=fmtTime(e);

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
  if(e>=effectiveDuration()){savePracticeSummary();stopPractice();$('playBtn').classList.remove('active');$('transportTime').textContent=fmtTime(effectiveDuration());return}
  state.gameRaf=requestAnimationFrame(gameLoop);
}

function flash(kind){
  const t=$('feedbackTint');
  t.className='feedback-tint '+kind+' show';
  clearTimeout(t._timer);
  t._timer=setTimeout(()=>t.className='feedback-tint',180);
}
function showAssist(){
  const r=$('rhythmAssist');
  r.hidden=false;
  $('assistBpm').textContent=effectiveBpm()+' BPM';
  state.assistBeat=Math.floor(elapsed()/beatSeconds())%4;
  updateAssist();
}
function hideAssist(){
  $('rhythmAssist').hidden=true;
  state.assistTimer=null;
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
  // No independent setInterval. The game loop drives beats from the same master clock.
  state.lastMasterBeat=-1;
}
function stopMetronome(update=true){
  state.lastMasterBeat=-1;
  if(update){
    state.metroOn=false;
    $('metroBtn').textContent='節拍器：關';
  }
}

window.addEventListener('resize',()=>{ if($('practiceView').classList.contains('active')) renderStaticScore(); });
