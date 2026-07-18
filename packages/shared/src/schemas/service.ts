import { z } from 'zod';

export const ServiceSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  sort_order: z.number().default(0),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const ServicesResponseSchema = z.object({
  data: z.array(ServiceSchema),
});

export type Service = z.infer<typeof ServiceSchema>;
export type ServicesResponse = z.infer<typeof ServicesResponseSchema>;
