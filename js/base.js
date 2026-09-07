/* ============= zhaoline工作台 · 基础层 ============= */
window.Z = (function(){
  const P = 'zlw:';   // localStorage 前缀

  /* ---------- 常量：12 个模块（顺序固定） ---------- */
  const MODS = [
    {id:'todo',  no:1,  name:'To do list', icon:'📝', c:'#7d9471'},
    {id:'idea',  no:2,  name:'选题灵感',   icon:'💡', c:'#a0b489'},
    {id:'fenjie',no:3,  name:'爆款拆解',   icon:'🔍', c:'#8fa493'},
    {id:'copy',  no:4,  name:'爆款文案',   icon:'✍️', c:'#a89f72'},
    {id:'hot2',  no:5,  name:'热点二创',   icon:'🔥', c:'#b39460'},
    {id:'data',  no:6,  name:'数据复盘',   icon:'📊', c:'#7d9aa0'},
    {id:'text',  no:7,  name:'文案提取',   icon:'📥', c:'#8a96a8'},
    {id:'cal',   no:8,  name:'日历规划',   icon:'📅', c:'#93a481'},
    {id:'read',  no:9,  name:'阅读思考',   icon:'📖', c:'#6fa394'},
    {id:'eng',   no:10, name:'英语学习',   icon:'🗣️', c:'#7d9fae'},
    {id:'gym',   no:11, name:'增肌计划',   icon:'💪', c:'#a8956a'},
    {id:'year',  no:12, name:'年度清单',   icon:'🎯', c:'#a3a077'}
  ];
  const byId = {}; MODS.forEach(m=>byId[m.id]=m);
  // 互通组（第2~9状态栏可互相衔接）
  const LINK_MODS = ['idea','fenjie','copy','hot2','data','text','cal','read','year'];

  /* ---------- 工具 ---------- */
  const $  = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
  const pad = n => String(n).padStart(2,'0');
  const dkey = d => d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
  const todayISO = () => dkey(new Date());
  const parseKey = k => { const [y,m,d]=k.split('-').map(Number); return new Date(y,m-1,d); };
  const WEEK = ['日','一','二','三','四','五','六'];
  const cnDate = k => { const d=parseKey(k); return (d.getMonth()+1)+'月'+d.getDate()+'日 周'+WEEK[d.getDay()]; };
  const addDays = (k,n)=>{ const d=parseKey(k); d.setDate(d.getDate()+n); return dkey(d); };
  const fmtNum = n => (n==null||isNaN(n)) ? 0 : Number(n);
  const hexRgb = h => { h=h.replace('#',''); if(h.length===3)h=h.split('').map(x=>x+x).join(''); const n=parseInt(h,16); return [(n>>16)&255,(n>>8)&255,n&255]; };
  const rgba = (h,a)=>'rgba('+hexRgb(h).join(',')+','+a+')';
  const cssV = h => '--c:'+h+';--c-deep:'+rgba(h,1)+';--c-soft:'+rgba(h,.16)+';--st-deep:'+rgba(h,1)+';--st-soft:'+rgba(h,.14)+';';
  const fileSize = n => { if(n<1024)return n+' B'; if(n<1048576)return (n/1024).toFixed(1)+' KB'; return (n/1048576).toFixed(1)+' MB'; };
  const debounce = (fn,ms)=>{ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; };

  /* ---------- localStorage 存储 ---------- */
  const store = {
    g(key,dft){ try{ const v=localStorage.getItem(P+key); return v==null ? dft : JSON.parse(v); }catch(e){ return dft; } },
    s(key,val){ try{ localStorage.setItem(P+key, JSON.stringify(val)); return true; }catch(e){ return false; } },
    del(key){ localStorage.removeItem(P+key); },
    keys(){ const out=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k && k.indexOf(P)===0) out.push(k.slice(P.length)); } return out; },
    exportAll(){ const o={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k && k.indexOf(P)===0) o[k]=localStorage.getItem(k); } return o; },
    importAll(o){ Object.keys(o).forEach(k=>localStorage.setItem(k,o[k])); }
  };

  /* ---------- IndexedDB 文件库（导入的文档/图片/视频/音频等） ---------- */
  const idb = {
    _db:null,
    open(){ return new Promise((res,rej)=>{ if(this._db)return res(this._db);
      const rq=indexedDB.open('zlw-files',1);
      rq.onupgradeneeded=e=>{ const db=e.target.result; if(!db.objectStoreNames.contains('files')) db.createObjectStore('files',{keyPath:'id'}); };
      rq.onsuccess=e=>{ this._db=e.target.result; res(this._db); };
      rq.onerror=()=>rej(rq.error);
    });},
    put(rec){ return this.open().then(db=>new Promise((res,rej)=>{ const tx=db.transaction('files','readwrite'); tx.objectStore('files').put(rec); tx.oncomplete=()=>res(rec.id); tx.onerror=()=>rej(tx.error); })); },
    all(){ return this.open().then(db=>new Promise((res,rej)=>{ const tx=db.transaction('files','readonly'); const rq=tx.objectStore('files').getAll(); rq.onsuccess=()=>res(rq.result||[]); rq.onerror=()=>rej(rq.error); })); },
    del(id){ return this.open().then(db=>new Promise((res,rej)=>{ const tx=db.transaction('files','readwrite'); tx.objectStore('files').delete(id); tx.oncomplete=()=>res(); tx.onerror=()=>rej(tx.error); })); }
  };

  /* ---------- 设置 ---------- */
  const DFLT = {
    acc:'US',                  // 英语发音：US / UK
    rate:1,
    bg:{ on:false, url:'', zoom:1, blur:0, op:.9, pos:'center center' },
    lib:[],                    // 项目库勾选的模块
    todoView:'today',
    gProfile:{ gender:'女', age:24, height:161, weight:45, target:48, months:3 },
    gymPlanSeed:0
  };
  let settings = Object.assign({}, DFLT, store.g('settings',{}));
  settings.bg = Object.assign({}, DFLT.bg, settings.bg||{});
  settings.gProfile = Object.assign({}, DFLT.gProfile, settings.gProfile||{});
  const saveSettings = ()=>store.s('settings',settings);

  function applyBg(){
    const bg=settings.bg;
    document.body.classList.toggle('bg-on', bg.on && !!bg.url);
    const lay=$('#bgLay');
    if(!lay)return;
    lay.style.setProperty('--bgurl', bg.url ? 'url("'+bg.url.replace(/"/g,'%22')+'")' : 'none');
    lay.style.setProperty('--bgz', bg.zoom||1);
    lay.style.setProperty('--bgb', (bg.blur||0)+'px');
    lay.style.setProperty('--bgo', bg.op!=null?bg.op:.9);
    lay.style.setProperty('--bgp', bg.pos||'center center');
  }

  /* ---------- 路由 / 视图 ---------- */
  const views = {};   // id -> render(rootEl) 返回 {title, sub}
  const mounts = {};
  let cur='todo';
  function regView(id,render,mount){ views[id]=render; if(mount)mounts[id]=mount; }
  const EXTRA_NAME = { lib:'项目库', settings:'工作台设置' };
  function fallbackView(id,arg,failed){
    const meta=byId[id];
    const nm=(meta&&meta.name)||EXTRA_NAME[id]||id;
    const ic=(meta&&meta.icon)||'🍒';
    const wr=window.Z.curWrap; if(!wr) return {title:nm,sub:'',acts:''};
    wr.innerHTML='<div class="empty"><div class="big">'+ic+'</div><div>'+nm+'</div>'
      +'<div class="muted mt6">'+(failed?'这一栏加载时出了点小问题':'这一栏还没有准备好')+'，点下面重试一下就好</div>'
      +'<div class="row" style="justify-content:center;margin-top:14px"><button class="btn pri" data-rerun="1" style="margin-right:8px">🔄 重新进入</button>'
      +'<button class="btn ghost" data-home="1">📝 回 To do list</button></div></div>';
    wr.onclick=e=>{
      const rr=e.target.closest('[data-rerun]'); if(rr){ go(id,arg); return; }
      const hm=e.target.closest('[data-home]'); if(hm){ go('todo'); }
    };
    return { title:nm, sub:failed?'加载出错 · 点击重试':'未就绪 · 点击重试', acts:'' };
  }
  function go(id,arg){
    // 完全未知的目标（不在模块表里也没有注册视图）才回退 todo，否则一律进入对应界面
    if(!byId[id] && !EXTRA_NAME[id] && !views[id]) id='todo';
    cur=id;
    // 1) 先给即时反馈：高亮 + 收起抽屉，保证“点了就有反应”
    $$('#sideNav .navItem').forEach(b=>b.classList.toggle('on', b.dataset.go===id));
    document.body.classList.remove('sideOpen');
    const ov=$('#overlay'); if(ov) ov.classList.remove('show');
    // 2) 重建视图容器
    const v=$('#view'); v.innerHTML='';
    const wr=document.createElement('div'); wr.className='viewWrap'; v.appendChild(wr);
    window.Z.curWrap=wr;
    const meta=byId[id];
    wr.style.setProperty('--c', meta?meta.c:'#7d9471');
    // 3) 渲染（任何模块出错都不再“卡死/静默回退”，而是显示可重试的提示页）
    let info={}, failed=false;
    if(views[id]){
      try{ info=views[id](wr,arg)||{}; }
      catch(err){ failed=true; console.error('[zhaoline:render error]', id, err); }
    } else { failed=false; }
    if(failed || !views[id]) info=fallbackView(id,arg,failed);
    // 4) 更新标题与头部动作（视图渲染抛错也不影响这里）
    $('#ttlName').textContent=info.title||(meta?meta.name:EXTRA_NAME[id]||id);
    $('#ttlSub').textContent=info.sub||'';
    $('#headActs').innerHTML=info.acts||'';
    v.scrollTop=0;
    // 5) 事件绑定（mount）单独容错
    if(!failed && mounts[id]){ try{ mounts[id](wr,arg); }catch(e){ console.error('[zhaoline:mount error]', id, e); } }
  }

  /* ---------- 弹窗 / Toast / 确认 ---------- */
  let modalCB=null;
  function modal(o){
    const root=$('#modalRoot');
    root.innerHTML='<div class="modalScrim" data-x="1"></div><div class="modal"><button class="x" data-x="1">✕</button><h3>'+(o.title||'')+'</h3>'+(o.sub?'<div class="muted mb8">'+o.sub+'</div>':'')+'<div class="mbody">'+(o.body||'')+'</div><div class="modalFoot">'+((o.acts||[]).map(a=>'<button class="btn '+a.cls+'" data-mact="'+a.key+'">'+a.label+'</button>').join(''))+'</div></div>';
    root.classList.add('open');
    const acts=(o.acts||[]).map(a=>({key:a.key,fn:a.fn}));
    root.onclick=e=>{
      const c=e.target.closest('[data-x]'); if(c){ closeModal(); return; }
      const m=e.target.closest('[data-mact]');
      if(m){ const a=acts.find(x=>x.key===m.dataset.mact); if(a&&a.fn) a.fn(); else closeModal(); }
    };
    if(o.onOpen) setTimeout(o.onOpen,10);
    return root;
  }
  function closeModal(){ const r=$('#modalRoot'); if(r)r.classList.remove('open'); }
  function toast(msg,ms){
    const box=$('#toastBox');
    const t=document.createElement('div'); t.className='toast'; t.textContent=msg;
    box.appendChild(t);
    setTimeout(()=>{ t.style.opacity='0'; t.style.transition='.3s'; setTimeout(()=>t.remove(),320); }, ms||2200);
  }
  function confirmBox(msg,opts){
    return new Promise(res=>{
      modal({ title:opts&&opts.title?opts.title:'确认操作', body:'<div class="confirmCard"><div>'+msg+'</div></div>',
        acts:[ {label:'取消',key:'no',cls:'ghost',fn:()=>{closeModal();res(false);}}, {label:opts&&opts.okText?opts.okText:'确定',key:'yes',cls:opts&&opts.danger?'danger':'pri',fn:()=>{closeModal();res(true);}} ] });
    });
  }
  function modalForm(title,fieldsHTML,onSubmit,okText){
    modal({ title:title, body:'<div class="mbody">'+fieldsHTML+'</div>', acts:[ {label:okText||'保存',key:'ok',cls:'pri',fn:()=>{ const data=readForm($('.mbody')); onSubmit(data); }},{label:'取消',key:'x',cls:'ghost',fn:()=>closeModal()}]});
  }
  function readForm(root){
    const out={};
    $$('input,select,textarea',root).forEach(el=>{
      if(!el.name)return;
      out[el.name] = (el.type==='checkbox') ? el.checked : el.value;
    });
    return out;
  }

  /* ---------- 文件选择 ---------- */
  function pickFile(accept,multi,cb){
    const inp=document.createElement('input');
    inp.type='file'; inp.accept=accept||'*/*'; if(multi)inp.multiple=true;
    inp.onchange=()=>{ cb(inp.files); inp.remove(); };
    inp.click();
  }
  function readAsDataURL(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.target.result); r.onerror=rej; r.readAsDataURL(file); }); }

  /* ---------- 侧栏渲染（main.js 调用） ---------- */
  function buildNav(){
    const nav=$('#sideNav'); nav.innerHTML='';
    const g=document.createElement('div'); g.className='navGroup'; g.textContent='我的状态栏'; nav.appendChild(g);
    MODS.forEach(m=>{
      const b=document.createElement('button');
      b.className='navItem'; b.dataset.go=m.id;
      b.style.setProperty('--c-soft',rgba(m.c,.16));
      b.style.setProperty('--c-deep',m.c);
      b.innerHTML='<span class="no">'+m.no+'</span><span class="nic">'+m.icon+'</span><span class="nm">'+m.name+'</span><span class="badge" id="bdg-'+m.id+'"></span>';
      // 直接绑定点击（不依赖全局事件委托），保证“无论点什么都能跳转”
      b.onclick=ev=>{ ev.stopPropagation(); go(m.id); };
      nav.appendChild(b);
    });
  }

  return {
    P,MODS,byId,LINK_MODS,
    $,$$,esc,uid,pad,dkey,todayISO,parseKey,WEEK,cnDate,addDays,fmtNum,rgba,cssV,fileSize,debounce,
    store,idb,
    settings,saveSettings,applyBg,
    views,mounts,regView,go,cur:()=>cur,
    modal,closeModal,toast,confirmBox,modalForm,readForm,
    pickFile,readAsDataURL,
    buildNav
  };
})();
