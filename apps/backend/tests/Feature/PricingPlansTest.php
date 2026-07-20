<?php

namespace Tests\Feature;

use App\Models\PricingPlan;
use App\Models\PlanFeature;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricingPlansTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_published_plans_sorted_by_sort_order(): void
    {
        PricingPlan::factory()->create(['name' => 'Plan C', 'sort_order' => 3, 'is_published' => true]);
        PricingPlan::factory()->create(['name' => 'Plan A', 'sort_order' => 1, 'is_published' => true]);
        PricingPlan::factory()->create(['name' => 'Plan B', 'sort_order' => 2, 'is_published' => false]);

        $response = $this->getJson('/api/pricing-plans');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');

        $names = $response->json('data.*.name');
        $this->assertEquals(['Plan A', 'Plan C'], $names);
    }

    public function test_returns_empty_data_when_no_plans(): void
    {
        $response = $this->getJson('/api/pricing-plans');

        $response->assertStatus(200);
        $response->assertJson(['data' => []]);
    }

    public function test_single_plan_response_structure(): void
    {
        $plan = PricingPlan::factory()->create([
            'name' => 'Starter',
            'price' => 99.99,
            'interval' => 'monthly',
            'description' => 'Best for small businesses',
            'cta_text' => 'Get Started',
            'is_popular' => true,
            'is_published' => true,
            'sort_order' => 1,
        ]);

        PlanFeature::factory()->create([
            'pricing_plan_id' => $plan->id,
            'description' => 'Feature A',
            'is_included' => true,
            'sort_order' => 1,
        ]);

        $response = $this->getJson('/api/pricing-plans');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');

        $response->assertJsonPath('data.0.name', 'Starter');
        $response->assertJsonPath('data.0.price', 99.99);
        $response->assertJsonPath('data.0.interval', 'monthly');
        $response->assertJsonPath('data.0.description', 'Best for small businesses');
        $response->assertJsonPath('data.0.cta_text', 'Get Started');
        $response->assertJsonPath('data.0.is_popular', true);
        $response->assertJsonPath('data.0.is_published', true);
        $response->assertJsonPath('data.0.sort_order', 1);
    }

    public function test_plan_includes_nested_features(): void
    {
        $plan = PricingPlan::factory()->create(['is_published' => true]);

        PlanFeature::factory()->count(3)->create([
            'pricing_plan_id' => $plan->id,
        ]);

        $response = $this->getJson('/api/pricing-plans');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');

        $features = $response->json('data.0.features');
        $this->assertCount(3, $features);
        $this->assertArrayHasKey('id', $features[0]);
        $this->assertArrayHasKey('description', $features[0]);
        $this->assertArrayHasKey('is_included', $features[0]);
        $this->assertArrayHasKey('sort_order', $features[0]);
    }

    public function test_unpublished_plans_not_returned(): void
    {
        PricingPlan::factory()->create([
            'name' => 'Draft Plan',
            'is_published' => false,
        ]);

        $response = $this->getJson('/api/pricing-plans');

        $response->assertStatus(200);
        $response->assertJsonCount(0, 'data');
    }

    public function test_most_popular_single_plan(): void
    {
        PricingPlan::factory()->create(['name' => 'Plan A', 'is_popular' => true, 'is_published' => true]);
        PricingPlan::factory()->create(['name' => 'Plan B', 'is_popular' => false, 'is_published' => true]);

        $response = $this->getJson('/api/pricing-plans');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');

        $popularPlans = collect($response->json('data'))->where('is_popular', true);
        $this->assertCount(1, $popularPlans);
        $this->assertEquals('Plan A', $popularPlans->first()['name']);
    }
}
