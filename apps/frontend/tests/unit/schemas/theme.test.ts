import { describe, it, expect } from 'vitest';
import { ThemeSchema } from '@amt/shared';

describe('Theme Zod Schema', () => {
  it('accepts a data object with theme keys', () => {
    const result = ThemeSchema.safeParse({
      data: {
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
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts a partial theme (only some keys)', () => {
    const result = ThemeSchema.safeParse({ data: { primary_color: '#123456' } });
    expect(result.success).toBe(true);
  });

  it('accepts empty data object', () => {
    const result = ThemeSchema.safeParse({ data: {} });
    expect(result.success).toBe(true);
  });

  it('rejects missing data key', () => {
    const result = ThemeSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects non-object data', () => {
    const result = ThemeSchema.safeParse({ data: 'red' });
    expect(result.success).toBe(false);
  });

  it('rejects non-string values', () => {
    const result = ThemeSchema.safeParse({ data: { primary_color: 123 } });
    expect(result.success).toBe(false);
  });
});
