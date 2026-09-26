-- =====================================================================
-- 5. De onde vem o visitante
--
-- Opcional: o navegador so envia se a pessoa autorizar, e a consulta funciona
-- igual sem isso. Para uma secretaria de turismo e o dado mais valioso do
-- painel - mostra de quais cidades vem o interesse pelo destino.
--
-- Guardamos a cidade, nao o ponto exato: `origem_lat`/`origem_lon` ficam
-- arredondados a 2 casas (~1 km) de proposito. Rastrear o endereco de quem
-- consulta nao serve a nenhuma pergunta que o painel responde.
--
-- Rode DEPOIS do 02-clima-consultas.sql.
-- =====================================================================

alter table public.clima_consultas
  add column if not exists origem_cidade text,
  add column if not exists origem_uf     text,
  add column if not exists origem_pais   text,
  add column if not exists origem_lat    double precision,
  add column if not exists origem_lon    double precision;

create index if not exists clima_consultas_origem_idx
  on public.clima_consultas (origem_cidade);
