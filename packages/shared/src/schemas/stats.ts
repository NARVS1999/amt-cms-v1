import { z } from 'zod';

export const DashboardStatsSchema = z.object({
  services: z.number(),
  pricing_plans: z.number(),
  team_members: z.number(),
  blog_posts: z.number(),
  unread_messages: z.number(),
  subscribers: z.number(),
  published_pages: z.number(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
