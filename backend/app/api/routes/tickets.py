from datetime import datetime

from fastapi import APIRouter, Depends, File, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.enums import TicketPriority, TicketStatus
from app.models.comment import TicketComment
from app.models.ticket import Ticket
from app.models.user import User
from app.repositories.tickets import get_visible, list_visible
from app.schemas.ticket import (
    TicketAttachmentRead,
    TicketCommentCreate,
    TicketCommentRead,
    TicketCreate,
    TicketDetail,
    TicketListResponse,
    TicketRead,
    TicketUpdate,
)
from app.services.tickets import (
    add_attachments,
    add_comment,
    assert_can_access,
    create_ticket,
    get_attachment,
    get_attachment_path,
    update_ticket,
)

router = APIRouter(prefix="/tickets", tags=["Chamados"])


@router.get("", response_model=TicketListResponse)
def index(
    status: TicketStatus | None = None,
    category_id: int | None = None,
    sector_id: int | None = None,
    support_area_id: int | None = None,
    support_type_id: int | None = None,
    priority: TicketPriority | None = None,
    assignee_id: int | None = None,
    requester_id: int | None = None,
    search: str | None = None,
    created_from: datetime | None = None,
    created_to: datetime | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TicketListResponse:
    items, total = list_visible(
        db,
        current_user,
        status=status,
        category_id=category_id,
        sector_id=sector_id,
        support_area_id=support_area_id,
        support_type_id=support_type_id,
        priority=priority,
        assignee_id=assignee_id,
        requester_id=requester_id,
        search=search,
        created_from=created_from,
        created_to=created_to,
        page=page,
        per_page=per_page,
    )
    return TicketListResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=max((total + per_page - 1) // per_page, 1),
    )


@router.post("", response_model=TicketRead, status_code=201)
def store(
    payload: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Ticket:
    return create_ticket(db, payload, current_user)


@router.get("/{ticket_id}", response_model=TicketDetail)
def show(
    ticket_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Ticket:
    return assert_can_access(get_visible(db, ticket_id, current_user))


@router.put("/{ticket_id}", response_model=TicketRead)
def update(
    ticket_id: int,
    payload: TicketUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Ticket:
    ticket = assert_can_access(get_visible(db, ticket_id, current_user))
    return update_ticket(db, ticket, payload, current_user)


@router.post("/{ticket_id}/comments", response_model=TicketCommentRead, status_code=201)
def comment(
    ticket_id: int,
    payload: TicketCommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TicketComment:
    ticket = assert_can_access(get_visible(db, ticket_id, current_user))
    return add_comment(db, ticket, payload, current_user)


@router.post("/{ticket_id}/attachments", response_model=list[TicketAttachmentRead], status_code=201)
async def upload_attachments(
    ticket_id: int,
    files: list[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list:
    ticket = assert_can_access(get_visible(db, ticket_id, current_user))
    return await add_attachments(db, ticket, files, current_user)


@router.get("/{ticket_id}/attachments/{attachment_id}")
def download_attachment(
    ticket_id: int,
    attachment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FileResponse:
    ticket = assert_can_access(get_visible(db, ticket_id, current_user))
    attachment = get_attachment(db, ticket, attachment_id)
    return FileResponse(
        get_attachment_path(attachment),
        media_type=attachment.content_type,
        filename=attachment.original_filename,
    )
