/**
 * PROJETO: Monitoramento de Aquário Virtual com ESP32, DS18B20 e Firebase
 * AUTOR: Antigravity AI
 * 
 * Este firmware lê a temperatura da água através do sensor DS18B20 e
 * atualiza o valor no Firebase Realtime Database.
 * 
 * Requisitos de hardware:
 * - ESP32
 * - Sensor de Temperatura DS18B20 (à prova d'água)
 * - Resistor de 4.7k Ohms (pull-up entre o pino de dados e VCC 3.3V)
 * 
 * Bibliotecas necessárias (instalar via Gerenciador de Bibliotecas do Arduino):
 * - OneWire (por Paul Stoffregen)
 * - DallasTemperature (por Miles Burton)
 * - Firebase ESP Client (por Mobizt)
 */

#include <WiFi.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Firebase_ESP_Client.h>

// Fornece informações auxiliares sobre o token do Firebase
#include "addons/TokenHelper.h"
// Fornece informações auxiliares do Realtime Database
#include "addons/RTDBHelper.h"

// =========================================================================
// 1. CONFIGURAÇÕES DE REDE E CREDENCIAIS (ATUALIZE AQUI)
// =========================================================================
#define WIFI_SSID "SEU_WIFI_NOME"
#define WIFI_PASSWORD "SUA_WIFI_SENHA"

// API Key do Firebase (Obtido em Configurações do Projeto -> Geral -> Chaves de API da Web)
#define FIREBASE_API_KEY "SUA_API_KEY_DO_FIREBASE"

// URL do Database (Obtido na aba Realtime Database -> ex: https://seu-projeto-default-rtdb.firebaseio.com/)
#define FIREBASE_DATABASE_URL "https://SEU-PROJETO-default-rtdb.firebaseio.com/"

// =========================================================================
// 2. CONFIGURAÇÃO DO HARDWARE
// =========================================================================
// Pino de dados onde o DS18B20 está conectado. Recomendado: GPIO 4
#define ONE_WIRE_BUS 4

// Configura uma instância OneWire para comunicação
OneWire oneWire(ONE_WIRE_BUS);
// Passa a referência OneWire para a biblioteca DallasTemperature
DallasTemperature sensors(&oneWire);

// =========================================================================
// 3. VARIÁVEIS DO FIREBASE
// =========================================================================
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
const unsigned long sendInterval = 10000; // Envia a temperatura a cada 10 segundos
bool signupOK = false;

// =========================================================================
// FUNÇÃO DE CONFIGURAÇÃO DE REDE WI-FI
// =========================================================================
void setupWiFi() {
  Serial.print("Conectando ao Wi-Fi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("Wi-Fi Conectado!");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());
}

void setup() {
  Serial.begin(115200);

  // Inicializa o sensor DS18B20
  sensors.begin();
  Serial.println("Sensor DS18B20 Inicializado.");

  // Inicializa Wi-Fi
  setupWiFi();

  // Configurações do Firebase
  config.api_key = FIREBASE_API_KEY;
  config.database_url = FIREBASE_DATABASE_URL;

  // Registrar um usuário anônimo ou utilizar login anônimo
  // Nota: Certifique-se de que a autenticação "Anônima" (Anonymous) está habilitada no console do Firebase
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("Autenticação Anônima no Firebase OK!");
    signupOK = true;
  } else {
    Serial.printf("Erro na autenticação: %s\n", config.signer.signupError.message.c_str());
  }

  // Inicializa a biblioteca do Firebase
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  // Verifica se o Wi-Fi está conectado e se a autenticação no Firebase foi bem-sucedida
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > sendInterval || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    // Solicita a leitura da temperatura ao sensor
    Serial.print("Solicitando temperatura...");
    sensors.requestTemperatures(); 
    
    // Obtém a temperatura em Celsius
    float tempC = sensors.getTempCByIndex(0);

    // Verifica se a leitura é válida (DS18B20 retorna -127 se desconectado)
    if (tempC == DEVICE_DISCONNECTED_C) {
      Serial.println("Erro: Sensor DS18B20 desconectado!");
      
      // Envia um status de erro para o Firebase
      if (Firebase.RTDB.setString(&fbdo, "/aquarium/status", "sensor_disconnected")) {
        Serial.println("Status de erro enviado ao Firebase.");
      }
    } else {
      Serial.print("Temperatura: ");
      Serial.print(tempC);
      Serial.println(" ºC");

      // Envia a temperatura atual
      // O Firebase cria o nó automaticamente se não existir
      if (Firebase.RTDB.setFloat(&fbdo, "/aquarium/temperature", tempC)) {
        Serial.println("Temperatura enviada com sucesso!");
      } else {
        Serial.printf("Falha ao enviar temperatura: %s\n", fbdo.errorReason().c_str());
      }

      // Envia o timestamp aproximado (usando o tempo do Firebase ou local do ESP)
      // Como o ESP32 pode não ter NTP configurado de imediato, mandamos o tempo de atividade ou
      // podemos usar a função SERVER_TIMESTAMP do Firebase
      if (Firebase.RTDB.setTimestamp(&fbdo, "/aquarium/last_updated")) {
        Serial.println("Timestamp atualizado no Firebase.");
      } else {
        Serial.printf("Falha ao atualizar timestamp: %s\n", fbdo.errorReason().c_str());
      }
      
      // Atualiza o status para ativo
      Firebase.RTDB.setString(&fbdo, "/aquarium/status", "online");
    }
  }

  // Lógica simples para reconectar Wi-Fi se cair
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Conexão Wi-Fi perdida. Reconectando...");
    setupWiFi();
  }
}
