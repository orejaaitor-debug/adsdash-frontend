import { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const METRICS = [
  { key: 'spend',       label: 'Inversión',    color: '#1877F2', format: 'currency', defaultOn: true },
  { key: 'reach',       label: 'Alcance',      color: '#6C63FF', format: 'number',   defaultOn: true },
  { key: 'impressions', label: 'Impresiones',  color: '#8B5CF6', format: 'number',   defaultOn: false },
  { key: 'clicks',      label: 'Clics',        color: '#06B6D4', format: 'number',   defaultOn: false },
  { key: 'messages',    label: 'Mensajes',     color: '#F59E0B', format: 'number',   defaultOn: true },
  { key: 'conversions', label: 'Conversiones', color: '#10B981', format: 'number',   defaultOn: false },
];

function fmtVal(val, format) {
  if (val === null || val === undefined) return '—';
  if (format === 'currency') return `$${Number(val).toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
  return Number(val).toLocaleString('es-AR');
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface2)', border: '1px solid var(--border)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12, minWidth: 160
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, color: p.color, marginBottom: 2 }}>
          <span>{p.name}</span>
          <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>
            {fmtVal(p.value, METRICS.find(m => m.key === p.dataKey)?.format)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function MetricsChart({ data, hasMessages, hasConversions }) {
  const defaultActive = useMemo(() => {
    const obj = {};
    METRICS.forEach(m => { obj[m.key] = m.defaultOn; });
    if (!hasMessages) obj.messages = false;
    if (!hasConversions) obj.conversions = false;
    return obj;
  }, [hasMessages, hasConversions]);

  const [active, setActive] = useState(defaultActive);

  const visibleMetrics = METRICS.filter(m => {
    if (m.key === 'messages' && !hasMessages) return false;
    if (m.key === 'conversions' && !hasConversions) return false;
    return true;
  });

  const toggle = (key) => setActive(prev => ({ ...prev, [key]: !prev[key] }));

  if (!data?.length) return (
    <div style={styles.empty}>No hay datos diarios para este período</div>
  );

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <span style={styles.title}>Evolución diaria</span>
        <div style={styles.toggles}>
          {visibleMetrics.map(m => (
            <button
              key={m.key}
              onClick={() => toggle(m.key)}
              style={{
                ...styles.toggle,
                background: active[m.key] ? `${m.color}22` : 'transparent',
                border: `1px solid ${active[m.key] ? m.color : 'var(--border)'}`,
                color: active[m.key] ? m.color : 'var(--text-muted)',
              }}
            >
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: active[m.key] ? m.color : 'var(--border)',
                display: 'inline-block', marginRight: 5, flexShrink: 0
              }} />
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={d => {
              const [, m, day] = d.split('-');
              return `${parseInt(day)}/${parseInt(m)}`;
            }}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          {visibleMetrics.filter(m => active[m.key]).map(m => (
            <Line
              key={m.key}
              type="monotone"
              dataKey={m.key}
              name={m.label}
              stroke={m.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles = {
  wrap: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '16px 20px',
  },
  header: {
    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: 12, marginBottom: 16,
  },
  title: { fontWeight: 600, fontSize: 14, color: 'var(--text)' },
  toggles: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  toggle: {
    display: 'flex', alignItems: 'center',
    borderRadius: 20, padding: '4px 10px',
    fontSize: 12, fontWeight: 500, cursor: 'pointer',
    fontFamily: 'var(--font)', transition: 'all 0.15s',
  },
  empty: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: 32,
    textAlign: 'center', color: 'var(--text-muted)', fontSize: 13,
  },
};
