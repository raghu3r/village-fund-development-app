// src/components/Plans.jsx
import { useState, useEffect } from 'react';
import {
  collection, getDocs, addDoc, updateDoc,
  doc, serverTimestamp, orderBy, query,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from '../hooks/useAuth.jsx';

const STATUS_ORDER  = ['planned', 'ongoing', 'done'];
const ICON_OPTIONS  = ['🏗','💧','💡','📚','🛕','🌳','🏥','🚧','⚽','🧹','🌾','🎓','🤝','🏞'];

const EMPTY_PLAN = { name: '', desc: '', icon: '🏗', budget: '', category: '', status: 'planned' };

export default function Plans({ showToast }) {
  const { isAdmin } = useAuth();
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form,    setForm]    = useState(EMPTY_PLAN);
  const [saving,  setSaving]  = useState(false);

  const load = async () => {
    const snap = await getDocs(query(collection(db, 'plans'), orderBy('createdAt', 'asc')));
    setPlans(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addPlan = async () => {
    if (!form.name.trim() || !form.budget) { showToast('Enter name and budget'); return; }
    setSaving(true);
    try {
      const ref = await addDoc(collection(db, 'plans'), {
        ...form,
        budget: Number(form.budget),
        createdAt: serverTimestamp(),
      });
      setPlans(prev => [...prev, { id: ref.id, ...form, budget: Number(form.budget) }]);
      setForm(EMPTY_PLAN);
      setShowAdd(false);
      showToast('✅ Plan added!');
    } catch (e) { showToast('Error saving plan'); }
    setSaving(false);
  };

  const cycleStatus = async (plan) => {
    if (!isAdmin) { showToast('Only Admin can update status'); return; }
    const next = STATUS_ORDER[(STATUS_ORDER.indexOf(plan.status) + 1) % STATUS_ORDER.length];
    await updateDoc(doc(db, 'plans', plan.id), { status: next });
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: next } : p));
    showToast(`Status → ${next}`);
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const totalBudget = plans.reduce((a, p) => a + Number(p.budget), 0);
  const doneBudget  = plans.filter(p => p.status === 'done').reduce((a, p) => a + Number(p.budget), 0);
  const donePct     = totalBudget ? Math.round(doneBudget / totalBudget * 100) : 0;

  return (
    <div className="fade-up">
      <div className="section-hd">
        <h2 className="section-title">Development Plans</h2>
        <p className="section-sub">Village infrastructure & community activities</p>
      </div>

      {/* STATS */}
      <div className="stats-2">
        <div className="stat-tile">
          <div className="stat-icon">🎯</div>
          <div className="stat-val">{plans.length}</div>
          <div className="stat-label">Total Plans</div>
        </div>
        <div className="stat-tile">
          <div className="stat-icon">✅</div>
          <div className="stat-val">{plans.filter(p => p.status === 'done').length}</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      {/* BUDGET OVERVIEW */}
      <div className="card">
        <div className="card-title">Budget Overview</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Total: ₹{totalBudget.toLocaleString('en-IN')}</span>
          <span style={{ fontSize: 12, color: '#2e7d32', fontWeight: 700 }}>Done: ₹{doneBudget.toLocaleString('en-IN')}</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${donePct}%` }} />
        </div>
        <p style={{ fontSize: 10, color: 'var(--text-light)', marginTop: 6 }}>{donePct}% of budget utilised</p>
      </div>

      {/* PLANS BY STATUS */}
      {[
        { key: 'ongoing', label: '🔨 In Progress' },
        { key: 'planned', label: '📋 Upcoming'    },
        { key: 'done',    label: '✅ Completed'   },
      ].map(({ key, label }) => {
        const group = plans.filter(p => p.status === key);
        return (
          <div key={key} className="card">
            <div className="card-title">{label}</div>
            {group.length === 0
              ? <div className="empty" style={{ padding: '10px 0' }}><div className="empty-text">Nothing here yet</div></div>
              : group.map(p => (
                  <div
                    key={p.id}
                    className="plan-item"
                  >
                    <div className={`plan-icon plan-${p.status}`}>{p.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div className="plan-name">{p.name}</div>
                      <div className="plan-desc">{p.desc}</div>
                      <div className="badges">
                        <span className={`badge b-${p.status}`}>{p.status}</span>
                        <span className="badge b-budget">₹{Number(p.budget).toLocaleString('en-IN')}</span>
                        {p.category && <span className="badge b-cat">{p.category}</span>}
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cycleStatus(p);
                        }}
                        style={{
                          fontSize: 12,
                          padding: '6px 12px',
                          minWidth: 'auto',
                          background: 'var(--saffron)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'opacity 0.2s',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = '0.85'}
                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                        title={`Mark as ${p.status === 'planned' ? 'In Progress' : p.status === 'ongoing' ? 'Completed' : 'Incomplete'}`}
                      >
                        {p.status === 'planned' ? 'Mark it Inprogress' : p.status === 'ongoing' ? 'Mark it Completed' : 'Mark it Incomplete'}
                      </button>
                    )}
                  </div>
                ))
            }
          </div>
        );
      })}

      {isAdmin && (
        <>
          <button className="fab" onClick={() => setShowAdd(true)} title="Add plan">＋</button>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-light)', marginTop: 6 }}>
            ★ Click button to advance plan status
          </p>
        </>
      )}

      {/* ADD PLAN MODAL */}
      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && setShowAdd(false)}>
          <div className="modal-sheet">
            <div className="modal-handle" />
            <h3 className="modal-title">Add New Plan</h3>

            <div className="form-group">
              <label className="form-label">Plan Name *</label>
              <input className="form-input" placeholder="e.g. Village Road Repair"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Brief description…"
                value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Budget (₹) *</label>
              <input className="form-input" type="number" placeholder="e.g. 25000"
                value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <input className="form-input" placeholder="e.g. Water, Education, Infrastructure"
                value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Icon</label>
              <div className="chips">
                {ICON_OPTIONS.map(ic => (
                  <button key={ic} className={`chip ${form.icon === ic ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, icon: ic })}>{ic}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <div className="chips">
                {STATUS_ORDER.map(s => (
                  <button key={s} className={`chip ${form.status === s ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, status: s })}>{s}</button>
                ))}
              </div>
            </div>

            <button className="btn-primary" onClick={addPlan} disabled={saving}>
              {saving ? 'Saving…' : 'Add Plan'}
            </button>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
