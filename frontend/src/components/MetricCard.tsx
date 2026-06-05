interface MetricCardProps {
  description?: string;
  label: string;
  tone?: "neutral" | "info" | "success" | "warning";
  value: number;
}

export function MetricCard({ description, label, tone = "neutral", value }: MetricCardProps) {
  return (
    <article className={`metric-card metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {description && <small>{description}</small>}
    </article>
  );
}
