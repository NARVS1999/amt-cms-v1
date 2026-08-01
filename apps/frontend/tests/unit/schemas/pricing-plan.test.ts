import { describe, it, expect } from 'vitest';
import { PricingPlanSchema, PlanFeatureSchema, PricingPlansResponseSchema } from '@amt/shared';

const baseFeature = {
  id: 1,
  description: 'Unlimited pages',
  is_included: true,
  sort_order: 0,
};

const basePlan = {
  id: 1,
  name: 'Starter',
  price: 9900,
  interval: 'monthly',
  description: null,
  is_popular: false,
  is_published: true,
  cta_text: 'Get Started',
  sort_order: 0,
  features: [baseFeature],
  created_at: '2026-07-26T00:00:00.000000Z',
  updated_at: '2026-07-26T00:00:00.000000Z',
};

describe('PlanFeature Zod Schema', () => {
  it('accepts a valid feature', () => {
    expect(PlanFeatureSchema.safeParse(baseFeature).success).toBe(true);
  });

  it('defaults sort_order to 0', () => {
    const { sort_order } = PlanFeatureSchema.parse({ ...baseFeature, sort_order: undefined });
    expect(sort_order).toBe(0);
  });

  it('rejects missing description', () => {
    expect(PlanFeatureSchema.safeParse({ ...baseFeature, description: undefined }).success).toBe(false);
  });

  it('rejects non-boolean is_included', () => {
    expect(PlanFeatureSchema.safeParse({ ...baseFeature, is_included: 1 }).success).toBe(false);
  });
});

describe('PricingPlan Zod Schema', () => {
  it('accepts a valid plan', () => {
    expect(PricingPlanSchema.safeParse(basePlan).success).toBe(true);
  });

  it.each(['monthly', 'yearly', 'one-time'])('accepts interval %s', (interval) => {
    expect(PricingPlanSchema.safeParse({ ...basePlan, interval }).success).toBe(true);
  });

  it('rejects unknown interval', () => {
    const result = PricingPlanSchema.safeParse({ ...basePlan, interval: 'weekly' });
    expect(result.success).toBe(false);
  });

  it('defaults is_popular to false when omitted', () => {
    const { is_popular } = PricingPlanSchema.parse({ ...basePlan, is_popular: undefined });
    expect(is_popular).toBe(false);
  });

  it('defaults is_published to false when omitted', () => {
    const { is_published } = PricingPlanSchema.parse({ ...basePlan, is_published: undefined });
    expect(is_published).toBe(false);
  });

  it('rejects missing price', () => {
    expect(PricingPlanSchema.safeParse({ ...basePlan, price: undefined }).success).toBe(false);
  });

  it('rejects string price', () => {
    expect(PricingPlanSchema.safeParse({ ...basePlan, price: '99' }).success).toBe(false);
  });

  it('rejects missing features array', () => {
    expect(PricingPlanSchema.safeParse({ ...basePlan, features: undefined }).success).toBe(false);
  });

  it('rejects features containing invalid entries', () => {
    const result = PricingPlanSchema.safeParse({
      ...basePlan,
      features: [{ ...baseFeature, is_included: 'yes' }],
    });
    expect(result.success).toBe(false);
  });
});

describe('PricingPlansResponseSchema', () => {
  it('accepts plans array under data', () => {
    expect(PricingPlansResponseSchema.safeParse({ data: [basePlan] }).success).toBe(true);
  });

  it('rejects data without envelope', () => {
    expect(PricingPlansResponseSchema.safeParse([basePlan]).success).toBe(false);
  });
});
