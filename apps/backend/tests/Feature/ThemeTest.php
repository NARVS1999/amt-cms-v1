<?php

namespace Tests\Feature;

use App\Models\ThemeSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ThemeTest extends TestCase
{
    use RefreshDatabase;

    // =========================================================================
    // Public GET /api/theme
    // =========================================================================

    /**
     * GET /api/theme returns empty data when no settings exist.
     */
    public function test_get_theme_returns_empty_when_no_settings(): void
    {
        $response = $this->getJson('/api/theme');

        $response->assertStatus(200);
        $response->assertJsonStructure(['data' => []]);
    }

    /**
     * GET /api/theme returns settings when they exist.
     */
    public function test_get_theme_returns_settings(): void
    {
        ThemeSetting::create([
            'primary_color' => '#FF0000',
            'secondary_color' => '#fb3d03',
        ]);

        $response = $this->getJson('/api/theme');

        $response->assertStatus(200);
        $response->assertJsonPath('data.primary_color', '#FF0000');
        $response->assertJsonPath('data.secondary_color', '#fb3d03');
    }

    // =========================================================================
    // Admin PUT /api/admin/theme
    // =========================================================================

    /**
     * Authenticated admin can update theme settings.
     */
    public function test_admin_can_update_theme_settings(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withToken($token)->putJson('/api/admin/theme', [
            'primary_color' => '#00FF00',
            'body_font' => 'Inter',
        ]);

        $response->assertStatus(200);
        $response->assertJsonPath('data.primary_color', '#00FF00');
        $response->assertJsonPath('data.body_font', 'Inter');

        // Verify in database
        $this->assertDatabaseHas('theme_settings', [
            'primary_color' => '#00FF00',
            'body_font' => 'Inter',
        ]);
    }

    /**
     * PUT /api/admin/theme creates settings if none exist.
     */
    public function test_update_theme_creates_settings_if_none_exist(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->assertDatabaseCount('theme_settings', 0);

        $response = $this->withToken($token)->putJson('/api/admin/theme', [
            'primary_color' => '#FF0000',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseCount('theme_settings', 1);
        $this->assertDatabaseHas('theme_settings', ['primary_color' => '#FF0000']);
    }

    /**
     * PUT /api/admin/theme updates existing settings.
     */
    public function test_update_theme_updates_existing_settings(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        ThemeSetting::create(['primary_color' => '#FF0000']);

        $response = $this->withToken($token)->putJson('/api/admin/theme', [
            'primary_color' => '#00FF00',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('theme_settings', ['primary_color' => '#00FF00']);
        $this->assertDatabaseCount('theme_settings', 1); // Still only one row
    }

    /**
     * Unauthenticated request to PUT /api/admin/theme returns 401.
     */
    public function test_unauthenticated_cannot_update_theme(): void
    {
        $response = $this->putJson('/api/admin/theme', [
            'primary_color' => '#FF0000',
        ]);

        $response->assertStatus(401);
        $response->assertJson(['message' => 'Unauthenticated.']);
    }

    /**
     * Partial update only changes specified fields.
     */
    public function test_partial_update_preserves_existing_fields(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        ThemeSetting::create([
            'primary_color' => '#FF0000',
            'secondary_color' => '#00FF00',
        ]);

        $response = $this->withToken($token)->putJson('/api/admin/theme', [
            'primary_color' => '#0000FF',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('theme_settings', [
            'primary_color' => '#0000FF',
            'secondary_color' => '#00FF00', // Preserved
        ]);
    }
}
