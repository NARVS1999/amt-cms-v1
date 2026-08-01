import { describe, it, expect } from 'vitest';
import { ContactRequestSchema, ContactResponseSchema } from '@amt/shared';

describe('ContactRequestSchema', () => {
  it('accepts a valid contact request', () => {
    const result = ContactRequestSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'I would like a quote.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = ContactRequestSchema.safeParse({
      name: '',
      email: 'john@example.com',
      message: 'hello',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const result = ContactRequestSchema.safeParse({
      email: 'john@example.com',
      message: 'hello',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = ContactRequestSchema.safeParse({
      name: 'John',
      email: 'not-an-email',
      message: 'hello',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = ContactRequestSchema.safeParse({
      name: 'John',
      message: 'hello',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty message', () => {
    const result = ContactRequestSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      message: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects message exceeding 5000 characters', () => {
    const result = ContactRequestSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      message: 'x'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it('accepts exactly 5000 characters', () => {
    const result = ContactRequestSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      message: 'x'.repeat(5000),
    });
    expect(result.success).toBe(true);
  });
});

describe('ContactResponseSchema', () => {
  it('accepts a valid response envelope', () => {
    const result = ContactResponseSchema.safeParse({
      data: {
        message: 'Message sent',
        contact_message: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          created_at: '2026-07-26T00:00:00.000000Z',
        },
      },
    });
    expect(result.success).toBe(true);
  });
});
