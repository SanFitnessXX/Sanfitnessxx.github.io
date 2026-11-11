/* films: one plays at a time, the others wait as slivers; a small caption names the one playing */
(function(SF){
'use strict';
var $=SF.$,films=[].slice.call(document.querySelectorAll('.film')),cap=document.querySelector('.cap'),capName=$('capName'),capNo=$('capNo');
var cur=0,paused=SF.reduce,picked=false,inView=true,begun=false,capT=0;
function vid(i){return films[i].querySelector('video')}
function two(n){return (n<10?'0':'')+n}
function caption(now){
  var set=function(){capName.textContent=films[cur].dataset.name;capNo.textContent=two(cur+1)+' / '+two(films.length);cap.classList.remove('swap')};
  clearTimeout(capT);if(now||SF.reduce){set();return}
  cap.classList.add('swap');capT=setTimeout(set,420);
}
function mark(){films.forEach(function(f,i){var on=i===cur;f.classList.toggle('on',on);f.setAttribute('aria-pressed',on?'true':'false');f.setAttribute('aria-label',f.dataset.name+(on?(paused?'. Play':'. Pause'):'. Open'));if(!on)f.querySelector('i').style.transform='scaleX(0)'})}
function play(){if(paused||!inView||!begun||document.hidden)return;var p=vid(cur).play();if(p)p.catch(function(e){if(e&&e.name==='NotAllowedError'){paused=true;mark()}})}
function open(i){if(i!==cur){var old=vid(cur);old.pause();try{old.currentTime=0}catch(e){}}cur=i;mark();caption();play();vid((cur+1)%films.length).preload='auto'}
films.forEach(function(f,i){
  f.addEventListener('click',function(){if(i===cur){paused=!paused;if(paused)vid(cur).pause();else{begun=true;play()}mark();return}picked=true;paused=false;begun=true;open(i)});
  vid(i).addEventListener('ended',function(){if(i!==cur)return;if(picked){this.currentTime=0;play()}else open((cur+1)%films.length)});
});
mark();caption(true);
setTimeout(function(){begun=true;play()},SF.playing?3300:120);
new IntersectionObserver(function(en){inView=en[0].isIntersecting;if(inView)play();else vid(cur).pause()},{threshold:.15}).observe($('films'));
document.addEventListener('visibilitychange',function(){if(document.hidden)vid(cur).pause();else play()});

SF.films={frame:function(){var v=vid(cur);if(v.duration)films[cur].querySelector('i').style.transform='scaleX('+(v.currentTime/v.duration)+')'}};
})(window.SF);
