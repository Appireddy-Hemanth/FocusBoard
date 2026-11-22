export default function StatCard({ icon, tone, label, value, progress }) {
  if (progress) {
    return (
      <article className="stat-card progress-card">
        <div><span>{label}</span><strong>{value}%</strong></div>
        <div className="progress-track" role="progressbar" aria-label={`${label}: ${value}%`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={value}><div style={{ width: `${value}%` }} /></div>
      </article>
    )
  }
  return <article className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong></div></article>
}
