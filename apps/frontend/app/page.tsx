export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section
        id="home"
        className="flex min-h-[600px] items-center pt-[72px]"
        style={{
          background: 'linear-gradient(135deg, #fff8f0 0%, #fff5f5 100%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <h1
              className="text-4xl font-extrabold leading-tight md:text-5xl"
              style={{ color: 'var(--color-foreground)' }}
            >
              Grow Your Business with{' '}
              <span style={{ color: 'var(--color-primary)' }}>Data-Driven</span>{' '}
              Marketing
            </h1>
            <p className="mt-6 text-lg leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
              We help brands amplify their digital presence through cutting-edge SEO, targeted
              advertising, and conversion-optimized web experiences.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="rounded-lg px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-primary)' }}
              >
                Get Started
              </a>
              <a
                href="#services"
                className="rounded-lg border-2 px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
                style={{
                  borderColor: 'var(--color-primary)',
                  color: 'var(--color-primary)',
                }}
              >
                Our Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-center" style={{ color: 'var(--color-foreground)' }}>
            Our Services
          </h2>
          <p className="mt-4 text-center" style={{ color: 'var(--color-muted-foreground)' }}>
            Comprehensive digital solutions tailored to your needs
          </p>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {['Web Development', 'UI/UX Design', 'SEO Optimization', 'Digital Marketing'].map((service) => (
              <div
                key={service}
                className="rounded-xl p-6 text-center transition-shadow hover:shadow-lg"
                style={{ background: 'var(--color-muted)' }}
              >
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>
                  {service}
                </h3>
                <p className="mt-2 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
                  Professional {service.toLowerCase()} services to help your business thrive online.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

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
