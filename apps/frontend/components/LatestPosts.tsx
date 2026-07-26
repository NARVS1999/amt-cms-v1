import { fetchBlogPosts } from '@/lib/api';
import { BlogCard } from './BlogCard';

export async function LatestPosts() {
  const posts = await fetchBlogPosts();

  if (!posts || posts.length === 0) return null;

  const latest = posts.slice(0, 3);

  return (
    <section id="blog" className="py-20" style={{ background: 'var(--color-muted)' }}>
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-3xl font-bold text-center" style={{ color: 'var(--color-foreground)' }}>
          Latest Insights
        </h2>
        <p className="mt-3 text-center" style={{ color: 'var(--color-muted-foreground)' }}>
          Tips, guides, and industry updates
        </p>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {latest.map((post) => (
            <BlogCard
              key={post.id}
              title={post.title}
              slug={post.slug}
              excerpt={post.excerpt}
              featured_image_url={post.featured_image_url}
              published_at={post.published_at}
            />
          ))}
        </div>
        <div className="mt-8 text-center">
          <a
            href="/blog"
            className="font-medium transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-primary)' }}
          >
            View All Posts &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
