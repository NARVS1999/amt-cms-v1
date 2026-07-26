import { PageRenderer } from '@/components/PageRenderer';
import { LatestPosts } from '@/components/LatestPosts';
import { PricingTable } from '@/components/PricingTable';
import { ServicesGrid } from '@/components/ServicesGrid';
import { TeamGrid } from '@/components/TeamGrid';

export default function HomePage() {
  return (
    <>
      <PageRenderer />

      <ServicesGrid />

      {/* About Section */}
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

      <TeamGrid />

      <PricingTable />

      <LatestPosts />

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
