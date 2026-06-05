from pydantic import BaseModel


class MetricItem(BaseModel):
    label: str
    total: int


class DashboardMetrics(BaseModel):
    total_chamados: int
    chamados_abertos: int
    chamados_em_andamento: int
    chamados_resolvidos: int
    chamados_por_categoria: list[MetricItem]
    chamados_por_prioridade: list[MetricItem]
