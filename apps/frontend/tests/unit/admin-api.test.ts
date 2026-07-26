import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getToken, setToken, clearToken, isAuthenticated, UnauthorizedError } from '@/lib/admin-api';

describe('admin-api utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getToken', () => {
    it('returns null when localStorage is empty', () => {
      expect(getToken()).toBeNull();
    });

    it('returns token when set', () => {
      localStorage.setItem('admin_token', 'test-token-123');
      expect(getToken()).toBe('test-token-123');
    });
  });

  describe('setToken', () => {
    it('stores token in localStorage', () => {
      setToken('my-token');
      expect(localStorage.getItem('admin_token')).toBe('my-token');
    });

    it('overwrites existing token', () => {
      setToken('old-token');
      setToken('new-token');
      expect(localStorage.getItem('admin_token')).toBe('new-token');
    });
  });

  describe('clearToken', () => {
    it('removes token from localStorage', () => {
      localStorage.setItem('admin_token', 'to-be-cleared');
      clearToken();
      expect(localStorage.getItem('admin_token')).toBeNull();
    });

    it('does not throw when no token exists', () => {
      expect(() => clearToken()).not.toThrow();
    });
  });

  describe('isAuthenticated', () => {
    it('returns false when no token', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('returns true when token exists', () => {
      localStorage.setItem('admin_token', 'valid-token');
      expect(isAuthenticated()).toBe(true);
    });
  });

  describe('UnauthorizedError', () => {
    it('has correct name', () => {
      const error = new UnauthorizedError();
      expect(error.name).toBe('UnauthorizedError');
    });

    it('has correct message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Unauthorized');
    });

    it('is an instance of Error', () => {
      const error = new UnauthorizedError();
      expect(error).toBeInstanceOf(Error);
    });
  });
});
