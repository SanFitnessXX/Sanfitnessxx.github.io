/* butterfly: follows the scroll down the page. A tap on it opens Seraphic Styler (wired in main.js). */
(function(SF){
'use strict';
var $=SF.$,rand=SF.rand,clamp=SF.clamp,lerp=SF.lerp,smooth=SF.smooth,mk=SF.mk,c=SF.c;
var spr={},U=60,OX=4,OY=60,SPAN=31,YAW=.5,TILT=.34,DISP=.34;
var fly={x:-99,y:-99,vx:0,vy:0,rot:.3,ph:0,th:.5,a:0,loopT:-1,nextLoop:9};
var keys=[],pointer={x:-999,y:-999,on:0},entered=!SF.playing;

function wingShapes(){
  var P=function(x,y){return [OX+x*U,OY+y*U]},f=new Path2D(),h=new Path2D(),a;
  function C(p,x1,y1,x2,y2,x3,y3){var A=P(x1,y1),B=P(x2,y2),D=P(x3,y3);p.bezierCurveTo(A[0],A[1],B[0],B[1],D[0],D[1])}
  a=P(.02,-.03);f.moveTo(a[0],a[1]);C(f,.12,-.42,.46,-.72,.86,-.7);C(f,1,-.69,1.03,-.56,.96,-.44);C(f,.88,-.28,.72,-.11,.5,-.02);C(f,.32,.03,.14,.02,.02,.02);f.closePath();
  a=P(.02,.03);h.moveTo(a[0],a[1]);C(h,.22,.01,.5,.0,.64,.13);C(h,.75,.24,.71,.44,.58,.57);C(h,.47,.68,.33,.73,.24,.66);C(h,.14,.52,.05,.28,.02,.12);h.closePath();
  return {f:f,h:h};
}
function veins(g,col,lw){
  g.strokeStyle=col;g.lineWidth=lw;g.lineCap='round';
  [[-.62,.8],[-.36,.84],[-.14,.72],[.14,.58],[.38,.6],[.66,.56]].forEach(function(v){
    var a=v[0],l=v[1]*U;g.beginPath();g.moveTo(OX,OY);g.quadraticCurveTo(OX+Math.cos(a)*l*.55+Math.sin(a)*U*.04,OY+Math.sin(a)*l*.55-Math.cos(a)*U*.04,OX+Math.cos(a)*l,OY+Math.sin(a)*l);g.stroke();
  });
}
/* crisp wing: fill, veins and outline only, no blurred copy over the edge */
function wingSprite(a,b,line){
  var W=Math.ceil(U*1.14+OX),H=Math.ceil(U*1.56),cv=mk(W,H),g=cv.getContext('2d'),S=wingShapes(),p=g.createRadialGradient(OX,OY,U*.04,OX,OY,U*1.02);
  p.addColorStop(0,a);p.addColorStop(1,b);g.fillStyle=p;g.fill(S.f);g.fill(S.h);
  veins(g,line,U/100);
  g.strokeStyle=line;g.lineWidth=U/62;g.stroke(S.f);g.stroke(S.h);
  return cv;
}
function build(){
  U=Math.round(SPAN/2*SF.FD*2);OY=Math.round(U*.76);OX=Math.round(U*.05);
  spr.core=SF.theme()==='light'?wingSprite('rgba(92,146,238,.94)','rgba(186,213,252,.7)','rgba(84,134,226,.9)'):wingSprite('rgba(255,255,255,.98)','rgba(160,198,255,.62)','rgba(238,245,255,.95)');
}
function measure(){
  var VW=SF.VW,sy=scrollY,n=$('line').getBoundingClientRect(),f=$('films').getBoundingClientRect(),p=$('pass').getBoundingClientRect(),s=$('sea').getBoundingClientRect();
  var maxS=Math.max(0,SF.root.scrollHeight-innerHeight),vh=innerHeight,l=[
    {x:Math.min(VW-34,n.right-26),y:n.top+sy-20,a:0},
    {x:VW-16,y:f.top+sy+f.height*.5,a:f.top+sy+f.height*.5-vh*.42},
    {x:Math.min(VW-36,p.right-16),y:p.top+sy-14,a:p.top+sy-vh*.44},
    {x:VW*.64,y:s.top+sy+s.height*.32,a:maxS}
  ];
  for(var i=1;i<l.length;i++)l[i].a=Math.max(l[i].a,l[i-1].a+24);
  var last=l[l.length-1].a;if(maxS>0&&last>maxS)l.forEach(function(k){k.a=k.a/last*maxS});
  keys=l;
}
function pathAt(s){
  if(!keys.length)return {x:0,y:0};
  if(s<=keys[0].a)return keys[0];
  for(var i=0;i<keys.length-1;i++){var A=keys[i],B=keys[i+1];if(s<=B.a){var u=(s-A.a)/(B.a-A.a),e=smooth(u);return {x:clamp(lerp(A.x,B.x,e)+Math.sin(u*Math.PI)*(i%2?-22:20),14,SF.VW-14),y:lerp(A.y,B.y,e)}}}
  return keys[keys.length-1];
}
function update(dt,t){
  if(!keys.length)return;
  if(!entered){
    if((performance.now()-SF.t0)/1000<4.1){fly.a=0;fly.x=SF.VW+40;fly.y=keys[0].y-46;return}
    entered=true;
  }
  fly.a=Math.min(1,fly.a+dt*1.4);
  var tg=pathAt(scrollY),wx=Math.sin(t*.7)*6+Math.sin(t*1.9)*2,wy=Math.cos(t*.53)*4+Math.sin(t*2.3)*1.6;
  if(fly.loopT>=0){fly.loopT+=dt;var q=fly.loopT/2.6;if(q>=1)fly.loopT=-1;else{var R=24*Math.sin(q*Math.PI);wx+=Math.sin(q*6.283)*R;wy+=(Math.cos(q*6.283)-1)*R*.8}}
  else if(t>fly.nextLoop){fly.nextLoop=t+rand(9,18);fly.loopT=0}
  /* it drifts toward a nearby cursor and settles, so it can be caught */
  if(pointer.on){var dx=pointer.x-fly.x,dy=pointer.y-(fly.y-scrollY),dd=Math.hypot(dx,dy);if(dd<150&&dd>6){var pull=18*(1-dd/150);wx=wx*.5+dx/dd*pull;wy=wy*.5+dy/dd*pull}}
  var W2=6.5,ax=W2*W2*(tg.x+wx-fly.x)-2*W2*fly.vx,ay=W2*W2*(tg.y+wy-fly.y)-2*W2*fly.vy;
  fly.vx+=ax*dt;fly.vy+=ay*dt;fly.x+=fly.vx*dt;fly.y+=fly.vy*dt;
  var v=Math.hypot(fly.vx,fly.vy),m=clamp(v/140,0,1);
  fly.ph+=dt*6.283*lerp(.7,3.9,m);
  fly.th=lerp(lerp(.36,.16,m),lerp(1,1.28,m),.5+.5*Math.sin(fly.ph));
  var want=v>22?clamp(Math.atan2(fly.vx,-fly.vy),-.9,.9):.26;
  fly.rot+=(want-fly.rot)*Math.min(1,dt*5);
}
function wings(img,th,a,k){
  var s=Math.sin(th),co=Math.cos(th),cy=Math.cos(YAW),sy=Math.sin(YAW);
  c.globalAlpha=a;
  for(var side=-1;side<=1;side+=2){var ax=side*co*cy+s*sy,b=-TILT*s;c.save();c.transform(ax*k,b*k,0,k,0,0);c.drawImage(img,-OX,-OY);c.restore()}
}
function draw(){
  if(fly.a<=.01)return;
  var y0=fly.y-scrollY,light=SF.theme()==='light';if(y0<-60||y0>SF.VH+60)return;
  var k=SPAN/2/(U*1.03);
  c.save();c.translate(fly.x,y0);
  /* its light is a separate pool underneath, never a blurred copy of the wings */
  var g=c.createRadialGradient(0,0,0,0,0,34);g.addColorStop(0,light?'rgba(150,190,246,.26)':'rgba(140,180,255,.17)');g.addColorStop(1,'rgba(150,190,246,0)');
  c.globalAlpha=fly.a;c.fillStyle=g;c.fillRect(-34,-34,68,68);
  c.rotate(fly.rot);c.transform(1,0,-.1,.95,0,0);
  wings(spr.core,fly.th,fly.a,k);
  c.globalAlpha=fly.a;c.strokeStyle=light?'#5a86d8':'#eaf2ff';c.lineCap='round';c.lineWidth=.7;
  c.beginPath();c.moveTo(0,-3);c.lineTo(0,4.4);c.stroke();
  c.lineWidth=.35;c.beginPath();c.moveTo(-.2,-3);c.quadraticCurveTo(-2.4,-8,-5,-10.4);c.stroke();c.beginPath();c.moveTo(.2,-3);c.quadraticCurveTo(2.2,-8,4.6,-10.8);c.stroke();
  c.restore();c.globalAlpha=1;
}
function still(){
  c.setTransform(SF.FD,0,0,SF.FD,0,0);c.clearRect(0,0,SF.VW,SF.VH);
  if(keys.length){var p=pathAt(scrollY);fly.x=p.x;fly.y=p.y;fly.a=1;fly.th=.62;draw()}
}
document.addEventListener('pointermove',function(e){if(e.pointerType==='mouse'){pointer.x=e.clientX;pointer.y=e.clientY;pointer.on=1;SF.root.classList.toggle('near',SF.fly.near(e.clientX,e.clientY,24))}},{passive:true});
SF.root.addEventListener('mouseleave',function(){pointer.on=0;SF.root.classList.remove('near')});

SF.fly={
  build:build,measure:measure,update:update,draw:draw,still:still,
  near:function(x,y,r){return fly.a>.5&&Math.hypot(x-fly.x,y-(fly.y-scrollY))<r},
  flourish:function(){fly.loopT=0}
};
})(window.SF);
