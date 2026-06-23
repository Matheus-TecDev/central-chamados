from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexus"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = "local"
    DATABASE_URL: str
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8
    BACKEND_CORS_ORIGINS: str = "http://localhost:5173,http://localhost"
    INITIAL_ADMIN_NAME: str = "Administrador"
    INITIAL_ADMIN_EMAIL: str = "admin@example.com"
    INITIAL_ADMIN_PASSWORD: str
    UPLOAD_DIR: str = "uploads/ticket_attachments"
    MAX_ATTACHMENT_SIZE_BYTES: int = 25 * 1024 * 1024

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]

    @model_validator(mode="after")
    def validate_required_secrets(self) -> "Settings":
        weak_secret_keys = {
            "",
            "troque-esta-chave-em-producao",
            "demo_ficticia_troque_antes_de_producao_8b8fbbd6b5c94d4ebd5ef51a9a1d3a41",
        }
        secret_key = self.SECRET_KEY.strip()
        admin_password = self.INITIAL_ADMIN_PASSWORD.strip()
        if secret_key in weak_secret_keys or len(secret_key) < 32:
            raise ValueError("SECRET_KEY obrigatoria, sem valor demo, com pelo menos 32 caracteres.")
        if len(admin_password) < 12:
            raise ValueError("INITIAL_ADMIN_PASSWORD obrigatoria, com pelo menos 12 caracteres.")
        if not any(char.islower() for char in admin_password):
            raise ValueError("INITIAL_ADMIN_PASSWORD deve conter ao menos uma letra minuscula.")
        if not any(char.isupper() for char in admin_password):
            raise ValueError("INITIAL_ADMIN_PASSWORD deve conter ao menos uma letra maiuscula.")
        if not any(char.isdigit() for char in admin_password):
            raise ValueError("INITIAL_ADMIN_PASSWORD deve conter ao menos um numero.")
        return self


settings = Settings()
