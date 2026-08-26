
const preview=document.getElementById('preview'),photoInput=document.getElementById('photos');
const syncBuilderSection=document.getElementById('syncBuilderSection');
const syncBuilderTitle=document.getElementById('syncBuilderTitle');
const syncTemplate=document.getElementById('syncTemplate');
const syncBpm=document.getElementById('syncBpm');
const syncBeats=document.getElementById('syncBeats');
const syncBeatUnit=document.getElementById('syncBeatUnit');
const syncMeasures=document.getElementById('syncMeasures');
const syncCategory=document.getElementById('syncCategory');
const syncSave=document.getElementById('syncSave');
const syncCancel=document.getElementById('syncCancel');
const syncBuilderStatus=document.getElementById('syncBuilderStatus');
let activePhotoId='';

photoInput.onchange=()=>{
  preview.innerHTML='';
  [...photoInput.files].forEach((f,i)=>{
    const d=document.createElement('div');d.className='preview-card';
    const img=document.createElement('img');img.src=URL.createObjectURL(f);
    img.onload=()=>URL.revokeObjectURL(img.src);
    d.append(img);
    d.insertAdjacentHTML('beforeend',`<div>第 ${i+1} 頁 · ${f.name}</div>`);
    preview.append(d);
  });
};

function renderPhotos(){
  const root=document.getElementById('photoList'),rows=ScoreImporter.listPhotos();root.innerHTML='';
  if(!rows.length){root.innerHTML='<div class="empty">目前沒有拍照樂譜。</div>';return}
  rows.forEach(x=>{
    const d=document.createElement('div');d.className='song-row';
    d.innerHTML=`<div><strong>${x.title}</strong><small>${x.pageCount||x.pageImages?.length||0} 頁 · ${x.syncReady?'已轉同步練習版':'已上傳曲庫，待轉同步版'} · ${x.bpm||'—'} BPM</small></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
      <a class="btn" href="score-detail.html?song=${encodeURIComponent(x.id)}">查看</a>
      <button class="btn primary build">${x.syncReady?'更新同步版':'轉同步版'}</button>
      ${x.syncReady?`<a class="btn primary" href="practice.html?song=${encodeURIComponent(x.id)}">練習</a>`:''}
      <button class="btn bad del">刪除</button>
    </div>`;
    d.querySelector('.build').onclick=()=>openBuilder(x);
    d.querySelector('.del').onclick=()=>{if(confirm(`刪除「${x.title}」？`)){ScoreImporter.removePhoto(x.id);renderPhotos();if(activePhotoId===x.id)closeBuilder()}};
    root.append(d);
  });
}

function renderDigital(){
  const root=document.getElementById('digitalScoreList'),rows=ScoreImporter.listImported();root.innerHTML='';
  if(!rows.length){root.innerHTML='<div class="empty">目前沒有 MusicXML / MIDI 匯入樂譜。</div>';return}
  [...rows].reverse().forEach(x=>{
    const d=document.createElement('div');d.className='song-row';
    d.innerHTML=`<div><strong>${x.title}</strong><small>${x.sourceType} · ${x.bpm} BPM · ${x.timeSig.join('/')} · ${x.events.length} events</small></div>
      <a class="btn primary" href="practice.html?song=${encodeURIComponent(x.id)}">練習</a>
      <button class="btn bad">刪除</button>`;
    d.querySelector('.bad').onclick=()=>{ScoreImporter.removeImported(x.id);renderDigital()};
    root.append(d);
  });
}

function openBuilder(song){
  activePhotoId=song.id;
  syncBuilderSection.style.display='block';
  syncBuilderTitle.textContent=`轉成同步練習版｜${song.title}`;
  syncBpm.value=song.bpm||88;
  syncBeats.value=(song.timeSig&&song.timeSig[0])||4;
  syncBeatUnit.value=(song.timeSig&&song.timeSig[1])||4;
  syncMeasures.value=song.measures||16;
  syncCategory.value=song.category&&song.category!=='我的拍照樂譜'?song.category:'我的拍照樂譜 / 同步版';
  syncBuilderStatus.textContent=song.syncReady?'這首目前已有同步版，可重新轉換更新。':'設定好後可直接轉成同步練習版。';
  syncBuilderStatus.className='status';
  syncBuilderSection.scrollIntoView({behavior:'smooth',block:'start'});
}
function closeBuilder(){activePhotoId='';syncBuilderSection.style.display='none'}

savePhoto.onclick=async()=>{
  if(!photoInput.files.length)return alert('請先加入照片');
  savePhoto.disabled=true;
  try{
    await ScoreImporter.savePhotoToLibrary({title:title.value,author:author.value},photoInput.files);
    photoInput.value='';preview.innerHTML='';title.value='';author.value='';
    renderPhotos();
    alert('已拍照上傳，並加入曲庫。現在可以按「轉同步版」。');
  }catch(e){
    alert('照片加入曲庫失敗：'+e.message);
    ErrorClient.report('PhotoImport',e,{title:'照片加入曲庫失敗'});
  }finally{savePhoto.disabled=false}
};

syncSave.onclick=()=>{
  if(!activePhotoId)return;
  try{
    const song=ScoreImporter.convertPhotoToSync(activePhotoId,{template:syncTemplate.value,bpm:Number(syncBpm.value),timeSig:[Number(syncBeats.value),Number(syncBeatUnit.value)],measures:Number(syncMeasures.value),category:syncCategory.value.trim()});
    syncBuilderStatus.textContent=`已完成：${song.title} 已轉成同步練習版，可直接進入練習。`;
    syncBuilderStatus.className='status ok';
    renderPhotos();
  }catch(e){
    syncBuilderStatus.textContent='轉換失敗：'+e.message;
    syncBuilderStatus.className='status bad';
    ErrorClient.report('SyncBuilder',e,{title:'照片樂譜轉同步版失敗'});
  }
};
syncCancel.onclick=closeBuilder;

digitalScoreFile.onchange=async()=>{
  const file=digitalScoreFile.files[0];
  if(!file)return;
  digitalImportStatus.textContent='正在解析 '+file.name+'…';
  digitalImportStatus.className='status warn';
  digitalImportDetail.style.display='none';
  try{
    const result=await ScoreImporter.importFile(file);
    digitalImportStatus.textContent=result.message;
    digitalImportStatus.className='status ok';
    if(result.warning){
      digitalImportDetail.textContent=result.warning;
      digitalImportDetail.className='status warn';
      digitalImportDetail.style.display='block';
    }
    renderDigital();
  }catch(e){
    digitalImportStatus.textContent='匯入失敗：'+e.message;
    digitalImportStatus.className='status bad';
    ErrorClient.report('Importer',e,{title:'MusicXML / MIDI 匯入失敗'});
  }
};

renderPhotos();renderDigital();
