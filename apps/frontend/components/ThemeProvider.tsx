import { fetchTheme, ThemeData } from '@/lib/api';

// Sanitize CSS values to prevent injection
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
  // Escape single quotes and allow alphanumeric, spaces, hyphens
  return val.replace(/'/g, "\\'").replace(/[^a-zA-Z\s'-]/g, '') || fallback;
}

function buildCssVars(theme: ThemeData): string {
  return `
    --color-primary: ${sanitizeCssValue(theme.primary_color, '#FF0000')};
    --color-secondary: ${sanitizeCssValue(theme.secondary_color, '#fb3d03')};
    --color-accent: ${sanitizeCssValue(theme.accent_color, '#FFC107')};
    --color-background: ${sanitizeCssValue(theme.background_color, '#FFFFFF')};
    --color-foreground: ${sanitizeCssValue(theme.foreground_color, '#333333')};
    --color-muted: ${sanitizeCssValue(theme.muted_color, '#f5f5f5')};
    --color-muted-foreground: ${sanitizeCssValue(theme.muted_foreground_color, '#888888')};
    --color-border: ${sanitizeCssValue(theme.border_color, '#f0f0f0')};
    --color-success: ${sanitizeCssValue(theme.success_color, '#22c55e')};
    --color-error: ${sanitizeCssValue(theme.error_color, '#ef4444')};
    --font-body: '${sanitizeFont(theme.body_font, 'Poppins')}', sans-serif;
    --font-heading: '${sanitizeFont(theme.heading_font, 'Poppins')}', sans-serif;
  `;
}

export async function ThemeProvider({ children }: { children: React.ReactNode }) {
  let cssVars: string;

  try {
    const theme = await fetchTheme();
    // NFR-8: Fail build if no theme data returned (API unreachable or returned empty)
    if (!theme) {
      throw new Error(
        `No theme data returned from the API. The frontend build requires the Laravel API to be running.\n` +
        `Ensure PHP artisan serve is running at ${process.env.NEXT_PUBLIC_API_URL}`
      );
    }
    cssVars = buildCssVars(theme);
  } catch (err) {
    // Re-throw if it's already our NFR-8 error
    if (err instanceof Error && err.message.includes('No theme data returned')) {
      throw err;
    }
    throw new Error(
      `Failed to fetch theme from API. The frontend build requires the Laravel API to be running.\n` +
      `Ensure PHP artisan serve is running at ${process.env.NEXT_PUBLIC_API_URL}\n` +
      `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }

  return (
    <>
      <style precedence="default" href="theme-vars">{`:root { ${cssVars} }`}</style>
      {children}
    </>
  );
}
