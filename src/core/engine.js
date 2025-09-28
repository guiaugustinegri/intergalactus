/**
 * Engine principal do jogo Planeta 2500
 * Coordena o loop de turnos e todas as fases do jogo
 */

import { getState, setState, applyPatch, addLogEntry } from './state.js';
import { simularTurnoEnergia, calcularProducaoTotal, calcularConsumoEfetivo } from './energy.js';
import { simularEconomiaTurno } from './economy.js';
import { atualizarPoluicaoETemperatura } from './environment.js';
import { simularTurnoSocial } from './society.js';
import { verificarFimJogo } from './victory.js';
import { simulateEventTurn } from './events.js';
import { shouldShowDecision } from './decisions.js';

/**
 * Estado interno do engine
 */
let gameRunning = false;
let pendingDecision = null;

/**
 * Inicia novo jogo
 */
export function iniciarJogo() {
  // Import dinâmico para evitar dependência circular
  import('./state.js').then(({ resetState }) => {
    resetState();
    gameRunning = true;
    pendingDecision = null;
    addLogEntry('Jogo iniciado. Bem-vindo ao Planeta 2500!', 'info');
  });
}

/**
 * Processa ação do jogador
 * @param {string} actionType - Tipo da ação
 * @param {Object} params - Parâmetros da ação
 */
export function processarAcaoJogador(actionType, params = {}) {
  if (!gameRunning) return;

  const state = getState();

  // Valida ação
  if (!validarAcao(actionType, params, state)) {
    addLogEntry(`Ação inválida: ${actionType}`, 'error');
    return;
  }

  // Aplica transição automática se necessário
  const stateComTransicao = aplicarTransicaoAutomatica(state, actionType, params);

  // Aplica ação
  const novoState = aplicarAcao(actionType, params, stateComTransicao);

  // Atualiza estado
  setState(novoState);

  // Log da ação
  logAcao(actionType, params);
}

/**
 * Valida se uma ação pode ser executada
 * @param {string} actionType - Tipo da ação
 * @param {Object} params - Parâmetros
 * @param {Object} state - Estado atual
 * @returns {boolean} Verdadeiro se válida
 */
function validarAcao(actionType, params, state) {
  switch (actionType) {
    case 'expandSolar':
    case 'expandWind':
    case 'expandHydro':
    case 'expandGeo':
      return state.credits >= 100; // Mínimo para expansão

    case 'reduceFossil':
      return state.energy.capacity.fossil > 0;

    case 'investResearch':
      return state.credits >= 100;

    case 'publicCampaign':
      return state.credits >= 50;

    case 'environmentalProgram':
      return state.credits >= 150;

    default:
      return false;
  }
}

/**
 * Aplica transição automática reduzindo fóssil quando renováveis aumentam
 * @param {Object} state - Estado atual
 * @param {string} actionType - Tipo da ação
 * @param {Object} params - Parâmetros
 * @returns {Object} Estado com transição aplicada
 */
function aplicarTransicaoAutomatica(state, actionType, params) {
  const renovavelActions = ['expandSolar', 'expandWind', 'expandHydro', 'expandGeo'];

  if (renovavelActions.includes(actionType)) {
    // Calcula aumento renovável
    const increaseAmount = params.amount || 10;
    const renewableIncrease = increaseAmount;

    if (renewableIncrease >= 20 && state.energy.capacity.fossil > 0) {
      const reduction = Math.min(5, Math.floor(renewableIncrease / 10));
      const newState = applyPatch(state, {
        energy: {
          capacity: {
            fossil: Math.max(0, state.energy.capacity.fossil - reduction)
          }
        }
      });

      addLogEntry(`Transição automática: ${reduction} MW de energia fóssil reduzidos`, 'info');
      return newState;
    }
  }

  return state;
}

/**
 * Aplica efeitos de uma ação no estado
 * @param {string} actionType - Tipo da ação
 * @param {Object} params - Parâmetros
 * @param {Object} state - Estado atual
 * @returns {Object} Novo estado
 */
function aplicarAcao(actionType, params, state) {
  let newState = { ...state };

  // Import dinâmico das regras
  const { ACTION_COSTS } = require('./rules.js');
  const costs = ACTION_COSTS[actionType];

  if (!costs) return state;

  // Deduz custos
  newState = applyPatch(newState, {
    credits: Math.max(0, newState.credits - (costs.credits || 0))
  });

  // Aplica efeitos energéticos
  if (costs.capacity !== undefined) {
    const capacityChanges = {};

    // Determina qual fonte baseado no tipo da ação
    switch (actionType) {
      case 'expandSolar':
        capacityChanges.solar = (newState.energy.capacity.solar || 0) + (costs.capacity || 10);
        break;
      case 'expandWind':
        capacityChanges.wind = (newState.energy.capacity.wind || 0) + (costs.capacity || 10);
        break;
      case 'expandHydro':
        capacityChanges.hydro = (newState.energy.capacity.hydro || 0) + (costs.capacity || 15);
        break;
      case 'expandGeo':
        capacityChanges.geo = (newState.energy.capacity.geo || 0) + (costs.capacity || 8);
        break;
      case 'reduceFossil':
        capacityChanges.fossil = Math.max(0, (newState.energy.capacity.fossil || 0) + (costs.capacity || -5));
        break;
    }

    newState = applyPatch(newState, {
      energy: {
        capacity: capacityChanges
      }
    });
  }

  // Aplica efeitos ambientais
  if (costs.pollution !== undefined) {
    newState = applyPatch(newState, {
      pollution: Math.max(0, Math.min(100, newState.pollution + costs.pollution))
    });
  }

  // Aplica efeitos sociais
  if (costs.popularityBonus !== undefined) {
    // Bônus igual para todas as classes
    newState = applyPatch(newState, {
      popularity: {
        poor: Math.min(100, newState.popularity.poor + costs.popularityBonus),
        middle: Math.min(100, newState.popularity.middle + costs.popularityBonus),
        rich: Math.min(100, newState.popularity.rich + costs.popularityBonus)
      }
    });
  }

  return newState;
}

/**
 * Log de ação executada
 * @param {string} actionType - Tipo da ação
 * @param {Object} params - Parâmetros
 */
function logAcao(actionType, params) {
  const actionNames = {
    expandSolar: 'Expandir Energia Solar',
    expandWind: 'Expandir Energia Eólica',
    expandHydro: 'Expandir Energia Hidro',
    expandGeo: 'Expandir Energia Geotérmica',
    reduceFossil: 'Reduzir Energia Fóssil',
    investResearch: 'Investir em Pesquisa',
    publicCampaign: 'Campanha Pública',
    environmentalProgram: 'Programa Ambiental'
  };

  const actionName = actionNames[actionType] || actionType;
  addLogEntry(`Ação executada: ${actionName}`, 'success');
}

/**
 * Executa turno completo (fase ambiental)
 */
export function executarTurno() {
  if (!gameRunning) return;

  const state = getState();

  // Fase 1: Recalcular energia
  const energyResults = simularTurnoEnergia(
    state.energy.capacity,
    state,
    state.energy.storage
  );

  // Fase 2: Aplicar degradação ambiental
  const envResults = atualizarPoluicaoETemperatura(
    state.pollution,
    state.temperature,
    energyResults.production * 0.05, // Poluição baseada na produção
    energyResults.ratioRenovavel,
    false // Sem programas de limpeza por enquanto
  );

  // Fase 3: Calcular economia
  const economyResults = simularEconomiaTurno(
    state.popularity,
    state.energy.capacity,
    state.credits
  );

  // Fase 4: Simular sociedade
  const socialResults = simularTurnoSocial(
    state.popularity,
    {
      ...state,
      pollution: envResults.newPollution,
      temperature: envResults.newTemperature,
      energy: {
        ...state.energy,
        production: energyResults.production,
        consumption: energyResults.consumption
      }
    },
    [], // Ações do turno (não aplicadas ainda)
    [], // Eventos
    []  // Decisões
  );

  // Fase 5: Aplicar eventos aleatórios
  const eventResults = simulateEventTurn({
    ...state,
    pollution: envResults.newPollution,
    temperature: envResults.newTemperature,
    popularity: socialResults.newPopularity
  });

  // Fase 6: Verificar decisões
  const decisionResult = shouldShowDecision(eventResults.newState);

  // Aplicar todas as mudanças
  const finalState = applyPatch(eventResults.newState, {
    turn: state.turn + 1,
    energy: {
      production: energyResults.production,
      consumption: energyResults.consumption,
      storage: energyResults.newStorage
    },
    pollution: envResults.newPollution,
    temperature: envResults.newTemperature,
    credits: economyResults.finalCredits,
    popularity: socialResults.newPopularity,
    cooldowns: {
      decision: Math.max(0, state.cooldowns.decision - 1)
    }
  });

  setState(finalState);

  // Logs do turno
  logTurno(energyResults, envResults, economyResults, socialResults, eventResults);

  // Verificar fim do jogo
  const gameEnd = verificarFimJogo(finalState);
  if (gameEnd) {
    gameRunning = false;
    return gameEnd;
  }

  // Preparar decisão se necessário
  if (decisionResult.show) {
    pendingDecision = decisionResult.decision;
    return { decisionRequired: true, decision: decisionResult.decision };
  }

  return { turnCompleted: true };
}

/**
 * Log detalhado do turno
 * @param {Object} energyResults - Resultados energéticos
 * @param {Object} envResults - Resultados ambientais
 * @param {Object} economyResults - Resultados econômicos
 * @param {Object} socialResults - Resultados sociais
 * @param {Object} eventResults - Resultados de eventos
 */
function logTurno(energyResults, envResults, economyResults, socialResults, eventResults) {
  addLogEntry(`Turno ${getState().turn} completado`, 'info');

  if (energyResults.balance < 0) {
    addLogEntry(`Déficit energético: ${Math.abs(energyResults.balance)} MW`, 'warning');
  }

  if (envResults.pollutionChange > 5) {
    addLogEntry(`Aumento de poluição: ${envResults.pollutionChange.toFixed(1)}`, 'warning');
  }

  if (economyResults.incomeModifiers.modifier < 0) {
    addLogEntry(`Pressão fiscal: ${economyResults.incomeModifiers.modifier} créditos`, 'warning');
  }

  if (eventResults.eventOccurred) {
    addLogEntry(eventResults.eventOccurred.logMessage, 'event');
  }
}

/**
 * Processa decisão do jogador
 * @param {string} choice - 'accept' ou 'reject'
 */
export function processarDecisao(choice) {
  if (!pendingDecision) return;

  // Import dinâmico
  const { applyDecisionEffects } = require('./decisions.js');

  const state = getState();
  const newState = applyDecisionEffects(state, pendingDecision, choice);

  setState(newState);

  // Log da decisão
  const choiceText = choice === 'accept' ? 'ACEITA' : 'REJEITADA';
  addLogEntry(`Decisão "${pendingDecision.title}" ${choiceText}`, 'info');

  pendingDecision = null;
}

/**
 * Obtém decisão pendente
 * @returns {Object|null} Decisão pendente ou null
 */
export function getPendingDecision() {
  return pendingDecision;
}

/**
 * Verifica se jogo está rodando
 * @returns {boolean} Verdadeiro se jogo ativo
 */
export function isGameRunning() {
  return gameRunning;
}

/**
 * Pausa o jogo
 */
export function pausarJogo() {
  gameRunning = false;
}

/**
 * Retoma o jogo
 */
export function retomarJogo() {
  gameRunning = true;
}
