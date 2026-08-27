'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || 'Login failed');
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="card rounded-2xl p-8 w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-bold text-center mb-2">
          Admin <span className="gold-gradient">Login</span>
        </h1>
        {error && (
          <p className="text-red-400 text-sm bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <div>
          <label className="text-xs text-neutral-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:border-[var(--gold)] outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:border-[var(--gold)] outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--gold)] text-black font-semibold rounded-lg py-2.5 hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
