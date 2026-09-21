# Checklist de Sprints — Mercado FiiS

> Legenda: **[x]** concluído · **[~]** parcial · **[N]** novo / bloqueado por dependência · **[F]** futuro · **[?]** aguardando material  
> Validação Sprints 2–8 em 2026-09-21. Detalhes: `docs-ia/context.md`.

## Sprint 0 — Fundação

- [x] Setup Expo Router + TypeScript + EAS
- [x] Firebase init (`.env` + `src/services/firebase.ts`)
- [x] Memory Bank (`escopo`, `design_system`, `checklist_sprints`, `context`)
- [x] Auth service + user service + AuthContext
- [x] Firestore Rules + índices documentados
- [x] Design System atômico (Button, Input, Typography, Container)
- [x] Telas base: Login, Cadastro, Home (UI)
- [x] Integrar UI de auth com Firebase (handlers reais + gate de rotas)

## Sprint 1 — Autenticação e perfil básico

- [x] Integrar Login/Cadastro com Firebase Auth
- [x] Gravar perfil `users/{uid}` (nome, e-mail, role `investor`)
- [x] Recuperação de senha
- [x] Proteção de rotas (auth gate)
- [x] Logout

## Sprint 2 — Navegação e Home ✅ (validado)

- [x] Shell de navegação (tabs: Home, Fundos, Carteira, Aprender, Perfil; Planner em stack)
- [x] Home com proposta da plataforma e atalhos dos módulos
- [x] Estados vazios e loading (ActivityIndicator / EmptyState)
- [x] Rotas complementares: Rankings, Notícias, Perfil
- [x] Domínios + stubs de services por módulo
- [x] Documento `docs-ia/arquitetura.md`

## Sprint 3 — Fundos (busca e listagem) ✅ / parcial API

- [x] Domínio `funds` + MockProvider (snapshot estático)
- [x] Busca por ticker / nome / segmento
- [x] Filtros e listagem (Mais buscados + chips)
- [x] Navegação para perfil do FII
- [x] Rankings cards (DY, liquidez, patrimônio)
- [~] Overlay de cotações HG Brasil (quotes/dividends + cache client) — aguarda plano pago do cliente
- [N] Catálogo de FIIs sincronizado com mercado via API — **adiado** (decisão: manter HG quando DB/API estiverem pagos)

## Sprint 4 — Perfil do FII e indicadores ✅ / docs oficiais adiados

- [x] Página do fundo (abas/seções)
- [x] Indicadores: P/VP, DY, Vacância, PL, Liquidez
- [x] Explicações didáticas por indicador
- [x] Dados básicos (segmento, cota, patrimônio, etc.)
- [x] Comparação FII × Tesouro IPCA+ (fluxo com escolha de FII)
- [~] Documentos (estrutura + mock; sem PDFs oficiais / B3)
- [N] Documentos oficiais via B3/provedor — **adiado** (mesma dependência de dados)

## Sprint 5 — Carteira do fundo e leitura guiada ✅

- [x] Composição / concentração / geografia (mock)
- [x] Leitura guiada (positivo / atenção / neutro) sem linguagem de recomendação
- [x] Gráficos de composição (barras por ativo e por geografia)

## Sprint 6 — Prioridade 2 (dados e carteira pessoal)

- [~] Documentos do fundo (estrutura + mock; oficiais adiados)
- [x] Ranking (DY e filtros)
- [x] Comparação FII × Tesouro IPCA+
- [x] Carteira pessoal (CRUD: AsyncStorage + sync Firestore `portfolios/{uid}/…`)
- [x] Composição da carteira do usuário **por segmento** (% / concentração)
- [N] Cache/sync centralizado multi-usuário de mercado — **adiado** (API)

## Sprint 6b — Robustez Fundos (ferramentas) ✅

- [x] Hub Fundos: loading/empty, hierarquia das ferramentas, pontes Carteira/Planner
- [x] Comparar Tesouro IPCA+ com escolha de FII (`/tools/tesouro-ipca`)
- [x] Rankings profundos (métrica + segmento + tip didático)
- [x] Detalhe do FII → comparação completa
- [x] Planner contextual `?from=funds` (sem movimentar dinheiro)

## Sprint 7 — Prioridade 3 (engajamento)

- [x] Módulo Aprender (trilhas com lições + capas + progresso local)
- [~] Estrutura dinâmica de trilhas (ainda no código; pronta para extrair/CMS depois)
- [x] Trilha “primeiro aporte” via apps de banco (`first-buy-bank`)
- [x] Planner + check-ins + streak (AsyncStorage local)
- [x] Perfil Conservador / Moderado / Arrojado (seleção manual por risco)
- [?] Questionário de suitability → classificação automática (**aguardando formulário do cliente**)
- [x] Objetivo e horizonte alinhados à reunião (anos 2–25 + metas aposentadoria/patrimônio/imóvel…)
- [x] Notícias (fonte estruturada mock + UI)
- [x] Módulo **Poupar em vez de gastar**

## Sprint 8 — Admin e hardening

- [x] Painel admin (lista/filtros de usuários) — `/admin/users`
- [~] Roles `admin` / `admin_readonly` (tipos + gate na UI; atribuição ainda manual no Firestore)
- [~] Rules/índices existentes; deploy rules depende de permissão no projeto Firebase
- [~] EAS: `eas.json` com development/preview/production + submit — credenciais de store fora do repo
- [N] Admin/CMS leve de conteúdo (trilhas) — evolução futura
- [~] Campos de perfil opcionais agora (obrigatoriedade progressiva depois)

## Sprint 9

Não existe no planejamento atual (checklist encerra na Sprint 8 + Futuro).

## Fora do MVP imediato / Futuro

- [F] Integração com corretora + ordem real de compra a partir do “Poupei”
- [F] Campanhas / disparos comerciais segmentados por renda/perfil
- [F] Percentuais-alvo de diversificação como regra operacional fixa do sistema
- [F] Formato definitivo unificado de “análise do fundo” (indicadores + docs + notícias)
- [F] Catálogo/docs oficiais 100% via API/B3 (aguardando cliente)
