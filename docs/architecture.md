# Architecture

## Overview

Central de Chamados is a containerized full-stack application. Nginx serves the interface and forwards requests to the API. The FastAPI backend enforces authentication, authorization, and ticket workflow rules while persisting data in PostgreSQL.

```text
Client -> Nginx -> React frontend
                  -> FastAPI API -> PostgreSQL
                           |
                           +-> attachment volume

Prometheus -> API
Grafana    -> Prometheus
```

## Components

| Component | Responsibility |
| --- | --- |
| Frontend | Interface for requesters, technicians, and administrators |
| Nginx | Single entry point and reverse proxy |
| FastAPI | API, RBAC, ticket rules, auditing, and uploads |
| PostgreSQL | Relational data and history |
| `ticket_uploads` volume | Files attached to tickets |
| Prometheus | HTTP metrics collection |
| Grafana | Metrics visualization |

## Backend Organization

```text
app/
  api/routes/      Domain-specific endpoints
  core/            Configuration, database, security, enums, and errors
  models/          SQLAlchemy entities
  repositories/    Queries, filters, and visibility rules
  schemas/         Pydantic contracts
  services/        Business rules and transactions
```

Routes handle HTTP concerns and dependencies; repositories build queries and enforce visibility; services validate rules, persist changes, and create audit records.

## Initialization

At startup, the application creates initial data when missing:

- categories;
- departments;
- support areas and types;
- initial administrator.

The container applies migrations before starting Uvicorn.

## Domain Model

Main entities:

- `User`;
- `Ticket`;
- `Category`;
- `Sector`;
- `SupportArea`;
- `SupportType`;
- `TicketComment`;
- `TicketAttachment`;
- `TicketAudit`.

A ticket references its requester, assigned technician, category, department, support area, and support type. Comments, attachments, and audit records belong to the ticket.

## Attachment Persistence

Metadata is stored in PostgreSQL. File contents are saved in the local volume under an internal UUID-based name, while the original filename is preserved only as metadata.

## Current Limitations

- Attachments depend on a shared filesystem and do not support multiple replicas without external storage.
- Seed operations and the API share the same initialization process.
- There is no asynchronous processing or real-time notification mechanism.
- SLAs are not automated.
- The current environment uses Docker Compose and has no declared cloud infrastructure.
