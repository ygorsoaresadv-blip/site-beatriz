// Verificação visual e básica: rode com o site servido em http://localhost:4173 (npm run serve)
// Gera capturas em ./verificacao/ para claro/escuro em desktop e celular, e falha se houver
// rolagem horizontal, erro de console ou violação grave de acessibilidade (axe).
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:4173';
const PAGES = ['/', '/areas/civel', '/areas/saude', '/areas/bancario', '/areas/trabalhista', '/areas/assessoria-empresarial', '/privacidade'];
const VIEWS = [['desktop', { width: 1440, height: 900 }], ['celular', { width: 390, height: 844 }], ['estreito', { width: 320, height: 640 }]];
fs.mkdirSync('verificacao', { recursive: true });
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
let falhas = 0;

for (const [vname, size] of VIEWS) for (const tema of ['light', 'dark']) for (const path of PAGES) {
  const ctx = await browser.newContext({ viewport: size }); // o axe exige um contexto próprio
  const page = await ctx.newPage();
  const erros = [];
  page.on('pageerror', e => erros.push(e.message));
  page.on('console', m => m.type() === 'error' && erros.push(m.text()));
  await page.addInitScript(t => { try { localStorage.setItem('bf-theme', t); } catch {} }, tema);
  const r = await page.goto(BASE + path, { waitUntil: 'networkidle' });
  if (!r || r.status() >= 400) { console.log('FALHA status', path, r && r.status()); falhas++; continue; }
  await page.waitForTimeout(800);
  // Rola até o fim para disparar as animações de entrada (senão o axe mede títulos ainda semitransparentes).
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 80)); } scrollTo({ top: 0, behavior: 'instant' }); });
  await page.waitForTimeout(1500);
  const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  const nome = `${vname}-${tema}-${path.replace(/\W+/g, '_') || 'home'}`;
  await page.screenshot({ path: `verificacao/${nome}.png`, fullPage: true });
  if (sw > iw) { console.log('FALHA rolagem horizontal', nome, sw, iw); falhas++; }
  if (erros.length) { console.log('FALHA console', nome, erros.slice(0, 3)); falhas++; }
  const axe = await new AxeBuilder({ page }).analyze();
  const graves = axe.violations.filter(v => ['serious', 'critical'].includes(v.impact));
  if (graves.length) { console.log('FALHA acessibilidade', nome, graves.map(v => v.id)); falhas++; }
  await ctx.close();
}
await browser.close();
console.log(falhas ? `${falhas} problema(s)` : 'Tudo certo');
process.exit(falhas ? 1 : 0);
