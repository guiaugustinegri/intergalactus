/**
 * UI Modal para Planeta 2500
 * Gerenciamento de modais de decisão e fim de jogo
 */

import { formatDecisionTooltip } from '../utils/format.js';

/**
 * Mostra modal de decisão
 * @param {Object} decision - Objeto da decisão
 */
export function mostrarModalDecisao(decision) {
  const modal = document.getElementById('decision-modal');
  const title = document.getElementById('decision-title');
  const description = document.getElementById('decision-description');

  if (!modal || !title || !description) return;

  // Preenche conteúdo
  title.textContent = decision.title;
  description.textContent = decision.description;

  // Adiciona tooltips aos botões
  const acceptBtn = document.getElementById('decision-accept-btn');
  const rejectBtn = document.getElementById('decision-reject-btn');

  if (acceptBtn) {
    const acceptTooltip = formatDecisionTooltip(decision, 'accept');
    acceptBtn.setAttribute('data-tooltip', acceptTooltip);
  }

  if (rejectBtn) {
    const rejectTooltip = formatDecisionTooltip(decision, 'reject');
    rejectBtn.setAttribute('data-tooltip', rejectTooltip);
  }

  // Mostra modal
  modal.classList.remove('hidden');

  // Anima entrada
  setTimeout(() => {
    modal.style.opacity = '1';
    modal.style.transform = 'scale(1)';
  }, 10);
}

/**
 * Mostra modal de fim de jogo
 * @param {Object} result - Resultado do jogo
 */
export function mostrarModalFimJogo(result) {
  const modal = document.getElementById('game-over-modal');
  const title = document.getElementById('game-over-title');
  const message = document.getElementById('game-over-message');

  if (!modal || !title || !message) return;

  // Define conteúdo baseado no resultado
  if (result.victory) {
    title.textContent = result.title;
    title.style.color = '#00ff88';
    message.textContent = result.message;
  } else {
    title.textContent = result.title;
    title.style.color = '#ff4444';
    message.textContent = result.message;
  }

  // Mostra modal
  modal.classList.remove('hidden');

  // Anima entrada
  setTimeout(() => {
    modal.style.opacity = '1';
    modal.style.transform = 'scale(1)';
  }, 10);
}

/**
 * Esconde modal específico
 * @param {string} modalId - ID do modal
 */
export function esconderModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  // Anima saída
  modal.style.opacity = '0';
  modal.style.transform = 'scale(0.9)';

  // Esconde após animação
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.style.opacity = '';
    modal.style.transform = '';
  }, 300);
}

/**
 * Cria modal customizado
 * @param {Object} config - Configuração do modal
 * @returns {HTMLElement} Elemento do modal criado
 */
export function criarModalCustomizado(config) {
  const modal = document.createElement('div');
  modal.className = 'modal custom-modal hidden';
  modal.id = config.id || 'custom-modal';

  modal.innerHTML = `
    <div class="modal-content">
      <h2>${config.title || 'Modal'}</h2>
      <div class="modal-body">
        ${config.content || ''}
      </div>
      <div class="modal-actions">
        ${config.actions ? config.actions.map(action =>
          `<button class="modal-btn ${action.class || ''}" data-action="${action.id}">${action.label}</button>`
        ).join('') : ''}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Adiciona event listeners
  if (config.actions) {
    config.actions.forEach(action => {
      const btn = modal.querySelector(`[data-action="${action.id}"]`);
      if (btn && action.onClick) {
        btn.addEventListener('click', () => {
          action.onClick(modal);
        });
      }
    });
  }

  return modal;
}

/**
 * Mostra modal de confirmação
 * @param {string} message - Mensagem de confirmação
 * @param {Function} onConfirm - Callback para confirmação
 * @param {Function} onCancel - Callback para cancelamento
 */
export function mostrarModalConfirmacao(message, onConfirm, onCancel) {
  const modal = criarModalCustomizado({
    id: 'confirm-modal',
    title: 'Confirmação',
    content: `<p>${message}</p>`,
    actions: [
      {
        id: 'confirm',
        label: 'Confirmar',
        class: 'primary-btn',
        onClick: (modal) => {
          if (onConfirm) onConfirm();
          esconderModal('confirm-modal');
          modal.remove();
        }
      },
      {
        id: 'cancel',
        label: 'Cancelar',
        class: 'secondary-btn',
        onClick: (modal) => {
          if (onCancel) onCancel();
          esconderModal('confirm-modal');
          modal.remove();
        }
      }
    ]
  });

  modal.classList.remove('hidden');

  setTimeout(() => {
    modal.style.opacity = '1';
    modal.style.transform = 'scale(1)';
  }, 10);
}

/**
 * Mostra modal de informação
 * @param {string} title - Título
 * @param {string} message - Mensagem
 * @param {Function} onClose - Callback ao fechar
 */
export function mostrarModalInformacao(title, message, onClose) {
  const modal = criarModalCustomizado({
    id: 'info-modal',
    title: title,
    content: `<p>${message}</p>`,
    actions: [
      {
        id: 'close',
        label: 'Fechar',
        class: 'primary-btn',
        onClick: (modal) => {
          if (onClose) onClose();
          esconderModal('info-modal');
          modal.remove();
        }
      }
    ]
  });

  modal.classList.remove('hidden');

  setTimeout(() => {
    modal.style.opacity = '1';
    modal.style.transform = 'scale(1)';
  }, 10);
}

/**
 * Mostra modal de carregamento
 * @param {string} message - Mensagem de carregamento
 * @returns {Function} Função para esconder o modal
 */
export function mostrarModalCarregamento(message = 'Carregando...') {
  const modal = criarModalCustomizado({
    id: 'loading-modal',
    title: 'Aguarde',
    content: `
      <div class="loading-spinner"></div>
      <p>${message}</p>
    `
  });

  modal.classList.remove('hidden');

  // Remove botão de fechar para modais de carregamento
  const actions = modal.querySelector('.modal-actions');
  if (actions) {
    actions.remove();
  }

  setTimeout(() => {
    modal.style.opacity = '1';
    modal.style.transform = 'scale(1)';
  }, 10);

  // Retorna função para fechar
  return () => {
    esconderModal('loading-modal');
    setTimeout(() => modal.remove(), 300);
  };
}

/**
 * Anima transição entre modais
 * @param {string} hideModalId - ID do modal para esconder
 * @param {string} showModalId - ID do modal para mostrar
 */
export function transicionarModais(hideModalId, showModalId) {
  const hideModal = document.getElementById(hideModalId);
  const showModal = document.getElementById(showModalId);

  if (hideModal) {
    esconderModal(hideModalId);
  }

  setTimeout(() => {
    if (showModal) {
      showModal.classList.remove('hidden');
      setTimeout(() => {
        showModal.style.opacity = '1';
        showModal.style.transform = 'scale(1)';
      }, 10);
    }
  }, 300);
}

/**
 * Fecha todos os modais abertos
 */
export function fecharTodosModais() {
  const modals = document.querySelectorAll('.modal:not(.hidden)');
  modals.forEach(modal => {
    esconderModal(modal.id);
  });
}

/**
 * Verifica se algum modal está aberto
 * @returns {boolean} Verdadeiro se há modal aberto
 */
export function modalAberto() {
  return document.querySelector('.modal:not(.hidden)') !== null;
}

/**
 * Adiciona efeito de backdrop blur ao mostrar modal
 * @param {boolean} enable - Se deve habilitar blur
 */
export function toggleBackdropBlur(enable) {
  const gameContainer = document.getElementById('game-container');
  if (gameContainer) {
    if (enable) {
      gameContainer.style.filter = 'blur(2px)';
      gameContainer.style.pointerEvents = 'none';
    } else {
      gameContainer.style.filter = '';
      gameContainer.style.pointerEvents = '';
    }
  }
}

/**
 * Inicializa comportamento padrão dos modais
 */
export function inicializarModais() {
  // Fecha modal ao clicar no backdrop
  document.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
      const modalId = event.target.id;
      esconderModal(modalId);
    }
  });

  // Suporte a tecla Escape para fechar modais
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalAberto()) {
      fecharTodosModais();
    }
  });

  // Adiciona blur ao mostrar modal
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target.classList.contains('modal')) {
          const isVisible = !target.classList.contains('hidden');
          toggleBackdropBlur(isVisible);
        }
      }
    });
  });

  // Observa mudanças nos modais
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    observer.observe(modal, { attributes: true });
  });
}
