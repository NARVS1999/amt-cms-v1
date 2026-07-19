import { PagesResponseSchema, ServicesResponseSchema, TeamMembersResponseSchema } from '@amt/shared';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ThemeData {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  foreground_color?: string;
  muted_color?: string;
  muted_foreground_color?: string;
  border_color?: string;
  success_color?: string;
  error_color?: string;
  body_font?: string;
  heading_font?: string;
}

export interface ServiceData {
  id: number;
  title: string;
  description: string;
  icon: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export async function fetchServices(): Promise<ServiceData[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_URL}/services`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();
    const parsed = ServicesResponseSchema.parse(json);
    return parsed.data;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export interface TeamMemberData {
  id: number;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  social_links: { linkedin: string | null; twitter: string | null } | null;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export async function fetchTeamMembers(): Promise<TeamMemberData[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_URL}/team`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();
    const parsed = TeamMembersResponseSchema.parse(json);
    return parsed.data;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export interface PageData {
  id: number;
  title: string;
  slug: string;
  hero_heading: string | null;
  hero_subtext: string | null;
  sections: Record<string, unknown>[] | null;
  is_published: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export async function fetchPages(): Promise<PageData[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_URL}/pages`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();
    const parsed = PagesResponseSchema.parse(json);
    return parsed.data;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchTheme(): Promise<ThemeData | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${API_URL}/theme`, {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const json = await res.json();

    // Validate response has data field
    if (!json || typeof json !== 'object' || !('data' in json) || typeof json.data !== 'object') {
      throw new Error('Invalid theme response: missing or malformed data field');
    }

    return json.data as ThemeData;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
