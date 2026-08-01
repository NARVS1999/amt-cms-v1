import { fetchTheme, ThemeData } from '@/lib/api';

// Hardcoded fallback colors matching globals.css :root defaults (D-02)
const FALLBACK_THEME: Required<ThemeData> = {
  primary_color: '#FF0000',
  secondary_color: '#fb3d03',
  accent_color: '#FFC107',
  background_color: '#FFFFFF',
  foreground_color: '#333333',
  muted_color: '#f5f5f5',
  muted_foreground_color: '#888888',
  border_color: '#f0f0f0',
  success_color: '#22c55e',
  error_color: '#ef4444',
  body_font: 'Poppins',
  heading_font: 'Poppins',
};

// Sanitize CSS values to prevent injection (T-04-01)
function sanitizeCssValue(value: string | undefined, fallback: string): string {
  const val = value ?? fallback;
  // Allow hex colors, rgba(), named fonts, and safe characters
  if (/^#[0-9a-fA-F]{3,8}$/.test(val)) return val;
  if (/^rgba?\(.+\)$/.test(val)) return val;
  if (/^[a-zA-Z\s-]+$/.test(val)) return val; // Font names
  return fallback;
}

function sanitizeFont(value: string | undefined, fallback: string): string {
  const val = value ?? fallback;
  // Allow alphanumeric, spaces, hyphens, then escape single quotes
  // (filter first so the escaping backslash is never stripped)
  return val.replace(/[^a-zA-Z\s'-]/g, '').replace(/'/g, "\\'") || fallback;
}

function buildCssVars(theme: ThemeData): string {
  const t = { ...FALLBACK_THEME, ...Object.fromEntries(
    Object.entries(theme).filter(([, v]) => v != null && v !== '')
  ) };
  return `
    --color-primary: ${sanitizeCssValue(t.primary_color, FALLBACK_THEME.primary_color)};
    --color-secondary: ${sanitizeCssValue(t.secondary_color, FALLBACK_THEME.secondary_color)};
    --color-accent: ${sanitizeCssValue(t.accent_color, FALLBACK_THEME.accent_color)};
    --color-background: ${sanitizeCssValue(t.background_color, FALLBACK_THEME.background_color)};
    --color-foreground: ${sanitizeCssValue(t.foreground_color, FALLBACK_THEME.foreground_color)};
    --color-muted: ${sanitizeCssValue(t.muted_color, FALLBACK_THEME.muted_color)};
    --color-muted-foreground: ${sanitizeCssValue(t.muted_foreground_color, FALLBACK_THEME.muted_foreground_color)};
    --color-border: ${sanitizeCssValue(t.border_color, FALLBACK_THEME.border_color)};
    --color-success: ${sanitizeCssValue(t.success_color, FALLBACK_THEME.success_color)};
    --color-error: ${sanitizeCssValue(t.error_color, FALLBACK_THEME.error_color)};
    --font-body: '${sanitizeFont(t.body_font, FALLBACK_THEME.body_font)}', sans-serif;
    --font-heading: '${sanitizeFont(t.heading_font, FALLBACK_THEME.heading_font)}', sans-serif;
  `;
}

export async function ThemeProvider({ children }: { children: React.ReactNode }) {
  let cssVars: string;

  try {
    const theme = await fetchTheme();
    // D-02: Graceful fallback — use hardcoded colors when API is unavailable
    cssVars = theme ? buildCssVars(theme) : buildCssVars(FALLBACK_THEME);
  } catch {
    // D-02: On any error, fall back to hardcoded defaults
    cssVars = buildCssVars(FALLBACK_THEME);
  }

  return (
    <>
      <style precedence="default" href="theme-vars">{`:root { ${cssVars} }`}</style>
      {children}
    </>
  );
}
