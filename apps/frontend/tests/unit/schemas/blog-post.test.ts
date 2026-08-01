import { describe, it, expect } from 'vitest';
import { BlogPostSchema, BlogPostsResponseSchema, BlogPostResponseSchema } from '@amt/shared';

const basePost = {
  id: 1,
  title: 'Hello World',
  slug: 'hello-world',
  content: '<p>Welcome to the blog.</p>',
  excerpt: 'A short excerpt',
  featured_image_url: null,
  published_at: '2026-07-26T00:00:00.000000Z',
  is_published: true,
  created_at: '2026-07-26T00:00:00.000000Z',
  updated_at: '2026-07-26T00:00:00.000000Z',
};

describe('BlogPost Zod Schema', () => {
  it('accepts a valid post', () => {
    expect(BlogPostSchema.safeParse(basePost).success).toBe(true);
  });

  it('accepts missing content (listing endpoint omits it)', () => {
    const { content, ...withoutContent } = basePost;
    expect(BlogPostSchema.safeParse(withoutContent).success).toBe(true);
  });

  it('rejects non-string content when present', () => {
    const result = BlogPostSchema.safeParse({ ...basePost, content: 42 });
    expect(result.success).toBe(false);
  });

  it('accepts null excerpt', () => {
    expect(BlogPostSchema.safeParse({ ...basePost, excerpt: null }).success).toBe(true);
  });

  it('accepts null published_at (draft)', () => {
    expect(BlogPostSchema.safeParse({ ...basePost, published_at: null }).success).toBe(true);
  });

  it('defaults is_published to false when omitted', () => {
    const { is_published } = BlogPostSchema.parse({ ...basePost, is_published: undefined });
    expect(is_published).toBe(false);
  });

  it('rejects missing title', () => {
    expect(BlogPostSchema.safeParse({ ...basePost, title: undefined }).success).toBe(false);
  });

  it('rejects missing slug', () => {
    expect(BlogPostSchema.safeParse({ ...basePost, slug: undefined }).success).toBe(false);
  });
});

describe('BlogPostsResponseSchema', () => {
  it('accepts posts array under data', () => {
    expect(BlogPostsResponseSchema.safeParse({ data: [basePost] }).success).toBe(true);
  });

  it('rejects posts with invalid entries', () => {
    const result = BlogPostsResponseSchema.safeParse({
      data: [{ ...basePost, title: undefined }],
    });
    expect(result.success).toBe(false);
  });
});

describe('BlogPostResponseSchema', () => {
  it('accepts a single post under data', () => {
    expect(BlogPostResponseSchema.safeParse({ data: basePost }).success).toBe(true);
  });

  it('accepts null data for not-found', () => {
    expect(BlogPostResponseSchema.safeParse({ data: null }).success).toBe(true);
  });
});
