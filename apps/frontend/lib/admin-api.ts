const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem('admin_token'); } catch { return null; }
}

export function setToken(token: string) {
  try { localStorage.setItem('admin_token', token); } catch { /* storage unavailable */ }
}

export function clearToken() {
  try { localStorage.removeItem('admin_token'); } catch { /* storage unavailable */ }
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

export async function login(email: string, password: string, remember = false): Promise<{ token: string; user: { id: number; name: string; email: string } }> {
  const data = await request<{ token: string; user: { id: number; name: string; email: string } }>('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, remember }),
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
    throw { status: res.status, errors: data.errors, message: data.message || 'Upload failed' };
  }

  return res.json();
}

export async function deleteMedia(id: number): Promise<void> {
  await request(`/media/${id}`, { method: 'DELETE' });
}

/* ─── Pricing Plans ─── */

export interface PricingPlanFeatureData {
  id?: number;
  description: string;
  is_included: boolean;
  sort_order: number;
}

export interface PricingPlanData {
  id: number;
  name: string;
  price: number;
  interval: string;
  description: string | null;
  cta_text: string | null;
  is_popular: boolean;
  is_published: boolean;
  sort_order: number;
  features: PricingPlanFeatureData[];
  created_at: string | null;
  updated_at: string | null;
}

export async function fetchPricingPlans(): Promise<{ data: PricingPlanData[] }> {
  return request('/pricing-plans');
}

export async function createPricingPlan(data: Partial<PricingPlanData>): Promise<{ data: PricingPlanData }> {
  return request('/pricing-plans', { method: 'POST', body: JSON.stringify(data) });
}

export async function updatePricingPlan(id: number, data: Partial<PricingPlanData>): Promise<{ data: PricingPlanData }> {
  return request(`/pricing-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deletePricingPlan(id: number): Promise<void> {
  await request(`/pricing-plans/${id}`, { method: 'DELETE' });
}

/* ─── Blog Posts ─── */

export interface BlogPostData {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export async function fetchBlogPosts(): Promise<{ data: BlogPostData[] }> {
  return request('/blog-posts');
}

export async function createBlogPost(data: Partial<BlogPostData>): Promise<{ data: BlogPostData }> {
  return request('/blog-posts', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateBlogPost(id: number, data: Partial<BlogPostData>): Promise<{ data: BlogPostData }> {
  return request(`/blog-posts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteBlogPost(id: number): Promise<void> {
  await request(`/blog-posts/${id}`, { method: 'DELETE' });
}

/* ─── Dashboard Stats ─── */

export interface DashboardStats {
  services: number;
  blog_posts: number;
  unread_messages: number;
  subscribers: number;
}

export async function fetchAdminStats(): Promise<DashboardStats> {
  return request('/admin/stats');
}
