# Arquitetura de módulos — Mercado FiiS

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
| Planner (streak) | `/planner` |
| Rankings | `/rankings` |
| Notícias | `/news` |
| Detalhe do FII | `/fund/[ticker]` |

## Pastas por responsabilidade

```text
src/
  domain/           # Tipos por módulo (fund, portfolio, planner, learning…)
  services/         # Dados (Firebase / mocks / APIs futuras)
  hooks/            # Lógica de apresentação
  screens/          # Telas (UI)
  components/       # UI atômica + shell
  navigation/       # Mapa de módulos (APP_MODULES)
  contexts/         # Auth global
  theme/            # Tokens do design system
app/                # Rotas Expo Router (finas)
```

## Separações importantes

1. **Dados públicos do FII** (`funds`) ≠ **carteira do usuário** (`portfolio`)
2. **Planner** só acompanha meta/check-in — não guarda/movimenta dinheiro
3. **Aprender** nunca bloqueia o restante do app
4. Services não são chamados direto nas telas quando houver regra de negócio (usar hooks)

## Próximo preenchimento por módulo

1. ~~Fundos → MockProvider + busca~~ ✅
2. ~~Perfil do FII → indicadores + explicações~~ ✅
3. Carteira pessoal → CRUD de posições
4. ~~Planner → desafios 50/100/200 + check-in/streak~~ ✅
5. Aprender → lições nas trilhas já listadas
6. Trocar MockProvider por API/B3 (mesmo contrato de services)
