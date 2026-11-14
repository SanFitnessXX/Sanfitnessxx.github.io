/* ocean: the water at the foot of the page. Tap it for a ripple. */
(function(SF){
'use strict';
var $=SF.$,rand=SF.rand,clamp=SF.clamp,lerp=SF.lerp,mk=SF.mk,reduce=SF.reduce;
var sea=$('sea'),cv=$('water'),w=cv.getContext('2d'),W=0,H=0,DP=1,layer=null,layerPrev=null,prevM=null,mixT=0,gl={},glints=[],glits=[],specks=[],rings=[],running=false,raf=0,oT=performance.now();

var grain=mk(220,220);
(function(){var g=grain.getContext('2d'),im=g.createImageData(220,220),d=im.data;for(var i=0;i<d.length;i+=4){var v=Math.random()*255|0;d[i]=d[i+1]=d[i+2]=v;d[i+3]=70}g.putImageData(im,0,0)})();

function gauss(){return (Math.random()+Math.random()+Math.random())/1.5-1}
function shore(x,t){var k=x/W,A=Math.min(H,W*.8);return H*.64+H*.13*k+A*.055*Math.sin(k*4.6+.9)+A*.022*Math.sin(k*11+t*.14)+5*Math.sin(x*.013+t*.38)+H*.012*Math.sin(t*.4)}
function ragged(x,i){return Math.sin(x*.021+i)*.55+Math.sin(x*.053+i*2.1)*.3+Math.sin(x*.137+i*3.7)*.15}
function glint(col){var v=mk(96,24),g=v.getContext('2d');g.translate(48,12);g.scale(1,.25);var p=g.createRadialGradient(0,0,0,0,0,48);p.addColorStop(0,'rgba('+col+',1)');p.addColorStop(.3,'rgba('+col+',.92)');p.addColorStop(.62,'rgba('+col+',.34)');p.addColorStop(1,'rgba('+col+',0)');g.fillStyle=p;g.fillRect(-48,-48,96,96);return v}
function makeWater(){
  var M=SF.M,c2=mk(W*DP,H*DP),g=c2.getContext('2d');g.scale(DP,DP);
  gl.w=glint(M.glint);var T=M.tint||[M.glint,M.glint];gl.k=[gl.w,glint(T[0]),glint(T[1])];
  var v=g.createLinearGradient(0,0,0,H);M.water.forEach(function(q){v.addColorStop(q[0],q[1])});
  g.fillStyle=v;g.fillRect(0,0,W,H);
  g.save();g.translate(W*.5,H*.14);g.scale(.34,1);var r=g.createRadialGradient(0,0,0,0,0,H*.74);
  r.addColorStop(0,M.road[0]);r.addColorStop(.5,M.road[1]);r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(-W*3,-H,W*6,H*2);g.restore();
  var li=M.th==='light';
  for(var i=0,n=W<700?200:460;i<n;i++){var y=H*rand(.16,.8),f=y/H,x=rand(-60,W);g.fillStyle=Math.random()<.55?(li?'rgba(70,130,210,.07)':'rgba(2,10,60,.14)'):(li?'rgba(255,255,255,.16)':'rgba(120,175,255,.07)');g.beginPath();g.ellipse(x,y,rand(30,120)*(.5+f*1.6)*Math.min(1,W/1100+.25),rand(.6,2)*(.5+f*1.6),0,0,7);g.fill()}
  g.globalCompositeOperation='overlay';g.globalAlpha=li?.36:.3;g.fillStyle=g.createPattern(grain,'repeat');g.fillRect(0,0,W,H);
  g.globalCompositeOperation='destination-in';g.globalAlpha=1;var fade=g.createLinearGradient(0,0,0,H*.3);fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(0,0,0,1)');g.fillStyle=fade;g.fillRect(0,0,W,H);
  layer=c2;
}
function populate(){
  var mob=W<700,n=mob?280:720;glints=[];glits=[];specks=[];
  for(var i=0;i<n;i++){var y=H*(.14+Math.pow(Math.random(),.72)*.6),f=y/H,road=Math.random()<.76,u=gauss();glints.push({x:road?W*.5+u*W*(.04+f*.46):rand(0,W),y:y,s:(5+f*24)*rand(.5,1.2),f:rand(.4,1.5),p:rand(0,7),k:Math.random()<.34?(Math.random()<.5?1:2):0})}
  var centers=[.12,.3,.55,.72,.9];
  for(var j=0;j<(mob?150:340);j++){glits.push({x:centers[j%5]*W+gauss()*W*.11,o:Math.pow(Math.random(),1.5)*66+4,z:rand(.7,1.8),ph:rand(0,7),v:rand(.6,2)})}
  for(var k=0;k<(mob?400:960);k++){var o2=Math.pow(Math.random(),2.1)*92;specks.push({x:rand(0,W),o:o2,s:rand(.6,1.5),a:(1-o2/92)*rand(.35,1)})}
}
function line(fn){w.beginPath();for(var x=-10;x<=W+10;x+=9){var y=fn(x);x<0?w.moveTo(x,y):w.lineTo(x,y)}}
function mixC(a,b,u){return [Math.round(lerp(a[0],b[0],u)),Math.round(lerp(a[1],b[1],u)),Math.round(lerp(a[2],b[2],u))].join(',')}
function render(t){
  var M=SF.M,dark=M.th==='dark',u=(prevM&&!reduce)?clamp((t-mixT)/1.7,0,1):1,P=u<1?prevM:M,foam=mixC(P.foam,M.foam,u);
  w.setTransform(DP,0,0,DP,0,0);w.clearRect(0,0,W,H);w.globalCompositeOperation='source-over';
  if(u<1&&layerPrev){w.globalAlpha=1-u;w.drawImage(layerPrev,0,0,W,H)}
  w.globalAlpha=u;w.drawImage(layer,0,0,W,H);w.globalAlpha=1;
  glints.forEach(function(g){var a=Math.sin(t*g.f+g.p);if(a<=.05||g.y>shore(g.x,t)-8)return;w.globalAlpha=Math.pow(a,1.8);var z=g.s,h=z*.25;w.drawImage(gl.k[g.k],g.x-z/2,g.y-h/2,z,h)});
  w.lineWidth=.8;w.strokeStyle='#fff';
  rings=rings.filter(function(r){var a=(t-r.t)/2.6;if(a>=1)return false;for(var i=0;i<2;i++){var q=a-i*.16;if(q<=0)continue;w.globalAlpha=(1-a)*.8;w.beginPath();w.ellipse(r.x,r.y,q*120,q*34,0,0,7);w.stroke()}return true});
  w.globalAlpha=1;
  var s=w.createLinearGradient(0,H*.58,0,H);s.addColorStop(0,'rgb('+mixC(P.sand[0],M.sand[0],u)+')');s.addColorStop(.55,'rgb('+mixC(P.sand[1],M.sand[1],u)+')');s.addColorStop(1,'rgb('+mixC(P.sand[2],M.sand[2],u)+')');
  w.fillStyle=s;line(function(x){return shore(x,t)});w.lineTo(W+10,H);w.lineTo(-10,H);w.closePath();w.fill();
  w.lineCap='round';w.lineJoin='round';
  [[52,.03],[38,.04],[26,.05],[16,.07]].forEach(function(q){w.strokeStyle=dark?'rgba('+(M.shore||'41,130,255')+','+q[1]*2.1+')':'rgba(255,255,255,'+q[1]*2+')';w.lineWidth=q[0];line(function(x){return shore(x,t)});w.stroke()});
  for(var i=0;i<3;i++)(function(i){w.strokeStyle='rgba('+foam+','+(.5-i*.12)+')';w.lineWidth=1.1-i*.16;w.setLineDash([110+i*34,46,38,92+i*12,16,60]);w.lineDashOffset=i*73;line(function(x){var n=x+i*211;return shore(x,t)-(26+i*26)-11*ragged(n*.8,i+t*.05)-5*Math.sin(n*.083+i)});w.stroke()})(i);
  w.setLineDash([]);
  [[40,.16,1],[24,.34,2.4],[12,.62,3.7],[6,1,5.1]].forEach(function(b){w.fillStyle='rgba('+foam+','+b[1]+')';w.beginPath();for(var x=-10;x<=W+10;x+=6){var y=shore(x,t)-b[0]*(.58+.26*ragged(x,b[2]+t*.09));x<0?w.moveTo(x,y):w.lineTo(x,y)}for(var x2=W+10;x2>=-10;x2-=9)w.lineTo(x2,shore(x2,t)+2+1.4*Math.sin(x2*.11+b[2]));w.closePath();w.fill()});
  w.fillStyle='rgb('+foam+')';specks.forEach(function(p){w.globalAlpha=p.a;w.fillRect(p.x,shore(p.x,t)-p.o-5,p.s,p.s)});
  glits.forEach(function(p){var a=Math.sin(t*p.v+p.ph);if(a<=0)return;w.globalAlpha=a*a;w.fillStyle='#fff';w.fillRect(p.x,shore(p.x,t)-p.o,p.z,p.z)});
  w.globalAlpha=1;
}
function sim(){return reduce?12:(performance.now()-oT)/1000}
function frame(now){if(!running)return;render((now-oT)/1000);raf=requestAnimationFrame(frame)}
function start(){if(running||reduce)return;running=true;raf=requestAnimationFrame(frame)}
function stop(){running=false;cancelAnimationFrame(raf)}
function size(){var r=sea.getBoundingClientRect(),a=Math.round(r.width),b=Math.round(r.height);if(!a||!b||(a===W&&b===H))return;W=a;H=b;DP=Math.min(devicePixelRatio||1,1.5);cv.width=W*DP;cv.height=H*DP;makeWater();populate();render(sim())}
cv.addEventListener('click',function(e){var r=cv.getBoundingClientRect(),p={x:e.clientX-r.left,y:e.clientY-r.top},t=sim();if(p.y<shore(p.x,t)){rings.push({x:p.x,y:p.y,t:t});if(rings.length>4)rings.shift();if(reduce)render(t+.8)}});
new IntersectionObserver(function(en){en[0].isIntersecting?start():stop()},{rootMargin:'120px'}).observe(sea);
document.addEventListener('visibilitychange',function(){if(document.hidden)stop();else{var r=sea.getBoundingClientRect();if(r.top<innerHeight&&r.bottom>0)start()}});

SF.ocean={
  size:size,
  /* the water cross-fades from the last mood to the new one */
  onMood:function(prev){if(W&&prev){layerPrev=layer;prevM=prev;mixT=sim();makeWater();if(!running||reduce)render(sim())}}
};
})(window.SF);
