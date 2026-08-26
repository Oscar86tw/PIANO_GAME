
window.Practice={
  song:null,running:false,timer:null,pxPerBeat:92,activeEvents:[],

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
    arr.forEach(n=>(this.midiOf(n)<60?left:right).push(n));return {right,left};
  },
  makeNote(root,n,beat,hand,eventIndex,chordIndex=0,finger=''){
    const el=document.createElement('span');
    el.className='note '+hand;el.dataset.note=n;el.dataset.hand=hand;el.dataset.eventIndex=eventIndex;
    el.style.left=(220+beat*this.pxPerBeat+chordIndex*4)+'px';
    el.style.top=(hand==='left'?this.yBass(n):this.yTreble(n))+'px';
    root.appendChild(el);
    if(finger){
      const mark=document.createElement('span');mark.className='finger-mark';mark.textContent=finger;mark.dataset.eventIndex=eventIndex;
      mark.style.left=(220+beat*this.pxPerBeat+chordIndex*4-1)+'px';
      mark.style.top=((hand==='left'?this.yBass(n):this.yTreble(n))-21)+'px';root.appendChild(mark);
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

  render(root,opts={showFingering:true,startMeasure:1,endMeasure:null}){
    if(!this.song||!root)return;
    root.innerHTML='';let beat=0,eventIndex=0,rightIdx=0;
    const fingering=this.song.fingering||[];
    this.activeEvents=this.subsetEvents(this.song,opts.startMeasure,opts.endMeasure);

    for(const [note,dur] of this.activeEvents){
      if(note!=='REST'){
        const {right,left}=this.splitNotes(note);
        right.forEach((n,i)=>{
          const finger=opts.showFingering&&right.length===1?(fingering[rightIdx]||''):'';
          this.makeNote(root,n,beat,'right',eventIndex,i,finger);
        });
        left.forEach((n,i)=>this.makeNote(root,n,beat,'left',eventIndex,i,''));
        if(right.length===1)rightIdx++;
      }
      beat+=Number(dur)||1;eventIndex++;
    }
    root.style.transform='translate3d(0,0,0)';
    root.dataset.totalBeats=String(beat);
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
      const beat=Math.max(0,TransportMaster.currentBeat());
      root.style.transform=`translate3d(${-beat*this.pxPerBeat}px,0,0)`;
      if(beat>=Number(root.dataset.totalBeats||0)){
        this.stop();
        TransportMaster.pause();
        Events.emit('practice:done',{song:this.song});
        return;
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
