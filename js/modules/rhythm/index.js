
window.RhythmEngine={
  async bank(){return fetch(AppBase+'data/rhythm-bank.json').then(r=>r.json())},
  async play(pattern){
    await AudioEngine.init();
    let t=0,beatIndex=0;
    for(const dur of pattern.durations){
      AudioEngine.click(beatIndex===0,t);
      t+=dur*60/pattern.bpm;beatIndex++;
    }
    return t;
  },
  judgeTap(expectedSec,actualSec){
    const ms=Math.round((actualSec-expectedSec)*1000),abs=Math.abs(ms);
    return {ms,label:abs<=120?'準':ms<0?'早':'晚',ok:abs<=180};
  }
};
