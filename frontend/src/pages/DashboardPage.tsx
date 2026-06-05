import { useEffect, useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { getDashboard } from "../services/resources";
import { DashboardMetrics } from "../types/domain";

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  useEffect(() => {
    getDashboard().then(setMetrics);
  }, []);

  if (!metrics) {
    return <div className="loading">Carregando dashboard...</div>;
  }

  return (
    <>
      <div className="page-heading">
        <h1>Dashboard</h1>
      </div>
      <div className="metrics-grid">
        <MetricCard label="Total" value={metrics.total_chamados} />
        <MetricCard label="Abertos" value={metrics.chamados_abertos} />
        <MetricCard label="Em andamento" value={metrics.chamados_em_andamento} />
        <MetricCard label="Resolvidos" value={metrics.chamados_resolvidos} />
      </div>
      <div className="split-grid">
        <section className="panel">
          <h2>Por categoria</h2>
          {metrics.chamados_por_categoria.map((item) => (
            <div className="bar-row" key={item.label}><span>{item.label}</span><strong>{item.total}</strong></div>
          ))}
        </section>
        <section className="panel">
          <h2>Por prioridade</h2>
          {metrics.chamados_por_prioridade.map((item) => (
            <div className="bar-row" key={item.label}><span>{item.label}</span><strong>{item.total}</strong></div>
          ))}
        </section>
      </div>
    </>
  );
}
