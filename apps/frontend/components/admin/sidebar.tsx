'use client';

import { clearToken, isAuthenticated, logout } from '@/lib/admin-api';
import { Cog, DollarSign, File, FileText, Image, LayoutDashboard, LogOut, Mail, Paintbrush, Users, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

const navGroups = [
  {
    label: 'Main',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/services', label: 'Services', icon: Cog },
      { href: '/admin/team', label: 'Team', icon: Users },
      { href: '#', label: 'Blog', icon: FileText },
      { href: '#', label: 'Pricing', icon: DollarSign },
    ],
  },
  {
    label: 'Leads',
    items: [
      { href: '#', label: 'Messages', icon: Mail },
      { href: '#', label: 'Subscribers', icon: Users },
    ],
  },
  {
    label: 'Settings',
    items: [
      { href: '#', label: 'Theme', icon: Paintbrush },
      { href: '/admin/media', label: 'Media Library', icon: Image },
      { href: '/admin/pages', label: 'Pages', icon: File },
    ],
  },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try { await logout(); } catch { /* ignore */ }
    clearToken();
    router.push('/admin/login');
  }

  function isActive(href: string): boolean {
    if (href === '#') return false;
    return pathname === href || (href !== '/admin' && pathname.startsWith(href));
  }

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: 260, background: 'var(--sidebar-bg)', flexShrink: 0 }}
      >
        <div className="flex h-14 items-center justify-between px-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600, color: '#FFFFFF' }}>
            Adsvance CMS
          </span>
          <button onClick={onClose} className="p-1 md:hidden" style={{ color: '#FFFFFF' }} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              <div
                className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide"
                style={{ color: 'var(--sidebar-group)', fontSize: 11, letterSpacing: '0.5px' }}
              >
                {group.label}
              </div>
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={item.href !== '#' ? onClose : undefined}
                    className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm no-underline transition-colors"
                    style={{
                      color: active ? 'var(--sidebar-active)' : 'var(--sidebar-text)',
                      background: active ? 'var(--sidebar-active-bg)' : 'transparent',
                      fontWeight: active ? 600 : 400,
                    }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <item.icon size={16} aria-hidden="true" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: 8 }}>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors"
            style={{ color: 'var(--sidebar-text)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={16} aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
