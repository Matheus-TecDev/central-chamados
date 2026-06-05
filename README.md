# Central de Chamados

Central de Chamados Corporativa desenvolvida como projeto de portfolio profissional. A proposta e entregar uma base estilo mini GLPI/Jira interno, com API REST, autenticacao JWT, RBAC, banco PostgreSQL, frontend responsivo, Docker Compose e Nginx como reverse proxy.

## Objetivo tecnico

Demonstrar uma arquitetura full stack pronta para evoluir em ambiente corporativo, cobrindo backend com FastAPI, persistencia relacional, migrations, autenticacao, permissoes por perfil, frontend React/TypeScript, conteinerizacao e configuracao basica de deploy.

## Stack

- Frontend: React, Vite, TypeScript
- Backend: Python, FastAPI
- Banco de dados: PostgreSQL 16
- ORM: SQLAlchemy
- Migrations: Alembic
- Autenticacao: JWT
- Permissoes: RBAC por perfil
- Infraestrutura: Docker Compose
- Proxy reverso: Nginx

## Arquitetura

```text
central-chamados/
  frontend/        Aplicacao React + Vite
  backend/         API FastAPI organizada em camadas
  nginx/           Reverse proxy de entrada
  docker-compose.yml
  .env.example
```

Fluxo em Docker:

```text
Usuario -> Nginx :80
Nginx /      -> frontend:80
Nginx /api   -> backend:8000
Backend      -> postgres:5432
```

O backend usa o hostname `postgres` para acessar o banco dentro da rede interna do Docker Compose.

## Perfis e permissoes

- `ADMIN`: cria e gerencia usuarios, categorias, chamados e atribuicoes, alem de visualizar todos os chamados.
- `TECNICO`: atende chamados atribuidos a ele, comenta, atualiza status e resolve chamados. Tecnico nao cria chamados.
- `SOLICITANTE`: cria chamados, acompanha apenas os proprios chamados e comenta neles.

## Como rodar com Docker Compose

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Ajuste `SECRET_KEY` e senhas se desejar. Em producao, defina `ENVIRONMENT=production` e use uma `SECRET_KEY` longa e aleatoria.

3. Suba a stack:

```bash
docker compose up -d --build
```

Se seu ambiente usa o binario legado, rode:

```bash
docker-compose up -d --build
```

4. Acesse:

- Frontend: `http://localhost`
- Swagger: `http://localhost/docs`
- Health API: `http://localhost/api/health`
- Health DB: `http://localhost/api/health/db`

## Usuario admin inicial

Os dados abaixo vem do `.env.example`, existem apenas para ambiente local/demo e devem ser alterados antes do primeiro start em qualquer ambiente compartilhado:

- E-mail: `admin@example.com`
- Senha: `Admin@123456`

O seed tambem cria as categorias iniciais: `SISTEMA`, `INFRAESTRUTURA`, `REDE`, `BANCO_DE_DADOS`, `ACESSO`, `IMPRESSORA`, `HARDWARE`, `SOFTWARE` e `OUTROS`.

## Rodar localmente sem Docker

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Em Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

Para execucao local fora do Docker, ajuste `DATABASE_URL` apontando para seu PostgreSQL local.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Configure `VITE_API_URL` se a API nao estiver publicada em `/api`.

## Variaveis de ambiente

| Variavel | Descricao |
| --- | --- |
| `POSTGRES_DB` | Nome do banco PostgreSQL |
| `POSTGRES_USER` | Usuario do banco |
| `POSTGRES_PASSWORD` | Senha do banco |
| `DATABASE_URL` | URL SQLAlchemy usada pelo backend |
| `ENVIRONMENT` | Ambiente da aplicacao. Use `production` para habilitar validacoes mais rigidas de seguranca |
| `SECRET_KEY` | Chave de assinatura JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duracao do token JWT |
| `BACKEND_CORS_ORIGINS` | Origins permitidas no CORS |
| `INITIAL_ADMIN_NAME` | Nome do admin inicial |
| `INITIAL_ADMIN_EMAIL` | E-mail do admin inicial |
| `INITIAL_ADMIN_PASSWORD` | Senha do admin inicial |
| `VITE_API_URL` | URL base da API no frontend |
| `NGINX_PORT` | Porta exposta pelo Nginx |

## Endpoints principais

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `GET /api/users`
- `POST /api/users`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/tickets`
- `POST /api/tickets`
- `GET /api/tickets/{id}`
- `PUT /api/tickets/{id}`
- `POST /api/tickets/{id}/comments`
- `GET /api/dashboard/metrics`
- `GET /api/health`
- `GET /api/health/db`

## Funcionalidades implementadas

- Login com JWT.
- Cadastro publico de solicitantes.
- CRUD administrativo de usuarios e categorias.
- CRUD de chamados com filtros por status, categoria, prioridade e responsavel.
- Criacao de chamados por ADMIN e SOLICITANTE. TECNICO nao cria chamados.
- Atribuicao de tecnico ativo por administradores.
- Comentarios em chamados.
- Historico/auditoria de alteracoes.
- Dashboard com metricas por status, categoria e prioridade.
- Protecao de rotas no frontend por perfil.
- Docker Compose com `frontend`, `backend`, `postgres` e `nginx`.
- Volume persistente `postgres_data:/var/lib/postgresql/data`.

## Prints

Secao reservada para imagens do projeto:

- Login
- Dashboard
- Lista de chamados
- Detalhe do chamado
- Administracao

## Roadmap futuro

- Recuperacao de senha e convite de usuarios.
- SLA por prioridade e categoria.
- Anexos em chamados.
- Notificacoes por e-mail.
- Relatorios exportaveis em CSV/PDF.
- Testes automatizados de API e frontend.
- Pipeline CI/CD.
- Configuracao de dominio, HTTPS e renovacao automatica de certificados.
