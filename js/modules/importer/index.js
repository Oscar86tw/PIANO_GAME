
(function(){
  const IMPORT_KEY='imported-scores-v41';
  const PHOTO_LIBRARY_KEY='photo-library-v61';

  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function normalize(song){
    song.bpm=clamp(Math.round(Number(song.bpm)||90),30,240);
    song.timeSig=Array.isArray(song.timeSig)&&song.timeSig.length===2?song.timeSig:[4,4];
    song.key=song.key||'Imported';
    song.level=song.level||'Imported';
    song.category=song.category||'我的匯入';
    song.imported=true;
    song.events=(song.events||[])
      .filter(e=>Array.isArray(e)&&e.length>=2&&Number(e[1])>0)
      .map(e=>{
        const note=Array.isArray(e[0])?[...new Set(e[0])]:e[0];
        return [note,+Number(e[1]).toFixed(3)];
      });
    song.totalBeats=song.events.reduce((s,e)=>s+Number(e[1]),0);
    song.duration=Math.round(song.totalBeats*60/song.bpm);
    return song;
  }

  function uniqueId(name,pool){
    const rows=pool||[];
    const ids=new Set(rows.map(x=>x.id));
    let base=String(name||'score')
      .toLowerCase().replace(/\.[^.]+$/,'')
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g,'_')
      .replace(/^_+|_+$/g,'').slice(0,36);
    if(!base)base='score';
    let id=base,n=2;
    while(ids.has(id))id=base+'_'+n++;
    return id;
  }

  function keyNameFromFifths(f){
    const major={'-7':'Cb Major','-6':'Gb Major','-5':'Db Major','-4':'Ab Major','-3':'Eb Major','-2':'Bb Major','-1':'F Major','0':'C Major','1':'G Major','2':'D Major','3':'A Major','4':'E Major','5':'B Major','6':'F# Major','7':'C# Major'};
    return major[String(f)]||'Imported';
  }

  function pitchFromXML(note){
    const pitch=note.querySelector('pitch');if(!pitch)return null;
    const step=pitch.querySelector('step')?.textContent?.trim();
    const octave=pitch.querySelector('octave')?.textContent?.trim();
    const alter=Number(pitch.querySelector('alter')?.textContent||0);
    if(!step||octave==null)return null;
    if(alter===1)return step+'#'+octave;
    if(alter===-1){const flat={Db:'C#',Eb:'D#',Gb:'F#',Ab:'G#',Bb:'A#'};return (flat[step+'b']||step)+octave}
    return step+octave;
  }

  function parseMusicXML(text,fileName='score.musicxml'){
    const xml=new DOMParser().parseFromString(text,'application/xml');
    if(xml.querySelector('parsererror'))throw new Error('MusicXML 格式無法解析');
    const part=xml.querySelector('part');
    if(!part)throw new Error('MusicXML 找不到樂譜 Part');
    const title=xml.querySelector('work-title')?.textContent?.trim()||xml.querySelector('movement-title')?.textContent?.trim()||fileName.replace(/\.[^.]+$/,'');
    let divisions=1,bpm=90,timeSig=[4,4],key='C Major',primaryVoice=null; let ignoredVoices=0,ignoredChords=0; const events=[];
    const soundTempo=xml.querySelector('sound[tempo]')?.getAttribute('tempo'); const perMinute=xml.querySelector('per-minute')?.textContent; if(soundTempo||perMinute)bpm=Number(soundTempo||perMinute)||90;
    part.querySelectorAll('measure').forEach(measure=>{
      const div=measure.querySelector(':scope > attributes > divisions'); if(div)divisions=Number(div.textContent)||divisions;
      const beats=measure.querySelector(':scope > attributes > time > beats'); const beatType=measure.querySelector(':scope > attributes > time > beat-type'); if(beats&&beatType)timeSig=[Number(beats.textContent)||4,Number(beatType.textContent)||4];
      const fifths=measure.querySelector(':scope > attributes > key > fifths'); if(fifths)key=keyNameFromFifths(Number(fifths.textContent));
      measure.querySelectorAll(':scope > note').forEach(note=>{
        const voice=note.querySelector('voice')?.textContent?.trim()||'1'; if(primaryVoice===null)primaryVoice=voice; if(voice!==primaryVoice){ignoredVoices++;return}
        if(note.querySelector('chord')){ignoredChords++;return}
        const duration=Number(note.querySelector('duration')?.textContent||0); if(duration<=0)return;
        const beatsValue=duration/divisions;
        if(note.querySelector('rest'))events.push(['REST',beatsValue]); else {const pitch=pitchFromXML(note); if(pitch)events.push([pitch,beatsValue])}
      });
    });
    if(!events.length)throw new Error('這份 MusicXML 沒有找到可用的主要聲部音符');
    return normalize({title,bpm,timeSig,key,events,sourceType:'MusicXML',importWarnings:{ignoredVoices,ignoredChords}});
  }

  function readVarLen(view,posObj){let value=0,b; do{if(posObj.pos>=view.byteLength)throw new Error('MIDI 檔案不完整'); b=view.getUint8(posObj.pos++); value=(value<<7)|(b&0x7f)}while(b&0x80); return value}
  function midiName(m){const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']; return names[m%12]+(Math.floor(m/12)-1)}

  function parseMIDI(buffer,fileName='score.mid'){
    const view=new DataView(buffer),dec=new TextDecoder(); let pos=0; const str=n=>{let s='';for(let i=0;i<n;i++)s+=String.fromCharCode(view.getUint8(pos++));return s};
    if(str(4)!=='MThd')throw new Error('不是標準 MIDI 檔案'); const headerLen=view.getUint32(pos);pos+=4; const format=view.getUint16(pos);pos+=2; const tracks=view.getUint16(pos);pos+=2; const division=view.getUint16(pos);pos+=2; pos=8+headerLen;
    if(division&0x8000)throw new Error('目前暫不支援 SMPTE 時基 MIDI'); const tpq=division; let bpm=90,timeSig=[4,4],trackName='',notes=[];
    for(let t=0;t<tracks;t++){
      if(pos+8>view.byteLength)break; const id=str(4),len=view.getUint32(pos);pos+=4,end=pos+len; if(id!=='MTrk'){pos=end;continue}
      let tick=0,running=0;const active=new Map();
      while(pos<end){
        const q={pos};tick+=readVarLen(view,q);pos=q.pos; let status=view.getUint8(pos++); if(status<0x80){pos--;status=running}else running=status;
        if(status===0xff){const type=view.getUint8(pos++),r={pos},l=readVarLen(view,r);pos=r.pos; if(type===0x51&&l===3){const us=(view.getUint8(pos)<<16)|(view.getUint8(pos+1)<<8)|view.getUint8(pos+2); if(us)bpm=60000000/us}else if(type===0x58&&l>=2){timeSig=[view.getUint8(pos),Math.pow(2,view.getUint8(pos+1))]}else if(type===0x03&&!trackName){trackName=dec.decode(new Uint8Array(buffer,pos,l))} pos+=l; continue}
        if(status===0xf0||status===0xf7){const r={pos},l=readVarLen(view,r);pos=r.pos+l;continue}
        const type=status&0xf0,channel=status&0x0f;
        if(type===0x80||type===0x90){const note=view.getUint8(pos++),vel=view.getUint8(pos++),k=channel+':'+note; if(type===0x90&&vel>0)active.set(k,{tick,note}); else if(active.has(k)){const a=active.get(k);notes.push({start:a.tick,end:tick,note:a.note});active.delete(k)}}
        else if(type===0xa0||type===0xb0||type===0xe0)pos+=2; else if(type===0xc0||type===0xd0)pos+=1; else throw new Error('MIDI 事件格式無法解析');
      }
      pos=end;
    }
    if(!notes.length)throw new Error('MIDI 沒有找到音符事件'); notes.sort((a,b)=>a.start-b.start||b.note-a.note);
    const groups=[]; notes.forEach(n=>{let g=groups[groups.length-1]; if(!g||g.start!==n.start){g={start:n.start,notes:[]};groups.push(g)} g.notes.push(n)});
    const events=[]; let cursor=0; const quant=v=>Math.max(.25,Math.round(v*4)/4);
    groups.forEach((g,i)=>{const startBeat=g.start/tpq; if(startBeat>cursor+.12){events.push(['REST',quant(startBeat-cursor)]); cursor=startBeat}
      const sorted=[...g.notes].sort((a,b)=>a.note-b.note); const noteNames=sorted.map(n=>midiName(n.note)); const primaryEnd=Math.max(...sorted.map(n=>n.end))/tpq; const nextStart=i+1<groups.length?groups[i+1].start/tpq:null; const maxDur=Math.max(.25,primaryEnd-startBeat); const dur=quant(nextStart!=null?Math.min(maxDur,Math.max(.25,nextStart-startBeat)):maxDur);
      events.push([noteNames.length===1?noteNames[0]:noteNames,dur]); cursor=startBeat+dur;
    });
    return normalize({title:(trackName||fileName.replace(/\.[^.]+$/,'')).trim(), bpm,timeSig,key:'MIDI',events,sourceType:'MIDI',polyphonic:true,importWarnings:{ignoredChords:0,ignoredVoices:0}});
  }

  function listImported(){return Store.get(IMPORT_KEY,[])}
  function saveImported(song,fileName){const rows=listImported(); const item={...song,id:uniqueId(fileName,rows),createdAt:Date.now()}; rows.push(item); Store.set(IMPORT_KEY,rows); return item}
  function removeImported(id){Store.set(IMPORT_KEY,listImported().filter(x=>x.id!==id))}
  async function importFile(file){
    if(!file)throw new Error('請先選擇檔案'); const ext=file.name.split('.').pop().toLowerCase(); let song;
    if(ext==='musicxml'||ext==='xml')song=parseMusicXML(await file.text(),file.name); else if(ext==='mid'||ext==='midi')song=parseMIDI(await file.arrayBuffer(),file.name); else throw new Error('請選擇 MusicXML、XML、MID 或 MIDI 檔案');
    const saved=saveImported(song,file.name); const w=song.importWarnings||{};
    return {song:saved,message:`已匯入：${saved.title}｜${Math.round(saved.bpm)} BPM｜${saved.timeSig.join('/')}｜${saved.events.length} 個事件`,warning:(w.ignoredVoices)?`MusicXML 目前仍先取主要聲部：略過 ${w.ignoredVoices||0} 個其他聲部事件。MIDI 和弦已完整保留。`:''}
  }

  function listPhotos(){return Store.get(PHOTO_LIBRARY_KEY,[])}
  function savePhotos(rows){Store.set(PHOTO_LIBRARY_KEY,rows)}
  async function fileToBlob(file,rotation=0){
    const url=URL.createObjectURL(file);
    try{
      const img=await new Promise((resolve,reject)=>{const x=new Image();x.onload=()=>resolve(x);x.onerror=reject;x.src=url});
      const max=1800,ratio=Math.min(1,max/Math.max(img.width,img.height));
      const w=Math.max(1,Math.round(img.width*ratio)),h=Math.max(1,Math.round(img.height*ratio));
      const rot=((rotation%360)+360)%360,swap=rot===90||rot===270;
      const c=document.createElement('canvas');c.width=swap?h:w;c.height=swap?w:h;const ctx=c.getContext('2d');
      ctx.translate(c.width/2,c.height/2);ctx.rotate(rot*Math.PI/180);ctx.drawImage(img,-w/2,-h/2,w,h);
      return await new Promise(resolve=>c.toBlob(resolve,'image/jpeg',.86));
    } finally {URL.revokeObjectURL(url)}
  }
  async function savePhotoToLibrary(meta,files){
    const rows=listPhotos(),refs=[];
    for(const f of [...files]){
      const blob=await fileToBlob(f.file||f,f.rotation||0);
      const ref=await PhotoStore.put(blob,{name:(f.file||f).name||'camera.jpg'});refs.push(ref);
    }
    const title=(meta.title||'未命名拍照樂譜').trim();
    const item={id:uniqueId('photo_'+title,rows),title,composer:(meta.author||'').trim(),author:(meta.author||'').trim(),category:'我的拍照樂譜',level:'照片教材',key:'Unknown',bpm:88,timeSig:[4,4],measures:0,photoScore:true,syncReady:false,pageImages:refs.map(id=>'idb:'+id),pageCount:refs.length,visibleMeasures:`${refs.length} 頁教材`,practiceNotes:['手機拍照上傳，原始頁面存於 IndexedDB。已加入曲庫，可稍後轉同步練習版。'],createdAt:Date.now(),complete:false,collection:'我的拍照曲庫'};
    rows.unshift(item);savePhotos(rows);return item;
  }
  async function removePhoto(id){
    const rows=listPhotos(),row=rows.find(x=>x.id===id);
    if(row){const ids=(row.pageImages||[]).filter(x=>String(x).startsWith('idb:')).map(x=>String(x).slice(4));await PhotoStore.removeMany(ids)}
    savePhotos(rows.filter(x=>x.id!==id));
  }
  function note(name,oct){return name+oct}
  function buildByTemplate(template, measures, timeSig){
    const [beats,unit]=timeSig||[4,4];
    const dur=(unit===8?.5:1); // starter mapping
    const eight=.5;
    const q=1;
    const events=[];
    const push=(n,d)=>events.push([n,d]);
    const scale=['C4','D4','E4','F4','G4','A4','B4','C5'];
    const bass=['C3','G2','A2','E2','F2','C3','G2','C3'];
    const leftScale=['C3','D3','E3','F3','G3','A3','B3','C4'];
    for(let m=0;m<measures;m++){
      if(template==='single-right'){
        const row=[scale[m%8],scale[(m+1)%8],scale[(m+2)%8],scale[(m+3)%8]];
        row.forEach(n=>push(n,q));
      }else if(template==='single-left'){
        const row=[leftScale[m%8],leftScale[(m+1)%8],leftScale[(m+2)%8],leftScale[(m+3)%8]];
        row.forEach(n=>push(n,q));
      }else if(template==='both-hands-broken'){
        const root=bass[m%bass.length], r1=scale[m%8],r2=scale[(m+2)%8],r3=scale[(m+4)%8];
        [ [root,r1], [root,r2], [root,r3], [root,r2] ].forEach(ch=>push(ch,q));
      }else if(template==='both-hands-chords'){
        const roots=['C3','F3','G3','C3']; const r=roots[m%4];
        const triads=[['C4','E4','G4'],['F4','A4','C5'],['G4','B4','D5'],['C4','E4','G4']][m%4];
        for(let i=0;i<4;i++)push([r,...triads],q);
      }else if(template==='scale'){
        const asc=m%2===0;
        const row=asc?scale:[...scale].reverse();
        row.forEach(n=>push(n,eight));
      }else { // etude
        const left=['C3','G2','A2','F2'][m%4];
        const right=[scale[m%8],scale[(m+1)%8],scale[(m+2)%8],scale[(m+3)%8],scale[(m+4)%8],scale[(m+3)%8],scale[(m+2)%8],scale[(m+1)%8]];
        right.forEach((n,i)=>push(i%2===0?[left,n]:n,eight));
      }
      // normalize per measure length if 3/4 or 6/8 by trimming/adding rests
      let beatsInMeasure=0; let start=events.length-8; if(start<0)start=0;
      for(let i=start;i<events.length;i++) beatsInMeasure+=events[i][1];
      const target=beats*(4/unit);
      if(beatsInMeasure<target) push('REST', +(target-beatsInMeasure).toFixed(2));
    }
    return events;
  }

  function buildFingering(template, events){
    const patterns={
      'single-right':['1','2','3','4','5','4','3','2'],
      'single-left':['5','4','3','2','1','2','3','4'],
      'both-hands-broken':['1','2','3','5'],
      'both-hands-chords':['1','3','5'],
      'scale':['1','2','3','1','2','3','4','5'],
      'etude':['1','2','3','4','5','4','3','2']
    };
    const src=patterns[template]||patterns['single-right'];
    const out=[]; let i=0;
    events.forEach(e=>{if(e[0]!=='REST'){out.push(src[i%src.length]);i++}});
    return out;
  }

  function convertPhotoToSync(id,settings){
    const rows=listPhotos();
    const idx=rows.findIndex(x=>x.id===id);
    if(idx<0)throw new Error('找不到這份拍照樂譜');
    const row=rows[idx];
    const timeSig=[clamp(Number(settings.timeSig?.[0]||4),2,12), clamp(Number(settings.timeSig?.[1]||4),2,16)];
    const measures=clamp(Number(settings.measures)||16,4,64);
    const template=settings.template||'single-right';
    const events=buildByTemplate(template, measures, timeSig);
    rows[idx]={
      ...row,
      category:settings.category||'我的拍照樂譜 / 同步版',
      level:'同步練習版',
      bpm:clamp(Number(settings.bpm)||88,30,240),
      timeSig,
      measures,
      events,
      fingering:buildFingering(template,events),
      syncReady:true,
      practiceMode:'sync-practice',
      complete:true,
      practiceNotes:[...(row.practiceNotes||[]),`已轉成同步練習版：${template}｜${measures} 小節｜${timeSig.join('/')}｜${settings.bpm||88} BPM`],
      syncMeta:{template,convertedAt:Date.now()}
    };
    savePhotos(rows);
    return rows[idx];
  }

  window.ScoreImporter={
    parseMusicXML,parseMIDI,importFile,listImported,removeImported,
    savePhotoToLibrary,listPhotos,removePhoto,convertPhotoToSync
  };
})();
