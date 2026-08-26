window.PhotoStore=(function(){
  const DB='PianoLearningPhotoStoreV64',STORE='pages',VERSION=1;
  let dbp=null;
  function db(){
    if(dbp)return dbp;
    dbp=new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB,VERSION);
      req.onupgradeneeded=()=>{const d=req.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:'id'})};
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
    });
    return dbp;
  }
  async function put(blob,meta={}){
    const d=await db(),id=meta.id||('photo_'+Date.now()+'_'+Math.random().toString(36).slice(2));
    await new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).put({id,blob,createdAt:Date.now(),...meta});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
    return id;
  }
  async function get(id){const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction(STORE).objectStore(STORE).get(id);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})}
  async function remove(id){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
  async function removeMany(ids){for(const id of ids||[])await remove(id)}
  async function url(id){const row=await get(id);return row?.blob?URL.createObjectURL(row.blob):null}
  async function estimate(){if(navigator.storage?.estimate){const x=await navigator.storage.estimate();return {usage:x.usage||0,quota:x.quota||0}}return {usage:0,quota:0}}
  return {put,get,remove,removeMany,url,estimate};
})();