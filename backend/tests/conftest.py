import os
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test_secret_key_with_more_than_32_characters_123456")
os.environ.setdefault("INITIAL_ADMIN_PASSWORD", "AdminTest@123456")

from app.core.database import Base, get_db  # noqa: E402
from app.core.enums import UserRole  # noqa: E402
from app.core.security import get_password_hash  # noqa: E402
from app.main import app  # noqa: E402
from app.models import audit, attachment, category, comment, support, ticket, user  # noqa: F401,E402
from app.models.category import Category  # noqa: E402
from app.models.support import Sector, SupportArea, SupportType  # noqa: E402
from app.models.user import User  # noqa: E402

engine = create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture()
def db() -> Generator[Session, None, None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        seed_test_data(session)
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db

    app.dependency_overrides[get_db] = override_get_db
    test_client = TestClient(app)
    yield test_client
    test_client.close()
    app.dependency_overrides.clear()


def seed_test_data(db: Session) -> None:
    db.add_all(
        [
            User(
                name="Admin",
                email="admin@example.com",
                hashed_password=get_password_hash("AdminTest@123"),
                role=UserRole.ADMIN,
                is_active=True,
            ),
            User(
                name="Tecnico",
                email="tecnico@example.com",
                hashed_password=get_password_hash("TecnicoTest@123"),
                role=UserRole.TECNICO,
                is_active=True,
            ),
            User(
                name="Solicitante",
                email="solicitante@example.com",
                hashed_password=get_password_hash("SolicitanteTest@123"),
                role=UserRole.SOLICITANTE,
                is_active=True,
            ),
            User(
                name="Outro Solicitante",
                email="outro@example.com",
                hashed_password=get_password_hash("OutroTest@123"),
                role=UserRole.SOLICITANTE,
                is_active=True,
            ),
            Category(name="SISTEMA", description="Sistemas", is_active=True),
            Category(name="INATIVA", description="Categoria inativa", is_active=False),
            Sector(name="TECNOLOGIA", description="Tecnologia", is_active=True),
            Sector(name="INATIVO", description="Setor inativo", is_active=False),
            SupportArea(name="ACESSO", description="Acesso", is_active=True),
            SupportArea(name="AREA_INATIVA", description="Area inativa", is_active=False),
        ]
    )
    db.flush()
    db.add_all(
        [
            SupportType(name="RESET DE SENHA", description="Reset de senha", support_area_id=1, is_active=True),
            SupportType(name="TIPO INATIVO", description="Tipo inativo", support_area_id=1, is_active=False),
        ]
    )
    db.commit()


def auth_headers(client: TestClient, email: str, password: str) -> dict[str, str]:
    response = client.post("/api/auth/login", data={"username": email, "password": password})
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
