import { z } from 'zod';

export const MediaItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  file_name: z.string(),
  size: z.number(),
  mime_type: z.string(),
  url: z.string(),
  thumbnail: z.string().nullable(),
  created_at: z.string(),
});

export const MediaListResponseSchema = z.object({
  data: z.array(MediaItemSchema),
  meta: z.object({
    current_page: z.number(),
    last_page: z.number(),
    per_page: z.number(),
    total: z.number(),
  }),
});

export type MediaItem = z.infer<typeof MediaItemSchema>;
export type MediaListResponse = z.infer<typeof MediaListResponseSchema>;
