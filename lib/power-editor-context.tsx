'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Settings = Record<string, string>;

type PowerEditorContextType = {
  settings: Settings;
  editMode: boolean;
  toggleEditMode: () => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<void>;
  loaded: boolean;
};

const PowerEditorContext = createContext<PowerEditorContextType | null>(null);

export function PowerEditorProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({});
  const [loaded, setLoaded] = useState(false);

  const loadSettings = useCallback(async () => {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      setSettings(data.settings || {});
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const editMode = settings.power_editor_enabled === 'true';

  const updateSetting = useCallback(async (key: string, value: string) => {
    setSettings((s) => ({ ...s, [key]: value }));
    await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
  }, []);

  const toggleEditMode = useCallback(async () => {
    const next = editMode ? 'false' : 'true';
    await updateSetting('power_editor_enabled', next);
  }, [editMode, updateSetting]);

  return (
    <PowerEditorContext.Provider value={{ settings, editMode, toggleEditMode, updateSetting, loaded }}>
      {children}
    </PowerEditorContext.Provider>
  );
}

export function usePowerEditor() {
  const ctx = useContext(PowerEditorContext);
  if (!ctx) throw new Error('usePowerEditor must be used within PowerEditorProvider');
  return ctx;
}
