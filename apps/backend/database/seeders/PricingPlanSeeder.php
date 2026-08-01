<?php

namespace Database\Seeders;

use App\Models\PricingPlan;
use Illuminate\Database\Seeder;

class PricingPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Starter',
                'price' => 99.00,
                'interval' => 'monthly',
                'description' => 'Perfect for small businesses just getting started with their online presence.',
                'cta_text' => 'Get Started',
                'is_popular' => false,
                'is_published' => true,
                'sort_order' => 0,
                'features' => [
                    ['description' => '5-page responsive website', 'is_included' => true, 'sort_order' => 0],
                    ['description' => 'Basic SEO setup', 'is_included' => true, 'sort_order' => 1],
                    ['description' => 'Contact form integration', 'is_included' => true, 'sort_order' => 2],
                    ['description' => 'Monthly analytics report', 'is_included' => false, 'sort_order' => 3],
                    ['description' => 'Priority support', 'is_included' => false, 'sort_order' => 4],
                ],
            ],
            [
                'name' => 'Growth',
                'price' => 199.00,
                'interval' => 'monthly',
                'description' => 'Ideal for growing businesses that need more features and ongoing support.',
                'cta_text' => 'Get Started',
                'is_popular' => true,
                'is_published' => true,
                'sort_order' => 1,
                'features' => [
                    ['description' => '15-page responsive website', 'is_included' => true, 'sort_order' => 0],
                    ['description' => 'Advanced SEO optimization', 'is_included' => true, 'sort_order' => 1],
                    ['description' => 'Contact form + lead capture', 'is_included' => true, 'sort_order' => 2],
                    ['description' => 'Monthly analytics report', 'is_included' => true, 'sort_order' => 3],
                    ['description' => 'Priority support', 'is_included' => false, 'sort_order' => 4],
                ],
            ],
            [
                'name' => 'Enterprise',
                'price' => 499.00,
                'interval' => 'monthly',
                'description' => 'Full-scale digital solution for established businesses looking to dominate their market.',
                'cta_text' => 'Contact Us',
                'is_popular' => false,
                'is_published' => true,
                'sort_order' => 2,
                'features' => [
                    ['description' => 'Unlimited pages & features', 'is_included' => true, 'sort_order' => 0],
                    ['description' => 'Full SEO & content strategy', 'is_included' => true, 'sort_order' => 1],
                    ['description' => 'Custom integrations & API', 'is_included' => true, 'sort_order' => 2],
                    ['description' => 'Weekly analytics & reporting', 'is_included' => true, 'sort_order' => 3],
                    ['description' => '24/7 priority support', 'is_included' => true, 'sort_order' => 4],
                ],
            ],
        ];

        foreach ($plans as $planData) {
            $features = $planData['features'];
            unset($planData['features']);

            $plan = PricingPlan::firstOrCreate(
                ['name' => $planData['name']],
                $planData
            );

            foreach ($features as $feature) {
                $plan->features()->firstOrCreate(
                    ['description' => $feature['description']],
                    $feature
                );
            }
        }

        $this->command->info('Seeded ' . count($plans) . ' pricing plans with features.');
    }
}
