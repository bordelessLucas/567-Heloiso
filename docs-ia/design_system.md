# Design System — Mercado FiiS

> Fonte de verdade visual. Tokens de código em `src/theme/tokens.ts`.

## Marca

**Mercado FiiS** — plataforma financeira de análise e aprendizado em FIIs.

## Direção visual

- Sofisticada, simples, elegante, moderna, financeira e profissional
- Excelente hierarquia tipográfica
- Cards limpos (apenas quando há interação ou agrupamento necessário)
- Gráficos legíveis; números financeiros em destaque
- Navegação simples; evitar excesso de informação por tela
- Identidade **não infantil** (planner/gamificação inclusive)

Referência de organização: apps financeiros modernos — **sem copiar** layouts ou marcas de terceiros.

## Paleta

| Token | Hex | Uso |
| --- | --- | --- |
| `primary` | `#F0B429` | Amarelo da marca — CTAs, destaques, marca |
| `primaryDark` | `#C49214` | Pressed / ênfase do amarelo |
| `black` | `#0D0D0D` | Texto forte, headers, contraste |
| `background` | `#F7F7F5` | Fundo de tela |
| `surface` | `#FFFFFF` | Superfícies e campos |
| `text` | `#0D0D0D` | Texto principal |
| `textMuted` | `#6B7280` | Texto auxiliar, captions |
| `border` | `#E5E5E0` | Bordas e divisores |
| `danger` | `#B42318` | Erros e alertas |
| `success` | `#067647` | Sucesso / positivo |
| `warning` | `#B54708` | Atenção (leitura guiada) |
| `neutral` | `#79716B` | Neutro (leitura guiada) |

### Modo

**Light mode first** (fundo claro, amarelo + preto). Dark mode não é prioridade do MVP.

## Tipografia

| Estilo | Tamanho | Peso | Uso |
| --- | --- | --- | --- |
| `display` | 32 | 700 | Marca / hero de tela |
| `h1` | 24 | 700 | Título de tela |
| `h2` | 20 | 600 | Seção |
| `h3` | 18 | 600 | Subseção |
| `body` | 16 | 400 | Texto corrido |
| `bodyStrong` | 16 | 600 | Ênfase |
| `caption` | 13 | 400 | Auxiliar / labels |
| `label` | 14 | 500 | Labels de formulário |

Família: sistema nativo no MVP (`System` / San Francisco / Roboto). Substituir por fonte de marca quando disponível.

## Espaçamento (base 4)

`xs` 4 · `sm` 8 · `md` 16 · `lg` 24 · `xl` 32 · `xxl` 48

## Raios

`sm` 8 · `md` 12 · `lg` 16 · `full` 999

## Componentes base

- **Button**: primary (amarelo), secondary (preto), outline; estados loading/disabled
- **Input**: ícone opcional, senha, mensagem de erro
- **Typography**: variantes acima
- **Container**: SafeArea + padding horizontal do layout

## Plataforma

Experiência do investidor: **mobile-first** (Expo).
Admin web (futuro): pode reutilizar tokens com layout desktop próprio.
