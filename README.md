# Nexus

Nexus e uma plataforma moderna de gestao de atendimentos e operacoes internas. A proposta e centralizar pessoas, chamados e solucoes em uma base corporativa com API REST, autenticacao JWT, RBAC, banco PostgreSQL, frontend responsivo, Docker Compose e Nginx como reverse proxy.

Slogan: **Conectando pessoas, chamados e solucoes.**

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

- `ADMIN`: visualiza todos os chamados, gerencia usuarios, gerencia categorias e altera qualquer chamado.
- `TECNICO`: visualiza chamados atribuidos e disponiveis, assume chamados sem responsavel, altera status, conclui chamados e comenta.
- `SOLICITANTE`: cria chamados, visualiza apenas os proprios chamados, acompanha andamento, edita dados principais e comenta.

## Fluxo de chamados

Status internos da API:

- `ABERTO`
- `EM_ANDAMENTO`
- `AGUARDANDO_SOLICITANTE`
- `AGUARDANDO_TERCEIROS`
- `CONCLUIDO`
- `CANCELADO`

Exibicao no frontend:

- Aberto
- Em andamento
- Aguardando solicitante
- Aguardando terceiros
- Concluido
- Cancelado

Mudancas de status sao registradas no historico de auditoria do chamado.

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
Para o novo fluxo de atendimento, tambem sao criados setores iniciais e areas/tipos como `VPN`, `IMPRESSORA`, `ACESSO`, `HARDWARE`, `SOFTWARE` e `OUTROS`.

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
| `UPLOAD_DIR` | Diretorio local onde anexos de chamados sao armazenados |
| `MAX_ATTACHMENT_SIZE_BYTES` | Tamanho maximo por anexo |
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
- `GET /api/sectors`
- `POST /api/sectors`
- `PUT /api/sectors/{id}`
- `DELETE /api/sectors/{id}`
- `GET /api/support-areas`
- `POST /api/support-areas`
- `PUT /api/support-areas/{id}`
- `DELETE /api/support-areas/{id}`
- `GET /api/support-types`
- `POST /api/support-types`
- `PUT /api/support-types/{id}`
- `DELETE /api/support-types/{id}`
- `GET /api/tickets`
- `POST /api/tickets`
- `GET /api/tickets/{id}`
- `PUT /api/tickets/{id}`
- `POST /api/tickets/{id}/comments`
- `POST /api/tickets/{id}/attachments`
- `GET /api/tickets/{id}/attachments/{attachment_id}`
- `GET /api/dashboard/metrics`
- `GET /api/health`
- `GET /api/health/db`

## Funcionalidades implementadas

- Login com JWT.
- Cadastro publico de solicitantes.
- CRUD administrativo de usuarios, categorias legadas, setores, areas de suporte e tipos de suporte vinculados a area.
- CRUD de chamados com busca textual, paginacao e filtros por status, setor, area, tipo, prioridade, responsavel, solicitante e periodo.
- Criacao de chamados por ADMIN e SOLICITANTE. TECNICO nao cria chamados.
- Novo fluxo de abertura com solicitante automatico, setor, area, tipo dependente da area, detalhamento e prioridade.
- Anexos iniciais de imagem/video em armazenamento local, com metadados no banco e download protegido por permissao do chamado.
- Atribuicao de tecnico ativo por administradores e assuncao de chamados disponiveis por tecnicos.
- Acoes rapidas de atendimento: iniciar, aguardar solicitante, aguardar terceiros, concluir e cancelar.
- Edicao de titulo, descricao, setor, area, tipo e prioridade conforme perfil.
- Comentarios em chamados.
- Historico/auditoria de alteracoes, incluindo mudancas de status.
- Dashboard com total, abertos, em andamento, aguardando, concluidos, sem responsavel e distribuicoes por setor, area, tipo e prioridade.
- Protecao de rotas no frontend por perfil.
- Docker Compose com `frontend`, `backend`, `postgres` e `nginx`.
- Volume persistente `postgres_data:/var/lib/postgresql/data`.
- Volume persistente `ticket_uploads:/app/uploads` para anexos.

## Validacao local

```bash
python3 -m compileall backend/app
cd frontend
npm run build
```

Rotas frontend principais:

- `/login`
- `/`
- `/chamados`
- `/chamados/novo`
- `/chamados/:id`
- `/usuarios`
- `/admin/atendimento`
- `/categorias`

## Prints

Secao reservada para imagens do Nexus:

- Login
- Dashboard
- Lista de chamados
- Detalhe do chamado
- Administracao

## Roadmap futuro

- SLA por prioridade, categoria e tempo de espera.
- Armazenamento externo de anexos e politicas avancadas de retencao.
- Notificacoes por e-mail e eventos em tempo real.
- Relatorios exportaveis em CSV/PDF.
- Base de conhecimento integrada aos chamados.
- Testes automatizados de API e frontend.
- Pipeline CI/CD.
- Configuracao de dominio, HTTPS e renovacao automatica de certificados.
