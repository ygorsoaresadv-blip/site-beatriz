// Gera o site estático em dist/ a partir de src/ (sem dependências: só Node).
// - src/layout.html é o esqueleto comum; src/partials/ tem menu e rodapé (iguais em todas as páginas).
// - src/pages/**.html começa com um comentário de cabeçalho (titulo, descricao, scripts...).
// - Domínio, e-mail e telefone vêm de assets/js/config.js; áreas e FAQ vêm de content/.
// Uso: node scripts/build.mjs   (ou npm run build)
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const r = (...p) => path.join(RAIZ, ...p);
const ler = p => fs.readFileSync(r(p), 'utf8');
const DIST = r('dist');

/* ---------- configuração (mesma fonte que o navegador usa) ---------- */
const ctx = { window: {} };
vm.runInNewContext(ler('assets/js/config.js'), ctx);
const CFG = ctx.window.BF_CONFIG;
const AREAS = JSON.parse(ler('content/areas.json'));
const FAQ = JSON.parse(ler('content/faq.json'));

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- ícones ---------- */
const ICONE_WA = '<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.3Z"/>';
const ICONE_SETA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h14M13 6l6 6-6 6"/></svg>';
const ICONES_AREAS = {
  civel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 3v18M5 7h14M7 7l-3 7a3 3 0 0 0 6 0L7 7Zm10 0-3 7a3 3 0 0 0 6 0l-3-7ZM8 21h8"/></svg>',
  saude: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 12h4l2-5 4 10 2-5h6"/></svg>',
  bancario: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 9 12 4l9 5M5 10v7M9.5 10v7M14.5 10v7M19 10v7M3 20h18"/></svg>',
  'assessoria-empresarial': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/><rect x="15" y="3" width="6" height="6" rx="1.5"/><path d="M9 6h6M6 9v6a3 3 0 0 0 3 3h6"/></svg>',
  trabalhista: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg>'
};
// Largura de cada cartão na grade da home (igual ao protótipo).
const CLASSE_AREA = { civel: 'wide', saude: 'narrow', bancario: 'narrow', trabalhista: 'wide', 'assessoria-empresarial': 'full' };

/* ---------- blocos reaproveitados ---------- */
// Mesmo modelo de assets/js/home.js (renderAreas).
function cartaoArea(a, aud){
  const c = aud === 'p' ? a.pessoa : a.empresa;
  return `      <article class="card area ${CLASSE_AREA[a.id]}" data-id="${a.id}"><div class="top"><span class="ico">${ICONES_AREAS[a.id]}</span><span class="tag">${aud === 'p' ? 'Pessoa física' : 'Empresas'}</span></div>
        <h3><a href="/areas/${a.id}">${esc(a.nome)}</a></h3><p class="d swap">${esc(c.descricao)}</p><ul class="swap">${c.itens.map(x => `<li>${esc(x)}</li>`).join('')}</ul></article>`;
}
const areasCartoes = AREAS.filter(a => a.somente !== 'empresa').map(a => cartaoArea(a, 'p')).join('\n');
const areasDados = AREAS.map(a => ({
  id: a.id, cls: CLASSE_AREA[a.id], t: a.nome, only: a.somente === 'empresa' ? 'e' : undefined,
  p: a.pessoa && { d: a.pessoa.descricao, i: a.pessoa.itens },
  e: a.empresa && { d: a.empresa.descricao, i: a.empresa.itens }
}));
const iconesTemplate = `<template id="icones-areas">${Object.entries(ICONES_AREAS).map(([k, v]) => `<i data-id="${k}">${v}</i>`).join('')}</template>`;

const PASSOS = [
  ['01 · Escuta', 'Primeira conversa', 'Você conta o que aconteceu, por vídeo, WhatsApp ou presencialmente em Alphaville. Saem dali as dúvidas respondidas e uma lista do que separar.'],
  ['02 · Diagnóstico', 'Análise técnica e de dados', 'Leitura dos documentos, da legislação e de como os tribunais vêm decidindo casos parecidos. Você recebe por escrito os caminhos possíveis, com riscos e prazos.'],
  ['03 · Estratégia', 'Plano e contrato claros', 'Escolhido o caminho, o contrato de honorários define o escopo, as etapas e o que esperar de cada uma. Sem letra miúda.'],
  ['04 · Acompanhamento', 'Você sempre sabe em que pé está', 'Cada movimentação é traduzida para linguagem simples e enviada a você. Prazos e documentos ficam organizados em sistema.'],
  ['05 · Encerramento', 'Prestação de contas', 'Ao fim, um resumo do que foi feito, valores recebidos e repassados com recibo, e a guarda dos documentos pelo tempo que a lei exige.']
];
const passosMetodo = PASSOS.map(([n, t, p]) => `      <div class="step"><span class="n">${n}</span><h3>${t}</h3><p>${p}</p></div>`).join('\n');

// Seção "Como funciona o atendimento" das páginas de área (os mesmos 5 passos do método da home).
const comoFunciona = `<section class="page-section gutter">
  <div class="container">
    <div class="head"><div><span class="eyebrow">Como funciona</span><h2 class="split">Do primeiro contato ao encerramento.</h2></div></div>
    <div class="steps page-steps" id="steps">
      <span class="fill" id="stepsFill"></span>
${passosMetodo}
    </div>
  </div>
</section>`;

function faqHtml(lista, primeiraAberta = true){
  return lista.map((f, i) => `      <details${i === 0 && primeiraAberta ? ' open' : ''}><summary>${esc(f.pergunta)}<span class="pm" aria-hidden="true">+</span></summary><p class="ans">${esc(f.resposta)}</p></details>`).join('\n');
}

function ctaFinal({ titulo = 'Vamos entender o seu caso com calma.', triagem = '#triagem' } = {}){
  return `<!-- CTA FINAL -->
<section class="gutter pb-20">
  <div class="container final">
    <span class="eyebrow">Contato</span>
    <h2 class="split">${titulo}</h2>
    <div class="row">
      <a class="btn btn-primary magnetic" href="${triagem}">Contar meu caso</a>
      <a class="btn btn-ghost magnetic wa-link" href="https://wa.me/{{whatsapp}}" target="_blank" rel="noopener">Abrir o WhatsApp</a>
    </div>
    <div class="contact-line">
      <div>WhatsApp<b>{{whatsappExibicao}} <button class="copy" data-copy="${CFG.whatsapp.replace(/^55/, '')}" type="button" aria-label="Copiar número do WhatsApp">copiar</button></b></div>
      <div>E-mail<b>{{email}} <button class="copy" data-copy="{{email}}" type="button" aria-label="Copiar e-mail">copiar</button></b></div>
      <div>Atendimento<b>Online · Alphaville (SP) com hora marcada</b></div>
    </div>
  </div>
</section>`;
}

const jsonld = () => `<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Attorney',
  name: 'Beatriz Farias Marques Advocacia',
  url: `https://${CFG.dominio}/`,
  image: `https://${CFG.dominio}/assets/img/og.jpg`,
  telephone: '+55 ' + CFG.whatsappExibicao.replace(/[()]/g, '').trim(),
  email: CFG.email,
  areaServed: 'BR',
  knowsAbout: ['Direito Cível', 'Direito Médico e da Saúde', 'Direito Bancário', 'Direito do Trabalho', 'Legal Operations'],
  founder: { '@type': 'Person', name: 'Beatriz Farias Marques dos Santos', sameAs: [CFG.linkedin] },
  identifier: 'OAB/SP 557.676'
}, null, 2)}
</script>`;

const SCRIPTS = {
  three: '/assets/vendor/three.min.js',
  gsap: '/assets/vendor/gsap.min.js',
  scrolltrigger: '/assets/vendor/ScrollTrigger.min.js',
  site: '/assets/js/site.js',
  home: '/assets/js/home.js',
  triagem: '/assets/js/triagem.js'
};

/* ---------- montagem ---------- */
const layout = ler('src/layout.html');
const nav = ler('src/partials/nav.html');
const rodape = ler('src/partials/rodape.html');

function substituir(html, dados){
  // Duas passadas: blocos podem conter marcadores simples ({{whatsapp}} etc.).
  for (let i = 0; i < 2; i++) html = html.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in dados ? dados[k] : m));
  return html;
}

const versoes = {};
const versao = p => versoes[p] ??= crypto.createHash('sha1').update(fs.readFileSync(r(p.slice(1)))).digest('hex').slice(0, 8);

function cabecalho(src){
  const m = src.match(/^<!--([\s\S]*?)-->\s*/);
  if (!m) throw new Error('Página sem cabeçalho');
  const meta = {};
  m[1].trim().split(/\r?\n/).forEach(l => { const i = l.indexOf(':'); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim(); });
  return [meta, src.slice(m[0].length)];
}

function paginas(dir, base = ''){
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? paginas(path.join(dir, e.name), base + e.name + '/') : e.name.endsWith('.html') ? [base + e.name] : []);
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

const comuns = {
  dominio: CFG.dominio, whatsapp: CFG.whatsapp, whatsappExibicao: CFG.whatsappExibicao,
  email: CFG.email, linkedin: CFG.linkedin, ano: String(new Date().getFullYear()),
  icone_wa: ICONE_WA, icone_seta: ICONE_SETA,
  areas_cartoes: areasCartoes,
  areas_dados: `<script type="application/json" id="areas-data">${JSON.stringify(areasDados)}</script>\n    ${iconesTemplate}`,
  passos_metodo: passosMetodo,
  como_funciona: comoFunciona,
  faq_home: faqHtml(FAQ),
  cta_final: ctaFinal()
};

const urls = [];
const problemas = [];
for (const arq of paginas(r('src/pages'))) {
  const [meta, corpo] = cabecalho(ler('src/pages/' + arq));
  const rota = '/' + arq.replace(/\.html$/, '').replace(/(^|\/)index$/, '');
  const area = AREAS.find(a => rota === '/areas/' + a.id);
  const dados = {
    ...comuns,
    titulo: esc(meta.titulo), descricao: esc(meta.descricao),
    url: `https://${CFG.dominio}${rota === '/' ? '/' : rota}`,
    robots: meta.robots || 'index, follow',
    head_extra: meta.jsonld === 'sim' ? jsonld() : '',
    nav, rodape,
    cta_final: area ? ctaFinal({ titulo: meta.cta || 'Vamos entender o seu caso com calma.', triagem: `/?area=${area.id}#triagem` }) : comuns.cta_final,
    scripts: (meta.scripts || 'gsap scrolltrigger site').split(/\s+/).map(s => `<script src="${SCRIPTS[s]}" defer></script>`).join('\n'),
    triagem_area: area ? `/?area=${area.id}#triagem` : '/#triagem'
  };
  dados.conteudo = substituir(corpo, dados);
  // CSS e JS ganham ?v=<hash> para poderem ter cache longo (ver public/_headers).
  const html = substituir(layout, dados).replace(/(["'])(\/assets\/(?:css|js|vendor)\/[\w.-]+\.(?:css|js))\1/g, (m, q, p) => `${q}${p}?v=${versao(p)}${q}`);

  // Conferências simples: CSP sem inline e nenhum marcador esquecido.
  if (/\sstyle=/.test(html)) problemas.push(`${arq}: atributo style inline`);
  if (/<style/.test(html)) problemas.push(`${arq}: <style> inline`);
  for (const s of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>/g))
    if (!/type="application\/(ld\+)?json"/.test(s[1])) problemas.push(`${arq}: <script> inline`);
  const sobra = html.match(/\{\{\w+\}\}/g);
  if (sobra) problemas.push(`${arq}: marcadores sem valor ${[...new Set(sobra)].join(', ')}`);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) problemas.push(`${arq}: precisa ter exatamente um <h1>`);

  const destino = path.join(DIST, arq);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html);
  if (meta.robots !== 'noindex') urls.push(rota);
}

/* ---------- arquivos estáticos ---------- */
fs.cpSync(r('assets'), path.join(DIST, 'assets'), { recursive: true });
for (const f of ['_headers', 'favicon.svg', 'site.webmanifest']) if (fs.existsSync(r('public', f))) fs.copyFileSync(r('public', f), path.join(DIST, f));
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: https://${CFG.dominio}/sitemap.xml\n`);
const hoje = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.sort().map(u => `  <url><loc>https://${CFG.dominio}${u}</loc><lastmod>${hoje}</lastmod></url>`).join('\n')}
</urlset>
`);

if (problemas.length) { console.error('Problemas encontrados:\n- ' + problemas.join('\n- ')); process.exit(1); }
console.log(`dist/ gerado: ${urls.length} páginas indexáveis (${urls.join(', ')})`);
