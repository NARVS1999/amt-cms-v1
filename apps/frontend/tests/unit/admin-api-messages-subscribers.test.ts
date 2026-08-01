import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setToken,
  fetchThemeSettings,
  updateThemeSettings,
  fetchAdminStats,
  fetchMessages,
  markMessageRead,
  deleteMessage,
  fetchSubscribers,
  deleteSubscriber,
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

const message = {
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello, I need help.',
  read_at: null,
  created_at: '2026-07-27T00:00:00.000000Z',
  updated_at: '2026-07-27T00:00:00.000000Z',
};

const subscriber = {
  id: 1,
  email: 'sub@example.com',
  subscribed_at: '2026-07-27T00:00:00.000000Z',
  created_at: '2026-07-27T00:00:00.000000Z',
  updated_at: '2026-07-27T00:00:00.000000Z',
};

describe('admin-api theme, stats, messages & subscribers functions', () => {
  beforeEach(() => {
    localStorage.clear();
    setToken('test-token');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('theme settings', () => {
    it('fetchThemeSettings GETs /admin/theme', async () => {
      mockFetchResponse(200, { data: { primary_color: '#123456' } });
      const result = await fetchThemeSettings();
      const [url] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/admin/theme`);
      expect(result.data).toEqual({ primary_color: '#123456' });
    });

    it('updateThemeSettings PUTs partial settings to /admin/theme', async () => {
      mockFetchResponse(200, { data: { primary_color: '#123456' } });
      await updateThemeSettings({ primary_color: '#123456' });
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/admin/theme`);
      expect(options?.method).toBe('PUT');
      expect(JSON.parse(String(options?.body))).toEqual({ primary_color: '#123456' });
    });
  });

  describe('fetchAdminStats', () => {
    it('GETs /admin/stats and returns plain stats object', async () => {
      const stats = {
        services: 4,
        team_members: 2,
        blog_posts: 5,
        pricing_plans: 3,
        pages: 1,
        unread_messages: 2,
        subscribers: 10,
      };
      mockFetchResponse(200, stats);
      const result = await fetchAdminStats();
      const [url] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/admin/stats`);
      expect(result).toEqual(stats);
    });
  });

  describe('messages', () => {
    it('fetchMessages GETs /admin/messages', async () => {
      mockFetchResponse(200, { data: [message] });
      const result = await fetchMessages();
      const [url] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/admin/messages`);
      expect(result.data).toEqual([message]);
    });

    it('markMessageRead PUTs /admin/messages/{id}/read', async () => {
      const readMessage = {
        ...message,
        read_at: '2026-07-27T12:00:00.000000Z',
      };
      mockFetchResponse(200, { data: readMessage });
      const result = await markMessageRead(1);
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/admin/messages/1/read`);
      expect(options?.method).toBe('PUT');
      expect(result.data.read_at).toBeTruthy();
    });

    it('deleteMessage DELETEs /admin/messages/{id}', async () => {
      mockFetchResponse(200, { message: 'Deleted' });
      await deleteMessage(1);
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/admin/messages/1`);
      expect(options?.method).toBe('DELETE');
    });

    it('fetchMessages throws UnauthorizedError on 401 and clears token', async () => {
      mockFetchResponse(401, { message: 'Unauthenticated.' });
      await expect(fetchMessages()).rejects.toBeInstanceOf(UnauthorizedError);
      expect(localStorage.getItem('admin_token')).toBeNull();
    });
  });

  describe('subscribers', () => {
    it('fetchSubscribers GETs /admin/subscribers', async () => {
      mockFetchResponse(200, { data: [subscriber] });
      const result = await fetchSubscribers();
      const [url] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/admin/subscribers`);
      expect(result.data).toEqual([subscriber]);
    });

    it('deleteSubscriber DELETEs /admin/subscribers/{id}', async () => {
      mockFetchResponse(200, { message: 'Deleted' });
      await deleteSubscriber(1);
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/admin/subscribers/1`);
      expect(options?.method).toBe('DELETE');
    });
  });
});
