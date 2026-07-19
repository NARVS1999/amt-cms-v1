import { PageRenderer } from '@/components/PageRenderer';
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

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-center" style={{ color: 'var(--color-foreground)' }}>
            Pricing Plans
          </h2>
          <p className="mt-4 text-center" style={{ color: 'var(--color-muted-foreground)' }}>
            Flexible plans to match your business goals
          </p>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {['Starter', 'Professional', 'Enterprise'].map((plan, i) => (
              <div
                key={plan}
                className="rounded-xl border p-8 text-center transition-shadow hover:shadow-lg"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>{plan}</h3>
                <p className="mt-4 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                  {i === 0 && 'Perfect for small businesses'}
                  {i === 1 && 'Ideal for growing companies'}
                  {i === 2 && 'For large enterprises'}
                </p>
                <p className="mt-6 text-4xl font-extrabold" style={{ color: 'var(--color-foreground)' }}>
                  ${i === 0 ? '99' : i === 1 ? '249' : '499'}
                  <span className="text-base font-normal" style={{ color: 'var(--color-muted-foreground)' }}>/mo</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section id="blog" className="py-20" style={{ background: 'var(--color-muted)' }}>
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-center" style={{ color: 'var(--color-foreground)' }}>
            Latest Insights
          </h2>
          <p className="mt-4 text-center" style={{ color: 'var(--color-muted-foreground)' }}>
            Tips, guides, and industry updates
          </p>
          <div className="mt-8 text-center">
            <a
              href="/blog"
              className="inline-flex items-center font-semibold transition-opacity hover:opacity-80"
              style={{ color: 'var(--color-primary)' }}
            >
              View All Posts <i className="fa-solid fa-arrow-right ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>
            Get in Touch
          </h2>
          <p className="mt-4" style={{ color: 'var(--color-muted-foreground)' }}>
            Ready to grow your business? Let&apos;s talk.
          </p>
          <p className="mt-8 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            Contact form and detailed information coming soon.
          </p>
        </div>
      </section>
    </>
  );
}
