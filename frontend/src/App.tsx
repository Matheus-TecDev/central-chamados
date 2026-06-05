import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CategoriesPage } from "./pages/CategoriesPage";
import { CreateTicketPage } from "./pages/CreateTicketPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { TicketsPage } from "./pages/TicketsPage";
import { UsersPage } from "./pages/UsersPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/chamados" element={<TicketsPage />} />
        <Route path="/chamados/novo" element={<CreateTicketPage />} />
        <Route path="/chamados/:id" element={<TicketDetailPage />} />
        <Route path="/usuarios" element={<ProtectedRoute roles={["ADMIN"]}><UsersPage /></ProtectedRoute>} />
        <Route path="/categorias" element={<ProtectedRoute roles={["ADMIN"]}><CategoriesPage /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
