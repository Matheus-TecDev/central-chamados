from datetime import datetime

from pydantic import BaseModel, EmailStr, Field, field_validator

from app.core.enums import UserRole


class UserBase(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    email: EmailStr
    role: UserRole = UserRole.SOLICITANTE
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str) -> str:
        if value.strip() != value:
            raise ValueError("Senha nao pode iniciar ou terminar com espacos.")
        if not any(char.islower() for char in value):
            raise ValueError("Senha deve conter ao menos uma letra minuscula.")
        if not any(char.isupper() for char in value):
            raise ValueError("Senha deve conter ao menos uma letra maiuscula.")
        if not any(char.isdigit() for char in value):
            raise ValueError("Senha deve conter ao menos um numero.")
        return value


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=120)
    email: EmailStr | None = None
    role: UserRole | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, value: str | None) -> str | None:
        if value is None:
            return value
        return UserCreate.validate_password_strength(value)


class UserRead(UserBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
