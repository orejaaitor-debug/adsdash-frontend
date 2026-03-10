import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MetaDashboard from './MetaDashboard';
import GoogleDashboard from './GoogleDashboard';

const NAV = [
  { id: 'meta', label: 'Meta Ads', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ), color: '#1877F2' },
  { id: 'google', label: 'Google Ads', icon: (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ), color: '#4285F4' },
];

export default function DashboardLayout() {
  const { client, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('meta');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={styles.layout}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, width: sidebarOpen ? 220 : 60 }}>
        <div style={styles.sidebarTop}>
          {/* Logo */}
          <div style={styles.sidebarLogo}>
            <div style={styles.logoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="none" stroke="#6C63FF" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            {sidebarOpen && <span style={styles.logoText}>AdsDash</span>}
          </div>

          {/* Client info */}
          {sidebarOpen && (
            <div style={styles.clientInfo}>
              <div style={{ ...styles.clientAvatar, background: client?.color || 'var(--accent)' }}>
                {client?.logo || client?.name?.[0]}
              </div>
              <div style={styles.clientDetails}>
                <div style={styles.clientName}>{client?.name}</div>
                <div style={styles.clientRole}>Cliente</div>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav style={styles.nav}>
            {NAV.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  ...styles.navItem,
                  ...(activeTab === item.id ? { ...styles.navItemActive, '--nav-color': item.color } : {}),
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                }}
                title={!sidebarOpen ? item.label : undefined}
              >
                <span style={{ color: activeTab === item.id ? item.color : 'var(--text-muted)', flexShrink: 0 }}>
                  {item.icon}
                </span>
                {sidebarOpen && <span style={{ color: activeTab === item.id ? item.color : 'var(--text-muted)' }}>{item.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar bottom */}
        <div style={styles.sidebarBottom}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            style={styles.toggleBtn}
            title={sidebarOpen ? 'Colapsar' : 'Expandir'}
          >
            <span style={{ transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)', display: 'inline-block', transition: 'transform 0.2s' }}>
              ◀
            </span>
            {sidebarOpen && <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Colapsar</span>}
          </button>

          <button onClick={logout} style={styles.logoutBtn}>
            <span>⎋</span>
            {sidebarOpen && <span>Salir</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        {/* Top bar */}
        <div style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>
              {NAV.find(n => n.id === activeTab)?.label}
            </h1>
            <p style={styles.pageSubtitle}>
              {client?.meta?.businessName || client?.name} — Panel de métricas
            </p>
          </div>
          <div style={styles.topbarRight}>
            <div style={styles.statusDot} title="Conectado a API" />
          </div>
        </div>

        {/* Dashboard content */}
        <div style={styles.content}>
          {activeTab === 'meta' && <MetaDashboard client={client} />}
          {activeTab === 'google' && <GoogleDashboard />}
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: 'var(--bg)' },
  sidebar: {
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px 12px',
    position: 'sticky',
    top: 0,
    height: '100vh',
    flexShrink: 0,
    transition: 'width 0.2s ease',
    overflow: 'hidden',
  },
  sidebarTop: { display: 'flex', flexDirection: 'column', gap: 24 },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px' },
  logoIcon: { width: 32, height: 32, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  logoText: { fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px', whiteSpace: 'nowrap' },
  clientInfo: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 8px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' },
  clientAvatar: { width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 },
  clientDetails: { overflow: 'hidden' },
  clientName: { fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  clientRole: { fontSize: 11, color: 'var(--text-dim)' },
  nav: { display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: { alignItems: 'center', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500, gap: 10, padding: '9px 10px', transition: 'background var(--transition)', width: '100%', whiteSpace: 'nowrap' },
  navItemActive: { background: 'var(--surface2)' },
  sidebarBottom: { display: 'flex', flexDirection: 'column', gap: 4 },
  toggleBtn: { alignItems: 'center', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', fontFamily: 'var(--font)', fontSize: 11, gap: 8, padding: '8px 10px', width: '100%' },
  logoutBtn: { alignItems: 'center', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', fontFamily: 'var(--font)', fontSize: 13, gap: 10, padding: '9px 10px', transition: 'all var(--transition)', width: '100%', whiteSpace: 'nowrap' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbar: { alignItems: 'center', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', padding: '20px 28px' },
  pageTitle: { fontSize: 20, fontWeight: 600, letterSpacing: '-0.4px' },
  pageSubtitle: { color: 'var(--text-muted)', fontSize: 13, marginTop: 2 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 10 },
  statusDot: { width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' },
  content: { flex: 1, padding: '28px', overflowY: 'auto' },
};
