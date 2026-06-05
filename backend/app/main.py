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


def seed_initial_data() -> None:
    db = SessionLocal()
    try:
        for name in INITIAL_CATEGORIES:
            if not db.scalar(select(Category).where(Category.name == name)):
                db.add(Category(name=name, description=f"Chamados de {name.lower().replace('_', ' ')}"))
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
