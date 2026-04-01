function MetricCard({ label, value }) {
  return (
    <article className="metric-card">
      <h3>{label}</h3>
      <p>{value}</p>
    </article>
  );
}

export default MetricCard;
