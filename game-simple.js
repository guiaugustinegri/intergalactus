// Planeta 2500 - Versão Super Simples
// Jogo extremamente amigável para todos os jogadores!

class SimpleGame {
    constructor() {
        this.gameState = {
            turn: 1,
            maxTurns: 10,
            money: 1000,
            solarPower: 0,      // Energia solar (MW)
            windPower: 0,       // Energia eólica (MW)
            pollution: 0,       // Poluição (0-100%)
            gameOver: false,
            tutorialStep: 1,
            tutorialActive: true
        };

        this.bindEvents();
        this.updateUI();
        this.showTutorial();
    }

    // Liga todos os eventos da interface
    bindEvents() {
        // Botões de ação
        document.getElementById('solar-btn').addEventListener('click', () => this.addSolar());
        document.getElementById('wind-btn').addEventListener('click', () => this.addWind());
        document.getElementById('cleanup-btn').addEventListener('click', () => this.cleanup());

        // Botão principal
        document.getElementById('next-turn-btn').addEventListener('click', () => this.nextTurn());

        // Tutorial
        document.querySelectorAll('.tutorial-next-btn').forEach(btn => {
            btn.addEventListener('click', () => this.nextTutorialStep());
        });
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());

        // Jogar novamente
        document.getElementById('play-again-btn').addEventListener('click', () => this.resetGame());
    }

    // Ações do jogador
    addSolar() {
        if (this.gameState.money >= 200) {
            this.gameState.money -= 200;
            this.gameState.solarPower += 10;
            this.addMessage('☀️ Energia solar adicionada! Produz 10 MW de energia limpa.', 'success');
            this.updateUI();
        } else {
            this.addMessage('💸 Você não tem dinheiro suficiente! Ganhe mais nos próximos turnos.', 'warning');
        }
    }

    addWind() {
        if (this.gameState.money >= 150) {
            this.gameState.money -= 150;
            this.gameState.windPower += 5;
            this.addMessage('💨 Energia eólica adicionada! Produz 5 MW de energia limpa.', 'success');
            this.updateUI();
        } else {
            this.addMessage('💸 Você não tem dinheiro suficiente! Ganhe mais nos próximos turnos.', 'warning');
        }
    }

    cleanup() {
        if (this.gameState.money >= 100) {
            this.gameState.money -= 100;
            this.gameState.pollution = Math.max(0, this.gameState.pollution - 20);
            this.addMessage('🧹 Planeta limpo! Poluição reduzida em 20%.', 'success');
            this.updateUI();
        } else {
            this.addMessage('💸 Você não tem dinheiro suficiente para limpar o planeta!', 'warning');
        }
    }

    // Avança para o próximo turno
    nextTurn() {
        if (this.gameState.gameOver) return;

        // Calcula produção total de energia
        const totalEnergy = this.gameState.solarPower + this.gameState.windPower;
        const energyNeeded = 50; // Necessidade básica

        // Ganha dinheiro baseado na energia produzida
        const moneyEarned = Math.floor(totalEnergy * 2); // $2 por MW
        this.gameState.money += moneyEarned;

        // Poluição aumenta baseada na energia (menos poluição se usar renovável)
        const pollutionIncrease = Math.max(0, 15 - (totalEnergy * 0.1)); // Menos poluição com mais energia renovável
        this.gameState.pollution += pollutionIncrease;

        // Limita poluição
        this.gameState.pollution = Math.min(100, this.gameState.pollution);

        // Avança turno
        this.gameState.turn++;

        // Log do turno
        this.addMessage(`⏭️ Turno ${this.gameState.turn - 1} terminado! Você ganhou $${moneyEarned}.`, 'info');

        if (pollutionIncrease > 0) {
            this.addMessage(`🌡️ Poluição aumentou ${pollutionIncrease.toFixed(1)}% devido ao uso de energia não-renovável.`, 'warning');
        }

        // Verifica condições de vitória/derrota
        this.checkGameEnd();

        this.updateUI();
    }

    // Verifica se o jogo acabou
    checkGameEnd() {
        // Vitória: sobreviveu todos os turnos com poluição baixa
        if (this.gameState.turn > this.gameState.maxTurns) {
            if (this.gameState.pollution <= 50) {
                this.showVictory();
            } else {
                this.showDefeat('Muita poluição! O planeta ficou muito sujo.');
            }
            return;
        }

        // Derrota: poluição muito alta
        if (this.gameState.pollution >= 80) {
            this.showDefeat('Poluição excessiva! O planeta não aguentou.');
            return;
        }

        // Derrota: sem dinheiro e sem energia
        const totalEnergy = this.gameState.solarPower + this.gameState.windPower;
        if (this.gameState.money < 100 && totalEnergy < 10) {
            this.showDefeat('Sem dinheiro e sem energia! Você não conseguiu manter o planeta.');
            return;
        }
    }

    // Mostra vitória
    showVictory() {
        this.gameState.gameOver = true;
        const totalEnergy = this.gameState.solarPower + this.gameState.windPower;
        const score = this.gameState.money + (totalEnergy * 10) - (this.gameState.pollution * 5);

        document.getElementById('game-result-title').textContent = '🎉 Parabéns! Você Venceu!';
        document.getElementById('game-result-message').textContent =
            `Você salvou o Planeta 2500! 🎊\n\n` +
            `Energia total: ${totalEnergy} MW\n` +
            `Poluição final: ${this.gameState.pollution.toFixed(1)}%\n` +
            `Pontuação: ${score} pontos\n\n` +
            `Obrigado por jogar! 🌍💚`;

        document.getElementById('game-over-modal').classList.remove('hidden');
    }

    // Mostra derrota
    showDefeat(reason) {
        this.gameState.gameOver = true;

        document.getElementById('game-result-title').textContent = '😔 Fim de Jogo';
        document.getElementById('game-result-message').textContent =
            `${reason}\n\n` +
            `Você chegou até o turno ${this.gameState.turn - 1}.\n` +
            `Não desanime! Tente novamente e foque em energia renovável! 🌱`;

        document.getElementById('game-over-modal').classList.remove('hidden');
    }

    // Atualiza toda a interface
    updateUI() {
        // Recursos
        document.getElementById('money-text').textContent = `$${this.gameState.money}`;
        document.getElementById('turn-text').textContent = `${this.gameState.turn} / ${this.gameState.maxTurns}`;

        // Energia
        const totalEnergy = this.gameState.solarPower + this.gameState.windPower;
        const energyPercent = Math.min(100, (totalEnergy / 50) * 100);

        document.getElementById('energy-bar').style.width = `${energyPercent}%`;
        document.getElementById('energy-text').textContent = `${totalEnergy}/50 MW`;

        // Poluição
        document.getElementById('pollution-bar').style.width = `${this.gameState.pollution}%`;
        document.getElementById('pollution-text').textContent = `${this.gameState.pollution.toFixed(1)}%`;

        // Anima barras
        document.getElementById('energy-bar').classList.add('animate');
        document.getElementById('pollution-bar').classList.add('animate');

        setTimeout(() => {
            document.getElementById('energy-bar').classList.remove('animate');
            document.getElementById('pollution-bar').classList.remove('animate');
        }, 800);

        // Habilita/desabilita botões
        this.updateButtons();

        // Atualiza objetivo
        this.updateObjective();
    }

    // Atualiza estado dos botões
    updateButtons() {
        const solarBtn = document.getElementById('solar-btn');
        const windBtn = document.getElementById('wind-btn');
        const cleanupBtn = document.getElementById('cleanup-btn');
        const nextTurnBtn = document.getElementById('next-turn-btn');

        solarBtn.disabled = this.gameState.money < 200;
        windBtn.disabled = this.gameState.money < 150;
        cleanupBtn.disabled = this.gameState.money < 100;

        // Destaque no botão principal se tutorial ativo
        if (this.gameState.tutorialActive && this.gameState.tutorialStep >= 4) {
            nextTurnBtn.classList.add('pulse');
        } else {
            nextTurnBtn.classList.remove('pulse');
        }
    }

    // Atualiza texto do objetivo
    updateObjective() {
        const turnsLeft = this.gameState.maxTurns - this.gameState.turn + 1;
        const objectiveText = document.getElementById('objective-text');

        if (this.gameState.gameOver) return;

        if (turnsLeft > 1) {
            objectiveText.textContent = `Sobreviva por mais ${turnsLeft} turnos e mantenha a poluição abaixo de 50%!`;
        } else {
            objectiveText.textContent = `Último turno! Mantenha a poluição baixa para vencer!`;
        }

        // Cor baseada na situação
        if (this.gameState.pollution >= 60) {
            objectiveText.style.color = '#dc3545'; // Vermelho
        } else if (this.gameState.pollution >= 40) {
            objectiveText.style.color = '#ffc107'; // Amarelo
        } else {
            objectiveText.style.color = '#28a745'; // Verde
        }
    }

    // Adiciona mensagem ao log
    addMessage(text, type = 'info') {
        const messageList = document.getElementById('message-list');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;

        messageList.appendChild(messageDiv);
        messageList.scrollTop = messageList.scrollHeight;

        // Limita mensagens (mantém últimas 5)
        while (messageList.children.length > 5) {
            messageList.removeChild(messageList.firstChild);
        }
    }

    // Sistema de tutorial
    showTutorial() {
        document.getElementById('tutorial-modal').classList.remove('hidden');
        this.showTutorialStep(1);
    }

    showTutorialStep(step) {
        // Esconde todas as etapas
        document.querySelectorAll('.tutorial-step').forEach(el => {
            el.classList.add('hidden');
        });

        // Mostra a etapa atual
        document.getElementById(`step-${step}`).classList.remove('hidden');
    }

    nextTutorialStep() {
        this.gameState.tutorialStep++;
        this.showTutorialStep(this.gameState.tutorialStep);
    }

    startGame() {
        document.getElementById('tutorial-modal').classList.add('hidden');
        this.gameState.tutorialActive = false;
        this.addMessage('🎮 Jogo iniciado! Boa sorte!', 'success');
    }

    // Reinicia o jogo
    resetGame() {
        this.gameState = {
            turn: 1,
            maxTurns: 10,
            money: 1000,
            solarPower: 0,
            windPower: 0,
            pollution: 0,
            gameOver: false,
            tutorialStep: 1,
            tutorialActive: true
        };

        document.getElementById('game-over-modal').classList.add('hidden');
        document.getElementById('message-list').innerHTML = `
            <div class="message welcome-message">
                🎉 Bem-vindo de volta ao Planeta 2500! Clique nos botões acima para adicionar energia renovável e mantenha o planeta limpo!
            </div>
        `;

        this.updateUI();
        this.showTutorial();
    }
}

// Inicia o jogo quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    new SimpleGame();
});
