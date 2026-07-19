import { fetchPages, API_URL } from '@/lib/api';

/* ─── Section block components ─── */

function HeroBlock({ heading, content }: { heading?: string; content?: string }) {
  return (
    <section className="py-20" style={{ background: 'var(--color-muted)' }}>
      <div className="mx-auto max-w-7xl px-6 text-center">
        {heading && (
          <h2 className="text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>
            {heading}
          </h2>
        )}
        {content && (
          <p className="mt-4 max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
            {content}
          </p>
        )}
      </div>
    </section>
  );
}

function FeaturesBlock({ heading, content }: { heading?: string; content?: string }) {
  return (
    <section className="py-20" style={{ background: 'var(--color-background)' }}>
      <div className="mx-auto max-w-7xl px-6">
        {heading && (
          <h2 className="text-center text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>
            {heading}
          </h2>
        )}
        {content && (
          <p className="mt-6 max-w-3xl mx-auto text-center leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
            {content}
          </p>
        )}
      </div>
    </section>
  );
}

function CtaBlock({ heading, content }: { heading?: string; content?: string }) {
  return (
    <section className="py-20 text-center" style={{ background: 'var(--color-primary)' }}>
      <div className="mx-auto max-w-7xl px-6">
        {heading && (
          <h2 className="text-3xl font-bold text-white">
            {heading}
          </h2>
        )}
        {content && (
          <p className="mt-4 max-w-2xl mx-auto leading-relaxed text-white/90">
            {content}
          </p>
        )}
        <a
          href="#contact"
          className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ color: 'var(--color-primary)' }}
        >
          Get Started
        </a>
      </div>
    </section>
  );
}

function ContentBlock({ heading, content, image }: { heading?: string; content?: string; image?: string }) {
  return (
    <section className="py-20" style={{ background: 'var(--color-muted)' }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl">
          {heading && (
            <h2 className="text-3xl font-bold" style={{ color: 'var(--color-foreground)' }}>
              {heading}
            </h2>
          )}
          {content && (
            <p className="mt-6 leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
              {content}
            </p>
          )}
          {image && (
            <img
              src={image}
              alt={heading ?? 'Section image'}
              width={800}
              height={450}
              loading="lazy"
              className="mt-8 w-full max-w-full rounded-lg object-cover h-auto"
            />
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── Section type dispatcher ─── */

function renderSection(section: Record<string, unknown>, index: number) {
  const type = section.type as string | undefined;
  const heading = section.heading as string | undefined;
  const content = section.content as string | undefined;
  const image = section.image as string | undefined;

  switch (type) {
    case 'hero':
      return <HeroBlock key={index} heading={heading} content={content} />;
    case 'features':
      return <FeaturesBlock key={index} heading={heading} content={content} />;
    case 'cta':
      return <CtaBlock key={index} heading={heading} content={content} />;
    case 'content':
      return <ContentBlock key={index} heading={heading} content={content} image={image} />;
    default:
      // Unknown section types silently skipped
      return null;
  }
}

/* ─── Main component ─── */

export async function PageRenderer() {
  let pages;

  try {
    pages = await fetchPages();
  } catch (err) {
    throw new Error(
      `Failed to fetch pages. The frontend build requires the Laravel API to be running.\n` +
        `Check that the API is reachable at ${API_URL} (configured via NEXT_PUBLIC_API_URL in .env.local)\n` +
        `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }

  // Find the first published page
  const page = pages?.find((p) => p.is_published) ?? null;

  // Empty state — no published page found
  if (!page) {
    return (
      <section
        id="home"
        className="flex min-h-[600px] items-center pt-[72px]"
        style={{
          background: 'linear-gradient(135deg, var(--color-hero-start) 0%, var(--color-hero-end) 100%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-20 text-center">
          <h1 className="text-5xl font-extrabold" style={{ color: 'var(--color-foreground)' }}>
            Coming Soon
          </h1>
          <p className="mt-4 text-lg" style={{ color: 'var(--color-muted-foreground)' }}>
            Adsvance Media Tech
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero section from page fields */}
      <section
        id="home"
        className="flex min-h-[600px] items-center pt-[72px]"
        style={{
          background: 'linear-gradient(135deg, var(--color-hero-start) 0%, var(--color-hero-end) 100%)',
        }}
      >
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl" style={{ color: 'var(--color-foreground)' }}>
              {page.hero_heading ?? 'Welcome'}
            </h1>
            {page.hero_subtext && (
              <p className="mt-6 text-lg leading-relaxed" style={{ color: 'var(--color-muted-foreground)' }}>
                {page.hero_subtext}
              </p>
            )}
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

      {/* Dynamic sections from page.sections */}
      {Array.isArray(page.sections) && page.sections.filter(Boolean).map((section, index) => renderSection(section, index))}
    </>
  );
}
