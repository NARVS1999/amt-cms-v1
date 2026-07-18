'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnauthorizedError, fetchAdminPages, fetchServices, fetchTeamMembers } from '@/lib/admin-api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ services: 0, team: 0, pages: 0, publishedPages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [services, team, pages] = await Promise.all([
          fetchServices(),
          fetchTeamMembers(),
          fetchAdminPages(),
        ]);
        setStats({
          services: services.data.length,
          team: team.data.length,
          pages: pages.data.length,
          publishedPages: pages.data.filter((p) => p.is_published).length,
        });
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  const cards = [
    { label: 'Services', value: stats.services, href: '/admin/services' },
    { label: 'Team Members', value: stats.team, href: '/admin/team' },
    { label: 'Total Pages', value: stats.pages, href: '/admin/pages' },
    { label: 'Published', value: stats.publishedPages, href: '/admin/pages' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">&nbsp;</CardTitle></CardHeader>
              <CardContent><div className="h-8 w-16 animate-pulse rounded bg-muted" /></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          {cards.map((card) => (
            <Link key={card.label} href={card.href}>
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{card.value}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
