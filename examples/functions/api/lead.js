// Cloudflare Pages Function: POST /api/lead
// Variáveis (Pages > Settings > Environment variables, como "Secret"):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TURNSTILE_SECRET
// Não registre dados pessoais em console.log.

const QUEM = ['Pessoa física', 'Empresa'];
const AREAS = ['Cível', 'Médico e da Saúde', 'Bancário', 'Trabalhista', 'Assessoria empresarial', 'Não sei dizer'];
const clip = (v, n) => String(v ?? '').trim().slice(0, n);

export async function onRequestPost({ request, env }) {
  let b;
  try { b = await request.json(); } catch { return new Response('JSON inválido', { status: 400 }); }

  if (b.empresa_site) return new Response(null, { status: 204 });           // honeypot: robôs preenchem
  if (b.consentimento !== true) return new Response('Consentimento obrigatório', { status: 400 });

  const lead = {
    quem: QUEM.includes(b.quem) ? b.quem : null,
    area: AREAS.includes(b.area) ? b.area : 'Não sei dizer',
    urgencia: clip(b.urgencia, 80),
    nome: clip(b.nome, 120),
    cidade: clip(b.cidade, 120),
    relato: clip(b.relato, 2000),
    origem: clip(b.origem, 200),
    consentimento: true,
    texto_consentimento_versao: 'v1',
  };
  if (!lead.quem || lead.nome.length < 2 || lead.relato.length < 10)
    return new Response('Dados incompletos', { status: 400 });

  // Cloudflare Turnstile
  const ts = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret: env.TURNSTILE_SECRET, response: String(b.turnstile ?? ''),
                                remoteip: request.headers.get('CF-Connecting-IP') ?? '' }),
  }).then(r => r.json()).catch(() => ({ success: false }));
  if (!ts.success) return new Response('Verificação falhou', { status: 403 });

  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/leads`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(lead),
  });
  return new Response(null, { status: r.ok ? 204 : 502 });
}
