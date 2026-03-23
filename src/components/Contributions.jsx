// src/components/Contributions.jsx
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { FUND_MONTHS, MONTHLY_AMOUNT } from '../data/members.js';

export default function Contributions({ showToast }) {
  const { profile, isAdmin } = useAuth();
  const [members,    setMembers]    = useState([]);
  const [payments,   setPayments]   = useState({});   // { [month]: { [memberId]: bool } }
  const [selMonth,   setSelMonth]   = useState(FUND_MONTHS[0]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(null); // memberId being saved

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [mSnap, pmSnap] = await Promise.all([
        getDocs(collection(db, 'members')),
        getDocs(collection(db, 'payments')),
      ]);
      setMembers(mSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      const pm = {};
      pmSnap.docs.forEach(d => { pm[d.id] = d.data(); });
      setPayments(pm);
      setLoading(false);
    })();
  }, []);

  const togglePayment = async (memberId) => {
    if (!isAdmin) { showToast('Only Admin can mark payments'); return; }
    const current = payments[selMonth]?.[memberId] ?? false;
    const updated = !current;
    setSaving(memberId);

    const ref = doc(db, 'payments', selMonth);
    const snap = await getDoc(ref);
    const existing = snap.exists() ? snap.data() : {};
    await setDoc(ref, { ...existing, [memberId]: updated }, { merge: true });

    setPayments(prev => ({
      ...prev,
      [selMonth]: { ...(prev[selMonth] || {}), [memberId]: updated },
    }));
    setSaving(null);
    const m = members.find(x => x.id === memberId);
    showToast((updated ? '✅ Marked paid: ' : '↩ Unmarked: ') + m?.name);
  };

  const monthData    = payments[selMonth] || {};
  const paidCount    = Object.values(monthData).filter(Boolean).length;
  const totalMembers = members.length || 15;
  const pct          = Math.round(paidCount / totalMembers * 100);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="fade-up">
      <div className="section-hd">
        <h2 className="section-title">Contributions</h2>
        <p className="section-sub">₹{MONTHLY_AMOUNT.toLocaleString('en-IN')} per member per month</p>
      </div>

      {/* MONTH TABS */}
      <div className="month-tabs">
        {FUND_MONTHS.map(m => (
          <button
            key={m}
            className={`m-tab ${m === selMonth ? 'active' : ''}`}
            onClick={() => setSelMonth(m)}
          >{m}</button>
        ))}
      </div>

      {/* SUMMARY */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--forest)' }}>
              ₹{(paidCount * MONTHLY_AMOUNT).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-light)' }}>Collected in {selMonth}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-mid)' }}>
              {paidCount}/{totalMembers}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-light)' }}>Members paid</div>
          </div>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <p style={{ fontSize: 10, color: 'var(--text-light)', marginTop: 6 }}>{pct}% collected</p>
      </div>

      {/* MEMBER LIST */}
      <div className="card">
        <div className="card-title">
          {isAdmin ? 'Tap member to toggle payment status' : 'Member Payment Status'}
        </div>
        {members.map(m => (
          <div
            key={m.id}
            className="contrib-row"
            onClick={() => togglePayment(m.id)}
            style={{ cursor: isAdmin ? 'pointer' : 'default', opacity: saving === m.id ? 0.5 : 1 }}
          >
            <div className="c-av">{m.initials}</div>
            <div className="c-name">
              <div className="c-name-main">{m.name}{m.id === profile?.id ? ' (You)' : ''}</div>
              <div className="c-name-role">{m.role}</div>
            </div>
            <span className={`c-status ${monthData[m.id] ? 'c-paid' : 'c-pending'}`}>
              {saving === m.id ? '…' : monthData[m.id] ? '✓ Paid' : 'Pending'}
            </span>
          </div>
        ))}
      </div>

      {isAdmin && (
        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>
          ★ Admin: Tap any member to mark / unmark payment
        </p>
      )}
    </div>
  );
}
