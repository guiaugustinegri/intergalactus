/**
 * Gerador pseudoaleatório com seed para Planeta 2500
 * Permite replays determinísticos
 */

// Estado interno do RNG
let seed = Date.now();
let currentSeed = seed;

/**
 * Algoritmo Linear Congruential Generator simples
 * @param {number} s - Seed
 * @returns {number} Próximo valor pseudoaleatório entre 0 e 1
 */
function lcg(s) {
  const a = 1664525;
  const c = 1013904223;
  const m = Math.pow(2, 32);

  currentSeed = (a * s + c) % m;
  return currentSeed / m;
}

/**
 * Define a seed inicial
 * @param {number} newSeed - Nova seed
 */
export function setSeed(newSeed) {
  if (typeof newSeed === 'number' && newSeed > 0) {
    seed = newSeed;
    currentSeed = seed;
  }
}

/**
 * Reseta para a seed inicial
 */
export function resetSeed() {
  currentSeed = seed;
}

/**
 * Gera número pseudoaleatório entre 0 e 1
 * @returns {number} Número aleatório entre 0 e 1
 */
export function rand() {
  return lcg(currentSeed);
}

/**
 * Gera número inteiro aleatório entre min e max (inclusive)
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Número inteiro aleatório
 */
export function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}

/**
 * Gera número aleatório entre min e max
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} Número aleatório
 */
export function randRange(min, max) {
  return rand() * (max - min) + min;
}

/**
 * Escolhe elemento aleatório de um array
 * @param {Array} array - Array para escolher
 * @returns {*} Elemento aleatório ou null se array vazio
 */
export function randChoice(array) {
  if (!Array.isArray(array) || array.length === 0) {
    return null;
  }
  return array[randInt(0, array.length - 1)];
}

/**
 * Embaralha array usando Fisher-Yates
 * @param {Array} array - Array para embaralhar
 * @returns {Array} Array embaralhado
 */
export function shuffle(array) {
  if (!Array.isArray(array)) {
    return array;
  }

  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Testa probabilidade percentual
 * @param {number} percentage - Porcentagem de chance (0-100)
 * @returns {boolean} Verdadeiro se sucesso
 */
export function chance(percentage) {
  return rand() * 100 < percentage;
}

/**
 * Gera seed baseada em string (para replays consistentes)
 * @param {string} str - String para base da seed
 * @returns {number} Seed numérica
 */
export function seedFromString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converte para 32 bits
  }
  return Math.abs(hash);
}

/**
 * Obtém seed atual
 * @returns {number} Seed atual
 */
export function getCurrentSeed() {
  return currentSeed;
}

/**
 * Obtém seed inicial
 * @returns {number} Seed inicial
 */
export function getInitialSeed() {
  return seed;
}
