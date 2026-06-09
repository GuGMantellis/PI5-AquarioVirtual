# Especificações Técnicas

## Pinagem (ESP32/Arduino)

| Componente       | Pino | Tipo   |
|------------------|------|--------|
| Sensor Temp.     | D4   | Input  |
| Relé Iluminação  | D5   | Output |
| Relé Filtro      | D6   | Output |
| Sensor Nível     | A0   | Analog |

## Estrutura do Banco de Dados (Firebase)

```json
{
  "aquario": {
    "sensores": {
      "temperatura": 26.5,
      "ph": 7.2,
      "nivel_agua": 80
    },
    "atuadores": {
      "iluminacao": true,
      "filtro": true
    }
  }
}
```
