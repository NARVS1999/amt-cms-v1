import { describe, it, expect } from 'vitest';
import { ServiceSchema, ServicesResponseSchema } from '@amt/shared';

const baseService = {
  id: 1,
  title: 'Web Development',
  description: 'Custom websites built with care.',
  icon: 'fa-solid fa-code',
  is_featured: true,
  sort_order: 0,
  created_at: '2026-07-26T00:00:00.000000Z',
  updated_at: '2026-07-26T00:00:00.000000Z',
};

describe('Service Zod Schema', () => {
  it('accepts a valid service', () => {
    expect(ServiceSchema.safeParse(baseService).success).toBe(true);
  });

  it('defaults is_featured to false when omitted', () => {
    const { is_featured } = ServiceSchema.parse({
      ...baseService,
      is_featured: undefined,
    });
    expect(is_featured).toBe(false);
  });

  it('defaults sort_order to 0 when omitted', () => {
    const { sort_order } = ServiceSchema.parse({ ...baseService, sort_order: undefined });
    expect(sort_order).toBe(0);
  });

  it('rejects missing title', () => {
    const result = ServiceSchema.safeParse({ ...baseService, title: undefined });
    expect(result.success).toBe(false);
  });

  it('rejects non-boolean is_featured', () => {
    const result = ServiceSchema.safeParse({ ...baseService, is_featured: 'yes' });
    expect(result.success).toBe(false);
  });

  it('rejects string sort_order', () => {
    const result = ServiceSchema.safeParse({ ...baseService, sort_order: 'first' });
    expect(result.success).toBe(false);
  });

  it('accepts nullable created_at/updated_at', () => {
    const result = ServiceSchema.safeParse({ ...baseService, created_at: null, updated_at: null });
    expect(result.success).toBe(true);
  });
});

describe('ServicesResponseSchema', () => {
  it('accepts an array of services under data', () => {
    const result = ServicesResponseSchema.safeParse({ data: [baseService] });
    expect(result.success).toBe(true);
  });

  it('rejects a bare array without data envelope', () => {
    const result = ServicesResponseSchema.safeParse([baseService]);
    expect(result.success).toBe(false);
  });

  it('rejects data containing invalid items', () => {
    const result = ServicesResponseSchema.safeParse({ data: [{ ...baseService, id: 'one' }] });
    expect(result.success).toBe(false);
  });
});
