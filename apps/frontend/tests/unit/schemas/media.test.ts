import { describe, it, expect } from 'vitest';
import { MediaItemSchema, MediaListResponseSchema } from '@amt/shared';

describe('MediaItemSchema', () => {
  it('accepts valid media item', () => {
    const result = MediaItemSchema.safeParse({
      id: 1,
      name: 'hero-banner',
      file_name: 'hero-banner.jpg',
      size: 204800,
      mime_type: 'image/jpeg',
      url: 'http://localhost:8000/storage/media/1/hero-banner.jpg',
      thumbnail: 'http://localhost:8000/storage/media/1/thumb-hero-banner.jpg',
      created_at: '2026-07-23T10:00:00.000000Z',
    });
    expect(result.success).toBe(true);
  });

  it('accepts null thumbnail', () => {
    const result = MediaItemSchema.safeParse({
      id: 2,
      name: 'document',
      file_name: 'document.pdf',
      size: 1024,
      mime_type: 'application/pdf',
      url: 'http://localhost:8000/storage/media/2/document.pdf',
      thumbnail: null,
      created_at: '2026-07-23T10:00:00.000000Z',
    });
    expect(result.success).toBe(true);
  });
});

describe('MediaListResponseSchema', () => {
  it('accepts valid paginated response', () => {
    const result = MediaListResponseSchema.safeParse({
      data: [
        {
          id: 1,
          name: 'hero-banner',
          file_name: 'hero-banner.jpg',
          size: 204800,
          mime_type: 'image/jpeg',
          url: 'http://localhost:8000/storage/media/1/hero-banner.jpg',
          thumbnail: null,
          created_at: '2026-07-23T10:00:00.000000Z',
        },
      ],
      meta: {
        current_page: 1,
        last_page: 3,
        per_page: 15,
        total: 42,
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects response missing meta field', () => {
    const result = MediaListResponseSchema.safeParse({
      data: [],
    });
    expect(result.success).toBe(false);
  });
});
