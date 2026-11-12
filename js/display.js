/* Display menu: a small round button (bottom right) that opens a panel with
   Light (site-defined via window.__display), Motion, Text size and Contrast.
   Stored per visitor: disp-calm, disp-text, disp-contrast.
   The site sets window.__display = {themes:[[value,label],...], get:fn, set:fn(value)} */
(function(){
  var R=document.documentElement,K={calm:'disp-calm',text:'disp-text',hc:'disp-contrast'};
  function g(k){try{return localStorage.getItem(k)}catch(e){return null}}
  function p(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}
  var SIZES={std:'',lg:'112.5%',xl:'125%'};
  function applyPrefs(){
    R.classList.toggle('calm',g(K.calm)==='1');
    R.classList.toggle('hc',g(K.hc)==='1');
    R.style.fontSize=SIZES[g(K.text)||'std']||'';
  }
  applyPrefs();

  var css=''
  +'.dm-b{position:fixed;right:16px;bottom:max(16px,env(safe-area-inset-bottom));z-index:9999;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;cursor:pointer;'
  +'color:var(--ink,#2f3a5c);background:color-mix(in srgb,var(--bg,#fff) 55%,transparent);border:1px solid color-mix(in srgb,var(--ink,#2f3a5c) 18%,transparent);'
  +'-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 0 22px -6px rgba(150,185,255,.6);transition:box-shadow .4s}'
  +'.dm-b:hover,.dm-b:focus-visible{box-shadow:0 0 28px -2px rgba(150,185,255,.9)}'
  +'.dm-b svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.4;stroke-linecap:round}'
  +'.dm{position:fixed;right:16px;bottom:calc(max(16px,env(safe-area-inset-bottom)) + 56px);z-index:9999;width:min(300px,calc(100vw - 32px));box-sizing:border-box;padding:18px 18px 14px;border-radius:18px;'
  +'font-family:inherit;font-size:13px;font-weight:300;color:var(--ink,#2f3a5c);background:color-mix(in srgb,var(--bg,#fff) 72%,transparent);'
  +'border:1px solid color-mix(in srgb,var(--ink,#2f3a5c) 14%,transparent);-webkit-backdrop-filter:blur(20px) saturate(1.3);backdrop-filter:blur(20px) saturate(1.3);'
  +'box-shadow:0 20px 60px -20px rgba(120,150,230,.55);opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .35s,transform .35s}'
  +'.dm.on{opacity:1;transform:none;pointer-events:auto}'
  +'.dm h2{margin:0 0 12px;font:inherit;font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:var(--soft,#6c7896)}'
  +'.dm fieldset{border:0;margin:0 0 12px;padding:0}'
  +'.dm legend{padding:0;margin:0 0 6px;font-size:12.5px}'
  +'.dm .seg{display:flex;gap:4px;padding:3px;border-radius:999px;border:1px solid color-mix(in srgb,var(--ink,#2f3a5c) 14%,transparent)}'
  +'.dm .seg button{flex:1;min-height:34px;border:0;border-radius:999px;background:none;color:var(--soft,#6c7896);font:inherit;font-size:12px;cursor:pointer}'
  +'.dm .seg button[aria-pressed=true]{color:var(--ink,#2f3a5c);background:color-mix(in srgb,var(--ink,#2f3a5c) 9%,transparent);box-shadow:0 0 14px -4px rgba(150,185,255,.8)}'
  +'.dm .seg button:focus-visible,.dm-b:focus-visible,.dm-x:focus-visible{outline:2px solid var(--mark,#5f86d6);outline-offset:2px}'
  +'.dm-x{position:absolute;top:10px;right:10px;width:32px;height:32px;border:0;border-radius:50%;background:none;color:var(--soft,#6c7896);font-size:18px;cursor:pointer}'
  +'.dm small{display:block;color:var(--soft,#6c7896);font-size:11px;margin-top:2px}'
  +'html.calm *,html.calm *::before,html.calm *::after{animation-duration:.001s!important;animation-iteration-count:1!important;transition-duration:.001s!important;scroll-behavior:auto!important}'
  +'html.hc{--soft:var(--ink)}html.hc body{text-shadow:none}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var b=document.createElement('button');b.type='button';b.className='dm-b';
  b.setAttribute('aria-label','Display settings');b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls','dm');
  b.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h9M15 6h2M3 14h2M8 14h9"/><circle cx="13.5" cy="6" r="1.6"/><circle cx="6.5" cy="14" r="1.6"/></svg>';
  var m=document.createElement('div');m.className='dm';m.id='dm';m.setAttribute('role','dialog');m.setAttribute('aria-label','Display settings');

  function seg(name,legend,opts,cur,on,note){
    var f=document.createElement('fieldset');f.innerHTML='<legend>'+legend+'</legend><div class="seg" role="group"></div>'+(note?'<small>'+note+'</small>':'');
    var w=f.querySelector('.seg');
    opts.forEach(function(o){var x=document.createElement('button');x.type='button';x.textContent=o[1];x.dataset.v=o[0];
      x.setAttribute('aria-pressed',String(o[0]===cur()));
      x.onclick=function(){on(o[0]);w.querySelectorAll('button').forEach(function(y){y.setAttribute('aria-pressed',String(y.dataset.v===cur()))})};w.appendChild(x)});
    return f;
  }
  function build(){
    m.innerHTML='<h2>Display</h2><button type="button" class="dm-x" aria-label="Close">×</button>';
    var D=window.__display;
    if(D) m.appendChild(seg('light','Light',D.themes,D.get,D.set));
    m.appendChild(seg('motion','Motion',[['full','Full'],['calm','Calm']],function(){return g(K.calm)==='1'?'calm':'full'},
      function(v){p(K.calm,v==='calm'?'1':null);applyPrefs();if(D&&D.motion)D.motion(v==='calm')},'Calm stops moving light and animation.'));
    m.appendChild(seg('text','Text size',[['std','Standard'],['lg','Larger'],['xl','Largest']],function(){return g(K.text)||'std'},
      function(v){p(K.text,v==='std'?null:v);applyPrefs()}));
    m.appendChild(seg('contrast','Contrast',[['std','Standard'],['hc','Higher']],function(){return g(K.hc)==='1'?'hc':'std'},
      function(v){p(K.hc,v==='hc'?'1':null);applyPrefs()}));
    m.querySelector('.dm-x').onclick=function(){toggle(false)};
  }
  function toggle(open){
    if(open)build();
    m.classList.toggle('on',open);b.setAttribute('aria-expanded',String(open));
    if(open)setTimeout(function(){var f=m.querySelector('[aria-pressed=true]');f&&f.focus()},50);else b.focus();
  }
  b.onclick=function(){toggle(!m.classList.contains('on'))};
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&m.classList.contains('on'))toggle(false)});
  document.addEventListener('click',function(e){if(e.isTrusted&&m.classList.contains('on')&&!m.contains(e.target)&&e.target!==b&&!b.contains(e.target))toggle(false)});
  document.body.appendChild(m);document.body.appendChild(b);
})();
