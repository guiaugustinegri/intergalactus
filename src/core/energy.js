/**
 * Módulo de energia para Planeta 2500
 * Cálculos de produção, consumo, armazenamento e transição
 */

import { calculateEffectiveEfficiency, CONSUMPTION_BASE, clamp } from './rules.js';

/**
 * Calcula produção efetiva de uma fonte energética
 * @param {string} sourceType - Tipo da fonte (solar, wind, hydro, geo, fossil)
 * @param {number} capacity - Capacidade instalada
 * @param {Object} state - Estado atual do jogo
 * @returns {number} Produção efetiva em MW
 */
export function calcularProducaoEfetiva(sourceType, capacity, state) {
  if (capacity <= 0) return 0;

  const efficiency = calculateEffectiveEfficiency(sourceType, state);
  return Math.floor(capacity * efficiency);
}

/**
 * Calcula produção total efetiva de todas as fontes
 * @param {Object} capacity - Capacidades por fonte
 * @param {Object} state - Estado atual do jogo
 * @returns {number} Produção total em MW
 */
export function calcularProducaoTotal(capacity, state) {
  let total = 0;

  total += calcularProducaoEfetiva('solar', capacity.solar, state);
  total += calcularProducaoEfetiva('wind', capacity.wind, state);
  total += calcularProducaoEfetiva('hydro', capacity.hydro, state);
  total += calcularProducaoEfetiva('geo', capacity.geo, state);
  total += calcularProducaoEfetiva('fossil', capacity.fossil, state);

  return total;
}

/**
 * Calcula consumo efetivo considerando eficiência energética
 * @param {number} baseConsumption - Consumo base
 * @param {boolean} hasEfficiencyUpgrade - Se tem upgrade de eficiência (não implementado ainda)
 * @returns {number} Consumo efetivo
 */
export function calcularConsumoEfetivo(baseConsumption = CONSUMPTION_BASE, hasEfficiencyUpgrade = false) {
  // Futuramente pode haver upgrades que reduzem consumo
  return hasEfficiencyUpgrade ? Math.floor(baseConsumption * 0.95) : baseConsumption;
}

/**
 * Atualiza armazenamento de energia com perdas mínimas
 * @param {number} currentStorage - Armazenamento atual
 * @param {number} production - Produção do turno
 * @param {number} consumption - Consumo do turno
 * @param {number} maxStorage - Capacidade máxima de armazenamento
 * @returns {number} Novo armazenamento
 */
export function atualizarArmazenamento(currentStorage, production, consumption, maxStorage = 100) {
  let newStorage = currentStorage + production - consumption;

  // Perdas mínimas de armazenamento (2% por turno)
  const lossRate = 0.02;
  newStorage = Math.floor(newStorage * (1 - lossRate));

  // Limites do armazenamento
  return clamp(newStorage, 0, maxStorage);
}

/**
 * Aplica expansão de capacidade energética
 * @param {Object} capacity - Capacidades atuais
 * @param {string} sourceType - Tipo da fonte a expandir
 * @param {number} amount - Quantidade a adicionar
 * @returns {Object} Novas capacidades
 */
export function aplicarExpansao(capacity, sourceType, amount) {
  const newCapacity = { ...capacity };

  if (sourceType in newCapacity) {
    newCapacity[sourceType] = Math.max(0, newCapacity[sourceType] + amount);
  }

  return newCapacity;
}

/**
 * Aplica transição automática reduzindo energia fóssil quando renováveis aumentam
 * @param {Object} capacity - Capacidades atuais
 * @param {number} renewableIncrease - Aumento em renováveis
 * @returns {Object} Novas capacidades após transição
 */
export function aplicarTransicaoAutomatica(capacity, renewableIncrease) {
  const newCapacity = { ...capacity };

  // Se renováveis aumentaram significativamente, reduzir fóssil automaticamente
  if (renewableIncrease >= 20) {
    const reduction = Math.min(5, Math.floor(renewableIncrease / 10));
    newCapacity.fossil = Math.max(0, newCapacity.fossil - reduction);
  }

  return newCapacity;
}

/**
 * Calcula déficit ou excedente energético
 * @param {number} production - Produção total
 * @param {number} consumption - Consumo total
 * @returns {number} Déficit negativo ou excedente positivo
 */
export function calcularBalancoEnergetico(production, consumption) {
  return production - consumption;
}

/**
 * Verifica se há déficit energético crítico
 * @param {number} balance - Balanço energético
 * @returns {boolean} Verdadeiro se déficit crítico
 */
export function deficitCritico(balance) {
  return balance <= -30; // 30 MW de déficit é crítico
}

/**
 * Calcula ratio de energia renovável
 * @param {Object} capacity - Capacidades por fonte
 * @returns {number} Ratio renovável (0.0 a 1.0)
 */
export function calcularRatioRenovavel(capacity) {
  const totalCapacity = capacity.solar + capacity.wind + capacity.hydro + capacity.geo + capacity.fossil;

  if (totalCapacity === 0) return 0;

  const renewableCapacity = capacity.solar + capacity.wind + capacity.hydro + capacity.geo;
  return renewableCapacity / totalCapacity;
}

/**
 * Calcula eficiência média do sistema energético
 * @param {Object} capacity - Capacidades por fonte
 * @param {Object} state - Estado atual do jogo
 * @returns {number} Eficiência média (0.0 a 1.0)
 */
export function calcularEficienciaMedia(capacity, state) {
  let totalWeightedEfficiency = 0;
  let totalCapacity = 0;

  const sources = ['solar', 'wind', 'hydro', 'geo', 'fossil'];

  for (const source of sources) {
    if (capacity[source] > 0) {
      const efficiency = calculateEffectiveEfficiency(source, state);
      totalWeightedEfficiency += capacity[source] * efficiency;
      totalCapacity += capacity[source];
    }
  }

  return totalCapacity > 0 ? totalWeightedEfficiency / totalCapacity : 0;
}

/**
 * Simula produção de um turno completo
 * @param {Object} capacity - Capacidades por fonte
 * @param {Object} state - Estado atual do jogo
 * @param {number} currentStorage - Armazenamento atual
 * @returns {Object} Resultados da simulação
 */
export function simularTurnoEnergia(capacity, state, currentStorage) {
  const production = calcularProducaoTotal(capacity, state);
  const consumption = calcularConsumoEfetivo();
  const balance = calcularBalancoEnergetico(production, consumption);
  const newStorage = atualizarArmazenamento(currentStorage, production, consumption);

  return {
    production,
    consumption,
    balance,
    newStorage,
    ratioRenovavel: calcularRatioRenovavel(capacity),
    eficienciaMedia: calcularEficienciaMedia(capacity, state),
    deficitCritico: deficitCritico(balance)
  };
}

/**
 * Calcula custo de expansão por fonte
 * @param {string} sourceType - Tipo da fonte
 * @param {number} amount - Quantidade a expandir
 * @returns {number} Custo em créditos
 */
export function calcularCustoExpansao(sourceType, amount) {
  const baseCosts = {
    solar: 200,
    wind: 150,
    hydro: 300,
    geo: 250,
    fossil: 100 // Fóssil é mais barato mas poluente
  };

  return baseCosts[sourceType] ? baseCosts[sourceType] * amount : 0;
}

/**
 * Verifica se expansão é possível (créditos suficientes)
 * @param {number} credits - Créditos disponíveis
 * @param {string} sourceType - Tipo da fonte
 * @param {number} amount - Quantidade a expandir
 * @returns {boolean} Verdadeiro se possível
 */
export function expansaoPossivel(credits, sourceType, amount) {
  const cost = calcularCustoExpansao(sourceType, amount);
  return credits >= cost;
}
