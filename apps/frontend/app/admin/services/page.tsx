'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ServiceData, UnauthorizedError, createService, deleteService, fetchServices, updateService } from '@/lib/admin-api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<ServiceData> | null>(null);

  async function load() {
    try {
      const res = await fetchServices();
      setServices(res.data);
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!editing) return;
    try {
      if (editing.id) {
        await updateService(editing.id, editing);
      } else {
        await createService(editing);
      }
      setEditing(null);
      await load();
    } catch (e: any) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
      else alert(e?.message || 'Save failed');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this service? This cannot be undone.')) return;
    try {
      await deleteService(id);
      await load();
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Services</h1>
        <Button onClick={() => setEditing({ title: '', description: '', icon: 'fa-solid fa-code', is_featured: false })}>
          New Service
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
              ) : services.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No services yet.</TableCell></TableRow>
              ) : services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell className="font-mono text-xs">{s.icon}</TableCell>
                  <TableCell>{s.is_featured ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{s.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditing(s)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)}>Del</Button>
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
            <CardHeader><CardTitle>{editing.id ? 'Edit Service' : 'New Service'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea className="flex h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Icon (Font Awesome class)</Label>
                  <Input value={editing.icon || ''} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={editing.is_featured || false} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} className="h-4 w-4" />
                  <Label htmlFor="featured">Featured</Label>
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
