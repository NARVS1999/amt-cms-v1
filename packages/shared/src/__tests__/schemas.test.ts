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
import { ServiceSchema, ServicesResponseSchema } from '../schemas/service';
import { TeamMemberSchema, TeamMembersResponseSchema } from '../schemas/team-member';
import { BlogPostSchema, BlogPostsResponseSchema, BlogPostResponseSchema } from '../schemas/blog-post';
import { PricingPlanSchema, PlanFeatureSchema, PricingPlansResponseSchema } from '../schemas/pricing-plan';
import { PageSchema, PagesResponseSchema, PageResponseSchema } from '../schemas/page';
import { ContactRequestSchema, ContactResponseSchema } from '../schemas/contact';
import { SubscribeRequestSchema, SubscribeResponseSchema } from '../schemas/subscriber';
import { ThemeSchema } from '../schemas/theme';

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

  it('accepts DashboardStatsSchema with zero values', () => {
    const result = DashboardStatsSchema.safeParse({
      services: 0,
      pricing_plans: 0,
      team_members: 0,
      blog_posts: 0,
      unread_messages: 0,
      subscribers: 0,
      published_pages: 0,
    });
    expect(result.success).toBe(true);
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

  it('rejects MediaItemSchema with missing required fields', () => {
    const result = MediaItemSchema.safeParse({ id: 1 });
    expect(result.success).toBe(false);
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

  it('validates MediaListResponseSchema with empty data array', () => {
    const result = MediaListResponseSchema.safeParse({
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 24, total: 0 },
    });
    expect(result.success).toBe(true);
  });
});

describe('Service Schema', () => {
  it('validates ServiceSchema', () => {
    const result = ServiceSchema.safeParse({
      id: 1,
      title: 'Web Development',
      description: 'Custom websites',
      icon: 'fa-solid fa-code',
      is_featured: true,
      sort_order: 1,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('applies defaults for optional fields', () => {
    const result = ServiceSchema.safeParse({
      id: 1,
      title: 'Web Development',
      description: 'Custom websites',
      icon: 'fa-solid fa-code',
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_featured).toBe(false);
      expect(result.data.sort_order).toBe(0);
    }
  });

  it('rejects ServiceSchema with missing title', () => {
    const result = ServiceSchema.safeParse({
      id: 1,
      description: 'Custom websites',
      icon: 'fa-solid fa-code',
    });
    expect(result.success).toBe(false);
  });

  it('validates ServicesResponseSchema', () => {
    const result = ServicesResponseSchema.safeParse({
      data: [
        {
          id: 1,
          title: 'Service A',
          description: 'Desc A',
          icon: 'fa-solid fa-code',
          created_at: null,
          updated_at: null,
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe('Team Member Schema', () => {
  it('validates TeamMemberSchema', () => {
    const result = TeamMemberSchema.safeParse({
      id: 1,
      name: 'John Doe',
      role: 'CEO',
      bio: 'Founder',
      photo_url: 'http://example.com/photo.jpg',
      social_links: {
        linkedin: 'https://linkedin.com/in/johndoe',
        twitter: 'https://twitter.com/johndoe',
      },
      sort_order: 1,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('accepts TeamMemberSchema with null social_links', () => {
    const result = TeamMemberSchema.safeParse({
      id: 1,
      name: 'Jane Smith',
      role: 'Developer',
      bio: null,
      photo_url: null,
      social_links: null,
      sort_order: 0,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it('accepts TeamMemberSchema with partial social_links', () => {
    const result = TeamMemberSchema.safeParse({
      id: 1,
      name: 'Jane Smith',
      role: 'Developer',
      bio: null,
      photo_url: null,
      social_links: { linkedin: 'https://linkedin.com/in/jane' },
      sort_order: 0,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it('validates TeamMembersResponseSchema', () => {
    const result = TeamMembersResponseSchema.safeParse({ data: [] });
    expect(result.success).toBe(true);
  });
});

describe('Blog Post Schema', () => {
  it('validates BlogPostSchema', () => {
    const result = BlogPostSchema.safeParse({
      id: 1,
      title: 'Hello World',
      slug: 'hello-world',
      content: 'Full content here',
      excerpt: 'Short excerpt',
      featured_image_url: 'http://example.com/image.jpg',
      published_at: '2026-01-15T00:00:00Z',
      is_published: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('accepts BlogPostSchema with null excerpt and image', () => {
    const result = BlogPostSchema.safeParse({
      id: 1,
      title: 'Draft Post',
      slug: 'draft-post',
      content: 'Not published yet',
      excerpt: null,
      featured_image_url: null,
      published_at: null,
      is_published: false,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects BlogPostSchema with missing slug', () => {
    const result = BlogPostSchema.safeParse({
      id: 1,
      title: 'No Slug',
      content: 'Content',
    });
    expect(result.success).toBe(false);
  });

  it('validates BlogPostsResponseSchema', () => {
    const result = BlogPostsResponseSchema.safeParse({ data: [] });
    expect(result.success).toBe(true);
  });

  it('validates BlogPostResponseSchema with null data', () => {
    const result = BlogPostResponseSchema.safeParse({ data: null });
    expect(result.success).toBe(true);
  });
});

describe('Pricing Plan Schema', () => {
  it('validates PlanFeatureSchema', () => {
    const result = PlanFeatureSchema.safeParse({
      id: 1,
      description: '24/7 Support',
      is_included: true,
      sort_order: 1,
    });
    expect(result.success).toBe(true);
  });

  it('validates PricingPlanSchema', () => {
    const result = PricingPlanSchema.safeParse({
      id: 1,
      name: 'Starter',
      price: 9.99,
      interval: 'monthly',
      description: 'Best for small teams',
      is_popular: false,
      is_published: true,
      cta_text: 'Get Started',
      sort_order: 1,
      features: [
        { id: 1, description: 'Feature A', is_included: true, sort_order: 1 },
      ],
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('accepts PricingPlanSchema with empty features', () => {
    const result = PricingPlanSchema.safeParse({
      id: 1,
      name: 'Basic',
      price: 0,
      interval: 'one-time',
      description: null,
      cta_text: null,
      features: [],
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects PricingPlanSchema with invalid interval', () => {
    const result = PricingPlanSchema.safeParse({
      id: 1,
      name: 'Bad Plan',
      price: 10,
      interval: 'weekly',
      features: [],
    });
    expect(result.success).toBe(false);
  });

  it('validates PricingPlansResponseSchema', () => {
    const result = PricingPlansResponseSchema.safeParse({ data: [] });
    expect(result.success).toBe(true);
  });
});

describe('Page Schema', () => {
  it('validates PageSchema', () => {
    const result = PageSchema.safeParse({
      id: 1,
      title: 'Home',
      slug: 'home',
      hero_heading: 'Welcome',
      hero_subtext: 'Subtitle here',
      sections: [
        { type: 'hero', heading: 'Welcome', content: 'Hello' },
      ],
      is_published: true,
      sort_order: 0,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it('accepts PageSchema with null sections', () => {
    const result = PageSchema.safeParse({
      id: 1,
      title: 'Empty Page',
      slug: 'empty',
      hero_heading: null,
      hero_subtext: null,
      sections: null,
      is_published: false,
      sort_order: 0,
      created_at: null,
      updated_at: null,
    });
    expect(result.success).toBe(true);
  });

  it('validates PagesResponseSchema', () => {
    const result = PagesResponseSchema.safeParse({ data: [] });
    expect(result.success).toBe(true);
  });

  it('validates PageResponseSchema with null data', () => {
    const result = PageResponseSchema.safeParse({ data: null });
    expect(result.success).toBe(true);
  });
});

describe('Contact Schema', () => {
  it('validates ContactRequestSchema', () => {
    const result = ContactRequestSchema.safeParse({
      name: 'Maria Santos',
      email: 'maria@example.com',
      message: 'I would like to discuss a project.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects ContactRequestSchema with empty name', () => {
    const result = ContactRequestSchema.safeParse({
      name: '',
      email: 'maria@example.com',
      message: 'Hello',
    });
    expect(result.success).toBe(false);
  });

  it('rejects ContactRequestSchema with invalid email', () => {
    const result = ContactRequestSchema.safeParse({
      name: 'Maria',
      email: 'not-an-email',
      message: 'Hello',
    });
    expect(result.success).toBe(false);
  });

  it('rejects ContactRequestSchema with empty message', () => {
    const result = ContactRequestSchema.safeParse({
      name: 'Maria',
      email: 'maria@example.com',
      message: '',
    });
    expect(result.success).toBe(false);
  });

  it('validates ContactResponseSchema', () => {
    const result = ContactResponseSchema.safeParse({
      data: {
        message: 'Message sent.',
        contact_message: {
          id: 1,
          name: 'Maria Santos',
          email: 'maria@example.com',
          created_at: '2026-01-01T00:00:00Z',
        },
      },
    });
    expect(result.success).toBe(true);
  });
});

describe('Subscribe Schema', () => {
  it('validates SubscribeRequestSchema', () => {
    const result = SubscribeRequestSchema.safeParse({
      email: 'user@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejects SubscribeRequestSchema with invalid email', () => {
    const result = SubscribeRequestSchema.safeParse({
      email: 'bad-email',
    });
    expect(result.success).toBe(false);
  });

  it('validates SubscribeResponseSchema', () => {
    const result = SubscribeResponseSchema.safeParse({
      data: {
        message: 'Subscribed.',
        subscriber: {
          id: 1,
          email: 'user@example.com',
          subscribed_at: '2026-01-01T00:00:00Z',
        },
      },
    });
    expect(result.success).toBe(true);
  });
});

describe('Theme Schema', () => {
  it('validates ThemeSchema with arbitrary key-value pairs', () => {
    const result = ThemeSchema.safeParse({
      data: {
        primary_color: '#FF0000',
        font_family: 'Inter',
        logo_url: '/uploads/logo.png',
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts ThemeSchema with empty data', () => {
    const result = ThemeSchema.safeParse({ data: {} });
    expect(result.success).toBe(true);
  });
});
