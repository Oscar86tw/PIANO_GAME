
window.ExamEngine={
  build(grade,academy){
    const l=academy.grades.find(x=>x.grade===grade);
    if(!l)throw new Error('找不到級別');
    return {
      grade,
      sections:[
        {id:'technique',title:'技巧 / 音階',weight:20},
        {id:'repertoire',title:'曲目演奏',weight:35},
        {id:'reading',title:'視奏',weight:15},
        {id:'aural',title:'聽力',weight:15},
        {id:'rhythm',title:'節奏',weight:10},
        {id:'theory',title:'樂理',weight:5}
      ],
      locked:true
    };
  },
  final(sectionScores){
    const weights={technique:20,repertoire:35,reading:15,aural:15,rhythm:10,theory:5};
    let total=0;
    for(const [k,w] of Object.entries(weights))total+=(sectionScores[k]||0)*w/100;
    total=Math.round(total);
    return {score:total,result:total>=75?'Pass':total>=60?'Needs Review':'Not Yet',stars:total>=95?5:total>=88?4:total>=78?3:total>=65?2:1};
  }
};
