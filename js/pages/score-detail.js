
(async()=>{
 const q=new URLSearchParams(location.search),id=q.get('song');const song=await Library.get(id);
 let rendered={totalMeasures:song.measures||0};
 if(song.photoScore&&Array.isArray(song.pageImages)){
   scoreSheet.style.display='none';
   photoScoreView.style.display='block';
   photoScoreView.innerHTML=`<div class="kicker">PHOTO SCORE</div><h2>上傳教材譜面</h2>${song.pageImages.map((src,i)=>`<figure class="photo-score-page"><img src="../${src}" alt="${song.title} 第${i+1}頁"><figcaption>第 ${i+1} 頁${song.visibleMeasures?`｜小節 ${song.visibleMeasures}`:''}</figcaption></figure>`).join('')}<div class="status">目前依你上傳的頁面保存；未上傳的後續頁不會自行補入。</div>`;
 }else{
   rendered=ScoreRenderer.renderScore(scoreSheet,song);
 }
 scoreTitle.textContent=song.title;scoreSubtitle.textContent=`${song.composer||''} ${song.subtitle||''}`.trim();
 scoreCategory.textContent=song.category||'—';scoreLevel.textContent=song.level||'—';scoreBpm.textContent=song.bpm||'—';scoreTime.textContent=(song.timeSig||[4,4]).join('/');scoreMeasures.textContent=rendered.totalMeasures;
 startMeasure.max=endMeasure.max=rendered.totalMeasures;endMeasure.value=Math.min(4,rendered.totalMeasures);
 if(song.photoScore){practiceAll.textContent='照片譜模式';practiceAll.href='#';practiceAll.onclick=e=>{e.preventDefault();alert('此頁目前以原始照片樂譜保存；若要同步播放與自動判定，需要另外建立音符事件資料。')};practiceRangeBtn.style.display='none'}else{practiceAll.href=`practice.html?song=${encodeURIComponent(song.id)}`;}
 const favKey='piano-favorites-v52';
 function favs(){return Store.get(favKey,[])}function isFav(){return favs().includes(song.id)}
 function drawFav(){favoriteBtn.textContent=isFav()?'★ 已收藏':'☆ 收藏'}
 favoriteBtn.onclick=()=>{let f=favs();f=isFav()?f.filter(x=>x!==song.id):[...f,song.id];Store.set(favKey,f);drawFav()};drawFav();
 practiceRangeBtn.onclick=()=>rangeBox.style.display=rangeBox.style.display==='none'?'block':'none';
 openRange.onclick=()=>{let a=Math.max(1,Number(startMeasure.value)||1),b=Math.max(a,Number(endMeasure.value)||a);location.href=`practice.html?song=${encodeURIComponent(song.id)}&m1=${a}&m2=${b}`};
 Store.set('piano-recent-v52',[song.id,...Store.get('piano-recent-v52',[]).filter(x=>x!==song.id)].slice(0,30));
})();
