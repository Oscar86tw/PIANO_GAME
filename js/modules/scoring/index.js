(function(){
  let session=null;

  function buildExpected(timeline){
    return (timeline||[]).filter(row=>row.note!=='REST').map(row=>{
      const notes=Array.isArray(row.note)?row.note:[row.note];
      return {
        eventIndex:row.index,beat:row.startBeat,duration:row.duration,
        notes,midis:notes.map(n=>AudioEngine.noteToMidi(n)),
        matched:new Set(),attempts:0,bestTiming:null,exact:false
      };
    });
  }

  function start(song,bpm,opts={}){
    const timeline=opts.timeline||EventTimeline.build(opts.events||song.events||[]);
    session={
      song,bpm:Number(bpm)||80,timeline,
      expected:buildExpected(timeline),
      logs:[],autoMetroTriggered:false,
      transport:opts.transport||window.TransportMaster||null
    };
    Events.emit('scoring:started',{expected:session.expected.length,bpm:session.bpm});
    return session;
  }

  function nearestExpected(beat,midi){
    if(!session)return null;
    let best=null,bestScore=Infinity;
    for(const row of session.expected){
      const db=Math.abs(beat-row.beat);
      const pitchDistance=Math.min(...row.midis.map(m=>Math.abs(m-midi)));
      const penalty=row.matched.has(midi)?1.8:0;
      const score=db+pitchDistance*.12+penalty;
      if(db<=1.5&&score<bestScore){best=row;bestScore=score}
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
    const beat=session.transport?.currentBeat?session.transport.currentBeat():0;
    const bpm=session.transport?.bpm?session.transport.bpm():session.bpm;
    const row=nearestExpected(beat,input.midi);

    if(!row){
      const log={...input,beat,result:'extra',pitchCorrect:false,rhythmCorrect:false,timingMs:null,expected:[]};
      session.logs.push(log);Events.emit('scoring:result',log);return log;
    }

    const timingMs=Math.round((beat-row.beat)*60/bpm*1000);
    const pitchCorrect=row.midis.includes(input.midi);
    const rhythmCorrect=Math.abs(timingMs)<=180;
    row.attempts++;

    if(pitchCorrect){
      row.matched.add(input.midi);
      if(row.bestTiming==null||Math.abs(timingMs)<Math.abs(row.bestTiming))row.bestTiming=timingMs;
    }

    row.exact=row.matched.size===row.midis.length&&Math.abs(row.bestTiming??9999)<=180;
    const log={
      ...input,beat,
      result:pitchCorrect?(rhythmCorrect?'exact':'pitch-only'):'wrong-note',
      pitchCorrect,rhythmCorrect,timingMs,timingClass:timingClass(timingMs),
      expected:row.notes,eventIndex:row.eventIndex,
      chordComplete:row.matched.size===row.midis.length
    };
    session.logs.push(log);Events.emit('scoring:result',log);

    const recent=session.logs.filter(x=>x.timingMs!=null).slice(-5);
    if(!session.autoMetroTriggered&&recent.length>=4){
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
    const rows=session.expected,total=rows.length||1;
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

  function stop(){const s=summary();Events.emit('scoring:finished',s);return s}
  window.ScoringEngine={start,addInput,summary,stop,current:()=>session};
})();