
(async()=>{
 const academy=await Academy.loadData();let exam=null,scores={};
 function render(){examSections.innerHTML='';exam.sections.forEach(s=>{const d=document.createElement('div');d.className='exam-section '+(scores[s.id]!=null?'done':'');d.innerHTML=`<strong>${s.title}</strong><small>權重 ${s.weight}%</small><div><button class="btn" style="margin-top:7px">${scores[s.id]!=null?'已完成 '+scores[s.id]+'分':'進行此項'}</button></div>`;d.querySelector('button').onclick=()=>{if(scores[s.id]!=null)return;const score=Math.floor(Math.random()*31)+70;scores[s.id]=score;render();finish()};examSections.appendChild(d)})}
 function finish(){if(Object.keys(scores).length<exam.sections.length)return;const r=ExamEngine.final(scores);examFinal.textContent=`總分 ${r.score}｜${r.result}｜${r.stars}★`;examFinal.className='status '+(r.stars>=3?'ok':'warn')}
 buildExam.onclick=()=>{exam=ExamEngine.build(Number(examGrade.value),academy);scores={};render();examFinal.textContent='測驗已建立，請依序完成所有項目。'};buildExam.click();
})();
