import { fetchServices, API_URL } from '@/lib/api';

function ServiceCard({
  title,
  description,
  icon,
  is_featured,
}: {
  title: string;
  description: string;
  icon: string;
  is_featured: boolean;
}) {
  return (
    <div
      className={`group rounded-xl border bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg ${
        is_featured ? 'border-t-2' : 'border'
      }`}
      style={{
        borderTopColor: is_featured ? 'var(--color-accent)' : undefined,
        borderColor: is_featured ? undefined : 'var(--color-border)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {/* Icon circle — 64px with primary→secondary gradient */}
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-white"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        }}
      >
        <i className={`${icon} text-xl`} aria-hidden="true" />
      </div>

      {/* Title */}
      <h3
        className="mt-4 text-lg font-semibold"
        style={{ color: 'var(--color-foreground)' }}
      >
        {title}
      </h3>

      {/* Description — truncated to 3 lines */}
      <p
        className="mt-2 line-clamp-3 text-sm leading-relaxed"
        style={{ color: 'var(--color-muted-foreground)' }}
      >
        {description}
      </p>
    </div>
  );
}

export async function ServicesGrid() {
  let services;

  try {
    services = await fetchServices();
  } catch (err) {
    throw new Error(
      `Failed to fetch services. The frontend build requires the Laravel API to be running.\n` +
        `Check that the API is reachable at ${API_URL} (configured via NEXT_PUBLIC_API_URL in .env.local)\n` +
        `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }

  // Empty state — hide the section entirely
  if (!services || services.length === 0) return null;

  return (
    <section id="services" className="py-20" aria-labelledby="services-heading" style={{ background: 'var(--color-muted)' }}>
      <div className="mx-auto max-w-7xl px-6">
        <h2
          id="services-heading"
          className="text-center text-3xl font-bold"
          style={{ color: 'var(--color-foreground)' }}
        >
          Our Services
        </h2>
        <p
          className="mt-4 text-center"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          Comprehensive digital solutions tailored to your needs
        </p>

        {/* Responsive grid: 1-col mobile, 2-col tablet, 4-col desktop */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              icon={service.icon}
              is_featured={service.is_featured}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
