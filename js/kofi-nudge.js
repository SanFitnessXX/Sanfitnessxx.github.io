/* Ko-fi card, shown on every visit. It follows the page's light/dark theme (html[data-theme]).
   Settings on the script tag:
   data-url, data-title, data-line, data-cta
   data-hue  "ice" (blue, silver; no pink) or "prism" (lilac, blush, sky)
   data-side "left" or "right" */
(function(){
  var s=document.currentScript; if(!s) return;
  var d=s.dataset, side=d.side==='right'?'right':'left';
  var H=d.hue==='prism'
    ? {a:'#c9b6ff',b:'#ffc4e3',c:'#a9d4ff',glow:'200,180,255'}
    : {a:'#cfe0ff',b:'#ffffff',c:'#8fb4ff',glow:'150,185,255'};
  var css=''
  +'.kn{--kn-ink:var(--ink,#2f3a5c);--kn-soft:var(--soft,#6c7896);--kn-bg:rgba(255,255,255,.62);--kn-rim:.75;--kn-pool:.35;'
  +'position:fixed;'+side+':16px;bottom:max(16px,env(safe-area-inset-bottom));z-index:9998;width:min(296px,calc(100vw - 32px));box-sizing:border-box;'
  +'padding:18px 44px 18px 20px;border-radius:18px;font-family:inherit;font-weight:300;font-size:13px;line-height:1.5;letter-spacing:.01em;color:var(--kn-ink);'
  +'background:var(--kn-bg);-webkit-backdrop-filter:blur(18px) saturate(1.3);backdrop-filter:blur(18px) saturate(1.3);'
  +'box-shadow:0 18px 50px -18px rgba('+H.glow+',.55);isolation:isolate;'
  +'opacity:0;transform:translateY(14px);filter:blur(6px);transition:opacity 1s ease,transform 1s cubic-bezier(.2,1,.3,1),filter 1s ease}'
  +':root[data-theme=dark] .kn{--kn-bg:rgba(12,18,48,.42);--kn-pool:.5;box-shadow:0 18px 60px -16px rgba('+H.glow+',.45)}'
  +'.kn::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;opacity:var(--kn-rim);pointer-events:none;'
  +'background:linear-gradient(120deg,'+H.a+','+H.b+' 40%,'+H.c+' 75%,'+H.a+');background-size:220% 220%;'
  +'-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:knr 9s linear infinite}'
  +'.kn::after{content:"";position:absolute;inset:-30% -20% -40%;z-index:-1;pointer-events:none;opacity:var(--kn-pool);'
  +'background:radial-gradient(50% 50% at 30% 60%,rgba('+H.glow+',.55),transparent 70%);filter:blur(18px)}'
  +'.kn.on{opacity:1;transform:none;filter:none}'
  +'.kn.on.fl::before{animation:knr 9s linear infinite,knf 2.6s ease 1}'
  +'@keyframes knr{to{background-position:220% 0}}'
  +'@keyframes knf{0%,100%{opacity:var(--kn-rim)}45%{opacity:1;filter:drop-shadow(0 0 6px '+H.c+')}}'
  +'.kn b{display:block;font-weight:400;font-size:14.5px;letter-spacing:.015em;margin:0 0 3px}'
  +'.kn p{margin:0 0 14px;color:var(--kn-soft)}'
  +'.kn a.kg{position:relative;display:inline-flex;align-items:center;gap:.6em;min-height:38px;padding:0 18px;border-radius:999px;text-decoration:none;font-size:12px;letter-spacing:.1em;color:var(--kn-ink);'
  +'background:linear-gradient(var(--kn-bg),var(--kn-bg)) padding-box,linear-gradient(120deg,'+H.a+','+H.b+','+H.c+') border-box;border:1px solid transparent;'
  +'box-shadow:0 0 18px -4px rgba('+H.glow+',.6);transition:box-shadow .4s ease}'
  +'.kn a.kg:hover,.kn a.kg:focus-visible{box-shadow:0 0 26px -2px rgba('+H.glow+',.9)}'
  +'.kn a.kg i{width:5px;height:5px;border-radius:50%;background:'+H.c+';box-shadow:0 0 8px 2px rgba('+H.glow+',.9)}'
  +'.kn button{position:absolute;top:10px;right:10px;width:32px;height:32px;border:0;background:none;color:var(--kn-soft);font-size:18px;line-height:1;cursor:pointer;border-radius:50%}'
  +'.kn button:hover,.kn button:focus-visible{color:var(--kn-ink)}'
  +'@media (prefers-reduced-motion:reduce){.kn,.kn::before,.kn.on.fl::before{animation:none!important;transition:opacity .3s ease}.kn{filter:none;transform:none}}'
  +'html.calm .kn,html.calm .kn::before,html.calm .kn.on.fl::before{animation:none!important;transition:opacity .3s ease}';
  function show(){
    var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
    var c=document.createElement('aside'); c.className='kn'; c.setAttribute('aria-label','Support on Ko-fi');
    c.innerHTML='<b></b><p></p><a class="kg" target="_blank" rel="noopener"><i aria-hidden="true"></i><span></span></a><button type="button" aria-label="Close">×</button>';
    c.querySelector('b').textContent=d.title||'Enjoying it here?';
    c.querySelector('p').textContent=d.line||'A coffee on Ko-fi keeps it going.';
    var a=c.querySelector('a'); a.href=d.url; a.querySelector('span').textContent=d.cta||'Support on Ko-fi';
    function close(){ c.classList.remove('on'); setTimeout(function(){c.remove()},900) }
    c.querySelector('button').onclick=close; a.addEventListener('click',function(){ setTimeout(close,300) });
    document.body.appendChild(c);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ c.classList.add('on','fl') }) });
  }
  setTimeout(show,4000);
})();
