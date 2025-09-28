/**
 * UI Canvas para Planeta 2500
 * Renderização do planeta e animações
 */

import { getState } from '../core/state.js';
import { getPlanetColors } from '../core/rules.js';

/**
 * Renderiza o planeta no canvas baseado no estado atual
 */
export function renderizarPlaneta() {
  const canvas = document.getElementById('planet-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const state = getState();

  // Limpa canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calcula cores do planeta
  const colors = getPlanetColors(state);

  // Desenha gradiente radial do planeta
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;

  // Cria gradiente radial
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

  // Aplica cores baseadas no estado
  gradient.addColorStop(0, colors[0] || '#2a4d2a');    // Centro
  gradient.addColorStop(0.4, colors[1] || '#4a7c4a');  // Meio
  gradient.addColorStop(0.7, colors[2] || '#6bb06b');  // Borda interna
  gradient.addColorStop(1, colors[3] || '#8fc48f');    // Borda externa

  // Desenha planeta
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fill();

  // Adiciona detalhes baseados no estado
  adicionarDetalhesPlaneta(ctx, centerX, centerY, radius, state);

  // Adiciona brilho se energia estiver boa
  adicionarBrilho(ctx, centerX, centerY, radius, state);

  // Adiciona aura baseada na popularidade
  adicionarAura(ctx, centerX, centerY, radius, state);
}

/**
 * Adiciona detalhes visuais ao planeta
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {number} centerX - Centro X
 * @param {number} centerY - Centro Y
 * @param {number} radius - Raio
 * @param {Object} state - Estado do jogo
 */
function adicionarDetalhesPlaneta(ctx, centerX, centerY, radius, state) {
  // Detalhes baseados na poluição
  if (state.pollution > 30) {
    // Adiciona "nuvens de poluição"
    ctx.fillStyle = `rgba(100, 100, 100, ${Math.min(0.3, state.pollution / 200)})`;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * 2 * Math.PI;
      const x = centerX + Math.cos(angle) * (radius * 0.8);
      const y = centerY + Math.sin(angle) * (radius * 0.8);
      ctx.beginPath();
      ctx.arc(x, y, radius * 0.1, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  // Detalhes baseados na temperatura
  if (state.temperature > 30) {
    // Adiciona "ondas de calor"
    ctx.strokeStyle = `rgba(255, 100, 100, ${Math.min(0.5, (state.temperature - 30) / 20)})`;
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 5 + i * 3, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  // Detalhes baseados na energia renovável
  const renewableCapacity = state.energy.capacity.solar + state.energy.capacity.wind +
                           state.energy.capacity.hydro + state.energy.capacity.geo;
  const totalCapacity = renewableCapacity + state.energy.capacity.fossil;
  const renewableRatio = totalCapacity > 0 ? renewableCapacity / totalCapacity : 0;

  if (renewableRatio > 0.5) {
    // Adiciona "brilho verde" para energia limpa
    ctx.fillStyle = `rgba(0, 255, 136, ${renewableRatio * 0.2})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.9, 0, 2 * Math.PI);
    ctx.fill();
  }
}

/**
 * Adiciona brilho ao planeta
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {number} centerX - Centro X
 * @param {number} centerY - Centro Y
 * @param {number} radius - Raio
 * @param {Object} state - Estado do jogo
 */
function adicionarBrilho(ctx, centerX, centerY, radius, state) {
  // Brilho baseado na produção energética
  const production = calcularProducaoEstimada(state);
  const consumption = state.energy.consumptionBase || 50;
  const energyBalance = production - consumption;

  if (energyBalance > 10) {
    // Brilho positivo (energia excedente)
    const glowIntensity = Math.min(0.8, energyBalance / 50);
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 20;
    ctx.fillStyle = `rgba(0, 255, 136, ${glowIntensity * 0.3})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0; // Reseta sombra
  } else if (energyBalance < -10) {
    // Brilho negativo (déficit energético)
    const glowIntensity = Math.min(0.8, Math.abs(energyBalance) / 50);
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 20;
    ctx.fillStyle = `rgba(255, 68, 68, ${glowIntensity * 0.3})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

/**
 * Adiciona aura baseada na popularidade
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {number} centerX - Centro X
 * @param {number} centerY - Centro Y
 * @param {number} radius - Raio
 * @param {Object} state - Estado do jogo
 */
function adicionarAura(ctx, centerX, centerY, radius, state) {
  const avgPopularity = (state.popularity.poor + state.popularity.middle + state.popularity.rich) / 3;

  if (avgPopularity > 60) {
    // Aura positiva (popularidade alta)
    const auraIntensity = (avgPopularity - 60) / 40; // 0-1
    ctx.strokeStyle = `rgba(0, 255, 136, ${auraIntensity * 0.5})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.stroke();
  } else if (avgPopularity < 40) {
    // Aura negativa (popularidade baixa)
    const auraIntensity = (40 - avgPopularity) / 40; // 0-1
    ctx.strokeStyle = `rgba(255, 68, 68, ${auraIntensity * 0.5})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

/**
 * Calcula produção estimada (versão simplificada para UI)
 * @param {Object} state - Estado do jogo
 * @returns {number} Produção estimada
 */
function calcularProducaoEstimada(state) {
  const { calculateEffectiveEfficiency, ENERGY_EFFICIENCIES } = require('../core/rules.js');

  let total = 0;
  const sources = ['solar', 'wind', 'hydro', 'geo', 'fossil'];

  for (const source of sources) {
    const capacity = state.energy.capacity[source] || 0;
    const efficiency = calculateEffectiveEfficiency(source, state);
    total += capacity * efficiency;
  }

  return Math.floor(total);
}

/**
 * Anima o planeta (pulsação baseada no estado)
 */
export function animarPlaneta() {
  const canvas = document.getElementById('planet-canvas');
  if (!canvas) return;

  let animationFrame;
  let pulsePhase = 0;

  function animate() {
    const state = getState();
    const ctx = canvas.getContext('2d');

    // Calcula intensidade de pulso baseada na energia
    const production = calcularProducaoEstimada(state);
    const consumption = state.energy.consumptionBase || 50;
    const energyRatio = production / consumption;

    // Pulso mais intenso quando energia está boa
    const pulseIntensity = energyRatio > 1 ? 0.1 : 0;

    pulsePhase += 0.05;
    const scale = 1 + Math.sin(pulsePhase) * pulseIntensity;

    // Salva estado do contexto
    ctx.save();

    // Aplica escala pulsante
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    // Renderiza normalmente
    renderizarPlaneta();

    // Restaura contexto
    ctx.restore();

    animationFrame = requestAnimationFrame(animate);
  }

  // Inicia animação
  animate();

  // Retorna função para parar animação
  return () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
}

/**
 * Atualiza tamanho do canvas baseado no container
 */
export function ajustarTamanhoCanvas() {
  const canvas = document.getElementById('planet-canvas');
  const container = document.getElementById('center-panel');

  if (canvas && container) {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const size = Math.min(containerWidth - 40, containerHeight - 100, 400);

    canvas.width = size;
    canvas.height = size;

    // Re-renderiza após resize
    renderizarPlaneta();
  }
}

/**
 * Adiciona event listeners para interatividade do canvas
 */
export function inicializarCanvas() {
  const canvas = document.getElementById('planet-canvas');

  if (canvas) {
    // Tooltip ao passar mouse
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Ajusta tamanho inicial
    ajustarTamanhoCanvas();

    // Ajusta tamanho quando janela é redimensionada
    window.addEventListener('resize', ajustarTamanhoCanvas);
  }
}

/**
 * Handler para movimento do mouse no canvas
 * @param {MouseEvent} event - Evento do mouse
 */
function handleMouseMove(event) {
  const canvas = event.target;
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
  const radius = Math.min(centerX, centerY) - 10;

  // Mostra tooltip se mouse sobre o planeta
  if (distance <= radius) {
    const state = getState();
    const status = getPlanetStatus(state);
    canvas.title = `Planeta 2500 - Status: ${status}`;
  }
}

/**
 * Handler para mouse saindo do canvas
 */
function handleMouseLeave() {
  const canvas = document.getElementById('planet-canvas');
  if (canvas) {
    canvas.title = '';
  }
}

/**
 * Obtém status descritivo do planeta
 * @param {Object} state - Estado do jogo
 * @returns {string} Status descritivo
 */
function getPlanetStatus(state) {
  const avgPopularity = (state.popularity.poor + state.popularity.middle + state.popularity.rich) / 3;

  if (state.pollution <= 20 && state.temperature <= 25 && avgPopularity >= 60) {
    return 'Excelente - Planeta saudável e prosperando';
  }
  if (state.pollution <= 40 && state.temperature <= 30 && avgPopularity >= 50) {
    return 'Estável - Situação controlada';
  }
  if (state.pollution <= 60 && state.temperature <= 35 && avgPopularity >= 40) {
    return 'Preocupante - Atenção necessária';
  }
  if (state.pollution <= 80 && state.temperature <= 40 && avgPopularity >= 30) {
    return 'Instável - Riscos elevados';
  }
  return 'Crítico - Intervenção urgente necessária';
}
