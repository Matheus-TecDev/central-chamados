from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.enums import TicketStatus
from app.models.category import Category
from app.models.ticket import Ticket
from app.models.user import User
from app.repositories.tickets import visible_ticket_ids_query
from app.schemas.dashboard import DashboardMetrics, MetricItem

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/metrics", response_model=DashboardMetrics)
def metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardMetrics:
    visible_ids = visible_ticket_ids_query(current_user).subquery()
    base = select(func.count(Ticket.id)).where(Ticket.id.in_(select(visible_ids.c.id)))

    def count_by_status(status: TicketStatus) -> int:
        return db.scalar(base.where(Ticket.status == status)) or 0

    by_category_rows = db.execute(
        select(Category.name, func.count(Ticket.id))
        .join(Ticket, Ticket.category_id == Category.id)
        .where(Ticket.id.in_(select(visible_ids.c.id)))
        .group_by(Category.name)
        .order_by(Category.name)
    ).all()
    by_priority_rows = db.execute(
        select(Ticket.priority, func.count(Ticket.id))
        .where(Ticket.id.in_(select(visible_ids.c.id)))
        .group_by(Ticket.priority)
        .order_by(Ticket.priority)
    ).all()

    return DashboardMetrics(
        total_chamados=db.scalar(base) or 0,
        chamados_abertos=count_by_status(TicketStatus.ABERTO),
        chamados_em_andamento=count_by_status(TicketStatus.EM_ANDAMENTO),
        chamados_resolvidos=count_by_status(TicketStatus.RESOLVIDO),
        chamados_por_categoria=[MetricItem(label=row[0], total=row[1]) for row in by_category_rows],
        chamados_por_prioridade=[MetricItem(label=row[0].value, total=row[1]) for row in by_priority_rows],
    )
