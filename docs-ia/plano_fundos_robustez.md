# Plano — Robustez do módulo Fundos (MVP)

> **Goal:** Transformar a aba Fundos de hub de atalhos em experiência profissional de consulta + ferramentas, alinhada ao escopo (sem recomendação de compra/venda).

**Architecture:** Manter MockProvider/services; enriquecer telas e rotas de ferramentas. Separar sempre dado público do FII × posição pessoal × planner (meta/check-in).

**Stack:** Expo Router, hooks existentes (`useFundsCatalog`, `usePortfolio`, `usePlanner`), design tokens atuais.

**Spec:** `docs-ia/escopo.md` · checklist `docs-ia/checklist_sprints.md`

## Global Constraints

- Sem linguagem “compre / venda / invista”
- Mocks apenas; contrato pronto para API futura
- Mobile-first; UI no nível da Carteira (cards elevados, fade, tipografia Inter)

---

## Escopo deste sprint

| # | Entrega | Resultado |
| --- | --- | --- |
| 1 | Hub Fundos polido | Loading/empty, hierarquia clara, ferramentas com contexto |
| 2 | Comparar Tesouro IPCA+ | Fluxo próprio com escolha de FII (sem hardcode) |
| 3 | Rankings profundos | Métrica + segmento + lista ordenada + texto didático |
| 4 | Ponte Carteira | Card Fundos ↔ posição pessoal (sem misturar dados) |
| 5 | Ponte Planner | Entrada contextual para planejamento (sem movimentar $) |

## Fora deste sprint

- CRUD Firestore da carteira
- Fonte real B3 / Fundos Net
- Gráficos avançados de composição do fundo (Sprint 5 residual)

## Como validar

1. Aba Fundos: busca vazia mostra empty; loading; ferramentas descrevem o que fazem
2. Ferramenta Tesouro: escolher outro ticker muda DY/prêmio
3. Rankings: trocar métrica/segmento reordena lista
4. Ponte Carteira / Planner abrem rotas corretas com copy educacional

---

## Tasks

- [x] Documentar este plano
- [x] Hub + pontes
- [x] Tela Tesouro IPCA+
- [x] Rankings robustos
- [x] Checklist + typecheck
