window.Practice={
  song:null,running:false,timer:null,pxPerBeat:92,activeEvents:[],timeline:[],

  async loadSong(id){
    this.song=await Library.get(id);
    return this.song;
  },
  midiOf(note){return AudioEngine.noteToMidi(note)},
  yTreble(note){return StaffGeometry.y(note,'right')},
  yBass(note){return StaffGeometry.y(note,'left')},

  splitNotes(note){
    if(note==='REST')return {right:[],left:[]};
    const arr=Array.isArray(note)?note:[note],left=[],right=[];
    arr.forEach(n=>(this.midiOf(n)<60?left:right).push(n));
    return {right,left};
  },

  makeNote(root,n,startBeat,hand,eventIndex,chordIndex=0,finger=''){
    const el=document.createElement('span');
    el.className='note '+hand;
    el.dataset.note=n;el.dataset.hand=hand;el.dataset.eventIndex=eventIndex;el.dataset.startBeat=String(startBeat);
    el.style.left=`calc(22% - 8.5px + ${startBeat*this.pxPerBeat+chordIndex*4}px)`;
    el.style.top=(hand==='left'?this.yBass(n):this.yTreble(n))+'px';
    root.appendChild(el);

    if(finger){
      const mark=document.createElement('span');
      mark.className='finger-mark';mark.textContent=finger;mark.dataset.eventIndex=eventIndex;
      mark.style.left=`calc(22% - 1px + ${startBeat*this.pxPerBeat+chordIndex*4}px)`;
      mark.style.top=((hand==='left'?this.yBass(n):this.yTreble(n))-21)+'px';
      root.appendChild(mark);
    }
  },

  subsetEvents(song,startMeasure=1,endMeasure=null){
    if((!startMeasure||startMeasure<=1)&&!endMeasure)return song.events||[];
    const measures=window.ScoreRenderer?.splitMeasures?ScoreRenderer.splitMeasures(song):[];
    if(!measures.length)return song.events||[];
    const end=endMeasure||measures.length;
    return measures.filter(m=>m.number>=startMeasure&&m.number<=end).flatMap(m=>m.events);
  },

  getActiveEvents(){return this.activeEvents},
  getTimeline(){return this.timeline},

  render(root,opts={showFingering:true,startMeasure:1,endMeasure:null}){
    if(!this.song||!root)return;
    root.innerHTML='';let rightIdx=0;
    const fingering=this.song.fingering||[];
    this.activeEvents=this.subsetEvents(this.song,opts.startMeasure,opts.endMeasure);
    this.timeline=EventTimeline.build(this.activeEvents);

    for(const row of this.timeline){
      const note=row.note;
      if(note!=='REST'){
        const {right,left}=this.splitNotes(note);
        right.forEach((n,i)=>{
          const finger=opts.showFingering&&right.length===1?(fingering[rightIdx]||''):'';
          this.makeNote(root,n,row.startBeat,'right',row.index,i,finger);
        });
        left.forEach((n,i)=>this.makeNote(root,n,row.startBeat,'left',row.index,i,''));
        if(right.length===1)rightIdx++;
      }
    }

    root.style.transform='translate3d(0,0,0)';
    root.dataset.totalBeats=String(this.timeline.reduce((m,x)=>Math.max(m,x.endBeat),0));
    root.dataset.noteCount=String(root.querySelectorAll('.note').length);
  },

  markResult(root,eventIndex,playedNote,result){
    [...root.querySelectorAll(`.note[data-event-index="${eventIndex}"]`)].forEach(n=>{
      if(n.dataset.note===playedNote){
        n.classList.remove('judge-correct','judge-wrong');
        n.classList.add(result==='exact'||result==='pitch-only'?'judge-correct':'judge-wrong');
      }
    });
  },

  start(root){
    if(this.running)return;
    this.running=true;
    const loop=()=>{
      if(!this.running)return;
      const beat=TransportMaster.currentBeat();
      root.style.transform=`translate3d(${-beat*this.pxPerBeat}px,0,0)`;
      if(beat>=Number(root.dataset.totalBeats||0)){
        this.stop();TransportMaster.pause();Events.emit('practice:done',{song:this.song});return;
      }
      this.timer=requestAnimationFrame(loop);
    };
    this.timer=requestAnimationFrame(loop);
  },

  stop(){this.running=false;if(this.timer)cancelAnimationFrame(this.timer);this.timer=null},

  reset(root){
    this.stop();
    if(root){
      root.style.transform='translate3d(0,0,0)';
      root.querySelectorAll('.judge-correct,.judge-wrong').forEach(n=>n.classList.remove('judge-correct','judge-wrong'));
    }
  }
};