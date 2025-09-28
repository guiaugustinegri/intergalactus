/**
 * Módulo econômico para Planeta 2500
 * Cálculos de renda, impostos, subsídios e gestão financeira
 */

import { calculateTotalIncome, clamp, INCOME_RATES } from './rules.js';

/**
 * Calcula renda por classe social
 * @param {Object} popularity - Popularidade por classe
 * @returns {Object} Renda por classe
 */
export function calcularRendaPorClasse(popularity) {
  return {
    poor: Math.floor(popularity.poor * INCOME_RATES.poor),
    middle: Math.floor(popularity.middle * INCOME_RATES.middle),
    rich: Math.floor(popularity.rich * INCOME_RATES.rich)
  };
}

/**
 * Calcula renda total do turno
 * @param {Object} popularity - Popularidade por classe
 * @returns {number} Renda total
 */
export function calcularRendaTotal(popularity) {
  const incomeByClass = calcularRendaPorClasse(popularity);
  return incomeByClass.poor + incomeByClass.middle + incomeByClass.rich;
}

/**
 * Aplica taxas e subsídios baseado na popularidade
 * @param {Object} popularity - Popularidade por classe
 * @param {number} baseIncome - Renda base antes dos modificadores
 * @returns {Object} Modificadores aplicados
 */
export function aplicarTaxasSubsídios(popularity, baseIncome) {
  let modifier = 0;

  // Taxas extras se popularidade baixa (governo autoritário)
  if (popularity.rich < 40) {
    modifier -= Math.floor(baseIncome * 0.1); // -10% de taxa extra
  }

  // Subsídios se popularidade dos pobres muito baixa
  if (popularity.poor < 30) {
    modifier += Math.floor(baseIncome * 0.05); // +5% de subsídio
  }

  return {
    modifier,
    effectiveIncome: Math.max(0, baseIncome + modifier),
    taxRate: popularity.rich < 40 ? 0.1 : 0,
    subsidyRate: popularity.poor < 30 ? 0.05 : 0
  };
}

/**
 * Calcula custo de manutenção das infraestruturas
 * @param {Object} capacity - Capacidades energéticas
 * @returns {number} Custo de manutenção
 */
export function calcularCustoManutencao(capacity) {
  const maintenanceCosts = {
    solar: 10,     // créditos por 10 MW
    wind: 8,
    hydro: 15,
    geo: 12,
    fossil: 20    // Fóssil é mais caro de manter
  };

  let totalCost = 0;

  for (const [source, cost] of Object.entries(maintenanceCosts)) {
    if (capacity[source]) {
      totalCost += Math.floor((capacity[source] / 10) * cost);
    }
  }

  return totalCost;
}

/**
 * Atualiza créditos aplicando renda, custos e clamp
 * @param {number} currentCredits - Créditos atuais
 * @param {number} income - Renda do turno
 * @param {number} expenses - Despesas do turno
 * @returns {number} Novos créditos (mínimo 0)
 */
export function atualizarCreditos(currentCredits, income, expenses) {
  const newCredits = currentCredits + income - expenses;
  return Math.max(0, Math.floor(newCredits));
}

/**
 * Calcula efeito econômico de uma decisão
 * @param {Object} decision - Objeto da decisão
 * @param {string} choice - 'accept' ou 'reject'
 * @returns {Object} Efeitos econômicos
 */
export function calcularEfeitoEconomico(decision, choice) {
  const effects = choice === 'accept' ? decision.acceptEffects : decision.rejectEffects;

  return {
    creditsChange: effects.credits || 0,
    hasInternationalAid: !!effects.internationalAid,
    internationalAid: effects.internationalAid || 0
  };
}

/**
 * Simula economia de um turno
 * @param {Object} popularity - Popularidade por classe
 * @param {Object} capacity - Capacidades energéticas
 * @param {number} currentCredits - Créditos atuais
 * @param {Array} decisionsTaken - Decisões tomadas no turno
 * @returns {Object} Resultados econômicos do turno
 */
export function simularEconomiaTurno(popularity, capacity, currentCredits, decisionsTaken = []) {
  // Calcula renda base
  const baseIncome = calcularRendaTotal(popularity);

  // Aplica modificadores de popularidade
  const incomeModifiers = aplicarTaxasSubsídios(popularity, baseIncome);

  // Calcula custos de manutenção
  const maintenanceCost = calcularCustoManutencao(capacity);

  // Calcula efeitos de decisões
  let decisionCreditsChange = 0;
  let internationalAid = 0;

  for (const decision of decisionsTaken) {
    const economicEffect = calcularEfeitoEconomico(decision.decision, decision.choice);
    decisionCreditsChange += economicEffect.creditsChange;
    internationalAid += economicEffect.internationalAid;
  }

  // Renda efetiva
  const effectiveIncome = incomeModifiers.effectiveIncome + internationalAid;

  // Despesas totais
  const totalExpenses = maintenanceCost;

  // Créditos finais
  const finalCredits = atualizarCreditos(currentCredits, effectiveIncome, totalExpenses) + decisionCreditsChange;

  return {
    baseIncome,
    effectiveIncome,
    maintenanceCost,
    totalExpenses,
    finalCredits,
    incomeModifiers,
    decisionEffects: {
      creditsChange: decisionCreditsChange,
      internationalAid
    }
  };
}

/**
 * Verifica saúde econômica
 * @param {number} credits - Créditos atuais
 * @param {number} income - Renda mensal
 * @param {number} expenses - Despesas mensais
 * @returns {string} Status econômico
 */
export function avaliarSaudeEconomica(credits, income, expenses) {
  const balance = income - expenses;

  if (credits < 100) return 'Crítico';
  if (credits < 500) return 'Preocupante';
  if (balance < 0) return 'Déficit';
  if (balance < 100) return 'Estável';
  return 'Prosperous';
}

/**
 * Calcula inflação baseada na economia
 * @param {number} credits - Créditos em circulação
 * @param {number} economicActivity - Atividade econômica
 * @returns {number} Taxa de inflação (0.0-1.0)
 */
export function calcularInflacao(credits, economicActivity) {
  // Inflação aumenta com muitos créditos e alta atividade
  const baseInflation = 0.02; // 2% base
  const creditInflation = Math.min(0.05, credits / 10000); // Até 5% com 10000 créditos
  const activityInflation = Math.min(0.03, economicActivity / 1000); // Até 3% com atividade 1000

  return clamp(baseInflation + creditInflation + activityInflation, 0, 0.1);
}

/**
 * Ajusta preços baseado na inflação
 * @param {number} basePrice - Preço base
 * @param {number} inflationRate - Taxa de inflação
 * @returns {number} Preço ajustado
 */
export function ajustarPrecoInflacao(basePrice, inflationRate) {
  return Math.floor(basePrice * (1 + inflationRate));
}

/**
 * Calcula PIB estimado baseado na produção energética e popularidade
 * @param {Object} capacity - Capacidades energéticas
 * @param {Object} popularity - Popularidade por classe
 * @returns {number} PIB estimado
 */
export function calcularPIB(capacity, popularity) {
  const energyContribution = (
    capacity.solar * 2 +
    capacity.wind * 1.8 +
    capacity.hydro * 2.5 +
    capacity.geo * 3 +
    capacity.fossil * 1.5
  );

  const socialContribution = (
    popularity.poor * 0.5 +
    popularity.middle * 1.5 +
    popularity.rich * 3
  );

  return Math.floor(energyContribution + socialContribution);
}
