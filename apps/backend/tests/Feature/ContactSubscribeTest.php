<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Models\Service;
use App\Models\Subscriber;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class ContactSubscribeTest extends TestCase
{
    use RefreshDatabase;

    // =========================================================================
    // Contact Endpoint Tests  (Task 7.1)
    // =========================================================================

    /**
     * Valid contact submission → HTTP 201, ContactMessage created with read_at: null.
     */
    public function test_contact_valid_submission(): void
    {
        $response = $this->postJson('/api/contact', [
            'name' => 'Maria Santos',
            'email' => 'maria@example.com',
            'message' => 'I would like to discuss a project.',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => [
                'message',
                'contact_message' => [
                    'id',
                    'name',
                    'email',
                    'created_at',
                ],
            ],
        ]);
        $response->assertJsonPath('data.contact_message.name', 'Maria Santos');
        $response->assertJsonPath('data.contact_message.email', 'maria@example.com');

        // Verify record created with read_at: null
        $this->assertDatabaseCount('contact_contact_messages', 1);
        $message = ContactMessage::first();
        $this->assertNotNull($message);
        $this->assertNull($message->read_at);
        $this->assertEquals('Maria Santos', $message->name);
        $this->assertEquals('maria@example.com', $message->email);
    }

    /**
     * Missing name → HTTP 422.
     */
    public function test_contact_missing_name_returns_422(): void
    {
        $response = $this->postJson('/api/contact', [
            'email' => 'maria@example.com',
            'message' => 'I would like to discuss a project.',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['message', 'errors']);
        $response->assertJsonFragment(['Your name is required.']);
    }

    /**
     * Missing email → HTTP 422.
     */
    public function test_contact_missing_email_returns_422(): void
    {
        $response = $this->postJson('/api/contact', [
            'name' => 'Maria Santos',
            'message' => 'I would like to discuss a project.',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['message', 'errors']);
        $response->assertJsonFragment(['Your email address is required.']);
    }

    /**
     * Missing message → HTTP 422.
     */
    public function test_contact_missing_message_returns_422(): void
    {
        $response = $this->postJson('/api/contact', [
            'name' => 'Maria Santos',
            'email' => 'maria@example.com',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['message', 'errors']);
        $response->assertJsonFragment(['A message is required.']);
    }

    /**
     * Rate limit — 6th request gets HTTP 429 (limit is 5/min).
     */
    public function test_contact_rate_limit(): void
    {
        // Flush cache so earlier test hits don't contaminate this test
        Cache::flush();

        $payload = [
            'name' => 'Rate Test',
            'email' => 'ratelimit@test.com',
            'message' => 'Testing contact rate limiting.',
        ];

        // Send 5 requests — all should succeed
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/contact', $payload);
            $response->assertStatus(201);
        }

        // 6th request — should be rate limited
        $response = $this->postJson('/api/contact', $payload);
        $response->assertStatus(429);
        $response->assertJson([
            'message' => 'Too many attempts. Please try again in 60 seconds.',
        ]);
    }

    // =========================================================================
    // Subscribe Endpoint Tests  (Task 7.2)
    // =========================================================================

    /**
     * Valid email → HTTP 201, Subscriber created.
     */
    public function test_subscribe_valid_email(): void
    {
        $response = $this->postJson('/api/subscribe', [
            'email' => 'user@example.com',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => [
                'message',
                'subscriber' => [
                    'id',
                    'email',
                    'subscribed_at',
                ],
            ],
        ]);
        $response->assertJsonPath('data.subscriber.email', 'user@example.com');

        // Verify record created
        $this->assertDatabaseCount('contact_subscribers', 1);
        $subscriber = Subscriber::first();
        $this->assertNotNull($subscriber);
        $this->assertEquals('user@example.com', $subscriber->email);
        $this->assertNotNull($subscriber->subscribed_at);
    }

    /**
     * Duplicate email → HTTP 422 with "Already subscribed."
     */
    public function test_subscribe_duplicate_email_returns_422(): void
    {
        // Create first subscription
        $this->postJson('/api/subscribe', [
            'email' => 'duplicate@example.com',
        ])->assertStatus(201);

        // Try again with same email
        $response = $this->postJson('/api/subscribe', [
            'email' => 'duplicate@example.com',
        ]);

        $response->assertStatus(422);
        $response->assertJsonStructure(['message', 'errors']);
        $response->assertJsonFragment(['Already subscribed.']);
    }

    /**
     * Rate limit — 4th request gets HTTP 429 (limit is 3/min).
     */
    public function test_subscribe_rate_limit(): void
    {
        // Flush cache so earlier test hits don't contaminate this test
        Cache::flush();

        // Send 3 requests with unique emails — all should succeed
        for ($i = 0; $i < 3; $i++) {
            $response = $this->postJson('/api/subscribe', [
                'email' => 'subrate' . $i . '@test.com',
            ]);
            $response->assertStatus(201);
        }

        // 4th request — should be rate limited
        $response = $this->postJson('/api/subscribe', [
            'email' => 'subrate4@test.com',
        ]);
        $response->assertStatus(429);
        $response->assertJson([
            'message' => 'Too many attempts. Please try again in 60 seconds.',
        ]);
    }

    // =========================================================================
    // 404 Handling  (Task 7.3)
    // =========================================================================

    /**
     * GET /api/nonexistent → HTTP 404.
     */
    public function test_nonexistent_route_returns_404(): void
    {
        $response = $this->getJson('/api/nonexistent');

        $response->assertStatus(404);
        $response->assertJson(['message' => 'Not found.']);
    }

    // =========================================================================
    // Auth Protection  (Task 7.4)
    // =========================================================================

    /**
     * POST /api/services without auth token → HTTP 401.
     */
    public function test_unauthenticated_post_to_admin_endpoint_returns_401(): void
    {
        $response = $this->postJson('/api/services', [
            'title' => 'Unauthorized Service',
            'description' => 'Should not be created.',
            'icon' => 'fa-solid fa-lock',
        ]);

        $response->assertStatus(401);
        $response->assertJson(['message' => 'Unauthenticated.']);
    }

    /**
     * POST /api/services with valid Sanctum token → HTTP 201 (or 422 if invalid).
     */
    public function test_authenticated_post_to_admin_endpoint_succeeds(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/services', [
            'title' => 'Web Development',
            'description' => 'Full-stack web development services.',
            'icon' => 'fa-solid fa-code',
            'is_featured' => true,
            'sort_order' => 1,
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => ['id', 'title', 'description', 'icon', 'is_featured', 'sort_order', 'created_at', 'updated_at'],
        ]);
        $response->assertJsonPath('data.title', 'Web Development');
        $response->assertJsonPath('data.description', 'Full-stack web development services.');
        $response->assertJsonPath('data.icon', 'fa-solid fa-code');
        $response->assertJsonPath('data.is_featured', true);
        $response->assertJsonPath('data.sort_order', 1);

        // Verify created in database
        $this->assertDatabaseCount('marketing_services', 1);
        $this->assertDatabaseHas('marketing_services', ['title' => 'Web Development']);
    }

    // =========================================================================
    // Admin Login Rate Limit  (Decision: Add test here)
    // =========================================================================

    /**
     * POST /api/admin/login >5/min → HTTP 429.
     */
    public function test_admin_login_rate_limit(): void
    {
        Cache::flush();

        $user = User::factory()->create([
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
        ]);

        $payload = [
            'email' => 'admin@test.com',
            'password' => 'password',
        ];

        // Send 5 requests — all should succeed
        for ($i = 0; $i < 5; $i++) {
            $response = $this->postJson('/api/admin/login', $payload);
            $response->assertStatus(200);
        }

        // 6th request — should be rate limited
        $response = $this->postJson('/api/admin/login', $payload);
        $response->assertStatus(429);
        $response->assertJson([
            'message' => 'Too many attempts. Please try again in 60 seconds.',
        ]);
    }

    // =========================================================================
    // CORS Preflight  (Patch F1)
    // =========================================================================

    /**
     * OPTIONS preflight with non-matching Origin → no Access-Control-Allow-Origin for evil.com.
     */
    public function test_cors_rejects_non_matching_origin(): void
    {
        Config::set('cors.allowed_origins', ['https://allowed-domain.com']);

        $response = $this->call('OPTIONS', '/api/services', [], [], [], [
            'HTTP_ORIGIN' => 'https://evil.com',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST',
        ]);

        $allowed = $response->headers->get('Access-Control-Allow-Origin');
        $this->assertNotEquals('https://evil.com', $allowed, 'CORS should not allow evil.com');
    }
}
