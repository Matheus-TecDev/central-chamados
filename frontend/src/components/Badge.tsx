import { ticketPriorityLabels, ticketStatusLabels, userRoleLabels } from "../constants/options";
import { TicketPriority, TicketStatus, UserRole } from "../types/domain";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info" | "purple";

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

const statusTones: Record<TicketStatus, BadgeTone> = {
  ABERTO: "info",
  EM_ANDAMENTO: "warning",
  AGUARDANDO_SOLICITANTE: "purple",
  AGUARDANDO_TERCEIROS: "neutral",
  CONCLUIDO: "success",
  CANCELADO: "danger"
};

const priorityTones: Record<TicketPriority, BadgeTone> = {
  BAIXA: "success",
  MEDIA: "neutral",
  ALTA: "warning",
  CRITICA: "danger"
};

const roleTones: Record<UserRole, BadgeTone> = {
  ADMIN: "info",
  TECNICO: "neutral",
  SOLICITANTE: "neutral"
};

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  return <span className={`badge badge-${tone}`}>{label}</span>;
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <Badge label={ticketStatusLabels[status]} tone={statusTones[status]} />;
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <Badge label={ticketPriorityLabels[priority]} tone={priorityTones[priority]} />;
}

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge label={userRoleLabels[role]} tone={roleTones[role]} />;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return <Badge label={active ? "Ativo" : "Inativo"} tone={active ? "success" : "neutral"} />;
}
