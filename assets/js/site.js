/* Comportamentos compartilhados por todas as páginas: tema, menu, copiar, brilho do cursor,
   spotlight dos cartões e animações de entrada (GSAP, se carregado). */
(function(){
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const CFG = window.BF_CONFIG || {};
const root = document.documentElement;

/* ---------- tema (claro por padrão) ---------- */
const tb = document.getElementById('themeBtn');
function setTheme(t, save){
  root.setAttribute('data-theme', t);
  tb.setAttribute('aria-pressed', String(t === 'dark'));
  tb.setAttribute('aria-label', t === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'dark' ? '#0a0810' : '#fbf8fc');
  if (save) { try { localStorage.setItem('bf-theme', t); } catch (e) {} }
  window.dispatchEvent(new Event('themechange'));
}
setTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);
tb.addEventListener('click', () => setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true));

/* ---------- spotlight nos cartões ---------- */
function bindSpot(){
  document.querySelectorAll('.card').forEach(c => {
    if (c._s) return; c._s = 1;
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
}
bindSpot();
window.BF = { bindSpot, reduce };

/* ---------- brilho do cursor ---------- */
const glow = document.querySelector('.cursor-glow');
if (glow && !reduce) window.addEventListener('pointermove', e => { glow.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`; }, { passive: true });

/* ---------- nav ---------- */
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
const mb = document.getElementById('menuBtn'), mm = document.getElementById('mobileMenu');
function closeMenu(){ mm.hidden = true; mb.setAttribute('aria-expanded', 'false'); mb.setAttribute('aria-label', 'Abrir menu'); }
mb.addEventListener('click', () => {
  const abrir = mm.hidden;
  mm.hidden = !abrir;
  mb.setAttribute('aria-expanded', String(abrir));
  mb.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
  if (abrir) { const a = mm.querySelector('a'); a && a.focus(); }
});
mm.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mm.hidden) { closeMenu(); mb.focus(); } });

/* ---------- copiar ---------- */
function sel(b){ const r = document.createRange(); r.selectNodeContents(b.parentNode.firstChild); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
document.querySelectorAll('.copy').forEach(b => b.addEventListener('click', () => {
  const t = b.dataset.copy;
  const done = () => { b.textContent = 'copiado'; setTimeout(() => b.textContent = 'copiar', 1600); };
  try { navigator.clipboard.writeText(t).then(done, () => sel(b)); } catch (e) { sel(b); }
}));

/* ---------- Cloudflare Web Analytics (sem cookies), só se houver token ---------- */
if (CFG.analyticsToken) {
  const s = document.createElement('script');
  s.defer = true;
  s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  s.setAttribute('data-cf-beacon', JSON.stringify({ token: CFG.analyticsToken }));
  document.body.appendChild(s);
}

/* ---------- animações ---------- */
function splitWords(el){
  const walk = n => {
    [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const f = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(w => {
          if (!w) return;
          if (/^\s+$/.test(w)) f.appendChild(document.createTextNode(w));
          else { const s = document.createElement('span'); s.className = 'word'; s.textContent = w; f.appendChild(s); }
        });
        c.replaceWith(f);
      } else if (c.nodeType === 1) walk(c);
    });
  };
  walk(el);
  return el.querySelectorAll('.word');
}
if (window.gsap && !reduce) {
  gsap.registerPlugin(ScrollTrigger);
  const sl = document.querySelector('.split-load');
  if (sl) gsap.from(splitWords(sl), { yPercent: 40, opacity: .15, duration: 1, ease: 'expo.out', stagger: .06, delay: .1 });
  const intro = document.querySelectorAll('.hero-copy .lead,.hero-ctas,.hero-meta,.page-hero .lead,.page-hero .hero-ctas');
  if (intro.length) gsap.from(intro, { y: 16, opacity: .3, duration: .9, ease: 'power3.out', stagger: .08, delay: .35 });
  document.querySelectorAll('.split').forEach(el => {
    gsap.from(splitWords(el), { yPercent: 35, opacity: .2, duration: .9, ease: 'expo.out', stagger: .04, scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  gsap.utils.toArray('.card,.step,.cred,.commit>div,.faq details,.docs li').forEach(el => {
    gsap.from(el, { y: 28, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
  });
  if (document.getElementById('stepsFill'))
    gsap.to('#stepsFill', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#steps', start: 'top 70%', end: 'bottom 60%', scrub: true } });
  /* botões magnéticos */
  if (matchMedia('(pointer:fine)').matches) document.querySelectorAll('.magnetic').forEach(b => {
    b.addEventListener('pointermove', e => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .18, y: (e.clientY - r.top - r.height / 2) * .3, duration: .4, ease: 'power3.out' }); });
    b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.4)' }));
  });
}
})();
