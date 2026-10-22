# Identidade visual — Beatriz Farias Marques Advocacia

**Percepção desejada:** moderna, confiável, tecnológica, com refino. A advogada é pós-graduanda em Legal Ops e IA; o site precisa transmitir excelência técnica sem parecer "startup".

## Cor
- Acento único: fúcsia. Claro: `--accent #e0368f`, texto de acento `--accent-2 #b3125f`, botões `#d62a82 → #a8105f`.
- Escuro: `--accent #f0479f`, `--accent-2 #ff7cc2`, botões `#f0479f → #c81f78`.
- Neutros com leve tom rosado/roxo (claro `#fbf8fc`, escuro `#0a0810`). Nada de cinza puro.
- Valores completos em `design/tokens.css`.

## Tipografia
- **Onest** (400–700): títulos e texto. Títulos: peso 600, `letter-spacing` negativo, `text-wrap: balance`.
- **JetBrains Mono**: rótulos pequenos em caixa alta, números, metadados.
- **Instrument Serif itálico**: usada **somente** no monograma "bf". Em nenhum outro lugar.
- **REGRA:** não usar itálico nem cor diferente para destacar uma palavra no meio de uma frase (nem em títulos). Títulos têm uma cor só.

## Monograma
Círculo fino com um arco fúcsia e um ponto no canto superior direito, com "bf" em Instrument Serif itálico. SVG no protótipo (`.brand svg`). Gerar também: favicon (SVG + PNG 32/180/512) e imagem OG 1200×630.

## Movimento
- Uma esfera WebGL (three.js) no hero, deformada por ruído simplex, com partículas em órbita; reage ao ponteiro; troca de paleta com o tema (uniform `uLight`).
- Palavra gigante vazada ao fundo do hero, com parallax.
- Títulos entram palavra por palavra (GSAP ScrollTrigger). Cartões com brilho que segue o cursor. Botões magnéticos só com ponteiro fino.
- Tudo respeita `prefers-reduced-motion`. Sem WebGL → mostrar `.orb-fallback`.
- Pausar o render quando o hero sai da tela (IntersectionObserver, já no protótipo).

## Tema
- **Claro é o padrão**, independentemente do sistema operacional.
- Botão (lua/sol) no canto superior direito alterna para o escuro; a escolha fica em `localStorage` (`bf-theme`) com try/catch.
- O tema escuro deve ficar idêntico ao protótipo.
