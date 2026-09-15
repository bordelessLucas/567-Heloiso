# Status da Fundação — Mercado FiiS

Atualizado em: 2026-09-15

## O que já está pronto

| Área | Status | Onde |
| --- | --- | --- |
| Escopo / regras de negócio | Pronto | `docs-ia/escopo.md` |
| Design System (docs + tokens) | Pronto | `docs-ia/design_system.md`, `src/theme/tokens.ts` |
| Componentes UI atômicos | Pronto | `src/components/` |
| Auth services + AuthContext | Pronto | `src/services/auth.service.ts`, `user.service.ts`, `src/contexts/AuthContext.tsx` |
| Login / Cadastro / Logout ligados ao Firebase | Pronto | `src/screens/LoginScreen.tsx`, `RegisterScreen.tsx`, `HomeScreen.tsx` |
| Gate de rotas | Pronto | `app/index.tsx`, `app/(auth)/_layout.tsx`, `app/(tabs)/_layout.tsx` |
| Firestore Rules + Indexes | Deployados no projeto `heloiso-760fa` | `firestore.rules`, `firestore.indexes.json` |
| Shell de módulos (Sprint 2) | Pronto | Tabs + Rankings/Notícias/Perfil + `docs-ia/arquitetura.md` |

## Checklist rápido no Firebase Console

1. Authentication → Sign-in method → **E-mail/senha** habilitado
2. Firestore Database criado (já feito no deploy de rules)
3. App com `.env` apontando para `heloiso-760fa`

## Próximos passos do MVP (ordem)

1. **Sprint 3** — MockProvider de FIIs + busca/listagem
2. **Sprint 4** — Perfil do FII + indicadores didáticos
3. **Sprint 5** — Carteira do fundo + leitura guiada (sem recomendação)
4. Em paralelo estrutural: preencher Carteira pessoal e Planner (check-ins diários)

Detalhamento completo: `docs-ia/checklist_sprints.md` e `docs-ia/arquitetura.md`
