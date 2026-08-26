
const x=Store.get('last-practice-v4');if(x){pitch.textContent=x.stats.pitch+'%';rhythm.textContent=x.stats.rhythm+'%';exact.textContent='84%';today.textContent='5 分';const ai=AICoach.build(x.stats);summary.textContent=ai.summary;steps.innerHTML='';ai.steps.forEach((s,i)=>steps.insertAdjacentHTML('beforeend',`<div class="status">${i+1}. ${s}</div>`))}

(async()=>{
  try{
    const curriculum=await fetch('../data/curriculum.json').then(r=>r.json());
    const p=Progression.refreshUnlocks(curriculum);
    const highest=[...p.unlockedGrades].sort((a,b)=>a-b)[0]||10;
    const el=document.getElementById('courseProgressText');
    if(el)el.textContent=`目前已解鎖到 ${highest}級｜總星星 ${p.totalStars||0} ★｜今日 ${Progression.todayMinutes()} 分鐘`;
  }catch(e){}
})();

(function(){
  const root=document.getElementById('reviewQueue');if(!root)return;
  function renderReviews(){
    const rows=LessonSession.reviewQueue();root.innerHTML='';
    if(!rows.length){root.innerHTML='<div class="empty">目前沒有需要補強的課。</div>';return}
    rows.forEach(x=>{
      const d=document.createElement('div');d.className='status warn';
      d.innerHTML=`<strong>${x.lessonId}</strong>｜${x.reason}｜${x.stars}★ / ${x.score}分`;
      root.appendChild(d);
    });
  }
  Events.on('review:changed',renderReviews);renderReviews();
})();
