# PI5 - Aquário Virtual

Este projeto consiste em um Aquário Virtual interativo integrado com hardware IoT (Internet of Things) e o ecossistema Firebase (Hosting + Realtime Database). Ele foi estruturado para manter o código do firmware separado da aplicação web, seguindo as melhores práticas de organização em repositórios Git.

## Estrutura do Projeto

A lógica de pastas foi organizada para separar claramente o front-end (web) do back-end (firmware) e documentação:

```text
/
├── aquarium_firmware/   # Código fonte do microcontrolador (Arduino/C++)
│   └── aquarium_firmware.ino
├── docs/                # Documentação e arquivos de estrutura do banco de dados
│   └── firebase_structure.json
├── public/              # Aplicação Web (HTML, CSS, JS e imagens) servida pelo Firebase Hosting
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── images/
├── .firebaserc          # Configurações do projeto Firebase
├── .gitignore           # Arquivos a serem ignorados pelo Git (Logs, node_modules, etc.)
├── firebase.json        # Configurações de Deploy e Hosting do Firebase
└── README.md            # Este arquivo
```

## Como Usar

### 1. Aplicação Web
A aplicação web encontra-se na pasta `public/`. Para testar localmente, você pode usar o Firebase CLI:

```bash
# Instale a Firebase CLI, caso não possua
npm install -g firebase-tools

# Inicialize/Logue no firebase
firebase login

# Rode o servidor local
firebase serve
```

### 2. Firmware (IoT)
O código para o microcontrolador está localizado na pasta `aquarium_firmware/`. 
Abra o arquivo `aquarium_firmware.ino` na **Arduino IDE** ou **PlatformIO** para compilar e enviar o código para a sua placa (ex: ESP32 ou ESP8266).

### 3. Banco de Dados (Firebase Realtime Database)
Na pasta `docs/`, o arquivo `firebase_structure.json` contém um modelo da estrutura JSON usada no Realtime Database. Você pode importar esse arquivo diretamente no console do Firebase para inicializar seu banco de dados com os valores corretos.

## Git e Versionamento
Este repositório já contém um `.gitignore` configurado para ignorar arquivos desnecessários de ambiente, logs e dependências (`node_modules`), garantindo que o Github mantenha apenas o código essencial.
