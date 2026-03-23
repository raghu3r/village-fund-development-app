// src/components/Login.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Login() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setErr('Enter email and password.'); return; }
    setLoading(true); setErr('');
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (ex) {
      const map = {
        'auth/user-not-found':  'No account found for this email.',
        'auth/wrong-password':  'Incorrect password. Try again.',
        'auth/invalid-email':   'Please enter a valid email.',
        'auth/too-many-requests': 'Too many attempts. Try later.',
      };
      setErr(map[ex.code] || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🌿</div>
        <h1 className="login-title">Moolam మూలం</h1>
        <p className="login-sub">Far from home. Never from roots.</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="you@gramsabha.app"
              value={email}
              onChange={e => { setEmail(e.target.value); setErr(''); }}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="pw">Password</label>
            <input
              id="pw"
              className="form-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErr(''); }}
              autoComplete="current-password"
            />
          </div>
          {err && <p className="err-msg">⚠ {err}</p>}
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Login to Sabha →'}
          </button>
        </form>

        <p className="seed-info">
          Forgot password? Contact your&nbsp;
          <a href="mailto:ravi@moolam.app">Admin / Treasurer</a>
          <br />to reset it via Firebase Console.
        </p>
      </div>
    </div>
  );
}
