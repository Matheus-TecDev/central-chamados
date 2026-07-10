# TicketOps

TicketOps is a full-stack platform for internal service desk and technical support management, built with FastAPI, PostgreSQL, React, Docker, and observability tooling.

The system structures ticket creation, assignment, and tracking, enforces role-based access control, and maintains an audit trail of operational changes.

## Technology Stack

| Area | Technologies |
| --- | --- |
| Backend | Python, FastAPI, SQLAlchemy, Alembic, Pydantic, Pytest |
| Frontend | React, TypeScript, Vite, React Router |
| Data | PostgreSQL |
| Security | JWT, RBAC |
| Observability | Prometheus, Grafana, structured logs |
| Infrastructure | Docker Compose, Nginx, GitHub Actions |

## Problem

Internal requests handled through isolated messages and conversations lose context, ownership, and history. Central de Chamados structures this process in a single application with defined states, technical assignment, comments, attachments, and auditing.

## Features

- Ticket creation and tracking.
- Assignment and handling by technicians.
- Operational status workflow.
- Comments and attachments.
- History and audit trail.
- Management of users, categories, departments, and support areas.
- Filters and operational dashboard.
- JWT authentication and role-based access control.
- Prometheus metrics and Grafana dashboard.
- Nginx reverse proxy.
- Automated backend tests.
- CI pipeline with tests, type checking, and build validation.

## Architecture

```text
User -> Nginx -> React
                -> FastAPI -> PostgreSQL
                      |
                      +-> Persistent attachments

Prometheus -> FastAPI
Grafana    -> Prometheus
```

## Ticket Workflow

Supported states:

- `ABERTO`
- `EM_ANDAMENTO`
- `AGUARDANDO_SOLICITANTE`
- `AGUARDANDO_TERCEIROS`
- `CONCLUIDO`
- `CANCELADO`

Relevant changes are recorded in the audit trail.

## Access Roles

| Role | Permissions |
| --- | --- |
| `ADMIN` | Manages users, reference data, and all tickets |
| `TECNICO` | Claims tickets, updates status, comments, and completes requests |
| `SOLICITANTE` | Creates tickets and tracks their own requests |

## Running Locally

```bash
cp .env.example .env
docker compose up -d --build
```

Main URLs:

- Application: http://localhost
- API: http://localhost/api
- Swagger UI: http://localhost/docs
- Health check: http://localhost/api/health
- Metrics: http://localhost/metrics
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

## Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Authenticates a user |
| `POST` | `/api/auth/register` | Registers a requester |
| `GET` | `/api/auth/me` | Returns the authenticated user |
| `GET` | `/api/tickets` | Lists tickets visible to the current role |
| `POST` | `/api/tickets` | Creates a ticket |
| `GET` | `/api/tickets/{id}` | Returns ticket details |
| `PUT` | `/api/tickets/{id}` | Updates a ticket |
| `POST` | `/api/tickets/{id}/comments` | Adds a comment |
| `POST` | `/api/tickets/{id}/attachments` | Uploads an attachment |
| `GET` | `/api/users` | Lists users |
| `POST` | `/api/users` | Creates a user |
| `GET` | `/api/categories` | Lists categories |
| `GET` | `/api/sectors` | Lists departments |
| `GET` | `/api/dashboard/metrics` | Returns operational metrics |
| `GET` | `/api/health` | Checks API health |
| `GET` | `/metrics` | Exposes Prometheus metrics |

## Project Structure

```text
backend/      API, business rules, persistence, and tests
frontend/     React web interface
nginx/        Reverse proxy
prometheus/   Metrics collection
grafana/      Provisioned data source and dashboard
.github/      Continuous integration pipeline
```

## Documentation

| Document | Coverage |
| --- | --- |
| [Architecture](docs/architecture.md) | Components, domain model, persistence, and limitations |
| [API](docs/api.md) | Endpoints, filters, attachments, and errors |
| [Authentication and RBAC](docs/authentication-and-rbac.md) | JWT, visibility rules, and permission matrix |
| [Ticket workflow](docs/ticket-workflow.md) | Creation, states, assignment, and auditing |
| [Observability](docs/observability.md) | Metrics, logs, health checks, and current gaps |

## Validation

```bash
cd backend
pytest -q
python -m compileall app

cd ../frontend
npm ci
npm run typecheck
npm run build
```

The CI pipeline automatically runs backend tests, frontend type checking, and the frontend build.

## Status

**MVP complete.**

The initial scope covers authentication, RBAC, the complete ticket workflow, comments, attachments, auditing, the operational dashboard, observability, and containerized execution. SLAs, real-time notifications, and automated deployment remain planned improvements.
