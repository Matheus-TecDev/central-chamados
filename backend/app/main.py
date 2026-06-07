from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from app.api.router import api_router
from app.core.config import settings
from app.core.database import SessionLocal
from app.core.enums import UserRole
from app.core.exceptions import register_exception_handlers
from app.models.category import Category
from app.models.support import Sector, SupportArea, SupportType
from app.models.user import User
from app.services.users import create_user
from app.schemas.user import UserCreate

INITIAL_CATEGORIES = [
    "SISTEMA",
    "INFRAESTRUTURA",
    "REDE",
    "BANCO_DE_DADOS",
    "ACESSO",
    "IMPRESSORA",
    "HARDWARE",
    "SOFTWARE",
    "OUTROS",
]

INITIAL_SECTORS = [
    "ADMINISTRATIVO",
    "FINANCEIRO",
    "OPERACOES",
    "RECURSOS_HUMANOS",
    "TECNOLOGIA",
    "OUTROS",
]

INITIAL_SUPPORT_AREAS: dict[str, list[str]] = {
    "VPN": ["VPN NAO CONECTA", "ERRO DE SENHA", "CONECTA MAS NAO ACESSA SERVIDOR"],
    "IMPRESSORA": ["NAO IMPRIME", "IMPRESSAO TRAVADA", "FALHA DE CONEXAO", "TONER OU PAPEL"],
    "ACESSO": ["RESET DE SENHA", "PERMISSAO DE SISTEMA", "USUARIO BLOQUEADO"],
    "HARDWARE": ["COMPUTADOR LENTO", "MONITOR OU PERIFERICO", "EQUIPAMENTO NAO LIGA"],
    "SOFTWARE": ["INSTALACAO", "ERRO AO ABRIR", "ATUALIZACAO"],
    "OUTROS": ["OUTROS"],
}


def seed_initial_data() -> None:
    db = SessionLocal()
    try:
        for name in INITIAL_CATEGORIES:
            if not db.scalar(select(Category).where(Category.name == name)):
                db.add(Category(name=name, description=f"Chamados de {name.lower().replace('_', ' ')}"))
        db.commit()

        for name in INITIAL_SECTORS:
            if not db.scalar(select(Sector).where(Sector.name == name)):
                db.add(Sector(name=name, description=f"Setor {name.lower().replace('_', ' ')}"))
        db.commit()

        for area_name, type_names in INITIAL_SUPPORT_AREAS.items():
            area = db.scalar(select(SupportArea).where(SupportArea.name == area_name))
            if not area:
                area = SupportArea(name=area_name, description=f"Area de suporte {area_name.lower().replace('_', ' ')}")
                db.add(area)
                db.flush()
            for type_name in type_names:
                if not db.scalar(
                    select(SupportType).where(
                        SupportType.support_area_id == area.id,
                        SupportType.name == type_name,
                    )
                ):
                    db.add(
                        SupportType(
                            support_area_id=area.id,
                            name=type_name,
                            description=f"Tipo de suporte {type_name.lower().replace('_', ' ')}",
                        )
                    )
        db.commit()

        if not db.scalar(select(User).where(User.email == settings.INITIAL_ADMIN_EMAIL)):
            create_user(
                db,
                UserCreate(
                    name=settings.INITIAL_ADMIN_NAME,
                    email=settings.INITIAL_ADMIN_EMAIL,
                    password=settings.INITIAL_ADMIN_PASSWORD,
                    role=UserRole.ADMIN,
                    is_active=True,
                ),
            )
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    seed_initial_data()
    yield


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(api_router, prefix=settings.API_PREFIX)
