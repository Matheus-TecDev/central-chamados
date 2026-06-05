from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.enums import TicketPriority, TicketStatus
from app.models.comment import TicketComment
from app.models.ticket import Ticket
from app.models.user import User
from app.repositories.tickets import get_visible, list_visible
from app.schemas.ticket import TicketCommentCreate, TicketCommentRead, TicketCreate, TicketDetail, TicketRead, TicketUpdate
from app.services.tickets import add_comment, assert_can_access, create_ticket, update_ticket

router = APIRouter(prefix="/tickets", tags=["Chamados"])


@router.get("", response_model=list[TicketRead])
def index(
    status: TicketStatus | None = None,
    category_id: int | None = None,
    priority: TicketPriority | None = None,
    assignee_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Ticket]:
    return list_visible(db, current_user, status, category_id, priority, assignee_id)


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
