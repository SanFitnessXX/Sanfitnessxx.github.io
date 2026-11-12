/* Ko-fi nudge: a small card shown at most once a week per visitor.
   Settings come from the script tag:
   data-url   Ko-fi link
   data-title first line
   data-line  second line
   data-cta   button text
   data-tone  "dark" or "light"
   data-side  "left" or "right" */
(function(){
  var s=document.currentScript; if(!s) return;
  var KEY='kofi-nudge-seen', WEEK=7*864e5, now=Date.now(), last=0;
  try{ last=+localStorage.getItem(KEY)||0 }catch(e){ return }
  if(now-last<WEEK) return;
  var d=s.dataset, dark=d.tone==='dark', side=d.side==='right'?'right':'left';
  var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var css='.kn{position:fixed;'+side+':16px;bottom:max(16px,env(safe-area-inset-bottom));z-index:9999;width:min(300px,calc(100vw - 32px));box-sizing:border-box;padding:16px 40px 16px 18px;border-radius:14px;'
    +'font-weight:300;font-size:13px;line-height:1.45;letter-spacing:.01em;'
    +(dark?'background:rgba(10,16,40,.86);color:#eef1fb;border:1px solid rgba(190,205,255,.22);box-shadow:0 10px 40px rgba(0,0,0,.45);'
          :'background:rgba(255,255,255,.9);color:#3b3550;border:1px solid rgba(120,110,170,.18);box-shadow:0 10px 36px rgba(90,80,140,.16);')
    +'-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);opacity:0;transform:translateY(12px);transition:opacity .7s ease,transform .7s ease}'
    +'.kn.on{opacity:1;transform:none}'
    +'.kn.on.fl{animation:knf 2.4s ease 1}'
    +'@keyframes knf{0%,100%{box-shadow:'+(dark?'0 10px 40px rgba(0,0,0,.45)':'0 10px 36px rgba(90,80,140,.16)')+'}40%{box-shadow:0 0 0 1px rgba(170,190,255,.55),0 0 34px rgba(160,180,255,.55)}}'
    +'.kn b{display:block;font-weight:400;font-size:14px;margin-bottom:2px}'
    +'.kn p{margin:0 0 12px;opacity:.75}'
    +'.kn a.kg{display:inline-block;padding:8px 16px;border-radius:999px;text-decoration:none;font-size:12px;letter-spacing:.08em;'
    +(dark?'color:#0a1028;background:#eef1fb':'color:#fff;background:linear-gradient(90deg,#b9a3e6,#8fb3ef)')+'}'
    +'.kn button{position:absolute;top:8px;right:8px;width:30px;height:30px;border:0;background:none;color:inherit;opacity:.55;font-size:18px;line-height:1;cursor:pointer;border-radius:50%}'
    +'.kn button:hover{opacity:1}';
  function show(){
    var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
    var c=document.createElement('aside'); c.className='kn'; c.setAttribute('role','complementary'); c.setAttribute('aria-label','Support on Ko-fi');
    c.innerHTML='<b></b><p></p><a class="kg" target="_blank" rel="noopener"></a><button type="button" aria-label="Close">×</button>';
    c.querySelector('b').textContent=d.title||'Enjoying it here?';
    c.querySelector('p').textContent=d.line||'A coffee on Ko-fi keeps it going.';
    var a=c.querySelector('a'); a.href=d.url; a.textContent=d.cta||'Support on Ko-fi';
    function close(){ c.classList.remove('on'); setTimeout(function(){c.remove()},700) }
    c.querySelector('button').onclick=close; a.addEventListener('click',function(){ setTimeout(close,300) });
    document.body.appendChild(c);
    try{ localStorage.setItem(KEY,String(now)) }catch(e){}
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ c.classList.add('on'); if(!rm) c.classList.add('fl') }) });
  }
  setTimeout(show,4000);
})();
