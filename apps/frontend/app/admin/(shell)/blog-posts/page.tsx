'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BlogEditor } from '@/components/BlogEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import {
  BlogPostData,
  UnauthorizedError,
  createBlogPost,
  deleteBlogPost,
  fetchAdminBlogPosts,
  fetchBlogPost,
  getToken,
  swapBlogPostSortOrder,
  updateBlogPost,
} from '@/lib/admin-api';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { ImageIcon, ChevronUp, ChevronDown } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calcReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(text / 200));
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
}

export default function AdminBlogPostsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<BlogPostData> | null>(null);
  const [saving, setSaving] = useState(false);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPostData | null>(null);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveNow, setAutoSaveNow] = useState<string>('');

  const lastSavedContentRef = useRef<string>('');
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoSaveTimeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    try {
      const res = await fetchAdminBlogPosts();
      setPosts(res.data);
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (autoSaveTimeRef.current) clearInterval(autoSaveTimeRef.current);
    if (lastSavedAt) {
      autoSaveTimeRef.current = setInterval(() => {
        setAutoSaveNow(timeAgo(lastSavedAt));
      }, 30000);
      setAutoSaveNow(timeAgo(lastSavedAt));
    }
    return () => { if (autoSaveTimeRef.current) clearInterval(autoSaveTimeRef.current); };
  }, [lastSavedAt]);

  useEffect(() => {
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);

    if (editing?.id) {
      autoSaveRef.current = setInterval(async () => {
        if (editing.content && editing.content !== lastSavedContentRef.current) {
          try {
            const token = getToken();
            const res = await fetch(`${API_BASE}/blog-posts/${editing.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({ content: editing.content }),
            });
            if (res.ok) {
              lastSavedContentRef.current = editing.content || '';
              setLastSavedAt(new Date());
              setHasUnsavedChanges(false);
              showToast('Draft saved', 'success');
            }
          } catch {
            /* silent */
          }
        }
      }, 30000);
    }

    return () => {
      if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    };
  }, [editing?.id, editing?.content]);

  function openNew() {
    setEditing({ title: '', slug: '', content: '', excerpt: '', is_published: false, published_at: null });
    setFeaturedImageFile(null);
    setFeaturedImagePreview(null);
    setSlugManuallyEdited(false);
    lastSavedContentRef.current = '';
    setLastSavedAt(null);
    setHasUnsavedChanges(false);
  }

  async function openEdit(post: BlogPostData) {
    try {
      const res = await fetchBlogPost(post.slug);
      setEditing({ ...res.data });
      lastSavedContentRef.current = res.data.content || '';
    } catch {
      setEditing({ ...post });
      lastSavedContentRef.current = post.content || '';
    }
    setFeaturedImageFile(null);
    setFeaturedImagePreview(post.featured_image_url);
    setSlugManuallyEdited(true);
    setLastSavedAt(null);
    setHasUnsavedChanges(false);
  }

  function handleTitleChange(title: string) {
    setEditing((prev) => {
      if (!prev) return prev;
      if (!slugManuallyEdited) {
        return { ...prev, title, slug: slugify(title) };
      }
      return { ...prev, title };
    });
  }

  function handleSlugChange(slug: string) {
    setSlugManuallyEdited(true);
    setEditing((prev) => (prev ? { ...prev, slug } : prev));
  }

  function handleContentChange(content: string) {
    setEditing((prev) => {
      if (!prev) return prev;
      const isNew = !prev.id;
      const excerptEmpty = !prev.excerpt;
      const autoExcerpt = isNew && excerptEmpty ? content.replace(/<[^>]*>/g, '').slice(0, 300) : prev.excerpt;
      return { ...prev, content, excerpt: autoExcerpt };
    });
    setHasUnsavedChanges(true);
  }

  function handleExcerptChange(excerpt: string) {
    setEditing((prev) => (prev ? { ...prev, excerpt } : prev));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('File must be under 2MB.');
        e.target.value = '';
        return;
      }
      setFeaturedImageFile(file);
      setFeaturedImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    setValidationErrors({});
    try {
      const token = getToken();

      if (featuredImageFile) {
        const formData = new FormData();
        formData.append('title', editing.title || '');
        formData.append('slug', editing.slug || '');
        if (editing.content) formData.append('content', editing.content);
        if (editing.excerpt) formData.append('excerpt', editing.excerpt);
        formData.append('is_published', editing.is_published ? '1' : '0');
        if (editing.published_at) formData.append('published_at', editing.published_at);
        formData.append('featured_image', featuredImageFile);

        if (editing.id) formData.append('_method', 'PUT');

        const res = await fetch(`${API_BASE}/blog-posts${editing.id ? `/${editing.id}` : ''}`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        });

        if (res.status === 401) { router.push('/admin/login'); return; }
        if (res.status === 422) {
          const err = await res.json();
          const errors: Record<string, string> = {};
          for (const field of Object.keys(err.errors || {})) {
            errors[field] = err.errors[field][0];
          }
          setValidationErrors(errors);
          return;
        }
        if (!res.ok) { const err = await res.json(); setError(err.message || 'Save failed'); return; }
      } else {
        if (editing.id) {
          await updateBlogPost(editing.id, editing);
        } else {
          await createBlogPost(editing);
        }
      }

      setEditing(null);
      setValidationErrors({});
      setLastSavedAt(new Date());
      setHasUnsavedChanges(false);
      await load();
      showToast('Saved.', 'success');
    } catch (e: unknown) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
      else if ((e as any)?.status === 422) {
        const errors: Record<string, string> = {};
        for (const field of Object.keys((e as any).errors || {})) {
          errors[field] = (e as any).errors[field][0];
        }
        setValidationErrors(errors);
      } else setError((e as { message?: string })?.message || 'Save failed');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteBlogPost(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    }
  }

  async function handleSwapSort(id: number, direction: 'up' | 'down') {
    try {
      await swapBlogPostSortOrder(id, direction);
      await load();
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    }
  }

  function handleClose() {
    setEditing(null);
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    setFeaturedImageFile(null);
    setFeaturedImagePreview(null);
    setLastSavedAt(null);
    setHasUnsavedChanges(false);
  }

  const readingTime = editing?.content ? calcReadingTime(editing.content) : 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and manage blog content for your public site.
          </p>
        </div>
        <Button onClick={openNew}>New Blog Post</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Published At</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                    No posts yet. Create your first one.
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post, idx) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      <div>{post.title}</div>
                      {post.excerpt && (
                        <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.excerpt}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">Admin</TableCell>
                    <TableCell>
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          background: post.is_published
                            ? 'var(--color-status-published-bg, #dcfce7)'
                            : 'var(--color-status-draft-bg, #f3f4f6)',
                          color: post.is_published
                            ? 'var(--color-status-published-text, #166534)'
                            : 'var(--color-status-draft-text, #6b7280)',
                        }}
                      >
                        {post.is_published ? 'Published' : 'Draft'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {post.featured_image_url ? (
                        <img
                          src={post.featured_image_url}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                          <ImageIcon size={16} className="text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-0.5">
                        <button
                          className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                          disabled={idx === 0}
                          onClick={() => handleSwapSort(post.id, 'up')}
                          aria-label="Move up"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          className="p-0.5 rounded hover:bg-muted disabled:opacity-30"
                          disabled={idx === posts.length - 1}
                          onClick={() => handleSwapSort(post.id, 'down')}
                          aria-label="Move down"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(post.published_at)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(post.updated_at)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(post)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(post)}>
                          Del
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 py-8" onClick={handleClose}>
          <Card
            className="w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle>{editing.id ? 'Edit Blog Post' : 'New Blog Post'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    className={validationErrors['title'] ? 'border-red-500' : ''}
                    value={editing.title || ''}
                    onChange={(e) => {
                      handleTitleChange(e.target.value);
                      setValidationErrors((prev) => { const n = { ...prev }; delete n['title']; return n; });
                    }}
                  />
                  {validationErrors['title'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['title']}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    className={validationErrors['slug'] ? 'border-red-500' : ''}
                    value={editing.slug || ''}
                    onChange={(e) => {
                      handleSlugChange(e.target.value);
                      setValidationErrors((prev) => { const n = { ...prev }; delete n['slug']; return n; });
                    }}
                  />
                  {validationErrors['slug'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['slug']}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <BlogEditor
                    value={editing.content || ''}
                    onChange={handleContentChange}
                  />
                  {validationErrors['content'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['content']}</p>}
                  <p className="text-xs text-muted-foreground">{readingTime} min read</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <textarea
                    id="excerpt"
                    className={`flex h-20 w-full rounded-md border ${validationErrors['excerpt'] ? 'border-red-500' : 'border-input'} bg-transparent px-3 py-2 text-sm shadow-sm`}
                    value={editing.excerpt || ''}
                    onChange={(e) => {
                      handleExcerptChange(e.target.value);
                      setValidationErrors((prev) => { const n = { ...prev }; delete n['excerpt']; return n; });
                    }}
                    maxLength={300}
                  />
                  {validationErrors['excerpt'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['excerpt']}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Featured Image</Label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-muted-foreground file:mr-2 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:text-primary-foreground"
                  />
                  {featuredImagePreview && (
                    <img
                      src={featuredImagePreview}
                      alt="Preview"
                      className="mt-2 h-24 w-24 rounded object-cover"
                    />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={editing.is_published || false}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setEditing((prev) =>
                        prev ? { ...prev, is_published: checked } : prev
                      );
                    }}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is_published">Published</Label>
                </div>

                {editing.is_published && (
                  <div className="space-y-2">
                    <Label>Published At</Label>
                    <Input
                      type="datetime-local"
                      value={editing.published_at?.slice(0, 16) || ''}
                      onChange={(e) =>
                        setEditing((prev) =>
                          prev ? { ...prev, published_at: e.target.value || null } : prev
                        )
                      }
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {hasUnsavedChanges ? (
                      <span className="text-destructive">Unsaved changes</span>
                    ) : lastSavedAt ? (
                      <span>Last saved: {autoSaveNow || timeAgo(lastSavedAt)}</span>
                    ) : null}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
