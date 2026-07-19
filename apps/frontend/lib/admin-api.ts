const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_token');
}

export function setToken(token: string) {
  localStorage.setItem('admin_token', token);
}

export function clearToken() {
  localStorage.removeItem('admin_token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    throw new UnauthorizedError();
  }

  if (res.status === 422) {
    const data = await res.json();
    throw { status: 422, errors: data.errors, message: data.message };
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw { status: res.status, message: data.message || `Request failed (${res.status})` };
  }

  return res.json();
}

/* ─── Auth ─── */

export async function login(email: string, password: string): Promise<{ token: string; user: { id: number; name: string; email: string } }> {
  const data = await request<{ token: string; user: { id: number; name: string; email: string } }>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return data;
}

export async function fetchMe(): Promise<{ user: { id: number; name: string; email: string } }> {
  return request('/me');
}

export async function logout(): Promise<void> {
  await request('/logout', { method: 'POST' });
  clearToken();
}

/* ─── Services ─── */

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

export async function fetchServices(): Promise<{ data: ServiceData[] }> {
  return request('/services');
}

export async function createService(data: Partial<ServiceData>): Promise<{ data: ServiceData }> {
  return request('/services', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateService(id: number, data: Partial<ServiceData>): Promise<{ data: ServiceData }> {
  return request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteService(id: number): Promise<void> {
  await request(`/services/${id}`, { method: 'DELETE' });
}

/* ─── Team Members ─── */

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

export async function fetchTeamMembers(): Promise<{ data: TeamMemberData[] }> {
  return request('/team');
}

export async function createTeamMember(data: Partial<TeamMemberData>): Promise<{ data: TeamMemberData }> {
  return request('/team', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateTeamMember(id: number, data: Partial<TeamMemberData>): Promise<{ data: TeamMemberData }> {
  return request(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteTeamMember(id: number): Promise<void> {
  await request(`/team/${id}`, { method: 'DELETE' });
}

/* ─── Pages ─── */

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

export async function fetchAdminPages(): Promise<{ data: PageData[] }> {
  return request('/admin/pages');
}

export async function createPage(data: Partial<PageData>): Promise<{ data: PageData }> {
  return request('/pages', { method: 'POST', body: JSON.stringify(data) });
}

export async function updatePage(id: number, data: Partial<PageData>): Promise<{ data: PageData }> {
  return request(`/pages/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deletePage(id: number): Promise<void> {
  await request(`/pages/${id}`, { method: 'DELETE' });
}

/* ─── Media ─── */

export interface MediaData {
  id: number;
  name: string;
  file_name: string;
  size: number;
  mime_type: string;
  url: string;
  thumbnail: string;
  created_at: string;
}

export async function fetchMedia(): Promise<{ data: MediaData[] }> {
  return request('/media');
}

export async function uploadMedia(file: File): Promise<{ data: MediaData }> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/media`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (res.status === 401) {
    clearToken();
    throw new UnauthorizedError();
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw { status: res.status, message: data.message || 'Upload failed' };
  }

  return res.json();
}

export async function deleteMedia(id: number): Promise<void> {
  await request(`/media/${id}`, { method: 'DELETE' });
}
