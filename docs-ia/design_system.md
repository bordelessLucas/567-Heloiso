# Design System — Mercado FiiS

> Fonte de verdade visual. Tokens de código em `src/theme/tokens.ts`.

## Marca

**Mercado FiiS** — plataforma financeira de análise e aprendizado em FIIs.

## Direção visual

- Sofisticada, simples, elegante, moderna, financeira e profissional
- Excelente hierarquia tipográfica
- Cards limpos **sem borda pesada** — hierarquia por fundo (`surfaceFeature` > `surfaceWarm` > elevated)
- Gráficos legíveis; números financeiros com destaque
- Navegação simples; evitar excesso de informação por tela
- Identidade **não infantil** (planner/gamificação inclusive)
- Home: **dois** destaques principais (Planner + Carteira) em `surfaceFeature`; atalhos em `surfaceWarm`

Referência de organização: apps financeiros modernos — **sem copiar** layouts ou marcas de terceiros.

## Paleta

| Token | Hex | Uso |
| --- | --- | --- |
| `primary` | `#F0B429` | Amarelo da marca — CTAs, destaques, marca |
| `primaryDark` | `#C49214` | Pressed / ênfase do amarelo |
| `black` | `#0D0D0D` | Texto forte, headers, contraste |
| `background` | `#EFEDE8` | Fundo de tela (quente e suave) |
| `surface` / `surfaceElevated` | `#FBFBF9` / `#FFFFFF` | Superfícies e cards |
| `surfaceWarm` | `#F7F1E3` | Atalhos / funcionalidades (padrão amarelo suave) |
| `surfaceFeature` | `#EDE0C4` | Cards principais da Home (Planner, Carteira) |
| `surfaceMuted` | `#F5F3EE` | Headers internos |
| `text` | `#0D0D0D` | Texto principal |
| `textMuted` | `#6B7280` | Texto auxiliar, captions |
| `border` / `borderSubtle` | `#E8E6E0` / `#F0EEE9` | Divisores finos; preferir cards sem borda forte |
| `danger` | `#B42318` | Erros e alertas |
| `success` | `#067647` | Sucesso / positivo |
| `warning` | `#B54708` | Atenção (leitura guiada) |
| `neutral` | `#79716B` | Neutro (leitura guiada) |

### Modo

**Light mode first** (fundo claro, amarelo + preto). Dark mode não é prioridade do MVP.

## Tipografia

Família: **Inter** (estilo tipográfico do ecossistema OpenAI / produtos AI modernos).
A fonte proprietária *OpenAI Sans* não é distribuída para apps — Inter é a alternativa aberta equivalente.

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

## Elevação

Cards de módulo usam sombra discreta (`shadows.card`) — sem borda pesada.

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
