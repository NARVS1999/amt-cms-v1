import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  login,
  fetchMe,
  logout,
  forgotPassword,
  setToken,
  getToken,
  clearToken,
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

describe('admin-api auth functions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('POSTs credentials to /admin/login and returns token + user', async () => {
      const payload = { token: 'abc123', user: { id: 1, name: 'Admin', email: 'admin@example.com' } };
      mockFetchResponse(200, { data: payload });

      const result = await login('admin@example.com', 'secret123', true);

      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/admin/login`);
      expect(options?.method).toBe('POST');
      expect(JSON.parse(String(options?.body))).toEqual({
        email: 'admin@example.com',
        password: 'secret123',
        remember: true,
      });
      expect(result).toEqual(payload);
    });

    it('sends remember=false by default', async () => {
      mockFetchResponse(200, { data: { token: 't', user: { id: 1, name: 'A', email: 'a@b.c' } } });

      await login('a@b.c', 'pw');

      const [, options] = lastFetchCall();
      expect(JSON.parse(String(options?.body))).toEqual({ email: 'a@b.c', password: 'pw', remember: false });
    });

    it('throws UnauthorizedError and clears token on 401', async () => {
      setToken('expired-token');
      mockFetchResponse(401, { message: 'Unauthenticated.' });

      await expect(login('a@b.c', 'pw')).rejects.toBeInstanceOf(UnauthorizedError);
      expect(getToken()).toBeNull();
    });

    it('throws validation error object on 422', async () => {
      mockFetchResponse(422, {
        message: 'The given data was invalid.',
        errors: { email: ['The email field must be a valid email address.'] },
      });

      await expect(login('bad', 'pw')).rejects.toMatchObject({
        status: 422,
        errors: { email: ['The email field must be a valid email address.'] },
      });
    });
  });

  describe('fetchMe', () => {
    it('GETs /me and returns the user', async () => {
      mockFetchResponse(200, { user: { id: 1, name: 'Admin', email: 'admin@example.com' } });

      const result = await fetchMe();

      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/me`);
      expect(options?.method).toBeUndefined();
      expect(result).toEqual({ user: { id: 1, name: 'Admin', email: 'admin@example.com' } });
    });
  });

  describe('logout', () => {
    it('POSTs to /logout and clears the token', async () => {
      setToken('some-token');
      mockFetchResponse(200, { message: 'Logged out' });

      await logout();

      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/logout`);
      expect(options?.method).toBe('POST');
      expect(getToken()).toBeNull();
    });
  });

  describe('forgotPassword', () => {
    it('POSTs the email to /forgot-password', async () => {
      mockFetchResponse(200, { message: 'Reset link sent', token: 'local-token' });

      const result = await forgotPassword('admin@example.com');

      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/forgot-password`);
      expect(options?.method).toBe('POST');
      expect(JSON.parse(String(options?.body))).toEqual({ email: 'admin@example.com' });
      expect(result).toEqual({ message: 'Reset link sent', token: 'local-token' });
    });

    it('propagates server error message on failure', async () => {
      mockFetchResponse(422, {
        message: 'The given data was invalid.',
        errors: { email: ['We could not find a user with that email address.'] },
      });

      await expect(forgotPassword('missing@example.com')).rejects.toMatchObject({
        status: 422,
        errors: { email: ['We could not find a user with that email address.'] },
      });
    });
  });

  describe('request auth header', () => {
    it('attaches Bearer token when present', async () => {
      setToken('bearer-token');
      mockFetchResponse(200, { data: [] });

      await fetchMe();

      const [, options] = lastFetchCall();
      const headers = options?.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer bearer-token');
    });

    it('omits Authorization header when no token', async () => {
      mockFetchResponse(200, { data: [] });

      await fetchMe();

      const [, options] = lastFetchCall();
      const headers = options?.headers as Record<string, string>;
      expect(headers['Authorization']).toBeUndefined();
    });
  });
});
