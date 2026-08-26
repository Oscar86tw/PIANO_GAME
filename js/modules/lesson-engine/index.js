
(function(){
  let curriculum=[],bank=[];

  async function load(){
    if(curriculum.length&&bank.length)return {curriculum,bank};
    [curriculum,bank]=await Promise.all([
      fetch(AppBase+'data/curriculum.json').then(r=>r.json()),
      fetch(AppBase+'data/lesson-bank.json').then(r=>r.json())
    ]);
    return {curriculum,bank};
  }

  function gradeSpec(grade){
    return {
      curriculum:curriculum.find(x=>Number(x.grade)===Number(grade)),
      bank:bank.find(x=>Number(x.grade)===Number(grade))
    };
  }

  function midiRange(start,end){
    const a=AudioEngine.noteToMidi(start),b=AudioEngine.noteToMidi(end),out=[];
    for(let m=a;m<=b;m++)out.push(AudioEngine.midiToNote(m));
    return out;
  }

  function randomWalk(pool,len,maxLeap=2){
    const out=[];let idx=Math.floor(pool.length/2);
    for(let i=0;i<len;i++){
      idx=Math.max(0,Math.min(pool.length-1,idx+Math.floor(Math.random()*(maxLeap*2+1))-maxLeap));
      out.push(pool[idx]);
    }
    return out;
  }

  function generateSight(grade,patternIndex=0){
    const {curriculum:c,bank:b}=gradeSpec(grade);
    if(!c||!b)throw new Error('找不到級別教材');
    const pattern=b.sightReadingPatterns[patternIndex%b.sightReadingPatterns.length];
    const pool=midiRange(b.sightRange[0],b.sightRange[1]);
    const maxLeap=grade>=9?2:grade>=7?3:grade>=5?4:5;
    const notes=randomWalk(pool,pattern.length||c.sight.length,maxLeap);
    const durations=b.rhythmDurations;
    const events=notes.map((n,i)=>[n,durations[Math.floor(Math.random()*durations.length)]]);
    return {
      title:`${grade}級｜${pattern.name}`,
      grade,pattern,
      timeSig:pattern.timeSig||[4,4],
      events,
      range:b.sightRange,
      instruction:`${pattern.hands||c.sight.hands}｜${events.length} 音｜先看 20 秒再開始`
    };
  }

  function generateEar(grade){
    const {curriculum:c,bank:b}=gradeSpec(grade);
    if(!c||!b)throw new Error('找不到級別教材');
    const pool=midiRange(c.ear.range[0],c.ear.range[1]);
    const notes=randomWalk(pool,c.ear.length,grade>=8?2:4);
    return {
      title:`${grade}級聽奏`,
      grade,
      notes,
      task:b.auralTasks[Math.floor(Math.random()*b.auralTasks.length)],
      mode:c.ear.mode
    };
  }

  function techniqueList(grade){
    return gradeSpec(grade).bank?.techniqueExercises||[];
  }

  function repertoireList(grade){
    return gradeSpec(grade).bank?.repertoireTasks||[];
  }

  function gradeOverview(grade){
    const x=gradeSpec(grade);
    if(!x.curriculum||!x.bank)return null;
    return {
      grade,
      goal:x.curriculum.goal,
      technique:x.bank.techniqueExercises,
      sight:x.bank.sightReadingPatterns,
      aural:x.bank.auralTasks,
      repertoire:x.bank.repertoireTasks,
      flow:x.bank.lessonFlow
    };
  }

  window.LessonEngine={load,gradeSpec,generateSight,generateEar,techniqueList,repertoireList,gradeOverview};
})();
