# Site — Beatriz Farias Marques Advocacia

Site de captação estático (HTML, CSS e JavaScript puros) para a advogada Beatriz Farias Marques dos Santos, OAB/SP 557.676. Hospedagem prevista: Cloudflare Pages.

## Estrutura

```
assets/          css, js, fontes, imagens e bibliotecas locais (three, gsap, ScrollTrigger)
  js/config.js   domínio, contatos, chave da fase 2 e analytics (fonte única)
src/             layout, menu/rodapé compartilhados e as páginas
public/          _headers (CSP e cache), favicon.svg, manifest
content/         textos de referência (áreas, FAQ, dados, roteiros)
functions/       Pages Function da fase 2 (POST /api/lead), inativa por padrão
supabase/        schema da tabela de leads (fase 2)
scripts/         build, verificação, fontes e geração de imagens
prototype/       protótipo aprovado (referência; não é publicado)
dist/            site gerado (não versionado)
```

## Rodar localmente

Requer Node 18+.

```bash
npm install
```

```bash
npm run dev
```

Abra http://localhost:4173. Depois de editar algo em `src/`, `assets/` ou `content/`, rode `npm run build` de novo.

Verificação (capturas em `verificacao/`, rolagem horizontal, erros de console e acessibilidade com axe), com o site servido em outro terminal:

```bash
npx playwright install chromium
```

```bash
npm run verificar
```

## Publicar na Cloudflare Pages

1. Cloudflare → Workers & Pages → Create → Pages → Connect to Git → escolha este repositório.
2. Framework preset: **None**. Build command: `npm run build`. Build output directory: `dist`.
3. Variável de ambiente opcional: `NODE_VERSION = 20`.
4. Em *Custom domains*, adicione o domínio quando ele existir.
5. Em *Metrics*, ative o **Web Analytics** (não usa cookies).

O arquivo `public/_headers` aplica CSP e cabeçalhos de segurança. URLs ficam sem `.html` automaticamente.

## Trocar domínio, e-mail ou telefone

Edite `assets/js/config.js` e faça um novo commit. O build espalha os valores por canonical, Open Graph, sitemap, robots, JSON-LD, rodapé e botões.

## Trocar a foto

Substitua `assets/img/beatriz.jpg` por uma imagem quadrada (600×600 ou maior), mantendo o nome.

## Regerar ícones e imagem de compartilhamento

```bash
npm run imagens
```

## Fase 2: captura de leads (desligada)

1. Crie o projeto no Supabase e rode `supabase/schema.sql`.
2. Crie um widget no Cloudflare Turnstile.
3. Na Cloudflare Pages, cadastre como **Secrets**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET`.
4. Em `assets/js/config.js`: `leadsAtivo: true` e `turnstileSiteKey` com a chave pública.

Nunca coloque chaves secretas no repositório.

Decisões, diferenças em relação ao protótipo e pendências estão em `NOTAS.md`.
