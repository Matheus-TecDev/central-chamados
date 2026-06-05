import { BarChart3, FolderKanban, LogOut, PlusCircle, Tags, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Layout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">CC</span>
          <div>
            <strong>Central</strong>
            <small>Chamados</small>
          </div>
        </div>
        <nav>
          <NavLink to="/"><BarChart3 size={18} />Dashboard</NavLink>
          <NavLink to="/chamados"><FolderKanban size={18} />Chamados</NavLink>
          <NavLink to="/chamados/novo"><PlusCircle size={18} />Novo chamado</NavLink>
          {hasRole("ADMIN") && <NavLink to="/usuarios"><Users size={18} />Usuarios</NavLink>}
          {hasRole("ADMIN") && <NavLink to="/categorias"><Tags size={18} />Categorias</NavLink>}
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </div>
          <button className="icon-button" onClick={() => { logout(); navigate("/login"); }} title="Sair">
            <LogOut size={18} />
          </button>
        </header>
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
