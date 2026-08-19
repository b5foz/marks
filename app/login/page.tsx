'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import '../globals.css';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Invalid username or password');
        return;
      }
      router.replace('/');
      router.refresh();
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
    }}>
      <form onSubmit={handleSubmit} className="modal-content" style={{ maxWidth: '360px', width: '90%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Bookmark size={22} fill="var(--accent-primary)" color="var(--accent-primary)" />
          <span className="sidebar-logo" style={{ fontSize: '20px' }}>Marks.</span>
        </div>

        <div className="modal-field">
          <label className="modal-label">Username</label>
          <input
            type="text"
            className="modal-input"
            value={username}
            onChange={e => setUsername(e.target.value)}
            autoFocus
            autoComplete="username"
          />
        </div>

        <div className="modal-field">
          <label className="modal-label">Password</label>
          <input
            type="password"
            className="modal-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && <p style={{ color: '#EF4444', fontSize: '13px', marginTop: '8px' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            marginTop: '24px',
            padding: '10px 22px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            border: 'none',
            background: 'var(--accent-primary)',
            color: '#fff',
          }}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}