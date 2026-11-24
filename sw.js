const C='estoque-v5';
const ARQ=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
const FONTES=/fonts\.(googleapis|gstatic)\.com/;
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(ARQ)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  // fontes: guarda para sempre (abrem na hora, até sem internet)
  if(FONTES.test(u.hostname)){e.respondWith(caches.match(r).then(m=>m||fetch(r).then(n=>{const cp=n.clone();caches.open(C).then(c=>c.put(r,cp));return n})));return}
  if(u.origin!==location.origin)return;
  // app: abre do celular na hora e atualiza por trás para a próxima vez
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>{
    const rede=fetch(r).then(n=>{if(n.ok){const cp=n.clone();caches.open(C).then(c=>c.put(r,cp))}return n}).catch(()=>m||caches.match('index.html'));
    if(m){e.waitUntil(rede);return m}
    return rede;
  }));
});
