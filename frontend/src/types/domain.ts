export type UserRole = "ADMIN" | "TECNICO" | "SOLICITANTE";
export type TicketStatus =
  | "ABERTO"
  | "EM_ANDAMENTO"
  | "AGUARDANDO_SOLICITANTE"
  | "RESOLVIDO"
  | "FECHADO"
  | "CANCELADO";
export type TicketPriority = "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  requester: User;
  assignee?: User;
  category: Category;
}

export interface TicketComment {
  id: number;
  message: string;
  created_at: string;
  author: User;
}

export interface TicketAudit {
  id: number;
  action: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
  actor: User;
}

export interface TicketDetail extends Ticket {
  comments: TicketComment[];
  audits: TicketAudit[];
}

export interface DashboardMetrics {
  total_chamados: number;
  chamados_abertos: number;
  chamados_em_andamento: number;
  chamados_resolvidos: number;
  chamados_por_categoria: Array<{ label: string; total: number }>;
  chamados_por_prioridade: Array<{ label: string; total: number }>;
}
