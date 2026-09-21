// Drift SW v2 — busts old Dio cache
const C='drift-v2';const A=['./','./index.html?v=2','./index.html','./styles.css','./app.js','./manifest.webmanifest','./assets/logo.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(cc=>cc.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
