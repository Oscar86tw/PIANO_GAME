
(async()=>{
  const curriculum=await fetch('../data/curriculum.json').then(r=>r.json());
  await LessonEngine.load();
  const $=id=>document.getElementById(id);
  const starsText=n=>'★'.repeat(n)+'☆'.repeat(5-n);

  function lessonHref(grade,lesson){
    return `lesson.html?grade=${grade}&lesson=${encodeURIComponent(lesson.id)}&type=${encodeURIComponent(lesson.type)}`;
  }

  function joinShort(arr,n=3){return (arr||[]).slice(0,n).join('、')}

  function render(){
    const progress=Progression.refreshUnlocks(curriculum);
    const unlocked=[...progress.unlockedGrades].sort((a,b)=>a-b);
    $('currentGrade').textContent=(unlocked[0]||10)+'級';
    $('totalStars').textContent=(progress.totalStars||0)+' ★';
    $('todayMinutes').textContent=Progression.todayMinutes()+' 分';

    const root=$('gradePath');root.innerHTML='';
    curriculum.forEach(level=>{
      const open=Progression.isUnlocked(level.grade);
      const got=Progression.gradeStars(curriculum,level.grade);
      const domains=Progression.domainStatus(curriculum,level.grade);
      const threshold=level.mastery.minimumTotalStars;
      const pct=Math.min(100,Math.round(got/threshold*100));
      const complete=Progression.gradeCompleted(curriculum,level.grade);

      const lessonHtml=level.lessons.map(l=>{
        const rec=Progression.lesson(l.id),stars=rec.stars||0,passed=stars>=level.mastery.minimumEachDomainStars;
        return `<div class="lesson-card ${open?'':'disabled'}">
          <strong>${l.title}</strong>
          <small>${l.target}</small>
          <div class="lesson-stars">${starsText(stars)}</div>
          <small class="${passed?'domain-pass':'domain-fail'}">${passed?'✓ 已達教學標準':'需至少 3 ★'}</small>
          ${open?`<a class="btn primary" href="${lessonHref(level.grade,l)}">開始</a>`:`<button class="btn" disabled>尚未解鎖</button>`}
        </div>`;
      }).join('');

      const card=document.createElement('article');
      card.className='grade-card '+(open?'unlocked':'locked');
      card.innerHTML=`
        <div class="grade-head">
          <div class="grade-title">
            <h2>${level.title}</h2>
            <small>${level.stage}｜${level.goal}</small>
          </div>
          <span class="grade-lock">${open?(complete?'✓ 本級達標':'已解鎖'):'🔒 鎖定'}</span>
        </div>

        <div class="grade-objectives">
          <div><small>調性 / 技巧</small><span>${joinShort(level.keys)}；${joinShort(level.technique)}</span></div>
          <div><small>節奏</small><span>${joinShort(level.rhythm,4)}</span></div>
          <div><small>五線譜 / 視奏</small><span>${joinShort(level.reading,3)}；${level.sight.hands} ${level.sight.length} 音</span></div>
          <div><small>聽力 / 曲目</small><span>${joinShort(level.aural,3)}；${joinShort(level.repertoire,2)}</span></div>
        </div>

        <div class="star-meter">
          <div class="star-meter-bar"><div class="star-meter-fill" style="width:${pct}%"></div></div>
          <div class="star-meter-text">
            <span>本級 ${got} / 20 ★</span>
            <span>總門檻 ${threshold} ★＋每類至少 3 ★</span>
          </div>
        </div>

        <div class="lesson-grid">${lessonHtml}</div>
        <details class="grade-detail">
          <summary>查看 ${level.grade}級實際教材內容</summary>
          <div class="grade-detail-body" id="gradeDetail_${level.grade}"></div>
        </details>
        <div class="mastery-gate">${
          level.grade===1
          ? '1級完成後進入進階曲目、技巧與自主演奏，不再只靠遊戲化關卡。'
          : complete
          ? `四類能力均達標，${level.grade-1}級已可解鎖。`
          : open
          ? `升級條件：技巧、視奏、聽力、曲目各 ≥ 3★，總星星 ≥ ${threshold}★。`
          : `請先通過 ${level.grade+1}級四個核心能力。`
        }</div>
      `;
      root.appendChild(card);
      const detail=card.querySelector(`#gradeDetail_${level.grade}`);
      const overview=LessonEngine.gradeOverview(level.grade);
      if(detail&&overview){
        detail.innerHTML=`
          <div><strong>技巧練習</strong><ul>${overview.technique.map(x=>`<li>${x.title}${x.bpm?` · ${x.bpm} BPM`:''}</li>`).join('')}</ul></div>
          <div><strong>視奏題型</strong><ul>${overview.sight.map(x=>`<li>${x.name} · ${x.length} 音</li>`).join('')}</ul></div>
          <div><strong>聽力題型</strong><ul>${overview.aural.map(x=>`<li>${x}</li>`).join('')}</ul></div>
          <div><strong>曲目任務</strong><ul>${overview.repertoire.map(x=>`<li>${x}</li>`).join('')}</ul></div>
        `;
      }
    });
  }

  $('refreshBtn').onclick=render;
  $('resetCourseBtn').onclick=()=>{
    if(confirm('要重設 V4.6 正規課程進度嗎？')){Progression.reset();render()}
  };
  Events.on('progress:changed',render);
  render();
})();
