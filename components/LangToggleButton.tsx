'use client';

import { useLanguage } from '@/lib/language-context';

export default function LangToggleButton() {
  const { toggleLanguage } = useLanguage();
  return (
    <button
      onClick={toggleLanguage}
      className="btn-pill text-xs px-3 py-1.5 border border-neutral-300 rounded-full"
    >
      EN / اردو
    </button>
  );
}
