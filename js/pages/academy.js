
(async()=>{
  const data=await Academy.loadData();Academy.refreshUnlocks(data);const p=Academy.progress();
  const open=[...p.unlocked].sort((a,b)=>a-b);aGrade.textContent=(open[0]||10)+'級';aStars.textContent=(p.totalStars||0)+'★';aToday.textContent=Academy.today()+'分';
  const root=document.getElementById('academyPath');
  data.grades.forEach(g=>{
    const st=Academy.gradeStatus(g.grade,data),open=Academy.isUnlocked(g.grade),pct=Math.min(100,Math.round(st.total/st.threshold*100)),d=document.createElement('div');
    d.className='grade-card '+(open?'':'locked');
    d.innerHTML=`<div style="display:flex;justify-content:space-between;gap:8px"><div><h2>${g.title}｜${g.stage}</h2><small>${g.goal}</small></div><span class="tag">${open?'已解鎖':'🔒'}</span></div>
    <div class="goalbar"><div style="width:${pct}%"></div></div><small>核心星星 ${st.total} / ${st.threshold}</small>
    <div class="domain-grid">${g.lessons.filter(x=>x.core).map(l=>{const r=Academy.record(l.id);return `<div class="domain"><strong>${l.icon} ${l.title}</strong><small>${l.target}</small><div class="stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>${open?`<a class="btn" href="${l.domain==='theory'?'theory.html':l.domain==='rhythm'?'rhythm.html':l.domain==='repertoire'?`practice.html?song=cartoon_easy&academy=${l.id}&grade=${g.grade}`:`lesson.html?grade=${g.grade}&lesson=${l.id}&type=${l.domain}`}">開始</a>`:''}</div>`}).join('')}</div>`;
    root.appendChild(d);
  });
})();
