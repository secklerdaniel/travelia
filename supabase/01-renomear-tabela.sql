-- =====================================================================
-- 1. Renomeia `clima` -> `clima_cidades`
--
-- Rode ANTES de publicar a versao nova do codigo: entre este passo e o
-- deploy, o app em producao vai errar ao ler a tabela antiga.
--
-- Indices, constraints, trigger e policies acompanham o rename
-- automaticamente - o Postgres so troca o nome do objeto.
-- =====================================================================

alter table public.clima rename to clima_cidades;

-- Os nomes derivados continuam com "clima_"; renomear e so higiene, para
-- ninguem procurar um indice de uma tabela que nao existe mais.
alter index if exists clima_city_query_key rename to clima_cidades_city_query_key;
alter index if exists clima_atualizado_em_idx rename to clima_cidades_atualizado_em_idx;

-- O nome da primary key depende de como a tabela foi criada; se nao bater,
-- seguimos em frente - e so cosmetico.
do $$
begin
  alter table public.clima_cidades rename constraint clima_pkey to clima_cidades_pkey;
exception
  when undefined_object then null;
end $$;

drop policy if exists "clima leitura publica" on public.clima_cidades;
create policy "clima_cidades leitura publica"
  on public.clima_cidades for select
  to anon, authenticated
  using (true);
