/* ===== FX: canvas particles, rays, shockwaves, shake, slow-motion ===== */
const FX=(()=>{
  let cv,cx,W=1,H=1,DPR=1,raf=null,running=false,last=0;
  let ps=[],waves=[];
  const rays={alpha:0,target:0,color:'#fff',count:12,speed:.4,rot:0,prism:false,t:0};
  let timeScale=1,shakeMag=0,shakeT=0,shakeDur=1,shakeEl=null;
  let ambient=null,ambAcc=0;
  const center={x:.5,y:.44};
  const MAX=1800;
  function init(canvas,shakeElement){cv=canvas;cx=cv.getContext('2d');shakeEl=shakeElement;resize();window.addEventListener('resize',resize);}
  function resize(){if(!cv)return;const r=cv.parentElement.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);DPR=Math.min(window.devicePixelRatio||1,2);cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);cx.setTransform(DPR,0,0,DPR,0,0);}
  function cxy(){return {x:W*center.x,y:H*center.y};}
  function rgba(hex,a){if(/^hsl\(/.test(hex))return hex.replace(')',' / '+a+')');if(!/^#/.test(hex))return hex;let h=hex.slice(1);if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;}
  let stars=null;
  function drawStars(t){if(!stars||stars.w!==W||stars.h!==H){stars={w:W,h:H,list:[]};for(let i=0;i<90;i++)stars.list.push({x:Math.random()*W,y:Math.random()*H,s:.4+Math.random()*1.4,p:Math.random()*6.28,f:.5+Math.random()*1.5});}cx.save();cx.fillStyle='#dfe6ff';for(const st of stars.list){cx.globalAlpha=.25+.45*(.5+.5*Math.sin(t*st.f+st.p));cx.beginPath();cx.arc(st.x,st.y,st.s,0,6.283);cx.fill();}cx.restore();}
  function push(p){if(ps.length>=MAX)ps.splice(0,ps.length-MAX+1);ps.push(p);}
  function P(x,y,vx,vy,life,size,color,kind,extra){push(Object.assign({x,y,vx,vy,life,max:life,size,color,kind,g:0,drag:1,alpha:1,rot:Math.random()*6.28,vr:(Math.random()-.5)*8},extra||{}));}
  function pick(colors){return Array.isArray(colors)?colors[Math.floor(Math.random()*colors.length)]:colors;}
  /* emitters */
  function suck(n,color){const c=cxy();const R=Math.max(W,H)*.75;for(let i=0;i<n;i++){const a=Math.random()*6.283;const r=R*(.5+Math.random()*.6);const x=c.x+Math.cos(a)*r,y=c.y+Math.sin(a)*r;const sp=220+Math.random()*320;const d=Math.hypot(c.x-x,c.y-y);P(x,y,(c.x-x)/d*sp,(c.y-y)/d*sp,d/sp,1.2+Math.random()*2,color,'spark',{alpha:.9});}}
  function ring(n,colors,speed,size){const c=cxy();for(let i=0;i<n;i++){const a=i*6.283/n+Math.random()*.2;const sp=speed*(.75+Math.random()*.5);P(c.x,c.y,Math.cos(a)*sp,Math.sin(a)*sp,.7+Math.random()*.5,(size||2.5)*(.6+Math.random()),pick(colors),'spark',{drag:.975});}}
  function explode(n,colors,speed,life){const c=cxy();for(let i=0;i<n;i++){const a=Math.random()*6.283;const sp=speed*Math.pow(Math.random(),.5)*(.4+Math.random()*.8);const shard=Math.random()<.3;P(c.x,c.y,Math.cos(a)*sp,Math.sin(a)*sp,(life||1.3)*(.5+Math.random()),shard?2+Math.random()*4:1.5+Math.random()*3,pick(colors),shard?'shard':'spark',{g:shard?420:60,drag:shard?.99:.972});}}
  function confetti(n,colors){for(let i=0;i<n;i++){P(Math.random()*W,-20-Math.random()*H*.5,(Math.random()-.5)*80,90+Math.random()*180,4+Math.random()*3,4+Math.random()*5,pick(colors||PRISM),'confetti',{g:40,drag:.995,vr:(Math.random()-.5)*10});}}
  function shockwave(color,width){waves.push({r:0,max:Math.max(W,H)*.95,life:.75,t:0,color,width:width||6});}
  function setRays(target,color,count,speed,prism){rays.target=target;if(color)rays.color=color;if(count)rays.count=count;if(speed!==undefined)rays.speed=speed;if(prism!==undefined)rays.prism=!!prism;}
  function setAmbient(a){ambient=a;ambAcc=0;}
  function shake(mag,dur){shakeMag=mag;shakeDur=dur||.5;shakeT=shakeDur;}
  function setTimeScale(v){timeScale=v;}
  function clear(){ps.length=0;waves.length=0;rays.alpha=0;rays.target=0;ambient=null;timeScale=1;shakeT=0;if(shakeEl)shakeEl.style.transform='';if(cx)cx.clearRect(0,0,W,H);}
  /* loop */
  function loop(ts){
    if(!running)return;
    const real=Math.min((ts-last)/1000||0,.05);last=ts;const dt=real*timeScale;
    if(ambient){ambAcc+=ambient.rate*real;while(ambAcc>=1){ambAcc--;spawnAmbient();}}
    cx.clearRect(0,0,W,H);
    drawStars(ts/1000);drawRays(dt);drawWaves(dt);updateDraw(dt);
    if(shakeT>0){shakeT-=real;const k=Math.max(0,shakeT/shakeDur);const m=shakeMag*k*k;shakeEl.style.transform=`translate(${(Math.random()*2-1)*m}px,${(Math.random()*2-1)*m}px)`;if(shakeT<=0)shakeEl.style.transform='';}
    raf=requestAnimationFrame(loop);
  }
  function spawnAmbient(){const a=ambient;if(a.kind==='embers'){P(Math.random()*W,H+10,(Math.random()-.5)*20,-(30+Math.random()*60),4+Math.random()*3,1+Math.random()*2,pick(a.colors),'ember',{alpha:.7});}else if(a.kind==='drift'){const c=cxy();const ang=Math.random()*6.283;const r=60+Math.random()*120;P(c.x+Math.cos(ang)*r,c.y+Math.sin(ang)*r,Math.cos(ang)*20,Math.sin(ang)*20-25,2+Math.random()*2,1+Math.random()*2.5,pick(a.colors),'ember',{alpha:.8});}}
  function drawRays(dt){
    rays.alpha+=(rays.target-rays.alpha)*Math.min(1,dt*3.5);if(rays.alpha<.004)return;
    rays.rot+=rays.speed*dt;rays.t+=dt;const c=cxy();const R=Math.max(W,H)*1.1;const col=rays.prism?`hsl(${(rays.t*70)%360} 100% 82%)`:rays.color;
    cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=rays.alpha;cx.translate(c.x,c.y);cx.rotate(rays.rot);
    const g=cx.createRadialGradient(0,0,0,0,0,R);g.addColorStop(0,rgba(col,0));g.addColorStop(.12,rgba(col,.9));g.addColorStop(.55,rgba(col,.35));g.addColorStop(1,rgba(col,0));cx.fillStyle=g;
    const n=rays.count;for(let i=0;i<n;i++){const a=i*6.283/n;const w=(3.1416/n)*(.22+.16*Math.sin(i*1.7));cx.beginPath();cx.moveTo(0,0);cx.arc(0,0,R,a-w,a+w);cx.closePath();cx.fill();}
    cx.restore();
  }
  function drawWaves(dt){
    const c=cxy();
    for(let i=waves.length-1;i>=0;i--){const w=waves[i];w.t+=dt;const k=w.t/w.life;if(k>=1){waves.splice(i,1);continue;}const r=w.max*(1-Math.pow(1-k,3));cx.save();cx.globalCompositeOperation='lighter';cx.globalAlpha=(1-k)*.9;cx.strokeStyle=w.color;cx.lineWidth=w.width*(1-k)+1;cx.beginPath();cx.arc(c.x,c.y,r,0,6.283);cx.stroke();cx.restore();}
  }
  function updateDraw(dt){
    cx.save();
    for(let i=ps.length-1;i>=0;i--){
      const p=ps[i];p.life-=dt;if(p.life<=0){ps[i]=ps[ps.length-1];ps.pop();continue;}
      p.vy+=p.g*dt;const dr=Math.pow(p.drag,dt*60);p.vx*=dr;p.vy*=dr;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
      const a=Math.max(0,p.life/p.max);
      if(p.kind==='confetti'){cx.globalCompositeOperation='source-over';cx.globalAlpha=Math.min(1,a*2);cx.fillStyle=p.color;cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot);cx.scale(1,Math.cos(p.rot*2.3));cx.fillRect(-p.size,-p.size*.6,p.size*2,p.size*1.2);cx.restore();continue;}
      cx.globalCompositeOperation='lighter';
      if(p.kind==='shard'){cx.globalAlpha=a*p.alpha;cx.fillStyle=p.color;cx.save();cx.translate(p.x,p.y);cx.rotate(p.rot);cx.fillRect(-p.size,-p.size*.35,p.size*2,p.size*.7);cx.restore();continue;}
      const s=p.size*(p.kind==='ember'?1:(.5+.5*a));
      cx.fillStyle=p.color;cx.globalAlpha=a*p.alpha;cx.beginPath();cx.arc(p.x,p.y,s,0,6.283);cx.fill();
      cx.globalAlpha=a*p.alpha*.22;cx.beginPath();cx.arc(p.x,p.y,s*2.8,0,6.283);cx.fill();
    }
    cx.restore();
  }
  function start(){if(running)return;resize();running=true;last=performance.now();raf=requestAnimationFrame(loop);}
  function stop(){running=false;if(raf)cancelAnimationFrame(raf);raf=null;clear();}
  return {init,resize,start,stop,clear,suck,ring,explode,confetti,shockwave,setRays,setAmbient,shake,setTimeScale,count:()=>ps.length};
})();
