import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
        <h1>Chamado #{ticket.id}</h1>
        <span className={`badge ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
      </div>
      <section className="panel">
        <div className="ticket-head">
          <div>
            <h2>{ticket.title}</h2>
            <p>{ticket.description}</p>
          </div>
          <div className="ticket-meta">
            <span>Status: <strong>{ticket.status}</strong></span>
            <span>Categoria: <strong>{ticket.category.name}</strong></span>
            <span>Solicitante: <strong>{ticket.requester.name}</strong></span>
            <span>Responsavel: <strong>{ticket.assignee?.name ?? "Sem atribuicao"}</strong></span>
          </div>
        </div>
        {(hasRole("ADMIN", "TECNICO")) && (
          <div className="actions-row">
            <select value={ticket.status} onChange={(event) => handleStatus(event.target.value as TicketStatus)}>
              <option>ABERTO</option><option>EM_ANDAMENTO</option><option>AGUARDANDO_SOLICITANTE</option><option>RESOLVIDO</option><option>FECHADO</option><option>CANCELADO</option>
            </select>
            {hasRole("ADMIN") && (
              <select value={ticket.assignee?.id ?? ""} onChange={(event) => handleAssignee(Number(event.target.value))}>
                <option value="">Atribuir tecnico</option>
                {users.filter((user) => user.role === "TECNICO").map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
              </select>
            )}
          </div>
        )}
      </section>
      <div className="split-grid">
        <section className="panel">
          <h2>Comentarios</h2>
          <form className="comment-form" onSubmit={handleComment}>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} />
            <button className="primary">Comentar</button>
          </form>
          {ticket.comments.map((comment) => (
            <div className="comment" key={comment.id}>
              <strong>{comment.author.name}</strong>
              <p>{comment.message}</p>
            </div>
          ))}
        </section>
        <section className="panel">
          <h2>Historico</h2>
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
