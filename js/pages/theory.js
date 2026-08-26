
(async()=>{
  const bank=await TheoryEngine.bank();let current=[],answers={};
  function start(){
    const g=theoryGrade.value;current=[...(bank[g]||[])];answers={};theoryQuiz.innerHTML='';
    current.forEach((q,idx)=>{
      const d=document.createElement('div');d.className='question-card';d.innerHTML=`<strong>${idx+1}. ${q.prompt}</strong><p>${q.topic}</p>`;
      q.options.forEach((o,i)=>{const b=document.createElement('button');b.className='btn quiz-option';b.textContent=`${o}. 選項 ${i+1}`;b.onclick=()=>{answers[q.id]=i;d.querySelectorAll('button').forEach((x,j)=>{x.classList.remove('correct','wrong');if(j===q.answer)x.classList.add('correct');else if(j===i)x.classList.add('wrong')});finishIfDone()};d.appendChild(b)});
      theoryQuiz.appendChild(d);
    });theoryResult.textContent=`${g}級｜共 ${current.length} 題`;
  }
  function finishIfDone(){
    if(Object.keys(answers).length<current.length)return;
    const correct=current.filter(q=>answers[q.id]===q.answer).length,pct=Math.round(correct/current.length*100),stars=TheoryEngine.stars(pct),g=Number(theoryGrade.value);
    theoryResult.textContent=`${correct}/${current.length}｜${pct}%｜${stars}★`;theoryResult.className='status '+(stars>=3?'ok':'warn');
    Academy.award(`g${g}_theory`,stars,pct,3,{correct,total:current.length});
  }
  newTheory.onclick=start;start();
})();
