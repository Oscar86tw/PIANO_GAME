
window.Library={
  songs:[],
  async load(){
    if(!this.songs.length){
      const [builtins,academy,personal] = await Promise.all([
        fetch(AppBase+'data/songs.json').then(r=>r.json()).catch(()=>[]),
        fetch(AppBase+'data/scores-1000.json').then(r=>r.json()).catch(()=>[]),
        fetch(AppBase+'data/personal-scores.json').then(r=>r.json()).catch(()=>[])
      ]);
      const imported=Store.get('imported-scores-v41',[]);
      const photoLibrary=Store.get('photo-library-v61',[]);
      this.songs=[...photoLibrary,...personal,...builtins,...academy,...imported];
    }
    return this.songs;
  },
  async reload(){this.songs=[];return this.load()},
  async get(id){await this.load();return this.songs.find(x=>x.id===id)||this.songs[0]},
  async stats(){await this.load();const map={};this.songs.forEach(s=>map[s.category]=(map[s.category]||0)+1);return {total:this.songs.length,categories:map}}
};
