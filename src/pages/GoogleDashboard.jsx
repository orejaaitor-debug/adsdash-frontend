import { useState, useEffect, useCallback } from 'react';
import { googleApi, fmt } from '../services/api';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import DateRangePicker from '../components/DateRangePicker';

const TODAY = new Date().toISOString().split('T')[0];
const LAST30 = (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; })();

const STATUS_COLORS = { ENABLED: '#22c55e', PAUSED: '#f59e0b', REMOVED: '#ef4444' };
const CHANNEL_LABELS = { SEARCH: 'Search', DISPLAY: 'Display', SHOPPING: 'Shopping', VIDEO: 'Video', PERFORMANCE_MAX: 'PMax', SMART: 'Smart' };

const CAMPAIGN_COLS = [
  { key: 'campaignName', label: 'Campaña' },
  {
    key: 'status', label: 'Estado', render: v => (
      <span style={{ color: STATUS_COLORS[v] || 'var(--text-muted)', fontSize: 11, fontWeight: 600 }}>
        {v === 'ENABLED' ? '● Activa' : v === 'PAUSED' ? '● Pausada' : v}
      </span>
    )
  },
  { key: 'type', label: 'Tipo', render: v => CHANNEL_LABELS[v] || v },
  { key: 'impressions', label: 'Impr.', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'clicks', label: 'Clics', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'ctr', label: 'CTR', align: 'right', mono: true, render: v => `${v}%` },
  { key: 'cpc', label: 'CPC', align: 'right', mono: true, render: v => fmt(v, 'currency') },
  { key: 'spend', label: 'Inversión', align: 'right', mono: true, render: v => fmt(v, 'currency') },
  { key: 'conversions', label: 'Conv.', align: 'right', mono: true },
  { key: 'costPerConversion', label: 'CPA', align: 'right', mono: true, render: v => fmt(v, 'currency') },
];

export default function GoogleDashboard() {
  const [dateRange, setDateRange] = useState({ from: LAST30, to: TODAY });
  const [overview, setOverview] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, cmp] = await Promise.all([
        googleApi.getOverview(dateRange.from, dateRange.to),
        googleApi.getCampaigns(dateRange.from, dateRange.to),
      ]);
      setOverview(ov.summary);
      setCampaigns(cmp.campaigns);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const s = overview;

  return (
    <div style={styles.wrap} className="fade-in">
      {/* Header */}
      <div style={styles.platformHeader}>
        <div style={styles.platformBadge}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Google Ads</span>
        </div>
        <DateRangePicker onChange={setDateRange} />
      </div>

      {error && (
        <div style={styles.errorBox}>
          <strong>Error al cargar datos:</strong> {error}
          <button onClick={fetchData} style={styles.retryBtn}>Reintentar</button>
        </div>
      )}

      {/* KPIs */}
      <div style={styles.kpiGrid}>
        <KpiCard label="Inversión" value={loading ? '...' : fmt(s?.spend, 'currency')} sub="Total gastado" color="#4285F4" loading={loading} icon="💰" />
        <KpiCard label="Impresiones" value={loading ? '...' : fmt(s?.impressions)} sub="Total" color="#8B5CF6" loading={loading} icon="👁" />
        <KpiCard label="Clics" value={loading ? '...' : fmt(s?.clicks)} sub={`CTR: ${fmt(s?.ctr, 'percent')}`} color="#34A853" loading={loading} icon="🖱" />
        <KpiCard label="CPC Prom." value={loading ? '...' : fmt(s?.cpc, 'currency')} sub="Costo por clic promedio" color="#06B6D4" loading={loading} icon="💸" />
        <KpiCard label="Conversiones" value={loading ? '...' : fmt(s?.conversions, 'decimal')} sub="Total" color="#FBBC05" loading={loading} icon="🎯" />
        <KpiCard label="ROAS" value={loading ? '...' : fmt(s?.roas, 'roas')} sub="Retorno en inversión" color={s?.roas >= 2 ? '#22c55e' : '#f59e0b'} loading={loading} icon="📈" />
      </div>

      {/* Campaigns table */}
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>Campañas</h3>
      </div>
      <DataTable columns={CAMPAIGN_COLS} rows={campaigns} loading={loading} emptyMsg="No hay campañas en este período" />
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 24 },
  platformHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  platformBadge: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.2)', borderRadius: 20, padding: '6px 14px' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 15, fontWeight: 600, letterSpacing: '-0.2px' },
  errorBox: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, padding: '12px 16px' },
  retryBtn: { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, padding: '4px 10px' },
};
