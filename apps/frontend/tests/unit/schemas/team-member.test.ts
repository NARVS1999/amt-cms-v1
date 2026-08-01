import { describe, it, expect } from 'vitest';
import { TeamMemberSchema, TeamMembersResponseSchema } from '@amt/shared';

const baseMember = {
  id: 1,
  name: 'Jane Smith',
  role: 'Designer',
  bio: null,
  photo_url: null,
  social_links: null,
  sort_order: 0,
  created_at: '2026-07-26T00:00:00.000000Z',
  updated_at: '2026-07-26T00:00:00.000000Z',
};

describe('TeamMember Zod Schema', () => {
  it('accepts a valid team member without social links', () => {
    expect(TeamMemberSchema.safeParse(baseMember).success).toBe(true);
  });

  it('accepts social links object with nullable URLs', () => {
    const result = TeamMemberSchema.safeParse({
      ...baseMember,
      social_links: { linkedin: null, twitter: null },
    });
    expect(result.success).toBe(true);
  });

  it('accepts full social URLs', () => {
    const result = TeamMemberSchema.safeParse({
      ...baseMember,
      social_links: {
        linkedin: 'https://linkedin.com/in/jane',
        twitter: 'https://twitter.com/jane',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid URL in social_links', () => {
    const result = TeamMemberSchema.safeParse({
      ...baseMember,
      social_links: { linkedin: 'not-a-url', twitter: null },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing name', () => {
    const result = TeamMemberSchema.safeParse({ ...baseMember, name: undefined });
    expect(result.success).toBe(false);
  });

  it('rejects missing role', () => {
    const result = TeamMemberSchema.safeParse({ ...baseMember, role: undefined });
    expect(result.success).toBe(false);
  });

  it('defaults sort_order to 0 when omitted', () => {
    const { sort_order } = TeamMemberSchema.parse({ ...baseMember, sort_order: undefined });
    expect(sort_order).toBe(0);
  });
});

describe('TeamMembersResponseSchema', () => {
  it('accepts an array of members under data', () => {
    expect(TeamMembersResponseSchema.safeParse({ data: [baseMember] }).success).toBe(true);
  });

  it('rejects invalid member entries', () => {
    const result = TeamMembersResponseSchema.safeParse({
      data: [{ ...baseMember, role: undefined }],
    });
    expect(result.success).toBe(false);
  });
});
