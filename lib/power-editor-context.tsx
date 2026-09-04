'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

type Settings = Record<string, string>;

type PowerEditorContextType = {
  settings: Settings;
  editMode: boolean;
  toggleEditMode: () => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<void>;
  loaded: boolean;
};

const PowerEditorContext = createContext<PowerEditorContextType | null>(null);

// If Power Editor is left on with no activity for this long, it turns itself
// off automatically — since it's a site-wide setting (not tied to any one
// admin session), without this it can get stuck "on" for every visitor
// indefinitely if someone forgets to turn it off or just closes the tab.
const IDLE_TIMEOUT_MS = 10 * 60 * 1000;
const HEARTBEAT_MIN_INTERVAL_MS = 30 * 1000;

export function PowerEditorProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({});
  const [loaded, setLoaded] = useState(false);
  const lastHeartbeatRef = useRef(0);

  const loadSettings = useCallback(async () => {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      const loadedSettings: Settings = data.settings || {};

      // Auto-off check: runs on every page load, for every visitor — this is
      // what lets a stuck-on editor recover even if the admin who left it on
      // never comes back to turn it off themselves.
      if (loadedSettings.power_editor_enabled === 'true') {
        const lastActive = loadedSettings.power_editor_last_active
          ? new Date(loadedSettings.power_editor_last_active).getTime()
          : 0;
        if (Date.now() - lastActive > IDLE_TIMEOUT_MS) {
          loadedSettings.power_editor_enabled = 'false';
          fetch('/api/admin/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'power_editor_enabled', value: 'false' }),
          }).catch(() => {});
        }
      }

      setSettings(loadedSettings);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    (async () => {
      await loadSettings();
    })();
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

  const pingActivity = useCallback(() => {
    const now = Date.now();
    if (now - lastHeartbeatRef.current < HEARTBEAT_MIN_INTERVAL_MS) return;
    lastHeartbeatRef.current = now;
    const iso = new Date(now).toISOString();
    setSettings((s) => ({ ...s, power_editor_last_active: iso }));
    fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'power_editor_last_active', value: iso }),
    }).catch(() => {});
  }, []);

  // While edit mode is on, any real interaction (click, typing, moving the
  // mouse) counts as activity and pushes the idle clock back. This is what
  // covers product-card edits, position nudges, etc. — anything the person
  // does while editing, not just hero-specific saves.
  useEffect(() => {
    if (!editMode) return;
    const events = ['mousemove', 'click', 'keydown'];
    events.forEach((e) => window.addEventListener(e, pingActivity));
    return () => {
      events.forEach((e) => window.removeEventListener(e, pingActivity));
    };
  }, [editMode, pingActivity]);

  // Also check periodically in case the tab is left open with no activity —
  // so it turns off automatically for the person who left it on, not just
  // the next visitor who happens to load a page.
  useEffect(() => {
    if (!editMode) return;
    const interval = setInterval(() => {
      const lastActive = settings.power_editor_last_active
        ? new Date(settings.power_editor_last_active).getTime()
        : lastHeartbeatRef.current;
      if (Date.now() - lastActive > IDLE_TIMEOUT_MS) {
        updateSetting('power_editor_enabled', 'false');
      }
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, [editMode, settings.power_editor_last_active, updateSetting]);

  const toggleEditMode = useCallback(async () => {
    const next = editMode ? 'false' : 'true';
    await updateSetting('power_editor_enabled', next);
    if (next === 'true') {
      lastHeartbeatRef.current = Date.now();
      await updateSetting('power_editor_last_active', new Date().toISOString());
    }
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
