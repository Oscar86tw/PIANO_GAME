
(function(){
  const IMPORT_KEY='imported-scores-v41';

  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
  function normalize(song){
    song.bpm=clamp(Math.round(Number(song.bpm)||90),30,240);
    song.timeSig=Array.isArray(song.timeSig)&&song.timeSig.length===2?song.timeSig:[4,4];
    song.key=song.key||'Imported';
    song.level='Imported';
    song.category='我的匯入';
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

  function uniqueId(name){
    const rows=Store.get(IMPORT_KEY,[]);
    const ids=new Set(rows.map(x=>x.id));
    let base='import_'+String(name||'score')
      .toLowerCase().replace(/\.[^.]+$/,'')
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g,'_')
      .replace(/^_+|_+$/g,'').slice(0,36);
    if(!base||base==='import_')base='import_score';
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
    if(alter===-1){
      const flat={Db:'C#',Eb:'D#',Gb:'F#',Ab:'G#',Bb:'A#'};
      return (flat[step+'b']||step)+octave;
    }
    return step+octave;
  }

  function parseMusicXML(text,fileName='score.musicxml'){
    const xml=new DOMParser().parseFromString(text,'application/xml');
    if(xml.querySelector('parsererror'))throw new Error('MusicXML 格式無法解析');
    const part=xml.querySelector('part');
    if(!part)throw new Error('MusicXML 找不到樂譜 Part');

    const title=xml.querySelector('work-title')?.textContent?.trim()||
      xml.querySelector('movement-title')?.textContent?.trim()||
      fileName.replace(/\.[^.]+$/,'');

    let divisions=1,bpm=90,timeSig=[4,4],key='C Major',primaryVoice=null;
    let ignoredVoices=0,ignoredChords=0;
    const events=[];

    const soundTempo=xml.querySelector('sound[tempo]')?.getAttribute('tempo');
    const perMinute=xml.querySelector('per-minute')?.textContent;
    if(soundTempo||perMinute)bpm=Number(soundTempo||perMinute)||90;

    part.querySelectorAll('measure').forEach(measure=>{
      const div=measure.querySelector(':scope > attributes > divisions');
      if(div)divisions=Number(div.textContent)||divisions;
      const beats=measure.querySelector(':scope > attributes > time > beats');
      const beatType=measure.querySelector(':scope > attributes > time > beat-type');
      if(beats&&beatType)timeSig=[Number(beats.textContent)||4,Number(beatType.textContent)||4];
      const fifths=measure.querySelector(':scope > attributes > key > fifths');
      if(fifths)key=keyNameFromFifths(Number(fifths.textContent));

      measure.querySelectorAll(':scope > note').forEach(note=>{
        const voice=note.querySelector('voice')?.textContent?.trim()||'1';
        if(primaryVoice===null)primaryVoice=voice;
        if(voice!==primaryVoice){ignoredVoices++;return}
        if(note.querySelector('chord')){ignoredChords++;return}
        const duration=Number(note.querySelector('duration')?.textContent||0);
        if(duration<=0)return;
        const beatsValue=duration/divisions;
        if(note.querySelector('rest'))events.push(['REST',beatsValue]);
        else{
          const pitch=pitchFromXML(note);
          if(pitch)events.push([pitch,beatsValue]);
        }
      });
    });

    if(!events.length)throw new Error('這份 MusicXML 沒有找到可用的主要聲部音符');
    return normalize({title,bpm,timeSig,key,events,sourceType:'MusicXML',importWarnings:{ignoredVoices,ignoredChords}});
  }

  function readVarLen(view,posObj){
    let value=0,b;
    do{
      if(posObj.pos>=view.byteLength)throw new Error('MIDI 檔案不完整');
      b=view.getUint8(posObj.pos++);
      value=(value<<7)|(b&0x7f);
    }while(b&0x80);
    return value;
  }

  function midiName(m){
    const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
    return names[m%12]+(Math.floor(m/12)-1);
  }

  function parseMIDI(buffer,fileName='score.mid'){
    const view=new DataView(buffer),dec=new TextDecoder();
    let pos=0;
    const str=n=>{let s='';for(let i=0;i<n;i++)s+=String.fromCharCode(view.getUint8(pos++));return s};

    if(str(4)!=='MThd')throw new Error('不是標準 MIDI 檔案');
    const headerLen=view.getUint32(pos);pos+=4;
    const format=view.getUint16(pos);pos+=2;
    const tracks=view.getUint16(pos);pos+=2;
    const division=view.getUint16(pos);pos+=2;
    pos=8+headerLen;

    if(division&0x8000)throw new Error('目前暫不支援 SMPTE 時基 MIDI');
    const tpq=division;
    let bpm=90,timeSig=[4,4],trackName='',notes=[];

    for(let t=0;t<tracks;t++){
      if(pos+8>view.byteLength)break;
      const id=str(4),len=view.getUint32(pos);pos+=4,end=pos+len;
      if(id!=='MTrk'){pos=end;continue}
      let tick=0,running=0;const active=new Map();

      while(pos<end){
        const q={pos};tick+=readVarLen(view,q);pos=q.pos;
        let status=view.getUint8(pos++);
        if(status<0x80){pos--;status=running}else running=status;

        if(status===0xff){
          const type=view.getUint8(pos++),r={pos},l=readVarLen(view,r);pos=r.pos;
          if(type===0x51&&l===3){
            const us=(view.getUint8(pos)<<16)|(view.getUint8(pos+1)<<8)|view.getUint8(pos+2);
            if(us)bpm=60000000/us;
          }else if(type===0x58&&l>=2){
            timeSig=[view.getUint8(pos),Math.pow(2,view.getUint8(pos+1))];
          }else if(type===0x03&&!trackName){
            trackName=dec.decode(new Uint8Array(buffer,pos,l));
          }
          pos+=l;continue;
        }

        if(status===0xf0||status===0xf7){
          const r={pos},l=readVarLen(view,r);pos=r.pos+l;continue;
        }

        const type=status&0xf0,channel=status&0x0f;
        if(type===0x80||type===0x90){
          const note=view.getUint8(pos++),vel=view.getUint8(pos++),k=channel+':'+note;
          if(type===0x90&&vel>0)active.set(k,{tick,note});
          else if(active.has(k)){const a=active.get(k);notes.push({start:a.tick,end:tick,note:a.note});active.delete(k)}
        }else if(type===0xa0||type===0xb0||type===0xe0)pos+=2;
        else if(type===0xc0||type===0xd0)pos+=1;
        else throw new Error('MIDI 事件格式無法解析');
      }
      pos=end;
    }

    if(!notes.length)throw new Error('MIDI 沒有找到音符事件');
    notes.sort((a,b)=>a.start-b.start||b.note-a.note);

    const groups=[];
    notes.forEach(n=>{
      let g=groups[groups.length-1];
      if(!g||g.start!==n.start){g={start:n.start,notes:[]};groups.push(g)}
      g.notes.push(n);
    });

    const events=[];let cursor=0;
    const quant=v=>Math.max(.25,Math.round(v*4)/4);

    groups.forEach((g,i)=>{
      const startBeat=g.start/tpq;
      if(startBeat>cursor+.12){
        events.push(['REST',quant(startBeat-cursor)]);
        cursor=startBeat;
      }

      const sorted=[...g.notes].sort((a,b)=>a.note-b.note);
      const noteNames=sorted.map(n=>midiName(n.note));
      const primaryEnd=Math.max(...sorted.map(n=>n.end))/tpq;
      const nextStart=i+1<groups.length?groups[i+1].start/tpq:null;
      const maxDur=Math.max(.25,primaryEnd-startBeat);
      const dur=quant(nextStart!=null?Math.min(maxDur,Math.max(.25,nextStart-startBeat)):maxDur);

      events.push([noteNames.length===1?noteNames[0]:noteNames,dur]);
      cursor=startBeat+dur;
    });

    const handEvents=events.map(([note,dur])=>{
      if(note==='REST')return {right:['REST',dur],left:['REST',dur]};
      const arr=Array.isArray(note)?note:[note];
      const left=arr.filter(n=>{
        const m=n.match(/^([A-G])#?(-?\d)$/); if(!m)return false;
        return (Number(m[2])+1)*12+({C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11}[m[1]+(n.includes('#')?'#':'')]||0) < 60;
      });
      const right=arr.filter(n=>!left.includes(n));
      return {
        right:[right.length===0?'REST':right.length===1?right[0]:right,dur],
        left:[left.length===0?'REST':left.length===1?left[0]:left,dur]
      };
    });

    return normalize({
      title:(trackName||fileName.replace(/\.[^.]+$/,'')).trim(),
      bpm,timeSig,key:'MIDI',events,handEvents,sourceType:'MIDI',
      polyphonic:true,
      importWarnings:{ignoredChords:0,ignoredVoices:0}
    });
  }

  function listImported(){return Store.get(IMPORT_KEY,[])}

  function saveImported(song,fileName){
    const rows=listImported();
    const item={...song,id:uniqueId(fileName),createdAt:Date.now()};
    rows.push(item);Store.set(IMPORT_KEY,rows);
    return item;
  }

  function removeImported(id){
    Store.set(IMPORT_KEY,listImported().filter(x=>x.id!==id));
  }

  async function importFile(file){
    if(!file)throw new Error('請先選擇檔案');
    const ext=file.name.split('.').pop().toLowerCase();
    let song;
    if(ext==='musicxml'||ext==='xml')song=parseMusicXML(await file.text(),file.name);
    else if(ext==='mid'||ext==='midi')song=parseMIDI(await file.arrayBuffer(),file.name);
    else throw new Error('請選擇 MusicXML、XML、MID 或 MIDI 檔案');

    const saved=saveImported(song,file.name);
    const w=song.importWarnings||{};
    return {
      song:saved,
      message:`已匯入：${saved.title}｜${Math.round(saved.bpm)} BPM｜${saved.timeSig.join('/')}｜${saved.events.length} 個事件`,
      warning:(w.ignoredVoices)?
        `MusicXML 目前仍先取主要聲部：略過 ${w.ignoredVoices||0} 個其他聲部事件。MIDI 和弦已完整保留。`:''
    };
  }

  // Photo draft stays independent from score parser.
  async function savePhotoDraft(meta,files){
    const rows=Store.get('photo-scores-v4',[]);
    const item={id:'photo_'+Date.now(),title:meta.title||'未命名拍照樂譜',author:meta.author||'',pages:[...files].map(f=>({name:f.name,size:f.size,type:f.type})),status:'待 OMR',createdAt:Date.now()};
    rows.push(item);Store.set('photo-scores-v4',rows);return item;
  }
  function photoList(){return Store.get('photo-scores-v4',[])}
  function removePhoto(id){Store.set('photo-scores-v4',photoList().filter(x=>x.id!==id))}

  window.ScoreImporter={
    parseMusicXML,parseMIDI,importFile,listImported,removeImported,
    savePhotoDraft,list:photoList,remove:removePhoto
  };
})();
