(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const scenes = {
    rain: {number:'01', name:'Peach Rain', category:'A LITTLE DRIZZLE', description:"Today's forecast: a soft shower of peaches."},
    spin: {number:'02', name:'Slow Spin', category:'TAKE YOUR SWEET TIME', description:'One peach. Absolutely nowhere to be.'},
    orbit: {number:'03', name:'Peach Orbit', category:'IN YOUR OWN ORBIT', description:'A tiny peach universe, just for you.'},
    float: {number:'04', name:'Floating Peaches', category:'A WEIGHTLESS LITTLE ESCAPE', description:'Leave a little room for daydreaming.'}
  };
  const themes = {
    midnight: {name:'Midnight',base:'#191d1a',glow:'#3d3c2a',dust:'220,205,157',ring:'198,181,131'},
    cream: {name:'Cream',base:'#f4ead9',glow:'#e9c6a3',dust:'143,102,64',ring:'156,114,74'},
    blush: {name:'Blush',base:'#e9c0b3',glow:'#f6d6bf',dust:'151,87,72',ring:'161,99,76'},
    peach: {name:'Peach',base:'#f5b28b',glow:'#ffce9f',dust:'142,76,46',ring:'157,82,49'}
  };
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
  let state = {scene:'rain',theme:'midnight',speed:0.75,density:0.7,paused:false,clock:{on:true,scale:1,x:.5,y:.45}};
  try {
    const saved = JSON.parse(localStorage.getItem('peach-afterglow') || 'null');
    if (saved && typeof saved === 'object') {
      if (scenes[saved.scene]) state.scene=saved.scene;
      if (themes[saved.theme]) state.theme=saved.theme;
      if (Number.isFinite(saved.speed)) state.speed=Math.min(2,Math.max(.25,saved.speed));
      if (Number.isFinite(saved.density)) state.density=Math.min(1.5,Math.max(.2,saved.density));
      const savedClock=saved.clock;
      if (savedClock && typeof savedClock === 'object') {
        if (typeof savedClock.on === 'boolean') state.clock.on=savedClock.on;
        if (Number.isFinite(savedClock.scale)) state.clock.scale=clamp(savedClock.scale,.5,3);
        if (Number.isFinite(savedClock.x)) state.clock.x=clamp(savedClock.x,0,1);
        if (Number.isFinite(savedClock.y)) state.clock.y=clamp(savedClock.y,0,1);
      }
    }
  } catch (_) {}
  const save = () => {try {localStorage.setItem('peach-afterglow',JSON.stringify({scene:state.scene,theme:state.theme,speed:state.speed,density:state.density,clock:state.clock}));}catch (_) {}};
  const stage=$('stage');
  const peach = new Image();
  peach.src='./peach.svg';
  const keys=Object.keys(scenes);
  const seed=(i,n=1)=>{const value=Math.sin(i*127.1+n*311.7)*43758.5453123;return value-Math.floor(value);};
  const particles=Array.from({length:120},(_,i)=>({x:seed(i,1),y:seed(i,2),size:seed(i,3),phase:seed(i,4)*Math.PI*2,rate:seed(i,5),angle:seed(i,6)}));
  const surfaces=[{canvas:$('main-canvas'),main:true},...Array.from(document.querySelectorAll('[data-preview]')).map(canvas=>({canvas,scene:canvas.dataset.preview,main:false}))];
  for (const surface of surfaces) {
    surface.ctx=surface.canvas.getContext('2d',{alpha:false});
    surface.visible=true;
  }
  let dirty=true, elapsed=0, lastTime=0, lastPaint=0;
  function resizeSurface(s) {
    const rect=s.canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,s.main?2:1.5);
    s.w=Math.max(1,rect.width);s.h=Math.max(1,rect.height);
    s.canvas.width=Math.round(s.w*dpr);s.canvas.height=Math.round(s.h*dpr);
    s.ctx.setTransform(dpr,0,0,dpr,0,0);dirty=true;
  }
  const observer=new ResizeObserver(entries=>{for (const entry of entries) {const s=surfaces.find(item=>item.canvas===entry.target);if(s)resizeSurface(s);}});
  surfaces.forEach(s=>{observer.observe(s.canvas);resizeSurface(s);});
  if ('IntersectionObserver' in window) {
    const visibleObserver=new IntersectionObserver(entries=>{entries.forEach(e=>{const s=surfaces.find(item=>item.canvas===e.target);if(s)s.visible=e.isIntersecting;});dirty=true;},{rootMargin:'50px'});
    surfaces.forEach(s=>visibleObserver.observe(s.canvas));
  }
  function sprite(ctx,x,y,size,angle=0,opacity=1,scaleX=1) {
    if(!peach.complete||!peach.naturalWidth)return;
    ctx.save();ctx.globalAlpha=opacity;ctx.translate(x,y);ctx.rotate(angle);ctx.scale(scaleX,1);
    ctx.drawImage(peach,-size/2,-size/2,size,size);ctx.restore();
  }
  function backdrop(s,theme,scene,t,density) {
    const {ctx,w,h}=s;
    ctx.fillStyle=theme.base;ctx.fillRect(0,0,w,h);
    const gradient=ctx.createRadialGradient(w*.54,h*.52,0,w*.54,h*.52,Math.max(w,h)*.64);
    gradient.addColorStop(0,theme.glow);gradient.addColorStop(1,theme.base);
    ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
    const count=Math.round((s.main?38:15)*(density+.35));
    for(let i=0;i<count;i++) {
      const p=particles[i];
      const x=p.x*w+Math.sin(t*.13+p.phase)*4;
      const y=p.y*h+Math.cos(t*.1+p.phase)*4;
      const alpha=(.07+p.size*.19)*(.7+Math.sin(t*.3+p.phase)*.3);
      ctx.fillStyle=`rgba(${theme.dust},${alpha})`;
      ctx.beginPath();ctx.arc(x,y,s.main?(p.size>.8?1.5:.65):.55,0,Math.PI*2);ctx.fill();
    }
  }
  function rain(s,t,density) {
    const {ctx,w,h}=s;
    const count=Math.round((s.main?46:24)*density);
    const basis=s.main?Math.min(w/17,h/5.2):Math.min(w/7,h/3.3);
    for(let i=0;i<count;i++) {
      const p=particles[i];const size=basis*(.42+p.size*.72);
      const span=h+size*2.5;
      const y=((p.y*span+t*(11+p.rate*22)*(s.main?1:.42))%span)-size;
      const x=p.x*w+Math.sin(t*.24+p.phase)*basis*.55;
      const angle=(p.angle-.5)*1.2+t*(p.rate-.5)*.14;
      sprite(ctx,x,y,size,angle,.28+p.size*.7);
    }
  }
  function spin(s,t,density) {
    const {ctx,w,h}=s;
    const size=Math.min(w*.29,h*.53),x=w*.5,y=h*.49+Math.sin(t*.4)*h*.025;
    const glow=ctx.createRadialGradient(x,y,0,x,y,size*.85);
    glow.addColorStop(0,state.theme==='midnight'?'#f4a3630e':'#fff7e52b');glow.addColorStop(1,'#ffffff00');
    ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,size*.85,0,Math.PI*2);ctx.fill();
    sprite(ctx,x,y,size,t*.15-.16,1,.86+.14*Math.cos(t*.6));
    const extras=Math.round(3*density);
    for(let i=0;i<extras;i++) {
      const angle=i*2.39996+t*.045;
      const rx=w*(.28+(i%2)*.055),ry=h*(.28+(i%2)*.03);
      sprite(ctx,w*.5+Math.cos(angle)*rx,h*.49+Math.sin(angle)*ry,size*(.10+seed(i,8)*.08),-t*.1+i,.22+seed(i,9)*.22);
    }
  }
  function orbit(s,t,density,theme) {
    const {ctx,w,h}=s;
    const unit=Math.min(w*.34,h*.47),cx=w*.5,cy=h*.5;
    const tilt=-.22;
    const itemList=[];
    ctx.save();ctx.translate(cx,cy);ctx.rotate(tilt);
    for(let ring=0;ring<3;ring++) {
      const rx=unit*(.69+ring*.36),ry=rx*.37;
      ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.strokeStyle=`rgba(${theme.ring},${.13-ring*.02})`;ctx.lineWidth=.7;ctx.stroke();
      const amount=Math.max(2,Math.round((4+ring*2)*density));
      for(let i=0;i<amount;i++) {
        const a=i/amount*Math.PI*2+t*(.19-ring*.033)*(ring%2?-1:1)+ring*1.7;
        itemList.push({x:Math.cos(a)*rx,y:Math.sin(a)*ry,size:unit*(.12+Math.sin(a)*.028)*(1+ring*.05),angle:Math.sin(t*.3+i)*.3});
      }
    }
    itemList.sort((a,b)=>a.y-b.y);
    for(const p of itemList.filter(p=>p.y<0))sprite(ctx,p.x,p.y,p.size,p.angle,.62);
    sprite(ctx,0,0,unit*.55,Math.sin(t*.14)*.12);
    for(const p of itemList.filter(p=>p.y>=0))sprite(ctx,p.x,p.y,p.size,p.angle,.95);
    ctx.restore();
  }
  function float(s,t,density) {
    const {ctx,w,h}=s;
    const count=Math.round((s.main?20:13)*density);
    const basis=s.main?Math.min(w/12,h/4.5):Math.min(w/5,h/2.8);
    for(let i=0;i<count;i++) {
      const p=particles[i];
      const x=w*(.07+p.x*.86)+Math.sin(t*(.12+p.rate*.1)+p.phase)*w*.045;
      const y=h*(.12+p.y*.76)+Math.cos(t*(.13+p.rate*.08)+p.phase)*h*.08;
      const angle=Math.sin(t*.16+p.phase)*.45+(p.angle-.5)*.5;
      sprite(ctx,x,y,basis*(.35+p.size*.9),angle,.28+p.size*.7);
    }
  }
  function render(s,t) {
    const scene=s.main?state.scene:s.scene;
    const theme=themes[state.theme];
    const density=s.main?state.density:.7;
    backdrop(s,theme,scene,t,density);
    if(scene==='rain')rain(s,t,density);
    if(scene==='spin')spin(s,t,density);
    if(scene==='orbit')orbit(s,t,density,theme);
    if(scene==='float')float(s,t,density);
  }
  function frame(now) {
    const dt=lastTime?Math.min((now-lastTime)/1000,.08):0;lastTime=now;
    if(!document.hidden&&!state.paused)elapsed+=dt*state.speed;
    if(!document.hidden&&((!state.paused&&now-lastPaint>=1000/30)||dirty)) {
      for(const s of surfaces)if(s.visible||s.main)render(s,elapsed+18);
      lastPaint=now;dirty=false;
    }
    requestAnimationFrame(frame);
  }
  peach.onload=()=>{dirty=true;};
  peach.onerror=()=>{$('announcement').textContent='The peach image could not load. Please refresh the page.';};
  function announce(text){$('announcement').textContent=text;}
  function selectScene(key,notify=true) {
    if(!scenes[key])return;
    state.scene=key;const scene=scenes[key];
    $('scene-name').textContent=scene.name;$('immersive-name').textContent=scene.name;
    $('scene-number').textContent=scene.number;$('scene-category').textContent=scene.category;
    $('scene-description').textContent=scene.description;
    $('main-canvas').setAttribute('aria-label',`${scene.name} animated preview`);
    document.querySelectorAll('[data-scene]').forEach(button=>{const selected=button.dataset.scene===key;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
    dirty=true;save();if(notify)announce(`${scene.name} selected`);
  }
  function selectTheme(key) {
    if(!themes[key])return;
    state.theme=key;$('fullscreen-background').value=key;
    stage.classList.toggle('light',key!=='midnight');
    document.querySelector('.scene-grid').classList.toggle('light',key!=='midnight');
    document.querySelectorAll('[data-theme]').forEach(button=>{const selected=button.dataset.theme===key;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
    dirty=true;save();
  }
  const pauseIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
  const playIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z"/></svg>';
  function togglePause() {
    state.paused=!state.paused;
    $('pause-label').textContent=state.paused?'Play':'Pause';
    for(const id of ['pause-button','immersive-pause']) {const button=$(id);button.setAttribute('aria-label',state.paused?'Resume animation':'Pause animation');button.querySelector('svg').outerHTML=state.paused?playIcon:pauseIcon;}
    $('live-label').textContent=state.paused?'PAUSED':'LIVE PREVIEW';stage.classList.toggle('paused',state.paused);dirty=true;
    announce(state.paused?'Animation paused':'Animation resumed');
  }
  function updateSlider(id,value) {
    const input=$(id);input.value=value;
    input.style.setProperty('--fill',`${(value-Number(input.min))/(Number(input.max)-Number(input.min))*100}%`);
    $(id+'-value').textContent=id==='speed'?`${Number(value.toFixed(2))}×`:id==='clock-size'?`${Math.round(value*100)}%`:value<.5?'Light':value>1?'Full':'Medium';
  }
  // Clock: hours over minutes, as on the car lockscreen. Its spot is the clock's centre as a share of the stage, so it
  // keeps its place in and out of fullscreen; its size follows the stage, times the scale (0.5-3, as on the car).
  const clock=$('clock');
  let clockText='';
  function updateClock() {
    const now=new Date(),hours=String(now.getHours()).padStart(2,'0'),minutes=String(now.getMinutes()).padStart(2,'0');
    if(hours+minutes===clockText)return;
    clockText=hours+minutes;$('clock-hours').textContent=hours;$('clock-minutes').textContent=minutes;
    clock.setAttribute('aria-label',`The time is ${hours}:${minutes}`);
  }
  function sizeClock() {
    const w=stage.clientWidth,h=stage.clientHeight;
    clock.style.fontSize=`${Math.min(Math.min(w*.2,h*.18)*state.clock.scale,h*.55,w*.8)}px`;
  }
  // Shown inside the stage even where the saved spot would put part of it outside (after leaving fullscreen); that nudge isn't saved.
  function placeClock() {
    if(!state.clock.on)return;
    const w=stage.clientWidth,h=stage.clientHeight,cw=clock.offsetWidth,ch=clock.offsetHeight;
    const left=clamp(state.clock.x*w-cw/2,Math.min(0,w-cw),Math.max(0,w-cw)),top=clamp(state.clock.y*h-ch/2,Math.min(0,h-ch),Math.max(0,h-ch));
    clock.style.transform=`translate(${Math.round(left)}px,${Math.round(top)}px)`;
  }
  function layoutClock(){sizeClock();placeClock();}
  function keepClockInside() {
    const halfW=Math.min(clock.offsetWidth/stage.clientWidth,1)/2,halfH=Math.min(clock.offsetHeight/stage.clientHeight,1)/2;
    state.clock.x=clamp(state.clock.x,halfW,1-halfW);state.clock.y=clamp(state.clock.y,halfH,1-halfH);
  }
  function setClockScale(scale) {
    state.clock.scale=clamp(scale,.5,3);updateSlider('clock-size',state.clock.scale);layoutClock();
  }
  function setClock(on,notify=true) {
    state.clock.on=on;clock.hidden=!on;
    $('clock-toggle').setAttribute('aria-checked',String(on));$('immersive-clock').setAttribute('aria-pressed',String(on));
    $('clock-size').disabled=!on;document.querySelector('.clock-control').classList.toggle('off',!on);
    if(on){updateClock();layoutClock();}
    save();if(notify)announce(on?'Clock shown':'Clock hidden');
  }
  // One finger (or the mouse) moves the clock; two fingers move and resize it. The second finger may land beside the clock.
  const clockPointers=new Map();
  let clockGesture=null;
  const midpoint=points=>({x:points.reduce((sum,p)=>sum+p.x,0)/points.length,y:points.reduce((sum,p)=>sum+p.y,0)/points.length});
  const spread=points=>points.length>1?Math.hypot(points[0].x-points[1].x,points[0].y-points[1].y):0;
  function startClockGesture() {
    const points=[...clockPointers.values()],center=midpoint(points);
    clockGesture={x:state.clock.x,y:state.clock.y,scale:state.clock.scale,cx:center.x,cy:center.y,spread:spread(points)};
  }
  function addClockPointer(event) {
    if(clockPointers.size>=2)return;
    clock.setPointerCapture(event.pointerId);
    clockPointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    clock.classList.add('dragging');startClockGesture();
  }
  function endClockPointer(event) {
    if(!clockPointers.delete(event.pointerId))return;
    if(clockPointers.size)return startClockGesture();
    clockGesture=null;clock.classList.remove('dragging');save();
  }
  clock.addEventListener('pointerdown',event=>{if(event.button>0)return;event.preventDefault();addClockPointer(event);});
  stage.addEventListener('pointerdown',event=>{if(clockPointers.size&&event.pointerType==='touch'&&event.target===$('main-canvas'))addClockPointer(event);});
  clock.addEventListener('pointermove',event=>{
    if(!clockGesture||!clockPointers.has(event.pointerId))return;
    clockPointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    const points=[...clockPointers.values()],center=midpoint(points);
    if(clockGesture.spread)setClockScale(clockGesture.scale*spread(points)/clockGesture.spread);
    state.clock.x=clockGesture.x+(center.x-clockGesture.cx)/stage.clientWidth;
    state.clock.y=clockGesture.y+(center.y-clockGesture.cy)/stage.clientHeight;
    keepClockInside();placeClock();
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])clock.addEventListener(type,endClockPointer);
  stage.addEventListener('touchmove',event=>{if(clockPointers.size)event.preventDefault();},{passive:false});
  clock.addEventListener('wheel',event=>{
    event.preventDefault();
    const pixels=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?stage.clientHeight:1);
    setClockScale(state.clock.scale*Math.exp(-pixels*(event.ctrlKey?.01:.0015)));save();
  },{passive:false});
  new ResizeObserver(layoutClock).observe(stage);
  new ResizeObserver(placeClock).observe(clock);
  setInterval(()=>{if(state.clock.on)updateClock();},1000);
  document.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>selectScene(button.dataset.scene)));
  document.querySelectorAll('[data-theme]').forEach(button=>button.addEventListener('click',()=>selectTheme(button.dataset.theme)));
  $('fullscreen-background').addEventListener('change',event=>selectTheme(event.target.value));
  for(const id of ['speed','density']) $(id).addEventListener('input',event=>{state[id]=Number(event.target.value);updateSlider(id,state[id]);dirty=true;save();});
  $('clock-size').addEventListener('input',event=>{setClockScale(Number(event.target.value));save();});
  $('clock-toggle').addEventListener('click',()=>setClock(!state.clock.on));$('immersive-clock').addEventListener('click',()=>setClock(!state.clock.on));
  $('pause-button').addEventListener('click',togglePause);$('immersive-pause').addEventListener('click',togglePause);
  const changeScene=direction=>selectScene(keys[(keys.indexOf(state.scene)+direction+keys.length)%keys.length]);
  $('previous-scene').addEventListener('click',()=>changeScene(-1));$('next-scene').addEventListener('click',()=>changeScene(1));
  let hudTimer;
  let fullscreenSession=false;
  const exitDialog=$('exit-dialog');
  function isImmersive(){return document.fullscreenElement===stage||stage.classList.contains('expanded');}
  function showHud() {
    stage.classList.remove('idle');clearTimeout(hudTimer);
    if(isImmersive()&&!exitDialog.open)hudTimer=setTimeout(()=>{if(!exitDialog.open&&!stage.querySelector(':focus-visible')&&!stage.querySelector('.immersive-controls:hover'))stage.classList.add('idle');},2700);
  }
  function expandStage() {stage.classList.add('expanded');document.body.style.overflow='hidden';}
  async function useBrowserFullscreen() {
    if(!stage.requestFullscreen)return expandStage();
    try {await stage.requestFullscreen({navigationUI:'hide'});} catch (_) {expandStage();}
  }
  async function enterFullscreen() {
    if(isImmersive())return;
    fullscreenSession=true;
    await useBrowserFullscreen();
    stage.focus({preventScroll:true});showHud();
  }
  function requestExit() {
    if(!fullscreenSession||exitDialog.open)return;
    stage.classList.remove('idle');clearTimeout(hudTimer);
    exitDialog.showModal();
  }
  function finishFullscreen() {
    stage.classList.remove('expanded','idle');document.body.style.overflow='';clearTimeout(hudTimer);
    $('fullscreen-button').focus({preventScroll:true});
  }
  async function keepWatching() {
    if(exitDialog.open)exitDialog.close('stay');
    if(document.fullscreenElement!==stage)await useBrowserFullscreen();
    stage.focus({preventScroll:true});showHud();
  }
  async function confirmExit() {
    fullscreenSession=false;
    if(exitDialog.open)exitDialog.close('exit');
    if(document.fullscreenElement===stage) {
      try {await document.exitFullscreen();} catch (_) {
        fullscreenSession=true;requestExit();return;
      }
    }
    finishFullscreen();
  }
  $('fullscreen-button').addEventListener('click',enterFullscreen);$('stage-expand').addEventListener('click',enterFullscreen);$('exit-fullscreen').addEventListener('click',requestExit);
  $('keep-watching').addEventListener('click',keepWatching);$('confirm-exit').addEventListener('click',confirmExit);
  exitDialog.addEventListener('cancel',event=>{event.preventDefault();keepWatching();});
  stage.addEventListener('pointermove',showHud);stage.addEventListener('pointerdown',showHud);stage.addEventListener('focusin',showHud);
  document.addEventListener('fullscreenchange',()=>{
    if(document.fullscreenElement===stage) {
      stage.classList.remove('expanded');document.body.style.overflow='hidden';showHud();
    } else if(fullscreenSession) {
      // Browser-owned exits (including Esc) cannot be cancelled. Keep the
      // screensaver expanded while the user decides, then restore native
      // fullscreen only after an explicit Keep watching action.
      expandStage();requestExit();
    } else {finishFullscreen();}
    dirty=true;
  });
  document.addEventListener('keydown',event=>{
    const isFormControl=event.target instanceof HTMLInputElement||event.target instanceof HTMLSelectElement;
    if(event.altKey||event.ctrlKey||event.metaKey||isFormControl||exitDialog.open)return;
    if(['1','2','3','4'].includes(event.key)){event.preventDefault();selectScene(keys[Number(event.key)-1]);}
    if(event.key.toLowerCase()==='f'){event.preventDefault();isImmersive()?requestExit():enterFullscreen();}
    if(event.key.toLowerCase()==='c'){event.preventDefault();setClock(!state.clock.on);}
    if(event.code==='Space'&&event.target.tagName!=='BUTTON'){event.preventDefault();togglePause();}
    if(event.key==='ArrowRight'){event.preventDefault();changeScene(1);}
    if(event.key==='ArrowLeft'){event.preventDefault();changeScene(-1);}
    if(event.key==='Escape'&&isImmersive()){event.preventDefault();requestExit();}
    showHud();
  });
  document.addEventListener('visibilitychange',()=>{lastTime=0;dirty=true;if(state.clock.on)updateClock();});
  selectScene(state.scene,false);selectTheme(state.theme);updateSlider('speed',state.speed);updateSlider('density',state.density);updateSlider('clock-size',state.clock.scale);setClock(state.clock.on,false);
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)togglePause();
  requestAnimationFrame(frame);
})();
