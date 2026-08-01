'use client';

import { RouteChangeLoader } from '@/components/admin/route-change-loader';
import { Sidebar } from '@/components/admin/sidebar';
import { Spinner } from '@/components/ui/spinner';
import { ToastProvider } from '@/components/ui/toast';
import { clearToken, fetchMe, getToken } from '@/lib/admin-api';
import { Menu } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Validate the stored token against the API before rendering the admin shell.
  // Presence alone is not enough — an expired token would otherwise flash the
  // sidebar + dashboard before the first 401 kicks the user back to login.
  useEffect(() => {
    let cancelled = false;

    if (!getToken()) {
      setStatus('invalid');
      return;
    }

    fetchMe()
      .then(() => {
        if (!cancelled) setStatus('valid');
      })
      .catch(() => {
        if (cancelled) return;
        clearToken();
        setStatus('invalid');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (status === 'invalid') {
      router.replace('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Show a spinner while the token is being verified — no sidebar flash on login redirect
  if (status === 'checking') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (status !== 'valid') return null;

  return (
    <ToastProvider>
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
            <RouteChangeLoader>
              {children}
            </RouteChangeLoader>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
