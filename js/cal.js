/* ============= zhaoline工作台 · 日历规划（视频排期 + 打卡） ============= */
(function(){
const Z=window.Z;

const PLAT=['抖音','小红书','B站','视频号','快手','YouTube','公众号','其他'];
const VTYPE=['口播','剧情/短剧','图文笔记','混剪','vlog','直播','带货','测评','教程','其他'];
const ST_DEF={st:'plan',label:'待发布'};
function stName(s){ return s==='pub'?'已发布':(s==='plan'?'待发布':'草稿'); }

const mapAll=()=>Z.store.g('calMap',{});
function dayRec(d){ const m=mapAll(); if(!m[d]) m[d]={check:false,posts:[]}; return m[d]; }
function saveDay(d){ const m=mapAll(); m[d]=Z.store.g('calMap',{})[d]||m[d]; Z.store.s('calMap',m); }
function saveMap(m){ Z.store.s('calMap',m); }

function ymOf(d){ return {y:d.getFullYear(),m:d.getMonth()}; }
const KEY=Z.dkey, TODAY=Z.todayISO;

let viewYM = ymOf(new Date());   // 正在查看的年月
let selDay = TODAY();            // 选中日期

function calView(root){
  const mAll=mapAll();
  const today=TODAY();
  const first=new Date(viewYM.y, viewYM.m, 1);
  const startDow=(first.getDay()+6)%7;             // 周一开头
  const daysIn=new Date(viewYM.y, viewYM.m+1, 0).getDate();
  const prevDays=new Date(viewYM.y, viewYM.m, 0).getDate();
  // 本月统计
  let pubCnt=0, planCnt=0;
  const monthPre=Z.pad(viewYM.m+1);
  for(let d=1;d<=daysIn;d++){
    const key=viewYM.y+'-'+monthPre+'-'+Z.pad(d);
    const rec=mAll[key];
    if(rec){ rec.posts.forEach(p=>{ if(p.st==='pub')pubCnt++; else if(p.st==='plan')planCnt++; }); }
  }
  const cells=[];
  for(let i=0;i<startDow;i++){
    const d=prevDays-startDow+1+i;
    const key=Z.addDays(viewYM.y+'-'+monthPre+'-01',-(startDow-i));
    cells.push(cellHTML(key,d,true));
  }
  for(let d=1;d<=daysIn;d++){
    const key=viewYM.y+'-'+monthPre+'-'+Z.pad(d);
    cells.push(cellHTML(key,d,false));
  }
  let k=1; while(cells.length%7){ cells.push(cellHTML(Z.addDays(viewYM.y+'-'+monthPre+'-'+daysIn,k),k,true)); k++; }

  const dow=['一','二','三','四','五','六','日'].map(x=>'<div class="calDow">周'+x+'</div>').join('');
  root.innerHTML=
    '<div class="calHead">'
    +'<button class="iconBtn" data-mo="-1">‹</button>'
    +'<div style="font-weight:700;font-size:16px;min-width:150px;text-align:center">'+viewYM.y+' 年 '+(viewYM.m+1)+' 月</div>'
    +'<button class="iconBtn" data-mo="1">›</button>'
    +(viewYM.y!==new Date().getFullYear()||viewYM.m!==new Date().getMonth()?'<button class="pill" data-today="1">回到本月</button>':'')
    +'<div style="margin-left:auto" class="row"><span class="tag" style="--c-soft:'+Z.rgba('#9db18d',.16)+';--c-deep:#5d7a52">本月已发布 '+pubCnt+'</span><span class="tag" style="--c-soft:'+Z.rgba('#7d9471',.15)+';--c-deep:#5f7a54">待发布 '+planCnt+'</span></div>'
    +'</div>'
    +'<div class="calGrid">'+dow+cells.join('')+'</div>'
    +'<hr class="hr">'
    +dayPanel(selDay);
  return {title:'日历规划', sub:'随真实日期更新 · 点日期排期 / 打卡', acts:'<button class="hBtn" data-hact="cal::new">＋ 排期</button>'};
}

function cellHTML(key,d,other){
  const mAll=mapAll();
  const rec=mAll[key];
  const isToday=key===TODAY();
  const isSel=key===selDay;
  const posts=rec?rec.posts:[];
  const pubN=posts.filter(p=>p.st==='pub').length;
  const planN=posts.filter(p=>p.st==='plan').length;
  const show=posts.slice(0,2).map(p=>'<i class="'+(p.st==='pub'?'pub':'')+(p.st==='pub'?'':'')+'" title="'+Z.esc(p.title)+'">'+(p.st==='pub'?'✓':'')+'·'+Z.esc((p.title||'').slice(0,9))+'</i>').join('');
  return '<div class="calCell '+(other?'other':'')+(isToday?'today':'')+(isSel?' sel':'')+(rec&&rec.check?' checked':'')+'" data-d="'+key+'" data-other="'+(other?1:0)+'" style="'+Z.cssV('#93a481')+'">'
    +'<div class="calNum"><b>'+parseInt(key.slice(8),10)+'</b>'
    +(rec&&rec.check?'<span class="checkDot" title="已打卡"></span>':'')
    +'<span style="margin-left:auto;font-size:9.5px;color:var(--muted)">'+(posts.length?posts.length+'项':'')+'</span></div>'
    +'<div class="calP">'+show+(posts.length>2?'<i class="cnt">+'+ (posts.length-2) +' 更多</i>':'')+'</div>'
    +'</div>';
}

function dayPanel(d){
  const mAll=mapAll();
  const rec=mAll[d]||{check:false,posts:[]};
  const isToday=d===TODAY();
  const chips=['<button class="dayTag '+(rec.check?'on':'')+'" data-chk="1" style="'+(rec.check?'background:var(--sage);color:#fff':'')+'">'+(rec.check?'✅ 已打卡':'○ 今日打卡')+'</button>']
    .join('');
  const postsHtml=rec.posts.length? rec.posts.map(p=>{
    return '<div class="postRow" data-pid="'+p.id+'">'
      +'<span class="tag" style="--c-soft:'+Z.rgba('#8aa396',.16)+';--c-deep:#6b877a">'+Z.esc(p.plat||'')+'</span>'
      +'<span class="tag">'+Z.esc(p.vtype||'')+'</span>'
      +'<div class="grow"><div style="font-size:13.5px;line-height:1.35">'+Z.esc(p.title||'(未命名排期)')+'</div>'
      +(p.src&&p.src.m?'<div class="muted" style="font-size:11px;margin-top:2px">衔接素材：'+Z.byId[p.src.m].icon+' '+Z.esc(Z.byId[p.src.m].name)+' › '+Z.esc(ZCore.itemName(ZCore.getItem(p.src.m,p.src.id))||'')+' <a data-src="1" style="cursor:pointer;color:var(--c,#5f7a54)">查看 ›</a></div>':'')+'</div>'
      +'<button class="stB '+(p.st==='pub'?'pub':'')+'" data-tog="1" title="点击切换是否发布">'+(p.st==='pub'?'已发布 ✓':'待发布')+'</button>'
      +'<button class="iconBtn" data-del="1" title="删除">🗑</button>'
      +'</div>';
  }).join('') : '<div class="empty" style="padding:18px"><div>这一天还没有排期</div><div class="muted">点击下方「＋ 添加排期」安排视频/图文发布</div></div>';
  return '<div id="dayPanel">'
    +'<div class="row"><div style="font-weight:700">'+Z.cnDate(d)+(isToday?' <span class="tag" style="--c-soft:'+Z.rgba('#7d9471',.15)+';--c-deep:#5f7a54">今天</span>':'')+'</div>'
    +'<div style="margin-left:auto">'+chips+'</div></div>'
    +'<div class="mt10">'+postsHtml+'</div>'
    +'<button class="btn softB mt10" data-add="1" style="--c:'+Z.byId.cal.c+'">＋ 为这一天添加排期</button>'
    +'</div>';
}

function openPostForm(d,post){
  const isNew=!post;
  const p=isNew? {id:Z.uid(),st:'plan',title:'',plat:'小红书',vtype:'口播',src:null} : JSON.parse(JSON.stringify(post));
  const allMods=['idea','fenjie','copy','hot2','data','text','read'];
  let srcOpts='<option value="">— 不衔接素材 —</option>';
  allMods.forEach(m=>{ const arr=Z.store.g('m_'+m,[]); if(!arr.length)return;
    srcOpts+='<option value="'+m+'::" disabled style="opacity:.7">── '+Z.byId[m].name+' ──</option>';
    arr.slice(0,40).forEach(it=>{ srcOpts+='<option value="'+m+'::'+it.id+'">'+Z.esc((it.title||'?').slice(0,30))+'</option>'; });
  });
  Z.modal({ title:(isNew?'添加排期 · ':'编辑排期 · ')+Z.cnDate(d),
    body:'<div id="mbody">'
      +'<label class="f">作品标题 / 内容</label><input type="text" id="pTitle" value="'+Z.esc(p.title)+'" placeholder="例如：秋天第一杯奶茶 3 个拍法">'
      +'<div class="row"><label class="f" style="margin:10px 0 0;flex:1">平台 <select id="pPlat">'+PLAT.map(x=>'<option '+(p.plat===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'
      +'<label class="f" style="margin:10px 0 0;flex:1">形式 <select id="pVtype">'+VTYPE.map(x=>'<option '+(p.vtype===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label></div>'
      +'<label class="f">发布状态</label><select id="pSt"><option value="plan" '+(p.st==='plan'?'selected':'')+'>⏳ 待发布</option><option value="pub" '+(p.st==='pub'?'selected':'')+'>✅ 已发布</option><option value="draft" '+(p.st==='draft'?'selected':'')+'>📝 草稿</option></select>'
      +'<label class="f">衔接素材（从灵感/拆解/文案/热点等状态栏选择）</label><select id="pSrc">'+srcOpts+'</select>'
      +'</div>',
    acts:[ {label:isNew?'保存排期':'保存修改',key:'ok',cls:'pri',fn:()=>{
        p.title=Z.$('#pTitle').value.trim(); p.plat=Z.$('#pPlat').value; p.vtype=Z.$('#pVtype').value; p.st=Z.$('#pSt').value;
        if(!p.title){ Z.toast('请填写标题/内容'); return; }
        const sv=Z.$('#pSrc').value;
        // 处理衔接素材：来源 item 记录 → calendar
        const oldSrc=p.src; 
        p.src=null;
        if(sv){ const [m,id]=sv.split('::'); if(m&&id){ p.src={m,id}; const it=ZCore.getItem(m,id);
          if(it){ it.links=it.links||[]; it.links=it.links.filter(l=>!(l.m==='cal'&&l.id===p.id)); it.links.push({m:'cal',id:p.id,note:Z.cnDate(d)+' 排期',ts:Date.now()}); ZCore.upsertItem(m,it); } } }
        if(oldSrc && (!sv||oldSrc.m+'::'+oldSrc.id!==sv)){ const it=ZCore.getItem(oldSrc.m,oldSrc.id); if(it){ it.links=(it.links||[]).filter(l=>!(l.m==='cal'&&l.id===p.id)); ZCore.upsertItem(oldSrc.m,it); } }
        const mAll=mapAll(); const rec=mAll[d]=mAll[d]||{check:false,posts:[]};
        const i=rec.posts.findIndex(x=>x.id===p.id);
        if(i>=0)rec.posts[i]=p; else rec.posts.unshift(p);
        saveMap(mAll);
        ZCore.refreshBadges();
        Z.closeModal(); Z.toast('✅ 已保存到 '+Z.cnDate(d)); refreshAll();
    }},{label:'删除',key:'del',cls:'danger',fn:()=>{ if(isNew){Z.closeModal();return;} Z.confirmBox('删除这条排期？',{danger:true}).then(y=>{ if(y){ const mAll=mapAll(); const rec=mAll[d]; rec.posts=rec.posts.filter(x=>x.id!==p.id); saveMap(mAll); Z.closeModal(); refreshAll(); Z.toast('已删除'); } }); }},{label:'取消',key:'x',cls:'ghost',fn:()=>Z.closeModal()} ] });
}

let _root=null;
function refreshAll(){ if(_root){ Z.views.cal(_root); } }

Z.regView('cal',(root,arg)=>{
  _root=root;
  calView(root);
  if(arg && arg.openD){ selDay=arg.openD; if(arg.mode==='post'&&arg.openP){ openPostForm(selDay,arg.openP); } }
  return {title:'日历规划', sub:'随真实日期更新 · 点日期排期 / 打卡 · 月号可标记颜色', acts:'<button class="hBtn" data-hact="cal::new">＋ 添加排期</button>'};
},(root,arg)=>{
  _root=root;
  root.onclick=e=>{
    const mo=e.target.closest('[data-mo]'); if(mo){ const d=new Date(viewYM.y,viewYM.m+ (+mo.dataset.mo),1); viewYM=ymOf(d); calView(root); return; }
    if(e.target.closest('[data-today]')){ viewYM=ymOf(new Date()); selDay=TODAY(); calView(root); return; }
    const cell=e.target.closest('.calCell'); if(cell){ selDay=cell.dataset.d; calView(root); return; }
    const chk=e.target.closest('[data-chk]'); if(chk){ const mAll=mapAll(); const rec=mAll[selDay]=mAll[selDay]||{check:false,posts:[]}; rec.check=!rec.check; saveMap(mAll); calView(root); Z.toast(rec.check?'已打卡，当天有颜色标记 🎯':'已取消今日打卡'); return; }
    const add=e.target.closest('[data-add]'); if(add){ openPostForm(selDay,null); return; }
    const del=e.target.closest('[data-del]'); if(del){ const pid=del.closest('.postRow').dataset.pid; const mAll=mapAll(); const rec=mAll[selDay]; const p=rec.posts.find(x=>x.id===pid);
      if(p&&p.src){ const it=ZCore.getItem(p.src.m,p.src.id); if(it){ it.links=(it.links||[]).filter(l=>!(l.m==='cal'&&l.id===p.id)); ZCore.upsertItem(p.src.m,it); } }
      rec.posts=rec.posts.filter(x=>x.id!==pid); saveMap(mAll); calView(root); Z.toast('已删除排期'); return; }
    const tog=e.target.closest('[data-tog]'); if(tog){ const pid=tog.closest('.postRow').dataset.pid; const mAll=mapAll(); const rec=mAll[selDay]; const p=rec.posts.find(x=>x.id===pid); p.st=(p.st==='pub')?'plan':'pub'; saveMap(mAll); calView(root); Z.toast(p.st==='pub'?'已标记为已发布 ✓':'已改回待发布'); return; }
    const src=e.target.closest('[data-src]'); if(src){ const pid=src.closest('.postRow').dataset.pid; const mAll=mapAll(); const p=(mAll[selDay]||{}).posts.find(x=>x.id===pid); if(p&&p.src){ const it=ZCore.getItem(p.src.m,p.src.id); if(it)ZCore.openEditor(p.src.m,it); } return; }
    const row=e.target.closest('.postRow'); if(row){ const pid=row.dataset.pid; const mAll=mapAll(); const p=(mAll[selDay]||{}).posts.find(x=>x.id===pid); if(p)openPostForm(selDay,p); }
  };
});

Z.hacts['cal::new']=()=>{ selDay=TODAY(); viewYM=ymOf(new Date()); if(Z.cur()!=='cal'){ Z.go('cal'); } openPostForm(selDay,null); };
})();
