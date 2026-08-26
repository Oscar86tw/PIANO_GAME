
(function(){const map=new Map();window.Events={on(type,fn){if(!map.has(type))map.set(type,new Set());map.get(type).add(fn);return()=>map.get(type)?.delete(fn)},emit(type,payload){for(const fn of [...(map.get(type)||[])]){try{fn(payload)}catch(e){window.ErrorClient?.report('Events',e)}}}}})();
