import { z } from 'zod';

export const SubscribeRequestSchema = z.object({
  email: z.string().email('Please provide a valid email address.').max(255, 'Email too long.'),
});

export const SubscribeResponseSchema = z.object({
  data: z.object({
    message: z.string(),
    subscriber: z.object({
      id: z.number(),
      email: z.string(),
      subscribed_at: z.string(),
    }),
  }),
});

export type SubscribeRequest = z.infer<typeof SubscribeRequestSchema>;
export type SubscribeResponse = z.infer<typeof SubscribeResponseSchema>;
