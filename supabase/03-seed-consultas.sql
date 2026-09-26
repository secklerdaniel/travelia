-- =====================================================================
-- 3. Historico inicial de consultas - somente Gramado/RS
--
-- 65 consultas: 20 em junho, 25 em julho e 20 em agosto de 2026 (ate o dia 12).
-- Servem para o dashboard ter o que mostrar antes do primeiro usuario real.
--
-- A distribuicao imita o inverno da serra gaucha: junho e julho puxam
-- nublado, chuva e nevoa; agosto abre um pouco mais de ceu limpo.
--
-- Rode DEPOIS do 02-clima-consultas.sql.
-- =====================================================================

insert into public.clima_consultas
  (tipo, visitante, cidade, uf, pais, lat, lon, city_query, termo_digitado,
   experiencia, pilar, companhia, pessoas, verba,
   condicao_id, condicao_descricao, temp,
   modelo, prompt, resposta,
   sucesso, erro, duracao_ms, criado_em)
values
  ('roteiro', 'bf3d7933-855f-4fbd-a83b-e184c625552b', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado',
   'Turismo cultural', NULL, 'Família com filhos pequenos', 4, 1200,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 1.200,00. Estou procurando vivenciar uma experiência do tipo Turismo cultural, estou viajando família com filhos pequenos e somos 4 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 11347, '2026-06-28 17:19:00-03'),
  ('clima', '7587d06d-be79-40c0-ac49-63c0dc8157cd', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado, RS',
   NULL, NULL, NULL, NULL, NULL,
   800, 'céu limpo', 19.8,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 12h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: céu limpo
Temperatura atual: 20º
Maxima: 20º / Minima: 10º', NULL,
   true, NULL, 38190, '2026-06-10 12:42:00-03'),
  ('roteiro', 'e9c9b7f0-8c94-4b7a-a857-6f62f44a85e1', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado,RS',
   'Turismo Gastronômico', 'Alta Gastronomia', 'Família com filhos pequenos', 4, 1500,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 1.500,00. Estou procurando vivenciar uma experiência do tipo Turismo Gastronômico, no pilar Alta Gastronomia, estou viajando família com filhos pequenos e somos 4 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 8263, '2026-06-24 19:55:00-03'),
  ('clima', 'da1e0502-0c21-48cc-a582-3680196ab192', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'GRAMADO',
   NULL, NULL, NULL, NULL, NULL,
   804, 'nublado', 11.66,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 17h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: nublado
Temperatura atual: 12º
Maxima: 13º / Minima: 7º', NULL,
   true, NULL, 33723, '2026-06-01 17:36:00-03'),
  ('clima', '4bad80d3-1ac8-47d5-a48f-392ca507a4f2', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado,RS',
   NULL, NULL, NULL, NULL, NULL,
   701, 'névoa úmida', 4.75,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 16h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: névoa úmida
Temperatura atual: 5º
Maxima: 8º / Minima: 3º', NULL,
   true, NULL, 28965, '2026-06-11 16:49:00-03'),
  ('clima', '9121a73f-787d-4594-aa3b-e14f2920963b', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado',
   NULL, NULL, NULL, NULL, NULL,
   801, 'algumas nuvens', 7.28,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 18h (noite)
Saudacao correta para esta hora: "Boa noite"
O sol ja se pos - esta escuro la fora
Condicao: algumas nuvens
Temperatura atual: 7º
Maxima: 13º / Minima: 6º', NULL,
   true, NULL, 30100, '2026-06-16 18:34:00-03'),
  ('roteiro', '29022c6a-fd31-45dd-a659-bbaa7d4fdafe', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado,br',
   'Turismo religioso', NULL, 'Excursão de escola', 36, 2000,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 2.000,00. Estou procurando vivenciar uma experiência do tipo Turismo religioso, estou viajando excursão de escola e somos 36 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 5220, '2026-06-12 09:05:00-03'),
  ('roteiro', '7587d06d-be79-40c0-ac49-63c0dc8157cd', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado,RS',
   'Turismo de aventura', NULL, 'Casal', 2, 5000,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 5.000,00. Estou procurando vivenciar uma experiência do tipo Turismo de aventura, estou viajando casal e somos 2 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 11703, '2026-06-29 07:33:00-03'),
  ('clima', '77f87052-5b22-46cd-aab6-c003caa02947', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'GRAMADO',
   NULL, NULL, NULL, NULL, NULL,
   800, 'céu limpo', 12.41,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 16h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: céu limpo
Temperatura atual: 12º
Maxima: 16º / Minima: 8º', NULL,
   true, NULL, 38319, '2026-06-10 16:40:00-03'),
  ('clima', '54f21d92-c6da-4228-a506-0616d596ab9d', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado RS',
   NULL, NULL, NULL, NULL, NULL,
   502, 'chuva forte', 6.81,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 14h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: chuva forte
Temperatura atual: 7º
Maxima: 8º / Minima: 3º', NULL,
   true, NULL, 20119, '2026-06-12 14:04:00-03'),
  ('clima', '12a06a60-0414-440b-a64f-0da9f50eb5b5', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado',
   NULL, NULL, NULL, NULL, NULL,
   804, 'nublado', 13.01,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 12h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: nublado
Temperatura atual: 13º
Maxima: 14º / Minima: 3º', NULL,
   true, NULL, 33231, '2026-06-26 12:35:00-03'),
  ('clima', '4bad80d3-1ac8-47d5-a48f-392ca507a4f2', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado',
   NULL, NULL, NULL, NULL, NULL,
   801, 'algumas nuvens', 5,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 08h (manha)
Saudacao correta para esta hora: "Bom dia"
O sol esta no ceu
Condicao: algumas nuvens
Temperatura atual: 5º
Maxima: 12º / Minima: 5º', NULL,
   true, NULL, 35258, '2026-06-17 08:32:00-03'),
  ('clima', '9121a73f-787d-4594-aa3b-e14f2920963b', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado,br',
   NULL, NULL, NULL, NULL, NULL,
   803, 'nublado', 3.12,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 07h (manha)
Saudacao correta para esta hora: "Bom dia"
O sol esta no ceu
Condicao: nublado
Temperatura atual: 3º
Maxima: 13º / Minima: 3º', NULL,
   true, NULL, 28415, '2026-06-23 07:01:00-03'),
  ('clima', '9121a73f-787d-4594-aa3b-e14f2920963b', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado, RS',
   NULL, NULL, NULL, NULL, NULL,
   701, 'névoa úmida', 11.35,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 17h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: névoa úmida
Temperatura atual: 11º
Maxima: 11º / Minima: 9º', NULL,
   true, NULL, 28627, '2026-06-22 17:26:00-03'),
  ('roteiro', '24317c20-3fa6-43c1-a6cc-0a8a4b90d49a', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado RS',
   'Turismo de negócios', NULL, 'Família com filhos pequenos', 4, 2500,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 2.500,00. Estou procurando vivenciar uma experiência do tipo Turismo de negócios, estou viajando família com filhos pequenos e somos 4 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 4449, '2026-06-10 07:23:00-03'),
  ('clima', 'e339a494-7aff-454b-a349-8a08221592c2', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado,RS',
   NULL, NULL, NULL, NULL, NULL,
   801, 'algumas nuvens', 6.42,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 13h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: algumas nuvens
Temperatura atual: 6º
Maxima: 17º / Minima: 6º', NULL,
   true, NULL, 40832, '2026-06-12 13:16:00-03'),
  ('clima', 'e9c9b7f0-8c94-4b7a-a857-6f62f44a85e1', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado, RS',
   NULL, NULL, NULL, NULL, NULL,
   701, 'névoa úmida', 2.67,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 19h (noite)
Saudacao correta para esta hora: "Boa noite"
O sol ja se pos - esta escuro la fora
Condicao: névoa úmida
Temperatura atual: 3º
Maxima: 9º / Minima: 2º', NULL,
   true, NULL, 35940, '2026-06-24 19:51:00-03'),
  ('roteiro', '4bad80d3-1ac8-47d5-a48f-392ca507a4f2', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado',
   'Turismo de aventura', NULL, 'Casal', 2, 2500,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 2.500,00. Estou procurando vivenciar uma experiência do tipo Turismo de aventura, estou viajando casal e somos 2 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 7331, '2026-06-25 22:39:00-03'),
  ('clima', 'f335f30f-d7c6-448c-a9c5-dadf3a599edd', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado RS',
   NULL, NULL, NULL, NULL, NULL,
   501, 'chuva moderada', 4.36,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 09h (manha)
Saudacao correta para esta hora: "Bom dia"
O sol esta no ceu
Condicao: chuva moderada
Temperatura atual: 4º
Maxima: 9º / Minima: 3º', NULL,
   true, NULL, 18011, '2026-06-23 09:50:00-03'),
  ('roteiro', '54f21d92-c6da-4228-a506-0616d596ab9d', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado RS',
   'Turismo Gastronômico', 'Cozinha Internacional', 'Casal', 2, 5000,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 5.000,00. Estou procurando vivenciar uma experiência do tipo Turismo Gastronômico, no pilar Cozinha Internacional, estou viajando casal e somos 2 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 11097, '2026-06-07 22:20:00-03'),
  ('roteiro', 'da1e0502-0c21-48cc-a582-3680196ab192', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado,br',
   'Turismo cultural', NULL, 'Família com filhos pequenos', 8, 1500,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 1.500,00. Estou procurando vivenciar uma experiência do tipo Turismo cultural, estou viajando família com filhos pequenos e somos 8 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 10667, '2026-07-30 14:07:00-03'),
  ('clima', '24317c20-3fa6-43c1-a6cc-0a8a4b90d49a', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado,RS',
   NULL, NULL, NULL, NULL, NULL,
   800, 'céu limpo', 15.26,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 20h (noite)
Saudacao correta para esta hora: "Boa noite"
O sol ja se pos - esta escuro la fora
Condicao: céu limpo
Temperatura atual: 15º
Maxima: 19º / Minima: 9º', NULL,
   true, NULL, 26699, '2026-07-09 20:00:00-03'),
  ('clima', '5364ee98-2bd5-48ce-a36f-f4fcf42a9978', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado,br',
   NULL, NULL, NULL, NULL, NULL,
   802, 'nuvens dispersas', 6.31,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 22h (noite)
Saudacao correta para esta hora: "Boa noite"
O sol ja se pos - esta escuro la fora
Condicao: nuvens dispersas
Temperatura atual: 6º
Maxima: 18º / Minima: 5º', NULL,
   true, NULL, 38989, '2026-07-21 22:27:00-03'),
  ('clima', '5c265797-560f-40ad-a748-fe34bfd783b5', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado RS',
   NULL, NULL, NULL, NULL, NULL,
   802, 'nuvens dispersas', 8.35,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 15h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: nuvens dispersas
Temperatura atual: 8º
Maxima: 11º / Minima: 5º', NULL,
   true, NULL, 37119, '2026-07-19 15:27:00-03'),
  ('clima', 'fc13ebee-6963-48de-ad6f-7b2b02c57d73', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado,RS',
   NULL, NULL, NULL, NULL, NULL,
   803, 'nublado', 9.65,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 21h (noite)
Saudacao correta para esta hora: "Boa noite"
O sol ja se pos - esta escuro la fora
Condicao: nublado
Temperatura atual: 10º
Maxima: 10º / Minima: 7º', NULL,
   true, NULL, 29450, '2026-07-17 21:42:00-03'),
  ('clima', '5364ee98-2bd5-48ce-a36f-f4fcf42a9978', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado,br',
   NULL, NULL, NULL, NULL, NULL,
   803, 'nublado', 3.92,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 19h (noite)
Saudacao correta para esta hora: "Boa noite"
O sol ja se pos - esta escuro la fora
Condicao: nublado
Temperatura atual: 4º
Maxima: 9º / Minima: 4º', NULL,
   true, NULL, 27679, '2026-07-12 19:22:00-03'),
  ('roteiro', '29022c6a-fd31-45dd-a659-bbaa7d4fdafe', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado, RS',
   'Turismo de lazer', NULL, 'Excursão de escola', 36, 1200,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 1.200,00. Estou procurando vivenciar uma experiência do tipo Turismo de lazer, estou viajando excursão de escola e somos 36 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 11494, '2026-07-17 18:07:00-03'),
  ('clima', 'bd6a5658-9187-4698-a81e-a371270a6cfb', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado, RS',
   NULL, NULL, NULL, NULL, NULL,
   802, 'nuvens dispersas', 7.55,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 09h (manha)
Saudacao correta para esta hora: "Bom dia"
O sol esta no ceu
Condicao: nuvens dispersas
Temperatura atual: 8º
Maxima: 17º / Minima: 7º', NULL,
   true, NULL, 23774, '2026-07-06 09:24:00-03'),
  ('clima', 'fc13ebee-6963-48de-ad6f-7b2b02c57d73', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'GRAMADO',
   NULL, NULL, NULL, NULL, NULL,
   502, 'chuva forte', 10.54,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 20h (noite)
Saudacao correta para esta hora: "Boa noite"
O sol ja se pos - esta escuro la fora
Condicao: chuva forte
Temperatura atual: 11º
Maxima: 12º / Minima: 6º', NULL,
   true, NULL, 24344, '2026-07-08 20:49:00-03'),
  ('clima', 'e9c9b7f0-8c94-4b7a-a857-6f62f44a85e1', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado, RS',
   NULL, NULL, NULL, NULL, NULL,
   501, 'chuva moderada', 11.91,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 20h (noite)
Saudacao correta para esta hora: "Boa noite"
O sol ja se pos - esta escuro la fora
Condicao: chuva moderada
Temperatura atual: 12º
Maxima: 12º / Minima: 11º', NULL,
   true, NULL, 23539, '2026-07-16 20:12:00-03'),
  ('clima', '7587d06d-be79-40c0-ac49-63c0dc8157cd', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado,br',
   NULL, NULL, NULL, NULL, NULL,
   804, 'nublado', 3.47,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 22h (noite)
Saudacao correta para esta hora: "Boa noite"
O sol ja se pos - esta escuro la fora
Condicao: nublado
Temperatura atual: 3º
Maxima: 14º / Minima: 3º', NULL,
   true, NULL, 33980, '2026-07-09 22:48:00-03'),
  ('clima', '5364ee98-2bd5-48ce-a36f-f4fcf42a9978', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado,RS',
   NULL, NULL, NULL, NULL, NULL,
   701, 'névoa úmida', 7.36,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 14h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: névoa úmida
Temperatura atual: 7º
Maxima: 9º / Minima: 6º', NULL,
   true, NULL, 19195, '2026-07-10 14:40:00-03'),
  ('roteiro', 'e9625ebf-8e0b-4f4e-a2f2-8115e37fbe65', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado',
   'Turismo de lazer', NULL, 'Grupo de amigos', 4, 3000,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 3.000,00. Estou procurando vivenciar uma experiência do tipo Turismo de lazer, estou viajando grupo de amigos e somos 4 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 7584, '2026-07-07 18:05:00-03'),
  ('clima', '24317c20-3fa6-43c1-a6cc-0a8a4b90d49a', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado RS',
   NULL, NULL, NULL, NULL, NULL,
   804, 'nublado', 6.71,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 16h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: nublado
Temperatura atual: 7º
Maxima: 11º / Minima: 4º', NULL,
   true, NULL, 19821, '2026-07-31 16:39:00-03'),
  ('clima', 'fdfcf706-357a-4b7c-a2e5-a0ecd1e3e9e3', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado,br',
   NULL, NULL, NULL, NULL, NULL,
   501, 'chuva moderada', 12.46,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 22h (noite)
Saudacao correta para esta hora: "Boa noite"
O sol ja se pos - esta escuro la fora
Condicao: chuva moderada
Temperatura atual: 12º
Maxima: 13º / Minima: 4º', NULL,
   true, NULL, 29669, '2026-07-13 22:23:00-03'),
  ('clima', '4bad80d3-1ac8-47d5-a48f-392ca507a4f2', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado rs',
   NULL, NULL, NULL, NULL, NULL,
   801, 'algumas nuvens', 13.27,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 13h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: algumas nuvens
Temperatura atual: 13º
Maxima: 17º / Minima: 7º', NULL,
   true, NULL, 29567, '2026-07-23 13:55:00-03'),
  ('roteiro', '7587d06d-be79-40c0-ac49-63c0dc8157cd', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado',
   'Turismo de negócios', NULL, 'Família com filhos pequenos', 4, 3000,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 3.000,00. Estou procurando vivenciar uma experiência do tipo Turismo de negócios, estou viajando família com filhos pequenos e somos 4 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 7597, '2026-07-29 20:49:00-03'),
  ('clima', '4bad80d3-1ac8-47d5-a48f-392ca507a4f2', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado',
   NULL, NULL, NULL, NULL, NULL,
   801, 'algumas nuvens', 8.07,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 10h (manha)
Saudacao correta para esta hora: "Bom dia"
O sol esta no ceu
Condicao: algumas nuvens
Temperatura atual: 8º
Maxima: 16º / Minima: 7º', NULL,
   true, NULL, 27304, '2026-07-01 10:19:00-03'),
  ('roteiro', '4bad80d3-1ac8-47d5-a48f-392ca507a4f2', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado',
   'Turismo de negócios', NULL, 'Sozinho', 1, 5000,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 5.000,00. Estou procurando vivenciar uma experiência do tipo Turismo de negócios, estou viajando sozinho e estou sozinho. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 7105, '2026-07-25 10:11:00-03'),
  ('clima', '566e38c0-3b96-49ba-a75a-eb28ef10b14b', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'GRAMADO',
   NULL, NULL, NULL, NULL, NULL,
   741, 'névoa', 8.17,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 16h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: névoa
Temperatura atual: 8º
Maxima: 9º / Minima: 1º', NULL,
   true, NULL, 26972, '2026-07-10 16:26:00-03'),
  ('clima', '9121a73f-787d-4594-aa3b-e14f2920963b', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'GRAMADO',
   NULL, NULL, NULL, NULL, NULL,
   701, 'névoa úmida', 6.93,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 15h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: névoa úmida
Temperatura atual: 7º
Maxima: 10º / Minima: 5º', NULL,
   true, NULL, 37743, '2026-07-30 15:24:00-03'),
  ('clima', 'fc13ebee-6963-48de-ad6f-7b2b02c57d73', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado,RS',
   NULL, NULL, NULL, NULL, NULL,
   803, 'nublado', 10.71,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 16h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: nublado
Temperatura atual: 11º
Maxima: 11º / Minima: 4º', NULL,
   true, NULL, 19929, '2026-07-19 16:22:00-03'),
  ('roteiro', '4bad80d3-1ac8-47d5-a48f-392ca507a4f2', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado,RS',
   'Turismo Gastronômico', 'Regional', 'Grupo de amigos', 6, 4000,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 4.000,00. Estou procurando vivenciar uma experiência do tipo Turismo Gastronômico, no pilar Regional, estou viajando grupo de amigos e somos 6 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 5975, '2026-07-19 20:40:00-03'),
  ('clima', '40189673-c4d8-42a4-ab7f-a1c1e2fec2c5', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado RS',
   NULL, NULL, NULL, NULL, NULL,
   804, 'nublado', 5.5,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 09h (manha)
Saudacao correta para esta hora: "Bom dia"
O sol esta no ceu
Condicao: nublado
Temperatura atual: 6º
Maxima: 13º / Minima: 3º', NULL,
   true, NULL, 28904, '2026-07-04 09:45:00-03'),
  ('clima', 'fdfcf706-357a-4b7c-a2e5-a0ecd1e3e9e3', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado,RS',
   NULL, NULL, NULL, NULL, NULL,
   804, 'nublado', 4.1,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 09h (manha)
Saudacao correta para esta hora: "Bom dia"
O sol esta no ceu
Condicao: nublado
Temperatura atual: 4º
Maxima: 9º / Minima: 3º', NULL,
   true, NULL, 35010, '2026-07-04 09:53:00-03'),
  ('roteiro', 'fc13ebee-6963-48de-ad6f-7b2b02c57d73', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado RS',
   'Turismo de negócios', NULL, 'Sozinho', 1, 8000,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 8.000,00. Estou procurando vivenciar uma experiência do tipo Turismo de negócios, estou viajando sozinho e estou sozinho. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 11148, '2026-08-04 22:15:00-03'),
  ('roteiro', '5364ee98-2bd5-48ce-a36f-f4fcf42a9978', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado',
   'Turismo religioso', NULL, 'Família com filhos pequenos', 4, 3000,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 3.000,00. Estou procurando vivenciar uma experiência do tipo Turismo religioso, estou viajando família com filhos pequenos e somos 4 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 5302, '2026-08-08 22:30:00-03'),
  ('clima', '7587d06d-be79-40c0-ac49-63c0dc8157cd', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'GRAMADO',
   NULL, NULL, NULL, NULL, NULL,
   804, 'nublado', 14.89,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 07h (manha)
Saudacao correta para esta hora: "Bom dia"
O sol esta no ceu
Condicao: nublado
Temperatura atual: 15º
Maxima: 15º / Minima: 10º', NULL,
   true, NULL, 31219, '2026-08-04 07:37:00-03'),
  ('roteiro', 'b88c43be-871c-4c21-a0bb-0b2af3d130bb', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado',
   'Turismo de negócios', NULL, 'Família com filhos pequenos', 7, 8000,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 8.000,00. Estou procurando vivenciar uma experiência do tipo Turismo de negócios, estou viajando família com filhos pequenos e somos 7 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 5065, '2026-08-08 16:48:00-03'),
  ('clima', '9121a73f-787d-4594-aa3b-e14f2920963b', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado',
   NULL, NULL, NULL, NULL, NULL,
   804, 'nublado', 13.31,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 16h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: nublado
Temperatura atual: 13º
Maxima: 13º / Minima: 3º', NULL,
   true, NULL, 27519, '2026-08-01 16:48:00-03'),
  ('roteiro', 'e9c9b7f0-8c94-4b7a-a857-6f62f44a85e1', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado',
   'Turismo de lazer', NULL, 'Família com filhos adolescentes', 6, 1500,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 1.500,00. Estou procurando vivenciar uma experiência do tipo Turismo de lazer, estou viajando família com filhos adolescentes e somos 6 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 5533, '2026-08-11 11:40:00-03'),
  ('roteiro', '4bad80d3-1ac8-47d5-a48f-392ca507a4f2', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado, RS',
   'Turismo de lazer', NULL, 'Sozinho', 1, 8000,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 8.000,00. Estou procurando vivenciar uma experiência do tipo Turismo de lazer, estou viajando sozinho e estou sozinho. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 9771, '2026-08-02 17:38:00-03'),
  ('roteiro', 'e9c9b7f0-8c94-4b7a-a857-6f62f44a85e1', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado, RS',
   'Turismo de negócios', NULL, 'Família com filhos adolescentes', 7, 1500,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 1.500,00. Estou procurando vivenciar uma experiência do tipo Turismo de negócios, estou viajando família com filhos adolescentes e somos 7 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 6538, '2026-08-05 09:40:00-03'),
  ('clima', 'f9fa650f-60ff-46b1-a9be-3b89300c40d8', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'GRAMADO',
   NULL, NULL, NULL, NULL, NULL,
   804, 'nublado', 13.58,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 14h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: nublado
Temperatura atual: 14º
Maxima: 14º / Minima: 9º', NULL,
   true, NULL, 18272, '2026-08-12 14:14:00-03'),
  ('roteiro', '566e38c0-3b96-49ba-a75a-eb28ef10b14b', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado,RS',
   'Turismo de aventura', NULL, 'Sozinho', 1, 1500,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 1.500,00. Estou procurando vivenciar uma experiência do tipo Turismo de aventura, estou viajando sozinho e estou sozinho. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 10470, '2026-08-02 14:47:00-03'),
  ('clima', 'bf3d7933-855f-4fbd-a83b-e184c625552b', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado',
   NULL, NULL, NULL, NULL, NULL,
   801, 'algumas nuvens', 17.15,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 17h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: algumas nuvens
Temperatura atual: 17º
Maxima: 18º / Minima: 14º', NULL,
   true, NULL, 18545, '2026-08-02 17:34:00-03'),
  ('clima', 'e339a494-7aff-454b-a349-8a08221592c2', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado rs',
   NULL, NULL, NULL, NULL, NULL,
   741, 'névoa', 5.88,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 15h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: névoa
Temperatura atual: 6º
Maxima: 9º / Minima: 3º', NULL,
   true, NULL, 32160, '2026-08-05 15:24:00-03'),
  ('clima', 'bf3d7933-855f-4fbd-a83b-e184c625552b', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado RS',
   NULL, NULL, NULL, NULL, NULL,
   801, 'algumas nuvens', 17.7,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 22h (noite)
Saudacao correta para esta hora: "Boa noite"
O sol ja se pos - esta escuro la fora
Condicao: algumas nuvens
Temperatura atual: 18º
Maxima: 19º / Minima: 7º', NULL,
   true, NULL, 20054, '2026-08-09 22:38:00-03'),
  ('clima', 'e9c9b7f0-8c94-4b7a-a857-6f62f44a85e1', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado',
   NULL, NULL, NULL, NULL, NULL,
   500, 'chuva leve', 5.29,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 15h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: chuva leve
Temperatura atual: 5º
Maxima: 7º / Minima: 4º', NULL,
   true, NULL, 30539, '2026-08-04 15:17:00-03'),
  ('clima', 'bd6a5658-9187-4698-a81e-a371270a6cfb', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'gramado rs',
   NULL, NULL, NULL, NULL, NULL,
   701, 'névoa úmida', 10.16,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 17h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: névoa úmida
Temperatura atual: 10º
Maxima: 10º / Minima: 2º', NULL,
   true, NULL, 32000, '2026-08-10 17:32:00-03'),
  ('clima', '5364ee98-2bd5-48ce-a36f-f4fcf42a9978', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado',
   NULL, NULL, NULL, NULL, NULL,
   800, 'céu limpo', 15.24,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 11h (manha)
Saudacao correta para esta hora: "Bom dia"
O sol esta no ceu
Condicao: céu limpo
Temperatura atual: 15º
Maxima: 19º / Minima: 8º', NULL,
   true, NULL, 31955, '2026-08-02 11:31:00-03'),
  ('clima', '566e38c0-3b96-49ba-a75a-eb28ef10b14b', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado RS',
   NULL, NULL, NULL, NULL, NULL,
   500, 'chuva leve', 9.42,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 18h (noite)
Saudacao correta para esta hora: "Boa noite"
O sol ja se pos - esta escuro la fora
Condicao: chuva leve
Temperatura atual: 9º
Maxima: 14º / Minima: 5º', NULL,
   true, NULL, 29291, '2026-08-12 18:38:00-03'),
  ('clima', '77f87052-5b22-46cd-aab6-c003caa02947', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado,RS',
   NULL, NULL, NULL, NULL, NULL,
   741, 'névoa', 4.88,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 16h (tarde)
Saudacao correta para esta hora: "Boa tarde"
O sol esta no ceu
Condicao: névoa
Temperatura atual: 5º
Maxima: 10º / Minima: 3º', NULL,
   true, NULL, 23567, '2026-08-01 16:44:00-03'),
  ('roteiro', '7587d06d-be79-40c0-ac49-63c0dc8157cd', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado',
   'Turismo Gastronômico', 'Alta Gastronomia', 'Excursão de escola', 33, 3000,
   NULL, NULL, NULL,
   'gpt-4o', 'Olá. Minha localização é Gramado, RS e tenho um orçamento total de R$ 3.000,00. Estou procurando vivenciar uma experiência do tipo Turismo Gastronômico, no pilar Alta Gastronomia, estou viajando excursão de escola e somos 33 pessoas. Você pode me dar 3 boas recomendações para eu escolher e que estejam na minha localização Gramado, RS?', NULL,
   true, NULL, 7679, '2026-08-02 13:28:00-03'),
  ('clima', 'bf3d7933-855f-4fbd-a83b-e184c625552b', 'Gramado', 'RS', 'BR', -29.3789, -50.8761, 'gramado,br', 'Gramado, RS',
   NULL, NULL, NULL, NULL, NULL,
   501, 'chuva moderada', 4.4,
   'gpt-4o-mini', 'Cidade: Gramado, BR
Hora local agora: 18h (noite)
Saudacao correta para esta hora: "Boa noite"
O sol ja se pos - esta escuro la fora
Condicao: chuva moderada
Temperatura atual: 4º
Maxima: 11º / Minima: 4º', NULL,
   true, NULL, 31861, '2026-08-08 18:29:00-03');
