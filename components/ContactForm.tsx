'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // NOTE: this currently only shows a success state client-side.
    // Wire this to a real endpoint (e.g. an /api/contact route emailing via Resend,
    // same pattern already used in the K.A. Agency inquiry form) before relying on it.
    setSubmitted(true);
    setForm({ name: '', phone: '', message: '' });
  }

  return (
    <section id="contact" className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <div className="card rounded-2xl p-6 max-w-xl mx-auto">
        <h3 className="text-lg font-semibold mb-1 text-white">Let&apos;s get your order sorted.</h3>
        <p className="text-xs text-neutral-500 mb-4">Send an inquiry and we&apos;ll get back to you within a few hours.</p>
        {submitted ? (
          <p className="text-sm text-[var(--gold)]">Thanks — we usually reply within a few hours.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              type="text"
              placeholder="Your name"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)] text-white"
            />
            <input
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              type="tel"
              placeholder="Phone number"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)] text-white"
            />
            <textarea
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="What are you looking for?"
              rows={3}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--gold)] text-white"
            />
            <button
              type="submit"
              className="w-full bg-[var(--gold)] text-black text-sm font-semibold py-2.5 rounded-lg hover:bg-[var(--gold-light)]"
            >
              Send message
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
