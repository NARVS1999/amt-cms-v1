import { describe, it, expect } from 'vitest';
import { DashboardStatsSchema } from '@amt/shared';

describe('DashboardStatsSchema', () => {
  it('accepts valid stats object', () => {
    const result = DashboardStatsSchema.safeParse({
      services: 5,
      pricing_plans: 3,
      team_members: 8,
      blog_posts: 12,
      unread_messages: 2,
      subscribers: 45,
      published_pages: 6,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required field', () => {
    const result = DashboardStatsSchema.safeParse({
      services: 5,
      pricing_plans: 3,
      // missing team_members
      blog_posts: 12,
      unread_messages: 2,
      subscribers: 45,
      published_pages: 6,
    });
    expect(result.success).toBe(false);
  });

  it('strips extra fields (strict mode)', () => {
    const result = DashboardStatsSchema.safeParse({
      services: 5,
      pricing_plans: 3,
      team_members: 8,
      blog_posts: 12,
      unread_messages: 2,
      subscribers: 45,
      published_pages: 6,
      extra_field: 'should be removed',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('extra_field');
    }
  });
});
