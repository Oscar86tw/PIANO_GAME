
(function(){
  const DEG={C:0,D:1,E:2,F:3,G:4,A:5,B:6};

  const G={
    lineGap:12,
    step:6,
    trebleTop:54,
    bassTop:150,
    lineCount:5,
    noteHeadHeight:10,
    practiceHeight:246,
    scoreMeasureHeight:246
  };

  G.trebleBottom=G.trebleTop+(G.lineCount-1)*G.lineGap; // E4 bottom line = 102
  G.bassBottom=G.bassTop+(G.lineCount-1)*G.lineGap;     // G2 bottom line = 198
  G.staffGap=G.bassTop-G.trebleBottom;

  function parse(note){
    const m=String(note).match(/^([A-G])(#?)(-?\d)$/);
    if(!m)return null;
    return {letter:m[1],sharp:!!m[2],octave:Number(m[3])};
  }
  function diatonic(note){
    const p=parse(note);if(!p)return 0;
    return p.octave*7+DEG[p.letter];
  }
  function y(note,hand){
    const d=diatonic(note);
    if(hand==='left'){
      const base=2*7+DEG.G; // bass bottom line G2
      return G.bassBottom-(d-base)*G.step-G.noteHeadHeight/2;
    }
    const base=4*7+DEG.E; // treble bottom line E4
    return G.trebleBottom-(d-base)*G.step-G.noteHeadHeight/2;
  }
  function lineYs(hand){
    const top=hand==='left'?G.bassTop:G.trebleTop;
    return Array.from({length:G.lineCount},(_,i)=>top+i*G.lineGap);
  }
  function needsLedger(note,hand){
    const yy=y(note,hand)+G.noteHeadHeight/2;
    const lines=lineYs(hand);
    return yy<lines[0]-G.step || yy>lines[lines.length-1]+G.step;
  }

  window.StaffGeometry={...G,parse,diatonic,y,lineYs,needsLedger};
})();
