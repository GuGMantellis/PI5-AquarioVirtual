<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=2,3,30&height=160&section=header&text=🐟%20SmartTank&fontSize=48&fontColor=fff&animation=fadeIn&fontAlignY=35&desc=Sistema%20IoT%20de%20Monitoramento%20de%20Aquários&descAlignY=58&descSize=18" width="100%"/>

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-58A6FF?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-ESP32-E7352C?style=for-the-badge&logo=espressif&logoColor=white)](https://www.espressif.com/)
[![Backend](https://img.shields.io/badge/Backend-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Status](https://img.shields.io/badge/Status-Completo-4CAF50?style=for-the-badge)](https://github.com/GuGMantellis/PI5-AquarioVirtual)
[![FATEC](https://img.shields.io/badge/FATEC-Bebedouro-0d47a1?style=for-the-badge)](https://www.fatecbebedouro.edu.br/)

<br/>

[![🌐 Ver Dashboard ao Vivo](https://img.shields.io/badge/🌐_Dashboard_ao_Vivo-aquariovirtual--3caae.web.app-06b6d4?style=for-the-badge)](https://aquariovirtual-3caae.web.app/)

</div>

---

## 🌐 Demo ao Vivo

<div align="center">

> **[👉 Acesse o Dashboard em Tempo Real](https://aquariovirtual-3caae.web.app/)**  
> Monitoramento de temperatura, pH e peixes — conectado ao Firebase 24/7

</div>

---

## 📋 O que é o SmartTank?

O **SmartTank** é um sistema completo de **monitoramento inteligente de aquários** desenvolvido como Projeto Integrador (PI5) na FATEC Bebedouro. O sistema integra **hardware embarcado** com **cloud computing** para oferecer telemetria em tempo real via web.

### ✨ Funcionalidades

| Feature | Descrição |
|---|---|
| 🌡️ **Temperatura** | Sensor DS18B20 — leitura contínua com alerta de variação |
| ⚗️ **pH da Água** | Sensor analógico de pH com calibração automática |
| 💧 **Turbidez** | Sensor óptico de qualidade da água |
| 📡 **Transmissão** | Dados enviados via WiFi para o Firebase em tempo real |
| 🌐 **Dashboard Web** | Interface responsiva com gráficos históricos e alertas |
| 🔔 **Alertas** | Notificações quando parâmetros saem do intervalo ideal |

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     HARDWARE (Aquário)                       │
│  [DS18B20 Temp] ──┐                                         │
│  [Sensor pH]   ──►  [ESP32] ──► WiFi ──► Internet          │
│  [Turbidez]    ──┘                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    FIREBASE (Cloud)                          │
│  Realtime Database ── Cloud Functions ── Firebase Hosting   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (Web/Mobile)                      │
│  Dashboard HTML/CSS/JS ── Gráficos Chart.js ── Alertas      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Componentes de Hardware

| Componente | Modelo | Função |
|---|---|---|
| Microcontrolador | **ESP32 DevKit V1** | Processamento e comunicação WiFi |
| Temperatura | **DS18B20** | Sensor digital 1-Wire, precisão ±0.5°C |
| pH | **Módulo pH Analógico** | Leitura 0–14 pH com eletrodo de vidro |
| Turbidez | **Sensor Óptico TSD-10** | Qualidade e clareza da água |
| Alimentação | **5V USB / Bateria LiPo** | Operação contínua |

---

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- [Arduino IDE](https://www.arduino.cc/en/software) ou [PlatformIO](https://platformio.org/)
- Conta no [Firebase](https://firebase.google.com/) (gratuita)
- ESP32 com bibliotecas instaladas

### 1. Clone o repositório

```bash
git clone https://github.com/GuGMantellis/PI5-AquarioVirtual.git
cd PI5-AquarioVirtual
```

### 2. Configure o Firebase

Crie um projeto no Firebase e copie as credenciais para `backend/config/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "seu-projeto.firebaseapp.com",
  databaseURL: "https://seu-projeto.firebaseio.com",
  projectId: "seu-projeto"
};
```

### 3. Configure e grave o Firmware

Abra `firmware/smarttank_main/smarttank_main.ino` e edite:

```cpp
const char* ssid     = "SEU_WIFI";
const char* password = "SUA_SENHA";
const char* apiKey   = "SUA_FIREBASE_API_KEY";
const char* dbURL    = "https://SEU_PROJETO.firebaseio.com";
```

Grave no ESP32 via Arduino IDE (selecione a board `ESP32 Dev Module`).

### 4. Acesse o Dashboard

```bash
# Instale o Firebase CLI
npm install -g firebase-tools

# Faça deploy do frontend
firebase login
firebase deploy --only hosting
```

Ou simplesmente abra `frontend/index.html` no navegador para modo local.

---

## 📁 Estrutura do Projeto

```
📁 PI5-AquarioVirtual/
├── 📁 firmware/               ← Código do ESP32 (C/C++)
│   └── smarttank_main.ino
├── 📁 frontend/               ← Dashboard Web (HTML/CSS/JS)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── 📁 backend/                ← Configurações Firebase
│   └── config/
├── 📁 hardware/               ← Esquemas elétricos e BOM
├── 📁 docs/                   ← Documentação e assets
│   └── assets/
├── 📁 diagrams/               ← Diagramas de arquitetura
├── 📁 tests/                  ← Planos de testes
└── README.md
```

---

## 📊 Resultados

- ✅ Leitura e transmissão de dados a cada **5 segundos**
- ✅ Dashboard com histórico das últimas **24 horas**
- ✅ Tempo de resposta do alerta: **< 10 segundos**
- ✅ Operação contínua sem reinicializações em testes de **72h+**

---

## 🤝 Contribuindo

Pull requests são bem-vindos! Para mudanças maiores, abra uma issue primeiro para discutir o que você gostaria de mudar.

Leia [CONTRIBUTING.md](CONTRIBUTING.md) para mais detalhes.

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License** — veja o arquivo [LICENSE](LICENSE) para detalhes.

---

<div align="center">

Desenvolvido por [Gustavo Mantellis](https://github.com/GuGMantellis) — FATEC Bebedouro 🎓

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/gustavo-guedes-mantellis-3483722b0/)

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=2,3,30&height=80&section=footer" width="100%"/>

</div>
