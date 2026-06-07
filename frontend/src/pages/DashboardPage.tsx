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
    return <div className="empty-state">Nenhum dado disponivel para a visão atual.</div>;
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
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Nexus | Dashboard";
    getDashboard().then(setMetrics).catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar dashboard."));
  }, []);

  if (error) {
    return <div className="alert">{error}</div>;
  }

  if (!metrics) {
    return <div className="loading">Carregando indicadores do Nexus...</div>;
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Dashboard Nexus</h1>
          <p>Visão consolidada de atendimentos, filas e operacoes internas.</p>
        </div>
      </div>
      <div className="metrics-grid metrics-grid-six">
        <MetricCard label="Total de chamados" value={metrics.total_chamados} description="Registros visiveis" />
        <MetricCard label="Chamados abertos" value={metrics.chamados_abertos} description="Aguardando triagem" tone="info" />
        <MetricCard label="Em andamento" value={metrics.chamados_em_andamento} description="Em atendimento" tone="warning" />
        <MetricCard label="Aguardando" value={metrics.chamados_aguardando} description="Solicitante ou terceiros" tone="warning" />
        <MetricCard label="Concluídos" value={metrics.chamados_concluidos} description="Finalizados pela equipe" tone="success" />
        <MetricCard label="Sem responsável" value={metrics.chamados_sem_responsavel} description="Disponiveis para atendimento" tone="info" />
      </div>
      <div className="split-grid">
        <section className="panel">
          <h2>Por setor</h2>
          <DistributionList items={metrics.chamados_por_setor} />
        </section>
        <section className="panel">
          <h2>Por area</h2>
          <DistributionList items={metrics.chamados_por_area} />
        </section>
        <section className="panel">
          <h2>Por tipo</h2>
          <DistributionList items={metrics.chamados_por_tipo} />
        </section>
        <section className="panel">
          <h2>Por prioridade</h2>
          <DistributionList items={metrics.chamados_por_prioridade} />
        </section>
      </div>
    </>
  );
}
