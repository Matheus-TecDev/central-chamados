import { FormEvent, useEffect, useMemo, useState } from "react";
import { Download, Paperclip } from "lucide-react";
import { useParams } from "react-router-dom";
import { AppSelect } from "../components/AppSelect";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { ticketPriorities, ticketPriorityLabels, ticketStatuses, ticketStatusLabels, toOptions } from "../constants/options";
import { useAuth } from "../contexts/AuthContext";
import {
  addComment,
  downloadTicketAttachment,
  getTicket,
  listSectors,
  listSupportAreas,
  listSupportTypes,
  listUsers,
  updateTicket
} from "../services/resources";
import { Sector, SupportArea, SupportType, TicketAttachment, TicketDetail, TicketPriority, TicketStatus, User } from "../types/domain";

const statusActions: Array<{ status: TicketStatus; label: string }> = [
  { status: "EM_ANDAMENTO", label: "Iniciar atendimento" },
  { status: "AGUARDANDO_SOLICITANTE", label: "Aguardando solicitante" },
  { status: "AGUARDANDO_TERCEIROS", label: "Aguardando terceiros" },
  { status: "CONCLUIDO", label: "Concluir chamado" },
  { status: "CANCELADO", label: "Cancelar chamado" }
];

function auditValue(fieldName?: string | null, value?: string | null) {
  if (!value) return "-";
  if (fieldName === "status" && value in ticketStatusLabels) return ticketStatusLabels[value as TicketStatus];
  if (fieldName === "priority" && value in ticketPriorityLabels) return ticketPriorityLabels[value as TicketPriority];
  return value;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function formatBytes(value: number) {
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${value} B`;
}

export function TicketDetailPage() {
  const { id = "" } = useParams();
  const { hasRole, user } = useAuth();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [supportAreas, setSupportAreas] = useState<SupportArea[]>([]);
  const [supportTypes, setSupportTypes] = useState<SupportType[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIA" as TicketPriority,
    sector_id: "",
    support_area_id: "",
    support_type_id: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const current = await getTicket(id);
      setTicket(current);
      setForm({
        title: current.title,
        description: current.description,
        priority: current.priority,
        sector_id: String(current.sector.id),
        support_area_id: String(current.support_area.id),
        support_type_id: String(current.support_type.id)
      });
      document.title = `Nexus | Chamado #${current.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar chamado.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
    listSectors().then(setSectors).catch(() => setSectors([]));
    listSupportAreas().then(setSupportAreas).catch(() => setSupportAreas([]));
    listSupportTypes().then(setSupportTypes).catch(() => setSupportTypes([]));
    listUsers().then(setUsers).catch(() => setUsers([]));
  }, [id]);

  const statusOptions = useMemo(() => toOptions(ticketStatuses, ticketStatusLabels), []);
  const priorityOptions = useMemo(() => toOptions(ticketPriorities, ticketPriorityLabels), []);
  const sectorOptions = useMemo(() => sectors.map((sector) => ({ value: String(sector.id), label: sector.name })), [sectors]);
  const areaOptions = useMemo(() => supportAreas.map((area) => ({ value: String(area.id), label: area.name })), [supportAreas]);
  const typeOptions = useMemo(
    () =>
      supportTypes
        .filter((type) => String(type.support_area_id) === form.support_area_id)
        .map((type) => ({ value: String(type.id), label: type.name })),
    [supportTypes, form.support_area_id]
  );
  const assigneeOptions = useMemo(
    () => users.filter((item) => item.role === "TECNICO").map((item) => ({ value: String(item.id), label: item.name })),
    [users]
  );

  useEffect(() => {
    if (!form.support_area_id || typeOptions.some((option) => option.value === form.support_type_id)) {
      return;
    }
    setForm((current) => ({ ...current, support_type_id: typeOptions[0]?.value ?? "" }));
  }, [form.support_area_id, form.support_type_id, typeOptions]);

  const canEditTicket = hasRole("ADMIN", "SOLICITANTE");
  const canOperate = hasRole("ADMIN", "TECNICO");

  async function runUpdate(payload: Parameters<typeof updateTicket>[1]) {
    if (!ticket) return;
    setSaving(true);
    setError("");
    try {
      await updateTicket(ticket.id, payload);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar chamado.");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(status: TicketStatus) {
    await runUpdate({ status });
  }

  async function handleAssignee(assignee_id: number | null) {
    await runUpdate({ assignee_id });
  }

  async function handleAssume() {
    if (!user) return;
    await runUpdate({ assignee_id: user.id, status: "EM_ANDAMENTO" });
  }

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    await runUpdate({
      title: form.title,
      description: form.description,
      priority: form.priority,
      sector_id: Number(form.sector_id),
      support_area_id: Number(form.support_area_id),
      support_type_id: Number(form.support_type_id)
    });
  }

  async function handleDownload(attachment: TicketAttachment) {
    if (!ticket) return;
    setError("");
    try {
      await downloadTicketAttachment(ticket.id, attachment);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao baixar anexo.");
    }
  }

  async function handleComment(event: FormEvent) {
    event.preventDefault();
    if (!ticket || !message.trim()) return;
    setSaving(true);
    setError("");
    try {
      await addComment(ticket.id, message);
      setMessage("");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao comentar chamado.");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !ticket) {
    return <div className="loading">Carregando chamado no Nexus...</div>;
  }

  if (error && !ticket) {
    return <div className="alert">{error}</div>;
  }

  if (!ticket) {
    return null;
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Chamado #{ticket.id}</h1>
          <p>Acompanhamento do ciclo de atendimento no Nexus.</p>
        </div>
        <div className="heading-badges">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>
      {error && <div className="alert list-alert">{error}</div>}
      <section className={`panel ${ticket.priority === "CRITICA" ? "critical-panel" : ""}`}>
        <div className="ticket-head">
          <div>
            <h2>{ticket.title}</h2>
            <p>{ticket.description}</p>
          </div>
          <div className="ticket-meta">
            <div><span>Status</span><strong>{ticketStatusLabels[ticket.status]}</strong></div>
            <div><span>Solicitante</span><strong>{ticket.requester.name}</strong></div>
            <div><span>Setor</span><strong>{ticket.sector.name}</strong></div>
            <div><span>Area</span><strong>{ticket.support_area.name}</strong></div>
            <div><span>Tipo</span><strong>{ticket.support_type.name}</strong></div>
            <div><span>Responsavel</span><strong>{ticket.assignee?.name ?? "Sem responsavel"}</strong></div>
            <div><span>Criado em</span><strong>{formatDateTime(ticket.created_at)}</strong></div>
          </div>
        </div>
        {canOperate && (
          <div className="quick-actions">
            {hasRole("TECNICO") && !ticket.assignee && (
              <button className="primary" onClick={handleAssume} disabled={saving}>Assumir chamado</button>
            )}
            {statusActions.map((action) => (
              <button className="secondary" key={action.status} onClick={() => handleStatus(action.status)} disabled={saving || ticket.status === action.status}>
                {action.label}
              </button>
            ))}
          </div>
        )}
        {canOperate && (
          <div className="actions-row">
            <AppSelect label="Alterar status" value={ticket.status} options={statusOptions} onChange={(value) => handleStatus(value as TicketStatus)} isSearchable={false} />
            {hasRole("ADMIN") && (
              <AppSelect label="Tecnico responsavel" value={String(ticket.assignee?.id ?? "")} options={assigneeOptions} placeholder="Atribuir tecnico" onChange={(value) => handleAssignee(value ? Number(value) : null)} isClearable />
            )}
          </div>
        )}
      </section>
      {canEditTicket && (
        <section className="panel">
          <h2>Editar chamado</h2>
          <form className="edit-ticket-form" onSubmit={handleSave}>
            <label>Titulo<input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required /></label>
            <label>Descricao<textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} required /></label>
            <div className="form-grid">
              <AppSelect label="Setor" value={form.sector_id} options={sectorOptions} onChange={(value) => setForm((current) => ({ ...current, sector_id: value }))} />
              <AppSelect
                label="Area"
                value={form.support_area_id}
                options={areaOptions}
                onChange={(value) => setForm((current) => ({ ...current, support_area_id: value, support_type_id: "" }))}
              />
              <AppSelect label="Tipo" value={form.support_type_id} options={typeOptions} onChange={(value) => setForm((current) => ({ ...current, support_type_id: value }))} />
              <AppSelect label="Prioridade" value={form.priority} options={priorityOptions} onChange={(value) => setForm((current) => ({ ...current, priority: value as TicketPriority }))} isSearchable={false} />
            </div>
            <button className="primary form-submit" disabled={saving || !form.sector_id || !form.support_area_id || !form.support_type_id}>{saving ? "Salvando..." : "Salvar alteracoes"}</button>
          </form>
        </section>
      )}
      <div className="split-grid">
        <section className="panel">
          <h2>Anexos</h2>
          {!ticket.attachments.length && <div className="empty-state">Nenhum anexo registrado.</div>}
          <div className="attachment-list">
            {ticket.attachments.map((attachment) => (
              <button className="attachment-item" key={attachment.id} onClick={() => handleDownload(attachment)}>
                <Paperclip size={16} />
                <span>
                  <strong>{attachment.original_filename}</strong>
                  <small>{attachment.content_type} - {formatBytes(attachment.size_bytes)}</small>
                </span>
                <Download size={16} />
              </button>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Comentarios</h2>
          <form className="comment-form" onSubmit={handleComment}>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Adicionar comentario operacional" />
            <button className="primary" disabled={saving || !message.trim()}>Comentar</button>
          </form>
          {!ticket.comments.length && <div className="empty-state">Nenhum comentario registrado.</div>}
          {ticket.comments.map((comment) => (
            <div className="comment" key={comment.id}>
              <strong>{comment.author.name}</strong>
              <p>{comment.message}</p>
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Historico</h2>
          {!ticket.audits.length && <div className="empty-state">Nenhum evento registrado.</div>}
          {ticket.audits.map((audit) => (
            <div className="audit" key={audit.id}>
              <strong>{audit.action}</strong>
              <span>{audit.field_name ? `${audit.field_name}: ${auditValue(audit.field_name, audit.old_value)} -> ${auditValue(audit.field_name, audit.new_value)}` : audit.actor.name}</span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
