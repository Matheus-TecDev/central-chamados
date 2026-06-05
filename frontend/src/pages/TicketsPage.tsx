import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppSelect } from "../components/AppSelect";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { ticketPriorities, ticketPriorityLabels, ticketStatuses, ticketStatusLabels, toOptions } from "../constants/options";
import { listCategories, listTickets, listUsers } from "../services/resources";
import { Category, Ticket, User } from "../types/domain";

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    listCategories().then(setCategories);
    listUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    listTickets(filters).then(setTickets);
  }, [filters]);

  const statusOptions = useMemo(() => toOptions(ticketStatuses, ticketStatusLabels), []);
  const priorityOptions = useMemo(() => toOptions(ticketPriorities, ticketPriorityLabels), []);
  const categoryOptions = useMemo(() => categories.map((category) => ({ value: String(category.id), label: category.name })), [categories]);
  const assigneeOptions = useMemo(
    () => users.filter((user) => user.role === "TECNICO").map((user) => ({ value: String(user.id), label: user.name })),
    [users]
  );

  function updateFilter(name: string, value: string) {
    setFilters((current) => {
      const next = { ...current };
      if (value) {
        next[name] = value;
      } else {
        delete next[name];
      }
      return next;
    });
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Chamados</h1>
          <p>Fila operacional com filtros por status, prioridade, categoria e responsavel.</p>
        </div>
        <Link className="primary link-button" to="/chamados/novo">Novo chamado</Link>
      </div>
      <div className="filters">
        <AppSelect label="Status" value={filters.status ?? ""} options={statusOptions} placeholder="Todos" onChange={(value) => updateFilter("status", value)} isClearable isSearchable={false} />
        <AppSelect label="Prioridade" value={filters.priority ?? ""} options={priorityOptions} placeholder="Todas" onChange={(value) => updateFilter("priority", value)} isClearable isSearchable={false} />
        <AppSelect label="Categoria" value={filters.category_id ?? ""} options={categoryOptions} placeholder="Todas" onChange={(value) => updateFilter("category_id", value)} isClearable />
        <AppSelect label="Responsavel" value={filters.assignee_id ?? ""} options={assigneeOptions} placeholder="Todos" onChange={(value) => updateFilter("assignee_id", value)} isClearable />
      </div>
      <div className="table tickets-table">
        <div className="table-header"><span>ID</span><span>Titulo</span><span>Status</span><span>Prioridade</span><span>Responsavel</span></div>
        {tickets.map((ticket) => (
          <Link className="table-row" to={`/chamados/${ticket.id}`} key={ticket.id}>
            <span data-label="ID">#{ticket.id}</span>
            <span data-label="Titulo">{ticket.title}</span>
            <span data-label="Status"><StatusBadge status={ticket.status} /></span>
            <span data-label="Prioridade"><PriorityBadge priority={ticket.priority} /></span>
            <span data-label="Responsavel">{ticket.assignee?.name ?? "Sem atribuicao"}</span>
          </Link>
        ))}
        {!tickets.length && <div className="empty-state table-empty">Nenhum chamado encontrado.</div>}
      </div>
    </>
  );
}
