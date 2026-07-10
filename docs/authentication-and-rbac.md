# Autenticação e RBAC

## Autenticação

1. O cliente envia formulário OAuth2 para `POST /api/auth/login`.
2. A API valida as credenciais.
3. Um JWT HS256 é emitido com expiração configurável.
4. O token é enviado como `Authorization: Bearer <token>`.
5. A API decodifica o token e carrega o usuário pelo `sub`.
6. Usuários ausentes ou inativos recebem `401`.

As senhas são armazenadas com bcrypt por meio do Passlib.

## Perfis

| Capacidade | ADMIN | TECNICO | SOLICITANTE |
| --- | :---: | :---: | :---: |
| Gerenciar usuários e cadastros | Sim | Não | Não |
| Visualizar todos os chamados | Sim | Não | Não |
| Visualizar chamados atribuídos ou livres | Sim | Sim | Não |
| Visualizar os próprios chamados | Sim | Não | Sim |
| Criar chamados | Sim | Não | Sim |
| Assumir chamado livre | Sim | Sim | Não |
| Alterar status | Sim | Sim | Não |
| Alterar dados descritivos | Sim | Não | Sim, nos próprios |
| Comentar e anexar em chamado visível | Sim | Sim | Sim |

## Visibilidade

- `ADMIN`: todos os chamados;
- `TECNICO`: chamados atribuídos a ele ou sem responsável;
- `SOLICITANTE`: somente chamados criados por ele.

A mesma consulta de visibilidade é reutilizada na listagem, detalhes e dashboard.

## Regras de atualização

- Solicitantes só alteram campos descritivos e de classificação.
- Técnicos só alteram status e responsável.
- Um técnico só pode assumir para si um chamado ainda sem responsável.
- O responsável precisa existir, estar ativo e possuir perfil `TECNICO`.
- Administradores não sofrem essas restrições específicas de campo.

## Registro público

`POST /api/auth/register` sempre cria `SOLICITANTE`. Perfis privilegiados são criados pela administração.

## Limitações atuais

- Não há refresh token, MFA ou revogação individual.
- Tokens válidos continuam utilizáveis até expirar, salvo se o usuário for desativado.
- TLS depende do ambiente de implantação.
