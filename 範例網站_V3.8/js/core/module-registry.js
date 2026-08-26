
(function(){
  const defs={
    home:{
      label:'首頁 / 課程',
      keep:['homeView','coursesPanel'],
      required:['homeView','coursesPanel'],
      owners:['navigation','home']
    },
    library:{
      label:'樂譜庫',
      keep:['homeView','songsPanel'],
      required:['homeView','songsPanel','songList','songSearch'],
      owners:['navigation','library']
    },
    import:{
      label:'樂譜匯入',
      keep:['homeView','importPanel'],
      required:['homeView','importPanel','scoreFileInput','photoImportCard'],
      owners:['navigation','importer']
    },
    progress:{
      label:'學習進度',
      keep:['homeView','progressPanel'],
      required:['homeView','progressPanel','levelPath'],
      owners:['navigation','ai']
    },
    practice:{
      label:'鋼琴練習',
      keep:['practiceView'],
      required:['practiceView','scrollingScore','scrollingBassScore','playBtn','tempoInput'],
      owners:['navigation','practice','audio','ai','errors']
    },
    sound:{
      label:'鋼琴音色',
      keep:['practiceView','soundPackModal'],
      required:['practiceView','soundPackModal','soundPackList','pianoVoiceSelect'],
      owners:['navigation','audio','errors']
    },
    errors:{
      label:'錯誤診斷',
      keep:['practiceView','errorMonitorModal'],
      required:['practiceView','errorMonitorModal','errorLogList','repairScoreBtn'],
      owners:['navigation','errors','practice']
    }
  };

  function def(){return defs[window.PAGE_MODULE]||defs.home}

  window.ModuleRegistry={
    defs,
    current:def,
    owns(name){return def().owners.includes(name)},
    required(){return [...def().required]}
  };
})();
