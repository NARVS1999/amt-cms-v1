import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setToken,
  clearToken,
  fetchServices,
  createService,
  updateService,
  deleteService,
  reorderServices,
  fetchTeamMembers,
  reorderTeamMembers,
  fetchPricingPlans,
  fetchAdminPricingPlans,
  createPricingPlan,
  updatePricingPlan,
  deletePricingPlan,
  reorderPricingPlans,
  fetchAdminPages,
  createPage,
  updatePage,
  deletePage,
  reorderPages,
  UnauthorizedError,
} from '@/lib/admin-api';

const API_BASE = 'http://localhost:8000/api';

function mockFetchResponse(status: number, body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => body,
    } as Response)
  );
}

function lastFetchCall() {
  const fetchMock = vi.mocked(fetch);
  return fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
}

const service = {
  id: 1,
  title: 'Web Development',
  description: 'Custom websites',
  icon: 'fa-solid fa-code',
  is_featured: true,
  sort_order: 0,
  created_at: null,
  updated_at: null,
};

const teamMember = {
  id: 1,
  name: 'John Doe',
  role: 'Developer',
  bio: null,
  photo_url: null,
  social_links: null,
  sort_order: 0,
  created_at: null,
  updated_at: null,
};

const pricingPlan = {
  id: 1,
  name: 'Starter',
  price: 99,
  interval: 'monthly',
  description: null,
  is_popular: false,
  is_published: true,
  cta_text: 'Get Started',
  sort_order: 0,
  features: [],
  created_at: null,
  updated_at: null,
};

const page = {
  id: 1,
  title: 'Home',
  slug: 'home',
  hero_heading: null,
  hero_subtext: null,
  sections: null,
  is_published: true,
  sort_order: 0,
  created_at: null,
  updated_at: null,
};

describe('admin-api CRUD functions', () => {
  beforeEach(() => {
    localStorage.clear();
    setToken('test-token');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('services', () => {
    it('fetchServices GETs /services', async () => {
      mockFetchResponse(200, { data: [service] });
      const result = await fetchServices();
      const [url] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/services`);
      expect(result.data).toEqual([service]);
    });

    it('createService POSTs to /services with JSON body', async () => {
      mockFetchResponse(200, { data: service });
      const payload = { title: 'Web Development', description: 'x', icon: 'fa-code' };
      await createService(payload);
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/services`);
      expect(options?.method).toBe('POST');
      expect(JSON.parse(String(options?.body))).toEqual(payload);
    });

    it('updateService PUTs to /services/{id}', async () => {
      mockFetchResponse(200, { data: service });
      await updateService(1, { title: 'Renamed' });
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/services/1`);
      expect(options?.method).toBe('PUT');
      expect(JSON.parse(String(options?.body))).toEqual({ title: 'Renamed' });
    });

    it('deleteService DELETEs /services/{id}', async () => {
      mockFetchResponse(200, { message: 'Deleted' });
      await deleteService(1);
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/services/1`);
      expect(options?.method).toBe('DELETE');
    });

    it('reorderServices POSTs ids to /services/reorder', async () => {
      mockFetchResponse(200, { data: { message: 'Reorder successful' } });
      await reorderServices([2, 1]);
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/services/reorder`);
      expect(options?.method).toBe('POST');
      expect(JSON.parse(String(options?.body))).toEqual({ ids: [2, 1] });
    });
  });

  describe('team members', () => {
    it('fetchTeamMembers GETs /team', async () => {
      mockFetchResponse(200, { data: [teamMember] });
      const result = await fetchTeamMembers();
      const [url] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/team`);
      expect(result.data).toEqual([teamMember]);
    });

    it('reorderTeamMembers POSTs ids to /team/reorder', async () => {
      mockFetchResponse(200, { data: { message: 'Reorder successful' } });
      await reorderTeamMembers([3, 1, 2]);
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/team/reorder`);
      expect(JSON.parse(String(options?.body))).toEqual({ ids: [3, 1, 2] });
    });
  });

  describe('pricing plans', () => {
    it('fetchPricingPlans GETs /pricing-plans', async () => {
      mockFetchResponse(200, { data: [pricingPlan] });
      const result = await fetchPricingPlans();
      const [url] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/pricing-plans`);
      expect(result.data).toEqual([pricingPlan]);
    });

    it('fetchAdminPricingPlans GETs /admin/pricing-plans', async () => {
      mockFetchResponse(200, { data: [pricingPlan] });
      await fetchAdminPricingPlans();
      const [url] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/admin/pricing-plans`);
    });

    it('createPricingPlan POSTs to /pricing-plans with features', async () => {
      mockFetchResponse(200, { data: pricingPlan });
      const payload = { name: 'Starter', price: 99, interval: 'monthly', features: [] };
      await createPricingPlan(payload);
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/pricing-plans`);
      expect(options?.method).toBe('POST');
      expect(JSON.parse(String(options?.body))).toEqual(payload);
    });

    it('updatePricingPlan PUTs to /pricing-plans/{id}', async () => {
      mockFetchResponse(200, { data: pricingPlan });
      await updatePricingPlan(1, { price: 149 });
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/pricing-plans/1`);
      expect(options?.method).toBe('PUT');
      expect(JSON.parse(String(options?.body))).toEqual({ price: 149 });
    });

    it('deletePricingPlan DELETEs /pricing-plans/{id}', async () => {
      mockFetchResponse(200, { message: 'Deleted' });
      await deletePricingPlan(1);
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/pricing-plans/1`);
      expect(options?.method).toBe('DELETE');
    });

    it('reorderPricingPlans POSTs ids to /pricing-plans/reorder', async () => {
      mockFetchResponse(200, { data: { message: 'Reorder successful' } });
      await reorderPricingPlans([1, 2]);
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/pricing-plans/reorder`);
      expect(JSON.parse(String(options?.body))).toEqual({ ids: [1, 2] });
    });
  });

  describe('pages', () => {
    it('fetchAdminPages GETs /admin/pages', async () => {
      mockFetchResponse(200, { data: [page] });
      const result = await fetchAdminPages();
      const [url] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/admin/pages`);
      expect(result.data).toEqual([page]);
    });

    it('createPage POSTs to /pages', async () => {
      mockFetchResponse(200, { data: page });
      await createPage({ title: 'Home', slug: 'home' });
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/pages`);
      expect(options?.method).toBe('POST');
      expect(JSON.parse(String(options?.body))).toEqual({ title: 'Home', slug: 'home' });
    });

    it('updatePage PUTs to /pages/{id}', async () => {
      mockFetchResponse(200, { data: page });
      await updatePage(1, { is_published: false });
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/pages/1`);
      expect(options?.method).toBe('PUT');
      expect(JSON.parse(String(options?.body))).toEqual({ is_published: false });
    });

    it('deletePage DELETEs /pages/{id}', async () => {
      mockFetchResponse(200, { message: 'Deleted' });
      await deletePage(1);
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/pages/1`);
      expect(options?.method).toBe('DELETE');
    });

    it('reorderPages POSTs ids to /admin/pages/reorder', async () => {
      mockFetchResponse(200, { data: { message: 'Reorder successful' } });
      await reorderPages([1, 2, 3]);
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/admin/pages/reorder`);
      expect(JSON.parse(String(options?.body))).toEqual({ ids: [1, 2, 3] });
    });
  });

  describe('error handling', () => {
    it('throws UnauthorizedError and clears token on 401', async () => {
      mockFetchResponse(401, { message: 'Unauthenticated.' });
      await expect(fetchServices()).rejects.toBeInstanceOf(UnauthorizedError);
      expect(clearToken()).toBeUndefined();
      expect(localStorage.getItem('admin_token')).toBeNull();
    });

    it('throws validation error object on 422 with field errors', async () => {
      mockFetchResponse(422, {
        message: 'The given data was invalid.',
        errors: { title: ['The title field is required.'] },
      });
      await expect(createService({ title: '' } as never)).rejects.toMatchObject({
        status: 422,
        errors: { title: ['The title field is required.'] },
      });
    });

    it('throws generic error with server message on 500', async () => {
      mockFetchResponse(500, { message: 'Server exploded' });
      await expect(fetchServices()).rejects.toMatchObject({
        status: 500,
        message: 'Server exploded',
      });
    });
  });
});
