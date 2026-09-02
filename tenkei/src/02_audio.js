/* ===== Sound: everything synthesized with Web Audio, no files ===== */
const Sound=(()=>{
  let ctx=null,master=null,delay=null,enabled=true;
  function ensure(){
    if(ctx){if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx;}
    const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
    try{ctx=new AC();}catch(e){return null;}
    if(ctx.state==='suspended'&&ctx.resume)ctx.resume().catch(()=>{});
    const comp=ctx.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=5;comp.attack.value=.003;comp.release.value=.2;
    master=ctx.createGain();master.gain.value=enabled?.8:0;
    delay=ctx.createDelay(1);delay.delayTime.value=.23;
    const fb=ctx.createGain();fb.gain.value=.34;const wet=ctx.createGain();wet.gain.value=.3;
    const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=4500;
    delay.connect(lp);lp.connect(fb);fb.connect(delay);lp.connect(wet);wet.connect(master);
    master.connect(comp);comp.connect(ctx.destination);
    return ctx;
  }
  function ready(){return !!ctx&&enabled;}
  function t0(at){return ctx.currentTime+(at||0);}
  function osc({f=440,f2=null,type='sine',dur=.3,vol=.2,at=0,a=.01,r=.1,det=0,lp=null,lp2=null,q=1,send=0}){
    if(!ready())return;
    const t=t0(at);const o=ctx.createOscillator();o.type=type;
    o.frequency.setValueAtTime(Math.max(f,1),t);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(f2,1),t+dur);
    if(det)o.detune.value=det;
    let n=o;
    if(lp){const fl=ctx.createBiquadFilter();fl.type='lowpass';fl.Q.value=q;fl.frequency.setValueAtTime(lp,t);if(lp2)fl.frequency.exponentialRampToValueAtTime(lp2,t+dur);o.connect(fl);n=fl;}
    const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+a);
    const hold=Math.max(t+a,t+dur-r);g.gain.setValueAtTime(vol,hold);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    n.connect(g);g.connect(master);
    if(send){const s=ctx.createGain();s.gain.value=send;g.connect(s);s.connect(delay);}
    o.start(t);o.stop(t+dur+.05);
  }
  function noise({dur=.3,vol=.2,at=0,a=.005,from=3000,to=300,type='lowpass',q=.7,send=0}){
    if(!ready())return;
    const t=t0(at);const len=Math.max(1,Math.ceil(ctx.sampleRate*dur));
    const buf=ctx.createBuffer(1,len,ctx.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
    const src=ctx.createBufferSource();src.buffer=buf;
    const f=ctx.createBiquadFilter();f.type=type;f.Q.value=q;f.frequency.setValueAtTime(Math.max(from,20),t);f.frequency.exponentialRampToValueAtTime(Math.max(to,20),t+dur);
    const g=ctx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    src.connect(f);f.connect(g);g.connect(master);
    if(send){const s=ctx.createGain();s.gain.value=send;g.connect(s);s.connect(delay);}
    src.start(t);src.stop(t+dur+.05);
  }
  const cue={
    tap(){osc({f:1500,dur:.05,vol:.07,a:.003,r:.03});},
    ui(){osc({f:900,type:'triangle',dur:.06,vol:.06,a:.003,r:.04});},
    charge(sec){
      osc({f:70,f2:520,type:'sawtooth',dur:sec,vol:.16,a:.2,r:.15,lp:250,lp2:3800,q:2,send:.15});
      osc({f:140,f2:1040,dur:sec,vol:.1,a:.3,r:.1});
      noise({dur:sec,vol:.14,a:sec*.75,from:200,to:3500,type:'bandpass',q:.8});
    },
    omen(tier){
      const i=tierIdx(tier);
      if(i<=0){osc({f:523,dur:.35,vol:.12,r:.25});return;}
      if(i===1){osc({f:659,type:'triangle',dur:.4,vol:.14,send:.35});osc({f:988,dur:.5,vol:.1,at:.06,send:.35});return;}
      if(i===2){osc({f:98,type:'sawtooth',dur:.9,vol:.2,lp:150,lp2:900,q:3});osc({f:1319,dur:.45,vol:.12,at:.05,send:.45});osc({f:1760,dur:.5,vol:.08,at:.18,send:.45});return;}
      if(i===3){[523,659,784,1047].forEach((f,k)=>osc({f,type:'triangle',dur:1.2,vol:.09,at:k*.06,a:.05,r:.5,send:.5}));osc({f:65,dur:1.2,vol:.3,a:.05,r:.6});noise({dur:.8,vol:.08,from:4000,to:800,type:'highpass'});return;}
      osc({f:55,type:'sawtooth',dur:1.6,vol:.3,lp:120,lp2:700,q:4,a:.05,r:.8});
      osc({f:2093,dur:1.2,vol:.07,a:.3,send:.6});osc({f:2637,dur:1.2,vol:.05,at:.15,a:.3,send:.6});
      noise({dur:1.2,vol:.12,from:300,to:6000,type:'bandpass',q:1.2,a:.6});
      [0,.12,.24,.36].forEach((d,k)=>osc({f:1047*Math.pow(2,k*3/12),type:'triangle',dur:.3,vol:.08,at:d,send:.5}));
    },
    heartbeat(){osc({f:70,f2:40,dur:.22,vol:.35,a:.004,r:.12});osc({f:70,f2:40,dur:.18,vol:.25,at:.16,a:.004,r:.1});},
    stutter(){
      [0,.13,.26].forEach((d,k)=>{noise({dur:.05,vol:.28,at:d,from:5000,to:600});osc({f:220-k*30,type:'square',dur:.06,vol:.12,at:d,a:.002,r:.03});});
      osc({f:300,f2:1800,type:'sawtooth',dur:.5,vol:.12,a:.2,r:.1,lp:500,lp2:5000});
    },
    hit(tier){
      const i=tierIdx(tier);
      osc({f:160,f2:38,dur:.55,vol:.7,a:.005,r:.3});noise({dur:.4,vol:.4,from:5000,to:200});
      if(i>=2)osc({f:1568,dur:.5,vol:.1,at:.02,send:.5});
      if(i>=3)[1047,1319,1568].forEach((f,k)=>osc({f,type:'triangle',dur:.6,vol:.09,at:.04+k*.03,send:.6}));
      if(i>=4)noise({dur:1,vol:.12,from:8000,to:1000,type:'highpass',a:.01});
    },
    timeStop(){osc({f:3000,dur:.7,vol:.05,a:.2,r:.4});osc({f:60,dur:.7,vol:.12,a:.3,r:.3});},
    spectrum(){osc({f:300,f2:3000,dur:.55,vol:.16,a:.02,r:.2,send:.5});for(let k=0;k<8;k++)osc({f:1047*Math.pow(2,k*2/12),type:'triangle',dur:.3,vol:.07,at:k*.06,send:.6});},
    burst(tier){
      const i=tierIdx(tier);
      noise({dur:.7,vol:.4+i*.05,from:7000,to:80});osc({f:130,f2:30,dur:.8,vol:.8,a:.004,r:.4});
      if(i>=1)osc({f:784,type:'triangle',dur:.4,vol:.08,send:.5});
      if(i>=2)[1047,1319,1568,2093].forEach((f,k)=>osc({f,type:'triangle',dur:.9,vol:.08,at:.05+k*.07,send:.6}));
      if(i>=3)[1568,1976,2349,2637,3136].forEach((f,k)=>osc({f,dur:1.3,vol:.06,at:.25+k*.09,send:.7}));
      if(i>=4)cue.fanfare();
    },
    fanfare(){
      const chords=[[330,415,494,659],[440,554,659,880],[494,622,740,988]];
      chords.forEach((ch,ci)=>{const at=.15+ci*.42;const dur=ci===2?1.8:.5;ch.forEach(f=>{osc({f,type:'sawtooth',dur,vol:.045,at,a:.03,r:.4,det:-6,lp:2500,send:.5});osc({f,type:'sawtooth',dur,vol:.045,at,a:.03,r:.4,det:6,lp:2500,send:.5});});});
      [0,2,4,7,9,12,14,16,19,21,24].forEach((s,k)=>osc({f:1047*Math.pow(2,s/12),type:'triangle',dur:.35,vol:.07,at:.4+k*.075,send:.7}));
    },
    slam(){noise({dur:.15,vol:.35,from:2500,to:150});osc({f:110,f2:40,dur:.25,vol:.55,a:.004,r:.15});},
    stamp(tier){const i=tierIdx(tier);osc({f:180,f2:50,type:'square',dur:.16,vol:.22,a:.003,r:.08,lp:1200});noise({dur:.08,vol:.25,from:3000,to:400});if(i>=3)osc({f:2093,dur:.5,vol:.07,at:.03,send:.6});},
    shimmer(tier){const i=tierIdx(tier);const n=i<=0?0:i===1?3:i===2?5:i===3?8:12;for(let k=0;k<n;k++)osc({f:1568*Math.pow(2,(k*(i>=3?2:3))/12)+Math.random()*30,dur:.5,vol:.05,at:k*.09,send:.7});},
    fizzle(){osc({f:700,f2:120,type:'sawtooth',dur:.45,vol:.1,lp:1500,lp2:300});noise({dur:.35,vol:.1,from:1200,to:100});},
    ping(i,tier){
      const scale=[0,2,4,7,9];const f=523*Math.pow(2,(scale[i%5]+12*Math.floor(i/5))/12);const ti=tierIdx(tier);
      osc({f,type:'triangle',dur:.22,vol:.13,send:.4});
      if(ti>=2)osc({f:f*2,dur:.3,vol:.06,send:.5});
      if(ti>=3){osc({f:f*1.5,dur:.5,vol:.07,send:.6});osc({f:65,dur:.3,vol:.25});}
      if(ti>=4)[1,1.25,1.5,2].forEach((m,k)=>osc({f:f*m,type:'triangle',dur:.6,vol:.06,at:k*.04,send:.7}));
    },
    tally(i){osc({f:800+i*60,type:'triangle',dur:.08,vol:.08,a:.003,r:.05});},
    pity(){[523,659,784].forEach((f,k)=>osc({f,type:'triangle',dur:.5,vol:.1,at:k*.1,send:.5}));}
  };
  function duck(level,sec){if(!ctx||!master)return;const t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(master.gain.value,t);master.gain.linearRampToValueAtTime(enabled?level:0,t+sec);}
  function setEnabled(v){enabled=!!v;if(master){master.gain.cancelScheduledValues(ctx.currentTime);master.gain.value=enabled?.8:0;}}
  return Object.assign({ensure,ready,duck,setEnabled,isEnabled:()=>enabled},cue);
})();
