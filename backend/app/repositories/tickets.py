from datetime import datetime

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.core.enums import TicketPriority, TicketStatus, UserRole
from app.models.attachment import TicketAttachment
from app.models.audit import TicketAudit
from app.models.comment import TicketComment
from app.models.ticket import Ticket
from app.models.user import User


def visible_ticket_query(user: User) -> Select[tuple[Ticket]]:
    query = select(Ticket).options(
        joinedload(Ticket.requester),
        joinedload(Ticket.assignee),
        joinedload(Ticket.category),
        joinedload(Ticket.sector),
        joinedload(Ticket.support_area),
        joinedload(Ticket.support_type),
    )
    if user.role == UserRole.SOLICITANTE:
        query = query.where(Ticket.requester_id == user.id)
    if user.role == UserRole.TECNICO:
        query = query.where(or_(Ticket.assignee_id == user.id, Ticket.assignee_id.is_(None)))
    return query


def visible_ticket_ids_query(user: User) -> Select[tuple[int]]:
    query = select(Ticket.id)
    if user.role == UserRole.SOLICITANTE:
        query = query.where(Ticket.requester_id == user.id)
    if user.role == UserRole.TECNICO:
        query = query.where(or_(Ticket.assignee_id == user.id, Ticket.assignee_id.is_(None)))
    return query


def list_visible(
    db: Session,
    user: User,
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
    page: int = 1,
    per_page: int = 10,
) -> tuple[list[Ticket], int]:
    query = visible_ticket_query(user)
    if status:
        query = query.where(Ticket.status == status)
    if category_id:
        query = query.where(Ticket.category_id == category_id)
    if sector_id:
        query = query.where(Ticket.sector_id == sector_id)
    if support_area_id:
        query = query.where(Ticket.support_area_id == support_area_id)
    if support_type_id:
        query = query.where(Ticket.support_type_id == support_type_id)
    if priority:
        query = query.where(Ticket.priority == priority)
    if assignee_id:
        query = query.where(Ticket.assignee_id == assignee_id)
    if requester_id:
        query = query.where(Ticket.requester_id == requester_id)
    if search:
        term = f"%{search.strip()}%"
        query = query.where(or_(Ticket.title.ilike(term), Ticket.description.ilike(term)))
    if created_from:
        query = query.where(Ticket.created_at >= created_from)
    if created_to:
        query = query.where(Ticket.created_at <= created_to)

    count_query = query.with_only_columns(func.count(Ticket.id)).order_by(None)
    total = db.scalar(count_query) or 0
    offset = (page - 1) * per_page
    items = list(db.scalars(query.order_by(Ticket.created_at.desc()).offset(offset).limit(per_page)).unique())
    return items, total


def get_visible(db: Session, ticket_id: int, user: User) -> Ticket | None:
    query = visible_ticket_query(user).where(Ticket.id == ticket_id).options(
        joinedload(Ticket.comments).joinedload(TicketComment.author),
        joinedload(Ticket.audits).joinedload(TicketAudit.actor),
        joinedload(Ticket.attachments).joinedload(TicketAttachment.uploaded_by),
    )
    return db.scalars(query).unique().first()
