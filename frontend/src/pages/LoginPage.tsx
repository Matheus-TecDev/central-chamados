import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export function LoginPage() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login.");
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <div className="login-aside">
          <div className="brand">
            <span className="brand-mark">CC</span>
            <div>
              <strong>Central</strong>
              <small>Chamados</small>
            </div>
          </div>
          <div>
            <h1>Central de Chamados</h1>
            <p>Controle operacional para registro, triagem e acompanhamento de solicitacoes internas.</p>
          </div>
          <div className="login-security-note">
            <ShieldCheck size={18} />
            <span>Acesso protegido para equipes autorizadas.</span>
          </div>
        </div>
        <form className="login-panel" onSubmit={handleSubmit}>
          <div className="login-title">
            <span>Acesso ao sistema</span>
            <h2>Entrar</h2>
          </div>
          <label>E-mail corporativo<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
          <label>Senha<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
          {error && <div className="alert">{error}</div>}
          <button className="primary" type="submit">Entrar</button>
        </form>
      </section>
    </main>
  );
}
