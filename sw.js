const C='estoque-v6';
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
// avisos das 8h e 10h: o servidor só "cutuca"; aqui o app busca o resumo e mostra
self.addEventListener('push',e=>{e.waitUntil((async()=>{
  let t='Estoque LOGARI',b='Toque para ver o que falta hoje.';
  try{const c=await caches.open('est-cfg'),r=await c.match('cfg');if(r){const{api,pin}=await r.json();const j=await(await fetch(api,{method:'POST',body:JSON.stringify({pin,action:'aviso',p:{}})})).json();if(j.ok&&j.aviso){t=j.aviso.t;b=j.aviso.b}}}catch(x){}
  await self.registration.showNotification(t,{body:b,icon:'icon-192.png',badge:'icon-192.png',tag:'aviso',renotify:true});
})())});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l)if('focus' in c)return c.focus();return clients.openWindow('./')}))});
