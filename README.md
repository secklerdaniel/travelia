# TravelIA — Clima Web

Previsão do tempo com análise escrita e narrada pela OpenAI, no sotaque da
cidade consultada. Tudo é salvo no Supabase.

## Como rodar

**1. Crie a tabela no Supabase**

Abra o SQL Editor do seu projeto e rode [`supabase/schema.sql`](supabase/schema.sql).
Ele cria a tabela `clima`, o índice único por cidade e o bucket público
`clima-audio` do Storage.

**2. Preencha as chaves em `.env.local`**

A chave da OpenWeather já está lá. Faltam:

| Variável | Onde pegar |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | mesma tela, seção *Project API keys* |
| `OPENAI_API_KEY` | platform.openai.com → API keys |

O texto e o áudio usam a **mesma** chave da OpenAI. Para trocar a voz, mude
`OPENAI_TTS_VOICE`: `alloy`, `ash`, `ballad`, `coral`, `echo`, `fable`, `nova`,
`onyx`, `sage`, `shimmer` ou `verse`.

**3. Suba o servidor**

```bash
npm run dev
```

Abra http://localhost:3000 e digite uma cidade (`Canela,BR` ou `São Paulo`).

## O fluxo de uma busca

`POST /api/clima` faz, em ordem:

1. consulta a OpenWeather em `pt_BR` e `metric`;
2. grava **todos** os campos na tabela `clima` (inclusive o JSON cru em `raw`);
3. pede a análise descontraída à OpenAI;
4. manda o texto para o `gpt-4o-mini-tts` e sobe o mp3 no Storage;
5. grava `analise_texto`, `audio_url` e `audio_path` na mesma linha.

Se a etapa 3 ou 4 falhar, o clima **já está salvo** e o erro volta em `avisos` —
o card aparece, só sem áudio.

A chave da linha é `city_query` (cidade normalizada, sem acento). Então
**Atualizar** é um upsert: sobrescreve a mesma linha e apaga o mp3 antigo do
bucket. **Deletar** remove a linha e o mp3.

## Estrutura

```
src/
  app/
    page.tsx              busca + card + lista de cidades salvas
    o-que-fazer/page.tsx  espaço reservado (recebe ?cidade= do card)
    api/clima/route.ts    GET (listar) · POST (buscar+salvar) · DELETE
  components/
    WeatherCard.tsx       card com fundo por condição
    AudioPlayer.tsx       play/pause + barra de progresso
  lib/
    openweather.ts        chamada + mapeamento para as colunas
    openai.ts             prompt da análise com sotaque
    tts.ts                narração (gpt-4o-mini-tts) + upload no Storage
    supabase.ts           client de servidor (service_role)
    weather-theme.ts      gradiente/emoji/animação por condição
    format.ts             datas no fuso da cidade consultada
```

## Busca de cidade

O termo digitado passa por
[`normalizeCitySearch`](src/lib/search/normalizeCitySearch.ts) — **módulo único**,
nenhum componente normaliza cidade por conta própria — e só então vai para a
Geocoding API:

```
"  TÓQUIO "  ──normaliza──►  "toquio"  ──alias?──►  "Toquio"
                                                       │
                          /geo/1.0/direct ◄────────────┘
                                  │
                                  ├──► nome + país  (o que aparece na tela)
                                  └──► lat/lon ──► /data/2.5/weather
```

A normalização serve **só para buscar**. O nome exibido vem sempre da OpenWeather.

### O dicionário é pequeno de propósito

A Geocoding API já entende quase todo nome em português — `toquio`, `londres`,
`pequim`, `moscou`, `cidade do cabo`, `nova iorque` funcionam sem alias nenhum.
Testando 49 nomes, só **6** falharam, e são esses os únicos em
[`CITY_ALIASES`](src/config/city-aliases.ts).

Antes de adicionar um alias, consulte `/geo/1.0/direct?q=<termo>&limit=1`: só
vale a entrada se o resultado vier vazio ou apontar para o lugar errado.

Tradução automática está fora de questão — **Vitória** viraria "Victory",
**Salvador** viraria "Savior" e **Natal** viraria "Christmas".

### Duas armadilhas resolvidas

**O nome vem do geocoding, não do clima.** Consultado por lat/lon, o endpoint de
clima devolve o nome da estação meteorológica mais próxima: as coordenadas de
Sydney retornam `Haymarket`. Quem resolve localidade é o geocoding; o endpoint de
clima só entrega as medições.

**A chave do banco sai da localidade resolvida**, nunca do texto digitado. Se
saísse da entrada, `tóquio`, `toquio` e `TOKYO` criariam três cards da mesma
cidade. O país entra na chave porque existem homônimas (Santiago do Chile e
Santiago de Cuba).

## Backgrounds da previsão

A imagem de fundo sai de duas informações da OpenWeather, **nunca** do
`description` (que muda conforme o `lang` da requisição):

| Campo | Decide |
| --- | --- |
| `weather.id` | a **categoria** (`clear`, `lightRain`, `overcast`, …) |
| `weather.icon` | se termina em `n`, usa `night`; caso contrário `day` |

```
weather.id 500  ──► WEATHER_CODE_MAP ──► "lightRain" ─┐
                                                      ├──► /weather/light-rain/night.webp
weather.icon "10n" ──► sufixo "n" ──► "night" ────────┘
```

Três arquivos, cada um com uma responsabilidade:

- [`src/config/weather-codes.ts`](src/config/weather-codes.ts) — `WEATHER_CODE_MAP`.
  **Único lugar do projeto com os números da OpenWeather.**
- [`src/config/weather-backgrounds.ts`](src/config/weather-backgrounds.ts) —
  `WEATHER_BACKGROUNDS`, os caminhos dos assets.
- [`src/lib/weather/getWeatherBackground.ts`](src/lib/weather/getWeatherBackground.ts) —
  `getWeatherBackground(weatherId, icon)`.

Nada lança erro: id desconhecido cai em `clear`, ícone ausente ou inválido cai
em `day`.

### Os assets

`public/weather/<categoria>/{day,night}.webp` — 28 arquivos, verticais 9:16,
**somente céu** (sem cidade, prédio, horizonte, montanha, pessoa, texto ou
ícone), aplicados com `cover` e centralizados. Enquanto um arquivo não existir,
o card desenha a cena ilustrada em SVG em vez de mostrar um buraco.

Sobre a foto ainda entram a tinta do tema (em `soft-light`, para a cor continuar
contando a condição do tempo), a chuva/neve animada e um véu mais forte que o
normal, porque fotografia tem pontos de luz que competem com o texto.

## Detalhes que importam

- **Nenhuma chave vai para o navegador.** Tudo passa pela API Route.
- **O sotaque entra duas vezes.** A OpenAI escreve o texto com as gírias do
  lugar, e o `gpt-4o-mini-tts` recebe um campo `instructions` pedindo a
  entonação e o ritmo daquela cidade — então a narração acompanha o texto.
- **Datas no fuso da cidade.** A OpenWeather manda epoch UTC + offset; o
  `format.ts` soma os dois e lê com getters UTC, então "Nascer do sol 06:35" é
  06:35 *lá*, não no seu computador.
- **Fundo do card** muda por faixa de `weather.id` e por dia/noite (sufixo `d`/`n`
  do ícone): chuva tem riscos caindo, noite limpa tem estrelas, tempestade tem
  relâmpago. Tudo respeita `prefers-reduced-motion`.
