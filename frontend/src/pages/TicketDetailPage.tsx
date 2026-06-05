import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AppSelect } from "../components/AppSelect";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { ticketStatuses, ticketStatusLabels, toOptions } from "../constants/options";
import { useAuth } from "../contexts/AuthContext";
import { addComment, getTicket, listUsers, updateTicket } from "../services/resources";
import { TicketDetail, TicketStatus, User } from "../types/domain";

export function TicketDetailPage() {
  const { id = "" } = useParams();
  const { hasRole } = useAuth();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");

  async function reload() {
    setTicket(await getTicket(id));
  }

  useEffect(() => {
    reload();
    listUsers().then(setUsers).catch(() => setUsers([]));
  }, [id]);

  const statusOptions = useMemo(() => toOptions(ticketStatuses, ticketStatusLabels), []);
  const assigneeOptions = useMemo(
    () => users.filter((user) => user.role === "TECNICO").map((user) => ({ value: String(user.id), label: user.name })),
    [users]
  );

  async function handleStatus(status: TicketStatus) {
    if (!ticket) return;
    await updateTicket(ticket.id, { status });
    await reload();
  }

  async function handleAssignee(assignee_id: number) {
    if (!ticket) return;
    await updateTicket(ticket.id, { assignee_id });
    await reload();
  }

  async function handleComment(event: FormEvent) {
    event.preventDefault();
    if (!ticket || !message.trim()) return;
    await addComment(ticket.id, message);
    setMessage("");
    await reload();
  }

  if (!ticket) {
    return <div className="loading">Carregando chamado...</div>;
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Chamado #{ticket.id}</h1>
          <p>Acompanhamento do ciclo de atendimento.</p>
        </div>
        <div className="heading-badges">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>
      <section className="panel">
        <div className="ticket-head">
          <div>
            <h2>{ticket.title}</h2>
            <p>{ticket.description}</p>
          </div>
          <div className="ticket-meta">
            <div><span>Status</span><strong>{ticketStatusLabels[ticket.status]}</strong></div>
            <div><span>Categoria</span><strong>{ticket.category.name}</strong></div>
            <div><span>Solicitante</span><strong>{ticket.requester.name}</strong></div>
            <div><span>Responsavel</span><strong>{ticket.assignee?.name ?? "Sem atribuicao"}</strong></div>
          </div>
        </div>
        {(hasRole("ADMIN", "TECNICO")) && (
          <div className="actions-row">
            <AppSelect label="Alterar status" value={ticket.status} options={statusOptions} onChange={(value) => handleStatus(value as TicketStatus)} isSearchable={false} />
            {hasRole("ADMIN") && (
              <AppSelect label="Tecnico responsavel" value={String(ticket.assignee?.id ?? "")} options={assigneeOptions} placeholder="Atribuir tecnico" onChange={(value) => handleAssignee(Number(value))} />
            )}
          </div>
        )}
      </section>
      <div className="split-grid">
        <section className="panel">
          <h2>Comentarios</h2>
          <form className="comment-form" onSubmit={handleComment}>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Adicionar comentario operacional" />
            <button className="primary">Comentar</button>
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
              <span>{audit.field_name ? `${audit.field_name}: ${audit.old_value ?? "-"} -> ${audit.new_value ?? "-"}` : audit.actor.name}</span>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
