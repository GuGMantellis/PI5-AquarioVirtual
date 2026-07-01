#include <Arduino.h>

// Definições de Pinos
#define PINO_SENSOR_TEMP 4
#define PINO_RELE_LUZ 5

void setup() {
  Serial.begin(115200);
  Serial.println("Iniciando Aquário Virtual...");
  
  pinMode(PINO_RELE_LUZ, OUTPUT);
  digitalWrite(PINO_RELE_LUZ, LOW);
  
  // Inicialização de rede e sensores irá aqui
}

void loop() {
  // Leitura de sensores
  float temperatura = lerTemperatura();
  
  // Envio de dados
  enviarDados(temperatura);
  
  // Receber comandos do Dashboard
  verificarComandos();
  
  delay(2000);
}

float lerTemperatura() {
  // TODO: Implementar leitura do sensor DS18B20
  return 26.5; 
}

void enviarDados(float temp) {
  // TODO: Implementar envio via WiFi/Firebase
  Serial.print("Temperatura atual: ");
  Serial.println(temp);
}

void verificarComandos() {
  // TODO: Checar mudança de estado dos relés
}
