import { FormEvent, useEffect, useState } from "react";
import { createUser, listUsers } from "../services/resources";
import { User, UserRole } from "../types/domain";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("SOLICITANTE");

  async function reload() {
    setUsers(await listUsers());
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await createUser({ name, email, password, role });
    setName("");
    setEmail("");
    setPassword("");
    await reload();
  }

  return (
    <>
      <div className="page-heading"><h1>Usuarios</h1></div>
      <form className="inline-form" onSubmit={handleSubmit}>
        <input placeholder="Nome" value={name} onChange={(event) => setName(event.target.value)} />
        <input placeholder="E-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input placeholder="Senha inicial" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}><option>ADMIN</option><option>TECNICO</option><option>SOLICITANTE</option></select>
        <button className="primary">Adicionar</button>
      </form>
      <div className="table">
        <div className="table-header"><span>Nome</span><span>E-mail</span><span>Perfil</span><span>Status</span></div>
        {users.map((user) => (
          <div className="table-row" key={user.id}><span>{user.name}</span><span>{user.email}</span><span>{user.role}</span><span>{user.is_active ? "Ativo" : "Inativo"}</span></div>
        ))}
      </div>
    </>
  );
}
