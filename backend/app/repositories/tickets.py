from sqlalchemy import Select, select
from sqlalchemy.orm import Session, joinedload

from app.core.enums import TicketPriority, TicketStatus, UserRole
from app.models.audit import TicketAudit
from app.models.comment import TicketComment
from app.models.ticket import Ticket
from app.models.user import User


def visible_ticket_query(user: User) -> Select[tuple[Ticket]]:
    query = select(Ticket).options(
        joinedload(Ticket.requester),
        joinedload(Ticket.assignee),
        joinedload(Ticket.category),
    )
    if user.role == UserRole.SOLICITANTE:
        query = query.where(Ticket.requester_id == user.id)
    if user.role == UserRole.TECNICO:
        query = query.where(Ticket.assignee_id == user.id)
    return query


def visible_ticket_ids_query(user: User) -> Select[tuple[int]]:
    query = select(Ticket.id)
    if user.role == UserRole.SOLICITANTE:
        query = query.where(Ticket.requester_id == user.id)
    if user.role == UserRole.TECNICO:
        query = query.where(Ticket.assignee_id == user.id)
    return query


def list_visible(
    db: Session,
    user: User,
    status: TicketStatus | None = None,
    category_id: int | None = None,
    priority: TicketPriority | None = None,
    assignee_id: int | None = None,
) -> list[Ticket]:
    query = visible_ticket_query(user)
    if status:
        query = query.where(Ticket.status == status)
    if category_id:
        query = query.where(Ticket.category_id == category_id)
    if priority:
        query = query.where(Ticket.priority == priority)
    if assignee_id:
        query = query.where(Ticket.assignee_id == assignee_id)
    return list(db.scalars(query.order_by(Ticket.created_at.desc())).unique())


def get_visible(db: Session, ticket_id: int, user: User) -> Ticket | None:
    query = visible_ticket_query(user).where(Ticket.id == ticket_id).options(
        joinedload(Ticket.comments).joinedload(TicketComment.author),
        joinedload(Ticket.audits).joinedload(TicketAudit.actor),
    )
    return db.scalars(query).unique().first()
