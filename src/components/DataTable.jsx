export default function DataTable({ columns, rows, loading, emptyMsg = 'Sin datos' }) {
  if (loading) {
    return (
      <div style={styles.wrap}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 44, marginBottom: 4, borderRadius: 6 }} />
        ))}
      </div>
    );
  }

  if (!rows || rows.length === 0) {
    return <div style={styles.empty}>{emptyMsg}</div>;
  }

  return (
    <div style={styles.wrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ ...styles.th, textAlign: col.align || 'left' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={styles.tr}>
              {columns.map(col => (
                <td key={col.key} style={{ ...styles.td, textAlign: col.align || 'left', fontFamily: col.mono ? 'var(--mono)' : 'var(--font)' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  wrap: { overflowX: 'auto', borderRadius: 'var(--radius)', border: '1px solid var(--border)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th: {
    padding: '11px 16px',
    background: 'var(--surface2)',
    color: 'var(--text-muted)',
    fontWeight: 500,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid var(--border)',
  },
  tr: {
    borderBottom: '1px solid var(--border)',
    transition: 'background var(--transition)',
  },
  td: {
    padding: '12px 16px',
    color: 'var(--text)',
    whiteSpace: 'nowrap',
    background: 'var(--surface)',
  },
  empty: {
    textAlign: 'center',
    padding: 48,
    color: 'var(--text-dim)',
    fontSize: 14,
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
  },
};
