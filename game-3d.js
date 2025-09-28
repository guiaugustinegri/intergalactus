// 🌍 PLANETA 2500 - VERSÃO 3D AVANÇADA
// Sistema complexo de equilíbrio planetário

class Planet3D {
    constructor() {
        this.gameState = {
            cycle: 1,
            resources: 1000,
            pollution: 0,
            pollutionCleaned: 0, // Contador para missões

            // Sistema Energético - AGORA CENTRAL!
            energy: {
                solar: 0,
                wind: 0,
                hydro: 0,
                fossil: 50, // Energia base
                demand: 60, // Demanda base
                efficiency: 1.0,
                growthRate: 1.15 // Demanda cresce 15% por ciclo
            },

            // Sistema Industrial - AGORA OBRIGATÓRIO PARA SOBREVIVER!
            industry: {
                level: 50, // Começa equilibrado
                minimumRequired: 25, // Mínimo para sobreviver
                efficiency: 1.0,
                pollutionModifier: 1.0,
                growthPotential: 0 // Potencial de crescimento baseado em energia
            },

            // Estado Planetário com elementos visuais
            planet: {
                health: 100,
                temperature: 20,
                atmosphere: 100,
                population: 1000000, // População em milhões
                cities: 5, // Número de cidades
                factories: 2, // Número de fábricas
                solarFarms: 0, // Fazendas solares
                windFarms: 0 // Parques eólicos
            },

            // Sistema de Missões
            missions: {
                active: [], // Sempre 3 missões ativas
                completed: 0,
                recentlyCompleted: [], // Missões completadas nos últimos 5 turnos
                appeared: [], // Todas as missões que já apareceram neste jogo
                lastTurnState: null // Estado do turno anterior para missões dinâmicas
            },

            gameOver: false,
            victory: false,
            tutorialActive: true,
            score: 0
        };

        this.init();
        this.createScene();
        this.createPlanet();
        this.createEffects();
        this.bindEvents();

        // Pequeno delay para garantir que o DOM esteja pronto
        setTimeout(() => {
            this.initializeMissions();
            this.updateUI();
            this.showTutorial();
            this.animate();
        }, 100);
    }

    init() {
        // Esconder loading
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }

        // Inicializar Three.js
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000011, 1);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        document.getElementById('container').appendChild(this.renderer.domElement);

        // Controles orbitais
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enableZoom = true;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 10;

        // Posicionar câmera
        this.camera.position.set(0, 0, 5);
        this.controls.update();
    }

    createScene() {
        // Fundo estelar
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });

        const starVertices = [];
        for (let i = 0; i < 1000; i++) {
            starVertices.push(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200
            );
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        this.stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.stars);

        // Luzes
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(5, 5, 5);
        this.directionalLight.castShadow = true;
        this.scene.add(this.directionalLight);

        // Luz de energia (dinâmica)
        this.energyLight = new THREE.PointLight(0x00ffff, 0, 10);
        this.energyLight.position.set(0, 2, 0);
        this.scene.add(this.energyLight);
    }

    createPlanet() {
        // Planeta principal
        const planetGeometry = new THREE.SphereGeometry(1, 64, 64);

        // Material com shader personalizado para atmosfera
        this.planetMaterial = new THREE.MeshPhongMaterial({
            color: 0x2a7d4a,
            shininess: 10,
            transparent: true,
            opacity: 0.9
        });

        this.planet = new THREE.Mesh(planetGeometry, this.planetMaterial);
        this.planet.receiveShadow = true;
        this.scene.add(this.planet);

        // Atmosfera externa
        const atmosphereGeometry = new THREE.SphereGeometry(1.05, 32, 32);
        this.atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        this.atmosphere = new THREE.Mesh(atmosphereGeometry, this.atmosphereMaterial);
        this.scene.add(this.atmosphere);

        // Nuvens
        const cloudGeometry = new THREE.SphereGeometry(1.02, 32, 32);
        this.cloudMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        this.clouds = new THREE.Mesh(cloudGeometry, this.cloudMaterial);
        this.scene.add(this.clouds);

        // ELEMENTOS VISUAIS DO PLANETA
        this.createPlanetElements();
    }

    createPlanetElements() {
        // Grupo para conter todos os elementos visuais
        this.planetElements = new THREE.Group();
        this.scene.add(this.planetElements);

        // Cidades (cubos azuis)
        this.cities = [];
        for (let i = 0; i < 12; i++) { // Máximo possível
            const cityGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.02);
            const cityMaterial = new THREE.MeshPhongMaterial({ color: 0x0088ff });
            const city = new THREE.Mesh(cityGeometry, cityMaterial);

            // Posicionar aleatoriamente na superfície (será atualizado)
            city.visible = false;
            this.cities.push(city);
            this.planetElements.add(city);
        }

        // Fábricas (cubos cinzas)
        this.factories = [];
        for (let i = 0; i < 8; i++) {
            const factoryGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.03, 8);
            const factoryMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
            const factory = new THREE.Mesh(factoryGeometry, factoryMaterial);

            factory.visible = false;
            this.factories.push(factory);
            this.planetElements.add(factory);
        }

        // Fazendas solares (painéis amarelos)
        this.solarFarms = [];
        for (let i = 0; i < 10; i++) {
            const solarGeometry = new THREE.PlaneGeometry(0.04, 0.04);
            const solarMaterial = new THREE.MeshPhongMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });
            const solarFarm = new THREE.Mesh(solarGeometry, solarMaterial);

            solarFarm.visible = false;
            this.solarFarms.push(solarFarm);
            this.planetElements.add(solarFarm);
        }

        // Parques eólicos (torres com hélices)
        this.windFarms = [];
        for (let i = 0; i < 8; i++) {
            const windGroup = new THREE.Group();

            // Torre
            const towerGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.04, 6);
            const towerMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const tower = new THREE.Mesh(towerGeometry, towerMaterial);
            windGroup.add(tower);

            // Hélice
            const bladeGeometry = new THREE.PlaneGeometry(0.03, 0.005);
            const bladeMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
            const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
            blade.position.y = 0.02;
            windGroup.add(blade);

            windGroup.visible = false;
            this.windFarms.push(windGroup);
            this.planetElements.add(windGroup);
        }

        // Atualizar posições iniciais
        this.updatePlanetElements();
    }

    updatePlanetElements() {
        const state = this.gameState.planet;

        // Atualizar cidades visíveis
        for (let i = 0; i < this.cities.length; i++) {
            const city = this.cities[i];
            if (i < state.cities) {
                if (!city.visible) {
                    // Nova cidade aparece
                    this.positionOnPlanet(city, true);
                    city.visible = true;

                    // Efeito de aparecimento
                    city.scale.setScalar(0.1);
                    this.animateElement(city, 1.0, 0.5);
                }
            } else {
                city.visible = false;
            }
        }

        // Atualizar fábricas
        for (let i = 0; i < this.factories.length; i++) {
            const factory = this.factories[i];
            if (i < state.factories) {
                if (!factory.visible) {
                    this.positionOnPlanet(factory, true);
                    factory.visible = true;
                    factory.scale.setScalar(0.1);
                    this.animateElement(factory, 1.0, 0.5);
                }
            } else {
                factory.visible = false;
            }
        }

        // Atualizar fazendas solares
        for (let i = 0; i < this.solarFarms.length; i++) {
            const solarFarm = this.solarFarms[i];
            if (i < state.solarFarms) {
                if (!solarFarm.visible) {
                    this.positionOnPlanet(solarFarm, false);
                    solarFarm.visible = true;
                    solarFarm.scale.setScalar(0.1);
                    this.animateElement(solarFarm, 1.0, 0.5);
                }
            } else {
                solarFarm.visible = false;
            }
        }

        // Atualizar parques eólicos
        for (let i = 0; i < this.windFarms.length; i++) {
            const windFarm = this.windFarms[i];
            if (i < state.windFarms) {
                if (!windFarm.visible) {
                    this.positionOnPlanet(windFarm, true);
                    windFarm.visible = true;
                    windFarm.scale.setScalar(0.1);
                    this.animateElement(windFarm, 1.0, 0.5);

                    // Guardar referência para animação das hélices
                    windFarm.userData.blade = windFarm.children[1];
                }
            } else {
                windFarm.visible = false;
            }
        }
    }

    positionOnPlanet(object, onSurface = true) {
        // Posicionar aleatoriamente na superfície do planeta
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = onSurface ? 1.01 : 1.005; // Ligeiramente acima da superfície

        object.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );

        // Orientar para cima (normal da superfície)
        object.lookAt(
            object.position.x * 1.1,
            object.position.y * 1.1,
            object.position.z * 1.1
        );
    }

    animateElement(element, targetScale, duration) {
        const startScale = element.scale.x;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);

            const currentScale = startScale + (targetScale - startScale) * progress;
            element.scale.setScalar(currentScale);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        animate();
    }

    createEffects() {
        // Sistema de partículas para poluição
        this.pollutionParticles = this.createParticleSystem(0xff4500, 1000);
        this.scene.add(this.pollutionParticles);

        // Sistema de partículas para energia renovável
        this.energyParticles = this.createParticleSystem(0x00ff00, 500);
        this.scene.add(this.energyParticles);

        // Aurora boreal (energia limpa)
        this.auroraGeometry = new THREE.RingGeometry(1.1, 1.3, 64);
        this.auroraMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide
        });
        this.aurora = new THREE.Mesh(this.auroraGeometry, this.auroraMaterial);
        this.aurora.rotation.x = Math.PI / 2;
        this.scene.add(this.aurora);

        // Tempestade (alta poluição)
        this.stormParticles = this.createParticleSystem(0xff0000, 2000);
        this.stormParticles.visible = false;
        this.scene.add(this.stormParticles);
    }

    createParticleSystem(color, count) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Posições aleatórias na superfície do planeta
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const radius = 1.1 + Math.random() * 0.3;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Velocidades para movimento
            velocities[i * 3] = (Math.random() - 0.5) * 0.01;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
            velocities[i * 3 + 2] = Math.random() * 0.005;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        const material = new THREE.PointsMaterial({
            color: color,
            size: 0.02,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(geometry, material);
        particles.userData.velocities = velocities;

        return particles;
    }

    bindEvents() {
        // Função auxiliar para adicionar event listener com verificação
        const addEventListenerSafe = (id, event, handler) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, handler);
            }
        };

        // Ações
        addEventListenerSafe('solar-btn', 'click', () => this.expandEnergy('solar', 200));
        addEventListenerSafe('wind-btn', 'click', () => this.expandEnergy('wind', 150));
        addEventListenerSafe('hydro-btn', 'click', () => this.expandEnergy('hydro', 300));
        addEventListenerSafe('fossil-btn', 'click', () => this.expandEnergy('fossil', 100));
        addEventListenerSafe('industry-btn', 'click', () => this.expandIndustry());
        addEventListenerSafe('cleanup-btn', 'click', () => this.cleanupPollution());

        // Próximo ciclo
        addEventListenerSafe('turn-button', 'click', () => this.nextCycle());

        // Terminar jogo voluntariamente
        addEventListenerSafe('end-game-button', 'click', () => {
            if (confirm('Tem certeza que deseja terminar o jogo? Sua pontuação será salva no leaderboard!')) {
                this.showGameOver();
            }
        });

        // Reiniciar
        addEventListenerSafe('restart-btn', 'click', () => this.restart());

        // Responsividade
        window.addEventListener('resize', () => this.onWindowResize());
    }

    expandEnergy(type, cost) {
        if (this.gameState.resources < cost) {
            this.addMessage('💰 Recursos insuficientes para expansão energética!', 'error');
            return;
        }

        this.gameState.resources -= cost;
        const capacityIncrease = type === 'fossil' ? 25 : 15;
        this.gameState.energy[type] += capacityIncrease;

        // ELEMENTOS VISUAIS: Adicionar infraestrutura baseada no tipo
        if (type === 'solar' && this.gameState.planet.solarFarms < 10) {
            this.gameState.planet.solarFarms++;
        } else if (type === 'wind' && this.gameState.planet.windFarms < 8) {
            this.gameState.planet.windFarms++;
        } else if (type === 'hydro' && this.gameState.planet.factories < 8) {
            this.gameState.planet.factories++;
        } else if (type === 'fossil' && this.gameState.planet.factories < 8) {
            this.gameState.planet.factories++;
        }

        const typeNames = {
            solar: '☀️ Energia Solar',
            wind: '💨 Energia Eólica',
            hydro: '🌊 Energia Hidro',
            fossil: '🔥 Energia Fóssil'
        };

        this.addMessage(`${typeNames[type]} expandida! +${capacityIncrease} MW e infraestrutura visual.`, 'success');
        this.updateUI();
        this.updatePlanetElements();

        // Efeito visual
        this.createExpansionEffect(type);
    }

    expandIndustry() {
        if (this.gameState.resources < 250) {
            this.addMessage('💰 Recursos insuficientes para expansão industrial!', 'error');
            return;
        }

        this.gameState.resources -= 250;
        this.gameState.industry.level = Math.min(100, this.gameState.industry.level + 15);
        this.gameState.energy.demand += 8; // Indústria aumenta demanda energética

        // ELEMENTOS VISUAIS: Adicionar fábricas e cidades
        if (this.gameState.planet.factories < 8) {
            this.gameState.planet.factories++;
        }
        if (this.gameState.planet.cities < 12 && Math.random() > 0.5) {
            this.gameState.planet.cities++;
            this.addMessage('🏙️ Nova cidade surge devido ao crescimento industrial!', 'info');
        }

        this.addMessage('🏭 Indústria expandida! +15% produção, +8 MW demanda, infraestrutura cresce.', 'success');
        this.updateUI();
        this.updatePlanetElements();
    }

    cleanupPollution() {
        if (this.gameState.resources < 150) {
            this.addMessage('💰 Recursos insuficientes para limpeza!', 'error');
            return;
        }

        this.gameState.resources -= 150;
        this.gameState.pollution = Math.max(0, this.gameState.pollution - 25);

        this.addMessage('🧹 Operação de limpeza concluída! Poluição reduzida.', 'success');
        this.updateUI();
    }

    nextCycle() {
        if (this.gameState.gameOver) return;

        // Salvar estado do turno anterior para missões dinâmicas
        this.gameState.missions.lastTurnState = {
            population: this.gameState.planet.population,
            resources: this.gameState.resources,
            energyProduction: this.calculateProduction(),
            pollution: this.gameState.pollution,
            renewableEnergy: this.gameState.energy.solar + this.gameState.energy.wind + this.gameState.energy.hydro,
            solarFarms: this.gameState.planet.solarFarms,
            windFarms: this.gameState.planet.windFarms
        };

        this.gameState.cycle++;

        // CRESCIMENTO POPULACIONAL: População cresce baseada na indústria
        const populationGrowth = Math.floor(this.gameState.industry.level * 0.05);
        this.gameState.planet.population += populationGrowth * 100000; // Em milhares

        // DEMANDA ENERGÉTICA CRESCENTE: Aumenta 15% por ciclo + crescimento populacional
        const oldDemand = this.gameState.energy.demand;
        this.gameState.energy.demand = Math.floor(oldDemand * this.gameState.energy.growthRate + populationGrowth * 2);

        // Calcular produção energética
        const production = this.calculateProduction();
        const demand = this.gameState.energy.demand;
        const energyBalance = production - demand;

        // Calcular poluição baseada na produção
        const pollutionIncrease = this.calculatePollution(production);
        this.gameState.pollution += pollutionIncrease;

        // Efeitos da indústria (AGORA OBRIGATÓRIA PARA SOBREVIVER!)
        if (this.gameState.industry.level >= this.gameState.industry.minimumRequired) {
            const industryIncome = Math.floor(this.gameState.industry.level * 0.8);
            this.gameState.resources += industryIncome;
            this.addMessage(`💼 Indústria saudável gera $${industryIncome} em receita.`, 'success');
        } else {
            // INDÚSTRIA ABAIXO DO MÍNIMO = PLANETA SOFRE!
            const penalty = Math.floor((this.gameState.industry.minimumRequired - this.gameState.industry.level) * 0.5);
            this.gameState.planet.health = Math.max(0, this.gameState.planet.health - penalty);
            this.gameState.resources = Math.max(0, this.gameState.resources - penalty * 10);
            this.addMessage(`⚠️ Indústria muito fraca! Planeta perde ${penalty} de saúde e $${penalty * 10} em recursos.`, 'error');
        }

        // Efeitos da poluição
        this.gameState.planet.health = Math.max(0, this.gameState.planet.health - (this.gameState.pollution * 0.1));
        this.gameState.planet.temperature += (this.gameState.pollution * 0.05);

        // Verificar equilíbrio
        this.checkBalance(energyBalance);

        // ELEMENTOS VISUAIS: Cidades crescem com população
        const newCitiesNeeded = Math.floor(this.gameState.planet.population / 2000000); // 2 milhões por cidade
        if (newCitiesNeeded > this.gameState.planet.cities && this.gameState.planet.cities < 12) {
            const citiesToAdd = Math.min(newCitiesNeeded - this.gameState.planet.cities, 2);
            for (let i = 0; i < citiesToAdd; i++) {
                this.gameState.planet.cities++;
                this.addMessage('🏙️ Crescimento populacional cria nova cidade!', 'info');
            }
            this.updatePlanetElements();
        }

        // Limpar missões recentemente completadas (mais de 5 turnos)
        this.gameState.missions.recentlyCompleted = this.gameState.missions.recentlyCompleted.filter(
            rc => this.gameState.cycle - rc.completedAt < 5
        );

        // Verificar missões
        this.checkMissions();

        // Verificar condições de fim
        this.checkGameEnd();

        this.updateUI();
        this.updateVisuals();
    }

    // ========== SISTEMA DE MISSÕES ==========
    initializeMissions() {
        // Banco expandido de missões dinâmicas - muito mais difíceis e variadas
        this.missionTemplates = [
            // ===== MISSÕES BÁSICAS (mais difíceis) =====
            {
                id: 'survive_10',
                title: 'Primeira Década',
                description: 'Sobreviva os primeiros 10 turnos desafiadores',
                check: (state) => state.cycle >= 10,
                reward: 150,
                type: 'survival'
            },
            {
                id: 'first_clean',
                title: 'Primeira Limpeza',
                description: 'Use a limpeza ambiental pela primeira vez',
                check: (state) => state.pollutionCleaned >= 1,
                reward: 80,
                type: 'environment'
            },
            {
                id: 'build_solar_10',
                title: 'Primeiros Raios',
                description: 'Construa pelo menos 10 MW de energia solar',
                check: (state) => state.energy.solar >= 10,
                reward: 120,
                type: 'energy'
            },
            {
                id: 'build_wind_8',
                title: 'Ventos Iniciais',
                description: 'Construa pelo menos 8 MW de energia eólica',
                check: (state) => state.energy.wind >= 8,
                reward: 100,
                type: 'energy'
            },
            {
                id: 'balance_first',
                title: 'Primeiro Equilíbrio',
                description: 'Produza pelo menos 10 MW de energia total',
                check: (state) => {
                    const production = state.energy.solar + state.energy.wind + state.energy.hydro + state.energy.fossil;
                    return production >= 10;
                },
                reward: 90,
                type: 'energy'
            },

            // ===== MISSÕES INTERMEDIÁRIAS (muito mais difíceis) =====
            {
                id: 'survive_25',
                title: 'Veterano Experiente',
                description: 'Alcance o desafiador turno 25',
                check: (state) => state.cycle >= 25,
                reward: 400,
                type: 'survival'
            },
            {
                id: 'clean_5_times',
                title: 'Ecologista Comprometido',
                description: 'Limpe a poluição ambiental 5 vezes',
                check: (state) => state.pollutionCleaned >= 5,
                reward: 300,
                type: 'environment'
            },
            {
                id: 'population_2m',
                title: 'Crescimento Sustentável',
                description: 'Alcance 2 milhões de habitantes com saúde planetária >80%',
                check: (state) => state.planet.population >= 2000000 && state.planet.health > 80,
                reward: 450,
                type: 'population'
            },
            {
                id: 'industry_40',
                title: 'Industrialização Sustentável',
                description: 'Alcance 40% de indústria sem poluição >30%',
                check: (state) => state.industry.level >= 40 && state.pollution <= 30,
                reward: 350,
                type: 'industry'
            },
            {
                id: 'renewable_60',
                title: 'Transição Energética',
                description: 'Produza 60% de energia renovável',
                check: (state) => {
                    const total = state.energy.solar + state.energy.wind + state.energy.hydro + state.energy.fossil;
                    const renewable = state.energy.solar + state.energy.wind + state.energy.hydro;
                    return total > 0 && (renewable / total) >= 0.6;
                },
                reward: 400,
                type: 'renewable'
            },
            {
                id: 'cities_6',
                title: 'Urbanização Inicial',
                description: 'Construa 6 cidades com população >1.5M',
                check: (state) => state.planet.cities >= 6 && state.planet.population >= 1500000,
                reward: 320,
                type: 'infrastructure'
            },
            {
                id: 'factories_5',
                title: 'Produção Industrial',
                description: 'Construa 5 fábricas com indústria >35%',
                check: (state) => state.planet.factories >= 5 && state.industry.level >= 35,
                reward: 380,
                type: 'industry'
            },
            {
                id: 'survive_35',
                title: 'Sobrevivente Hábil',
                description: 'Alcance o turno 35 sem game over',
                check: (state) => state.cycle >= 35,
                reward: 500,
                type: 'survival'
            },
            {
                id: 'energy_excess',
                title: 'Excedente Energético',
                description: 'Produza 25% acima da demanda energética',
                check: (state) => {
                    const production = state.energy.solar + state.energy.wind + state.energy.hydro + state.energy.fossil;
                    return production >= state.energy.demand * 1.25;
                },
                reward: 420,
                type: 'energy'
            },

            // ===== MISSÕES AVANÇADAS (ultra desafiadoras) =====
            {
                id: 'survive_50',
                title: 'Mestre da Sobrevivência',
                description: 'Alcance o mítico turno 50',
                check: (state) => state.cycle >= 50,
                reward: 800,
                type: 'survival'
            },
            {
                id: 'population_5m',
                title: 'Mega Metrópole',
                description: 'Alcance 5 milhões de habitantes com saúde >70%',
                check: (state) => state.planet.population >= 5000000 && state.planet.health >= 70,
                reward: 700,
                type: 'population'
            },
            {
                id: 'cities_8',
                title: 'Super Metrópole',
                description: 'Construa 8 cidades com população >3M',
                check: (state) => state.planet.cities >= 8 && state.planet.population >= 3000000,
                reward: 600,
                type: 'infrastructure'
            },
            {
                id: 'clean_15_times',
                title: 'Guardião Ambiental',
                description: 'Limpe a poluição ambiental 15 vezes',
                check: (state) => state.pollutionCleaned >= 15,
                reward: 650,
                type: 'environment'
            },
            {
                id: 'zero_pollution',
                title: 'Planeta Imaculado',
                description: 'Reduza poluição para 0% e mantenha por 5 turnos',
                check: (state) => state.pollution <= 0,
                reward: 1200,
                type: 'environment'
            },
            {
                id: 'renewable_master',
                title: 'Revolução Renovável',
                description: 'Produza 95% de energia renovável',
                check: (state) => {
                    const total = state.energy.solar + state.energy.wind + state.energy.hydro + state.energy.fossil;
                    const renewable = state.energy.solar + state.energy.wind + state.energy.hydro;
                    return total > 0 && (renewable / total) >= 0.95;
                },
                reward: 1000,
                type: 'renewable'
            },
            {
                id: 'resources_4000',
                title: 'Magnata Planetário',
                description: 'Acumule $4000 em recursos',
                check: (state) => state.resources >= 4000,
                reward: 550,
                type: 'wealth'
            },
            {
                id: 'factories_12',
                title: 'Império Industrial',
                description: 'Construa 12 fábricas com indústria >60%',
                check: (state) => state.planet.factories >= 12 && state.industry.level >= 60,
                reward: 750,
                type: 'industry'
            },
            {
                id: 'energy_independence',
                title: 'Independência Energética',
                description: 'Produza 200% da demanda sem energia fóssil',
                check: (state) => {
                    const renewable = state.energy.solar + state.energy.wind + state.energy.hydro;
                    return renewable >= state.energy.demand * 2;
                },
                reward: 900,
                type: 'renewable'
            },
            {
                id: 'population_health',
                title: 'Harmonia Populacional',
                description: '8 milhões de habitantes com saúde planetária >85%',
                check: (state) => state.planet.population >= 8000000 && state.planet.health >= 85,
                reward: 850,
                type: 'population'
            },

            // ===== MISSÕES ÉPICAS (extremamente difíceis) =====
            {
                id: 'survive_100',
                title: 'Lenda Imortal',
                description: 'Alcance o lendário turno 100',
                check: (state) => state.cycle >= 100,
                reward: 2000,
                type: 'survival'
            },
            {
                id: 'population_15m',
                title: 'Superpopulação Sustentável',
                description: 'Alcance 15 milhões de habitantes com saúde >75%',
                check: (state) => state.planet.population >= 15000000 && state.planet.health >= 75,
                reward: 1500,
                type: 'population'
            },
            {
                id: 'cities_20',
                title: 'Mega Polis Global',
                description: 'Construa 20 cidades com população >10M',
                check: (state) => state.planet.cities >= 20 && state.planet.population >= 10000000,
                reward: 1200,
                type: 'infrastructure'
            },
            {
                id: 'clean_35_times',
                title: 'Arcanjo Ambiental',
                description: 'Limpe a poluição ambiental 35 vezes',
                check: (state) => state.pollutionCleaned >= 35,
                reward: 1300,
                type: 'environment'
            },
            {
                id: 'perfect_harmony',
                title: 'Harmonia Perfeita',
                description: '100% renovável, 0% poluição, 15M população, 100% saúde',
                check: (state) => {
                    const total = state.energy.solar + state.energy.wind + state.energy.hydro + state.energy.fossil;
                    const renewable = state.energy.solar + state.energy.wind + state.energy.hydro;
                    return state.pollution <= 0 && state.planet.population >= 15000000 &&
                           state.planet.health >= 100 && (renewable / total) >= 1.0;
                },
                reward: 3500,
                type: 'legendary'
            },
            {
                id: 'infinite_sustainability',
                title: 'Sustentabilidade Infinita',
                description: 'Produza 300% da demanda, 0 poluição, 20M população',
                check: (state) => {
                    const production = state.energy.solar + state.energy.wind + state.energy.hydro + state.energy.fossil;
                    return production >= state.energy.demand * 3 && state.pollution <= 0 &&
                           state.planet.population >= 20000000;
                },
                reward: 2800,
                type: 'legendary'
            },
            {
                id: 'resources_10000',
                title: 'Tesouro Planetário',
                description: 'Acumule $10000 em recursos',
                check: (state) => state.resources >= 10000,
                reward: 1200,
                type: 'wealth'
            },
            {
                id: 'factories_20',
                title: 'Império Cósmico',
                description: 'Construa 20 fábricas com indústria >80%',
                check: (state) => state.planet.factories >= 20 && state.industry.level >= 80,
                reward: 1100,
                type: 'industry'
            },

            // ===== MISSÕES REPETIBILIDADE (podem aparecer novamente) =====
            {
                id: 'energy_boost',
                title: 'Impulso Energético',
                description: 'Produza 50% acima da demanda por 3 turnos consecutivos',
                check: (state) => {
                    const production = state.energy.solar + state.energy.wind + state.energy.hydro + state.energy.fossil;
                    return production >= state.energy.demand * 1.5;
                },
                reward: 250,
                type: 'energy'
            },
            {
                id: 'pollution_control',
                title: 'Controle de Poluição',
                description: 'Mantenha poluição abaixo de 20% por 5 turnos',
                check: (state) => state.pollution <= 20,
                reward: 300,
                type: 'environment'
            },
            {
                id: 'population_growth',
                title: 'Crescimento Populacional',
                description: 'Alcance população de 3 milhões',
                check: (state) => state.planet.population >= 3000000,
                reward: 350,
                type: 'population'
            },
            {
                id: 'industry_efficiency',
                title: 'Eficiência Industrial',
                description: 'Alcance 50% de eficiência industrial',
                check: (state) => state.industry.efficiency >= 0.5,
                reward: 400,
                type: 'industry'
            },
            {
                id: 'renewable_push',
                title: 'Transição Renovável',
                description: 'Alcance 70% de energia renovável',
                check: (state) => {
                    const total = state.energy.solar + state.energy.wind + state.energy.hydro + state.energy.fossil;
                    const renewable = state.energy.solar + state.energy.wind + state.energy.hydro;
                    return total > 0 && (renewable / total) >= 0.7;
                },
                reward: 450,
                type: 'renewable'
            },
            {
                id: 'energy_surge',
                title: 'Surto Energético',
                description: 'Produza 100% acima da demanda em um turno',
                check: (state) => {
                    const production = state.energy.solar + state.energy.wind + state.energy.hydro + state.energy.fossil;
                    return production >= state.energy.demand * 2;
                },
                reward: 300,
                type: 'energy'
            },
        ];

        // Começar com 3 missões aleatórias
        this.refreshMissions();
    }

    refreshMissions() {
        // Manter sempre 3 missões ativas baseadas no progresso atual
        while (this.gameState.missions.active.length < 3) {
            // Filtrar missões apropriadas para o nível atual
            const appropriateMissions = this.missionTemplates.filter(template => {
                // Verificar se já está ativa atualmente
                const isActive = this.gameState.missions.active.some(active => active.id === template.id);
                if (isActive) {
                    return false; // Não pode ter a mesma missão ativa duas vezes
                }

                // Missões repetíveis sempre disponíveis (podem aparecer em qualquer nível)
                const repeatableMissions = ['energy_boost', 'pollution_control', 'population_growth', 'industry_efficiency', 'renewable_push', 'energy_surge'];

                if (repeatableMissions.includes(template.id)) {
                    // Missões repetíveis só podem aparecer se não foram completadas recentemente
                    const recentlyCompleted = this.gameState.missions.recentlyCompleted.find(rc => rc.id === template.id);
                    return !(recentlyCompleted && this.gameState.cycle - recentlyCompleted.completedAt < 5);
                } else {
                    // Missões únicas só podem aparecer uma vez por jogo
                    const alreadyAppeared = this.gameState.missions.appeared.includes(template.id);
                    if (alreadyAppeared) {
                        return false;
                    }

                    // Verificar se já foi completada recentemente (não pode repetir nos últimos 5 turnos)
                    const recentlyCompleted = this.gameState.missions.recentlyCompleted.find(rc => rc.id === template.id);
                    if (recentlyCompleted && this.gameState.cycle - recentlyCompleted.completedAt < 5) {
                        return false;
                    }
                }

                // Filtrar por nível de progresso
                const cycle = this.gameState.cycle;

                if (cycle < 5) {
                    // Missões básicas
                    return ['survive_10', 'first_clean', 'build_solar_10', 'build_wind_8', 'balance_first'].includes(template.id);
                } else if (cycle < 20) {
                    // Missões intermediárias
                    return ['survive_25', 'clean_5_times', 'population_2m', 'industry_40', 'renewable_60', 'cities_6', 'factories_5', 'survive_35', 'energy_excess'].includes(template.id);
                } else if (cycle < 40) {
                    // Missões avançadas
                    return ['survive_50', 'population_5m', 'cities_8', 'clean_15_times', 'zero_pollution', 'renewable_master', 'resources_4000', 'factories_12', 'energy_independence', 'population_health'].includes(template.id);
                } else if (cycle < 80) {
                    // Missões épicas
                    return ['survive_100', 'population_15m', 'cities_20', 'clean_35_times'].includes(template.id);
                } else {
                    // Missões lendárias (ultra raras)
                    return ['perfect_harmony', 'infinite_sustainability', 'resources_10000', 'factories_20'].includes(template.id);
                }
            });

            if (appropriateMissions.length > 0) {
                const randomMission = appropriateMissions[Math.floor(Math.random() * appropriateMissions.length)];

                // Adicionar à lista de missões que já apareceram (só para missões únicas)
                const repeatableMissions = ['energy_boost', 'pollution_control', 'population_growth', 'industry_efficiency', 'renewable_push', 'energy_surge'];
                if (!repeatableMissions.includes(randomMission.id)) {
                    if (!this.gameState.missions.appeared.includes(randomMission.id)) {
                        this.gameState.missions.appeared.push(randomMission.id);
                    }
                }

                this.gameState.missions.active.push({
                    ...randomMission,
                    progress: 0,
                    completed: false
                });
            } else {
                break; // Não há missões apropriadas disponíveis
            }
        }

        this.updateMissionsUI();
    }

    checkMissions() {
        let completedCount = 0;

        this.gameState.missions.active.forEach(mission => {
            if (!mission.completed && mission.check(this.gameState)) {
                mission.completed = true;
                this.gameState.resources += mission.reward;
                this.gameState.missions.completed++;
                completedCount++;

                // Adicionar à lista de missões recentemente completadas
                this.gameState.missions.recentlyCompleted.push({
                    id: mission.id,
                    completedAt: this.gameState.cycle
                });

                // Mostrar notificação visual dramática
                this.showMissionCompleteNotification(mission);

                this.addMessage(`🎯 MISSÃO COMPLETA: "${mission.title}"! +$${mission.reward} extra!`, 'success');
            }
        });

        // Remover missões completadas e adicionar novas
        this.gameState.missions.active = this.gameState.missions.active.filter(mission => !mission.completed);
        if (completedCount > 0) {
            this.refreshMissions();
        }

        return completedCount;
    }

    // ========== NOTIFICAÇÃO DE MISSÃO CONCLUÍDA ==========
    showMissionCompleteNotification(mission) {
        const notification = document.getElementById('mission-notification');
        const rewardText = document.querySelector('.mission-reward-text');

        if (notification && rewardText) {
            rewardText.textContent = `+$${mission.reward} RECURSOS!`;

            notification.classList.add('show');

            // Remover a classe após a animação
            setTimeout(() => {
                notification.classList.remove('show');
            }, 2000);
        }
    }

    updateMissionsUI() {
        const missionsList = document.getElementById('missions-list');
        if (!missionsList) return;

        missionsList.innerHTML = '';

        if (this.gameState.missions.active.length === 0) {
            missionsList.innerHTML = '<div style="color: #666; font-style: italic; padding: 10px;">Nenhuma missão ativa</div>';
            return;
        }

        this.gameState.missions.active.forEach((mission, index) => {
            const missionDiv = document.createElement('div');
            missionDiv.className = `mission-item ${mission.completed ? 'completed' : ''}`;

            missionDiv.innerHTML = `
                <div class="mission-title">${mission.title}</div>
                <div class="mission-description">${mission.description}</div>
                <div class="mission-reward">$${mission.reward}</div>
            `;

            missionsList.appendChild(missionDiv);
        });
    }

    // ========== SISTEMA DE TUTORIAL ==========
    showTutorial() {
        if (!this.gameState.tutorialActive) return;

        const tutorialModal = document.getElementById('tutorial-modal');
        if (tutorialModal) {
            tutorialModal.classList.remove('hidden');
            this.showTutorialStep('intro');

            // Bind tutorial buttons
            document.querySelectorAll('.tutorial-next-btn').forEach(btn => {
                btn.addEventListener('click', () => this.nextTutorialStep());
            });

            const startBtn = document.getElementById('start-game-btn');
            if (startBtn) {
                startBtn.addEventListener('click', () => this.startGame());
            }
        }
    }

    showTutorialStep(step) {
        // Hide all steps
        document.querySelectorAll('.tutorial-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Show current step
        document.getElementById(`tutorial-${step}`).classList.remove('hidden');
    }

    nextTutorialStep() {
        const steps = ['intro', 'energy', 'industry', 'pollution', 'missions'];
        const currentStepIndex = steps.findIndex(step =>
            !document.getElementById(`tutorial-${step}`).classList.contains('hidden')
        );

        if (currentStepIndex < steps.length - 1) {
            this.showTutorialStep(steps[currentStepIndex + 1]);
        }
    }

    startGame() {
        document.getElementById('tutorial-modal').classList.add('hidden');
        this.gameState.tutorialActive = false;
        this.addMessage('🚀 Sistema Planetário 2500 ativado! Boa sorte, Guardião!', 'success');
    }

    // ========== SISTEMA DE LEADERBOARD ==========
    calculateScore() {
        const state = this.gameState;

        // Pontuação baseada em múltiplos fatores
        const cycleScore = state.cycle * 10; // 10 pontos por ciclo
        const healthScore = Math.floor(state.planet.health * 2); // Até 200 pontos
        const cityScore = state.planet.cities * 50; // 50 pontos por cidade
        const renewableScore = Math.floor(
            ((state.energy.solar + state.energy.wind + state.energy.hydro) /
              (state.energy.solar + state.energy.wind + state.energy.hydro + state.energy.fossil || 1)) * 100
        ); // Até 100 pontos
        const missionScore = state.missions.completed * 25; // 25 pontos por missão
        const pollutionPenalty = Math.max(0, 100 - state.pollution); // Penalty por poluição

        return cycleScore + healthScore + cityScore + renewableScore + missionScore + pollutionPenalty;
    }

    showGameOver() {
        this.gameState.score = this.calculateScore();

        document.getElementById('modal-title').textContent = '🎯 FIM DA PARTIDA';

        // Score breakdown
        const breakdown = document.getElementById('score-breakdown');
        breakdown.innerHTML = `
            <div>Ciclos sobrevividos: ${this.gameState.cycle} × 10 = ${this.gameState.cycle * 10} pts</div>
            <div>Saúde planetária: ${Math.floor(this.gameState.planet.health)} × 2 = ${Math.floor(this.gameState.planet.health * 2)} pts</div>
            <div>Cidades construídas: ${this.gameState.planet.cities} × 50 = ${this.gameState.planet.cities * 50} pts</div>
            <div>Energia renovável: ${Math.floor(((this.gameState.energy.solar + this.gameState.energy.wind + this.energy.hydro) / (this.gameState.energy.solar + this.gameState.energy.wind + this.gameState.energy.hydro + this.gameState.energy.fossil || 1)) * 100)} pts</div>
            <div>Missões completadas: ${this.gameState.missions.completed} × 25 = ${this.gameState.missions.completed * 25} pts</div>
            <div>Bônus anti-poluição: ${Math.max(0, 100 - this.gameState.pollution)} pts</div>
        `;

        document.getElementById('final-score-value').textContent = `${this.gameState.score} pontos`;

        // Leaderboard
        this.loadLeaderboard();

        document.getElementById('game-modal').classList.add('show');

        // Bind leaderboard buttons
        document.getElementById('save-score-btn').addEventListener('click', () => this.saveScore());
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
    }

    loadLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem('planet2500_leaderboard') || '[]');
        const list = document.getElementById('leaderboard-list');

        leaderboard
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .forEach((entry, index) => {
                const div = document.createElement('div');
                div.className = 'leaderboard-entry';
                div.innerHTML = `
                    <span class="leaderboard-rank">#${index + 1}</span>
                    <span class="leaderboard-name">${entry.name}</span>
                    <span class="leaderboard-score">${entry.score}</span>
                `;
                list.appendChild(div);
            });
    }

    saveScore() {
        const playerName = document.getElementById('player-name').value.trim();
        if (!playerName) {
            alert('Por favor, digite seu nome!');
            return;
        }

        const leaderboard = JSON.parse(localStorage.getItem('planet2500_leaderboard') || '[]');

        leaderboard.push({
            name: playerName,
            score: this.gameState.score,
            cycles: this.gameState.cycle,
            date: new Date().toISOString()
        });

        // Manter apenas top 20
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard.splice(20);

        localStorage.setItem('planet2500_leaderboard', JSON.stringify(leaderboard));

        // Reload leaderboard
        document.getElementById('leaderboard-list').innerHTML = '';
        this.loadLeaderboard();

        document.getElementById('save-score-btn').textContent = '✅ SALVO!';
        document.getElementById('save-score-btn').disabled = true;
    }

    calculateProduction() {
        let total = 0;
        const sources = ['solar', 'wind', 'hydro', 'fossil'];

        sources.forEach(source => {
            const capacity = this.gameState.energy[source];
            let efficiency = 1.0;

            // Penalidades ambientais
            if (source !== 'fossil') {
                efficiency -= (this.gameState.pollution / 200); // Poluição reduz eficiência renovável
            }

            total += capacity * efficiency;
        });

        return Math.floor(total);
    }

    calculatePollution(production) {
        // Poluição baseada na produção fóssil vs total
        const fossilRatio = this.gameState.energy.fossil / (this.gameState.energy.solar + this.gameState.energy.wind + this.gameState.energy.hydro + this.gameState.energy.fossil);
        const basePollution = production * 0.1 * fossilRatio;

        // Indústria adiciona poluição
        const industryPollution = this.gameState.industry.level * 0.05;

        return Math.floor(basePollution + industryPollution);
    }

    checkBalance(energyBalance) {
        if (energyBalance < -20) {
            this.gameState.industry.efficiency *= 0.9; // Indústria sofre com falta de energia
            this.addMessage('⚠️ Déficit energético crítico! Indústria afetada.', 'error');
        } else if (energyBalance > 10) {
            this.gameState.industry.efficiency = Math.min(1.0, this.gameState.industry.efficiency + 0.05);
            this.addMessage('⚡ Excedente energético! Indústria otimizada.', 'success');
        }

        // Indústria muito baixa ou muito alta causa problemas
        if (this.gameState.industry.level < 20) {
            this.gameState.resources -= 50; // Economia fraca
            this.addMessage('📉 Indústria muito baixa! Economia enfraquecida.', 'warning');
        } else if (this.gameState.industry.level > 80) {
            this.gameState.pollution += 10; // Alta poluição industrial
            this.addMessage('🏭 Indústria em alta! Poluição industrial aumenta.', 'warning');
        }
    }

    checkGameEnd() {
        // NÃO HÁ VITÓRIA - O JOGO CONTINUA INFINITAMENTE!
        // Apenas condições de derrota

        if (this.gameState.planet.health <= 0) {
            this.showGameOver('💔 Planeta tornou-se inabitável devido à poluição extrema.');
        } else if (this.gameState.resources < 0) {
            this.showGameOver('💸 Recursos esgotados. Sistema econômico colapsou.');
        } else if (this.gameState.pollution >= 100) {
            this.showGameOver('☠️ Poluição atingiu níveis catastróficos.');
        } else if (this.gameState.industry.level < this.gameState.industry.minimumRequired) {
            this.showGameOver('🏭 Indústria muito fraca! O planeta não consegue se sustentar.');
        }
    }

    showGameOver(reason = null) {
        this.gameState.gameOver = true;

        const modalTitle = document.getElementById('modal-title');
        const modalMessage = document.getElementById('modal-message');

        if (reason) {
            // Derrota
            if (modalTitle) modalTitle.textContent = '💥 SISTEMA COMPROMETIDO';
            if (modalMessage) modalMessage.textContent =
                `Missão fracassada no ciclo ${this.gameState.cycle}.\n\n` +
                `${reason}\n\n` +
                `Você sobreviveu ${this.gameState.cycle} ciclos!\n\n` +
                `Que desempenho incrível! Agora salve sua pontuação no leaderboard.`;
        } else {
            // Fim voluntário (não implementado ainda)
            if (modalTitle) modalTitle.textContent = '🎯 FIM DA PARTIDA';
            if (modalMessage) modalMessage.textContent =
                `Você sobreviveu ${this.gameState.cycle} ciclos!\n\n` +
                `Que desempenho incrível! Agora salve sua pontuação no leaderboard.`;
        }

        this.showGameOverModal();
    }

    showGameOverModal() {
        this.gameState.score = this.calculateScore();

        const modalTitle = document.getElementById('modal-title');
        if (modalTitle) modalTitle.textContent = '🎯 FIM DA PARTIDA';

        // Score breakdown
        const breakdown = document.getElementById('score-breakdown');
        if (breakdown) {
            breakdown.innerHTML = `
                <div>Ciclos sobrevividos: ${this.gameState.cycle} × 10 = ${this.gameState.cycle * 10} pts</div>
                <div>Saúde planetária: ${Math.floor(this.gameState.planet.health)} × 2 = ${Math.floor(this.gameState.planet.health * 2)} pts</div>
                <div>Cidades construídas: ${this.gameState.planet.cities} × 50 = ${this.gameState.planet.cities * 50} pts</div>
                <div>Energia renovável: ${Math.floor(((this.gameState.energy.solar + this.gameState.energy.wind + this.gameState.energy.hydro) / (this.gameState.energy.solar + this.gameState.energy.wind + this.gameState.energy.hydro + this.gameState.energy.fossil || 1)) * 100)} pts</div>
                <div>Missões completadas: ${this.gameState.missions.completed} × 25 = ${this.gameState.missions.completed * 25} pts</div>
                <div>Bônus anti-poluição: ${Math.max(0, 100 - this.gameState.pollution)} pts</div>
            `;
        }

        const finalScoreValue = document.getElementById('final-score-value');
        if (finalScoreValue) finalScoreValue.textContent = `${this.gameState.score} pontos`;

        // Leaderboard
        this.loadLeaderboard();

        const gameModal = document.getElementById('game-modal');
        if (gameModal) gameModal.classList.add('show');

        // Bind leaderboard buttons
        const saveScoreBtn = document.getElementById('save-score-btn');
        if (saveScoreBtn) saveScoreBtn.addEventListener('click', () => this.saveScore());

        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) restartBtn.addEventListener('click', () => this.restart());
    }

    updateUI() {
        const production = this.calculateProduction();
        const demand = this.gameState.energy.demand;
        const energyBalance = production - demand;

        // Indicadores principais com BALANÇO ENERGÉTICO CRÍTICO
        const energyIndicator = document.getElementById('energy-indicator');
        if (energyIndicator) energyIndicator.textContent = `${production}/${demand} MW`;

        // Indicador de balanço energético
        const balanceElement = document.getElementById('energy-balance');
        if (balanceElement) {
            if (energyBalance >= 0) {
                balanceElement.textContent = `Excedente: +${energyBalance} MW`;
                balanceElement.style.color = '#00ff00';
            } else {
                balanceElement.textContent = `Déficit: ${energyBalance} MW`;
                balanceElement.style.color = '#ff4444';
            }
        }

        const pollutionIndicator = document.getElementById('pollution-indicator');
        if (pollutionIndicator) pollutionIndicator.textContent = `${this.gameState.pollution.toFixed(1)}%`;

        const resourcesIndicator = document.getElementById('resources-indicator');
        if (resourcesIndicator) resourcesIndicator.textContent = `$${this.gameState.resources}`;

        const industryIndicator = document.getElementById('industry-indicator');
        if (industryIndicator) industryIndicator.textContent = `${this.gameState.industry.level.toFixed(1)}%`;

        // Indicadores adicionais
        const healthIndicator = document.getElementById('health-indicator');
        if (healthIndicator) healthIndicator.textContent = `Saúde: ${this.gameState.planet.health.toFixed(1)}%`;

        const populationIndicator = document.getElementById('population-indicator');
        if (populationIndicator) populationIndicator.textContent = `Pop: ${(this.gameState.planet.population / 1000000).toFixed(1)}M`;

        // Destaque visual para indicadores críticos
        this.updateIndicatorStyles(production, demand, this.gameState.industry.level);

        // Fontes de energia
        const solarValue = document.getElementById('solar-value');
        if (solarValue) solarValue.textContent = `${this.gameState.energy.solar} MW`;

        const windValue = document.getElementById('wind-value');
        if (windValue) windValue.textContent = `${this.gameState.energy.wind} MW`;

        const hydroValue = document.getElementById('hydro-value');
        if (hydroValue) hydroValue.textContent = `${this.gameState.energy.hydro} MW`;

        const fossilValue = document.getElementById('fossil-value');
        if (fossilValue) fossilValue.textContent = `${this.gameState.energy.fossil} MW`;

        // Totais
        const demandValue = document.getElementById('demand-value');
        if (demandValue) demandValue.textContent = `${demand} MW`;

        const productionValue = document.getElementById('production-value');
        if (productionValue) productionValue.textContent = `${production} MW`;

        // Atualizar botões
        this.updateButtons();

        // Atualizar missões
        this.updateMissionsUI();
    }

    updateIndicatorStyles(production, demand, industryLevel) {
        const energyIndicator = document.getElementById('energy-indicator');
        const industryIndicator = document.getElementById('industry-indicator');

        // Destaque para déficit energético
        if (energyIndicator) {
            if (production < demand) {
                energyIndicator.classList.add('critical');
            } else {
                energyIndicator.classList.remove('critical');
            }
        }

        // Destaque para indústria abaixo do mínimo
        if (industryIndicator) {
            if (industryLevel < this.gameState.industry.minimumRequired) {
                industryIndicator.classList.add('warning');
                industryIndicator.style.color = '#ff4444';
            } else {
                industryIndicator.classList.remove('warning');
                industryIndicator.style.color = '#00ffff';
            }
        }
    }

    updateButtons() {
        const buttons = [
            { id: 'solar-btn', cost: 200 },
            { id: 'wind-btn', cost: 150 },
            { id: 'hydro-btn', cost: 300 },
            { id: 'fossil-btn', cost: 100 },
            { id: 'industry-btn', cost: 250 },
            { id: 'cleanup-btn', cost: 150 }
        ];

        buttons.forEach(btn => {
            const element = document.getElementById(btn.id);
            element.disabled = this.gameState.resources < btn.cost;
        });
    }

    updateVisuals() {
        // Atualizar cor do planeta baseada na saúde
        const healthRatio = this.gameState.planet.health / 100;
        const pollutionRatio = this.gameState.pollution / 100;

        // Misturar cores baseado no estado
        const healthyColor = new THREE.Color(0x2a7d4a); // Verde saudável
        const pollutedColor = new THREE.Color(0x8b4513); // Marrom poluído
        const finalColor = healthyColor.clone().lerp(pollutedColor, pollutionRatio);

        this.planetMaterial.color = finalColor;

        // Atualizar atmosfera
        this.atmosphereMaterial.opacity = Math.max(0.05, 0.2 - (pollutionRatio * 0.15));

        // Partículas de poluição
        this.pollutionParticles.material.opacity = Math.min(0.8, pollutionRatio * 2);

        // Energia renovável - aurora
        const renewableRatio = (this.gameState.energy.solar + this.gameState.energy.wind + this.gameState.energy.hydro) /
                              (this.gameState.energy.solar + this.gameState.energy.wind + this.gameState.energy.hydro + this.gameState.energy.fossil);

        this.auroraMaterial.opacity = renewableRatio * 0.3;
        this.energyLight.intensity = renewableRatio * 2;

        // Partículas de energia
        this.energyParticles.material.opacity = renewableRatio * 0.5;

        // Tempestade de poluição
        this.stormParticles.visible = this.gameState.pollution > 70;
        if (this.stormParticles.visible) {
            this.stormParticles.material.opacity = (this.gameState.pollution - 70) / 30;
        }
    }

    createExpansionEffect(type) {
        // Efeito visual de expansão
        const colors = {
            solar: 0xffff00,
            wind: 0x00ff00,
            hydro: 0x0088ff,
            fossil: 0xff4400
        };

        // Criar flash de luz
        const flashLight = new THREE.PointLight(colors[type], 5, 20);
        flashLight.position.set(0, 0, 1.5);
        this.scene.add(flashLight);

        // Remover após animação
        setTimeout(() => {
            this.scene.remove(flashLight);
        }, 500);
    }

    addMessage(text, type = 'info') {
        const container = document.getElementById('messages-container');
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;

        container.appendChild(message);
        container.scrollTop = container.scrollHeight;

        // Limitar mensagens
        while (container.children.length > 8) {
            container.removeChild(container.firstChild);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotação do planeta
        if (this.planet) {
            this.planet.rotation.y += 0.002;
        }

        // Rotação das nuvens (mais rápida)
        if (this.clouds) {
            this.clouds.rotation.y += 0.003;
        }

        // Animação das estrelas
        if (this.stars) {
            this.stars.rotation.y += 0.0005;
        }

        // Animação de partículas
        this.animateParticles(this.pollutionParticles);
        this.animateParticles(this.energyParticles);
        this.animateParticles(this.stormParticles);

        // Aurora pulsante
        if (this.aurora) {
            this.aurora.rotation.z += 0.01;
        }

        // Animação das hélices dos parques eólicos
        this.windFarms.forEach(windFarm => {
            if (windFarm.visible && windFarm.userData.blade) {
                windFarm.userData.blade.rotation.z += 0.1; // Rápido para simular vento
            }
        });

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    animateParticles(particles) {
        if (!particles.visible) return;

        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.geometry.attributes.velocity.array;

        for (let i = 0; i < positions.length; i += 3) {
            // Atualizar posições
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];

            // Manter partículas próximas ao planeta
            const distance = Math.sqrt(positions[i]**2 + positions[i+1]**2 + positions[i+2]**2);
            if (distance > 2) {
                // Reposicionar aleatoriamente
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const radius = 1.1 + Math.random() * 0.3;

                positions[i] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i + 2] = radius * Math.cos(phi);
            }
        }

        particles.geometry.attributes.position.needsUpdate = true;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    restart() {
        // Reset completo do jogo
        this.gameState = {
            cycle: 1,
            resources: 1000,
            pollution: 0,
            pollutionCleaned: 0, // Reset contador

            energy: {
                solar: 0,
                wind: 0,
                hydro: 0,
                fossil: 50,
                demand: 60,
                efficiency: 1.0,
                growthRate: 1.15
            },

            industry: {
                level: 50,
                minimumRequired: 25,
                efficiency: 1.0,
                pollutionModifier: 1.0,
                growthPotential: 0
            },

            planet: {
                health: 100,
                temperature: 20,
                atmosphere: 100,
                population: 1000000,
                cities: 5,
                factories: 2,
                solarFarms: 0,
                windFarms: 0
            },

            missions: {
                active: [], // Reset missões
                completed: 0
            },

            gameOver: false,
            victory: false,
            tutorialActive: true,
            score: 0
        };

        // Resetar elementos visuais do planeta
        this.cities.forEach(city => { city.visible = false; });
        this.factories.forEach(factory => { factory.visible = false; });
        this.solarFarms.forEach(farm => { farm.visible = false; });
        this.windFarms.forEach(farm => { farm.visible = false; });

        // Reinicializar missões
        this.initializeMissions();
        this.showTutorial();

        const gameModal = document.getElementById('game-modal');
        if (gameModal) gameModal.classList.remove('show');

        // Limpar mensagens
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="message info">🌍 Sistema Planetário 2500 reinicializado.</div>
                <div class="message info">⚡ Matriz energética recalibrada.</div>
                <div class="message warning">⚠️ Novos desafios ambientais detectados.</div>
            `;
        }

        this.updateUI();
        this.updateVisuals();
    }
}

// Inicializar jogo quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando jogo 3D...');
    try {
        new Planet3D();
        console.log('Jogo 3D inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar jogo 3D:', error);
        alert('Erro ao inicializar o jogo: ' + error.message);
    }
});

// Fallback para navegadores que já carregaram
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        if (!window.planetGameInstance) {
            console.log('Fallback: inicializando jogo 3D...');
            try {
                window.planetGameInstance = new Planet3D();
                console.log('Jogo 3D inicializado via fallback!');
            } catch (error) {
                console.error('Erro no fallback do jogo 3D:', error);
            }
        }
    }, 100);
}

