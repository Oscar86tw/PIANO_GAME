
const preview=document.getElementById('preview'),photoInput=document.getElementById('photos');

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
  const root=document.getElementById('photoList'),rows=ScoreImporter.list();root.innerHTML='';
  if(!rows.length){root.innerHTML='<div class="empty">目前沒有拍照樂譜。</div>';return}
  rows.forEach(x=>{
    const d=document.createElement('div');d.className='song-row';
    d.innerHTML=`<div><strong>${x.title}</strong><small>${x.pages.length} 頁 · ${x.status}</small></div><button class="btn bad">刪除</button>`;
    d.querySelector('button').onclick=()=>{ScoreImporter.remove(x.id);renderPhotos()};
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

savePhoto.onclick=async()=>{
  if(!photoInput.files.length)return alert('請先加入照片');
  await ScoreImporter.savePhotoDraft({title:title.value,author:author.value},photoInput.files);
  photoInput.value='';preview.innerHTML='';renderPhotos();
  alert('已加入拍照樂譜，狀態：待 OMR');
};

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
