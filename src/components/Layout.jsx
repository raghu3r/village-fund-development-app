// src/components/Layout.jsx
import { useAuth } from '../hooks/useAuth.jsx';

const TABS = [
  { id: 'home',  icon: '🏡', label: 'Home'  },
  { id: 'funds', icon: '💰', label: 'Funds' },
  { id: 'plans', icon: '🗺', label: 'Plans' },
  { id: 'news',  icon: '📢', label: 'News'  },
];

export default function Layout({ tab, setTab, children, toast }) {
  const { profile, logout } = useAuth();

  return (
    <div className="app-shell">
      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-brand">
          <span className="topbar-icon">🌿</span>
          <div>
            <div className="topbar-name">Moolam మూలం</div>
            <div className="topbar-sub">Far from home. Never from roots.</div>
          </div>
        </div>
        <div className="topbar-right">
          {profile && (
            <div className="user-chip">
              <div className="user-av">{profile.initials}</div>
              <span className="user-chip-name">{profile.name?.split(' ')[0]}</span>
            </div>
          )}
          <button className="btn-out" onClick={logout}>Logout</button>
        </div>
      </header>

      {/* MAIN */}
      <main className="page" key={tab}>
        {children}
      </main>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`nav-btn ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="n-icon">{t.icon}</span>
            <span className="n-label">{t.label}</span>
            <div className="n-dot" />
          </button>
        ))}
      </nav>

      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
