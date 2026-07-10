# API

A API usa o prefixo `/api`. O login utiliza formulário OAuth2 e retorna um Bearer token.

## Autenticação

| Método | Endpoint | Acesso | Descrição |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Público | Autentica por usuário e senha |
| POST | `/api/auth/register` | Público | Registra um `SOLICITANTE` |
| GET | `/api/auth/me` | Autenticado | Retorna usuário atual |

O registro público força o perfil `SOLICITANTE`, ignorando um perfil diferente enviado pelo cliente.

## Chamados

| Método | Endpoint | Descrição |
| --- | --- |
| GET | `/api/tickets` | Lista chamados visíveis com filtros e paginação |
| POST | `/api/tickets` | Abre chamado |
| GET | `/api/tickets/{ticket_id}` | Retorna detalhes |
| PUT | `/api/tickets/{ticket_id}` | Atualiza conforme o perfil |
| POST | `/api/tickets/{ticket_id}/comments` | Adiciona comentário |
| POST | `/api/tickets/{ticket_id}/attachments` | Envia anexos |
| GET | `/api/tickets/{ticket_id}/attachments/{attachment_id}` | Baixa anexo |

Filtros disponíveis: status, categoria, setor, área, tipo, prioridade, responsável, solicitante, texto e intervalo de criação. A paginação aceita até 100 itens por página.

## Administração

Usuários, categorias, setores, áreas e tipos possuem operações administrativas. Consultas auxiliares exigem autenticação; criação, atualização e desativação exigem `ADMIN`.

Principais grupos:

- `/api/users`;
- `/api/categories`;
- `/api/sectors`;
- `/api/support-areas`;
- `/api/support-types`.

Exclusões administrativas são desativações lógicas por `is_active=false`.

## Dashboard e saúde

| Método | Endpoint | Descrição |
| --- | --- |
| GET | `/api/dashboard/metrics` | Métricas respeitando a visibilidade do usuário |
| GET | `/api/health` | Saúde do processo |
| GET | `/api/health/db` | Valida conexão com o banco |
| GET | `/metrics` | Métricas Prometheus |

O dashboard agrega total, estados, chamados sem responsável e distribuições por categoria, setor, área, tipo e prioridade.

## Anexos

- somente imagens e vídeos;
- limite configurável, padrão de 25 MB por arquivo;
- arquivos vazios são rejeitados;
- o download verifica se o anexo pertence ao chamado visível;
- nomes internos são UUIDs.

## Erros

- `400`: regra de negócio ou cadastro inativo;
- `401`: token inválido ou usuário inativo;
- `403`: operação incompatível com o perfil;
- `404`: recurso não encontrado;
- `413`: anexo acima do limite;
- `422`: payload inválido.
