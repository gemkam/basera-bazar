'use client';

import { useLanguage } from '@/lib/language-context';

export default function LangToggleButton() {
  const { toggleLanguage } = useLanguage();
  return (
    <button
      onClick={toggleLanguage}
      className="text-xs px-3 py-1.5 border border-neutral-700 rounded-full hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
    >
      EN / اردو
    </button>
  );
}
