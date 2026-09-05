'use client';

import { useEffect } from 'react';

/**
 * Fires once per browser tab session (not on every page navigation)
 * to record a visit for the live/daily location ticker. Silent —
 * renders nothing.
 */
export default function VisitTracker() {
  useEffect(() => {
    if (sessionStorage.getItem('bzf_visit_logged')) return;
    sessionStorage.setItem('bzf_visit_logged', '1');
    fetch('/api/visits', { method: 'POST' }).catch(() => {
      /* non-critical, ignore failures */
    });
  }, []);

  return null;
}