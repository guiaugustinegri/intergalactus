/**
 * Módulo social para Planeta 2500
 * Gestão de popularidade, efeitos sociais e dinâmica de classes
 */

import { clamp } from './rules.js';

/**
 * Atualiza popularidade das classes baseado em ações e eventos
 * @param {Object} currentPopularity - Popularidade atual por classe
 * @param {string} actionType - Tipo da ação realizada
 * @param {Object} params - Parâmetros adicionais
 * @returns {Object} Nova popularidade por classe
 */
export function atualizarPopularidade(currentPopularity, actionType, params = {}) {
  const newPopularity = { ...currentPopularity };

  switch (actionType) {
    case 'expandSolar':
      newPopularity.middle += 3;
      newPopularity.rich += 1;
      // Pobres têm opinião neutra
      break;

    case 'expandWind':
      newPopularity.poor += 2;
      newPopularity.middle += 2;
      newPopularity.rich += 1;
      break;

    case 'expandHydro':
      newPopularity.middle += 1;
      newPopularity.rich += 2;
      // Pobres podem se opor a barragens
      newPopularity.poor -= 1;
      break;

    case 'expandGeo':
      newPopularity.middle += 2;
      newPopularity.rich += 2;
      // Tecnologia avançada agrada classes média e alta
      break;

    case 'expandFossil':
      newPopularity.rich += 5; // Corporações ganham
      newPopularity.poor -= 3; // Pobres sofrem com poluição
      newPopularity.middle -= 1;
      break;

    case 'reduceFossil':
      newPopularity.poor += 4;
      newPopularity.middle += 2;
      newPopularity.rich -= 3; // Corporações perdem influência
      break;

    case 'investResearch':
      newPopularity.middle += 3;
      newPopularity.rich += 2;
      // Inovação tecnológica agrada classes educadas
      break;

    case 'publicCampaign':
      newPopularity.poor += 3;
      newPopularity.middle += 1;
      // Campanhas públicas ajudam os pobres principalmente
      break;

    case 'environmentalProgram':
      newPopularity.poor += 4;
      newPopularity.middle += 3;
      newPopularity.rich -= 2; // Custoso para ricos
      break;

    case 'decision':
      // Decisões têm efeitos específicos baseados na escolha
      if (params.decision && params.choice) {
        applyDecisionEffects(newPopularity, params.decision, params.choice);
      }
      break;

    case 'event':
      // Eventos aleatórios afetam popularidade
      if (params.event) {
        applyEventEffects(newPopularity, params.event);
      }
      break;
  }

  // Aplica limites e clamp
  newPopularity.poor = clamp(newPopularity.poor, 0, 100);
  newPopularity.middle = clamp(newPopularity.middle, 0, 100);
  newPopularity.rich = clamp(newPopularity.rich, 0, 100);

  return newPopularity;
}

/**
 * Aplica efeitos de decisão na popularidade
 * @param {Object} popularity - Popularidade atual
 * @param {Object} decision - Objeto da decisão
 * @param {string} choice - Escolha feita ('accept' ou 'reject')
 */
function applyDecisionEffects(popularity, decision, choice) {
  const effects = choice === 'accept' ? decision.acceptEffects : decision.rejectEffects;

  if (effects.popularity) {
    popularity.poor += effects.popularity.poor || 0;
    popularity.middle += effects.popularity.middle || 0;
    popularity.rich += effects.popularity.rich || 0;
  }
}

/**
 * Aplica efeitos de evento aleatório na popularidade
 * @param {Object} popularity - Popularidade atual
 * @param {Object} event - Evento aleatório
 */
function applyEventEffects(popularity, event) {
  const effects = event.effects;

  if (effects.popularity) {
    popularity.poor += effects.popularity.poor || 0;
    popularity.middle += effects.popularity.middle || 0;
    popularity.rich += effects.popularity.rich || 0;
  }
}

/**
 * Calcula média geral de popularidade
 * @param {Object} popularity - Popularidade por classe
 * @returns {number} Média geral
 */
export function calcularPopularidadeGeral(popularity) {
  return Math.round((popularity.poor + popularity.middle + popularity.rich) / 3);
}

/**
 * Calcula impacto da popularidade na renda econômica
 * @param {Object} popularity - Popularidade por classe
 * @returns {number} Modificador de renda (-1.0 a 1.0)
 */
export function calcularImpactoRenda(popularity) {
  const avgPopularity = calcularPopularidadeGeral(popularity);

  // Popularidade alta aumenta renda, baixa diminui
  if (avgPopularity >= 70) return 0.1;   // +10% renda
  if (avgPopularity >= 50) return 0.0;   // Renda normal
  if (avgPopularity >= 30) return -0.1;  // -10% renda
  return -0.2; // -20% renda se muito impopular
}

/**
 * Avalia satisfação das classes sociais
 * @param {Object} popularity - Popularidade por classe
 * @returns {Object} Avaliação por classe
 */
export function avaliarSatisfacaoClasses(popularity) {
  const evaluateClass = (pop) => {
    if (pop >= 70) return 'Satisfeita';
    if (pop >= 50) return 'Neutra';
    if (pop >= 30) return 'Insatisfeita';
    return 'Revoltada';
  };

  return {
    poor: evaluateClass(popularity.poor),
    middle: evaluateClass(popularity.middle),
    rich: evaluateClass(popularity.rich),
    overall: evaluateClass(calcularPopularidadeGeral(popularity))
  };
}

/**
 * Simula efeitos sociais de longo prazo
 * @param {Object} popularity - Popularidade atual
 * @param {Object} state - Estado completo do jogo
 * @returns {Object} Mudanças de longo prazo
 */
export function simularEfeitosLongoPrazo(popularity, state) {
  const changes = {
    poor: 0,
    middle: 0,
    rich: 0
  };

  // Efeitos da poluição
  if (state.pollution > 50) {
    changes.poor -= Math.floor(state.pollution / 20); // Pobres sofrem mais
    changes.middle -= Math.floor(state.pollution / 30);
  }

  // Efeitos da temperatura
  if (state.temperature > 35) {
    changes.poor -= Math.floor((state.temperature - 35) / 2);
    changes.middle -= Math.floor((state.temperature - 35) / 3);
  }

  // Efeitos econômicos
  if (state.credits < 200) {
    changes.poor -= 2;
    changes.middle -= 1;
  }

  // Efeitos energéticos
  const energyBalance = state.energy.production - state.energy.consumption;
  if (energyBalance < -10) {
    changes.poor -= 2;
    changes.middle -= 1;
    changes.rich -= 1;
  }

  return changes;
}

/**
 * Gera migração entre classes baseado na satisfação
 * @param {Object} popularity - Popularidade atual
 * @returns {Object} Mudanças por migração
 */
export function calcularMigracaoClasses(popularity) {
  const migration = {
    poor: 0,
    middle: 0,
    rich: 0
  };

  // Se pobres muito insatisfeitos, podem "desaparecer" (emigração)
  if (popularity.poor < 20) {
    migration.poor = -1;
  }

  // Classe média pode subir ou descer
  if (popularity.middle < 30) {
    migration.middle = -1;
    migration.poor = 1;
  } else if (popularity.middle > 80) {
    migration.middle = -1;
    migration.rich = 1;
  }

  return migration;
}

/**
 * Calcula probabilidade de revolta social
 * @param {Object} popularity - Popularidade por classe
 * @returns {number} Probabilidade de revolta (0-100)
 */
export function calcularProbabilidadeRevolta(popularity) {
  const avgPopularity = calcularPopularidadeGeral(popularity);

  if (avgPopularity >= 60) return 0;
  if (avgPopularity >= 40) return Math.max(0, 50 - avgPopularity);
  if (avgPopularity >= 20) return Math.max(0, 80 - avgPopularity);
  return 100; // Revolta certa se popularidade < 20
}

/**
 * Simula turno social completo
 * @param {Object} popularity - Popularidade atual
 * @param {Object} state - Estado completo do jogo
 * @param {Array} actions - Ações realizadas no turno
 * @param {Array} events - Eventos ocorridos
 * @param {Array} decisions - Decisões tomadas
 * @returns {Object} Resultados sociais do turno
 */
export function simularTurnoSocial(popularity, state, actions = [], events = [], decisions = []) {
  let newPopularity = { ...popularity };

  // Aplica efeitos das ações
  for (const action of actions) {
    newPopularity = atualizarPopularidade(newPopularity, action.type, action.params);
  }

  // Aplica efeitos dos eventos
  for (const event of events) {
    newPopularity = atualizarPopularidade(newPopularity, 'event', { event });
  }

  // Aplica efeitos das decisões
  for (const decision of decisions) {
    newPopularity = atualizarPopularidade(newPopularity, 'decision', {
      decision: decision.decision,
      choice: decision.choice
    });
  }

  // Aplica efeitos de longo prazo
  const longTermEffects = simularEfeitosLongoPrazo(newPopularity, state);
  newPopularity.poor += longTermEffects.poor;
  newPopularity.middle += longTermEffects.middle;
  newPopularity.rich += longTermEffects.rich;

  // Aplica migração entre classes
  const migration = calcularMigracaoClasses(newPopularity);
  newPopularity.poor += migration.poor;
  newPopularity.middle += migration.middle;
  newPopularity.rich += migration.rich;

  // Clamp final
  newPopularity.poor = clamp(newPopularity.poor, 0, 100);
  newPopularity.middle = clamp(newPopularity.middle, 0, 100);
  newPopularity.rich = clamp(newPopularity.rich, 0, 100);

  const avgPopularity = calcularPopularidadeGeral(newPopularity);
  const satisfaction = avaliarSatisfacaoClasses(newPopularity);
  const revoltProbability = calcularProbabilidadeRevolta(newPopularity);

  return {
    newPopularity,
    avgPopularity,
    satisfaction,
    revoltProbability,
    longTermEffects,
    migration
  };
}

/**
 * Gera recomendações sociais baseadas no estado
 * @param {Object} popularity - Popularidade atual
 * @returns {Array} Lista de recomendações
 */
export function gerarRecomendacoesSociais(popularity) {
  const recommendations = [];
  const satisfaction = avaliarSatisfacaoClasses(popularity);

  if (satisfaction.poor === 'Revoltada') {
    recommendations.push('A classe pobre está revoltada - implemente políticas sociais urgentes');
  } else if (satisfaction.poor === 'Insatisfeita') {
    recommendations.push('Melhore satisfação da classe pobre com programas sociais');
  }

  if (satisfaction.middle === 'Insatisfeita' || satisfaction.middle === 'Revoltada') {
    recommendations.push('A classe média precisa de mais atenção às suas preocupações');
  }

  if (satisfaction.rich === 'Insatisfeita' && satisfaction.poor === 'Satisfeita') {
    recommendations.push('Balanceie políticas entre classes sociais');
  }

  const revoltProb = calcularProbabilidadeRevolta(popularity);
  if (revoltProb > 50) {
    recommendations.push('Risco alto de revolta social - tome medidas imediatas');
  }

  return recommendations;
}
