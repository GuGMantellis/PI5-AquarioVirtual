# Requisitos e Tecnologias

## Requisitos Funcionais
- O sistema deve ler a temperatura da água e enviá-la para o banco de dados.
- O sistema deve monitorar o nível de pH da água.
- O usuário deve poder ligar e desligar a iluminação através do Dashboard.
- O sistema deve emitir alertas se os parâmetros da água saírem da faixa ideal.

## Requisitos Não Funcionais
- O tempo de resposta entre o clique no Dashboard e o acionamento do relé não deve exceder 2 segundos.
- O Dashboard deve ser responsivo e funcionar em dispositivos móveis e desktops.

## Tecnologias Escolhidas
### Hardware
- Microcontrolador: ESP32 ou Arduino.
- Sensores: DS18B20 (Temperatura), Sensor de pH analógico, Sensor ultrassônico (Nível d'água).
- Atuadores: Módulo Relé, Motores de passo para alimentação.

### Software
- Firmware: C/C++ (Arduino IDE/PlatformIO).
- Backend / Banco de Dados: Firebase Realtime Database (ou backend customizado em Node.js).
- Frontend (Dashboard): React.js, Vue.js, ou HTML/CSS/JS nativo.
