/**
 * UI Log para Planeta 2500
 * Gerenciamento de mensagens de log e cores
 */

import { formatLogEntry } from '../utils/format.js';

/**
 * Adiciona entrada ao log da UI
 * @param {string} message - Mensagem
 * @param {string} type - Tipo do log (info, success, warning, error, event)
 */
export function adicionarLogUI(message, type = 'info') {
  const logContainer = document.getElementById('log-container');
  if (!logContainer) return;

  // Cria elemento do log
  const logEntry = document.createElement('div');
  logEntry.className = `log-entry ${type}`;

  // Adiciona timestamp
  const timestamp = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  logEntry.innerHTML = `
    <span class="log-timestamp">[${timestamp}]</span>
    <span class="log-message">${message}</span>
  `;

  // Adiciona ao container
  logContainer.appendChild(logEntry);

  // Scroll para o final
  logContainer.scrollTop = logContainer.scrollHeight;

  // Limita número de entradas (mantém últimas 50)
  while (logContainer.children.length > 50) {
    logContainer.removeChild(logContainer.firstChild);
  }

  // Anima entrada
  setTimeout(() => {
    logEntry.style.opacity = '1';
    logEntry.style.transform = 'translateX(0)';
  }, 10);

  // Remove após timeout para tipos específicos
  if (type === 'success' || type === 'error') {
    setTimeout(() => {
      logEntry.style.opacity = '0.5';
    }, 3000);
  }
}

/**
 * Limpa todo o log
 */
export function limparLog() {
  const logContainer = document.getElementById('log-container');
  if (logContainer) {
    logContainer.innerHTML = '';
  }
}

/**
 * Filtra log por tipo
 * @param {string} filterType - Tipo para filtrar ou 'all' para mostrar tudo
 */
export function filtrarLog(filterType) {
  const logContainer = document.getElementById('log-container');
  if (!logContainer) return;

  const entries = logContainer.querySelectorAll('.log-entry');

  entries.forEach(entry => {
    if (filterType === 'all') {
      entry.style.display = 'block';
    } else {
      const hasType = entry.classList.contains(filterType);
      entry.style.display = hasType ? 'block' : 'none';
    }
  });
}

/**
 * Pesquisa no log
 * @param {string} query - Termo de pesquisa
 */
export function pesquisarLog(query) {
  const logContainer = document.getElementById('log-container');
  if (!logContainer) return;

  const entries = logContainer.querySelectorAll('.log-entry');
  const lowerQuery = query.toLowerCase();

  entries.forEach(entry => {
    const message = entry.querySelector('.log-message');
    if (message) {
      const text = message.textContent.toLowerCase();
      const matches = text.includes(lowerQuery);
      entry.style.display = matches ? 'block' : 'none';

      // Destaque termos encontrados
      if (matches && query.trim()) {
        const regex = new RegExp(`(${query})`, 'gi');
        message.innerHTML = message.textContent.replace(regex, '<mark>$1</mark>');
      } else {
        message.innerHTML = message.textContent;
      }
    }
  });
}

/**
 * Cria controles do log (se não existirem)
 */
export function criarControlesLog() {
  const logPanel = document.getElementById('log-panel');
  if (!logPanel) return;

  // Verifica se controles já existem
  if (document.getElementById('log-controls')) return;

  const controls = document.createElement('div');
  controls.id = 'log-controls';
  controls.innerHTML = `
    <div class="log-controls-row">
      <div class="log-filter">
        <label>Filtrar:</label>
        <select id="log-filter-select">
          <option value="all">Todos</option>
          <option value="info">Info</option>
          <option value="success">Sucesso</option>
          <option value="warning">Aviso</option>
          <option value="error">Erro</option>
          <option value="event">Evento</option>
        </select>
      </div>
      <div class="log-search">
        <input type="text" id="log-search-input" placeholder="Pesquisar...">
      </div>
      <button id="log-clear-btn" class="small-btn">Limpar</button>
    </div>
  `;

  // Insere após o título
  const title = logPanel.querySelector('h3');
  if (title) {
    title.insertAdjacentElement('afterend', controls);
  }

  // Adiciona event listeners
  const filterSelect = document.getElementById('log-filter-select');
  const searchInput = document.getElementById('log-search-input');
  const clearBtn = document.getElementById('log-clear-btn');

  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      filtrarLog(e.target.value);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      pesquisarLog(e.target.value);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      limparLog();
      if (searchInput) searchInput.value = '';
      if (filterSelect) filterSelect.value = 'all';
    });
  }
}

/**
 * Exporta log atual para arquivo
 */
export function exportarLog() {
  const logContainer = document.getElementById('log-container');
  if (!logContainer) return;

  const entries = logContainer.querySelectorAll('.log-entry');
  let logText = 'Log do Planeta 2500\n';
  logText += '=' .repeat(50) + '\n\n';

  entries.forEach(entry => {
    const timestamp = entry.querySelector('.log-timestamp')?.textContent || '';
    const message = entry.querySelector('.log-message')?.textContent || '';
    const type = Array.from(entry.classList).find(cls => cls !== 'log-entry') || 'unknown';

    logText += `[${type.toUpperCase()}] ${timestamp} ${message}\n`;
  });

  // Cria blob e download
  const blob = new Blob([logText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `planeta2500_log_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

/**
 * Adiciona atalhos de teclado para o log
 */
export function adicionarAtalhosLog() {
  document.addEventListener('keydown', (event) => {
    // Ctrl+L para limpar log
    if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
      event.preventDefault();
      limparLog();
    }

    // Ctrl+E para exportar log
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
      event.preventDefault();
      exportarLog();
    }
  });
}

/**
 * Mostra estatísticas do log
 * @returns {Object} Estatísticas
 */
export function obterEstatisticasLog() {
  const logContainer = document.getElementById('log-container');
  if (!logContainer) return {};

  const entries = logContainer.querySelectorAll('.log-entry');
  const stats = {
    total: entries.length,
    info: 0,
    success: 0,
    warning: 0,
    error: 0,
    event: 0
  };

  entries.forEach(entry => {
    const type = Array.from(entry.classList).find(cls => cls !== 'log-entry');
    if (type && stats[type] !== undefined) {
      stats[type]++;
    }
  });

  return stats;
}

/**
 * Cria notificação toast
 * @param {string} message - Mensagem
 * @param {string} type - Tipo (success, error, warning, info)
 * @param {number} duration - Duração em ms
 */
export function mostrarToast(message, type = 'info', duration = 3000) {
  // Remove toast existente
  const existingToast = document.querySelector('.toast-notification');
  if (existingToast) {
    existingToast.remove();
  }

  // Cria novo toast
  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-message">${message}</span>
      <button class="toast-close">&times;</button>
    </div>
  `;

  document.body.appendChild(toast);

  // Anima entrada
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  }, 10);

  // Fecha automaticamente
  const closeToast = () => {
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  };

  setTimeout(closeToast, duration);

  // Fecha ao clicar no botão
  const closeBtn = toast.querySelector('.toast-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeToast);
  }

  // Fecha ao clicar no toast
  toast.addEventListener('click', closeToast);
}

/**
 * Inicializa o sistema de log
 */
export function inicializarLog() {
  criarControlesLog();
  adicionarAtalhosLog();

  // Adiciona estilos para toasts se não existirem
  if (!document.getElementById('toast-styles')) {
    const styles = document.createElement('style');
    styles.id = 'toast-styles';
    styles.textContent = `
      .toast-notification {
        position: fixed;
        top: 20px;
        right: -300px;
        max-width: 300px;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 10000;
        transition: all 0.3s ease;
        opacity: 0;
        cursor: pointer;
      }

      .toast-notification.success { border-left: 4px solid #00ff88; }
      .toast-notification.error { border-left: 4px solid #ff4444; }
      .toast-notification.warning { border-left: 4px solid #ffff44; }
      .toast-notification.info { border-left: 4px solid #4444ff; }

      .toast-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .toast-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
      }

      .log-controls-row {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
        align-items: center;
      }

      .log-filter, .log-search {
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .log-search input {
        padding: 5px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 3px;
        background: rgba(0, 0, 0, 0.3);
        color: white;
      }

      .small-btn {
        padding: 5px 10px;
        font-size: 0.8rem;
      }
    `;
    document.head.appendChild(styles);
  }
}
