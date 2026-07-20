<?php

namespace Database\Factories\Models;

use App\Models\PricingPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

class PricingPlanFactory extends Factory
{
    protected $model = PricingPlan::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(2, true),
            'price' => fake()->randomFloat(2, 49, 999),
            'interval' => fake()->randomElement(['monthly', 'yearly', 'one-time']),
            'description' => fake()->sentence(),
            'cta_text' => 'Get Started',
            'is_popular' => false,
            'is_published' => true,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
