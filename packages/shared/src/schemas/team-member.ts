import { z } from 'zod';

export const TeamMemberSchema = z.object({
  id: z.number(),
  name: z.string(),
  role: z.string(),
  bio: z.string().nullable(),
  photo_url: z.string().nullable(),
  sort_order: z.number().default(0),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const TeamMembersResponseSchema = z.object({
  data: z.array(TeamMemberSchema),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type TeamMembersResponse = z.infer<typeof TeamMembersResponseSchema>;
