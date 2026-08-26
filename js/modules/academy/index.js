
(function(){
  const KEY='piano-academy-progress-v50';
  let data=null;

  async function loadData(){
    if(data)return data;
    data=await fetch(AppBase+'data/academy-curriculum.json').then(r=>r.json());
    return data;
  }
  function empty(){return {version:'V5.0',records:{},unlocked:[10],daily:{},weekly:{},totalStars:0,streak:0,lastPractice:null}}
  function progress(){return Store.get(KEY,empty())}
  function save(p){p.totalStars=Object.values(p.records||{}).reduce((s,r)=>s+(r.stars||0),0);Store.set(KEY,p);return p}
  function record(id){return progress().records[id]||{stars:0,bestScore:0,attempts:0,lastAt:null,minutes:0}}
  function award(id,stars,score=0,minutes=0,detail={}){
    const p=progress(),r=p.records[id]||{stars:0,bestScore:0,attempts:0,lastAt:null,minutes:0};
    r.stars=Math.max(r.stars||0,Math.max(1,Math.min(5,Number(stars)||1)));
    r.bestScore=Math.max(r.bestScore||0,Number(score)||0);
    r.attempts=(r.attempts||0)+1;r.lastAt=Date.now();r.minutes=(r.minutes||0)+(Number(minutes)||0);r.detail={...(r.detail||{}),...detail};
    p.records[id]=r;p.lastPractice=Date.now();
    const k=new Date().toISOString().slice(0,10);p.daily[k]=(p.daily[k]||0)+(Number(minutes)||0);
    save(p);Events.emit('academy:changed',{id,record:r,progress:p});return r;
  }
  function gradeStatus(grade,academy){
    const level=academy.grades.find(x=>x.grade===grade),p=progress();
    if(!level)return null;
    const core=level.mastery.coreDomains;
    const items=level.lessons.filter(x=>core.includes(x.domain)).map(x=>({lesson:x,stars:p.records[x.id]?.stars||0}));
    const eachPass=items.every(x=>x.stars>=level.mastery.minimumCoreDomainStars);
    const total=items.reduce((s,x)=>s+x.stars,0);
    return {items,total,eachPass,complete:eachPass&&total>=level.mastery.minimumTotalCoreStars,threshold:level.mastery.minimumTotalCoreStars};
  }
  function refreshUnlocks(academy){
    const p=progress(),u=[10];
    for(let g=10;g>=2;g--){
      const st=gradeStatus(g,academy);
      if(u.includes(g)&&st?.complete)u.push(g-1);else break;
    }
    p.unlocked=u;save(p);return p;
  }
  function today(){return progress().daily[new Date().toISOString().slice(0,10)]||0}
  function dailyGoal(){return 15}
  function isUnlocked(g){return progress().unlocked.includes(Number(g))}
  function reset(){Store.set(KEY,empty());Events.emit('academy:changed',{reset:true})}
  function weakItems(limit=6){
    const p=progress();
    return Object.entries(p.records).filter(([,r])=>(r.stars||0)<3).sort((a,b)=>(a[1].stars||0)-(b[1].stars||0)).slice(0,limit);
  }
  window.Academy={loadData,progress,record,award,gradeStatus,refreshUnlocks,today,dailyGoal,isUnlocked,reset,weakItems};
})();
