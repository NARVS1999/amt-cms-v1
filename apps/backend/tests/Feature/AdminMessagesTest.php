<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AdminMessagesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test GET /api/admin/messages returns messages sorted newest first.
     */
    public function test_admin_can_list_messages_sorted_newest_first(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $old = ContactMessage::create([
            'name' => 'Old User',
            'email' => 'old@example.com',
            'message' => 'Old message.',
            'read_at' => null,
        ]);
        DB::table('contact_contact_messages')->where('id', $old->id)->update(['created_at' => now()->subDays(2)]);

        $mid = ContactMessage::create([
            'name' => 'Mid User',
            'email' => 'mid@example.com',
            'message' => 'Mid message.',
            'read_at' => null,
        ]);
        DB::table('contact_contact_messages')->where('id', $mid->id)->update(['created_at' => now()->subDay()]);

        $new = ContactMessage::create([
            'name' => 'New User',
            'email' => 'new@example.com',
            'message' => 'New message.',
            'read_at' => null,
        ]);

        $response = $this->withToken($token)->getJson('/api/admin/messages');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'email', 'message', 'read_at', 'created_at', 'updated_at'],
            ],
        ]);

        $ids = $response->json('data.*.id');
        $this->assertEquals([$new->id, $mid->id, $old->id], $ids);
    }

    /**
     * Test messages list returns empty array when no messages exist.
     */
    public function test_messages_list_returns_empty_when_no_messages(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/admin/messages');

        $response->assertStatus(200);
        $response->assertJson(['data' => []]);
    }

    /**
     * Test unauthenticated access returns 401.
     */
    public function test_unauthenticated_messages_list_returns_401(): void
    {
        $response = $this->getJson('/api/admin/messages');

        $response->assertStatus(401);
    }

    /**
     * Test PUT /api/admin/messages/{id}/read toggles read status.
     */
    public function test_admin_can_toggle_read_status(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $message = ContactMessage::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'message' => 'Test message.',
            'read_at' => null,
        ]);

        $this->assertNull($message->fresh()->read_at);

        // First toggle: null → timestamp
        $response = $this->withToken($token)->putJson("/api/admin/messages/{$message->id}/read");
        $response->assertStatus(200);
        $this->assertNotNull($message->fresh()->read_at);

        // Second toggle: timestamp → null
        $response = $this->withToken($token)->putJson("/api/admin/messages/{$message->id}/read");
        $response->assertStatus(200);
        $this->assertNull($message->fresh()->read_at);
    }

    /**
     * Test DELETE /api/admin/messages/{id} removes the message.
     */
    public function test_admin_can_delete_message(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $message = ContactMessage::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'message' => 'Test message.',
            'read_at' => null,
        ]);

        $response = $this->withToken($token)->deleteJson("/api/admin/messages/{$message->id}");

        $response->assertStatus(200);
        $this->assertDatabaseEmpty('contact_contact_messages');
    }

    /**
     * Test DELETE /api/admin/messages/{id} returns 404 for nonexistent message.
     */
    public function test_delete_nonexistent_message_returns_404(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->deleteJson('/api/admin/messages/99999');

        $response->assertStatus(404);
    }
}
