/* sky: soft pools of light, the night's stars, the aurora ribbon, and the occasional falling star.
   Rule of the house: anything with an edge is drawn as true vector at the screen's own resolution;
   softness is only ever a separate pool of light underneath. */
(function(SF){
'use strict';
var $=SF.$,rand=SF.rand,clamp=SF.clamp,smooth=SF.smooth,mk=SF.mk,root=SF.root;

/* ---- pools: soft light, dithered so it never bands ---- */
function paintAura(cv,rgb,A,kind,hot){
  var S=cv.width,g=cv.getContext('2d'),im=g.createImageData(S,S),d=im.data,h=S/2,i=0;
  for(var y=0;y<S;y++)for(var x=0;x<S;x++,i+=4){
    var dx=x+.5-h,dy=y+.5-h,r=Math.sqrt(dx*dx+dy*dy)/h;
    if(r>=1){d[i+3]=0;continue}
    var f=kind==='halo'?Math.pow(1-r,1.3)*(.66+.34*smooth(Math.min(1,r/.42))):Math.pow(1-r,2.1),c=hot?Math.pow(1-r,5):0;
    d[i]=rgb[0]+(hot?hot[0]-rgb[0]:0)*c;d[i+1]=rgb[1]+(hot?hot[1]-rgb[1]:0)*c;d[i+2]=rgb[2]+(hot?hot[2]-rgb[2]:0)*c;
    d[i+3]=clamp(A*f*255+(Math.random()-.5)*2.4*Math.min(1,f*30),0,255);
  }
  g.putImageData(im,0,0);
}
function paintAuras(){
  var M=SF.M;
  [].forEach.call(document.querySelectorAll('.aura'),function(el,n){
    var a=el.querySelector('.a'),b=el.querySelector('.b'),k=+el.dataset.k,next=a.classList.contains('show')?b:a,old=next===a?b:a;
    if(M.th==='light')paintAura(next,M.aura[n%2],.86*k,'halo');else paintAura(next,M.aura[n%2],.5*k,'soft',[120,170,255]);
    next.classList.add('show');old.classList.remove('show');
  });
}

/* ---- stars: fine points, and a few needle stars ---- */
var starC=$('stars');
function paintStars(){
  var w=root.clientWidth,h=Math.max(document.body.scrollHeight,innerHeight),d=Math.min(devicePixelRatio||1,2);
  if(w*h*d*d>9e6)d=1;
  starC.width=Math.round(w*d);starC.height=Math.round(h*d);
  var g=starC.getContext('2d');g.scale(d,d);g.fillStyle='#fff';
  var n=Math.round(w*h/4600),i,x,y;
  for(i=0;i<n;i++){x=rand(0,w);y=Math.pow(Math.random(),1.5)*h;var z=Math.pow(Math.random(),3)*.8+.45;g.globalAlpha=rand(.2,.85);g.fillRect(x,y,z,z)}
  for(i=0;i<Math.max(5,Math.round(n/26));i++){x=rand(8,w-8);y=Math.pow(Math.random(),1.7)*h;g.globalAlpha=rand(.45,.95);SF.needle(g,x,y,rand(2.4,5.2),.07)}
  g.globalAlpha=1;
}

/* ---- aurora: one folded ribbon with a clean lower edge, rising into the dark ---- */
var au=$('aurora'),ag=au.getContext('2d'),AW=0,AH=0,AD=1,strip=null,auSeen=true,auTick=0;
var SPARK=[.2,.41,.63,.84];
function auroraSize(){
  var r=au.getBoundingClientRect(),a=Math.round(r.width),b=Math.round(r.height),d=Math.min(devicePixelRatio||1,2);
  if(!a||!b||(a===AW&&b===AH&&d===AD))return;
  AW=a;AH=b;AD=d;au.width=a*d;au.height=b*d;if(strip)drawAurora(SF.reduce?20:performance.now()/1000);
}
function buildStrip(){
  var R=SF.M.ribbon;if(!R){strip=null;return}
  strip=mk(1,256);var g=strip.getContext('2d'),v=g.createLinearGradient(0,0,0,256);
  v.addColorStop(0,'rgba('+R.top+',0)');v.addColorStop(.4,'rgba('+R.top+',.16)');v.addColorStop(.8,'rgba('+R.mid+',.46)');
  v.addColorStop(.965,'rgba('+R.mid+',.78)');v.addColorStop(.992,'rgba('+R.edge+',1)');v.addColorStop(1,'rgba('+R.edge+',1)');
  g.fillStyle=v;g.fillRect(0,0,1,256);
}
function ribbon(s,t){
  var turns=1.3*Math.max(1,AW/560),th=6.283*turns*s+.9+t*.04;
  return {
    x:AW*(-.16+1.3*s)+Math.min(AW*.19,130)*Math.sin(th),
    y:AH*(.5-.14*s)+AH*.075*Math.cos(th)+AH*.014*Math.sin(s*9+t*.11),
    h:AH*(.4+.1*Math.sin(s*5.1+t*.07)+.05*Math.sin(s*13.7-t*.05))
  };
}
/* drawn narrow and stretched sideways: the light stays silky across, the lower edge stays clean */
var buf=null,bg=null;
function drawAurora(t){
  if(!strip||!AW)return;
  var bw=Math.ceil(AW/3),bh=AH*AD;
  if(!buf||buf.width!==bw||buf.height!==bh){buf=mk(bw,bh);bg=buf.getContext('2d')}
  var K=SF.M.ribbon.k,N=Math.round(bw*1.6),w0=AW*1.3/N,p=null,i,s,q;
  bg.setTransform(bw/AW,0,0,AD,0,0);bg.globalCompositeOperation='source-over';bg.clearRect(0,0,AW,AH);bg.globalCompositeOperation='lighter';
  for(i=0;i<=N;i++){
    s=i/N;q=ribbon(s,t);
    if(p){
      var dx=Math.abs(q.x-p.x),env=Math.pow(Math.sin(Math.PI*s),.7)*(.35+.65*s);
      var a=(.74+.17*Math.sin(s*23+t*.21)+.09*Math.sin(s*47-t*.16))*env*K*clamp(dx/w0,.05,1);
      if(a>.004){bg.globalAlpha=Math.min(1,a);bg.drawImage(strip,Math.min(q.x,p.x),q.y-q.h,Math.max(dx,w0*.5),q.h)}
    }
    p=q;
  }
  ag.setTransform(AD,0,0,AD,0,0);ag.clearRect(0,0,AW,AH);ag.imageSmoothingEnabled=true;ag.imageSmoothingQuality='high';ag.globalAlpha=1;
  ag.drawImage(buf,0,0,AW,AH);
  ag.globalCompositeOperation='source-over';ag.fillStyle='#fff';
  SPARK.forEach(function(sv,n){
    var tw=.5+.5*Math.sin(t*(.5+n*.17)+n*2.1);if(tw<.08)return;
    q=ribbon(sv,t);ag.globalAlpha=tw*.9;SF.needle(ag,q.x,q.y,2.6+3.4*tw,.07);
  });
  ag.globalAlpha=1;
}
new IntersectionObserver(function(en){auSeen=en[0].isIntersecting}).observe(au);

/* ---- a falling star: one tapered sliver on a gentle arc, a needle star at its head ---- */
var shots=[],nextS=performance.now()/1000+rand(5,10);
function shoot(){
  var VW=SF.VW,VH=SF.VH,x0=rand(VW*.1,VW*.9),right=x0<VW*.5;
  shots.push({x:x0,y:rand(VH*.03,VH*.22),a:right?rand(.25,.7):Math.PI-rand(.25,.7),bend:(right?1:-1)*rand(.1,.26),sp:rand(150,220),life:rand(1.6,2.3),len:rand(90,150),t:0,pts:[]});
}
function drawShots(dt){
  var c=SF.c;
  shots=shots.filter(function(m){
    m.t+=dt;if(m.t>=m.life)return false;
    m.a+=m.bend*dt;m.x+=Math.cos(m.a)*m.sp*dt;m.y+=Math.sin(m.a)*m.sp*dt;
    m.pts.unshift([m.x,m.y]);if(m.pts.length>90)m.pts.pop();
    var e=Math.sin(Math.PI*m.t/m.life),d=0,i,A,B,L,nx,ny,u0,u1;
    c.fillStyle='#eaf2ff';
    for(i=0;i<m.pts.length-1&&d<m.len;i++){
      A=m.pts[i];B=m.pts[i+1];L=Math.hypot(B[0]-A[0],B[1]-A[1]);if(!L)continue;
      nx=-(B[1]-A[1])/L;ny=(B[0]-A[0])/L;u0=1-d/m.len;d+=L;u1=Math.max(0,1-d/m.len);
      var w0=.85*Math.pow(u0,1.3),w1=.85*Math.pow(u1,1.3);
      c.globalAlpha=e*.95*Math.pow(u0,1.4);
      c.beginPath();c.moveTo(A[0]+nx*w0,A[1]+ny*w0);c.lineTo(B[0]+nx*w1,B[1]+ny*w1);c.lineTo(B[0]-nx*w1,B[1]-ny*w1);c.lineTo(A[0]-nx*w0,A[1]-ny*w0);c.closePath();c.fill();
    }
    var g=c.createRadialGradient(m.x,m.y,0,m.x,m.y,16);g.addColorStop(0,'rgba(150,190,255,'+.34*e+')');g.addColorStop(1,'rgba(150,190,255,0)');
    c.globalAlpha=1;c.fillStyle=g;c.fillRect(m.x-16,m.y-16,32,32);
    c.fillStyle='#fff';c.globalAlpha=e;SF.needle(c,m.x,m.y,7.5,.06);
    c.globalAlpha=1;return true;
  });
}

SF.sky={
  paintStars:paintStars,
  size:auroraSize,
  onMood:function(){var M=SF.M;starC.style.opacity=M.stars;paintAuras();buildStrip();if(strip){auroraSize();drawAurora(SF.reduce?20:performance.now()/1000)}},
  frame:function(dt,t){
    if(strip&&auSeen&&(auTick^=1))drawAurora(t);
    if(SF.M.name==='night'){
      if(!document.hidden&&t>nextS&&shots.length<1&&(performance.now()-SF.t0)>6000){nextS=t+rand(10,22);shoot()}
      drawShots(dt);
    }else shots=[];
  }
};
})(window.SF);
