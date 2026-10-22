/* Configuração central do site. É lida pelo navegador e também por scripts/build.mjs
   (que espalha domínio, e-mail e telefone nas páginas geradas). Troque aqui e rode `npm run build`. */
window.BF_CONFIG = {
  // Domínio definitivo, sem "https://" e sem barra final. Ainda a definir (o Ygor cuida disso).
  dominio: 'DOMINIO-A-DEFINIR',

  // Contato
  whatsapp: '5511991680688',            // formato internacional, só dígitos (usado no wa.me)
  whatsappExibicao: '(11) 99168-0688',
  email: 'beatriz.fariasmarques1112@gmail.com', // trocar pelo e-mail do domínio quando existir
  linkedin: 'https://www.linkedin.com/in/beatriz-farias-marques-dos-santos-94957823a/',

  // Fase 2 da captura de leads (POST /api/lead -> Supabase). Deixe false até a Beatriz criar
  // as contas e as chaves estarem cadastradas como Secrets na Cloudflare.
  leadsAtivo: false,
  turnstileSiteKey: '', // chave PÚBLICA do Cloudflare Turnstile (a secreta fica só na Cloudflare)

  // Cloudflare Web Analytics (sem cookies). Cole o token do painel; vazio = desligado.
  analyticsToken: ''
};
