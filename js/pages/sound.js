
const root=document.getElementById('voices');function render(){root.innerHTML='';SoundSettings.voices.forEach(v=>{const d=document.createElement('div');d.className='voice-card'+(SoundSettings.current===v.id?' active':'');d.innerHTML=`<strong>${v.name}</strong><small>${v.desc}</small><button class="btn ${SoundSettings.current===v.id?'':'primary'}" style="margin-top:8px">${SoundSettings.current===v.id?'使用中':'使用'}</button>`;d.querySelector('button').onclick=()=>{SoundSettings.set(v.id);render()};root.append(d)})}render();document.querySelectorAll('[data-note]').forEach(b=>b.onclick=async()=>{audioStatus.textContent='載入鋼琴 sample…';await AudioEngine.play(b.dataset.note,.8,1);audioStatus.textContent='音色測試完成';audioStatus.className='status ok'});chord.onclick=async()=>{audioStatus.textContent='載入鋼琴 sample…';await Promise.all(['C4','E4','G4'].map(n=>AudioEngine.play(n,.75,1.2)));audioStatus.textContent='C Major 測試完成';audioStatus.className='status ok'};

(()=>{
 const $=id=>document.getElementById(id);
 if(!$('soundPianoVolume'))return;
 const v=AudioEngine.getVolumes();
 $('soundPianoVolume').value=Math.round(v.piano*100);
 $('soundMetroVolume').value=Math.round(v.metronome*100);
 $('soundMasterVolume').value=Math.round(v.master*100);
 function update(){
   const p=Number($('soundPianoVolume').value)/100,m=Number($('soundMetroVolume').value)/100,master=Number($('soundMasterVolume').value)/100;
   AudioEngine.setVolume('piano',p);AudioEngine.setVolume('metronome',m);AudioEngine.setVolume('master',master);
   $('soundPianoValue').textContent=Math.round(p*100)+'%';
   $('soundMetroValue').textContent=Math.round(m*100)+'%';
   $('soundMasterValue').textContent=Math.round(master*100)+'%';
 }
 ['soundPianoVolume','soundMetroVolume','soundMasterVolume'].forEach(id=>$(id).addEventListener('input',update));
 update();
})();
