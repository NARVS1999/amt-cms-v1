'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { deleteMedia, fetchMedia, MediaData, UnauthorizedError, uploadMedia } from '@/lib/admin-api';
import { Upload, Trash2, Image, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function AdminMediaPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadRef = useRef<AbortController | null>(null);
  const [media, setMedia] = useState<MediaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaData | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const load = useCallback(async (signal: AbortSignal) => {
    try {
      const res = await fetchMedia();
      if (!signal.aborted) {
        setMedia(res.data);
        setLoadError(false);
      }
    } catch (err: any) {
      if (signal.aborted) return;
      if (err instanceof UnauthorizedError) {
        router.push('/admin/login');
        return;
      }
      console.warn('Failed to load media:', err);
      setLoadError(true);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const ac = new AbortController();
    loadRef.current = ac;
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  async function handleRetry() {
    loadRef.current?.abort();
    setLoading(true);
    setLoadError(false);
    const ac = new AbortController();
    loadRef.current = ac;
    await load(ac.signal);
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      await uploadMedia(file);
      setStatusMessage('File uploaded successfully.');
      loadRef.current?.abort();
      const ac = new AbortController();
      loadRef.current = ac;
      await load(ac.signal);
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        router.push('/admin/login');
        return;
      }
      const msg = err?.errors?.file?.[0] || err?.message || 'Upload failed';
      setUploadError(msg);
      setStatusMessage(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMedia(id);
      setStatusMessage('File deleted successfully.');
      loadRef.current?.abort();
      const ac = new AbortController();
      loadRef.current = ac;
      await load(ac.signal);
    } catch (err: any) {
      if (err instanceof UnauthorizedError) {
        router.push('/admin/login');
        return;
      }
      const msg = err?.message || 'Delete failed';
      setStatusMessage(msg);
    } finally {
      setDeleteTarget(null);
    }
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Media Library</h1>
          <Button disabled>Upload File</Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border">
                  <div className="aspect-square animate-pulse bg-muted" />
                  <div className="space-y-2 p-2">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Load error state ──
  if (loadError) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Media Library</h1>
          <Button disabled>Upload File</Button>
        </div>
        <Card>
          <CardContent>
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive" role="alert">
              Could not load media files. Please try again.
            </div>
            <Button className="mt-4" onClick={handleRetry}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Normal state (empty or data) ──
  return (
    <div>
      {/* Screen-reader status announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {statusMessage}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Media Library</h1>
        <div className="flex flex-col items-end gap-2">
          {uploadError && (
            <div
              id="upload-error"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {uploadError}
            </div>
          )}
           <Button disabled={uploading} onClick={() => fileInputRef.current?.click()} aria-label="Upload File">
            <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            aria-describedby={uploadError ? 'upload-error' : undefined}
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
          {media.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Image size={48} className="mb-4 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">No media yet. Upload your first file.</p>
            </div>
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
                    <p className="text-xs text-muted-foreground">{formatSize(item.size)}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.mime_type}</p>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    aria-label={`Delete ${item.file_name}`}
                    className="absolute right-1 top-1 hidden rounded bg-red-600 p-1 text-white group-hover:block"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
      >
        <AlertDialogContent>
          <button
            onClick={() => setDeleteTarget(null)}
            className="absolute right-2 top-2 rounded-sm p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X size={16} aria-hidden="true" />
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteTarget?.file_name}? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
