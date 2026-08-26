window.EventTimeline={
  build(events){
    let beat=0;
    return (events||[]).map((ev,index)=>{
      const duration=Math.max(.03125,Number(ev?.[1])||1);
      const row={index,startBeat:beat,duration,endBeat:beat+duration,note:ev?.[0]??'REST'};
      beat+=duration;
      return row;
    });
  },
  totalBeats(events){
    return this.build(events).reduce((m,x)=>Math.max(m,x.endBeat),0);
  }
};