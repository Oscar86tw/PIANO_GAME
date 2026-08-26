
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


// ---------- V2.9: 216 built-in pedagogical scores ----------
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


// ---------- V2.9: full-length repertoire collections ----------
function buildFullPiecePattern(range,variant,bars=20,timeSig=[4,4],style='lyrical'){
  const beatsPerBar=timeSig[0];
  const events=[];
  const motifs={
    lyrical:[0,2,4,3,2,1,0,1,2,4,5,4,2,1],
    classical:[0,1,2,4,3,2,1,0,2,3,5,4,3,1],
    exam:[0,2,1,3,2,4,3,1,0,3,5,2,4,1],
    fashion:[0,4,2,5,3,1,4,2,6,4,1,3,5,2],
    cinematic:[0,2,5,4,2,6,5,3,1,4,7,5,2,0,3,6],
    school:[0,1,2,1,0,2,3,2,1,3,4,2,0,1]
  };
  const motif=motifs[style]||motifs.lyrical;
  let beatInBar=0;
  const totalBeats=bars*beatsPerBar;
  let used=0,i=0;
  while(used<totalBeats-.001){
    let dur;
    if(style==='fashion') dur=[.5,.5,1,1,1.5,.5][(i+variant)%6];
    else if(style==='exam') dur=[.5,1,.5,1,1,1][(i+variant)%6];
    else if(style==='cinematic') dur=[.5,1,.5,1.5,1,2,.5,.5][(i+variant)%8];
    else if(style==='school') dur=[1,1,.5,.5,1,2][(i+variant)%6];
    else dur=[1,1,1,1,2][(i+variant)%5];
    if(used+dur>totalBeats) dur=totalBeats-used;
    if(beatInBar+dur>beatsPerBar) dur=beatsPerBar-beatInBar;
    if(dur<=0){beatInBar=0;continue;}
    if(i%17===16 && style!=='classical') events.push(['REST',dur]);
    else {
      const shift=Math.floor(i/motif.length)%Math.max(1,range.length-6);
      const ni=Math.max(0,Math.min(range.length-1,motif[(i+variant)%motif.length]+shift));
      events.push([range[ni],dur]);
    }
    used+=dur; beatInBar+=dur; i++;
    if(Math.abs(beatInBar-beatsPerBar)<.001) beatInBar=0;
  }
  return events;
}

const FULL_REPERTOIRE_DEFS=[
  // Public-domain themed learning arrangements; not claimed as urtext editions.
  ['classic','Für Elise｜公版主題學習編曲','5',92,[3,4],'A minor','classical'],
  ['classic','Ode to Joy｜完整學習編曲','2',96,[4,4],'C Major','classical'],
  ['classic','Canon in D｜完整學習編曲','4',80,[4,4],'D Major','lyrical'],
  ['classic','Minuet in G｜完整學習編曲','3',104,[3,4],'G Major','classical'],
  ['classic','Bach Prelude Style｜公版風格學習曲','5',84,[4,4],'C Major','classical'],
  ['classic','Mozart Sonata Style｜公版風格學習曲','6',112,[4,4],'C Major','classical'],
  ['classic','Beethoven Sonatina Style｜公版風格學習曲','4',108,[4,4],'G Major','classical'],
  ['classic','Schumann Album Style｜公版風格學習曲','4',88,[3,4],'C Major','lyrical'],
  ['classic','Tchaikovsky Album Style｜公版風格學習曲','5',92,[4,4],'G Major','lyrical'],
  ['classic','Burgmüller Study Style｜公版風格學習曲','5',116,[4,4],'C Major','exam'],
  ['classic','Clementi Sonatina Style｜公版風格學習曲','6',120,[4,4],'C Major','classical'],
  ['classic','Romantic Nocturne Style｜公版風格學習曲','7',72,[6,8],'E minor','lyrical'],

  ['exam','Exam Piece 01｜Prep','prep',68,[4,4],'C Major','exam'],
  ['exam','Exam Piece 02｜Level 1','1',72,[4,4],'C Major','exam'],
  ['exam','Exam Piece 03｜Level 2','2',80,[3,4],'G Major','exam'],
  ['exam','Exam Piece 04｜Level 3','3',84,[4,4],'F Major','exam'],
  ['exam','Exam Piece 05｜Level 4','4',92,[4,4],'D Major','exam'],
  ['exam','Exam Piece 06｜Level 5','5',100,[3,4],'A minor','exam'],
  ['exam','Exam Piece 07｜Level 6','6',108,[4,4],'E minor','exam'],
  ['exam','Exam Piece 08｜Level 7','7',112,[6,8],'G Major','exam'],
  ['exam','Exam Piece 09｜Level 8','8',120,[4,4],'D Major','exam'],
  ['exam','Sight Test Concert Piece｜Level 4','4',88,[4,4],'C Major','exam'],
  ['exam','Technique Concert Study｜Level 6','6',116,[4,4],'A minor','exam'],
  ['exam','Aural Response Piece｜Level 3','3',76,[3,4],'F Major','lyrical'],

  ['fashion','City Lights','2',92,[4,4],'C Major','fashion'],
  ['fashion','Midnight Café','3',84,[4,4],'A minor','fashion'],
  ['fashion','Cloudy Weekend','2',76,[4,4],'F Major','lyrical'],
  ['fashion','Neon Steps','4',108,[4,4],'D minor','fashion'],
  ['fashion','Summer Polaroid','3',100,[4,4],'G Major','fashion'],
  ['fashion','Moonlight Window','4',72,[6,8],'E minor','lyrical'],
  ['fashion','After School','1',88,[4,4],'C Major','fashion'],
  ['fashion','Coffee and Rain','5',82,[4,4],'A minor','lyrical'],
  ['fashion','Weekend Drive','5',110,[4,4],'D Major','fashion'],
  ['fashion','Soft Focus','6',78,[6,8],'B minor','lyrical'],
  ['fashion','Blue Sneakers','3',104,[4,4],'G Major','fashion'],
  ['fashion','Last Train Home','7',96,[4,4],'E minor','fashion'],

  // Original full-length cinematic piano pieces.
  ['movie','The Last Lantern｜最後的燈火','2',76,[4,4],'C Major','cinematic'],
  ['movie','Castle Beyond the Clouds｜雲端城堡','3',88,[6,8],'G Major','cinematic'],
  ['movie','Midnight Detective｜午夜偵探','4',96,[4,4],'A minor','cinematic'],
  ['movie','Starlight Voyage｜星光航行','4',84,[4,4],'D Major','cinematic'],
  ['movie','The Hidden Door｜隱藏之門','3',78,[3,4],'E minor','cinematic'],
  ['movie','Hero at Dawn｜黎明英雄','5',108,[4,4],'D Major','cinematic'],
  ['movie','Rain on the Silver Screen｜銀幕之雨','4',72,[6,8],'A minor','lyrical'],
  ['movie','Forest of Magic｜魔法森林','2',90,[3,4],'F Major','cinematic'],
  ['movie','Chasing the Horizon｜追逐地平線','5',116,[4,4],'G Major','cinematic'],
  ['movie','A Letter Never Sent｜未寄出的信','3',70,[4,4],'C Major','lyrical'],
  ['movie','The Clockwork City｜發條城市','6',112,[4,4],'E minor','cinematic'],
  ['movie','Ocean Between Us｜我們之間的海','4',80,[6,8],'D minor','lyrical'],
  ['movie','Fireflies in Winter｜冬夜螢火','3',74,[3,4],'G Major','cinematic'],
  ['movie','Beyond the Moon Gate｜月門之外','5',92,[4,4],'B minor','cinematic'],
  ['movie','Run Through the Stars｜奔向星辰','6',120,[4,4],'D Major','cinematic'],
  ['movie','The Quiet Kingdom｜寂靜王國','4',68,[4,4],'F Major','lyrical'],
  ['movie','Shadow Train｜暗影列車','6',104,[4,4],'A minor','cinematic'],
  ['movie','Dreams of the Sky Whale｜天空鯨之夢','3',82,[6,8],'C Major','cinematic'],
  ['movie','The Final Map｜最後的地圖','5',98,[4,4],'E minor','cinematic'],
  ['movie','Before the Snow Falls｜雪落之前','4',72,[3,4],'D Major','lyrical'],
  ['movie','City of Glass｜玻璃之城','7',110,[4,4],'F# minor','cinematic'],
  ['movie','Into the Blue Planet｜進入藍色星球','6',86,[6,8],'E Major','cinematic'],
  ['movie','The Forgotten Crown｜被遺忘的王冠','7',100,[4,4],'D minor','cinematic'],
  ['movie','End Credits: Home｜片尾：回家','5',78,[4,4],'G Major','lyrical'],

  // School curriculum library — public-domain/traditional + original school studies.
  ['school','Twinkle, Twinkle, Little Star｜小星星','prep',80,[4,4],'C Major','school'],
  ['school','Mary Had a Little Lamb｜瑪莉有隻小綿羊','prep',84,[4,4],'C Major','school'],
  ['school','Frère Jacques｜兩隻老虎／雅克兄弟','prep',88,[4,4],'C Major','school'],
  ['school','Hot Cross Buns｜熱十字麵包','prep',76,[4,4],'C Major','school'],
  ['school','Lightly Row｜輕輕划','1',84,[4,4],'C Major','school'],
  ['school','London Bridge｜倫敦鐵橋','1',88,[4,4],'C Major','school'],
  ['school','Ode to Joy｜歡樂頌','1',92,[4,4],'C Major','school'],
  ['school','Jingle Bells｜鈴兒響叮噹','1',96,[4,4],'C Major','school'],
  ['school','When the Saints Go Marching In｜聖者進行曲','2',96,[4,4],'C Major','school'],
  ['school','Amazing Grace｜奇異恩典','2',72,[3,4],'G Major','school'],
  ['school','Aura Lee｜奧拉麗','2',76,[4,4],'C Major','school'],
  ['school','Old MacDonald Had a Farm｜老麥克唐納','2',92,[4,4],'C Major','school'],
  ['school','School Bells｜上課鐘聲練習曲','2',88,[4,4],'F Major','school'],
  ['school','Morning Assembly｜晨會進行曲','2',100,[4,4],'C Major','school'],
  ['school','Skipping Rhythm｜跳繩節奏曲','2',104,[4,4],'G Major','school'],
  ['school','Classroom Waltz｜教室圓舞曲','3',84,[3,4],'F Major','school'],
  ['school','The Music Box｜音樂盒','3',88,[3,4],'C Major','school'],
  ['school','Rainy Recess｜下雨的下課時間','3',92,[4,4],'A minor','school'],
  ['school','March of the Pencils｜鉛筆進行曲','3',104,[4,4],'G Major','school'],
  ['school','Scale Steps in C｜C大調音階小品','3',92,[4,4],'C Major','school'],
  ['school','Scale Steps in G｜G大調音階小品','3',96,[4,4],'G Major','school'],
  ['school','First Left-Hand Waltz｜第一首左手圓舞曲','3',82,[3,4],'C Major','school'],
  ['school','Two-Hand Conversation｜雙手對話','4',92,[4,4],'G Major','school'],
  ['school','Dotted Rhythm Study｜附點節奏練習曲','4',88,[4,4],'F Major','school'],
  ['school','Eighth-Note Train｜八分音符列車','4',108,[4,4],'C Major','school'],
  ['school','Minor Mood｜小調心情','4',80,[4,4],'A minor','school'],
  ['school','Broken-Chord River｜分解和弦小河','4',90,[4,4],'C Major','school'],
  ['school','Syncopation Steps｜切分節奏腳步','4',100,[4,4],'G Major','school'],
  ['school','School Festival Waltz｜校慶圓舞曲','4',86,[3,4],'F Major','school'],
  ['school','Graduation Morning｜畢業晨光','5',78,[4,4],'C Major','lyrical'],
  ['school','Chromatic Footsteps｜半音腳步','5',92,[4,4],'A minor','school'],
  ['school','Arpeggio Garden｜琶音花園','5',96,[4,4],'G Major','school'],
  ['school','Cadence Practice in C｜C大調終止式','5',84,[4,4],'C Major','school'],
  ['school','Cadence Practice in G｜G大調終止式','5',88,[4,4],'G Major','school'],
  ['school','Simple Sonata Form｜簡易奏鳴曲式','5',104,[4,4],'C Major','school'],
  ['school','School Concert Etude｜校內音樂會練習曲','5',110,[4,4],'D Major','school'],
  ['school','Sight-Reading No. 1｜視奏一','5',92,[4,4],'C Major','exam'],
  ['school','Sight-Reading No. 2｜視奏二','5',96,[3,4],'G Major','exam'],
  ['school','Sight-Reading No. 3｜視奏三','6',100,[4,4],'F Major','exam'],
  ['school','Primary Chord Study｜I IV V 和弦練習','6',92,[4,4],'C Major','school'],
  ['school','Alberti Bass Study｜阿爾貝提低音練習','6',104,[4,4],'C Major','school'],
  ['school','Hand Independence Study｜雙手獨立練習','6',108,[4,4],'G Major','school'],
  ['school','Three-Four Accompaniment｜3/4伴奏型','6',88,[3,4],'D Major','school'],
  ['school','Six-Eight Flow｜6/8流動節奏','6',96,[6,8],'G Major','school'],
  ['school','Minor Cadence Study｜小調終止式','6',84,[4,4],'E minor','school'],
  ['school','School Recital Piece｜學校獨奏會曲','6',100,[4,4],'F Major','school'],
  ['school','Intermediate Sight-Reading A｜中階視奏A','7',104,[4,4],'D Major','exam'],
  ['school','Intermediate Sight-Reading B｜中階視奏B','7',108,[6,8],'A minor','exam'],
  ['school','Harmony Voices｜和聲聲部練習','7',92,[4,4],'G Major','school'],
  ['school','Two-Voice Invention Study｜二聲部創意練習','7',100,[4,4],'C Major','school'],
  ['school','Accompaniment Patterns｜伴奏型總整理','7',106,[4,4],'F Major','school'],
  ['school','Modulation Introduction｜轉調入門','7',96,[4,4],'G Major','school'],
  ['school','Performance Study No. 1｜演奏練習一','8',112,[4,4],'D Major','school'],
  ['school','Performance Study No. 2｜演奏練習二','8',116,[6,8],'E minor','school'],
  ['school','Advanced School Sight-Reading｜學校進階視奏','8',108,[4,4],'A Major','exam'],
  ['school','Full-Course Review Piece｜學校課程總複習曲','8',102,[4,4],'C Major','school']
];

function addFullRepertoire(){
  const ranges={
    prep:['C4','D4','E4','F4','G4'],1:['C4','D4','E4','F4','G4','A4'],2:['B3','C4','D4','E4','F4','G4','A4','B4'],
    3:['A3','B3','C4','D4','E4','F4','G4','A4','B4','C5'],4:['G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5','D5'],
    5:['F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5','D5','E5'],
    6:['E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5'],
    7:['D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5'],
    8:['C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5','A5']
  };
  FULL_REPERTOIRE_DEFS.forEach((d,i)=>{
    const [collection,title,levelKey,bpm,timeSig,key,style]=d;
    const bars=collection==='classic'?24:
      collection==='exam'?20:
      collection==='movie'?(Number(levelKey)>=6?36:32):
      collection==='school'?(levelKey==='prep'?16:(Number(levelKey)<=2?20:Number(levelKey)<=4?24:Number(levelKey)<=6?28:32)):
      24;
    const events=buildFullPiecePattern(ranges[levelKey]||ranges[4],i+1,bars,timeSig,style);
    const id=`full_${collection}_${String(i+1).padStart(2,'0')}`;
    songs[id]={title,level:`Level ${levelKey}`,levelKey,category:'repertoire',categoryLabel:'整首樂譜',collection,fullScore:true,bpm,timeSig,key,events,builtIn:true};
  });
  for(const song of Object.values(songs)){
    if(!song.events)continue;
    song.notes=song.events.filter(e=>e[0]!=='REST').map(e=>e[0]);
    song.totalBeats=song.events.reduce((s,e)=>s+Number(e[1]||0),0);
    song.duration=song.totalBeats*60/(song.bpm||90);
  }
}
addFullRepertoire();
const DISNEY_IMPORT_SLOTS=[
  'Disney Piano Song 01','Disney Piano Song 02','Disney Piano Song 03','Disney Piano Song 04',
  'Disney Piano Song 05','Disney Piano Song 06','Disney Piano Song 07','Disney Piano Song 08',
  'Disney Piano Song 09','Disney Piano Song 10','Disney Piano Song 11','Disney Piano Song 12'
];
const MOVIE_IMPORT_SLOTS=[
  'Movie Licensed Score 01','Movie Licensed Score 02','Movie Licensed Score 03','Movie Licensed Score 04',
  'Movie Licensed Score 05','Movie Licensed Score 06','Movie Licensed Score 07','Movie Licensed Score 08',
  'Movie Licensed Score 09','Movie Licensed Score 10','Movie Licensed Score 11','Movie Licensed Score 12',
  'Movie Licensed Score 13','Movie Licensed Score 14','Movie Licensed Score 15','Movie Licensed Score 16'
];
const SCHOOL_IMPORT_SLOTS=[
  '學校課本樂譜 01','學校課本樂譜 02','學校課本樂譜 03','學校課本樂譜 04',
  '學校課本樂譜 05','學校課本樂譜 06','學校課本樂譜 07','學校課本樂譜 08',
  '學校課本樂譜 09','學校課本樂譜 10','學校課本樂譜 11','學校課本樂譜 12',
  '老師指定曲 01','老師指定曲 02','老師指定曲 03','老師指定曲 04'
];

// ---------- V2.9: generated left-hand accompaniment ----------
const NOTE_TO_MIDI={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
function midiName(m){
  const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  return names[((m%12)+12)%12]+(Math.floor(m/12)-1);
}
function transposeNote(note,semitones){
  const m=String(note).match(/^([A-G]#?)(-?\d)$/); if(!m)return note;
  const midi=(Number(m[2])+1)*12+NOTE_TO_MIDI[m[1]]+semitones;
  return midiName(midi);
}
function rootForKey(key){
  const map={'C Major':'C3','G Major':'G2','D Major':'D3','A Major':'A2','E Major':'E2','F Major':'F2','Bb Major':'A#2','Imported':'C3'};
  return map[key]||'C3';
}
function buildLeftHandEvents(song){
  if(song.leftEvents?.length)return song.leftEvents;
  const sig=(song.timeSig||[4,4])[0];
  const bars=Math.max(1,Math.ceil((song.totalBeats||4)/sig));
  const tonic=rootForKey(song.key);
  const fifth=transposeNote(tonic,7);
  const third=transposeNote(tonic,4);
  const pattern=[
    [tonic,fifth],
    [transposeNote(tonic,5),transposeNote(tonic,12)],
    [transposeNote(tonic,9),third],
    [transposeNote(tonic,7),fifth]
  ];
  const out=[];
  for(let b=0;b<bars;b++){
    const pair=pattern[b%pattern.length];
    if(sig===3){
      out.push([[pair[0],pair[1]],1],[pair[0],1],[pair[1],1]);
    }else{
      out.push([[pair[0],pair[1]],1],[pair[0],1],[pair[1],1],[[pair[0],pair[1]],1]);
    }
  }
  const total=out.reduce((s,e)=>s+e[1],0);
  const target=song.totalBeats||total;
  if(total>target){
    let used=0,trim=[];
    for(const ev of out){
      if(used>=target)break;
      let d=Math.min(ev[1],target-used); if(d>0)trim.push([ev[0],d]); used+=d;
    }
    return trim;
  }
  return out;
}
for(const song of Object.values(songs)){
  if(!song.events)continue;
  song.leftEvents=buildLeftHandEvents(song);
}

let library = Object.entries(songs).map(([id,s])=>{
  const sec=Math.round(s.duration||0);
  const mm=String(Math.floor(sec/60)).padStart(2,'0');
  const ss=String(sec%60).padStart(2,'0');
  const lvl=s.levelKey==='prep'?'Prep':(s.levelKey?`Level ${s.levelKey}`:(s.level||'Beginner'));
  return [id,s.title,lvl,`${mm}:${ss}`,s.category||'repertoire',s.collection||(s.fullScore?'classic':'practice')];
});



const BUILTIN_LIBRARY_COUNT = library.length;
const IMPORT_STORAGE_KEY='pianoLearningImportedScoresV20';

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
    library.push([id,s.title,'Imported',formatDurationSeconds(s.duration),'repertoire','imported']);
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
if(songCountEl) songCountEl.textContent=`${library.length} 份內建＋Disney 匯入槽`;
  const warn=song.importWarnings||{};
  const extra=(warn.ignoredChords||warn.ignoredVoices)?`（已略過 ${warn.ignoredChords||0} 個和弦附加音、${warn.ignoredVoices||0} 個其他聲部事件）`:'';
  return {id,song,message:`已匯入：${song.title}｜${Math.round(song.bpm)} BPM｜${song.timeSig.join('/')}｜${song.events.length} 個事件 ${extra}`};
}



/* ==========================================================
   V2.9 Photo Score Import
   Photos/PDFs are persisted in IndexedDB because localStorage
   is too small for image blobs.
   ========================================================== */
const PHOTO_DB_NAME='PianoLearningPhotoScoresV29';
const PHOTO_DB_VERSION=1;
const PHOTO_STORE='photoScores';
let photoScoreRecords=[];
let photoDraftPages=[];

function openPhotoDB(){
  return new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)) return reject(new Error('這個瀏覽器不支援 IndexedDB'));
    const req=indexedDB.open(PHOTO_DB_NAME,PHOTO_DB_VERSION);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains(PHOTO_STORE)){
        const store=db.createObjectStore(PHOTO_STORE,{keyPath:'id'});
        store.createIndex('updatedAt','updatedAt');
      }
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error||new Error('無法開啟照片資料庫'));
  });
}
async function photoDbPut(record){
  const db=await openPhotoDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(PHOTO_STORE,'readwrite');
    tx.objectStore(PHOTO_STORE).put(record);
    tx.oncomplete=()=>{db.close();resolve()};
    tx.onerror=()=>{db.close();reject(tx.error)};
  });
}
async function photoDbDelete(id){
  const db=await openPhotoDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(PHOTO_STORE,'readwrite');
    tx.objectStore(PHOTO_STORE).delete(id);
    tx.oncomplete=()=>{db.close();resolve()};
    tx.onerror=()=>{db.close();reject(tx.error)};
  });
}
async function photoDbGetAll(){
  const db=await openPhotoDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(PHOTO_STORE,'readonly');
    const req=tx.objectStore(PHOTO_STORE).getAll();
    req.onsuccess=()=>{const out=req.result||[];db.close();resolve(out)};
    req.onerror=()=>{db.close();reject(req.error)};
  });
}
function photoId(){
  return 'photo_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7);
}
function humanBytes(bytes){
  bytes=Number(bytes)||0;
  if(bytes<1024) return bytes+' B';
  if(bytes<1024*1024) return (bytes/1024).toFixed(1)+' KB';
  return (bytes/1024/1024).toFixed(1)+' MB';
}
function photoLevelLabel(level){
  if(level==='prep') return 'Prep';
  if(/^[1-8]$/.test(String(level))) return 'Level '+level;
  return '未分級';
}
function photoCategoryLabel(cat){
  return ({school:'學校教材',exam:'考試',classic:'經典',movie:'電影',fashion:'時尚',disney:'迪士尼',other:'其他'})[cat]||'其他';
}
function revokePhotoDraftUrls(){
  photoDraftPages.forEach(p=>{if(p.url)URL.revokeObjectURL(p.url)});
}
function resetPhotoDraft(){
  revokePhotoDraftUrls();
  photoDraftPages=[];
  if($('photoScoreTitle')) $('photoScoreTitle').value='';
  if($('photoScoreAuthor')) $('photoScoreAuthor').value='';
  if($('photoScoreLevel')) $('photoScoreLevel').value='unknown';
  if($('photoScoreCategory')) $('photoScoreCategory').value='other';
  if($('photoScoreFull')) $('photoScoreFull').checked=true;
  renderPhotoDraft();
}
function pageBlobSize(page){return page?.blob?.size||0}
function renderPhotoDraft(){
  if(!$('photoPageList'))return;
  const root=$('photoPageList');root.innerHTML='';
  const bytes=photoDraftPages.reduce((s,p)=>s+pageBlobSize(p),0);
  $('photoDraftCount').textContent=photoDraftPages.length+' 頁';
  $('photoDraftStorage').textContent=photoDraftPages.length?humanBytes(bytes):'尚未加入照片';

  if(!photoDraftPages.length){
    root.innerHTML='<div class="photo-empty">拍照或選取圖片後，頁面會顯示在這裡。</div>';
    return;
  }
  photoDraftPages.forEach((page,index)=>{
    const card=document.createElement('div');card.className='photo-page-card';
    const preview=document.createElement('div');preview.className='photo-page-preview';
    if(page.type==='pdf'){
      preview.innerHTML='<div class="pdf-page">📄<br>掃描 PDF<br><small>保存原檔</small></div>';
    }else{
      const img=document.createElement('img');
      if(!page.url) page.url=URL.createObjectURL(page.blob);
      img.src=page.url;
      img.alt=`樂譜第 ${index+1} 頁`;
      img.style.transform=`rotate(${page.rotation||0}deg)`;
      preview.appendChild(img);
    }
    const meta=document.createElement('div');meta.className='photo-page-meta';
    meta.innerHTML=`<strong>第 ${index+1} 頁</strong><small>${page.name||'樂譜照片'} · ${humanBytes(pageBlobSize(page))}</small>`;
    const actions=document.createElement('div');actions.className='photo-page-actions';
    const specs=[
      ['←','前移',()=>movePhotoPage(index,-1)],
      ['→','後移',()=>movePhotoPage(index,1)],
      ['↻','旋轉',()=>rotatePhotoPage(index)],
      ['✂','裁白邊',()=>trimPhotoPage(index)],
      ['×','刪除',()=>removePhotoPage(index)]
    ];
    specs.forEach(([txt,label,fn])=>{
      const b=document.createElement('button');b.type='button';b.textContent=txt;b.title=label;b.addEventListener('click',fn);actions.appendChild(b);
    });
    if(page.type==='pdf') actions.querySelectorAll('button')[2].disabled=actions.querySelectorAll('button')[3].disabled=true;
    meta.appendChild(actions);
    card.append(preview,meta);root.appendChild(card);
  });
}
function movePhotoPage(index,delta){
  const next=index+delta;if(next<0||next>=photoDraftPages.length)return;
  [photoDraftPages[index],photoDraftPages[next]]=[photoDraftPages[next],photoDraftPages[index]];
  renderPhotoDraft();
}
function rotatePhotoPage(index){
  const p=photoDraftPages[index];if(!p||p.type==='pdf')return;
  p.rotation=((p.rotation||0)+90)%360;renderPhotoDraft();
}
function removePhotoPage(index){
  const [p]=photoDraftPages.splice(index,1);if(p?.url)URL.revokeObjectURL(p.url);renderPhotoDraft();
}
async function blobToImage(blob){
  const url=URL.createObjectURL(blob);
  try{
    const img=new Image();
    await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url});
    return img;
  }finally{
    // caller gets decoded Image data; URL can be revoked after load.
    URL.revokeObjectURL(url);
  }
}
async function trimWhiteBorderBlob(blob){
  const img=await blobToImage(blob);
  const maxDim=1800;
  const scale=Math.min(1,maxDim/Math.max(img.naturalWidth,img.naturalHeight));
  const w=Math.max(1,Math.round(img.naturalWidth*scale));
  const h=Math.max(1,Math.round(img.naturalHeight*scale));
  const c=document.createElement('canvas');c.width=w;c.height=h;
  const ctx=c.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(img,0,0,w,h);
  const data=ctx.getImageData(0,0,w,h).data;
  let minX=w,minY=h,maxX=-1,maxY=-1;
  const step=Math.max(1,Math.floor(Math.max(w,h)/900));
  for(let y=0;y<h;y+=step){
    for(let x=0;x<w;x+=step){
      const i=(y*w+x)*4;
      const lum=(data[i]+data[i+1]+data[i+2])/3;
      if(lum<238){
        if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;
      }
    }
  }
  if(maxX<0||maxY<0) return blob;
  const pad=Math.round(Math.min(w,h)*.025);
  minX=Math.max(0,minX-pad);minY=Math.max(0,minY-pad);
  maxX=Math.min(w-1,maxX+pad);maxY=Math.min(h-1,maxY+pad);
  const cw=maxX-minX+1,ch=maxY-minY+1;
  if(cw>w*.97&&ch>h*.97)return blob;
  const out=document.createElement('canvas');out.width=cw;out.height=ch;
  out.getContext('2d').drawImage(c,minX,minY,cw,ch,0,0,cw,ch);
  return await new Promise(res=>out.toBlob(b=>res(b||blob),'image/jpeg',.9));
}
async function trimPhotoPage(index){
  const p=photoDraftPages[index];if(!p||p.type==='pdf')return;
  $('photoImportStatus').textContent=`正在裁切第 ${index+1} 頁白邊…`;
  try{
    const newBlob=await trimWhiteBorderBlob(p.blob);
    if(p.url)URL.revokeObjectURL(p.url);
    p.blob=newBlob;p.url=null;p.name=p.name||`page-${index+1}.jpg`;
    $('photoImportStatus').textContent=`第 ${index+1} 頁已完成裁白邊。`;
  }catch(e){
    $('photoImportStatus').textContent='裁切失敗，已保留原始照片。';
  }
  renderPhotoDraft();
}
async function addPhotoFiles(fileList,type='image'){
  const files=[...(fileList||[])];if(!files.length)return;
  for(const f of files){
    if(type==='pdf'||f.type==='application/pdf'||/\.pdf$/i.test(f.name)){
      photoDraftPages.push({id:photoId(),type:'pdf',name:f.name,blob:f,rotation:0});
    }else if(f.type.startsWith('image/')){
      photoDraftPages.push({id:photoId(),type:'image',name:f.name||'score-photo.jpg',blob:f,rotation:0,url:null});
    }
  }
  if(!$('photoScoreTitle').value.trim() && files[0]?.name){
    $('photoScoreTitle').value=files[0].name.replace(/\.[^.]+$/,'');
  }
  $('photoImportStatus').textContent=`已加入 ${files.length} 個檔案；請確認頁序後存入樂譜庫。`;
  renderPhotoDraft();
}
function makePhotoPlaceholderSong(rec){
  const beats=Math.max(16,(rec.pages?.length||1)*16);
  return normalizeImportedSong({
    title:rec.title||'未命名拍照樂譜',
    bpm:90,timeSig:[4,4],key:'待 OMR',
    events:[['REST',beats]],
    imported:false,photoScore:true,photoRecordId:rec.id,
    photoPending:true,fullScore:!!rec.fullScore,
    collection:'photo',category:'repertoire',
    categoryLabel:photoCategoryLabel(rec.category),
    levelKey:rec.level==='unknown'?null:rec.level,
    sourceType:'Photo'
  });
}
function rebuildPhotoLibraryEntries(){
  // Remove old runtime photo placeholders
  Object.keys(songs).forEach(id=>{if(songs[id]?.photoScore)delete songs[id]});
  library=library.filter(row=>!String(row[0]).startsWith('photo_'));
  photoScoreRecords.forEach(rec=>{
    const id=rec.id;
    songs[id]=makePhotoPlaceholderSong(rec);
    library.push([
      id,rec.title||'未命名拍照樂譜',photoLevelLabel(rec.level),
      `${rec.pages?.length||0} 頁`,'repertoire','photo'
    ]);
  });
}
async function loadPhotoScores(){
  try{
    photoScoreRecords=(await photoDbGetAll()).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  }catch(e){
    photoScoreRecords=[];
    if($('photoImportStatus'))$('photoImportStatus').textContent='無法讀取本機拍照樂譜：'+e.message;
  }
  rebuildPhotoLibraryEntries();
  renderPhotoLibraryManager();
  if(typeof renderSongList==='function')renderSongList();
}
function photoThumbUrl(rec){
  const p=rec.pages?.find(x=>x.type==='image');
  return p?URL.createObjectURL(p.blob):null;
}
function renderPhotoLibraryManager(){
  if(!$('photoLibraryList'))return;
  $('photoLibraryCount').textContent=photoScoreRecords.length+' 首';
  const root=$('photoLibraryList');root.innerHTML='';
  if(!photoScoreRecords.length){
    root.innerHTML='<div class="photo-empty">目前還沒有拍照樂譜。</div>';return;
  }
  photoScoreRecords.forEach(rec=>{
    const row=document.createElement('div');row.className='photo-library-item';
    const first=rec.pages?.find(x=>x.type==='image');
    let thumb;
    if(first){
      thumb=document.createElement('img');thumb.className='photo-library-thumb';
      const u=URL.createObjectURL(first.blob);thumb.src=u;thumb.onload=()=>URL.revokeObjectURL(u);
    }else{
      thumb=document.createElement('div');thumb.className='photo-library-thumb pdf';thumb.textContent='PDF';
    }
    const info=document.createElement('div');info.className='photo-library-info';
    info.innerHTML=`<strong>${rec.title||'未命名拍照樂譜'}</strong>
      <span>${rec.author||'未填作者'} · ${rec.pages?.length||0} 頁 · ${photoLevelLabel(rec.level)}</span>
      <div class="photo-status-tags"><em>${photoCategoryLabel(rec.category)}</em><em class="pending">待 OMR 辨識</em>${rec.fullScore?'<em>完整曲</em>':''}</div>`;
    const actions=document.createElement('div');actions.className='photo-library-actions';
    const view=document.createElement('button');view.type='button';view.textContent='查看／編輯';
    view.addEventListener('click',()=>openPhotoEditor(rec.id));
    const del=document.createElement('button');del.type='button';del.className='danger';del.textContent='刪除';
    del.addEventListener('click',async()=>{
      if(!confirm(`刪除「${rec.title||'這份拍照樂譜'}」？`))return;
      await photoDbDelete(rec.id);await loadPhotoScores();
    });
    actions.append(view,del);row.append(thumb,info,actions);root.appendChild(row);
  });
}
async function savePhotoDraft(){
  if(!photoDraftPages.length){
    $('photoImportStatus').textContent='請先拍照或加入樂譜圖片／PDF。';return;
  }
  const title=$('photoScoreTitle').value.trim()||`拍照樂譜 ${new Date().toLocaleDateString()}`;
  const rec={
    id:photoId(),title,
    author:$('photoScoreAuthor').value.trim(),
    level:$('photoScoreLevel').value,
    category:$('photoScoreCategory').value,
    fullScore:$('photoScoreFull').checked,
    omrStatus:'pending',
    createdAt:Date.now(),updatedAt:Date.now(),
    pages:photoDraftPages.map(p=>({
      id:p.id,type:p.type,name:p.name,blob:p.blob,rotation:p.rotation||0
    }))
  };
  $('photoImportStatus').textContent='正在保存到本機樂譜庫…';
  try{
    await photoDbPut(rec);
    $('photoImportStatus').textContent=`已加入「${title}」：${rec.pages.length} 頁。目前狀態：待 OMR 辨識。`;
    resetPhotoDraft();
    await loadPhotoScores();
  }catch(e){
    $('photoImportStatus').textContent='保存失敗：'+e.message;
  }
}
async function openPhotoEditor(id){
  const rec=photoScoreRecords.find(x=>x.id===id);
  if(!rec)return;
  // Move to Import tab and load a copy into draft editor.
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab==='import'));
  document.querySelectorAll('.tab-panel').forEach(x=>x.classList.toggle('active',x.id==='importPanel'));
  revokePhotoDraftUrls();
  photoDraftPages=(rec.pages||[]).map(p=>({...p,url:null}));
  $('photoScoreTitle').value=rec.title||'';
  $('photoScoreAuthor').value=rec.author||'';
  $('photoScoreLevel').value=rec.level||'unknown';
  $('photoScoreCategory').value=rec.category||'other';
  $('photoScoreFull').checked=!!rec.fullScore;
  $('photoImportStatus').textContent=`正在查看「${rec.title}」。目前仍是待 OMR 辨識；若修改後按「加入我的樂譜庫」會另存一份。`;
  renderPhotoDraft();
  $('photoImportCard').scrollIntoView({behavior:'smooth',block:'start'});
}
function openPhotoFromLibrary(id){
  openPhotoEditor(id);
}

const PROGRESS_KEY='pianoLearningProgressV26';
const DAILY_GOAL_MINUTES=15;

function loadLearningProgress(){
  try{
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)||'{}');
  }catch(e){ return {}; }
}
let learningProgress=Object.assign({
  stars:0,
  completedLessons:[],
  completedSongs:[],
  practiceSessions:[],
  unlockedLevel:'prep'
},loadLearningProgress());

function saveLearningProgress(){
  try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(learningProgress))}catch(e){}
}
function levelOrder(){ return ['prep','1','2','3','4','5','6','7','8']; }
function levelName(k){ return k==='prep'?'預備級':`Level ${k}`; }
function todayKey(){
  const d=new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function practiceMinutesForDay(day=todayKey()){
  return learningProgress.practiceSessions
    .filter(x=>x.day===day)
    .reduce((s,x)=>s+(Number(x.minutes)||0),0);
}
function recentPracticeDays(days=7){
  const now=new Date(), set=new Set();
  for(let i=0;i<days;i++){
    const d=new Date(now); d.setDate(now.getDate()-i);
    set.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
  }
  return new Set(learningProgress.practiceSessions.map(x=>x.day).filter(x=>set.has(x))).size;
}
function lessonIdFor(level,category,index=1){ return `${level}_${category}_${index}`; }
function completedForLevel(level){
  return learningProgress.completedLessons.filter(x=>String(x).startsWith(level+'_')).length;
}
function totalForLevel(){ return 8*3; } // 8 categories x 3 lessons
function refreshUnlocks(){
  const order=levelOrder();
  let highest=0;
  for(let i=0;i<order.length;i++){
    const k=order[i];
    const pct=completedForLevel(k)/totalForLevel();
    if(pct>=.6 && i<order.length-1) highest=Math.max(highest,i+1);
  }
  learningProgress.unlockedLevel=order[highest];
  saveLearningProgress();
}
function isLevelUnlocked(k){
  const order=levelOrder();
  return order.indexOf(k)<=order.indexOf(learningProgress.unlockedLevel||'prep');
}
function awardPracticeResult(songId,summary){
  const stars = summary.exactAccuracy>=90?3:summary.exactAccuracy>=75?2:summary.exactAccuracy>=55?1:0;
  learningProgress.stars += stars;

  const s=songs[songId];
  if(s?.fullScore && summary.exactAccuracy>=70 && !learningProgress.completedSongs.includes(songId)){
    learningProgress.completedSongs.push(songId);
  }
  if(s?.levelKey && s?.category && summary.exactAccuracy>=70){
    const variant = Number(String(songId).split('_').pop()) || 1;
    const lid=lessonIdFor(s.levelKey,s.category,variant);
    if(!learningProgress.completedLessons.includes(lid)) learningProgress.completedLessons.push(lid);
  }

  const min=Math.max(1,Math.round((Number(summary.durationSeconds)||60)/60));
  learningProgress.practiceSessions.push({day:todayKey(),minutes:min,songId,stars,exact:summary.exactAccuracy});
  learningProgress.practiceSessions=learningProgress.practiceSessions.slice(-300);
  refreshUnlocks();
  saveLearningProgress();
  renderProgressPath();
}
function findNextLesson(){
  for(const level of levelOrder()){
    if(!isLevelUnlocked(level)) break;
    for(const [category] of SCORE_CATEGORIES){
      for(let v=1;v<=3;v++){
        const lid=lessonIdFor(level,category,v);
        if(!learningProgress.completedLessons.includes(lid)){
          const id=`lesson_${level}_${category}_${v}`;
          if(songs[id]) return {id,level,category,v};
        }
      }
    }
  }
  return null;
}
function renderProgressPath(){
  if(!$('levelPath')) return;
  refreshUnlocks();

  $('totalStarsValue').textContent=`${learningProgress.stars||0} ★`;
  $('completedLessonsValue').textContent=String(learningProgress.completedLessons.length);
  $('completedSongsValue').textContent=String(learningProgress.completedSongs.length);
  $('weeklyPracticeValue').textContent=`${recentPracticeDays(7)} 天`;

  const mins=practiceMinutesForDay();
  $('dailyGoalText').textContent=`${mins} / ${DAILY_GOAL_MINUTES} 分鐘`;
  $('dailyGoalBar').style.width=Math.min(100,mins/DAILY_GOAL_MINUTES*100)+'%';

  const next=findNextLesson();
  if(next){
    const s=songs[next.id];
    $('nextLessonTitle').textContent=s?.title||'下一課';
    $('nextLessonDesc').textContent=`${levelName(next.level)} · ${s?.categoryLabel||categoryNames[next.category]||'課程'} · ${s?.bpm||90} BPM`;
    $('progressLevelLabel').textContent=levelName(next.level);
    $('startNextLessonBtn').disabled=false;
    $('startNextLessonBtn').dataset.song=next.id;
  }else{
    $('nextLessonTitle').textContent='目前可學課程已完成';
    $('nextLessonDesc').textContent='可以到完整曲庫挑一首新作品繼續練習。';
    $('startNextLessonBtn').disabled=true;
    $('startNextLessonBtn').dataset.song='';
  }

  const root=$('levelPath'); root.innerHTML='';
  levelOrder().forEach(level=>{
    const done=completedForLevel(level);
    const total=totalForLevel();
    const pct=Math.min(100,Math.round(done/total*100));
    const unlocked=isLevelUnlocked(level);
    const node=document.createElement('div');
    node.className='level-node'+(!unlocked?' locked':'')+(next?.level===level?' current':'');
    node.innerHTML=`
      <div class="level-badge">${level==='prep'?'PREP':'L'+level}</div>
      <div class="level-info">
        <strong>${levelName(level)}</strong>
        <small>${unlocked?'可學習':'完成前一級至少 60% 解鎖'}</small>
        <div class="level-progress"><span style="width:${pct}%"></span></div>
      </div>
      <div class="level-state"><b>${done} / ${total}</b><small>${pct}%</small></div>`;
    root.appendChild(node);
  });
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
  song:'twinkle',running:false,paused:false,startAt:0,pauseStart:0,pauseTotal:0,audioStartTime:0,pausedElapsed:0,
  speed:1,mode:'play',sessionMode:'practice',examLocked:false,lastExamResult:null,hand:'right',micStream:null,audioCtx:null,analyser:null,
  audioRaf:0,gameRaf:0,metroOn:false,metroTimer:null,metroScheduler:null,nextMetroBeat:0,assistTimer:null,assistBeat:0,
  judged:new Set(),goodStreak:0,tempoBpm:null,tempoManual:false,lastMasterBeat:-1,
  performanceLog:[],lastCapturedAt:0,currentTargetIndex:-1,eventTimeline:[],rightTimeline:[],leftTimeline:[],countInBeats:0,loopMeasure:false,demoSoundOn:false,pianoBuffers:new Map(),pianoLoading:false,pianoReady:false,demoPlayed:new Set(),demoScheduled:new Set(),demoVolume:0.45,pianoVoices:new Set(),inputMode:null,midiAccess:null,midiInputs:[],midiChordNotes:new Set(),midiChordStart:null,midiChordTimer:null,judgedMidiGroups:new Set()
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
    if(btn.dataset.tab==='progress') renderProgressPath();
  });
});


const FAVORITES_KEY='pianoLearningFavoritesV25';
const RECENTS_KEY='pianoLearningRecentScoresV25';

function loadFavoriteIds(){
  try{return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY)||'[]'))}catch(e){return new Set()}
}
function saveFavoriteIds(){
  try{localStorage.setItem(FAVORITES_KEY,JSON.stringify([...favoriteIds]))}catch(e){}
}
function loadRecentIds(){
  try{return JSON.parse(localStorage.getItem(RECENTS_KEY)||'[]')}catch(e){return []}
}
function saveRecentIds(){
  try{localStorage.setItem(RECENTS_KEY,JSON.stringify(recentIds.slice(0,30)))}catch(e){}
}
let favoriteIds=loadFavoriteIds();
let recentIds=loadRecentIds();
let librarySearch='';
let librarySort='default';
let libraryView='all';

function rememberRecentScore(id){
  recentIds=[id,...recentIds.filter(x=>x!==id)].slice(0,30);
  saveRecentIds();
}
function durationSecondsFromLibrary(row){
  const s=songs[row[0]];
  return Number(s?.duration)||0;
}
function rowSearchText(row){
  const [id,title,lvl,duration,category,collection]=row;
  const s=songs[id]||{};
  return [
    title,lvl,duration,category,collection,
    s.categoryLabel,s.key,s.bpm,
    s.photoScore?'拍照樂譜 待 OMR':(s.fullScore?'完整曲':'練習')
  ].filter(Boolean).join(' ').toLowerCase();
}
function levelRank(row){
  const s=songs[row[0]]||{};
  if(s.levelKey==='prep') return 0;
  const n=Number(s.levelKey);
  return Number.isFinite(n)?n:99;
}

let activeCollection='all';
let activeLevel='all';
function renderSongList(){
  const root=$('songList'); root.innerHTML='';
  let rows=[...library];

  if(activeCollection!=='all') rows=rows.filter(x=>String(x[5]||'practice')===activeCollection);

  if(activeLevel!=='all'){
    rows=rows.filter(x=>{
      const s=songs[x[0]];
      return String(s?.levelKey??'').toLowerCase()===String(activeLevel).toLowerCase();
    });
  }

  if(librarySearch.trim()){
    const q=librarySearch.trim().toLowerCase();
    rows=rows.filter(row=>rowSearchText(row).includes(q));
  }

  if(libraryView==='full') rows=rows.filter(row=>!!songs[row[0]]?.fullScore);
  if(libraryView==='favorite') rows=rows.filter(row=>favoriteIds.has(row[0]));
  if(libraryView==='recent') rows=rows.filter(row=>recentIds.includes(row[0]));

  if(librarySort==='title') rows.sort((a,b)=>String(a[1]).localeCompare(String(b[1]),'zh-Hant'));
  else if(librarySort==='level') rows.sort((a,b)=>levelRank(a)-levelRank(b)||String(a[1]).localeCompare(String(b[1]),'zh-Hant'));
  else if(librarySort==='bpm') rows.sort((a,b)=>(songs[a[0]]?.bpm||0)-(songs[b[0]]?.bpm||0));
  else if(librarySort==='duration') rows.sort((a,b)=>durationSecondsFromLibrary(a)-durationSecondsFromLibrary(b));
  else if(librarySort==='recent') rows.sort((a,b)=>{
    const ai=recentIds.indexOf(a[0]), bi=recentIds.indexOf(b[0]);
    return (ai<0?999:ai)-(bi<0?999:bi);
  });

  rows.forEach(([id,title,lvl,duration,category,collection])=>{
    const s=songs[id]; if(!s)return;
    const row=document.createElement('div'); row.className='song-row';
    const main=document.createElement('button');
    main.type='button'; main.className='song-main';
    const tag=s.photoScore?'拍照樂譜':(s.fullScore?'整首':'練習');
    const isRecent=recentIds.includes(id);
    const pending=s.photoScore&&s.photoPending?'<em class="pending">待 OMR</em>':'';
    main.innerHTML=`<span><strong>${title}</strong><small>${s.photoScore?'照片／掃描譜':`${s.bpm} BPM · ${(s.timeSig||[4,4]).join('/')} · ${s.categoryLabel||'曲目'}`}</small><span class="song-tags"><em class="${s.fullScore?'full':''}">${tag}</em>${pending}${isRecent?'<em class="recent">最近練習</em>':''}${collection?`<em>${collection}</em>`:''}</span></span><span class="level">${lvl}</span><span class="duration">${duration}</span>`;
    main.addEventListener('click',()=>{
      if(s.photoScore && s.photoPending){openPhotoFromLibrary(id);return}
      openPractice(id,'PLAY');
    });

    const fav=document.createElement('button');
    fav.type='button'; fav.className='song-favorite'+(favoriteIds.has(id)?' active':'');
    fav.setAttribute('aria-label',favoriteIds.has(id)?'取消收藏':'加入收藏');
    fav.textContent=favoriteIds.has(id)?'★':'☆';
    fav.addEventListener('click',e=>{
      e.stopPropagation();
      if(favoriteIds.has(id))favoriteIds.delete(id); else favoriteIds.add(id);
      saveFavoriteIds();
      renderSongList();
    });

    row.appendChild(main); row.appendChild(fav); root.appendChild(row);
  });

  let slotCount=0;
  if(activeCollection==='disney' || activeCollection==='all'){
    DISNEY_IMPORT_SLOTS.forEach((title,i)=>{
      if(libraryView!=='all' || librarySearch.trim()) return;
      const b=document.createElement('button'); b.className='song-row licensed-slot'; b.type='button';
      b.innerHTML=`<span><strong>${title}</strong><small>Disney 授權樂譜匯入槽 · MusicXML / MIDI</small></span><span class="level">授權匯入</span><span class="duration">＋</span>`;
      b.addEventListener('click',()=>{
        document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab==='import'));
        document.querySelectorAll('.tab-panel').forEach(x=>x.classList.toggle('active',x.id==='importPanel'));
        $('importStatus').textContent='請選擇你合法取得的 Disney MusicXML / MIDI 樂譜；匯入後即可完整播放與對譜。';
      });
      root.appendChild(b); slotCount++;
    });
  }
  if(activeCollection==='movie'){
    MOVIE_IMPORT_SLOTS.forEach((title,i)=>{
      if(libraryView!=='all' || librarySearch.trim()) return;
      const b=document.createElement('button'); b.className='song-row licensed-slot'; b.type='button';
      b.innerHTML=`<span><strong>${title}</strong><small>受版權保護電影正式樂譜匯入槽 · MusicXML / MIDI · 完整曲</small></span><span class="level">完整匯入</span><span class="duration">＋</span>`;
      b.addEventListener('click',()=>{
        document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab==='import'));
        document.querySelectorAll('.tab-panel').forEach(x=>x.classList.toggle('active',x.id==='importPanel'));
        $('importStatus').textContent='請選擇你合法取得的電影完整 MusicXML / MIDI 樂譜；匯入後會保留完整曲流程並使用 READY、雙手譜、示範聲、對譜及紀錄。';
      });
      root.appendChild(b); slotCount++;
    });
  }
  if(activeCollection==='school'){
    SCHOOL_IMPORT_SLOTS.forEach((title,i)=>{
      if(libraryView!=='all' || librarySearch.trim()) return;
      const b=document.createElement('button'); b.className='song-row licensed-slot'; b.type='button';
      b.innerHTML=`<span><strong>${title}</strong><small>學校課本／老師指定完整樂譜匯入槽 · MusicXML / MIDI</small></span><span class="level">學校匯入</span><span class="duration">＋</span>`;
      b.addEventListener('click',()=>{
        document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab==='import'));
        document.querySelectorAll('.tab-panel').forEach(x=>x.classList.toggle('active',x.id==='importPanel'));
        $('importStatus').textContent='請選擇學校或老師提供、你有權使用的 MusicXML / MIDI 完整樂譜；匯入後會納入完整練習流程。';
      });
      root.appendChild(b); slotCount++;
    });
  }

  if($('visibleSongCount')) $('visibleSongCount').textContent=`${rows.length} 首樂譜${slotCount?`＋${slotCount} 匯入槽`:''}`;
  if(!rows.length && !slotCount){
    const empty=document.createElement('div'); empty.className='curriculum-summary';
    empty.textContent='目前篩選條件沒有符合的樂譜。';
    root.appendChild(empty);
  }
}
renderSongList();
$('levelFilter').addEventListener('change',renderCurriculum);
$('categoryFilter').addEventListener('change',renderCurriculum);
renderCurriculum();


document.querySelectorAll('.filter').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); activeLevel=btn.dataset.level; renderSongList();
  });
});
document.querySelectorAll('.collection-filter').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.collection-filter').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); activeCollection=btn.dataset.collection; renderSongList();
  });
});
$('songSearch').addEventListener('input',()=>{
  librarySearch=$('songSearch').value||'';
  renderSongList();
});
$('songSort').addEventListener('change',()=>{
  librarySort=$('songSort').value||'default';
  renderSongList();
});
$('songViewFilter').addEventListener('change',()=>{
  libraryView=$('songViewFilter').value||'all';
  renderSongList();
});
$('clearLibraryFilters').addEventListener('click',()=>{
  activeCollection='all'; activeLevel='all'; librarySearch=''; librarySort='default'; libraryView='all';
  $('songSearch').value='';
  $('songSort').value='default';
  $('songViewFilter').value='all';
  document.querySelectorAll('.collection-filter').forEach(b=>b.classList.toggle('active',b.dataset.collection==='all'));
  document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.dataset.level==='all'));
  renderSongList();
});

$('quickStart').addEventListener('click',()=>openPractice('sight','5 MIN'));
$('startNextLessonBtn').addEventListener('click',()=>{
  const id=$('startNextLessonBtn').dataset.song;
  if(id) openPractice(id,'LEARN');
});
renderProgressPath();


$('takeScorePhotoBtn').addEventListener('click',()=>$('cameraScoreInput').click());
$('chooseScorePhotosBtn').addEventListener('click',()=>$('galleryScoreInput').click());
$('chooseScorePdfBtn').addEventListener('click',()=>$('photoPdfInput').click());
$('cameraScoreInput').addEventListener('change',async e=>{
  await addPhotoFiles(e.target.files,'image');e.target.value='';
});
$('galleryScoreInput').addEventListener('change',async e=>{
  await addPhotoFiles(e.target.files,'image');e.target.value='';
});
$('photoPdfInput').addEventListener('change',async e=>{
  await addPhotoFiles(e.target.files,'pdf');e.target.value='';
});
$('clearPhotoDraftBtn').addEventListener('click',resetPhotoDraft);
$('savePhotoScoreBtn').addEventListener('click',savePhotoDraft);
renderPhotoDraft();
loadPhotoScores();

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
  rememberRecentScore(songId);
  state.song=songId; state.running=false; state.paused=false; state.pauseTotal=0; state.judged=new Set(); state.goodStreak=0;
  state.lastExamResult=null; updateSessionModeUI(); setExamLock(false);
  state.performanceLog=[]; state.lastCapturedAt=0; state.currentTargetIndex=-1; state.demoPlayed=new Set(); state.judgedMidiGroups=new Set(); state.midiChordNotes.clear(); state.midiChordStart=null; clearTimeout(state.midiChordTimer);
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
  updateBothHandsStatus();
  enterReadyState();
}



function sessionModeConfig(){
  if(state.sessionMode==='exam'){
    return {
      badge:'EXAM',
      title:'考試開始後鎖定設定與輔助',
      desc:'不倒回、不循環、不播放示範鋼琴聲；完成後才看成績。'
    };
  }
  if(state.sessionMode==='performance'){
    return {
      badge:'PERFORMANCE',
      title:'正式演奏：只保留必要控制',
      desc:'不使用示範聲與弱小節提示，適合整首不中斷演奏。'
    };
  }
  return {
    badge:'PRACTICE',
    title:'可以倒回、循環與使用示範聲',
    desc:'適合分段練習與修正錯誤。'
  };
}
function updateSessionModeUI(){
  if(!$('sessionModeNotice')) return;
  const cfg=sessionModeConfig();
  $('sessionModeNotice').classList.remove('exam','performance');
  if(state.sessionMode!=='practice') $('sessionModeNotice').classList.add(state.sessionMode);
  $('sessionModeNotice').querySelector('small').textContent=
    state.sessionMode==='exam'?'考試模擬':state.sessionMode==='performance'?'正式演奏':'練習模式';
  $('sessionModeTitle').textContent=cfg.title;
  $('sessionModeDesc').textContent=cfg.desc;
  $('sessionModeBadge').textContent=cfg.badge;
}
function setExamLock(locked){
  state.examLocked=!!locked;
  const ids=[
    'rewindBtn','tempoMinus','tempoPlus','tempoInput','tempoReset',
    'speedSelect','handSelect','practiceMode','countInSelect',
    'measureLoopSelect','sessionModeSelect','demoSoundBtn'
  ];
  ids.forEach(id=>{
    const el=$(id); if(el) el.disabled=state.examLocked;
  });
  // During the exam the record drawer stays closed until the run finishes.
  if($('recordBtn')) $('recordBtn').disabled=state.examLocked;
}
function prepareSessionRestrictions(){
  if(state.sessionMode==='exam' || state.sessionMode==='performance'){
    state.loopMeasure=false;
    $('measureLoopSelect').value='off';
    if(state.demoSoundOn){
      state.demoSoundOn=false;
      $('demoSoundBtn').textContent='譜面鋼琴聲：關';
      $('demoSoundBtn').classList.remove('is-on');
      stopAllPianoVoices();
      state.demoScheduled=new Set();
      updateBothHandsStatus();
    }
  }
  if(state.sessionMode==='exam'){
    hideAssist();
    $('recordDrawer').hidden=true;
    $('recordBtn').classList.remove('active');
  }
}
function examGrade(score){
  if(score>=90) return 'A';
  if(score>=80) return 'B';
  if(score>=70) return 'C';
  if(score>=60) return 'D';
  return '再練習';
}
function buildExamResult(){
  const log=state.performanceLog||[];
  const total=Math.max(1,log.length);
  const pitch=Math.round(log.filter(x=>x.pitchCorrect).length/total*100);
  const rhythm=Math.round(log.filter(x=>x.rhythmCorrect).length/total*100);
  const exact=Math.round(log.filter(x=>x.pitchCorrect&&x.rhythmCorrect).length/total*100);
  const expectedCount=Math.max(1,noteEvents().length);
  const completion=Math.min(100,Math.round(log.length/expectedCount*100));
  const score=Math.round(pitch*.35+rhythm*.35+completion*.15+exact*.15);
  const result={score,pitch,rhythm,completion,exact,grade:examGrade(score)};
  state.lastExamResult=result;
  return result;
}
function renderExamResult(){
  if(!$('examResultCard')) return;
  if(state.sessionMode!=='exam' || !state.lastExamResult){
    $('examResultCard').hidden=true;
    return;
  }
  const r=state.lastExamResult;
  $('examResultCard').hidden=false;
  $('examGrade').textContent=r.grade;
  $('examScore').textContent=r.score+'/100';
  $('examPitchScore').textContent=r.pitch+'%';
  $('examRhythmScore').textContent=r.rhythm+'%';
  $('examCompletionScore').textContent=r.completion+'%';
  $('examResultText').textContent=
    r.score>=90?'整首演奏非常穩定。':
    r.score>=75?'整體完成良好，可針對錯誤小節再加強。':
    r.score>=60?'已完成考試流程，建議先改善節拍與漏音。':
    '建議回到練習模式，先分段穩定後再重考。';
}

function fmtTime(sec){
  sec=Math.max(0,Math.floor(sec||0));
  return `${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;
}
function enterReadyState(){
  state.running=false;
  setExamLock(false); state.paused=false; state.pauseTotal=0; state.pausedElapsed=0; state.audioStartTime=0; state.lastMasterBeat=-1; state.demoScheduled=new Set();
  $('prepareBanner').classList.remove('running');
  $('topProgressBar').style.width='0%';
  $('transportTime').textContent='00:00';
  $('transportStatus').textContent='準備中';
  $('inputSource').textContent=state.inputMode==='midi'?'MIDI':state.inputMode==='mic'?'麥克風':'—';
  renderStaticScore();
  updateBothHandsStatus();
  $('playBtn').classList.remove('active');
  $('pauseTransportBtn').classList.remove('active');
  if(state.metroOn) stopMetronome(false);
  hideAssist();
}
async function playFromCurrent(){
  const ctx=ensureAudioContext();
  try{await ctx.resume()}catch(e){}
  if(!state.running){
    await startPractice();
  }else if(state.paused){
    state.audioStartTime=ctx.currentTime-(state.pausedElapsed||0);
    state.startAt=performance.now()-(state.pausedElapsed||0)*1000;
    state.paused=false;
    state.lastMasterBeat=-1;
    startMetronome();
    $('pauseTransportBtn').classList.remove('active');
    $('playBtn').classList.add('active');
  }
  $('prepareBanner').classList.add('running');
  $('transportStatus').textContent='播放中';
}
function pausePractice(){
  if(!state.running || state.paused) return;
  state.pausedElapsed=elapsed();
  state.paused=true;
  state.pauseStart=performance.now();
  stopMetronome(false);
  $('pauseTransportBtn').classList.add('active');
  $('playBtn').classList.remove('active');
  stopAllPianoVoices();
  $('transportStatus').textContent='暫停';
}
function seekTo(sec){
  sec=Math.max(0,Math.min(effectiveDuration(),sec));
  const ctx=ensureAudioContext();
  state.pausedElapsed=sec;
  state.audioStartTime=ctx.currentTime-sec;
  state.startAt=performance.now()-sec*1000;
  state.pauseTotal=0;
  if(state.paused) state.pauseStart=performance.now();
  state.lastMasterBeat=-1;
  state.demoPlayed=new Set();
  state.demoScheduled=new Set();
  state.judged=new Set([...state.judged].filter(i=>noteTime(i)<sec));
  state.judgedMidiGroups=new Set();
  renderStaticScore();
  if(state.running && !state.paused) startMetronome();
}
function rewindMeasure(){
  if(state.examLocked || state.sessionMode==='exam' || state.sessionMode==='performance') return;
  if(!state.running){
    enterReadyState();
    return;
  }
  const current=elapsed();
  const measure=beatSeconds()*songs[state.song].timeSig[0];
  seekTo(Math.max(0,current-measure));
  $('transportStatus').textContent=state.paused?'暫停':'播放中';
}

function measureFromTime(t){
  const sig=songs[state.song]?.timeSig?.[0]||4;
  const beat=(Number(t)||0)/beatSeconds()-leadInBeats();
  return Math.max(1,Math.floor(Math.max(0,beat)/sig)+1);
}
function measureStartTime(measureNumber){
  const sig=songs[state.song]?.timeSig?.[0]||4;
  return (leadInBeats()+(Math.max(1,measureNumber)-1)*sig)*beatSeconds();
}
function percent(n,d){
  return d?Math.round(n/d*100):0;
}
function analyzePracticeLog(){
  const log=state.performanceLog||[];
  const validTiming=log.filter(x=>Number.isFinite(x.timingErrorMs));
  const pitchOk=log.filter(x=>x.pitchCorrect).length;
  const rhythmOk=log.filter(x=>x.rhythmCorrect).length;
  const exact=log.filter(x=>x.pitchCorrect&&x.rhythmCorrect).length;
  const avgTiming=validTiming.length
    ? Math.round(validTiming.reduce((s,x)=>s+Math.abs(x.timingErrorMs),0)/validTiming.length)
    : null;

  const early=validTiming.filter(x=>x.timingErrorMs<-180).length;
  const onTime=validTiming.filter(x=>Math.abs(x.timingErrorMs)<=180).length;
  const late=validTiming.filter(x=>x.timingErrorMs>180).length;
  const miss=log.filter(x=>x.playedNote==null || x.result==='miss').length;

  const handStats={right:{n:0,ok:0},left:{n:0,ok:0}};
  log.forEach(x=>{
    if(x.hand==='right'||x.hand==='left'){
      handStats[x.hand].n++;
      if(x.pitchCorrect&&x.rhythmCorrect)handStats[x.hand].ok++;
    }else if(String(x.hand||'').includes('+')){
      handStats.right.n++; handStats.left.n++;
      if(x.pitchCorrect&&x.rhythmCorrect){handStats.right.ok++;handStats.left.ok++}
    }
  });

  const chordLogs=log.filter(x=>Number.isFinite(x.chordCompleteness));
  const chordAvg=chordLogs.length
    ? Math.round(chordLogs.reduce((s,x)=>s+x.chordCompleteness,0)/chordLogs.length)
    : null;

  const measures=new Map();
  log.forEach(x=>{
    const m=measureFromTime(x.expectedTime);
    if(!measures.has(m))measures.set(m,{measure:m,total:0,exact:0,pitch:0,rhythm:0,miss:0,errorScore:0});
    const o=measures.get(m);
    o.total++;
    if(x.pitchCorrect)o.pitch++;
    if(x.rhythmCorrect)o.rhythm++;
    if(x.pitchCorrect&&x.rhythmCorrect)o.exact++;
    if(x.playedNote==null||x.result==='miss')o.miss++;
    const timingPenalty=Number.isFinite(x.timingErrorMs)?Math.min(2,Math.abs(x.timingErrorMs)/180):2;
    const pitchPenalty=x.pitchCorrect?0:1.5;
    const missPenalty=(x.playedNote==null||x.result==='miss')?2:0;
    o.errorScore+=timingPenalty+pitchPenalty+missPenalty;
  });

  const ranked=[...measures.values()].map(o=>({
    ...o,
    accuracy:percent(o.exact,o.total),
    score:o.total?o.errorScore/o.total:0
  })).sort((a,b)=>b.score-a.score);

  return {
    total:log.length,
    pitchAccuracy:percent(pitchOk,log.length),
    rhythmAccuracy:percent(rhythmOk,log.length),
    exactAccuracy:percent(exact,log.length),
    avgTiming,
    early,onTime,late,miss,
    rightAccuracy:percent(handStats.right.ok,handStats.right.n),
    leftAccuracy:percent(handStats.left.ok,handStats.left.n),
    rightCount:handStats.right.n,
    leftCount:handStats.left.n,
    chordAvg,
    measures:ranked,
    weakest:ranked[0]||null
  };
}
function renderPracticeAnalytics(){
  const a=analyzePracticeLog();
  const val=(id,text)=>{const el=$(id);if(el)el.textContent=text};

  if(!a.total){
    ['pitchAccuracyValue','rhythmAccuracyValue','exactAccuracyValue','avgTimingValue',
     'rightHandAccuracyValue','leftHandAccuracyValue','chordAccuracyValue','weakMeasureValue'
    ].forEach(id=>val(id,'—'));
    val('earlyCount','0');val('onTimeCount','0');val('lateCount','0');val('missCount','0');
    $('weakMeasureList').textContent='完成一些練習後，這裡會自動整理。';
    return;
  }

  val('pitchAccuracyValue',a.pitchAccuracy+'%');
  val('rhythmAccuracyValue',a.rhythmAccuracy+'%');
  val('exactAccuracyValue',a.exactAccuracy+'%');
  val('avgTimingValue',a.avgTiming==null?'—':a.avgTiming+' ms');
  val('rightHandAccuracyValue',a.rightCount?a.rightAccuracy+'%':'—');
  val('leftHandAccuracyValue',a.leftCount?a.leftAccuracy+'%':'—');
  val('chordAccuracyValue',a.chordAvg==null?'—':a.chordAvg+'%');
  val('weakMeasureValue',a.weakest?'第 '+a.weakest.measure+' 小節':'—');
  val('earlyCount',String(a.early));
  val('onTimeCount',String(a.onTime));
  val('lateCount',String(a.late));
  val('missCount',String(a.miss));

  const root=$('weakMeasureList'); root.innerHTML='';
  a.measures.slice(0,5).forEach(m=>{
    const row=document.createElement('div');
    row.className='weak-measure-row';
    row.innerHTML=`<b>第 ${m.measure} 小節</b><span>完全吻合 ${m.accuracy}%｜漏音 ${m.miss}</span><button type="button">重練</button>`;
    row.querySelector('button').addEventListener('click',()=>{
      seekTo(measureStartTime(m.measure));
      state.loopMeasure=true;
      $('measureLoopSelect').value='current';
      $('recordDrawer').hidden=true;
      $('recordBtn').classList.remove('active');
      playFromCurrent();
    });
    root.appendChild(row);
  });
}

function renderRecordDrawer(){
  const log=state.performanceLog||[];
  renderPracticeAnalytics();
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
    const handLabel=x.hand==='left'?'左手':x.hand==='right'?'右手':x.hand?.includes('+')?'雙手':'';
    row.innerHTML=`<b>#${x.index+1}</b><span>${handLabel?handLabel+'｜':''}譜 ${x.expectedNote||'—'} → 彈 ${x.playedNote||'—'}</span>
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
  if(state.examLocked) return;
  renderRecordDrawer();
  renderExamResult();
  $('recordDrawer').hidden=!$('recordDrawer').hidden;
  $('recordBtn').classList.toggle('active',!$('recordDrawer').hidden);
});

$('practiceWeakestBtn').addEventListener('click',()=>{
  const a=analyzePracticeLog();
  if(!a.weakest)return;
  seekTo(measureStartTime(a.weakest.measure));
  state.loopMeasure=true;
  $('measureLoopSelect').value='current';
  $('recordDrawer').hidden=true;
  $('recordBtn').classList.remove('active');
  playFromCurrent();
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
$('sessionModeSelect').addEventListener('change',()=>{
  if(state.examLocked) return;
  state.sessionMode=$('sessionModeSelect').value||'practice';
  prepareSessionRestrictions();
  updateSessionModeUI();
  renderExamResult();
});
$('practiceMode').addEventListener('change',()=>{state.mode=$('practiceMode').value;});
$('handSelect').addEventListener('change',()=>{
  state.hand=$('handSelect').value;
  state.demoScheduled=new Set();
  state.judged=new Set();
  state.judgedMidiGroups=new Set();
  buildEventTimeline();
  updateHandFocus();
  renderStaticScore();
  updateBothHandsStatus();
  if(state.running && !state.paused) startMetronome();
});
function updateHandFocus(){
  const g=$('grandStaff'); if(!g)return;
  g.classList.remove('hand-right','hand-left','hand-both');
  g.classList.add('hand-'+state.hand);
  updateBothHandsStatus();
}
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
$('midiBtn').addEventListener('click',connectMIDI);

$('metroBtn').addEventListener('click',()=>{
  state.metroOn=!state.metroOn;
  $('metroBtn').textContent='節拍器：'+(state.metroOn?'開':'關');
  // Transport audio scheduler must keep running even when the metronome is muted,
  // because score-demo piano also uses the same master audio clock.
  if(state.running && !state.paused) startMetronome();
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

function playLocalPianoAt(note,when,velocity=0.85,duration=1.1){
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
  const start=Math.max(ctx.currentTime,when);
  src.start(start);
  state.pianoVoices.add(src);
  gain.gain.setValueAtTime(gain.gain.value,start+Math.max(.15,duration*.65));
  gain.gain.exponentialRampToValueAtTime(.001,start+duration);
  src.stop(start+Math.min(buffer.duration/playbackRateSafe(src.playbackRate.value),duration+.25));
  src.onended=()=>state.pianoVoices.delete(src);
}

function playbackRateSafe(v){ return Math.max(.25,Math.min(4,v||1)); }

async function toggleDemoSound(){
  if(state.sessionMode==='exam' || state.sessionMode==='performance'){
    setSampleStatus('考試／正式演奏模式不使用示範鋼琴聲','');
    return;
  }
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
    state.demoScheduled=new Set();
    if(state.running && !state.paused) startMetronome();
    btn.textContent='譜面鋼琴聲：開';
    btn.classList.add('is-on');
    updateBothHandsStatus();

    // Immediate test note, so the user knows audio is working.
    playLocalPiano('C4',0.9,1.0);
  }else{
    state.demoSoundOn=false;
    state.demoScheduled=new Set();
    btn.textContent='譜面鋼琴聲：關';
    btn.classList.remove('is-on');
    state.demoPlayed=new Set();
    updateBothHandsStatus();
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
  if(state.paused) return Math.max(0,state.pausedElapsed||0);
  const ctx=state.audioCtx;
  if(ctx && state.audioStartTime>0) return Math.max(0,ctx.currentTime-state.audioStartTime);
  // Fallback only if Web Audio is unavailable.
  return Math.max(0,(performance.now()-state.startAt)/1000);
}
function makeTimeline(events,hand){
  let beat=0;
  return (events||[]).map((ev,eventIndex)=>{
    const [note,beats]=ev;
    const item={
      eventIndex,note,beats,hand,
      startBeat:beat,endBeat:beat+beats,
      startTime:(leadInBeats()+beat)*beatSeconds(),
      endTime:(leadInBeats()+beat+beats)*beatSeconds(),
      isRest:note==='REST'
    };
    beat+=beats; return item;
  });
}
function buildEventTimeline(){
  const song=songs[state.song];
  state.rightTimeline=makeTimeline(song.events,'right');
  state.leftTimeline=makeTimeline(song.leftEvents||buildLeftHandEvents(song),'left');
  state.eventTimeline=state.hand==='left'?state.leftTimeline:state.hand==='both'?[...state.rightTimeline,...state.leftTimeline]:state.rightTimeline;
}
function noteEvents(){
  return state.eventTimeline.filter(e=>!e.isRest).flatMap(e=>Array.isArray(e.note)?e.note.map((n,k)=>({...e,note:n,chordIndex:k})):e);
}
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
function bassNoteY(note){
  const m=String(note).match(/^([A-G])#?(\d)$/); if(!m)return 112;
  const step=(+m[2])*7+degree[m[1]];
  const base=2*7+degree.G; // G2 near bottom bass staff line
  const half=13;
  return 146-(step-base)*(half/2);
}



function visualKey(hand,eventIndex,chordIndex=0){
  return `${hand}_${eventIndex}_${chordIndex}`;
}
function eventVisualKey(ev){
  return visualKey(ev.hand,ev.eventIndex,ev.chordIndex||0);
}
function findEventVisual(ev){
  const root=ev.hand==='left'?$('scrollingBassScore'):$('scrollingScore');
  return root?.querySelector(`.music-note[data-vkey="${eventVisualKey(ev)}"]`)||null;
}
function updateBothHandsStatus(){
  if(!$('rightStaffStatus')) return;
  const hand=state.hand;
  $('rightStaffStatus').textContent=hand==='left'?'淡化':'顯示';
  $('leftStaffStatus').textContent=hand==='right'?'淡化':'顯示';

  const demo=$('demoHandStatus');
  if(!state.demoSoundOn){
    demo.textContent='關';
    demo.className='';
  }else{
    demo.textContent=hand==='both'?'右手＋左手':hand==='left'?'左手':'右手';
    demo.className='on';
  }

  const cap=$('judgeCapability');
  if(state.inputMode==='midi'){
    cap.textContent=hand==='both'?'MIDI：雙手多音':'MIDI：多音';
    cap.className='on';
  }else{
    cap.textContent=hand==='both'?'麥克風：雙手以單音追蹤':'麥克風：單音';
    cap.className=hand==='both'?'warn':'';
  }
}
function currentHandTarget(timeline,e){
  let best=null,bestDelta=Infinity;
  timeline.filter(x=>!x.isRest).forEach(ev=>{
    const d=Math.abs(e-ev.startTime);
    if(d<bestDelta){bestDelta=d;best=ev;}
  });
  if(!best) return '—';
  const notes=Array.isArray(best.note)?best.note:[best.note];
  return notes.join(' + ');
}

function renderStaffTimeline(root,timeline,hand){
  root.innerHTML='';
  const song=songs[state.song];
  const pxPerBeat=95;
  const lead=window.innerWidth<600?260:380;
  const totalWidth=lead+(leadInBeats()+song.totalBeats+4)*pxPerBeat;
  root.style.width=totalWidth+'px'; root.dataset.lead=lead; root.dataset.pxPerBeat=pxPerBeat;
  const totalBeats=leadInBeats()+song.totalBeats;
  for(let b=0;b<=totalBeats;b++){
    const line=document.createElement('div');
    line.className='beat-guide'+(b%song.timeSig[0]===0?' strong':'');
    line.style.left=(lead+b*pxPerBeat)+'px'; root.appendChild(line);
  }
  let noteIndex=0;
  timeline.forEach(ev=>{
    const x=lead+(leadInBeats()+ev.startBeat)*pxPerBeat;
    if(ev.isRest){
      const r=document.createElement('div'); r.className='music-rest '+durationClass(ev.beats);
      r.style.left=x+'px'; r.style.top=(hand==='left'?'118px':'138px'); root.appendChild(r);
    }else{
      const notes=Array.isArray(ev.note)?ev.note:[ev.note];
      notes.forEach((note,chordIndex)=>{
        const n=document.createElement('div');
        n.className='music-note '+durationClass(ev.beats)+(hand==='left'?' bass-note':'')+(notes.length>1?' chord-note':'');
        n.dataset.i=noteIndex; n.dataset.event=ev.eventIndex; n.dataset.hand=hand;
        n.dataset.chord=chordIndex; n.dataset.vkey=visualKey(hand,ev.eventIndex,chordIndex);
        n.style.left=x+'px'; n.style.top=(hand==='left'?bassNoteY(note):noteY(note))+'px';
        n.innerHTML='<span class="note-head"></span><span class="note-stem"></span><span class="note-flag"></span>';
        root.appendChild(n); noteIndex++;
      });
      if(notes.length>1){
        const c=document.createElement('div'); c.className='chord-bracket';
        c.style.left=x+'px'; c.style.top=(hand==='left'?'26px':'38px'); c.textContent='和弦'; root.appendChild(c);
      }
      if(hand==='right'){
        const f=document.createElement('div'); f.className='finger'; f.style.left=x+'px'; f.textContent=fingerFor(noteIndex-1); root.appendChild(f);
      }
    }
  });
  const bars=Math.ceil((leadInBeats()+song.totalBeats)/song.timeSig[0]);
  for(let i=1;i<=bars;i++){
    const line=document.createElement('div'); line.className='measure-line';
    line.style.left=(lead+(leadInBeats()+i*song.timeSig[0])*pxPerBeat)+'px'; root.appendChild(line);
  }
  const targetWindow=hand==='left'?$('bassStaffWindow'):$('staffWindow');
  const playhead=targetWindow.clientWidth*.22;
  root.style.transform=`translateX(${playhead-lead}px)`;
}
function renderStaticScore(){
  buildEventTimeline();
  renderStaffTimeline($('scrollingScore'),state.rightTimeline,'right');
  renderStaffTimeline($('scrollingBassScore'),state.leftTimeline,'left');
  updateHandFocus();
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

function mixHex(a,b,t){
  const pa=parseInt(a.slice(1),16), pb=parseInt(b.slice(1),16);
  const ar=(pa>>16)&255, ag=(pa>>8)&255, ab=pa&255;
  const br=(pb>>16)&255, bg=(pb>>8)&255, bb=pb&255;
  const r=Math.round(ar+(br-ar)*t), g=Math.round(ag+(bg-ag)*t), bl=Math.round(ab+(bb-ab)*t);
  return '#'+[r,g,bl].map(x=>x.toString(16).padStart(2,'0')).join('');
}
function hexToRgba(hex,alpha){
  const v=parseInt(hex.slice(1),16);
  return `rgba(${(v>>16)&255},${(v>>8)&255},${v&255},${alpha})`;
}
function notePalette(progress){
  progress=Math.max(0,Math.min(1,progress));
  const stops=[
    {t:0.00,c1:'#5d6b98',c2:'#5877b8'},
    {t:0.45,c1:'#4faeb4',c2:'#5a93c9'},
    {t:0.75,c1:'#8a78c2',c2:'#b37ca4'},
    {t:1.00,c1:'#c9a85c',c2:'#c78566'}
  ];
  let s1=stops[0], s2=stops[stops.length-1];
  for(let i=0;i<stops.length-1;i++){
    if(progress>=stops[i].t && progress<=stops[i+1].t){ s1=stops[i]; s2=stops[i+1]; break; }
  }
  const local=(progress-s1.t)/Math.max(.0001,(s2.t-s1.t));
  const c1=mixHex(s1.c1,s2.c1,local);
  const c2=mixHex(s1.c2,s2.c2,local);
  return {c1,c2,glow:hexToRgba(c2,.05+.10*progress)};
}
function applyNoteApproachVisual(el, timeUntilHit, judged=false){
  if(!el) return;
  if(judged){
    el.classList.remove('approaching');
    el.style.removeProperty('--pulse');
    return;
  }
  const approachWindow=beatSeconds()*1.8;
  const holdWindow=beatSeconds()*0.18;
  const active=(timeUntilHit<=approachWindow && timeUntilHit>=-holdWindow);
  if(!active){
    el.classList.remove('approaching');
    el.style.removeProperty('--n1');
    el.style.removeProperty('--n2');
    el.style.removeProperty('--gl');
    el.style.removeProperty('--pulse');
    return;
  }
  let progress;
  if(timeUntilHit>=0){ progress=1-(timeUntilHit/approachWindow); }
  else{ progress=1-Math.min(1,Math.abs(timeUntilHit)/holdWindow)*.12; }
  const palette=notePalette(progress);
  el.classList.add('approaching');
  el.style.setProperty('--n1', palette.c1);
  el.style.setProperty('--n2', palette.c2);
  el.style.setProperty('--gl', palette.glow);
  el.style.setProperty('--pulse', progress.toFixed(3));
}


async function startPractice(){
  stopAnimationOnly();
  prepareSessionRestrictions();
  if(state.sessionMode==='exam') setExamLock(true);
  const ctx=ensureAudioContext();
  try{await ctx.resume()}catch(e){}
  state.running=true;
  state.paused=false;
  state.pauseTotal=0;
  state.pausedElapsed=0;
  state.audioStartTime=ctx.currentTime;
  state.startAt=performance.now();
  $('prepareBanner').classList.add('running');
  $('playBtn').classList.add('active');
  $('pauseTransportBtn').classList.remove('active');
  state.judged=new Set();
  state.judgedMidiGroups=new Set();
  state.goodStreak=0;
  state.performanceLog=[];
  state.lastCapturedAt=0;
  state.currentTargetIndex=-1;
  state.demoPlayed=new Set();
  state.demoScheduled=new Set();
  state.lastMasterBeat=-1;
  $('recordCount').textContent='0';
  $('playedNote').textContent='—';
  $('timingDelta').textContent='—';
  $('scoreNote').textContent='—';
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
function stopPractice(){ state.running=false; state.paused=false; state.pausedElapsed=0; stopAnimationOnly(); stopMetronome(false); hideAssist(); $('playBtn')?.classList.remove('active'); $('pauseTransportBtn')?.classList.remove('active'); stopAllPianoVoices(); state.demoScheduled=new Set(); if(!state.running)setExamLock(false); }

function updateMasterBeat(e){
  const beatIndex=Math.floor(e/beatSeconds());

  if(beatIndex!==state.lastMasterBeat){
    state.lastMasterBeat=beatIndex;

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
  const e=elapsed(), s=songs[state.song], root=$('scrollingScore'), bassRoot=$('scrollingBassScore');
  updateMasterBeat(e);
  const pxPerBeat=+root.dataset.pxPerBeat;
  const playhead=$('staffWindow').clientWidth*.22;
  const lead=+root.dataset.lead;
  const x=playhead-lead-(e/beatSeconds())*pxPerBeat;
  root.style.transform=`translateX(${x}px)`;
  if(bassRoot) bassRoot.style.transform=`translateX(${x}px)`;
  $('topProgressBar').style.width=Math.min(100,e/effectiveDuration()*100)+'%';
  $('transportTime').textContent=fmtTime(e);
  if($('rightTargetNote')) $('rightTargetNote').textContent=currentHandTarget(state.rightTimeline,e);
  if($('leftTargetNote')) $('leftTargetNote').textContent=currentHandTarget(state.leftTimeline,e);


  let nearest=-1,delta=99;
  const nEvents=noteEvents();

  nEvents.forEach((ev,i)=>{
    const expected=ev.startTime;
    const d=Math.abs(e-expected);
    const el=findEventVisual(ev);
    const timeUntilHit=expected-e;
    if(el){
      applyNoteApproachVisual(el,timeUntilHit,state.judged.has(i));
      el.classList.toggle('current',d<0.22);
    }
    if(d<delta){delta=d;nearest=i}
    if(el && e-ev.endTime>0.22) el.classList.add('passed');

    if(state.inputMode!=='midi' && e-expected>0.42 && !state.judged.has(i)){
      state.judged.add(i);
      logPerformance({
        index:i, expectedNote:ev.note, playedNote:null,
        expectedTime:expected, playedTime:null,
        timingErrorMs:null, pitchCorrect:false, rhythmCorrect:false,
        result:'miss',durationBeats:ev.beats,input:'mic'
      });
      if(el){
        el.classList.add('timing-error');
        applyNoteApproachVisual(el,999,true);
      }
      flash('miss'); showAssist(); state.goodStreak=0;
    }
  });

  processMidiMisses(e);
  state.currentTargetIndex=nearest;
  if(nearest>=0 && state.inputMode!=='midi') $('scoreNote').textContent=(nEvents[nearest].hand==='left'?'左 ':'右 ')+nEvents[nearest].note;
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

  if(e>=effectiveDuration()){
    savePracticeSummary();
    if(state.sessionMode==='exam') buildExamResult();
    stopPractice();
    setExamLock(false);
    $('playBtn').classList.remove('active');
    $('transportTime').textContent=fmtTime(effectiveDuration());
    $('transportStatus').textContent='完成';
    $('recordBtn').classList.add('has-analysis');
    if(state.sessionMode==='exam'){
      $('recordDrawer').hidden=false;
      renderRecordDrawer();
      renderExamResult();
    }
    return
  }
  state.gameRaf=requestAnimationFrame(gameLoop);
}

function flash(kind){
  // V2.9: intentionally disabled. No screen flash at beat/hit time.
}
function showAssist(){
  if(state.sessionMode==='exam' || state.sessionMode==='performance') return;
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


function setMidiStatus(text,kind=''){
  const el=$('midiStatus'); if(!el)return;
  el.textContent=text; el.className='sample-status'+(kind?' '+kind:'');
}
async function connectMIDI(){
  if(!navigator.requestMIDIAccess){
    setMidiStatus('MIDI：此瀏覽器不支援','error');
    $('midiBtn').textContent='MIDI 不支援';
    return;
  }
  try{
    setMidiStatus('MIDI：等待授權…','waiting');
    const access=await navigator.requestMIDIAccess({sysex:false});
    state.midiAccess=access;
    attachMidiInputs();
    access.onstatechange=attachMidiInputs;
    state.inputMode='midi'; $('inputSource').textContent='MIDI'; updateBothHandsStatus();
  }catch(err){
    console.error(err); setMidiStatus('MIDI：連接失敗','error');
  }
}
function attachMidiInputs(){
  if(!state.midiAccess)return;
  state.midiInputs=[...state.midiAccess.inputs.values()];
  state.midiInputs.forEach(input=>{ input.onmidimessage=handleMidiMessage; });
  if(state.midiInputs.length){
    const names=state.midiInputs.map(x=>x.name||'MIDI').join(' / ');
    setMidiStatus('MIDI：'+names,'ready');
    $('midiBtn').textContent='MIDI 已連接';
    state.inputMode='midi'; $('inputSource').textContent='MIDI'; updateBothHandsStatus();
  }else{
    setMidiStatus('MIDI：找不到裝置','waiting');
    $('midiBtn').textContent='重新掃描 MIDI';
  }
}
function handleMidiMessage(ev){
  const [status,note,velocity]=ev.data;
  const cmd=status&0xf0;
  if(cmd===0x90 && velocity>0){
    const name=midiToNote(note);
    state.inputMode='midi'; $('inputSource').textContent='MIDI'; updateBothHandsStatus();
    state.midiChordNotes.add(name);
    const held=[...state.midiChordNotes].sort((a,b)=>noteToMidi(a)-noteToMidi(b));
    $('heardNote').textContent=held.join(' + ');
    $('playedNote').textContent=held.join(' + ');
    queueMidiChordEvaluation(name,velocity);
  }else if(cmd===0x80 || (cmd===0x90 && velocity===0)){
    state.midiChordNotes.delete(midiToNote(note));
  }
}
function selectedMidiGroups(){
  const source=state.hand==='right'?state.rightTimeline:state.hand==='left'?state.leftTimeline:[...state.rightTimeline,...state.leftTimeline];
  const map=new Map();
  source.filter(e=>!e.isRest).forEach(ev=>{
    const k=ev.startTime.toFixed(4);
    if(!map.has(k)) map.set(k,{startTime:ev.startTime,entries:[],expectedNotes:[]});
    const g=map.get(k), notes=Array.isArray(ev.note)?ev.note:[ev.note];
    g.entries.push({hand:ev.hand,eventIndex:ev.eventIndex,notes});
    g.expectedNotes.push(...notes);
  });
  return [...map.values()].map(g=>{
    g.expectedNotes=[...new Set(g.expectedNotes)].sort((a,b)=>noteToMidi(a)-noteToMidi(b));
    g.key=g.entries.map(x=>x.hand+':'+x.eventIndex).sort().join('|');
    return g;
  }).sort((a,b)=>a.startTime-b.startTime);
}
function nearestMidiGroup(atTime){
  let best=null,bestD=999;
  selectedMidiGroups().forEach(g=>{
    if(state.judgedMidiGroups.has(g.key))return;
    const d=Math.abs(atTime-g.startTime);
    if(d<bestD){bestD=d;best=g;}
  });
  return best?{group:best,delta:bestD}:null;
}
function queueMidiChordEvaluation(note,velocity){
  if(!state.running||state.paused)return;
  const t=elapsed();
  if(state.midiChordStart==null) state.midiChordStart=t;
  clearTimeout(state.midiChordTimer);
  const near=nearestMidiGroup(state.midiChordStart);
  const expectedCount=near?.group?.expectedNotes?.length||1;
  state.midiChordTimer=setTimeout(evaluateMidiChord,expectedCount>1?135:65);
}
function arraysEqual(a,b){ return a.length===b.length && a.every((v,i)=>v===b[i]); }
function markMidiGroup(group,className){
  group.entries.forEach(entry=>{
    const root=entry.hand==='left'?$('scrollingBassScore'):$('scrollingScore');
    root?.querySelectorAll(`.music-note[data-event="${entry.eventIndex}"]`).forEach(el=>{
      el.classList.remove('chord-complete','chord-partial'); el.classList.add(className);
    });
  });
}
function evaluateMidiChord(){
  clearTimeout(state.midiChordTimer); state.midiChordTimer=null;
  if(!state.running||state.paused){state.midiChordStart=null;return;}
  const at=state.midiChordStart??elapsed();
  const match=nearestMidiGroup(at);
  const played=[...state.midiChordNotes].sort((a,b)=>noteToMidi(a)-noteToMidi(b));
  state.midiChordStart=null;
  if(!match||match.delta>.48||!played.length)return;
  const g=match.group, expected=g.expectedNotes;
  const timingError=at-g.startTime, timingErrorMs=Math.round(timingError*1000);
  const expectedSet=new Set(expected), matched=played.filter(n=>expectedSet.has(n)).length;
  const completeness=expected.length?matched/expected.length:0;
  const pitchCorrect=arraysEqual(expected,played);
  const rhythmCorrect=Math.abs(timingError)<=.18;
  state.judgedMidiGroups.add(g.key);
  $('scoreNote').textContent=expected.join(' + ');
  $('playedNote').textContent=played.join(' + ');
  const rightExpected=g.entries.filter(x=>x.hand==='right').flatMap(x=>x.notes);
  const leftExpected=g.entries.filter(x=>x.hand==='left').flatMap(x=>x.notes);
  if($('rightTargetNote')) $('rightTargetNote').textContent=rightExpected.length?rightExpected.join(' + '):'—';
  if($('leftTargetNote')) $('leftTargetNote').textContent=leftExpected.length?leftExpected.join(' + '):'—';
  $('timingDelta').textContent=(timingErrorMs>0?'+':'')+timingErrorMs+' ms';
  logPerformance({
    index:state.performanceLog.length,expectedNote:expected.join('+'),playedNote:played.join('+'),
    expectedTime:+g.startTime.toFixed(3),playedTime:+at.toFixed(3),timingErrorMs,
    pitchCorrect,rhythmCorrect,result:(pitchCorrect&&rhythmCorrect)?'exact_chord':pitchCorrect?'timing_error':'chord_error',
    durationBeats:1,input:'midi',chordCompleteness:Math.round(completeness*100),
    hand:[...new Set(g.entries.map(x=>x.hand))].sort().join('+')
  });
  if(pitchCorrect&&rhythmCorrect){ markMidiGroup(g,'chord-complete'); state.goodStreak++; if(state.goodStreak>=4)hideAssist(); }
  else{ markMidiGroup(g,'chord-partial'); state.goodStreak=0; if(!rhythmCorrect)showAssist(); }
}
function processMidiMisses(e){
  if(state.inputMode!=='midi')return;
  selectedMidiGroups().forEach(g=>{
    if(state.judgedMidiGroups.has(g.key) || e-g.startTime<=.42)return;
    state.judgedMidiGroups.add(g.key);
    logPerformance({index:state.performanceLog.length,expectedNote:g.expectedNotes.join('+'),playedNote:null,expectedTime:g.startTime,playedTime:null,timingErrorMs:null,pitchCorrect:false,rhythmCorrect:false,result:'miss',durationBeats:1,input:'midi',chordCompleteness:0});
    markMidiGroup(g,'timing-error'); state.goodStreak=0; showAssist();
  });
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
    state.inputMode='mic'; $('inputSource').textContent='麥克風'; updateBothHandsStatus();
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
      if(state.inputMode!=='midi'){ $('heardNote').textContent=note; judgeInput(note); }
    }
  }
  state.audioRaf=requestAnimationFrame(micLoop);
}

function logPerformance(entry){
  const expectedTime=Number(entry.expectedTime)||0;
  state.performanceLog.push({
    songId:state.song,
    measure:measureFromTime(expectedTime),
    songTitle:songs[state.song].title,
    bpm:songs[state.song].bpm,
    metronomeBpm:effectiveBpm(),
    speed:state.speed,
    hand:state.hand,
    mode:state.mode,
    sessionMode:state.sessionMode,
    ...entry
  });
  $('recordCount').textContent=state.performanceLog.length;
  if($('recordDrawer') && !$('recordDrawer').hidden) renderPracticeAnalytics();
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
    sessionMode:state.sessionMode,
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
  summary.durationSeconds=effectiveDuration();
  awardPracticeResult(state.song,summary);
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

  const el=findEventVisual(targetEvent);

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
      durationBeats:targetEvent.beats,input:'mic',hand:targetEvent.hand
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

function metroClickAt(when,accent){
  const ctx=ensureAudioContext();
  const osc=ctx.createOscillator(), gain=ctx.createGain();
  osc.frequency.value=accent?1100:820;
  gain.gain.setValueAtTime(.0001,when);
  gain.gain.exponentialRampToValueAtTime(.12,when+.005);
  gain.gain.exponentialRampToValueAtTime(.0001,when+.06);
  osc.connect(gain).connect(ctx.destination);
  osc.start(when); osc.stop(when+.07);
}
function metroClick(accent){
  const ctx=ensureAudioContext();
  metroClickAt(ctx.currentTime+.002,accent);
}
function scheduleTransportAudio(){
  if(!state.running || state.paused) return;
  const ctx=ensureAudioContext();
  const lookAhead=.12;
  const endTime=ctx.currentTime+lookAhead;
  const beatDur=beatSeconds();

  if(state.metroOn){
    while(state.audioStartTime+state.nextMetroBeat*beatDur<=endTime){
      const when=state.audioStartTime+state.nextMetroBeat*beatDur;
      if(when>=ctx.currentTime-.01) metroClickAt(Math.max(ctx.currentTime+.001,when),state.nextMetroBeat%4===0);
      state.nextMetroBeat++;
    }
  }

  if(state.demoSoundOn && state.pianoReady){
    const timelines=state.hand==='right'?[state.rightTimeline]:state.hand==='left'?[state.leftTimeline]:[state.rightTimeline,state.leftTimeline];
    timelines.forEach(timeline=>timeline.forEach(ev=>{
      if(ev.isRest) return;
      const key=ev.hand+'_'+ev.eventIndex;
      if(state.demoScheduled.has(key)) return;
      const when=state.audioStartTime+ev.startTime;
      if(when<=endTime && when>=ctx.currentTime-.02){
        state.demoScheduled.add(key);
        const notes=Array.isArray(ev.note)?ev.note:[ev.note];
        const noteDuration=Math.max(.25,Math.min(3.5,ev.beats*beatSeconds()*.9));
        notes.forEach(n=>playLocalPianoAt(n,Math.max(ctx.currentTime+.001,when),.86,noteDuration));
      }
    }));
  }
}
function startMetronome(){
  stopMetronome(false);
  state.lastMasterBeat=-1;
  const currentBeat=Math.max(0,Math.floor(elapsed()/beatSeconds()));
  state.nextMetroBeat=currentBeat;
  scheduleTransportAudio();
  state.metroScheduler=setInterval(scheduleTransportAudio,25);
}
function stopMetronome(update=true){
  if(state.metroScheduler){clearInterval(state.metroScheduler);state.metroScheduler=null;}
  state.lastMasterBeat=-1;
  if(update){
    state.metroOn=false;
    $('metroBtn').textContent='節拍器：關';
  }
}

window.addEventListener('resize',()=>{ if($('practiceView').classList.contains('active')) renderStaticScore(); });

try{updateBothHandsStatus()}catch(e){}

try{updateSessionModeUI()}catch(e){}
