/**
 * Sistema de decisões estilo HoI4 para Planeta 2500
 * Decisões estratégicas que o jogador deve tomar
 */

import { GAME_DECISIONS } from './rules.js';

/**
 * Lista completa de decisões disponíveis
 */
const DECISIONS = [
  {
    id: 'corporate_pressure',
    title: 'Pressão Corporativa',
    description: 'Empresas de energia fóssil oferecem generoso suborno para manter a infraestrutura antiga. Aceitar garante lucro imediato mas pode prejudicar a transição energética.',
    targetClass: 'rich',
    acceptEffects: {
      credits: 200,
      popularity: { rich: 10, poor: -5, middle: -2 },
      fossilBonus: 5
    },
    rejectEffects: {
      popularity: { rich: -5, poor: 5, middle: 2 }
    },
    cooldown: 3,
    category: 'economic'
  },
  {
    id: 'green_initiative',
    title: 'Iniciativa Verde',
    description: 'Movimento popular organizado exige transição energética imediata e investimento massivo em renováveis. Apoiar pode custar caro mas aumenta apoio popular.',
    targetClass: 'poor',
    acceptEffects: {
      popularity: { poor: 15, middle: 5 },
      renewableBonus: 0.1,
      credits: -150
    },
    rejectEffects: {
      popularity: { poor: -10, middle: -5 },
      renewablePenalty: 0.05
    },
    cooldown: 3,
    category: 'social'
  },
  {
    id: 'climate_summit',
    title: 'Cúpula Climática',
    description: 'Conferência internacional propõe metas ambiciosas de redução de emissões. Participar mostra liderança ambiental mas pode exigir concessões econômicas.',
    targetClass: 'middle',
    acceptEffects: {
      pollution: -5,
      internationalAid: 100,
      popularity: { middle: 8 }
    },
    rejectEffects: {
      temperature: 2,
      pollution: 3,
      internationalPenalty: 50
    },
    cooldown: 4,
    category: 'environmental'
  },
  {
    id: 'tech_breakthrough',
    title: 'Avanço Tecnológico',
    description: 'Pesquisadores descobriram método revolucionário de armazenamento de energia. Financiar o desenvolvimento acelera inovação mas consome recursos valiosos.',
    targetClass: 'rich',
    acceptEffects: {
      storageCapacity: 20,
      efficiencyBonus: 0.1,
      credits: -200
    },
    rejectEffects: {
      credits: -50, // Investimento perdido
      techPenalty: 0.05
    },
    cooldown: 5,
    category: 'technological'
  },
  {
    id: 'economic_crisis',
    title: 'Crise Econômica',
    description: 'Recessão global afeta investimentos em energia renovável. O governo pode intervir com subsídios ou deixar o mercado se autorregular.',
    targetClass: 'middle',
    acceptEffects: {
      credits: -100,
      fossilReduction: -10,
      popularity: { middle: 10, poor: 5 }
    },
    rejectEffects: {
      credits: -200,
      popularity: { middle: -10 },
      renewablePenalty: 0.1
    },
    cooldown: 2,
    category: 'economic'
  }
];

/**
 * Verifica se uma decisão está disponível
 * @param {Object} decision - Decisão a verificar
 * @param {Object} state - Estado atual do jogo
 * @returns {boolean} Verdadeiro se disponível
 */
export function isDecisionAvailable(decision, state) {
  // Verifica cooldown
  if (state.cooldowns.decision > 0) {
    return false;
  }

  // Verifica condições específicas da decisão
  switch (decision.id) {
    case 'corporate_pressure':
      return state.energy.capacity.fossil > 20 && state.credits < 500;

    case 'green_initiative':
      return state.popularity.poor < 40 && state.energy.capacity.solar + state.energy.capacity.wind < 50;

    case 'climate_summit':
      return (state.pollution > 40 || state.temperature > 28) && state.turn >= 5;

    case 'tech_breakthrough':
      return state.energy.storage < 30 && state.credits >= 300;

    case 'economic_crisis':
      return state.credits < 300 && state.energy.capacity.fossil > 30;

    default:
      return false;
  }
}

/**
 * Calcula probabilidade de decisão aparecer
 * @param {Object} state - Estado atual
 * @returns {number} Probabilidade base (0-100)
 */
export function calculateDecisionProbability(state) {
  let probability = 10; // Base 10%

  // Classe alvo com popularidade baixa aumenta chance
  const targetClass = getDecisionTargetClass(state);
  if (targetClass) {
    const targetPopularity = state.popularity[targetClass];
    if (targetPopularity < 50) {
      probability += 15;
    }
  }

  // Poluição alta ou déficit energético aumentam chance
  if (state.pollution > 70) {
    probability += 10;
  }

  const energyBalance = state.energy.production - state.energy.consumption;
  if (energyBalance < -20) {
    probability += 10;
  }

  return Math.min(50, probability); // Máximo 50%
}

/**
 * Determina qual classe é alvo baseado no estado atual
 * @param {Object} state - Estado atual
 * @returns {string|null} Classe alvo ou null
 */
function getDecisionTargetClass(state) {
  const avgPopularity = (state.popularity.poor + state.popularity.middle + state.popularity.rich) / 3;

  // Prioriza classe com menor popularidade
  if (state.popularity.poor < avgPopularity - 10) return 'poor';
  if (state.popularity.middle < avgPopularity - 10) return 'middle';
  if (state.popularity.rich < avgPopularity - 10) return 'rich';

  // Fallback baseado em contexto
  if (state.pollution > 60) return 'middle'; // Classe média preocupada com ambiente
  if (state.credits < 200) return 'rich'; // Classe rica preocupada com economia
  if (state.energy.production < state.energy.consumption) return 'poor'; // Classe pobre sofre com apagões

  return 'middle'; // Default
}

/**
 * Seleciona decisão apropriada para o estado atual
 * @param {Object} state - Estado atual
 * @returns {Object|null} Decisão selecionada ou null
 */
export function selectAppropriateDecision(state) {
  const availableDecisions = DECISIONS.filter(decision => isDecisionAvailable(decision, state));

  if (availableDecisions.length === 0) {
    return null;
  }

  const targetClass = getDecisionTargetClass(state);

  // Prioriza decisões que afetam a classe alvo
  const targetDecisions = availableDecisions.filter(decision => decision.targetClass === targetClass);

  if (targetDecisions.length > 0) {
    return targetDecisions[Math.floor(Math.random() * targetDecisions.length)];
  }

  // Fallback para qualquer decisão disponível
  return availableDecisions[Math.floor(Math.random() * availableDecisions.length)];
}

/**
 * Aplica efeitos de uma decisão aceita
 * @param {Object} state - Estado atual
 * @param {Object} decision - Decisão tomada
 * @param {string} choice - 'accept' ou 'reject'
 * @returns {Object} Novo estado com efeitos aplicados
 */
export function applyDecisionEffects(state, decision, choice) {
  const newState = JSON.parse(JSON.stringify(state));
  const effects = choice === 'accept' ? decision.acceptEffects : decision.rejectEffects;

  // Efeitos econômicos
  if (effects.credits !== undefined) {
    newState.credits = Math.max(0, newState.credits + effects.credits);
  }

  if (effects.internationalAid !== undefined) {
    newState.credits = Math.max(0, newState.credits + effects.internationalAid);
  }

  // Efeitos ambientais
  if (effects.pollution !== undefined) {
    newState.pollution = Math.max(0, Math.min(100, newState.pollution + effects.pollution));
  }

  if (effects.temperature !== undefined) {
    newState.temperature = Math.max(15, Math.min(50, newState.temperature + effects.temperature));
  }

  // Efeitos sociais
  if (effects.popularity) {
    newState.popularity.poor = Math.max(0, Math.min(100, newState.popularity.poor + (effects.popularity.poor || 0)));
    newState.popularity.middle = Math.max(0, Math.min(100, newState.popularity.middle + (effects.popularity.middle || 0)));
    newState.popularity.rich = Math.max(0, Math.min(100, newState.popularity.rich + (effects.popularity.rich || 0)));
  }

  // Efeitos energéticos
  if (effects.fossilBonus !== undefined) {
    newState.energy.capacity.fossil = Math.max(0, newState.energy.capacity.fossil + effects.fossilBonus);
  }

  if (effects.fossilReduction !== undefined) {
    newState.energy.capacity.fossil = Math.max(0, newState.energy.capacity.fossil + effects.fossilReduction);
  }

  if (effects.storageCapacity !== undefined) {
    newState.energy.storage = Math.min(100, newState.energy.storage + effects.storageCapacity);
  }

  if (effects.efficiencyBonus !== undefined) {
    newState.efficiencyBonus = (newState.efficiencyBonus || 0) + effects.efficiencyBonus;
  }

  if (effects.renewableBonus !== undefined) {
    // Aplicar bônus a todas as fontes renováveis
    newState.renewableBonus = (newState.renewableBonus || 0) + effects.renewableBonus;
  }

  if (effects.renewablePenalty !== undefined) {
    newState.renewableBonus = (newState.renewableBonus || 0) - effects.renewablePenalty;
  }

  if (effects.techPenalty !== undefined) {
    newState.efficiencyBonus = (newState.efficiencyBonus || 0) - effects.techPenalty;
  }

  if (effects.internationalPenalty !== undefined) {
    newState.credits = Math.max(0, newState.credits - effects.internationalPenalty);
  }

  // Define cooldown
  newState.cooldowns.decision = decision.cooldown;

  return newState;
}

/**
 * Obtém decisão por ID
 * @param {string} decisionId - ID da decisão
 * @returns {Object|null} Decisão encontrada ou null
 */
export function getDecisionById(decisionId) {
  return DECISIONS.find(decision => decision.id === decisionId) || null;
}

/**
 * Lista todas as decisões disponíveis
 * @returns {Array} Lista de decisões
 */
export function getAllDecisions() {
  return [...DECISIONS];
}

/**
 * Verifica se deve mostrar decisão neste turno
 * @param {Object} state - Estado atual
 * @returns {Object|null} Resultado da verificação
 */
export function shouldShowDecision(state) {
  // Verifica cooldown
  if (state.cooldowns.decision > 0) {
    return null;
  }

  // Calcula probabilidade
  const probability = calculateDecisionProbability(state);
  const shouldShow = Math.random() * 100 < probability;

  if (shouldShow) {
    const decision = selectAppropriateDecision(state);
    if (decision) {
      return {
        show: true,
        decision: decision
      };
    }
  }

  return { show: false };
}

/**
 * Simula decisão em um turno
 * @param {Object} state - Estado atual
 * @returns {Object} Resultado da simulação
 */
export function simulateDecisionTurn(state) {
  const result = shouldShowDecision(state);

  return {
    decisionShown: result ? result.decision : null,
    shouldShowModal: result ? result.show : false,
    newState: state // Estado não muda até decisão ser tomada
  };
}
