
window.Practice={
  song:null,running:false,timer:null,pxPerBeat:116,activeEvents:[],timeline:[],

  async loadSong(id){this.song=await Library.get(id);return this.song},
  midiOf(note){return AudioEngine.noteToMidi(note)},

  // Practice-only large staff geometry. Score detail renderer keeps its compact geometry.
  practiceY(note,hand){
    const d=StaffGeometry.diatonic(note);
    const step=10;
    if(hand==='left'){
      const base=2*7+4; // G2 bottom line
      const bassBottom=342+80;
      return bassBottom-(d-base)*step-7.5;
    }
    const base=4*7+2; // E4 bottom line
    const trebleBottom=96+80;
    return trebleBottom-(d-base)*step-7.5;
  },
  yTreble(note){return this.practiceY(note,'right')},
  yBass(note){return this.practiceY(note,'left')},

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
    el.style.left=`calc(22% - 12px + ${startBeat*this.pxPerBeat+chordIndex*5}px)`;
    el.style.top=(hand==='left'?this.yBass(n):this.yTreble(n))+'px';
    root.appendChild(el);
    if(finger){
      const mark=document.createElement('span');
      mark.className='finger-mark';mark.textContent=finger;mark.dataset.eventIndex=eventIndex;
      mark.style.left=`calc(22% - 2px + ${startBeat*this.pxPerBeat+chordIndex*5}px)`;
      mark.style.top=((hand==='left'?this.yBass(n):this.yTreble(n))-29)+'px';
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
      if(row.note==='REST')continue;
      const {right,left}=this.splitNotes(row.note);
      right.forEach((n,i)=>{
        const finger=opts.showFingering&&right.length===1?(fingering[rightIdx]||''):'';
        this.makeNote(root,n,row.startBeat,'right',row.index,i,finger);
      });
      left.forEach((n,i)=>this.makeNote(root,n,row.startBeat,'left',row.index,i,''));
      if(right.length===1)rightIdx++;
    }
    root.style.transform='translate3d(0,0,0)';
    root.dataset.totalBeats=String(this.timeline.reduce((m,x)=>Math.max(m,x.endBeat),0));
    root.dataset.noteCount=String(root.querySelectorAll('.note').length);
    this.updateBeatGradient(root,TransportMaster?.currentBeat?.()||0);
  },

  mixColor(a,b,t){
    const c1=a.match(/\w\w/g).map(x=>parseInt(x,16)),c2=b.match(/\w\w/g).map(x=>parseInt(x,16));
    const v=c1.map((x,i)=>Math.round(x+(c2[i]-x)*t));
    return `rgb(${v[0]},${v[1]},${v[2]})`;
  },
  updateBeatGradient(root,currentBeat){
    root.querySelectorAll('.note[data-start-beat]').forEach(el=>{
      if(el.classList.contains('judge-correct')||el.classList.contains('judge-wrong'))return;
      const start=Number(el.dataset.startBeat||0),delta=start-currentBeat;
      let p=0;
      if(delta>=0&&delta<=2.4){
        const x=1-delta/2.4;
        p=x*x*(3-2*x); // smoothstep: no flashing / no pulsing
      }else if(delta<0&&delta>-0.18){
        p=Math.max(0,1+delta/.18);
      }
      const base=el.dataset.hand==='left'?'6658c9':'3f485d';
      const mid=el.dataset.hand==='left'?'8278e6':'6577a5';
      const hit='26c8df';
      const color=p<.55?this.mixColor(base,mid,p/.55):this.mixColor(mid,hit,(p-.55)/.45);
      el.style.backgroundColor=color;
      el.style.boxShadow=p>.15?`0 0 ${Math.round(5+16*p)}px rgba(49,194,220,${(0.05+0.26*p).toFixed(3)})`:'none';
    });
  },

  markResult(root,eventIndex,playedNote,result){
    [...root.querySelectorAll(`.note[data-event-index="${eventIndex}"]`)].forEach(n=>{
      if(n.dataset.note===playedNote){
        n.classList.remove('judge-correct','judge-wrong');
        n.classList.add(result==='exact'||result==='pitch-only'?'judge-correct':'judge-wrong');
        n.style.backgroundColor='';n.style.boxShadow='';
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
      this.updateBeatGradient(root,beat);
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
      root.querySelectorAll('.note').forEach(n=>{n.style.backgroundColor='';n.style.boxShadow=''});
      this.updateBeatGradient(root,0);
    }
  }
};
