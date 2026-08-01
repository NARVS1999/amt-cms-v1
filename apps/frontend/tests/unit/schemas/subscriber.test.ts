import { describe, it, expect } from 'vitest';
import { SubscribeRequestSchema, SubscribeResponseSchema } from '@amt/shared';

describe('SubscribeRequestSchema', () => {
  it('accepts a valid email', () => {
    const result = SubscribeRequestSchema.safeParse({ email: 'user@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = SubscribeRequestSchema.safeParse({ email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = SubscribeRequestSchema.safeParse({ email: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = SubscribeRequestSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects email exceeding 255 characters', () => {
    const result = SubscribeRequestSchema.safeParse({
      email: `${'a'.repeat(250)}@example.com`,
    });
    expect(result.success).toBe(false);
  });
});

describe('SubscribeResponseSchema', () => {
  it('accepts a valid response envelope', () => {
    const result = SubscribeResponseSchema.safeParse({
      data: {
        message: 'Subscribed successfully',
        subscriber: {
          id: 1,
          email: 'user@example.com',
          subscribed_at: '2026-07-26T00:00:00.000000Z',
        },
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects response missing subscriber object', () => {
    const result = SubscribeResponseSchema.safeParse({
      data: { message: 'Subscribed' },
    });
    expect(result.success).toBe(false);
  });
});
