import { describe, it, expect } from 'vitest';
import {
  UserSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
} from '../schemas/auth';
import { DashboardStatsSchema } from '../schemas/stats';
import { MediaItemSchema, MediaListResponseSchema } from '../schemas/media';

describe('Auth Schemas', () => {
  it('validates UserSchema', () => {
    const result = UserSchema.safeParse({ id: 1, name: 'Admin', email: 'admin@example.com' });
    expect(result.success).toBe(true);
  });

  it('rejects UserSchema with missing email', () => {
    const result = UserSchema.safeParse({ id: 1, name: 'Admin' });
    expect(result.success).toBe(false);
  });

  it('validates LoginRequestSchema', () => {
    const result = LoginRequestSchema.safeParse({
      email: 'admin@example.com',
      password: 'secret',
      remember: true,
    });
    expect(result.success).toBe(true);
  });

  it('validates LoginRequestSchema without remember', () => {
    const result = LoginRequestSchema.safeParse({
      email: 'admin@example.com',
      password: 'secret',
    });
    expect(result.success).toBe(true);
  });

  it('validates LoginResponseSchema', () => {
    const result = LoginResponseSchema.safeParse({
      data: { token: 'abc123', user: { id: 1, name: 'Admin', email: 'admin@example.com' } },
    });
    expect(result.success).toBe(true);
  });

  it('validates ForgotPasswordRequestSchema', () => {
    const result = ForgotPasswordRequestSchema.safeParse({ email: 'admin@example.com' });
    expect(result.success).toBe(true);
  });

  it('validates ResetPasswordRequestSchema', () => {
    const result = ResetPasswordRequestSchema.safeParse({
      email: 'admin@example.com',
      token: 'reset-token-123',
      password: 'new-password',
      password_confirmation: 'new-password',
    });
    expect(result.success).toBe(true);
  });

  it('rejects ResetPasswordRequestSchema with short password', () => {
    const result = ResetPasswordRequestSchema.safeParse({
      email: 'admin@example.com',
      token: 'token',
      password: 'short',
      password_confirmation: 'short',
    });
    expect(result.success).toBe(false);
  });
});

describe('Stats Schema', () => {
  it('validates DashboardStatsSchema', () => {
    const result = DashboardStatsSchema.safeParse({
      services: 3,
      pricing_plans: 5,
      team_members: 2,
      blog_posts: 10,
      unread_messages: 1,
      subscribers: 50,
      published_pages: 4,
    });
    expect(result.success).toBe(true);
  });

  it('rejects DashboardStatsSchema with string values', () => {
    const result = DashboardStatsSchema.safeParse({
      services: '3',
      blog_posts: 10,
      unread_messages: 1,
      subscribers: 50,
    });
    expect(result.success).toBe(false);
  });
});

describe('Media Schemas', () => {
  it('validates MediaItemSchema', () => {
    const result = MediaItemSchema.safeParse({
      id: 1,
      name: 'photo',
      file_name: 'photo.jpg',
      size: 1024,
      mime_type: 'image/jpeg',
      url: 'http://example.com/photo.jpg',
      thumbnail: 'http://example.com/thumb.jpg',
      created_at: '2026-01-01T00:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('validates MediaItemSchema with null thumbnail', () => {
    const result = MediaItemSchema.safeParse({
      id: 1,
      name: 'photo',
      file_name: 'photo.jpg',
      size: 1024,
      mime_type: 'image/jpeg',
      url: 'http://example.com/photo.jpg',
      thumbnail: null,
      created_at: '2026-01-01T00:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('validates MediaListResponseSchema', () => {
    const result = MediaListResponseSchema.safeParse({
      data: [
        {
          id: 1,
          name: 'photo',
          file_name: 'photo.jpg',
          size: 1024,
          mime_type: 'image/jpeg',
          url: 'http://example.com/photo.jpg',
          thumbnail: null,
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
      meta: { current_page: 1, last_page: 1, per_page: 24, total: 1 },
    });
    expect(result.success).toBe(true);
  });
});
