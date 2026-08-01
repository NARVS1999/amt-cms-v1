'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageData, UnauthorizedError, createPage, deletePage, fetchAdminPages, reorderPages, updatePage } from '@/lib/admin-api';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

const EXAMPLE_SECTIONS = [
  {
    type: 'hero',
    heading: 'Welcome to Our Agency',
    content: 'We deliver premium digital marketing solutions that drive real results.',
  },
  {
    type: 'features',
    heading: 'What We Offer',
    content: 'SEO strategy, performance marketing, and modern web development.',
  },
  {
    type: 'content',
    heading: 'Our Process',
    content: 'We combine data-driven insights with creative execution to deliver measurable results.',
    image: '',
  },
  {
    type: 'cta',
    heading: 'Ready to Grow?',
    content: "Let's build something great together.",
  },
];

export default function AdminPagesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PageData> | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PageData | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  async function load() {
    try {
      const res = await fetchAdminPages();
      // Parse sections from JSON string if needed
      const parsed = res.data.map((page) => ({
        ...page,
        sections: typeof page.sections === 'string' ? JSON.parse(page.sections) : page.sections,
      }));
      setPages(parsed);
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function moveItem(index: number, direction: 'up' | 'down') {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= pages.length) return;
    const newItems = [...pages];
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setPages(newItems);
    try {
      await reorderPages(newItems.map(i => i.id));
      showToast('Reordered.', 'success');
    } catch (e: any) {
      showToast('Reorder failed', 'error');
      await load();
    }
  }

  function startEdit(page: Partial<PageData>) {
    setEditing(page);
    setValidationErrors({});
    const text = page.sections ? JSON.stringify(page.sections, null, 2) : '';
    setJsonText(text);
    setJsonError(null);
  }

  function handleJsonChange(value: string) {
    setJsonText(value);
    if (!value.trim()) {
      setJsonError(null);
      setEditing((prev) => prev ? { ...prev, sections: null } : null);
      return;
    }
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) {
        setJsonError('Sections must be an array (use [...])');
      } else {
        setJsonError(null);
        setEditing((prev) => prev ? { ...prev, sections: parsed } : null);
      }
    } catch {
      setJsonError('Invalid JSON — check for missing commas, quotes, or brackets');
    }
  }

  function loadExample() {
    const text = JSON.stringify(EXAMPLE_SECTIONS, null, 2);
    setJsonText(text);
    setJsonError(null);
    setEditing((prev) => prev ? { ...prev, sections: EXAMPLE_SECTIONS } : null);
  }

  async function handleSave() {
    if (!editing) return;
    if (jsonError) {
      setError('Please fix the JSON error before saving');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...editing };
      if (editing.sections && Array.isArray(editing.sections)) {
        payload.sections = JSON.stringify(editing.sections) as any;
      }
      if (editing.id) {
        await updatePage(editing.id, payload);
        showToast('Saved.', 'success');
      } else {
        await createPage(payload);
        showToast('Created.', 'success');
      }
      setEditing(null);
      await load();
    } catch (e: any) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
      else if (e.status === 422) {
        const errors: Record<string, string> = {};
        for (const field of Object.keys(e.errors || {})) {
          errors[field] = e.errors[field][0];
        }
        setValidationErrors(errors);
      } else { setError(e?.message || 'Save failed'); showToast('Save failed', 'error'); }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deletePage(deleteTarget.id);
      setDeleteTarget(null);
      showToast('Deleted.', 'success');
      await load();
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
      else { setError((e as any)?.message || 'Delete failed'); showToast('Delete failed', 'error'); }
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Controls your homepage content. The first published page appears on your public site.
          </p>
        </div>
        <Button onClick={() => { startEdit({ title: '', slug: '', hero_heading: '', hero_subtext: '', is_published: false }); setValidationErrors({}); }}>
          New Page
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : pages.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No pages yet.</TableCell></TableRow>
              ) : pages.map((p, index) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="font-mono text-xs">{p.slug}</TableCell>
                  <TableCell>
                    <span className={p.is_published ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="w-4 text-center text-xs">{p.sort_order}</span>
                      <button onClick={() => moveItem(index, 'up')} className={index === 0 ? 'opacity-50 pointer-events-none' : ''} aria-label="Move up">
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => moveItem(index, 'down')} className={index === pages.length - 1 ? 'opacity-50 pointer-events-none' : ''} aria-label="Move down">
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(p)}>Edit</Button>
                      {p.is_published && (
                        <Button variant="outline" size="sm" onClick={() => window.open('/', '_blank')}>View</Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(p)}>Del</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {error && (
        <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.title}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &ldquo;{deleteTarget?.title}&rdquo;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setEditing(null); setValidationErrors({}); }}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader><CardTitle>{editing.id ? 'Edit Page' : 'New Page'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input className={validationErrors['title'] ? 'border-red-500' : ''} value={editing.title || ''} onChange={(e) => { setEditing({ ...editing, title: e.target.value }); setValidationErrors((prev) => { const n = { ...prev }; delete n['title']; return n; }); }} />{validationErrors['title'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['title']}</p>}</div>
                <div className="space-y-2"><Label>Slug</Label><Input className={validationErrors['slug'] ? 'border-red-500' : ''} value={editing.slug || ''} onChange={(e) => { setEditing({ ...editing, slug: e.target.value }); setValidationErrors((prev) => { const n = { ...prev }; delete n['slug']; return n; }); }} />{validationErrors['slug'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['slug']}</p>}</div>
                <div className="space-y-2"><Label>Hero Heading</Label><Input className={validationErrors['hero_heading'] ? 'border-red-500' : ''} value={editing.hero_heading || ''} onChange={(e) => { setEditing({ ...editing, hero_heading: e.target.value }); setValidationErrors((prev) => { const n = { ...prev }; delete n['hero_heading']; return n; }); }} />{validationErrors['hero_heading'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['hero_heading']}</p>}</div>
                <div className="space-y-2"><Label>Hero Subtext</Label><Input className={validationErrors['hero_subtext'] ? 'border-red-500' : ''} value={editing.hero_subtext || ''} onChange={(e) => { setEditing({ ...editing, hero_subtext: e.target.value }); setValidationErrors((prev) => { const n = { ...prev }; delete n['hero_subtext']; return n; }); }} />{validationErrors['hero_subtext'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['hero_subtext']}</p>}</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Sections (JSON)</Label>
                    <Button variant="outline" size="sm" onClick={loadExample} type="button">
                      Load Example
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Array of content blocks. Types: <code className="rounded bg-muted px-1 py-0.5 font-mono">hero</code>, <code className="rounded bg-muted px-1 py-0.5 font-mono">features</code>, <code className="rounded bg-muted px-1 py-0.5 font-mono">cta</code>, <code className="rounded bg-muted px-1 py-0.5 font-mono">content</code>. Each block uses <code className="rounded bg-muted px-1 py-0.5 font-mono">heading</code>, <code className="rounded bg-muted px-1 py-0.5 font-mono">content</code>, and optionally <code className="rounded bg-muted px-1 py-0.5 font-mono">image</code>.
                  </p>
                  <textarea
                    className={`flex h-40 w-full rounded-md border px-3 py-2 text-sm font-mono shadow-sm ${
                      jsonError ? 'border-red-500 bg-red-50' : 'border-input bg-transparent'
                    }`}
                    value={jsonText}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    placeholder='[{"type": "hero", "heading": "Welcome", "content": "Your message here"}]'
                  />
                  {jsonError && (
                    <p className="text-xs text-red-600">{jsonError}</p>
                  )}
                  {validationErrors['sections'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['sections']}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="published" checked={editing.is_published || false} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} className="h-4 w-4" />
                  <Label htmlFor="published">Published</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => window.open('/', '_blank')}>Preview</Button>
                  <Button variant="outline" onClick={() => { setEditing(null); setValidationErrors({}); }}>Cancel</Button>
                  <Button onClick={handleSave} disabled={saving || !!jsonError}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
