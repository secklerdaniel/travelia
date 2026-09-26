-- =====================================================================
-- 9. Cobertura por regiao e limpeza do interior paulista
--
-- Dois defeitos que apareceram assim que o curinga estadual entrou:
--
-- 1) Guaruja e praia e herdou o guia do interior - botina e jaqueta de couro
--    a 25 graus, na beira do mar. "Estado" e uma unidade grossa demais para
--    dialeto: em SP, capital, interior e litoral falam diferente.
--
--    A coluna `cidades_cobertas` deixa uma linha regional dizer de quem ela
--    cuida. Continua valendo o curinga: a linha regional SEM lista atende o
--    resto do estado.
--
-- 2) "Interior de SP" carregava "uai" e "bao demais", que sao marcadores de
--    Minas - os mesmos da linha de Belo Horizonte. Campinas saiu falando uai
--    e sugerindo pao de queijo.
--
-- Rode depois do 08. Pode rodar mais de uma vez.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Cobertura declarada
-- ---------------------------------------------------------------------

alter table public.regional_guides
  add column if not exists cidades_cobertas text[] not null default '{}';

comment on column public.regional_guides.cidades_cobertas is
  'Cidades atendidas por uma linha regional (abrangencia = estado). Vazio = curinga do estado inteiro.';

-- ---------------------------------------------------------------------
-- 2. Litoral paulista
--
-- Praia o ano inteiro, fala mais proxima da capital que da roca, e o
-- vocabulario de roupa nao tem nada de botina.
-- ---------------------------------------------------------------------

insert into public.regional_guides
  (local, abrangencia, cidades_cobertas, girias_locais, dica_vestuario,
   tracos_foneticos_tts, voz_tts_id)
values (
  'Litoral de SP',
  'estado',
  array['Santos', 'Guarujá', 'São Vicente', 'Praia Grande', 'Bertioga',
        'Ubatuba', 'Caraguatatuba', 'São Sebastião', 'Ilhabela', 'Peruíbe',
        'Itanhaém', 'Mongaguá'],
  array['maré', 'caiçara', 'da hora', 'firmeza', 'sujou', 'tá tranquilo',
        'pé na areia'],
  array['chinelo', 'regata', 'bermuda', 'boné', 'óculos de sol', 'protetor',
        'corta-vento', 'blusa de moletom'],
  'Sotaque paulista de praia: mais lento e relaxado que o da capital, S levemente '
  || 'chiado, vogais alongadas no fim das frases, ritmo de quem mora onde os outros '
  || 'passam as ferias.',
  'alloy'
)
on conflict (local) do update
   set abrangencia = excluded.abrangencia,
       cidades_cobertas = excluded.cidades_cobertas,
       girias_locais = excluded.girias_locais,
       dica_vestuario = excluded.dica_vestuario,
       tracos_foneticos_tts = excluded.tracos_foneticos_tts,
       voz_tts_id = excluded.voz_tts_id;

-- ---------------------------------------------------------------------
-- 3. Interior de SP sem os mineirismos
--
-- Sai "uai" e "bao demais" (Minas), entra o caipira paulista. "Porca miseria"
-- fica: e heranca da imigracao italiana, muito viva no interior.
-- ---------------------------------------------------------------------

update public.regional_guides
   set girias_locais = array['vixe', 'véio', 'cumpadi', 'ocê', 'porca miséria',
                            'mancada', 'capaz', 'nó']
 where local = 'Interior de SP';

-- ---------------------------------------------------------------------
-- Conferencia
-- ---------------------------------------------------------------------
-- select local, abrangencia, cidades_cobertas, girias_locais
--   from public.regional_guides
--  where abrangencia = 'estado';
