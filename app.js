
const $=id=>document.getElementById(id);

const songs = {
  twinkle:{
    title:'Twinkle Twinkle Little Star',level:'Beginner',bpm:84,timeSig:[4,4],key:'C Major',
    events:[
      ['C4',1],['C4',1],['G4',1],['G4',1],['A4',1],['A4',1],['G4',2],
      ['F4',1],['F4',1],['E4',1],['E4',1],['D4',1],['D4',1],['C4',2]
    ]
  },
  ode:{
    title:'Ode to Joy',level:'Easy',bpm:96,timeSig:[4,4],key:'C Major',
    events:[
      ['E4',1],['E4',1],['F4',1],['G4',1],['G4',1],['F4',1],['E4',1],['D4',1],
      ['C4',1],['C4',1],['D4',1],['E4',1],['E4',1.5],['D4',0.5],['D4',2]
    ]
  },
  mary:{
    title:'Mary Had a Little Lamb',level:'Beginner',bpm:88,timeSig:[4,4],key:'C Major',
    events:[
      ['E4',1],['D4',1],['C4',1],['D4',1],
      ['E4',1],['E4',1],['E4',2],
      ['REST',1],['D4',1],['D4',2],
      ['E4',1],['G4',1],['G4',2]
    ]
  },
  scale:{
    title:'C Major Scale',level:'Beginner',bpm:80,timeSig:[4,4],key:'C Major',
    events:[
      ['C3',1],['D3',1],['E3',1],['F3',1],['G3',1],['A3',1],['B3',1],['C4',1],
      ['D4',0.5],['E4',0.5],['F4',1],['G4',2]
    ]
  },
  canon:{
    title:'Canon Theme',level:'Normal',bpm:92,timeSig:[4,4],key:'D Major',
    events:[
      ['D4',1],['A4',1],['B4',1],['F#4',1],['G4',1],['D4',1],['G4',1],['A4',1],
      ['D4',0.5],['F#4',0.5],['A4',1],['B4',2]
    ]
  },
  sight:{
    title:'Sight Reading Practice',level:'Easy',bpm:90,timeSig:[3,4],key:'C Major',
    events:[
      ['C4',1],['E4',1],['D4',1],
      ['F4',0.5],['E4',0.5],['G4',1],['REST',1],
      ['F4',1],['A4',1],['G4',1],
      ['E4',1],['D4',1],['C4',1]
    ]
  }
};

for(const song of Object.values(songs)){
  song.notes=song.events.filter(e=>e[0]!=='REST').map(e=>e[0]);
  song.totalBeats=song.events.reduce((sum,e)=>sum+e[1],0);
  song.duration=song.totalBeats*60/song.bpm;
}


// ---------- V1.9: 216 built-in pedagogical scores ----------
const LEVEL_PROFILES = {
  prep:{label:'預備級',range:['C4','D4','E4','F4','G4'],bpms:[60,66,72],durations:[1,1,1,2]},
  1:{label:'Level 1',range:['C4','D4','E4','F4','G4','A4'],bpms:[66,72,78],durations:[1,1,2,.5]},
  2:{label:'Level 2',range:['B3','C4','D4','E4','F4','G4','A4','B4'],bpms:[72,78,84],durations:[.5,1,1,2]},
  3:{label:'Level 3',range:['A3','B3','C4','D4','E4','F4','G4','A4','B4','C5'],bpms:[76,84,88],durations:[.5,.5,1,1.5,2]},
  4:{label:'Level 4',range:['G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5','D5'],bpms:[80,88,96],durations:[.5,1,1.5,2]},
  5:{label:'Level 5',range:['F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5','D5','E5'],bpms:[84,92,100],durations:[.25,.5,1,1.5,2]},
  6:{label:'Level 6',range:['E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5'],bpms:[88,96,104],durations:[.25,.5,1,1.5,2]},
  7:{label:'Level 7',range:['D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5'],bpms:[92,100,108],durations:[.25,.5,.75,1,1.5,2]},
  8:{label:'Level 8',range:['C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5','A5'],bpms:[96,104,112],durations:[.25,.5,.75,1,1.5,2]}
};
const SCORE_CATEGORIES=[
 ['notes','識譜'],['rhythm','節奏'],['technique','技巧'],['scales','音階・琶音'],
 ['chords','和弦・和聲'],['sight','視奏'],['ear','聽力'],['repertoire','曲目・演奏']
];
function rotateArray(a,n){n=((n%a.length)+a.length)%a.length;return a.slice(n).concat(a.slice(0,n))}
function safeIdx(i,n){return Math.max(0,Math.min(n-1,i))}
function makeLearningPattern(profile,category,variant){
  const r=profile.range, out=[];
  const len=category==='repertoire'?24:category==='sight'?20:16;
  const add=(note,beats)=>out.push([note,beats]);
  if(category==='scales'){
    const seq=(variant%2?[...r].reverse():r).slice(0,Math.min(8,r.length));
    const full=seq.concat(seq.slice(1,-1).reverse());
    for(let i=0;i<len;i++) add(full[i%full.length],profile.durations[(i+variant)%profile.durations.length]);
  }else if(category==='chords'){
    const pat=[0,2,4,2,1,3,5,3];
    for(let i=0;i<len;i++) add(r[safeIdx(pat[(i+variant)%pat.length]+variant%2,r.length)],i%4===3?2:1);
  }else if(category==='rhythm'){
    const sets=[[1,1,1,1],[.5,.5,1,2],[1.5,.5,1,1],[.5,.5,.5,.5,1,1],[2,1,1]];
    const rr=sets[variant%sets.length];
    for(let i=0;i<len;i++){
      if((i+variant)%13===0&&variant%3===0)add('REST',rr[i%rr.length]);
      else add(r[(i*2+variant)%Math.min(r.length,7)],rr[i%rr.length]);
    }
  }else if(category==='technique'){
    const pat=[0,1,2,3,4,3,2,1];
    for(let i=0;i<len;i++) add(r[safeIdx(pat[(i+variant)%pat.length],r.length)],profile.durations[(i+variant)%Math.min(3,profile.durations.length)]);
  }else if(category==='ear'){
    const pat=[0,2,1,3,2,0,1,0];
    for(let i=0;i<len;i++) add(r[safeIdx(pat[(i+variant)%pat.length],r.length)],i%4===3?2:1);
  }else if(category==='sight'){
    const pat=[0,2,1,4,2,5,3,1,6,4,2,0];
    for(let i=0;i<len;i++) add(r[(pat[(i+variant)%pat.length]+variant)%r.length],profile.durations[(i*3+variant)%profile.durations.length]);
  }else if(category==='repertoire'){
    const pat=[0,0,2,2,3,3,2,1,1,0,0,1,1,0];
    for(let i=0;i<len;i++) add(r[safeIdx(pat[(i+variant)%pat.length]+variant%Math.max(1,r.length-5),r.length)],i%7===6?2:profile.durations[(i+variant)%Math.min(4,profile.durations.length)]);
  }else{
    const seq=rotateArray(r,variant);
    for(let i=0;i<len;i++) add(seq[i%seq.length],i%8===7?2:1);
  }
  return out;
}
function addGeneratedBuiltins(){
  const levels=['prep','1','2','3','4','5','6','7','8'];
  let count=0;
  for(const levelKey of levels){
    const profile=LEVEL_PROFILES[levelKey];
    SCORE_CATEGORIES.forEach(([category,categoryLabel],catIndex)=>{
      for(let variant=1;variant<=3;variant++){
        const id=`lesson_${levelKey}_${category}_${variant}`;
        const events=makeLearningPattern(profile,category,variant+catIndex);
        songs[id]={
          title:`${profile.label}｜${categoryLabel} ${String(variant).padStart(2,'0')}`,
          level:profile.label,levelKey,category,categoryLabel,
          bpm:profile.bpms[(variant-1)%profile.bpms.length],
          timeSig:(category==='rhythm'&&variant===3)?[3,4]:[4,4],
          key:(levelKey==='prep'||levelKey==='1')?'C Major':(variant%3===0?'F Major':variant%2===0?'G Major':'C Major'),
          events,builtIn:true,pedagogical:true
        };
        count++;
      }
    });
  }
  for(const song of Object.values(songs)){
    if(!song.events)continue;
    song.notes=song.events.filter(e=>e[0]!=='REST').map(e=>e[0]);
    song.totalBeats=song.events.reduce((sum,e)=>sum+Number(e[1]||0),0);
    song.duration=song.totalBeats*60/(song.bpm||90);
  }
  return count;
}
const GENERATED_BUILTIN_COUNT=addGeneratedBuiltins();

let library = Object.entries(songs).map(([id,s])=>{
  const sec=Math.round(s.duration||0);
  const mm=String(Math.floor(sec/60)).padStart(2,'0');
  const ss=String(sec%60).padStart(2,'0');
  const lvl=s.levelKey==='prep'?'Prep':(s.levelKey?`Level ${s.levelKey}`:(s.level||'Beginner'));
  return [id,s.title,lvl,`${mm}:${ss}`,s.category||'repertoire'];
});



const BUILTIN_LIBRARY_COUNT = library.length;
const IMPORT_STORAGE_KEY='pianoLearningImportedScoresV19';

function formatDurationSeconds(sec){
  sec=Math.max(0,Math.round(sec||0));
  return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
}
function normalizeImportedSong(song){
  song.bpm=Math.max(30,Math.min(240,Math.round(Number(song.bpm)||90)));
  song.timeSig=Array.isArray(song.timeSig)&&song.timeSig.length===2?song.timeSig:[4,4];
  song.key=song.key||'Imported';
  song.level='Imported';
  song.events=(song.events||[]).filter(e=>Array.isArray(e)&&e.length>=2&&Number(e[1])>0).map(e=>[e[0],+Number(e[1]).toFixed(3)]);
  song.notes=song.events.filter(e=>e[0]!=='REST').map(e=>e[0]);
  song.totalBeats=song.events.reduce((sum,e)=>sum+Number(e[1]),0);
  song.duration=song.totalBeats*60/song.bpm;
  return song;
}
function rebuildImportedLibrary(){
  library=library.slice(0,BUILTIN_LIBRARY_COUNT);
  Object.entries(songs).forEach(([id,s])=>{
    if(!s.imported) return;
    library.push([id,s.title,'Imported',formatDurationSeconds(s.duration)]);
  });
}
function persistImportedScores(){
  try{
    const data={};
    Object.entries(songs).forEach(([id,s])=>{if(s.imported)data[id]=s});
    localStorage.setItem(IMPORT_STORAGE_KEY,JSON.stringify(data));
  }catch(e){}
}
function loadImportedScores(){
  try{
    const data=JSON.parse(localStorage.getItem(IMPORT_STORAGE_KEY)||'{}');
    Object.entries(data).forEach(([id,s])=>{songs[id]=normalizeImportedSong({...s,imported:true})});
    rebuildImportedLibrary();
  }catch(e){}
}
function uniqueImportId(name){
  const base='import_'+String(name||'score').toLowerCase().replace(/\.[^.]+$/,'').replace(/[^a-z0-9\u4e00-\u9fff]+/g,'_').replace(/^_+|_+$/g,'').slice(0,36);
  let id=base||'import_score',n=2;
  while(songs[id]) id=(base||'import_score')+'_'+n++;
  return id;
}
function keyNameFromFifths(fifths){
  const major={ '-7':'Cb Major','-6':'Gb Major','-5':'Db Major','-4':'Ab Major','-3':'Eb Major','-2':'Bb Major','-1':'F Major','0':'C Major','1':'G Major','2':'D Major','3':'A Major','4':'E Major','5':'B Major','6':'F# Major','7':'C# Major'};
  return major[String(fifths)]||'Imported';
}
function pitchFromMusicXml(note){
  const pitch=note.querySelector('pitch'); if(!pitch)return null;
  const step=pitch.querySelector('step')?.textContent?.trim();
  const octave=pitch.querySelector('octave')?.textContent?.trim();
  const alter=Number(pitch.querySelector('alter')?.textContent||0);
  if(!step||octave==null)return null;
  let accidental=''; if(alter===1)accidental='#'; else if(alter===-1)accidental='b';
  if(accidental==='b'){
    const flats={Db:'C#',Eb:'D#',Gb:'F#',Ab:'G#',Bb:'A#'};
    const key=step+'b';
    if(flats[key]) return flats[key]+octave;
  }
  return step+accidental+octave;
}
function parseMusicXML(text,fileName){
  const xml=new DOMParser().parseFromString(text,'application/xml');
  if(xml.querySelector('parsererror')) throw new Error('MusicXML 格式無法解析');
  const part=xml.querySelector('part'); if(!part) throw new Error('MusicXML 找不到樂譜 Part');
  const title=xml.querySelector('work-title')?.textContent?.trim()||xml.querySelector('movement-title')?.textContent?.trim()||fileName.replace(/\.[^.]+$/,'');
  let divisions=1,bpm=90,timeSig=[4,4],key='C Major',primaryVoice=null,ignoredVoices=0,ignoredChords=0;
  let events=[];
  const soundTempo=xml.querySelector('sound[tempo]')?.getAttribute('tempo');
  const perMinute=xml.querySelector('per-minute')?.textContent;
  if(soundTempo||perMinute) bpm=Number(soundTempo||perMinute)||90;
  part.querySelectorAll('measure').forEach(measure=>{
    const div=measure.querySelector(':scope > attributes > divisions'); if(div) divisions=Number(div.textContent)||divisions;
    const beats=measure.querySelector(':scope > attributes > time > beats');
    const beatType=measure.querySelector(':scope > attributes > time > beat-type');
    if(beats&&beatType) timeSig=[Number(beats.textContent)||4,Number(beatType.textContent)||4];
    const fifths=measure.querySelector(':scope > attributes > key > fifths'); if(fifths) key=keyNameFromFifths(Number(fifths.textContent));
    measure.querySelectorAll(':scope > note').forEach(note=>{
      const voice=note.querySelector('voice')?.textContent?.trim()||'1';
      if(primaryVoice===null) primaryVoice=voice;
      if(voice!==primaryVoice){ignoredVoices++;return}
      if(note.querySelector('chord')){ignoredChords++;return}
      const duration=Number(note.querySelector('duration')?.textContent||0);
      if(duration<=0)return;
      const beatsValue=duration/divisions;
      if(note.querySelector('rest')) events.push(['REST',beatsValue]);
      else{
        const pitch=pitchFromMusicXml(note); if(pitch)events.push([pitch,beatsValue]);
      }
    });
  });
  if(!events.length)throw new Error('這份 MusicXML 沒有找到可用的主要聲部音符');
  return normalizeImportedSong({title,bpm,timeSig,key,events,imported:true,sourceType:'MusicXML',importWarnings:{ignoredVoices,ignoredChords}});
}
function readVarLen(view,posObj){
  let value=0,b;
  do{if(posObj.pos>=view.byteLength)throw new Error('MIDI 檔案不完整');b=view.getUint8(posObj.pos++);value=(value<<7)|(b&0x7f)}while(b&0x80);
  return value;
}
function midiNoteName(m){
  const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  return names[m%12]+(Math.floor(m/12)-1);
}
function parseMIDI(buffer,fileName){
  const view=new DataView(buffer), dec=new TextDecoder(); let pos=0;
  const str=n=>{let s='';for(let i=0;i<n;i++)s+=String.fromCharCode(view.getUint8(pos++));return s};
  if(str(4)!=='MThd')throw new Error('不是標準 MIDI 檔案');
  const headerLen=view.getUint32(pos);pos+=4;
  const format=view.getUint16(pos);pos+=2; const tracks=view.getUint16(pos);pos+=2; const division=view.getUint16(pos);pos+=2;
  pos=8+headerLen;
  if(division&0x8000)throw new Error('目前暫不支援 SMPTE 時基 MIDI');
  const tpq=division; let bpm=90,timeSig=[4,4],trackName='',notes=[];
  for(let t=0;t<tracks;t++){
    if(pos+8>view.byteLength)break;
    const id=str(4),len=view.getUint32(pos);pos+=4,end=pos+len;
    if(id!=='MTrk'){pos=end;continue}
    let tick=0,running=0; const active=new Map();
    while(pos<end){
      const po={pos}; const delta=readVarLen(view,po);pos=po.pos;tick+=delta;
      let status=view.getUint8(pos++); if(status<0x80){pos--;status=running}else running=status;
      if(status===0xff){
        const type=view.getUint8(pos++);const q={pos};const l=readVarLen(view,q);pos=q.pos;
        if(type===0x51&&l===3){const us=(view.getUint8(pos)<<16)|(view.getUint8(pos+1)<<8)|view.getUint8(pos+2);if(us)bpm=60000000/us}
        else if(type===0x58&&l>=2){timeSig=[view.getUint8(pos),Math.pow(2,view.getUint8(pos+1))]}
        else if(type===0x03&&!trackName){trackName=dec.decode(new Uint8Array(buffer,pos,l))}
        pos+=l;continue;
      }
      if(status===0xf0||status===0xf7){const q={pos};const l=readVarLen(view,q);pos=q.pos+l;continue}
      const type=status&0xf0,channel=status&0x0f;
      if(type===0x80||type===0x90){
        const note=view.getUint8(pos++),vel=view.getUint8(pos++),k=channel+':'+note;
        if(type===0x90&&vel>0){active.set(k,{tick,note})}
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
  notes.forEach(n=>{let g=groups[groups.length-1];if(!g||g.start!==n.start){g={start:n.start,notes:[]};groups.push(g)}g.notes.push(n)});
  const events=[];let cursor=0,ignoredChords=0;
  const q=v=>Math.max(.25,Math.round(v*4)/4);
  groups.forEach((g,i)=>{
    const chosen=g.notes.reduce((a,b)=>a.note>b.note?a:b);ignoredChords+=Math.max(0,g.notes.length-1);
    const startBeat=g.start/tpq;
    if(startBeat>cursor+.12){events.push(['REST',q(startBeat-cursor)]);cursor=startBeat}
    const actualEnd=chosen.end/tpq;
    const nextStart=i+1<groups.length?groups[i+1].start/tpq:null;
    const maxDur=Math.max(.25,actualEnd-startBeat);
    const dur=q(nextStart!=null?Math.min(maxDur,Math.max(.25,nextStart-startBeat)):maxDur);
    events.push([midiNoteName(chosen.note),dur]);cursor=startBeat+dur;
  });
  return normalizeImportedSong({title:(trackName||fileName.replace(/\.[^.]+$/,'')).trim(),bpm,timeSig,key:'MIDI',events,imported:true,sourceType:'MIDI',importWarnings:{ignoredChords}});
}
async function importScoreFile(file){
  if(!file)return;
  const ext=file.name.split('.').pop().toLowerCase();
  let song;
  if(ext==='musicxml'||ext==='xml') song=parseMusicXML(await file.text(),file.name);
  else if(ext==='mid'||ext==='midi') song=parseMIDI(await file.arrayBuffer(),file.name);
  else throw new Error('請選擇 MusicXML 或 MIDI 檔案');
  const id=uniqueImportId(file.name);songs[id]=song;persistImportedScores();rebuildImportedLibrary();loadImportedScores();
renderSongList();
const songCountEl=document.querySelector('#songsPanel .section-title > span');
if(songCountEl) songCountEl.textContent=`${library.length} 份樂譜`;
  const warn=song.importWarnings||{};
  const extra=(warn.ignoredChords||warn.ignoredVoices)?`（已略過 ${warn.ignoredChords||0} 個和弦附加音、${warn.ignoredVoices||0} 個其他聲部事件）`:'';
  return {id,song,message:`已匯入：${song.title}｜${Math.round(song.bpm)} BPM｜${song.timeSig.join('/')}｜${song.events.length} 個事件 ${extra}`};
}

const curriculum = {
  prep:{
    name:'預備級',
    summary:'建立鋼琴方向感、基本拍感、五線譜起步與正確坐姿。',
    items:{
      notes:['鍵盤高低音方向','中央 C','高音譜號 C–G'],
      rhythm:['穩定四分音符','二分音符','4 拍脈動'],
      technique:['坐姿與手型','手指編號 1–5','放鬆落鍵'],
      scales:['五指位置 C–G','反向五指練習'],
      chords:['聽辨高低音','C 大三和弦入門'],
      sight:['2–4 小節超短視奏'],
      ear:['高/低音辨認','相同/不同旋律'],
      repertoire:['單手短曲','固定手位兒歌']
    }
  },
  1:{name:'Level 1',summary:'建立基本識譜、節奏、五指技巧與簡單雙手配合。',items:{
    notes:['高音譜表音域擴展','低音譜號入門','升降記號'],
    rhythm:['四分/二分/全音符','四分休止符','2/4、3/4、4/4'],
    technique:['連奏與斷奏','左右手五指型','基本力度'],
    scales:['C/G/F 大調五指型','一個八度音階入門'],
    chords:['I 和弦','C/G/F 基本和弦'],
    sight:['固定手位視奏','簡單節奏視奏'],
    ear:['拍點模仿','旋律方向辨認'],
    repertoire:['簡單古典/民謠','左右手輪流']
  }},
  2:{name:'Level 2',summary:'加強低音譜號、手位移動、八分音符與基礎和弦。',items:{
    notes:['雙譜表閱讀','跨越中央 C','更多升降音'],
    rhythm:['八分音符','附點二分音符','弱起概念'],
    technique:['換手位','拇指穿指入門','簡單踏板'],
    scales:['C/G/D/F 大調','A/D 小調入門'],
    chords:['I–V7','分解和弦入門'],
    sight:['不固定手位短譜','雙手簡單視奏'],
    ear:['節奏回拍','大小調色彩'],
    repertoire:['簡易古典主題','流行旋律配簡單和弦']
  }},
  3:{name:'Level 3',summary:'建立完整一個八度音階、三連音、雙手協調與基礎樂句。',items:{
    notes:['更寬音域','臨時記號','八度記號'],
    rhythm:['三連音','附點四分+八分','切分入門'],
    technique:['音階指法','手腕轉移','聲部平衡'],
    scales:['大調/和聲小調一個八度','主和弦琶音'],
    chords:['I–IV–V','轉位入門'],
    sight:['較長雙手視奏','簡單調號'],
    ear:['旋律記憶','強弱拍辨認'],
    repertoire:['古典小品','電影/動畫簡易改編']
  }},
  4:{name:'Level 4',summary:'擴充調號、兩個八度音階、踏板與伴奏型。',items:{
    notes:['多升降號調性','和弦音型閱讀'],
    rhythm:['十六分音符入門','切分節奏','複拍子入門'],
    technique:['兩個八度音階','旋律歌唱性','踏板換和聲'],
    scales:['兩個八度大/小調','琶音擴展'],
    chords:['七和弦入門','伴奏型變化'],
    sight:['雙手不同節奏','多調性視奏'],
    ear:['終止式感受','旋律錯音辨識'],
    repertoire:['古典舞曲','抒情曲與流行伴奏']
  }},
  5:{name:'Level 5',summary:'中級核心：速度、平衡、和聲理解、視奏與聽力全面提升。',items:{
    notes:['多聲部閱讀','裝飾音入門'],
    rhythm:['複合拍子','複雜切分','速度變化'],
    technique:['快速音階','重複音','聲部控制'],
    scales:['常用大/小調兩個八度以上','反向/半音階入門'],
    chords:['屬七和弦','和聲進行分析'],
    sight:['限時視奏','多聲部簡譜'],
    ear:['音程辨認','節奏/旋律複述'],
    repertoire:['巴洛克/古典/浪漫/現代各類作品']
  }},
  6:{name:'Level 6',summary:'進階技巧、風格理解與更高速度的音階、琶音及視奏。',items:{
    notes:['多譜號與複雜織體','裝飾記號'],
    rhythm:['不規則重音','複合節奏層次'],
    technique:['八度技巧入門','快速琶音','旋律與伴奏分層'],
    scales:['更多調性與半音階','琶音轉位'],
    chords:['擴展和弦','和聲功能'],
    sight:['調性變化視奏','快速掃譜'],
    ear:['和弦性質','終止式辨識'],
    repertoire:['較完整奏鳴曲樂章','印象派/近現代入門']
  }},
  7:{name:'Level 7',summary:'高階控制：速度、音色、複雜和聲、風格與舞台完整度。',items:{
    notes:['高密度譜面閱讀','多聲部獨立'],
    rhythm:['跨拍型態','多層節奏'],
    technique:['快速八度','大跳','細緻音色控制'],
    scales:['全調性音階/琶音深化','三度/六度概念'],
    chords:['調性轉換','擴張和聲'],
    sight:['高難度即時視奏','風格辨識'],
    ear:['複雜音程/和弦','旋律與低音追蹤'],
    repertoire:['大型作品節選','完整舞台演奏訓練']
  }},
  8:{name:'Level 8',summary:'高級演奏準備：完整技巧、音樂詮釋、快速視奏與自主練習能力。',items:{
    notes:['複雜總譜式閱讀','高密度和聲'],
    rhythm:['自由速度與精準脈動並存','複雜節拍'],
    technique:['高速度音階琶音','八度/和弦/大跳綜合技巧'],
    scales:['全調性綜合技術','快速音階與琶音'],
    chords:['進階和聲與轉調','伴奏即興基礎'],
    sight:['高階限時視奏','快速抓結構'],
    ear:['和聲/節奏/旋律整合聽辨'],
    repertoire:['高級曲目','完整演奏與錄音檢討']
  }}
};

const categoryNames={
  notes:'識譜',rhythm:'節奏',technique:'技巧',scales:'音階・琶音',
  chords:'和弦・和聲',sight:'視奏',ear:'聽力',repertoire:'曲目・演奏'
};

function renderCurriculum(){
  const level=$('levelFilter').value;
  const cat=$('categoryFilter').value;
  const data=curriculum[level];
  $('curriculumSummary').innerHTML=`<b>${data.name}</b>　${data.summary}`;
  const root=$('curriculumGrid'); root.innerHTML='';
  Object.entries(data.items).forEach(([key,skills],idx)=>{
    if(cat!=='all' && cat!==key) return;
    const card=document.createElement('button');
    card.type='button'; card.className='course-card curriculum-card';
    const demoSongs=['twinkle','ode','mary','scale','canon','sight'];
    card.dataset.song=demoSongs[idx%demoSongs.length];
    card.innerHTML=`<span class="course-icon">${['𝄞','♩','✋','↗','♬','👀','👂','♫'][idx]}</span>
      <b>${categoryNames[key]}</b>
      <small>${data.name}</small>
      <span class="course-category">${categoryNames[key]}</span>
      <ul class="skill-list">${skills.map(s=>`<li>${s}</li>`).join('')}</ul>`;
    card.addEventListener('click',()=>openPractice(card.dataset.song,'LEARN'));
    root.appendChild(card);
  });
}

let state = {
  song:'twinkle',running:false,paused:false,startAt:0,pauseStart:0,pauseTotal:0,
  speed:1,mode:'play',hand:'right',micStream:null,audioCtx:null,analyser:null,
  audioRaf:0,gameRaf:0,metroOn:false,metroTimer:null,assistTimer:null,assistBeat:0,
  judged:new Set(),goodStreak:0,tempoBpm:null,tempoManual:false,lastMasterBeat:-1,
  performanceLog:[],lastCapturedAt:0,currentTargetIndex:-1,eventTimeline:[],countInBeats:0,loopMeasure:false,demoSoundOn:false,pianoBuffers:new Map(),pianoLoading:false,pianoReady:false,demoPlayed:new Set(),demoVolume:0.45,pianoVoices:new Set()
};

function showView(name){
  $('homeView').classList.toggle('active',name==='home');
  $('practiceView').classList.toggle('active',name==='practice');
}

document.querySelectorAll('.tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    $(btn.dataset.tab+'Panel').classList.add('active');
  });
});

function renderSongList(level='all'){
  const root=$('songList'); root.innerHTML='';
  let rows=library;
  if(level!=='all') rows=rows.filter(x=>String(x[2]).toLowerCase()===String(level).toLowerCase());
  rows.forEach(([id,title,lvl,duration,category])=>{
    const s=songs[id];
    if(!s)return;
    const b=document.createElement('button');
    b.className='song-row'; b.type='button';
    b.innerHTML=`<span><strong>${title}</strong><small>${s.bpm} BPM · ${(s.timeSig||[4,4]).join('/')} · ${s.categoryLabel||categoryNames?.[category]||'曲目'}</small></span><span class="level">${lvl}</span><span class="duration">${duration}</span>`;
    b.addEventListener('click',()=>openPractice(id,'PLAY'));
    root.appendChild(b);
  });
}
renderSongList();
$('levelFilter').addEventListener('change',renderCurriculum);
$('categoryFilter').addEventListener('change',renderCurriculum);
renderCurriculum();


document.querySelectorAll('.filter').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); renderSongList(btn.dataset.level);
  });
});
$('quickStart').addEventListener('click',()=>openPractice('sight','5 MIN'));
$('chooseScoreBtn').addEventListener('click',()=>$('scoreFileInput').click());
$('scoreFileInput').addEventListener('change',async()=>{
  const file=$('scoreFileInput').files?.[0]; if(!file)return;
  const status=$('importStatus');status.className='import-status';status.textContent='正在解析 '+file.name+'…';
  try{
    const result=await importScoreFile(file);
    status.className='import-status success';status.textContent=result.message+'。已加入歌曲庫。';
  }catch(err){
    console.error(err);status.className='import-status error';status.textContent='匯入失敗：'+(err?.message||'未知錯誤');
  }finally{$('scoreFileInput').value=''}
});
$('clearImportedBtn').addEventListener('click',()=>{
  Object.keys(songs).forEach(id=>{if(songs[id]?.imported)delete songs[id]});
  try{localStorage.removeItem(IMPORT_STORAGE_KEY)}catch(e){}
  rebuildImportedLibrary();renderSongList();
  const status=$('importStatus');status.className='import-status';status.textContent='已清除瀏覽器內已匯入的樂譜。';
});


function openPractice(songId,label='PLAY'){
  state.song=songId; state.running=false; state.paused=false; state.pauseTotal=0; state.judged=new Set(); state.goodStreak=0;
  state.performanceLog=[]; state.lastCapturedAt=0; state.currentTargetIndex=-1; state.demoPlayed=new Set();
  state.tempoManual=false; state.tempoBpm=songs[songId].bpm; state.speed=1; state.lastMasterBeat=-1;
  $('tempoInput').value=state.tempoBpm;
  $('speedSelect').value='1';
  $('practiceTitle').textContent=songs[songId].title;
  $('timeSignature').textContent=songs[songId].timeSig.join('/');
  $('keySignature').textContent=songs[songId].key;
  state.countInBeats=0; state.loopMeasure=false;
  buildEventTimeline();
  $('countInSelect').value='0';
  $('measureLoopSelect').value='off';
  $('recordDrawer').hidden=true;
  $('recordBtn').classList.remove('active');
  $('practiceModeLabel').textContent=label;
  showView('practice');
  renderStaticScore();
  enterReadyState();
}


function fmtTime(sec){
  sec=Math.max(0,Math.floor(sec||0));
  return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
}
function enterReadyState(){
  state.running=false; state.paused=false; state.pauseTotal=0; state.lastMasterBeat=-1;
  $('prepareBanner').classList.remove('running');
  $('topProgressBar').style.width='0%';
  $('transportTime').textContent='00:00';
  $('transportStatus').textContent='準備中';
  renderStaticScore();
  $('playBtn').classList.remove('active');
  $('pauseTransportBtn').classList.remove('active');
  if(state.metroOn) stopMetronome(false);
  hideAssist();
}
function playFromCurrent(){
  if(!state.running){
    startPractice();
  }else if(state.paused){
    state.pauseTotal+=performance.now()-state.pauseStart;
    state.paused=false;
    $('pauseTransportBtn').classList.remove('active');
    $('playBtn').classList.add('active');
  }
  $('prepareBanner').classList.add('running');
  $('transportStatus').textContent='播放中';
}
function pausePractice(){
  if(!state.running || state.paused) return;
  state.paused=true;
  state.pauseStart=performance.now();
  $('pauseTransportBtn').classList.add('active');
  $('playBtn').classList.remove('active');
  stopAllPianoVoices();
  $('transportStatus').textContent='暫停';
}
function seekTo(sec){
  sec=Math.max(0,Math.min(effectiveDuration(),sec));
  const now=performance.now();
  state.startAt=now-sec*1000;
  state.pauseTotal=0;
  if(state.paused) state.pauseStart=now;
  state.lastMasterBeat=-1;
  state.demoPlayed=new Set();
  state.judged=new Set([...state.judged].filter(i=>noteTime(i)<sec));
  renderStaticScore();
}
function rewindMeasure(){
  if(!state.running){
    enterReadyState();
    return;
  }
  const current=elapsed();
  const measure=beatSeconds()*songs[state.song].timeSig[0];
  seekTo(Math.max(0,current-measure));
  $('transportStatus').textContent=state.paused?'暫停':'播放中';
}
function renderRecordDrawer(){
  const log=state.performanceLog||[];
  const exact=log.filter(x=>x.pitchCorrect&&x.rhythmCorrect).length;
  const pitch=log.filter(x=>x.pitchCorrect).length;
  const rhythm=log.filter(x=>x.rhythmCorrect).length;
  $('recordSummary').textContent=log.length
    ? `共 ${log.length} 筆｜音高正確 ${Math.round(pitch/log.length*100)}%｜節拍正確 ${Math.round(rhythm/log.length*100)}%｜完全吻合 ${Math.round(exact/log.length*100)}%`
    : '尚未有彈奏紀錄。';
  const root=$('recordList'); root.innerHTML='';
  log.slice(-40).reverse().forEach(x=>{
    const row=document.createElement('div'); row.className='record-row';
    const exactOk=x.pitchCorrect&&x.rhythmCorrect;
    row.innerHTML=`<b>#${x.index+1}</b><span>譜 ${x.expectedNote||'—'} → 彈 ${x.playedNote||'—'}</span>
      <span class="${exactOk?'ok':'bad'}">${exactOk?'吻合':'需練習'}</span>
      <span>${x.timingErrorMs==null?'MISS':(x.timingErrorMs>0?'+':'')+x.timingErrorMs+' ms'}｜${x.durationBeats||1}拍</span>`;
    root.appendChild(row);
  });
}
$('readyPlayBtn').addEventListener('click',playFromCurrent);
$('playBtn').addEventListener('click',playFromCurrent);
$('pauseTransportBtn').addEventListener('click',pausePractice);
$('rewindBtn').addEventListener('click',rewindMeasure);
$('recordBtn').addEventListener('click',()=>{
  renderRecordDrawer();
  $('recordDrawer').hidden=!$('recordDrawer').hidden;
  $('recordBtn').classList.toggle('active',!$('recordDrawer').hidden);
});
$('closeRecordBtn').addEventListener('click',()=>{
  $('recordDrawer').hidden=true;
  $('recordBtn').classList.remove('active');
});

$('backBtn').addEventListener('click',()=>{
  stopPractice(); showView('home');
});
$('pauseBtn').addEventListener('click',pausePractice);

$('speedSelect').addEventListener('change',()=>{
  state.speed=parseFloat($('speedSelect').value)||1;
  // Speed presets directly change the master BPM.
  state.tempoManual=false;
  state.tempoBpm=Math.max(30,Math.round(songs[state.song].bpm*state.speed));
  $('tempoInput').value=state.tempoBpm;
  renderStaticScore();
  if(state.running) restartPractice();
});
$('practiceMode').addEventListener('change',()=>{state.mode=$('practiceMode').value;});
$('handSelect').addEventListener('change',()=>{state.hand=$('handSelect').value;});
$('countInSelect').addEventListener('change',()=>{
  const measures=parseInt($('countInSelect').value)||0;
  state.countInBeats=measures*songs[state.song].timeSig[0];
  buildEventTimeline();
  renderStaticScore();
  if(state.running) restartPractice();
});
$('measureLoopSelect').addEventListener('change',()=>{
  state.loopMeasure=$('measureLoopSelect').value==='current';
});

$('micBtn').addEventListener('click',startMicrophone);
$('metroBtn').addEventListener('click',()=>{
  state.metroOn=!state.metroOn;
  $('metroBtn').textContent='節拍器：'+(state.metroOn?'開':'關');
  if(state.metroOn && state.running && !state.paused) startMetronome(); else stopMetronome(false);
});

function setTempo(v,manual=true){
  const bpm=Math.max(30,Math.min(240,Math.round(Number(v)||songs[state.song].bpm)));
  state.tempoBpm=bpm;
  state.tempoManual=manual;
  $('tempoInput').value=bpm;

  // Keep speed selector approximately reflecting the chosen master tempo.
  const ratio=bpm/songs[state.song].bpm;
  if(Math.abs(ratio-.5)<.03) $('speedSelect').value='0.5';
  else if(Math.abs(ratio-.75)<.03) $('speedSelect').value='0.75';
  else if(Math.abs(ratio-1)<.03) $('speedSelect').value='1';

  renderStaticScore();
  if(state.running) restartPractice();
  if(!$('rhythmAssist').hidden) $('assistBpm').textContent=effectiveBpm()+' BPM';
}
$('tempoInput').addEventListener('change',()=>setTempo($('tempoInput').value,true));
$('tempoMinus').addEventListener('click',()=>setTempo((state.tempoBpm||songs[state.song].bpm)-1,true));
$('tempoPlus').addEventListener('click',()=>setTempo((state.tempoBpm||songs[state.song].bpm)+1,true));
$('tempoReset').addEventListener('click',()=>{ $('speedSelect').value='1'; state.speed=1; setTempo(songs[state.song].bpm,false); });


const LOCAL_PIANO_SAMPLES = [
  ['A0',21],['C1',24],['D#1',27],['F#1',30],
  ['A1',33],['C2',36],['D#2',39],['F#2',42],
  ['A2',45],['C3',48],['D#3',51],['F#3',54],
  ['A3',57],['C4',60],['D#4',63],['F#4',66],
  ['A4',69],['C5',72],['D#5',75],['F#5',78],
  ['A5',81],['C6',84],['D#6',87],['F#6',90],
  ['A6',93],['C7',96],['D#7',99],['F#7',102],
  ['A7',105],['C8',108]
];

function setSampleStatus(text,kind=''){
  const el=$('pianoSampleStatus');
  if(!el) return;
  el.textContent=text;
  el.className='sample-status'+(kind?' '+kind:'');
}

function ensureAudioContext(){
  if(!state.audioCtx){
    const AC=window.AudioContext||window.webkitAudioContext;
    state.audioCtx=new AC();
  }
  return state.audioCtx;
}

function noteToMidi(note){
  const names={'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11};
  const m=note.match(/^([A-G]#?)(-?\d)$/);
  if(!m) return 60;
  return (Number(m[2])+1)*12+names[m[1]];
}

function sampleFileFor(noteName){
  return 'assets/piano/'+noteName.replace('#','s')+'.mp3';
}

async function loadLocalPianoSamples(){
  if(state.pianoReady) return true;
  if(state.pianoLoading) return false;

  state.pianoLoading=true;
  setSampleStatus('本地鋼琴音色：載入中…','loading');
  const ctx=ensureAudioContext();

  try{
    await ctx.resume();
    let loaded=0;

    for(const [noteName,midi] of LOCAL_PIANO_SAMPLES){
      if(state.pianoBuffers.has(midi)){ loaded++; continue; }
      const res=await fetch(sampleFileFor(noteName),{cache:'force-cache'});
      if(!res.ok) throw new Error('Sample missing: '+noteName);
      const arr=await res.arrayBuffer();
      const buffer=await ctx.decodeAudioData(arr);
      state.pianoBuffers.set(midi,buffer);
      loaded++;
      setSampleStatus(`本地鋼琴音色：${loaded}/${LOCAL_PIANO_SAMPLES.length}`,'loading');
    }

    state.pianoReady=true;
    setSampleStatus('本地鋼琴音色：已就緒','ready');
    return true;
  }catch(err){
    console.error(err);
    state.pianoReady=false;
    setSampleStatus('本地鋼琴音色：載入失敗，請確認 assets/piano 已上傳','error');
    return false;
  }finally{
    state.pianoLoading=false;
  }
}

function nearestPianoSample(targetMidi){
  let best=null,bestDist=999;
  for(const [noteName,midi] of LOCAL_PIANO_SAMPLES){
    const d=Math.abs(targetMidi-midi);
    if(d<bestDist){ best={noteName,midi}; bestDist=d; }
  }
  return best;
}

function stopAllPianoVoices(){
  for(const voice of state.pianoVoices){
    try{voice.stop()}catch(e){}
  }
  state.pianoVoices.clear();
}

function playLocalPiano(note,velocity=0.85,duration=1.1){
  if(!state.demoSoundOn || !state.pianoReady) return;
  const ctx=ensureAudioContext();
  const targetMidi=noteToMidi(note);
  const sample=nearestPianoSample(targetMidi);
  const buffer=state.pianoBuffers.get(sample.midi);
  if(!buffer) return;

  const src=ctx.createBufferSource();
  const gain=ctx.createGain();
  src.buffer=buffer;
  src.playbackRate.value=Math.pow(2,(targetMidi-sample.midi)/12);
  gain.gain.value=Math.max(0,Math.min(1,state.demoVolume))*velocity;
  src.connect(gain).connect(ctx.destination);

  const now=ctx.currentTime;
  src.start(now);
  state.pianoVoices.add(src);

  // Gentle release without cutting the sample abruptly.
  gain.gain.setValueAtTime(gain.gain.value,now+Math.max(.15,duration*.65));
  gain.gain.exponentialRampToValueAtTime(.001,now+duration);
  src.stop(now+Math.min(buffer.duration/playbackRateSafe(src.playbackRate.value),duration+.25));
  src.onended=()=>state.pianoVoices.delete(src);
}

function playbackRateSafe(v){ return Math.max(.25,Math.min(4,v||1)); }

async function toggleDemoSound(){
  const btn=$('demoSoundBtn');

  if(!state.demoSoundOn){
    btn.disabled=true;
    btn.textContent='本地鋼琴載入中…';

    const ok=await loadLocalPianoSamples();
    btn.disabled=false;

    if(!ok){
      btn.textContent='譜面鋼琴聲：關';
      return;
    }

    state.demoSoundOn=true;
    state.demoPlayed=new Set();
    btn.textContent='譜面鋼琴聲：開';
    btn.classList.add('is-on');

    // Immediate test note, so the user knows audio is working.
    playLocalPiano('C4',0.9,1.0);
  }else{
    state.demoSoundOn=false;
    btn.textContent='譜面鋼琴聲：關';
    btn.classList.remove('is-on');
    state.demoPlayed=new Set();
    stopAllPianoVoices();
  }
}

$('demoSoundBtn').addEventListener('click',toggleDemoSound);

$('demoVolume').addEventListener('input',()=>{
  state.demoVolume=Math.max(0,Math.min(1,parseFloat($('demoVolume').value)||0));
});

function playScoreSample(note){
  playLocalPiano(note,0.86,1.0);
}

function scoreBpm(){ return Math.max(30,Math.round(songs[state.song].bpm)); }

// Single master tempo for EVERYTHING:
// metronome, scrolling score, note arrival, demo piano and microphone timing.
function effectiveBpm(){
  return Math.max(30,Math.min(240,Math.round(state.tempoBpm || songs[state.song].bpm)));
}
function beatSeconds(){ return 60/effectiveBpm(); }
function leadInBeats(){ return 1 + state.countInBeats; }

// Current demo songs use one quarter-note beat per note.
// Add 2 extra beats: one count-in beat before first note and one release beat at the end.
function elapsed(){
  if(!state.running) return 0;
  const now=state.paused?state.pauseStart:performance.now();
  return Math.max(0,(now-state.startAt-state.pauseTotal)/1000);
}
function buildEventTimeline(){
  const song=songs[state.song];
  let beat=0;
  state.eventTimeline=song.events.map((ev,eventIndex)=>{
    const [note,beats]=ev;
    const item={
      eventIndex,
      note,
      beats,
      startBeat:beat,
      endBeat:beat+beats,
      startTime:(leadInBeats()+beat)*beatSeconds(),
      endTime:(leadInBeats()+beat+beats)*beatSeconds(),
      isRest:note==='REST'
    };
    beat+=beats;
    return item;
  });
}
function noteEvents(){ return state.eventTimeline.filter(e=>!e.isRest); }
function noteTime(i){
  const n=noteEvents()[i];
  return n ? n.startTime : 0;
}
function effectiveDuration(){
  const song=songs[state.song];
  return (leadInBeats() + song.totalBeats + 1) * beatSeconds();
}


const degree={C:0,D:1,E:2,F:3,G:4,A:5,B:6};
function noteY(note){
  const m=note.match(/^([A-G])#?(\d)$/); if(!m) return 120;
  const step=(+m[2])*7+degree[m[1]];
  const base=4*7+degree.E; // E4 bottom staff line
  const half=15; // px per line/space on desktop
  return 138 - (step-base)*(half/2);
}
function fingerFor(i){ return [1,2,3,4,5,4,3,2][i%8]; }

function renderStaticScore(){
  buildEventTimeline();
  const root=$('scrollingScore'); root.innerHTML='';
  const song=songs[state.song];
  const pxPerBeat=95;
  const lead=window.innerWidth<600?260:380;
  const totalWidth=lead+(leadInBeats()+song.totalBeats+4)*pxPerBeat;
  root.style.width=totalWidth+'px';
  root.dataset.lead=lead;
  root.dataset.pxPerBeat=pxPerBeat;

  // Beat guides
  const totalBeats=leadInBeats()+song.totalBeats;
  for(let b=0;b<=totalBeats;b++){
    const line=document.createElement('div');
    line.className='beat-guide'+(b%song.timeSig[0]===0?' strong':'');
    line.style.left=(lead+b*pxPerBeat)+'px';
    root.appendChild(line);
  }

  let noteIndex=0;
  state.eventTimeline.forEach(ev=>{
    const x=lead+(leadInBeats()+ev.startBeat)*pxPerBeat;
    if(ev.isRest){
      const r=document.createElement('div');
      r.className='music-rest '+durationClass(ev.beats);
      r.dataset.event=ev.eventIndex;
      r.style.left=x+'px'; r.style.top='138px';
      root.appendChild(r);
    }else{
      const n=document.createElement('div');
      n.className='music-note '+durationClass(ev.beats);
      n.dataset.i=noteIndex;
      n.dataset.event=ev.eventIndex;
      n.style.left=x+'px';
      n.style.top=noteY(ev.note)+'px';
      n.innerHTML='<span class="note-head"></span><span class="note-stem"></span><span class="note-flag"></span>';
      root.appendChild(n);

      const f=document.createElement('div');
      f.className='finger'; f.style.left=x+'px'; f.textContent=fingerFor(noteIndex);
      root.appendChild(f);
      noteIndex++;
    }

    const mark=document.createElement('div');
    mark.className='duration-mark';
    mark.style.left=x+'px';
    mark.textContent=durationLabel(ev.beats);
    root.appendChild(mark);
  });

  const bars=Math.ceil((leadInBeats()+song.totalBeats)/song.timeSig[0]);
  for(let i=1;i<=bars;i++){
    const line=document.createElement('div');
    line.className='measure-line';
    line.style.left=(lead+(leadInBeats()+i*song.timeSig[0])*pxPerBeat)+'px';
    root.appendChild(line);
  }
  // READY position: score is stationary; first note waits one beat to the right of playhead.
  const playhead=$('staffWindow').clientWidth*.22;
  root.style.transform=`translateX(${playhead-lead}px)`;
}
function durationClass(beats){
  if(beats>=4) return 'whole';
  if(beats>=2) return 'half';
  if(beats<=.5) return 'eighth';
  return 'quarter';
}
function durationLabel(beats){
  if(beats===4) return '全音符';
  if(beats===2) return '二分';
  if(beats===1.5) return '附點';
  if(beats===1) return '四分';
  if(beats===.5) return '八分';
  return beats+'拍';
}

function startPractice(){
  stopAnimationOnly();
  state.running=true; state.paused=false; state.pauseTotal=0; state.startAt=performance.now();
  $('prepareBanner').classList.add('running');
  $('playBtn').classList.add('active');
  $('pauseTransportBtn').classList.remove('active');
  state.judged=new Set(); state.goodStreak=0; state.performanceLog=[]; state.lastCapturedAt=0; state.currentTargetIndex=-1; state.demoPlayed=new Set(); state.lastMasterBeat=-1;
  $('recordCount').textContent='0'; $('playedNote').textContent='—'; $('timingDelta').textContent='—'; $('scoreNote').textContent='—';
  startMetronome();
  gameLoop();
}
function restartPractice(){
  if(!$('practiceView').classList.contains('active')) return;
  renderStaticScore();
  if(state.running) startPractice();
  else enterReadyState();
}
function stopAnimationOnly(){ if(state.gameRaf) cancelAnimationFrame(state.gameRaf); state.gameRaf=0; }
function stopPractice(){ state.running=false; state.paused=false; stopAnimationOnly(); stopMetronome(false); hideAssist(); $('playBtn')?.classList.remove('active'); $('pauseTransportBtn')?.classList.remove('active'); stopAllPianoVoices() }

function updateMasterBeat(e){
  const beatIndex=Math.floor(e/beatSeconds());

  if(beatIndex!==state.lastMasterBeat){
    state.lastMasterBeat=beatIndex;

    // Metronome click is generated from exactly the same beat index that drives score movement.
    if(state.metroOn) metroClick(beatIndex%4===0);

    // Rhythm-assist dots also follow the same master beat.
    if(!$('rhythmAssist').hidden){
      state.assistBeat=beatIndex%4;
      updateAssist();
      $('assistBpm').textContent=effectiveBpm()+' BPM';
    }
  }
}

function gameLoop(){
  if(!state.running){return}
  if(state.paused){state.gameRaf=requestAnimationFrame(gameLoop);return}
  const e=elapsed(), s=songs[state.song], root=$('scrollingScore');
  updateMasterBeat(e);
  const pxPerBeat=+root.dataset.pxPerBeat;
  const playhead=$('staffWindow').clientWidth*.22;
  const lead=+root.dataset.lead;
  const x=playhead-lead-(e/beatSeconds())*pxPerBeat;
  root.style.transform=`translateX(${x}px)`;
  $('topProgressBar').style.width=Math.min(100,e/effectiveDuration()*100)+'%';
  $('transportTime').textContent=fmtTime(e);
  if(state.demoSoundOn && state.pianoReady){
    state.eventTimeline.forEach(ev=>{
      if(ev.isRest) return;
      if(state.demoPlayed.has(ev.eventIndex)) return;
      if(e>=ev.startTime && e<ev.startTime+0.12){
        state.demoPlayed.add(ev.eventIndex);
        playScoreSample(ev.note);
      }
    });
  }


  let nearest=-1,delta=99;
  const nEvents=noteEvents();

  nEvents.forEach((ev,i)=>{
    const expected=ev.startTime;
    const d=Math.abs(e-expected);
    const el=root.querySelector(`.music-note[data-i="${i}"]`);
    if(el) el.classList.toggle('current',d<0.22);
    if(d<delta){delta=d;nearest=i}
    if(el && e-ev.endTime>0.22) el.classList.add('passed');

    if(e-expected>0.42 && !state.judged.has(i)){
      state.judged.add(i);
      logPerformance({
        index:i, expectedNote:ev.note, playedNote:null,
        expectedTime:expected, playedTime:null,
        timingErrorMs:null, pitchCorrect:false, rhythmCorrect:false,
        result:'miss',durationBeats:ev.beats
      });
      if(el) el.classList.add('timing-error');
      flash('miss'); showAssist(); state.goodStreak=0;
    }
  });

  state.currentTargetIndex=nearest;
  if(nearest>=0) $('scoreNote').textContent=nEvents[nearest].note;
  if(state.loopMeasure && state.running){
    const sig=songs[state.song].timeSig[0];
    const beatNow=Math.max(0,e/beatSeconds()-leadInBeats());
    const measureIndex=Math.max(0,Math.floor(beatNow/sig));
    const measureEnd=(leadInBeats()+(measureIndex+1)*sig)*beatSeconds();
    if(e>=measureEnd-0.03){
      const measureStart=(leadInBeats()+measureIndex*sig)*beatSeconds();
      seekTo(measureStart);
      return;
    }
  }

  if(e>=effectiveDuration()){savePracticeSummary();stopPractice();$('playBtn').classList.remove('active');$('transportTime').textContent=fmtTime(effectiveDuration());$('transportStatus').textContent='完成';return}
  state.gameRaf=requestAnimationFrame(gameLoop);
}

function flash(kind){
  const t=$('feedbackTint');
  t.className='feedback-tint '+kind+' show';
  clearTimeout(t._timer);
  t._timer=setTimeout(()=>t.className='feedback-tint',180);
}
function showAssist(){
  const r=$('rhythmAssist');
  r.hidden=false;
  $('assistBpm').textContent=effectiveBpm()+' BPM';
  state.assistBeat=Math.floor(elapsed()/beatSeconds())%4;
  updateAssist();
}
function hideAssist(){
  $('rhythmAssist').hidden=true;
  state.assistTimer=null;
}
function updateAssist(){
  document.querySelectorAll('#rhythmAssist span').forEach((x,i)=>x.classList.toggle('active',i===state.assistBeat));
}

async function startMicrophone(){
  try{
    if(state.micStream) state.micStream.getTracks().forEach(t=>t.stop());
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    state.micStream=stream;
    const AC=window.AudioContext||window.webkitAudioContext;
    const ctx=ensureAudioContext(); state.audioCtx=ctx; await ctx.resume();
    const analyser=ctx.createAnalyser(); analyser.fftSize=4096; analyser.smoothingTimeConstant=.05;
    ctx.createMediaStreamSource(stream).connect(analyser); state.analyser=analyser;
    $('micBtn').textContent='麥克風已連線';
    micLoop();
  }catch(e){
    $('micBtn').textContent='麥克風未授權';
  }
}
function micLoop(){
  if(!state.analyser||!state.audioCtx) return;
  const buf=new Float32Array(state.analyser.fftSize);
  state.analyser.getFloatTimeDomainData(buf);
  let rms=0; for(const v of buf) rms+=v*v; rms=Math.sqrt(rms/buf.length);
  if(rms>.012){
    const hz=autoCorrelate(buf,state.audioCtx.sampleRate);
    if(hz>55&&hz<1800){
      const note=midiToNote(Math.round(69+12*Math.log2(hz/440)));
      $('heardNote').textContent=note;
      judgeInput(note);
    }
  }
  state.audioRaf=requestAnimationFrame(micLoop);
}

function logPerformance(entry){
  state.performanceLog.push({
    songId:state.song,
    songTitle:songs[state.song].title,
    bpm:songs[state.song].bpm,
    metronomeBpm:effectiveBpm(),
    speed:state.speed,
    hand:state.hand,
    mode:state.mode,
    ...entry
  });
  $('recordCount').textContent=state.performanceLog.length;
}
function savePracticeSummary(){
  const completed=state.performanceLog.length;
  const pitchOk=state.performanceLog.filter(x=>x.pitchCorrect).length;
  const rhythmOk=state.performanceLog.filter(x=>x.rhythmCorrect).length;
  const exact=state.performanceLog.filter(x=>x.pitchCorrect&&x.rhythmCorrect).length;
  const summary={
    date:new Date().toISOString(),
    songId:state.song,
    songTitle:songs[state.song].title,
    scoreBpm:songs[state.song].bpm,
    metronomeBpm:effectiveBpm(),
    speed:state.speed,
    totalRecords:completed,
    pitchAccuracy:completed?Math.round(pitchOk/completed*100):0,
    rhythmAccuracy:completed?Math.round(rhythmOk/completed*100):0,
    exactAccuracy:completed?Math.round(exact/completed*100):0,
    events:state.performanceLog
  };
  try{
    const key='pianoLearningPracticeHistory';
    const old=JSON.parse(localStorage.getItem(key)||'[]');
    old.push(summary);
    localStorage.setItem(key,JSON.stringify(old.slice(-100)));
  }catch(e){}
}
function judgeInput(note){
  if(!state.running||state.paused) return;
  const now=performance.now();
  if(now-state.lastCapturedAt<90) return; // avoid duplicate frames from one keystroke
  state.lastCapturedAt=now;

  const s=songs[state.song], e=elapsed();
  const nEvents=noteEvents();
  let best=-1,bestDelta=999;
  nEvents.forEach((ev,i)=>{
    if(state.judged.has(i)) return;
    const d=Math.abs(e-ev.startTime);
    if(d<bestDelta){bestDelta=d;best=i}
  });
  if(best<0) return;

  const targetEvent=nEvents[best];
  const expected=targetEvent.note;
  const expectedTime=targetEvent.startTime;
  const timingError=e-expectedTime;
  const timingErrorMs=Math.round(timingError*1000);
  const pitchCorrect=note===expected;
  // rhythm window: ±180 ms. Exact score matching requires BOTH pitch and timing.
  const rhythmCorrect=Math.abs(timingError)<=0.18;

  $('scoreNote').textContent=expected;
  $('playedNote').textContent=note;
  $('timingDelta').textContent=(timingErrorMs>0?'+':'')+timingErrorMs+' ms';

  const el=$('scrollingScore').querySelector(`.music-note[data-i="${best}"]`);

  if(Math.abs(timingError)<=0.42){
    state.judged.add(best);
    logPerformance({
      index:best,
      expectedNote:expected,
      playedNote:note,
      expectedTime:+expectedTime.toFixed(3),
      playedTime:+e.toFixed(3),
      timingErrorMs,
      pitchCorrect,
      rhythmCorrect,
      result:(pitchCorrect&&rhythmCorrect)?'exact':pitchCorrect?'timing_error':'pitch_error',
      durationBeats:targetEvent.beats
    });

    if(pitchCorrect && rhythmCorrect){
      if(el) el.classList.add('matched');
      flash('ok'); state.goodStreak++;
      if(state.goodStreak>=4) hideAssist();
    }else if(pitchCorrect){
      if(el) el.classList.add('timing-error');
      flash(timingError<0?'early':'late'); showAssist(); state.goodStreak=0;
    }else{
      if(el) el.classList.add('pitch-error');
      // Wrong pitch: keep feedback quiet; only color the note / background lightly.
      flash('early'); state.goodStreak=0;
    }
  }
}

function midiToNote(m){
  const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  return names[(m%12+12)%12]+(Math.floor(m/12)-1);
}
function autoCorrelate(buffer,sampleRate){
  const size=buffer.length;let rms=0;
  for(let i=0;i<size;i++)rms+=buffer[i]*buffer[i];
  rms=Math.sqrt(rms/size); if(rms<.01)return-1;
  let r1=0,r2=size-1,th=.18;
  for(let i=0;i<size/2;i++){if(Math.abs(buffer[i])<th){r1=i;break}}
  for(let i=1;i<size/2;i++){if(Math.abs(buffer[size-i])<th){r2=size-i;break}}
  const b=buffer.slice(r1,r2),n=b.length,c=new Array(n).fill(0);
  for(let lag=0;lag<n;lag++){let sum=0;for(let i=0;i<n-lag;i++)sum+=b[i]*b[i+lag];c[lag]=sum}
  let d=0;while(d+1<n&&c[d]>c[d+1])d++;
  let max=-1,pos=-1;for(let i=d;i<n;i++){if(c[i]>max){max=c[i];pos=i}}
  return pos>0?sampleRate/pos:-1;
}

function metroClick(accent){
  if(!state.audioCtx) state.audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  const ctx=state.audioCtx, osc=ctx.createOscillator(), gain=ctx.createGain();
  osc.frequency.value=accent?1100:820;
  gain.gain.setValueAtTime(.0001,ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.12,ctx.currentTime+.005);
  gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.06);
  osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+.07);
}
function startMetronome(){
  // No independent setInterval. The game loop drives beats from the same master clock.
  state.lastMasterBeat=-1;
}
function stopMetronome(update=true){
  state.lastMasterBeat=-1;
  if(update){
    state.metroOn=false;
    $('metroBtn').textContent='節拍器：關';
  }
}

window.addEventListener('resize',()=>{ if($('practiceView').classList.contains('active')) renderStaticScore(); });
