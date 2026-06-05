from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.core.enums import UserRole


class UserBase(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    email: EmailStr
    role: UserRole = UserRole.SOLICITANTE
    is_active: bool = True


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=3, max_length=120)
    email: EmailStr | None = None
    role: UserRole | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=8, max_length=128)


class UserRead(UserBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}
