/* ============= zhaoline工作台 · 主入口 ============= */
(function(){
const Z=window.Z;

/* 诊断浮条：JS 报错时在顶部显示，方便真机排查（不吞错，仅提示） */
(function(){
  let bar=null, shown=[];
  function show(msg){
    try{
      if(!bar){
        bar=document.createElement('div');
        bar.style.cssText='position:fixed;top:0;left:0;right:0;z-index:9999;background:#b4534a;color:#fff;font-size:12px;padding:6px 10px;line-height:1.4;word-break:break-all;max-height:40vh;overflow:auto;box-shadow:0 2px 8px rgba(0,0,0,.2)';
        bar.addEventListener('click',()=>{ if(bar){ bar.remove(); bar=null; } });
        document.body.appendChild(bar);
      }
      shown.push(msg); if(shown.length>3) shown.shift();
      bar.textContent='⚠️ 页面脚本出错（点击关闭）：' + shown.join(' ｜ ');
    }catch(_e){}
  }
  window.addEventListener('error',e=>{ show((e&&e.message)||String(e&&e.error||'')||'unknown error'); });
  window.addEventListener('unhandledrejection',e=>{ const r=e&&e.reason; show('Promise: '+((r&&r.message)?r.message:String(r||''))); });
})();

function init(){
  Z.applyBg();
  Z.buildNav();

  /* data-go 导航已由 base.js 的全局 capture 点击统一接管（含原生 <a href="#/"> 兜底），
     这里只保留非导航类事件委托：头部动作 [data-hact] */
  document.addEventListener('click',e=>{
    const h=e.target.closest('[data-hact]');
    if(h){ const key=h.dataset.hact; if(Z.hacts&&Z.hacts[key]){ Z.hacts[key](); } }
  });

  /* 移动端抽屉 */
  const menu=Z.$('#menuBtn'), overlay=Z.$('#overlay');
  function closeSide(){ document.body.classList.remove('sideOpen'); overlay.classList.remove('show'); }
  if(menu)menu.onclick=()=>{ document.body.classList.toggle('sideOpen'); overlay.classList.toggle('show', document.body.classList.contains('sideOpen')); };
  overlay.onclick=closeSide;

  /* Esc 关闭 */
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ Z.closeModal(); closeSide(); } });

  /* 默认进入：优先读地址栏 hash（如 #/gym），否则 To do list */
  const hm=(location.hash||'').match(/^#\/([A-Za-z0-9]+)/);
  Z.go(hm?hm[1]:'todo');
  if(ZCore)ZCore.refreshBadges();

  /* PWA 离线 */
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
