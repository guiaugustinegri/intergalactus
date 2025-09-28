/**
 * UI Layout para Planeta 2500
 * Construção e atualização dinâmica da interface
 */

import { getState } from '../core/state.js';
import { formatNumber, formatTemperature, formatPercentage, formatEnergy, formatCredits } from '../utils/format.js';

/**
 * Atualiza todos os elementos da UI com dados do estado atual
 */
export function atualizarLayout() {
  const state = getState();

  // Atualizar turno
  atualizarTurno(state.turn);

  // Atualizar indicadores principais
  atualizarIndicadores(state);

  // Atualizar painel de energia
  atualizarPainelEnergia(state);

  // Atualizar canvas do planeta
  atualizarCanvasPlaneta(state);

  // Atualizar log
  atualizarLog(state.logs);
}

/**
 * Atualiza contador de turnos
 * @param {number} turn - Número do turno
 */
function atualizarTurno(turn) {
  const turnElement = document.getElementById('turn-number');
  if (turnElement) {
    turnElement.textContent = turn;
  }
}

/**
 * Atualiza indicadores principais (créditos, poluição, temperatura, popularidade)
 * @param {Object} state - Estado do jogo
 */
function atualizarIndicadores(state) {
  // Créditos
  atualizarBarra('credits-bar', 'credits-value', state.credits, 1000, formatCredits(state.credits), 'economy-bar');

  // Poluição
  atualizarBarra('pollution-bar', 'pollution-value', state.pollution, 100, formatPercentage(state.pollution), 'negative-bar');

  // Temperatura
  const tempPercentage = ((state.temperature - 15) / 35) * 100; // 15-50°C mapeado para 0-100%
  atualizarBarra('temperature-bar', 'temperature-value', tempPercentage, 100, formatTemperature(state.temperature), 'negative-bar');

  // Popularidade média
  const avgPopularity = (state.popularity.poor + state.popularity.middle + state.popularity.rich) / 3;
  atualizarBarra('popularity-bar', 'popularity-value', avgPopularity, 100, formatPercentage(avgPopularity), 'positive-bar');
}

/**
 * Atualiza uma barra de progresso
 * @param {string} barId - ID da barra
 * @param {string} valueId - ID do elemento de valor
 * @param {number} value - Valor atual
 * @param {number} maxValue - Valor máximo
 * @param {string} displayText - Texto para exibir
 * @param {string} barClass - Classe CSS da barra
 */
function atualizarBarra(barId, valueId, value, maxValue, displayText, barClass) {
  const barElement = document.getElementById(barId);
  const valueElement = document.getElementById(valueId);

  if (barElement) {
    const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
    barElement.style.width = `${percentage}%`;
    barElement.className = `bar ${barClass}`;
  }

  if (valueElement) {
    valueElement.textContent = displayText;
  }
}

/**
 * Atualiza painel de energia
 * @param {Object} state - Estado do jogo
 */
function atualizarPainelEnergia(state) {
  const capacity = state.energy.capacity;

  // Atualizar capacidades
  atualizarTexto('solar-capacity', formatEnergy(capacity.solar));
  atualizarTexto('wind-capacity', formatEnergy(capacity.wind));
  atualizarTexto('hydro-capacity', formatEnergy(capacity.hydro));
  atualizarTexto('geo-capacity', formatEnergy(capacity.geo));
  atualizarTexto('fossil-capacity', formatEnergy(capacity.fossil));

  // Calcular e atualizar produção/consumo/armazenamento
  const production = calcularProducaoEstimada(state);
  const consumption = state.energy.consumptionBase || 50;

  atualizarTexto('production-total', formatEnergy(production));
  atualizarTexto('consumption-total', formatEnergy(consumption));
  atualizarTexto('storage-total', formatEnergy(state.energy.storage));
}

/**
 * Calcula produção estimada baseada no estado atual
 * @param {Object} state - Estado do jogo
 * @returns {number} Produção estimada
 */
function calcularProducaoEstimada(state) {
  // Cálculo simplificado para UI - versão completa está em energy.js
  const { calculateEffectiveEfficiency, ENERGY_EFFICIENCIES } = require('../core/rules.js');

  let total = 0;
  const sources = ['solar', 'wind', 'hydro', 'geo', 'fossil'];

  for (const source of sources) {
    const capacity = state.energy.capacity[source] || 0;
    const efficiency = calculateEffectiveEfficiency(source, state);
    total += capacity * efficiency;
  }

  return Math.floor(total);
}

/**
 * Atualiza texto de um elemento
 * @param {string} elementId - ID do elemento
 * @param {string} text - Texto para definir
 */
function atualizarTexto(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

/**
 * Atualiza status do planeta no canvas
 * @param {Object} state - Estado do jogo
 */
function atualizarCanvasPlaneta(state) {
  const statusElement = document.getElementById('planet-condition');
  if (statusElement) {
    const avgPopularity = (state.popularity.poor + state.popularity.middle + state.popularity.rich) / 3;

    let condition = 'Crítico';
    if (state.pollution <= 20 && state.temperature <= 25 && avgPopularity >= 60) {
      condition = 'Excelente';
    } else if (state.pollution <= 40 && state.temperature <= 30 && avgPopularity >= 50) {
      condition = 'Estável';
    } else if (state.pollution <= 60 && state.temperature <= 35 && avgPopularity >= 40) {
      condition = 'Preocupante';
    } else if (state.pollution <= 80 && state.temperature <= 40 && avgPopularity >= 30) {
      condition = 'Instável';
    }

    statusElement.textContent = condition;
  }
}

/**
 * Atualiza log de eventos
 * @param {Array} logs - Array de entradas do log
 */
function atualizarLog(logs) {
  const logContainer = document.getElementById('log-container');
  if (!logContainer) return;

  // Limpa log atual
  logContainer.innerHTML = '';

  // Mostra últimas 10 entradas
  const recentLogs = logs.slice(-10);

  for (const entry of recentLogs) {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${entry.type || 'info'}`;

    const timestamp = document.createElement('span');
    timestamp.className = 'log-timestamp';
    timestamp.textContent = `[${entry.timestamp}] `;

    const message = document.createElement('span');
    message.className = 'log-message';
    message.textContent = entry.message;

    logEntry.appendChild(timestamp);
    logEntry.appendChild(message);
    logContainer.appendChild(logEntry);
  }

  // Scroll para o final
  logContainer.scrollTop = logContainer.scrollHeight;
}

/**
 * Atualiza tooltips dos botões de ação
 * @param {Object} state - Estado do jogo
 */
export function atualizarTooltipsAcoes(state) {
  const { ACTION_COSTS } = require('../core/rules.js');
  const { formatActionTooltip, createTooltip } = require('../utils/format.js');

  // Mapeamento de ações para IDs de botões
  const actionButtons = {
    'expand-solar-btn': 'expandSolar',
    'expand-wind-btn': 'expandWind',
    'expand-hydro-btn': 'expandHydro',
    'expand-geo-btn': 'expandGeo',
    'reduce-fossil-btn': 'reduceFossil',
    'invest-research-btn': 'investResearch',
    'public-campaign-btn': 'publicCampaign',
    'environmental-program-btn': 'environmentalProgram'
  };

  for (const [buttonId, actionType] of Object.entries(actionButtons)) {
    const button = document.getElementById(buttonId);
    if (button && ACTION_COSTS[actionType]) {
      const tooltip = formatActionTooltip(actionType, ACTION_COSTS[actionType]);
      button.setAttribute('data-tooltip', tooltip);
    }
  }
}

/**
 * Habilita/desabilita botões baseado no estado do jogo
 * @param {Object} state - Estado do jogo
 */
export function atualizarEstadoBotoes(state) {
  const actionButtons = [
    'expand-solar-btn', 'expand-wind-btn', 'expand-hydro-btn', 'expand-geo-btn',
    'reduce-fossil-btn', 'invest-research-btn', 'public-campaign-btn',
    'environmental-program-btn', 'end-turn-btn'
  ];

  const minCreditsForExpansion = 100;

  for (const buttonId of actionButtons) {
    const button = document.getElementById(buttonId);
    if (button) {
      const isExpansion = buttonId.includes('expand');
      const isEndTurn = buttonId === 'end-turn-btn';

      if (isExpansion) {
        // Desabilita expansões se não há créditos suficientes
        button.disabled = state.credits < minCreditsForExpansion;
        button.style.opacity = button.disabled ? 0.5 : 1;
      } else if (!isEndTurn) {
        // Para outras ações, verifica custos específicos
        const actionType = buttonId.replace('-btn', '').replace('-', '');
        const { ACTION_COSTS } = require('../core/rules.js');
        const costs = ACTION_COSTS[actionType];

        if (costs) {
          button.disabled = state.credits < (costs.credits || 0);
          button.style.opacity = button.disabled ? 0.5 : 1;
        }
      }
    }
  }
}

/**
 * Inicializa tooltips e estados visuais
 */
export function inicializarLayout() {
  // Adicionar event listeners para tooltips
  const buttons = document.querySelectorAll('[data-tooltip]');
  buttons.forEach(button => {
    button.addEventListener('mouseenter', mostrarTooltip);
    button.addEventListener('mouseleave', esconderTooltip);
  });
}

/**
 * Mostra tooltip (implementação básica)
 * @param {Event} event - Evento do mouse
 */
function mostrarTooltip(event) {
  // Tooltips são implementados via CSS :hover
  // Esta função pode ser expandida para tooltips customizados
}

/**
 * Esconde tooltip
 * @param {Event} event - Evento do mouse
 */
function esconderTooltip(event) {
  // Implementação mantida simples por enquanto
}

/**
 * Anima mudanças importantes na UI
 * @param {string} elementId - ID do elemento para animar
 * @param {string} animationClass - Classe de animação
 */
export function animarElemento(elementId, animationClass = 'highlight') {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add(animationClass);
    setTimeout(() => {
      element.classList.remove(animationClass);
    }, 1000);
  }
}
