# 🌍 PLANETA 2500 - Três Versões Disponíveis!

Escolha sua experiência preferida neste jogo de gestão planetária sustentável!

## 🎮 VERSÕES DISPONÍVEIS

### ⭐ [VERSÃO 3D AVANÇADA](index.html) - **MAIS RECOMENDADA!**
**Experiência imersiva completa com Three.js!**

- 🌍 **Planeta 3D Renderizado**: Visualize o Planeta 2500 em 3D com atmosfera, nuvens e efeitos visuais
- ⚡ **Sistema de Partículas**: Poluição e energia têm efeitos visuais dinâmicos
- 🎨 **Efeitos Especiais**:
  - Aurora boreal para energia limpa
  - Tempestades de poluição
  - Sistema estelar de fundo
  - Luzes dinâmicas baseadas na energia
  - **ELEMENTOS VISUAIS NO PLANETA**: Cidades azuis, fábricas cinzas, painéis solares amarelos, parques eólicos animados
- 🎯 **Equilíbrio Complexo AVANÇADO**:
  - **⚡ DEMANDA ENERGÉTICA CRESCENTE**: Começa em 60 MW, cresce 15% por ciclo + população
  - **🏭 INDÚSTRIA OBRIGATÓRIA**: Mínimo 25% para sobrevivência, abaixo = planeta sofre
  - **👥 POPULAÇÃO CRESCENTE**: Cidades aparecem automaticamente com crescimento
  - **🌡️ POLUIÇÃO**: Vilão principal com partículas visuais dramáticas
  - **💰 RECURSOS**: Gestão financeira crítica para expansão
- 🎮 **Controles Orbitais**: Arraste para rotacionar, zoom para aproximar
- 🏆 **Objetivo INFINITO**: Sobreviva o máximo de turnos possível! Sem limite de ciclos
- 🎯 **SISTEMA DE MISSÕES DINÂMICO**: Sempre 3 missões ativas, recompensas em dinheiro!
- 🏆 **LEADERBOARD LOCAL**: Compita com outros jogadores no mesmo dispositivo

### 🎯 [VERSÃO SIMPLES](index-simple.html)
**Perfeita para iniciantes e jogabilidade rápida!**

- 🎯 **Objetivo**: Sobreviva 10 turnos com poluição baixa
- ⚡ **Ações**: Apenas 3 botões grandes e intuitivos
- 💰 **Economia**: $1000 inicial, ganhe dinheiro produzindo energia
- 🌱 **Energia**: Solar ($200) e Eólica ($150) + limpeza ($100)
- 📚 **Tutorial**: 5 passos guiados
- 🎨 **Interface**: Cores alegres, botões enormes

### 🔬 [VERSÃO COMPLETA](index.html)
**Para jogadores experientes que querem profundidade máxima!**

- 🎯 **Objetivo**: Alcance uma das 3 condições de vitória
- ⚡ **Ações**: 8 ações estratégicas avançadas
- 🌡️ **Sistema complexo**: Poluição, temperatura, popularidade
- 🔧 **5 fontes de energia**: Solar, Eólica, Hidro, Geotérmica, Fóssil
- 📊 **4 indicadores**: Créditos, Poluição, Temperatura, Popularidade
- 🎲 **Eventos aleatórios**: Decisões estratégicas estilo HoI4

## 🚀 COMO JOGAR

### Opção 1: Versão 3D (Principal - Recomendada)
```bash
# Inicie o servidor
python -m http.server 8000

# Abra no navegador
http://localhost:8000/index.html
```
**Esta é a versão principal do jogo com visualização 3D completa.**

### Opção 2: Versão Simples
```
http://localhost:8000/index-simple.html
```

### Opção 3: Versão Completa (Original)
```
http://localhost:8000/index-full.html
```

## 🎯 MECÂNICAS DE EQUILÍBRIO

### ⚡ Sistema Energético
- **Demanda**: Cresce com indústria e população
- **Renovável**: Solar/Eólica/Hidro - Limpa mas cara
- **Fóssil**: Barata mas poluente
- **Equilíbrio**: Mantenha produção = demanda

### 🌡️ Poluição
- **Fonte**: Principalmente energia fóssil e indústria
- **Efeitos**: Reduz saúde planetária, cria tempestades visuais
- **Limpeza**: Ações custosas mas necessárias
- **Crítico**: Acima de 70% = derrota iminente

### 💰 Recursos (Dinheiro)
- **Fonte**: Indústria e produção energética
- **Uso**: Expandir energia, indústria, limpeza
- **Equilíbrio**: Muito pouco = estagnação, muito = inflação

### 🏭 Indústria
- **Benefícios**: Gera recursos, impulsiona economia
- **Problemas**: Consome energia, gera poluição
- **Equilíbrio**: 20-80% é ideal, extremos causam problemas

### 🎯 Sistema de Missões
- **Sempre 3 missões ativas**: Atualizam automaticamente quando completadas
- **Recompensas em dinheiro**: Extra para investir no planeta
- **Missões progressivas**: Dificuldade aumenta com o progresso
- **Exemplos**:
  - Sobreviver 10/25/50 turnos
  - Limpar poluição 5/10 vezes
  - Construir 8 cidades
  - Acumular $2000
  - Alcançar 80% energia renovável

### 🏆 Sistema de Pontuação e Competição
- **OBJETIVO INFINITO**: O jogo não tem fim definido! O objetivo é sobreviver o máximo de turnos possível equilibrando todos os sistemas planetários.
- **SISTEMA DE PONTUAÇÃO**:
  - Ciclos sobrevividos: 10 pontos por ciclo
  - Saúde planetária: Até 200 pontos (2× saúde)
  - Cidades construídas: 50 pontos por cidade
  - Energia renovável: Até 100 pontos (% renovável)
  - Missões completadas: 25 pontos por missão
  - Bônus anti-poluição: Até 100 pontos
- **LEADERBOARD LOCAL**: Salve sua pontuação no final da partida e compare com outros jogadores no mesmo dispositivo. Top 20 melhores pontuações salvas.

## 🎨 EFEITOS VISUAIS 3D

### 🌍 Planeta Dinâmico
- **Cor**: Verde saudável → Marrom poluído
- **Atmosfera**: Azul clara → Opaca com poluição
- **Nuvens**: Rotação independente

### ✨ Partículas e Efeitos
- **Poluição**: Partículas laranja/vermelhas flutuantes
- **Energia Renovável**: Partículas verdes, aurora boreal
- **Tempestades**: Aparecem com poluição extrema
- **Luzes**: Intensidade baseada na produção energética

### 🎮 Controles
- **Mouse**: Arraste para rotacionar câmera
- **Scroll**: Zoom in/out
- **Botões**: Interface futurista com tooltips

## 🏆 CONDIÇÕES DE VITÓRIA/DERROTA

### ✅ Vitória (Versão 3D)
**OBJETIVO INFINITO**: Não há vitória final! O objetivo é sobreviver o máximo de turnos possível e obter a maior pontuação no leaderboard.

### ❌ Derrotas (Fim da Partida)
- **Saúde Zero**: Planeta inabitável devido à poluição extrema
- **Recursos Negativos**: Colapso econômico total
- **Poluição Máxima**: Catástrofe ambiental (100%)
- **Indústria Colapsada**: Abaixo de 25% - planeta não consegue se sustentar
- **Fim Voluntário**: Jogador pode terminar a partida a qualquer momento

## 🛠️ TECNOLOGIAS

- **Three.js**: Renderização 3D e efeitos visuais
- **WebGL**: Aceleração gráfica
- **ES6+**: JavaScript moderno
- **CSS3**: Interface responsiva
- **HTML5**: Estrutura semântica

## 📱 COMPATIBILIDADE

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Placas gráficas com WebGL

## 🎮 DICAS PARA INICIANTES

1. **Comece com energia renovável** para evitar poluição inicial
2. **Expanda indústria gradualmente** - não tudo de uma vez
3. **Monitore poluição** - use limpeza quando necessário
4. **Mantenha equilíbrio** - energia = demanda, indústria = 40-60%
5. **Invista em limpeza** quando poluição chegar a 40%

## 🎨 DESIGN PHILOSOPHY

### Versão 3D: "Imersão Visual"
- **Objetivo**: Tornar complexo jogo de números em experiência visual
- **Feedback**: Cada decisão tem impacto visual imediato
- **Imersão**: Jogador sente responsabilidade pelo planeta
- **Beleza**: Visualmente impressionante, educacionalmente profundo

---

**🌍 **Qual versão você vai escolher? A imersiva 3D ou as versões mais simples? Boa sorte em sua jornada de gestão planetária sustentável!** ⚡♻️**