-- Fase 2: captura de leads do site. Execute no SQL Editor do Supabase.
-- Dados pessoais: NÃO use a chave "anon" no navegador. Só a Function do Cloudflare (service role) grava.

create extension if not exists pgcrypto;
create extension if not exists pg_cron;

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default now() + interval '30 days',
  status        text not null default 'novo'
                check (status in ('novo','em_conversa','consulta_marcada','contratou','descartado')),
  quem          text not null check (quem in ('Pessoa física','Empresa')),
  area          text not null,
  urgencia      text,
  nome          text not null check (char_length(nome) between 2 and 120),
  cidade        text check (char_length(cidade) <= 120),
  relato        text not null check (char_length(relato) between 10 and 2000),
  origem        text,                 -- página/utm de onde veio
  consentimento boolean not null check (consentimento),
  consentimento_em timestamptz not null default now(),
  texto_consentimento_versao text not null default 'v1'
);

-- RLS ligado e SEM políticas públicas: ninguém lê ou escreve pelo navegador.
alter table public.leads enable row level security;

create index if not exists leads_status_idx on public.leads (status, created_at desc);
create index if not exists leads_expires_idx on public.leads (expires_at);

-- Limpeza diária (03:00 UTC): apaga quem não contratou depois de 30 dias.
select cron.schedule(
  'apagar-leads-vencidos', '0 3 * * *',
  $$ delete from public.leads where expires_at < now() and status <> 'contratou' $$
);
