import { TicketPriority, TicketStatus, UserRole } from "../types/domain";

export const ticketStatuses: TicketStatus[] = [
  "ABERTO",
  "EM_ANDAMENTO",
  "AGUARDANDO_SOLICITANTE",
  "AGUARDANDO_TERCEIROS",
  "CONCLUIDO",
  "CANCELADO"
];

export const ticketPriorities: TicketPriority[] = ["BAIXA", "MEDIA", "ALTA", "CRITICA"];

export const userRoles: UserRole[] = ["ADMIN", "TECNICO", "SOLICITANTE"];

export const ticketStatusLabels: Record<TicketStatus, string> = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  AGUARDANDO_SOLICITANTE: "Aguardando solicitante",
  AGUARDANDO_TERCEIROS: "Aguardando terceiros",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado"
};

export const ticketPriorityLabels: Record<TicketPriority, string> = {
  BAIXA: "Baixa",
  MEDIA: "Media",
  ALTA: "Alta",
  CRITICA: "Critica"
};

export const userRoleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  TECNICO: "Técnico",
  SOLICITANTE: "Solicitante"
};

export function toOptions<T extends string>(values: T[], labels: Record<T, string>) {
  return values.map((value) => ({ value, label: labels[value] }));
}
