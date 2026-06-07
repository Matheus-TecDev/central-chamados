from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexus"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = "local"
    DATABASE_URL: str = Field(
        default="postgresql://app_user:app_password@postgres:5432/central_chamados"
    )
    SECRET_KEY: str = Field(default="demo_ficticia_troque_antes_de_producao_8b8fbbd6b5c94d4ebd5ef51a9a1d3a41")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173,http://localhost"
    INITIAL_ADMIN_NAME: str = "Administrador"
    INITIAL_ADMIN_EMAIL: str = "admin@example.com"
    INITIAL_ADMIN_PASSWORD: str = "Admin@123456"
    UPLOAD_DIR: str = "uploads/ticket_attachments"
    MAX_ATTACHMENT_SIZE_BYTES: int = 25 * 1024 * 1024

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]

    @model_validator(mode="after")
    def validate_production_secrets(self) -> "Settings":
        weak_secret_keys = {"", "troque-esta-chave-em-producao"}
        if self.ENVIRONMENT.lower() == "production":
            if self.SECRET_KEY.strip() in weak_secret_keys or len(self.SECRET_KEY.strip()) < 32:
                raise ValueError(
                    "SECRET_KEY fraca ou ausente em production. Defina uma chave longa e aleatoria no ambiente."
                )
        return self


settings = Settings()
