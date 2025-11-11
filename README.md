# Pokédex Integrada – Flask + Vanilla JS

Projeto integrado das disciplinas de Frontend e Backend consumindo dados da PokéAPI, com API própria em Flask, banco PostgreSQL e interface estática em HTML/CSS/JS.

## Estrutura do Repositório

```
├── backend/        # Aplicação Flask
│   ├── app/        # Código-fonte (models, rotas, autenticação, seed)
│   └── migrations/ # Migrations geradas com Flask-Migrate
├── frontend/       # Página estática (HTML, CSS, JS)
├── docker-compose.yml
└── requirements.txt
```

## Backend (Flask)

### Pré-requisitos

- Python 3.11+
- PostgreSQL 15+ (via Docker recomendado)
- Pip + virtualenv

### Instalação e execução (local)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

export FLASK_APP=backend.app:create_app
export FLASK_ENV=development
export DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/pokedex

flask db upgrade          # aplica migrations
flask seed-pokemons       # importa pokémons da PokeAPI (151 por padrão)
flask run                 # inicia servidor em http://localhost:5000
```

### Execução com Docker

```bash
docker compose up --build
docker compose exec backend flask db upgrade
docker compose exec backend flask seed-pokemons --limit 151
```

Variáveis principais (ajuste conforme necessário):

- `DATABASE_URL`
- `SECRET_KEY`
- `CORS_ORIGINS` (origens permitidas para o frontend)

### Endpoints Disponíveis (`/api`)

- `GET /usuarios` – lista usuários cadastrados.
- `POST /usuarios` – cria usuário (`nome`, `email`, `senha`).
- `POST /auth/login` – autentica e retorna token Bearer.
- `GET /pokemons?tipo=fire` – lista pokémons, com filtro opcional por tipo.
- `POST /capturar` – registra captura (requer token). Corpo: `pokemon_id`.
- `GET /usuarios/<id>/pokemons` – lista pokémons capturados por um usuário.

Token Bearer deve ser enviado no header `Authorization: Bearer <token>`.

### Seeds

O comando `flask seed-pokemons` consome a PokéAPI e atualiza a tabela `pokemons`. Use a flag `--limit` para controlar a quantidade:

```bash
flask seed-pokemons --limit 50
```

## Frontend (Vanilla JS)

Arquivos em `frontend/` podem ser servidos com qualquer servidor estático:

```bash
cd frontend
python3 -m http.server 3000
```

Por padrão, o frontend consome `http://localhost:5000/api`. Para apontar para outra URL (ex.: backend hospedado), execute no console do navegador:

```js
localStorage.setItem("pokedex_api_url", "https://sua-api.com/api");
```

### Funcionalidades

- Cards dinâmicos com nome, imagem, tipos e botão “Capturar”.
- Filtro por tipo (select).
- Modal para cadastro de novos usuários.
- Login com email/senha e armazenamento de token.
- Lista de pokémons capturados pelo usuário logado.

### Publicação no GitHub Pages

1. Faça deploy do diretório `frontend/` (branch `gh-pages` ou `/docs`).
2. Ajuste `localStorage.pokedex_api_url` para apontar para o backend acessível publicamente.
3. Garanta que o backend esteja disponível via HTTPS para evitar bloqueio pelo navegador.

## Documentação Complementar

Use estes tópicos como guia para produzir o PDF técnico:

- Visão geral dos conceitos de API REST implementados.
- Manipulação de DOM no frontend (templates, eventos, renderização dinâmica).
- Fluxo de chamadas à Fetch API e tratamento de respostas/erros.
- Modelo de dados e relacionamentos no PostgreSQL (diagrama + explicação das tabelas).
- Descrição do processo de seed com a PokéAPI.

### Vídeo Pitch

Sugestão de roteiro (2–3 minutos):

1. Introdução rápida do objetivo do projeto.
2. Demonstração do backend (endpoints, seed, autenticação).
3. Demonstração do frontend (cadastro, login, filtro, captura).
4. Comentários finais e próximos passos.

## Scripts Úteis

- `flask db migrate -m "mensagem"` – cria novas migrations.
- `flask db upgrade` – aplica migrations.
- `flask seed-pokemons --limit 151` – atualiza tabela `pokemons`.

## Contato

Em caso de dúvidas ou bugs, abra uma issue descrevendo o passo a passo para reproduzir.