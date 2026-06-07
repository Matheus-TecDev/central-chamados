interface NexusLogoProps {
  className?: string;
  showText?: boolean;
}

export function NexusLogo({ className = "", showText = true }: NexusLogoProps) {
  return (
    <div className={`brand nexus-brand ${className}`}>
      <img className="brand-logo" src="/nexus-logo.svg" alt="Nexus" />
      {showText && (
        <div>
          <strong>Nexus</strong>
          <small>Operacoes</small>
        </div>
      )}
    </div>
  );
}
