# Nexus

Nexus e uma plataforma moderna de gestao de atendimentos e operacoes internas. A proposta e centralizar pessoas, chamados e solucoes em uma base corporativa com API REST, autenticacao JWT, RBAC, banco PostgreSQL, frontend responsivo, Docker Compose e Nginx como reverse proxy.

Slogan: **Conectando pessoas, chamados e solucoes.**

## Objetivo do projeto

Demonstrar uma arquitetura full stack pronta para evoluir em ambiente corporativo, cobrindo backend com FastAPI, persistencia relacional, migrations, autenticacao, permissoes por perfil, frontend React/TypeScript, conteinerizacao, pipeline de CI e testes automatizados.

## Stack

- Frontend: React, Vite, TypeScript, React Router, React Select
- Backend: Python, FastAPI, SQLAlchemy
- Banco de dados: PostgreSQL 16
- Migrations: Alembic
- Autenticacao: JWT
- Permissoes: RBAC por perfil
- Testes backend: pytest, FastAPI TestClient
- Infraestrutura: Docker Compose
- Proxy reverso: Nginx
- CI: GitHub Actions

## Arquitetura

```text
central-chamados/
  frontend/        Aplicacao React + Vite
  backend/         API FastAPI organizada em camadas
  nginx/           Reverse proxy de entrada
  .github/         Workflow de CI
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

- `ADMIN`: visualiza todos os chamados, gerencia usuarios, gerencia categorias, setores, areas/tipos de suporte, atribuicoes e altera qualquer chamado.
- `TECNICO`: visualiza chamados atribuidos e disponiveis, assume chamados sem responsavel, altera status, conclui chamados e comenta. Tecnico nao cria chamados.
- `SOLICITANTE`: cria chamados, visualiza apenas os proprios chamados, acompanha andamento, edita dados principais permitidos e comenta. Nao altera status ou responsavel.

## Fluxo de chamados

Status internos da API:

- `ABERTO`
- `EM_ANDAMENTO`
- `AGUARDANDO_SOLICITANTE`
- `AGUARDANDO_TERCEIROS`
- `CONCLUIDO`
- `CANCELADO`

Mudancas de status sao registradas no historico de auditoria do chamado.

## Variaveis de ambiente

Copie `.env.example` para `.env` antes de subir a stack.

Variaveis obrigatorias para o backend:

| Variavel | Descricao |
| --- | --- |
| `DATABASE_URL` | URL SQLAlchemy usada pelo backend |
| `SECRET_KEY` | Chave de assinatura JWT. Deve ter pelo menos 32 caracteres e nao pode usar valor demo |
| `INITIAL_ADMIN_PASSWORD` | Senha do admin inicial. Deve ter pelo menos 12 caracteres, com letra maiuscula, minuscula e numero |

Demais variaveis:

| Variavel | Descricao |
| --- | --- |
| `POSTGRES_DB` | Nome do banco PostgreSQL |
| `POSTGRES_USER` | Usuario do banco |
| `POSTGRES_PASSWORD` | Senha do banco |
| `ENVIRONMENT` | Ambiente da aplicacao |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duracao do token JWT |
| `BACKEND_CORS_ORIGINS` | Origins permitidas no CORS |
| `INITIAL_ADMIN_NAME` | Nome do admin inicial |
| `INITIAL_ADMIN_EMAIL` | E-mail do admin inicial |
| `UPLOAD_DIR` | Diretorio local onde anexos de chamados sao armazenados |
| `MAX_ATTACHMENT_SIZE_BYTES` | Tamanho maximo por anexo |
| `VITE_API_URL` | URL base da API no frontend |
| `NGINX_PORT` | Porta exposta pelo Nginx |

Se `DATABASE_URL`, `SECRET_KEY` ou `INITIAL_ADMIN_PASSWORD` nao forem configuradas, a aplicacao falha de forma explicita no startup.

## Como subir localmente com Docker

1. Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

2. Ajuste `SECRET_KEY`, senhas e demais variaveis conforme necessario.

3. Suba a stack:

```bash
docker compose up -d --build
```

4. Acesse:

- Frontend: `http://localhost`
- Swagger: `http://localhost/docs`
- Health API: `http://localhost/api/health`
- Health DB: `http://localhost/api/health/db`

O seed cria categorias, setores iniciais e areas/tipos como `VPN`, `IMPRESSORA`, `ACESSO`, `HARDWARE`, `SOFTWARE` e `OUTROS`.

## Como rodar localmente sem Docker

### Backend

Use Python 3.11 ou 3.12. O Dockerfile e o CI usam Python 3.12.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://app_user:app_password@localhost:5432/central_chamados"
export SECRET_KEY="substitua_por_uma_chave_local_com_64_caracteres_ou_mais_1234567890"
export INITIAL_ADMIN_PASSWORD="AdminLocal@123456"
alembic upgrade head
uvicorn app.main:app --reload
```

Em Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:DATABASE_URL="postgresql://app_user:app_password@localhost:5432/central_chamados"
$env:SECRET_KEY="substitua_por_uma_chave_local_com_64_caracteres_ou_mais_1234567890"
$env:INITIAL_ADMIN_PASSWORD="AdminLocal@123456"
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

Configure `VITE_API_URL` se a API nao estiver publicada em `/api`.

## Testes

Os testes automatizados do backend usam SQLite em memoria e nao dependem de PostgreSQL local.

```bash
cd backend
pip install -r requirements.txt
pytest -q
```

## Build

Backend, checagem sintatica:

```bash
cd backend
python -m compileall app
```

Frontend, typecheck e build:

```bash
cd frontend
npm ci
npm run typecheck
npm run build
```

## CI/CD

O workflow em `.github/workflows/ci.yml` roda:

- Backend: instalacao de dependencias, `python -m compileall app` e `pytest -q`.
- Frontend: `npm ci`, `npm run typecheck` e `npm run build`.

Nao ha deploy automatico configurado.

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
- `GET /api/tickets?page=1&per_page=10`
- `POST /api/tickets`
- `GET /api/tickets/{id}`
- `PUT /api/tickets/{id}`
- `POST /api/tickets/{id}/comments`
- `POST /api/tickets/{id}/attachments`
- `GET /api/tickets/{id}/attachments/{attachment_id}`
- `GET /api/dashboard/metrics`
- `GET /api/health`
- `GET /api/health/db`

`GET /api/tickets` retorna:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "per_page": 10,
  "total_pages": 1
}
```

## Funcionalidades implementadas

- Login com JWT.
- Cadastro publico de solicitantes.
- CRUD administrativo de usuarios, categorias legadas, setores, areas de suporte e tipos de suporte vinculados a area.
- Listagem paginada de chamados com busca textual e filtros por status, setor, area, tipo, prioridade, responsavel, solicitante e periodo.
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
- Tratamento padronizado de erros no frontend.
- Logs backend para autenticacao e operacoes relevantes de chamados.
- Docker Compose com `frontend`, `backend`, `postgres` e `nginx`.
- Volume persistente `postgres_data:/var/lib/postgresql/data`.
- Volume persistente `ticket_uploads:/app/uploads` para anexos.
- Testes automatizados de backend.
- Pipeline GitHub Actions sem deploy.

## Prints

Secao reservada para imagens do Nexus:

- Login
- Dashboard
- Lista de chamados
- Detalhe do chamado
- Administracao

## Roadmap futuro

- Recuperacao de senha e convite de usuarios.
- SLA por prioridade, categoria e tempo de espera.
- Armazenamento externo de anexos e politicas avancadas de retencao.
- Notificacoes por e-mail e eventos em tempo real.
- Relatorios exportaveis em CSV/PDF.
- Base de conhecimento integrada aos chamados.
- Testes frontend.
- Pipeline de deploy.
- Configuracao de dominio, HTTPS e renovacao automatica de certificados.
- Observabilidade com logs estruturados, metricas e tracing.
- Backup e recuperacao automatizados do PostgreSQL.
