
(async()=>{
 const bank=await RhythmEngine.bank();let pattern=null,startAt=0,taps=[],expected=[];
 function loadPatterns(){rhythmPattern.innerHTML='';(bank[rhythmGrade.value]||[]).forEach((x,i)=>rhythmPattern.insertAdjacentHTML('beforeend',`<option value="${i}">${x.skill}｜${x.bpm} BPM</option>`));show()}
 function show(){pattern=(bank[rhythmGrade.value]||[])[Number(rhythmPattern.value)||0];if(!pattern)return;rhythmStrip.innerHTML=pattern.durations.map(d=>`<div class="rhythm-cell">${d} 拍</div>`).join('');rhythmResult.textContent=`拍號 ${pattern.timeSig.join('/')}｜${pattern.bpm} BPM`}
 hearRhythm.onclick=()=>RhythmEngine.play(pattern);
 startTap.onclick=()=>{taps=[];expected=[];let t=0;pattern.durations.forEach(d=>{expected.push(t);t+=d*60/pattern.bpm});startAt=performance.now()/1000;rhythmResult.textContent='開始！跟著心裡的 pulse 點擊。'};
 tapPad.onclick=()=>{if(!startAt)return;const t=performance.now()/1000-startAt;taps.push(t);if(taps.length>=expected.length){const rows=expected.map((e,i)=>RhythmEngine.judgeTap(e,taps[i]??999)),good=rows.filter(x=>x.ok).length,pct=Math.round(good/rows.length*100),stars=pct>=95?5:pct>=85?4:pct>=75?3:pct>=60?2:1,g=Number(rhythmGrade.value);rhythmResult.textContent=`${good}/${rows.length} 拍準確｜${pct}%｜${stars}★`;rhythmResult.className='status '+(stars>=3?'ok':'warn');Academy.award(`g${g}_rhythm`,stars,pct,3,{timing:rows});startAt=0}};
 rhythmGrade.onchange=loadPatterns;rhythmPattern.onchange=show;loadPatterns();
})();
