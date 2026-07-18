import { z } from 'zod';

export const BlogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  featured_image_url: z.string().nullable(),
  published_at: z.string().nullable(),
  is_published: z.boolean().default(false),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const BlogPostsResponseSchema = z.object({
  data: z.array(BlogPostSchema),
});

export const BlogPostResponseSchema = z.object({
  data: BlogPostSchema.nullable(),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;
export type BlogPostsResponse = z.infer<typeof BlogPostsResponseSchema>;
export type BlogPostResponse = z.infer<typeof BlogPostResponseSchema>;
