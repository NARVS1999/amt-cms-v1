<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Models\Page;
use App\Models\Service;
use App\Models\Subscriber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    protected function authHeaders(): array
    {
        return ['Authorization' => 'Bearer '.$this->token];
    }

    public function test_unauthenticated_request_returns_401(): void
    {
        $response = $this->getJson('/api/admin/stats');

        $response->assertStatus(401);
    }

    public function test_returns_zero_counts_when_database_empty(): void
    {
        $response = $this->getJson('/api/admin/stats', $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJson([
            'services' => 0,
            'blog_posts' => 0,
            'unread_messages' => 0,
            'subscribers' => 0,
        ]);
    }

    public function test_returns_correct_counts_with_data(): void
    {
        Service::factory()->count(3)->create();
        Page::factory()->count(5)->create(['is_published' => true]);
        Page::factory()->count(2)->create(['is_published' => false]);
        ContactMessage::create(['name' => 'A', 'email' => 'a@b.com', 'message' => 'test', 'read_at' => null]);
        ContactMessage::create(['name' => 'B', 'email' => 'b@b.com', 'message' => 'test', 'read_at' => null]);
        ContactMessage::create(['name' => 'C', 'email' => 'c@b.com', 'message' => 'test', 'read_at' => null]);
        ContactMessage::create(['name' => 'D', 'email' => 'd@b.com', 'message' => 'test', 'read_at' => null]);
        ContactMessage::create(['name' => 'E', 'email' => 'e@b.com', 'message' => 'test', 'read_at' => now()]);
        Subscriber::create(['email' => 's1@b.com', 'subscribed_at' => now()]);
        Subscriber::create(['email' => 's2@b.com', 'subscribed_at' => now()]);
        Subscriber::create(['email' => 's3@b.com', 'subscribed_at' => now()]);
        Subscriber::create(['email' => 's4@b.com', 'subscribed_at' => now()]);
        Subscriber::create(['email' => 's5@b.com', 'subscribed_at' => now()]);
        Subscriber::create(['email' => 's6@b.com', 'subscribed_at' => now()]);

        $response = $this->getJson('/api/admin/stats', $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJson([
            'services' => 3,
            'blog_posts' => 0,
            'unread_messages' => 4,
            'subscribers' => 6,
        ]);
    }

    public function test_stats_update_after_creating_service(): void
    {
        $response = $this->getJson('/api/admin/stats', $this->authHeaders());
        $response->assertStatus(200);
        $response->assertJson(['services' => 0]);

        Service::factory()->create();

        $response = $this->getJson('/api/admin/stats', $this->authHeaders());
        $response->assertJson(['services' => 1]);
    }

    public function test_returns_four_top_level_keys(): void
    {
        $response = $this->getJson('/api/admin/stats', $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'services',
            'blog_posts',
            'unread_messages',
            'subscribers',
        ]);
    }
}
