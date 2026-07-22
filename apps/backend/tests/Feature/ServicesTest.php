<?php

namespace Tests\Feature;

use App\Models\Service;
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
}
