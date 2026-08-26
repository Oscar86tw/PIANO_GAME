
window.Practice={
  song:null,position:0,running:false,timer:null,pxPerBeat:92,

  async loadSong(id){
    this.song=await Library.get(id);
    this.position=0;
    return this.song;
  },

  midiOf(note){return AudioEngine.noteToMidi(note)},

  yTreble(note){
    const m=String(note).match(/^([A-G])#?(-?\d)$/);if(!m)return 118;
    const deg={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
    const step=Number(m[2])*7+deg[m[1]],base=4*7+deg.E;
    return Math.max(24,Math.min(155,140-(step-base)*7));
  },

  yBass(note){
    const m=String(note).match(/^([A-G])#?(-?\d)$/);if(!m)return 220;
    const deg={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
    const step=Number(m[2])*7+deg[m[1]],base=2*7+deg.G;
    return Math.max(165,Math.min(292,244-(step-base)*7));
  },

  splitNotes(note){
    if(note==='REST')return {right:[],left:[]};
    const arr=Array.isArray(note)?note:[note];
    const left=[],right=[];
    arr.forEach(n=>(this.midiOf(n)<60?left:right).push(n));
    return {right,left};
  },

  makeNote(root,n,beat,hand,eventIndex,chordIndex=0,finger=''){
    const el=document.createElement('span');
    el.className='note '+hand;
    el.dataset.note=n;
    el.dataset.hand=hand;
    el.dataset.eventIndex=eventIndex;
    el.style.left=(220+beat*this.pxPerBeat+chordIndex*4)+'px';
    el.style.top=(hand==='left'?this.yBass(n):this.yTreble(n))+'px';
    root.appendChild(el);

    if(finger){
      const mark=document.createElement('span');
      mark.className='finger-mark';
      mark.textContent=finger;
      mark.dataset.eventIndex=eventIndex;
      mark.style.left=(220+beat*this.pxPerBeat+chordIndex*4-1)+'px';
      mark.style.top=((hand==='left'?this.yBass(n):this.yTreble(n))-24)+'px';
      root.appendChild(mark);
    }
  },

  subsetEvents(song,startMeasure=1,endMeasure=null){
    if(!startMeasure||startMeasure<=1&&!endMeasure)return song.events;
    const measures=ScoreRenderer?.splitMeasures?ScoreRenderer.splitMeasures(song):[];
    if(!measures.length)return song.events;
    const end=endMeasure||measures.length;
    return measures.filter(m=>m.number>=startMeasure&&m.number<=end).flatMap(m=>m.events);
  },

  render(root,opts={showFingering:true,startMeasure:1,endMeasure:null}){
    if(!this.song||!root)return;
    root.innerHTML='';
    let beat=0,eventIndex=0,rightIdx=0;
    const fingering=this.song.fingering||[];

    const sourceEvents=this.subsetEvents(this.song,opts.startMeasure,opts.endMeasure);
    for(const [note,dur] of sourceEvents){
      if(note!=='REST'){
        const {right,left}=this.splitNotes(note);
        right.forEach((n,i)=>{
          const finger=opts.showFingering&&right.length===1?(fingering[rightIdx]||''):'';
          this.makeNote(root,n,beat,'right',eventIndex,i,finger);
        });
        left.forEach((n,i)=>this.makeNote(root,n,beat,'left',eventIndex,i,''));
        if(right.length===1)rightIdx++;
      }
      beat+=Number(dur)||1;
      eventIndex++;
    }
    root.style.transform='translate3d(0,0,0)';
    root.dataset.totalBeats=String(beat);
    root.dataset.noteCount=String(root.querySelectorAll('.note').length);
  },

  markResult(root,eventIndex,playedNote,result){
    const notes=[...root.querySelectorAll(`.note[data-event-index="${eventIndex}"]`)];
    notes.forEach(n=>{
      if(n.dataset.note===playedNote){
        n.classList.remove('judge-correct','judge-wrong');
        n.classList.add(result==='exact'||result==='pitch-only'?'judge-correct':'judge-wrong');
      }
    });
  },

  start(root,bpm){
    if(this.running)return;
    this.running=true;
    const started=performance.now()-this.position*1000;
    const loop=now=>{
      if(!this.running)return;
      this.position=(now-started)/1000;
      const beatSec=60/bpm;
      const x=-(this.position/beatSec)*this.pxPerBeat;
      root.style.transform=`translate3d(${x}px,0,0)`;
      if(this.position>=Number(root.dataset.totalBeats)*beatSec){
        this.stop();
        Events.emit('practice:done',{song:this.song});
        return;
      }
      this.timer=requestAnimationFrame(loop);
    };
    this.timer=requestAnimationFrame(loop);
  },

  stop(){
    this.running=false;
    if(this.timer)cancelAnimationFrame(this.timer);
  },

  reset(root){
    this.stop();this.position=0;
    if(root){
      root.style.transform='translate3d(0,0,0)';
      root.querySelectorAll('.judge-correct,.judge-wrong').forEach(n=>n.classList.remove('judge-correct','judge-wrong'));
    }
  }
};
