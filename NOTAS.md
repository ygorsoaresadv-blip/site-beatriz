# Notas, decisões e dúvidas

## Decisões de estrutura
- **Gerador simples em Node (`scripts/build.mjs`)**, sem dependências: junta `src/layout.html`, os menus/rodapé de `src/partials/` e as páginas de `src/pages/`, e grava o site pronto em `dist/`. Assim o cabeçalho e o rodapé ficam escritos uma vez só e o HTML final já sai completo (bom para SEO e para quem navega sem JavaScript). Na Cloudflare: comando `npm run build`, saída `dist`.
- `prototype/`, `design/`, `content/` e `examples/` ficam no repositório como referência, mas **não são publicados** (só `dist/` vai ao ar).
- `assets/js/config.js` centraliza domínio, WhatsApp, e-mail, LinkedIn, a chave da fase 2 e o token do Web Analytics. O build lê esse mesmo arquivo.
- Fontes auto-hospedadas (`scripts/baixar-fontes.mjs`, subconjuntos latin e latin-ext). Não há chamadas ao Google Fonts.
- CSS e JS recebem `?v=<hash>` no build, o que permite cache longo (`public/_headers`).
- Cartões de áreas são gerados de `content/areas.json` no HTML; o seletor "Para você / Para sua empresa" troca o conteúdo como no protótipo.

## Diferenças em relação ao protótipo (e por quê)
- **Atributo `hidden` não funcionava no protótipo**: classes como `.q`, `.btn` e `.mobile-menu` definem `display`, o que anula `hidden` (o menu mobile e todas as etapas da triagem apareciam ao mesmo tempo). Corrigido com `[hidden]{display:none!important}`.
- **Contraste AA**: textos pequenos que usavam `--dim` (rótulos dos cartões, datas do painel, títulos do rodapé) passaram a usar `--muted`. Os tokens não mudaram.
- **Títulos**: `h4` do painel e `h5` do rodapé viraram `h3`/`h2` com o mesmo visual, para manter a ordem de títulos acessível.
- **Logotipo**: removido o `aria-label` do link da marca (o nome visível já basta e o rótulo divergente era erro de acessibilidade).
- **Links para as páginas de área**: o título de cada cartão da home virou link (sem mudança visual além do sublinhado ao passar o mouse).
- **Triagem**: nada vem pré-preenchido nem pré-marcado (consentimento inclusive); cada etapa valida a escolha. Foi incluída a opção "Assessoria empresarial", que só aparece quando o visitante escolhe "Para minha empresa". Aviso de dados sensíveis no campo do relato. Campo honeypot e espaço do Turnstile já prontos para a fase 2.
- **Links das páginas de área** abrem a triagem com o assunto já marcado (`/?area=saude#triagem`).
- **FAQ da home** vem de `content/faq.json`; a resposta sobre assessoria não tem a frase final do protótipo ("Ela aparece em 'Para sua empresa'...").
- **Esfera**: em telas pequenas usa `devicePixelRatio` até 1,5, menos subdivisões e menos partículas; pausa fora da tela e com a aba oculta.
- **Texto justificado** (pedido do Ygor): parágrafos, listas e citações. Títulos, rótulos curtos e botões ficaram alinhados à esquerda, porque justificar 2 ou 3 palavras por linha abre espaços grandes.
- **"(em curso)"** removido da pós-graduação (pedido do Ygor), na home e em `content/dados-da-advogada.json`.

## Pontos para a Beatriz decidir (OAB / conteúdo)
- **Bio "pós-graduanda"**: com o "(em curso)" removido, confirmar se a bio deve continuar dizendo "pós-graduanda" ou passar a "pós-graduada".
- **Chips do hero** "Jurimetria aplicada ao seu caso" e "Painel do cliente": confirmar que descrevem serviços que ela de fato oferece.
- **Painel ilustrativo** (processo fictício "nº 0000000-00..."): está marcado como "Exemplo ilustrativo", mas vale ela validar que não parece caso concreto.
- **"24h para responder"**: é compromisso de atendimento, não de resultado; confirmar que consegue cumprir.
- **Assessoria empresarial**: confirmar o enquadramento junto à OAB/SP antes de publicar a página.
- **Referências legais** das páginas de área (Lei 9.656/1998, Lei 14.454/2022, Súmula 297/STJ, Lei 14.181/2021, art. 7º, XXIX, CF) precisam ser validadas por ela.
- Todas as páginas internas estão marcadas com `<!-- REVISAR: Beatriz -->`.
- **Vínculo atual**: confirmar que o contrato do escritório onde ela trabalha permite advocacia própria antes de publicar.

## Pendências técnicas
- Domínio: `DOMINIO-A-DEFINIR` em `assets/js/config.js` (canonical, Open Graph, sitemap, robots e JSON-LD saem dele).
- E-mail: trocar o Gmail pelo do domínio em `assets/js/config.js`.
- Foto provisória: substituir `assets/img/beatriz.jpg` (quadrada, 600×600 ou maior).
- Web Analytics: ativar no painel da Cloudflare Pages (injeção automática) ou colar o token em `analyticsToken`.
- Lighthouse não foi rodado nesta etapa; rodar `npm run lighthouse` com o site servido e anotar os números.
