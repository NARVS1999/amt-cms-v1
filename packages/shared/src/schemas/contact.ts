import { z } from 'zod';

export const ContactRequestSchema = z.object({
  name: z.string().min(1, 'Your name is required.').max(255, 'Name too long.'),
  email: z.string().email('Please provide a valid email address.').max(255, 'Email too long.'),
  message: z.string().min(1, 'A message is required.').max(5000, 'Message must not exceed 5000 characters.'),
});

export const ContactResponseSchema = z.object({
  data: z.object({
    message: z.string(),
    contact_message: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
      created_at: z.string(),
    }),
  }),
});

export type ContactRequest = z.infer<typeof ContactRequestSchema>;
export type ContactResponse = z.infer<typeof ContactResponseSchema>;
