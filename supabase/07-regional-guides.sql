-- =====================================================================
-- 7. Tabela `regional_guides` - guia de regionalidade dos prompts
--
-- A tabela ja foi criada e populada a mao no painel do Supabase; este
-- arquivo existe para o schema ficar reproduzivel (banco novo, ambiente de
-- teste) e para registrar o formato que o app espera.
--
-- Por que ela existe: ate aqui o prompt pedia ao modelo que "usasse as
-- girias do lugar" e ele inventava - misturava sotaques e repetia o mesmo
-- bordao em cidades diferentes. Agora o vocabulario e curado e chega pronto
-- em `{{girias_locais}}`, `{{dica_vestuario}}` e `{{tracos_foneticos_tts}}`.
--
-- Cidade sem linha aqui NAO quebra nada: src/lib/regionalidade.ts cai no
-- guia generico, do mesmo jeito que os prompts caem no padrao de fabrica.
--
-- O rotulo de `local` segue o formato "Cidade / UF" ("Porto Alegre / RS").
-- A UF e o que separa homonimas - existe Salvador na BA e no RS.
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists public.regional_guides (
  id uuid primary key default gen_random_uuid(),

  -- "Cidade / UF"; unico, e a chave de busca (ilike) do app
  local text not null unique,

  -- girias e expressoes que o texto deve usar
  girias_locais text[] not null default '{}',

  -- pecas de roupa como o morador chama ("japona", "cacetinho de frio")
  dica_vestuario text[] not null default '{}',

  -- direcao de prosodia enviada ao modelo de voz
  tracos_foneticos_tts text,

  -- voz nativa da OpenAI escolhida para o perfil da regiao (nova, shimmer,
  -- fable, onyx, echo, alloy). Nulo cai no OPENAI_TTS_VOICE do ambiente.
  voz_tts_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.regional_guides_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists regional_guides_touch on public.regional_guides;
create trigger regional_guides_touch
  before update on public.regional_guides
  for each row execute function public.regional_guides_touch();

-- Busca por nome de cidade sem depender de caixa: o app consulta com
-- `ilike '%cidade%'`.
create index if not exists regional_guides_local_idx
  on public.regional_guides (lower(local));

-- RLS ligado, no mesmo desenho do resto do app: leitura publica, escrita so
-- pela service_role no backend.
alter table public.regional_guides enable row level security;

drop policy if exists "regional_guides leitura publica" on public.regional_guides;
create policy "regional_guides leitura publica"
  on public.regional_guides for select
  to anon, authenticated
  using (true);
