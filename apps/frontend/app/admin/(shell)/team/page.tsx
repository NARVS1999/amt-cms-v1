'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TeamMemberData, UnauthorizedError, createTeamMember, deleteTeamMember, fetchTeamMembers, reorderTeamMembers, removeTeamMemberPhoto, updateTeamMember, uploadTeamMemberPhoto } from '@/lib/admin-api';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, User, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function AdminTeamPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [members, setMembers] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<TeamMemberData> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TeamMemberData | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  async function load() {
    try {
      const res = await fetchTeamMembers();
      setMembers(res.data);
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function moveItem(index: number, direction: 'up' | 'down') {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= members.length) return;
    const newItems = [...members];
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setMembers(newItems);
    try {
      await reorderTeamMembers(newItems.map(i => i.id));
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
        await updateTeamMember(editing.id, editing);
        if (photoFile) {
          await uploadTeamMemberPhoto(editing.id, photoFile);
        }
        showToast('Saved.', 'success');
      } else {
        const res = await createTeamMember(editing);
        const newMember = res.data;
        if (photoFile && newMember.id) {
          await uploadTeamMemberPhoto(newMember.id, photoFile);
        }
        showToast('Created.', 'success');
      }
      setEditing(null);
      setPhotoFile(null);
      setPhotoPreview(null);
      await load();
    } catch (e: any) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
      else if (e.status === 422) {
        const errors: Record<string, string> = {};
        for (const field of Object.keys(e.errors || {})) {
          errors[field] = e.errors[field][0];
        }
        setValidationErrors(errors);
      } else setError(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteTeamMember(deleteTarget.id);
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
          <h1 className="text-2xl font-bold">Team Members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your team members displayed on the public site.
          </p>
        </div>
        <Button onClick={() => { setPhotoFile(null); setPhotoPreview(null); setEditing({ name: '', role: '', bio: '', social_links: { linkedin: null, twitter: null } }); setValidationErrors({}); }}>
          New Member
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Bio</TableHead>
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
              ) : members.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No team members yet.</TableCell></TableRow>
              ) : members.map((m, index) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {m.photo_url ? (
                          <img src={m.photo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <User size={14} className="text-muted-foreground" />
                          </div>
                        )}
                        {m.name}
                      </div>
                    </TableCell>
                  <TableCell>{m.role}</TableCell>
                  <TableCell className="text-muted-foreground text-xs line-clamp-1 max-w-[200px]">{m.bio}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="w-4 text-center text-xs">{m.sort_order}</span>
                      <button onClick={() => moveItem(index, 'up')} className={index === 0 ? 'opacity-50 pointer-events-none' : ''} aria-label="Move up">
                        <ArrowUp size={14} />
                      </button>
                      <button onClick={() => moveItem(index, 'down')} className={index === members.length - 1 ? 'opacity-50 pointer-events-none' : ''} aria-label="Move down">
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setPhotoFile(null); setPhotoPreview(null); setEditing(m); }}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(m)}>Del</Button>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setEditing(null); setPhotoFile(null); setPhotoPreview(null); setValidationErrors({}); }}>
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardHeader><CardTitle>{editing.id ? 'Edit Member' : 'New Member'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input className={validationErrors['name'] ? 'border-red-500' : ''} value={editing.name || ''} onChange={(e) => { setEditing({ ...editing, name: e.target.value }); setValidationErrors((prev) => { const n = { ...prev }; delete n['name']; return n; }); }} />{validationErrors['name'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['name']}</p>}</div>
                <div className="space-y-2"><Label>Role</Label><Input className={validationErrors['role'] ? 'border-red-500' : ''} value={editing.role || ''} onChange={(e) => { setEditing({ ...editing, role: e.target.value }); setValidationErrors((prev) => { const n = { ...prev }; delete n['role']; return n; }); }} />{validationErrors['role'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['role']}</p>}</div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <textarea className={`flex h-20 w-full rounded-md border ${validationErrors['bio'] ? 'border-red-500' : 'border-input'} bg-transparent px-3 py-2 text-sm shadow-sm`} value={editing.bio || ''} onChange={(e) => { setEditing({ ...editing, bio: e.target.value }); setValidationErrors((prev) => { const n = { ...prev }; delete n['bio']; return n; }); }} />
                  {validationErrors['bio'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['bio']}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Social Links</Label>
                  <div className="space-y-2">
                    <Input type="url" placeholder="https://linkedin.com/in/username" value={editing.social_links?.linkedin || ''} onChange={(e) => { setEditing({ ...editing, social_links: { ...(editing.social_links || { linkedin: null, twitter: null }), linkedin: e.target.value || null } }); setValidationErrors((prev) => { const n = { ...prev }; delete n['social_links.linkedin']; return n; }); }} />
                    <Input type="url" placeholder="https://twitter.com/username" value={editing.social_links?.twitter || ''} onChange={(e) => { setEditing({ ...editing, social_links: { ...(editing.social_links || { linkedin: null, twitter: null }), twitter: e.target.value || null } }); setValidationErrors((prev) => { const n = { ...prev }; delete n['social_links.twitter']; return n; }); }} />
                  </div>
                  {validationErrors['social_links.linkedin'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['social_links.linkedin']}</p>}
                  {validationErrors['social_links.twitter'] && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{validationErrors['social_links.twitter']}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Photo</Label>
                  <div className="flex items-center gap-4">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="h-16 w-16 rounded-full object-cover" />
                    ) : editing.photo_url ? (
                      <img src={editing.photo_url} alt="Current" className="h-16 w-16 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted">
                        <User size={24} className="text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (editing.photo_url && !photoPreview) {
                            setError('Remove existing photo first, then upload a new one.');
                            e.target.value = '';
                            return;
                          }
                          setPhotoFile(file);
                          setPhotoPreview(URL.createObjectURL(file));
                          setError('');
                        }}
                        className="block w-full text-sm text-muted-foreground file:mr-2 file:rounded file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:text-primary-foreground"
                      />
                      <p className="text-xs text-muted-foreground">Recommended: 400x400px, JPEG/PNG/WebP</p>
                      {editing.photo_url && !photoPreview && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              setPhotoUploading(true);
                              await removeTeamMemberPhoto(editing.id!);
                              setEditing({ ...editing, photo_url: null });
                              showToast('Photo removed.', 'success');
                              await load();
                            } catch {
                              setError('Failed to remove photo.');
                            } finally {
                              setPhotoUploading(false);
                            }
                          }}
                          disabled={photoUploading}
                        >
                          <Trash2 size={14} className="mr-1" />
                          {photoUploading ? 'Removing...' : 'Remove'}
                        </Button>
                      )}
                      {editing.id && photoPreview && !editing.photo_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              setPhotoUploading(true);
                              await uploadTeamMemberPhoto(editing.id!, photoFile!);
                              setPhotoFile(null);
                              setPhotoPreview(null);
                              showToast('Photo uploaded.', 'success');
                              await load();
                            } catch {
                              setError('Failed to upload photo.');
                            } finally {
                              setPhotoUploading(false);
                            }
                          }}
                          disabled={photoUploading}
                        >
                          <Upload size={14} className="mr-1" />
                          {photoUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setEditing(null); setPhotoFile(null); setPhotoPreview(null); setValidationErrors({}); }}>Cancel</Button>
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
