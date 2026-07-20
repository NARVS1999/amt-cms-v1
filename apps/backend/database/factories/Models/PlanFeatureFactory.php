<?php

namespace Database\Factories\Models;

use App\Models\PlanFeature;
use App\Models\PricingPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

class PlanFeatureFactory extends Factory
{
    protected $model = PlanFeature::class;

    public function definition(): array
    {
        return [
            'pricing_plan_id' => PricingPlan::factory(),
            'description' => fake()->sentence(4),
            'is_included' => fake()->boolean(80),
            'sort_order' => fake()->numberBetween(0, 20),
        ];
    }
}
