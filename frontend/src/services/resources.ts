import { API_URL, api, getToken } from "./api";
import {
  Category,
  DashboardMetrics,
  Sector,
  SupportArea,
  SupportType,
  Ticket,
  TicketAttachment,
  TicketDetail,
  TicketListResponse,
  TicketPriority,
  TicketStatus,
  User,
  UserRole
} from "../types/domain";

export function getDashboard() {
  return api<DashboardMetrics>("/dashboard/metrics");
}

export function listTickets(filters: Record<string, string> = {}) {
  const query = new URLSearchParams(filters);
  return api<TicketListResponse>(`/tickets${query.size ? `?${query}` : ""}`);
}

export function getTicket(id: string) {
  return api<TicketDetail>(`/tickets/${id}`);
}

export function createTicket(payload: {
  title?: string;
  description: string;
  priority: TicketPriority;
  category_id?: number;
  sector_id: number;
  support_area_id: number;
  support_type_id: number;
}) {
  return api<Ticket>("/tickets", { method: "POST", body: JSON.stringify(payload) });
}

export function updateTicket(
  id: number,
  payload: Partial<{
    status: TicketStatus;
    priority: TicketPriority;
    assignee_id: number;
    category_id: number;
    sector_id: number;
    support_area_id: number;
    support_type_id: number;
    title: string;
    description: string;
  }>
) {
  return api<Ticket>(`/tickets/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function addComment(id: number, message: string) {
  return api(`/tickets/${id}/comments`, { method: "POST", body: JSON.stringify({ message }) });
}

export function listCategories() {
  return api<Category[]>("/categories");
}

export function createCategory(payload: { name: string; description?: string }) {
  return api<Category>("/categories", { method: "POST", body: JSON.stringify(payload) });
}

export function listSectors(activeOnly = false) {
  return api<Sector[]>(`/sectors${activeOnly ? "?active_only=true" : ""}`);
}

export function createSector(payload: { name: string; description?: string; is_active?: boolean }) {
  return api<Sector>("/sectors", { method: "POST", body: JSON.stringify(payload) });
}

export function updateSector(id: number, payload: Partial<{ name: string; description: string; is_active: boolean }>) {
  return api<Sector>(`/sectors/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deactivateSector(id: number) {
  return api<void>(`/sectors/${id}`, { method: "DELETE" });
}

export function listSupportAreas(activeOnly = false) {
  return api<SupportArea[]>(`/support-areas${activeOnly ? "?active_only=true" : ""}`);
}

export function createSupportArea(payload: { name: string; description?: string; is_active?: boolean }) {
  return api<SupportArea>("/support-areas", { method: "POST", body: JSON.stringify(payload) });
}

export function updateSupportArea(id: number, payload: Partial<{ name: string; description: string; is_active: boolean }>) {
  return api<SupportArea>(`/support-areas/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deactivateSupportArea(id: number) {
  return api<void>(`/support-areas/${id}`, { method: "DELETE" });
}

export function listSupportTypes(options: { activeOnly?: boolean; supportAreaId?: string } = {}) {
  const query = new URLSearchParams();
  if (options.activeOnly) query.set("active_only", "true");
  if (options.supportAreaId) query.set("support_area_id", options.supportAreaId);
  return api<SupportType[]>(`/support-types${query.size ? `?${query}` : ""}`);
}

export function createSupportType(payload: { name: string; description?: string; support_area_id: number; is_active?: boolean }) {
  return api<SupportType>("/support-types", { method: "POST", body: JSON.stringify(payload) });
}

export function updateSupportType(
  id: number,
  payload: Partial<{ name: string; description: string; support_area_id: number; is_active: boolean }>
) {
  return api<SupportType>(`/support-types/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export function deactivateSupportType(id: number) {
  return api<void>(`/support-types/${id}`, { method: "DELETE" });
}

export function uploadTicketAttachments(ticketId: number, files: File[]) {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  return api<TicketAttachment[]>(`/tickets/${ticketId}/attachments`, { method: "POST", body: form });
}

export async function downloadTicketAttachment(ticketId: number, attachment: TicketAttachment) {
  const token = getToken();
  const response = await fetch(`${API_URL}/tickets/${ticketId}/attachments/${attachment.id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  if (!response.ok) {
    throw new Error("Erro ao baixar anexo.");
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = attachment.original_filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function listUsers() {
  return api<User[]>("/users");
}

export function createUser(payload: { name: string; email: string; password: string; role: UserRole }) {
  return api<User>("/users", { method: "POST", body: JSON.stringify(payload) });
}
