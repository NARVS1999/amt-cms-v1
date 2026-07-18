import { z } from 'zod';

export const PlanFeatureSchema = z.object({
  id: z.number(),
  description: z.string(),
  is_included: z.boolean(),
});

export const PricingPlanSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number(),
  interval: z.enum(['monthly', 'yearly', 'one-time']),
  description: z.string().nullable(),
  is_popular: z.boolean().default(false),
  is_published: z.boolean().default(false),
  cta_text: z.string().nullable(),
  sort_order: z.number().default(0),
  features: z.array(PlanFeatureSchema),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const PricingPlansResponseSchema = z.object({
  data: z.array(PricingPlanSchema),
});

export type PricingPlan = z.infer<typeof PricingPlanSchema>;
export type PlanFeature = z.infer<typeof PlanFeatureSchema>;
export type PricingPlansResponse = z.infer<typeof PricingPlansResponseSchema>;
