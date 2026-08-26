const preview=document.getElementById('preview');
const cameraInput=document.getElementById('cameraInput');
const galleryInput=document.getElementById('galleryInput');
const cameraBtn=document.getElementById('cameraBtn');
const cameraNextBtn=document.getElementById('cameraNextBtn');
const galleryBtn=document.getElementById('galleryBtn');
const clearPhotosBtn=document.getElementById('clearPhotosBtn');
const photoCountBadge=document.getElementById('photoCountBadge');
const cameraHint=document.getElementById('cameraHint');
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
let pendingPhotos=[];

function updatePhotoStatus(){
  photoCountBadge.textContent=`${pendingPhotos.length} 頁`;
  cameraHint.textContent=pendingPhotos.length?`已加入 ${pendingPhotos.length} 頁，可繼續拍下一頁或調整順序`:'尚未加入照片';
  savePhoto.disabled=pendingPhotos.length===0;
  cameraBtn.textContent=pendingPhotos.length?'📷 重新拍第一頁':'📷 拍第一頁';
}
function addFiles(files,replaceFirst=false){
  const rows=[...files].filter(f=>f.type.startsWith('image/'));
  if(!rows.length)return;
  if(replaceFirst&&pendingPhotos.length)pendingPhotos[0]=rows[0];
  else pendingPhotos.push(...rows);
  renderPendingPhotos();
}
function movePhoto(index,delta){
  const ni=index+delta;if(ni<0||ni>=pendingPhotos.length)return;
  [pendingPhotos[index],pendingPhotos[ni]]=[pendingPhotos[ni],pendingPhotos[index]];
  renderPendingPhotos();
}
function removePending(index){pendingPhotos.splice(index,1);renderPendingPhotos()}
function renderPendingPhotos(){
  preview.innerHTML='';
  pendingPhotos.forEach((f,i)=>{
    const d=document.createElement('div');d.className='preview-card';
    const img=document.createElement('img'),url=URL.createObjectURL(f);img.src=url;img.onload=()=>URL.revokeObjectURL(url);d.append(img);
    d.insertAdjacentHTML('beforeend',`<div class="preview-meta">第 ${i+1} 頁 · ${f.name||'相機照片'}</div><div class="preview-actions"><button class="up">← 前移</button><button class="down">後移 →</button><button class="bad remove">刪除</button></div>`);
    d.querySelector('.up').onclick=()=>movePhoto(i,-1);
    d.querySelector('.down').onclick=()=>movePhoto(i,1);
    d.querySelector('.remove').onclick=()=>removePending(i);
    preview.append(d);
  });
  updatePhotoStatus();
}

cameraBtn.onclick=()=>{cameraInput.dataset.mode=pendingPhotos.length?'replace-first':'append';cameraInput.click()};
cameraNextBtn.onclick=()=>{cameraInput.dataset.mode='append';cameraInput.click()};
galleryBtn.onclick=()=>galleryInput.click();
cameraInput.onchange=()=>{if(cameraInput.files.length)addFiles(cameraInput.files,cameraInput.dataset.mode==='replace-first');cameraInput.value=''};
galleryInput.onchange=()=>{if(galleryInput.files.length)addFiles(galleryInput.files,false);galleryInput.value=''};
clearPhotosBtn.onclick=()=>{if(pendingPhotos.length&&confirm('清除這次尚未加入曲庫的所有照片？')){pendingPhotos=[];renderPendingPhotos()}};

savePhoto.onclick=async()=>{
  if(!pendingPhotos.length)return alert('請先拍照或從相簿加入樂譜');
  savePhoto.disabled=true;
  try{
    const saved=await ScoreImporter.savePhotoToLibrary({title:title.value,author:author.value},pendingPhotos);
    pendingPhotos=[];renderPendingPhotos();title.value='';author.value='';
    renderPhotos();
    alert(`已加入曲庫：${saved.title}。現在可以直接按「轉同步版」。`);
  }catch(e){
    alert('照片加入曲庫失敗：'+e.message);
    ErrorClient.report('PhotoImport',e,{title:'照片加入曲庫失敗'});
  }finally{updatePhotoStatus()}
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

updatePhotoStatus();
