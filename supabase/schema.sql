-- =====================================================================
-- TravelIA - tabela "clima"
-- Rode isto no SQL Editor do painel do Supabase.
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists public.clima (
  id uuid primary key default gen_random_uuid(),

  -- chave de busca: o que o usuario digitou, normalizado (minusculo, sem acento)
  city_query text not null,

  -- identificacao
  city_id      bigint,
  nome         text not null,
  pais         text,
  lat          double precision,
  lon          double precision,

  -- medidas principais
  temp             numeric,
  sensacao_termica numeric,
  temp_min         numeric,
  temp_max         numeric,
  pressao          integer,
  umidade          integer,
  visibilidade     integer,

  -- vento e nuvens
  vento_velocidade numeric,
  vento_graus      integer,
  vento_rajada     numeric,
  nuvens           integer,

  -- condicao
  condicao_id        integer,
  condicao_principal text,
  condicao_descricao text,
  condicao_icone     text,

  -- sol / fuso
  nascer_do_sol   timestamptz,
  por_do_sol      timestamptz,
  timezone_offset integer,          -- segundos em relacao ao UTC
  medido_em       timestamptz,      -- campo "dt" da OpenWeather

  -- payload cru da API, para nao perder nenhum dado
  raw jsonb not null,

  -- conteudo gerado por IA
  analise_texto text,
  audio_url     text,
  audio_path    text,               -- caminho dentro do bucket (para deletar)

  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- uma linha por cidade: "atualizar" faz upsert nesta chave
create unique index if not exists clima_city_query_key on public.clima (city_query);
create index if not exists clima_atualizado_em_idx on public.clima (atualizado_em desc);

-- atualiza o carimbo de tempo em toda alteracao
create or replace function public.clima_touch_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists clima_touch on public.clima;
create trigger clima_touch
  before update on public.clima
  for each row execute function public.clima_touch_atualizado_em();

-- RLS ligado: o app escreve pelo backend com a service_role key,
-- que ignora RLS. Leitura publica liberada para o card.
alter table public.clima enable row level security;

drop policy if exists "clima leitura publica" on public.clima;
create policy "clima leitura publica"
  on public.clima for select
  to anon, authenticated
  using (true);

-- =====================================================================
-- Storage: bucket publico para os audios
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('clima-audio', 'clima-audio', true)
on conflict (id) do update set public = true;
