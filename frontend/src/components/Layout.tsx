import {
  BarChart3,
  FolderKanban,
  LogOut,
  PlusCircle,
  Settings2,
  Users,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { userRoleLabels } from "../constants/options";
import { NexusLogo } from "./NexusLogo";

const SIDEBAR_COLLAPSED_KEY = "nexus_sidebar_collapsed";

export function Layout() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => sessionStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"
  );

  useEffect(() => {
    document.title = "Nexus";
  }, [location.pathname]);

  useEffect(() => {
    sessionStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const navItems = [
    { to: "/", label: "Dashboard", icon: BarChart3, show: true, active: location.pathname === "/" },
    {
      to: "/chamados",
      label: "Chamados",
      icon: FolderKanban,
      show: true,
      active: location.pathname === "/chamados" || /^\/chamados\/\d+$/.test(location.pathname)
    },
    {
      to: "/chamados/novo",
      label: "Novo chamado",
      icon: PlusCircle,
      show: hasRole("ADMIN", "SOLICITANTE"),
      active: location.pathname === "/chamados/novo"
    },
    { to: "/usuarios", label: "Usuários", icon: Users, show: hasRole("ADMIN"), active: location.pathname === "/usuarios" },
    {
      to: "/admin/atendimento",
      label: "Atendimento",
      icon: Settings2,
      show: hasRole("ADMIN"),
      active: location.pathname === "/admin/atendimento"
    }
  ];

  const currentTitle = navItems.find((item) => item.active)?.label ?? "Nexus";

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside className="sidebar" aria-label="Navegacao principal">
        <div className="sidebar-head">
          <button
            className="sidebar-logo-button"
            type="button"
            onClick={() => sidebarCollapsed && setSidebarCollapsed(false)}
            aria-label={sidebarCollapsed ? "Expandir menu" : "Nexus"}
            title={sidebarCollapsed ? "Expandir menu" : "Nexus"}
          >
            <NexusLogo showText={!sidebarCollapsed} />
          </button>
          <button
            className="icon-button sidebar-close"
            onClick={() => setSidebarCollapsed(true)}
            title="Recolher menu"
            aria-label="Recolher menu"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {navItems.filter((item) => item.show).map((item) => {
            const Icon = item.icon;
            return (
              <NavLink to={item.to} className={item.active ? "active" : ""} key={item.to} title={sidebarCollapsed ? item.label : undefined}>
                <Icon size={18} />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            <strong>{currentTitle}</strong>
          </div>
          <div className="topbar-actions">
            <div className="user-chip">
              <strong>{user?.name}</strong>
              <span>{user?.role ? userRoleLabels[user.role] : ""}</span>
            </div>
            <button className="icon-button logout-button" onClick={handleLogout} title="Sair" aria-label="Sair">
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
