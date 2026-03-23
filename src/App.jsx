// src/App.jsx
import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import { useToast } from './hooks/useToast.js';
import Layout from './components/Layout.jsx';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import Contributions from './components/Contributions.jsx';
import Plans from './components/Plans.jsx';
import Announcements from './components/Announcements.jsx';
import InstallPrompt from './components/InstallPrompt.jsx';

function AppInner() {
  const { user, loading } = useAuth();
  const { toast, showToast } = useToast();
  const [tab, setTab] = useState('home');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <div>
          <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>🌿</div>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <Layout tab={tab} setTab={setTab} toast={toast}>
      {tab === 'home'  && <Dashboard   setTab={setTab} />}
      {tab === 'funds' && <Contributions showToast={showToast} />}
      {tab === 'plans' && <Plans         showToast={showToast} />}
      {tab === 'news'  && <Announcements showToast={showToast} />}
      <InstallPrompt />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
