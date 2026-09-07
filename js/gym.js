/* ============= zhaoline工作台 · 增肌计划（女 · 45kg → 48kg · 3个月健康增肌） ============= */
(function(){
const Z=window.Z;

const PROF=Z.settings.gProfile;
function prof(){ const p=Object.assign({gender:'女',age:24,height:161,weight:45,target:48,months:3},Z.settings.gProfile); return p; }
const data=()=>Z.store.g('gym',{done:{},checks:{},weights:[],start:Z.todayISO()});
const saveData=d=>Z.store.s('gym',d);

/* 营养计算（Mifflin-St Jeor） */
function calc(){
  const p=prof();
  const w=p.weight,h=p.height,a=p.age;
  const bmr=p.gender==='女'? 10*w+6.25*h-5*a-161 : 10*w+6.25*h-5*a+5;
  const tdee=Math.round(bmr*1.4);
  const kcal=Math.round(tdee+230);                 // 温和盈余（干净增肌）
  const prot=Math.max(75,Math.round(1.9*w));       // 蛋白质
  const fat=Math.round(Math.max(45, w*1.1));
  const carb=Math.round((kcal-prot*4-fat*9)/4);
  const delta=p.target-p.weight;
  return {p,delta,kcal,prot,fat,carb,weeks:Math.round(p.months*4.33)};
}

const DAYA=[
 ['高脚杯深蹲（或杠铃深蹲）','3 组 × 10 次 · 核心力量之王'],
 ['臀桥（可负重）','3 组 × 12 次 · 臀部发力'],
 ['跪姿俯卧撑','3 组 × 10-12 次 · 胸部+手臂'],
 ['坐姿哑铃肩上推举','3 组 × 10 次 · 肩部'],
 ['单臂哑铃划船','3 组 × 12 次/侧 · 背部'],
 ['平板支撑','3 组 × 35-50 秒 · 核心'],
 ['全身拉伸 + 泡沫轴','5 分钟']
];
const DAYB=[
 ['哑铃罗马尼亚硬拉','3 组 × 10 次 · 大腿后侧+臀'],
 ['保加利亚分腿蹲','3 组 × 8-10 次/腿 · 臀腿'],
 ['上斜俯卧撑（或哑铃卧推）','3 组 × 10 次 · 上胸'],
 ['哑铃弯举 + 颈后臂屈伸','3 组 × 12 次 · 手臂'],
 ['反向卷腹','3 组 × 12-15 次 · 下腹'],
 ['死虫式（Dead Bug）','3 组 × 12 次/侧 · 核心稳定'],
 ['全身拉伸 + 泡沫轴','5 分钟']
];
const RULES=[
 '增肌原理：训练破坏肌肉 → 营养修复 → 睡眠合成，三者缺一不可。',
 '渐进超负荷：每组最后 1-2 次要有点“吃力但标准”。能轻松做完就加重量或次数。',
 '自重也能增肌：新手期俯卧撑/深蹲进步飞快，先别急着买大重量。',
 '蛋白质每餐分着吃：早/中/晚各 25g 左右，比一顿吃 80g 更有效。',
 '别疯狂做有氧：每周 1-2 次慢走/快走即可，过度有氧会吃掉增肌热量。',
 '别熬夜：肌肉在睡眠中生长，7.5-9 小时是硬指标。',
 '不要只吃水煮：脂肪是女生激素健康的关键，好油（橄榄油/坚果/鱼）每天都要有。',
 '体重不是唯一标准：每周记录腰围和照片，围度比数字更诚实。',
 '月经前体重小幅上升是正常水分波动，不要焦虑，继续按计划走。',
 '平台期对策：体重 2 周没动 → 每天加 100-150 kcal（多半勺饭/一把坚果）。'
];
const WEEK=['日','一','二','三','四','五','六'];

/* ---------- 今日视图 ---------- */
function todayHTML(root){
  const c=calc(), p=c.p, d=data(), today=Z.todayISO();
  const chk=d.checks[today]||{};
  const deadline=addMonthsToISO(d.start||today,p.months);
  const start=parseISO(d.start||today), now=new Date();
  const weekNow=Math.max(0,Math.min(c.weeks,Math.floor((now-start)/(7*864e5))+1));
  const sess=sessionType(d);
  const todayW=WEEK[new Date().getDay()];
  const isTrainDay=Z.settings.gymDays? Z.settings.gymDays.indexOf(todayW)>=0 : ['一','三','五'].indexOf(todayW)>=0;
  const tips=['💧 水 2.0L','🥚 蛋白质 '+c.prot+'g','😴 睡足 7.5h+','🍚 碳水 '+c.carb+'g'];
  const checks=[
    {k:'w',label:'喝水 2 升',on:chk.w},
    {k:'p',label:'吃够蛋白质',on:chk.p},
    {k:'c',label:'碳水吃够',on:chk.c},
    {k:'s',label:'23:30 前睡',on:chk.s}
  ];
  const trainState = chk.t? {label:'今日训练已完成 ✅',cls:'done'} : isTrainDay? {label:'今天是训练日 · 类型 '+sess,cls:'todo'} : {label:'今天是休息日（可快走 20 分钟）',cls:'rest'};
  const lastW= d.weights.slice().sort((a,b)=>a.d<b.d?1:-1)[0];
  return '<div class="kpiRow">'
    +kpi('当前',''+p.weight+' kg',Z.rgba('#b99a72',1))
    +kpi('目标',''+p.target+' kg',Z.rgba('#7d9471',1))
    +kpi('还需','+'+c.delta+' kg',Z.rgba('#9db18d',1))
    +kpi('倒计时',''+diffDays(today,deadline)+' 天',Z.rgba('#8aa396',1))
    +'</div>'
    +'<div class="card" style="'+Z.cssV('#7d9471')+'"><h3 style="margin:0 0 8px">🎯 今日清单（'+Z.cnDate(today)+' · 第 '+weekNow+'/'+c.weeks+' 周）</h3>'
    +'<div class="row" style="margin-bottom:6px"><span class="statusChip" style="--st-soft:'+Z.rgba('#7d9471',.14)+';--st-deep:'+(trainState.cls==='done'?'#5d7a52':'#5f7a54')+'">'+(trainState.cls==='done'?'✅ 已完成':'🏋️ 待完成')+'</span><span style="font-size:13px">'+trainState.label+'</span>'
    +(trainState.cls!=='done'&&isTrainDay?'<button class="btn pri sm" data-train="'+sess+'" style="margin-left:auto">✔ 完成今日训练('+sess+')</button>':trainState.cls==='done'?'<button class="btn ghost sm" data-untrain="1" style="margin-left:auto">撤销</button>':'')+'</div>'
    +'<div class="row">'+checks.map(x=>'<button class="dayTag '+(x.on?'on':'')+'" data-chk="'+x.k+'" style="'+(x.on?'background:#9db18d;color:#fff':'')+'">'+(x.on?'✓ ':'○ ')+x.label+'</button>').join('')+'</div>'
    +'<div class="muted small mt10">今日参考摄入：<b>'+c.kcal+' kcal</b> · 蛋白质 '+c.prot+'g · 碳水 '+c.carb+'g · 脂肪 '+c.fat+'g　（详见「饮食参考」）</div></div>'
    +(lastW?'<div class="card flat"><div class="small muted">上次称重：'+lastW.d+' · '+lastW.kg+' kg'+(lastW.note?'（'+Z.esc(lastW.note)+'）':'')+' · <button class="btn ghost sm" data-weigh="1">📏 今天称重</button></div></div>'
    :'<button class="btn softB" data-weigh="1" style="margin-bottom:12px">📏 记录本周体重（建议每周三早上空腹称）</button>');
}
function kpi(v,l,c){ return '<div class="kpi"><b style="color:'+c+'">'+v+'</b><span>'+l+'</span></div>'; }
function diffDays(a,b){ return Math.round((parseISO(b)-parseISO(a))/864e5); }
function parseISO(k){ const a=k.split('-'); return new Date(+a[0],+a[1]-1,+a[2]); }
function addMonthsToISO(k,m){ const d=parseISO(k); d.setMonth(d.getMonth()+m); const p=n=>String(n).padStart(2,'0'); return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); }
function sessionType(d){
  let n=0; Object.values(d.done).forEach(v=>{ if(v==='A'||v==='B')n++; });
  return n%2===0?'A':'B';
}
/* ---------- 训练计划 ---------- */
function trainHTML(root){
  const d=data();
  const idx=sessionType(d);
  const week=WEEK;
  // 本周训练安排：显示周一到周日，标出建议训练日与类型，点击标记完成
  const today=Z.todayISO();
  const monday=addDaysISO(today, 1-( (new Date().getDay()+6)%7 ));
  const rows=week.map((wd,i)=>{
    const key=addDaysISO(monday,i);
    const doneD=d.done[key];
    const dayOffset=(new Date().getDay()+6)%7;
    const type=(i%2===0)?'A':'B';     // 周一A周三B周五A(下一周反着? 用完成数推)
    const typeLabel=sessionTypeAt(d,key,i);
    const isSugg=['一','三','五'].indexOf(wd)>=0;
    const isToday=key===today;
    return '<div class="exRow"><span style="font-weight:700;width:58px">周'+wd+(isToday?'(今)':'')+'</span>'
      +'<span class="grow '+(isSugg?'':'muted')+'">'+(isSugg?'建议训练 · '+typeLabel+'':'休息 / 轻活动')+'</span>'
      +'<button class="iconBtn" data-wk="'+key+'" style="'+(doneD? 'background:#9db18d;color:#fff':'')+'" title="标记完成">'+(doneD?'✓':'○')+'</button></div>';
  }).join('');
  return '<div class="card" style="'+Z.cssV('#a8956a')+'"><h3 style="margin:0 0 6px">📅 本周训练安排（点右侧圆圈打卡）</h3><div class="muted small mb8">建议周一 / 周三 / 周五训练（可改到二四六，但保持隔天一次 + 每周至少休 2 天）</div>'+rows+'</div>'
    +'<div class="gridCards" style="grid-template-columns:1fr 1fr">'
    +['A','B'].map(t=>'<div class="card"><h3 style="margin:0 0 10px;font-size:15px">'+(t==='A'?'🏋️ 训练 A · 全身 · 腿臀胸背肩核心':'🏋️ 训练 B · 全身 · 后链+上胸+手臂核心')+'</h3>'
      +(t==='A'?DAYA:DAYB).map(x=>'<div class="exRow" style="box-shadow:none;background:transparent;padding:5px 0;border-bottom:1px dashed var(--line)"><div class="grow" style="font-size:13px">'+x[0]+'</div><div class="setT">'+x[1]+'</div></div>').join('')+'</div>').join('')
    +'</div>'
    +'<div class="card flat"><div style="font-weight:600;margin-bottom:6px">📌 增肌 10 条铁律</div><ul style="margin:0;padding-left:18px;line-height:2;color:var(--ink-2);font-size:13px">'+RULES.map(r=>'<li>'+r+'</li>').join('')+'</ul></div>';
}
function sessionTypeAt(d,key,i){
  // 根据训练完成的先后，自动给出 A/B 交替
  return sessionType(d);
}
function addDaysISO(k,n){ const d=parseISO(k); d.setDate(d.getDate()+n); const p=n=>String(n).padStart(2,'0'); return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); }
/* ---------- 饮食参考 ---------- */
function foodHTML(root){
  const c=calc();
  const meals=[
    ['🌅 早餐 07:30',[
      '牛奶 250ml（或豆浆）','即食燕麦 40g','水煮蛋 1 个','香蕉 1 根','（约 420 kcal · P20 · C60 · F12）']],
    ['🕙 上午加餐 10:00',[
      '无糖酸奶 150g','核桃/巴旦木 15g','蓝莓一小把','（约 210 kcal · P9 · C15 · F13）']],
    ['🍱 午餐 12:30',[
      '米饭（熟）180g','鸡胸肉/瘦牛肉 120g','西兰花/番茄等蔬菜不限量','橄榄油 5g','（约 540 kcal · P34 · C60 · F12）']],
    ['🏋️ 训练后（训练日）17:00',[
      '香蕉 1 根 + 花生酱全麦吐司 1 片','或：鸡蛋 2 个 + 红薯 100g','（约 240 kcal · P12 · C32 · F7）']],
    ['🌙 晚餐 19:00',[
      '红薯/杂粮饭 200g','三文鱼/鲈鱼/卤牛肉 120g','绿叶蔬菜一大盘','橄榄油 7g','（约 500 kcal · P26 · C50 · F20）']],
    ['🛌 睡前（可选）22:00',[
      '温牛奶 200ml（助眠 + 补蛋白）','（约 120 kcal · P6 · C10 · F5）']]
  ];
  return '<div class="kpiRow">'
    +kpi(''+c.kcal+'','每日热量 kcal','')
    +kpi(''+c.prot+' g','蛋白质','')
    +kpi(''+c.carb+' g','碳水化合物','')
    +kpi(''+c.fat+' g','健康脂肪','')
    +'</div>'
    +'<div class="card flat"><div class="muted small">'+(c.p.gender==='女'?'女性':'')+' · '+c.p.age+' 岁 · '+c.p.height+'cm · '+c.p.weight+'kg → 目标 '+c.p.target+'kg，保持 <b>温和热量盈余</b>（约每天多 200-250 kcal）+ 力量训练，肌肉与健康一起长。</div></div>'
    +meals.map(m=>'<div class="mealT"><h5>'+m[0]+'<em>'+m[1][m[1].length-1]+'</em></h5>'+m[1].slice(0,-1).map(x=>'<div style="font-size:13.5px;padding:2px 0">· '+x+'</div>').join('')+'</div>').join('')
    +'<div class="card flat"><div style="font-weight:600">🥄 女生增肌饮食 6 提醒</div><ul style="margin:6px 0 0;padding-left:18px;line-height:2;color:var(--ink-2);font-size:13px">'
    +'<li>别害怕主食和脂肪——它们是你训练和激素的能量来源</li><li>每餐都要有蛋白：鸡蛋/奶/肉/鱼/豆制品轮着吃</li>'
    +'<li>食堂外卖党：加个蛋+加份肉+米饭正常吃，就能凑够</li><li>避免过度节食与低碳水，姨妈会“报警”</li>'
    +'<li>增肌不等于吃垃圾食品：干净的盈余才能长肌肉不长肚腩</li><li>如果 2 周没变化，每天再加 100-150 kcal</li></ul></div>';
}
/* ---------- 进度与档案 ---------- */
function progressHTML(root){
  const p=prof(), d=data();
  const ws=d.weights.slice().sort((a,b)=>a.d<b.d?-1:1);
  const min=Math.min(40,...ws.map(x=>+x.kg),p.target-1);
  const max=Math.max(50,...ws.map(x=>+x.kg),p.weight+1);
  const cur=p.weight;
  const bars=ws.concat([{d:'target',kg:p.target,note:'目标'}]).slice(-9).map(x=>{
    const h=Math.max(4,Math.round((+x.kg-min)/(max-min)*80));
    return '<div class="barCol" title="'+x.d+' '+x.kg+'kg"><i style="height:'+h+'px;'+(x.note==='目标'?'background:linear-gradient(180deg,#b99a72,#5f7a54)':'')+'"></i><span>'+(x.note==='目标'?'目标':x.kg)+'</span></div>';
  }).join('');
  const log=ws.slice().reverse().map(x=>'<div class="fileRow"><b>'+x.d+'</b><span style="font-size:14px">'+x.kg+' kg</span>'+(x.note?'<span class="muted small">'+Z.esc(x.note)+'</span>':'')+'<button class="iconBtn" data-wdel="'+x.d+'" style="margin-left:auto">🗑</button></div>').join('');
  const monday=addDaysISO(Z.todayISO(),1-((new Date().getDay()+6)%7));
  const weekSess=WEEK.map((w,i)=>{ const k=addDaysISO(monday,i); const v=d.done[k]; return v?('周'+w+'·'+v):('周'+w); }).join('　');
  return '<div class="card" style="'+Z.cssV('#a8956a')+'"><h3 style="margin:0 0 8px">📈 体重曲线（记录 → 看到自己在变强）</h3><div class="barWrap">'+bars+'</div>'
    +'<div class="muted small mt6">每次都在<b>同一条件</b>称重：周三早上、空腹、如厕后。围度/照片比体重更真实。</div></div>'
    +'<div class="card flat"><div class="small">上周训练打卡：</div><div class="muted mt6">'+weekSess+'</div></div>'
    +(ws.length?'<div class="card flat"><div style="font-weight:600;margin-bottom:6px">称重记录</div>'+log+'</div>':'')
    +'<div class="card" style="'+Z.cssV('#9db18d')+'"><h3 style="margin:0 0 8px">🪪 身体档案（用于自动计算每日计划）</h3>'
    +'<div class="row"><label class="f" style="margin:4px 0">性别 <select id="gSex"><option '+(p.gender==='女'?'selected':'')+'>女</option><option '+(p.gender==='男'?'selected':'')+'>男</option></select></label>'
    +'<label class="f" style="margin:4px 0">年龄 <input type="number" id="gAge" value="'+p.age+'"></label>'
    +'<label class="f" style="margin:4px 0">身高 cm <input type="number" id="gH" value="'+p.height+'"></label>'
    +'<label class="f" style="margin:4px 0">当前体重 kg <input type="number" id="gW" value="'+p.weight+'"></label></div>'
    +'<div class="row"><label class="f" style="margin:4px 0">目标体重 kg <input type="number" id="gT" value="'+p.target+'"></label>'
    +'<label class="f" style="margin:4px 0">希望周期（月） <input type="number" id="gM" value="'+p.months+'"></label></div>'
    +'<button class="btn pri" data-saveprof="1">💾 保存档案并重新计算计划</button></div>';
}
/* ---------- 视图 ---------- */
const GT={today:'今日清单',train:'训练计划',food:'饮食参考',prog:'进度·档案'};
let tab='today';
function gymDraw(root){
  const seg='<div class="seg" style="margin-bottom:12px">'+Object.keys(GT).map(k=>'<button data-gt="'+k+'" class="'+(tab===k?'on':'')+'">'+GT[k]+'</button>').join('')+'</div>';
  root.innerHTML=seg+'<div id="gBody"></div>';
  const b=Z.$('#gBody',root);
  if(tab==='today')b.innerHTML=todayHTML(root);
  else if(tab==='train')b.innerHTML=trainHTML(root);
  else if(tab==='food')b.innerHTML=foodHTML(root);
  else b.innerHTML=progressHTML(root);
}
Z.regView('gym',(root,arg)=>{
  gymDraw(root);
  return {title:'增肌计划', sub:prof().weight+'kg → '+prof().target+'kg · '+(prof().months*4)+'周健康增肌', acts:''};
},(root)=>{
  if(root.dataset.gymB)return; root.dataset.gymB='1';
  root.addEventListener('click',e=>{
    const g=e.target.closest('[data-gt]'); if(g){ tab=g.dataset.gt; Z.views.gym(root); return; }
    const chk=e.target.closest('[data-chk]'); if(chk){ const d=data(); const t=Z.todayISO(); d.checks[t]=d.checks[t]||{}; d.checks[t][chk.dataset.chk]=!d.checks[t][chk.dataset.chk]; saveData(d); Z.views.gym(root); return; }
    const tr=e.target.closest('[data-train]'); if(tr){ const d=data(); const t=Z.todayISO(); d.checks[t]=d.checks[t]||{}; d.checks[t].t=tr.dataset.train; d.done[t]=tr.dataset.train; saveData(d); Z.toast('🎉 今日训练 '+tr.dataset.train+' 完成，记得喝够水吃够蛋白'); Z.views.gym(root); return; }
    const ut=e.target.closest('[data-untrain]'); if(ut){ const d=data(); const t=Z.todayISO(); if(d.checks[t])delete d.checks[t].t; delete d.done[t]; saveData(d); Z.views.gym(root); return; }
    const wg=e.target.closest('[data-weigh]'); if(wg){ weighModal(root); return; }
    const wk=e.target.closest('[data-wk]'); if(wk){ const k=wk.dataset.wk; const d=data(); if(d.done[k]){ delete d.done[k]; }else{ d.done[k]=sessionType(d); } saveData(d); Z.views.gym(root); return; }
    const wd=e.target.closest('[data-wdel]'); if(wd){ const d=data(); d.weights=d.weights.filter(x=>x.d!==wd.dataset.wdel); saveData(d); Z.views.gym(root); return; }
    const sp=e.target.closest('[data-saveprof]'); if(sp){
      const nw=+Z.$('#gW').value, nt=+Z.$('#gT').value;
      if(!(nw>30&&nw<150)||!(nt>30&&nt<150)){ Z.toast('体重数值看起来不太对'); return; }
      Z.settings.gProfile={gender:Z.$('#gSex').value,age:+Z.$('#gAge').value,height:+Z.$('#gH').value,weight:nw,target:nt,months:Math.min(12,Math.max(1,+Z.$('#gM').value||3))};
      Z.saveSettings();
      const d=data(); d.weights.push({d:Z.todayISO(),kg:nw,note:'档案更新'}); saveData(d);
      Z.toast('✅ 档案已保存，计划已按新目标重算');
      Z.views.gym(root);
    }
  });
});
function weighModal(root){
  const c=calc();
  const last=Z.store.g('gym',{weights:[]}).weights.slice().sort((a,b)=>a.d<b.d?1:-1)[0];
  Z.modal({ title:'📏 记录体重', sub:'建议：每周三早上空腹称，尽量同一条件',
    body:'<div id="mbody"><label class="f">今天体重（kg）</label><input type="number" id="wmW" step="0.1" value="'+(last?last.kg:prof().weight)+'">'
      +'<div class="muted small mt6">当前目标：'+prof().target+'kg · 距目标还差 '+(prof().target-(last?last.kg:prof().weight)).toFixed(1)+' kg'+(c.delta>0? ' · 建议每周增重 0.3-0.5kg 以内':'')+'</div>'
      +'<label class="f">备注（选填）</label><input type="text" id="wmN" placeholder="例如：生理期 / 睡得很好 / 腰围 61cm">'
      +'</div>',
    acts:[ {label:'保存',key:'ok',cls:'pri',fn:()=>{ const v=+Z.$('#wmW').value; if(!(v>30&&v<150)){Z.toast('请检查数值');return;} const d=data(); d.weights=d.weights.filter(x=>x.d!==Z.todayISO()); d.weights.push({d:Z.todayISO(),kg:v,note:Z.$('#wmN').value.trim()}); saveData(d); Z.closeModal(); Z.toast('已记录 '+v+' kg'); Z.views.gym(root); }} ,{label:'取消',key:'x',cls:'ghost',fn:()=>Z.closeModal()} ]});
}

window.ZGym={calc,prof,data,saveData,sessionType,todayHTML};
})();
