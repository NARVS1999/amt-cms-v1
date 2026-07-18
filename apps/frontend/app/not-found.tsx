import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-[72px]">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold" style={{ color: 'var(--color-primary)' }}>
          404
        </h1>
        <h2 className="mt-4 text-2xl font-bold" style={{ color: 'var(--color-foreground)' }}>
          Page Not Found
        </h2>
        <p className="mt-2" style={{ color: 'var(--color-muted-foreground)' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="rounded-lg px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
