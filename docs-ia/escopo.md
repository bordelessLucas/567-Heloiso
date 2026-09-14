# Escopo — Mercado FiiS

## Objetivo principal

Plataforma mobile (Android/iOS) do ecossistema de **Fundos de Investimento Imobiliário (FIIs)** que centraliza informações públicas, facilita a análise e ensina investidores a interpretar carteiras e indicadores — **sem tomar decisões de investimento pelo usuário**.

Experiência-alvo: visual, organizada, didática, simples, confiável e sofisticada.

## Princípio central

Cada funcionalidade deve ajudar o investidor a **encontrar**, **compreender** e **organizar** informações, mantendo a **decisão final com o próprio investidor**.

## Perfis de usuário

| Perfil | Descrição | Papel técnico (`role`) |
| --- | --- | --- |
| Investidor | Usuário final do app (iniciante, intermediário ou avançado) | `investor` |
| Administrador completo | Consulta, altera e gerencia a plataforma | `admin` |
| Administrador somente leitura | Consulta usuários e dashboards, sem alterações sensíveis | `admin_readonly` |

### Classificação do investidor (produto, não auth)

Questionário futuro classifica o investidor em:

- Conservador
- Moderado
- Arrojado

Campos patrimoniais/renda são **dados sensíveis**; obrigatoriedade ainda a confirmar com o cliente — **não inventar campos obrigatórios sensíveis**.

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

## Cadastro básico (auth)

- Nome
- E-mail
- Senha

Demais dados financeiros ficam **fora** do cadastro básico.

## Pilares do produto

1. Análise e consulta de FIIs
2. Carteira pessoal do investidor
3. Planner e desafios de poupança
4. Aprendizado sobre investimentos

Complementares: perfil do investidor, notícias, rankings, documentos, painel admin, acompanhamento de usuários.

## Funcionalidades core (MVP — Prioridade 1)

- Home com proposta da plataforma e acesso aos módulos
- Navegação principal
- Busca/listagem de FIIs (ticker, nome, segmento)
- Perfil do FII (dados básicos + indicadores)
- Análise da carteira do fundo (composição, gráficos)
- Indicadores com explicações (P/VP, DY, Vacância, PL, Liquidez)
- Base do módulo Aprender

## Prioridade 2

- Ranking de FIIs
- Documentos dos fundos
- Comparação FII × Tesouro IPCA+
- Carteira pessoal do usuário

## Prioridade 3

- Planner + gamificação
- Educação completa
- Perfil do investidor (questionário)
- Notícias
- Painel administrativo

## Fontes de dados

- Primária prevista: Fundos Net / B3 (documentos e informações oficiais)
- Preferir APIs/fontes estruturadas; evitar scraping frágil
- Mocks centralizados (`MockProvider` → `RealDataProvider`)

## Plataformas

- App investidor: Android e iOS (Expo)
- Landing comercial (separada)
- Admin: layout próprio desktop quando existir
