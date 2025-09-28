/**
 * Utilitários de armazenamento para Planeta 2500
 * Salvar/carregar jogo no localStorage
 */

const GAME_KEY = 'planeta2500_save';
const SAVE_VERSION = '1.0.0';

/**
 * Salva o estado atual do jogo
 * @param {Object} gameState - Estado do jogo a salvar
 * @returns {boolean} Verdadeiro se salvou com sucesso
 */
export function salvarEstado(gameState) {
  try {
    const saveData = {
      version: SAVE_VERSION,
      timestamp: new Date().toISOString(),
      state: gameState
    };

    localStorage.setItem(GAME_KEY, JSON.stringify(saveData));
    return true;
  } catch (error) {
    console.error('Erro ao salvar jogo:', error);
    return false;
  }
}

/**
 * Carrega o estado salvo do jogo
 * @returns {Object|null} Estado do jogo ou null se não encontrou/falhou
 */
export function carregarEstado() {
  try {
    const savedData = localStorage.getItem(GAME_KEY);
    if (!savedData) {
      return null;
    }

    const saveData = JSON.parse(savedData);

    // Verifica versão do save
    if (!saveData.version || saveData.version !== SAVE_VERSION) {
      console.warn('Versão do save incompatível, ignorando');
      return null;
    }

    // Valida estrutura básica
    if (!saveData.state || typeof saveData.state !== 'object') {
      console.error('Save corrompido: estado inválido');
      return null;
    }

    // Verifica campos obrigatórios
    const requiredFields = ['turn', 'credits', 'pollution', 'temperature', 'popularity', 'energy'];
    for (const field of requiredFields) {
      if (!(field in saveData.state)) {
        console.error(`Save corrompido: campo '${field}' ausente`);
        return null;
      }
    }

    console.log('Jogo carregado com sucesso');
    return saveData.state;
  } catch (error) {
    console.error('Erro ao carregar jogo:', error);
    return null;
  }
}

/**
 * Remove o save do localStorage
 * @returns {boolean} Verdadeiro se removeu com sucesso
 */
export function removerSave() {
  try {
    localStorage.removeItem(GAME_KEY);
    return true;
  } catch (error) {
    console.error('Erro ao remover save:', error);
    return false;
  }
}

/**
 * Verifica se existe um save válido
 * @returns {boolean} Verdadeiro se existe save válido
 */
export function existeSave() {
  try {
    const savedData = localStorage.getItem(GAME_KEY);
    if (!savedData) {
      return false;
    }

    const saveData = JSON.parse(savedData);
    return saveData.version === SAVE_VERSION &&
           saveData.state &&
           typeof saveData.state === 'object';
  } catch (error) {
    return false;
  }
}

/**
 * Obtém informações do save sem carregar o estado completo
 * @returns {Object|null} Informações do save ou null
 */
export function getInfoSave() {
  try {
    const savedData = localStorage.getItem(GAME_KEY);
    if (!savedData) {
      return null;
    }

    const saveData = JSON.parse(savedData);
    return {
      version: saveData.version,
      timestamp: saveData.timestamp,
      turn: saveData.state?.turn,
      credits: saveData.state?.credits,
      planetStatus: saveData.state ? formatPlanetStatus(saveData.state) : 'Desconhecido'
    };
  } catch (error) {
    return null;
  }
}

/**
 * Formata status do planeta para info do save
 * @param {Object} state - Estado do jogo
 * @returns {string} Status formatado
 */
function formatPlanetStatus(state) {
  const avgPopularity = (state.popularity?.poor + state.popularity?.middle + state.popularity?.rich) / 3 || 0;

  if (state.pollution <= 20 && state.temperature <= 25 && avgPopularity >= 60) {
    return 'Saudável';
  }
  if (state.pollution <= 50 && state.temperature <= 32 && avgPopularity >= 40) {
    return 'Estável';
  }
  if (state.pollution <= 75 && state.temperature <= 38 && avgPopularity >= 25) {
    return 'Instável';
  }
  return 'Crítico';
}

/**
 * Faz backup do save atual
 * @returns {boolean} Verdadeiro se backup foi criado
 */
export function backupSave() {
  try {
    const currentSave = localStorage.getItem(GAME_KEY);
    if (currentSave) {
      const backupKey = `${GAME_KEY}_backup_${Date.now()}`;
      localStorage.setItem(backupKey, currentSave);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao fazer backup:', error);
    return false;
  }
}

/**
 * Restaura save do backup mais recente
 * @returns {boolean} Verdadeiro se restaurou com sucesso
 */
export function restaurarBackup() {
  try {
    const keys = Object.keys(localStorage);
    const backupKeys = keys.filter(key => key.startsWith(`${GAME_KEY}_backup_`));

    if (backupKeys.length === 0) {
      return false;
    }

    // Pega o backup mais recente
    const latestBackup = backupKeys.sort().pop();
    const backupData = localStorage.getItem(latestBackup);

    if (backupData) {
      localStorage.setItem(GAME_KEY, backupData);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao restaurar backup:', error);
    return false;
  }
}

/**
 * Lista todos os backups disponíveis
 * @returns {Array} Array com informações dos backups
 */
export function listarBackups() {
  try {
    const keys = Object.keys(localStorage);
    const backupKeys = keys.filter(key => key.startsWith(`${GAME_KEY}_backup_`));

    return backupKeys.map(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        const timestamp = key.split('_').pop();
        return {
          key,
          timestamp: new Date(parseInt(timestamp)),
          turn: data.state?.turn,
          version: data.version
        };
      } catch (error) {
        return null;
      }
    }).filter(Boolean).sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Erro ao listar backups:', error);
    return [];
  }
}

/**
 * Limpa backups antigos (mantém apenas os 5 mais recentes)
 */
export function limparBackupsAntigos() {
  try {
    const backups = listarBackups();
    if (backups.length > 5) {
      const backupsParaRemover = backups.slice(5);
      backupsParaRemover.forEach(backup => {
        localStorage.removeItem(backup.key);
      });
    }
  } catch (error) {
    console.error('Erro ao limpar backups antigos:', error);
  }
}
