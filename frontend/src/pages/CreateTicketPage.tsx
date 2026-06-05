import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket, listCategories } from "../services/resources";
import { Category, TicketPriority } from "../types/domain";

export function CreateTicketPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIA");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    listCategories().then((items) => {
      setCategories(items);
      setCategoryId(String(items[0]?.id ?? ""));
    });
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const ticket = await createTicket({ title, description, priority, category_id: Number(categoryId) });
    navigate(`/chamados/${ticket.id}`);
  }

  return (
    <>
      <div className="page-heading"><h1>Novo chamado</h1></div>
      <form className="form-panel" onSubmit={handleSubmit}>
        <label>Titulo<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
        <label>Descricao<textarea value={description} onChange={(event) => setDescription(event.target.value)} required /></label>
        <div className="form-grid">
          <label>Prioridade<select value={priority} onChange={(event) => setPriority(event.target.value as TicketPriority)}><option>BAIXA</option><option>MEDIA</option><option>ALTA</option><option>CRITICA</option></select></label>
          <label>Categoria<select value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        </div>
        <button className="primary">Criar chamado</button>
      </form>
    </>
  );
}
