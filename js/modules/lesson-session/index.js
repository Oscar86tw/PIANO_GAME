
(function(){
  const KEY='piano-lesson-sessions-v48';
  const REVIEW='piano-review-queue-v48';

  const DEFAULT_STEPS=[
    {id:'demo',title:'老師示範',required:true},
    {id:'slow',title:'慢速分段',required:true},
    {id:'onehand',title:'單手練習',required:true},
    {id:'bothhands',title:'雙手練習',required:true},
    {id:'tempo',title:'正常速度',required:true},
    {id:'test',title:'正式測驗',required:true}
  ];

  function store(){return Store.get(KEY,{})}
  function save(x){Store.set(KEY,x);return x}
  function get(lessonId){
    const all=store();
    return all[lessonId]||{
      lessonId,
      steps:DEFAULT_STEPS.map(x=>({...x,done:false,score:null,stars:0,at:null})),
      completed:false,
      finalStars:0,
      finalScore:0,
      attempts:0,
      lastAt:null
    };
  }
  function put(session){
    const all=store();all[session.lessonId]=session;save(all);return session;
  }
  function currentStep(session){
    return session.steps.find(x=>x.required&&!x.done)||session.steps[session.steps.length-1];
  }
  function canOpen(session,stepId){
    const idx=session.steps.findIndex(x=>x.id===stepId);
    if(idx<=0)return true;
    return session.steps.slice(0,idx).filter(x=>x.required).every(x=>x.done);
  }
  function completeStep(lessonId,stepId,{score=null,stars=0}={}){
    const s=get(lessonId),step=s.steps.find(x=>x.id===stepId);
    if(!step)throw new Error('找不到課堂步驟');
    if(!canOpen(s,stepId))throw new Error('請先完成前一個必要步驟');
    step.done=true;step.score=score;step.stars=Math.max(step.stars||0,stars||0);step.at=Date.now();
    s.lastAt=Date.now();
    if(stepId==='test'){
      s.attempts=(s.attempts||0)+1;
      s.finalScore=Math.max(s.finalScore||0,Number(score)||0);
      s.finalStars=Math.max(s.finalStars||0,Number(stars)||0);
      s.completed=(Number(stars)||0)>=3;
      updateReview(lessonId,s.completed?null:{
        lessonId,reason:'正式測驗低於 3★',stars:Number(stars)||0,score:Number(score)||0,addedAt:Date.now()
      });
    }
    put(s);
    Events.emit('lesson-session:changed',{lessonId,session:s});
    return s;
  }
  function reset(lessonId){
    const all=store();delete all[lessonId];save(all);updateReview(lessonId,null);
    Events.emit('lesson-session:changed',{lessonId,reset:true});
    return get(lessonId);
  }

  function reviewQueue(){return Store.get(REVIEW,[])}
  function updateReview(lessonId,item){
    let rows=reviewQueue().filter(x=>x.lessonId!==lessonId);
    if(item)rows.unshift(item);
    Store.set(REVIEW,rows.slice(0,100));
    Events.emit('review:changed',{queue:rows});
    return rows;
  }
  function addReview(item){
    return updateReview(item.lessonId,item);
  }
  function removeReview(lessonId){return updateReview(lessonId,null)}
  function nextReview(){return reviewQueue()[0]||null}

  window.LessonSession={
    steps:DEFAULT_STEPS,
    get,currentStep,canOpen,completeStep,reset,
    reviewQueue,addReview,removeReview,nextReview
  };
})();
