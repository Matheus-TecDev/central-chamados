# Arquitetura

## Visão geral

A Central de Chamados é uma aplicação full stack containerizada. O Nginx publica a interface e encaminha requisições para a API. A API FastAPI aplica autenticação, autorização e regras do fluxo de chamados, persistindo os dados no PostgreSQL.

```text
Cliente -> Nginx -> Frontend React
                 -> API FastAPI -> PostgreSQL
                         |
                         +-> volume de anexos

Prometheus -> API
Grafana    -> Prometheus
```

## Componentes

| Componente | Responsabilidade |
| --- | --- |
| Frontend | Interface de solicitantes, técnicos e administradores |
| Nginx | Entrada única e proxy reverso |
| FastAPI | API, RBAC, regras de chamados, auditoria e uploads |
| PostgreSQL | Dados relacionais e histórico |
| Volume `ticket_uploads` | Arquivos enviados aos chamados |
| Prometheus | Coleta das métricas HTTP |
| Grafana | Visualização das métricas |

## Organização do backend

```text
app/
  api/routes/      Endpoints por domínio
  core/            Configuração, banco, segurança, enums e erros
  models/          Entidades SQLAlchemy
  repositories/    Consultas, filtros e regras de visibilidade
  schemas/         Contratos Pydantic
  services/        Regras de negócio e transações
```

As rotas tratam HTTP e dependências; repositories constroem consultas e visibilidade; services validam regras, persistem alterações e criam registros de auditoria.

## Inicialização

No startup, a aplicação cria dados iniciais quando ausentes:

- categorias;
- setores;
- áreas e tipos de suporte;
- administrador inicial.

As migrações são aplicadas pelo comando do container antes do Uvicorn.

## Modelo de domínio

Principais entidades:

- `User`;
- `Ticket`;
- `Category`;
- `Sector`;
- `SupportArea`;
- `SupportType`;
- `TicketComment`;
- `TicketAttachment`;
- `TicketAudit`.

O chamado referencia solicitante, técnico responsável, categoria, setor, área e tipo de suporte. Comentários, anexos e auditorias pertencem ao chamado.

## Persistência de anexos

Os metadados ficam no PostgreSQL. Os bytes são salvos no volume local com nome interno UUID, preservando o nome original apenas como metadado.

## Limitações atuais

- Os anexos dependem de filesystem compartilhado e não suportam múltiplas réplicas sem storage externo.
- Seed e API compartilham o mesmo processo de inicialização.
- Não há processamento assíncrono nem notificações em tempo real.
- Não há SLA automatizado.
- O ambiente atual é Docker Compose, sem infraestrutura cloud declarada.
