'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageData, UnauthorizedError, createPage, deletePage, fetchAdminPages, updatePage } from '@/lib/admin-api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PageData> | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

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

  function startEdit(page: Partial<PageData>) {
    setEditing(page);
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
      alert('Please fix the JSON error before saving');
      return;
    }
    try {
      const payload = { ...editing };
      // Backend expects sections as a JSON string, not an object
      if (editing.sections && Array.isArray(editing.sections)) {
        payload.sections = JSON.stringify(editing.sections) as any;
      }
      if (editing.id) {
        await updatePage(editing.id, payload);
      } else {
        await createPage(payload);
      }
      setEditing(null);
      await load();
    } catch (e: any) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
      else alert(e?.message || 'Save failed');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this page? This cannot be undone.')) return;
    try {
      await deletePage(id);
      await load();
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
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
        <Button onClick={() => startEdit({ title: '', slug: '', hero_heading: '', hero_subtext: '', is_published: false })}>
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
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
              ) : pages.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No pages yet.</TableCell></TableRow>
              ) : pages.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell className="font-mono text-xs">{p.slug}</TableCell>
                  <TableCell>
                    <span className={p.is_published ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                      {p.is_published ? 'Published' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(p)}>Edit</Button>
                      {p.is_published && (
                        <Button variant="outline" size="sm" onClick={() => window.open('/', '_blank')}>View</Button>
                      )}
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>Del</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditing(null)}>
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardHeader><CardTitle>{editing.id ? 'Edit Page' : 'New Page'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
                <div className="space-y-2"><Label>Hero Heading</Label><Input value={editing.hero_heading || ''} onChange={(e) => setEditing({ ...editing, hero_heading: e.target.value })} /></div>
                <div className="space-y-2"><Label>Hero Subtext</Label><Input value={editing.hero_subtext || ''} onChange={(e) => setEditing({ ...editing, hero_subtext: e.target.value })} /></div>
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
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="published" checked={editing.is_published || false} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} className="h-4 w-4" />
                  <Label htmlFor="published">Published</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => window.open('/', '_blank')}>Preview</Button>
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={!!jsonError}>Save</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
