
window.Store={get(key,fallback=null){try{const v=localStorage.getItem(key);return v==null?fallback:JSON.parse(v)}catch(e){return fallback}},set(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){return false}},remove(key){try{localStorage.removeItem(key)}catch(e){}}};
