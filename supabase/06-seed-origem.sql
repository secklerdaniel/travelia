-- =====================================================================
-- 6. De onde vinham os 65 visitantes do historico inicial
--
-- Distribuicao pedida: 20 Sao Paulo, 15 Porto Alegre, 10 Florianopolis,
-- 10 Buenos Aires, 5 Fortaleza, 5 Belo Horizonte = 65 consultas.
--
-- A origem e atribuida por VISITANTE, nunca por linha: uma pessoa nao muda
-- de cidade entre uma consulta e outra. Como cada visitante tem um numero
-- diferente de consultas, os 24 visitantes foram distribuidos de modo que a
-- soma das linhas caia exatamente nos numeros acima - e, entre as combinacoes
-- possiveis, foi escolhida a que mantem os ROTEIROS na mesma proporcao (o
-- painel conta so roteiros, entao e a proporcao que aparece no grafico).
--
-- Fica um visitante de fora, o unico real ate agora: ele nao autorizou a
-- localizacao, e o painel mostra justamente o percentual de quem autorizou.
--
-- Coordenadas com 2 casas (~1 km), como grava /api/origem.
--
-- Rode DEPOIS do 05-origem-visitante.sql.
-- =====================================================================

-- Sao Paulo — 20 consultas (6 roteiros), 5 visitantes
update public.clima_consultas set
  origem_cidade = 'São Paulo', origem_uf = 'SP', origem_pais = 'BR',
  origem_lat = -23.55, origem_lon = -46.63
where visitante in (
  '4bad80d3-1ac8-47d5-a48f-392ca507a4f2',
  'e339a494-7aff-454b-a349-8a08221592c2',
  'bf3d7933-855f-4fbd-a83b-e184c625552b',
  '40189673-c4d8-42a4-ab7f-a1c1e2fec2c5',
  '5364ee98-2bd5-48ce-a36f-f4fcf42a9978'
);

-- Porto Alegre — 15 consultas (5 roteiros), 7 visitantes
update public.clima_consultas set
  origem_cidade = 'Porto Alegre', origem_uf = 'RS', origem_pais = 'BR',
  origem_lat = -30.03, origem_lon = -51.23
where visitante in (
  'da1e0502-0c21-48cc-a582-3680196ab192',
  '54f21d92-c6da-4228-a506-0616d596ab9d',
  '77f87052-5b22-46cd-aab6-c003caa02947',
  '29022c6a-fd31-45dd-a659-bbaa7d4fdafe',
  '9121a73f-787d-4594-aa3b-e14f2920963b',
  '12a06a60-0414-440b-a64f-0da9f50eb5b5',
  'b88c43be-871c-4c21-a0bb-0b2af3d130bb'
);

-- Florianopolis — 10 consultas (3 roteiros), 4 visitantes
update public.clima_consultas set
  origem_cidade = 'Florianópolis', origem_uf = 'SC', origem_pais = 'BR',
  origem_lat = -27.59, origem_lon = -48.55
where visitante in (
  'e9c9b7f0-8c94-4b7a-a857-6f62f44a85e1',
  'fdfcf706-357a-4b7c-a2e5-a0ecd1e3e9e3',
  '5c265797-560f-40ad-a748-fe34bfd783b5',
  'f9fa650f-60ff-46b1-a9be-3b89300c40d8'
);

-- Buenos Aires — 10 consultas (4 roteiros), 2 visitantes
update public.clima_consultas set
  origem_cidade = 'Buenos Aires', origem_uf = 'CABA', origem_pais = 'AR',
  origem_lat = -34.60, origem_lon = -58.38
where visitante in (
  '7587d06d-be79-40c0-ac49-63c0dc8157cd',
  'fc13ebee-6963-48de-ad6f-7b2b02c57d73'
);

-- Fortaleza — 5 consultas (2 roteiros), 3 visitantes
update public.clima_consultas set
  origem_cidade = 'Fortaleza', origem_uf = 'CE', origem_pais = 'BR',
  origem_lat = -3.73, origem_lon = -38.53
where visitante in (
  '24317c20-3fa6-43c1-a6cc-0a8a4b90d49a',
  'f335f30f-d7c6-448c-a9c5-dadf3a599edd',
  'e9625ebf-8e0b-4f4e-a2f2-8115e37fbe65'
);

-- Belo Horizonte — 5 consultas (1 roteiro), 2 visitantes
update public.clima_consultas set
  origem_cidade = 'Belo Horizonte', origem_uf = 'MG', origem_pais = 'BR',
  origem_lat = -19.92, origem_lon = -43.94
where visitante in (
  'bd6a5658-9187-4698-a81e-a371270a6cfb',
  '566e38c0-3b96-49ba-a75a-eb28ef10b14b'
);

-- Conferencia: deve devolver 20 / 15 / 10 / 10 / 5 / 5
-- select origem_cidade, count(*)
--   from public.clima_consultas
--  where origem_cidade is not null
--  group by origem_cidade
--  order by count(*) desc;
