'use client';

import { useEffect, useState } from 'react';
import { fetchThemeSettings, updateThemeSettings, type ThemeSettingsData } from '@/lib/admin-api';

const colorFields: { key: keyof ThemeSettingsData; label: string }[] = [
  { key: 'primary_color', label: 'Primary Color' },
  { key: 'secondary_color', label: 'Secondary Color' },
  { key: 'accent_color', label: 'Accent Color' },
  { key: 'background_color', label: 'Background Color' },
  { key: 'foreground_color', label: 'Foreground Color' },
  { key: 'muted_color', label: 'Muted Color' },
  { key: 'muted_foreground_color', label: 'Muted Foreground' },
  { key: 'border_color', label: 'Border Color' },
  { key: 'success_color', label: 'Success Color' },
  { key: 'error_color', label: 'Error Color' },
];

const fontFields: { key: keyof ThemeSettingsData; label: string }[] = [
  { key: 'body_font', label: 'Body Font' },
  { key: 'heading_font', label: 'Heading Font' },
];

export default function ThemeSettingsPage() {
  const [settings, setSettings] = useState<ThemeSettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const res = await fetchThemeSettings();
      setSettings(res.data || {});
    } catch {
      // Use empty defaults
    } finally {
      setLoading(false);
    }
  }

  function handleChange(key: keyof ThemeSettingsData, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setToast(null);
    try {
      const res = await updateThemeSettings(settings);
      setSettings(res.data);
      setToast({ type: 'success', message: 'Theme settings saved successfully.' });
    } catch {
      setToast({ type: 'error', message: 'Failed to save theme settings.' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          Theme Settings
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--color-primary)' }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="mb-4 rounded-lg p-3 text-sm text-white"
          style={{ background: toast.type === 'success' ? 'var(--color-success)' : 'var(--color-error)' }}
        >
          {toast.message}
        </div>
      )}

      {/* Live Preview */}
      <div className="mb-8 rounded-lg border p-6" style={{ borderColor: 'var(--color-border)' }}>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>
          Live Preview
        </h2>
        <div
          className="rounded-lg p-6"
          style={{
            background: settings.background_color || '#ffffff',
            color: settings.foreground_color || '#333333',
            fontFamily: settings.body_font || 'inherit',
          }}
        >
          <h3
            className="text-xl font-bold"
            style={{
              color: settings.primary_color || '#FF0000',
              fontFamily: settings.heading_font || 'inherit',
            }}
          >
            Sample Heading
          </h3>
          <p className="mt-2 text-sm">This is how your content will appear with the current theme settings.</p>
          <button
            className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: settings.primary_color || '#FF0000' }}
          >
            Sample Button
          </button>
        </div>
      </div>

      {/* Color Fields */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>
          Colors
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {colorFields.map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--color-foreground)' }}>
                {label}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings[key] || '#000000'}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border-0 p-0"
                />
                <input
                  type="text"
                  value={settings[key] || ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder="#000000"
                  className="flex-1 rounded border px-3 py-2 text-sm"
                  style={{ borderColor: 'var(--color-border)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font Fields */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted-foreground)' }}>
          Fonts
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fontFields.map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--color-foreground)' }}>
                {label}
              </label>
              <input
                type="text"
                value={settings[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder="e.g., Inter, Poppins"
                className="w-full rounded border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--color-border)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
