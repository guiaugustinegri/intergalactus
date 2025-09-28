/**
 * Estado central do jogo Planeta 2500
 * Gerenciamento imutável do estado do jogo
 */

// Estado inicial do jogo
const initialState = {
  turn: 1,
  credits: 1000,
  pollution: 0,
  temperature: 20,
  popularity: { poor: 50, middle: 50, rich: 50 },
  energy: {
    capacity: {
      solar: 0, wind: 0, hydro: 0, geo: 0, fossil: 50
    },
    storage: 0,
    consumptionBase: 50
  },
  cooldowns: { decision: 0 },
  logs: []
};

// Estado atual (privado)
let currentState = { ...initialState };

/**
 * Obtém uma cópia profunda do estado atual
 * @returns {Object} Cópia do estado atual
 */
export function getState() {
  return JSON.parse(JSON.stringify(currentState));
}

/**
 * Define um novo estado (substituição completa)
 * @param {Object} newState - Novo estado
 */
export function setState(newState) {
  if (typeof newState !== 'object' || newState === null) {
    throw new Error('Estado deve ser um objeto válido');
  }
  currentState = JSON.parse(JSON.stringify(newState));
}

/**
 * Aplica um patch ao estado atual de forma imutável
 * @param {Object} patch - Mudanças a aplicar
 */
export function applyPatch(patch) {
  const newState = JSON.parse(JSON.stringify(currentState));

  // Função auxiliar para aplicar patch recursivamente
  function applyPatchRecursive(target, patchObj) {
    for (const key in patchObj) {
      if (patchObj.hasOwnProperty(key)) {
        if (typeof patchObj[key] === 'object' && patchObj[key] !== null &&
            typeof target[key] === 'object' && target[key] !== null) {
          applyPatchRecursive(target[key], patchObj[key]);
        } else {
          target[key] = patchObj[key];
        }
      }
    }
  }

  applyPatchRecursive(newState, patch);
  currentState = newState;
}

/**
 * Reseta o estado para o inicial
 */
export function resetState() {
  currentState = JSON.parse(JSON.stringify(initialState));
}

/**
 * Valida se o estado tem estrutura válida
 * @param {Object} state - Estado a validar
 * @returns {boolean} Verdadeiro se válido
 */
export function validateState(state) {
  const requiredKeys = ['turn', 'credits', 'pollution', 'temperature', 'popularity', 'energy', 'cooldowns', 'logs'];

  for (const key of requiredKeys) {
    if (!(key in state)) {
      console.warn(`Estado inválido: chave '${key}' ausente`);
      return false;
    }
  }

  // Validações específicas
  if (typeof state.turn !== 'number' || state.turn < 1) {
    console.warn('Estado inválido: turn deve ser número >= 1');
    return false;
  }

  if (typeof state.credits !== 'number') {
    console.warn('Estado inválido: credits deve ser número');
    return false;
  }

  if (typeof state.pollution !== 'number' || state.pollution < 0 || state.pollution > 100) {
    console.warn('Estado inválido: pollution deve ser número entre 0-100');
    return false;
  }

  if (typeof state.temperature !== 'number' || state.temperature < 0 || state.temperature > 50) {
    console.warn('Estado inválido: temperature deve ser número entre 0-50');
    return false;
  }

  if (typeof state.popularity !== 'object' ||
      typeof state.popularity.poor !== 'number' ||
      typeof state.popularity.middle !== 'number' ||
      typeof state.popularity.rich !== 'number') {
    console.warn('Estado inválido: popularity deve ter poor, middle, rich como números');
    return false;
  }

  return true;
}

/**
 * Calcula a popularidade média geral
 * @param {Object} popularity - Objeto de popularidade
 * @returns {number} Popularidade média
 */
export function getAveragePopularity(popularity = currentState.popularity) {
  return Math.round((popularity.poor + popularity.middle + popularity.rich) / 3);
}

/**
 * Calcula o total de capacidade energética
 * @param {Object} capacity - Objeto de capacidade
 * @returns {number} Capacidade total
 */
export function getTotalCapacity(capacity = currentState.energy.capacity) {
  return capacity.solar + capacity.wind + capacity.hydro + capacity.geo + capacity.fossil;
}

/**
 * Adiciona entrada ao log do jogo
 * @param {string} message - Mensagem do log
 * @param {string} type - Tipo do log (info, success, warning, error, event)
 */
export function addLogEntry(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  const entry = {
    timestamp,
    message,
    type
  };

  applyPatch({
    logs: [...currentState.logs, entry]
  });

  // Mantém apenas as últimas 50 entradas
  if (currentState.logs.length > 50) {
    applyPatch({
      logs: currentState.logs.slice(-50)
    });
  }
}
