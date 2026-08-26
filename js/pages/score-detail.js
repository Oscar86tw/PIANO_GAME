
(async()=>{
 const q=new URLSearchParams(location.search),id=q.get('song');const song=await Library.get(id);
 const hasSyncEvents=Array.isArray(song.events)&&song.events.length>0;
 let rendered={totalMeasures:song.measures||0};
 if(song.photoScore&&Array.isArray(song.pageImages)){
   if(hasSyncEvents&&window.ScoreRenderer?.splitMeasures){const measures=ScoreRenderer.splitMeasures(song); rendered={measures,totalMeasures:measures.length};}
   scoreSheet.style.display='none';
   photoScoreView.style.display='block';
   const imgHtml=(await Promise.all(song.pageImages.map(async(src,i)=>{let realSrc;if(String(src).startsWith('idb:'))realSrc=await PhotoStore.url(String(src).slice(4));else realSrc=String(src).startsWith('data:')?src:`../${src}`;return `<figure class="photo-score-page"><img src="${realSrc||''}" alt="${song.title} 第${i+1}頁"><figcaption>第 ${i+1} 頁${song.visibleMeasures?`｜${song.visibleMeasures}`:''}</figcaption></figure>`}))).join('');
   photoScoreView.innerHTML=`<div class="kicker">PHOTO SCORE</div><h2>上傳教材譜面</h2>${hasSyncEvents?'<div class="status ok">已建立同步練習版：可以直接進入同步練習。</div>':'<div class="status">目前已加入曲庫。若要節拍器、五線譜與音符同步，請到「匯入樂譜」頁按「轉同步版」。</div>'}${imgHtml}`;
 }else{
   rendered=ScoreRenderer.renderScore(scoreSheet,song);
 }
 scoreTitle.textContent=song.title;scoreSubtitle.textContent=`${song.composer||song.author||''} ${song.subtitle||''}`.trim();
 scoreCategory.textContent=song.category||'—';scoreLevel.textContent=song.level||'—';scoreBpm.textContent=song.bpm||'—';scoreTime.textContent=(song.timeSig||[4,4]).join('/');scoreMeasures.textContent=rendered.totalMeasures;
 startMeasure.max=endMeasure.max=Math.max(1,rendered.totalMeasures||1);endMeasure.value=Math.min(4,Math.max(1,rendered.totalMeasures||1));
 if(song.photoScore&&!hasSyncEvents){practiceAll.textContent='照片譜模式';practiceAll.href='import.html';practiceAll.onclick=null;practiceRangeBtn.style.display='none'}else{practiceAll.textContent=hasSyncEvents?'開始同步練習':'全部練習';practiceAll.href=`practice.html?song=${encodeURIComponent(song.id)}`;practiceAll.onclick=null;practiceRangeBtn.style.display='inline-flex'}
 const favKey='piano-favorites-v52';
 function favs(){return Store.get(favKey,[])}function isFav(){return favs().includes(song.id)}
 function drawFav(){favoriteBtn.textContent=isFav()?'★ 已收藏':'☆ 收藏'}
 favoriteBtn.onclick=()=>{let f=favs();f=isFav()?f.filter(x=>x!==song.id):[...f,song.id];Store.set(favKey,f);drawFav()};drawFav();
 practiceRangeBtn.onclick=()=>rangeBox.style.display=rangeBox.style.display==='none'?'block':'none';
 openRange.onclick=()=>{let a=Math.max(1,Number(startMeasure.value)||1),b=Math.max(a,Number(endMeasure.value)||a);location.href=`practice.html?song=${encodeURIComponent(song.id)}&m1=${a}&m2=${b}`};
 Store.set('piano-recent-v52',[song.id,...Store.get('piano-recent-v52',[]).filter(x=>x!==song.id)].slice(0,30));
})();
