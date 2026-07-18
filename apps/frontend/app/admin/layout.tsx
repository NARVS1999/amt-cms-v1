'use client';

import { Button } from '@/components/ui/button';
import { clearToken, isAuthenticated, logout } from '@/lib/admin-api';
import { FileText, LayoutDashboard, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/services', label: 'Services', icon: Settings },
  { href: '/admin/team', label: 'Team', icon: Users },
  { href: '/admin/pages', label: 'Pages', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
    setLoaded(true);
  }, []);

  // Redirect unauthenticated users after render (not during)
  useEffect(() => {
    if (loaded && !authed && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [loaded, authed, pathname, router]);

  // Login page is public
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!loaded) return null;

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // ignore — token is cleared locally regardless
    }
    clearToken();
    router.push('/admin/login');
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r bg-card">
        <div className="flex h-14 items-center border-b px-6 font-semibold">Adsvance CMS</div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
