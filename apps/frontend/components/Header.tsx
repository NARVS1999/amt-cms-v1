'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const NAV_ITEMS = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '#contact' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  // Focus trap for mobile drawer
  useEffect(() => {
    if (!mobileOpen || !drawerRef.current) return;

    const drawer = drawerRef.current;
    const focusableSelectors = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';
    const previouslyFocused = document.activeElement as HTMLElement;

    // Focus the first focusable element in the drawer
    const focusableElements = drawer.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    drawer.addEventListener('keydown', handleKeyDown);

    return () => {
      drawer.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus(); // Restore focus when drawer closes
    };
  }, [mobileOpen]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[72px]"
      style={{
        background: 'rgba(255,255,255,0.97)',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-6" aria-label="Main navigation">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
          <span style={{ color: 'var(--color-primary)' }}>Adsvance</span>
          <span>Media</span>
        </a>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--color-foreground)' }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Login button */}
        <a
          href="/admin"
          className="hidden md:inline-flex items-center rounded-lg border-2 px-5 py-2 text-sm font-semibold transition-all hover:opacity-80"
          style={{
            borderColor: 'var(--color-primary)',
            color: 'var(--color-primary)',
          }}
        >
          Login
        </a>

        {/* Hamburger button (mobile) */}
        <button
          type="button"
          ref={hamburgerRef}
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={toggleMobile}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <span
            className="block h-0.5 w-6 rounded transition-transform"
            style={{ background: 'var(--color-foreground)', transform: mobileOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none' }}
          />
          <span
            className="block h-0.5 w-6 rounded transition-opacity"
            style={{ background: 'var(--color-foreground)', opacity: mobileOpen ? 0 : 1 }}
          />
          <span
            className="block h-0.5 w-6 rounded transition-transform"
            style={{ background: 'var(--color-foreground)', transform: mobileOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }}
          />
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={`fixed top-0 right-0 z-50 h-full w-72 p-6 shadow-xl transition-transform md:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'var(--color-background)' }}
      >
        <div className="flex justify-end mb-6">
          <button type="button" onClick={closeMobile} aria-label="Close menu" className="p-2">
            <i className="fa-solid fa-xmark text-xl" />
          </button>
        </div>

        <ul className="flex flex-col gap-6">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="text-lg font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--color-foreground)' }}
                onClick={closeMobile}
              >
                {item.label}
              </a>
            </li>
          ))}
          <li className="mt-4">
            <a
              href="/admin"
              className="inline-flex items-center rounded-lg border-2 px-5 py-2 text-sm font-semibold"
              style={{
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary)',
              }}
              onClick={closeMobile}
            >
              Login
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
