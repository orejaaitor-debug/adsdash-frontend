export default function KpiCard({ label, value, sub, color, loading, icon }) {
  if (loading) {
    return (
      <div style={{ ...styles.card }} className="kpi-card">
        <div className="skeleton" style={{ width: 80, height: 12, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: 120, height: 28, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: 60, height: 10 }} />
      </div>
    );
  }
  return (
    <div style={{ ...styles.card, '--accent-color': color || 'var(--accent)' }} className="fade-in kpi-card">
      <div style={styles.header}>
        <span style={styles.label}>{label}</span>
        {icon && <span style={{ ...styles.icon, color: color }}>{icon}</span>}
      </div>
      <div style={{ ...styles.value, color: color || 'var(--text)' }} className="kpi-value">{value}</div>
      {sub && <div style={styles.sub}>{sub}</div>}
      <div style={{ ...styles.accent, background: color || 'var(--accent)' }} />
    </div>
  );
}
const styles = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '20px 22px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'border-color var(--transition)',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  icon: { fontSize: 16, opacity: 0.7 },
  value: { fontSize: 28, fontWeight: 600, letterSpacing: '-0.5px', fontFamily: 'var(--mono)', lineHeight: 1 },
  sub: { fontSize: 12, color: 'var(--text-dim)', marginTop: 6 },
  accent: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, opacity: 0.4 },
};
