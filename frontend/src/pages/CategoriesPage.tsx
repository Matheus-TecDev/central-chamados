import { FormEvent, useEffect, useState } from "react";
import { createCategory, listCategories } from "../services/resources";
import { Category } from "../types/domain";

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function reload() {
    setCategories(await listCategories());
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await createCategory({ name, description });
    setName("");
    setDescription("");
    await reload();
  }

  return (
    <>
      <div className="page-heading"><h1>Categorias</h1></div>
      <form className="inline-form" onSubmit={handleSubmit}>
        <input placeholder="Nome" value={name} onChange={(event) => setName(event.target.value)} />
        <input placeholder="Descricao" value={description} onChange={(event) => setDescription(event.target.value)} />
        <button className="primary">Adicionar</button>
      </form>
      <div className="table">
        <div className="table-header"><span>Nome</span><span>Descricao</span><span>Status</span></div>
        {categories.map((category) => (
          <div className="table-row" key={category.id}><span>{category.name}</span><span>{category.description}</span><span>{category.is_active ? "Ativa" : "Inativa"}</span></div>
        ))}
      </div>
    </>
  );
}
