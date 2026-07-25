<?php

namespace Tests\Feature;

use App\Models\PricingPlan;
use App\Models\PlanFeature;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricingPlansTest extends TestCase
{
    use RefreshDatabase;

    private function authToken(): string
    {
        $user = User::factory()->create();
        return $user->createToken('test')->plainTextToken;
    }

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

    public function test_admin_can_view_all_pricing_plans(): void
    {
        PricingPlan::factory()->create(['name' => 'Published Plan', 'is_published' => true, 'sort_order' => 1]);
        PricingPlan::factory()->create(['name' => 'Unpublished Plan', 'is_published' => false, 'sort_order' => 2]);

        $token = $this->authToken();

        $response = $this->withToken($token)->getJson('/api/admin/pricing-plans');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');

        $names = $response->json('data.*.name');
        $this->assertContains('Published Plan', $names);
        $this->assertContains('Unpublished Plan', $names);
    }

    public function test_admin_pricing_plans_returns_401_without_token(): void
    {
        $response = $this->getJson('/api/admin/pricing-plans');

        $response->assertStatus(401);
    }

    public function test_admin_can_reorder_pricing_plans(): void
    {
        $planA = PricingPlan::factory()->create(['sort_order' => 0]);
        $planB = PricingPlan::factory()->create(['sort_order' => 1]);
        $planC = PricingPlan::factory()->create(['sort_order' => 2]);

        $token = $this->authToken();

        $response = $this->withToken($token)->postJson('/api/pricing-plans/reorder', [
            'ids' => [$planC->id, $planB->id, $planA->id],
        ]);

        $response->assertStatus(200);
        $response->assertJson(['data' => ['message' => 'Reordered.']]);

        $this->assertEquals(0, PricingPlan::find($planC->id)->sort_order);
        $this->assertEquals(1, PricingPlan::find($planB->id)->sort_order);
        $this->assertEquals(2, PricingPlan::find($planA->id)->sort_order);
    }

    public function test_pricing_plans_reorder_returns_401_without_token(): void
    {
        $response = $this->postJson('/api/pricing-plans/reorder', ['ids' => [1]]);

        $response->assertStatus(401);
    }

    public function test_pricing_plans_reorder_validates_ids_required(): void
    {
        $token = $this->authToken();

        $response = $this->withToken($token)->postJson('/api/pricing-plans/reorder', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['ids']);
    }
}
