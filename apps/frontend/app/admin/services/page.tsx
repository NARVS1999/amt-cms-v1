'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ServiceData, UnauthorizedError, createService, deleteService, fetchServices, reorderServices, updateService } from '@/lib/admin-api';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function AdminServicesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<ServiceData> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ServiceData | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  async function load() {
    try {
      const res = await fetchServices();
      setServices(res.data);
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function moveItem(index: number, direction: 'up' | 'down') {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= services.length) return;
    const newItems = [...services];
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setServices(newItems);
    try {
      await reorderServices(newItems.map(i => i.id));
      showToast('Reordered.', 'success');
    } catch (e: any) {
      showToast('Reorder failed', 'error');
      await load();
    }
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      if (editing.id) {
        await updateService(editing.id, editing);
        showToast('Saved.', 'success');
      } else {
        await createService(editing);
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
      await deleteService(deleteTarget.id);
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
        <h1 className="text-2xl font-bold">Services</h1>
        <Button onClick={() => { setEditing({ title: '', description: '', icon: 'fa-solid fa-code', is_featured: false }); setValidationErrors({}); }}>
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
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : services.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No services yet.</TableCell></TableRow>
              ) : services.map((s, index) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.title}</TableCell>
                  <TableCell className="font-mono text-xs">{s.icon}</TableCell>
                  <TableCell>{s.is_featured ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="w-4 text-center text-xs">{s.sort_order}</span>
                      <button onClick={() => moveItem(index, 'up')} className={index === 0 ? 'opacity-50 pointer-events-none' : ''} aria-label="Move up">
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => moveItem(index, 'down')} className={index === services.length - 1 ? 'opacity-50 pointer-events-none' : ''} aria-label="Move down">
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditing(s)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(s)}>Del</Button>
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
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardHeader><CardTitle>{editing.id ? 'Edit Service' : 'New Service'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input className={validationErrors['title'] ? 'border-red-500' : ''} value={editing.title || ''} onChange={(e) => { setEditing({ ...editing, title: e.target.value }); setValidationErrors((prev) => { const n = { ...prev }; delete n['title']; return n; }); }} />
                  {validationErrors['title'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['title']}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea className={`flex h-20 w-full rounded-md border ${validationErrors['description'] ? 'border-red-500' : 'border-input'} bg-transparent px-3 py-2 text-sm shadow-sm`} value={editing.description || ''} onChange={(e) => { setEditing({ ...editing, description: e.target.value }); setValidationErrors((prev) => { const n = { ...prev }; delete n['description']; return n; }); }} />
                  {validationErrors['description'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['description']}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Icon (Font Awesome class)</Label>
                  <Input className={validationErrors['icon'] ? 'border-red-500' : ''} value={editing.icon || ''} onChange={(e) => { setEditing({ ...editing, icon: e.target.value }); setValidationErrors((prev) => { const n = { ...prev }; delete n['icon']; return n; }); }} />
                  {validationErrors['icon'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['icon']}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={editing.is_featured || false} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} className="h-4 w-4" />
                  <Label htmlFor="featured">Featured</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setEditing(null); setValidationErrors({}); }}>Cancel</Button>
                  <Button onClick={handleSave} disabled={saving}>
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
