import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setToken,
  removeTeamMemberPhoto,
  uploadTeamMemberPhoto,
  uploadMedia,
  deleteMedia,
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

function makeFile(name = 'photo.jpg', type = 'image/jpeg'): File {
  return new File(['fake-image-bytes'], name, { type });
}

describe('admin-api photo & media upload functions', () => {
  beforeEach(() => {
    localStorage.clear();
    setToken('test-token');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('removeTeamMemberPhoto', () => {
    it('DELETEs /team/{id}/photo', async () => {
      mockFetchResponse(200, { data: { id: 1 } });
      await removeTeamMemberPhoto(7);
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/team/7/photo`);
      expect(options?.method).toBe('DELETE');
    });

    it('throws UnauthorizedError on 401', async () => {
      mockFetchResponse(401, { message: 'Unauthenticated.' });
      await expect(removeTeamMemberPhoto(1)).rejects.toBeInstanceOf(UnauthorizedError);
    });
  });

  describe('uploadTeamMemberPhoto', () => {
    it('POSTs FormData with photo to /team/{id}/photo', async () => {
      mockFetchResponse(200, { data: { id: 1, photo_url: '/media/1' } });
      const file = makeFile();
      await uploadTeamMemberPhoto(7, file);

      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/team/7/photo`);
      expect(options?.method).toBe('POST');
      expect(options?.body).toBeInstanceOf(FormData);
      const formData = options?.body as FormData;
      expect(formData.get('photo')).toBe(file);
    });

    it('sends Authorization header when token present', async () => {
      mockFetchResponse(200, { data: { id: 1 } });
      await uploadTeamMemberPhoto(1, makeFile());
      const [, options] = lastFetchCall();
      const headers = options?.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer test-token');
      expect(headers['Accept']).toBe('application/json');
    });

    it('does not set Content-Type (FormData sets its own boundary)', async () => {
      mockFetchResponse(200, { data: { id: 1 } });
      await uploadTeamMemberPhoto(1, makeFile());
      const [, options] = lastFetchCall();
      const headers = options?.headers as Record<string, string>;
      expect(headers['Content-Type']).toBeUndefined();
    });

    it('throws UnauthorizedError and clears token on 401', async () => {
      mockFetchResponse(401, { message: 'Unauthenticated.' });
      await expect(uploadTeamMemberPhoto(1, makeFile())).rejects.toBeInstanceOf(UnauthorizedError);
      expect(localStorage.getItem('admin_token')).toBeNull();
    });

    it('throws error object with server errors on failure', async () => {
      mockFetchResponse(422, {
        message: 'The photo field is required.',
        errors: { photo: ['The photo field is required.'] },
      });
      await expect(uploadTeamMemberPhoto(1, makeFile())).rejects.toMatchObject({
        status: 422,
        errors: { photo: ['The photo field is required.'] },
      });
    });
  });

  describe('uploadMedia', () => {
    it('POSTs FormData with file to /media', async () => {
      mockFetchResponse(200, { data: { id: 1, url: '/media/1' } });
      const file = makeFile('logo.png', 'image/png');
      await uploadMedia(file);

      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/media`);
      expect(options?.method).toBe('POST');
      const formData = options?.body as FormData;
      expect(formData.get('file')).toBe(file);
    });
  });

  describe('deleteMedia', () => {
    it('DELETEs /media/{id}', async () => {
      mockFetchResponse(200, { message: 'Deleted' });
      await deleteMedia(3);
      const [url, options] = lastFetchCall();
      expect(String(url)).toBe(`${API_BASE}/media/3`);
      expect(options?.method).toBe('DELETE');
    });
  });
});
