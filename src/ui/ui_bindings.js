/**
 * UI Bindings para Planeta 2500
 * Handlers de eventos e interações do usuário
 */

import { processarAcaoJogador, executarTurno, processarDecisao, iniciarJogo } from '../core/engine.js';
import { salvarEstado, carregarEstado } from '../utils/storage.js';
import { atualizarLayout, atualizarTooltipsAcoes, atualizarEstadoBotoes, animarElemento } from './ui_layout.js';
import { renderizarPlaneta } from './ui_canvas.js';
import { mostrarModalDecisao, mostrarModalFimJogo, esconderModal } from './ui_modal.js';
import { addLogEntry } from '../core/state.js';

/**
 * Inicializa todos os event listeners da UI
 */
export function inicializarBindings() {
  // Botões de controle principal
  document.getElementById('new-game-btn')?.addEventListener('click', handleNovoJogo);
  document.getElementById('save-btn')?.addEventListener('click', handleSalvar);
  document.getElementById('load-btn')?.addEventListener('click', handleCarregar);

  // Botões de ações
  document.getElementById('expand-solar-btn')?.addEventListener('click', () => handleAcao('expandSolar'));
  document.getElementById('expand-wind-btn')?.addEventListener('click', () => handleAcao('expandWind'));
  document.getElementById('expand-hydro-btn')?.addEventListener('click', () => handleAcao('expandHydro'));
  document.getElementById('expand-geo-btn')?.addEventListener('click', () => handleAcao('expandGeo'));
  document.getElementById('reduce-fossil-btn')?.addEventListener('click', () => handleAcao('reduceFossil'));
  document.getElementById('invest-research-btn')?.addEventListener('click', () => handleAcao('investResearch'));
  document.getElementById('public-campaign-btn')?.addEventListener('click', () => handleAcao('publicCampaign'));
  document.getElementById('environmental-program-btn')?.addEventListener('click', () => handleAcao('environmentalProgram'));

  // Botão de encerrar turno
  document.getElementById('end-turn-btn')?.addEventListener('click', handleEncerrarTurno);

  // Modais de decisão
  document.getElementById('decision-accept-btn')?.addEventListener('click', () => handleDecisao('accept'));
  document.getElementById('decision-reject-btn')?.addEventListener('click', () => handleDecisao('reject'));

  // Modal de fim de jogo
  document.getElementById('play-again-btn')?.addEventListener('click', handleJogarNovamente);

  // Previne comportamento padrão em links e botões
  document.addEventListener('keydown', handleKeyDown);
}

/**
 * Handler para iniciar novo jogo
 */
function handleNovoJogo() {
  if (confirm('Tem certeza que deseja iniciar um novo jogo? Todo progresso não salvo será perdido.')) {
    iniciarJogo();
    atualizarLayout();
    renderizarPlaneta();
    atualizarTooltipsAcoes();
    atualizarEstadoBotoes();
    addLogEntry('Novo jogo iniciado!', 'success');
  }
}

/**
 * Handler para salvar jogo
 */
function handleSalvar() {
  const { getState } = require('../core/state.js');
  const sucesso = salvarEstado(getState());

  if (sucesso) {
    addLogEntry('Jogo salvo com sucesso!', 'success');
    animarElemento('save-btn', 'success-animation');
  } else {
    addLogEntry('Erro ao salvar jogo.', 'error');
    animarElemento('save-btn', 'error-animation');
  }
}

/**
 * Handler para carregar jogo
 */
function handleCarregar() {
  const estadoSalvo = carregarEstado();

  if (estadoSalvo) {
    const { setState } = require('../core/state.js');
    setState(estadoSalvo);
    atualizarLayout();
    renderizarPlaneta();
    atualizarTooltipsAcoes();
    atualizarEstadoBotoes();
    addLogEntry('Jogo carregado com sucesso!', 'success');
  } else {
    addLogEntry('Nenhum jogo salvo encontrado.', 'warning');
  }
}

/**
 * Handler para ações do jogador
 * @param {string} actionType - Tipo da ação
 */
function handleAcao(actionType) {
  try {
    processarAcaoJogador(actionType);
    atualizarLayout();
    atualizarEstadoBotoes();
    renderizarPlaneta();

    // Anima botão da ação
    const buttonId = `${actionType.replace(/([A-Z])/g, '-$1').toLowerCase()}-btn`;
    animarElemento(buttonId, 'action-animation');

  } catch (error) {
    console.error('Erro ao processar ação:', error);
    addLogEntry(`Erro ao executar ação: ${actionType}`, 'error');
  }
}

/**
 * Handler para encerrar turno
 */
function handleEncerrarTurno() {
  try {
    const resultado = executarTurno();

    atualizarLayout();
    atualizarTooltipsAcoes();
    atualizarEstadoBotoes();
    renderizarPlaneta();

    // Verifica se decisão é necessária
    if (resultado && resultado.decisionRequired) {
      mostrarModalDecisao(resultado.decision);
      return;
    }

    // Verifica fim do jogo
    if (resultado && resultado.gameOver) {
      mostrarModalFimJogo(resultado);
      return;
    }

    animarElemento('end-turn-btn', 'turn-animation');
    addLogEntry(`Turno encerrado`, 'info');

  } catch (error) {
    console.error('Erro ao encerrar turno:', error);
    addLogEntry('Erro ao encerrar turno', 'error');
  }
}

/**
 * Handler para decisões do jogador
 * @param {string} choice - 'accept' ou 'reject'
 */
function handleDecisao(choice) {
  try {
    processarDecisao(choice);
    esconderModal('decision-modal');

    atualizarLayout();
    atualizarEstadoBotoes();
    renderizarPlaneta();

    const choiceText = choice === 'accept' ? 'aceita' : 'rejeitada';
    addLogEntry(`Decisão ${choiceText}`, 'info');

  } catch (error) {
    console.error('Erro ao processar decisão:', error);
    addLogEntry('Erro ao processar decisão', 'error');
  }
}

/**
 * Handler para jogar novamente
 */
function handleJogarNovamente() {
  esconderModal('game-over-modal');
  handleNovoJogo();
}

/**
 * Handler para teclas de atalho
 * @param {KeyboardEvent} event - Evento do teclado
 */
function handleKeyDown(event) {
  // Previne scroll padrão para algumas teclas
  const preventKeys = ['Space', 'Enter', 'KeyS', 'KeyL', 'KeyN'];

  if (preventKeys.includes(event.code)) {
    event.preventDefault();
  }

  switch (event.code) {
    case 'Space':
    case 'Enter':
      // Encerrar turno com espaço ou enter
      if (!document.querySelector('.modal:not(.hidden)')) {
        handleEncerrarTurno();
      }
      break;

    case 'KeyS':
      // Salvar com S
      if (event.ctrlKey || event.metaKey) {
        handleSalvar();
      }
      break;

    case 'KeyL':
      // Carregar com L
      if (event.ctrlKey || event.metaKey) {
        handleCarregar();
      }
      break;

    case 'KeyN':
      // Novo jogo com N
      if (event.ctrlKey || event.metaKey) {
        handleNovoJogo();
      }
      break;

    case 'Escape':
      // Fechar modais com Escape
      const openModal = document.querySelector('.modal:not(.hidden)');
      if (openModal) {
        esconderModal(openModal.id);
      }
      break;
  }
}

/**
 * Desabilita interações durante animações/modal
 * @param {boolean} disabled - Se deve desabilitar
 */
export function setInteracoesDesabilitadas(disabled) {
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    if (!button.id.includes('decision-') && !button.id.includes('play-again-')) {
      button.disabled = disabled;
      button.style.pointerEvents = disabled ? 'none' : 'auto';
    }
  });
}

/**
 * Mostra indicador de loading
 * @param {boolean} show - Se deve mostrar
 */
export function mostrarLoading(show) {
  let loadingElement = document.getElementById('loading-indicator');

  if (show && !loadingElement) {
    loadingElement = document.createElement('div');
    loadingElement.id = 'loading-indicator';
    loadingElement.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">Processando...</div>
    `;
    loadingElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 10px;
      z-index: 9999;
      text-align: center;
    `;
    document.body.appendChild(loadingElement);
  } else if (!show && loadingElement) {
    loadingElement.remove();
  }
}

/**
 * Valida entrada do usuário
 * @param {string} input - Entrada para validar
 * @param {string} type - Tipo de validação
 * @returns {boolean} Verdadeiro se válido
 */
export function validarEntrada(input, type) {
  switch (type) {
    case 'number':
      return !isNaN(input) && input >= 0;

    case 'percentage':
      const num = parseFloat(input);
      return !isNaN(num) && num >= 0 && num <= 100;

    case 'credits':
      const credits = parseInt(input);
      return !isNaN(credits) && credits >= 0;

    default:
      return input && input.trim().length > 0;
  }
}

/**
 * Mostra mensagem de erro temporária
 * @param {string} message - Mensagem de erro
 * @param {number} duration - Duração em ms
 */
export function mostrarErroTemporario(message, duration = 3000) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(errorElement);

  setTimeout(() => {
    errorElement.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => errorElement.remove(), 300);
  }, duration);
}
