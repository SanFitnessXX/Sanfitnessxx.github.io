/* main: the opening, living light, the three quiet doors (star, rabbit, butterfly), and the frame loop */
(function(SF){
'use strict';
var $=SF.$,clamp=SF.clamp,lerp=SF.lerp,smooth=SF.smooth,root=SF.root,reduce=SF.reduce,c=SF.c;

/* ---- the opening: a rolled mat draws itself and unrolls into the horizon ---- */
var hz=$('hz'),matOn=SF.playing&&!reduce;
function drawMat(){
  var VW=SF.VW,T=(performance.now()-SF.t0)/1000,col=$('line').getBoundingClientRect(),hr=hz.getBoundingClientRect(),st=$('day').getBoundingClientRect();
  var R0=VW<640?15:20,x0=col.left+R0,x1=st.left+st.width/2,y=hr.top+.5;
  var turns=3.25,th0=turns*6.283,a=R0/th0;
  var p=clamp((T-.85)/1.45,0,1),e=.5-.5*Math.cos(Math.PI*p),cx=lerp(x0,x1,e),Rr=R0*Math.sqrt(Math.max(0,1-e)),thMax=Rr/a;
  if(T>.12&&p<1){
    var upto=thMax*smooth(clamp((T-.15)/.7,0,1)),cy=y-Rr;
    c.strokeStyle=SF.M.th==='light'?'#666b75':'#8d93a0';c.lineWidth=.95;c.lineCap='round';c.lineJoin='round';c.globalAlpha=1;c.beginPath();
    var started=false;
    for(var sv=thMax-upto;sv<=thMax+.001;sv+=.16){var r=a*sv,f=Math.PI/2-(thMax-sv),px=cx+r*Math.cos(f),py=cy+r*Math.sin(f);if(!started){c.moveTo(px,py);started=true}else c.lineTo(px,py)}
    c.stroke();
  }
  var right=T<2.3?cx:x1+(VW-x1)*smooth(clamp((T-2.3)/.5,0,1)),left=T<2.1?x0:x0*(1-smooth(clamp((T-2.1)/.6,0,1)));
  if(T>=.85){hz.classList.add('unroll');hz.style.clipPath='inset(0 '+Math.max(0,VW-right).toFixed(1)+'px 0 '+left.toFixed(1)+'px)'}
  if(T>2.85){hz.style.clipPath='none';hz.classList.remove('unroll');matOn=false}
}

/* ---- living light: the page follows the visitor's real time of day ---- */
var toggle=$('toggle'),lapsing=false,lapseTimer=0;
function clockMood(){var d=new Date();return window.__moodAt(d.getHours()+d.getMinutes()/60)}
function wantMood(){return SF.pref==='day'?'noon':SF.pref==='night'?'night':clockMood()}
function label(){toggle.setAttribute('aria-label',root.dataset.theme==='dark'?'Switch to day':'Switch to night')}
/* ---- night has two skins: cobalt (0, the original pure dark) and twilight (1). mix is where between them we are ---- */
var mix=root.dataset.skin==='cobalt'?0:1,CSSK=['--ink','--soft','--line','--mark','--pool','--dusk'],driftT=0;
function moodFor(name){var T=SF.MOODS[name],C=SF.MOODS[name+'C'];return C?SF.blend(C,T,mix):T}
function apply(M){
  var prev=SF.M,flip=!prev||prev.th!==M.th,css=M.css||{};
  SF.M=M;root.dataset.theme=M.th;root.dataset.mood=M.name;root.style.setProperty('--bg',M.bg);
  CSSK.forEach(function(k){if(k in css)root.style.setProperty(k,css[k]);else root.style.removeProperty(k)});
  document.querySelector('meta[name=theme-color]').content=M.bg;
  SF.sky.onMood();if(flip)SF.fly.build();SF.ocean.onMood(prev);
  if(reduce)SF.fly.still();
  if(toggle)label();
}
function setMood(name){
  if(SF.M&&SF.M.name===name)return;
  /* coming into the dark from the day: a fresh coin toss for which night it opens on */
  if(SF.MOODS[name].th==='dark'&&SF.M&&SF.M.th!=='dark'&&!lapsing){mix=root.dataset.skin==='cobalt'?1:0;root.dataset.skin=mix?'twilight':'cobalt';try{localStorage.setItem('sanfit-skin',root.dataset.skin)}catch(e){}}
  apply(moodFor(name));
}
/* the drift: rest on one night for a minute or two, then ease into the other over about half a minute.
   Each step is a small blend handed to the same 1.7s cross-fades the page already uses, so it reads as one long, slow change */
function planDrift(){clearTimeout(driftT);driftT=setTimeout(nightDrift,SF.rand(50,140)*1000)}
function nightDrift(){
  if(document.hidden||lapsing||SF.M.th!=='dark'){planDrift();return}
  var from=mix,to=mix<.5?1:0,steps=Math.round(SF.rand(14,20)),n=0;
  (function step(){
    n++;mix=SF.lerp(from,to,SF.smooth(n/steps));
    if(SF.M.th==='dark'&&!lapsing)apply(moodFor(SF.M.name));
    if(n<steps)driftT=setTimeout(step,1800);else{mix=to;root.dataset.skin=to?'twilight':'cobalt';try{localStorage.setItem('sanfit-skin',root.dataset.skin)}catch(e){}planDrift()}
  })();
}
function setPref(p){
  SF.pref=p;root.dataset.pref=p;
  try{localStorage.setItem('sanfit-light',p)}catch(e){}
  stopLapse();label();setMood(wantMood());
}
/* one tap: straight between day and night; the Display menu also offers time of day */
toggle.addEventListener('click',function(){setPref(root.dataset.theme==='dark'?'day':'night')});
window.__display={themes:[['auto','Time of day'],['day','Day'],['night','Night']],get:function(){return SF.pref},set:setPref,
  motion:function(){location.reload()}};
setInterval(function(){if(!lapsing)setMood(wantMood())},60000);

/* ---- the star: one whole day of light, then back to now ---- */
function stopLapse(){lapsing=false;clearTimeout(lapseTimer)}
function lapse(){
  if(reduce||lapsing)return;lapsing=true;
  var i=SF.ORDER.indexOf(SF.M.name),n=0;
  (function step(){n++;i=(i+1)%SF.ORDER.length;setMood(SF.ORDER[i]);if(n<SF.ORDER.length)lapseTimer=setTimeout(step,2100);else lapseTimer=setTimeout(function(){lapsing=false;setMood(wantMood())},2100)})();
}
$('day').addEventListener('click',lapse);

/* ---- the butterfly: a tap on it follows the hidden link in index.html (Seraphic Styler).
        The rabbit needs no script: it is a plain link on the horizon (The Soft Bunny). ---- */
var downAt=null,leaving=false;
document.addEventListener('pointerdown',function(e){downAt={x:e.clientX,y:e.clientY,t:e.timeStamp}},{passive:true});
document.addEventListener('pointerup',function(e){
  if(!downAt||leaving)return;var moved=Math.hypot(e.clientX-downAt.x,e.clientY-downAt.y),quick=e.timeStamp-downAt.t<400;downAt=null;
  if(moved>10||!quick||(e.target.closest&&e.target.closest('a,#toggle,#day')))return;
  if(SF.fly.near(e.clientX,e.clientY,32)){leaving=true;SF.fly.flourish();setTimeout(function(){leaving=false;$('flyLink').click()},reduce?0:320)}
},{passive:true});

/* ---- loop ---- */
var drift=[['.o2',-.05],['.o3',-.04]].map(function(q){return [document.querySelector(q[0]),q[1]]});
var last=performance.now();
function tick(now){
  var dt=Math.min(.05,(now-last)/1000);last=now;var t=now/1000;
  c.setTransform(SF.FD,0,0,SF.FD,0,0);c.clearRect(0,0,SF.VW,SF.VH);
  SF.sky.frame(dt,t);
  drift.forEach(function(q){q[0].style.transform='translate3d(0,'+(scrollY*q[1]).toFixed(1)+'px,0)'});
  if(matOn)drawMat();
  SF.fly.update(dt,t);SF.fly.draw();
  SF.films.frame();
  requestAnimationFrame(tick);
}

/* ---- start ---- */
function layout(){if(SF.fxSize())SF.fly.build();SF.sky.size();SF.ocean.size();SF.fly.measure();if(reduce)SF.fly.still()}
SF.fxSize();
(function(){var name=wantMood(),M=moodFor(name);SF.M=M;root.dataset.theme=M.th;root.dataset.mood=name})();
if(!reduce)planDrift();
SF.nightDrift=nightDrift;   /* SF.nightDrift() in the console starts a change right away */
SF.fly.build();SF.sky.size();SF.sky.onMood();SF.ocean.size();SF.fly.measure();SF.sky.paintStars();label();
addEventListener('resize',function(){layout();SF.sky.paintStars()});
if(window.ResizeObserver)new ResizeObserver(function(){SF.sky.size();SF.ocean.size();SF.fly.measure()}).observe(document.body);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){SF.sky.size();SF.fly.measure();SF.sky.paintStars()});
if(reduce){SF.fly.still();addEventListener('scroll',SF.fly.still,{passive:true})}else requestAnimationFrame(tick);
})(window.SF);
