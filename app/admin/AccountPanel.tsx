'use client';

import { useState } from 'react';

export default function AccountPanel() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const res = await fetch('/api/admin/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      setSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setError(data.error || 'Something went wrong.');
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="font-semibold text-lg mb-4">Change Admin Password</h2>
      <form onSubmit={handleSubmit} className="card rounded-xl p-6 space-y-4">
        {error && (
          <p className="text-red-400 text-sm bg-red-950/50 border border-red-900 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-400 text-sm bg-green-950/50 border border-green-900 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        <div>
          <label className="text-xs text-neutral-400">Current Password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full mt-1 bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400">New Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full mt-1 bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400">Confirm New Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full mt-1 bg-black border border-neutral-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--gold)]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--gold)] text-black font-semibold rounded-lg py-2.5 hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
