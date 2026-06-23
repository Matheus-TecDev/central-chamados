from fastapi.testclient import TestClient

from conftest import auth_headers


def test_login_success_and_me(client: TestClient) -> None:
    response = client.post("/api/auth/login", data={"username": "admin@example.com", "password": "AdminTest@123"})

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["role"] == "ADMIN"

    me_response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {body['access_token']}"})
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "admin@example.com"


def test_login_invalid_credentials_returns_401(client: TestClient) -> None:
    response = client.post("/api/auth/login", data={"username": "admin@example.com", "password": "senha-errada"})

    assert response.status_code == 401
    assert response.json()["error"]["message"] == "Credenciais invalidas."


def test_rbac_blocks_non_admin_from_user_listing(client: TestClient) -> None:
    requester_headers = auth_headers(client, "solicitante@example.com", "SolicitanteTest@123")

    response = client.get("/api/users", headers=requester_headers)

    assert response.status_code == 403
    assert response.json()["error"]["message"] == "Acesso negado."


def test_admin_can_list_users(client: TestClient) -> None:
    admin_headers = auth_headers(client, "admin@example.com", "AdminTest@123")

    response = client.get("/api/users", headers=admin_headers)

    assert response.status_code == 200
    assert len(response.json()) == 4


def test_validation_error_does_not_echo_password(client: TestClient) -> None:
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Usuario Teste",
            "email": "novo@example.com",
            "password": "senhafraca",
            "role": "SOLICITANTE",
            "is_active": True,
        },
    )

    assert response.status_code == 422
    body = response.json()
    assert body["error"]["message"] == "Erro de validacao dos dados enviados."
    assert "senhafraca" not in response.text
