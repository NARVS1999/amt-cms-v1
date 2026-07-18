'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageData, UnauthorizedError, createPage, deletePage, fetchAdminPages, updatePage } from '@/lib/admin-api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PageData> | null>(null);

  async function load() {
    try {
      const res = await fetchAdminPages();
      setPages(res.data);
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!editing) return;
    try {
      const payload = { ...editing };
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
        <h1 className="text-2xl font-bold">Pages</h1>
        <Button onClick={() => setEditing({ title: '', slug: '', hero_heading: '', hero_subtext: '', is_published: false })}>
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
                      <Button variant="outline" size="sm" onClick={() => setEditing(p)}>Edit</Button>
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
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardHeader><CardTitle>{editing.id ? 'Edit Page' : 'New Page'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Slug</Label><Input value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
                <div className="space-y-2"><Label>Hero Heading</Label><Input value={editing.hero_heading || ''} onChange={(e) => setEditing({ ...editing, hero_heading: e.target.value })} /></div>
                <div className="space-y-2"><Label>Hero Subtext</Label><Input value={editing.hero_subtext || ''} onChange={(e) => setEditing({ ...editing, hero_subtext: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Sections (JSON)</Label>
                  <textarea className="flex h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-sm" value={editing.sections ? JSON.stringify(editing.sections, null, 2) : ''} onChange={(e) => { try { setEditing({ ...editing, sections: JSON.parse(e.target.value) }); } catch { /* allow editing invalid JSON */ } }} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="published" checked={editing.is_published || false} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} className="h-4 w-4" />
                  <Label htmlFor="published">Published</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
                  <Button onClick={handleSave}>Save</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
