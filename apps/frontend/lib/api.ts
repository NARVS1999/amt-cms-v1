const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ThemeData {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  foreground_color?: string;
  muted_color?: string;
  muted_foreground_color?: string;
  border_color?: string;
  success_color?: string;
  error_color?: string;
  body_font?: string;
  heading_font?: string;
}

export async function fetchTheme(): Promise<ThemeData | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_URL}/theme`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();
    if (!json || typeof json !== 'object' || !('data' in json)) {
      throw new Error('Unexpected API response shape');
    }
    return json.data as ThemeData;
  } finally {
    clearTimeout(timeout);
  }
}
