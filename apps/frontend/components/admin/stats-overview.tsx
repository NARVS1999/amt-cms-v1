'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cog, FileText, Mail, Users } from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  href: string;
}

function StatCard({ title, value, icon, colorClass, href }: StatCardProps) {
  return (
    <Link href={href} className="block no-underline" aria-label={`View ${title}: ${value}`}>
      <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={`flex h-11 w-11 items-center justify-center rounded-lg text-white ${colorClass}`}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {value}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export interface StatsData {
  services: number;
  blog_posts: number;
  unread_messages: number;
  subscribers: number;
}

export function StatsOverview({ stats }: { stats: StatsData }) {
  const cards: StatCardProps[] = [
    {
      title: 'Total Services',
      value: stats.services,
      icon: <Cog size={20} aria-hidden="true" />,
      colorClass: 'bg-red-500',
      href: '/admin/services',
    },
    {
      title: 'Published Blog Posts',
      value: stats.blog_posts,
      icon: <FileText size={20} aria-hidden="true" />,
      colorClass: 'bg-blue-500',
      href: '/admin/blog-posts',
    },
    {
      title: 'Unread Messages',
      value: stats.unread_messages,
      icon: <Mail size={20} aria-hidden="true" />,
      colorClass: 'bg-green-500',
      href: '/admin/messages',
    },
    {
      title: 'Subscribers',
      value: stats.subscribers,
      icon: <Users size={20} aria-hidden="true" />,
      colorClass: 'bg-amber-500',
      href: '/admin/subscribers',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}
