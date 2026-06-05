import { BarChart3, FolderKanban, LogOut, Menu, PlusCircle, Tags, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userRoleLabels } from "../constants/options";

export function Layout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className={`app-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
      <aside className="sidebar" aria-label="Navegacao principal">
        <div className="sidebar-head">
          <div className="brand">
            <span className="brand-mark">CC</span>
            <div>
              <strong>Central</strong>
              <small>Chamados</small>
            </div>
          </div>
          <button className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu">
            <X size={18} />
          </button>
        </div>
        <nav>
          <NavLink to="/"><BarChart3 size={18} />Dashboard</NavLink>
          <NavLink to="/chamados"><FolderKanban size={18} />Chamados</NavLink>
          <NavLink to="/chamados/novo"><PlusCircle size={18} />Novo chamado</NavLink>
          {hasRole("ADMIN") && <NavLink to="/usuarios"><Users size={18} />Usuarios</NavLink>}
          {hasRole("ADMIN") && <NavLink to="/categorias"><Tags size={18} />Categorias</NavLink>}
        </nav>
      </aside>
      {sidebarOpen && <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu" />}
      <main className="main">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
            <Menu size={18} />
          </button>
          <div className="topbar-title">
            <strong>Operacao de suporte</strong>
            <span>Central corporativa de atendimento</span>
          </div>
          <div className="topbar-actions">
            <div className="user-chip">
              <strong>{user?.name}</strong>
              <span>{user?.role ? userRoleLabels[user.role] : ""}</span>
            </div>
            <button className="icon-button" onClick={() => { logout(); navigate("/login"); }} title="Sair" aria-label="Sair">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <section className="content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
