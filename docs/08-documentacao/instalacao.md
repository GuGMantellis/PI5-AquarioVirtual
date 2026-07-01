# Guia de Instalação

## Hardware
1. Conecte os componentes conforme o `hardware/esquemas/`.
2. Conecte a placa via USB ao computador.

## Firmware
1. Abra a Arduino IDE ou VSCode + PlatformIO.
2. Instale as bibliotecas necessárias:
   - `OneWire`
   - `DallasTemperature`
   - `Firebase ESP32 Client`
3. Configure o arquivo `main.ino` com as suas credenciais de WiFi e Firebase.
4. Faça o upload para a placa.

## Software (Dashboard)
1. Navegue até a pasta `software/dashboard`.
2. Rode `npm install` (ou yarn install).
3. Crie um arquivo `.env` baseado no `.env.example` e coloque as credenciais do seu Firebase.
4. Rode `npm run dev` para iniciar o servidor de desenvolvimento.
