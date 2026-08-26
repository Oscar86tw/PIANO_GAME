
(function(){
  const KEY='pianoLearningErrorsV38';
  let records=[];
  let installed=false;

  function load(){
    try{records=JSON.parse(sessionStorage.getItem(KEY)||'[]')}catch(e){records=[]}
    if(!Array.isArray(records))records=[];
    return records;
  }
  function save(){
    try{sessionStorage.setItem(KEY,JSON.stringify(records.slice(-50)))}catch(e){}
  }
  function normalize(err){
    if(err instanceof Error)return {message:err.message||String(err),stack:err.stack||''};
    if(typeof err==='string')return {message:err,stack:''};
    try{return {message:JSON.stringify(err),stack:''}}catch(e){return {message:String(err),stack:''}}
  }
  function advice(area,msg=''){
    const t=(String(area)+' '+String(msg)).toLowerCase();
    if(t.includes('樂譜')||t.includes('score'))return '按「重新建立樂譜」。若仍異常，複製錯誤資訊給 AI。';
    if(t.includes('midi'))return '確認 MIDI 裝置已連接，再重新連接 MIDI。';
    if(t.includes('麥克風')||t.includes('microphone'))return '確認瀏覽器麥克風權限與 HTTPS。';
    if(t.includes('音色')||t.includes('sample')||t.includes('audio'))return '先切回 Lite Piano，再檢查音色檔案。';
    if(t.includes('photo')||t.includes('照片')||t.includes('indexeddb'))return '確認裝置儲存空間，再重新操作。';
    return '重新操作一次；若仍發生，複製錯誤資訊貼給 AI。';
  }
  function report(area,err,opt={}){
    const info=normalize(err);
    const rec={
      id:Date.now()+'_'+Math.random().toString(36).slice(2,7),
      at:new Date().toISOString(),
      localTime:new Date().toLocaleString('zh-TW',{hour12:false}),
      area:area||'系統',
      title:opt.title||'功能發生錯誤',
      message:info.message||'未知錯誤',
      stack:info.stack||opt.detail||'',
      advice:opt.advice||advice(area,info.message),
      version:'V3.8',
      url:location.href,
      userAgent:navigator.userAgent
    };
    records.push(rec);
    records=records.slice(-50);
    save();
    console.error('[PIANO ERROR]',rec);
    try{window.dispatchEvent(new CustomEvent('piano:error-recorded',{detail:rec}))}catch(e){}
    return rec;
  }
  function clear(){records=[];save();return []}
  function all(){return records.slice()}
  function latest(){return records[records.length-1]||null}

  load();

  // Compatibility API used by legacy core code.
  window.reportAppError=report;

  if(!installed){
    installed=true;
    window.addEventListener('error',e=>report('JavaScript',e.error||e.message,{title:'程式執行錯誤'}));
    window.addEventListener('unhandledrejection',e=>report('非同步功能',e.reason||'Promise rejected',{title:'非同步功能失敗'}));
  }

  window.AppErrorClient={report,all,latest,clear,load,save,normalize,advice};
})();
