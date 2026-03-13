import { useState, useEffect, useCallback } from 'react';
import { metaApi, fmt } from '../services/api';
import KpiCard from '../components/KpiCard';
import DataTable from '../components/DataTable';
import DateRangePicker from '../components/DateRangePicker';
import MetricsChart from '../components/MetricsChart';

const TODAY = new Date().toISOString().split('T')[0];
const LAST30 = (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; })();

const OBJECTIVE_LABELS = {
  MESSAGES: 'Mensajes', ENGAGEMENT: 'Interacción', POST_ENGAGEMENT: 'Interacción',
  PAGE_LIKES: 'Me gusta', VIDEO_VIEWS: 'Vistas de video', CONVERSIONS: 'Conversiones',
  OUTCOME_SALES: 'Ventas', OUTCOME_LEADS: 'Leads', OUTCOME_TRAFFIC: 'Tráfico',
  OUTCOME_ENGAGEMENT: 'Interacción', OUTCOME_AWARENESS: 'Reconocimiento',
  OUTCOME_VIDEO_VIEWS: 'Vistas de video', LEAD_GENERATION: 'Leads',
  REACH: 'Reconocimiento', BRAND_AWARENESS: 'Reconocimiento',
};

const STATUS_CONFIG = {
  ACTIVE:    { label: 'Activa',   color: '#22c55e' },
  PAUSED:    { label: 'Pausada',  color: '#f59e0b' },
  ARCHIVED:  { label: 'Archivada', color: '#6b7280' },
  DELETED:   { label: 'Eliminada', color: '#ef4444' },
  // effective_status values
  ACTIVE_PENDING_REVIEW:  { label: 'En revisión', color: '#f59e0b' },
  IN_PROCESS:             { label: 'Procesando', color: '#3b82f6' },
  WITH_ISSUES:            { label: 'Con errores', color: '#ef4444' },
  DISAPPROVED:            { label: 'Rechazada',  color: '#ef4444' },
  CAMPAIGN_PAUSED:        { label: 'Campaña pausada', color: '#f59e0b' },
  ADSET_PAUSED:           { label: 'Conjunto pausado', color: '#f59e0b' },
};

function StatusBadge({ status, effectiveStatus }) {
  const key = effectiveStatus || status;
  if (!key) return <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>—</span>;
  const cfg = STATUS_CONFIG[key] || { label: key, color: '#6b7280' };
  return (
    <span style={{
      fontSize: 11, fontWeight: 600,
      color: cfg.color,
      background: cfg.color + '18',
      padding: '2px 8px',
      borderRadius: 10,
      whiteSpace: 'nowrap',
    }}>
      ● {cfg.label}
    </span>
  );
}

// Columna "Resultado" dinámica por objetivo
function ResultCell({ row }) {
  const { objectiveType, spend } = row;

  if (objectiveType === 'messages') {
    return (
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{fmt(row.messages)}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {row.costPerMessage ? `${fmt(row.costPerMessage, 'currency')}/msg` : '—'}
        </div>
      </div>
    );
  }
  if (objectiveType === 'engagement') {
    return (
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{fmt(row.postEngagements)}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {row.costPerEngagement ? `${fmt(row.costPerEngagement, 'currency')}/int.` : '—'}
        </div>
      </div>
    );
  }
  if (objectiveType === 'video') {
    return (
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{fmt(row.videoViews)}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {row.costPerVideoView ? `${fmt(row.costPerVideoView, 'currency')}/vista` : '—'}
        </div>
      </div>
    );
  }
  if (objectiveType === 'leads') {
    return (
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{fmt(row.leads)}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {row.costPerLead ? `${fmt(row.costPerLead, 'currency')}/lead` : '—'}
        </div>
      </div>
    );
  }
  if (objectiveType === 'awareness') {
    return (
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{fmt(row.reach)}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {row.cpm ? `CPM ${fmt(row.cpm, 'currency')}` : '—'}
        </div>
      </div>
    );
  }
  if (objectiveType === 'traffic') {
    return (
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{fmt(row.clicks)}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {row.cpc ? `CPC ${fmt(row.cpc, 'currency')}` : '—'}
        </div>
      </div>
    );
  }
  // conversion (default)
  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>{fmt(row.conversions)}</div>
      <div style={{ fontSize: 11, color: row.roas >= 2 ? 'var(--green)' : 'var(--text-muted)' }}>
        {row.roas ? `ROAS ${fmt(row.roas, 'roas')}` : '—'}
      </div>
    </div>
  );
}

const RESULT_LABELS = {
  messages: 'Mensajes',
  engagement: 'Interacciones',
  video: 'Vistas',
  leads: 'Leads',
  awareness: 'Alcance',
  traffic: 'Clics web',
  conversion: 'Conversiones',
};

function buildCols(baseKeys, resultKey) {
  const STATUS_COL = {
    key: 'status',
    label: 'Estado',
    render: (v, row) => <StatusBadge status={v} effectiveStatus={row.effectiveStatus} />,
  };
  const OBJECTIVE_COL = {
    key: 'objective',
    label: 'Objetivo',
    render: v => (
      <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--surface2)', padding: '2px 8px', borderRadius: 10 }}>
        {OBJECTIVE_LABELS[v] || v || '—'}
      </span>
    ),
  };
  const RESULT_COL = {
    key: resultKey,
    label: 'Resultado',
    align: 'right',
    render: (_, row) => <ResultCell row={row} />,
  };

  return [...baseKeys, STATUS_COL, OBJECTIVE_COL, RESULT_COL];
}

const CAMPAIGN_BASE = [
  { key: 'campaignName', label: 'Campaña' },
  { key: 'impressions', label: 'Impresiones', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'reach', label: 'Alcance', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'clicks', label: 'Clics', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'ctr', label: 'CTR', align: 'right', mono: true, render: v => fmt(v, 'percent') },
  { key: 'cpc', label: 'CPC', align: 'right', mono: true, render: v => fmt(v, 'currency') },
  { key: 'spend', label: 'Inversión', align: 'right', mono: true, render: v => fmt(v, 'currency') },
];

const ADSET_BASE = [
  { key: 'campaignName', label: 'Campaña', render: v => <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{v}</span> },
  { key: 'adsetName', label: 'Conjunto' },
  { key: 'impressions', label: 'Impr.', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'reach', label: 'Alcance', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'clicks', label: 'Clics', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'ctr', label: 'CTR', align: 'right', mono: true, render: v => fmt(v, 'percent') },
  { key: 'cpc', label: 'CPC', align: 'right', mono: true, render: v => fmt(v, 'currency') },
  { key: 'spend', label: 'Inversión', align: 'right', mono: true, render: v => fmt(v, 'currency') },
];

const AD_BASE = [
  { key: 'campaignName', label: 'Campaña', render: v => <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{v}</span> },
  { key: 'adsetName', label: 'Conjunto', render: v => <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{v}</span> },
  { key: 'adName', label: 'Anuncio' },
  { key: 'impressions', label: 'Impr.', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'clicks', label: 'Clics', align: 'right', mono: true, render: v => fmt(v) },
  { key: 'ctr', label: 'CTR', align: 'right', mono: true, render: v => fmt(v, 'percent') },
  { key: 'spend', label: 'Inversión', align: 'right', mono: true, render: v => fmt(v, 'currency') },
];

const CAMPAIGN_COLS = buildCols(CAMPAIGN_BASE, 'campaignId');
const ADSET_COLS   = buildCols(ADSET_BASE, 'adsetId');
const AD_COLS      = buildCols(AD_BASE, 'adId');

export default function MetaDashboard({ client }) {
  const [dateRange, setDateRange] = useState({ from: LAST30, to: TODAY });
  const [overview, setOverview] = useState(null);
  const [campaigns, setCampaigns] = useState(null);
  const [adsets, setAdsets] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [changes, setChanges] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('campaigns');

  const accounts = client?.metaAccounts || (client?.meta ? [client.meta] : []);
  const [selectedAccount, setSelectedAccount] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, cmp, ads, daily, compare] = await Promise.all([
        metaApi.getOverview(dateRange.from, dateRange.to, selectedAccount),
        metaApi.getCampaigns(dateRange.from, dateRange.to, selectedAccount),
        metaApi.getAdsets(dateRange.from, dateRange.to, selectedAccount),
        metaApi.getDaily(dateRange.from, dateRange.to, selectedAccount),
        metaApi.getCompare(dateRange.from, dateRange.to, selectedAccount),
      ]);
      setOverview(ov);
      setCampaigns(cmp.campaigns);
      setAdsets(ads.adsets);
      setDailyData(daily.days);
      setChanges(compare.changes);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedAccount]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const s = overview?.summary;
  const ch = changes;

  // Detectar qué tipos de objetivo hay en la cuenta
  const hasMessages    = s?.messages > 0;
  const hasConversions = s?.conversions > 0;
  const hasEngagement  = s?.postEngagements > 0;
  const hasVideoViews  = s?.videoViews > 0;
  const hasLeads       = s?.leads > 0;

  return (
    <div style={styles.wrap} className="fade-in">
      <div style={styles.platformHeader} className="platform-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={styles.platformBadge}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span style={{ fontWeight: 600, fontSize: 15 }}>Meta Ads</span>
          </div>
          {accounts.length > 1 && (
            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(Number(e.target.value))}
              style={styles.accountSelect}
            >
              {accounts.map((acc, i) => (
                <option key={i} value={i}>{acc.businessName || acc.adAccountId}</option>
              ))}
            </select>
          )}
        </div>
        <DateRangePicker onChange={setDateRange} />
      </div>

      {error && (
        <div style={styles.errorBox}>
          <strong>Error al cargar datos:</strong> {error}
          <button onClick={fetchData} style={styles.retryBtn}>Reintentar</button>
        </div>
      )}

      {/* KPIs — siempre fijos */}
      <div style={styles.kpiGrid} className="kpi-grid">
        <KpiCard label="Inversión"   value={loading ? '...' : fmt(s?.spend, 'currency')} sub="Total gastado"    color="#1877F2" loading={loading} icon="💰" change={ch?.spend} />
        <KpiCard label="Alcance"     value={loading ? '...' : fmt(s?.reach)}             sub="Personas únicas"  color="#6C63FF" loading={loading} icon="👥" change={ch?.reach} />
        <KpiCard label="Impresiones" value={loading ? '...' : fmt(s?.impressions)}       sub="Total"            color="#8B5CF6" loading={loading} icon="👁"  change={ch?.impressions} />
        <KpiCard label="Clics"       value={loading ? '...' : fmt(s?.clicks)}            sub={`CTR: ${fmt(s?.ctr, 'percent')}`} color="#06B6D4" loading={loading} icon="🖱" change={ch?.clicks} />
        <KpiCard label="CPC"         value={loading ? '...' : fmt(s?.cpc, 'currency')}  sub="Costo por clic"   color="#10B981" loading={loading} icon="💸" change={ch?.cpc} />
        <KpiCard label="CPM"         value={loading ? '...' : fmt(s?.cpm, 'currency')}  sub="Costo por mil imp." color="#64748b" loading={loading} icon="📊" change={ch?.cpm} />

        {/* KPIs condicionales por objetivo */}
        {hasMessages && !loading && (
          <KpiCard label="Mensajes"       value={fmt(s?.messages)}       sub={s?.costPerMessage ? `${fmt(s.costPerMessage, 'currency')} por mensaje` : 'Conversaciones'} color="#F59E0B" loading={loading} icon="💬" change={ch?.messages} />
        )}
        {hasEngagement && !loading && (
          <KpiCard label="Interacciones"  value={fmt(s?.postEngagements)} sub={s?.costPerEngagement ? `${fmt(s.costPerEngagement, 'currency')} por int.` : 'Interacciones totales'} color="#EC4899" loading={loading} icon="❤️" change={ch?.postEngagements} />
        )}
        {hasVideoViews && !loading && (
          <KpiCard label="Vistas de video" value={fmt(s?.videoViews)}    sub={s?.costPerVideoView ? `${fmt(s.costPerVideoView, 'currency')} por vista` : 'Reproducciones'} color="#8B5CF6" loading={loading} icon="▶️" change={ch?.videoViews} />
        )}
        {hasLeads && !loading && (
          <KpiCard label="Leads"          value={fmt(s?.leads)}          sub={s?.costPerLead ? `${fmt(s.costPerLead, 'currency')} por lead` : 'Leads generados'} color="#14B8A6" loading={loading} icon="🎯" change={ch?.leads} />
        )}
        {hasConversions && !loading && (
          <KpiCard label="Conversiones"   value={fmt(s?.conversions)}    sub={s?.costPerConversion ? `${fmt(s.costPerConversion, 'currency')} por conv.` : 'Compras/Eventos'} color="#F59E0B" loading={loading} icon="🛒" change={ch?.conversions} />
        )}
        {(s?.roas > 0) && !loading && (
          <KpiCard label="ROAS"           value={fmt(s?.roas, 'roas')}   sub="Retorno en inversión" color={s?.roas >= 2 ? '#22c55e' : '#f59e0b'} loading={loading} icon="📈" change={ch?.roas} />
        )}
      </div>

      <MetricsChart data={dailyData} hasMessages={hasMessages} hasConversions={hasConversions} />

      <div style={styles.tabs} className="tabs-row">
        {[
          { id: 'campaigns', label: 'Campañas' },
          { id: 'adsets',    label: 'Conjuntos' },
          { id: 'ads',       label: 'Anuncios' },
        ].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ ...styles.tab, ...(activeTab === t.id ? styles.tabActive : {}) }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'campaigns' && (
        <DataTable columns={CAMPAIGN_COLS} rows={campaigns} loading={loading} emptyMsg="No hay campañas activas en este período" />
      )}
      {activeTab === 'adsets' && (
        <DataTable columns={ADSET_COLS} rows={adsets} loading={loading} emptyMsg="No hay conjuntos en este período" />
      )}
      {activeTab === 'ads' && (
        <DataTable columns={AD_COLS} rows={overview?.ads} loading={loading} emptyMsg="No hay anuncios en este período" />
      )}
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 24 },
  platformHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 },
  platformBadge: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(24,119,242,0.1)', border: '1px solid rgba(24,119,242,0.2)', borderRadius: 20, padding: '6px 14px' },
  accountSelect: { background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 13, padding: '5px 10px', cursor: 'pointer' },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 },
  tabs: { display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', paddingBottom: 0 },
  tab: { background: 'none', border: 'none', borderBottom: '2px solid transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500, padding: '8px 14px', transition: 'all var(--transition)', marginBottom: -1 },
  tabActive: { borderBottomColor: '#1877F2', color: '#1877F2' },
  errorBox: { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, padding: '12px 16px' },
  retryBtn: { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, color: '#ef4444', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 12, padding: '4px 10px' },
};
