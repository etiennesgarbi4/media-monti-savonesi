/* Copia locale dell'app: dopo la prima apertura con internet si apre anche senza campo. */
const CACHE='media-ms26-v1';
const CORE=['./','./index.html','./manifest.webmanifest'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
/* Prima la copia salvata (risposta immediata anche senza rete), poi aggiorna in sottofondo se c'è campo. */
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{ if(r&&(r.ok||r.type==='opaque')) c.put(e.request,r.clone()); return r; }).catch(()=>null);
    return hit||(await net)||(e.request.mode==='navigate'?c.match('./index.html'):Response.error());
  }));
});
