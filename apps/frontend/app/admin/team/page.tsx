'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TeamMemberData, UnauthorizedError, createTeamMember, deleteTeamMember, fetchTeamMembers, updateTeamMember } from '@/lib/admin-api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminTeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<TeamMemberData> | null>(null);

  async function load() {
    try {
      const res = await fetchTeamMembers();
      setMembers(res.data);
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleSave() {
    if (!editing) return;
    try {
      if (editing.id) {
        await updateTeamMember(editing.id, editing);
      } else {
        await createTeamMember(editing);
      }
      setEditing(null);
      await load();
    } catch (e: any) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
      else alert(e?.message || 'Save failed');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this team member? This cannot be undone.')) return;
    try {
      await deleteTeamMember(id);
      await load();
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <Button onClick={() => setEditing({ name: '', role: '', bio: '' })}>
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
                <TableHead>Sort</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
              ) : members.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No team members yet.</TableCell></TableRow>
              ) : members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.role}</TableCell>
                  <TableCell>{m.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditing(m)}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(m.id)}>Del</Button>
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
            <CardHeader><CardTitle>{editing.id ? 'Edit Member' : 'New Member'}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Role</Label><Input value={editing.role || ''} onChange={(e) => setEditing({ ...editing, role: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <textarea className="flex h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" value={editing.bio || ''} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />
                </div>
                <div className="space-y-2"><Label>Sort Order</Label><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })} /></div>
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
