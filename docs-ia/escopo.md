# Escopo — Mercado FiiS

> Alinhado a `docs-ia/context.md` (reunião com o cliente — só voz do cliente gravada).

## Objetivo principal

Plataforma mobile (Android/iOS) do ecossistema de **Fundos de Investimento Imobiliário (FIIs)** que centraliza informações públicas, facilita a análise e ensina investidores a interpretar carteiras e indicadores — **sem tomar decisões de investimento pelo usuário**.

Experiência-alvo: visual, organizada, didática, simples, confiável e sofisticada.

## Princípio central

Cada funcionalidade deve ajudar o investidor a **encontrar**, **compreender** e **organizar** informações, mantendo a **decisão final com o próprio investidor**.

## Separação conceitual (confirmada)

| Mercado (preferencialmente API) | Conteúdo próprio (alimentável) |
| --- | --- |
| Lista de FIIs, preços, indicadores, cotações | Trilhas, aulas, vídeos, slides |
| Informações públicas; documentos oficiais quando disponíveis | Explicações e análises customizadas |

- **Não** manter lista de FIIs por CRUD administrativo de cadastro/remoção manual.
- Conteúdo educacional e análises próprias do cliente **podem** ser atualizados ao longo do tempo.

## Perfis de usuário

| Perfil | Descrição | Papel técnico (`role`) |
| --- | --- | --- |
| Investidor | Usuário final do app (iniciante, intermediário ou avançado) | `investor` |
| Administrador completo | Consulta, altera e gerencia a plataforma | `admin` |
| Administrador somente leitura | Consulta usuários e dashboards, sem alterações sensíveis | `admin_readonly` |

### Classificação do investidor (produto, não auth) — confirmada

Três classificações fechadas:

- Conservador
- Moderado
- Arrojado

Critério: **apetite / exposição ao risco** (tipo de ativo), **não** patrimônio ou renda.

Questionário automático de suitability: **necessário**; perguntas **aguardando formulário de referência do cliente** (não inventar).

Campos patrimoniais/renda/objetivo/horizonte: **opcionais na fase atual**; podem tornar-se obrigatórios depois para personalização.  
Formato exato de objetivo × horizonte: **a confirmar/refinar** (ver `context.md`).

Dados sensíveis com LGPD; **não** inventar obrigatoriedade sem confirmação.

## Regras de negócio críticas

1. Não transformar análise em recomendação financeira explícita (evitar “compre”, “venda”, “invista”).
2. Explicar indicadores de forma didática (o que significa, como interpretar, cuidados).
3. Separar informações oficiais de interpretações do sistema.
4. Informar origem e atualização dos dados quando possível.
5. Não inventar dados financeiros; mocks só em protótipo/desenvolvimento.
6. Separar **dados públicos do FII** de **posição individual do usuário**.
7. Dados financeiros pessoais com cuidado e proteção adequada.
8. Camada de dados desacoplada da UI (troca futura de fontes: Fundos Net / B3 / APIs).
9. Priorizar experiência **mobile-first**.
10. Não implementar pagamentos/produtos comerciais extras sem fluxo definido.
11. Não obrigar o módulo educacional antes de usar o restante do app.
12. Planner acompanha metas/check-ins — **não movimenta dinheiro**.
13. Módulo “Poupar em vez de gastar”: equivalência em cotas é **educativa/perceptiva** no MVP — **não** é compra real.
14. Percentuais de diversificação ensinados nas trilhas são **conteúdo educacional configurável** — não regras fixas hardcoded do motor da carteira.
15. Consultas a provedores de mercado devem privilegiar **cache / sync centralizado**; evitar 1 chamada externa por usuário por visualização.

## Cadastro básico (auth)

- Nome
- E-mail
- Senha

Demais dados financeiros ficam **fora** do cadastro básico.

## Pilares do produto

1. Análise e consulta de FIIs (inclui documentos oficiais quando disponíveis)
2. Carteira pessoal do investidor (composição por segmento)
3. Aprendizado sobre investimentos (trilhas dinâmicas ao longo do tempo)
4. Planner e desafios de poupança (hábito; sem movimentar $)
5. **Novo:** “Poupar em vez de gastar” (gasto evitado → equivalência em cotas)

Complementares: perfil do investidor, notícias, rankings, painel admin, segmentação futura de usuários (sem campanhas nesta fase).

## Funcionalidades core (MVP — Prioridade 1)

- Home com proposta da plataforma e acesso aos módulos
- Navegação principal
- Busca/listagem de FIIs sincronizada com o mercado (via API — evolução do mock atual)
- Perfil do FII (dados básicos + indicadores)
- Indicadores com explicações (P/VP, DY, Vacância, PL, Liquidez)
- Base do módulo Aprender

## Prioridade 2

- Ranking de FIIs
- **Documentos oficiais do fundo** (relatório gerencial, fatos relevantes, etc.) na análise do FII
- Comparação FII × Tesouro IPCA+
- Carteira pessoal do usuário
- **Composição da carteira por segmento** (% e concentração)
- Análise da carteira do **fundo** (composição, gráficos)

## Prioridade 3

- Planner + gamificação leve já existente
- Educação completa com **estrutura alimentável** (novas trilhas após o go-live)
- Perfil do investidor + **questionário** (quando houver material do cliente)
- **Módulo “Poupar em vez de gastar”** (regras gasto→ticker + eventos + histórico)
- Notícias
- Painel administrativo (conteúdo próprio / usuários — sem CRUD de lista de FIIs de mercado)

## Evoluções futuras (fora do MVP imediato)

- Integração com corretora e **ordem real de compra** a partir do “Poupei”
- Campanhas / disparos segmentados por perfil/renda
- Obrigatoriedade progressiva de campos de perfil (“passar de fase”)
- Formato definitivo de análise do fundo combinando indicadores + docs + notícias (não inventar layout agora)

## Fontes de dados

- **Mercado / cotações (atual no código):** HG Brasil (`MarketDataProvider`) — quotes e dividends; cache client-side.
- **Catálogo completo de FIIs:** ainda mock; deve evoluir para fonte de mercado (API), sem cadastro manual de ativos.
- **Documentos oficiais:** primária prevista B3 / Fundos Net (ou provedor que entregue os mesmos artefatos) → serviço interno → UI.
- Cliente considera custo mensal na faixa ~R$ 24,90–49,90 **viável** — **não** equivale a aprovação definitiva de um fornecedor.
- Preferir APIs/fontes estruturadas; evitar scraping frágil.
- Mocks centralizados só para desenvolvimento (`MockProvider` → provider real).

## Plataformas

- App investidor: Android e iOS (Expo)
- Landing comercial (separada)
- Admin: layout próprio desktop quando existir (foco em conteúdo próprio e usuários, não em cadastrar FIIs de mercado)
