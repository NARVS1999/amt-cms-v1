<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
        ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'token',
                'user' => ['id', 'name', 'email'],
            ],
        ]);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_user_can_logout(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $response = $this->postJson('/api/logout', [], [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_authenticated_user_can_access_me(): void
    {
        $token = $this->user->createToken('test')->plainTextToken;

        $response = $this->getJson('/api/me', [
            'Authorization' => 'Bearer ' . $token,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => ['id', 'name', 'email'],
        ]);
    }

    public function test_unauthenticated_user_cannot_access_me(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401);
    }

    public function test_user_can_request_password_reset(): void
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'admin@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment(['message' => 'Password reset link sent.']);
    }

    public function test_user_can_reset_password(): void
    {
        $token = Password::broker()->createToken($this->user);

        $response = $this->postJson('/api/reset-password', [
            'email' => 'admin@example.com',
            'token' => $token,
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment(['message' => 'Password reset successfully.']);
    }

    public function test_remember_me_returns_token_with_extended_expiry(): void
    {
        $response = $this->postJson('/api/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
            'remember' => true,
        ]);

        $response->assertStatus(200);

        $token = $this->user->tokens()->first();
        $this->assertNotNull($token->expires_at);
        $this->assertGreaterThan(now()->addDays(2), $token->expires_at);
    }

    public function test_unauthenticated_user_receives_401_on_protected_routes(): void
    {
        $this->getJson('/api/media')->assertStatus(401);
        $this->getJson('/api/admin/stats')->assertStatus(401);
    }

    public function test_forgot_password_returns_same_message_for_unknown_email(): void
    {
        $response = $this->postJson('/api/forgot-password', [
            'email' => 'nonexistent@example.com',
        ]);

        $response->assertStatus(200);
        $response->assertJsonFragment(['message' => 'Password reset link sent.']);
    }
}
