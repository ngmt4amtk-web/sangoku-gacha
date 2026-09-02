'use strict';
/* ===== 天啓召喚 core: data, odds, rolls ===== */
const TIERS=['N','R','SR','SSR','UR'];
const TIER_INFO={
  N:{idx:0,label:'N',kanji:'凡',jp:'ノーマル',color:'#c8c4bc',light:'#f4f2ec',dark:'#4f4e4b',glow:'rgba(200,196,188,.55)'},
  R:{idx:1,label:'R',kanji:'稀',jp:'レア',color:'#4ea3ff',light:'#c6e2ff',dark:'#0f2f5c',glow:'rgba(78,163,255,.6)'},
  SR:{idx:2,label:'SR',kanji:'秀',jp:'スーパーレア',color:'#b36bff',light:'#e6d0ff',dark:'#33125e',glow:'rgba(179,107,255,.62)'},
  SSR:{idx:3,label:'SSR',kanji:'極',jp:'ダブルスーパーレア',color:'#ffc53d',light:'#fff3c4',dark:'#5c3d00',glow:'rgba(255,197,61,.66)'},
  UR:{idx:4,label:'UR',kanji:'天',jp:'ウルトラレア',color:'#ff5ec4',light:'#ffffff',dark:'#3d0d36',glow:'rgba(255,120,220,.7)',prism:true},
  WHITE:{idx:-1,label:'',kanji:'',jp:'',color:'#ffffff',light:'#ffffff',dark:'#9a9a9a',glow:'rgba(255,255,255,.85)'}
};
const PRISM=['#ff5ec4','#ffd23d','#4effa1','#4ea3ff','#b36bff','#ffffff'];
const RATE_PRESETS={
  stingy:{name:'渋い',w:{N:50,R:30,SR:13,SSR:5,UR:2}},
  standard:{name:'標準',w:{N:40,R:30,SR:18,SSR:9,UR:3}},
  generous:{name:'大盤振る舞い',w:{N:25,R:30,SR:25,SSR:14,UR:6}},
  equal:{name:'均等',w:null}
};
const OMEN={N:[1,0,0,0,0],R:[.2,.8,0,0,0],SR:[.1,.3,.6,0,0],SSR:[.05,.2,.3,.45,0],UR:[.1,.15,.2,.25,.3]};
const FALSE_OMEN_RATE=0.10;
const PITY_OPTIONS=[10,20,30,0];
const STORAGE_KEY='tenkei_v1';

function uid(){return Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function weightedPick(entries){const sum=entries.reduce((s,e)=>s+e[1],0);if(sum<=0)return null;let r=Math.random()*sum;for(const [k,v] of entries){r-=v;if(r<=0)return k;}return entries[entries.length-1][0];}
function tierIdx(t){return TIER_INFO[t]?TIER_INFO[t].idx:0;}

function defaultSettings(){return {sound:true,haptics:true,calm:false,falseOmen:true,fast:false};}
function newItem(name,rarity){return {id:uid(),name,rarity:rarity||'N',pickup:false,createdAt:Date.now()};}
const REPEAT_MODES={allow:'気にしない',noLast:'直前は避ける',cycle:'一巡するまで避ける'};
function newPool(name){return {id:uid(),name,items:[],rates:'standard',pityThreshold:20,pityCount:0,repeat:'allow',cycleDrawn:[],stats:{pulls:0,byTier:{N:0,R:0,SR:0,SSR:0,UR:0},bestMulti:0},history:[],collection:{}};}
function defaultData(){
  const p=newPool('今夜のごはん');
  [['焼肉','UR'],['寿司','SSR'],['うなぎ','SSR'],['ラーメン','SR'],['ピザ','SR'],['カレー','R'],['パスタ','R'],['餃子','R'],['牛丼','N'],['コンビニ','N'],['冷蔵庫の残り物','N'],['サラダ','N']]
    .forEach(([n,r])=>p.items.push(newItem(n,r)));
  return {version:1,pools:[p],currentPoolId:p.id,settings:defaultSettings()};
}

const State={
  data:null,
  load(fromData){
    if(fromData!==undefined)this.data=fromData;
    else{try{const raw=localStorage.getItem(STORAGE_KEY);this.data=raw?JSON.parse(raw):null;}catch(e){this.data=null;}}
    if(!this.data||typeof this.data!=='object'||!Array.isArray(this.data.pools))this.data=defaultData();
    this.data.pools=this.data.pools.filter(p=>p&&typeof p==='object');
    if(!this.data.pools.length)this.data=defaultData();
    this.data.settings=Object.assign(defaultSettings(),(this.data.settings&&typeof this.data.settings==='object')?this.data.settings:{});
    this.data.pools.forEach(p=>{
      const base=newPool(typeof p.name==='string'&&p.name?p.name:'リスト');for(const k in base)if(p[k]===undefined||p[k]===null)p[k]=base[k];
      if(typeof p.name!=='string')p.name=base.name;
      p.items=Array.isArray(p.items)?p.items.filter(i=>i&&typeof i==='object'&&typeof i.name==='string'):[];
      p.items.forEach(i=>{if(!i.id)i.id=uid();if(!TIER_INFO[i.rarity]||i.rarity==='WHITE')i.rarity='N';i.pickup=!!i.pickup;});
      if(typeof p.stats!=='object'||!p.stats)p.stats=base.stats;if(!p.stats.byTier||typeof p.stats.byTier!=='object')p.stats.byTier={N:0,R:0,SR:0,SSR:0,UR:0};
      if(!Array.isArray(p.history))p.history=[];if(typeof p.collection!=='object'||!p.collection)p.collection={};
      if(!RATE_PRESETS[p.rates])p.rates='standard';p.pityThreshold=p.pityThreshold|0;p.pityCount=p.pityCount|0;
      if(!REPEAT_MODES[p.repeat])p.repeat='allow';if(!Array.isArray(p.cycleDrawn))p.cycleDrawn=[];
    });
    if(!this.data.pools.find(p=>p.id===this.data.currentPoolId))this.data.currentPoolId=this.data.pools[0].id;
    return this.data;
  },
  save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(this.data));}catch(e){}},
  pool(){return this.data.pools.find(p=>p.id===this.data.currentPoolId)||this.data.pools[0];}
};

/* ---- rarity assignment ---- */
function rollAutoRarity(){return weightedPick([['N',30],['R',30],['SR',20],['SSR',14],['UR',6]]);}
function spreadRarities(items){
  const n=items.length;if(!n)return;
  const order=shuffle(items.slice());
  const q={UR:Math.max(1,Math.round(n*.08)),SSR:Math.round(n*.15),SR:Math.round(n*.25),R:Math.round(n*.27)};
  if(n<=2){q.UR=1;q.SSR=0;q.SR=n>1?1:0;q.R=0;}
  let i=0;['UR','SSR','SR','R'].forEach(t=>{for(let k=0;k<q[t]&&i<n;k++)order[i++].rarity=t;});
  while(i<n)order[i++].rarity='N';
}

/* ---- eligibility (repeat modes) ---- */
function cycleDrawnIds(pool){const ids=new Set(pool.items.map(i=>i.id));return (pool.cycleDrawn||[]).filter(id=>ids.has(id));}
function cycleComplete(pool){return pool.repeat==='cycle'&&pool.items.length>0&&cycleDrawnIds(pool).length>=pool.items.length;}
function eligibleItems(pool,extraExcluded){
  const all=pool.items;if(all.length<=1)return all.slice();
  const lastId=pool.history[0]&&pool.history[0].itemId;
  const ex=new Set(extraExcluded||[]);
  if(pool.repeat==='cycle'){
    const drawn=cycleDrawnIds(pool);
    if(drawn.length<all.length)drawn.forEach(id=>ex.add(id));else if(lastId)ex.add(lastId);
  }else if(pool.repeat==='noLast'){if(lastId)ex.add(lastId);}
  const el=all.filter(i=>!ex.has(i.id));return el.length?el:all.slice();
}

/* ---- odds (computed on the eligible subset) ---- */
function tierCounts(items){const c={};TIERS.forEach(t=>c[t]=0);items.forEach(i=>{c[i.rarity]=(c[i.rarity]||0)+1;});return c;}
function tierWeights(pool,items){
  items=items||eligibleItems(pool);
  const preset=RATE_PRESETS[pool.rates]||RATE_PRESETS.standard;
  const counts=tierCounts(items);const w={};
  if(!preset.w){const total=items.length||1;TIERS.forEach(t=>w[t]=counts[t]/total);return w;}
  let sum=0;TIERS.forEach(t=>{w[t]=counts[t]?preset.w[t]:0;sum+=w[t];});
  TIERS.forEach((t,i)=>{
    if(counts[t])return;
    let target=null;
    for(let j=i-1;j>=0;j--)if(counts[TIERS[j]]){target=TIERS[j];break;}
    if(!target)for(let j=i+1;j<TIERS.length;j++)if(counts[TIERS[j]]){target=TIERS[j];break;}
    if(target){w[target]+=preset.w[t];sum+=preset.w[t];}
  });
  if(sum>0)TIERS.forEach(t=>w[t]/=sum);
  return w;
}
function itemProb(pool,item,w,items){
  items=items||eligibleItems(pool);
  if(!items.some(i=>i.id===item.id))return 0;
  w=w||tierWeights(pool,items);
  const tierItems=items.filter(i=>i.rarity===item.rarity);
  if(!tierItems.length)return 0;
  const pick=tierItems.find(i=>i.pickup);
  if(pick&&tierItems.length>1)return w[item.rarity]*(item.pickup?0.5:0.5/(tierItems.length-1));
  return w[item.rarity]/tierItems.length;
}
function hasTierAtLeast(items,t){const mi=tierIdx(t);return items.some(i=>tierIdx(i.rarity)>=mi);}

/* ---- rolling ---- */
function rollTier(pool,minTier,items){
  const w=tierWeights(pool,items);
  let entries=TIERS.map(t=>[t,w[t]]);
  if(minTier){
    const mi=tierIdx(minTier);
    const hi=entries.filter(([t,v])=>tierIdx(t)>=mi&&v>0);
    if(hi.length)entries=hi;
    else{const avail=TIERS.filter(t=>w[t]>0);return avail.length?avail[avail.length-1]:null;}
  }
  return weightedPick(entries);
}
function pickItem(items,tier){
  const tierItems=items.filter(i=>i.rarity===tier);
  if(!tierItems.length)return null;
  const pick=tierItems.find(i=>i.pickup);
  if(pick&&tierItems.length>1&&Math.random()<0.5)return pick;
  const others=(pick&&tierItems.length>1)?tierItems.filter(i=>i!==pick):tierItems;
  return others[Math.floor(Math.random()*others.length)];
}
function rollOne(pool,{minTier=null,pityCount=0,exclude=null}={}){
  const items=eligibleItems(pool,exclude);if(!items.length)return null;
  let forced=false;let min=minTier;
  const th=pool.pityThreshold|0;
  if(th>0&&pityCount+1>=th&&hasTierAtLeast(items,'SSR')){if(!min||tierIdx(min)<3)min='SSR';forced=true;}
  const tier=rollTier(pool,min,items);if(!tier)return null;
  const item=pickItem(items,tier);if(!item)return null;
  const prob=itemProb(pool,item,null,items);
  return {item,tier,prob,pity:forced,guaranteed:!!minTier&&!forced};
}
function rollPulls(pool,n){
  const results=[];let pc=pool.pityCount|0;const drawn=[];
  for(let k=0;k<n;k++){
    let min=null;
    const exclude=pool.repeat==='cycle'?drawn:(pool.repeat==='noLast'&&drawn.length?[drawn[drawn.length-1]]:null);
    if(n>=10&&k===n-1&&!results.some(r=>tierIdx(r.tier)>=2)&&hasTierAtLeast(eligibleItems(pool,exclude),'SR'))min='SR';
    const r=rollOne(pool,{minTier:min,pityCount:pc,exclude});if(!r)break;
    pc=tierIdx(r.tier)>=3?0:pc+1;
    drawn.push(r.item.id);results.push(r);
  }
  return results;
}
function commit(pool,results){
  results.forEach(r=>{
    pool.stats.pulls++;pool.stats.byTier[r.tier]=(pool.stats.byTier[r.tier]||0)+1;
    pool.pityCount=tierIdx(r.tier)>=3?0:(pool.pityCount|0)+1;
    const c=pool.collection[r.item.id]||(pool.collection[r.item.id]={count:0,first:Date.now()});
    r.isNew=c.count===0;c.count++;c.last=Date.now();
    pool.history.unshift({itemId:r.item.id,name:r.item.name,tier:r.tier,ts:Date.now(),isNew:r.isNew});
    if(pool.repeat==='cycle'){let cd=cycleDrawnIds(pool);if(cd.length>=pool.items.length)cd=[];if(!cd.includes(r.item.id))cd.push(r.item.id);pool.cycleDrawn=cd;}
  });
  if(pool.history.length>200)pool.history.length=200;
  if(results.length>=10){const hi=results.filter(r=>tierIdx(r.tier)>=3).length;if(hi>(pool.stats.bestMulti|0))pool.stats.bestMulti=hi;}
  State.save();
}

/* ---- omen plan: where the light starts, and how many times it climbs ---- */
function planOmen(tier,settings){
  const ti=tierIdx(tier);const dist=OMEN[tier]||OMEN.N;
  const start=weightedPick(dist.map((p,i)=>[TIERS[i],p]))||tier;
  const steps=[];for(let i=tierIdx(start)+1;i<=ti;i++)steps.push(TIERS[i]);
  const falseOmen=(settings.falseOmen!==false)&&ti<=1&&steps.length===0&&Math.random()<FALSE_OMEN_RATE;
  return {start,steps,falseOmen};
}
