# Site de captação — Beatriz Farias Marques Advocacia

Você vai construir o site de captação de clientes da advogada **Beatriz Farias Marques dos Santos (OAB/SP 557.676)**, advogada autônoma. O site é público, estático e hospedado na **Cloudflare Pages**, com o código no **GitHub**. Este repositório é só o site. O sistema de gestão do escritório (Práxis) fica em outro repositório **privado** e não faz parte deste trabalho.

Idioma de tudo que o visitante vê: **português do Brasil**. Comentários de código e commits: português.

## 1. Fonte da verdade visual
- `prototype/index.html` é o protótipo **aprovado** (home completa, claro e escuro, mobile e desktop). Reproduza o visual e o comportamento **fielmente**. Não "melhore" o design por conta própria; se achar algo a corrigir, anote em `NOTAS.md` e siga.
- `design/tokens.css` tem os tokens (claro = padrão, escuro via `data-theme="dark"` no `<html>`). `design/identidade.md` tem as regras de tipografia, movimento e tema.
- Regras que não se negociam:
  1. **Tema claro é o padrão**, sempre, independentemente do sistema. Botão lua/sol no canto superior direito alterna para o escuro; guardar em `localStorage` (`bf-theme`) com try/catch. O escuro fica **idêntico** ao protótipo.
  2. **Nenhuma palavra destacada em itálico ou com cor diferente no meio de frases ou títulos.** Instrument Serif itálico só no monograma "bf".
  3. **Não existe blog** neste projeto. Não crie seção de artigos, CMS, RSS nem links para isso.
  4. Acento único fúcsia. Sem emoji como ornamento. Sem fotos de banco de imagens.

## 2. Stack e estrutura
- HTML, CSS e JavaScript puros, **sem framework e sem build obrigatório** (mesmo estilo dos outros projetos do Ygor). Páginas multi-arquivo para boa indexação.
- Separe o protótipo (que é um arquivo único) em arquivos: `assets/css/*.css`, `assets/js/*.js`, `assets/img/`, `assets/vendor/` (three, gsap, ScrollTrigger **locais**, sem CDN). A CSP em `examples/_headers` exige zero script/estilo inline; remova os `<style>`/`<script>` inline do protótipo ao separar.
- Fontes: Onest, JetBrains Mono e Instrument Serif. Prefira **auto-hospedar** (woff2 em `assets/fonts/`, `font-display: swap`) para dispensar o Google Fonts e simplificar a LGPD. Se não conseguir baixar as fontes, use o link do Google Fonts como no protótipo e anote em `NOTAS.md`.
- Páginas:
  - `index.html` (home, como no protótipo)
  - `areas/civel.html`, `areas/saude.html`, `areas/bancario.html`, `areas/trabalhista.html`, `areas/assessoria-empresarial.html`
  - `privacidade.html`, `404.html`
  - URLs limpas na Cloudflare Pages (sem `.html` na barra de endereço).
- Menu, rodapé, botão flutuante de WhatsApp e botão de tema são compartilhados por todas as páginas. Reaproveite sem copiar/colar texto divergente (por exemplo, um pequeno script que injeta o cabeçalho/rodapé, ou gere as páginas por um script Node simples de uma pasta `src/`; escolha o mais simples e documente).
- Textos e dados estão em `content/`: `areas.json`, `faq.json`, `dados-da-advogada.json`, `paginas-das-areas.md` (roteiro de cada página de área) e `privacidade-roteiro.md`. Use esses arquivos como fonte; não invente fatos sobre a advogada.

## 3. Home: o que mudar em relação ao protótipo
Nada além de separar em arquivos. Pontos a manter:
- Seletor "Para você / Para sua empresa" nas áreas. A **Assessoria empresarial** só aparece em "Para sua empresa".
- Link do LinkedIn na seção "Sobre" e no rodapé: `https://www.linkedin.com/in/beatriz-farias-marques-dos-santos-94957823a/` (`target="_blank" rel="noopener me"`).
- Triagem de 4 perguntas que monta a mensagem e abre `https://wa.me/5511991680688?text=...`.
- Remover a etiqueta "Prévia" (já removida em `prototype/index.html`).

## 4. Páginas de área
Siga `content/paginas-das-areas.md`. Cada página: título, abertura, "Quando procurar", "Como funciona", "O que separar", 3 perguntas frequentes da área e os botões de contato. Mesmo visual da home (cartões, tipografia, tema). Texto informativo, sem promessa, **sem valores, sem gratuidade, sem resultados**. Os textos são rascunho: marque cada página com um comentário HTML `<!-- REVISAR: Beatriz -->` até ela aprovar.

## 5. Conformidade com a OAB (Provimento 205/2021 do CFOAB)
O site é publicidade de advocacia. Verifique em cada texto, antes de dar uma página como pronta:
- [ ] Nenhuma referência a **valores de honorários, formas de pagamento, gratuidade, descontos ou promoções**. (A primeira conversa pode ser gratuita na prática, mas **não anuncie**.)
- [ ] Nenhuma menção a **resultados, decisões, casos concretos, "já ajudamos X clientes"** ou números de êxito.
- [ ] Nenhuma **promessa ou garantia** de resultado; sem "o melhor", "líder", "especialista" (não há título de especialista).
- [ ] Nenhum **depoimento** ou avaliação de cliente.
- [ ] Sem logomarca ou símbolos da OAB. O número de inscrição aparece como texto.
- [ ] Linguagem sóbria e informativa; sem captação agressiva, sem pop-ups insistentes, sem contagem regressiva.
- [ ] A triagem **não responde nem opina** sobre o caso; ela só organiza a mensagem para a advogada. Mantenha o aviso visível. (O Provimento não admite respostas automáticas a consultas de não clientes.)
- [ ] Aviso no rodapé de que a advogada não faz cobranças fora dos canais oficiais (já no protótipo).
Em caso de dúvida, **não publique o trecho** e registre em `NOTAS.md` para a Beatriz decidir. Isto não substitui a validação da própria advogada.

## 6. LGPD
- Páginas e formulário seguem `content/privacidade-roteiro.md`.
- O campo "o que aconteceu" deve trazer o aviso: **não envie dados de saúde, documentos ou números de processo aqui**. Isso se combina depois, em canal adequado.
- Consentimento explícito (caixa marcada pelo visitante, **não pré-marcada** na versão final; o protótipo vem marcada só para a demonstração).
- Retenção: 30 dias para quem não contratou. Encarregada de dados: a própria advogada.
- Analytics: usar **Cloudflare Web Analytics** (sem cookies). Google Analytics 4 só se a Beatriz exigir, e então com aviso de cookies e consentimento antes de carregar.

## 7. Captura de leads (duas fases)
- **Fase 1 (agora):** só o link do WhatsApp com a mensagem pronta, como no protótipo. Nenhum dado fica guardado.
- **Fase 2 (depois que a Beatriz criar as contas):** a triagem também envia os dados para `POST /api/lead` (Cloudflare Pages Function) que grava no Supabase, e em seguida abre o WhatsApp. Modelos prontos em `examples/functions/api/lead.js` e `examples/supabase/schema.sql` (RLS ligado, sem política pública, expiração em 30 dias, limpeza diária). Use Cloudflare Turnstile e campo honeypot. **Não implemente a fase 2 sem as chaves**; deixe o código preparado e desligado por uma constante em `assets/js/config.js`.
- Chaves só como "Secrets" da Cloudflare. **Nunca** coloque chaves no repositório.

## 8. Qualidade (meta de "pronto")
- **Desempenho:** Lighthouse mobile ≥ 90 em desempenho e ≥ 95 em acessibilidade, SEO e boas práticas, com a esfera ligada. Reduza o `devicePixelRatio` da esfera em telas pequenas se precisar; pause o render fora da tela; fallback quando não houver WebGL (`.orb-fallback`).
- **Acessibilidade:** contraste AA nos dois temas, foco visível, navegação por teclado, `prefers-reduced-motion` respeitado, rótulos nos campos, um `h1` por página, `lang="pt-BR"`.
- **Responsivo:** sem rolagem horizontal de 320 px a 1920 px. Margem lateral mínima de 16 px.
- **SEO:** `<title>` e `meta description` únicos por página, `canonical`, Open Graph/Twitter (imagem 1200×630 em `assets/img/og.jpg`, fúcsia sobre fundo escuro com o monograma e o nome), `sitemap.xml`, `robots.txt`, JSON-LD `Attorney` (`examples/jsonld-attorney.html`; sem avaliações inventadas), favicons (SVG + PNG).
- **Segurança:** `_headers` com CSP e demais cabeçalhos (`examples/_headers`). Sem scripts de terceiros além de Turnstile e Web Analytics.
- **Verificação:** rode `examples/scripts/verificar.mjs` (copie para `scripts/`) com `npm run serve` ativo. Corrija todas as falhas. Olhe as capturas em `verificacao/` (claro/escuro, desktop/celular) antes de dizer que terminou.

## 9. Fluxo de trabalho e entrega
1. Crie a estrutura e separe o protótipo em arquivos; confira que a home ficou **igual** ao protótipo (compare capturas).
2. Faça as páginas de área, privacidade e 404.
3. Faça SEO, cabeçalhos, favicons e imagem OG.
4. Rode a verificação e corrija.
5. Documente em `README.md`: como rodar localmente, como publicar na Cloudflare Pages (conectar o repositório; sem comando de build se não houver; diretório de saída `/` ou `dist`), como trocar o domínio e o e-mail.
6. Commits pequenos, em português, na branch `main`. Cada alteração fica em um commit com mensagem clara.

## 10. Pendências conhecidas (não invente; deixe como constantes fáceis de trocar)
- **Domínio:** ainda não definido (o Ygor cuida disso). Use `DOMINIO-A-DEFINIR` nos exemplos e centralize em `assets/js/config.js`.
- **E-mail profissional:** hoje é um Gmail; deve virar um e-mail do domínio.
- **Foto:** a atual é provisória. Facilite a troca (um único arquivo `assets/img/beatriz.jpg`, quadrado).
- **Perfil da Empresa no Google:** o atendimento é online, com presencial sem endereço fixo; ao criar o perfil, configurar como negócio sem atendimento no local (ocultar endereço).
- **Bio:** o texto atual foi escrito a partir do LinkedIn; a Beatriz vai revisar.
- **Vínculo atual:** o LinkedIn mostra que ela atua como advogada júnior em outro escritório. Ela precisa confirmar que o contrato de trabalho permite advocacia própria antes de o site ir ao ar.

## 11. O que NÃO fazer
- Não crie blog, newsletter, área de login, chat com IA, calculadoras ou portal do cliente neste repositório.
- Não use depoimentos, números de resultados, selos ou "avaliações" fictícias.
- Não inclua chaves, tokens ou dados pessoais de clientes no código, em exemplos ou em capturas de tela.
- Não instale bibliotecas além das já usadas (three.js r128, GSAP 3.12.5 com ScrollTrigger) sem necessidade clara.
