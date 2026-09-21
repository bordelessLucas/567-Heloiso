# Arquitetura de módulos — Mercado FiiS

> Ver também `docs-ia/context.md` (decisões da reunião) e `docs-ia/escopo.md`.

## Navegação principal (tabs)

| Aba | Rota | Domínio |
| --- | --- | --- |
| Início | `/(tabs)` | Home / atalhos |
| Fundos | `/(tabs)/funds` | Consulta e análise de FIIs |
| Carteira | `/(tabs)/portfolio` | Posição pessoal do investidor |
| Aprender | `/(tabs)/learn` | Educação (voluntária) |
| Perfil | `/(tabs)/profile` | Conta do usuário |

## Rotas complementares (stack)

| Tela | Rota |
| --- | --- |
| Planner (streak) | `/planner` (`?from=funds` contextual) |
| Rankings | `/rankings` (métrica + segmento) |
| Comparar Tesouro IPCA+ | `/tools/tesouro-ipca` (`?ticker=`) |
| Notícias | `/news` |
| Detalhe do FII | `/fund/[ticker]` |
| Posição (holding) | `/holding/[ticker]` |
| **Poupar em vez de gastar** | `/tools/poupar` |

## Pastas por responsabilidade

```text
src/
  domain/           # Tipos por módulo (fund, portfolio, planner, learning…)
  services/         # Dados (Firebase / mocks / market-data)
  hooks/            # Lógica de apresentação
  screens/          # Telas (UI)
  components/       # UI atômica + shell
  navigation/       # Mapa de módulos (APP_MODULES)
  contexts/         # Auth global
  theme/            # Tokens do design system
app/                # Rotas Expo Router (finas)
```

## Separações importantes

1. **Dados públicos do FII** (`funds` / market-data) ≠ **carteira do usuário** (`portfolio`)
2. **Mercado (API)** ≠ **conteúdo próprio** (trilhas, vídeos, análises customizadas)
3. **Planner** só acompanha meta/check-in — não guarda/movimenta dinheiro
4. **Poupar em vez de gastar**: equivalência em cotas ≠ compra real (MVP); ≠ Planner; persistência local AsyncStorage (`@mercadofiis/poupar_v1_{uid}`) com esquema alinhado a `users/{uid}/savingRules|savingEvents`
5. **Aprender** nunca bloqueia o restante do app
6. Services não são chamados direto nas telas quando houver regra de negócio (usar hooks)

## Dados de mercado

| Camada | Hoje | Direção |
| --- | --- | --- |
| Contrato | `src/services/market-data/types.ts` (`MarketDataProvider`) | Manter desacoplado |
| Provider | HG Brasil — quotes + dividends | Avaliar plano/limites; não trocar sem necessidade |
| Cache | In-memory no client (TTL ~30 min) | Evoluir para sync/cache **centralizado** (Firestore/Cloud Function ou equivalente) compartilhado entre usuários |
| Catálogo | `MOCK_FUNDS` + enrich HG | Substituir origem da lista por API de mercado (sem CRUD admin de FII) |
| Documentos oficiais | Mock em `FundDocument` | B3 / provedor → serviço interno → aba Docs do detalhe |
| Histórico de preço | Provider retorna `[]` | Completar quando a fonte permitir |

## Firestore (rules existentes × uso no app)

| Path | Rules | App hoje |
| --- | --- | --- |
| `users/{uid}` | sim | perfil / `investorProfile` |
| `users/{uid}/sensitive/{doc}` | sim | formulário sensível |
| `funds/{fundId}` | sim | **não usado** (mock) |
| `portfolios/{userId}/**` | sim | **não usado** (store local) |
| `users/{uid}/savingRules/**` | sim | App: AsyncStorage MVP (schema pronto p/ sync) |
| `users/{uid}/savingEvents/**` | sim | App: AsyncStorage MVP (schema pronto p/ sync) |
| Coleção/docs de trilhas educacionais | — | **planejado** (substituir hardcoded) |

### Sugestão técnica — módulo “Poupar em vez de gastar”

Reaproveitar padrão sob o usuário (só após validar na implementação):

`users/{uid}/savingRules/{ruleId}`

- `label`, `defaultAmount`, `ticker`, `active`, `createdAt`, `updatedAt`

`users/{uid}/savingEvents/{eventId}`

- `ruleId`, `label`, `amount`, `ticker`, `quote`, `equivalentShares`, `createdAt`

Cotação no evento: snapshot do `MarketDataProvider` no momento do “Poupei”.

## Carteira × Aprender

- Domínio do fundo já tem `FundSegment` (logística, papel, híbrido, renda urbana, lajes, shopping, …).
- UI da Carteira: `AllocationRing` com toggle **por segmento** / **por ativo** + lista de pesos por tipo.
- Trilhas ensinam balanceamento; **alvos percentuais** são conteúdo educacional configurável — não constantes fixas do app.

## Perfil do investidor

- `InvestorProfileType`: `conservative` | `moderate` | `aggressive` (UI: Conservador / Moderado / Arrojado).
- Classificação por **risco**, não por patrimônio.
- Questionário → cálculo → `investorProfile`: aguardando formulário do cliente (`InvestorProfileAnswers` stub).
- Campos sensíveis estruturados para **segmentação futura** (admin/filtros); campanhas fora do escopo atual.

## Próximo preenchimento por módulo

1. ~~Fundos → MockProvider + busca~~ ✅  
2. ~~Perfil do FII → indicadores + explicações~~ ✅  
3. ~~Fundos robustez → Tesouro, rankings, pontes~~ ✅  
4. **Mercado** → catálogo via API + cache/sync centralizado  
5. **Documentos oficiais** → B3/provedor no detalhe do FII  
6. Carteira pessoal → CRUD Firestore + **composição por segmento**  
7. ~~Planner → desafios + check-in/streak~~ ✅  
8. Aprender → estrutura dinâmica + novas trilhas (ex.: 1º aporte via banco)  
9. Perfil → questionário (material do cliente) + refino objetivo/horizonte  
10. ~~**Poupar em vez de gastar** → rules + events + UI~~ ✅ (AsyncStorage; rules Firestore prontas)  
11. Futuro → corretora / ordens reais; campanhas segmentadas; sync Firestore do Poupar  
