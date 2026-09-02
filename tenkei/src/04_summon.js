/* ===== Summon: the sequence. charge -> omen -> (stutter/upgrade)* -> burst -> reveal ===== */
const Summon=(()=>{
  const $=s=>document.querySelector(s);
  const el={};let tapResolve=null,active=false,skipAll=false,preview=false,settings={},hbTimer=null,busy=false;
  function init(){
    ['summon','s-shake','s-bg','fx','pillar','orb-wrap','burst-img','spectrum','card-wrap','card-frame','card','card-art','stamp','stamp-latin','stamp-kanji','card-name','card-sub','new-badge','flash','hud-count','hud-skip','hud-label','hud-hint','orbs10','summary','sum-best','sum-grid','sum-stats','sum-close','sum-again']
      .forEach(id=>{el[id.replace(/-([a-z0-9])/g,(m,c)=>c.toUpperCase())]=document.getElementById(id);});
    el.root=el.summon;
    el.root.addEventListener('pointerdown',e=>{if(!active)return;if(e.target.closest('button'))return;if(tapResolve){const r=tapResolve;tapResolve=null;r('tap');}});
    el.hudSkip.addEventListener('click',()=>{skipAll=true;if(tapResolve){const r=tapResolve;tapResolve=null;r('skip');}});
    FX.init(el.fx,el.sShake);
  }
  function dur(ms){return settings.fast?Math.round(ms*.8):ms;}
  function idle(ms){return settings.fast?Math.round(ms*.55):ms;}
  function wait(ms,skippable=true){if(skipAll&&ms<10000)return Promise.resolve('skip');return new Promise(res=>{let done=false;const t=setTimeout(()=>{if(done)return;done=true;tapResolve=null;res('time');},ms);if(skippable)tapResolve=()=>{if(done)return;done=true;clearTimeout(t);res('tap');};});}
  function calm(){return !!settings.calm;}
  function n(v){return calm()?Math.round(v*.35):v;}
  function setTier(tier){
    const ti=TIER_INFO[tier]||TIER_INFO.N;const s=el.root.style;
    if(ti.prism){['--tier','--tier2','--tier-dark','--tier-glow'].forEach(k=>s.removeProperty(k));el.root.classList.add('prism');}
    else{el.root.classList.remove('prism');s.setProperty('--tier',ti.color);s.setProperty('--tier2',ti.light);s.setProperty('--tier-dark',ti.dark);s.setProperty('--tier-glow',ti.glow);}
    el.root.dataset.tier=tier;
  }
  function colorsOf(tier){const ti=TIER_INFO[tier];return ti.prism?PRISM:[ti.color,ti.light,'#ffffff'];}
  function haptic(p){if(!settings.haptics||calm())return;try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}
  function flash(color,peak,dur){el.flash.style.transition='none';el.flash.style.background=color||'#fff';el.flash.style.opacity=peak==null?1:peak;requestAnimationFrame(()=>requestAnimationFrame(()=>{el.flash.style.transition=`opacity ${dur||350}ms ease-out`;el.flash.style.opacity=0;}));}
  function retrigger(node,cls){node.classList.remove(cls);void node.offsetWidth;node.classList.add(cls);}
  function setSpin(sec){el.root.style.setProperty('--spin',sec+'s');}
  function label(text){el.hudLabel.textContent=text||'';el.hudLabel.classList.toggle('on',!!text);}
  function hint(text){if(text){el.hudHint.textContent=text;el.hudHint.classList.add('on');}else el.hudHint.classList.remove('on');}
  function heartbeat(on,tier){clearInterval(hbTimer);hbTimer=null;if(!on)return;const period=tier==='UR'?520:700;hbTimer=setInterval(()=>{retrigger(el.orbWrap,'beat');Sound.heartbeat();haptic([18]);FX.ring(n(14),colorsOf(tier),140,2);},period);}
  function hideCard(){el.cardWrap.classList.remove('on');el.cardFrame.classList.remove('in');['stamp','cardName','cardSub','newBadge'].forEach(k=>el[k].classList.remove('on'));}
  function resetStage(){
    el.root.className='on';el.root.style.cssText='';setTier('N');setSpin(6);
    el.orbWrap.className='orb-wrap';el.pillar.classList.remove('on');el.burstImg.className='burst-img';el.spectrum.classList.remove('on');
    hideCard();el.hudCount.textContent='';el.hudSkip.classList.remove('on');label('');hint('');el.orbs10.classList.remove('on');el.orbs10.innerHTML='';el.summary.classList.remove('on');
    el.flash.style.opacity=0;FX.clear();
  }
  function nameSize(name){const len=[...name].length;if(len<=3)return 58;if(len<=5)return 46;if(len<=8)return 36;if(len<=12)return 28;if(len<=20)return 22;return 18;}

  /* ---- stages ---- */
  async function charge(ms,r){
    ms=dur(ms);setTier('N');setSpin(6);el.root.classList.add('charging');
    el.orbWrap.style.transition='none';el.orbWrap.className='orb-wrap';void el.orbWrap.offsetWidth;el.orbWrap.style.transition=`top ${Math.round(ms*.85)}ms cubic-bezier(.25,.8,.25,1),opacity .5s`;el.orbWrap.classList.add('in');
    if(r&&r.pity){label('天井到達 ─ SSR以上 確定');Sound.pity();}
    else if(r&&r.guaranteed){label('10枚目 ─ SR以上 確定');}
    Sound.charge(ms/1000);FX.suck(n(ms>1200?160:90),'#dfe6ff');FX.setRays(.14,'#8fa3ff',14,.35,false);FX.setAmbient({kind:'drift',rate:14,colors:['#dfe6ff','#8fa3ff']});
    haptic([10,80,10,80,14]);
    await wait(ms);
  }
  function applyOmen(tier){
    const ti=TIER_INFO[tier];const i=ti.idx;
    setTier(tier);setSpin(i>=4?1.2:i>=3?1.8:i>=2?2.6:i>=1?3.6:5);
    el.pillar.classList.add('on');
    FX.ring(n(40+i*30),colorsOf(tier),200+i*60,2.5);FX.setRays(.14+i*.06,ti.prism?'#ffffff':ti.light,12+i*3,.4+i*.2,!!ti.prism);
    FX.setAmbient({kind:'drift',rate:16+i*10,colors:colorsOf(tier)});
    Sound.omen(tier);flash(ti.prism?'#fff':ti.light,.18+i*.08,300);
    haptic(i>=4?[60,40,60,40,120]:i>=3?[40,30,60]:i>=2?[30,30,30]:i>=1?[20]:[0]);
    if(i>=3)heartbeat(true,tier);else heartbeat(false);
  }
  async function stutter(){
    el.root.classList.add('stutter');Sound.stutter();haptic([20,50,20,50,20]);
    [0,130,260].forEach(d=>setTimeout(()=>flash(getComputedStyle(el.root).getPropertyValue('--tier2')||'#fff',.28,110),d));
    await wait(dur(520),false);el.root.classList.remove('stutter');
  }
  function upgradeTo(tier){
    const ti=TIER_INFO[tier];const i=ti.idx;
    Sound.hit(tier);setTier(tier);setSpin(i>=4?1.2:i>=3?1.8:i>=2?2.6:3.6);
    flash('#fff',.75,260);FX.shockwave(ti.prism?'#ffffff':ti.light,8);FX.ring(n(90+i*40),colorsOf(tier),380+i*60,3);FX.shake(calm()?0:4+i*3,.45);
    FX.setRays(.18+i*.07,ti.prism?'#ffffff':ti.light,12+i*3,.5+i*.25,!!ti.prism);FX.setAmbient({kind:'drift',rate:18+i*12,colors:colorsOf(tier)});
    retrigger(el.orbWrap,'pulse');haptic(i>=4?[80,40,80,40,80]:i>=3?[60,40,90]:[40,30,40]);
    if(i>=3)heartbeat(true,tier);
  }
  async function timeStop(){
    heartbeat(false);FX.setTimeScale(.04);el.root.classList.add('timestop');setTier('WHITE');Sound.duck(.06,.08);Sound.timeStop();
    await wait(dur(680),false);
    el.spectrum.classList.remove('on');void el.spectrum.offsetWidth;el.spectrum.classList.add('on');Sound.duck(.8,.25);Sound.spectrum();flash('#fff',.3,500);haptic([30,30,30,30,30,30,200]);
    await wait(dur(420),false);
    FX.setTimeScale(1);el.root.classList.remove('timestop');
  }
  async function fizzle(){
    Sound.fizzle();FX.setRays(.12);FX.ring(n(30),['#8a8a8a','#555'],120,2);el.pillar.classList.remove('on');haptic([10]);
    await wait(dur(650),false);el.pillar.classList.add('on');
  }
  async function burst(tier){
    const ti=TIER_INFO[tier];const i=ti.idx;heartbeat(false);
    Sound.burst(tier);flash('#fff',1,i>=4?520:i>=3?440:360);
    el.orbWrap.classList.add('burst');el.pillar.classList.remove('on');
    const cols=colorsOf(tier);
    FX.explode(n([70,140,260,460,820][i]),cols,[300,380,460,560,680][i],1.3);
    FX.shockwave(ti.prism?'#ffffff':ti.light,10);setTimeout(()=>FX.shockwave(ti.color,6),120);
    FX.shake(calm()?0:[2,4,7,11,16][i],.55);
    haptic(i>=4?[90,40,90,40,90,40,320]:i>=3?[70,40,70,40,160]:i>=2?[40,40,60]:[25]);
    if(i>=3){el.burstImg.className='burst-img';const img=IMG.burst&&IMG.burst[tier];el.burstImg.style.backgroundImage=img?`url(${img})`:'';if(!img)el.burstImg.classList.add('fallback');void el.burstImg.offsetWidth;el.burstImg.classList.add('on');}
    if(i>=4){FX.setTimeScale(.3);setTimeout(()=>FX.setTimeScale(1),260);setTimeout(()=>FX.confetti(n(160)),300);}
    if(i>=3)setTimeout(()=>FX.explode(n(180),cols,260,1.6),220);
    FX.setRays(.3+i*.1,ti.prism?'#ffffff':ti.light,14+i*4,.25,!!ti.prism);setTimeout(()=>FX.setRays(.08+i*.03),900);
    await wait(dur(i>=4?700:i>=3?560:420),false);
  }
  async function reveal(r,pool){
    const tier=r.tier;const ti=TIER_INFO[tier];const i=ti.idx;
    el.cardFrame.className='card-frame tier-'+tier;
    const art=IMG.card&&IMG.card[tier];el.cardArt.style.backgroundImage=art?`url(${art})`:'';
    el.stampLatin.textContent=ti.label;el.stampKanji.textContent=ti.kanji;
    el.cardName.textContent=r.item.name;el.cardName.style.setProperty('--ns',nameSize(r.item.name)+'px');
    let sub=ti.jp;if(!preview&&pool){const p=typeof r.prob==='number'?r.prob:itemProb(pool,r.item);if(p>0)sub+='　'+(p*100).toFixed(1)+'%';}else sub+='　演出プレビュー';
    el.cardSub.textContent=sub;
    el.cardWrap.classList.add('on');retrigger(el.cardFrame,'in');
    FX.setAmbient({kind:'embers',rate:6+i*8,colors:colorsOf(tier)});
    const f=settings.fast?.8:1;el.cardFrame.style.animationDuration=settings.fast?'.92s':'';
    setTimeout(()=>{Sound.ui();FX.ring(n(20+i*10),colorsOf(tier),160,2);},440*f);
    setTimeout(()=>{Sound.slam();FX.shake(calm()?0:2+i*2,.3);FX.ring(n(30+i*20),colorsOf(tier),240,2);},820*f);
    setTimeout(()=>{el.stamp.classList.add('on');Sound.stamp(tier);haptic([30]);},900*f);
    setTimeout(()=>{el.cardName.classList.add('on');Sound.shimmer(tier);},1020*f);
    setTimeout(()=>{el.cardSub.classList.add('on');if(r.isNew&&!preview){el.newBadge.classList.add('on');Sound.ui();}},1200*f);
    if(i>=4)setTimeout(()=>FX.confetti(n(90)),1100*f);
    await wait(Math.round(1350*f),false);
  }
  async function revealOne(r,{first,pool}){
    const plan=r.plan||planOmen(r.tier,settings);r.plan=plan;
    hideCard();el.burstImg.className='burst-img';
    await charge(first?1500:950,r);
    applyOmen(plan.start);
    await wait(idle(plan.steps.length?900:1000));
    if(plan.falseOmen){await stutter();await fizzle();await wait(idle(500));}
    for(const t of plan.steps){await stutter();if(t==='UR')await timeStop();upgradeTo(t);await wait(idle(t==='UR'?1250:950));}
    label('');
    await burst(r.tier);
    await reveal(r,pool);
  }
  async function stageOrbs(list){
    el.orbs10.innerHTML='';el.orbs10.classList.add('on');
    await charge(1500,null);
    list.forEach(r=>{r.plan=planOmen(r.tier,settings);});
    for(let i=0;i<list.length;i++){
      const t=list[i].plan.start;const o=document.createElement('div');o.className='o10';o.style.setProperty('--c',TIER_INFO[t].color);el.orbs10.appendChild(o);
      requestAnimationFrame(()=>o.classList.add('on'));Sound.ping(i,t);FX.ring(n(14),colorsOf(t),150,2);haptic(tierIdx(t)>=3?[35]:[8]);
      await wait(160,false);
    }
    const best=list.reduce((m,r)=>Math.max(m,tierIdx(r.plan.start)),0);
    if(best>=3){const bt=TIERS[best];Sound.omen(bt);flash(TIER_INFO[bt].light,.4,600);haptic([50,50,120]);}
    await wait(800);
  }
  async function stageSummary(list,pool){
    hideCard();el.orbs10.classList.remove('on');el.burstImg.className='burst-img';heartbeat(false);
    el.sumGrid.innerHTML='';
    const bestIdx=list.reduce((m,r)=>Math.max(m,tierIdx(r.tier)),0);const bestTier=TIERS[bestIdx];
    list.forEach((r,i)=>{
      const ti=TIER_INFO[r.tier];const d=document.createElement('div');d.className='sum-card c-'+r.tier+(tierIdx(r.tier)>=3?' hi':'');
      d.style.animationDelay=(i*.07)+'s';
      const art=IMG.card&&IMG.card[r.tier];
      d.innerHTML=`<div class="sc-art"></div><div class="sc-tier">${ti.label}</div><div class="sc-name">${escapeHtml(r.item.name)}</div>`;
      if(art)d.firstChild.style.backgroundImage=`url(${art})`;
      el.sumGrid.appendChild(d);setTimeout(()=>Sound.tally(i),i*70);
    });
    const bi=TIER_INFO[bestTier];
    el.sumBest.innerHTML=`最高レア <span class="chip ${bestTier} c-${bestTier}">${bi.label}</span>`;
    const hi=list.filter(r=>tierIdx(r.tier)>=3).length;
    el.sumStats.textContent=`SSR以上 ${hi}枚`+(pool&&!preview?`　このリストの最高記録 ${pool.stats.bestMulti|0}枚`:'');
    el.summary.classList.add('on');setTier(bestTier);FX.setRays(.2,bi.prism?'#fff':bi.light,12,.2,!!bi.prism);
    if(bestIdx>=3){setTimeout(()=>{Sound.shimmer(bestTier);FX.confetti(n(80),colorsOf(bestTier));},list.length*70+100);}
    return new Promise(res=>{el.sumClose.onclick=()=>res('close');el.sumAgain.onclick=()=>res('again');});
  }
  function updateCount(i,total){el.hudCount.textContent=total>1?`${i+1} / ${total}`:'';}

  async function run(list,opts={}){
    if(busy||!list||!list.length)return;busy=true;
    preview=!!opts.isPreview;settings=State.data.settings;active=true;skipAll=false;
    const pool=opts.pool||null;
    el.root.classList.add('on');resetStage();FX.start();Sound.ensure();
    const multi=list.length>1;let again=false;
    try{
      if(multi)await stageOrbs(list);
      for(let i=0;i<list.length;i++){
        if(skipAll)break;
        updateCount(i,list.length);
        const orbs=el.orbs10.children;if(orbs[i]){orbs[i].classList.add('cur');}
        await revealOne(list[i],{first:!multi,pool});
        if(orbs[i]){orbs[i].classList.remove('cur');orbs[i].classList.add('done');}
        if(multi&&i>=0)el.hudSkip.classList.add('on');
        if(i<list.length-1){hint('タップで次へ');if(!skipAll)await wait(120000);hint('');}
      }
      el.hudSkip.classList.remove('on');
      if(multi){const r=await stageSummary(list,pool);again=r==='again';}
      else{hint('タップで戻る');await wait(120000);hint('');}
    }catch(e){console.error(e);}
    heartbeat(false);active=false;busy=false;el.root.classList.remove('on');FX.stop();
    if(opts.onDone)opts.onDone();
    if(again&&opts.onAgain)opts.onAgain();
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  return {init,run,isBusy:()=>busy};
})();
