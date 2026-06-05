import { api } from "./api";
import { Category, DashboardMetrics, Ticket, TicketDetail, TicketPriority, TicketStatus, User, UserRole } from "../types/domain";

export function getDashboard() {
  return api<DashboardMetrics>("/dashboard/metrics");
}

export function listTickets(filters: Record<string, string> = {}) {
  const query = new URLSearchParams(filters);
  return api<Ticket[]>(`/tickets${query.size ? `?${query}` : ""}`);
}

export function getTicket(id: string) {
  return api<TicketDetail>(`/tickets/${id}`);
}

export function createTicket(payload: { title: string; description: string; priority: TicketPriority; category_id: number }) {
  return api<Ticket>("/tickets", { method: "POST", body: JSON.stringify(payload) });
}

export function updateTicket(id: number, payload: Partial<{ status: TicketStatus; priority: TicketPriority; assignee_id: number; category_id: number; title: string; description: string }>) {
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

export function listUsers() {
  return api<User[]>("/users");
}

export function createUser(payload: { name: string; email: string; password: string; role: UserRole }) {
  return api<User>("/users", { method: "POST", body: JSON.stringify(payload) });
}
