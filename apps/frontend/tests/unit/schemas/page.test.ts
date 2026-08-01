import { describe, it, expect } from 'vitest';
import { PageSchema, PagesResponseSchema, PageResponseSchema } from '@amt/shared';

const basePage = {
  id: 1,
  title: 'About Us',
  slug: 'about-us',
  hero_heading: null,
  hero_subtext: null,
  sections: null,
  is_published: true,
  sort_order: 0,
  created_at: '2026-07-26T00:00:00.000000Z',
  updated_at: '2026-07-26T00:00:00.000000Z',
};

describe('Page Zod Schema', () => {
  it('accepts a valid page', () => {
    expect(PageSchema.safeParse(basePage).success).toBe(true);
  });

  it('accepts sections as array of arbitrary records', () => {
    const result = PageSchema.safeParse({
      ...basePage,
      sections: [{ type: 'hero', heading: 'Welcome' }, { type: 'features' }],
    });
    expect(result.success).toBe(true);
  });

  it('accepts null sections', () => {
    expect(PageSchema.safeParse({ ...basePage, sections: null }).success).toBe(true);
  });

  it('rejects non-array sections', () => {
    expect(PageSchema.safeParse({ ...basePage, sections: { type: 'hero' } }).success).toBe(false);
  });

  it('defaults is_published to false when omitted', () => {
    const { is_published } = PageSchema.parse({ ...basePage, is_published: undefined });
    expect(is_published).toBe(false);
  });

  it('defaults sort_order to 0 when omitted', () => {
    const { sort_order } = PageSchema.parse({ ...basePage, sort_order: undefined });
    expect(sort_order).toBe(0);
  });

  it('rejects missing slug', () => {
    expect(PageSchema.safeParse({ ...basePage, slug: undefined }).success).toBe(false);
  });
});

describe('PagesResponseSchema', () => {
  it('accepts pages array under data', () => {
    expect(PagesResponseSchema.safeParse({ data: [basePage] }).success).toBe(true);
  });
});

describe('PageResponseSchema', () => {
  it('accepts a single page under data', () => {
    expect(PageResponseSchema.safeParse({ data: basePage }).success).toBe(true);
  });

  it('accepts null data', () => {
    expect(PageResponseSchema.safeParse({ data: null }).success).toBe(true);
  });
});
