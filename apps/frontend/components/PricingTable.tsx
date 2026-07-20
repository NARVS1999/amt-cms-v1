import { fetchPricingPlans, API_URL } from '@/lib/api';

const INTERVAL_LABELS: Record<string, string> = {
  monthly: 'month',
  yearly: 'year',
  'one-time': 'one-time',
};

function formatInterval(interval: string): string {
  return INTERVAL_LABELS[interval] ?? interval;
}

function PricingCard({
  name,
  price,
  interval,
  description,
  features,
  is_popular,
  cta_text,
}: {
  name: string;
  price: number;
  interval: string;
  description: string | null;
  features: { description: string; is_included: boolean; sort_order: number }[];
  is_popular: boolean;
  cta_text: string | null;
}) {
  return (
    <div
      className={`rounded-xl bg-white p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
        is_popular ? 'border-2' : 'border'
      }`}
      style={{
        borderColor: is_popular ? 'var(--color-primary)' : 'var(--color-border)',
        boxShadow: is_popular
          ? '0 10px 30px -5px rgba(0,0,0,0.1), 0 4px 10px -6px rgba(0,0,0,0.1)'
          : '0 1px 3px rgba(0,0,0,0.06)',
        position: 'relative',
      }}
    >
      {is_popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-5 py-1 text-sm font-semibold text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          Most Popular
        </div>
      )}

      <h3 className="text-xl font-bold" style={{ color: 'var(--color-foreground)' }}>
        {name}
      </h3>

      {description && (
        <p className="mt-2 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          {description}
        </p>
      )}

      <p className="mt-6 text-4xl font-extrabold" style={{ color: 'var(--color-foreground)' }}>
        ₱{price.toFixed(2)}
        <span className="text-base font-normal" style={{ color: 'var(--color-muted-foreground)' }}>
          /{formatInterval(interval)}
        </span>
      </p>

      {features.length > 0 && (
        <ul className="mt-8 space-y-3 text-left">
          {features
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                {feature.is_included ? (
                  <i
                    className="fa-solid fa-check mt-0.5"
                    style={{ color: 'var(--color-success)' }}
                    aria-hidden="true"
                  />
                ) : (
                  <i
                    className="fa-solid fa-xmark mt-0.5"
                    style={{ color: 'var(--color-error)' }}
                    aria-hidden="true"
                  />
                )}
                <span style={{ color: 'var(--color-foreground)' }}>
                  {feature.description}
                </span>
              </li>
            ))}
        </ul>
      )}

      <a
        href="#contact"
        className="mt-8 inline-block rounded-lg px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ background: 'var(--color-primary)' }}
      >
        {cta_text || 'Get Started'}
      </a>
    </div>
  );
}

export async function PricingTable() {
  let plans;

  try {
    plans = await fetchPricingPlans();
  } catch (err) {
    throw new Error(
      `Failed to fetch pricing plans. The frontend build requires the Laravel API to be running.\n` +
        `Check that the API is reachable at ${API_URL} (configured via NEXT_PUBLIC_API_URL in .env.local)\n` +
        `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }

  if (!plans || plans.length === 0) return null;

  return (
    <section id="pricing" className="py-20" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-7xl px-6">
        <h2
          id="pricing-heading"
          className="text-center text-3xl font-bold"
          style={{ color: 'var(--color-foreground)' }}
        >
          Our Pricing
        </h2>
        <p
          className="mt-4 text-center"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          Flexible plans to match your business goals
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              interval={plan.interval}
              description={plan.description}
              features={plan.features}
              is_popular={plan.is_popular}
              cta_text={plan.cta_text}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
