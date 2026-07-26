<?php

namespace Tests\Feature;

use App\Models\Subscriber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AdminSubscribersTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test GET /api/admin/subscribers returns subscribers sorted newest first.
     */
    public function test_admin_can_list_subscribers_sorted_newest_first(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $old = Subscriber::create([
            'email' => 'old@example.com',
            'subscribed_at' => now()->subDays(2),
        ]);
        DB::table('contact_subscribers')->where('id', $old->id)->update(['created_at' => now()->subDays(2)]);

        $mid = Subscriber::create([
            'email' => 'mid@example.com',
            'subscribed_at' => now()->subDay(),
        ]);
        DB::table('contact_subscribers')->where('id', $mid->id)->update(['created_at' => now()->subDay()]);

        $new = Subscriber::create([
            'email' => 'new@example.com',
            'subscribed_at' => now(),
        ]);

        $response = $this->withToken($token)->getJson('/api/admin/subscribers');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'email', 'subscribed_at', 'created_at', 'updated_at'],
            ],
        ]);

        $ids = $response->json('data.*.id');
        $this->assertEquals([$new->id, $mid->id, $old->id], $ids);
    }

    /**
     * Test subscribers list returns empty array when no subscribers exist.
     */
    public function test_subscribers_list_returns_empty_when_no_subscribers(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/admin/subscribers');

        $response->assertStatus(200);
        $response->assertJson(['data' => []]);
    }

    /**
     * Test unauthenticated access returns 401.
     */
    public function test_unauthenticated_subscribers_list_returns_401(): void
    {
        $response = $this->getJson('/api/admin/subscribers');

        $response->assertStatus(401);
    }

    /**
     * Test DELETE /api/admin/subscribers/{id} removes the subscriber.
     */
    public function test_admin_can_delete_subscriber(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $subscriber = Subscriber::create([
            'email' => 'sub@example.com',
            'subscribed_at' => now(),
        ]);

        $response = $this->withToken($token)->deleteJson("/api/admin/subscribers/{$subscriber->id}");

        $response->assertStatus(200);
        $this->assertDatabaseEmpty('contact_subscribers');
    }

    /**
     * Test DELETE /api/admin/subscribers/{id} returns 404 for nonexistent subscriber.
     */
    public function test_delete_nonexistent_subscriber_returns_404(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->deleteJson('/api/admin/subscribers/99999');

        $response->assertStatus(404);
    }
}
