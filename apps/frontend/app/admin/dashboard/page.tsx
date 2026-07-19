'use client';

import { StatsOverview, type StatsData } from '@/components/admin/stats-overview';
import { fetchAdminStats } from '@/lib/admin-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async (signal: AbortSignal) => {
    try {
      const data = await fetchAdminStats();
      if (!signal.aborted) {
        setStats(data);
        setError(false);
      }
    } catch (err: any) {
      if (signal.aborted) return;
      if (err?.name === 'UnauthorizedError') {
        router.push('/admin/login');
        return;
      }
      console.warn('Failed to load dashboard stats:', err);
      setError(true);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">&nbsp;</CardTitle>
                <div className="h-11 w-11 animate-pulse rounded-lg bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive" role="alert">
          Could not load dashboard stats. Refresh the page to try again.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      {stats && <StatsOverview stats={stats} />}
    </div>
  );
}
