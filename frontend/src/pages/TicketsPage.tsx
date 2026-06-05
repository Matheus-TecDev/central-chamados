import { ChangeEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  function updateFilter(event: ChangeEvent<HTMLSelectElement>) {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value || "" }));
  }

  return (
    <>
      <div className="page-heading">
        <h1>Chamados</h1>
        <Link className="primary link-button" to="/chamados/novo">Novo chamado</Link>
      </div>
      <div className="filters">
        <select name="status" onChange={updateFilter}><option value="">Status</option><option>ABERTO</option><option>EM_ANDAMENTO</option><option>AGUARDANDO_SOLICITANTE</option><option>RESOLVIDO</option><option>FECHADO</option><option>CANCELADO</option></select>
        <select name="priority" onChange={updateFilter}><option value="">Prioridade</option><option>BAIXA</option><option>MEDIA</option><option>ALTA</option><option>CRITICA</option></select>
        <select name="category_id" onChange={updateFilter}><option value="">Categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <select name="assignee_id" onChange={updateFilter}><option value="">Responsavel</option>{users.filter((user) => user.role === "TECNICO").map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select>
      </div>
      <div className="table">
        <div className="table-header"><span>ID</span><span>Titulo</span><span>Status</span><span>Prioridade</span><span>Responsavel</span></div>
        {tickets.map((ticket) => (
          <Link className="table-row" to={`/chamados/${ticket.id}`} key={ticket.id}>
            <span>#{ticket.id}</span><span>{ticket.title}</span><span>{ticket.status}</span><span>{ticket.priority}</span><span>{ticket.assignee?.name ?? "Sem atribuicao"}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
