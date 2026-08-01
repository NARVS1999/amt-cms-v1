import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderToReadableStream } from 'react-dom/server';
import { ThemeProvider } from '@/components/ThemeProvider';

const fetchThemeMock = vi.fn();

vi.mock('@/lib/api', () => ({
  fetchTheme: (...args: unknown[]) => fetchThemeMock(...args),
  API_URL: 'http://localhost:8000/api',
}));

async function renderTheme(theme: unknown | null, shouldThrow = false) {
  if (shouldThrow) {
    fetchThemeMock.mockRejectedValueOnce(new Error('API down'));
  } else {
    fetchThemeMock.mockResolvedValueOnce(theme);
  }
  const stream = await renderToReadableStream(
    <ThemeProvider><div>content</div></ThemeProvider>
  );
  return await new Response(stream).text();
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    fetchThemeMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders children', async () => {
    fetchThemeMock.mockResolvedValueOnce(null);
    const stream = await renderToReadableStream(
      <ThemeProvider><div>content</div></ThemeProvider>
    );
    const html = await new Response(stream).text();
    expect(html).toContain('content');
  });

  it('uses FALLBACK_THEME when API returns null', async () => {
    const html = await renderTheme(null);
    expect(html).toContain('--color-primary: #FF0000');
    expect(html).toContain('--color-secondary: #fb3d03');
    expect(html).toContain("--font-body: 'Poppins', sans-serif");
  });

  it('falls back to defaults when fetch rejects', async () => {
    const html = await renderTheme(null, true);
    expect(html).toContain('--color-primary: #FF0000');
  });

  it('merges partial API theme over fallback defaults', async () => {
    const html = await renderTheme({ primary_color: '#123456' });
    expect(html).toContain('--color-primary: #123456');
    expect(html).toContain('--color-secondary: #fb3d03');
  });

  it('sanitizes invalid color values back to fallback', async () => {
    const html = await renderTheme({ primary_color: 'javascript:alert(1)' });
    expect(html).toContain('--color-primary: #FF0000');
    expect(html).not.toContain('javascript:');
  });

  it('accepts valid rgba() color values', async () => {
    const html = await renderTheme({ primary_color: 'rgba(255,0,0,0.5)' });
    expect(html).toContain('--color-primary: rgba(255,0,0,0.5)');
  });

  it('strips HTML tag characters from font names (no injection)', async () => {
    const html = await renderTheme({ body_font: '<script>alert(1)</script>' });
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('</script>');
    expect(html).toContain('--font-body:');
  });

  it('strips quotes-only apostrophes without breaking render', async () => {
    const html = await renderTheme({ body_font: "O'Hara" });
    expect(html).toContain('--font-body:');
    expect(html).toContain('O');
    expect(html).toContain('Hara');
  });

  it('ignores null and empty-string theme values', async () => {
    const html = await renderTheme({ primary_color: '', secondary_color: null });
    expect(html).toContain('--color-primary: #FF0000');
    expect(html).toContain('--color-secondary: #fb3d03');
  });

  it('emits style tag with theme-vars href', async () => {
    const html = await renderTheme({});
    expect(html).toContain('href="theme-vars"');
    expect(html).toContain(':root');
  });
});
