export default function KpiCard({ label, value, sub, color, loading, icon, change }) {
  if (loading) {
    return (
      <div style={styles.card} className="kpi-card">
        <div className="skeleton" style={{ width: 80, height: 12, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: 120, height: 28, marginBottom: 6 }} />
        <div className="skeleton" style={{ width: 60, height: 10 }} />
      </div>
    );
  }

  const hasChange = change !== null && change !== undefined;
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <div style={{ ...styles.card, '--accent-color': color || 'var(--accent)' }} className="fade-in kpi-card">
      <div style={styles.header}>
        <span style={styles.label}>{label}</span>
        {icon && <span style={{ ...styles.icon, color }}>{icon}</span>}
      </div>
      <div style={{ ...styles.value, color: color || 'var(--text)' }} className="kpi-value">{value}</div>
      <div style={styles.footer}>
        {sub && <div style={styles.sub}>{sub}</div>}
        {hasChange && (
          <div style={{
            ...styles.change,
            color: isNeutral ? 'var(--text-dim)' : isPositive ? 'var(--green)' : 'var(--red)',
            background: isNeutral ? 'rgba(255,255,255,0.05)' : isPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          }}>
            {isNeutral ? '—' : isPositive ? '↑' : '↓'} {Math.abs(change)}%
          </div>
        )}
      </div>
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
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 8 },
  sub: { fontSize: 12, color: 'var(--text-dim)' },
  change: { fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0 },
  accent: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, opacity: 0.4 },
};
