/**
 * PROJETO: Aquário Virtual - Sistema de Monitoramento IoT
 * AUTOR: Antigravity AI
 * 
 * Este script lida com a conexão ao Firebase (ou simulação local), o cálculo da
 * faixa ideal de temperatura para todos os peixes, os alertas visuais e a 
 * movimentação física (nado) dos peixes no aquário virtual da tela.
 */

// =========================================================================
// 1. CONFIGURAÇÕES DO FIREBASE (Configure suas credenciais aqui ou pelo painel do site)
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyBzyjSjjSbRH9iMMSMcj9DiRtYbsa2AHEU",
  authDomain: "aquariovirtual-3caae.firebaseapp.com",
  databaseURL: "https://aquariovirtual-3caae-default-rtdb.firebaseio.com",
  projectId: "aquariovirtual-3caae",
  storageBucket: "aquariovirtual-3caae.firebasestorage.app",
  messagingSenderId: "8454408204",
  appId: "1:8454408204:web:7da39d2a6e33dd57980629",
  measurementId: "G-132KNHH181"
};

// =========================================================================
// 2. ESTADO GLOBAL DA APLICAÇÃO
// =========================================================================
let firebaseApp = null;
let database = null;
let isSimulationMode = false;
let currentConfig = null;

let currentTemperature = 25.0;
let registeredFishList = []; // Peixes ativos no aquário
let availableSpecies = {};   // Catálogo global de espécies carregado do Firebase ou Mock
let swimmingFishObjects = []; // Guarda dados físicos dos peixes nadando (x, y, targetX, targetY, velocidade, etc.)
let animationFrameId = null;

// Catálogo de espécies padrão usado para simulação ou como fallback inicial
const MOCK_SPECIES_DEFAULTS = {
  "neon_tetra": {
    name: "Neon Tetra",
    minTemp: 22,
    maxTemp: 26,
    ph: 6.5,
    origin: "Bacia Amazônica, América do Sul",
    curiosity: "Eles adoram viver em cardumes e brilham intensamente sob luz fraca para se manterem unidos.",
    image: "images/neon_tetra.png"
  },
  "acara_disco": {
    name: "Acará-Disco",
    minTemp: 26,
    maxTemp: 30,
    ph: 6.0,
    origin: "Rio Amazonas, América do Sul",
    curiosity: "Conhecidos como os 'reis do aquário' devido ao seu comportamento elegante e cores vibrantes.",
    image: "images/acara_disco.png"
  },
  "guppy": {
    name: "Guppy (Lebiste)",
    minTemp: 22,
    maxTemp: 28,
    ph: 7.2,
    origin: "América Central e do Sul",
    curiosity: "São peixes extremamente ativos, adaptáveis e fáceis de reproduzir no aquário.",
    image: "images/guppy.png"
  },
  "peixe_palhaco": {
    name: "Peixe Palhaço",
    minTemp: 24,
    maxTemp: 28,
    ph: 8.2,
    origin: "Recife de Coral, Indo-Pacífico",
    curiosity: "Todos os peixes-palhaço nascem machos e têm a capacidade de mudar seu sexo para fêmea.",
    image: "images/peixe_palhaco.png"
  },
  "kinguio": {
    name: "Kinguio (Peixinho Dourado)",
    minTemp: 18,
    maxTemp: 24,
    ph: 7.4,
    origin: "Ásia Oriental",
    curiosity: "Eles têm uma memória excelente que pode durar meses, contrariando o mito dos 3 segundos.",
    image: "images/kinguio.png"
  }
};

// =========================================================================
// 3. SELETORES DOM
// =========================================================================
const currentTempEl = document.getElementById('currentTemp');
const tempBadgeEl = document.getElementById('tempBadge');
const tempBadgeValEl = document.querySelector('.temp-badge-val');
const tempStatusEl = document.getElementById('tempStatus');
const lastUpdatedEl = document.getElementById('lastUpdated');
const minSafeTempEl = document.getElementById('minSafeTemp');
const maxSafeTempEl = document.getElementById('maxSafeTemp');
const safeRangeBarEl = document.getElementById('safeRangeBar');
const tempPointerEl = document.getElementById('tempPointer');
const rangeDescriptionEl = document.getElementById('rangeDescription');
const fishGridEl = document.getElementById('fishGrid');
const emptyStateEl = document.getElementById('emptyState');
const connectionStatusEl = document.getElementById('connectionStatus');
const alertBannerEl = document.getElementById('alertBanner');
const alertTitleEl = document.getElementById('alertTitle');
const alertDescriptionEl = document.getElementById('alertDescription');
const aquariumViewportEl = document.getElementById('aquariumViewport');
const fishSwimAreaEl = document.getElementById('fishSwimArea');
const bubblesContainerEl = document.getElementById('bubblesContainer');

// Modais e Botões de Configuração
const btnSettings = document.getElementById('btnSettings');
const settingsModal = document.getElementById('settingsModal');
const btnCloseSettings = document.getElementById('btnCloseSettings');
const btnResetFirebase = document.getElementById('btnResetFirebase');
const firebaseConfigForm = document.getElementById('firebaseConfigForm');

// =========================================================================
// 4. INICIALIZAÇÃO E CONTROLE DO FIREBASE / SIMULAÇÃO
// =========================================================================

function checkFirebaseConfig(config) {
  return config &&
    config.apiKey &&
    config.apiKey !== "SUA_API_KEY_DO_FIREBASE" &&
    config.databaseURL &&
    config.databaseURL !== "https://SEU-PROJETO-default-rtdb.firebaseio.com/";
}

function initApplication() {
  // Carrega credenciais do localStorage ou usa o padrão
  const savedConfig = localStorage.getItem('aquarium_firebase_config');
  if (savedConfig) {
    currentConfig = JSON.parse(savedConfig);
  } else {
    currentConfig = { ...firebaseConfig };
  }

  // Preenche formulário de configurações com a config atual
  document.getElementById('fbApiKey').value = currentConfig.apiKey.startsWith("SUA_") ? "" : currentConfig.apiKey;
  document.getElementById('fbAuthDomain').value = currentConfig.authDomain.startsWith("SEU-") ? "" : currentConfig.authDomain;
  document.getElementById('fbDatabaseUrl').value = currentConfig.databaseURL.includes("SEU-PROJETO") ? "" : currentConfig.databaseURL;
  document.getElementById('fbProjectId').value = currentConfig.projectId.startsWith("SEU-") ? "" : currentConfig.projectId;

  if (checkFirebaseConfig(currentConfig)) {
    startFirebaseMode(currentConfig);
  } else {
    startSimulationMode();
  }

  // Iniciar Loop Físico do Aquário
  startAquariumAnimationLoop();

  // Criar bolhas decorativas de fundo
  createBubbles(15);
}

function startFirebaseMode(config) {
  isSimulationMode = false;
  console.log("Conectando ao Firebase...");

  // Atualiza UI de conexão
  connectionStatusEl.className = "connection-status offline";
  connectionStatusEl.querySelector('.status-text').textContent = "Conectando ao Firebase...";

  try {
    // Inicializa Firebase Compat SDK
    if (firebase.apps.length > 0) {
      firebase.app().delete().then(() => {
        firebaseApp = firebase.initializeApp(config);
        setupFirebaseListeners();
      });
    } else {
      firebaseApp = firebase.initializeApp(config);
      setupFirebaseListeners();
    }
  } catch (error) {
    console.error("Erro ao inicializar o Firebase: ", error);
    alert("Falha na inicialização do Firebase. Iniciando modo de simulação.");
    startSimulationMode();
  }
}

function setupFirebaseListeners() {
  database = firebase.database();

  // Monitorar conexão com o servidor Firebase
  const connectedRef = database.ref(".info/connected");
  connectedRef.on("value", (snap) => {
    if (snap.val() === true) {
      connectionStatusEl.className = "connection-status online";
      connectionStatusEl.querySelector('.status-text').textContent = "ESP32 Conectado (Firebase)";
    } else {
      connectionStatusEl.className = "connection-status offline";
      connectionStatusEl.querySelector('.status-text').textContent = "Sem conexão Firebase";
    }
  });

  // Monitorar temperatura atual
  database.ref("/aquarium/temperature").on("value", (snapshot) => {
    const val = snapshot.val();
    if (val !== null) {
      currentTemperature = parseFloat(val);
      updateTemperatureUI();
    }
  }, (error) => {
    console.error("Erro ao ler temperatura do Firebase: ", error);
  });

  // Monitorar timestamp da última atualização
  database.ref("/aquarium/last_updated").on("value", (snapshot) => {
    const timestamp = snapshot.val();
    if (timestamp) {
      // O Firebase pode retornar timestamp em milissegundos ou segundos
      const date = new Date(timestamp * (timestamp < 99999999999 ? 1000 : 1));
      lastUpdatedEl.textContent = date.toLocaleTimeString('pt-BR');
    }
  });

  // Monitorar catálogo de espécies de peixes
  database.ref("/species").on("value", (snapshot) => {
    const data = snapshot.val();
    if (data) {
      availableSpecies = data;
    } else {
      availableSpecies = { ...MOCK_SPECIES_DEFAULTS };
    }
    updateFishUI();
  });

  // Monitorar peixes ativos no aquário
  database.ref("/aquarium/fish").on("value", (snapshot) => {
    const data = snapshot.val();
    registeredFishList = [];
    if (data) {
      Object.keys(data).forEach(key => {
        registeredFishList.push({
          id: key,
          ...data[key]
        });
      });
    }
    updateFishUI();
    recalculateSafeRange();
  });
}

// =========================================================================
// 5. MODO SIMULAÇÃO (Para fins de testes rápidos)
// =========================================================================
function startSimulationMode() {
  isSimulationMode = true;
  console.log("Iniciando Modo Simulação (Sem Firebase configurado)...");

  connectionStatusEl.className = "connection-status online";
  connectionStatusEl.querySelector('.status-text').textContent = "Modo Simulação Ativo";
  connectionStatusEl.style.borderColor = "rgba(6, 182, 212, 0.4)";
  connectionStatusEl.style.color = "var(--primary-cyan)";
  connectionStatusEl.querySelector('.status-dot').style.backgroundColor = "var(--primary-cyan)";
  connectionStatusEl.querySelector('.status-dot').style.boxShadow = "0 0 10px var(--primary-cyan)";

  // Carrega o catálogo de espécies simulado
  availableSpecies = { ...MOCK_SPECIES_DEFAULTS };
  updateFishUI();

  // Carrega peixes ativos no aquário do localStorage ou usa padrões de teste
  const savedLocalFish = localStorage.getItem('aquarium_sim_active_fish');
  if (savedLocalFish) {
    registeredFishList = JSON.parse(savedLocalFish);
  } else {
    // Popula inicialmente com dois peixes ativos de teste
    registeredFishList = [
      {
        id: "sim_active_1",
        speciesId: "neon_tetra",
        ...MOCK_SPECIES_DEFAULTS["neon_tetra"]
      },
      {
        id: "sim_active_2",
        speciesId: "guppy",
        ...MOCK_SPECIES_DEFAULTS["guppy"]
      }
    ];
    localStorage.setItem('aquarium_sim_active_fish', JSON.stringify(registeredFishList));
  }

  // Simulação de temperatura flutuante
  currentTemperature = 24.8;
  updateTemperatureUI();
  updateFishUI();
  recalculateSafeRange();

  // Ciclo de flutuação da temperatura simulada a cada 4 segundos
  if (window.simInterval) clearInterval(window.simInterval);
  window.simInterval = setInterval(() => {
    // Adiciona uma pequena variação positiva ou negativa
    const delta = (Math.random() - 0.5) * 0.6;
    currentTemperature = parseFloat((currentTemperature + delta).toFixed(1));

    // Evita derivar muito longe do padrão
    if (currentTemperature < 18) currentTemperature = 19;
    if (currentTemperature > 32) currentTemperature = 31;

    updateTemperatureUI();

    const now = new Date();
    lastUpdatedEl.textContent = now.toLocaleTimeString('pt-BR');
  }, 4000);
}

// O seletor dropdown foi removido para usar os switches de ativação direta.

// =========================================================================
// 6. CÁLCULOS E SISTEMA DE ALERTAS DE TEMPERATURA
// =========================================================================
function recalculateSafeRange() {
  if (registeredFishList.length === 0) {
    minSafeTempEl.textContent = "--.-°C";
    maxSafeTempEl.textContent = "--.-°C";
    rangeDescriptionEl.textContent = "Nenhum peixe cadastrado. Adicione espécies para calcular a faixa segura.";
    safeRangeBarEl.style.left = "0%";
    safeRangeBarEl.style.width = "100%";
    return;
  }

  // O limite mínimo saudável é a temperatura MÁXIMA dos mínimos exigidos por cada peixe (o mais exigente com frio)
  // O limite máximo saudável é a temperatura MÍNIMA dos máximos tolerados por cada peixe (o mais exigente com calor)
  let maxOfMin = -Infinity;
  let minOfMax = Infinity;

  registeredFishList.forEach(fish => {
    const min = parseFloat(fish.minTemp);
    const max = parseFloat(fish.maxTemp);
    if (min > maxOfMin) maxOfMin = min;
    if (max < minOfMax) minOfMax = max;
  });

  minSafeTempEl.textContent = `${maxOfMin.toFixed(1)}°C`;
  maxSafeTempEl.textContent = `${minOfMax.toFixed(1)}°C`;

  // Atualizar a representação visual da barra linear (Escala de 0°C a 45°C)
  const tempScaleMin = 0;
  const tempScaleMax = 45;
  const totalRange = tempScaleMax - tempScaleMin;

  const leftPercent = Math.max(0, Math.min(100, ((maxOfMin - tempScaleMin) / totalRange) * 100));
  const rightPercent = Math.max(0, Math.min(100, ((minOfMax - tempScaleMin) / totalRange) * 100));
  const widthPercent = Math.max(0, rightPercent - leftPercent);

  safeRangeBarEl.style.left = `${leftPercent}%`;
  safeRangeBarEl.style.width = `${widthPercent}%`;

  if (maxOfMin > minOfMax) {
    // Caso não exista interseção de temperatura saudável!
    rangeDescriptionEl.innerHTML = `<span style="color: var(--color-warning-hot); font-weight: bold;">
      <i class="fa-solid fa-triangle-exclamation"></i> Conflito de Espécies! 
      Alguns peixes não podem viver no mesmo ambiente.
    </span>`;
    safeRangeBarEl.style.width = "0%";
  } else {
    rangeDescriptionEl.textContent = `Todos os peixes cadastrados viverão saudáveis entre ${maxOfMin.toFixed(1)}°C e ${minOfMax.toFixed(1)}°C.`;
  }

  // Aciona avaliação de limites imediatamente
  evaluateLimits(maxOfMin, minOfMax);
}

function evaluateLimits(minSafe, maxSafe) {
  // Atualiza posição do ponteiro na barra de progresso
  const tempScaleMin = 0;
  const tempScaleMax = 45;
  const pointerPercent = Math.max(0, Math.min(100, ((currentTemperature - tempScaleMin) / (tempScaleMax - tempScaleMin)) * 100));
  tempPointerEl.style.left = `${pointerPercent}%`;

  // Remover classes de alerta anteriores
  aquariumViewportEl.classList.remove('alert-cold', 'alert-hot');
  alertBannerEl.classList.remove('warning-cold');
  alertBannerEl.classList.add('hidden');

  tempStatusEl.className = "info-value status-tag";

  if (registeredFishList.length === 0) {
    tempStatusEl.classList.add('status-neutral');
    tempStatusEl.textContent = "Sem Peixes";
    return;
  }

  if (minSafe > maxSafe) {
    // Alerta de incompatibilidade geral
    alertBannerEl.classList.remove('hidden');
    alertTitleEl.textContent = "Espécies Incompatíveis!";
    alertDescriptionEl.textContent = "Ajuste os peixes cadastrados. As faixas térmicas não se cruzam.";
    tempStatusEl.classList.add('status-hot');
    tempStatusEl.textContent = "Conflito";
    return;
  }

  // Ajusta velocidade das bolhas com base na temperatura (frio = lento, quente = rápido e agitado)
  if (currentTemperature < minSafe) {
    // ALERTA DE FRIO
    aquariumViewportEl.classList.add('alert-cold');
    alertBannerEl.classList.add('warning-cold');
    alertBannerEl.classList.remove('hidden');
    alertTitleEl.textContent = "Temperatura muito BAIXA!";
    alertDescriptionEl.textContent = `A água está a ${currentTemperature.toFixed(1)}°C. O mínimo seguro é ${minSafe.toFixed(1)}°C.`;

    tempStatusEl.classList.add('status-cold');
    tempStatusEl.textContent = "Muito Frio";

    adjustBubblesSpeed(20); // Bolhas lentas
  } else if (currentTemperature > maxSafe) {
    // ALERTA DE CALOR
    aquariumViewportEl.classList.add('alert-hot');
    alertBannerEl.classList.remove('hidden');
    alertTitleEl.textContent = "Temperatura muito ALTA!";
    alertDescriptionEl.textContent = `A água está a ${currentTemperature.toFixed(1)}°C. O máximo seguro é ${maxSafe.toFixed(1)}°C.`;

    tempStatusEl.classList.add('status-hot');
    tempStatusEl.textContent = "Muito Quente";

    adjustBubblesSpeed(4); // Bolhas frenéticas e rápidas
  } else {
    // TEMPERATURA SEGURA
    tempStatusEl.classList.add('status-safe');
    tempStatusEl.textContent = "Seguro";
    adjustBubblesSpeed(10); // Velocidade normal das bolhas
  }
}

function updateTemperatureUI() {
  currentTempEl.textContent = currentTemperature.toFixed(1);
  tempBadgeValEl.textContent = currentTemperature.toFixed(1);
  recalculateSafeRange();
}

// =========================================================================
// 7. RENDERIZAÇÃO DA LISTA DE PEIXES E ANIMAÇÃO DO AQUÁRIO
// =========================================================================
function updateFishUI() {
  // Limpa grid de peixes
  fishGridEl.innerHTML = "";

  const speciesKeys = Object.keys(availableSpecies);

  if (speciesKeys.length === 0) {
    emptyStateEl.classList.remove('hidden');
    emptyStateEl.querySelector('p').textContent = "Nenhuma espécie cadastrada.";
    emptyStateEl.querySelector('.sub-text').textContent = "Cadastre espécies sob a rota /species no Firebase para exibi-las aqui.";
    fishGridEl.appendChild(emptyStateEl);
    syncAquariumFishElements();
    return;
  }

  emptyStateEl.classList.add('hidden');

  speciesKeys.forEach(speciesId => {
    const species = availableSpecies[speciesId];

    // Verifica se esta espécie está ativa no aquário
    const activeFish = registeredFishList.find(fish => fish.speciesId === speciesId);
    const isActive = !!activeFish;

    const card = document.createElement('div');
    card.className = `fish-card ${isActive ? 'active-card' : ''}`;

    // Determinar imagem ou fallback SVG
    let imgHTML = '';
    if (species.image && species.image.trim() !== '') {
      imgHTML = `<img src="${species.image}" alt="${species.name}" class="fish-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`;
    }

    const svgHTML = getFishSvgMarkup(species.name, speciesId);

    card.innerHTML = `
      <div class="fish-img-container">
        ${imgHTML}
        <div class="fish-vector-avatar" style="${species.image ? 'display:none;' : 'display:flex;'}">
          ${svgHTML}
        </div>
      </div>
      <div class="fish-details">
        <div class="fish-card-header">
          <div>
            <h3 class="fish-name">${species.name}</h3>
            <span class="fish-origin"><i class="fa-solid fa-earth-americas"></i> ${species.origin}</span>
          </div>
          <div class="switch-container">
            <span class="switch-label">${isActive ? 'No Aquário' : 'Inativo'}</span>
            <label class="switch">
              <input type="checkbox" class="toggle-fish-active" data-species-id="${speciesId}" ${isActive ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </div>
        </div>
        <div class="fish-stats">
          <span class="stat-badge"><i class="fa-solid fa-temperature-half"></i> ${species.minTemp}°C - ${species.maxTemp}°C</span>
          <span class="stat-badge"><i class="fa-solid fa-droplet"></i> pH ${species.ph}</span>
        </div>
        <p class="fish-curiosity"><strong>Curiosidade:</strong> ${species.curiosity}</p>
      </div>
    `;

    // Evento de alteração do toggle (Checked = Ativo, Unchecked = Inativo)
    const toggleInput = card.querySelector('.toggle-fish-active');
    toggleInput.addEventListener('change', (e) => {
      const spId = e.target.getAttribute('data-species-id');
      const shouldActivate = e.target.checked;

      if (shouldActivate) {
        activateFish(spId);
      } else {
        // Encontra o ID correto do peixe registrado (pode ser chave push ou a própria espécie)
        if (activeFish) {
          deactivateFish(activeFish.id);
        } else {
          deactivateFish(spId);
        }
      }
    });

    fishGridEl.appendChild(card);
  });

  // Sincroniza os peixes nadando na tela
  syncAquariumFishElements();
}

function getFishSvgMarkup(name, seedId) {
  const nameLower = name.toLowerCase();

  // Diferentes paletas e formas de peixe baseadas em nomes comuns
  if (nameLower.includes("neon") || nameLower.includes("tetra")) {
    // Peixe Neon (Forma alongada, Azul e Vermelho)
    return `
      <svg viewBox="0 0 100 60">
        <!-- Cauda -->
        <path d="M70,30 L90,15 L85,30 L90,45 Z" fill="#ff4d4d" />
        <!-- Nadadeiras -->
        <path d="M45,20 L35,8 L50,20 Z" fill="#38bdf8" />
        <path d="M45,40 L35,52 L50,40 Z" fill="#38bdf8" />
        <!-- Corpo Principal -->
        <path d="M10,30 C25,12 65,15 75,30 C65,45 25,48 10,30 Z" fill="url(#neonBodyGrad-${seedId})" />
        <!-- Listra Neon Neon -->
        <path d="M15,30 C30,22 55,22 70,28" stroke="#38bdf8" stroke-width="4" fill="none" stroke-linecap="round" style="filter: drop-shadow(0 0 4px #06b6d4);" />
        <!-- Olho -->
        <circle cx="22" cy="27" r="3" fill="#000" />
        <circle cx="23" cy="26" r="1" fill="#fff" />
        
        <defs>
          <linearGradient id="neonBodyGrad-${seedId}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#1e293b" />
            <stop offset="50%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
    `;
  } else if (nameLower.includes("disco") || nameLower.includes("acara")) {
    // Peixe Acará-Disco (Forma arredondada/disco, colorido)
    return `
      <svg viewBox="0 0 100 80">
        <!-- Cauda -->
        <path d="M68,40 L88,25 L84,40 L88,55 Z" fill="#f59e0b" />
        <!-- Nadadeiras Dorsais Longas -->
        <path d="M35,22 C45,2 60,8 62,18 Z" fill="#ec4899" />
        <path d="M35,58 C45,78 60,72 62,62 Z" fill="#ec4899" />
        <!-- Corpo Circular -->
        <circle cx="45" cy="40" r="26" fill="url(#discusGrad-${seedId})" />
        <!-- Detalhes Listras -->
        <path d="M35,16 C38,25 38,55 35,64" stroke="#a855f7" stroke-width="2" fill="none" opacity="0.6"/>
        <path d="M45,14 C48,25 48,55 45,66" stroke="#ec4899" stroke-width="2" fill="none" opacity="0.6"/>
        <!-- Olho -->
        <circle cx="30" cy="35" r="4.5" fill="#ef4444" />
        <circle cx="30" cy="35" r="2" fill="#000" />
        <circle cx="31" cy="34" r="0.8" fill="#fff" />
        
        <defs>
          <linearGradient id="discusGrad-${seedId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f59e0b" />
            <stop offset="50%" stop-color="#ec4899" />
            <stop offset="100%" stop-color="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    `;
  } else {
    // Modelo Padrão: Peixe Palhaço/Dourado (Cor Laranja Vibrante, Listras Brancas)
    return `
      <svg viewBox="0 0 100 60">
        <!-- Cauda -->
        <path d="M70,30 L90,12 L83,30 L90,48 Z" fill="#ea580c" />
        <!-- Nadadeira de Cima -->
        <path d="M40,18 C48,2 60,8 65,18 Z" fill="#ea580c" />
        <!-- Corpo -->
        <path d="M12,30 C25,10 65,10 75,30 C65,50 25,50 12,30 Z" fill="#f97316" />
        <!-- Listras Brancas de Peixe Palhaço -->
        <path d="M32,18 C36,25 36,35 32,42 C36,42 41,35 39,18 Z" fill="#fff" />
        <path d="M52,16 C56,25 56,35 52,44 C56,44 60,35 58,16 Z" fill="#fff" />
        <!-- Olho -->
        <circle cx="24" cy="27" r="3.5" fill="#fff" />
        <circle cx="25" cy="27" r="1.5" fill="#000" />
        <circle cx="26" cy="26" r="0.5" fill="#fff" />
      </svg>
    `;
  }
}

// Sincroniza e cria os elementos HTML de peixes que nadam no aquário na tela
function syncAquariumFishElements() {
  // Limpa elementos de nado antigos
  fishSwimAreaEl.innerHTML = "";
  swimmingFishObjects = [];

  const areaWidth = fishSwimAreaEl.clientWidth || 600;
  const areaHeight = fishSwimAreaEl.clientHeight || 300;

  registeredFishList.forEach((fish) => {
    const fishDiv = document.createElement('div');
    fishDiv.className = 'animated-fish';
    fishDiv.id = `swim-${fish.id}`;

    // Dimensões do peixe
    const width = 85;
    const height = 50;
    fishDiv.style.width = `${width}px`;
    fishDiv.style.height = `${height}px`;

    // Desenha corpo do peixe nadando
    const bodyWrapper = document.createElement('div');
    bodyWrapper.className = 'fish-body-wrapper';

    let renderHTML = '';
    // Se o usuário passou link de foto
    if (fish.image && fish.image.trim() !== '') {
      // Cria uma máscara de bolha/peixe elegante para a foto flutuar
      renderHTML = `
        <div style="width: 100%; height: 100%; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; overflow: hidden; border: 2px solid var(--primary-cyan); background-color: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
          <img src="${fish.image}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.parentElement.innerHTML = '<i class=\\'fa-solid fa-fish\\' style=\\'font-size: 1.5rem; color: var(--primary-cyan);\\'></i>';">
        </div>
      `;
    } else {
      // Desenho vetorial animado
      renderHTML = `<div class="fish-svg">${getFishSvgMarkup(fish.name, 'swim-' + fish.id)}</div>`;
    }

    bodyWrapper.innerHTML = renderHTML;
    fishDiv.appendChild(bodyWrapper);
    fishSwimAreaEl.appendChild(fishDiv);

    // Define posição e destinos físicos iniciais aleatórios
    const posX = Math.random() * (areaWidth - width);
    const posY = Math.random() * (areaHeight - height - 30) + 15;

    const targetX = Math.random() * (areaWidth - width);
    const targetY = Math.random() * (areaHeight - height - 30) + 15;

    const speed = 0.5 + Math.random() * 0.8; // velocidade do peixe

    swimmingFishObjects.push({
      id: fish.id,
      element: fishDiv,
      width: width,
      height: height,
      x: posX,
      y: posY,
      targetX: targetX,
      targetY: targetY,
      speed: speed,
      scaleX: 1,
      changeTargetTimer: Math.random() * 100 // timer aleatório para mudar de rota
    });
  });
}

// Loop físico rodando a 60 FPS com requestAnimationFrame
function startAquariumAnimationLoop() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  function animate() {
    const areaWidth = fishSwimAreaEl.clientWidth || 600;
    const areaHeight = fishSwimAreaEl.clientHeight || 300;

    swimmingFishObjects.forEach(fish => {
      // 1. Reduz o timer para mudar de direção aleatoriamente
      fish.changeTargetTimer -= 0.5;

      // Chegou muito perto do alvo ou o timer esgotou -> escolhe novo alvo aleatório no aquário
      const distToTargetX = fish.targetX - fish.x;
      const distToTargetY = fish.targetY - fish.y;
      const distance = Math.sqrt(distToTargetX * distToTargetX + distToTargetY * distToTargetY);

      if (distance < 20 || fish.changeTargetTimer <= 0) {
        fish.targetX = Math.random() * (areaWidth - fish.width);
        fish.targetY = Math.random() * (areaHeight - fish.height - 30) + 15;
        fish.changeTargetTimer = 100 + Math.random() * 200; // redefine timer

        // Ajusta ligeiramente a velocidade
        fish.speed = 0.4 + Math.random() * 0.7;
      }

      // 2. Calcula vetor de direção de nado
      const angle = Math.atan2(distToTargetY, distToTargetX);
      const vx = Math.cos(angle) * fish.speed;
      const vy = Math.sin(angle) * fish.speed;

      // 3. Move o peixe
      fish.x += vx;
      fish.y += vy;

      // 4. Inverte orientação visual (olhar para a esquerda ou direita)
      // Se vx for positivo, o peixe nada para a DIREITA. Se negativo, nada para a ESQUERDA.
      // Dependendo do desenho inicial do SVG (que aponta para a esquerda), flipamos.
      if (vx > 0.1) {
        fish.scaleX = -1; // Olhando para a direita (invertido)
      } else if (vx < -0.1) {
        fish.scaleX = 1;  // Olhando para a esquerda (padrão do SVG)
      }

      // 5. Aplica transformações CSS no elemento DOM
      // Mantém um leve balanço vertical para simular flutuação da água (Math.sin)
      const bobbing = Math.sin(Date.now() * 0.003 + fish.x * 0.01) * 3;
      fish.element.style.left = `${fish.x}px`;
      fish.element.style.top = `${fish.y + bobbing}px`;
      fish.element.style.transform = `scaleX(${fish.scaleX})`;
    });

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();
}

// =========================================================================
// 8. CRIAÇÃO DE BOLHAS E CONTROLE DE VELOCIDADE
// =========================================================================
function createBubbles(count) {
  bubblesContainerEl.innerHTML = "";
  for (let i = 0; i < count; i++) {
    addBubble();
  }
}

function addBubble() {
  const bubble = document.createElement('div');
  bubble.className = 'bubble';

  // Atributos aleatórios para as bolhas parecerem orgânicas
  const size = 5 + Math.random() * 18;
  const left = Math.random() * 100;
  const delay = Math.random() * 8;
  const duration = 6 + Math.random() * 10;

  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.left = `${left}%`;
  bubble.style.animationDelay = `${delay}s`;
  bubble.style.animationDuration = `${duration}s`;

  bubblesContainerEl.appendChild(bubble);

  // Recria a bolha quando sua animação termina para manter fluxo contínuo
  bubble.addEventListener('animationiteration', () => {
    bubble.style.left = `${Math.random() * 100}%`;
  });
}

function adjustBubblesSpeed(durationSec) {
  // Ajusta a velocidade de subida de todas as bolhas em cena
  const bubbles = document.querySelectorAll('.bubble');
  bubbles.forEach(b => {
    // Reduz duração para acelerar, aumenta para desacelerar
    const currentDuration = parseFloat(b.style.animationDuration) || 12;
    const factor = durationSec / 10; // 10s é o padrão
    b.style.animationDuration = `${(8 + Math.random() * 6) * factor}s`;
  });
}

// =========================================================================
// 9. FUNÇÕES DE BANCO DE DADOS (ADICIONAR E EXCLUIR PEIXES ATIVOS DO AQUÁRIO)
// =========================================================================
function activateFish(speciesId) {
  const speciesData = availableSpecies[speciesId];
  if (!speciesData) return;

  const fishData = {
    speciesId: speciesId,
    name: speciesData.name,
    minTemp: speciesData.minTemp,
    maxTemp: speciesData.maxTemp,
    ph: speciesData.ph,
    origin: speciesData.origin,
    curiosity: speciesData.curiosity,
    image: speciesData.image || ""
  };

  if (isSimulationMode) {
    if (registeredFishList.some(f => f.speciesId === speciesId)) return;

    const newFish = {
      id: speciesId,
      ...fishData
    };
    registeredFishList.push(newFish);
    localStorage.setItem('aquarium_sim_active_fish', JSON.stringify(registeredFishList));

    updateFishUI();
    recalculateSafeRange();
  } else {
    // Grava no Firebase usando o speciesId como chave para evitar duplicidades
    database.ref(`/aquarium/fish/${speciesId}`).set(fishData)
      .then(() => console.log("Peixe ativado no Firebase!"))
      .catch(err => alert("Erro ao ativar peixe no Firebase: " + err.message));
  }
}

function deactivateFish(id) {
  if (isSimulationMode) {
    registeredFishList = registeredFishList.filter(fish => fish.id !== id && fish.speciesId !== id);
    localStorage.setItem('aquarium_sim_active_fish', JSON.stringify(registeredFishList));

    updateFishUI();
    recalculateSafeRange();
  } else {
    database.ref(`/aquarium/fish/${id}`).remove()
      .then(() => console.log("Peixe desativado no Firebase!"))
      .catch(err => alert("Erro ao desativar peixe: " + err.message));
  }
}

// =========================================================================
// 10. MODAIS E EVENT LISTENERS DA UI
// =========================================================================

// Configurações do Firebase
btnSettings.addEventListener('click', () => {
  settingsModal.classList.remove('hidden');
});

btnCloseSettings.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
  if (e.target === settingsModal) settingsModal.classList.add('hidden');
});

// Salvar credenciais do Firebase
firebaseConfigForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const config = {
    apiKey: document.getElementById('fbApiKey').value.trim(),
    authDomain: document.getElementById('fbAuthDomain').value.trim(),
    databaseURL: document.getElementById('fbDatabaseUrl').value.trim(),
    projectId: document.getElementById('fbProjectId').value.trim()
  };

  localStorage.setItem('aquarium_firebase_config', JSON.stringify(config));
  currentConfig = config;

  settingsModal.classList.add('hidden');

  if (checkFirebaseConfig(config)) {
    startFirebaseMode(config);
  } else {
    alert("Configurações inválidas ou incompletas. Iniciando modo de simulação.");
    startSimulationMode();
  }
});

// Restaurar configurações padrões
btnResetFirebase.addEventListener('click', () => {
  if (confirm("Deseja restaurar as credenciais padrão vazias? Isso ativará o Modo Simulação.")) {
    localStorage.removeItem('aquarium_firebase_config');
    currentConfig = { ...firebaseConfig };

    document.getElementById('fbApiKey').value = "";
    document.getElementById('fbAuthDomain').value = "";
    document.getElementById('fbDatabaseUrl').value = "";
    document.getElementById('fbProjectId').value = "";

    settingsModal.classList.add('hidden');
    startSimulationMode();
  }
});

// Lida com redimensionamento de tela para reajustar limites de nado
window.addEventListener('resize', () => {
  const areaWidth = fishSwimAreaEl.clientWidth || 600;
  const areaHeight = fishSwimAreaEl.clientHeight || 300;

  swimmingFishObjects.forEach(fish => {
    // Se o peixe estiver fora dos novos limites, traz de volta
    if (fish.x > areaWidth - fish.width) fish.x = areaWidth - fish.width;
    if (fish.y > areaHeight - fish.height) fish.y = areaHeight - fish.height;
    fish.targetX = Math.random() * (areaWidth - fish.width);
    fish.targetY = Math.random() * (areaHeight - fish.height - 30) + 15;
  });
});

// Inicialização Geral
window.addEventListener('DOMContentLoaded', initApplication);
