import Link from 'next/link';

export default function BlogNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center" style={{ background: 'var(--color-background)' }}>
      <h1 className="text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>Post not found</h1>
      <p className="mt-4" style={{ color: 'var(--color-muted-foreground)' }}>
        The post you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/blog"
        className="mt-6 inline-flex items-center gap-2 font-medium hover:underline"
        style={{ color: 'var(--color-primary)' }}
      >
        &larr; Back to Blog
      </Link>
    </div>
  );
}
