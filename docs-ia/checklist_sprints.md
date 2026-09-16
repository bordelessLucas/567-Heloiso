# Checklist de Sprints — Mercado FiiS

## Sprint 0 — Fundação

- [x] Setup Expo Router + TypeScript + EAS
- [x] Firebase init (`.env` + `src/services/firebase.ts`)
- [x] Memory Bank (`escopo`, `design_system`, `checklist_sprints`)
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

## Sprint 2 — Navegação e Home

- [x] Shell de navegação (tabs: Home, Fundos, Carteira, Aprender, Planner)
- [x] Home com proposta da plataforma e atalhos dos módulos
- [x] Estados vazios e loading skeleton
- [x] Rotas complementares: Rankings, Notícias, Perfil
- [x] Domínios + stubs de services por módulo
- [x] Documento `docs-ia/arquitetura.md`

## Sprint 3 — Fundos (busca e listagem)

- [x] Domínio `funds` + MockProvider (snapshot estático)
- [x] Busca por ticker / nome / segmento
- [x] Filtros e listagem (Mais buscados + chips)
- [x] Navegação para perfil do FII
- [x] Rankings cards (DY, liquidez, patrimônio)

## Sprint 4 — Perfil do FII e indicadores

- [x] Página do fundo (abas/seções)
- [x] Indicadores: P/VP, DY, Vacância, PL, Liquidez
- [x] Explicações didáticas por indicador
- [x] Dados básicos (segmento, cota, patrimônio, etc.)
- [x] Comparação FII × Tesouro IPCA+ (mock)
- [x] Documentos mock + leitura guiada

## Sprint 5 — Carteira do fundo e leitura guiada

- [x] Composição / concentração / geografia (mock)
- [x] Leitura guiada (positivo / atenção / neutro) sem linguagem de recomendação
- [ ] Gráficos avançados de composição (evolução futura)

## Sprint 6 — Prioridade 2 (dados e carteira pessoal)

- [x] Documentos do fundo (estrutura + mock)
- [x] Ranking (DY e filtros)
- [x] Comparação FII × Tesouro IPCA+
- [ ] Carteira pessoal (CRUD de posições)

## Sprint 6b — Robustez Fundos (ferramentas)

- [x] Hub Fundos: loading/empty, hierarquia das ferramentas, pontes Carteira/Planner
- [x] Comparar Tesouro IPCA+ com escolha de FII (`/tools/tesouro-ipca`)
- [x] Rankings profundos (métrica + segmento + tip didático)
- [x] Detalhe do FII → comparação completa
- [x] Planner contextual `?from=funds` (sem movimentar dinheiro)

## Sprint 7 — Prioridade 3 (engajamento)

- [ ] Módulo Aprender (trilhas iniciais com lições)
- [x] Planner + check-ins + streak (AsyncStorage local)
- [ ] Questionário de perfil do investidor
- [ ] Notícias (fonte estruturada)

## Sprint 8 — Admin e hardening

- [ ] Painel admin (lista/filtros de usuários)
- [ ] Roles `admin` / `admin_readonly`
- [ ] Revisão de Rules, índices e privacidade de dados sensíveis
- [ ] Preparação EAS production / stores
