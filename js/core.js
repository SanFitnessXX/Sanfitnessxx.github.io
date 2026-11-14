/* core: shared helpers, the six moods of light, and the one overlay canvas everything draws on */
window.SF=(function(){
'use strict';
var root=document.documentElement,fx=document.getElementById('fx');
var SF={
  root:root,
  reduce:matchMedia('(prefers-reduced-motion: reduce)').matches||(function(){try{return localStorage.getItem('disp-calm')==='1'}catch(e){return false}})(),
  playing:root.classList.contains('play'),
  t0:performance.now(),
  $:function(id){return document.getElementById(id)},
  rand:function(a,b){return a+Math.random()*(b-a)},
  clamp:function(v,a,b){return Math.max(a,Math.min(b,v))},
  lerp:function(a,b,u){return a+(b-a)*u},
  smooth:function(u){return u*u*(3-2*u)},
  mk:function(w,h){var c=document.createElement('canvas');c.width=w;c.height=h;return c},
  theme:function(){return root.dataset.theme},
  M:null,
  pref:root.dataset.pref||'auto',
  ORDER:['dawn','morning','noon','golden','blue','night'],
  fx:fx,c:fx.getContext('2d'),VW:0,VH:0,FD:1
};

/* a needle star: four thin arms, drawn as true vector at any size */
SF.needle=function(g,x,y,r,k){
  var q=r*(k||.09);
  g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x+q,y-q,x+r,y);g.quadraticCurveTo(x+q,y+q,x,y+r);g.quadraticCurveTo(x-q,y+q,x-r,y);g.quadraticCurveTo(x-q,y-q,x,y-r);g.closePath();g.fill();
};

SF.fxSize=function(){
  var a=innerWidth,b=fx.clientHeight||innerHeight,d=Math.min(devicePixelRatio||1,2);
  if(a===SF.VW&&b===SF.VH&&d===SF.FD)return false;
  SF.VW=a;SF.VH=b;SF.FD=d;fx.width=Math.round(a*d);fx.height=Math.round(b*d);return true;
};

SF.MOODS={
 dawn:{name:'dawn',th:'light',bg:'#f7f8fa',stars:0,aura:[[204,214,232],[186,206,238]],glint:'255,255,255',foam:[255,255,255],sand:[[240,241,244],[246,247,249],[247,248,250]],road:['rgba(255,255,255,.95)','rgba(255,255,255,.4)'],water:[[0,'rgba(226,232,241,0)'],[.14,'rgba(226,232,241,.6)'],[.3,'#e4e9f1'],[.5,'#cbd6e8'],[.68,'#b4c5df'],[.9,'#d2dcec']]},
 morning:{name:'morning',th:'light',bg:'#ffffff',stars:0,aura:[[188,212,246],[176,204,242]],glint:'255,255,255',foam:[255,255,255],sand:[[251,244,238],[254,251,249],[255,255,255]],road:['rgba(255,255,255,.95)','rgba(255,255,255,.4)'],water:[[0,'rgba(205,228,250,0)'],[.14,'rgba(205,228,250,.6)'],[.3,'#cce3f8'],[.5,'#aed2f3'],[.68,'#9fc8f0'],[.9,'#bfdcf5']]},
 noon:{name:'noon',th:'light',bg:'#ffffff',stars:0,aura:[[164,198,246],[164,198,246]],glint:'255,255,255',foam:[255,255,255],sand:[[250,241,235],[253,250,248],[255,255,255]],road:['rgba(255,255,255,.95)','rgba(255,255,255,.4)'],water:[[0,'rgba(190,216,245,0)'],[.14,'rgba(190,216,245,.6)'],[.3,'#b7d5f5'],[.5,'#97bfec'],[.68,'#8ab6e9'],[.9,'#abd0f1']]},
 golden:{name:'golden',th:'light',tint:['255,206,226','214,200,255'],bg:'#fbf5f5',stars:0,aura:[[246,200,216],[214,198,240]],glint:'255,240,226',foam:[255,250,248],sand:[[244,232,232],[250,243,242],[252,248,247]],road:['rgba(255,238,214,.95)','rgba(255,206,224,.42)'],water:[[0,'rgba(246,224,232,0)'],[.14,'rgba(246,224,232,.6)'],[.3,'#f1d6e2'],[.5,'#dcc4e6'],[.68,'#bcb0dc'],[.9,'#d4c9ea']]},
 blue:{name:'blue',th:'dark',css:{'--ink':'#f4f2fb','--soft':'#a3a3c4','--line':'rgba(226,218,255,.17)','--mark':'#cdbfff','--pool':'150 126 250','--dusk':'1'},tint:['255,190,222','206,190,255'],shot:['#f4efff','206,190,255'],bg:'#141b4a',stars:.5,aura:[[128,106,230],[170,120,214]],hot:[255,214,232],ribbon:{k:.42,edge:'255,232,240',mid:'160,130,240',top:'84,80,200'},glint:'255,234,226',foam:[240,228,255],shore:'214,160,230',sand:[[20,22,62],[18,20,56],[16,18,52]],road:['rgba(255,214,206,.62)','rgba(226,166,214,.24)'],water:[[0,'rgba(40,34,96,0)'],[.15,'rgba(108,86,160,.75)'],[.32,'#8a74b8'],[.52,'#5f55a2'],[.7,'#433f8c'],[.9,'#2e2f74']]},
 night:{name:'night',th:'dark',css:{'--ink':'#f4f2fb','--soft':'#a3a3c4','--line':'rgba(226,218,255,.17)','--mark':'#cdbfff','--pool':'150 126 250','--dusk':'1'},tint:['255,190,222','206,190,255'],shot:['#f4efff','206,190,255'],bg:'#0a1030',stars:1,aura:[[96,84,228],[140,104,226]],hot:[255,214,234],ribbon:{k:.62,edge:'255,228,238',mid:'138,112,244',top:'60,60,190'},glint:'255,236,230',foam:[236,226,255],shore:'196,150,236',sand:[[13,15,44],[11,13,38],[10,12,34]],road:['rgba(255,206,206,.5)','rgba(214,150,214,.2)'],water:[[0,'rgba(20,20,70,0)'],[.15,'rgba(70,58,130,.75)'],[.32,'#5b4c98'],[.52,'#3d3784'],[.7,'#2c2a70'],[.9,'#1d1f58']]},
 /* cobalt: the original night, kept exactly. Night drifts slowly between these and the twilight moods above */
 blueC:{name:'blue',th:'dark',bg:'#0b1330',stars:.5,css:{'--ink':'#f1f2f4','--soft':'#8d93a0','--line':'rgba(255,255,255,.16)','--mark':'#a9c6ff','--pool':'70 120 255','--dusk':'0'},shot:['#eaf2ff','150,190,255'],hot:[120,170,255],shore:'41,130,255',tint:['226,234,255','226,234,255'],aura:[[62,104,235],[84,120,240]],ribbon:{k:.42,edge:'196,214,255',mid:'96,128,246',top:'70,84,205'},glint:'226,234,255',foam:[220,230,255],sand:[[11,19,48],[11,19,48],[11,19,48]],road:['rgba(130,160,255,.42)','rgba(90,120,255,.16)'],water:[[0,'rgba(10,18,56,0)'],[.15,'rgba(14,24,80,.75)'],[.32,'#1a2a7c'],[.52,'#2c46b4'],[.7,'#4a66d2'],[.9,'#2b3f9e']]},
 nightC:{name:'night',th:'dark',bg:'#000000',stars:1,css:{'--ink':'#f1f2f4','--soft':'#8d93a0','--line':'rgba(255,255,255,.16)','--mark':'#a9c6ff','--pool':'70 120 255','--dusk':'0'},shot:['#eaf2ff','150,190,255'],hot:[120,170,255],shore:'41,130,255',tint:['255,255,255','255,255,255'],aura:[[24,72,240],[24,72,240]],ribbon:{k:.62,edge:'206,228,255',mid:'58,112,255',top:'44,52,196'},glint:'255,255,255',foam:[214,236,255],sand:[[0,0,0],[0,0,0],[0,0,0]],road:['rgba(70,140,255,.42)','rgba(40,110,255,.16)'],water:[[0,'rgba(0,0,0,0)'],[.15,'rgba(3,12,54,.75)'],[.32,'#061a66'],[.52,'#0b3bb0'],[.7,'#1755d0'],[.9,'#0e2a9f']]}
};
/* a mood part-way between two others (u=0 is a, u=1 is b): every number, and every number inside a colour, is eased across */
function hexRgb(v){return typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?'rgb('+parseInt(v.substr(1,2),16)+','+parseInt(v.substr(3,2),16)+','+parseInt(v.substr(5,2),16)+')':v}
function mixAny(a,b,u){
  if(typeof a==='number'&&typeof b==='number')return a+(b-a)*u;
  if(typeof a==='string'&&typeof b==='string'){
    if(a===b)return a;var A=hexRgb(a),B=hexRgb(b),re=/-?\d*\.?\d+/g,na=A.match(re),nb=B.match(re),i=0;
    if(!na||!nb||na.length!==nb.length||A.replace(re,'#')!==B.replace(re,'#'))return u<.5?a:b;
    return A.replace(re,function(){var x=+na[i],y=+nb[i++],z=x+(y-x)*u;return (na[i-1].indexOf('.')<0&&nb[i-1].indexOf('.')<0&&(Math.abs(x)>1||Math.abs(y)>1))?Math.round(z):Math.round(z*1000)/1000});
  }
  if(Array.isArray(a)&&Array.isArray(b))return a.map(function(x,i){return mixAny(x,b[i],u)});
  if(a&&b&&typeof a==='object'){var o={};for(var k in b)o[k]=k in a?mixAny(a[k],b[k],u):b[k];return o}
  return u<.5?a:b;
}
SF.blend=function(a,b,u){return u<=0?a:u>=1?b:mixAny(a,b,u)};
return SF;
})();
