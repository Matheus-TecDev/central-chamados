from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.enums import TicketStatus
from app.models.category import Category
from app.models.support import Sector, SupportArea, SupportType
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
    by_sector_rows = db.execute(
        select(Sector.name, func.count(Ticket.id))
        .join(Ticket, Ticket.sector_id == Sector.id)
        .where(Ticket.id.in_(select(visible_ids.c.id)))
        .group_by(Sector.name)
        .order_by(Sector.name)
    ).all()
    by_area_rows = db.execute(
        select(SupportArea.name, func.count(Ticket.id))
        .join(Ticket, Ticket.support_area_id == SupportArea.id)
        .where(Ticket.id.in_(select(visible_ids.c.id)))
        .group_by(SupportArea.name)
        .order_by(SupportArea.name)
    ).all()
    by_type_rows = db.execute(
        select(SupportType.name, func.count(Ticket.id))
        .join(Ticket, Ticket.support_type_id == SupportType.id)
        .where(Ticket.id.in_(select(visible_ids.c.id)))
        .group_by(SupportType.name)
        .order_by(SupportType.name)
    ).all()

    return DashboardMetrics(
        total_chamados=db.scalar(base) or 0,
        chamados_abertos=count_by_status(TicketStatus.ABERTO),
        chamados_em_andamento=count_by_status(TicketStatus.EM_ANDAMENTO),
        chamados_aguardando=count_by_status(TicketStatus.AGUARDANDO_SOLICITANTE)
        + count_by_status(TicketStatus.AGUARDANDO_TERCEIROS),
        chamados_concluidos=count_by_status(TicketStatus.CONCLUIDO),
        chamados_sem_responsavel=db.scalar(base.where(Ticket.assignee_id.is_(None))) or 0,
        chamados_por_categoria=[MetricItem(label=row[0], total=row[1]) for row in by_category_rows],
        chamados_por_setor=[MetricItem(label=row[0], total=row[1]) for row in by_sector_rows],
        chamados_por_area=[MetricItem(label=row[0], total=row[1]) for row in by_area_rows],
        chamados_por_tipo=[MetricItem(label=row[0], total=row[1]) for row in by_type_rows],
        chamados_por_prioridade=[MetricItem(label=row[0].value, total=row[1]) for row in by_priority_rows],
    )
