'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const HASH_ITEMS = ['#home', '#about', '#services', '#contact'];

export function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const isHome = pathname === '/';

  const resolveHref = useCallback(
    (href: string) => {
      if (HASH_ITEMS.includes(href)) {
        return isHome ? href : `/${href}`;
      }
      return href;
    },
    [isHome],
  );

  // Auto-dismiss feedback after 5 seconds
  useEffect(() => {
    if (success || duplicate || error) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setDuplicate(false);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, duplicate, error]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setDuplicate(false);

    // Basic client-side validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setError('Please provide a valid email address.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (res.status === 201) {
        setSuccess(true);
        setEmail('');
        return;
      }

      if (res.status === 422) {
        const data = await res.json();
        if (data.errors?.email?.some((msg: string) => msg.includes('already subscribed'))) {
          setDuplicate(true);
        } else {
          setError(data.message || 'Please check your email and try again.');
        }
        return;
      }

      if (res.status === 429) {
        setError('Too many attempts. Try again in a minute.');
        return;
      }

      setError('Could not subscribe. Please try again.');
    } catch {
      setError('Could not subscribe. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <footer style={{ background: 'var(--color-footer-bg)', color: 'var(--color-footer-text)' }}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo + Description */}
          <div className="lg:col-span-1">
            <a href="/" className="inline-flex items-center gap-2 text-xl font-bold text-white">
              <span style={{ color: 'var(--color-primary)' }}>Adsvance</span>
              <span className="text-white">Media</span>
            </a>
            <p className="mt-4 text-sm leading-relaxed">
              Adsvance Media Tech delivers premium digital marketing, SEO, and web development
              solutions that drive measurable growth for businesses worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href={resolveHref('#home')} className="text-sm transition-colors hover:text-white">Home</a></li>
              <li><a href={resolveHref('#about')} className="text-sm transition-colors hover:text-white">About</a></li>
              <li><a href="/blog" className="text-sm transition-colors hover:text-white">Blog</a></li>
              <li><a href={resolveHref('#contact')} className="text-sm transition-colors hover:text-white">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Services</h3>
            <ul className="space-y-3">
              <li><a href={resolveHref('#services')} className="text-sm transition-colors hover:text-white">Web Development</a></li>
              <li><a href={resolveHref('#services')} className="text-sm transition-colors hover:text-white">UI/UX Design</a></li>
              <li><a href={resolveHref('#services')} className="text-sm transition-colors hover:text-white">SEO Optimization</a></li>
              <li><a href={resolveHref('#services')} className="text-sm transition-colors hover:text-white">Digital Marketing</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Support</h3>
            <ul className="space-y-3">
              <li><a href={resolveHref('#contact')} className="text-sm transition-colors hover:text-white">Contact Us</a></li>
              <li><span className="text-sm cursor-not-allowed opacity-50" aria-disabled="true">FAQ</span></li>
              <li><span className="text-sm cursor-not-allowed opacity-50" aria-disabled="true">Privacy Policy</span></li>
              <li><span className="text-sm cursor-not-allowed opacity-50" aria-disabled="true">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        {/* Newsletter + Social */}
        <div className="mt-12 flex flex-col items-start gap-6 border-t pt-8 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: 'var(--color-border)' }}>
          {/* Newsletter */}
          <div className="w-full max-w-md">
            <label htmlFor="newsletter-email" className="mb-2 block text-sm font-medium text-white">
              Subscribe to our newsletter
            </label>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={submitting}
                className="flex-1 rounded-lg px-4 py-2.5 text-sm outline-none disabled:opacity-50"
                style={{ background: 'var(--color-muted)', color: 'var(--color-foreground)' }}
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--color-primary)' }}
              >
                {submitting ? '...' : 'Subscribe'}
              </button>
            </form>

            {/* Feedback Messages */}
            {success && (
              <p className="mt-2 text-sm" style={{ color: 'var(--color-success)' }}>
                Subscribed!
              </p>
            )}
            {duplicate && (
              <p className="mt-2 text-sm" style={{ color: '#f59e0b' }}>
                Already subscribed.
              </p>
            )}
            {error && (
              <p className="mt-2 text-sm" style={{ color: 'var(--color-error)' }}>
                {error}
              </p>
            )}
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Facebook" className="text-lg transition-colors hover:text-white" onClick={(e) => e.preventDefault()}>
              <i className="fa-brands fa-facebook-f" />
            </a>
            <a href="#" aria-label="Twitter" className="text-lg transition-colors hover:text-white" onClick={(e) => e.preventDefault()}>
              <i className="fa-brands fa-twitter" />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-lg transition-colors hover:text-white" onClick={(e) => e.preventDefault()}>
              <i className="fa-brands fa-linkedin-in" />
            </a>
            <a href="#" aria-label="Instagram" className="text-lg transition-colors hover:text-white" onClick={(e) => e.preventDefault()}>
              <i className="fa-brands fa-instagram" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-xs">
          &copy; {new Date().getFullYear()} Adsvance Media Tech. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
