'use client';

import { Sidebar } from '@/components/admin/sidebar';
import { isAuthenticated } from '@/lib/admin-api';
import { Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded && !authed && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [loaded, authed, pathname, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (pathname === '/admin/login') {
    return (
      <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
        {children}
      </div>
    );
  }

  if (!loaded) return null;

  return (
    <div className="admin-theme" style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col" style={{ minWidth: 0 }}>
        <header className="flex h-14 items-center gap-3 border-b px-4 md:hidden" style={{ background: 'var(--sidebar-bg)' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: '#FFFFFF' }} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>
            Adsvance CMS
          </span>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: 32, fontFamily: "'Inter', sans-serif" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
