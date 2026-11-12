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
 golden:{name:'golden',th:'light',bg:'#f8f6f2',stars:0,aura:[[216,216,212],[186,204,232]],glint:'255,255,255',foam:[255,255,252],sand:[[238,234,226],[246,243,237],[248,246,242]],road:['rgba(255,255,255,.95)','rgba(255,255,255,.4)'],water:[[0,'rgba(232,231,227,0)'],[.14,'rgba(232,231,227,.6)'],[.3,'#e8e7e3'],[.5,'#cfd3da'],[.68,'#aebccf'],[.9,'#cbd3de']]},
 blue:{name:'blue',th:'dark',bg:'#0b1330',stars:.5,aura:[[62,104,235],[84,120,240]],ribbon:{k:.42,edge:'196,214,255',mid:'96,128,246',top:'70,84,205'},glint:'226,234,255',foam:[220,230,255],sand:[[11,19,48],[11,19,48],[11,19,48]],road:['rgba(130,160,255,.42)','rgba(90,120,255,.16)'],water:[[0,'rgba(10,18,56,0)'],[.15,'rgba(14,24,80,.75)'],[.32,'#1a2a7c'],[.52,'#2c46b4'],[.7,'#4a66d2'],[.9,'#2b3f9e']]},
 night:{name:'night',th:'dark',bg:'#000000',stars:1,aura:[[24,72,240],[24,72,240]],ribbon:{k:.62,edge:'206,228,255',mid:'58,112,255',top:'44,52,196'},glint:'255,255,255',foam:[214,236,255],sand:[[0,0,0],[0,0,0],[0,0,0]],road:['rgba(70,140,255,.42)','rgba(40,110,255,.16)'],water:[[0,'rgba(0,0,0,0)'],[.15,'rgba(3,12,54,.75)'],[.32,'#061a66'],[.52,'#0b3bb0'],[.7,'#1755d0'],[.9,'#0e2a9f']]}
};
return SF;
})();
