'use client';

import { ToastProvider } from '@/components/ui/toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>{children}</div>
    </ToastProvider>
  );
}
