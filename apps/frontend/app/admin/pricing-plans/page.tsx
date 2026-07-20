'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PricingPlanData, PricingPlanFeatureData, UnauthorizedError, createPricingPlan, deletePricingPlan, fetchPricingPlans, updatePricingPlan } from '@/lib/admin-api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
  const [plans, setPlans] = useState<PricingPlanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<PricingPlanData> | null>(null);
  const [features, setFeatures] = useState<FeatureRow[]>([]);

  async function load() {
    try {
      const res = await fetchPricingPlans();
      setPlans(res.data);
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

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
      } else {
        await createPricingPlan(payload);
      }
      setEditing(null);
      await load();
    } catch (e: any) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
      else alert(e?.message || 'Save failed');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this pricing plan? This cannot be undone.')) return;
    try {
      await deletePricingPlan(id);
      await load();
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pricing Plans</h1>
        <Button onClick={() => { setEditing({ name: '', price: 0, interval: 'monthly', description: '', cta_text: 'Get Started', is_popular: false, is_published: false }); setFeatures([EMPTY_FEATURE()]); }}>
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
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
              ) : plans.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No pricing plans yet. Create your first one.</TableCell></TableRow>
              ) : plans.map((p) => (
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
                  <TableCell>{p.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => startEdit(p)}>Edit</Button>
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
            <CardHeader><CardTitle>{editing.id ? 'Edit Plan' : 'New Plan'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Price</Label><Input type="number" step="0.01" min="0" value={editing.price ?? ''} onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })} /></div>
                  <div className="space-y-2">
                    <Label>Interval</Label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editing.interval || 'monthly'} onChange={(e) => setEditing({ ...editing, interval: e.target.value })}>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="one-time">One-time</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Description</Label><textarea className="flex h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
                <div className="space-y-2"><Label>CTA Text</Label><Input value={editing.cta_text || ''} onChange={(e) => setEditing({ ...editing, cta_text: e.target.value })} /></div>
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
