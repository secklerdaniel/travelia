# TravelIA

Previsão do tempo com análise e narração por IA, mais o roteiro "O que fazer
aqui". O clima é a porta de entrada; o roteiro é o produto, e cada consulta
vira inteligência de demanda para secretarias de turismo (`/dashboard`).

## Projetos irmãos

Antes de escrever qualquer texto que cite outro app da casa — faixa de
divulgação, rodapé, proposta —, ler
`C:\Users\Daniel\.openclaw\workspace\apps\manifesto\`. Um `.txt` por projeto,
com o que cada um faz de fato.

A regra existe porque a primeira versão da faixa da Mochila de Emergência
dizia "o que levar na mochila", deduzido do nome. O app cuida do controle de
validade dos itens — coisa diferente, e só descoberta ao abrir o site.

## Onde as decisões estão documentadas

- `supabase/*.sql` — migrações numeradas, cada uma explicando o porquê no topo.
- `src/config/prompts-padrao.ts` — prompts de fábrica; o banco só guarda o que
  foi editado no painel, e a linha editada VENCE o código.
- `docs/mochila-de-emergencia.txt` — cópia local do manifesto do projeto irmão.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
