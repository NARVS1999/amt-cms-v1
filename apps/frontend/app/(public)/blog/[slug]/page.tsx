import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchBlogPosts, fetchBlogPost } from '@/lib/api';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const posts = await fetchBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);
  if (!post) return {};
  const description = post.excerpt?.slice(0, 160) || post.content?.replace(/<[^>]*>/g, '').slice(0, 160) || '';
  return {
    title: `${post.title} | Adsvance Media Tech`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.published_at || undefined,
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
  };
}

function calcReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.max(1, Math.ceil(text / 200));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await fetchBlogPost(slug);

  if (!post) {
    notFound();
  }

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const readingTime = calcReadingTime(post.content);

  return (
    <article className="py-12" style={{ background: 'var(--color-background)' }}>
      <div className="mx-auto max-w-[720px] px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-sm font-medium mb-8 transition-opacity hover:opacity-80"
          style={{ color: 'var(--color-primary)' }}
        >
          &larr; Back to Blog
        </Link>

        {post.featured_image_url && (
          <div className="w-full aspect-video rounded-xl overflow-hidden mb-8 max-h-[480px]">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold leading-tight" style={{ color: 'var(--color-foreground)' }}>
          {post.title}
        </h1>

        <div className="mt-4 flex items-center gap-3 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          {date && <time>{date}</time>}
          {date && <span>&middot;</span>}
          <span>{readingTime} min read</span>
        </div>

        <div
          className="mt-8 prose prose-lg max-w-none"
          style={{
            color: 'var(--color-foreground)',
            lineHeight: '1.7',
          }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}
