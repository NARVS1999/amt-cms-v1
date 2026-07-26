import { Suspense } from 'react';
import { PageRenderer } from '@/components/PageRenderer';
import { LatestPosts } from '@/components/LatestPosts';
import { PricingTable } from '@/components/PricingTable';
import { ServicesGrid } from '@/components/ServicesGrid';
import { TeamGrid } from '@/components/TeamGrid';
import { Skeleton } from '@/components/ui/skeleton';

/* ─── Skeleton fallback components (D-07) ─── */

function HeroSkeleton() {
  return (
    <section className="flex min-h-[600px] items-center pt-[72px]" style={{ background: 'linear-gradient(135deg, var(--color-hero-start) 0%, var(--color-hero-end) 100%)' }}>
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-20">
        <div className="max-w-2xl space-y-6">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-6 w-2/3" />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-12 w-32 rounded-lg" />
            <Skeleton className="h-12 w-32 rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ServicesSkeleton() {
  return (
    <section className="py-20" style={{ background: 'var(--color-muted)' }}>
      <div className="mx-auto max-w-7xl px-6">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto mt-4 h-5 w-80" />
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-6 text-center" style={{ borderColor: 'var(--color-border)' }}>
              <Skeleton className="mx-auto h-16 w-16 rounded-full" />
              <Skeleton className="mx-auto mt-4 h-5 w-1/2" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSkeleton() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto mt-4 h-5 w-64" />
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-6 text-center" style={{ borderColor: 'var(--color-border)' }}>
              <Skeleton className="mx-auto h-16 w-16 rounded-full" />
              <Skeleton className="mx-auto mt-4 h-5 w-1/2" />
              <Skeleton className="mx-auto mt-2 h-4 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSkeleton() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto mt-4 h-5 w-64" />
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-8 text-center" style={{ borderColor: 'var(--color-border)' }}>
              <Skeleton className="mx-auto h-6 w-1/3" />
              <Skeleton className="mx-auto mt-6 h-8 w-1/4" />
              <div className="mt-8 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="mx-auto mt-8 h-12 w-32 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestPostsSkeleton() {
  return (
    <section className="py-20" style={{ background: 'var(--color-muted)' }}>
      <div className="mx-auto max-w-7xl px-6">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto mt-3 h-5 w-64" />
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              <Skeleton className="w-full aspect-video rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Homepage ─── */

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <PageRenderer />
      </Suspense>

      <Suspense fallback={<ServicesSkeleton />}>
        <ServicesGrid />
      </Suspense>

      {/* About Section — static, no data fetch */}
      <section id="about" className="py-20" style={{ background: 'var(--color-muted)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-center" style={{ color: 'var(--color-foreground)' }}>
            About Us
          </h2>
          <p className="mt-6 max-w-3xl mx-auto text-center leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
            Adsvance Media Tech is a full-service digital agency specializing in performance marketing,
            SEO strategy, and modern web development. We combine data-driven insights with creative
            execution to deliver measurable results for businesses of all sizes.
          </p>
        </div>
      </section>

      <Suspense fallback={<TeamSkeleton />}>
        <TeamGrid />
      </Suspense>

      <Suspense fallback={<PricingSkeleton />}>
        <PricingTable />
      </Suspense>

      <Suspense fallback={<LatestPostsSkeleton />}>
        <LatestPosts />
      </Suspense>

      {/* Contact Section — CTA link to /contact (D-06) */}
      <section id="contact" className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>
            Get in Touch
          </h2>
          <p className="mt-4" style={{ color: 'var(--color-muted-foreground)' }}>
            Ready to grow your business? Let&apos;s talk.
          </p>
          <a
            href="/contact"
            className="mt-8 inline-block rounded-lg px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}
          >
            Contact Us
          </a>
        </div>
      </section>
    </>
  );
}
