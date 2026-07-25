<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServicesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test GET /api/services returns 200 with data envelope.
     */
    public function test_returns_services_sorted_by_sort_order(): void
    {
        // Create services out of order
        Service::factory()->create(['title' => 'Service C', 'sort_order' => 3]);
        Service::factory()->create(['title' => 'Service A', 'sort_order' => 1]);
        Service::factory()->create(['title' => 'Service B', 'sort_order' => 2]);

        $response = $this->getJson('/api/services');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'title',
                    'description',
                    'icon',
                    'is_featured',
                    'sort_order',
                    'created_at',
                    'updated_at',
                ],
            ],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);

        // Verify sort order
        $titles = $response->json('data.*.title');
        $this->assertEquals(['Service A', 'Service B', 'Service C'], $titles);
    }

    /**
     * Test that the response is empty when no services exist.
     */
    public function test_returns_empty_data_when_no_services(): void
    {
        $response = $this->getJson('/api/services');

        $response->assertStatus(200);
        $response->assertJson(['data' => []]);
    }

    /**
     * Test a single service in the response.
     */
    public function test_single_service_response_structure(): void
    {
        $service = Service::factory()->create([
            'title' => 'Web Development',
            'description' => 'Custom websites built with modern technologies.',
            'icon' => 'fa-solid fa-code',
            'is_featured' => true,
            'sort_order' => 1,
        ]);

        $response = $this->getJson('/api/services');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');

        $response->assertJsonPath('data.0.title', 'Web Development');
        $response->assertJsonPath('data.0.description', 'Custom websites built with modern technologies.');
        $response->assertJsonPath('data.0.icon', 'fa-solid fa-code');
        $response->assertJsonPath('data.0.is_featured', true);
        $response->assertJsonPath('data.0.sort_order', 1);
    }

    public function test_admin_can_reorder_services(): void
    {
        $serviceA = Service::factory()->create(['sort_order' => 0]);
        $serviceB = Service::factory()->create(['sort_order' => 1]);
        $serviceC = Service::factory()->create(['sort_order' => 2]);

        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/services/reorder', [
            'ids' => [$serviceC->id, $serviceB->id, $serviceA->id],
        ]);

        $response->assertStatus(200);
        $response->assertJson(['data' => ['message' => 'Reordered.']]);

        $this->assertEquals(0, Service::find($serviceC->id)->sort_order);
        $this->assertEquals(1, Service::find($serviceB->id)->sort_order);
        $this->assertEquals(2, Service::find($serviceA->id)->sort_order);
    }

    public function test_services_reorder_returns_401_without_token(): void
    {
        $response = $this->postJson('/api/services/reorder', ['ids' => [1]]);

        $response->assertStatus(401);
    }

    public function test_services_reorder_validates_ids_required(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/services/reorder', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['ids']);
    }
}
