'use client';

import { useState } from 'react';
import { usePowerEditor } from '@/lib/power-editor-context';

export default function EditableText({
  settingKey,
  fallback,
  className,
  as: Tag = 'span',
}: {
  settingKey: string;
  fallback: string;
  className?: string;
  as?: 'span' | 'p' | 'h1' | 'h2';
}) {
  const { settings, editMode, updateSetting } = usePowerEditor();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const value = settings[settingKey] || fallback;

  if (!editMode) {
    return <Tag className={className}>{value}</Tag>;
  }

  if (editing) {
    return (
      <span className="inline-flex items-center gap-1">
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              await updateSetting(settingKey, draft);
              setEditing(false);
            }
            if (e.key === 'Escape') setEditing(false);
          }}
          className={`bg-neutral-900 border border-[var(--gold)] rounded px-2 py-0.5 outline-none ${className || ''}`}
        />
        <button
          onClick={async () => {
            await updateSetting(settingKey, draft);
            setEditing(false);
          }}
          className="text-[10px] bg-[var(--gold)] text-black px-1.5 py-0.5 rounded"
        >
          ✓
        </button>
      </span>
    );
  }

  return (
    <Tag
      className={`${className || ''} cursor-pointer ring-1 ring-dashed ring-[var(--gold)]/50 hover:ring-[var(--gold)] rounded px-1 transition-all`}
      onClick={() => {
        setDraft(value);
        setEditing(true);
      }}
      title="Click to edit (Power Editor)"
    >
      {value}
    </Tag>
  );
}
