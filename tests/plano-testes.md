# Plano de Testes

## Objetivo
Garantir o funcionamento integrado entre o hardware (sensores e microcontrolador), banco de dados e a interface web.

## Cenários de Teste

### CT01 - Leitura de Temperatura
- **Pré-condição:** Sensor DS18B20 conectado na água a 25°C.
- **Passos:** Ligar ESP32, verificar porta Serial, verificar banco de dados.
- **Resultado Esperado:** Dado recebido com erro máximo de ±0.5°C.

### CT02 - Acionamento de Relé via Dashboard
- **Pré-condição:** ESP32 conectado ao WiFi, Dashboard aberto no navegador.
- **Passos:** Clicar no botão "Luz", verificar estado do Relé.
- **Resultado Esperado:** O Relé deve fazer o som de "clique" e a luz acender em menos de 2 segundos.
