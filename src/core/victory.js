/**
 * Módulo de vitória e derrota para Planeta 2500
 * Verificação de condições de fim de jogo
 */

import { VICTORY_CONDITIONS } from './rules.js';

/**
 * Verifica condições de derrota
 * @param {Object} state - Estado atual do jogo
 * @returns {Object|null} Objeto com derrota ou null se não perdeu
 */
export function verificarDerrota(state) {
  // Créditos esgotados
  if (state.credits <= VICTORY_CONDITIONS.defeat.creditsZero.credits) {
    return {
      type: 'bankruptcy',
      title: 'Falência Nacional',
      message: 'Seus créditos acabaram! O governo entrou em colapso financeiro.',
      severity: 'high'
    };
  }

  // Poluição máxima
  if (state.pollution >= VICTORY_CONDITIONS.defeat.pollutionMax.pollution) {
    return {
      type: 'ecological_disaster',
      title: 'Desastre Ecológico',
      message: 'A poluição atingiu níveis catastróficos. O planeta tornou-se inabitável.',
      severity: 'high'
    };
  }

  // Temperatura máxima
  if (state.temperature >= VICTORY_CONDITIONS.defeat.temperatureMax.temperature) {
    return {
      type: 'climate_catastrophe',
      title: 'Catástrofe Climática',
      message: 'O aquecimento global tornou o Planeta 2500 inabitável.',
      severity: 'high'
    };
  }

  // Popularidade mínima
  const avgPopularity = (state.popularity.poor + state.popularity.middle + state.popularity.rich) / 3;
  if (avgPopularity <= VICTORY_CONDITIONS.defeat.popularityMin.popularity) {
    return {
      type: 'social_revolution',
      title: 'Revolução Social',
      message: 'A população se revoltou contra o governo impopular.',
      severity: 'high'
    };
  }

  // Déficit energético crítico
  const energyDeficit = state.energy.consumption - state.energy.production;
  if (energyDeficit >= Math.abs(VICTORY_CONDITIONS.defeat.energyDeficit.deficit)) {
    return {
      type: 'energy_crisis',
      title: 'Crise Energética',
      message: 'Déficit energético crítico causou colapso da infraestrutura.',
      severity: 'high'
    };
  }

  return null;
}

/**
 * Verifica condições de vitória
 * @param {Object} state - Estado atual do jogo
 * @returns {Object|null} Objeto com vitória ou null se não venceu
 */
export function verificarVitoria(state) {
  const renewableCapacity = state.energy.capacity.solar + state.energy.capacity.wind +
                           state.energy.capacity.hydro + state.energy.capacity.geo;
  const totalCapacity = renewableCapacity + state.energy.capacity.fossil;
  const renewableRatio = totalCapacity > 0 ? renewableCapacity / totalCapacity : 0;
  const avgPopularity = (state.popularity.poor + state.popularity.middle + state.popularity.rich) / 3;

  // Vitória Sustentável Completa
  if (checkSustainableComplete(state, renewableRatio, avgPopularity)) {
    return {
      type: 'sustainable_complete',
      title: 'Vitória Sustentável Completa!',
      message: 'Conseguiu transição energética completa com sustentabilidade ambiental e satisfação social.',
      score: calculateVictoryScore(state, 'sustainable_complete'),
      achievements: ['Transição Completa', 'Sustentabilidade Total', 'Harmonia Social']
    };
  }

  // Vitória Energética
  if (checkEnergyVictory(state)) {
    return {
      type: 'energy_victory',
      title: 'Vitória Energética!',
      message: 'Dominou a produção energética, garantindo abundância para todos.',
      score: calculateVictoryScore(state, 'energy_victory'),
      achievements: ['Abundância Energética', 'Infraestrutura Robusta']
    };
  }

  // Vitória Parcial
  if (checkPartialVictory(state, avgPopularity)) {
    return {
      type: 'partial_victory',
      title: 'Vitória Parcial',
      message: 'Conseguiu equilíbrio razoável entre energia, economia e sociedade.',
      score: calculateVictoryScore(state, 'partial_victory'),
      achievements: ['Equilíbrio Alcançado', 'Progresso Moderado']
    };
  }

  return null;
}

/**
 * Verifica vitória sustentável completa
 * @param {Object} state - Estado do jogo
 * @param {number} renewableRatio - Ratio de energia renovável
 * @param {number} avgPopularity - Popularidade média
 * @returns {boolean} Verdadeiro se condições atendidas
 */
function checkSustainableComplete(state, renewableRatio, avgPopularity) {
  const conditions = VICTORY_CONDITIONS.victory.sustainable;

  return (
    state.pollution <= conditions.requirements.pollution &&
    renewableRatio >= conditions.requirements.renewableRatio &&
    avgPopularity >= conditions.requirements.popularity &&
    state.turn <= conditions.requirements.turn
  );
}

/**
 * Verifica vitória energética
 * @param {Object} state - Estado do jogo
 * @returns {boolean} Verdadeiro se condições atendidas
 */
function checkEnergyVictory(state) {
  const conditions = VICTORY_CONDITIONS.victory.energetic;
  const energySurplus = state.energy.production - state.energy.consumption;

  return (
    energySurplus >= conditions.requirements.energySurplus &&
    state.pollution <= conditions.requirements.pollution &&
    state.turn <= conditions.requirements.turn
  );
}

/**
 * Verifica vitória parcial
 * @param {Object} state - Estado do jogo
 * @param {number} avgPopularity - Popularidade média
 * @returns {boolean} Verdadeiro se condições atendidas
 */
function checkPartialVictory(state, avgPopularity) {
  const conditions = VICTORY_CONDITIONS.victory.partial;

  return (
    state.pollution <= conditions.requirements.pollution &&
    avgPopularity >= conditions.requirements.popularity &&
    state.credits >= conditions.requirements.credits &&
    state.turn <= conditions.requirements.turn
  );
}

/**
 * Calcula pontuação da vitória
 * @param {Object} state - Estado do jogo
 * @param {string} victoryType - Tipo da vitória
 * @returns {number} Pontuação (0-100)
 */
function calculateVictoryScore(state, victoryType) {
  let score = 0;

  // Pontos por sustentabilidade
  if (state.pollution <= 20) score += 30;
  else if (state.pollution <= 40) score += 20;
  else if (state.pollution <= 60) score += 10;

  // Pontos por energia
  const energySurplus = state.energy.production - state.energy.consumption;
  if (energySurplus >= 20) score += 25;
  else if (energySurplus >= 0) score += 15;
  else score += 5;

  // Pontos por popularidade
  const avgPopularity = (state.popularity.poor + state.popularity.middle + state.popularity.rich) / 3;
  if (avgPopularity >= 80) score += 25;
  else if (avgPopularity >= 60) score += 15;
  else if (avgPopularity >= 40) score += 10;

  // Pontos por economia
  if (state.credits >= 1000) score += 20;
  else if (state.credits >= 500) score += 10;

  // Bônus por turnos restantes (mais eficiente = melhor)
  const turnsBonus = Math.max(0, 50 - state.turn);
  score += Math.floor(turnsBonus / 2);

  return Math.min(100, score);
}

/**
 * Verifica se jogo deve terminar
 * @param {Object} state - Estado atual do jogo
 * @returns {Object|null} Resultado do jogo ou null se continua
 */
export function verificarFimJogo(state) {
  // Verifica derrota primeiro
  const defeat = verificarDerrota(state);
  if (defeat) {
    return {
      gameOver: true,
      victory: false,
      ...defeat
    };
  }

  // Verifica vitória
  const victory = verificarVitoria(state);
  if (victory) {
    return {
      gameOver: true,
      victory: true,
      ...victory
    };
  }

  // Jogo continua
  return null;
}

/**
 * Gera estatísticas finais do jogo
 * @param {Object} state - Estado final do jogo
 * @param {boolean} victory - Se foi vitória
 * @returns {Object} Estatísticas detalhadas
 */
export function gerarEstatisticasFinais(state, victory) {
  const renewableCapacity = state.energy.capacity.solar + state.energy.capacity.wind +
                           state.energy.capacity.hydro + state.energy.capacity.geo;
  const totalCapacity = renewableCapacity + state.energy.capacity.fossil;
  const renewableRatio = totalCapacity > 0 ? renewableCapacity / totalCapacity : 0;
  const avgPopularity = (state.popularity.poor + state.popularity.middle + state.popularity.rich) / 3;

  return {
    turnosSobrevividos: state.turn,
    creditosFinais: state.credits,
    poluicaoFinal: state.pollution,
    temperaturaFinal: state.temperature,
    popularidadeFinal: avgPopularity,
    capacidadeTotal: totalCapacity,
    capacidadeRenovavel: renewableCapacity,
    ratioRenovavel: renewableRatio,
    producaoFinal: state.energy.production,
    consumoFinal: state.energy.consumption,
    armazenamentoFinal: state.energy.storage,
    vitoria: victory,
    avaliacaoEcologica: avaliarEcologiaFinal(state),
    avaliacaoSocial: avaliarSociedadeFinal(state),
    avaliacaoEconomica: avaliarEconomiaFinal(state)
  };
}

/**
 * Avalia ecologia final
 * @param {Object} state - Estado final
 * @returns {string} Avaliação ecológica
 */
function avaliarEcologiaFinal(state) {
  if (state.pollution <= 10 && state.temperature <= 20) return 'Excelente';
  if (state.pollution <= 30 && state.temperature <= 25) return 'Boa';
  if (state.pollution <= 50 && state.temperature <= 30) return 'Regular';
  if (state.pollution <= 70 && state.temperature <= 35) return 'Ruim';
  return 'Desastrosa';
}

/**
 * Avalia sociedade final
 * @param {Object} state - Estado final
 * @returns {string} Avaliação social
 */
function avaliarSociedadeFinal(state) {
  const avgPopularity = (state.popularity.poor + state.popularity.middle + state.popularity.rich) / 3;
  if (avgPopularity >= 80) return 'Harmoniosa';
  if (avgPopularity >= 60) return 'Estável';
  if (avgPopularity >= 40) return 'Tensa';
  if (avgPopularity >= 20) return 'Instável';
  return 'Caótica';
}

/**
 * Avalia economia final
 * @param {Object} state - Estado final
 * @returns {string} Avaliação econômica
 */
function avaliarEconomiaFinal(state) {
  if (state.credits >= 1000) return 'Prospera';
  if (state.credits >= 500) return 'Estável';
  if (state.credits >= 200) return 'Preocupante';
  if (state.credits >= 0) return 'Crítica';
  return 'Falida';
}

/**
 * Gera mensagem de despedida baseada no resultado
 * @param {Object} result - Resultado do jogo
 * @param {Object} stats - Estatísticas finais
 * @returns {string} Mensagem de despedida
 */
export function gerarMensagemFinal(result, stats) {
  if (result.victory) {
    return `Parabéns! Você conseguiu uma ${result.title} em ${stats.turnosSobrevividos} turnos. ` +
           `O Planeta 2500 prospera sob sua liderança sábia.`;
  } else {
    return `Infelizmente, seu governo caiu após ${stats.turnosSobrevividos} turnos. ` +
           `As lições aprendidas servirão para futuros líderes. Tente novamente!`;
  }
}
