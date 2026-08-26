
(function(){
  let session=null;

  function expectedTimeline(song,bpm){
    const rows=[],beatSec=60/bpm;
    let beat=0,eventIndex=0;
    for(const [note,dur] of (song.events||[])){
      if(note!=='REST'){
        const notes=Array.isArray(note)?note:[note];
        rows.push({
          eventIndex,
          beat,
          time:beat*beatSec,
          duration:Number(dur)||1,
          notes,
          midis:notes.map(n=>AudioEngine.noteToMidi(n)),
          matched:new Set(),
          attempts:0,
          bestTiming:null,
          exact:false
        });
      }
      beat+=Number(dur)||1;
      eventIndex++;
    }
    return rows;
  }

  function start(song,bpm){
    session={
      song,bpm,startAt:performance.now(),
      expected:expectedTimeline(song,bpm),
      logs:[],autoMetroTriggered:false
    };
    Events.emit('scoring:started',{expected:session.expected.length,bpm});
    return session;
  }

  function nearestExpected(elapsedSec,midi){
    if(!session)return null;
    let best=null,bestScore=Infinity;
    for(const row of session.expected){
      const dt=Math.abs(elapsedSec-row.time);
      const pitchDistance=Math.min(...row.midis.map(m=>Math.abs(m-midi)));
      const already=row.matched.has(midi);
      const penalty=already?1.8:0;
      const score=dt + pitchDistance*.16 + penalty;
      if(dt<=1.0 && score<bestScore){best=row;bestScore=score}
    }
    return best;
  }

  function timingClass(ms){
    const a=Math.abs(ms);
    if(a<=120)return '準';
    return ms<0?'早':'晚';
  }

  function addInput(input){
    if(!session)return null;
    const elapsed=(input.at-session.startAt)/1000;
    const row=nearestExpected(elapsed,input.midi);
    if(!row){
      const log={...input,elapsed,result:'extra',pitchCorrect:false,rhythmCorrect:false,timingMs:null,expected:[]};
      session.logs.push(log);Events.emit('scoring:result',log);return log;
    }

    const timingMs=Math.round((elapsed-row.time)*1000);
    const pitchCorrect=row.midis.includes(input.midi);
    const rhythmCorrect=Math.abs(timingMs)<=180;
    row.attempts++;

    if(pitchCorrect){
      row.matched.add(input.midi);
      if(row.bestTiming==null||Math.abs(timingMs)<Math.abs(row.bestTiming))row.bestTiming=timingMs;
    }
    row.exact=row.matched.size===row.midis.length && Math.abs(row.bestTiming??9999)<=180;

    const log={
      ...input,elapsed,
      result:pitchCorrect?(rhythmCorrect?'exact':'pitch-only'):'wrong-note',
      pitchCorrect,rhythmCorrect,timingMs,
      timingClass:timingClass(timingMs),
      expected:row.notes,
      eventIndex:row.eventIndex,
      chordComplete:row.matched.size===row.midis.length
    };
    session.logs.push(log);
    Events.emit('scoring:result',log);

    const recent=session.logs.filter(x=>x.timingMs!=null).slice(-5);
    if(!session.autoMetroTriggered && recent.length>=4){
      const bad=recent.filter(x=>Math.abs(x.timingMs)>220).length;
      const avg=recent.reduce((s,x)=>s+Math.abs(x.timingMs),0)/recent.length;
      if(bad>=3||avg>260){
        session.autoMetroTriggered=true;
        Events.emit('scoring:auto-metronome',{reason:'timing',avgMs:Math.round(avg),bad});
      }
    }
    return log;
  }

  function summary(){
    if(!session)return {total:0,pitch:0,rhythm:0,exact:0,stars:1};
    const rows=session.expected, total=rows.length||1;
    const pitchRows=rows.filter(r=>r.matched.size===r.midis.length).length;
    const rhythmRows=rows.filter(r=>r.bestTiming!=null&&Math.abs(r.bestTiming)<=180).length;
    const exactRows=rows.filter(r=>r.exact).length;
    const completion=rows.filter(r=>r.matched.size>0).length/total*100;
    const pitch=Math.round(pitchRows/total*100);
    const rhythm=Math.round(rhythmRows/total*100);
    const exact=Math.round(exactRows/total*100);
    const timing=rows.filter(r=>r.bestTiming!=null).map(r=>Math.abs(r.bestTiming));
    const avgTiming=timing.length?Math.round(timing.reduce((a,b)=>a+b,0)/timing.length):null;
    const score=Math.round(pitch*.42+rhythm*.33+completion*.25);
    const stars=score>=95?5:score>=88?4:score>=78?3:score>=65?2:1;
    return {total,pitch,rhythm,exact,completion:Math.round(completion),avgTiming,score,stars,logs:session.logs.length};
  }

  function stop(){
    const s=summary();
    Events.emit('scoring:finished',s);
    return s;
  }

  window.ScoringEngine={start,addInput,summary,stop,current:()=>session};
})();
