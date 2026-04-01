function MetricCard({ label, value, icon, subtitle }) {
  return (
    <article className="metric-card clinical-card">
      <p className="metric-label">{label}</p>
      <p className="metric-value">{value}</p>
      <div className="metric-meta">
        {icon ? <span className="metric-icon" aria-hidden="true">{icon}</span> : null}
        <span>{subtitle}</span>
      </div>
    </article>
  );
}

export default MetricCard;
