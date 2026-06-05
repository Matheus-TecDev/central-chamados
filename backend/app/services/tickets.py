from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.enums import TicketStatus, UserRole
from app.models.audit import TicketAudit
from app.models.category import Category
from app.models.comment import TicketComment
from app.models.ticket import Ticket
from app.models.user import User
from app.schemas.ticket import TicketCommentCreate, TicketCreate, TicketUpdate


def assert_category_exists(db: Session, category_id: int) -> None:
    if not db.get(Category, category_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Categoria nao encontrada.")


def assert_can_access(ticket: Ticket | None) -> Ticket:
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chamado nao encontrado.")
    return ticket


def assert_assignee_is_active_technician(db: Session, assignee_id: int | None) -> None:
    if assignee_id is None:
        return
    assignee = db.get(User, assignee_id)
    if not assignee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tecnico responsavel nao encontrado.")
    if not assignee.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tecnico responsavel esta inativo.")
    if assignee.role != UserRole.TECNICO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Responsavel pelo chamado deve ter perfil TECNICO.",
        )


def create_audit(
    db: Session,
    ticket: Ticket,
    actor: User,
    action: str,
    field_name: str | None = None,
    old_value: object | None = None,
    new_value: object | None = None,
) -> None:
    db.add(
        TicketAudit(
            ticket=ticket,
            actor_id=actor.id,
            action=action,
            field_name=field_name,
            old_value=None if old_value is None else str(old_value),
            new_value=None if new_value is None else str(new_value),
        )
    )


def create_ticket(db: Session, payload: TicketCreate, actor: User) -> Ticket:
    if actor.role == UserRole.TECNICO:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tecnico nao pode criar chamados.")
    assert_category_exists(db, payload.category_id)
    ticket = Ticket(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        category_id=payload.category_id,
        requester_id=actor.id,
    )
    db.add(ticket)
    db.flush()
    create_audit(db, ticket, actor, "CHAMADO_CRIADO")
    db.commit()
    db.refresh(ticket)
    return ticket


def update_ticket(db: Session, ticket: Ticket, payload: TicketUpdate, actor: User) -> Ticket:
    values = payload.model_dump(exclude_unset=True)
    if actor.role == UserRole.SOLICITANTE and set(values) - {"title", "description", "priority", "category_id"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solicitante nao pode alterar este campo.")
    if actor.role == UserRole.TECNICO and "assignee_id" in values:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Tecnico nao pode reatribuir chamados.")
    if "category_id" in values:
        assert_category_exists(db, values["category_id"])
    if "assignee_id" in values:
        assert_assignee_is_active_technician(db, values["assignee_id"])

    for field, value in values.items():
        old_value = getattr(ticket, field)
        if old_value == value:
            continue
        setattr(ticket, field, value)
        create_audit(db, ticket, actor, "CAMPO_ATUALIZADO", field, old_value, value)

    now = datetime.now(timezone.utc)
    if ticket.status == TicketStatus.RESOLVIDO and ticket.resolved_at is None:
        ticket.resolved_at = now
    if ticket.status == TicketStatus.FECHADO and ticket.closed_at is None:
        ticket.closed_at = now

    db.commit()
    db.refresh(ticket)
    return ticket


def add_comment(db: Session, ticket: Ticket, payload: TicketCommentCreate, actor: User) -> TicketComment:
    comment = TicketComment(ticket_id=ticket.id, author_id=actor.id, message=payload.message)
    db.add(comment)
    create_audit(db, ticket, actor, "COMENTARIO_ADICIONADO")
    db.commit()
    db.refresh(comment)
    return comment
