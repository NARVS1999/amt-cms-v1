# `@amt/shared`

Shared Zod schemas for the Adsvance CMS API contract. Mirrors the Laravel API response shapes to provide build-time type safety for the Next.js frontend.

## Schemas

| File | Validates |
|------|-----------|
| `service.ts` | Services API response |
| `team-member.ts` | Team members API response |
| `page.ts` | Pages API response |
| `blog-post.ts` | Blog posts API response |
| `pricing-plan.ts` | Pricing plans + features API response |
| `contact.ts` | Contact form submission |
| `subscriber.ts` | Newsletter subscription |
| `theme.ts` | Theme settings response |

## Usage

```typescript
import { ServicesResponseSchema } from '@amt/shared';

const response = await fetch('/api/services');
const json = await response.json();
const parsed = ServicesResponseSchema.parse(json);
```

## Note

The Zod schemas are a TypeScript-side reference. Backend validation authority resides in Laravel FormRequest classes.
