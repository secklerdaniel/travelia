-- =====================================================================
-- 2. Tabela `clima_consultas` - registro de tudo que os usuarios pedem
--
-- Enquanto `clima_cidades` guarda o ESTADO ATUAL de cada cidade (uma linha
-- por cidade, sobrescrita a cada consulta), esta guarda o HISTORICO: uma
-- linha por consulta, nunca sobrescrita. E o que vira inteligencia de dados
-- para as secretarias de turismo - quem procurou o que, quando e de que tipo.
--
-- Os dois tipos de consulta convivem na mesma tabela. Separar em duas
-- obrigaria o dashboard a unir tudo em toda leitura, e as perguntas
-- interessantes ("quais cidades mais buscadas") cruzam os dois.
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists public.clima_consultas (
  id uuid primary key default gen_random_uuid(),

  -- 'clima'   = previsao do tempo
  -- 'roteiro' = recomendacao de experiencias
  tipo text not null check (tipo in ('clima', 'roteiro')),

  -- Identificador anonimo do navegador, vindo de um cookie. Nao ha login nem
  -- dado pessoal: serve so para separar "50 consultas de 50 pessoas" de
  -- "50 consultas da mesma pessoa" - numeros que contam historias opostas
  -- para uma secretaria de turismo.
  visitante uuid,

  -- ---------- localidade consultada ----------
  cidade      text not null,
  uf          text,
  pais        text,
  lat         double precision,
  lon         double precision,
  -- chave normalizada; liga com clima_cidades.city_query
  city_query  text,
  -- o que a pessoa realmente digitou, antes de normalizar. Mostra como o
  -- publico escreve o nome da cidade - dado util por si so.
  termo_digitado text,

  -- ---------- contexto do roteiro (nulo quando tipo = 'clima') ----------
  experiencia text,
  pilar       text,
  companhia   text,
  pessoas     integer,
  verba       numeric,

  -- ---------- condicao do tempo (nulo quando tipo = 'roteiro') ----------
  condicao_id        integer,
  condicao_descricao text,
  temp               numeric,

  -- ---------- o que foi para a IA e o que voltou ----------
  modelo    text,
  prompt    text,     -- mensagem enviada, na integra
  resposta  jsonb,    -- retorno estruturado, para auditar depois

  -- ---------- operacional ----------
  sucesso    boolean not null default true,
  erro       text,
  duracao_ms integer,
  criado_em  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Colunas acrescentadas depois da primeira versao deste arquivo.
--
-- `create table if not exists` nao altera tabela existente: quem ja tinha
-- rodado a versao anterior ficaria sem estas colunas e so descobriria no
-- erro do insert. Os `add column if not exists` fazem o arquivo inteiro ser
-- seguro de rodar de novo, com a tabela nova ou velha.
-- ---------------------------------------------------------------------
alter table public.clima_consultas
  add column if not exists visitante uuid;

-- O dashboard lista por data e agrupa por cidade e tipo.
create index if not exists clima_consultas_criado_em_idx
  on public.clima_consultas (criado_em desc);
create index if not exists clima_consultas_cidade_idx
  on public.clima_consultas (cidade);
create index if not exists clima_consultas_tipo_idx
  on public.clima_consultas (tipo);
create index if not exists clima_consultas_visitante_idx
  on public.clima_consultas (visitante);

-- RLS ligado. A escrita passa pela service_role no backend, que ignora RLS.
alter table public.clima_consultas enable row level security;

-- ATENCAO: leitura publica, igual ao resto do app. Isso expoe o historico
-- inteiro de buscas para quem souber a URL da API. Se o dashboard for ficar
-- restrito, remova esta policy e leia so pelo backend.
drop policy if exists "clima_consultas leitura publica" on public.clima_consultas;
create policy "clima_consultas leitura publica"
  on public.clima_consultas for select
  to anon, authenticated
  using (true);
