/* Ko-fi panel: a quiet dialog around Ko-fi's own tip panel, so a visitor can tip without leaving the page.
   Any link to the Ko-fi page itself opens it (commission and shop links still go to Ko-fi), including the
   Ko-fi card's button. Cmd/Ctrl/Shift-clicks still open a new tab; browsers without <dialog> keep plain links.
   It follows the page's dark theme (html[data-theme=dark] or html.dark) and calm modes (reduced motion,
   html.calm, html.rm).

   Settings on the script tag:
   data-url     the Ko-fi page, e.g. https://ko-fi.com/name
   data-label   small line above the title (default "Ko-fi")
   data-title   the title; *words in asterisks* are set in the italic serif
   data-line    a sentence or two under the title
   data-out     link under the panel (default "Open Ko-fi in a new tab")
   data-serif   font-family of the title (italic)
   data-sans    font-family of everything else
   data-head    optional upright font-family for the title; then only *words* are serif italic
   data-em      "iri" fills the *words* with the page's var(--iri) gradient
   data-hue     "ice" (blue, silver), "prism" (lilac, blush, sky) or "aurora" (pink, lilac, periwinkle) */
(function () {
  var s = document.currentScript; if (!s) return;
  var d = s.dataset, handle;
  try { handle = new URL(d.url).pathname.split('/').filter(Boolean)[0]; } catch (e) { return; }
  if (!handle || typeof document.createElement('dialog').showModal !== 'function') return;
  handle = handle.toLowerCase();

  var H = {
    ice:    { a: '#cfe0ff', b: '#ffffff', c: '#8fb4ff', glow: '150,185,255', veil: '14,26,60' },
    prism:  { a: '#c9b6ff', b: '#ffc4e3', c: '#a9d4ff', glow: '190,176,255', veil: '30,40,96' },
    aurora: { a: '#dcc4f4', b: '#f9c6e5', c: '#b5cdf9', glow: '205,180,240', veil: '63,51,88' }
  }[d.hue] || { a: '#cfe0ff', b: '#ffffff', c: '#8fb4ff', glow: '150,185,255', veil: '14,26,60' };
  var serif = d.serif || 'Georgia,serif', sans = d.sans || 'system-ui,sans-serif';
  var dark = function (sel) { return ':root[data-theme=dark] ' + sel + ',html.dark ' + sel; };

  var css = ''
  + 'dialog.kp{--kp-bg:var(--bg,var(--paper,#fff));--kp-ink:var(--ink,#2f3a5c);--kp-soft:var(--soft,var(--muted,#6c7896));--kp-line:var(--line,rgba(40,50,90,.16));'
  +   'box-sizing:border-box;width:min(460px,calc(100vw - 20px));max-width:none;max-height:calc(100vh - 20px);max-height:calc(100svh - 20px);margin:auto;padding:0;border:0;border-radius:22px;'
  +   'background:var(--kp-bg);color:var(--kp-ink);overflow:hidden;isolation:isolate;box-shadow:0 30px 80px -24px rgba(' + H.glow + ',.6);'
  +   'font:300 15px/1.6 ' + sans + ';letter-spacing:.01em;text-align:left;-webkit-font-smoothing:antialiased}'
  + 'dialog.kp[open]{display:flex;flex-direction:column;animation:kpIn .34s cubic-bezier(.2,.7,.2,1) both}'
  + 'dialog.kp.kp-closing{animation:kpOut .18s ease both}'
  + 'dialog.kp *,dialog.kp *::before,dialog.kp *::after{box-sizing:border-box}'
  /* a hairline of light around the edge, and one soft pool behind the title */
  + 'dialog.kp::before{content:"";position:absolute;inset:0;z-index:2;border-radius:inherit;padding:1px;pointer-events:none;'
  +   'background:linear-gradient(135deg,' + H.a + ',' + H.b + ' 40%,' + H.c + ' 75%,' + H.a + ');opacity:.85;'
  +   '-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;'
  +   'mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)}'
  + 'dialog.kp::after{content:"";position:absolute;left:-20%;top:-30%;width:90%;height:70%;z-index:-1;pointer-events:none;opacity:.35;'
  +   'background:radial-gradient(50% 50% at 50% 50%,rgba(' + H.glow + ',.55),transparent 70%);filter:blur(24px)}'
  + dark('dialog.kp::after') + '{opacity:.45}'
  + dark('dialog.kp') + '{box-shadow:0 30px 90px -20px rgba(0,0,0,.7),0 0 60px -30px rgba(' + H.glow + ',.6)}'
  + 'dialog.kp::backdrop{background:rgba(' + H.veil + ',.26);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px)}'
  + dark('dialog.kp::backdrop') + '{background:rgba(0,2,12,.6)}'
  + '@keyframes kpIn{from{opacity:0;transform:translateY(12px)}}'
  + '@keyframes kpOut{to{opacity:0;transform:translateY(8px)}}'
  /* title */
  + '.kp-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:24px 24px 16px}'
  + '.kp-label{display:block;font:300 11px/1.4 ' + sans + ';letter-spacing:.34em;text-transform:uppercase;color:var(--kp-soft)}'
  + '.kp-head h2{margin:8px 0;font:italic ' + (d.weight || 200) + ' 30px/1.12 ' + serif + ';letter-spacing:0;color:var(--kp-ink);text-transform:none}'
  + (d.head ? '.kp-head h2{font:200 28px/1.15 ' + d.head + ';letter-spacing:-.03em}.kp-head h2 em{font:italic 300 1em/1 ' + serif + '}' : '.kp-head h2 em{font-style:italic}')
  + (d.em === 'iri' ? '.kp-head h2 em{background:var(--iri);-webkit-background-clip:text;background-clip:text;color:transparent}' : '')
  + '.kp-head p{margin:0;max-width:28em;font-size:15px;color:var(--kp-soft)}'
  + '.kp-x{flex:none;width:38px;height:38px;margin:0;padding:0;border-radius:50%;border:1px solid var(--kp-line);background:none;color:var(--kp-ink);display:grid;place-items:center;cursor:pointer;transition:border-color .3s,box-shadow .3s}'
  + '.kp-x svg{fill:none;stroke:currentColor;stroke-width:1.1}'
  + '.kp-x:hover,.kp-x:focus-visible{border-color:' + H.c + ';box-shadow:0 0 14px -4px rgba(' + H.glow + ',.9)}'
  + 'dialog.kp :focus-visible{outline:1px solid currentColor;outline-offset:4px}'
  /* Ko-fi's own panel, on the light grey it is designed for */
  + '.kp-frame{position:relative;flex:1 1 auto;min-height:380px;overflow:auto;-webkit-overflow-scrolling:touch;margin:0 14px;border-radius:14px;background:#f9f9f9}'
  + '.kp-frame iframe{display:block;position:relative;z-index:1;width:100%;height:712px;border:0;padding:4px;background:transparent}'
  + '.kp-frame p{position:absolute;left:0;right:0;top:46%;margin:0;padding:0 24px;text-align:center;font:300 11px/1.6 ' + sans + ';letter-spacing:.24em;text-transform:uppercase;color:#5a6690}'
  + '.kp-frame .kp-slow{display:none;top:54%;letter-spacing:.06em;text-transform:none;font-size:13px}'
  + '.kp-frame.kp-loaded .kp-wait{display:none}'
  + '.kp-frame.kp-late:not(.kp-loaded) .kp-slow{display:block}'
  /* quiet way out, underlined by a hairline that fills with light */
  + '.kp-out{align-self:center;position:relative;display:inline-flex;align-items:center;gap:10px;margin:14px 0 18px;padding:10px 0 9px;'
  +   'font:300 11px/1 ' + sans + ';letter-spacing:.3em;text-transform:uppercase;color:var(--kp-ink);text-decoration:none}'
  + '.kp-out::after,.kp-out::before{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:var(--kp-line)}'
  + '.kp-out::before{z-index:1;background:linear-gradient(90deg,' + H.a + ',' + H.b + ',' + H.c + ');transform:scaleX(0);transform-origin:left;transition:transform .7s cubic-bezier(.2,.7,.2,1)}'
  + '.kp-out:hover::before,.kp-out:focus-visible::before{transform:scaleX(1)}'
  + '.kp-out svg{width:11px;height:11px;flex:none;fill:none;stroke:currentColor;stroke-width:1;transition:transform .45s cubic-bezier(.2,.7,.2,1)}'
  + '.kp-out:hover svg{transform:translate(2px,-2px)}'
  + '@media (max-width:520px){dialog.kp{width:calc(100vw - 12px);max-height:calc(100vh - 12px);max-height:calc(100svh - 12px);border-radius:18px}'
  +   '.kp-head{padding:20px 18px 12px}.kp-head h2{font-size:28px}.kp-frame{margin:0 8px}}'
  + '@media (prefers-reduced-motion:reduce){dialog.kp[open],dialog.kp.kp-closing{animation:none}}'
  + 'html.calm dialog.kp[open],html.calm dialog.kp.kp-closing,html.rm dialog.kp[open],html.rm dialog.kp.kp-closing{animation:none}';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var dlg = document.createElement('dialog');
  dlg.className = 'kp'; dlg.id = 'kofi-panel'; dlg.lang = 'en'; dlg.setAttribute('aria-labelledby', 'kp-title');
  dlg.innerHTML = '<div class="kp-head"><div><span class="kp-label"></span><h2 id="kp-title"></h2><p></p></div>'
    + '<button class="kp-x" type="button" aria-label="Close"><svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><path d="M2 2l10 10M12 2 2 12"/></svg></button></div>'
    + '<div class="kp-frame"><p class="kp-wait">Opening Ko-fi…</p><p class="kp-slow">Ko-fi is taking a while here. The link below opens it directly.</p></div>'
    + '<a class="kp-out" target="_blank" rel="noopener"><span></span><svg viewBox="0 0 11 11" width="11" height="11" aria-hidden="true"><path d="M1.5 9.5 9.5 1.5M3.5 1.5h6v6"/></svg></a>';
  dlg.querySelector('.kp-label').textContent = d.label || 'Ko-fi';
  var h2 = dlg.querySelector('h2');
  (d.title || 'Support me on Ko-fi').split(/\*([^*]+)\*/).forEach(function (part, i) {
    if (!part) return;
    if (i % 2) { var em = document.createElement('em'); em.textContent = part; h2.appendChild(em); }
    else h2.appendChild(document.createTextNode(part));
  });
  var line = dlg.querySelector('.kp-head p');
  if (d.line) line.textContent = d.line; else line.remove();
  var out = dlg.querySelector('.kp-out'); out.href = d.url; out.querySelector('span').textContent = d.out || 'Open Ko-fi in a new tab';
  document.body.appendChild(dlg);

  var root = document.documentElement, box = dlg.querySelector('.kp-frame'), x = dlg.querySelector('.kp-x');
  var opener = null, framed = false, loaded = false, timer = 0, closing = false, saved = null;
  function calm() {
    return root.classList.contains('calm') || root.classList.contains('rm') ||
      (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function isTip(a) {
    if (a.hasAttribute('data-kofi')) return true;
    if (a.hostname.replace(/^www\./, '') !== 'ko-fi.com') return false;
    var p = a.pathname.split('/').filter(Boolean);
    return p.length === 1 && p[0].toLowerCase() === handle;
  }
  function open(trigger) {
    opener = trigger || document.activeElement;
    saved = { o: root.style.overflow, p: root.style.paddingRight };
    var gap = window.innerWidth - root.clientWidth; // the page keeps its place when its scrollbar goes
    root.style.overflow = 'hidden'; if (gap > 0) root.style.paddingRight = gap + 'px';
    closing = false; dlg.classList.remove('kp-closing');
    dlg.showModal();
    if (!framed) {
      framed = true;
      var f = document.createElement('iframe');
      f.title = 'Ko-fi tip panel for ' + handle;
      f.setAttribute('allow', 'payment');
      f.addEventListener('load', function () { loaded = true; clearTimeout(timer); box.classList.add('kp-loaded'); });
      f.src = d.src || 'https://ko-fi.com/' + handle + '/?hidefeed=true&widget=true&embed=true&preview=true';
      box.appendChild(f);
      timer = setTimeout(function () { if (!loaded) box.classList.add('kp-late'); }, 9000);
    }
    x.focus();
    document.dispatchEvent(new CustomEvent('kofipanel', { detail: { open: true } }));
  }
  function close() {
    if (!dlg.open || closing) return;
    closing = true; dlg.classList.add('kp-closing');
    setTimeout(function () { if (dlg.open) dlg.close(); }, calm() ? 0 : 180);
  }
  // Tidy up however the dialog closed (button, backdrop, Escape, or the browser closing it on a second Escape).
  dlg.addEventListener('close', function () {
    closing = false; dlg.classList.remove('kp-closing');
    if (saved) { root.style.overflow = saved.o; root.style.paddingRight = saved.p; saved = null; }
    document.dispatchEvent(new CustomEvent('kofipanel', { detail: { open: false } }));
    if (opener && opener.focus && document.contains(opener)) opener.focus({ preventScroll: true });
  });
  dlg.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
  dlg.addEventListener('click', function (e) {
    if (e.target !== dlg) return;
    var r = dlg.getBoundingClientRect(); // only a click outside the card (on the dimmed page) closes it
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close();
  });
  x.addEventListener('click', close);
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || dlg.contains(a) || !isTip(a)) return;
    e.preventDefault(); open(a);
  });
})();
