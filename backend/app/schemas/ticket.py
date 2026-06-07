from datetime import datetime

from pydantic import BaseModel, Field

from app.core.enums import TicketPriority, TicketStatus
from app.schemas.category import CategoryRead
from app.schemas.support import SectorRead, SupportAreaRead, SupportTypeRead
from app.schemas.user import UserRead


class TicketCreate(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=180)
    description: str = Field(min_length=10)
    priority: TicketPriority = TicketPriority.MEDIA
    category_id: int | None = None
    sector_id: int
    support_area_id: int
    support_type_id: int


class TicketUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=5, max_length=180)
    description: str | None = Field(default=None, min_length=10)
    status: TicketStatus | None = None
    priority: TicketPriority | None = None
    category_id: int | None = None
    sector_id: int | None = None
    support_area_id: int | None = None
    support_type_id: int | None = None
    assignee_id: int | None = None


class TicketCommentCreate(BaseModel):
    message: str = Field(min_length=2)


class TicketCommentRead(BaseModel):
    id: int
    message: str
    created_at: datetime
    author: UserRead

    model_config = {"from_attributes": True}


class TicketAuditRead(BaseModel):
    id: int
    action: str
    field_name: str | None
    old_value: str | None
    new_value: str | None
    created_at: datetime
    actor: UserRead

    model_config = {"from_attributes": True}


class TicketAttachmentRead(BaseModel):
    id: int
    original_filename: str
    content_type: str
    size_bytes: int
    created_at: datetime
    uploaded_by: UserRead

    model_config = {"from_attributes": True}


class TicketRead(BaseModel):
    id: int
    title: str
    description: str
    status: TicketStatus
    priority: TicketPriority
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None
    closed_at: datetime | None
    requester: UserRead
    assignee: UserRead | None
    category: CategoryRead
    sector: SectorRead
    support_area: SupportAreaRead
    support_type: SupportTypeRead

    model_config = {"from_attributes": True}


class TicketListResponse(BaseModel):
    items: list[TicketRead]
    total: int
    page: int
    per_page: int
    total_pages: int


class TicketDetail(TicketRead):
    comments: list[TicketCommentRead] = []
    audits: list[TicketAuditRead] = []
    attachments: list[TicketAttachmentRead] = []


class TicketFilters(BaseModel):
    status: TicketStatus | None = None
    category_id: int | None = None
    sector_id: int | None = None
    support_area_id: int | None = None
    support_type_id: int | None = None
    priority: TicketPriority | None = None
    assignee_id: int | None = None
    requester_id: int | None = None
    search: str | None = None
    created_from: datetime | None = None
    created_to: datetime | None = None
