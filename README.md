# Central Chamados

Central Chamados é uma plataforma full stack para gestão de atendimento interno, suporte técnico e operações corporativas.

O projeto foi desenvolvido para simular um ambiente empresarial real, contemplando abertura e acompanhamento de chamados, autenticação JWT, controle de acesso por perfil, auditoria, métricas operacionais, observabilidade e arquitetura baseada em containers.

## Objetivo técnico

Demonstrar competências práticas em backend, arquitetura de sistemas, bancos de dados, infraestrutura, observabilidade e desenvolvimento full stack.

O projeto cobre:

- API REST desenvolvida com FastAPI.
- Persistência relacional utilizando PostgreSQL.
- Controle de acesso baseado em perfis (RBAC).
- Autenticação JWT.
- Frontend React responsivo.
- Observabilidade com Prometheus e Grafana.
- Infraestrutura baseada em Docker Compose e Nginx.
- Testes automatizados e pipeline de integração contínua.

## Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL
- JWT
- Pytest

### Frontend

- React
- TypeScript
- Vite
- React Router
- React Select

### Infraestrutura

- Docker
- Docker Compose
- Nginx
- Prometheus
- Grafana
- GitHub Actions

## Arquitetura

```text
central-chamados/
  frontend/         Aplicação React + TypeScript
  backend/          API FastAPI organizada em camadas
  nginx/            Reverse proxy
  .github/          Pipeline CI
  docker-compose.yml
```

## Fluxo da aplicação

```text
Usuário -> Nginx
Nginx /        -> Frontend
Nginx /api     -> Backend
Nginx /metrics -> Backend
Backend        -> PostgreSQL
Prometheus     -> Backend
Grafana        -> Prometheus
```

## Perfis de acesso

### ADMIN

- Gerencia usuários.
- Gerencia categorias, setores e áreas.
- Visualiza todos os chamados.
- Altera qualquer chamado.
- Realiza atribuições.

### TECNICO

- Assume chamados disponíveis.
- Atualiza status.
- Conclui atendimentos.
- Adiciona comentários.

### SOLICITANTE

- Abre chamados.
- Visualiza apenas seus próprios chamados.
- Acompanha andamento.
- Adiciona comentários.

## Fluxo operacional

Status suportados:

- `ABERTO`
- `EM_ANDAMENTO`
- `AGUARDANDO_SOLICITANTE`
- `AGUARDANDO_TERCEIROS`
- `CONCLUIDO`
- `CANCELADO`

Todas as alterações são registradas em trilha de auditoria.

## Funcionalidades implementadas

- Login com JWT.
- Cadastro público de solicitantes.
- RBAC por perfil.
- CRUD administrativo.
- Gestão de categorias, setores e áreas.
- Sistema completo de chamados.
- Comentários.
- Histórico e auditoria.
- Dashboard operacional.
- Filtros avançados.
- Upload de anexos.
- Métricas Prometheus.
- Dashboard Grafana.
- Logs estruturados.
- Docker Compose.
- Pipeline CI.
- Testes automatizados.

## Observabilidade

O backend expõe métricas Prometheus em `/metrics`.

As métricas permitem acompanhar:

- volume de requisições;
- latência;
- erros HTTP;
- throughput;
- disponibilidade da aplicação.

A stack sobe automaticamente com:

- Prometheus;
- Grafana;
- dashboard provisionado.

## Como executar com Docker

```bash
cp .env.example .env
docker compose up -d --build
```

Acesse:

- Frontend: `http://localhost`
- API: `http://localhost/api`
- Swagger: `http://localhost/docs`
- Health: `http://localhost/api/health`
- Metrics: `http://localhost/metrics`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`

## Execução local

### Backend

```bash
cd backend
python -m venv .venv
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Endpoints principais

### Autenticação

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`

### Chamados

- `GET /api/tickets`
- `POST /api/tickets`
- `GET /api/tickets/{id}`
- `PUT /api/tickets/{id}`
- `POST /api/tickets/{id}/comments`
- `POST /api/tickets/{id}/attachments`

### Administração

- `GET /api/users`
- `POST /api/users`
- `GET /api/categories`
- `GET /api/sectors`
- `GET /api/support-areas`
- `GET /api/support-types`

### Monitoramento

- `GET /api/dashboard/metrics`
- `GET /api/health`
- `GET /api/health/db`
- `GET /metrics`

## Validação

```bash
cd backend
pytest -q
python -m compileall app

cd ../frontend
npm run typecheck
npm run build
```

## Roadmap

- Recuperação de senha.
- SLA por prioridade.
- Notificações em tempo real.
- Exportação CSV/PDF.
- Base de conhecimento integrada.
- Observabilidade avançada.
- Deploy automatizado.
- Backup automatizado.
- Tracing distribuído.

## Status

Projeto em evolução com foco em demonstrar arquitetura corporativa, backend moderno, observabilidade e práticas de infraestrutura aplicadas a sistemas internos.