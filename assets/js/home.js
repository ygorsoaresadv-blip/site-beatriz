/* Home: seletor "Para você / Para sua empresa", animações do hero e esfera WebGL. */
(function(){
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

/* ---------- áreas ---------- */
// Os cartões já vêm renderizados no HTML (para SEO); os dados abaixo servem para a troca de público.
// Mantenha este modelo igual ao de scripts/build.mjs (cartaoArea).
const dataEl = document.getElementById('areas-data');
const AREAS = dataEl ? JSON.parse(dataEl.textContent) : [];
const ICONS = {};
document.querySelectorAll('#areas .area').forEach(c => { ICONS[c.dataset.id] = c.querySelector('.ico').innerHTML; });
const iconTpl = document.getElementById('icones-areas');
if (iconTpl) iconTpl.content.querySelectorAll('[data-id]').forEach(i => { ICONS[i.dataset.id] = i.innerHTML; });
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const areasEl = document.getElementById('areas');
let aud = 'p';
function renderAreas(){
  areasEl.innerHTML = AREAS.filter(a => !a.only || a.only === aud).map(a => {
    const c = a[aud];
    return `<article class="card area ${a.cls}" data-id="${a.id}"><div class="top"><span class="ico">${ICONS[a.id] || ''}</span><span class="tag">${aud === 'p' ? 'Pessoa física' : 'Empresas'}</span></div>
      <h3><a href="${root.dataset.base || ''}/areas/${a.id}">${esc(a.t)}</a></h3><p class="d swap">${esc(c.d)}</p><ul class="swap">${c.i.map(x => `<li>${esc(x)}</li>`).join('')}</ul></article>`;
  }).join('');
  window.BF && window.BF.bindSpot();
}
const segBtns = [...document.querySelectorAll('.seg button')], pill = document.getElementById('segPill');
function movePill(){
  const b = segBtns.find(x => x.getAttribute('aria-pressed') === 'true');
  pill.style.width = b.offsetWidth + 'px';
  pill.style.transform = `translateX(${b.offsetLeft - 4}px)`;
}
segBtns.forEach(b => b.addEventListener('click', () => {
  if (b.dataset.aud === aud) return;
  segBtns.forEach(x => x.setAttribute('aria-pressed', String(x === b))); movePill();
  aud = b.dataset.aud;
  areasEl.querySelectorAll('.swap').forEach(s => s.classList.add('out'));
  setTimeout(() => {
    renderAreas();
    requestAnimationFrame(() => { areasEl.querySelectorAll('.swap').forEach(s => { s.classList.add('out'); requestAnimationFrame(() => s.classList.remove('out')); }); });
  }, reduce ? 0 : 220);
}));
if (pill) { movePill(); window.addEventListener('resize', movePill); document.fonts && document.fonts.ready.then(movePill); }

/* ---------- hero ---------- */
if (window.gsap && !reduce) {
  gsap.to('#heroWord', { xPercent: -22, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.utils.toArray('.chip').forEach((c, i) => gsap.to(c, { y: i % 2 ? 14 : -14, duration: 3 + i, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
}

/* ---------- esfera WebGL ---------- */
const canvas = document.getElementById('orb');
if (!canvas) return;
if (!window.THREE) { canvas.remove(); return; }
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' }); }
catch (e) { canvas.remove(); return; }
document.getElementById('orbFallback').hidden = true;
const small = Math.min(innerWidth, innerHeight) < 700;
renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1, .1, 100); cam.position.z = 8;
const noise = `vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`;
const uni = { uTime: { value: 0 }, uHover: { value: 0 }, uLight: { value: 1 } };
const mat = new THREE.ShaderMaterial({ uniforms: uni, extensions: { derivatives: true },
 vertexShader: noise + `uniform float uTime;uniform float uHover;varying vec3 vPos;varying float vD;
 void main(){float n=snoise(normal*1.1+uTime*.22)*(.32+uHover*.12)+snoise(normal*2.8-uTime*.15)*.07;vD=n;vec3 p=position+normal*n;vec4 mv=modelViewMatrix*vec4(p,1.);vPos=mv.xyz;gl_Position=projectionMatrix*mv;}`,
 fragmentShader: `uniform float uTime;uniform float uLight;varying vec3 vPos;varying float vD;
 void main(){vec3 n=normalize(cross(dFdx(vPos),dFdy(vPos)));vec3 v=normalize(-vPos);float ndv=max(dot(n,v),0.);float fr=pow(1.-ndv,2.4);
 vec3 l1=normalize(vec3(-.5,.8,.6)),l2=normalize(vec3(.9,-.3,.4));
 float d1=max(dot(n,l1),0.),d2=max(dot(n,l2),0.);float sp=pow(max(dot(reflect(-l1,n),v),0.),48.)+pow(max(dot(reflect(-l2,n),v),0.),24.)*.4;
 vec3 irid=vec3(.62,.24,.6)+vec3(.4,.22,.36)*cos(6.2831*(fr*.9+vD*1.4+uTime*.04+vec3(0.,.22,.48)));
 vec3 baseD=mix(vec3(.07,.015,.06),vec3(.86,.16,.52),d1*.85)+vec3(.35,.25,.9)*d2*.35;vec3 baseL=mix(vec3(.62,.09,.40),vec3(1.,.52,.82),d1*.9)+vec3(.35,.25,.9)*d2*.22;vec3 base=mix(baseD,baseL,uLight);
 vec3 col=mix(base,irid,fr*.85)+sp*vec3(1.,.9,.97)+fr*vec3(1.,.35,.75)*.35;
 gl_FragColor=vec4(col,1.);}` });
// Menos subdivisões em telas pequenas: mesma forma, menos custo de GPU.
const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, small ? 64 : 96), mat); scene.add(orb);
/* partículas em órbita */
const N = small ? 1600 : 2600, pos = new Float32Array(N * 3), sz = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const ring = i < N * .7; const a = Math.random() * Math.PI * 2;
  const r = ring ? 2.1 + Math.pow(Math.random(), 1.6) * 1.9 : 2 + Math.random() * 4.5;
  const y = ring ? (Math.random() - .5) * .18 * r : (Math.random() - .5) * 6;
  pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = y; pos[i * 3 + 2] = Math.sin(a) * r; sz[i] = Math.random();
}
const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('aSize', new THREE.BufferAttribute(sz, 1));
const pm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: uni.uTime, uLight: uni.uLight, uPR: { value: renderer.getPixelRatio() } },
 vertexShader: `attribute float aSize;uniform float uTime;uniform float uPR;varying float vA;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;float tw=.55+.45*sin(uTime*1.5+aSize*40.);vA=tw*(.35+aSize*.65);gl_PointSize=(1.+aSize*2.2)*uPR*(7./-mv.z);}`,
 fragmentShader: `uniform float uLight;varying float vA;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;vec3 c=mix(mix(vec3(1.,.55,.85),vec3(.75,.6,1.),vA),mix(vec3(.80,.12,.50),vec3(.42,.28,.85),vA),uLight);gl_FragColor=vec4(c,vA*(1.-d*2.)*mix(.9,.8,uLight));}` });
const pts = new THREE.Points(pg, pm); pts.rotation.x = .42; pts.rotation.z = -.18;
const group = new THREE.Group(); group.add(orb); group.add(pts); scene.add(group);
let mx = 0, my = 0, tx = 0, ty = 0;
window.addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5); }, { passive: true });
const hero = document.querySelector('.hero');
function size(){
  const w = hero.clientWidth, h = hero.clientHeight;
  renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
  const wide = w > 920;
  group.position.set(wide ? 2.5 : 0, wide ? .1 : 1.25, 0); group.scale.setScalar(wide ? .9 : .72);
  canvas.style.opacity = wide ? 1 : .42;
}
size(); window.addEventListener('resize', size);
let visible = true;
new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !reduce) loop(); }).observe(hero);
function applyOrbTheme(){
  const l = root.getAttribute('data-theme') === 'dark' ? 0 : 1;
  uni.uLight.value = l; pm.blending = l ? THREE.NormalBlending : THREE.AdditiveBlending; pm.needsUpdate = true;
  if (reduce) frame();
}
window.addEventListener('themechange', applyOrbTheme);
const clock = new THREE.Clock(); let raf = 0;
function frame(){
  const t = clock.getElapsedTime(); uni.uTime.value = t; mx += (tx - mx) * .04; my += (ty - my) * .04;
  orb.rotation.y = t * .12 + mx * .6; orb.rotation.x = my * .4; pts.rotation.y = t * .05; group.rotation.y = mx * .25; group.rotation.x = my * .12;
  uni.uHover.value += ((Math.abs(tx) + Math.abs(ty)) * .8 - uni.uHover.value) * .03; renderer.render(scene, cam);
}
function loop(){ cancelAnimationFrame(raf); const tick = () => { if (!visible || document.hidden) return; frame(); raf = requestAnimationFrame(tick); }; tick(); }
document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !reduce) loop(); });
applyOrbTheme();
if (reduce) { uni.uTime.value = 3; frame(); } else loop();
})();
