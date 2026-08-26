
(async()=>{
 const q=new URLSearchParams(location.search),id=q.get('song');const song=await Library.get(id);
 const rendered=ScoreRenderer.renderScore(scoreSheet,song);
 scoreTitle.textContent=song.title;scoreSubtitle.textContent=`${song.composer||''} ${song.subtitle||''}`.trim();
 scoreCategory.textContent=song.category||'—';scoreLevel.textContent=song.level||'—';scoreBpm.textContent=song.bpm||'—';scoreTime.textContent=(song.timeSig||[4,4]).join('/');scoreMeasures.textContent=rendered.totalMeasures;
 startMeasure.max=endMeasure.max=rendered.totalMeasures;endMeasure.value=Math.min(4,rendered.totalMeasures);
 practiceAll.href=`practice.html?song=${encodeURIComponent(song.id)}`;
 const favKey='piano-favorites-v52';
 function favs(){return Store.get(favKey,[])}function isFav(){return favs().includes(song.id)}
 function drawFav(){favoriteBtn.textContent=isFav()?'★ 已收藏':'☆ 收藏'}
 favoriteBtn.onclick=()=>{let f=favs();f=isFav()?f.filter(x=>x!==song.id):[...f,song.id];Store.set(favKey,f);drawFav()};drawFav();
 practiceRangeBtn.onclick=()=>rangeBox.style.display=rangeBox.style.display==='none'?'block':'none';
 openRange.onclick=()=>{let a=Math.max(1,Number(startMeasure.value)||1),b=Math.max(a,Number(endMeasure.value)||a);location.href=`practice.html?song=${encodeURIComponent(song.id)}&m1=${a}&m2=${b}`};
 Store.set('piano-recent-v52',[song.id,...Store.get('piano-recent-v52',[]).filter(x=>x!==song.id)].slice(0,30));
})();
