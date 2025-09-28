# Arquitetura - Planeta 2500: Energia Sustentável

## Visão Geral

Planeta 2500 é um jogo de estratégia baseado em turnos implementado em JavaScript ES6+ puro, HTML5 e CSS3. O jogo simula gestão de energia sustentável em um planeta fictício, equilibrando fatores econômicos, sociais e ambientais.

## Princípios Arquiteturais

### 1. Separação de Responsabilidades
O código é organizado em módulos independentes com responsabilidades claras:

```
src/
├── core/          # Lógica de jogo pura
├── ui/            # Interface e interações
└── utils/         # Utilitários compartilhados
```

### 2. Imutabilidade do Estado
- Estado central gerenciado por `state.js`
- Todas as modificações criam novos objetos
- Serialização JSON nativa para persistência

### 3. Funções Puras
- Lógica de simulação não depende de efeitos colaterais
- Determinismo garantido para testes e replays
- Separação clara entre cálculo e apresentação

## Estrutura de Módulos

### Core Modules (`src/core/`)

#### `state.js` - Estado Central
- **Responsabilidade:** Gerenciamento imutável do estado do jogo
- **API Principal:**
  - `getState()` - Obtém estado atual
  - `setState(newState)` - Define novo estado
  - `applyPatch(patch)` - Aplica mudanças atômicas
  - `resetState()` - Reinicia jogo
- **Estrutura do Estado:**
  ```javascript
  {
    turn: 1,
    credits: 1000,
    pollution: 0,
    temperature: 20,
    popularity: { poor: 50, middle: 50, rich: 50 },
    energy: {
      capacity: { solar: 0, wind: 0, hydro: 0, geo: 0, fossil: 50 },
      storage: 0,
      consumptionBase: 50
    },
    cooldowns: { decision: 0 },
    logs: []
  }
  ```

#### `rules.js` - Regras e Constantes
- **Responsabilidade:** Centraliza todas as fórmulas e balanceamento
- **Conteúdo:**
  - Eficiências das fontes de energia
  - Modificadores ambientais
  - Custos de ações
  - Probabilidades de eventos
  - Condições de vitória/derrota

#### `engine.js` - Motor do Jogo
- **Responsabilidade:** Coordena o loop de turnos
- **Fases do Turno:**
  1. **Jogador:** Processa ações escolhidas
  2. **Ambiente:** Recalcula produção, consumo, economia, sociedade
  3. **Eventos:** Aplica eventos aleatórios
  4. **Decisões:** Verifica necessidade de decisões
  5. **Vitória:** Verifica condições de fim

#### `energy.js` - Sistema Energético
- **Responsabilidade:** Cálculos de produção, consumo e armazenamento
- **Funções Principais:**
  - `calcularProducaoTotal()` - Produção efetiva de todas as fontes
  - `calcularConsumoEfetivo()` - Consumo considerando eficiência
  - `atualizarArmazenamento()` - Gestão de bateria

#### `economy.js` - Sistema Econômico
- **Responsabilidade:** Renda, custos e finanças
- **Aspectos:**
  - Renda baseada na popularidade por classe
  - Custos de manutenção de infraestrutura
  - Impostos e subsídios dinâmicos

#### `environment.js` - Sistema Ambiental
- **Responsabilidade:** Poluição, temperatura e degradação
- **Mecânicas:**
  - Poluição gerada por fonte energética
  - Aquecimento global baseado em emissões
  - Auto-purificação natural

#### `society.js` - Sistema Social
- **Responsabilidade:** Popularidade e dinâmica social
- **Classes:** Pobre, Média, Rica
- **Fatores:** Ações governamentais, eventos, condições econômicas

#### `victory.js` - Condições de Vitória
- **Responsabilidade:** Verificação de fim de jogo
- **Tipos de Vitória:**
  - Sustentável Completa (80% renovável, baixa poluição)
  - Energética (excedente energético)
  - Parcial (equilíbrio geral)

#### `events.js` - Sistema de Eventos
- **Responsabilidade:** Eventos aleatórios dinâmicos
- **Características:**
  - Probabilidades baseadas no estado
  - Efeitos permanentes ou temporários
  - Seed determinístico para consistência

#### `decisions.js` - Sistema de Decisões
- **Responsabilidade:** Escolhas estratégicas estilo HoI4
- **Mecânicas:**
  - Decisões contextuais baseadas no estado
  - Efeitos positivos e negativos
  - Sistema de cooldown

### UI Modules (`src/ui/`)

#### `ui_layout.js` - Layout e Atualização
- **Responsabilidade:** Sincronização entre estado e interface
- **Funções:** `atualizarLayout()`, `atualizarIndicadores()`

#### `ui_bindings.js` - Interações
- **Responsabilidade:** Event listeners e controles do usuário
- **Aspectos:** Botões, teclado, validações

#### `ui_canvas.js` - Visualização
- **Responsabilidade:** Renderização do planeta via Canvas
- **Características:** Gradientes dinâmicos, animações

#### `ui_modal.js` - Modais
- **Responsabilidade:** Diálogos de decisão e fim de jogo
- **Tipos:** Confirmação, informação, carregamento

#### `ui_log.js` - Sistema de Log
- **Responsabilidade:** Mensagens de jogo e histórico
- **Recursos:** Filtros, pesquisa, exportação

### Utils Modules (`src/utils/`)

#### `rng.js` - Gerador Aleatório
- **Responsabilidade:** Números pseudoaleatórios com seed
- **API:** `rand()`, `randInt()`, `chance()`

#### `format.js` - Formatação
- **Responsabilidade:** Formatação de números, datas, tooltips
- **Utilitários:** Moeda, porcentagem, energia

#### `storage.js` - Persistência
- **Responsabilidade:** Salvar/carregar via localStorage
- **Recursos:** Versionamento, backup, validação

## Fluxo de Dados

```
Ação do Jogador
    ↓
ui_bindings.js → engine.js
    ↓
Processamento (Fases do Turno)
    ↓
Atualização de Estado
    ↓
ui_layout.js → Interface
```

## Padrões de Código

### 1. Nomenclatura
- **Funções:** camelCase, verbos imperativos
- **Variáveis:** camelCase, descritivas
- **Constantes:** UPPER_SNAKE_CASE
- **Arquivos:** lowercase_with_underscores.js

### 2. Estrutura de Função
```javascript
/**
 * Descrição da função
 * @param {Type} param - Descrição
 * @returns {Type} Descrição
 */
export function functionName(param) {
  // Implementação
}
```

### 3. Tratamento de Erros
- Validação de entrada em funções públicas
- Logs informativos para debugging
- Graceful degradation na UI

## Dependências e Compatibilidade

- **Navegador:** ES6+ support (Chrome 60+, Firefox 55+, Safari 11+)
- **Módulos:** ES6 modules nativos
- **Storage:** localStorage para persistência
- **Canvas:** Canvas 2D API para renderização

## Testabilidade

- **Funções puras** facilitam testes unitários
- **Estado serializável** permite testes de integração
- **Seed determinístico** garante reprodutibilidade

## Extensibilidade

- **Módulos independentes** permitem adição de features
- **APIs bem definidas** facilitam integração
- **Configuração centralizada** em `rules.js` para balanceamento

## Performance

- **Renderização sob demanda** (apenas quando necessário)
- **Estado imutável** evita re-renders desnecessários
- **Lazy loading** de módulos pesados
- **Debouncing** em inputs do usuário

---

*Esta arquitetura foi projetada para ser manutenível, testável e extensível, seguindo os princípios SOLID e as melhores práticas de desenvolvimento JavaScript moderno.*
