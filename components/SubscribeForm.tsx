'use client';

import { useState } from 'react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus('success');
      setMessage('Subscribed! Thanks for joining.');
      setEmail('');
    } else {
      setStatus('error');
      setMessage(data.error || 'Something went wrong.');
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-white mb-2">Subscribe for offers</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-[var(--gold)] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
      {message && (
        <p className={`text-xs mt-2 ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
