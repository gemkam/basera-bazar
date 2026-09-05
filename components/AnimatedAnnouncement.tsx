'use client';

import { useState, useRef, useEffect } from 'react';

const FEATURE_MESSAGES: string[] = [
  '🤖 Try our AI Assistant, click the black circle and ask about any product instantly',
  '🔍 Use AI Search to find exactly what you need in seconds',
  '🔥 Best Deals updated regularly, check today\'s sale prices',
  '💵 Cash on Delivery available nationwide across Pakistan',
  '💬 Reach us anytime on WhatsApp for order help',
  '🚚 Fast, reliable delivery to your doorstep',
];

type VisitStats = {
  liveTotal: number;
  dayTotal: number;
  live: { country_name: string; count: number }[];
  daily: { country_name: string; count: number; percent: number }[];
};

function buildLocationMessages(stats: VisitStats | null): string[] {
  if (!stats) return [];

  // Prefer real-time activity when there is any.
  if (stats.liveTotal > 0 && stats.live.length > 0) {
    return stats.live.slice(0, 3).map((entry) => {
      const label = entry.count === 1 ? 'person' : 'people';
      return `📍 ${entry.count} ${label} browsing right now from ${entry.country_name}`;
    });
  }

  // Otherwise fall back to today's breakdown, only if there's real data.
  if (stats.dayTotal > 0 && stats.daily.length > 0) {
    return stats.daily.slice(0, 3).map((entry) => `🌍 ${entry.percent}% of today's visitors are from ${entry.country_name}`);
  }

  // No real data yet — say nothing rather than invent numbers.
  return [];
}

/**
 * Three phases, in order, once per page load:
 * 1. "writing"  — cursive handwriting reveal of the main announcement text
 * 2. "bold"     — text locks into bold, holds still for 8 seconds
 * 3. "ticker"   — slow, continuously scrolling ticker mixing real visitor
 *                 location data (when available) with feature highlights,
 *                 pauses exactly in place on hover
 */
export default function AnimatedAnnouncement({ text }: { text: string }) {
  const [phase, setPhase] = useState<'writing' | 'bold' | 'ticker'>('writing');
  const [stats, setStats] = useState<VisitStats | null>(null);
  const writeTriggeredRef = useRef(false);
  const boldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleWriteEnd() {
    if (writeTriggeredRef.current) return;
    writeTriggeredRef.current = true;
    setPhase('bold');
  }

  useEffect(() => {
    if (phase !== 'bold') return;
    boldTimerRef.current = setTimeout(() => setPhase('ticker'), 8000);
    return () => {
      if (boldTimerRef.current) clearTimeout(boldTimerRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'ticker') return;

    let cancelled = false;
    async function loadStats() {
      try {
        const res = await fetch('/api/visits/stats');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setStats(data);
      } catch {
        /* non-critical */
      }
    }

    loadStats();
    const interval = setInterval(loadStats, 60000); // refresh every minute
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [phase]);

  const locationMessages = buildLocationMessages(stats);
  const allMessages = [...locationMessages, ...FEATURE_MESSAGES];
  const tickerItems = [...allMessages, ...allMessages]; // duplicated for seamless loop

  return (
    <div className="relative overflow-hidden w-full">
      <style>{`
        @keyframes handwriteReveal {
          from { clip-path: inset(0 100% 0 0); }
          to   { clip-path: inset(0 0% 0 0); }
        }
        .handwrite-text {
          font-family: 'Caveat', cursive;
          font-weight: 700;
          font-size: 1.15em;
          animation: handwriteReveal 2.4s cubic-bezier(0.45, 0, 0.2, 1) forwards;
          white-space: nowrap;
          display: inline-block;
        }
        @keyframes settleIn {
          from { opacity: 0; transform: translateY(2px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .settle-bold {
          animation: settleIn 0.4s ease-out forwards;
        }
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ticker-track {
          display: inline-flex;
          white-space: nowrap;
          animation: tickerScroll 45s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {phase === 'writing' && (
        <div className="text-center">
          <span className="handwrite-text" onAnimationEnd={handleWriteEnd}>
            {text}
          </span>
        </div>
      )}

      {phase === 'bold' && (
        <div className="text-center">
          <span className="settle-bold font-bold">{text}</span>
        </div>
      )}

      {phase === 'ticker' && (
        <div className="ticker-track">
          {tickerItems.map((msg, i) => (
            <span key={i} className="mx-8 text-sm">
              {msg}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}