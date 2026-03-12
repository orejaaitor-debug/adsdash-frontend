import { useState, useEffect } from 'react';

const PRESETS = [
  { label: 'Hoy', value: 'today' },
  { label: 'Ayer', value: 'yesterday' },
  { label: 'Últ. 7d', value: '7d' },
  { label: 'Últ. 30d', value: '30d' },
  { label: 'Este mes', value: 'month' },
];

function getRange(preset) {
  const today = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  switch (preset) {
    case 'today': return { from: fmt(today), to: fmt(today) };
    case 'yesterday': {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      return { from: fmt(y), to: fmt(y) };
    }
    case '7d': {
      const s = new Date(today); s.setDate(s.getDate() - 7);
      return { from: fmt(s), to: fmt(today) };
    }
    case '30d': {
      const s = new Date(today); s.setDate(s.getDate() - 30);
      return { from: fmt(s), to: fmt(today) };
    }
    case 'month': {
      const s = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: fmt(s), to: fmt(today) };
    }
    default: return null;
  }
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function DateRangePicker({ onChange }) {
  const [active, setActive] = useState('30d');
  const [custom, setCustom] = useState({ from: '', to: '' });
  const [showCustom, setShowCustom] = useState(false);
  const isMobile = useIsMobile();

  function handlePreset(preset) {
    setActive(preset);
    setShowCustom(false);
    onChange(getRange(preset));
  }

  function handleCustomApply() {
    if (custom.from && custom.to) {
      setActive('custom');
      onChange({ from: custom.from, to: custom.to });
      setShowCustom(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.presets}>
        {PRESETS.map(p => (
          <button
            key={p.value}
            onClick={() => handlePreset(p.value)}
            style={{ ...styles.preset, ...(active === p.value ? styles.presetActive : {}) }}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(v => !v)}
          style={{ ...styles.preset, ...(showCustom || active === 'custom' ? styles.presetActive : {}) }}
          title="Personalizado"
        >
          {isMobile ? '📅' : 'Personalizado'}
        </button>
      </div>

      {showCustom && (
        <div style={styles.customRow}>
          <input
            type="date"
            style={styles.dateInput}
            value={custom.from}
            onChange={e => setCustom(c => ({ ...c, from: e.target.value }))}
          />
          <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>→</span>
          <input
            type="date"
            style={styles.dateInput}
            value={custom.to}
            onChange={e => setCustom(c => ({ ...c, to: e.target.value }))}
          />
          <button onClick={handleCustomApply} style={styles.applyBtn}>Aplicar</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 8 },
  presets: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  preset: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontFamily: 'var(--font)',
    fontSize: 12,
    fontWeight: 500,
    padding: '5px 12px',
    transition: 'all var(--transition)',
    whiteSpace: 'nowrap',
  },
  presetActive: {
    background: 'var(--accent)',
    border: '1px solid var(--accent)',
    color: '#fff',
  },
  customRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  dateInput: {
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text)',
    fontFamily: 'var(--font)',
    fontSize: 13,
    padding: '6px 10px',
    outline: 'none',
  },
  applyBtn: {
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    color: '#fff',
    cursor: 'pointer',
    fontFamily: 'var(--font)',
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 14px',
  },
};
