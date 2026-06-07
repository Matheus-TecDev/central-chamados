from pydantic import BaseModel


class MetricItem(BaseModel):
    label: str
    total: int


class DashboardMetrics(BaseModel):
    total_chamados: int
    chamados_abertos: int
    chamados_em_andamento: int
    chamados_aguardando: int
    chamados_concluidos: int
    chamados_sem_responsavel: int
    chamados_por_categoria: list[MetricItem]
    chamados_por_setor: list[MetricItem]
    chamados_por_area: list[MetricItem]
    chamados_por_tipo: list[MetricItem]
    chamados_por_prioridade: list[MetricItem]
