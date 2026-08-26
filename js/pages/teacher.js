
(async()=>{
 const a=await Academy.loadData();Academy.refreshUnlocks(a);const p=Academy.progress(),open=[...p.unlocked].sort((x,y)=>x-y),grade=open[0]||10;tStars.textContent=p.totalStars||0;tToday.textContent=Academy.today();tGrade.textContent=grade+'級';
 const level=a.grades.find(x=>x.grade===grade);teacherDomains.innerHTML=level.lessons.filter(x=>x.core).map(l=>{const r=Academy.record(l.id);return `<div class="status ${r.stars>=3?'ok':'warn'}"><strong>${l.icon} ${l.title}</strong>｜${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}｜最佳 ${r.bestScore||0} 分｜${r.attempts||0} 次</div>`}).join('');
 const weak=Academy.weakItems();teacherWeak.innerHTML=weak.length?weak.map(([id,r])=>`<div class="status warn">${id}｜${r.stars}★｜需要補強</div>`).join(''):'<div class="empty">目前沒有低於 3★ 的已練項目。</div>';
})();
