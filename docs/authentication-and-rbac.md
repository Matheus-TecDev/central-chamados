# Authentication and RBAC

## Authentication

1. The client submits an OAuth2 form to `POST /api/auth/login`.
2. The API validates the credentials.
3. An HS256 JWT is issued with a configurable expiration.
4. The token is sent as `Authorization: Bearer <token>`.
5. The API decodes the token and loads the user identified by `sub`.
6. Missing or inactive users receive `401`.

Passwords are hashed with bcrypt through Passlib.

## Roles

| Capability | ADMIN | TECNICO | SOLICITANTE |
| --- | :---: | :---: | :---: |
| Manage users and reference data | Yes | No | No |
| View all tickets | Yes | No | No |
| View assigned or unassigned tickets | Yes | Yes | No |
| View own tickets | Yes | No | Yes |
| Create tickets | Yes | No | Yes |
| Claim an unassigned ticket | Yes | Yes | No |
| Change status | Yes | Yes | No |
| Change descriptive fields | Yes | No | Yes, on own tickets |
| Comment and attach files to visible tickets | Yes | Yes | Yes |

## Visibility

- `ADMIN`: all tickets;
- `TECNICO`: tickets assigned to the technician or currently unassigned;
- `SOLICITANTE`: only tickets created by the requester.

The same visibility query is reused for ticket lists, details, and dashboard metrics.

## Update Rules

- Requesters may change only descriptive and classification fields.
- Technicians may change only status and assignee.
- A technician may claim only an unassigned ticket and only for themselves.
- The assignee must exist, be active, and have the `TECNICO` role.
- Administrators are not subject to these role-specific field restrictions.

## Public Registration

`POST /api/auth/register` always creates a `SOLICITANTE`. Privileged roles are created through administrative operations.

## Current Limitations

- There are no refresh tokens, MFA, or per-token revocation.
- Valid tokens remain usable until expiration unless the user is deactivated.
- TLS depends on the deployment environment.
