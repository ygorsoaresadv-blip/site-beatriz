// Baixa as fontes do Google Fonts para assets/fonts/ e gera assets/css/fontes.css.
// Só é preciso rodar de novo se mudar a família ou os pesos. Uso: node scripts/baixar-fontes.mjs
import fs from 'node:fs';

const URL_CSS = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=Onest:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const SUBSETS = ['latin', 'latin-ext'];

const css = await fetch(URL_CSS, { headers: { 'User-Agent': UA } }).then(r => r.text());
const blocos = [...css.matchAll(/\/\* ([\w-]+) \*\/\s*(@font-face\s*\{[^}]+\})/g)].filter(m => SUBSETS.includes(m[1]));
fs.mkdirSync('assets/fonts', { recursive: true });

const baixados = new Map();
let saida = '/* Gerado por scripts/baixar-fontes.mjs (fontes OFL auto-hospedadas). */\n';
for (const [, subset, bloco] of blocos) {
  const url = bloco.match(/url\((https:[^)]+)\)/)[1];
  const familia = bloco.match(/font-family: '([^']+)'/)[1].toLowerCase().replace(/\s+/g, '-');
  if (!baixados.has(url)) {
    const nome = `${familia}-${subset}.woff2`;
    const buf = Buffer.from(await fetch(url).then(r => r.arrayBuffer()));
    fs.writeFileSync(`assets/fonts/${nome}`, buf);
    baixados.set(url, nome);
    console.log('baixado', nome, buf.length, 'bytes');
  }
  saida += bloco.replace(url, `/assets/fonts/${baixados.get(url)}`) + '\n';
}
fs.writeFileSync('assets/css/fontes.css', saida);
console.log('assets/css/fontes.css gerado');
