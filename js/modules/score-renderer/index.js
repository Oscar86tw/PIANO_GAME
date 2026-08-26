
(function(){
  function handOf(note){return AudioEngine.noteToMidi(note)<60?'left':'right'}
  function durationClass(beats){
    const b=Number(beats)||1;if(b>=4)return 'whole';if(b>=2)return 'half';if(b>=1)return 'quarter';if(b>=.5)return 'eighth';return 'sixteenth';
  }
  function splitMeasures(song){
    const beatsPerMeasure=(song.timeSig?.[0]||4)*(4/(song.timeSig?.[1]||4));
    const out=[];let current=[],used=0,index=1;
    for(const ev of song.events||[]){
      const note=ev[0],dur=Number(ev[1])||1;
      if(used+dur>beatsPerMeasure+.001&&current.length){out.push({number:index++,events:current,beats:used});current=[];used=0}
      current.push([note,dur]);used+=dur;
      if(used>=beatsPerMeasure-.001){out.push({number:index++,events:current,beats:used});current=[];used=0}
    }
    if(current.length)out.push({number:index,events:current,beats:used});
    return out;
  }

  function makeStaffLines(container){
    StaffGeometry.lineYs('right').forEach(y=>{const l=document.createElement('i');l.className='engrave-line';l.style.top=y+'px';container.appendChild(l)});
    StaffGeometry.lineYs('left').forEach(y=>{const l=document.createElement('i');l.className='engrave-line';l.style.top=y+'px';container.appendChild(l)});
    const brace=document.createElement('div');brace.className='engrave-brace';brace.textContent='}';container.appendChild(brace);
    const tc=document.createElement('div');tc.className='engrave-clef treble';tc.textContent='𝄞';container.appendChild(tc);
    const bc=document.createElement('div');bc.className='engrave-clef bass';bc.textContent='𝄢';container.appendChild(bc);
  }

  function renderNote(root,note,x,hand,dur,eventIndex,finger=''){
    const p=StaffGeometry.parse(note);if(!p)return;
    const y=StaffGeometry.y(note,hand),el=document.createElement('span');
    el.className=`engrave-note ${hand} ${durationClass(dur)}`;el.dataset.eventIndex=eventIndex;el.dataset.note=note;el.style.left=x+'px';el.style.top=y+'px';root.appendChild(el);
    if(p.sharp){const acc=document.createElement('span');acc.className='engrave-accidental';acc.textContent='♯';acc.style.left=(x-12)+'px';acc.style.top=(y-7)+'px';root.appendChild(acc)}
    if(finger){const f=document.createElement('span');f.className='engrave-finger';f.textContent=finger;f.style.left=(x-1)+'px';f.style.top=(y-21)+'px';root.appendChild(f)}
    if(StaffGeometry.needsLedger(note,hand)){const led=document.createElement('span');led.className='engrave-ledger';led.style.left=(x-5)+'px';led.style.top=(y+StaffGeometry.noteHeadHeight/2)+'px';root.appendChild(led)}
  }

  function renderRest(root,x,hand,dur,eventIndex){
    const el=document.createElement('span');el.className=`engrave-rest ${hand} ${durationClass(dur)}`;el.dataset.eventIndex=eventIndex;el.textContent=Number(dur)>=2?'𝄻':'𝄽';el.style.left=x+'px';el.style.top=(hand==='left'?StaffGeometry.bassTop+10:StaffGeometry.trebleTop+10)+'px';root.appendChild(el);
  }

  function renderMeasure(measure,opts={}){
    const box=document.createElement('div');box.className='engrave-measure';box.dataset.measure=measure.number;makeStaffLines(box);
    const no=document.createElement('span');no.className='measure-number';no.textContent=measure.number;box.appendChild(no);
    let beat=0,eventIndex=opts.startEventIndex||0,rightFinger=opts.startFingerIndex||0;
    for(const [note,dur] of measure.events){
      const x=58+beat*(opts.pxPerBeat||48);
      if(note==='REST')renderRest(box,x,'right',dur,eventIndex);
      else{
        const arr=Array.isArray(note)?note:[note];
        arr.forEach((n,i)=>{const hand=handOf(n),finger=(opts.fingering&&hand==='right'&&arr.length===1)?(opts.fingering[rightFinger]||''):'';renderNote(box,n,x+i*4,hand,dur,eventIndex,finger)});
        if(arr.filter(n=>handOf(n)==='right').length===1)rightFinger++;
      }
      beat+=Number(dur)||1;eventIndex++;
    }
    const bar=document.createElement('div');bar.className='engrave-barline';box.appendChild(bar);
    return {element:box,eventIndex,rightFinger};
  }

  function renderScore(root,song,opts={}){
    root.innerHTML='';const measures=splitMeasures(song);let eventIndex=0,rightFinger=0;
    const start=Number(opts.startMeasure)||1,end=Number(opts.endMeasure)||measures.length,shown=measures.filter(m=>m.number>=start&&m.number<=end);
    shown.forEach(m=>{const r=renderMeasure(m,{...opts,startEventIndex:eventIndex,startFingerIndex:rightFinger,fingering:song.fingering||[]});root.appendChild(r.element);eventIndex=r.eventIndex;rightFinger=r.rightFinger});
    return {measures,totalMeasures:measures.length,shownMeasures:shown.length};
  }

  window.ScoreRenderer={parse:StaffGeometry.parse,handOf,splitMeasures,renderScore};
})();
