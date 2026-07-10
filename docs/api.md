# API

The API uses the `/api` prefix. Login follows the OAuth2 form flow and returns a Bearer token.

## Authentication

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Public | Authenticates with username and password |
| POST | `/api/auth/register` | Public | Registers a `SOLICITANTE` |
| GET | `/api/auth/me` | Authenticated | Returns the current user |

Public registration always enforces the `SOLICITANTE` role, ignoring any different role submitted by the client.

## Tickets

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/tickets` | Lists visible tickets with filters and pagination |
| POST | `/api/tickets` | Creates a ticket |
| GET | `/api/tickets/{ticket_id}` | Returns ticket details |
| PUT | `/api/tickets/{ticket_id}` | Updates a ticket according to the current role |
| POST | `/api/tickets/{ticket_id}/comments` | Adds a comment |
| POST | `/api/tickets/{ticket_id}/attachments` | Uploads attachments |
| GET | `/api/tickets/{ticket_id}/attachments/{attachment_id}` | Downloads an attachment |

Available filters include status, category, department, support area, support type, priority, assignee, requester, free text, and creation date range. Pagination accepts up to 100 items per page.

## Administration

Users, categories, departments, support areas, and support types expose administrative operations. Reference-data queries require authentication; creation, updates, and deactivation require the `ADMIN` role.

Main route groups:

- `/api/users`;
- `/api/categories`;
- `/api/sectors`;
- `/api/support-areas`;
- `/api/support-types`.

Administrative deletions are implemented as logical deactivation with `is_active=false`.

## Dashboard and Health

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/dashboard/metrics` | Returns metrics under the current user's visibility rules |
| GET | `/api/health` | Checks process health |
| GET | `/api/health/db` | Validates the database connection |
| GET | `/metrics` | Exposes Prometheus metrics |

The dashboard aggregates totals, states, unassigned tickets, and distributions by category, department, support area, support type, and priority.

## Attachments

- only images and videos are accepted;
- the configurable default limit is 25 MB per file;
- empty files are rejected;
- downloads verify that the attachment belongs to a ticket visible to the current user;
- internal filenames are UUIDs.

## Errors

- `400`: business rule violation or inactive reference data;
- `401`: invalid token or inactive user;
- `403`: operation not allowed for the current role;
- `404`: resource not found;
- `413`: attachment exceeds the size limit;
- `422`: invalid payload.
