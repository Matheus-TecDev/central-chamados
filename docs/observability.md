# Observability

## Metrics

The API uses `prometheus-fastapi-instrumentator` and exposes metrics at `/metrics`.

Prometheus scrapes the backend and tracks HTTP metrics such as request volume, response status, and latency. Grafana starts with a provisioned data source and dashboard.

## Logs

The backend uses Python's standard logging library with timestamp, level, logger, and message fields.

Relevant events include:

- ticket creation and updates;
- comments and attachments;
- attempts to perform forbidden operations;
- initial administrator creation.

Some records include additional context such as `ticket_id`, `actor_id`, changed fields, and attachment count.

## Health Checks

| Endpoint | Check |
| --- | --- |
| `/api/health` | API process is responding |
| `/api/health/db` | Executes `SELECT 1` against the database |
| `/metrics` | Metrics endpoint is available |

In Docker Compose:

- PostgreSQL uses `pg_isready`;
- the backend calls its health endpoint;
- Nginx waits for the backend to become healthy;
- Prometheus starts after the backend is healthy.

## Persistence

Volumes preserve:

- PostgreSQL data;
- attachments;
- Prometheus data;
- Grafana configuration and state.

## Limitations

- Logs are not aggregated with Loki.
- Distributed tracing is not implemented.
- Alertmanager and alerting rules are not configured.
- There are no dedicated business metrics beyond the application dashboard.
- SLOs are not formally defined.
