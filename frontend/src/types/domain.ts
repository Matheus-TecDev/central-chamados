export type UserRole = "ADMIN" | "TECNICO" | "SOLICITANTE";
export type TicketStatus =
  | "ABERTO"
  | "EM_ANDAMENTO"
  | "AGUARDANDO_SOLICITANTE"
  | "AGUARDANDO_TERCEIROS"
  | "CONCLUIDO"
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

export interface Sector {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface SupportArea {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface SupportType {
  id: number;
  support_area_id: number;
  support_area: SupportArea;
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
  resolved_at?: string | null;
  closed_at?: string | null;
  requester: User;
  assignee?: User | null;
  category: Category;
  sector: Sector;
  support_area: SupportArea;
  support_type: SupportType;
}

export interface TicketListResponse {
  items: Ticket[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
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
  field_name?: string | null;
  old_value?: string | null;
  new_value?: string | null;
  created_at: string;
  actor: User;
}

export interface TicketAttachment {
  id: number;
  original_filename: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
  uploaded_by: User;
}

export interface TicketDetail extends Ticket {
  comments: TicketComment[];
  audits: TicketAudit[];
  attachments: TicketAttachment[];
}

export interface DashboardMetrics {
  total_chamados: number;
  chamados_abertos: number;
  chamados_em_andamento: number;
  chamados_aguardando: number;
  chamados_concluidos: number;
  chamados_sem_responsavel: number;
  chamados_por_categoria: Array<{ label: string; total: number }>;
  chamados_por_setor: Array<{ label: string; total: number }>;
  chamados_por_area: Array<{ label: string; total: number }>;
  chamados_por_tipo: Array<{ label: string; total: number }>;
  chamados_por_prioridade: Array<{ label: string; total: number }>;
}
