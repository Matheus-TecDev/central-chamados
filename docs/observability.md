# Observabilidade

## Métricas

A API usa `prometheus-fastapi-instrumentator` e expõe métricas em `/metrics`.

O Prometheus coleta o backend e permite acompanhar métricas HTTP como volume, status e latência. O Grafana é iniciado com datasource e dashboard provisionados.

## Logs

O backend usa logging da biblioteca padrão com timestamp, nível, logger e mensagem.

Eventos relevantes incluem:

- criação e atualização de chamado;
- comentários e anexos;
- tentativas de operações proibidas;
- criação do administrador inicial.

Alguns registros incluem contexto adicional, como `ticket_id`, `actor_id`, campos alterados e quantidade de anexos.

## Health checks

| Endpoint | Verificação |
| --- | --- |
| `/api/health` | Processo da API respondendo |
| `/api/health/db` | Execução de `SELECT 1` no banco |
| `/metrics` | Exposição das métricas |

No Docker Compose:

- PostgreSQL usa `pg_isready`;
- backend consulta seu health endpoint;
- Nginx aguarda backend saudável;
- Prometheus inicia após o backend estar saudável.

## Persistência

Volumes preservam:

- PostgreSQL;
- anexos;
- dados do Prometheus;
- configuração e estado do Grafana.

## Limitações

- Não há agregação de logs com Loki.
- Não há tracing distribuído.
- Não há Alertmanager nem regras de alerta.
- Não há métricas de negócio específicas além do dashboard da aplicação.
- Não há definição formal de SLOs.
