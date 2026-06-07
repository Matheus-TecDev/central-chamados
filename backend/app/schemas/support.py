from datetime import datetime

from pydantic import BaseModel, Field


class SectorBase(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    description: str | None = Field(default=None, max_length=255)
    is_active: bool = True


class SectorCreate(SectorBase):
    pass


class SectorUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=80)
    description: str | None = Field(default=None, max_length=255)
    is_active: bool | None = None


class SectorRead(SectorBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SupportAreaBase(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    description: str | None = Field(default=None, max_length=255)
    is_active: bool = True


class SupportAreaCreate(SupportAreaBase):
    pass


class SupportAreaUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=80)
    description: str | None = Field(default=None, max_length=255)
    is_active: bool | None = None


class SupportAreaRead(SupportAreaBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SupportTypeBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=255)
    is_active: bool = True


class SupportTypeCreate(SupportTypeBase):
    support_area_id: int


class SupportTypeUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=255)
    is_active: bool | None = None
    support_area_id: int | None = None


class SupportTypeRead(SupportTypeBase):
    id: int
    support_area_id: int
    support_area: SupportAreaRead
    created_at: datetime

    model_config = {"from_attributes": True}
