import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
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
      <form className="login-panel" onSubmit={handleSubmit}>
        <div className="login-title">
          <span className="brand-mark">CC</span>
          <div>
            <h1>Central de Chamados</h1>
            <p>Atendimento corporativo interno</p>
          </div>
        </div>
        <label>E-mail<input value={email} onChange={(event) => setEmail(event.target.value)} /></label>
        <label>Senha<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
        {error && <div className="alert">{error}</div>}
        <button className="primary" type="submit">Entrar</button>
      </form>
    </main>
  );
}
