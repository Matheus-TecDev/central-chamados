import { FormEvent, useEffect, useState } from "react";
import { AppSelect } from "../components/AppSelect";
import { ActiveBadge, RoleBadge } from "../components/Badge";
import { toOptions, userRoleLabels, userRoles } from "../constants/options";
import { createUser, listUsers } from "../services/resources";
import { User, UserRole } from "../types/domain";

const roleOptions = toOptions(userRoles, userRoleLabels);

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("SOLICITANTE");
  const [error, setError] = useState("");

  async function reload() {
    try {
      setUsers(await listUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel carregar usuarios.");
    }
  }

  useEffect(() => {
    reload();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await createUser({ name, email, password, role });
      setName("");
      setEmail("");
      setPassword("");
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel criar o usuario.");
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Usuarios</h1>
          <p>Cadastro administrativo de acessos e perfis.</p>
        </div>
      </div>
      <form className="inline-form user-form" onSubmit={handleSubmit}>
        <label>Nome<input placeholder="Nome completo" value={name} onChange={(event) => setName(event.target.value)} required /></label>
        <label>E-mail<input placeholder="email@empresa.com" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label>Senha inicial<input placeholder="Senha temporaria" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <AppSelect label="Perfil" value={role} options={roleOptions} onChange={(value) => setRole(value as UserRole)} isSearchable={false} />
        <button className="primary form-submit">Adicionar</button>
      </form>
      {error && <div className="alert page-alert">{error}</div>}
      <div className="table users-table">
        <div className="table-header"><span>Nome</span><span>E-mail</span><span>Perfil</span><span>Status</span></div>
        {users.map((user) => (
          <div className="table-row" key={user.id}>
            <span data-label="Nome">{user.name}</span>
            <span data-label="E-mail">{user.email}</span>
            <span data-label="Perfil"><RoleBadge role={user.role} /></span>
            <span data-label="Status"><ActiveBadge active={user.is_active} /></span>
          </div>
        ))}
        {!users.length && <div className="empty-state table-empty">Nenhum usuario cadastrado.</div>}
      </div>
    </>
  );
}
