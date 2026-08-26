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
const editPhotoSection=document.getElementById('editPhotoSection');
const editPhotoTitle=document.getElementById('editPhotoTitle');
const editTitle=document.getElementById('editTitle');
const editAuthor=document.getElementById('editAuthor');
const editCategory=document.getElementById('editCategory');
const editBpm=document.getElementById('editBpm');
const editBeats=document.getElementById('editBeats');
const editBeatUnit=document.getElementById('editBeatUnit');
const editMeasures=document.getElementById('editMeasures');
const editCameraInput=document.getElementById('editCameraInput');
const editGalleryInput=document.getElementById('editGalleryInput');
const editCameraBtn=document.getElementById('editCameraBtn');
const editGalleryBtn=document.getElementById('editGalleryBtn');
const editSaveBtn=document.getElementById('editSaveBtn');
const editCancelBtn=document.getElementById('editCancelBtn');
const editPageList=document.getElementById('editPageList');
const editPhotoStatus=document.getElementById('editPhotoStatus');
let editingPhotoId='';
let editObjectUrls=[];
let activePhotoId='';
let pendingPhotos=[];
async function refreshStorage(){try{const x=await PhotoStore.estimate();const mb=n=>n?Math.round(n/1024/1024):0;storageBadge.textContent=x.quota?`儲存空間：${mb(x.usage)} / ${mb(x.quota)} MB`:`儲存空間：可用`; }catch(e){storageBadge.textContent=`儲存空間：可用`}}

function updatePhotoStatus(){
  photoCountBadge.textContent=`${pendingPhotos.length} 頁`;
  cameraHint.textContent=pendingPhotos.length?`已加入 ${pendingPhotos.length} 頁，可繼續拍下一頁或調整順序`:'尚未加入照片';
  savePhoto.disabled=pendingPhotos.length===0;
  cameraBtn.textContent=pendingPhotos.length?'📷 重新拍第一頁':'📷 拍第一頁';
}
function addFiles(files,replaceFirst=false){
  const rows=[...files].filter(f=>f.type.startsWith('image/'));
  if(!rows.length)return;
  const wrapped=rows.map(file=>({file,rotation:0}));
  if(replaceFirst&&pendingPhotos.length)pendingPhotos[0]=wrapped[0];
  else pendingPhotos.push(...wrapped);
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
  pendingPhotos.forEach((row,i)=>{
    const f=row.file,d=document.createElement('div');d.className='preview-card';
    const img=document.createElement('img'),url=URL.createObjectURL(f);img.src=url;img.style.transform=`rotate(${row.rotation||0}deg)`;img.onload=()=>URL.revokeObjectURL(url);d.append(img);
    d.insertAdjacentHTML('beforeend',`<div class="preview-meta">第 ${i+1} 頁 · ${f.name||'相機照片'} · ${row.rotation||0}°</div><div class="preview-actions"><button class="up">← 前移</button><button class="down">後移 →</button><button class="rotate">↻ 旋轉</button><button class="bad remove">刪除</button></div>`);
    d.querySelector('.up').onclick=()=>movePhoto(i,-1);
    d.querySelector('.down').onclick=()=>movePhoto(i,1);
    d.querySelector('.rotate').onclick=()=>{pendingPhotos[i].rotation=((pendingPhotos[i].rotation||0)+90)%360;renderPendingPhotos()};
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
  }finally{updatePhotoStatus();refreshStorage()}
};

function renderPhotos(){
  const root=document.getElementById('photoList'),rows=ScoreImporter.listPhotos();root.innerHTML='';
  if(!rows.length){root.innerHTML='<div class="empty">目前沒有拍照樂譜。</div>';return}
  rows.forEach(x=>{
    const d=document.createElement('div');d.className='song-row';
    d.innerHTML=`<div><strong>${x.title}</strong><small>${x.pageCount||x.pageImages?.length||0} 頁 · ${x.syncReady?'已轉同步練習版':'已上傳曲庫，待轉同步版'} · ${x.bpm||'—'} BPM</small></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
      <a class="btn" href="score-detail.html?song=${encodeURIComponent(x.id)}">查看</a>
      <button class="btn edit">編輯</button>
      <button class="btn primary build">${x.syncReady?'更新同步版':'轉同步版'}</button>
      ${x.syncReady?`<a class="btn primary" href="practice.html?song=${encodeURIComponent(x.id)}">練習</a>`:''}
      <button class="btn bad del">刪除</button>
    </div>`;
    d.querySelector('.edit').onclick=()=>openEditor(x);
    d.querySelector('.build').onclick=()=>openBuilder(x);
    d.querySelector('.del').onclick=async()=>{if(confirm(`刪除「${x.title}」？`)){await ScoreImporter.removePhoto(x.id);renderPhotos();refreshStorage();if(activePhotoId===x.id)closeBuilder()}};
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


async function renderEditPages(){
  editObjectUrls.forEach(u=>URL.revokeObjectURL(u)); editObjectUrls=[]; editPageList.innerHTML='';
  const song=ScoreImporter.getPhoto(editingPhotoId); if(!song)return;
  const pages=song.pageImages||[];
  for(let i=0;i<pages.length;i++){
    const ref=pages[i],card=document.createElement('div');card.className='preview-card';
    const img=document.createElement('img'); let src='';
    if(String(ref).startsWith('idb:')){src=await PhotoStore.url(String(ref).slice(4)); if(src)editObjectUrls.push(src)} else src=ref;
    img.src=src||''; card.append(img);
    card.insertAdjacentHTML('beforeend',`<div class="preview-meta">第 ${i+1} 頁</div><div class="preview-actions"><button class="up">← 前移</button><button class="down">後移 →</button><button class="bad remove">刪除此頁</button></div>`);
    card.querySelector('.up').onclick=()=>{ScoreImporter.movePhotoPage(editingPhotoId,i,-1);renderEditPages();renderPhotos()};
    card.querySelector('.down').onclick=()=>{ScoreImporter.movePhotoPage(editingPhotoId,i,1);renderEditPages();renderPhotos()};
    card.querySelector('.remove').onclick=async()=>{if(confirm(`刪除第 ${i+1} 頁？`)){const result=await ScoreImporter.removePhotoPage(editingPhotoId,i);renderPhotos();refreshStorage();if(!result){closeEditor();return}renderEditPages()}};
    editPageList.append(card);
  }
}
function openEditor(song){
  editingPhotoId=song.id; editPhotoSection.style.display='block'; editPhotoTitle.textContent=`編輯｜${song.title}`;
  editTitle.value=song.title||''; editAuthor.value=song.author||song.composer||''; editCategory.value=song.category||'我的拍照樂譜'; editBpm.value=song.bpm||88;
  editBeats.value=song.timeSig?.[0]||4; editBeatUnit.value=song.timeSig?.[1]||4; editMeasures.value=song.measures||0;
  editPhotoStatus.textContent=`目前 ${song.pageImages?.length||0} 頁，可修改資料、補拍或刪頁。`; editPhotoStatus.className='status'; renderEditPages(); editPhotoSection.scrollIntoView({behavior:'smooth',block:'start'});
}
function closeEditor(){editingPhotoId='';editPhotoSection.style.display='none';editObjectUrls.forEach(u=>URL.revokeObjectURL(u));editObjectUrls=[]}
editSaveBtn.onclick=()=>{
  if(!editingPhotoId)return;
  try{
    const song=ScoreImporter.updatePhotoMeta(editingPhotoId,{title:editTitle.value,author:editAuthor.value,category:editCategory.value,bpm:Number(editBpm.value),timeSig:[Number(editBeats.value),Number(editBeatUnit.value)],measures:Number(editMeasures.value)});
    editPhotoTitle.textContent=`編輯｜${song.title}`; editPhotoStatus.textContent='✓ 修改已儲存'; editPhotoStatus.className='status ok'; renderPhotos();
  }catch(e){editPhotoStatus.textContent='修改失敗：'+e.message;editPhotoStatus.className='status bad'}
};
editCancelBtn.onclick=closeEditor;
editCameraBtn.onclick=()=>editCameraInput.click(); editGalleryBtn.onclick=()=>editGalleryInput.click();
async function addEditFiles(files){
  if(!editingPhotoId||!files?.length)return; editPhotoStatus.textContent='正在加入新頁面…'; editPhotoStatus.className='status warn';
  try{await ScoreImporter.appendPhotoPages(editingPhotoId,[...files].filter(f=>f.type.startsWith('image/')).map(file=>({file,rotation:0}))); editPhotoStatus.textContent='✓ 新頁面已加入';editPhotoStatus.className='status ok'; await renderEditPages();renderPhotos();refreshStorage()}
  catch(e){editPhotoStatus.textContent='加入頁面失敗：'+e.message;editPhotoStatus.className='status bad'}
}
editCameraInput.onchange=async()=>{await addEditFiles(editCameraInput.files);editCameraInput.value=''};
editGalleryInput.onchange=async()=>{await addEditFiles(editGalleryInput.files);editGalleryInput.value=''};

renderPhotos();renderDigital();refreshStorage();

updatePhotoStatus();
