'use client';

import { useEffect, useState } from 'react';
import { BlogCard } from '@/components/BlogCard';
import { BlogPostData, fetchBlogPosts } from '@/lib/api';

const POSTS_PER_PAGE = 6;

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPostData[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const start = (page - 1) * POSTS_PER_PAGE;
  const visible = posts.slice(start, start + POSTS_PER_PAGE);

  return (
    <section className="py-20" style={{ background: 'var(--color-background)' }}>
      <div className="mx-auto max-w-7xl px-6">
        <h1 className="text-4xl font-bold text-center" style={{ color: 'var(--color-foreground)' }}>
          Blog
        </h1>
        <p className="mt-4 text-center" style={{ color: 'var(--color-muted-foreground)' }}>
          Tips, guides, and industry updates
        </p>

        {loading ? (
          <div className="mt-12 text-center" style={{ color: 'var(--color-muted-foreground)' }}>
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="mt-12 text-center" style={{ color: 'var(--color-muted-foreground)' }}>
            No posts published yet.
          </div>
        ) : (
          <>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visible.map((post) => (
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

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-md border text-sm font-medium disabled:opacity-40 transition"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-foreground)',
                  }}
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-md border text-sm font-medium disabled:opacity-40 transition"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-foreground)',
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
