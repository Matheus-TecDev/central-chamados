from enum import StrEnum


class UserRole(StrEnum):
    ADMIN = "ADMIN"
    TECNICO = "TECNICO"
    SOLICITANTE = "SOLICITANTE"


class TicketStatus(StrEnum):
    ABERTO = "ABERTO"
    EM_ANDAMENTO = "EM_ANDAMENTO"
    AGUARDANDO_SOLICITANTE = "AGUARDANDO_SOLICITANTE"
    RESOLVIDO = "RESOLVIDO"
    FECHADO = "FECHADO"
    CANCELADO = "CANCELADO"


class TicketPriority(StrEnum):
    BAIXA = "BAIXA"
    MEDIA = "MEDIA"
    ALTA = "ALTA"
    CRITICA = "CRITICA"
