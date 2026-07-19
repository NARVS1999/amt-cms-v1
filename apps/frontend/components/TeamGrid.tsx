import { fetchTeamMembers, API_URL } from '@/lib/api';

function getInitials(name: string): string {
  const trimmed = name?.trim() ?? '';
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return Array.from(parts[0])[0]?.toUpperCase() ?? '?';
  const first = Array.from(parts[0])[0] ?? '';
  const last = Array.from(parts[parts.length - 1])[0] ?? '';
  return (first + last).toUpperCase();
}

function TeamCard({
  name,
  role,
  bio,
  photo_url,
  social_links,
}: {
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  social_links: { linkedin?: string | null; twitter?: string | null } | null;
}) {
  const initials = getInitials(name);

  return (
    <div
      className="rounded-xl border border-[var(--color-border)] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ background: 'var(--color-background)' }}
    >
      {/* Photo or initials placeholder */}
      {photo_url ? (
        <img
          src={photo_url}
          alt={name}
          width={64}
          height={64}
          loading="lazy"
          className="mx-auto h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <div
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold"
          style={{ background: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }}
        >
          {initials}
        </div>
      )}

      {/* Name */}
      <h3 className="mt-4 text-lg font-semibold" style={{ color: 'var(--color-foreground)' }}>
        {name}
      </h3>

      {/* Role */}
      <p className="mt-1 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
        {role}
      </p>

      {/* Bio — truncated to 2 lines */}
      {bio && (
        <p
          className="mt-2 line-clamp-2 text-sm leading-relaxed"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          {bio}
        </p>
      )}

      {/* Social links — only if at least one exists */}
      {social_links && (social_links.linkedin || social_links.twitter) && (
        <div className="mt-4 flex justify-center gap-3">
          {social_links.linkedin && (
            <a
              href={social_links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="transition-colors hover:opacity-80"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              <i className="fa-brands fa-linkedin-in" />
            </a>
          )}
          {social_links.twitter && (
            <a
              href={social_links.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="transition-colors hover:opacity-80"
              style={{ color: 'var(--color-muted-foreground)' }}
            >
              <i className="fa-brands fa-x-twitter" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export async function TeamGrid() {
  let members;

  try {
    members = await fetchTeamMembers();
  } catch (err) {
    throw new Error(
      `Failed to fetch team members. The frontend build requires the Laravel API to be running.\n` +
        `Check that the API is reachable at ${API_URL} (configured via NEXT_PUBLIC_API_URL in .env.local)\n` +
        `Error: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }

  // Empty state — hide the section entirely
  if (!members || members.length === 0) return null;

  return (
    <section id="team" className="py-20" aria-labelledby="team-heading">
      <div className="mx-auto max-w-7xl px-6">
        <h2
          id="team-heading"
          className="text-center text-3xl font-bold"
          style={{ color: 'var(--color-foreground)' }}
        >
          Meet Our Team
        </h2>
        <p
          className="mt-4 text-center"
          style={{ color: 'var(--color-muted-foreground)' }}
        >
          The people behind Adsvance Media Tech
        </p>

        {/* Responsive grid: 1-col mobile, 2-col tablet, 4-col desktop */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => (
            <TeamCard
              key={member.id}
              name={member.name}
              role={member.role}
              bio={member.bio}
              photo_url={member.photo_url}
              social_links={member.social_links}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
