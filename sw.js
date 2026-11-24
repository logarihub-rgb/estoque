const C='estoque-v8';
const ARQ=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
const FONTES=/fonts\.(googleapis|gstatic)\.com/;
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(ARQ.map(x=>new Request(x,{cache:'reload'})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x.startsWith('estoque-')).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  // fontes: guarda para sempre (abrem na hora, até sem internet)
  if(FONTES.test(u.hostname)){e.respondWith(caches.match(r).then(m=>m||fetch(r).then(n=>{const cp=n.clone();caches.open(C).then(c=>c.put(r,cp));return n})));return}
  if(u.origin!==location.origin)return;
  // app: abre do celular na hora e atualiza por trás para a próxima vez
  const K=u.origin+u.pathname;e.respondWith(caches.match(K).then(m=>{
    const rede=fetch(r).then(n=>{if(n.ok){const cp=n.clone();caches.open(C).then(c=>c.put(K,cp))}return n}).catch(()=>m||caches.match('index.html'));
    if(m){e.waitUntil(rede);return m}
    return rede;
  }));
});
// avisos: o servidor só "cutuca"; aqui o app busca as mensagens deste celular e mostra
self.addEventListener('push',e=>{e.waitUntil((async()=>{
  let L=[{t:'Estoque LOGARI',b:'Toque para ver o que falta hoje.',tag:'aviso'}];
  try{const c=await caches.open('est-cfg'),r=await c.match('cfg');if(r){const{api,pin}=await r.json(),s=await self.registration.pushManager.getSubscription();
    const j=await(await fetch(api,{method:'POST',body:JSON.stringify({pin,action:'aviso',p:{endpoint:s?s.endpoint:''}})})).json();
    if(j.ok&&j.avisos&&j.avisos.length)L=j.avisos;else if(j.ok&&j.aviso)L=[Object.assign({tag:'aviso'},j.aviso)]}}catch(x){}
  for(const m of L)await self.registration.showNotification(m.t,{body:m.b,icon:'icon-192.png',badge:'icon-192.png',tag:m.tag||'aviso',renotify:true});
})())});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l)if('focus' in c)return c.focus();return clients.openWindow('./')}))});
