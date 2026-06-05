import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppSelect } from "../components/AppSelect";
import { ticketPriorities, ticketPriorityLabels, toOptions } from "../constants/options";
import { createTicket, listCategories } from "../services/resources";
import { Category, TicketPriority } from "../types/domain";

const priorityOptions = toOptions(ticketPriorities, ticketPriorityLabels);

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
      <div className="page-heading">
        <div>
          <h1>Novo chamado</h1>
          <p>Registre a solicitacao com prioridade e categoria para triagem.</p>
        </div>
      </div>
      <form className="form-panel" onSubmit={handleSubmit}>
        <label>Titulo<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
        <label>Descricao<textarea value={description} onChange={(event) => setDescription(event.target.value)} required /></label>
        <div className="form-grid">
          <AppSelect label="Prioridade" value={priority} options={priorityOptions} onChange={(value) => setPriority(value as TicketPriority)} isSearchable={false} />
          <AppSelect
            label="Categoria"
            value={categoryId}
            options={categories.map((category) => ({ value: String(category.id), label: category.name }))}
            onChange={setCategoryId}
            isDisabled={!categories.length}
            placeholder={categories.length ? "Selecione" : "Sem categorias"}
          />
        </div>
        <button className="primary form-submit" disabled={!categoryId}>Criar chamado</button>
      </form>
    </>
  );
}
