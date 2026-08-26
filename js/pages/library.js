
(async()=>{
  const all=await Library.load();
  const $=id=>document.getElementById(id);
  let page=1;const perPage=30;

  const cats=[...new Set(all.map(x=>x.category).filter(Boolean))].sort();
  const levels=[...new Set(all.map(x=>x.level).filter(Boolean))].sort();
  cats.forEach(x=>$('category').insertAdjacentHTML('beforeend',`<option>${x}</option>`));
  const urlCat=new URLSearchParams(location.search).get('category');
  if(urlCat && cats.includes(urlCat)) $('category').value=urlCat;
  levels.forEach(x=>$('level').insertAdjacentHTML('beforeend',`<option>${x}</option>`));

  const thousand=all.filter(x=>x.collection==='1000完整樂譜庫');
  $('libraryStats').textContent=`內建 V5.1 完整樂譜 ${thousand.length} 首｜全部可開啟練習｜另含舊曲庫與個人匯入樂譜`;

  function filtered(){
    const q=$('search').value.trim().toLowerCase(),c=$('category').value,l=$('level').value,quick=$('quick')?.value||'';
    const favs=Store.get('piano-favorites-v52',[]),recent=Store.get('piano-recent-v52',[]);
    let rows=all.filter(s=>
      (!q || (s.title||'').toLowerCase().includes(q) || (s.category||'').toLowerCase().includes(q) || (s.composer||'').toLowerCase().includes(q)) &&
      (!c || s.category===c) && (!l || s.level===l)
    );
    if(quick==='fav')rows=rows.filter(s=>favs.includes(s.id));
    if(quick==='recent')rows=recent.map(id=>rows.find(s=>s.id===id)).filter(Boolean);
    return rows;
  }
  function render(){
    const rows=filtered(),pages=Math.max(1,Math.ceil(rows.length/perPage));if(page>pages)page=pages;
    $('resultCount').textContent=`${rows.length} 首`;
    $('songList').innerHTML='';
    rows.slice((page-1)*perPage,page*perPage).forEach(s=>{
      const d=document.createElement('div');d.className='song-row';
      const fav=Store.get('piano-favorites-v52',[]).includes(s.id);
      d.innerHTML=`<div><strong>${fav?'★ ':''}${s.title}</strong><small>${s.category||''} · ${s.level||''} · ${s.bpm||''} BPM · ${s.photoScore?(s.visibleMeasures||'照片譜'):(s.measures||'')+' 小節'}${s.complete?' · 完整譜':''}${s.photoScore?' · 上傳教材':''}</small></div>
      <a class="btn" href="score-detail.html?song=${encodeURIComponent(s.id)}">看完整譜</a>
      <a class="btn primary" href="practice.html?song=${encodeURIComponent(s.id)}">練習</a>`;
      $('songList').appendChild(d);
    });
    $('pager').innerHTML='';
    const prev=document.createElement('button');prev.className='btn';prev.textContent='← 上一頁';prev.disabled=page<=1;prev.onclick=()=>{page--;render()};
    const info=document.createElement('span');info.className='tag';info.textContent=`${page} / ${pages}`;
    const next=document.createElement('button');next.className='btn';next.textContent='下一頁 →';next.disabled=page>=pages;next.onclick=()=>{page++;render()};
    $('pager').append(prev,info,next);
  }
  ['search','category','level','quick'].forEach(id=>$(id).oninput=()=>{page=1;render()});
  render();
})();
