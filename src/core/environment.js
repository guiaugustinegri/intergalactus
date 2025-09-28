/**
 * Módulo ambiental para Planeta 2500
 * Cálculos de poluição, temperatura e degradação ambiental
 */

import { clamp, ENVIRONMENTAL_MODIFIERS } from './rules.js';

/**
 * Calcula poluição gerada por fonte energética
 * @param {string} sourceType - Tipo da fonte
 * @param {number} production - Produção efetiva da fonte
 * @returns {number} Poluição gerada por turno
 */
export function calcularPoluicaoFonte(sourceType, production) {
  const pollutionRates = {
    solar: 0.1,    // Muito baixa poluição (fabricação)
    wind: 0.05,    // Baixa poluição
    hydro: 0.2,    // Poluição moderada (construção)
    geo: 0.15,     // Poluição moderada
    fossil: 2.0    // Alta poluição
  };

  return production * (pollutionRates[sourceType] || 0);
}

/**
 * Calcula poluição total do sistema energético
 * @param {Object} capacity - Capacidades por fonte
 * @param {Object} state - Estado atual do jogo
 * @returns {number} Poluição total gerada
 */
export function calcularPoluicaoTotal(capacity, state) {
  let totalPollution = 0;

  // Import dinâmico para evitar dependência circular
  const { calcularProducaoEfetiva } = require('./energy.js');

  totalPollution += calcularPoluicaoFonte('solar', calcularProducaoEfetiva('solar', capacity.solar, state));
  totalPollution += calcularPoluicaoFonte('wind', calcularProducaoEfetiva('wind', capacity.wind, state));
  totalPollution += calcularPoluicaoFonte('hydro', calcularProducaoEfetiva('hydro', capacity.hydro, state));
  totalPollution += calcularPoluicaoFonte('geo', calcularProducaoEfetiva('geo', capacity.geo, state));
  totalPollution += calcularPoluicaoFonte('fossil', calcularProducaoEfetiva('fossil', capacity.fossil, state));

  return Math.floor(totalPollution);
}

/**
 * Calcula mudança de temperatura baseada na poluição e outras fontes
 * @param {number} currentTemperature - Temperatura atual
 * @param {number} pollutionGenerated - Poluição gerada no turno
 * @param {number} renewableRatio - Ratio de energia renovável (0.0-1.0)
 * @returns {number} Mudança na temperatura
 */
export function calcularMudancaTemperatura(currentTemperature, pollutionGenerated, renewableRatio) {
  // Poluição aumenta temperatura
  let temperatureChange = pollutionGenerated * 0.1;

  // Fontes renováveis ajudam a mitigar
  const mitigation = renewableRatio * 0.5;
  temperatureChange -= mitigation;

  // Degradação natural (leve resfriamento se temperatura alta)
  if (currentTemperature > 25) {
    temperatureChange -= 0.1;
  }

  return temperatureChange;
}

/**
 * Atualiza poluição e temperatura aplicando degradação
 * @param {number} currentPollution - Poluição atual
 * @param {number} currentTemperature - Temperatura atual
 * @param {number} pollutionGenerated - Poluição gerada no turno
 * @param {number} renewableRatio - Ratio renovável
 * @param {boolean} hasCleanupPrograms - Se tem programas de limpeza
 * @returns {Object} Novos valores de poluição e temperatura
 */
export function atualizarPoluicaoETemperatura(currentPollution, currentTemperature, pollutionGenerated, renewableRatio, hasCleanupPrograms = false) {
  // Calcula mudança de temperatura
  const temperatureChange = calcularMudancaTemperatura(currentTemperature, pollutionGenerated, renewableRatio);
  let newTemperature = currentTemperature + temperatureChange;

  // Poluição acumulada
  let newPollution = currentPollution + pollutionGenerated;

  // Programas de limpeza reduzem poluição
  if (hasCleanupPrograms) {
    newPollution = Math.max(0, newPollution - 2); // -2 poluição por turno
  }

  // Auto-purificação natural (reduz poluição lentamente)
  const naturalPurification = Math.min(1, newPollution * 0.02); // Até 2% da poluição atual
  newPollution = Math.max(0, newPollution - naturalPurification);

  // Limites
  newPollution = clamp(newPollution, 0, 100);
  newTemperature = clamp(newTemperature, 15, 50); // Temperatura entre 15°C e 50°C

  return {
    newPollution: Math.floor(newPollution * 10) / 10, // Uma casa decimal
    newTemperature: Math.floor(newTemperature * 10) / 10,
    pollutionChange: pollutionGenerated,
    temperatureChange
  };
}

/**
 * Calcula impacto ambiental de ações do jogador
 * @param {string} actionType - Tipo da ação
 * @param {Object} params - Parâmetros da ação
 * @returns {Object} Impactos ambientais
 */
export function calcularImpactoAmbiental(actionType, params = {}) {
  const impacts = {
    pollution: 0,
    temperature: 0,
    description: ''
  };

  switch (actionType) {
    case 'expandSolar':
      impacts.pollution = 1;
      impacts.description = 'Poluição moderada na fabricação de painéis';
      break;

    case 'expandWind':
      impacts.pollution = 0.5;
      impacts.description = 'Poluição baixa na construção de turbinas';
      break;

    case 'expandHydro':
      impacts.pollution = 3;
      impacts.temperature = 0.1;
      impacts.description = 'Poluição significativa na construção de barragens';
      break;

    case 'expandGeo':
      impacts.pollution = 2;
      impacts.temperature = 0.05;
      impacts.description = 'Poluição moderada na perfuração geotérmica';
      break;

    case 'expandFossil':
      impacts.pollution = 5;
      impacts.temperature = 0.2;
      impacts.description = 'Poluição alta e aumento de temperatura';
      break;

    case 'reduceFossil':
      impacts.pollution = -3;
      impacts.temperature = -0.1;
      impacts.description = 'Redução de poluição e temperatura';
      break;

    case 'investResearch':
      impacts.pollution = 0.5;
      impacts.description = 'Poluição baixa em pesquisa e desenvolvimento';
      break;

    case 'publicCampaign':
      impacts.pollution = 0;
      impacts.description = 'Sem impacto ambiental direto';
      break;

    case 'environmentalProgram':
      impacts.pollution = -5;
      impacts.temperature = -0.2;
      impacts.description = 'Redução significativa de poluição e temperatura';
      break;
  }

  return impacts;
}

/**
 * Calcula efeitos da poluição e temperatura nas eficiências energéticas
 * @param {Object} state - Estado atual do jogo
 * @returns {Object} Modificadores de eficiência por fonte
 */
export function calcularEfeitosAmbientais(state) {
  const modifiers = {
    solar: 1.0,
    wind: 1.0,
    hydro: 1.0,
    geo: 1.0,
    fossil: 1.0
  };

  // Poluição reduz eficiência solar
  if (state.pollution > 20) {
    modifiers.solar = Math.max(0.7, 1 - (state.pollution - 20) / 200);
  }

  // Temperatura afeta vento e hidro
  if (state.temperature < 18) {
    modifiers.wind *= 0.9; // Vento fraco em temperaturas baixas
  } else if (state.temperature > 30) {
    modifiers.wind *= 0.95; // Vento irregular em temperaturas altas
  }

  if (state.temperature > 28) {
    modifiers.hydro *= Math.max(0.8, 1 - (state.temperature - 28) / 50);
  }

  return modifiers;
}

/**
 * Avalia saúde ambiental geral
 * @param {Object} state - Estado atual do jogo
 * @returns {Object} Avaliação ambiental
 */
export function avaliarSaudeAmbiental(state) {
  let score = 100;

  // Penalidades por poluição
  score -= state.pollution * 0.8;

  // Penalidades por temperatura
  if (state.temperature > 25) {
    score -= (state.temperature - 25) * 2;
  }

  score = clamp(score, 0, 100);

  let status;
  if (score >= 80) status = 'Excelente';
  else if (score >= 60) status = 'Boa';
  else if (score >= 40) status = 'Regular';
  else if (score >= 20) status = 'Ruim';
  else status = 'Crítica';

  return {
    score: Math.round(score),
    status,
    recommendations: gerarRecomendacoesAmbientais(state)
  };
}

/**
 * Gera recomendações ambientais baseadas no estado
 * @param {Object} state - Estado atual do jogo
 * @returns {Array} Lista de recomendações
 */
function gerarRecomendacoesAmbientais(state) {
  const recommendations = [];

  if (state.pollution > 50) {
    recommendations.push('Implemente programas ambientais para reduzir poluição');
  }

  if (state.temperature > 30) {
    recommendations.push('Invista em tecnologias de resfriamento e fontes renováveis');
  }

  if (state.pollution > 30 && state.temperature > 25) {
    recommendations.push('Combine redução de emissões com transição energética');
  }

  const renewableRatio = (state.energy.capacity.solar + state.energy.capacity.wind +
                         state.energy.capacity.hydro + state.energy.capacity.geo) /
                        (state.energy.capacity.solar + state.energy.capacity.wind +
                         state.energy.capacity.hydro + state.energy.capacity.geo +
                         state.energy.capacity.fossil);

  if (renewableRatio < 0.5) {
    recommendations.push('Aumente participação de fontes renováveis no mix energético');
  }

  return recommendations;
}

/**
 * Simula impacto ambiental de um evento
 * @param {Object} event - Evento aleatório
 * @param {Object} state - Estado atual
 * @returns {Object} Impactos do evento
 */
export function simularImpactoEvento(event, state) {
  const impacts = {
    pollution: 0,
    temperature: 0,
    description: event.description
  };

  // Eventos específicos
  switch (event.name) {
    case 'Sabotagem Corporativa':
      impacts.pollution = 5;
      break;

    case 'Desastre Natural':
      impacts.temperature = 3;
      impacts.pollution = 3;
      break;

    case 'Quebra de Painéis':
      impacts.pollution = 1;
      break;

    case 'Crise Climática':
      impacts.temperature = 5;
      impacts.pollution = 2;
      break;
  }

  return impacts;
}
