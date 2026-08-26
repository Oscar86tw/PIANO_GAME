
(function(){
  const KEY='piano-course-progress-v46';
  const OLD='piano-course-progress-v45';

  function empty(){
    return {
      version:'V4.6',
      lessons:{},
      unlockedGrades:[10],
      totalStars:0,
      dailyMinutes:{},
      lastGrade:10,
      migratedFrom:null
    };
  }

  function recomputeTotal(p){
    p.totalStars=Object.values(p.lessons||{}).reduce((sum,r)=>sum+(Number(r.stars)||0),0);
    return p.totalStars;
  }

  function migrate(){
    const existing=Store.get(KEY,null);
    if(existing)return existing;

    const old=Store.get(OLD,null);
    const p=empty();
    if(old&&old.lessons){
      for(const [id,r] of Object.entries(old.lessons)){
        p.lessons[id]={...r};
      }
      p.dailyMinutes={...(old.dailyMinutes||{})};
      p.migratedFrom='V4.5';
      recomputeTotal(p);
    }
    Store.set(KEY,p);
    return p;
  }

  function load(){
    const p=migrate()||empty();
    p.lessons=p.lessons||{};
    p.unlockedGrades=Array.isArray(p.unlockedGrades)&&p.unlockedGrades.length?p.unlockedGrades:[10];
    p.dailyMinutes=p.dailyMinutes||{};
    recomputeTotal(p);
    return p;
  }
  function save(p){recomputeTotal(p);Store.set(KEY,p);return p}

  function lesson(id){
    const p=load();
    return p.lessons[id]||{stars:0,attempts:0,bestScore:0,completed:false,lastAt:null};
  }

  function award(lessonId,stars,score=0,detail={}){
    const p=load();
    const prev=p.lessons[lessonId]||{stars:0,attempts:0,bestScore:0,completed:false,lastAt:null};
    prev.attempts=(prev.attempts||0)+1;
    prev.stars=Math.max(prev.stars||0,Math.max(1,Math.min(5,Number(stars)||1)));
    prev.bestScore=Math.max(prev.bestScore||0,Number(score)||0);
    prev.completed=prev.stars>=3;
    prev.lastAt=Date.now();
    prev.detail={...(prev.detail||{}),...detail};
    p.lessons[lessonId]=prev;
    save(p);
    Events.emit('progress:changed',{lessonId,record:prev,progress:p});
    return prev;
  }

  function level(curriculum,grade){return curriculum.find(x=>Number(x.grade)===Number(grade))}
  function gradeStars(curriculum,grade){
    const l=level(curriculum,grade);if(!l)return 0;
    const p=load();
    return l.lessons.reduce((sum,x)=>sum+(p.lessons[x.id]?.stars||0),0);
  }
  function domainStatus(curriculum,grade){
    const l=level(curriculum,grade);if(!l)return {};
    const p=load(), out={};
    for(const lesson of l.lessons){
      out[lesson.domain||lesson.type]={
        stars:p.lessons[lesson.id]?.stars||0,
        passed:(p.lessons[lesson.id]?.stars||0)>=(l.mastery?.minimumEachDomainStars||3),
        lessonId:lesson.id
      };
    }
    return out;
  }
  function gradeCompleted(curriculum,grade){
    const l=level(curriculum,grade);if(!l)return false;
    const domains=domainStatus(curriculum,grade);
    const min=l.mastery?.minimumEachDomainStars||3;
    const allDomains=l.mastery?.mustPassAllDomains!==false
      ? l.lessons.every(x=>(domains[x.domain||x.type]?.stars||0)>=min)
      : true;
    const total=gradeStars(curriculum,grade);
    return allDomains && total>=(l.mastery?.minimumTotalStars||l.unlockTotal||12);
  }

  function refreshUnlocks(curriculum){
    const p=load();
    // Recalculate from scratch so old loose V4.5 unlocks cannot bypass new mastery gates.
    const unlocked=[10];
    for(let grade=10;grade>=2;grade--){
      if(unlocked.includes(grade)&&gradeCompleted(curriculum,grade))unlocked.push(grade-1);
      else break;
    }
    p.unlockedGrades=unlocked;
    save(p);
    return p;
  }

  function isUnlocked(grade){return load().unlockedGrades.includes(Number(grade))}

  function addMinutes(min=1){
    const p=load(),key=new Date().toISOString().slice(0,10);
    p.dailyMinutes[key]=(p.dailyMinutes[key]||0)+Math.max(0,Number(min)||0);
    save(p);return p.dailyMinutes[key];
  }
  function todayMinutes(){
    const key=new Date().toISOString().slice(0,10);
    return load().dailyMinutes[key]||0;
  }

  function reset(){
    const p=empty();Store.set(KEY,p);Events.emit('progress:changed',{progress:p,reset:true});return p;
  }

  window.Progression={
    load,save,lesson,award,gradeStars,domainStatus,gradeCompleted,refreshUnlocks,isUnlocked,
    addMinutes,todayMinutes,reset
  };
})();
