import { z } from 'zod';

export const PageSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  hero_heading: z.string().nullable(),
  hero_subtext: z.string().nullable(),
  sections: z.record(z.unknown()).nullable(),
  is_published: z.boolean().default(false),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const PagesResponseSchema = z.object({
  data: z.array(PageSchema),
});

export const PageResponseSchema = z.object({
  data: PageSchema.nullable(),
});

export type Page = z.infer<typeof PageSchema>;
export type PagesResponse = z.infer<typeof PagesResponseSchema>;
export type PageResponse = z.infer<typeof PageResponseSchema>;
