import { useEffect, useState } from "react";
import { MetricCard } from "../components/MetricCard";
import { getDashboard } from "../services/resources";
import { DashboardMetrics } from "../types/domain";

interface DistributionItem {
  label: string;
  total: number;
}

function DistributionList({ items }: { items: DistributionItem[] }) {
  const maxTotal = Math.max(...items.map((item) => item.total), 1);

  if (!items.length) {
    return <div className="empty-state">Nenhum dado disponivel.</div>;
  }

  return (
    <div className="distribution-list">
      {items.map((item) => (
        <div className="distribution-row" key={item.label}>
          <div className="distribution-head">
            <span>{item.label}</span>
            <strong>{item.total}</strong>
          </div>
          <div className="distribution-track" aria-hidden="true">
            <span style={{ width: `${Math.max((item.total / maxTotal) * 100, 8)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

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
        <div>
          <h1>Dashboard</h1>
          <p>Visao consolidada da fila de atendimento.</p>
        </div>
      </div>
      <div className="metrics-grid">
        <MetricCard label="Total" value={metrics.total_chamados} description="Chamados registrados" />
        <MetricCard label="Abertos" value={metrics.chamados_abertos} description="Aguardando triagem" tone="info" />
        <MetricCard label="Em andamento" value={metrics.chamados_em_andamento} description="Em tratativa tecnica" tone="warning" />
        <MetricCard label="Resolvidos" value={metrics.chamados_resolvidos} description="Concluidos pela equipe" tone="success" />
      </div>
      <div className="split-grid">
        <section className="panel">
          <h2>Por categoria</h2>
          <DistributionList items={metrics.chamados_por_categoria} />
        </section>
        <section className="panel">
          <h2>Por prioridade</h2>
          <DistributionList items={metrics.chamados_por_prioridade} />
        </section>
      </div>
    </>
  );
}
