-- =====================================================================
-- 8. Curinga estadual, vestuario de calor e R caipira reforcado
--
-- Tres correcoes na `regional_guides`, todas encontradas rodando o app:
--
-- 1) "Interior de SP" nunca era achado. A busca casa pelo NOME DA CIDADE, e
--    nenhuma cidade se chama assim - Campinas e Ribeirao caiam no guia
--    generico. A coluna `abrangencia` marca a linha como curinga do estado:
--    vale para qualquer cidade daquela UF que nao tenha guia proprio.
--
-- 2) Varias listas de vestuario so tinham roupa de frio. Em Belo Horizonte a
--    28 graus o modelo era obrigado a escolher entre "vista uma japona" (ruim)
--    e ignorar o vocabulario curado (o que ele fez). Cidade tem verao e
--    inverno; a lista precisa dos dois.
--
-- 3) O R retroflexo do interior paulista estava descrito, mas fraco demais
--    para o modelo de voz marcar. Agora vem com exemplos de pronuncia.
--
-- Rode depois do 07-regional-guides.sql. Pode rodar mais de uma vez.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Curinga do estado
-- ---------------------------------------------------------------------

alter table public.regional_guides
  add column if not exists abrangencia text not null default 'cidade';

alter table public.regional_guides
  drop constraint if exists regional_guides_abrangencia_check;

alter table public.regional_guides
  add constraint regional_guides_abrangencia_check
  check (abrangencia in ('cidade', 'estado'));

comment on column public.regional_guides.abrangencia is
  'cidade = guia daquela cidade. estado = curinga usado nas cidades da UF que nao tem linha propria.';

-- A unica linha que hoje e regional, nao municipal.
update public.regional_guides
   set abrangencia = 'estado'
 where local = 'Interior de SP';

-- O app le a UF do proprio rotulo ("Interior de SP" -> SP), entao nada mais
-- precisa ser preenchido. Para criar curinga de outro estado, basta uma linha
-- nova com a sigla no nome e abrangencia = 'estado'.

-- ---------------------------------------------------------------------
-- 2. Vestuario: acrescenta o calor onde so havia frio
--
-- Mantem tudo que ja estava la e soma as pecas de verao. O modelo escolhe
-- conforme a temperatura do momento.
-- ---------------------------------------------------------------------

update public.regional_guides
   set dica_vestuario = array['blusa de frio', 'jaqueta', 'agazalhozinho',
                             'regata', 'boné', 'óculos de sol', 'guarda-chuva']
 where local = 'Belo Horizonte / MG';

update public.regional_guides
   set dica_vestuario = array['japona', 'guarda-chuva', 'casaco de lã',
                             'segunda pele', 'camiseta', 'óculos de sol']
 where local = 'Curitiba / PR';

-- Porto Alegre passa dos 38 graus no verao e a lista so tinha anorak e manta.
update public.regional_guides
   set dica_vestuario = array['anorak', 'casaco pesado', 'japona', 'manta',
                             'regata', 'bermuda', 'chinelo', 'boné']
 where local = 'Porto Alegre / RS';

update public.regional_guides
   set dica_vestuario = array['blusa de frio na bolsa', 'guarda-chuva',
                             'jaqueta leve', 'camiseta', 'óculos de sol']
 where local = 'São Paulo / SP (Capital)';

update public.regional_guides
   set dica_vestuario = array['jaqueta de couro', 'botina', 'agazalho',
                             'chapéu', 'camiseta', 'chinelo']
 where local = 'Interior de SP';

-- ---------------------------------------------------------------------
-- 3. R caipira mais marcado
--
-- Exemplos de pronuncia dentro da instrucao: e o que faz o modelo de voz
-- executar o tracco em vez de so "saber" que ele existe.
-- ---------------------------------------------------------------------

update public.regional_guides
   set tracos_foneticos_tts =
     'R caipira retroflexo FORTE e obrigatório em todo R no meio e no fim das '
     || 'palavras, com a língua enrolada para trás: porrta, verrde, calorr, '
     || 'chegarr, trabalhadorr. Ritmo pausado e arrastado, vogais abertas, '
     || 'tom de prosa de quem tem tempo e trata bem.'
 where local = 'Interior de SP';

-- Opcional: o mesmo R marcado em Goiania, que tem o mesmo traço caipira.
-- Rode so se gostar do resultado no interior de SP.
--
-- update public.regional_guides
--    set tracos_foneticos_tts =
--      'R caipira retroflexo FORTE em todo R no meio e no fim das palavras: '
--      || 'porrta, verrde, calorr. Tom de voz arrastado, ritmo pausado e acolhedor.'
--  where local = 'Goiânia / GO';

-- ---------------------------------------------------------------------
-- Conferencia
-- ---------------------------------------------------------------------
-- select local, abrangencia, dica_vestuario from public.regional_guides
--  order by abrangencia desc, local;
