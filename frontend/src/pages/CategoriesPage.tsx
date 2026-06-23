import { FormEvent, useEffect, useState } from "react";
import { ActiveBadge } from "../components/Badge";
import { createCategory, listCategories } from "../services/resources";
import { Category } from "../types/domain";

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function reload() {
    try {
      setCategories(await listCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel carregar categorias.");
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await createCategory({ name, description });
      setName("");
      setDescription("");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel criar a categoria.");
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Categorias</h1>
          <p>Organizacao da fila de chamados por area ou tipo de solicitacao.</p>
        </div>
      </div>
      <form className="inline-form categories-form" onSubmit={handleSubmit}>
        <label>Nome<input placeholder="Nome da categoria" value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label>Descricao<input placeholder="Descricao operacional" value={description} onChange={(event) => setDescription(event.target.value)} /></label>
        <button className="primary form-submit">Adicionar</button>
      </form>
      {error && <div className="alert page-alert">{error}</div>}
      <div className="table categories-table">
        <div className="table-header"><span>Nome</span><span>Descricao</span><span>Status</span></div>
        {categories.map((category) => (
          <div className="table-row" key={category.id}>
            <span data-label="Nome">{category.name}</span>
            <span data-label="Descricao">{category.description}</span>
            <span data-label="Status"><ActiveBadge active={category.is_active} /></span>
          </div>
        ))}
        {!categories.length && <div className="empty-state table-empty">Nenhuma categoria cadastrada.</div>}
      </div>
    </>
  );
}
