'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PricingPlanData, PricingPlanFeatureData, UnauthorizedError, createPricingPlan, deletePricingPlan, fetchAdminPricingPlans, reorderPricingPlans, updatePricingPlan } from '@/lib/admin-api';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface FeatureRow {
  description: string;
  is_included: boolean;
  sort_order: number;
  _key: number;
}

let featureKeyCounter = 0;
function nextKey() { return ++featureKeyCounter; }

const EMPTY_FEATURE = (): FeatureRow => ({ description: '', is_included: true, sort_order: 0, _key: nextKey() });

export default function AdminPricingPlansPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [plans, setPlans] = useState<PricingPlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PricingPlanData> | null>(null);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PricingPlanData | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  async function load() {
    try {
      const res = await fetchAdminPricingPlans();
      setPlans(res.data);
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function moveItem(index: number, direction: 'up' | 'down') {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= plans.length) return;
    const newItems = [...plans];
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setPlans(newItems);
    try {
      await reorderPricingPlans(newItems.map(i => i.id));
      showToast('Reordered.', 'success');
    } catch (e: any) {
      showToast('Reorder failed', 'error');
      await load();
    }
  }

  function startEdit(plan: Partial<PricingPlanData>) {
    setEditing(plan);
    if (plan.features && plan.features.length > 0) {
      setFeatures(plan.features.map((f) => ({ description: f.description, is_included: f.is_included, sort_order: f.sort_order, _key: nextKey() })));
    } else {
      setFeatures([EMPTY_FEATURE()]);
    }
  }

  function addFeature() {
    setFeatures([...features, { ...EMPTY_FEATURE(), sort_order: features.length }]);
  }

  function removeFeature(key: number) {
    setFeatures(features.filter((f) => f._key !== key));
  }

  function updateFeature(key: number, field: keyof FeatureRow, value: string | boolean | number) {
    setFeatures(features.map((f) => f._key === key ? { ...f, [field]: value } : f));
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...editing,
        features: features.map((f, i) => ({
          description: f.description,
          is_included: f.is_included,
          sort_order: f.sort_order ?? i,
        })),
      };
      if (editing.id) {
        await updatePricingPlan(editing.id, payload);
        showToast('Saved.', 'success');
      } else {
        await createPricingPlan(payload);
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
      await deletePricingPlan(deleteTarget.id);
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
          <h1 className="text-2xl font-bold">Pricing Plans</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage pricing plans and features displayed on the public site.
          </p>
        </div>
        <Button onClick={() => { setEditing({ name: '', price: 0, interval: 'monthly', description: '', cta_text: 'Get Started', is_popular: false, is_published: false }); setFeatures([EMPTY_FEATURE()]); setValidationErrors({}); }}>
          New Plan
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead>Popular</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : plans.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No pricing plans yet. Create your first one.</TableCell></TableRow>
              ) : plans.map((p, index) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>${p.price.toFixed(2)}</TableCell>
                  <TableCell className="text-xs capitalize">{p.interval}</TableCell>
                  <TableCell>{p.is_popular ? <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Most Popular</span> : '-'}</TableCell>
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
                      <button onClick={() => moveItem(index, 'down')} className={index === plans.length - 1 ? 'opacity-50 pointer-events-none' : ''} aria-label="Move down">
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(p)}>Edit</Button>
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
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &ldquo;{deleteTarget?.name}&rdquo;? This cannot be undone.
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
            <CardHeader><CardTitle>{editing.id ? 'Edit Plan' : 'New Plan'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input className={validationErrors['name'] ? 'border-red-500' : ''} value={editing.name || ''} onChange={(e) => { setEditing({ ...editing, name: e.target.value }); setValidationErrors((prev) => { const n = { ...prev }; delete n['name']; return n; }); }} />{validationErrors['name'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['name']}</p>}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Price</Label><Input className={validationErrors['price'] ? 'border-red-500' : ''} type="number" step="0.01" min="0" value={editing.price ?? ''} onChange={(e) => { setEditing({ ...editing, price: parseFloat(e.target.value) || 0 }); setValidationErrors((prev) => { const n = { ...prev }; delete n['price']; return n; }); }} />{validationErrors['price'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['price']}</p>}</div>
                  <div className="space-y-2">
                    <Label>Interval</Label>
                    <select className={`flex h-10 w-full rounded-md border ${validationErrors['interval'] ? 'border-red-500' : 'border-input'} bg-background px-3 py-2 text-sm`} value={editing.interval || 'monthly'} onChange={(e) => { setEditing({ ...editing, interval: e.target.value }); setValidationErrors((prev) => { const n = { ...prev }; delete n['interval']; return n; }); }}>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="one-time">One-time</option>
                    </select>
                    {validationErrors['interval'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['interval']}</p>}
                  </div>
                </div>
                <div className="space-y-2"><Label>Description</Label><textarea className={`flex h-20 w-full rounded-md border ${validationErrors['description'] ? 'border-red-500' : 'border-input'} bg-transparent px-3 py-2 text-sm shadow-sm`} value={editing.description || ''} onChange={(e) => { setEditing({ ...editing, description: e.target.value }); setValidationErrors((prev) => { const n = { ...prev }; delete n['description']; return n; }); }} />{validationErrors['description'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['description']}</p>}</div>
                <div className="space-y-2"><Label>CTA Text</Label><Input className={validationErrors['cta_text'] ? 'border-red-500' : ''} value={editing.cta_text || ''} onChange={(e) => { setEditing({ ...editing, cta_text: e.target.value }); setValidationErrors((prev) => { const n = { ...prev }; delete n['cta_text']; return n; }); }} />{validationErrors['cta_text'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['cta_text']}</p>}</div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="popular" checked={editing.is_popular || false} onChange={(e) => setEditing({ ...editing, is_popular: e.target.checked })} className="h-4 w-4" />
                    <Label htmlFor="popular">Most Popular</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="published" checked={editing.is_published || false} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} className="h-4 w-4" />
                    <Label htmlFor="published">Published</Label>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Features</Label>
                    <Button variant="outline" size="sm" onClick={addFeature} type="button">+ Add Feature</Button>
                  </div>
                  {features.map((f, i) => (
                    <div key={f._key} className="flex items-center gap-2 rounded-md border p-2">
                      <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                      <Input
                        className="flex-1"
                        placeholder="Feature description"
                        value={f.description}
                        onChange={(e) => updateFeature(f._key, 'description', e.target.value)}
                      />
                      <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                        <input type="checkbox" checked={f.is_included} onChange={(e) => updateFeature(f._key, 'is_included', e.target.checked)} className="h-3.5 w-3.5" />
                        Included
                      </label>
                      <Button variant="ghost" size="sm" onClick={() => removeFeature(f._key)} className="text-red-500">x</Button>
                    </div>
                  ))}
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
