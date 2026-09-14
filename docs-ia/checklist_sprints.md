# Checklist de Sprints — Mercado FiiS

## Sprint 0 — Fundação

- [x] Setup Expo Router + TypeScript + EAS
- [x] Firebase init (`.env` + `src/services/firebase.ts`)
- [x] Memory Bank (`escopo`, `design_system`, `checklist_sprints`)
- [x] Auth service + user service + AuthContext
- [x] Firestore Rules + índices documentados
- [x] Design System atômico (Button, Input, Typography, Container)
- [x] Telas base: Login, Cadastro, Home (UI)
- [ ] Integrar UI de auth com Firebase (handlers reais + gate de rotas)

## Sprint 1 — Autenticação e perfil básico

- [ ] Integrar Login/Cadastro com Firebase Auth
- [ ] Gravar perfil `users/{uid}` (nome, e-mail, role `investor`)
- [ ] Recuperação de senha
- [ ] Proteção de rotas (auth gate)
- [ ] Logout

## Sprint 2 — Navegação e Home

- [ ] Shell de navegação (tabs: Home, Fundos, Carteira, Aprender, Planner)
- [ ] Home com proposta da plataforma e atalhos dos módulos
- [ ] Estados vazios e loading skeleton

## Sprint 3 — Fundos (busca e listagem)

- [ ] Domínio `funds` + MockProvider
- [ ] Busca por ticker / nome / segmento
- [ ] Filtros e listagem
- [ ] Navegação para perfil do FII

## Sprint 4 — Perfil do FII e indicadores

- [ ] Página do fundo (abas/seções)
- [ ] Indicadores: P/VP, DY, Vacância, PL, Liquidez
- [ ] Explicações didáticas por indicador
- [ ] Dados básicos (segmento, cota, patrimônio, etc.)

## Sprint 5 — Carteira do fundo e leitura guiada

- [ ] Composição / concentração / geografia
- [ ] Gráficos legíveis
- [ ] Leitura guiada (positivo / atenção / neutro) sem linguagem de recomendação

## Sprint 6 — Prioridade 2 (dados e carteira pessoal)

- [ ] Documentos do fundo
- [ ] Ranking (DY e filtros)
- [ ] Comparação FII × Tesouro IPCA+
- [ ] Carteira pessoal (CRUD de posições)

## Sprint 7 — Prioridade 3 (engajamento)

- [ ] Módulo Aprender (trilhas iniciais)
- [ ] Planner + check-ins + gamificação sóbria
- [ ] Questionário de perfil do investidor
- [ ] Notícias (fonte estruturada)

## Sprint 8 — Admin e hardening

- [ ] Painel admin (lista/filtros de usuários)
- [ ] Roles `admin` / `admin_readonly`
- [ ] Revisão de Rules, índices e privacidade de dados sensíveis
- [ ] Preparação EAS production / stores
