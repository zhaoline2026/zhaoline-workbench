/* zhaoline工作台 Service Worker — 网络优先 + 离线回退（保证更新即时生效） */
const CACHE='zlw-v6';
const ASSETS=[
  './','./index.html','./manifest.webmanifest',
  './css/style.css',
  './js/base.js','./js/core.js','./js/cal.js','./js/english.js','./js/gym.js','./js/main.js',
  './icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin)return;
  // 统一用“路径名”作为缓存 key（忽略 ?v= 查询串，避免版本参数导致离线失配）
  const path=url.pathname;
  const isNav=req.mode==='navigate';
  // 网络优先：在线时永远拿最新文件并回填缓存；断网时回退缓存
  e.respondWith(
    fetch(req).then(res=>{
      if(res && (res.ok || (isNav && res.type==='basic'))){
        const copy=res.clone();
        caches.open(CACHE).then(c=>{
          c.put(isNav ? './index.html' : path.replace(/^\//,'./'), copy).catch(()=>{});
        }).catch(()=>{});
      }
      return res;
    }).catch(()=>
      caches.match(path).then(hit=>hit)
        .then(hit=>hit || caches.match(isNav?'./index.html':path.replace(/^\//,'./')))
        .then(hit=>hit || caches.match('./index.html'))
    )
  );
});
