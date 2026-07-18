import { z } from 'zod';

export const ThemeSchema = z.object({
  data: z.record(z.string()),
});

export type Theme = z.infer<typeof ThemeSchema>;
