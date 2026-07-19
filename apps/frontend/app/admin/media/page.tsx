'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { deleteMedia, fetchMedia, MediaData, UnauthorizedError, uploadMedia } from '@/lib/admin-api';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function AdminMediaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<MediaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function load() {
    try {
      const res = await fetchMedia();
      setMedia(res.data);
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      await uploadMedia(file);
      await load();
    } catch (e: any) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
      else alert(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this file? This cannot be undone.')) return;
    try {
      await deleteMedia(id);
      await load();
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div>
          <Button disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Files</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>Loading...</p>
          ) : media.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              No files yet. Upload your first image.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {media.map((item) => (
                <div key={item.id} className="group relative overflow-hidden rounded-lg border">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={item.thumbnail || item.url}
                      alt={item.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-medium">{item.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>
                      {formatSize(item.size)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="absolute right-1 top-1 hidden rounded bg-red-600 px-2 py-1 text-xs text-white group-hover:block"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
