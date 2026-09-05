'use client';

import { useState, useRef } from 'react';

/**
 * Plays the announcement text once as a handwriting-style reveal
 * (cursive font, left-to-right stroke animation), then swaps to a
 * bold, static version and never re-animates. No loop.
 */
export default function AnimatedAnnouncement({ text }: { text: string }) {
  const [phase, setPhase] = useState<'writing' | 'done'>('writing');
  const triggeredRef = useRef(false);

  function handleAnimationEnd() {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    setPhase('done');
  }

  return (
    <span className="relative inline-block">
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
      `}</style>

      {phase === 'writing' ? (
        <span className="handwrite-text" onAnimationEnd={handleAnimationEnd}>
          {text}
        </span>
      ) : (
        <span className="settle-bold font-bold">{text}</span>
      )}
    </span>
  );
}