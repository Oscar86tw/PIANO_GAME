
(function(){
  function setActivePanel(tab){
    document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.toggle('active',p.id===tab+'Panel'));
  }

  window.PageBootstrap={
    init(tab){
      document.documentElement.dataset.pageModule=window.PAGE_MODULE||'home';
      setActivePanel(tab);
      const badge=document.querySelector('.version-badge');
      if(badge)badge.textContent='VERSION V3.4';
    },
    openPracticeFromQuery(){
      let song=null,label='PLAY';
      const q=new URLSearchParams(location.search);
      song=q.get('song');
      label=q.get('label')||label;
      if(!song){
        try{
          const pending=JSON.parse(sessionStorage.getItem('pianoPendingPractice')||'null');
          song=pending?.songId||null;
          label=pending?.label||label;
        }catch(e){}
      }
      if(song && window.songs?.[song]){
        openPractice(song,label);
      }else{
        const fallback=window.songs?.sight?'sight':Object.keys(window.songs||{})[0];
        if(fallback)openPractice(fallback,'PRACTICE');
      }
    }
  };
})();
