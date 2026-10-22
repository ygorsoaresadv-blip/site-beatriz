/* Triagem de 4 perguntas: só organiza o relato e abre o WhatsApp com a mensagem pronta.
   Não responde nem opina sobre o caso (Provimento 205/2021 do CFOAB).
   Fase 2 (desligada): se BF_CONFIG.leadsAtivo for true, também envia os dados para POST /api/lead. */
(function(){
const form = document.getElementById('tform');
if (!form) return;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const CFG = window.BF_CONFIG || {};
const WA = CFG.whatsapp || '5511991680688';
const FASE2 = CFG.leadsAtivo === true;
const $ = id => document.getElementById(id);

const qs = [...form.querySelectorAll('.q')], bars = [...form.querySelectorAll('.progress i')];
const next = $('next'), back = $('back'), ferr = $('ferr'), sendWa = $('sendWa');
let step = 0, texto = '';
const val = n => { const x = form.querySelector(`input[name="${n}"]:checked`); return x ? x.value : ''; };

/* Assessoria empresarial só aparece para empresas */
const optAssessoria = $('opt-assessoria');
function syncQuem(){
  const empresa = val('quem') === 'Empresa';
  optAssessoria.hidden = !empresa;
  if (!empresa && $('a6').checked) $('a6').checked = false;
}
form.querySelectorAll('input[name="quem"]').forEach(i => i.addEventListener('change', syncQuem));

/* Pré-seleção vinda das páginas de área: /?area=saude#triagem */
const PARAM = { civel: 'a1', saude: 'a2', bancario: 'a3', trabalhista: 'a4', 'assessoria-empresarial': 'a6' };
try {
  const a = new URLSearchParams(location.search).get('area');
  if (a && PARAM[a]) {
    if (a === 'assessoria-empresarial') $('q-e').checked = true;
    $(PARAM[a]).checked = true;
  }
} catch (e) {}
syncQuem();

function montarTexto(){
  return `Olá, Dra. Beatriz! Vim pelo site.\n\nNome: ${$('nome').value.trim()}\nCidade: ${$('cidade').value.trim()}\nAtendimento: ${val('quem')}\nAssunto: ${val('area')}\nUrgência: ${val('urg')}\n\nO que aconteceu:\n${$('relato').value.trim()}`;
}
function show(i){
  qs.forEach((q, k) => q.hidden = k !== i);
  bars.forEach((b, k) => b.classList.toggle('on', k <= Math.min(i, 3)));
  back.hidden = i === 0; next.hidden = i === 4; ferr.textContent = '';
  if (i === 4) {
    texto = montarTexto();
    $('summary').textContent = texto;
    sendWa.href = `https://wa.me/${WA}?text=${encodeURIComponent(texto)}`;
  }
  if (!reduce && window.gsap) gsap.fromTo(qs[i], { y: 10, opacity: .4 }, { y: 0, opacity: 1, duration: .35, ease: 'power2.out' });
  const foco = qs[i].querySelector('legend, .label, label.label-lg');
  if (foco && step > 0) { foco.setAttribute('tabindex', '-1'); foco.focus({ preventScroll: true }); }
}
function erro(msg){ ferr.textContent = msg; return false; }
function valida(){
  if (step === 0 && !val('quem')) return erro('Escolha para quem é o atendimento.');
  if (step === 1 && !val('area')) return erro('Escolha um assunto. Se não souber, marque "Não sei dizer".');
  if (step === 2) {
    if ($('relato').value.trim().length < 10) return erro('Escreva pelo menos uma frase sobre o que aconteceu.');
    if (!val('urg')) return erro('Diga se existe alguma data próxima envolvida.');
  }
  if (step === 3) {
    if (!$('nome').value.trim()) return erro('Informe como podemos te chamar.');
    if (!$('lgpd').checked) return erro('Para continuar, é preciso concordar com o uso dos dados para o atendimento.');
    if (FASE2 && CFG.turnstileSiteKey && !tsToken) return erro('Aguarde a verificação de segurança terminar.');
  }
  return true;
}
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!valida()) return;
  step = Math.min(step + 1, 4); show(step);
});
back.addEventListener('click', () => { step = Math.max(0, step - 1); show(step); });

/* ---------- Fase 2: envio para /api/lead (desligado por padrão) ---------- */
let tsToken = '';
if (FASE2 && CFG.turnstileSiteKey) {
  window.bfTurnstileLoad = () => {
    window.turnstile.render('#turnstile', { sitekey: CFG.turnstileSiteKey, language: 'pt-BR', callback: t => { tsToken = t; } });
  };
  const s = document.createElement('script');
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=bfTurnstileLoad&render=explicit';
  s.async = true; s.defer = true;
  document.head.appendChild(s);
}
let enviado = false;
sendWa.addEventListener('click', () => {
  if (!FASE2 || enviado) return;
  enviado = true;
  // keepalive: o pedido continua mesmo com o WhatsApp abrindo em outra aba.
  fetch('/api/lead', {
    method: 'POST', keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quem: val('quem'), area: val('area'), urgencia: val('urg'),
      nome: $('nome').value.trim(), cidade: $('cidade').value.trim(), relato: $('relato').value.trim(),
      origem: location.pathname + location.search, consentimento: $('lgpd').checked,
      empresa_site: $('empresa_site').value, turnstile: tsToken
    })
  }).catch(() => {});
});
})();
