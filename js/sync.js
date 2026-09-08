/* ============= zhaoline工作台 · 云同步（GitHub Gist）=============
 * 用你的 GitHub 账号 + Personal Access Token（带 gist scope），把所有
 * localStorage 数据 + 资料库文件清单（不含文件二进制）双向同步到一个
 * 私有 Gist。文件二进制仍存各自浏览器本地（IndexedDB），跨设备查看时
 * 若文件不存在会显示提示，可手动重新上传。
 * ================================================================ */
(function(){
const Z=window.Z;

const P='zlw-sync:';
const DEFAULT_API='https://api.github.com';

let state={
  token:'',
  gistId:'',
  device:'',
  lastPushAt:0,
  lastPullAt:0,
  lastError:'',
  on:false,
  pendingPush:null
};

function save(){ Z.store.s('sync',state); }
function load(){
  const o=Z.store.g('sync',{});
  Object.assign(state,{token:'',gistId:'',device:'',lastPushAt:0,lastPullAt:0,lastError:'',on:false,pendingPush:null},o);
  if(!state.device){ state.device=Z.uid().slice(0,8); save(); }
}
load();

/* ---------- Gist API ---------- */
function gh(path,opt){
  if(!state.token) return Promise.reject(new Error('未配置 GitHub Token'));
  const u=DEFAULT_API+path;
  const o=Object.assign({method:'GET',headers:{Authorization:'token '+state.token,Accept:'application/vnd.github+json','User-Agent':'zhaoline-workbench'}},opt||{});
  return fetch(u,o).then(r=>{
    if(!r.ok){ return r.text().then(t=>{ throw new Error('HTTP '+r.status+' · '+(t.slice(0,200)||r.statusText)); }); }
    return r.json();
  });
}

async function createGist(){
  const body={description:'zhaoline工作台 · 同步备份（仅本人可见）',public:false,files:{'zlw-data.json':{content:'{"v":1,"empty":true}'}}};
  const res=await gh('/gists',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  return res.id;
}
async function updateGist(content){
  if(!state.gistId) throw new Error('未绑定 Gist');
  const body={files:{'zlw-data.json':{content}}};
  return gh('/gists/'+state.gistId,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
}
async function fetchGist(){
  if(!state.gistId) return null;
  const res=await gh('/gists/'+state.gistId);
  const f=res.files&&res.files['zlw-data.json'];
  if(!f) return null;
  return JSON.parse(f.content);
}

/* ---------- 数据打包 ---------- */
async function packLocal(){
  const kv={};
  for(let i=0;i<localStorage.length;i++){
    const k=localStorage.key(i);
    if(k && k.indexOf('zlw:')===0){ kv[k]=localStorage.getItem(k); }
  }
  // 文件清单（不含 blob）
  const filesMeta=[];
  try{
    const all=await Z.idb.all();
    for(const f of all){
      filesMeta.push({id:f.id,name:f.name,cat:f.cat||'其他',size:f.size,ts:f.ts,uTs:f.uTs||f.ts,eng:!!f.eng,ext:(f.name.split('.').pop()||'').toLowerCase()});
    }
  }catch(e){}
  return {v:1,updatedAt:Date.now(),device:state.device,kv,files:filesMeta};
}
function applyRemote(remote){
  if(!remote || remote.v!==1) return 0;
  let n=0;
  if(remote.kv){
    for(const k in remote.kv){
      const old=localStorage.getItem(k);
      if(old!==remote.kv[k]){ localStorage.setItem(k,remote.kv[k]); n++; }
    }
  }
  if(Array.isArray(remote.files) && remote.files.length){
    Z.idb.all().then(all=>{
      const m={}; for(const f of all) m[f.id]=f;
      let changed=false;
      for(const meta of remote.files){
        const cur=m[meta.id];
        if(!cur) continue;  // 跨设备文件二进制不下载，留待用户手动重新上传
        let dirty=false;
        if(cur.name!==meta.name){ cur.name=meta.name; dirty=true; }
        if((cur.cat||'其他')!==meta.cat){ cur.cat=meta.cat; dirty=true; }
        if(dirty){ cur.uTs=Date.now(); Z.idb.put(cur); changed=true; }
      }
      if(changed) n++;
    }).catch(()=>{});
  }
  return n;
}

/* ---------- 同步操作 ---------- */
let pushTimer=null;
function schedulePush(){
  state.on=true;
  if(!state.token || !state.gistId) return;
  if(pushTimer) clearTimeout(pushTimer);
  pushTimer=setTimeout(()=>{ pushNow().catch(err=>{ state.lastError=String(err.message||err); save(); }); },1500);
}
async function pushNow(){
  if(!state.token || !state.gistId){ return; }
  if(state.pendingPush) return state.pendingPush;
  state.pendingPush=(async()=>{
    try{
      const data=await packLocal();
      await updateGist(JSON.stringify(data));
      state.lastPushAt=Date.now();
      state.lastError='';
      save();
      toastOnce('已同步到云端 ✓');
    }finally{ state.pendingPush=null; }
  })();
  return state.pendingPush;
}
async function pullNow(){
  if(!state.token || !state.gistId) return 0;
  try{
    const remote=await fetchGist();
    const n=applyRemote(remote);
    state.lastPullAt=Date.now();
    state.lastError='';
    save();
    return n;
  }catch(err){
    state.lastError=String(err.message||err);
    save();
    return -1;
  }
}
let toastLast=0;
function toastOnce(msg){
  const now=Date.now();
  if(now-toastLast<4000) return;
  toastLast=now;
  try{ Z.toast(msg); }catch(_e){}
}

/* ---------- 对外 API ---------- */
async function setup(token){
  state.token=token;
  save();
  try{
    const me=await gh('/user');
    state.device=(me.login||'device')+'-'+Z.uid().slice(0,4);
  }catch(_e){}
  if(!state.gistId){
    const id=await createGist();
    state.gistId=id;
    save();
  }
  await pushNow();
  return state;
}
async function unbind(){
  state.token=''; state.gistId=''; state.on=false; state.lastError='';
  save();
}
function status(){ return Object.assign({},state); }
async function syncNow(){
  if(!state.token) throw new Error('请先在设置里填写 GitHub Token');
  if(!state.gistId){ state.gistId=await createGist(); save(); }
  await pushNow();
  return await pullNow();
}

/* ---------- 自动同步（启动 / 焦点 / 30 秒）---------- */
let timer=null;
function start(){
  if(timer) return;
  if(state.token && state.gistId){
    pullNow().catch(()=>{});
  }
  window.addEventListener('focus',()=>{ if(state.token && state.gistId){ pullNow().catch(()=>{}); } });
  timer=setInterval(()=>{ if(state.token && state.gistId){ pullNow().catch(()=>{}); } },30000);
}
function stop(){ if(timer){ clearInterval(timer); timer=null; } }

/* 拦截 Z.store.s：写入即触发防抖推送 */
const _storeS=Z.store.s;
Z.store.s=function(k,v){
  const ok=_storeS.call(this,k,v);
  if(state.token && state.gistId && state.on!==false){ schedulePush(); }
  return ok;
};

Z.sync={setup,unbind,status,syncNow,pushNow,pullNow,start,stop,schedulePush};
})();