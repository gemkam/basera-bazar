'use client';

import { usePowerEditor } from '@/lib/power-editor-context';

export default function PowerEditorBanner() {
  const { editMode, toggleEditMode } = usePowerEditor();

  if (!editMode) return null;

  return (
    <div className="sticky top-0 z-[60] bg-[var(--gold)] text-black text-sm font-semibold px-4 py-2 flex items-center justify-between">
      <span>⚡ Power Editor is ON — click banners or dashed-outlined text to edit</span>
      <button
        onClick={toggleEditMode}
        className="bg-black text-[var(--gold)] text-xs px-3 py-1 rounded-full hover:opacity-80"
      >
        Turn Off
      </button>
    </div>
  );
}
