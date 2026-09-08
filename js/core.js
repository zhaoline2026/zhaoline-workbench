/* ============= zhaoline工作台 · 核心引擎（通用状态栏 + Todo + 项目库 + 设置） ============= */
(function(){
const Z = window.Z;
if(!Z.hacts) Z.hacts = {};          // 头部动作注册表： '模块::动作' -> fn
const $  = (s,c)=> (c||document).querySelector(s);
const $$ = (s,c)=> Array.from((c||document).querySelectorAll(s));
const uiState = {};                 // 每个模块的列表筛选状态（仅内存）

/* ---------------- 通用模块 schema ---------------- */
const SCHEMA = {
  idea:{ st:[['idea','💡 灵感待用'],['doing','🖋 创作中'],['used','✅ 已发布']], tph:'一句话写下这个选题……', dph:'这个选题能火，是因为？',
    f:[
      ['source','灵感来源','select',['评论区','粉丝提问','观察生活','热点新闻','对标账号','同行作品','梦境/脑洞','旅行见闻','其他']],
      ['angle','思路 / 想做什么','area',null],
      ['ref','可参考的对标作品','text',null]
    ]},
  fenjie:{ st:[['doing','🔍 拆解中'],['done','📌 已拆解'],['apply','🎯 已应用']], tph:'拆解的作品标题 / 账号内容', dph:'这篇/这支为什么爆？',
    f:[
      ['account','对标账号','text',null],
      ['platform','平台','select',['抖音','小红书','B站','视频号','快手','YouTube','其他']],
      ['url','作品链接','url',null],
      ['hook','开头钩子（前3秒怎么抓住人）','area',null],
      ['struct','内容结构（分几个部分·节奏）','area',null],
      ['engage','互动设计（评论引导/置顶/争议点）','area',null],
      ['emotion','情绪价值（爽点/共鸣/好奇/干货）','area',null],
      ['reuse','可复用的启发（我能怎么用）','area',null]
    ]},
  copy:{ st:[['draft','📄 草稿'],['todoP','⏳ 待发布'],['used','✅ 已使用']], tph:'文案标题 / 主题', dph:'这条文案的灵魂句子',
    f:[
      ['platform','平台','select',['抖音','小红书','B站','视频号','公众号','其他']],
      ['scene','文案类型','select',['口播文案','图文文案','视频标题','封面标题','评论区文案','脚本大纲']],
      ['hook','钩子句（开口第一句）','area',null],
      ['body','正文文案','area',null],
      ['tags','标签（逗号分隔）','text',null]
    ]},
  hot2:{ st:[['wait','⏰ 待跟进'],['doing','🔥 创作中'],['used','✅ 已发布'],['pass','⚪ 已放弃']], tph:'热点关键词 / 事件', dph:'这个热点和我的定位怎么结合？',
    f:[
      ['hot','热点事件描述','area',null],
      ['platform','平台','select',['抖音','小红书','B站','视频号','微博','其他']],
      ['date','热度日期','date',null],
      ['angle','我的二创角度','area',null],
      ['deadline','计划完成','date',null]
    ]},
  data:{ st:[['collect','📝 记录中'],['done','📋 已完成复盘']], tph:'如：9月第2周数据复盘', dph:'用数据说话',
    f:[
      ['period','复盘周期','text',null],
      ['platform','平台','select',['抖音','小红书','B站','视频号','全平台','其他']],
      ['videos','发布作品数','number',null],['views','总播放','number',null],['avg','平均播放','number',null],
      ['likes','总点赞','number',null],['comments','总评论','number',null],['fans','净涨粉','number',null],['rate','完播率 %','number',null],
      ['conclusion','复盘结论（做得好/待改进/下一步）','area',null]
    ]},
  text:{ st:[['raw','📥 待整理'],['done','📋 已提取'],['use','🔗 已引用']], tph:'这条文案的来源 / 名字', dph:'把提取到的原文粘进来',
    f:[
      ['src','来源链接','url',null],
      ['platform','平台','select',['抖音','小红书','B站','视频号','公众号','口播录音','其他']],
      ['body','提取的原文文案','area',null],
      ['points','拆解要点（结构/钩子/金句）','area',null],
      ['keys','关键词','text',null],
      ['note','用途备注','area',null]
    ]},
  read:{ st:[['reading','📖 在读'],['done','✅ 读完'],['act','🌱 已沉淀行动']], tph:'书名 / 文章 / 课程名称', dph:'读完这本书，我想……',
    f:[
      ['type','类型','select',['书','文章','课程','播客','视频','其他']],
      ['src','书名 / 来源链接','text',null],
      ['quote','摘抄·金句','area',null],
      ['think','我的思考','area',null],
      ['act','行动清单','area',null],
      ['date','阅读日期','date',null]
    ]},
  year:{ st:[['todoY','○ 未开始'],['doing','▶ 进行中'],['done','✔ 已完成']], tph:'年度愿望 / 目标', dph:'这一年的清单，慢慢划掉它',
    f:[
      ['cat','分类','select',['内容创作','英语学习','健康身材','工作事业','财务状况','旅行体验','个人成长','关系生活']],
      ['why','为什么重要','area',null],
      ['steps','拆解步骤','area',null],
      ['due','目标时间','date',null]
    ]}
};
const FIELD_TYPE = {
  text:(k,ph)=>'<input type="text" name="'+k+'" placeholder="'+(ph||'')+'">',
  url:(k,ph)=>'<input type="url" name="'+k+'" placeholder="'+(ph||'')+'">',
  date:(k,ph)=>'<input type="date" name="'+k+'">',
  number:(k,ph)=>'<input type="number" name="'+k+'" placeholder="'+(ph||'')+'" min="0">',
  area:(k,ph,rows)=>'<textarea name="'+k+'" rows="'+(rows||4)+'" placeholder="'+(ph||'')+'"></textarea>',
  select:(k,opts)=>'<select name="'+k+'">'+opts.map(o=>'<option value="'+Z.esc(o)+'">'+Z.esc(o)+'</option>').join('')+'</select>'
};
function fieldHTML(f){
  const k=f[0], lab=f[1], ty=f[2], opt=f[3];
  let inner;
  if(ty==='select') inner=FIELD_TYPE.select(k,opt);
  else if(ty==='date') inner=FIELD_TYPE.date(k);
  else if(ty==='number') inner=FIELD_TYPE.number(k,opt||'');
  else if(ty==='area') inner=FIELD_TYPE.area(k,'',f[4]||(k==='body'?7:4));
  else inner=FIELD_TYPE.text(k,opt||'');
  return '<label class="f">'+lab+'</label>'+inner;
}
const list = mod => Z.store.g('m_'+mod, []);
const saveList = (mod,arr) => Z.store.s('m_'+mod, arr);
const getItem = (mod,id) => list(mod).find(i=>i.id===id)||null;
const itemName = it => it && (it.title || Object.values(it.fields||{}).filter(Boolean).join(' ').slice(0,30)) || '(未命名)';

/* 删除某条目时，清理所有模块里指向它的衔接 */
function clearIncomingLinks(mod,id){
  Z.LINK_MODS.forEach(mm=>{
    const arr=list(mm); let changed=false;
    arr.forEach(it=>{ if(it.links && it.links.length){ const n=it.links.filter(l=>!(l.m===mod&&l.id===id)); if(n.length!==it.links.length){it.links=n; changed=true;} } });
    if(changed) saveList(mm,arr);
  });
}
function upsertItem(mod,item){
  const arr=list(mod); const i=arr.findIndex(x=>x.id===item.id);
  item.updated=Date.now();
  if(i>=0) arr[i]=item; else arr.unshift(item);
  saveList(mod,arr);
}

/* ---------------- 编辑器 ---------------- */
function openEditor(mod,item){
  const sch=SCHEMA[mod];
  const isNew = !item;
  const it = isNew ? {id:Z.uid(), created:Date.now(), updated:Date.now(), title:'', status:sch.st[0][0], fields:{}, links:[]} : JSON.parse(JSON.stringify(item));
  function bodyHTML(){
    const stOpts=sch.st.map(s=>'<option value="'+s[0]+'" '+(it.status===s[0]?'selected':'')+'>'+s[1]+'</option>').join('');
    let h='<div style="color:var(--c)">'+Z.byId[mod].icon+' <b>'+Z.byId[mod].name+'</b></div>';
    h+='<label class="f">主标题 <em class="muted">（必填）</em></label><input type="text" id="edTitle" placeholder="'+Z.esc(sch.tph)+'" value="'+Z.esc(it.title)+'">';
    h+='<div class="row mt6"><label class="f" style="margin:10px 0 0">状态</label><select id="edStatus" style="width:auto;flex:1">'+stOpts+'</select></div>';
    sch.f.forEach(f=>{
      if(f[0]==='date' && it.fields[f[0]]==null && isNew) it.fields[f[0]]=Z.todayISO();
      h+=fieldHTML(f);
    });
    h+='<hr class="hr"><div class="row"><label class="f" style="margin:0">🔗 已衔接的状态栏</label><button class="pill sm" id="addLink" type="button" style="margin-left:auto">＋ 添加衔接</button></div><div id="linkList" style="margin-top:6px">'+(it.links&&it.links.length? it.links.map((l,li)=>'<span class="linkChip" data-idx="'+li+'" data-jump="1" style="margin:3px 4px 0 0">'+Z.byId[l.m].icon+' '+Z.esc(Z.byId[l.m].name)+' › '+Z.esc(l.note||itemName(getItem(l.m,l.id)))+' <b data-rm="1" style="cursor:pointer;opacity:.7">✕</b></span>').join(''):'<div class="muted small">还没有衔接。点击「添加衔接」可以把这条和选题灵感 / 爆款拆解 / 文案 / 热点 / 复盘 / 阅读 / 年度清单串起来，形成一条完整的创作链路。</div>');
    h+='</div>';
    return h;
  }
  const mbody = function(){};
  function wire(root){
    const linkBox=root.querySelector('#linkList');
    root.querySelector('#addLink').onclick=()=>{ collect(); persist(); openLinkPicker(mod,it); };
    if(linkBox) linkBox.querySelectorAll('[data-rm]').forEach(b=>{
      b.onclick=e=>{ e.stopPropagation(); collect(); const idx=+b.closest('[data-idx]').dataset.idx; it.links.splice(idx,1); persist(); openEditor(mod,it); };
    });
    if(linkBox) linkBox.querySelectorAll('[data-jump]').forEach(ch=>{
      ch.onclick=e=>{ if(e.target.dataset.rm)return; const l=it.links[+ch.dataset.idx]; if(l&&Z.byId[l.m]&&SCHEMA[l.m]){ Z.closeModal(); Z.go(l.m,{openId:l.id}); } };
    });
  }
  function collect(){
    it.title=$('#edTitle',root).value.trim();
    it.status=$('#edStatus',root).value;
    $$('#mbody input,#mbody select,#mbody textarea',root).forEach(el=>{
      if(!el.name||el.id==='edStatus'||el.id==='edTitle')return;
      it.fields[el.name]=el.value;
    });
  }
  function persist(){ upsertItem(mod,it); refreshBadges(); }
  Z.modal({ title:(isNew?'新建 · ':'编辑 · ')+Z.byId[mod].name, sub:'主页面最左侧状态栏 · 可随时衔接其他状态栏',
    body:'<div id="mbody">'+bodyHTML()+'</div>',
    acts:[ {label:'删除',key:'del',cls:'danger',fn:()=>{ if(isNew){Z.closeModal();return;} Z.confirmBox('确定删除这条吗？与其他状态栏的衔接会一并清理。',{danger:true}).then(y=>{ if(y){ const arr=list(mod).filter(x=>x.id!==it.id); saveList(mod,arr); clearIncomingLinks(mod,it.id); refreshBadges(); Z.closeModal(); Z.toast('已删除'); } }); }},
           {label:'保存',key:'save',cls:'pri',fn:()=>{ collect(); if(!it.title){ Z.toast('请填写主标题'); return; } persist(); Z.closeModal(); Z.toast('已保存 ✓'); }},
           {label:'取消',key:'x',cls:'ghost',fn:()=>Z.closeModal()} ],
    onOpen(){ wire(Z.$('#modalRoot')); } });
}
function openLinkPicker(mod,it){
  const others=Z.LINK_MODS.filter(x=>x!==mod && x!=='cal'); // cal 是发布日历，衔接用“来源素材”挂在排期上
  const tmpl='<div id="mbody"><div class="muted small mb8">把「'+Z.esc(itemName(it))+'」衔接到哪个状态栏？</div>'
    +'<label class="f">目标状态栏</label><select id="lpMod">'+others.map(m=>'<option value="'+m+'">'+Z.byId[m].icon+' '+Z.byId[m].name+'</option>').join('')+'</select>'
    +'<label class="f">选择要衔接的条目</label><select id="lpItem"></select>'
    +'<label class="f">衔接说明（选填）</label><input type="text" id="lpNote" placeholder="例如：这条选题要做成第3条视频">'
    +'</div>';
  Z.modal({ title:'🔗 衔接状态栏', body:tmpl,
    acts:[{label:'衔接',key:'ok',cls:'pri',fn:()=>{ const tm=Z.$('#lpMod').value, tid=Z.$('#lpItem').value, note=Z.$('#lpNote').value.trim(); if(!tid){Z.toast('请选择条目');return;}
      const target=getItem(tm,tid);
      if(target){ target.links=target.links||[]; if(!target.links.find(l=>l.m===mod&&l.id===it.id)) target.links.push({m:mod,id:it.id,note,ts:Date.now()}); upsertItem(tm,target); }
      it.links=it.links||[]; if(!it.links.find(l=>l.m===tm&&l.id===tid)) it.links.push({m:tm,id:tid,note,ts:Date.now()});
      persist2(); Z.closeModal(); Z.toast('✅ 已衔接：'+Z.byId[tm].name); Z.closeModal(); openEditor(mod,it);
      function persist2(){ if(!it.title) it.title=itemName(it)||'(未命名)'; upsertItem(mod,it); refreshBadges(); }
    }},{label:'取消',key:'x',cls:'ghost',fn:()=>Z.closeModal()}],
    onOpen(){ const mSel=$('#lpMod'),iSel=$('#lpItem');
      function fill(){ const arr=list(mSel.value).slice().sort((a,b)=>b.updated-a.updated); iSel.innerHTML='<option value="">— 选择一条 —</option>'+arr.map(x=>'<option value="'+x.id+'">'+Z.esc(itemName(x))+'</option>').join(''); }
      mSel.onchange=fill; fill(); }
  });
}

/* ---------------- 通用列表视图 ---------------- */
function genView(mod){
  const sch=SCHEMA[mod];
  const metaOf=it=>{ const f=it.fields||{}; return f.platform||f.cat||f.period||f.src||f.type||(it.date?Z.cnDate(it.date):''); };
  const prevOf=it=>{ const f=it.fields||{}; return Object.keys(f).filter(k=>['angle','body','conclusion','hot','note','think','quote','points','reuse','steps','why','angle','struct'].indexOf(k)>=0).map(k=>f[k]).find(v=>v&&v.trim())||''; };
  Z.regView(mod,(root,arg)=>{
    uiState[mod]=uiState[mod]||{st:'all',q:''};
    const {st,q}=uiState[mod];
    let arr=list(mod).slice().sort((a,b)=>b.updated-a.updated);
    if(st!=='all') arr=arr.filter(i=>i.status===st);
    if(q) arr=arr.filter(i=>(i.title+(i.fields?JSON.stringify(i.fields):'')).toLowerCase().indexOf(q.toLowerCase())>=0);
    const stChips=['<button class="pill '+(st==='all'?'on':'')+'" data-st="all">全部 '+list(mod).length+'</button>'].concat(sch.st.map(s=>{ const c=list(mod).filter(i=>i.status===s[0]).length; return '<button class="pill '+(st===s[0]?'on':'')+'" data-st="'+s[0]+'">'+s[1].split(' ')[1]+' '+c+'</button>'; })).join('');
    let body;
    if(!arr.length){
      const icon=Z.byId[mod].icon;
      body='<div class="empty"><div class="big">'+icon+'</div><div>'+(q||st!=='all'?'没有符合条件的内容':'这里还是空的')+'</div><div class="muted mt6">'+genTip[mod]+'</div><button class="btn pri mt10" data-new="1">＋ 新建第一条</button></div>';
    }else{
      body='<div class="gridCards">'+arr.map(it=>{
        const stl=sch.st.find(s=>s[0]===it.status)||sch.st[0];
        return '<div class="mCard" style="'+Z.cssV(Z.byId[mod].c)+'" data-id="'+it.id+'">'
          +'<div class="row"><span class="statusChip" style="--st-soft:'+Z.rgba(Z.byId[mod].c,.14)+';--st-deep:'+Z.byId[mod].c+'">'+stl[1]+'</span><span class="muted small" style="margin-left:auto">'+Z.esc(metaOf(it)||'')+'</span></div>'
          +'<h4>'+Z.esc(itemName(it))+'</h4>'
          +(prevOf(it)?'<p class="pre">'+Z.esc(prevOf(it))+'</p>':'')
          +(it.links&&it.links.length?'<div class="foot">'+it.links.slice(0,3).map(l=>'<span class="linkChip" data-jump="1" data-m="'+l.m+'" data-id="'+l.id+'">'+Z.byId[l.m].icon+' '+Z.byId[l.m].name+'</span>').join('')+(it.links.length>3?'<span class="muted" style="font-size:10px">+'+(it.links.length-3)+'</span>':'')+'</div>':'')
          +'<div class="foot"><span class="muted small">'+new Date(it.created).toLocaleDateString('zh-CN',{month:'numeric',day:'numeric'})+'</span><div class="ops"><button class="iconBtn" data-link="1" title="衔接">⛓</button><button class="iconBtn" data-del="1" title="删除">🗑</button></div></div></div>';
      }).join('')+'</div>';
    }
    root.innerHTML='<div class="toolbar"><input type="search" placeholder="搜索 '+(Z.byId[mod].name)+'…" style="max-width:210px" id="q"><div class="row" style="margin-left:4px;flex:1">'+stChips+'</div></div>'+body;
    return { title:Z.byId[mod].name, sub:'左侧第 '+Z.byId[mod].no+' 项 · 可衔接其他状态栏', acts:'<button class="hBtn" data-hact="'+mod+'::new">＋ 新建</button>' };
  },(root,arg)=>{
    root.addEventListener('input',e=>{
      if(e.target.id==='q'){ const v=e.target.value, pos=e.target.selectionStart; uiState[mod].q=v; Z.views[mod](root,arg); const q2=document.getElementById('q'); if(q2){ q2.focus(); try{q2.setSelectionRange(pos,pos);}catch(_){ } } return; }
    });
    root.onclick=e=>{
      const stB=e.target.closest('[data-st]'); if(stB){ uiState[mod].st=stB.dataset.st; if(Z.views[mod]) Z.views[mod](root,arg); return; }
      const del=e.target.closest('[data-del]'); if(del){ e.stopPropagation(); const it=getItem(mod,del.closest('.mCard').dataset.id); Z.confirmBox('删除「'+Z.esc(itemName(it))+'」？',{danger:true}).then(y=>{ if(y){ saveList(mod,list(mod).filter(x=>x.id!==it.id)); clearIncomingLinks(mod,it.id); refreshBadges(); if(Z.views[mod]) Z.views[mod](root,arg); } }); return; }
      const lk=e.target.closest('[data-link]'); if(lk){ e.stopPropagation(); const it=getItem(mod,lk.closest('.mCard').dataset.id); openLinkPicker(mod,it); return; }
      const jm=e.target.closest('[data-jump]'); if(jm){ e.stopPropagation(); const id=jm.dataset.id, m=jm.dataset.m; if(m&&Z.byId[m]&&SCHEMA[m]){ Z.go(m,{openId:id}); return; } }
      const nb=e.target.closest('[data-new]'); if(nb){ openEditor(mod,null); return; }
      const card=e.target.closest('.mCard'); if(card){ openEditor(mod,getItem(mod,card.dataset.id)); }
    };
    if(arg && arg.openId){ const it=getItem(mod,arg.openId); if(it) setTimeout(()=>openEditor(mod,it),120); }
  });
  Z.hacts[mod+'::new']=()=>openEditor(mod,null);
}
const genTip={
  idea:'把刷到/想到的好选题记下来：来源、想做什么、参考谁。灵感攒多了，随手挑一条就能开工。',
  fenjie:'看到爆款就拆：开头钩子、内容结构、互动设计、情绪价值，最后落到「我能复用什么」。',
  copy:'把口播稿、图文文案、标题集中在这里管理，标注平台与类型，发布后勾掉。',
  hot2:'热点来得快去得也快：记下事件、二创角度和完成时间，避免错过窗口期。',
  data:'每周把作品数据填进来：播放/点赞/涨粉/完播，复盘出下一步动作，越做越有手感。',
  text:'听到好文案随手提取，链接 + 原文 + 拆解要点存这里，形成自己的文案弹药库。',
  read:'读完一本书留下：金句、思考、行动。只有产生行动的阅读才真正改变生活。',
  year:'写下这一年的清单：内容、英语、健康、旅行……每完成一项就划掉一项，年底回头看。'
};

/* ---------------- Todo · 每日 15 任务栏 ---------------- */
function todoView(){
  const dayData=()=>{ const m=Z.store.g('todoMap',{}); return m; };
  const getRows=m=>{ const k=Z.store.g('todoView',Z.todayISO()); m[k]=m[k]||{rows:[]}; while(m[k].rows.length<15) m[k].rows.push({t:'',s:0}); return {m,k,rows:m[k].rows}; };
  const saveRows=(m,k,rows)=>{ m[k].rows=rows; Z.store.s('todoMap',m); refreshBadges(); };
  const viewKey=()=>Z.store.g('todoView',Z.todayISO());

  Z.regView('todo',(root)=>{
    const k=viewKey();
    const {rows}=getRows(dayData());
    const hasText=r=>r.t.trim();
    const done=rows.filter(r=>hasText(r)&&r.s===1).length;
    const active=rows.filter(hasText).length;
    const prog=active?Math.round(done/active*100):0;
    root.innerHTML=
      '<div class="todoDay">'
      +'<button class="iconBtn" data-day="-1" title="前一天">‹</button>'
      +'<input type="date" value="'+k+'" id="todoDate" style="width:auto;flex:0 0 auto;background:#fff">'
      +'<button class="iconBtn" data-day="1" title="后一天">›</button>'
      +(k!==Z.todayISO()?'<button class="pill" data-today="1">回到今天</button>':'')
      +'<div class="progRing" style="margin-left:auto"><span>'+(active?done+'/'+active:'0/0')+' 完成</span><div class="progBar"><i style="width:'+prog+'%"></i></div></div></div>'
      +'<div class="muted mb8" style="margin-top:-2px">'+Z.cnDate(k)+(k===Z.todayISO()?' · 今天':'')+' · 每日 15 栏，完成后打 ✓，跳过/不做打 ✗</div>'
      +rows.map((r,i)=>'<div class="todoRow '+(r.s===1?'done':r.s===2?'skip':'')+'" data-i="'+i+'"><span class="idx">'+(i+1)+'</span>'
        +'<input maxlength="120" placeholder="任务 '+(i+1)+' · 在这里写下要做的事" value="'+Z.esc(r.t)+'">'
        +'<button class="chk ok" data-k="ok" title="完成 ✓">✓</button>'
        +'<button class="chk no" data-k="no" title="跳过/不做 ✗">✗</button></div>').join('');
    return { title:'To do list', sub:'每日 15 栏 · ✓完成  ✗跳过 · 自动保存', acts:'<button class="hBtn" data-hact="todo::clear">🗑 清空本日</button>' };
  },(root)=>{
    root.onclick=e=>{
      const db=e.target.closest('[data-day]'); if(db){ Z.store.s('todoView',Z.addDays(viewKey(),+db.dataset.day)); Z.views.todo(root); return; }
      if(e.target.closest('[data-today]')){ Z.store.s('todoView',Z.todayISO()); Z.views.todo(root); return; }
      const chk=e.target.closest('.chk'); if(!chk)return;
      const i=+chk.closest('.todoRow').dataset.i;
      const {m,k,rows}=getRows(dayData());
      const r=rows[i];
      if(!r.t.trim()){ Z.toast(chk.dataset.k==='ok'?'先写任务内容再打勾 ✓':'这项还是空的，先写点内容吧'); return; }
      if(chk.dataset.k==='ok') r.s = r.s===1?0:1; else r.s = r.s===2?0:2;
      saveRows(m,k,rows); Z.views.todo(root);
    };
    root.addEventListener('input',e=>{
      if(e.target.id==='todoDate'){ Z.store.s('todoView',e.target.value); Z.views.todo(root); return; }
      const inp=e.target.closest('.todoRow input'); if(!inp)return;
      const {m,k,rows}=getRows(dayData());
      rows[+inp.closest('.todoRow').dataset.i].t=inp.value;
      saveRows(m,k,rows);
    });
  });
  Z.hacts['todo::clear']=()=>{ Z.confirmBox('清空 '+Z.cnDate(viewKey())+' 的全部任务内容？',{danger:true}).then(y=>{ if(y){ const m=dayData(); const k=viewKey(); m[k]={rows:[]}; Z.store.s('todoMap',m); refreshBadges(); Z.go('todo'); Z.toast('已清空'); } }); };
}

/* ---------------- 项目库（整合视图） ---------------- */
function libView(){
  Z.regView('lib',(root)=>{
    let mods=Z.settings.lib && Z.settings.lib.length? Z.settings.lib : ['idea','fenjie','copy','hot2','data','text','read'];
    Z.settings.lib=mods; Z.saveSettings();
    const st=uiState.lib=uiState.lib||{q:''};
    const q=st.q||'';
    const items=[];
    mods.forEach(m=>{ list(m).forEach(it=>items.push({m,it})); });
    items.sort((a,b)=>b.it.updated-a.it.updated);
    const ql=q.toLowerCase();
    const filt = ql? items.filter(o=>(o.it.title+(o.it.fields?JSON.stringify(o.it.fields):'')).toLowerCase().indexOf(ql)>=0) : items;
    const chips=Z.MODS.filter(m=>SCHEMA[m.id]).map(m=>'<button class="pill '+(mods.indexOf(m.id)>=0?'on':'')+'" data-tg="'+m.id+'">'+m.icon+' '+m.name+'</button>').join('');
    const cards=filt.map(o=>{
      const m=Z.byId[o.m], it=o.it, sch=SCHEMA[o.m];
      const stl=sch.st.find(s=>s[0]===it.status)||sch.st[0];
      const mCol=m.c;
      const chips2=(it.links&&it.links.length)? it.links.filter(l=>Z.byId[l.m]).slice(0,3).map(l=>'<span class="linkChip" style="pointer-events:none">'+Z.byId[l.m].icon+' '+Z.byId[l.m].name+'</span>').join('') : '';
      return '<div class="mCard" data-m="'+o.m+'" data-id="'+it.id+'" style="'+Z.cssV(mCol)+';border-left:5px solid '+mCol+'">'
        +'<div class="row"><span class="tag" style="--c-soft:'+Z.rgba(mCol,.16)+';--c-deep:'+mCol+'">'+m.icon+' '+m.name+'</span>'
        +'<span class="statusChip" style="--st-soft:'+Z.rgba(mCol,.14)+';--st-deep:'+mCol+'">'+stl[1]+'</span></div>'
        +'<h4>'+Z.esc(itemName(it))+'</h4>'
        +(chips2?'<div class="foot">'+chips2+'</div>':'')
        +'</div>';
    }).join('');
    const listHtml = filt.length? '<div class="gridCards">'+cards+'</div>'
      : '<div class="empty"><div class="big">🗂️</div><div>'+(q?'没有匹配内容':'勾选上方状态栏查看整合视图')+'</div></div>';
    root.innerHTML='<div class="toolbar"><input type="search" placeholder="跨状态栏搜索…" value="'+Z.esc(q)+'" id="libQ" style="max-width:200px"><div class="sp"></div><button class="hBtn" data-clear="1" style="background:#fff">✕ 清除搜索</button></div>'
      +'<div class="row mb8">'+chips+'</div>'
      +'<div class="muted mb8" style="font-size:12px">把多个状态栏整合到一起，按创作链路集中查看。点击任意卡片可跳转到对应状态栏继续编辑。</div>'
      +listHtml;
    return {title:'项目库', sub:'自由添加 / 整合你的状态栏', acts:''};
  },(root)=>{
    root.onclick=e=>{
      const tg=e.target.closest('[data-tg]');
      if(tg){ const m=tg.dataset.tg; const arr=Z.settings.lib||[]; const i=arr.indexOf(m); if(i>=0)arr.splice(i,1); else arr.push(m); Z.settings.lib=arr; Z.saveSettings(); Z.views.lib(root); return; }
      if(e.target.closest('[data-clear]')){ uiState.lib.q=''; Z.views.lib(root); return; }
      const c=e.target.closest('.mCard'); if(c){ Z.go(c.dataset.m,{openId:c.dataset.id}); }
    };
    root.addEventListener('input',e=>{ if(e.target.id==='libQ'){ const v=e.target.value, pos=e.target.selectionStart; uiState.lib.q=v; Z.views.lib(root); const q2=document.getElementById('libQ'); if(q2){ q2.focus(); try{q2.setSelectionRange(pos,pos);}catch(_){ } } } });
  });
}

/* ---------------- 工作台设置 ---------------- */
function settingsView(){
  function bgThumb(){
    const bg=Z.settings.bg;
    return bg.url? '<div class="bgThumb" id="bgPrev"><img src="'+bg.url+'"></div>'
      :'<div class="bgThumb" id="bgPrev"><span>暂无背景 · 点下方按钮上传一张你喜欢的图片<br>支持大小 / 模糊 / 透明度调节</span></div>';
  }
  function fmtTs(t){ if(!t)return'从未'; const d=new Date(t); return (d.getMonth()+1)+'/'+d.getDate()+' '+d.getHours()+':'+String(d.getMinutes()).padStart(2,'0'); }
  function syncPanel(){
    const s=(Z.sync&&Z.sync.status&&Z.sync.status())||{};
    const on=!!(s.token && s.gistId);
    const st=on?(s.lastError?'<span style="color:#b4534a">⚠️ '+Z.esc(s.lastError)+'</span>':'<span style="color:#5d7a52">✅ 已连接</span>'):'未配置';
    const body=on?
      '<div class="muted small mb8">设备名：<b>'+Z.esc(s.device||'-')+'</b>　·　状态：'+st+'</div>'
      +'<div class="muted small mb8">最近上传：<b>'+fmtTs(s.lastPushAt)+'</b>　最近拉取：<b>'+fmtTs(s.lastPullAt)+'</b></div>'
      +'<div class="row"><button class="btn pri" id="syncNowBtn">🔄 立即同步</button>'
      +'<button class="btn softB" id="syncUnbindBtn">解除绑定</button></div>'
      +'<div class="muted small mt8">💡 在另一端配置相同的 Token 即可双向同步；自动每 30 秒后台轮询。本端任何写入 1.5 秒内会上传。</div>'
      :'<div class="muted small mb8">用你的 GitHub Personal Access Token（需 <b>gist</b> 权限）创建一个私有 Gist 作为同步介质，所有数据自动双向同步。</div>'
      +'<label class="muted small">GitHub Token（含 gist 权限）</label>'
      +'<input id="syncPat" type="password" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" class="ipt" style="width:100%;margin:6px 0">'
      +'<div class="row"><button class="btn pri" id="syncSetupBtn">🔗 绑定并开启云同步</button></div>'
      +'<div class="muted small mt8">📌 <a href="https://github.com/settings/tokens/new?scopes=gist&description=zhaoline-workbench" target="_blank" style="color:var(--c,#5f7a54)">点此打开 GitHub → 生成 Token（勾 gist）</a>；可设永不过期。</div>';
    return '<div class="setCard"><h3>☁️ 云同步（GitHub Gist）</h3>'+body+'</div>';
  }
  function render(){
    const bg=Z.settings.bg;
    const $=Z.$;
    $('#view').innerHTML='';
    const w=document.createElement('div'); w.className='viewWrap'; $('#view').appendChild(w);
    let h='<div class="setCard"><h3>🎨 背景图片</h3>'+bgThumb();
    h+='<div class="row mt10">'+'<button class="btn softB" id="bgUp">📤 添加图片背景</button>'
      +(bg.url?'<button class="btn ghost" id="bgReset">恢复默认（无图）</button>':'')+'</div>';
    h+='<div class="row mt10" style="display:none" id="bgRgb"><button class="btn ghost sm">随机柔和色</button></div>';
    if(bg.url){
      h+='<div class="rangeRow"><label>缩放</label><input type="range" id="bgZoom" min="0.6" max="2.2" step="0.02" value="'+(bg.zoom||1)+'"><output>'+(bg.zoom||1)+'x</output></div>'
      +'<div class="rangeRow"><label>模糊</label><input type="range" id="bgBlur" min="0" max="18" step="1" value="'+(bg.blur||0)+'"><output>'+(bg.blur||0)+'px</output></div>'
      +'<div class="rangeRow"><label>透明度</label><input type="range" id="bgOp" min="0.2" max="1" step="0.05" value="'+(bg.op||.9)+'"><output>'+(bg.op||.9)+'</output></div>'
      +'<div class="row mt10"><button class="pill" id="bgPosC">居中</button><button class="pill" id="bgPosT">顶部</button><button class="pill" id="bgPosB">底部</button></div>';
    }
    h+='</div>';
    h+=syncPanel();
    h+='<div class="setCard"><h3>💾 离线备份（不依赖云）</h3><p class="muted small">把全部数据导出为 JSON 文件，可在另一台设备导入恢复（不会清空云端数据，互为补充）。</p>'
      +'<div class="row"><button class="btn softB" id="expData">⬇️ 导出备份</button><button class="btn softB" id="impData">⬆️ 导入备份</button></div></div>';
    h+='<div class="setCard"><h3>🧭 使用提示</h3><div class="muted small" style="line-height:2">'
      +'· 电脑端：浏览器打开即可用；本应用支持 <b>下载到本地离线运行</b>（见随包说明）。<br>'
      +'· 苹果手机：用 Safari 打开部署网址 → 点「分享」→「添加到主屏幕」，图标和名字会生成一个像原生 App 的入口，可离线日常使用。<br>'
      +'· 左侧状态栏第 2~9 项可互相「衔接」，串起：灵感 → 拆解 → 文案 → 日历发布 → 数据复盘 的完整链路。<br>'
      +'· 云同步可选：配置一次 GitHub Token，电脑/手机数据近实时互通；离线数据始终可用，不上传任何服务器（除非你主动开启云同步）。</div></div>';
    h+='<div class="setCard" style="text-align:center;opacity:.75"><div class="muted small">zhaoline工作台 · 樱桃每天运转 🍒<br>莫兰迪色系 · 移动优先 · 本地优先</div></div>';
    w.innerHTML=h;

    // 事件
    w.onclick=e=>{
      const t=e.target;
      if(t.id==='bgUp'){ Z.pickFile('image/*',false,files=>{ const f=files[0]; if(!f)return; const img=new Image(); const url=URL.createObjectURL(f); img.onload=()=>{ const cv=document.createElement('canvas'); const scale=Math.min(1,1600/img.width); cv.width=Math.round(img.width*scale); cv.height=Math.round(img.height*scale); const cx=cv.getContext('2d'); cx.drawImage(img,0,0,cv.width,cv.height); const data=cv.toDataURL('image/jpeg',.82); URL.revokeObjectURL(url); Z.settings.bg.url=data; Z.settings.bg.on=true; Z.saveSettings(); Z.applyBg(); Z.toast('背景已添加，试试调节大小/模糊'); render(); }; img.src=url; }); return; }
      if(t.id==='bgReset'){ Z.settings.bg.url=''; Z.settings.bg.on=false; Z.saveSettings(); Z.applyBg(); render(); return; }
      if(t.id==='bgPosC'||t.id==='bgPosT'||t.id==='bgPosB'){ Z.settings.bg.pos=t.id==='bgPosC'?'center center':t.id==='bgPosT'?'50% 18%':'50% 82%'; Z.saveSettings(); Z.applyBg(); render(); return; }
      if(t.id==='expData'){ const all=Z.store.exportAll(); const blob=new Blob([JSON.stringify(all,null,1)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='zhaoline工作台-备份-'+Z.todayISO()+'.json'; a.click(); URL.revokeObjectURL(a.href); Z.toast('备份文件已开始下载'); return; }
      if(t.id==='impData'){ Z.pickFile('.json,application/json',false,files=>{ const f=files[0]; if(!f)return; const r=new FileReader(); r.onload=()=>{ try{ const o=JSON.parse(r.result); Z.store.importAll(o); Z.toast('✅ 导入成功，内容已恢复'); setTimeout(()=>location.reload(),600); }catch(err){ Z.toast('文件格式不正确'); } }; r.readAsText(f); }); return; }
      if(t.id==='syncSetupBtn'){ const inp=Z.$('#syncPat',w); const tok=(inp&&inp.value||'').trim(); if(!tok){ Z.toast('请先粘贴 Token'); return; } Z.toast('正在创建 Gist…'); Z.sync.setup(tok).then(()=>{ Z.toast('✅ 同步已开启'); render(); }).catch(err=>{ Z.toast('❌ '+Z.esc(String(err.message||err))); }); return; }
      if(t.id==='syncNowBtn'){ Z.toast('正在同步…'); Z.sync.syncNow().then(n=>{ Z.toast('✅ 已同步 · 本次拉取更新 '+(n||0)+' 项'); render(); }).catch(err=>{ Z.toast('❌ '+Z.esc(String(err.message||err))); }); return; }
      if(t.id==='syncUnbindBtn'){ Z.confirmBox('解除云同步？本端数据保留，只是停止与云端互相同步。',{danger:true}).then(y=>{ if(y){ Z.sync.unbind(); Z.toast('已解除绑定'); render(); } }); return; }
    };
    w.addEventListener('input',e=>{
      const t=e.target;
      if(t.id==='bgZoom'){ Z.settings.bg.zoom=+t.value; t.nextElementSibling.textContent=+t.value+'x'; Z.saveSettings(); Z.applyBg(); }
      if(t.id==='bgBlur'){ Z.settings.bg.blur=+t.value; t.nextElementSibling.textContent=t.value+'px'; Z.saveSettings(); Z.applyBg(); }
      if(t.id==='bgOp'){ Z.settings.bg.op=+t.value; t.nextElementSibling.textContent=+t.value; Z.saveSettings(); Z.applyBg(); }
    });
    return {title:'工作台设置', sub:'背景 / 云同步 / 备份 / 使用说明', acts:''};
  }
  Z.regView('settings',(root)=>render(),()=>{});
}

/* ---------------- 徽标刷新 ---------------- */
function refreshBadges(){
  const counts={};
  ['todo'].concat(Object.keys(SCHEMA)).forEach(m=>counts[m]=0);
  Object.keys(SCHEMA).forEach(m=>counts[m]=list(m).length);
  const tm=Z.store.g('todoMap',{});
  const today=tm[Z.todayISO()];
  if(today){ const r=today.rows||[]; counts.todo=r.filter(x=>x.t.trim()&&x.s===1).length + '/' + r.filter(x=>x.t.trim()).length; }
  Z.MODS.forEach(m=>{ const b=Z.$('#bdg-'+m.id); if(!b)return; const v=counts[m.id]; b.textContent=(v===0||v==='')?'':(v==='0/0'?'':v); b.style.display=v&&v!=='0/0'?'':'none'; });
}

/* ---------------- 注册全部通用模块 ---------------- */
Object.keys(SCHEMA).forEach(genView);
libView();
settingsView();
todoView();

window.ZCore={list,getItem,itemName,upsertItem,clearIncomingLinks,refreshBadges,openEditor};
})();
