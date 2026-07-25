<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MediaTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'email' => 'admin@example.com',
        ]);
    }

    protected function authHeaders(): array
    {
        $token = $this->user->createToken('test')->plainTextToken;

        return ['Authorization' => 'Bearer ' . $token];
    }

    public function test_index_returns_all_media(): void
    {
        // Upload two files to populate the library
        $file1 = UploadedFile::fake()->create('photo-a.jpg', 100);
        $this->postJson('/api/media', ['file' => $file1], $this->authHeaders());

        $file2 = UploadedFile::fake()->create('photo-b.jpg', 100);
        $this->postJson('/api/media', ['file' => $file2], $this->authHeaders());

        $response = $this->getJson('/api/media', $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'file_name', 'size', 'mime_type', 'url', 'thumbnail', 'created_at'],
            ],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_upload_valid_jpeg(): void
    {
        $file = UploadedFile::fake()->create('photo.jpg', 100);

        $response = $this->postJson('/api/media', ['file' => $file], $this->authHeaders());

        $response->assertStatus(201);
        $response->assertJsonStructure([
            'data' => ['id', 'name', 'file_name', 'size', 'mime_type', 'url', 'thumbnail', 'created_at'],
        ]);
        $this->assertDatabaseCount('media', 1);
    }

    public function test_upload_valid_svg(): void
    {
        $svg = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="40"/></svg>';
        $file = UploadedFile::fake()->createWithContent('vector.svg', $svg);

        $response = $this->postJson('/api/media', ['file' => $file], $this->authHeaders());

        $response->assertStatus(201);
        $response->assertJsonPath('data.file_name', 'vector.svg');
        $this->assertDatabaseCount('media', 1);
    }

    public function test_upload_oversized_file_returns_error(): void
    {
        // 2049 KB → over the 2048 KB (2MB) limit
        $file = UploadedFile::fake()->create('large.jpg', 2049);

        $response = $this->postJson('/api/media', ['file' => $file], $this->authHeaders());

        $response->assertStatus(422);
        $response->assertJsonFragment(['File too large. Max 2MB.']);
    }

    public function test_upload_unsupported_format_returns_error(): void
    {
        $file = UploadedFile::fake()->create('document.pdf', 100);

        $response = $this->postJson('/api/media', ['file' => $file], $this->authHeaders());

        $response->assertStatus(422);
        $response->assertJsonFragment(['Format not supported. Accepted: JPG, PNG, WebP, SVG.']);
    }

    public function test_delete_media_removes_file(): void
    {
        // Upload a file first
        $file = UploadedFile::fake()->create('to-delete.jpg', 100);
        $uploadResponse = $this->postJson('/api/media', ['file' => $file], $this->authHeaders());
        $mediaId = $uploadResponse->json('data.id');

        $this->assertDatabaseCount('media', 1);

        // Delete it
        $response = $this->deleteJson('/api/media/' . $mediaId, [], $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJson(['message' => 'Deleted.']);
        $this->assertDatabaseCount('media', 0);
    }

    public function test_index_empty_when_no_media(): void
    {
        $response = $this->getJson('/api/media', $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJson(['data' => []]);
    }

    public function test_upload_valid_png(): void
    {
        $file = UploadedFile::fake()->create('image.png', 100);

        $response = $this->postJson('/api/media', ['file' => $file], $this->authHeaders());

        $response->assertStatus(201);
        $response->assertJsonPath('data.file_name', 'image.png');
        $this->assertDatabaseCount('media', 1);
    }

    public function test_upload_valid_webp(): void
    {
        $file = UploadedFile::fake()->create('image.webp', 100);

        $response = $this->postJson('/api/media', ['file' => $file], $this->authHeaders());

        $response->assertStatus(201);
        $response->assertJsonPath('data.file_name', 'image.webp');
        $this->assertDatabaseCount('media', 1);
    }

    public function test_upload_invalid_exe_returns_error(): void
    {
        $file = UploadedFile::fake()->create('malware.exe', 100);

        $response = $this->postJson('/api/media', ['file' => $file], $this->authHeaders());

        $response->assertStatus(422);
        $response->assertJsonFragment(['Format not supported. Accepted: JPG, PNG, WebP, SVG.']);
    }

    public function test_delete_nonexistent_media_returns_404(): void
    {
        $response = $this->deleteJson('/api/media/99999', [], $this->authHeaders());

        $response->assertStatus(404);
    }

    public function test_svg_sanitization_strips_script_tags(): void
    {
        $maliciousSvg = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script><circle cx="50" cy="50" r="40"/></svg>';
        $file = UploadedFile::fake()->createWithContent('evil.svg', $maliciousSvg);

        $response = $this->postJson('/api/media', ['file' => $file], $this->authHeaders());

        $response->assertStatus(201);

        $media = \App\Models\Media::first();
        $path = $media->getPath();
        $content = file_get_contents($path);
        $this->assertStringNotContainsString('<script>', $content);
        $this->assertStringNotContainsString('alert', $content);
    }

    public function test_unauthenticated_request_returns_401(): void
    {
        // GET /api/media without auth
        $response = $this->getJson('/api/media');
        $response->assertStatus(401);

        // POST /api/media without auth
        $file = UploadedFile::fake()->create('no-auth.jpg', 100);
        $response = $this->postJson('/api/media', ['file' => $file]);
        $response->assertStatus(401);

        // DELETE /api/media/1 without auth
        $response = $this->deleteJson('/api/media/1');
        $response->assertStatus(401);
    }
}
