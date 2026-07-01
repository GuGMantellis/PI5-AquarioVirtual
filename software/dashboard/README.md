# Dashboard - Aquário Virtual

Esta é a interface gráfica (Frontend) do sistema, onde o usuário acompanha os dados do aquário em tempo real.

## Tecnologias Recomendadas
- React.js / Next.js
- TailwindCSS para estilização rápida
- Firebase SDK (para ouvir as alterações no Realtime Database)

## Instalação
```bash
# Na pasta dashboard
npm install
npm run dev
```

## Estrutura
- `/components`: Botões, cards de sensores, gráficos.
- `/pages` ou `/app`: Telas principais (Home, Configurações).
- `/services`: Lógica de conexão com a API ou Firebase.
