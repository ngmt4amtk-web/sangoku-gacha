/* ===== UI: home, items, book, settings, pools ===== */
const UI=(()=>{
  const $=(s,r)=>(r||document).querySelector(s);const $$=(s,r)=>[...(r||document).querySelectorAll(s)];
  let toastT=null,confirmT={};
  function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('on'),2200);}
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function pct(v){const p=v*100;return (p<10?p.toFixed(1):Math.round(p))+'%';}
  function chip(t){const ti=TIER_INFO[t]||TIER_INFO.N;return `<span class="chip ${t} c-${t}">${ti.label}</span>`;}
  function fmtTime(ts){const d=new Date(ts);const p=n=>String(n).padStart(2,'0');return `${d.getMonth()+1}/${d.getDate()} ${p(d.getHours())}:${p(d.getMinutes())}`;}
  /* two-step confirm: first tap arms, second tap within 3s executes */
  function confirmBtn(btn,key,armedText,fn){const orig=btn.dataset.orig||(btn.dataset.orig=btn.textContent);if(confirmT[key]){clearTimeout(confirmT[key]);confirmT[key]=null;btn.textContent=orig;fn();return;}btn.textContent=armedText;confirmT[key]=setTimeout(()=>{confirmT[key]=null;btn.textContent=orig;},3000);}

  function renderHome(){
    const pool=State.pool();const s=State.data.settings;
    $('#pool-name').textContent=pool.name;
    const th=pool.pityThreshold|0;const left=th>0?Math.max(0,th-(pool.pityCount|0)):null;
    $('#pity-left').textContent=left==null?'—':left;
    $('#pity-fill').style.width=(th>0?Math.min(100,(pool.pityCount|0)/th*100):0)+'%';
    $('.pity-row .lbl').textContent=th>0?'SSR以上 確定まで':'天井なし';
    const elig=eligibleItems(pool);const w=tierWeights(pool,elig);const pick=pool.items.find(i=>i.pickup);
    let extra='';if(pool.repeat==='cycle'){const d=cycleDrawnIds(pool).length;extra=`<span>一巡 <b>${d}</b>/${pool.items.length}${d>=pool.items.length&&pool.items.length?'（全部出ました）':''}</span>`;}else if(pool.repeat==='noLast')extra='<span>直前は避ける</span>';
    $('#rates-line').innerHTML=`<span>SSR <b>${pct(w.SSR)}</b></span><span>UR <b>${pct(w.UR)}</b></span><span>候補 <b>${pool.items.length}</b>件</span><span>累計 <b>${pool.stats.pulls|0}</b>回</span>`+(pick?`<span>ピックアップ <b>${esc(pick.name)}</b></span>`:'')+extra;
    const h=pool.history[0];
    $('#last-line').innerHTML=h?`<span>前回の天啓</span><b>${esc(h.name)}</b>${chip(h.tier)}${h.isNew?'<span class="chip c-gold">NEW</span>':''}`:'<span>まだ召喚していません</span>';
    const empty=!pool.items.length;$('#btn-single').disabled=empty;
    $('#btn-sound').classList.toggle('off',!s.sound);
  }
  function renderItems(){
    const pool=State.pool();const list=$('#items-list');const elig=eligibleItems(pool);const eligIds=new Set(elig.map(i=>i.id));const w=tierWeights(pool,elig);
    const drawnSet=new Set(pool.repeat==='cycle'?cycleDrawnIds(pool):[]);
    $('#items-count').textContent=pool.items.length+'件';
    const cyc=pool.repeat==='cycle';$('#btn-cycle-reset').hidden=!cyc;$('#cycle-line').hidden=!cyc;
    if(cyc){const d=drawnSet.size;$('#cycle-line').textContent=d>=pool.items.length&&pool.items.length?`一巡 ${d}/${pool.items.length}：全部出ました。次の召喚から新しい一巡（直前の候補は避けます）`:`一巡 ${d}/${pool.items.length}：出た候補（済）は一巡が終わるまで出ません`;}
    if(!pool.items.length){list.innerHTML='<li class="empty">候補がありません。上の欄に1行ずつ入れて「追加」。</li>';return;}
    list.innerHTML=pool.items.map(it=>{const ti=TIER_INFO[it.rarity];const out=!eligIds.has(it.id);const done=drawnSet.has(it.id);return `<li class="item c-${it.rarity}${out?' out':''}" data-id="${it.id}">`+
      `<button class="chip ${it.rarity} c-${it.rarity}" data-act="cycle" aria-label="レア度を変更">${ti.label}</button>`+
      `<span class="item-name">${esc(it.name)}${done?'<span class="done-seal">済</span>':''}</span><span class="item-prob">${out?'次は出ない':pct(itemProb(pool,it,w,elig))}</span>`+
      `<button class="star${it.pickup?' on':''}" data-act="pickup" aria-label="ピックアップ">★</button><button class="del" data-act="del" aria-label="削除">×</button></li>`;}).join('');
  }
  function renderBook(){
    const pool=State.pool();const grid=$('#book-grid');
    const items=pool.items.slice().sort((a,b)=>tierIdx(b.rarity)-tierIdx(a.rarity)||a.name.localeCompare(b.name,'ja'));
    const got=items.filter(i=>pool.collection[i.id]&&pool.collection[i.id].count>0).length;
    $('#book-got').textContent=got;$('#book-total').textContent=items.length;
    $('#book-sub').textContent=pool.name;
    grid.innerHTML=items.map(it=>{const ti=TIER_INFO[it.rarity];const c=pool.collection[it.id];const has=c&&c.count>0;
      return `<div class="bk c-${it.rarity}${has?'':' locked'}" data-tier="${it.rarity}"><div class="bk-art"></div><div class="seal">${has?ti.kanji:'未'}</div><div class="bk-tier">${ti.label}</div><div class="bk-name">${esc(it.name)}</div><div class="bk-count">${has?c.count+'回':'未入手'}</div></div>`;}).join('')||'<div class="empty">候補を追加すると図鑑ができます</div>';
    $$('.bk',grid).forEach(d=>{const art=IMG.card&&IMG.card[d.dataset.tier];if(art)$('.bk-art',d).style.backgroundImage=`url(${art})`;});
    const hist=pool.history.slice(0,30);
    $('#hist-sub').textContent=pool.stats.pulls?`SSR ${pool.stats.byTier.SSR|0}回 / UR ${pool.stats.byTier.UR|0}回`:'';
    $('#hist-list').innerHTML=hist.map(h=>`<li>${chip(h.tier)}<span class="h-name">${esc(h.name)}</span><span class="h-time">${fmtTime(h.ts)}</span></li>`).join('')||'<li class="empty">まだ召喚していません</li>';
  }
  function renderSettings(){
    const pool=State.pool();const s=State.data.settings;
    $('#seg-rates').innerHTML=Object.entries(RATE_PRESETS).map(([k,v])=>`<button data-rate="${k}" class="${pool.rates===k?'on':''}">${v.name}</button>`).join('');
    const pr=RATE_PRESETS[pool.rates]||RATE_PRESETS.standard;
    $('#rates-desc').textContent=pr.w?TIERS.map(t=>`${t} ${pr.w[t]}%`).join('　')+'（空のレア度の分は下のレア度に寄せます）':'全候補が同じ確率。レア度は演出の派手さだけに効きます';
    $('#seg-pity').innerHTML=PITY_OPTIONS.map(v=>`<button data-pity="${v}" class="${(pool.pityThreshold|0)===v?'on':''}">${v?v+'回':'なし'}</button>`).join('');
    $('#seg-repeat').innerHTML=Object.entries(REPEAT_MODES).map(([k,v])=>`<button data-repeat="${k}" class="${pool.repeat===k?'on':''}">${v}</button>`).join('');
    $('#repeat-desc').textContent=pool.repeat==='cycle'?'全候補が1回ずつ出るまで、出た候補は出ません。一巡したら次の一巡へ':pool.repeat==='noLast'?'直前に出た候補は次に出ません':'毎回すべての候補から抽選します';
    $('#sw-false').classList.toggle('on',s.falseOmen!==false);$('#sw-fast').classList.toggle('on',!!s.fast);
    $('#sw-sound').classList.toggle('on',!!s.sound);$('#sw-haptics').classList.toggle('on',!!s.haptics);$('#sw-calm').classList.toggle('on',!!s.calm);
    $('#pool-rename').value=pool.name;
    $('#about').textContent='天啓召喚 ─ 候補を入れて、天に選ばせる。データはこの端末のブラウザにだけ保存されます。';
  }
  function renderPools(){
    const d=State.data;$('#pool-list').innerHTML=d.pools.map(p=>`<li><button class="pool-row${p.id===d.currentPoolId?' cur':''}" data-pool="${p.id}"><span>${esc(p.name)}</span><small>${p.items.length}件 · ${p.stats.pulls|0}回</small></button></li>`).join('');
  }
  function renderAll(){renderHome();renderItems();renderBook();renderSettings();renderPools();}
  function switchView(name){$$('.view').forEach(v=>v.classList.toggle('on',v.dataset.view===name));$$('.tabbar button').forEach(b=>b.classList.toggle('on',b.dataset.tab===name));Sound.ui();}

  /* ---- actions ---- */
  function pull(count){
    const pool=State.pool();
    if(!pool.items.length){toast('候補がありません。候補タブで追加してください');switchView('items');return;}
    if(Summon.isBusy())return;
    Sound.ensure();
    const res=rollPulls(pool,count);
    if(!res.length){toast('抽選できませんでした');return;}
    commit(pool,res);
    const completed=cycleComplete(pool);
    Summon.run(res,{pool,onDone:()=>{renderAll();if(completed)toast('全部出ました。次の召喚から新しい一巡です');},onAgain:count>=10?()=>pull(10):null});
  }
  function previewRun(kind){
    const pool=State.pool();
    const mk=t=>{const c=pool.items.filter(i=>i.rarity===t);const item=c.length?c[Math.floor(Math.random()*c.length)]:{id:'pv',name:'演出プレビュー',rarity:t};return {item,tier:t,isNew:false};};
    const list=kind==='10'?['N','R','N','SR','R','SSR','N','R','SR','UR'].map(mk):[mk(kind)];
    Sound.ensure();Summon.run(list,{isPreview:true});
  }
  function addItems(){
    const pool=State.pool();const ta=$('#add-text');const auto=$('#add-auto').checked;
    const names=ta.value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    if(!names.length){toast('1行に1つ入力してください');return;}
    const existing=new Set(pool.items.map(i=>i.name));let dup=0;const added=[];
    names.forEach(nm=>{if(existing.has(nm)){dup++;return;}existing.add(nm);const it=newItem(nm,'N');added.push(it);pool.items.push(it);});
    if(auto){if(added.length>1)spreadRarities(added);else added.forEach(i=>i.rarity=rollAutoRarity());}
    else added.forEach(i=>i.rarity='R');
    ta.value='';State.save();renderAll();
    toast(`${added.length}件追加`+(dup?`（${dup}件は重複）`:''));Sound.ui();
  }
  function bind(){
    $$('.tabbar button').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.tab)));
    $('#btn-single').addEventListener('click',()=>pull(1));
    $$('.preview-row button').forEach(b=>b.addEventListener('click',()=>previewRun(b.dataset.pv)));
    $('#btn-sound').addEventListener('click',()=>{const s=State.data.settings;s.sound=!s.sound;Sound.ensure();Sound.setEnabled(s.sound);State.save();renderHome();renderSettings();toast(s.sound?'サウンド ON':'サウンド OFF');});
    $('#btn-add').addEventListener('click',addItems);
    $('#btn-shuffle').addEventListener('click',()=>{const pool=State.pool();if(!pool.items.length)return;spreadRarities(pool.items);State.save();renderAll();toast('レア度を振り直しました');Sound.ui();});
    $('#btn-clear-items').addEventListener('click',e=>confirmBtn(e.currentTarget,'clear','もう一度タップで全削除',()=>{const pool=State.pool();pool.items=[];State.save();renderAll();toast('全削除しました');}));
    $('#items-list').addEventListener('click',e=>{
      const btn=e.target.closest('button[data-act]');if(!btn)return;const li=btn.closest('.item');const pool=State.pool();const it=pool.items.find(i=>i.id===li.dataset.id);if(!it)return;
      const act=btn.dataset.act;
      if(act==='cycle'){it.rarity=TIERS[(tierIdx(it.rarity)+1)%TIERS.length];it.pickup=false;}
      else if(act==='pickup'){const on=!it.pickup;pool.items.forEach(i=>{if(i.rarity===it.rarity)i.pickup=false;});it.pickup=on;}
      else if(act==='del'){pool.items=pool.items.filter(i=>i!==it);toast(`「${it.name}」を削除`);}
      State.save();renderAll();Sound.ui();
    });
    $('#seg-rates').addEventListener('click',e=>{const b=e.target.closest('button[data-rate]');if(!b)return;State.pool().rates=b.dataset.rate;State.save();renderAll();Sound.ui();});
    $('#seg-pity').addEventListener('click',e=>{const b=e.target.closest('button[data-pity]');if(!b)return;State.pool().pityThreshold=parseInt(b.dataset.pity,10)||0;State.save();renderAll();Sound.ui();});
    $('#seg-repeat').addEventListener('click',e=>{const b=e.target.closest('button[data-repeat]');if(!b)return;const pool=State.pool();if(pool.repeat!==b.dataset.repeat){pool.repeat=b.dataset.repeat;pool.cycleDrawn=[];State.save();renderAll();Sound.ui();toast(REPEAT_MODES[pool.repeat]);}});
    $('#btn-cycle-reset').addEventListener('click',()=>{const pool=State.pool();pool.cycleDrawn=[];State.save();renderAll();toast('一巡をリセットしました');Sound.ui();});
    const sw=(id,key,after)=>$(id).addEventListener('click',()=>{const s=State.data.settings;s[key]=!s[key];State.save();renderAll();if(after)after(s[key]);Sound.ui();});
    sw('#sw-false','falseOmen');sw('#sw-fast','fast');sw('#sw-sound','sound',v=>{Sound.ensure();Sound.setEnabled(v);});sw('#sw-haptics','haptics');sw('#sw-calm','calm');
    $('#btn-rename').addEventListener('click',()=>{const v=$('#pool-rename').value.trim();if(!v)return;State.pool().name=v;State.save();renderAll();toast('リスト名を保存');});
    $('#btn-reset-stats').addEventListener('click',e=>confirmBtn(e.currentTarget,'rs','もう一度タップでリセット',()=>{const p=State.pool();p.history=[];p.collection={};p.pityCount=0;p.stats={pulls:0,byTier:{N:0,R:0,SR:0,SSR:0,UR:0},bestMulti:0};State.save();renderAll();toast('履歴と図鑑をリセット');}));
    $('#btn-del-pool').addEventListener('click',e=>confirmBtn(e.currentTarget,'dp','もう一度タップで削除',()=>{const d=State.data;if(d.pools.length<=1){toast('最後のリストは削除できません');return;}d.pools=d.pools.filter(p=>p.id!==d.currentPoolId);d.currentPoolId=d.pools[0].id;State.save();renderAll();switchView('summon');toast('リストを削除');}));
    $('#btn-export').addEventListener('click',()=>{const ta=$('#io-text');ta.value=JSON.stringify(State.data);ta.select();const done=()=>toast('JSONを書き出してコピーしました');const manual=()=>toast('JSONを書き出しました。長押しでコピーしてください');try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(ta.value).then(done,manual);else manual();}catch(e){manual();}});
    $('#btn-import').addEventListener('click',()=>{const prev=State.data;try{const d=JSON.parse($('#io-text').value);if(!d||typeof d!=='object'||!Array.isArray(d.pools))throw 0;if(!d.pools.some(p=>p&&typeof p==='object'&&Array.isArray(p.items)))throw 0;State.load(d);State.save();renderAll();toast('読み込みました');}catch(e){State.data=prev;toast('JSONを読み込めませんでした（形式が違います）');}});
    $('#btn-reset-all').addEventListener('click',e=>confirmBtn(e.currentTarget,'ra','もう一度タップで初期化',()=>{try{localStorage.removeItem(STORAGE_KEY);}catch(x){}State.load(null);State.save();renderAll();switchView('summon');toast('初期化しました');}));
    $('#btn-pool').addEventListener('click',()=>{renderPools();$('#sheet-pool').classList.add('on');Sound.ui();});
    $('#sheet-pool [data-close]').addEventListener('click',()=>$('#sheet-pool').classList.remove('on'));
    $('#pool-list').addEventListener('click',e=>{const b=e.target.closest('button[data-pool]');if(!b)return;State.data.currentPoolId=b.dataset.pool;State.save();renderAll();$('#sheet-pool').classList.remove('on');Sound.ui();});
    $('#btn-new-pool').addEventListener('click',()=>{const inp=$('#new-pool-name');const v=inp.value.trim();if(!v){toast('リスト名を入力');return;}const p=newPool(v);State.data.pools.push(p);State.data.currentPoolId=p.id;inp.value='';State.save();renderAll();$('#sheet-pool').classList.remove('on');switchView('items');toast(`「${v}」を作成。候補を追加してください`);});
    document.addEventListener('pointerdown',()=>{Sound.ensure();},{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)Sound.duck(0,.05);else Sound.duck(.8,.2);});
  }
  function applyImages(){
    if(IMG.altar){const hb=$('#home-bg');hb.style.backgroundImage=`url(${IMG.altar})`;hb.classList.add('img');$('#s-bg').style.backgroundImage=`url(${IMG.altar})`;}
  }
  const HomeFX=(()=>{let cv,cx,W,H,ps=[],raf=null,last=0;
    function resize(){const r=cv.getBoundingClientRect();W=r.width;H=r.height;const d=Math.min(devicePixelRatio||1,2);cv.width=W*d;cv.height=H*d;cx.setTransform(d,0,0,d,0,0);}
    function spawn(){ps.push({x:Math.random()*W,y:H*.5+Math.random()*H*.5,vx:(Math.random()-.5)*8,vy:-(8+Math.random()*16),s:.8+Math.random()*1.6,life:6+Math.random()*5,max:0,c:Math.random()<.7?'#ffd37a':'#fff3c4'});ps[ps.length-1].max=ps[ps.length-1].life;}
    function loop(ts){const dt=Math.min((ts-last)/1000||0,.05);last=ts;if(document.hidden||!document.getElementById('view-summon').classList.contains('on')||document.getElementById('summon').classList.contains('on')){raf=requestAnimationFrame(loop);return;}
      if(ps.length<34&&Math.random()<.35)spawn();cx.clearRect(0,0,W,H);cx.globalCompositeOperation='lighter';
      for(let i=ps.length-1;i>=0;i--){const p=ps[i];p.life-=dt;if(p.life<=0){ps.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;const a=Math.sin(Math.PI*(1-p.life/p.max));cx.globalAlpha=a*.9;cx.fillStyle=p.c;cx.beginPath();cx.arc(p.x,p.y,p.s,0,6.283);cx.fill();cx.globalAlpha=a*.25;cx.beginPath();cx.arc(p.x,p.y,p.s*3,0,6.283);cx.fill();}
      raf=requestAnimationFrame(loop);}
    return {init(){cv=document.getElementById('home-fx');if(!cv)return;cx=cv.getContext('2d');resize();window.addEventListener('resize',resize);last=performance.now();raf=requestAnimationFrame(loop);}};})();
  function init(){State.load();HomeFX.init();Sound.setEnabled(State.data.settings.sound);applyImages();Summon.init();bind();renderAll();}
  return {init,toast,renderAll,switchView};
})();
let __inited=false;function __boot(){if(__inited)return;__inited=true;UI.init();}
document.addEventListener('DOMContentLoaded',__boot);
if(document.readyState!=='loading')__boot();
