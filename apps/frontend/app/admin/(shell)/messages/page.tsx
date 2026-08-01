'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageData, UnauthorizedError, fetchMessages, markMessageRead, deleteMessage } from '@/lib/admin-api';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Eye, Trash2, Mail } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function AdminMessagesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<MessageData | null>(null);
  const [detailTarget, setDetailTarget] = useState<MessageData | null>(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const res = await fetchMessages();
      setMessages(res.data);
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleToggleRead(msg: MessageData) {
    try {
      await markMessageRead(msg.id);
      showToast(msg.read_at ? 'Marked as unread.' : 'Marked as read.', 'success');
      await load();
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
      else { showToast('Failed to update read status', 'error'); }
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteMessage(deleteTarget.id);
      setDeleteTarget(null);
      setDetailTarget(null);
      showToast('Deleted.', 'success');
      await load();
    } catch (e) {
      if (e instanceof UnauthorizedError) router.push('/admin/login');
      else { showToast('Delete failed', 'error'); }
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage contact form submissions from the public site.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Read</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : messages.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No messages yet.</TableCell></TableRow>
              ) : messages.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell className="font-medium">{msg.name}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{msg.email}</TableCell>
                  <TableCell className="text-muted-foreground text-xs line-clamp-1 max-w-[200px]">{msg.message}</TableCell>
                  <TableCell className="text-xs">{msg.created_at ? new Date(msg.created_at).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleToggleRead(msg)}
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer transition-colors ${
                        msg.read_at
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                    >
                      {msg.read_at ? 'Read' : 'Unread'}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setDetailTarget(msg)}>
                        <Eye size={14} className="mr-1" /> View
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(msg)}>
                        <Trash2 size={14} className="mr-1" /> Del
                      </Button>
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

      {/* Detail Modal */}
      {detailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDetailTarget(null)}>
          <Card className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">{detailTarget.name}</h2>
                <p className="text-sm text-muted-foreground">{detailTarget.email}</p>
              </div>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Message</p>
                <p className="whitespace-pre-wrap text-sm">{detailTarget.message}</p>
              </div>
              <div className="mb-4 text-xs text-muted-foreground">
                {detailTarget.created_at ? new Date(detailTarget.created_at).toLocaleString() : '-'}
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      detailTarget.read_at
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {detailTarget.read_at ? 'Read' : 'Unread'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { handleToggleRead(detailTarget); setDetailTarget(null); }}>
                    <Mail size={14} className="mr-1" /> {detailTarget.read_at ? 'Mark Unread' : 'Mark Read'}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(detailTarget)}>
                    <Trash2 size={14} className="mr-1" /> Delete
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDetailTarget(null)}>Close</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the message from {deleteTarget?.name}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} variant="destructive">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
