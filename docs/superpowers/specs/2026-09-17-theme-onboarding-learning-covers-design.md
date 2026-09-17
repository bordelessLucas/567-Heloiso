# Tema, onboarding e acabamento das capas — desenho de implementação

## Objetivo

Adicionar temas Claro, Escuro e Sistema ao aplicativo inteiro, introduzir um
onboarding MVP pós-autenticação e corrigir o acabamento das capas 1, 2, 3 e 7
da trilha Aprender.

O modo claro deve permanecer visualmente igual ao estado atual. O modo escuro
deve preservar a identidade Mercado FiiS — amarelo, tipografia, espaçamentos,
raios e hierarquia — alterando apenas cores semânticas necessárias para
contraste, legibilidade e coerência.

## Escopo

### Incluído

- Preferência de tema Claro, Escuro ou Sistema na aba Perfil.
- Persistência local da preferência e reação a mudanças do tema do dispositivo.
- Migração de todas as telas e componentes atuais para cores semânticas
  resolvidas em tempo de execução.
- Revisão específica de botões, inputs, modais, tabs, gráficos, cards e estados.
- Onboarding único por usuário autenticado, inclusive contas já existentes.
- Pergunta MVP sobre familiaridade com investimentos.
- Persistência local, por `userId`, da resposta e data de conclusão.
- Gate de navegação entre autenticação e tabs.
- Correção individual do enquadramento das capas 1, 2, 3 e 7.
- Validação funcional, tipada, de bundle e visual nos modos claro e escuro.

### Fora do escopo

- Sincronização das respostas do onboarding com Firestore ou painel admin.
- Questionário de suitability ou classificação de risco.
- Coleta de renda, patrimônio ou qualquer outro dado financeiro sensível.
- Personalização automática do conteúdo com base na resposta.
- Redesign do modo claro.

## Arquitetura de temas

### Modelo

O aplicativo terá:

- `ThemePreference = 'light' | 'dark' | 'system'`
- `ResolvedTheme = 'light' | 'dark'`
- uma paleta clara idêntica aos tokens atuais;
- uma paleta escura com os mesmos nomes semânticos;
- um `ThemeProvider` responsável por persistência, resolução do modo Sistema
  e atualização imediata da interface.

O provider ficará acima de autenticação e navegação, permitindo que login,
onboarding, tabs e rotas complementares usem o mesmo tema.

### Tokens

Tipografia, espaçamento e raios continuam estáticos. Cores passam a ser
consumidas pela paleta resolvida.

A paleta escura preservará:

- `primary` e `primaryDark` como identidade amarela;
- estados semânticos de sucesso, aviso e erro, ajustados apenas se necessário
  para contraste;
- texto principal claro sobre fundos escuros;
- superfícies em níveis diferentes para manter hierarquia sem bordas pesadas;
- divisores discretos e legíveis.

Nenhuma cor será invertida mecanicamente. Cada uso será classificado como
fundo, superfície, texto, divisor, estado ou elemento de marca.

### Migração

Componentes compartilhados serão migrados primeiro. Telas e componentes de
domínio passarão a receber a paleta pelo hook do tema e criar estilos derivados
da paleta. Isso evita estilos congelados por `StyleSheet.create` quando o
usuário alterna o tema.

O Perfil exibirá um controle segmentado com as três opções. A troca será
imediata e não exigirá reinício.

## Onboarding MVP

### Fluxo

1. O usuário autentica ou conclui o cadastro.
2. O gate verifica a conclusão do onboarding para o `userId` atual.
3. Se ainda não houver resposta, abre a rota de onboarding.
4. Uma tela curta apresenta a finalidade da pergunta.
5. O usuário escolhe:
   - `beginner`: “Estou começando agora”
   - `experienced`: “Já conheço investimentos”
6. Um CTA confirma a escolha e grava:
   - familiaridade;
   - data de conclusão;
   - versão do onboarding.
7. O usuário entra nas tabs.

O onboarding não bloqueia revisões futuras do conteúdo Aprender e não determina
recomendações financeiras.

### Persistência

A chave local será namespaced por `userId`, evitando que contas diferentes no
mesmo dispositivo compartilhem estado. A estrutura será versionada para permitir
migração futura:

```ts
interface OnboardingResult {
  version: 1;
  familiarity: 'beginner' | 'experienced';
  completedAt: string;
}
```

O acesso será isolado em um serviço próprio. A futura integração administrativa
poderá substituir ou complementar esse serviço sem alterar a tela.

### Navegação

O redirecionamento será centralizado para impedir flashes entre onboarding e
tabs. Estados possíveis:

- carregando autenticação;
- não autenticado → login;
- autenticado com onboarding pendente → onboarding;
- autenticado com onboarding concluído → tabs.

Login e cadastro não redirecionarão diretamente para tabs sem passar pelo gate.

## Capas da trilha

As capas 1, 2, 3 e 7 receberão metadados de apresentação próprios:

- altura máxima na lista;
- altura máxima na tela interna;
- escala do plano de fundo;
- posição do plano de fundo;
- posição da arte integral em primeiro plano.

A composição continuará com duas camadas:

1. extensão desfocada da própria arte preenchendo o card;
2. arte original integral, sem cortar textos ou personagem.

O objetivo é eliminar faixas laterais artificiais e fazer a capa parecer criada
para o card, sem aumentar excessivamente a altura do módulo.

## Estados e falhas

- Falha ao carregar preferência de tema: usar `system`.
- Falha ao carregar onboarding: manter o usuário no gate com opção de tentar
  novamente, sem marcar conclusão automaticamente.
- Falha ao salvar onboarding: mostrar mensagem e preservar a escolha na tela.
- Tema Sistema reage à alteração do dispositivo.
- Revisão de módulos concluídos continua disponível.
- O progresso educacional existente permanece intacto.

## Acessibilidade

- Opções de tema e familiaridade terão papel, estado selecionado e labels claros.
- Contraste do modo escuro será verificado em textos, placeholders, divisores,
  botões e gráficos.
- O onboarding funcionará com texto ampliado e áreas de toque adequadas.
- A preferência visual não será comunicada somente por cor.

## Estratégia de validação

### Automatizada

- `tsc --noEmit`
- bundle web do Expo SDK 57;
- verificação de rotas e importações;
- testes das funções puras de resolução de tema e persistência do onboarding,
  se a estrutura atual permitir sem adicionar infraestrutura desnecessária.

### Funcional

- novo cadastro → onboarding → Home;
- login de conta existente sem resposta → onboarding;
- retorno de conta com resposta → Home;
- logout e troca de conta no mesmo dispositivo;
- seleção Claro, Escuro e Sistema;
- mudança do sistema enquanto a preferência é Sistema;
- abertura e revisão de todos os módulos.

### Visual

Serão revisados em claro e escuro:

- login e cadastro;
- onboarding;
- todas as tabs;
- perfil e seletor de tema;
- detalhes de fundo e carteira;
- planner, rankings, notícias e comparação;
- trilha, módulos, conclusão e capas 1, 2, 3 e 7;
- botões, inputs, sheets, cards, gráficos e estados vazios.

O modo claro só sofrerá alteração se um componente precisar consumir token
semântico para alternar corretamente. O resultado visual claro deve permanecer
equivalente ao atual.

## Critérios de aceite

- Usuário escolhe Claro, Escuro ou Sistema no Perfil e a preferência persiste.
- Todas as telas respondem imediatamente ao tema.
- Não há texto ilegível, superfície branca solta, modal conflitante ou botão sem
  contraste no modo escuro.
- Modo claro mantém o visual já aprovado.
- Onboarding aparece uma vez por usuário e aceita uma das duas respostas.
- Nenhum dado sensível é solicitado.
- Capas 1, 2, 3 e 7 aparecem inteiras, bem enquadradas e integradas aos cards.
- Aprender permanece voluntário e módulos concluídos continuam revisáveis.
