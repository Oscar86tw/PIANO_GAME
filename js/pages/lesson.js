
(async()=>{
  const params=new URLSearchParams(location.search);
  const grade=Number(params.get('grade')||10);
  const lessonId=params.get('lesson')||`g${grade}_technique`;
  const type=params.get('type')||lessonId.split('_').slice(1).join('_')||'technique';
  const curriculum=(await LessonEngine.load()).curriculum;
  const level=curriculum.find(x=>Number(x.grade)===grade)||curriculum[0];
  const lesson=level.lessons.find(x=>x.id===lessonId)||level.lessons[0];

  lessonTitle.textContent=`${level.title}｜${lesson.title}`;
  lessonGoal.textContent=`${level.goal}｜本課目標：${lesson.target}`;

  function taskFor(step){
    const overview=LessonEngine.gradeOverview(grade);
    if(step.id==='demo')return `先看示範與讀譜。${overview.technique?.[0]?.title||lesson.title}`;
    if(step.id==='slow')return '把速度降到約 60～70%，每 2～4 小節一段，先求正確。';
    if(step.id==='onehand')return type==='technique'||type==='scale'?'左右手分開練習；指法固定後再加速。':'先分手確認音高與節奏。';
    if(step.id==='bothhands')return '雙手合起來，保持慢速與穩定拍點，不追求快。';
    if(step.id==='tempo')return '回到本級建議速度，連續完成至少一次不中斷。';
    if(step.id==='test')return '正式測驗：不可中途重來。系統依音高、節奏、完成度計算 1～5★。';
    return step.title;
  }

  function starsText(n){return '★'.repeat(n)+'☆'.repeat(5-n)}

  function render(){
    const session=LessonSession.get(lessonId);
    const done=session.steps.filter(x=>x.done).length;
    const pct=Math.round(done/session.steps.length*100);
    lessonProgressBar.style.width=pct+'%';
    lessonProgressText.textContent=`${done} / ${session.steps.length} 步驟完成`;

    lessonSteps.innerHTML='';
    session.steps.forEach((step,idx)=>{
      const open=LessonSession.canOpen(session,step.id),active=open&&!step.done&&LessonSession.currentStep(session).id===step.id;
      const d=document.createElement('div');
      d.className='lesson-step '+(step.done?'done ':open?'':'locked ')+(active?'active':'');
      d.innerHTML=`<div class="lesson-step-head"><div><strong>${idx+1}. ${step.title}</strong><small>${taskFor(step)}</small></div><span class="badge">${step.done?'✓ 完成':open?'可進行':'🔒'}</span></div>`;
      if(open&&!step.done){
        const actions=document.createElement('div');actions.className='lesson-action';
        if(step.id==='test'){
          const btn=document.createElement('button');btn.className='btn primary';btn.textContent='開始正式測驗';
          btn.onclick=()=>runTest(step.id);
          actions.appendChild(btn);
        }else{
          const btn=document.createElement('button');btn.className='btn primary';btn.textContent='完成這一步';
          btn.onclick=()=>completeTrainingStep(step.id);
          actions.appendChild(btn);
        }
        d.appendChild(actions);
      }
      lessonSteps.appendChild(d);
    });

    const current=LessonSession.currentStep(session);
    currentTask.innerHTML=`<strong>${current.title}</strong><p>${taskFor(current)}</p>`;
    lessonStars.textContent=starsText(session.finalStars||0);
    lessonResult.textContent=session.completed
      ? `本課達標｜最佳 ${session.finalScore} 分｜${session.finalStars}★`
      : session.attempts
      ? `本課尚未達標｜最佳 ${session.finalScore} 分｜會加入複習清單`
      : '尚未完成正式測驗。';
    lessonResult.className='status '+(session.completed?'ok':session.attempts?'warn':'');
  }

  function completeTrainingStep(stepId){
    LessonSession.completeStep(lessonId,stepId,{score:100,stars:0});
    Progression.addMinutes(stepId==='demo'?1:3);
    render();
  }

  function scoreToStars(score){
    return score>=95?5:score>=88?4:score>=78?3:score>=65?2:1;
  }

  function runTest(){
    // In the standalone lesson flow, use a deterministic-style simulated result.
    // Actual Practice lessons can still use the real V4.4 scoring engine.
    const score=Math.floor(Math.random()*36)+65;
    const stars=scoreToStars(score);
    LessonSession.completeStep(lessonId,'test',{score,stars});
    Progression.award(lessonId,stars,score,{lessonFlow:'V4.8'});
    Progression.addMinutes(4);
    render();
  }

  Events.on('lesson-session:changed',render);
  render();
})();
