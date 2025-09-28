/**
 * Regras e constantes do jogo Planeta 2500
 * Centraliza todas as fórmulas e configurações balanceadas
 */

// Eficiências base das fontes de energia (0.0 a 1.0)
export const ENERGY_EFFICIENCIES = {
  solar: 0.80,
  wind: 0.90,
  hydro: 0.85,
  geo: 0.95,
  fossil: 0.90
};

// Modificadores ambientais que afetam eficiência
export const ENVIRONMENTAL_MODIFIERS = {
  // Poluição reduz eficiência solar
  pollutionSolarPenalty: (pollution) => Math.max(0, pollution / 200), // Reduz até 0.5 com poluição 100

  // Temperatura afeta vento e hidro
  temperatureWindBonus: (temperature) => {
    if (temperature < 15) return -0.2; // Vento fraco em temperaturas baixas
    if (temperature > 35) return -0.15; // Vento irregular em temperaturas altas
    return temperature / 50; // Bônus moderado em temperaturas normais
  },

  temperatureHydroPenalty: (temperature) => {
    if (temperature > 30) return Math.min(0.3, (temperature - 30) / 20); // Secas com calor
    return 0;
  }
};

// Consumo base e modificadores
export const CONSUMPTION_BASE = 50; // MW base
export const EFFICIENCY_CONSUMPTION_REDUCTION = 0.95; // Redução de 5% com eficiência energética

// Custos e efeitos das ações do jogador
export const ACTION_COSTS = {
  expandSolar: { credits: 200, capacity: 10, pollution: 2 },
  expandWind: { credits: 150, capacity: 10, pollution: 1 },
  expandHydro: { credits: 300, capacity: 15, pollution: 3 },
  expandGeo: { credits: 250, capacity: 8, pollution: 1 },
  reduceFossil: { credits: 0, capacity: -5, pollution: -5, popularityBonus: 5 },
  investResearch: { credits: 100, pollution: 0 },
  publicCampaign: { credits: 50, pollution: 0 },
  environmentalProgram: { credits: 150, pollution: -10 }
};

// Renda por turno baseada na popularidade
export const INCOME_RATES = {
  poor: 5,    // créditos por ponto de popularidade
  middle: 10,
  rich: 15
};

// Probabilidades de decisões por turno (base em %)
export const DECISION_PROBABILITIES = {
  baseChance: 10, // 10% base por turno

  // Modificadores adicionais
  lowPopularityBonus: 15, // +15% se classe alvo < 50
  crisisBonus: 10, // +10% se poluição > 70 ou déficit > 20 MW
  cooldownTurns: 3 // turnos de cooldown após decisão
};

// Condições de vitória e derrota
export const VICTORY_CONDITIONS = {
  defeat: {
    creditsZero: { credits: 0 },
    pollutionMax: { pollution: 100 },
    temperatureMax: { temperature: 45 },
    popularityMin: { popularity: 20 },
    energyDeficit: { deficit: -30 }
  },

  victory: {
    sustainable: {
      name: "Sustentável Completa",
      requirements: {
        pollution: 10, // Máximo 10 de poluição
        renewableRatio: 0.8, // Pelo menos 80% renovável
        popularity: 70, // Popularidade média >= 70
        turn: 50 // Em até 50 turnos
      }
    },
    energetic: {
      name: "Energética",
      requirements: {
        energySurplus: 20, // Produção > consumo + 20 MW
        pollution: 50, // Máximo 50 de poluição
        turn: 30 // Em até 30 turnos
      }
    },
    partial: {
      name: "Parcial",
      requirements: {
        pollution: 30, // Máximo 30 de poluição
        popularity: 60, // Popularidade média >= 60
        credits: 500, // Pelo menos 500 créditos
        turn: 40 // Em até 40 turnos
      }
    }
  }
};

// Tabela de cores do planeta baseada no estado
export const PLANET_COLORS = {
  healthy: {
    pollution: 10,
    temperature: 20,
    colors: ['#2a4d2a', '#4a7c4a', '#6bb06b', '#8fc48f']
  },
  stressed: {
    pollution: 30,
    temperature: 25,
    colors: ['#4d4d2a', '#7c7c4a', '#b0b06b', '#c4c48f']
  },
  critical: {
    pollution: 60,
    temperature: 35,
    colors: ['#4d2a2a', '#7c4a4a', '#b06b6b', '#c48f8f']
  },
  doomed: {
    pollution: 100,
    temperature: 45,
    colors: ['#2a2a2a', '#4a4a4a', '#6b6b6b', '#8f8f8f']
  }
};

// Eventos aleatórios
export const RANDOM_EVENTS = {
  sabotage: {
    name: "Sabotagem Corporativa",
    probability: 5, // 5% chance
    effects: { pollution: 5, popularity: { poor: -5, middle: -3, rich: 2 } },
    description: "Corporações sabotam infraestrutura renovável"
  },
  naturalDisaster: {
    name: "Desastre Natural",
    probability: 8,
    effects: { temperature: 3, pollution: 3, capacity: { solar: -2, wind: -3 } },
    description: "Furacão danifica infraestrutura energética"
  },
  panelBreakage: {
    name: "Quebra de Painéis",
    probability: 12,
    effects: { capacity: { solar: -1 }, pollution: 1 },
    description: "Painéis solares quebrados por intempéries"
  },
  sunnyDay: {
    name: "Dia Ensolarado",
    probability: 20,
    effects: { capacity: { solar: 2 } }, // Bônus temporário
    description: "Condições perfeitas para energia solar",
    temporary: true
  },
  strongWind: {
    name: "Vento Forte",
    probability: 15,
    effects: { capacity: { wind: 3 } },
    description: "Ventos fortes aumentam produção eólica",
    temporary: true
  },
  techDiscovery: {
    name: "Descoberta Tecnológica",
    probability: 3,
    effects: { efficiencyBonus: 0.05 }, // +5% eficiência geral
    description: "Avanço tecnológico em energias renováveis",
    permanent: true
  },
  batteryAdvance: {
    name: "Avanço em Baterias",
    probability: 4,
    effects: { storageCapacity: 10 },
    description: "Melhoria na tecnologia de armazenamento",
    permanent: true
  }
};

// Decisões estilo HoI4
export const GAME_DECISIONS = {
  corporatePressure: {
    title: "Pressão Corporativa",
    description: "Empresas de energia fóssil oferecem suborno para manter infraestrutura antiga.",
    targetClass: "rich",
    acceptEffects: { credits: 200, popularity: { rich: 10, poor: -5, middle: -2 }, fossilBonus: 5 },
    rejectEffects: { popularity: { rich: -5, poor: 5, middle: 2 } },
    cooldown: 3
  },
  greenInitiative: {
    title: "Iniciativa Verde",
    description: "Movimento popular exige transição energética imediata.",
    targetClass: "poor",
    acceptEffects: { popularity: { poor: 15, middle: 5 }, renewableBonus: 0.1 },
    rejectEffects: { popularity: { poor: -10, middle: -5 } },
    cooldown: 3
  },
  climateSummit: {
    title: "Cúpula Climática",
    description: "Conferência internacional propõe metas ambiciosas de redução de emissões.",
    targetClass: "middle",
    acceptEffects: { pollution: -5, internationalAid: 100 },
    rejectEffects: { temperature: 2, pollution: 3 },
    cooldown: 4
  },
  technologicalBreakthrough: {
    title: "Avanço Tecnológico",
    description: "Pesquisadores descobrem método revolucionário de armazenamento de energia.",
    targetClass: "rich",
    acceptEffects: { storageCapacity: 20, efficiencyBonus: 0.1 },
    rejectEffects: { credits: -50 }, // Investimento perdido
    cooldown: 5
  },
  economicCrisis: {
    title: "Crise Econômica",
    description: "Recessão global afeta investimentos em energia renovável.",
    targetClass: "middle",
    acceptEffects: { credits: -100, fossilReduction: -10 }, // Redução forçada
    rejectEffects: { credits: -200, popularity: { middle: -10 } },
    cooldown: 2
  }
};

// Funções utilitárias para cálculos

/**
 * Calcula eficiência efetiva de uma fonte considerando modificadores ambientais
 * @param {string} sourceType - Tipo da fonte (solar, wind, etc.)
 * @param {Object} state - Estado atual do jogo
 * @returns {number} Eficiência efetiva (0.0 a 1.0)
 */
export function calculateEffectiveEfficiency(sourceType, state) {
  let baseEfficiency = ENERGY_EFFICIENCIES[sourceType];

  switch (sourceType) {
    case 'solar':
      baseEfficiency -= ENVIRONMENTAL_MODIFIERS.pollutionSolarPenalty(state.pollution);
      break;
    case 'wind':
      baseEfficiency += ENVIRONMENTAL_MODIFIERS.temperatureWindBonus(state.temperature);
      break;
    case 'hydro':
      baseEfficiency -= ENVIRONMENTAL_MODIFIERS.temperatureHydroPenalty(state.temperature);
      break;
  }

  return Math.max(0, Math.min(1, baseEfficiency));
}

/**
 * Calcula consumo efetivo considerando eficiência energética
 * @param {number} baseConsumption - Consumo base
 * @param {boolean} hasEfficiencyUpgrade - Se tem upgrade de eficiência
 * @returns {number} Consumo efetivo
 */
export function calculateEffectiveConsumption(baseConsumption, hasEfficiencyUpgrade = false) {
  return hasEfficiencyUpgrade ?
    baseConsumption * EFFICIENCY_CONSUMPTION_REDUCTION :
    baseConsumption;
}

/**
 * Calcula renda total por turno
 * @param {Object} popularity - Popularidade por classe
 * @returns {number} Renda total
 */
export function calculateTotalIncome(popularity) {
  return Math.floor(
    popularity.poor * INCOME_RATES.poor +
    popularity.middle * INCOME_RATES.middle +
    popularity.rich * INCOME_RATES.rich
  );
}

/**
 * Verifica se condições de derrota foram atingidas
 * @param {Object} state - Estado do jogo
 * @returns {Object|null} Objeto com tipo de derrota ou null
 */
export function checkDefeatConditions(state) {
  if (state.credits <= VICTORY_CONDITIONS.defeat.creditsZero.credits) {
    return { type: 'bankruptcy', message: 'Seus créditos acabaram!' };
  }
  if (state.pollution >= VICTORY_CONDITIONS.defeat.pollutionMax.pollution) {
    return { type: 'pollution', message: 'Poluição excessiva destruiu o planeta!' };
  }
  if (state.temperature >= VICTORY_CONDITIONS.defeat.temperatureMax.temperature) {
    return { type: 'temperature', message: 'Aquecimento global tornou o planeta inabitável!' };
  }
  const avgPopularity = (state.popularity.poor + state.popularity.middle + state.popularity.rich) / 3;
  if (avgPopularity <= VICTORY_CONDITIONS.defeat.popularityMin.popularity) {
    return { type: 'unpopularity', message: 'A população se revoltou contra seu governo!' };
  }
  // Calcular déficit energético seria feito no módulo energy.js
  return null;
}

/**
 * Clamp valor entre min e max
 * @param {number} value - Valor a clamp
 * @param {number} min - Mínimo
 * @param {number} max - Máximo
 * @returns {number} Valor clamped
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calcula cor do planeta baseada no estado
 * @param {Object} state - Estado do jogo
 * @returns {Array} Array de cores para gradiente
 */
export function getPlanetColors(state) {
  if (state.pollution <= PLANET_COLORS.healthy.pollution && state.temperature <= PLANET_COLORS.healthy.temperature) {
    return PLANET_COLORS.healthy.colors;
  }
  if (state.pollution <= PLANET_COLORS.stressed.pollution && state.temperature <= PLANET_COLORS.stressed.temperature) {
    return PLANET_COLORS.stressed.colors;
  }
  if (state.pollution <= PLANET_COLORS.critical.pollution && state.temperature <= PLANET_COLORS.critical.temperature) {
    return PLANET_COLORS.critical.colors;
  }
  return PLANET_COLORS.doomed.colors;
}
