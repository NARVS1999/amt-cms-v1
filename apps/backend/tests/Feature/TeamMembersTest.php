<?php

namespace Tests\Feature;

use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamMembersTest extends TestCase
{
    use RefreshDatabase;

    private function authToken(): string
    {
        $user = User::factory()->create();
        return $user->createToken('test')->plainTextToken;
    }

    /**
     * Test GET /api/team returns 200 with sorted data.
     */
    public function test_returns_team_members_sorted_by_sort_order(): void
    {
        // Create team members out of order
        TeamMember::factory()->create(['name' => 'Member C', 'sort_order' => 3]);
        TeamMember::factory()->create(['name' => 'Member A', 'sort_order' => 1]);
        TeamMember::factory()->create(['name' => 'Member B', 'sort_order' => 2]);

        $response = $this->getJson('/api/team');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'role',
                    'bio',
                    'photo_url',
                    'social_links',
                    'sort_order',
                    'created_at',
                    'updated_at',
                ],
            ],
        ]);

        // Verify sort order
        $names = $response->json('data.*.name');
        $this->assertEquals(['Member A', 'Member B', 'Member C'], $names);
    }

    /**
     * Test that the response is empty when no team members exist.
     */
    public function test_returns_empty_data_when_no_team_members(): void
    {
        $response = $this->getJson('/api/team');

        $response->assertStatus(200);
        $response->assertJson(['data' => []]);
    }

    /**
     * Test a single team member response structure.
     */
    public function test_single_team_member_response_structure(): void
    {
        $member = TeamMember::factory()->create([
            'name' => 'John Doe',
            'role' => 'CEO',
            'bio' => 'Founder and CEO of Adsvance Media Tech.',
            'social_links' => [
                'linkedin' => 'https://linkedin.com/in/johndoe',
                'twitter' => 'https://twitter.com/johndoe',
            ],
            'sort_order' => 1,
        ]);

        $response = $this->getJson('/api/team');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');

        $response->assertJsonPath('data.0.name', 'John Doe');
        $response->assertJsonPath('data.0.role', 'CEO');
        $response->assertJsonPath('data.0.bio', 'Founder and CEO of Adsvance Media Tech.');
        $response->assertJsonPath('data.0.sort_order', 1);
        $response->assertJsonPath('data.0.social_links.linkedin', 'https://linkedin.com/in/johndoe');
        $response->assertJsonPath('data.0.social_links.twitter', 'https://twitter.com/johndoe');
    }

    /**
     * Test that social_links can be null.
     */
    public function test_social_links_can_be_null(): void
    {
        TeamMember::factory()->create([
            'name' => 'Jane Smith',
            'social_links' => null,
        ]);

        $response = $this->getJson('/api/team');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
        $this->assertNull($response->json('data.0.social_links'));
    }

    public function test_can_upload_team_member_photo(): void
    {
        $member = TeamMember::factory()->create();
        $token = $this->authToken();

        $file = UploadedFile::fake()->image('photo.jpg');
        $response = $this->withToken($token)->postJson("/api/team/{$member->id}/photo", [
            'photo' => $file,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['data' => ['id', 'photo_url']]);
        $this->assertNotNull($response->json('data.photo_url'));
    }

    public function test_cannot_upload_photo_when_already_exists(): void
    {
        $member = TeamMember::factory()->create();
        $token = $this->authToken();

        $file = UploadedFile::fake()->image('photo.jpg');
        $this->withToken($token)->postJson("/api/team/{$member->id}/photo", [
            'photo' => $file,
        ]);

        $response = $this->withToken($token)->postJson("/api/team/{$member->id}/photo", [
            'photo' => UploadedFile::fake()->image('photo2.jpg'),
        ]);

        $response->assertStatus(422);
        $response->assertJson(['message' => 'Remove existing photo first']);
    }

    public function test_can_remove_team_member_photo(): void
    {
        $member = TeamMember::factory()->create();
        $token = $this->authToken();

        $file = UploadedFile::fake()->image('photo.jpg');
        $this->withToken($token)->postJson("/api/team/{$member->id}/photo", [
            'photo' => $file,
        ]);

        $response = $this->withToken($token)->deleteJson("/api/team/{$member->id}/photo");

        $response->assertStatus(200);
        $response->assertJsonStructure(['data' => ['id', 'photo_url']]);
        $this->assertNull($response->json('data.photo_url'));
    }

    public function test_photo_endpoints_return_401_without_token(): void
    {
        $member = TeamMember::factory()->create();

        $postResponse = $this->postJson("/api/team/{$member->id}/photo");
        $postResponse->assertStatus(401);

        $deleteResponse = $this->deleteJson("/api/team/{$member->id}/photo");
        $deleteResponse->assertStatus(401);
    }

    public function test_admin_can_reorder_team_members(): void
    {
        $memberA = TeamMember::factory()->create(['sort_order' => 0]);
        $memberB = TeamMember::factory()->create(['sort_order' => 1]);

        $token = $this->authToken();

        $response = $this->withToken($token)->postJson('/api/team/reorder', [
            'ids' => [$memberB->id, $memberA->id],
        ]);

        $response->assertStatus(200);
        $response->assertJson(['data' => ['message' => 'Reordered.']]);

        $this->assertEquals(0, TeamMember::find($memberB->id)->sort_order);
        $this->assertEquals(1, TeamMember::find($memberA->id)->sort_order);
    }

    public function test_team_reorder_returns_401_without_token(): void
    {
        $response = $this->postJson('/api/team/reorder', ['ids' => [1]]);

        $response->assertStatus(401);
    }

    public function test_team_reorder_validates_ids_required(): void
    {
        $token = $this->authToken();

        $response = $this->withToken($token)->postJson('/api/team/reorder', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['ids']);
    }
}
