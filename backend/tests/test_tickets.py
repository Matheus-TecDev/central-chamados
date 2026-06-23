from fastapi.testclient import TestClient

from conftest import auth_headers


def ticket_payload(title: str = "Erro no sistema") -> dict[str, object]:
    return {
        "title": title,
        "description": "Descricao detalhada do problema encontrado.",
        "priority": "MEDIA",
        "category_id": 1,
        "sector_id": 1,
        "support_area_id": 1,
        "support_type_id": 1,
    }


def create_ticket(client: TestClient, headers: dict[str, str], title: str = "Erro no sistema") -> dict[str, object]:
    response = client.post("/api/tickets", json=ticket_payload(title), headers=headers)
    assert response.status_code == 201, response.text
    return response.json()


def test_requester_can_create_ticket(client: TestClient) -> None:
    headers = auth_headers(client, "solicitante@example.com", "SolicitanteTest@123")

    response = client.post("/api/tickets", json=ticket_payload(), headers=headers)

    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Erro no sistema"
    assert body["status"] == "ABERTO"
    assert body["requester"]["email"] == "solicitante@example.com"


def test_technician_cannot_create_ticket(client: TestClient) -> None:
    headers = auth_headers(client, "tecnico@example.com", "TecnicoTest@123")

    response = client.post("/api/tickets", json=ticket_payload(), headers=headers)

    assert response.status_code == 403
    assert response.json()["error"]["message"] == "Tecnico nao pode criar chamados."


def test_inactive_category_cannot_be_used(client: TestClient) -> None:
    headers = auth_headers(client, "solicitante@example.com", "SolicitanteTest@123")
    payload = ticket_payload()
    payload["category_id"] = 2

    response = client.post("/api/tickets", json=payload, headers=headers)

    assert response.status_code == 400
    assert response.json()["error"]["message"] == "Categoria inativa nao pode ser usada."


def test_ticket_listing_is_paginated_and_scoped_by_requester(client: TestClient) -> None:
    requester_headers = auth_headers(client, "solicitante@example.com", "SolicitanteTest@123")
    other_headers = auth_headers(client, "outro@example.com", "OutroTest@123")
    for index in range(12):
        create_ticket(client, requester_headers, f"Chamado paginado {index}")
    create_ticket(client, other_headers, "Chamado de outro solicitante")

    response = client.get("/api/tickets?page=2&per_page=5", headers=requester_headers)

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 12
    assert body["page"] == 2
    assert body["per_page"] == 5
    assert body["total_pages"] == 3
    assert len(body["items"]) == 5
    assert all(item["requester"]["email"] == "solicitante@example.com" for item in body["items"])


def test_admin_assigns_and_technician_updates_ticket(client: TestClient) -> None:
    requester_headers = auth_headers(client, "solicitante@example.com", "SolicitanteTest@123")
    admin_headers = auth_headers(client, "admin@example.com", "AdminTest@123")
    technician_headers = auth_headers(client, "tecnico@example.com", "TecnicoTest@123")
    ticket = create_ticket(client, requester_headers)

    assign_response = client.put(
        f"/api/tickets/{ticket['id']}",
        json={"assignee_id": 2},
        headers=admin_headers,
    )
    assert assign_response.status_code == 200
    assert assign_response.json()["assignee"]["email"] == "tecnico@example.com"

    status_response = client.put(
        f"/api/tickets/{ticket['id']}",
        json={"status": "EM_ANDAMENTO"},
        headers=technician_headers,
    )
    assert status_response.status_code == 200
    assert status_response.json()["status"] == "EM_ANDAMENTO"

    priority_response = client.put(
        f"/api/tickets/{ticket['id']}",
        json={"priority": "ALTA"},
        headers=admin_headers,
    )
    assert priority_response.status_code == 200
    assert priority_response.json()["priority"] == "ALTA"


def test_requester_cannot_update_status(client: TestClient) -> None:
    requester_headers = auth_headers(client, "solicitante@example.com", "SolicitanteTest@123")
    ticket = create_ticket(client, requester_headers)

    response = client.put(
        f"/api/tickets/{ticket['id']}",
        json={"status": "CONCLUIDO"},
        headers=requester_headers,
    )

    assert response.status_code == 403
    assert response.json()["error"]["message"] == "Solicitante nao pode alterar este campo."


def test_ticket_create_validates_payload(client: TestClient) -> None:
    requester_headers = auth_headers(client, "solicitante@example.com", "SolicitanteTest@123")

    response = client.post(
        "/api/tickets",
        json={
            "title": "Oi",
            "description": "curta",
            "priority": "MEDIA",
            "category_id": 1,
            "sector_id": 1,
            "support_area_id": 1,
            "support_type_id": 1,
        },
        headers=requester_headers,
    )

    assert response.status_code == 422
    assert response.json()["error"]["message"] == "Erro de validacao dos dados enviados."
