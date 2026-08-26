
(async()=>{
  const params=new URLSearchParams(location.search);
  const courseLessonId=params.get('lesson');
  const courseGrade=Number(params.get('grade')||0);
  const requestedTab=params.get('tab');
  const songs=await fetch('../data/songs.json').then(r=>r.json());
  const scales=await fetch('../data/scales.json').then(r=>r.json());
  const curriculum=await fetch('../data/curriculum.json').then(r=>r.json());
  await LessonEngine.load();
  const gradeSpec=curriculum.find(x=>Number(x.grade)===courseGrade)||curriculum[0];

  document.querySelectorAll('[data-tab]').forEach(btn=>{
    btn.onclick=()=>{
      document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===btn));
      document.querySelectorAll('.train-pane').forEach(x=>x.classList.toggle('active',x.id===btn.dataset.tab));
    };
  });

  if(requestedTab){
    const tabMap={scale:'scalePane',sight:'sightPane',ear:'earPane',song:'repertoirePane'};
    const target=tabMap[requestedTab];
    if(target){
      const btn=document.querySelector(`[data-tab="${target}"]`);
      if(btn)btn.click();
    }
  }

  if(courseGrade){
    const overview=LessonEngine.gradeOverview(courseGrade);
    const card=document.getElementById('formalLessonCard');
    if(card&&overview){
      card.innerHTML=`<strong>${courseGrade}級正式教材</strong>｜${overview.goal}<br>
        <small>本次流程：${overview.flow.join(' → ')}</small>`;
      card.className='status ok';
    }
  }else{
    const card=document.getElementById('formalLessonCard');
    if(card)card.textContent='自由訓練模式：可自行選音階、視奏、聽奏。';
  }

  const deg={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
  function y(note,bass=false){
    const m=String(note).match(/^([A-G])#?(-?\d)$/);if(!m)return bass?180:120;
    const step=Number(m[2])*7+deg[m[1]],base=(bass?2:4)*7+deg[bass?'G':'E'];
    return (bass?195:120)-(step-base)*7;
  }
  function clear(el){el.innerHTML=''}
  function addNote(layer,n,x,bass=false,finger='',cls=''){
    const note=document.createElement('span');
    note.className='train-note'+(bass?' left':'')+(cls?' '+cls:'');
    note.style.left=x+'px';note.style.top=y(n,bass)+'px';layer.appendChild(note);
    if(finger){
      const f=document.createElement('span');f.className='finger';f.style.left=(x-2)+'px';f.style.top=(y(n,bass)-24)+'px';f.textContent=finger;layer.appendChild(f);
    }
  }
  function randFrom(arr){return arr[Math.floor(Math.random()*arr.length)]}

  // Scales
  scales.forEach(s=>scaleSelect.insertAdjacentHTML('beforeend',`<option value="${s.id}">${s.title}｜${s.grade}</option>`));
  function renderScalePane(){
    const s=scales.find(x=>x.id===scaleSelect.value)||scales[0];
    scaleBpm.value=s.bpm;clear(scaleLayer);
    if(s.hand==='雙手'){
      s.right.forEach((n,i)=>addNote(scaleLayer,n,60+i*48,false,showFingering.value==='on'?(s.rf[i]||''):''));
      s.left.forEach((n,i)=>addNote(scaleLayer,n,60+i*48,true,showFingering.value==='on'?(s.lf[i]||''):''));
      scaleInfo.textContent=`${s.title}｜雙手｜${s.bpm} BPM`;
    }else{
      s.notes.forEach((n,i)=>addNote(scaleLayer,n,60+i*48,false,showFingering.value==='on'?(s.fingers[i]||''):''));
      scaleInfo.textContent=`${s.title}｜${s.hand}｜${s.bpm} BPM`;
    }
  }
  renderScale.onclick=renderScalePane;showFingering.onchange=renderScalePane;scaleSelect.onchange=renderScalePane;renderScalePane();

  async function playSeq(notes,bpm=80){
    await AudioEngine.init();
    let t=0;
    notes.forEach(n=>{AudioEngine.play(n,.88,t,.42);t+=60/bpm});
  }
  playScale.onclick=()=>{
    const s=scales.find(x=>x.id===scaleSelect.value)||scales[0];
    playSeq(s.hand==='雙手'?s.right:s.notes,Number(scaleBpm.value)||s.bpm).catch(e=>ErrorClient.report('Training/Scale',e));
    if(courseLessonId && requestedTab==='scale'){
      Progression.award(courseLessonId,3,78);
      Progression.addMinutes(3);
      scaleInfo.textContent+=`｜完成示範，已獲 3 顆星`;
    }
  };
  openScalePractice.onclick=()=>{
    const map={c_major_1_oct:'scale_c_major',g_major_1_oct:'scale_g_major',c_both_hands:'both_hands_easy'};
    location.href='practice.html?song='+encodeURIComponent(map[scaleSelect.value]||'scale_c_major');
  };

  // Sight reading follows the selected formal grade specification.
  let lastSightKey='',currentSight=[];
  function midiRange(start,end){
    const a=AudioEngine.noteToMidi(start),b=AudioEngine.noteToMidi(end),out=[];
    for(let m=a;m<=b;m++)out.push(AudioEngine.midiToNote(m));
    return out;
  }
  function buildSight(){
    const g=courseGrade||Number(sightGrade.value);
    const generated=LessonEngine.generateSight(g,Math.floor(Math.random()*4));
    currentSight=generated.events.map(([note,dur],i)=>({
      note,
      bass:(generated.pattern.hands||'').includes('雙手') && i%2===1 && g<=9
    }));
    currentSight.meta=generated;
    return currentSight;
  }

  function renderSight(){
    clear(sightLayer);currentSight.forEach((x,i)=>addNote(sightLayer,x.note,60+i*48,x.bass));
    const g=courseGrade||Number(sightGrade.value); const meta=currentSight.meta||LessonEngine.generateSight(g,0); sightInfo.textContent=`${meta.title}｜${meta.instruction}`;
  }
  generateSight.onclick=()=>{buildSight();renderSight()};buildSight();renderSight();

  function setStars(n){
    starRow.innerHTML='';
    for(let i=1;i<=5;i++){const s=document.createElement('span');s.className=i<=n?'star-on':'star-off';s.textContent='★';starRow.appendChild(s)}
    starText.textContent=`本次獎勵：${n} 顆星`;
  }
  setStars(0);
  demoScoreBtn.onclick=()=>{
    const stars=Math.floor(Math.random()*5)+1;
    setStars(stars);
    if(courseLessonId){
      Progression.award(courseLessonId,stars,stars*20);
      Progression.addMinutes(3);
      starText.textContent+=`｜已記入 ${courseGrade||''}級課程`;
    }
  };

  // Ear training
  const notePool=['C4','D4','E4','F4','G4','A4','B4','C5'],answer=[],prompt=[];
  function renderEarButtons(){
    earButtons.innerHTML='';
    notePool.forEach(n=>{
      const b=document.createElement('button');b.className='btn';b.textContent=n;
      b.onclick=()=>{answer.push(n);drawEar(answer,false)};
      earButtons.appendChild(b);
    });
  }
  function drawEar(seq,correction=false){
    clear(earLayer);
    seq.forEach((n,i)=>addNote(earLayer,n,50+i*50,false,'',correction?'wrong-correct':''));
    if(correction){
      seq.forEach((n,i)=>{
        const mark=document.createElement('span');mark.className='finger';mark.style.left=(50+i*50)+'px';mark.style.top='18px';mark.style.color='#b6545a';mark.textContent='修正';earLayer.appendChild(mark);
      });
    }
  }
  function buildEarPrompt(){
    prompt.length=0;answer.length=0;
    const g=courseGrade||Number(earLevel.value<=5?10:9);
    const generated=courseGrade?LessonEngine.generateEar(g):null;
    if(generated){
      prompt.push(...generated.notes);
      earInfo.textContent=`${generated.title}｜${generated.task}｜${generated.mode}`;
    }else{
      const formalLen=Number(earLevel.value),range=earRange.value==='C4-G4'?notePool.slice(0,5):notePool;
      for(let i=0;i<formalLen;i++)prompt.push(randFrom(range));
      earInfo.textContent=`${formalLen} 音聽奏：播放後作答。`;
    }
    drawEar([],false);
  }
  renderEarButtons();buildEarPrompt();

  earMidiBtn.onclick=async()=>{
    try{const d=await InputEngine.connectMIDI();earInfo.textContent=d.length?'MIDI 已連接：'+d.join(' / '):'MIDI 已啟用，但未找到裝置。'}
    catch(e){earInfo.textContent='MIDI 連接失敗：'+e.message;ErrorClient.report('Training/Ear MIDI',e)}
  };
  earMicBtn.onclick=async()=>{
    try{await InputEngine.startMicrophone();earInfo.textContent='麥克風已啟用，請彈單音。'}
    catch(e){earInfo.textContent='麥克風失敗：'+e.message;ErrorClient.report('Training/Ear Mic',e)}
  };

  playEar.onclick=async()=>{
    try{
      await AudioEngine.init();let t=0;
      prompt.forEach(n=>{AudioEngine.play(n,.95,t,.45);t+=.7});
      earInfo.textContent='題目已播放，請作答。';
    }catch(e){ErrorClient.report('Training/Ear',e)}
  };
  clearEar.onclick=()=>{answer.length=0;drawEar([],false);earInfo.textContent='已清空作答。'};
  checkEar.onclick=()=>{
    const ok=answer.length===prompt.length&&answer.every((n,i)=>n===prompt[i]);
    if(ok){
      drawEar(answer,false);earInfo.textContent='答對了！已顯示在五線譜。';
      const s=Math.min(5,Math.max(3,prompt.length));setStars(s);
      if(courseLessonId){Progression.award(courseLessonId,s,90);Progression.addMinutes(3);}
    }else{
      drawEar(prompt,true);earInfo.textContent='有錯誤，已顯示正確答案作修正。';setStars(1);
      if(courseLessonId){Progression.award(courseLessonId,1,55);Progression.addMinutes(2);}
    }
  };
  earLevel.onchange=buildEarPrompt;earRange.onchange=buildEarPrompt;

  Events.on('input:note',input=>{
    if(!earPane.classList.contains('active'))return;
    if(answer.length>=prompt.length)return;
    answer.push(input.note);
    drawEar(answer,false);
    const idx=answer.length-1;
    if(input.note===prompt[idx])earInfo.textContent=`第 ${idx+1} 音 ${input.note} 正確`;
    else earInfo.textContent=`第 ${idx+1} 音你彈 ${input.note}，正確是 ${prompt[idx]}`;
    if(answer.length===prompt.length)checkEar.click();
  });

  // Metronome explanation demo
  demoMetronome.onclick=()=>{
    metroState.textContent='正式 Practice：連續節拍偏差超過門檻時會真正自動開啟節拍器。';
    metroState.className='status warn';
  };

  // Repertoire
  ['流行音樂','古典音樂','卡通歌','熱門歌','宮崎駿'].forEach(c=>{
    const count=songs.filter(x=>x.category===c).length,d=document.createElement('div');
    d.className='list-card';d.innerHTML=`<strong>${c}</strong><p>內建兒童示範：${count} 首；授權/自有樂譜可再匯入。</p>`;
    repertoireList.appendChild(d);
  });
})();
