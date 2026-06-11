import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { NexusLogo } from "../components/NexusLogo";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Nexus";
  }, []);

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-aside">
          <div className="login-identity">
            <NexusLogo className="login-brand" showText={false} />
            <h1>Nexus</h1>
            <p>Centralizando atendimentos. Acelerando soluções.</p>
          </div>
          <ul className="login-benefits" aria-label="Beneficios da plataforma">
            {["Gestão de chamados", "Acompanhamento em tempo real", "Histórico completo de atendimentos"].map((benefit) => (
              <li key={benefit}>
                <CheckCircle2 size={17} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <div className="login-security-note">
            <ShieldCheck size={18} />
            <span>Acesso protegido para equipes autorizadas.</span>
          </div>
        </div>
        <form className="login-panel" onSubmit={handleSubmit}>
          <div className="login-title">
            <h2>Entrar</h2>
            <p>Bem-vindo de volta. Acesse sua conta para acompanhar chamados e operações internas.</p>
          </div>
          <label>E-mail corporativo<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {error && <div className="alert">{error}</div>}
          <button className="primary" type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
        </form>
      </section>
    </main>
  );
}
