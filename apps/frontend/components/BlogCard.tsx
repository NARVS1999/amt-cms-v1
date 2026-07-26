import Link from 'next/link';
import { ImageIcon } from 'lucide-react';

interface BlogCardProps {
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
}

export function BlogCard({ title, slug, excerpt, featured_image_url, published_at }: BlogCardProps) {
  const date = published_at
    ? new Date(published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <Link href={`/blog/${slug}`} className="group block">
      <article className="rounded-xl border border-[var(--color-border)] bg-white shadow-sm hover:shadow-md transition h-full flex flex-col">
        <div className="relative w-full aspect-video rounded-t-xl overflow-hidden bg-[var(--color-muted)]">
          {featured_image_url ? (
            <img
              src={featured_image_url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageIcon className="w-12 h-12 text-[var(--color-muted-foreground)] opacity-40" />
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-semibold text-[var(--color-foreground)] line-clamp-1">{title}</h3>
          {excerpt && (
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted-foreground)] line-clamp-3">{excerpt}</p>
          )}
          {date && (
            <time className="mt-auto pt-3 text-xs text-[var(--color-muted-foreground)]">{date}</time>
          )}
        </div>
      </article>
    </Link>
  );
}
