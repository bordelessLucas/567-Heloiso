# Contexto do produto — Mercado FiiS

> Fonte de verdade de **decisões de negócio** e alinhamento com o cliente.  
> Atualizado após reunião com o cliente (transcrição só com a voz do cliente — sem inventar perguntas da equipe).  
> Complementa: `escopo.md`, `arquitetura.md`, `design_system.md`, `checklist_sprints.md`.

## Estado atual do produto (resumo técnico)

- App Expo (tabs: Início, Carteira, Fundos, Aprender, Perfil) + rotas stack (Planner, Rankings, Tesouro IPCA+, detalhe do FII, holding).
- Auth Firebase + perfil em `users/{uid}` e dados sensíveis em `users/{uid}/sensitive/investor-profile`.
- Catálogo de FIIs ainda baseado em **mock** (8 tickers), com **overlay** de cotações/dividendos via **HG Brasil** (`src/services/market-data/hgBrasil.provider.ts`, cache em memória ~30 min).
- Carteira pessoal e Planner em persistência **local/mock** (não Firestore CRUD completo).
- Aprender: trilhas **hardcoded** no app + capas estáticas; progresso em AsyncStorage.
- Perfil: Conservador / Moderado / Arrojado **escolhido manualmente**; formulário sensível (renda, patrimônio, objetivo, horizonte) opcional com LGPD.

---

## Decisões e demandas da reunião (classificadas)

### Legenda

| Tipo | Significado |
| --- | --- |
| **Confirmada** | Cliente pediu / afirmou de forma clara na transcrição |
| **Comportamento aprovado** | Cliente reconheceu algo já mostrado como desejável (“já está? … legal”) |
| **Exemplo** | Ilustração — não virar regra fixa do sistema |
| **Futuro** | Visão posterior; não implementar agora |
| **A confirmar** | Ambíguo porque a outra voz da reunião não foi gravada |

---

### 1. Documentos oficiais na análise do FII — **Confirmada**

Cliente trata documentos oficiais como **base da tomada de decisão**, além de notícias/análises de mercado.

Documentos citados:

- relatório gerencial;
- fato relevante;
- demais documentações obrigatórias do fundo.

**Exemplo (não regra de UI):** escolher relatório gerencial de agosto e ver vacância, expectativa do gestor (“laminazinha”).

**Direção:** priorizar cadeia **fonte oficial / B3 → serviço interno → interface**. Não montar base manual se for possível obter de forma automatizada.

**Hoje no app:** aba Docs no detalhe do FII com estrutura `FundDocument`, mas conteúdo **mock**, `url: null`, sem abertura de PDF oficial.

---

### 2. Dados de mercado via API — **Confirmada**

- Cliente **não** quer adicionar/remover FIIs manualmente na lista de mercado.
- Listagem deve acompanhar o que existe no mercado via API.
- Conteúdo próprio (trilhas, análises customizadas) pode ser alimentado; **o que é mercado** deve vir de API.

**Custo:** cliente viu faixas ~**R$ 24,90** e ~**R$ 49,90**/mês e disse que **o custo é ok** / pode pagar mensal para que **todos os usuários** consultem.  
Isso **não** aprova automaticamente um fornecedor específico.

**API atual no repo:** HG Brasil (quotes/dividends). Catálogo completo de FIIs listados **não** vem dessa integração hoje (ainda mock).

**A confirmar:** plano/contrato exato HG Brasil (ou alternativa) vs. necessidade de listagem completa + documentos B3; volume/limites reais do plano.

---

### 3. Volume e estratégia de consultas — **Confirmada (princípio)**

Cliente considera limites baixos (ex.: “mil consultas”) insuficientes se muitos usuários consultarem.

Ponto confirmado:

> A solução precisa crescer **sem uma chamada externa desnecessária por usuário a cada visualização**.

Direção: cache, atualização centralizada de dados públicos, diferenciar **ingestão do provedor** × **leitura interna** do app.

**Exemplo na fala:** “mil usuários × 1 consulta = extrapolou” — ilustra preocupação, não é SLA numérico contratado.

**Hoje:** cache in-memory no provider HG (TTL 30 min) no cliente; **não** há ainda sync centralizado server-side compartilhado entre usuários.

---

### 4. Separação Mercado × Conteúdo próprio — **Confirmada**

| Mercado (API / fonte pública) | Conteúdo próprio (alimentável) |
| --- | --- |
| Lista de FIIs, preços, indicadores, cotações | Trilhas, aulas, vídeos, slides |
| Informações públicas; documentos oficiais quando disponíveis | Explicações e análises customizadas do cliente |

---

### 5. Evolução do módulo Aprender — **Confirmada**

- Cliente pretende **continuar adicionando trilhas** após o app pronto.
- Formatos citados: textos, imagens, slides, **vídeos produzidos pelo cliente**.
- Precisa de caminho de atualização **sem depender de conteúdo rigidamente embutido** no código (CMS/Firestore/admin leve — a confirmar o mecanismo mínimo).

**Exemplo de nova trilha:** primeiro investimento também via **apps de banco** (citados Nubank, C6), além do fluxo via corretora já previsto no conteúdo atual.

**Não inventar** o conteúdo das aulas agora.

---

### 6. Educação + Carteira por segmento — **Confirmada (produto) + Exemplo (percentuais)**

Cliente quer ensinar diversificação por segmentos de FII. Categorias citadas:

- logística;
- papel;
- híbridos;
- renda urbana;
- lajes corporativas;
- shoppings.

Na Carteira, o usuário deve ver **na prática**:

- quanto possui por segmento;
- percentual de cada categoria;
- concentração excessiva;
- composição total.

Na trilha, o cliente ensinará percentuais que considera adequados.

**Exemplo na reunion (NÃO virar regra fixa do app):** “30% papel, 30% logística, 20% híbridos/renda urbana, 5% lajes…”.  
Arquitetura deve permitir **definir/atualizar** alvos educacionais no futuro.

**Comportamento aprovado (parcial):** cliente reagiu positivamente ao ver algo de composição já existente na demo (“Ah, já está? … legal”), pedindo depois gráfico de peso por tipo.

**Hoje:** `AllocationRing` agrega por **ticker/posição**, não por segmento do FII; segmentos existem no domínio do fundo (`FundSegment`).

---

### 7. Perfil do investidor — **Confirmada**

Três classificações (fechadas):

1. Conservador  
2. Moderado  
3. Arrojado  

Critério: **apetite / exposição ao risco** (tipo de ativo), **não** patrimônio ou renda.

**Exemplo conceitual:** só renda fixa → conservador; misturar com ativos mais voláteis → muda o perfil.

**Hoje:** as três opções existem no Perfil (seleção manual) e em `InvestorProfileType`.

---

### 8. Questionário de suitability — **Confirmada (necessidade) + Aguardando material**

Cliente quer questionário (comum em bancos) que classifique automaticamente Conservador / Moderado / Arrojado.  
Disse que **pode pesquisar e enviar um formulário** de referência.

**Não inventar perguntas.**  
Status: **aguardando material do cliente**.

Tipo stub: `InvestorProfileAnswers` (ainda não usado no fluxo).

---

### 9. Objetivo e horizonte — **Confirmada (relevância) + A confirmar (formato)**

**Confirmado:** objetivo e horizonte importam para o perfil / construção de patrimônio.

Exemplos de objetivo citados: aposentadoria, construção de patrimônio, compra de imóvel, outros.  
Exemplos de horizonte citados: 2, 5, 10, 15, 20, 25 anos e mais/outro.

Também surgiu a ideia de **inverter**: perguntar primeiro o objetivo e contextualizar o horizonte.

**A confirmar:** formato final das perguntas e opções (anos discretos vs. short/medium/long atuais vs. objetivo-primeiro).

**Hoje:** objetivo (`income` | `growth` | `preservation` | `learning`) e horizonte (`short` | `medium` | `long`) no formulário sensível — **não** batem 1:1 com as opções citadas na reunião.

---

### 10. Obrigatoriedade de campos de perfil — **Confirmada (direção)**

- Podem permanecer **opcionais** na fase atual.
- Futuramente alguns poderão virar **obrigatórios** (“passar de fase”) para personalizar experiência/conteúdo/produtos.

Preparar arquitetura para mudar obrigatoriedade depois. **Não** tornar obrigatório agora sem confirmação explícita.

---

### 11. Segmentação futura de usuários — **Futuro**

Cliente quer usar perfil (renda, risco, objetivo, etc.) para **conhecer a base** e, no futuro, campanhas/produtos diferentes por nicho (ex.: ticket maior vs. menor).

Registrar campos de forma estruturada + privacidade/LGPD.  
**Não** implementar disparo de campanhas nesta fase.

---

### 12. Novo módulo — “Poupar em vez de gastar” — **Confirmada (conceito MVP conceitual)**

Incentivar transformar gasto evitado em percepção de investimento.

Fluxo conceitual confirmado pelo cliente:

1. Usuário associa um tipo de gasto (ex.: café, lanche, almoço, Coca-Cola, coxinha — customizável) a um **ticker de FII**.
2. Define valor tipicamente gasto.
3. Ao acionar algo como **“Poupei”**:
   - registra o valor;
   - obtém cotação do ativo;
   - calcula **equivalência em cotas** (valor ÷ cotação);
   - mostra e acumula histórico.

**Importante:** equivalência **não** significa compra real no MVP.

Tickers citados (GARI11, KNCR11, MXRF11, etc.) são **exemplos** — associação **configurável pelo usuário**.

Sugestão técnica (avaliar na implementação; reaproveitar padrão `users/{uid}/…`):

- `users/{uid}/savingRules/{ruleId}` — label, defaultAmount, ticker, active, timestamps  
- `users/{uid}/savingEvents/{eventId}` — ruleId, amount, ticker, quote, equivalentShares, timestamps  

Distinto do **Planner** (metas/check-ins de poupança em R$ sem equivalência em cotas).

---

### 13. Integração com corretora + ordem real — **Futuro / fase posterior**

Cliente descreveu visão: Poupei → valor → ativo parametrizado → **ordem real de compra** via conta vinculada.

Depende de API da corretora, auth, permissões, regulatório, confirmação explícita do usuário.  
Arquitetura do módulo de economia **não deve impedir** essa evolução, mas **não implementar** ordem automática agora.

---

## Auditoria rápida (pós-reunião)

| Demanda | Status |
| --- | --- |
| Documentos oficiais B3 no detalhe do FII | 🔄 Estrutura/UI parcial (mock) |
| Catálogo de FIIs só via API (sem CRUD admin de lista) | 🔄 Quotes HG; catálogo ainda mock |
| Cache / sync centralizado multi-usuário | 🔄 Cache client-side apenas |
| Composição da carteira por segmento | ✅ Toggle segmento/ativo + pesos na Carteira |
| Aprender dinâmico (novas trilhas ao longo do tempo) | 🔄 Conteúdo hardcoded; falta CMS |
| Trilha 1º investimento via banco | ⬜ Não existe |
| Perfil Conservador/Moderado/Arrojado por risco | ✅ Seleção manual alinhada ao critério |
| Questionário automático | ⬜ + ❓ aguardando formulário do cliente |
| Objetivo / horizonte | 🔄 Existe; opções a alinhar |
| Campos opcionais → obrigatórios depois | 🔄 Opcionais hoje; falta flag de política |
| Segmentação/campanhas | ⬜ Futuro |
| Módulo Poupar em vez de gastar | ✅ `/tools/poupar` (AsyncStorage; rules Firestore prontas) |
| Ordem automática corretora | ⬜ Futuro |
| Planner | ✅ Existe (não misturar com Poupei) |

---

## Ordem recomendada de implementação (pós-auditoria)

1. Consolidar arquitetura de dados de mercado/API (catálogo + cache/sync).
2. Definir obtenção de documentos oficiais dos FIIs (B3 / provedor).
3. Evoluir detalhe/análise do fundo (docs reais + leitura).
4. Composição da Carteira por segmento (+ conexão didática com Aprender).
5. Estrutura dinâmica do Aprender (trilhas alimentáveis).
6. Revisar Perfil + questionário (quando houver material do cliente).
7. Módulo inicial “Poupar em vez de gastar”.
8. Refino UI/UX.
9. Validar integrações, dados e persistência.
10. Documentar futuros (corretora, campanhas).

---

## Fora de escopo imediato (não implementar só com esta reunião)

- Integração real com corretora / ordem automática de compra  
- Campanhas comerciais / disparo segmentado  
- Percentuais fixos obrigatórios de composição de carteira  
- Questionário inventado sem material do cliente  
- Troca automática de fornecedor de API sem necessidade  
- CRUD administrativo para cadastrar/remover FIIs de mercado  
- Administração complexa se uma solução mais simples bastar para trilhas  
