/**
 * Sistema de eventos aleatórios para Planeta 2500
 * Eventos que afetam o jogo dinamicamente
 */

import { RANDOM_EVENTS } from './rules.js';

/**
 * Lista completa de eventos disponíveis
 */
const AVAILABLE_EVENTS = [
  {
    id: 'sabotage',
    name: 'Sabotagem Corporativa',
    probability: 5,
    minTurn: 3,
    maxTurn: 50,
    preConditions: (state) => state.energy.capacity.fossil > 20,
    effects: {
      pollution: 5,
      popularity: { poor: -5, middle: -3, rich: 2 }
    },
    description: 'Corporações de energia fóssil sabotam infraestrutura renovável em retaliação.',
    logMessage: 'Sabotagem corporativa aumenta poluição e afeta popularidade.',
    rollbackImpossible: true
  },
  {
    id: 'natural_disaster',
    name: 'Desastre Natural',
    probability: 8,
    minTurn: 2,
    maxTurn: 50,
    preConditions: (state) => state.temperature > 25 || state.pollution > 30,
    effects: {
      temperature: 3,
      pollution: 3,
      capacity: { solar: -2, wind: -3 }
    },
    description: 'Furacão ou tempestade severa danifica infraestrutura energética.',
    logMessage: 'Desastre natural danifica usinas renováveis e aumenta poluição.',
    rollbackImpossible: true
  },
  {
    id: 'panel_breakage',
    name: 'Quebra de Painéis',
    probability: 12,
    minTurn: 1,
    maxTurn: 50,
    preConditions: (state) => state.energy.capacity.solar > 10,
    effects: {
      capacity: { solar: -1 },
      pollution: 1
    },
    description: 'Painéis solares quebrados devido a intempéries ou desgaste.',
    logMessage: 'Quebra de painéis solares reduz capacidade e gera resíduos.',
    rollbackImpossible: true
  },
  {
    id: 'sunny_day',
    name: 'Dia Ensolarado',
    probability: 20,
    minTurn: 1,
    maxTurn: 50,
    preConditions: (state) => state.energy.capacity.solar > 0,
    effects: {
      capacity: { solar: 2 } // Bônus temporário
    },
    description: 'Condições perfeitas de insolação aumentam eficiência solar.',
    logMessage: 'Dia excepcional de sol aumenta produção solar temporariamente.',
    temporary: true,
    duration: 1
  },
  {
    id: 'strong_wind',
    name: 'Vento Forte',
    probability: 15,
    minTurn: 1,
    maxTurn: 50,
    preConditions: (state) => state.energy.capacity.wind > 0,
    effects: {
      capacity: { wind: 3 } // Bônus temporário
    },
    description: 'Ventos excepcionalmente fortes aumentam produção eólica.',
    logMessage: 'Ventos fortes impulsionam produção eólica temporariamente.',
    temporary: true,
    duration: 1
  },
  {
    id: 'tech_discovery',
    name: 'Descoberta Tecnológica',
    probability: 3,
    minTurn: 5,
    maxTurn: 50,
    preConditions: (state) => state.credits >= 200,
    effects: {
      efficiencyBonus: 0.05 // +5% eficiência geral
    },
    description: 'Avanço científico aumenta eficiência de todas as fontes renováveis.',
    logMessage: 'Descoberta tecnológica aumenta eficiência energética permanentemente.',
    permanent: true
  },
  {
    id: 'battery_advance',
    name: 'Avanço em Baterias',
    probability: 4,
    minTurn: 4,
    maxTurn: 50,
    preConditions: (state) => state.energy.storage < 50,
    effects: {
      storageCapacity: 10
    },
    description: 'Melhoria na tecnologia de baterias aumenta capacidade de armazenamento.',
    logMessage: 'Avanço em baterias aumenta capacidade de armazenamento.',
    permanent: true
  },
  {
    id: 'policy_shift',
    name: 'Mudança Política',
    probability: 6,
    minTurn: 3,
    maxTurn: 50,
    preConditions: (state) => true, // Sempre possível
    effects: {
      popularity: { middle: 5, rich: 3 }
    },
    description: 'Mudanças no cenário político favorecem investimentos verdes.',
    logMessage: 'Mudanças políticas aumentam apoio às energias renováveis.',
    temporary: false
  },
  {
    id: 'economic_boom',
    name: 'Boom Econômico',
    probability: 7,
    minTurn: 2,
    maxTurn: 40,
    preConditions: (state) => state.credits < 800,
    effects: {
      credits: 150
    },
    description: 'Crescimento econômico inesperado aumenta arrecadação.',
    logMessage: 'Boom econômico traz créditos extras ao governo.',
    temporary: false
  },
  {
    id: 'public_protest',
    name: 'Protesto Público',
    probability: 10,
    minTurn: 2,
    maxTurn: 50,
    preConditions: (state) => {
      const avgPopularity = (state.popularity.poor + state.popularity.middle + state.popularity.rich) / 3;
      return avgPopularity < 40;
    },
    effects: {
      popularity: { poor: 10, middle: 5 },
      credits: -50
    },
    description: 'Protestos populares forçam mudanças nas políticas energéticas.',
    logMessage: 'Protestos populares aumentam pressão por mudanças.',
    temporary: false
  },
  {
    id: 'international_aid',
    name: 'Ajuda Internacional',
    probability: 4,
    minTurn: 5,
    maxTurn: 50,
    preConditions: (state) => state.pollution > 40 || state.temperature > 28,
    effects: {
      credits: 200,
      pollution: -3
    },
    description: 'Comunidade internacional oferece ajuda para combate às mudanças climáticas.',
    logMessage: 'Ajuda internacional chega para projetos ambientais.',
    temporary: false
  },
  {
    id: 'corporate_scandal',
    name: 'Escândalo Corporativo',
    probability: 6,
    minTurn: 4,
    maxTurn: 50,
    preConditions: (state) => state.energy.capacity.fossil > 30,
    effects: {
      popularity: { poor: 8, middle: 5, rich: -10 },
      credits: -100
    },
    description: 'Escândalo envolvendo empresas de energia fóssil é revelado.',
    logMessage: 'Escândalo corporativo danifica reputação das empresas de energia.',
    temporary: false
  },
  {
    id: 'scientific_breakthrough',
    name: 'Avanço Científico',
    probability: 2,
    minTurn: 8,
    maxTurn: 50,
    preConditions: (state) => state.credits >= 300,
    effects: {
      efficiencyBonus: 0.08, // +8% eficiência
      popularity: { middle: 3 }
    },
    description: 'Descoberta revolucionária em física quântica aplicada à energia.',
    logMessage: 'Avanço científico revolucionário aumenta eficiência energética.',
    permanent: true
  },
  {
    id: 'climate_miracle',
    name: 'Milagre Climático',
    probability: 1,
    minTurn: 10,
    maxTurn: 50,
    preConditions: (state) => state.pollution > 60 && state.temperature > 32,
    effects: {
      pollution: -10,
      temperature: -5,
      popularity: { poor: 5, middle: 5, rich: 5 }
    },
    description: 'Evento climático raro reduz poluição e temperatura naturalmente.',
    logMessage: 'Milagre climático raro melhora condições ambientais.',
    temporary: false
  },
  {
    id: 'energy_crisis',
    name: 'Crise Energética Global',
    probability: 3,
    minTurn: 6,
    maxTurn: 50,
    preConditions: (state) => {
      const energyBalance = state.energy.production - state.energy.consumption;
      return energyBalance < 0;
    },
    effects: {
      popularity: { poor: -8, middle: -5, rich: -3 },
      credits: -200
    },
    description: 'Crise energética global aumenta preços e reduz popularidade.',
    logMessage: 'Crise energética global afeta economia e sociedade.',
    temporary: false
  }
];

/**
 * Verifica se um evento pode ocorrer baseado em pré-condições
 * @param {Object} event - Evento a verificar
 * @param {Object} state - Estado atual do jogo
 * @returns {boolean} Verdadeiro se pode ocorrer
 */
function canEventOccur(event, state) {
  // Verifica turno
  if (state.turn < event.minTurn || state.turn > event.maxTurn) {
    return false;
  }

  // Verifica pré-condições
  if (event.preConditions && !event.preConditions(state)) {
    return false;
  }

  return true;
}

/**
 * Seleciona evento aleatório baseado em probabilidades
 * @param {Object} state - Estado atual do jogo
 * @returns {Object|null} Evento selecionado ou null
 */
export function selectRandomEvent(state) {
  const eligibleEvents = AVAILABLE_EVENTS.filter(event => canEventOccur(event, state));

  if (eligibleEvents.length === 0) {
    return null;
  }

  // Calcula probabilidades totais
  const totalProbability = eligibleEvents.reduce((sum, event) => sum + event.probability, 0);

  // Seleciona baseado em probabilidade
  let random = Math.random() * totalProbability;
  for (const event of eligibleEvents) {
    random -= event.probability;
    if (random <= 0) {
      return event;
    }
  }

  return eligibleEvents[0]; // Fallback
}

/**
 * Aplica efeitos de um evento no estado do jogo
 * @param {Object} state - Estado atual
 * @param {Object} event - Evento a aplicar
 * @returns {Object} Novo estado com efeitos aplicados
 */
export function applyEventEffects(state, event) {
  const newState = JSON.parse(JSON.stringify(state));

  // Aplica efeitos na energia
  if (event.effects.capacity) {
    for (const [source, change] of Object.entries(event.effects.capacity)) {
      if (newState.energy.capacity[source] !== undefined) {
        newState.energy.capacity[source] = Math.max(0, newState.energy.capacity[source] + change);
      }
    }
  }

  // Aplica efeitos ambientais
  if (event.effects.pollution !== undefined) {
    newState.pollution = Math.max(0, Math.min(100, newState.pollution + event.effects.pollution));
  }

  if (event.effects.temperature !== undefined) {
    newState.temperature = Math.max(15, Math.min(50, newState.temperature + event.effects.temperature));
  }

  // Aplica efeitos econômicos
  if (event.effects.credits !== undefined) {
    newState.credits = Math.max(0, newState.credits + event.effects.credits);
  }

  // Aplica efeitos sociais
  if (event.effects.popularity) {
    newState.popularity.poor = Math.max(0, Math.min(100, newState.popularity.poor + (event.effects.popularity.poor || 0)));
    newState.popularity.middle = Math.max(0, Math.min(100, newState.popularity.middle + (event.effects.popularity.middle || 0)));
    newState.popularity.rich = Math.max(0, Math.min(100, newState.popularity.rich + (event.effects.popularity.rich || 0)));
  }

  // Efeitos especiais
  if (event.effects.efficiencyBonus) {
    // Aplicar bônus de eficiência (seria usado nos cálculos de produção)
    newState.efficiencyBonus = (newState.efficiencyBonus || 0) + event.effects.efficiencyBonus;
  }

  if (event.effects.storageCapacity) {
    newState.energy.storage = Math.min(100, newState.energy.storage + event.effects.storageCapacity);
  }

  return newState;
}

/**
 * Obtém evento por ID
 * @param {string} eventId - ID do evento
 * @returns {Object|null} Evento encontrado ou null
 */
export function getEventById(eventId) {
  return AVAILABLE_EVENTS.find(event => event.id === eventId) || null;
}

/**
 * Lista todos os eventos disponíveis
 * @returns {Array} Lista de eventos
 */
export function getAllEvents() {
  return [...AVAILABLE_EVENTS];
}

/**
 * Calcula probabilidade modificada de evento baseado no estado do jogo
 * @param {Object} baseEvent - Evento base
 * @param {Object} state - Estado atual
 * @returns {number} Probabilidade modificada
 */
export function calculateModifiedProbability(baseEvent, state) {
  let probability = baseEvent.probability;

  // Modificadores baseados no estado
  if (state.pollution > 70) {
    if (baseEvent.id === 'natural_disaster') probability *= 1.5;
    if (baseEvent.id === 'climate_miracle') probability *= 2;
  }

  if (state.temperature > 35) {
    if (baseEvent.id === 'natural_disaster') probability *= 1.3;
    if (baseEvent.id === 'international_aid') probability *= 1.8;
  }

  const avgPopularity = (state.popularity.poor + state.popularity.middle + state.popularity.rich) / 3;
  if (avgPopularity < 30) {
    if (baseEvent.id === 'public_protest') probability *= 2;
  }

  if (state.energy.capacity.fossil > 40) {
    if (baseEvent.id === 'corporate_scandal') probability *= 1.5;
  }

  return probability;
}

/**
 * Simula ocorrência de evento em um turno
 * @param {Object} state - Estado atual
 * @param {number} extraProbability - Probabilidade extra (0-100)
 * @returns {Object} Resultado da simulação
 */
export function simulateEventTurn(state, extraProbability = 0) {
  let eventOccurred = null;
  let newState = state;

  // Probabilidade base de evento ocorrer (10% + extra)
  const baseChance = 10 + extraProbability;
  const eventHappens = Math.random() * 100 < baseChance;

  if (eventHappens) {
    const event = selectRandomEvent(state);
    if (event) {
      newState = applyEventEffects(state, event);
      eventOccurred = event;
    }
  }

  return {
    eventOccurred,
    newState,
    eventHappened: !!eventOccurred
  };
}
