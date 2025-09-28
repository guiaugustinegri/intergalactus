/**
 * Utilitários de formatação para Planeta 2500
 * Formatação numérica, tooltips e display
 */

/**
 * Formata número com separador de milhares
 * @param {number} num - Número a formatar
 * @returns {string} Número formatado
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('pt-BR').format(Math.round(num));
}

/**
 * Formata temperatura com unidade
 * @param {number} temp - Temperatura
 * @returns {string} Temperatura formatada
 */
export function formatTemperature(temp) {
  return `${Math.round(temp)}°C`;
}

/**
 * Formata porcentagem
 * @param {number} value - Valor (0-100)
 * @returns {string} Porcentagem formatada
 */
export function formatPercentage(value) {
  return `${Math.round(value)}%`;
}

/**
 * Formata energia com unidade
 * @param {number} energy - Energia em MW
 * @returns {string} Energia formatada
 */
export function formatEnergy(energy) {
  const absEnergy = Math.abs(energy);
  const sign = energy < 0 ? '-' : '';
  return `${sign}${formatNumber(absEnergy)} MW`;
}

/**
 * Formata créditos com símbolo
 * @param {number} credits - Quantidade de créditos
 * @returns {string} Créditos formatados
 */
export function formatCredits(credits) {
  const absCredits = Math.abs(credits);
  const sign = credits < 0 ? '-' : '';
  return `${sign}¢${formatNumber(absCredits)}`;
}

/**
 * Formata popularidade média
 * @param {Object} popularity - Objeto com popularidade por classe
 * @returns {string} Popularidade média formatada
 */
export function formatAveragePopularity(popularity) {
  const average = (popularity.poor + popularity.middle + popularity.rich) / 3;
  return formatPercentage(average);
}

/**
 * Formata popularidade detalhada para tooltip
 * @param {Object} popularity - Objeto com popularidade por classe
 * @returns {string} Tooltip detalhado
 */
export function formatPopularityTooltip(popularity) {
  return `Pobres: ${formatPercentage(popularity.poor)}\n` +
         `Média: ${formatPercentage(popularity.middle)}\n` +
         `Ricos: ${formatPercentage(popularity.rich)}\n` +
         `Média: ${formatAveragePopularity(popularity)}`;
}

/**
 * Formata balanço energético para tooltip
 * @param {number} production - Produção total
 * @param {number} consumption - Consumo total
 * @param {number} storage - Armazenamento
 * @returns {string} Tooltip do balanço
 */
export function formatEnergyBalanceTooltip(production, consumption, storage) {
  const balance = production - consumption;
  const balanceText = balance >= 0 ? `+${formatEnergy(balance)}` : formatEnergy(balance);

  return `Produção: ${formatEnergy(production)}\n` +
         `Consumo: ${formatEnergy(consumption)}\n` +
         `Balanço: ${balanceText}\n` +
         `Armazenamento: ${formatEnergy(storage)}`;
}

/**
 * Formata tooltip de ação
 * @param {string} actionType - Tipo da ação
 * @param {Object} costs - Custos da ação
 * @returns {string} Tooltip formatado
 */
export function formatActionTooltip(actionType, costs) {
  let tooltip = '';

  if (costs.credits !== undefined && costs.credits !== 0) {
    tooltip += `Custo: ${formatCredits(costs.credits)}\n`;
  }

  if (costs.capacity !== undefined && costs.capacity !== 0) {
    const capacityText = costs.capacity > 0 ? `+${costs.capacity}` : costs.capacity;
    tooltip += `Capacidade: ${capacityText} MW\n`;
  }

  if (costs.pollution !== undefined && costs.pollution !== 0) {
    const pollutionText = costs.pollution > 0 ? `+${costs.pollution}` : `${costs.pollution}`;
    tooltip += `Poluição: ${pollutionText}\n`;
  }

  if (costs.popularityBonus !== undefined && costs.popularityBonus !== 0) {
    tooltip += `Popularidade: +${costs.popularityBonus}%\n`;
  }

  return tooltip.trim();
}

/**
 * Formata tooltip de decisão
 * @param {Object} decision - Objeto da decisão
 * @param {string} choice - 'accept' ou 'reject'
 * @returns {string} Tooltip formatado
 */
export function formatDecisionTooltip(decision, choice) {
  const effects = choice === 'accept' ? decision.acceptEffects : decision.rejectEffects;
  let tooltip = choice === 'accept' ? 'ACEITAR:\n' : 'REJEITAR:\n';

  if (effects.credits !== undefined) {
    tooltip += `Créditos: ${effects.credits > 0 ? '+' : ''}${formatCredits(effects.credits)}\n`;
  }

  if (effects.pollution !== undefined) {
    tooltip += `Poluição: ${effects.pollution > 0 ? '+' : ''}${effects.pollution}\n`;
  }

  if (effects.popularity !== undefined) {
    if (effects.popularity.poor !== undefined) {
      tooltip += `Pobres: ${effects.popularity.poor > 0 ? '+' : ''}${effects.popularity.poor}%\n`;
    }
    if (effects.popularity.middle !== undefined) {
      tooltip += `Média: ${effects.popularity.middle > 0 ? '+' : ''}${effects.popularity.middle}%\n`;
    }
    if (effects.popularity.rich !== undefined) {
      tooltip += `Ricos: ${effects.popularity.rich > 0 ? '+' : ''}${effects.popularity.rich}%\n`;
    }
  }

  if (effects.fossilBonus !== undefined) {
    tooltip += `Bônus fóssil: +${effects.fossilBonus} MW\n`;
  }

  if (effects.renewableBonus !== undefined) {
    tooltip += `Bônus renovável: +${Math.round(effects.renewableBonus * 100)}%\n`;
  }

  if (effects.internationalAid !== undefined) {
    tooltip += `Ajuda internacional: ${formatCredits(effects.internationalAid)}\n`;
  }

  if (effects.storageCapacity !== undefined) {
    tooltip += `Armazenamento: +${effects.storageCapacity} MW\n`;
  }

  if (effects.efficiencyBonus !== undefined) {
    tooltip += `Eficiência: +${Math.round(effects.efficiencyBonus * 100)}%\n`;
  }

  return tooltip.trim();
}

/**
 * Formata status do planeta
 * @param {Object} state - Estado do jogo
 * @returns {string} Status descritivo
 */
export function formatPlanetStatus(state) {
  const avgPopularity = (state.popularity.poor + state.popularity.middle + state.popularity.rich) / 3;

  if (state.pollution <= 10 && state.temperature <= 22 && avgPopularity >= 70) {
    return 'Excelente';
  }
  if (state.pollution <= 30 && state.temperature <= 28 && avgPopularity >= 50) {
    return 'Estável';
  }
  if (state.pollution <= 60 && state.temperature <= 35 && avgPopularity >= 30) {
    return 'Preocupante';
  }
  if (state.pollution <= 80 && state.temperature <= 40 && avgPopularity >= 20) {
    return 'Crítico';
  }
  return 'Perigoso';
}

/**
 * Formata timestamp para log
 * @param {Date|string} timestamp - Timestamp
 * @returns {string} Timestamp formatado
 */
export function formatTimestamp(timestamp) {
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return timestamp.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Formata entrada do log
 * @param {Object} entry - Entrada do log
 * @returns {string} Entrada formatada
 */
export function formatLogEntry(entry) {
  const time = formatTimestamp(entry.timestamp);
  return `[${time}] ${entry.message}`;
}

/**
 * Cria tooltip HTML para elemento
 * @param {string} text - Texto do tooltip
 * @returns {string} Atributo data-tooltip
 */
export function createTooltip(text) {
  return `data-tooltip="${text.replace(/"/g, '&quot;').replace(/\n/g, '&#10;')}"`;
}
