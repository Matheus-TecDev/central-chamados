# Fluxo de chamados

## Criação

`ADMIN` e `SOLICITANTE` podem abrir chamados. O perfil `TECNICO` é bloqueado nessa operação.

A criação valida:

- categoria ativa;
- setor ativo;
- área de suporte ativa;
- tipo de suporte ativo e pertencente à área;
- prioridade e descrição.

Quando a categoria não é informada, a aplicação utiliza `OUTROS`. O status inicial é `ABERTO` e a auditoria registra `CHAMADO_CRIADO`.

## Estados

- `ABERTO`;
- `EM_ANDAMENTO`;
- `AGUARDANDO_SOLICITANTE`;
- `AGUARDANDO_TERCEIROS`;
- `CONCLUIDO`;
- `CANCELADO`.

O serviço aceita alterações de status conforme a permissão do perfil. Não existe, nesta versão, uma máquina de estados que restrinja formalmente cada transição entre esses valores.

Ao chegar em `CONCLUIDO`, `resolved_at` é preenchido. Em `CONCLUIDO` ou `CANCELADO`, `closed_at` é preenchido. Esses horários não são recalculados depois de definidos.

## Atribuição

- O responsável deve ser um técnico ativo.
- Técnicos visualizam chamados livres ou atribuídos a eles.
- Um técnico só pode assumir um chamado livre e somente para si.
- Administradores podem administrar a atribuição.

## Comentários

Qualquer usuário com acesso ao chamado pode comentar. A operação cria `TicketComment` e auditoria `COMENTARIO_ADICIONADO`.

## Anexos

Qualquer usuário com acesso ao chamado pode enviar imagens ou vídeos. Cada arquivo:

1. é validado por content type e tamanho;
2. recebe nome interno UUID;
3. é salvo no volume de uploads;
4. tem metadados persistidos no banco.

A operação gera auditoria `ANEXO_ADICIONADO`.

## Auditoria

A tabela `ticket_audits` registra:

- chamado;
- ator;
- ação;
- campo alterado;
- valor anterior;
- valor novo;
- data.

Alterações de status usam `STATUS_ALTERADO`; outras alterações usam `CAMPO_ATUALIZADO`.

## Busca e dashboard

A listagem suporta filtros combináveis e paginação. O dashboard utiliza a mesma regra de visibilidade, evitando apresentar agregações de chamados que o usuário não poderia consultar.
