# PI5 - Aquário Virtual

Projeto de Aquário Virtual estruturado seguindo o padrão completo de desenvolvimento Full-Stack com Frontend e Backend separados.

## 🧠 A Lógica das Pastas e Arquivos

### 1. Raiz do Projeto (`/`)
- `.gitignore`: Diz ao Git quais arquivos ele deve ignorar (como senhas e a pasta node_modules).
- `README.md`: O manual de instruções do projeto. Diz como rodar a aplicação.
- `firebase.json` e `.firebaserc`: Configurações de Deploy e Hosting do ecossistema Firebase.
- `aquarium_firmware/`: Código fonte C++ do microcontrolador do aquário.

### 2. O Backend (`/backend`) — O Cérebro e Banco de Dados
Aqui fica a lógica de negócios, segurança e a comunicação com o banco de dados.

- `src/`: Abreviação de Source (Código-fonte). Tudo que você escreve fica aqui dentro.
  - `config/`: Configurações de ferramentas externas.
  - `controllers/`: Os tomadores de decisão (recebem requisição, processam com o Model e devolvem resposta).
  - `models/`: A estrutura dos dados. Contém o arquivo `firebase_structure.json` definindo como o Realtime Database é organizado.
  - `routes/`: Os caminhos da API.
  - `middlewares/`: Os porteiros (funções que rodam antes de chegar no controller).
  - `app.js`: O ponto de partida do servidor backend.
- `.env`: Arquivo de variáveis de ambiente.
- `package.json`: Dependências do Backend.

### 3. O Frontend (`/frontend`) — A Interface Visual
Aqui fica tudo o que o usuário final vê e interage na tela.

- `public/`: Arquivos estáticos que não mudam e que o navegador acessa diretamente. Aqui estão os arquivos `index.html` e `404.html`.
- `src/`: O código vivo do front.
  - `assets/`: Imagens, logos, fontes e vídeos. Suas imagens de peixes estão dentro da subpasta `images/`.
  - `components/`: Pedaços reutilizáveis de interface.
  - `pages/`: As telas completas.
  - `services/`: A ponte com o backend.
  - `styles/`: Arquivos de estilização global, como o `style.css`.
  - `App.js`: Componente raiz.
  - `main.js`: Arquivo principal JavaScript do site antigo.
- `package.json`: Dependências do Frontend.
- `vite.config.js`: Configurações do Vite.
