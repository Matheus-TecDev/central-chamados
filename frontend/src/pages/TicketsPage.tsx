import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppSelect } from "../components/AppSelect";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { ticketPriorities, ticketPriorityLabels, ticketStatuses, ticketStatusLabels, toOptions } from "../constants/options";
import { listSectors, listSupportAreas, listSupportTypes, listTickets, listUsers } from "../services/resources";
import { Sector, SupportArea, SupportType, Ticket, User } from "../types/domain";

const initialMeta = { total: 0, page: 1, per_page: 10, total_pages: 1 };

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [supportAreas, setSupportAreas] = useState<SupportArea[]>([]);
  const [supportTypes, setSupportTypes] = useState<SupportType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({ page: "1", per_page: "10" });
  const [meta, setMeta] = useState(initialMeta);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Nexus | Chamados";
    listSectors().then(setSectors).catch(() => setSectors([]));
    listSupportAreas().then(setSupportAreas).catch(() => setSupportAreas([]));
    listSupportTypes().then(setSupportTypes).catch(() => setSupportTypes([]));
    listUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    listTickets(filters)
      .then((response) => {
        setTickets(response.items);
        setMeta({ total: response.total, page: response.page, per_page: response.per_page, total_pages: response.total_pages });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar chamados."))
      .finally(() => setLoading(false));
  }, [filters]);

  const statusOptions = useMemo(() => toOptions(ticketStatuses, ticketStatusLabels), []);
  const priorityOptions = useMemo(() => toOptions(ticketPriorities, ticketPriorityLabels), []);
  const sectorOptions = useMemo(() => sectors.map((sector) => ({ value: String(sector.id), label: sector.name })), [sectors]);
  const areaOptions = useMemo(() => supportAreas.map((area) => ({ value: String(area.id), label: area.name })), [supportAreas]);
  const typeOptions = useMemo(
    () =>
      supportTypes
        .filter((type) => !filters.support_area_id || String(type.support_area_id) === filters.support_area_id)
        .map((type) => ({ value: String(type.id), label: type.name })),
    [supportTypes, filters.support_area_id]
  );
  const assigneeOptions = useMemo(
    () => users.filter((user) => user.role === "TECNICO").map((user) => ({ value: String(user.id), label: user.name })),
    [users]
  );
  const requesterOptions = useMemo(
    () => users.map((user) => ({ value: String(user.id), label: user.name })),
    [users]
  );

  function updateFilter(name: string, value: string) {
    setFilters((current) => {
      const next: Record<string, string> = { ...current, page: "1" };
      if (value) {
        next[name] = value;
      } else {
        delete next[name];
      }
      if (name === "support_area_id") {
        delete next.support_type_id;
      }
      return next;
    });
  }

  function updateDateFilter(name: string, value: string, endOfDay = false) {
    updateFilter(name, value ? `${value}T${endOfDay ? "23:59:59" : "00:00:00"}` : "");
  }

  function updatePage(page: number) {
    setFilters((current) => ({ ...current, page: String(Math.min(Math.max(page, 1), meta.total_pages)) }));
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Chamados Nexus</h1>
          <p>Fila operacional com busca, filtros avançados e paginacao.</p>
        </div>
        <Link className="primary link-button" to="/chamados/novo">Novo chamado</Link>
      </div>
      <div className="filters filters-advanced">
        <label>Busca<input value={filters.search ?? ""} onChange={(event) => updateFilter("search", event.target.value)} placeholder="Título ou descrição" /></label>
        <AppSelect label="Status" value={filters.status ?? ""} options={statusOptions} placeholder="Todos" onChange={(value) => updateFilter("status", value)} isClearable isSearchable={false} />
        <AppSelect label="Prioridade" value={filters.priority ?? ""} options={priorityOptions} placeholder="Todas" onChange={(value) => updateFilter("priority", value)} isClearable isSearchable={false} />
        <AppSelect label="Setor" value={filters.sector_id ?? ""} options={sectorOptions} placeholder="Todos" onChange={(value) => updateFilter("sector_id", value)} isClearable />
        <AppSelect label="Area" value={filters.support_area_id ?? ""} options={areaOptions} placeholder="Todas" onChange={(value) => updateFilter("support_area_id", value)} isClearable />
        <AppSelect label="Tipo" value={filters.support_type_id ?? ""} options={typeOptions} placeholder="Todos" onChange={(value) => updateFilter("support_type_id", value)} isClearable />
        <AppSelect label="Responsável" value={filters.assignee_id ?? ""} options={assigneeOptions} placeholder="Todos" onChange={(value) => updateFilter("assignee_id", value)} isClearable />
        <AppSelect label="Solicitante" value={filters.requester_id ?? ""} options={requesterOptions} placeholder="Todos" onChange={(value) => updateFilter("requester_id", value)} isClearable />
        <label>De<input type="date" onChange={(event) => updateDateFilter("created_from", event.target.value)} /></label>
        <label>Ate<input type="date" onChange={(event) => updateDateFilter("created_to", event.target.value, true)} /></label>
      </div>
      {error && <div className="alert list-alert">{error}</div>}
      <div className="table tickets-table">
        <div className="table-header"><span>ID</span><span>Título</span><span>Solicitante</span><span>Setor</span><span>Area</span><span>Tipo</span><span>Status</span><span>Prioridade</span><span>Criado em</span></div>
        {loading && <div className="loading table-loading">Carregando chamados...</div>}
        {!loading && tickets.map((ticket) => (
          <Link className={`table-row ${ticket.priority === "CRITICA" ? "critical-row" : ""}`} to={`/chamados/${ticket.id}`} key={ticket.id}>
            <span data-label="ID">#{ticket.id}</span>
            <span data-label="Título">{ticket.title}</span>
            <span data-label="Solicitante">{ticket.requester.name}</span>
            <span data-label="Setor">{ticket.sector.name}</span>
            <span data-label="Area">{ticket.support_area.name}</span>
            <span data-label="Tipo">{ticket.support_type.name}</span>
            <span data-label="Status"><StatusBadge status={ticket.status} /></span>
            <span data-label="Prioridade"><PriorityBadge priority={ticket.priority} /></span>
            <span data-label="Criado em">{formatDateTime(ticket.created_at)}</span>
          </Link>
        ))}
        {!loading && !tickets.length && <div className="empty-state table-empty">Nenhum chamado encontrado para os filtros selecionados.</div>}
      </div>
      <div className="pagination-bar">
        <span>{meta.total} chamados encontrados</span>
        <div className="pagination-actions">
          <button className="secondary" onClick={() => updatePage(meta.page - 1)} disabled={meta.page <= 1}>Anterior</button>
          <strong>Página {meta.page} de {meta.total_pages}</strong>
          <button className="secondary" onClick={() => updatePage(meta.page + 1)} disabled={meta.page >= meta.total_pages}>Próxima</button>
        </div>
      </div>
    </>
  );
}
