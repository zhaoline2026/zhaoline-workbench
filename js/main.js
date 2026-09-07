/* ============= zhaoline工作台 · 主入口 ============= */
(function(){
const Z=window.Z;

function init(){
  Z.applyBg();
  Z.buildNav();

  /* 侧栏底部快捷按钮（项目库 / 设置）直接绑定，保证任何情况下都能跳转 */
  Z.$$('#side .sideBtn').forEach(b=>{
    b.onclick=ev=>{ ev.stopPropagation(); Z.go(b.dataset.go); };
  });

  /* 兜底：页面中任何带 data-go 的元素（如弹层/空态里的跳转） */
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-go]');
    if(el){ Z.go(el.dataset.go); }
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

  /* 默认进入 Todo */
  Z.go('todo');
  if(ZCore)ZCore.refreshBadges();

  /* PWA 离线 */
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
