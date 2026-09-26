-- =====================================================================
-- 4. Tabela `clima_prompts` - prompts da IA editaveis pelo painel
--
-- Tira os prompts do codigo: ate aqui, mudar o tom da narracao ou uma regra
-- do TravelBot exigia deploy.
--
-- A tabela guarda apenas o que foi EDITADO. Chave ausente significa "usa o
-- padrao de fabrica", que vive em src/config/prompts-padrao.ts - por isso o
-- app funciona com a tabela vazia, e apagar uma linha equivale a restaurar
-- o original.
--
-- Rode DEPOIS do 02-clima-consultas.sql.
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists public.clima_prompts (
  chave text primary key,
  conteudo text not null,
  -- quem mexeu por ultimo; texto livre, o app nao tem login
  editado_por text,
  atualizado_em timestamptz not null default now(),
  criado_em timestamptz not null default now()
);

create or replace function public.clima_prompts_touch()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists clima_prompts_touch on public.clima_prompts;
create trigger clima_prompts_touch
  before update on public.clima_prompts
  for each row execute function public.clima_prompts_touch();

-- RLS ligado. Leitura publica, igual ao resto do app; a ESCRITA passa so pela
-- service_role no backend - sem isso qualquer visitante reescreveria o
-- comportamento da IA.
alter table public.clima_prompts enable row level security;

drop policy if exists "clima_prompts leitura publica" on public.clima_prompts;
create policy "clima_prompts leitura publica"
  on public.clima_prompts for select
  to anon, authenticated
  using (true);
