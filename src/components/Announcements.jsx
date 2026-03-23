// src/components/Announcements.jsx
import { useState, useEffect } from 'react';
import {
  collection, getDocs, addDoc, serverTimestamp,
  query, orderBy,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from '../hooks/useAuth.jsx';

const EMPTY = { title: '', body: '' };

export default function Announcements({ showToast }) {
  const { profile, isAdmin } = useAuth();
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);

  const load = async () => {
    const snap = await getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')));
    setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const post = async () => {
    if (!form.title.trim()) { showToast('Enter a title'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        author: profile?.name || 'Admin',
        createdAt: serverTimestamp(),
      };
      const ref = await addDoc(collection(db, 'announcements'), payload);
      setPosts(prev => [{ id: ref.id, ...payload, createdAt: new Date() }, ...prev]);
      setForm(EMPTY);
      setShowAdd(false);
      showToast('📢 Announcement posted!');
    } catch (e) { showToast('Error posting'); }
    setSaving(false);
  };

  const fmt = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div className="fade-up">
      <div className="section-hd">
        <h2 className="section-title">Announcements</h2>
        <p className="section-sub">News & updates from our Sabha</p>
      </div>

      <div className="card">
        {posts.length === 0
          ? (
              <div className="empty">
                <div className="empty-icon">📭</div>
                <div className="empty-text">No announcements yet</div>
              </div>
            )
          : posts.map(p => (
              <div key={p.id} className="ann-item">
                <div className="ann-date">{fmt(p.createdAt)} · {p.author}</div>
                <div className="ann-title">{p.title}</div>
                <div className="ann-body">{p.body}</div>
              </div>
            ))
        }
      </div>

      {isAdmin && (
        <button className="fab" onClick={() => setShowAdd(true)} title="Post announcement">📢</button>
      )}

      {showAdd && (
        <div className="modal-overlay" onClick={e => e.target.className === 'modal-overlay' && setShowAdd(false)}>
          <div className="modal-sheet">
            <div className="modal-handle" />
            <h3 className="modal-title">Post Announcement</h3>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="Announcement title…"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-input form-textarea" placeholder="Write details here…"
                value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
            </div>
            <button className="btn-primary" onClick={post} disabled={saving}>
              {saving ? 'Posting…' : 'Post Announcement'}
            </button>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
