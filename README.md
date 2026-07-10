# Central de Chamados

Central de Chamados é uma plataforma full stack para gestão de atendimento interno e suporte técnico, construída com FastAPI, PostgreSQL, React, Docker e ferramentas de observabilidade.

O sistema organiza a abertura, atribuição e acompanhamento de chamados, aplica controle de acesso por perfil e mantém uma trilha de auditoria das operações.

## Tecnologias

| Área | Tecnologias |
| --- | --- |
| Backend | Python, FastAPI, SQLAlchemy, Alembic, Pydantic, Pytest |
| Frontend | React, TypeScript, Vite, React Router |
| Dados | PostgreSQL |
| Segurança | JWT, RBAC |
| Observabilidade | Prometheus, Grafana, logs estruturados |
| Infraestrutura | Docker Compose, Nginx, GitHub Actions |

## Problema

Solicitações internas tratadas por mensagens e conversas isoladas perdem contexto, responsáveis e histórico. A Central de Chamados estrutura esse fluxo em uma aplicação única, com estados definidos, atribuição técnica, comentários, anexos e auditoria.

## Funcionalidades

- Abertura e acompanhamento de chamados.
- Atribuição e atendimento por técnicos.
- Fluxo de status operacional.
- Comentários e anexos.
- Histórico e trilha de auditoria.
- Gestão de usuários, categorias, setores e áreas de suporte.
- Filtros e dashboard operacional.
- Autenticação JWT e controle de acesso por perfil.
- Métricas Prometheus e dashboard Grafana.
- Proxy reverso com Nginx.
- Testes automatizados de backend.
- CI com testes, typecheck e build.

## Arquitetura

```text
Usuário -> Nginx -> React
                 -> FastAPI -> PostgreSQL
                       |
                       +-> Anexos persistentes

Prometheus -> FastAPI
Grafana    -> Prometheus
```

## Fluxo dos chamados

Estados suportados:

- `ABERTO`
- `EM_ANDAMENTO`
- `AGUARDANDO_SOLICITANTE`
- `AGUARDANDO_TERCEIROS`
- `CONCLUIDO`
- `CANCELADO`

As alterações relevantes são registradas na trilha de auditoria.

## Perfis de acesso

| Perfil | Permissões |
| --- | --- |
| `ADMIN` | Gerencia usuários, cadastros auxiliares e todos os chamados |
| `TECNICO` | Assume chamados, atualiza status, comenta e conclui atendimentos |
| `SOLICITANTE` | Abre chamados e acompanha as próprias solicitações |

## Como executar

```bash
cp .env.example .env
docker compose up -d --build
```

URLs principais:

- Aplicação: http://localhost
- API: http://localhost/api
- Swagger: http://localhost/docs
- Health check: http://localhost/api/health
- Métricas: http://localhost/metrics
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

## Endpoints

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Autentica o usuário |
| `POST` | `/api/auth/register` | Cadastra um solicitante |
| `GET` | `/api/auth/me` | Retorna o usuário autenticado |
| `GET` | `/api/tickets` | Lista os chamados permitidos ao perfil |
| `POST` | `/api/tickets` | Abre um chamado |
| `GET` | `/api/tickets/{id}` | Detalha um chamado |
| `PUT` | `/api/tickets/{id}` | Atualiza um chamado |
| `POST` | `/api/tickets/{id}/comments` | Adiciona um comentário |
| `POST` | `/api/tickets/{id}/attachments` | Envia um anexo |
| `GET` | `/api/users` | Lista usuários |
| `POST` | `/api/users` | Cria um usuário |
| `GET` | `/api/categories` | Lista categorias |
| `GET` | `/api/sectors` | Lista setores |
| `GET` | `/api/dashboard/metrics` | Retorna métricas operacionais |
| `GET` | `/api/health` | Verifica a saúde da API |
| `GET` | `/metrics` | Expõe métricas Prometheus |

## Estrutura

```text
backend/      API, regras de negócio, persistência e testes
frontend/     Interface web em React
nginx/        Proxy reverso
prometheus/   Coleta de métricas
grafana/      Datasource e dashboard provisionados
.github/      Pipeline de integração contínua
```

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [Arquitetura](docs/architecture.md) | Componentes, domínio, persistência e limitações |
| [API](docs/api.md) | Endpoints, filtros, anexos e erros |
| [Autenticação e RBAC](docs/authentication-and-rbac.md) | JWT, visibilidade e matriz de permissões |
| [Fluxo de chamados](docs/ticket-workflow.md) | Criação, estados, atribuição e auditoria |
| [Observabilidade](docs/observability.md) | Métricas, logs, health checks e lacunas |

## Validação

```bash
cd backend
pytest -q
python -m compileall app

cd ../frontend
npm ci
npm run typecheck
npm run build
```

O pipeline executa automaticamente os testes do backend, o typecheck e o build do frontend.

## Status

**MVP concluído.**

O primeiro escopo cobre autenticação, RBAC, fluxo completo de chamados, comentários, anexos, auditoria, dashboard, observabilidade e execução containerizada. SLA, notificações em tempo real e deploy automatizado permanecem como evoluções futuras.
