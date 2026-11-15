// Abre sempre do que está salvo no aparelho; atualiza em segundo plano quando há internet.
const CACHE="roda-v1";
const FILES=["./","index.html","spectral.min.js","manifest.webmanifest","icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png",
  "fonts/unbounded-latin-500-normal.woff2","fonts/unbounded-latin-700-normal.woff2","fonts/figtree-latin-400-normal.woff2",
  "fonts/figtree-latin-600-normal.woff2","fonts/jetbrains-mono-latin-500-normal.woff2"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);
  await self.clients.claim();
  for(const c of await self.clients.matchAll())c.postMessage("pronto");})());});
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const hit=await cache.match(e.request,{ignoreSearch:true})||(e.request.mode==="navigate"&&await cache.match("index.html"));
    const net=fetch(e.request).then(r=>{if(r.ok)cache.put(e.request,r.clone());return r;}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit;}
    return (await net)||new Response("Offline",{status:503});})());});
