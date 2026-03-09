import { useState, useEffect, useCallback } from 'react';
import { metaApi, fmt } from '../services/api';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import DateRangePicker from '../components/DateRangePicker';

const TODAY = new Date().toISOString().split('T')[0];
const LAST30 = (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; })();

const CAMPAIGN_COLS = [
  { key: 'campaignName', label: 'Campaña' },
  { key: 'impressions', label: 'Impresiones', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'reach', label: 'Alcance', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'clicks', label: 'Clics', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'ctr', label: 'CTR', align: 'right', mono: true, render: v => fmt(v, 'percent') },
  { key: 'cpc', label: 'CPC', align: 'right', mono: true, render: v => fmt(v, 'currency') },
  { key: 'spend', label: 'Inversión', align: 'right', mono: true, render: v => fmt(v, 'currency') },
  { key: 'roas', label: 'ROAS', align: 'right', mono: true, render: v => v ? fmt(v, 'roas') : '—', },
  { key: 'conversions', label: 'Conv.', align: 'right', mono: true, render: v => fmt(v) },
];

const ADSET_COLS = [
  { key: 'campaignName', label: 'Campaña', render: (v) => <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{v}</span> },
  { key: 'adsetName', label: 'Conjunto' },
  { key: 'impressions', label: 'Impr.', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'reach', label: 'Alcance', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'clicks', label: 'Clics', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'ctr', label: 'CTR', align: 'right', mono: true, render: v => fmt(v, 'percent') },
  { key: 'cpc', label: 'CPC', align: 'right', mono: true, render: v => fmt(v, 'currency') },
  { key: 'spend', label: 'Inversión', align: 'right', mono: true, render: v => fmt(v, 'currency') },
  { key: 'roas', label: 'ROAS', align: 'right', mono: true, render: v => v ? fmt(v, 'roas') : '—' },
];

export default function MetaDashboard() {
  const [dateRange, setDateRange] = useState({ from: LAST30, to: TODAY });
  const [overview, setOverview] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
  const [adsets, setAdsets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('campaigns');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, cmp, ads] = await Promise.all([
        metaApi.getOverview(dateRange.from, dateRange.to),
        metaApi.getCampaigns(dateRange.from, dateRange.to),
        metaApi.getAdsets(dateRange.from, dateRange.to),
      ]);
      setOverview(ov.summary);
      setCampaigns(cmp.campaigns);
      setAdsets(ads.adsets);
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Meta Ads</span>
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
        <KpiCard label="Inversión" value={loading ? '...' : fmt(s?.spend, 'currency')} sub="Total gastado" color="#1877F2" loading={loading} icon="💰" />
        <KpiCard label="Alcance" value={loading ? '...' : fmt(s?.reach)} sub="Personas únicas" color="#6C63FF" loading={loading} icon="👥" />
        <KpiCard label="Impresiones" value={loading ? '...' : fmt(s?.impressions)} sub="Total" color="#8B5CF6" loading={loading} icon="👁" />
        <KpiCard label="Clics" value={loading ? '...' : fmt(s?.clicks)} sub={`CTR: ${fmt(s?.ctr, 'percent')}`} color="#06B6D4" loading={loading} icon="🖱" />
        <KpiCard label="CPC" value={loading ? '...' : fmt(s?.cpc, 'currency')} sub="Costo por clic" color="#10B981" loading={loading} icon="💸" />
        <KpiCard label="ROAS" value={loading ? '...' : fmt(s?.roas, 'roas')} sub="Retorno en inversión" color={s?.roas >= 2 ? '#22c55e' : '#f59e0b'} loading={loading} icon="📈" />
        <KpiCard label="Conversiones" value={loading ? '...' : fmt(s?.conversions)} sub="Compras/Eventos" color="#F59E0B" loading={loading} icon="🎯" />
      </div>

      {/* Sub-tabs */}
      <div style={styles.tabs}>
        {[
          { id: 'campaigns', label: 'Campañas' },
          { id: 'adsets', label: 'Conjuntos de anuncios' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}) }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tables */}
      {activeTab === 'campaigns' && (
        <DataTable columns={CAMPAIGN_COLS} rows={campaigns} loading={loading} emptyMsg="No hay campañas activas en este período" />
      )}
      {activeTab === 'adsets' && (
        <DataTable columns={ADSET_COLS} rows={adsets} loading={loading} emptyMsg="No hay conjuntos en este período" />
      )}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 24 },
  platformHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  platformBadge: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(24,119,242,0.1)', border: '1px solid rgba(24,119,242,0.2)', borderRadius: 20, padding: '6px 14px' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 },
  tabs: { display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 0 },
  tab: { background: 'none', border: 'none', borderBottom: '2px solid transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500, padding: '8px 14px', transition: 'all var(--transition)', marginBottom: -1 },
  tabActive: { borderBottomColor: '#1877F2', color: '#1877F2' },
  errorBox: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, padding: '12px 16px' },
  retryBtn: { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, padding: '4px 10px' },
};
