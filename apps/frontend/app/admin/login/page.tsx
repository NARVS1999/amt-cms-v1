'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, setToken } from '@/lib/admin-api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRef, useState } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  // Uncontrolled inputs (defaultValue + refs): values typed/filled before
  // hydration are never reconciled away by React state, which previously
  // wiped Playwright fill() values and caused empty-form 422 submissions
  // (see .planning/debug/playwright-login-empty-fields.md).
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const errorId = 'login-error';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(emailRef.current?.value ?? '', passwordRef.current?.value ?? '', remember);
      setToken(data.token);
      router.push('/admin');
    } catch (err: any) {
      setError(err?.message || err?.errors?.email?.[0] || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: 'var(--surface)', fontFamily: "'Inter', sans-serif" }}
    >
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Adsvance CMS</CardTitle>
          <CardDescription>Sign in to manage your site</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                id={errorId}
                className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                ref={emailRef}
                defaultValue=""
                autoComplete="email"
                required
                aria-describedby={error ? errorId : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                ref={passwordRef}
                defaultValue=""
                autoComplete="current-password"
                required
                aria-describedby={error ? errorId : undefined}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="remember" className="text-sm font-normal">Remember me</Label>
              </div>
              <Link href="/admin/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
