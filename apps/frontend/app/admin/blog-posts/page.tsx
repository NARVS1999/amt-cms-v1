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
  fetchBlogPosts,
  getToken,
  updateBlogPost,
} from '@/lib/admin-api';
import { ImageIcon } from 'lucide-react';

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

export default function AdminBlogPostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<BlogPostData> | null>(null);
  const [saving, setSaving] = useState(false);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [lastAutoSave, setLastAutoSave] = useState<string | null>(null);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPostData | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const lastSavedContentRef = useRef<string>('');
  const autoSaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function load() {
    try {
      const res = await fetchBlogPosts();
      setPosts(res.data);
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

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
              setLastAutoSave('Draft saved');
              setTimeout(() => setLastAutoSave(null), 2000);
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
  }

  function openEdit(post: BlogPostData) {
    setEditing({ ...post });
    lastSavedContentRef.current = post.content || '';
    setFeaturedImageFile(null);
    setFeaturedImagePreview(post.featured_image_url);
    setSlugManuallyEdited(true);
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

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File must be under 2MB.');
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
    try {
      const token = getToken();

      if (featuredImageFile) {
        const formData = new FormData();
        formData.append('title', editing.title || '');
        formData.append('slug', editing.slug || '');
        formData.append('content', editing.content || '');
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
        if (!res.ok) { const err = await res.json(); alert(err.message || 'Save failed'); return; }
      } else {
        if (editing.id) {
          await updateBlogPost(editing.id, editing);
        } else {
          await createBlogPost(editing);
        }
      }

      setEditing(null);
      await load();
      setSaveToast('Saved.');
      setTimeout(() => setSaveToast(null), 2000);
    } catch (e: unknown) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
      else alert((e as { message?: string })?.message || 'Save failed');
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

  function handleClose() {
    setEditing(null);
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    setFeaturedImageFile(null);
    setFeaturedImagePreview(null);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
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
                <TableHead>Published At</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    No posts yet. Create your first one.
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">{post.title}</TableCell>
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

      {(lastAutoSave || saveToast) && (
        <div className="fixed bottom-4 right-4 z-50 rounded-md bg-green-600 px-3 py-2 text-sm text-white shadow-lg">
          {saveToast || lastAutoSave}
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
              {lastAutoSave && (
                <span className="text-xs text-green-600">{lastAutoSave}</span>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editing.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={editing.slug || ''}
                    onChange={(e) => handleSlugChange(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Content</Label>
                  <BlogEditor
                    value={editing.content || ''}
                    onChange={(content) => setEditing((prev) => (prev ? { ...prev, content } : prev))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Excerpt</Label>
                  <textarea
                    className="flex h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    value={editing.excerpt || ''}
                    onChange={(e) => setEditing((prev) => (prev ? { ...prev, excerpt: e.target.value } : prev))}
                    maxLength={300}
                  />
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

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
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
