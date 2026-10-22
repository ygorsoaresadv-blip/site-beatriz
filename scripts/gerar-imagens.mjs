// Gera favicons (SVG + PNG) e a imagem de compartilhamento assets/img/og.jpg (1200x630)
// a partir do monograma, usando o Chromium do Playwright. Uso: npm run imagens
import { chromium } from 'playwright';
import fs from 'node:fs';

const serif = fs.readFileSync('assets/fonts/instrument-serif-latin.woff2').toString('base64');
const onest = fs.readFileSync('assets/fonts/onest-latin.woff2').toString('base64');
const mono = fs.readFileSync('assets/fonts/jetbrains-mono-latin.woff2').toString('base64');

// Monograma: círculo fino, arco fúcsia, ponto e "bf" em Instrument Serif itálico.
const monograma = (anel, texto, fundo = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<defs><linearGradient id="mg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7cc2"/><stop offset="1" stop-color="#c81f78"/></linearGradient>
<style>@font-face{font-family:"IS";font-style:italic;src:url(data:font/woff2;base64,${serif}) format("woff2")}</style></defs>
${fundo}<circle cx="32" cy="32" r="30.5" fill="none" stroke="${anel}"/>
<path d="M32 1.5a30.5 30.5 0 0 1 26.4 15.2" fill="none" stroke="url(#mg)" stroke-width="1.6" stroke-linecap="round"/>
<circle cx="58.4" cy="16.7" r="2.6" fill="#f0479f"/>
<text x="31" y="42.5" text-anchor="middle" font-family="IS, Instrument Serif, Georgia, serif" font-style="italic" font-size="30" fill="${texto}" letter-spacing="-2">bf</text>
</svg>`;

// favicon.svg: segue o tema do sistema (o favicon não enxerga o botão do site).
const favicon = monograma('rgba(40,16,48,.35)', '#1d1324')
  .replace('</defs>', '</defs><style>@media (prefers-color-scheme:dark){circle[fill="none"]{stroke:rgba(244,232,250,.4)}text{fill:#f4eef7}}</style>');
fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/favicon.svg', favicon);

const browser = await chromium.launch();
const page = await browser.newPage();

// PNGs: fundo escuro arredondado, para ficar legível em qualquer aba ou tela inicial.
const icone = monograma('rgba(244,232,250,.35)', '#f4eef7', '<rect width="64" height="64" rx="14" fill="#0a0810"/>')
  .replace('viewBox="0 0 64 64"', 'viewBox="-4 -4 72 72"').replace('<rect width="64" height="64"', '<rect x="-4" y="-4" width="72" height="72"');
for (const [nome, lado] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await page.setViewportSize({ width: lado, height: lado });
  await page.setContent(`<html><body style="margin:0;background:transparent">${icone.replace('<svg ', `<svg width="${lado}" height="${lado}" `)}</body></html>`);
  await page.waitForTimeout(150);
  await page.screenshot({ path: `assets/img/${nome}`, omitBackground: true });
}

// OG 1200x630: fúcsia sobre fundo escuro, com o monograma e o nome.
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<html><head><style>
@font-face{font-family:Onest;src:url(data:font/woff2;base64,${onest}) format("woff2");font-weight:400 700}
@font-face{font-family:JBM;src:url(data:font/woff2;base64,${mono}) format("woff2")}
body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:Onest;color:#f4eef7;
  background:radial-gradient(70% 90% at 92% 8%,rgba(240,71,159,.55),transparent 60%),radial-gradient(60% 80% at 0% 100%,rgba(139,108,255,.25),transparent 60%),#0a0810}
.orb{position:absolute;right:-90px;top:60px;width:520px;height:520px;border-radius:50%;
  background:radial-gradient(circle at 35% 30%,#ffd1ec 0,#f0479f 22%,#7a1450 55%,transparent 70%);opacity:.85;filter:blur(1px)}
.wrap{position:absolute;left:84px;top:84px;bottom:84px;width:720px;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;align-items:center;gap:22px}.top svg{width:96px;height:96px}
.eb{font-family:JBM;font-size:20px;letter-spacing:.16em;text-transform:uppercase;color:#a99db6}
h1{margin:0;font-size:76px;line-height:1;letter-spacing:-.04em;font-weight:600}
p{margin:18px 0 0;font-size:28px;color:#d9cfe0}
.oab{font-family:JBM;font-size:20px;letter-spacing:.1em;color:#ff7cc2}
</style></head><body><div class="orb"></div><div class="wrap">
<div class="top">${monograma('rgba(244,232,250,.3)', '#f4eef7')}<span class="eb">Advocacia</span></div>
<div><h1>Beatriz Farias Marques</h1><p>Cível · Médico e da saúde · Bancário · Trabalhista · Assessoria empresarial</p></div>
<div class="oab">OAB/SP 557.676 · Online em todo o Brasil</div></div></body></html>`);
await page.waitForTimeout(300);
await page.screenshot({ path: 'assets/img/og.jpg', type: 'jpeg', quality: 86 });
await browser.close();
console.log('Imagens geradas em assets/img/ e public/favicon.svg');
