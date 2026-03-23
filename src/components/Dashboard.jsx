// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { FUND_MONTHS, MONTHLY_AMOUNT } from '../data/members.js';

export default function Dashboard({ setTab }) {
  const { profile } = useAuth();
  const [members,  setMembers]  = useState([]);
  const [payments, setPayments] = useState({});
  const [plans,    setPlans]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  const currentMonth = FUND_MONTHS[0];

  useEffect(() => {
    (async () => {
      try {
        const [mSnap, pmSnap, plSnap] = await Promise.all([
          getDocs(collection(db, 'members')),
          getDocs(collection(db, 'payments')),
          getDocs(query(collection(db, 'plans'), orderBy('createdAt', 'desc'), limit(3))),
        ]);
        setMembers(mSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        const pm = {};
        pmSnap.docs.forEach(d => { pm[d.id] = d.data(); });
        setPayments(pm);
        setPlans(plSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  // Compute totals
  const totalCollected = FUND_MONTHS.reduce((acc, m) => {
    const month = payments[m] || {};
    return acc + Object.values(month).filter(Boolean).length * MONTHLY_AMOUNT;
  }, 0);

  const paidThisMonth  = Object.values(payments[currentMonth] || {}).filter(Boolean).length;
  const myPaid         = profile && (payments[currentMonth]?.[profile.id] === true);
  const activePlans    = plans.filter(p => p.status !== 'done');
  const pct            = members.length ? Math.round(paidThisMonth / members.length * 100) : 0;

  return (
    <div className="fade-up">
      {/* HERO */}
      <div className="hero-card">
        <div className="hero-label">Total Fund Collected</div>
        <div className="hero-amount">
          <span className="currency">₹</span>
          {totalCollected.toLocaleString('en-IN')}
        </div>
        <div className="hero-meta">
          Across {FUND_MONTHS.length} months • {members.length} Members
        </div>
        <div className="hero-stats">
          <div className="h-stat">
            <div className="h-stat-val">{paidThisMonth}/{members.length}</div>
            <div className="h-stat-label">Paid this month</div>
          </div>
          <div className="h-stat">
            <div className="h-stat-val">
              ₹{((members.length * FUND_MONTHS.length * MONTHLY_AMOUNT) - totalCollected).toLocaleString('en-IN')}
            </div>
            <div className="h-stat-label">Remaining target</div>
          </div>
          <div className="h-stat">
            <div className="h-stat-val">{plans.filter(p => p.status === 'done').length}/{plans.length}</div>
            <div className="h-stat-label">Plans done</div>
          </div>
        </div>
      </div>

      {/* MY STATUS */}
      {profile && (
        <div className={`status-card ${myPaid ? 'paid' : 'unpaid'} fade-up`} style={{ animationDelay: '0.05s' }}>
          <div className="status-icon">{myPaid ? '✅' : '⏳'}</div>
          <div>
            <div className="status-title">{myPaid ? 'Payment Received!' : 'Payment Pending'}</div>
            <div className="status-desc">
              {myPaid
                ? `₹${MONTHLY_AMOUNT.toLocaleString('en-IN')} for ${currentMonth} confirmed`
                : `Please pay ₹${MONTHLY_AMOUNT.toLocaleString('en-IN')} for ${currentMonth}`}
            </div>
          </div>
        </div>
      )}

      {/* PROGRESS */}
      <div className="card fade-up" style={{ animationDelay: '0.1s' }}>
        <div className="card-title">Collection Progress — {currentMonth}</div>
        <div className="progress-wrap">
          <div className="progress-labels">
            <span>{paidThisMonth} paid ({pct}%)</span>
            <span>₹{(paidThisMonth * MONTHLY_AMOUNT).toLocaleString('en-IN')} / ₹{(members.length * MONTHLY_AMOUNT).toLocaleString('en-IN')}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="av-row">
          {members.map(m => (
            <div
              key={m.id}
              className={`av-sm ${payments[currentMonth]?.[m.id] ? 'paid' : 'unpaid'} ${m.id === profile?.id ? 'self' : ''}`}
              title={m.name}
            >
              {m.initials}
            </div>
          ))}
        </div>
        <p style={{ fontSize: 10, color: 'var(--text-light)', marginTop: 8 }}>
          🟢 Paid &nbsp; 🟡 Pending &nbsp; (outlined = you)
        </p>
      </div>

      {/* ACTIVE PLANS */}
      <div className="card fade-up" style={{ animationDelay: '0.15s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>Active Development Plans</div>
          <span
            style={{ fontSize: 12, color: 'var(--saffron)', fontWeight: 700, cursor: 'pointer' }}
            onClick={() => setTab('plans')}
          >View All →</span>
        </div>
        {activePlans.length === 0
          ? <div className="empty"><div className="empty-icon">📋</div><div className="empty-text">No active plans yet</div></div>
          : activePlans.slice(0, 3).map(p => (
              <div key={p.id} className="plan-item">
                <div className={`plan-icon plan-${p.status}`}>{p.icon}</div>
                <div>
                  <div className="plan-name">{p.name}</div>
                  <div className="badges">
                    <span className={`badge b-${p.status}`}>{p.status}</span>
                    <span className="badge b-budget">₹{Number(p.budget).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))
        }
      </div>
    </div>
  );
}
