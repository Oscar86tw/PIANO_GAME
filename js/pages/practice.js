
(async()=>{
  const $=id=>document.getElementById(id);
  const q=new URLSearchParams(location.search),id=q.get('song')||'twinkle';
  const practiceM1=Number(q.get('m1')||1),practiceM2=q.get('m2')?Number(q.get('m2')):null;
  const courseLessonId=q.get('lesson');
  const academyLessonId=q.get('academy');
  const courseGrade=Number(q.get('grade')||0);
  const layer=$('scoreLayer');
  const song=await Practice.loadSong(id);

  let showFingering=true;
  let demoOn=false;
  let inputConnected=false;
  let practiceRunning=false;
  let effectiveBpm=song.bpm;

  function renderScore(){
    Practice.render(layer,{showFingering,startMeasure:practiceM1,endMeasure:practiceM2});
    $('noteCountTag').textContent=(layer.dataset.noteCount||0)+' notes';
  }
  renderScore();

  $('songTitle').textContent=song.title+(practiceM2?`｜小節 ${practiceM1}–${practiceM2}`:'');
  $('songLevel').textContent=song.level||'';
  $('songCat').textContent=song.category||'';
  $('bpm').value=song.bpm;

  function updateStars(n,score=null){
    $('practiceStars').innerHTML='★'.repeat(n)+'☆'.repeat(5-n)+` <span>${score==null?'尚未評分':`本次 ${score} 分｜${n} 顆星`}</span>`;
  }
  updateStars(0);

  function updateSummary(){
    const s=ScoringEngine.summary();
    $('pitchResult').textContent=s.total?s.pitch+'%':'—';
    $('rhythmResult').textContent=s.total?s.rhythm+'%':'—';
    $('exactResult').textContent=s.total?s.exact+'%':'—';
    if(s.total)updateStars(s.stars,s.score);
    return s;
  }

  async function connectInput(){
    const mode=$('inputMode').value;
    if(mode==='none'){
      $('inputFeedback').textContent='請先選擇 MIDI 或麥克風。';
      $('inputFeedback').className='status warn';
      return;
    }
    try{
      if(mode==='midi'){
        const devices=await InputEngine.connectMIDI();
        inputConnected=true;
        $('inputSourceValue').textContent=devices.length?devices.join(' / '):'MIDI（無裝置）';
        $('inputFeedback').textContent=devices.length?'MIDI 已連接。':'Web MIDI 已啟用，但目前沒有 MIDI 裝置。';
      }else{
        await InputEngine.startMicrophone();
        inputConnected=true;
        $('inputSourceValue').textContent='麥克風';
        $('inputFeedback').textContent='麥克風已啟用，請彈單音。';
      }
      $('inputFeedback').className='status ok';
      $('connectInputBtn').textContent='輸入已連接';
    }catch(e){
      ErrorClient.report('Input',e,{title:'鋼琴輸入連接失敗'});
      $('inputFeedback').textContent='連接失敗：'+e.message;
      $('inputFeedback').className='status bad';
    }
  }
  $('connectInputBtn').onclick=connectInput;

  async function playGuide(){
    if(!demoOn)return;
    let t=0;
    for(const [note,dur] of song.events||[]){
      const arr=note==='REST'?[]:(Array.isArray(note)?note:[note]);
      arr.forEach(n=>AudioEngine.play(n,.72,t,Math.min(.65,(60/effectiveBpm)*Number(dur)*.88)));
      t+=(60/effectiveBpm)*Number(dur);
    }
  }

  async function startPractice(){
    effectiveBpm=(Number($('bpm').value)||song.bpm)*(Number($('speed').value)||1);
    ScoringEngine.start(song,effectiveBpm);
    practiceRunning=true;
    $('practiceStatus').textContent=inputConnected?'PLAYING · 即時判定':'PLAYING · 尚未連接輸入';
    $('practiceStatus').className='status '+(inputConnected?'ok':'warn');
    Practice.start(layer,effectiveBpm);
    playGuide();
  }

  $('playBtn').onclick=startPractice;

  $('pauseBtn').onclick=()=>{
    Practice.stop();practiceRunning=false;
    $('practiceStatus').textContent='PAUSED';
    $('practiceStatus').className='status';
  };

  $('backBtn').onclick=()=>{
    Practice.reset(layer);practiceRunning=false;
    ScoringEngine.start(song,effectiveBpm||song.bpm);
    $('practiceStatus').textContent='READY';
    $('practiceStatus').className='status';
    $('playedNoteValue').textContent='—';$('expectedNoteValue').textContent='—';$('timingValue').textContent='—';
    $('inputFeedback').textContent='已重來，準備後按開始。';
    updateStars(0);
  };

  $('metronomeBtn').onclick=()=>{
    if(Metronome.running){
      Metronome.stop();$('metronomeBtn').textContent='節拍器：關';$('metronomeBtn').className='btn';
    }else{
      Metronome.start(Number($('bpm').value)||song.bpm,song.timeSig?.[0]||4);
      $('metronomeBtn').textContent='節拍器：開';$('metronomeBtn').className='btn primary';
    }
  };

  $('pianoDemoBtn').onclick=()=>{
    demoOn=!demoOn;
    $('pianoDemoBtn').textContent='譜面鋼琴聲：'+(demoOn?'開':'關');
    $('pianoDemoBtn').className='btn'+(demoOn?' primary':'');
  };

  $('fingeringBtn').onclick=()=>{
    showFingering=!showFingering;
    $('fingeringBtn').textContent='指法：'+(showFingering?'顯示':'隱藏');
    renderScore();
  };

  $('resetTempoBtn').onclick=()=>{$('bpm').value=song.bpm};

  Events.on('input:note',input=>{
    $('playedNoteValue').textContent=input.note;
    $('inputSourceValue').textContent=input.source==='midi'?'MIDI':input.source==='microphone'?'麥克風':'虛擬琴鍵';
    if(!practiceRunning)return;

    const r=ScoringEngine.addInput(input);
    if(!r)return;

    $('expectedNoteValue').textContent=(r.expected||[]).join(' + ')||'—';
    $('timingValue').textContent=r.timingMs==null?'—':`${r.timingMs>0?'+':''}${r.timingMs} ms · ${r.timingClass}`;

    if(r.result==='exact'){
      $('inputFeedback').textContent=`✓ ${input.note} 正確，拍點${r.timingClass}`;
      $('inputFeedback').className='status ok';
    }else if(r.result==='pitch-only'){
      $('inputFeedback').textContent=`音高 ${input.note} 正確，但節拍${r.timingClass}了 ${Math.abs(r.timingMs)} ms`;
      $('inputFeedback').className='status warn';
    }else if(r.result==='wrong-note'){
      $('inputFeedback').textContent=`✕ 你彈 ${input.note}，正確應為 ${(r.expected||[]).join(' + ')}`;
      $('inputFeedback').className='status bad';
    }else{
      $('inputFeedback').textContent=`收到 ${input.note}，目前不在判定位置`;
      $('inputFeedback').className='status warn';
    }

    if(r.eventIndex!=null)Practice.markResult(layer,r.eventIndex,input.note,r.result);
    updateSummary();
  });

  Events.on('input:pitch-live',x=>{
    if($('inputMode').value==='microphone'&&!practiceRunning){
      $('playedNoteValue').textContent=`${x.note} · ${Math.round(x.frequency)}Hz`;
    }
  });

  Events.on('scoring:auto-metronome',async info=>{
    if(!Metronome.running){
      await Metronome.start(effectiveBpm||song.bpm,song.timeSig?.[0]||4);
      $('metronomeBtn').textContent='節拍器：自動開啟';
      $('metronomeBtn').className='btn primary';
      $('practiceStatus').textContent=`節拍持續偏差（平均 ${info.avgMs}ms），已自動開節拍器`;
      $('practiceStatus').className='status warn';
    }
  });

  Events.on('practice:done',()=>{
    practiceRunning=false;
    const s=ScoringEngine.stop();
    updateSummary();
    $('practiceStatus').textContent='FINISHED';
    $('practiceStatus').className='status ok';
    const ai=AICoach.build({pitch:s.pitch,rhythm:s.rhythm,timing:s.avgTiming||0});
    $('aiResult').textContent=ai.summary;
    Store.set('last-practice-v4',{song:song.id,stats:{pitch:s.pitch,rhythm:s.rhythm,timing:s.avgTiming||0,exact:s.exact,stars:s.stars},time:Date.now()});
    if(academyLessonId){Academy.award(academyLessonId,s.stars,s.score,Math.max(2,Math.round((Number(layer.dataset.totalBeats)||8)*60/effectiveBpm/60)),{pitch:s.pitch,rhythm:s.rhythm,exact:s.exact});}
    if(courseLessonId){
      Progression.award(courseLessonId,s.stars,s.score,{pitch:s.pitch,rhythm:s.rhythm,exact:s.exact,avgTiming:s.avgTiming||0});
      Progression.addMinutes(Math.max(2,Math.round((Number(layer.dataset.totalBeats)||8)*60/effectiveBpm/60)));
      $('practiceStatus').textContent+=`｜${courseGrade||''}級課程已記錄`;
    }
  });

  // Virtual keyboard fallback for mobile testing
  const virtual=document.createElement('div');
  virtual.className='virtual-input-row';
  virtual.innerHTML='<small>手機測試琴鍵：</small>'+['C4','D4','E4','F4','G4','A4','B4','C5'].map(n=>`<button type="button" class="btn" data-vnote="${n}">${n}</button>`).join('');
  $('inputFeedback').after(virtual);
  virtual.querySelectorAll('[data-vnote]').forEach(b=>b.onclick=()=>InputEngine.emitVirtual(b.dataset.vnote));

})();
