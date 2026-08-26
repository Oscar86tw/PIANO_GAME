
(async()=>{
  const $=id=>document.getElementById(id);
  const q=new URLSearchParams(location.search),id=q.get('song')||'twinkle';
  const practiceM1=Number(q.get('m1')||1),practiceM2=q.get('m2')?Number(q.get('m2')):null;
  const courseLessonId=q.get('lesson'),academyLessonId=q.get('academy'),courseGrade=Number(q.get('grade')||0);
  const layer=$('scoreLayer'),song=await Practice.loadSong(id);

  let showFingering=true,demoOn=false,inputConnected=false,practiceRunning=false,paused=false;

  function setupAudioMixer(){
    const v=AudioEngine.getVolumes();
    $('pianoVolume').value=Math.round(v.piano*100);
    $('metroVolume').value=Math.round(v.metronome*100);
    $('masterVolume').value=Math.round(v.master*100);

    const update=()=>{
      const piano=Number($('pianoVolume').value)/100;
      const metronome=Number($('metroVolume').value)/100;
      const master=Number($('masterVolume').value)/100;
      AudioEngine.setVolume('piano',piano);
      AudioEngine.setVolume('metronome',metronome);
      AudioEngine.setVolume('master',master);
      $('pianoVolumeValue').textContent=Math.round(piano*100)+'%';
      $('metroVolumeValue').textContent=Math.round(metronome*100)+'%';
      $('masterVolumeValue').textContent=Math.round(master*100)+'%';
    };
    ['pianoVolume','metroVolume','masterVolume'].forEach(id=>$(id).addEventListener('input',update));
    update();
  }
  setupAudioMixer();

  let effectiveBpm=Number(song.bpm)||80;

  function renderScore(){
    Practice.render(layer,{showFingering,startMeasure:practiceM1,endMeasure:practiceM2});
    $('noteCountTag').textContent=(layer.dataset.noteCount||0)+' notes';
  }
  renderScore();
  $('songTitle').textContent=song.title+(practiceM2?`｜小節 ${practiceM1}–${practiceM2}`:'');
  $('songLevel').textContent=song.level||'';$('songCat').textContent=song.category||'';$('bpm').value=song.bpm;

  function calcEffectiveBpm(){return Math.max(30,Math.min(240,(Number($('bpm').value)||song.bpm)*(Number($('speed').value)||1)))}
  function applyTempo(){
    effectiveBpm=calcEffectiveBpm();
    if(TransportMaster.isRunning()||paused)TransportMaster.setBpm(effectiveBpm);
    $('masterBpm').textContent=Math.round(effectiveBpm);
    $('practiceStatus').textContent=(practiceRunning?'PLAYING':paused?'PAUSED':'READY')+` · ${Math.round(effectiveBpm)} BPM`;
  }

  $('bpm').addEventListener('input',applyTempo);
  $('bpm').addEventListener('change',applyTempo);
  $('speed').addEventListener('change',applyTempo);

  function updateStars(n,score=null){$('practiceStars').innerHTML='★'.repeat(n)+'☆'.repeat(5-n)+` <span>${score==null?'尚未評分':`本次 ${score} 分｜${n} 顆星`}</span>`}
  updateStars(0);

  function updateSummary(){
    const s=ScoringEngine.summary();$('pitchResult').textContent=s.total?s.pitch+'%':'—';$('rhythmResult').textContent=s.total?s.rhythm+'%':'—';$('exactResult').textContent=s.total?s.exact+'%':'—';if(s.total)updateStars(s.stars,s.score);return s;
  }

  async function connectInput(){
    const mode=$('inputMode').value;
    if(mode==='none'){$('inputFeedback').textContent='請先選擇 MIDI 或麥克風。';$('inputFeedback').className='status warn';return}
    try{
      if(mode==='midi'){
        const devices=await InputEngine.connectMIDI();inputConnected=true;$('inputSourceValue').textContent=devices.length?devices.join(' / '):'MIDI（無裝置）';$('inputFeedback').textContent=devices.length?'MIDI 已連接。':'Web MIDI 已啟用，但目前沒有 MIDI 裝置。';
      }else{
        await InputEngine.startMicrophone();inputConnected=true;$('inputSourceValue').textContent='麥克風';$('inputFeedback').textContent='麥克風已啟用，請彈單音。';
      }
      $('inputFeedback').className='status ok';$('connectInputBtn').textContent='輸入已連接';
    }catch(e){ErrorClient.report('Input',e,{title:'鋼琴輸入連接失敗'});$('inputFeedback').textContent='連接失敗：'+e.message;$('inputFeedback').className='status bad'}
  }
  $('connectInputBtn').onclick=connectInput;

  async function beginFromStart(){
    effectiveBpm=calcEffectiveBpm();
    Practice.reset(layer);TransportMaster.stop();

    $('practiceStatus').textContent='準備音色與時間軸…';
    await AudioEngine.preload();
    const health=AudioEngine.health();
    $('audioHealth').textContent=health.loadedSamples?`${health.loadedSamples}/${health.expectedSamples}`:'Fallback';

    const timeline=Practice.getTimeline();
    await TransportMaster.start(effectiveBpm,0);
    ScoringEngine.start(song,effectiveBpm,{transport:TransportMaster,timeline});
    practiceRunning=true;paused=false;Practice.start(layer);
    if(demoOn)await DemoScheduler.enable(timeline);
    if(Metronome.enabled)Metronome.resetSchedule();
    $('practiceStatus').textContent=inputConnected?'PLAYING · 同步即時判定':'PLAYING · 同步播放';
    $('practiceStatus').className='status '+(inputConnected?'ok':'');
  }

  async function resumePractice(){
    effectiveBpm=calcEffectiveBpm();TransportMaster.setBpm(effectiveBpm);
    await TransportMaster.resume();practiceRunning=true;paused=false;Practice.start(layer);
    if(demoOn){DemoScheduler.enabled=true;DemoScheduler.timeline=Practice.getTimeline();DemoScheduler.resetSchedule();DemoScheduler.scheduler()}
    $('practiceStatus').textContent='PLAYING · 已同步繼續';$('practiceStatus').className='status ok';
  }

  $('playBtn').onclick=()=>paused?resumePractice():practiceRunning?null:beginFromStart();

  $('pauseBtn').onclick=()=>{
    if(!practiceRunning)return;
    TransportMaster.pause();Practice.stop();DemoScheduler.cancelScheduled();Metronome.cancelScheduled();
    practiceRunning=false;paused=true;$('practiceStatus').textContent='PAUSED · Master Clock 已凍結';$('practiceStatus').className='status';
  };

  $('backBtn').onclick=()=>{
    TransportMaster.stop();Practice.reset(layer);DemoScheduler.disable();Metronome.cancelScheduled();
    practiceRunning=false;paused=false;
    $('practiceStatus').textContent='READY';$('practiceStatus').className='status';
    $('playedNoteValue').textContent='—';$('expectedNoteValue').textContent='—';$('timingValue').textContent='—';$('inputFeedback').textContent='已重來，準備後按開始。';updateStars(0);
  };

  $('metronomeBtn').onclick=async()=>{
    if(Metronome.enabled){Metronome.disable();$('metronomeBtn').textContent='節拍器：關';$('metronomeBtn').className='btn'}
    else{await Metronome.enable(song.timeSig?.[0]||4);$('metronomeBtn').textContent='節拍器：開（同步）';$('metronomeBtn').className='btn primary'}
  };

  $('pianoDemoBtn').onclick=async()=>{
    demoOn=!demoOn;$('pianoDemoBtn').textContent='譜面鋼琴聲：'+(demoOn?'開（同步）':'關');$('pianoDemoBtn').className='btn'+(demoOn?' primary':'');
    if(practiceRunning){
      if(demoOn)await DemoScheduler.enable(Practice.getTimeline());else DemoScheduler.disable();
    }else if(!demoOn)DemoScheduler.disable();
  };

  $('fingeringBtn').onclick=()=>{showFingering=!showFingering;$('fingeringBtn').textContent='指法：'+(showFingering?'顯示':'隱藏');renderScore()};
  $('resetTempoBtn').onclick=()=>{$('bpm').value=song.bpm;$('speed').value='1';applyTempo()};

  Events.on('input:note',input=>{
    $('playedNoteValue').textContent=input.note;$('inputSourceValue').textContent=input.source==='midi'?'MIDI':input.source==='microphone'?'麥克風':'虛擬琴鍵';
    if(!practiceRunning)return;
    const r=ScoringEngine.addInput(input);if(!r)return;
    $('expectedNoteValue').textContent=(r.expected||[]).join(' + ')||'—';$('timingValue').textContent=r.timingMs==null?'—':`${r.timingMs>0?'+':''}${r.timingMs} ms · ${r.timingClass}`;
    if(r.result==='exact'){$('inputFeedback').textContent=`✓ ${input.note} 正確，拍點${r.timingClass}`;$('inputFeedback').className='status ok'}
    else if(r.result==='pitch-only'){$('inputFeedback').textContent=`音高 ${input.note} 正確，但節拍${r.timingClass}了 ${Math.abs(r.timingMs)} ms`;$('inputFeedback').className='status warn'}
    else if(r.result==='wrong-note'){$('inputFeedback').textContent=`✕ 你彈 ${input.note}，正確應為 ${(r.expected||[]).join(' + ')}`;$('inputFeedback').className='status bad'}
    else{$('inputFeedback').textContent=`收到 ${input.note}，目前不在判定位置`;$('inputFeedback').className='status warn'}
    if(r.eventIndex!=null)Practice.markResult(layer,r.eventIndex,input.note,r.result);updateSummary();
  });

  Events.on('input:pitch-live',x=>{if($('inputMode').value==='microphone'&&!practiceRunning)$('playedNoteValue').textContent=`${x.note} · ${Math.round(x.frequency)}Hz`});

  Events.on('scoring:auto-metronome',async info=>{
    if(!Metronome.enabled){
      await Metronome.enable(song.timeSig?.[0]||4);$('metronomeBtn').textContent='節拍器：自動開啟（同步）';$('metronomeBtn').className='btn primary';
      $('practiceStatus').textContent=`節拍持續偏差（平均 ${info.avgMs}ms），同步節拍器已開啟`;$('practiceStatus').className='status warn';
    }
  });

  Events.on('practice:done',()=>{
    practiceRunning=false;paused=false;DemoScheduler.disable();Metronome.cancelScheduled();
    const s=ScoringEngine.stop();updateSummary();$('practiceStatus').textContent='FINISHED';$('practiceStatus').className='status ok';
    const ai=AICoach.build({pitch:s.pitch,rhythm:s.rhythm,timing:s.avgTiming||0});$('aiResult').textContent=ai.summary;
    Store.set('last-practice-v4',{song:song.id,stats:{pitch:s.pitch,rhythm:s.rhythm,timing:s.avgTiming||0,exact:s.exact,stars:s.stars},time:Date.now()});
    if(academyLessonId)Academy.award(academyLessonId,s.stars,s.score,Math.max(2,Math.round((Number(layer.dataset.totalBeats)||8)*60/effectiveBpm/60)),{pitch:s.pitch,rhythm:s.rhythm,exact:s.exact});
    if(courseLessonId){Progression.award(courseLessonId,s.stars,s.score,{pitch:s.pitch,rhythm:s.rhythm,exact:s.exact,avgTiming:s.avgTiming||0});Progression.addMinutes(Math.max(2,Math.round((Number(layer.dataset.totalBeats)||8)*60/effectiveBpm/60)));$('practiceStatus').textContent+=`｜${courseGrade||''}級課程已記錄`}
  });

  function syncHud(){
    $('masterBeat').textContent=TransportMaster.currentBeat().toFixed(2);$('masterBpm').textContent=Math.round(calcEffectiveBpm());requestAnimationFrame(syncHud);
  }
  Events.on('audio:health',h=>{
    $('audioHealth').textContent=h.loadedSamples?`${h.loadedSamples}/${h.expectedSamples}`:'Fallback';
  });
  AudioEngine.preload().then(()=>{
    const h=AudioEngine.health();
    $('audioHealth').textContent=h.loadedSamples?`${h.loadedSamples}/${h.expectedSamples}`:'Fallback';
  }).catch(()=>{$('audioHealth').textContent='Fallback'});
  syncHud();applyTempo();

  const virtual=document.createElement('div');virtual.className='virtual-input-row';virtual.innerHTML='<small>手機測試琴鍵：</small>'+['C4','D4','E4','F4','G4','A4','B4','C5'].map(n=>`<button type="button" class="btn" data-vnote="${n}">${n}</button>`).join('');
  $('inputFeedback').after(virtual);virtual.querySelectorAll('[data-vnote]').forEach(b=>b.onclick=()=>InputEngine.emitVirtual(b.dataset.vnote));
})();
