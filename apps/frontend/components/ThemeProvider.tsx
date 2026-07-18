import type { Theme } from '@amt/shared';
import { fetchTheme, ThemeData } from '@/lib/api';

function buildCssVars(theme: ThemeData): string {
  return `
    --color-primary: ${theme.primary_color ?? '#FF0000'};
    --color-secondary: ${theme.secondary_color ?? '#fb3d03'};
    --color-accent: ${theme.accent_color ?? '#FFC107'};
    --color-background: ${theme.background_color ?? '#FFFFFF'};
    --color-foreground: ${theme.foreground_color ?? '#333333'};
    --color-muted: ${theme.muted_color ?? '#f5f5f5'};
    --color-muted-foreground: ${theme.muted_foreground_color ?? '#888888'};
    --color-border: ${theme.border_color ?? '#f0f0f0'};
    --color-success: ${theme.success_color ?? '#22c55e'};
    --color-error: ${theme.error_color ?? '#ef4444'};
    --font-body: '${theme.body_font ?? 'Poppins'}', sans-serif;
    --font-heading: '${theme.heading_font ?? 'Poppins'}', sans-serif;
  `;
}

export async function ThemeProvider({ children }: { children: React.ReactNode }) {
  let cssVars: string;

  try {
    const theme = await fetchTheme();
    cssVars = buildCssVars(theme ?? {});
  } catch (err) {
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
