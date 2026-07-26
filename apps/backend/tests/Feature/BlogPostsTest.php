<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BlogPostsTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_blog_posts_with_data_envelope(): void
    {
        BlogPost::factory()->count(3)->create([
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/blog-posts');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'title',
                    'slug',
                    'excerpt',
                    'featured_image_url',
                    'is_published',
                    'sort_order',
                    'published_at',
                    'created_at',
                    'updated_at',
                ],
            ],
        ]);
        $response->assertJsonCount(3, 'data');
    }

    public function test_returns_empty_data_when_no_blog_posts(): void
    {
        $response = $this->getJson('/api/blog-posts');

        $response->assertStatus(200);
        $response->assertJson(['data' => []]);
    }

    public function test_returns_blog_posts_sorted_by_published_at_desc(): void
    {
        $old = BlogPost::factory()->create([
            'is_published' => true,
            'published_at' => now()->subDays(2),
        ]);
        $mid = BlogPost::factory()->create([
            'is_published' => true,
            'published_at' => now()->subDay(),
        ]);
        $new = BlogPost::factory()->create([
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/blog-posts');

        $ids = $response->json('data.*.id');
        $this->assertEquals([$new->id, $mid->id, $old->id], $ids);
    }

    public function test_returns_single_post_by_slug(): void
    {
        $post = BlogPost::factory()->create([
            'title' => 'Test Blog Post',
            'slug' => 'test-blog-post',
            'content' => 'Full content here.',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/blog-posts/test-blog-post');

        $response->assertStatus(200);
        $response->assertJsonPath('data.id', $post->id);
        $response->assertJsonPath('data.title', 'Test Blog Post');
        $response->assertJsonPath('data.slug', 'test-blog-post');
        $response->assertJsonPath('data.content', 'Full content here.');
        $response->assertJsonStructure(['data' => ['content']]);
    }

    public function test_returns_404_for_nonexistent_slug(): void
    {
        $response = $this->getJson('/api/blog-posts/nonexistent-slug');

        $response->assertStatus(404);
    }

    public function test_index_response_does_not_include_content(): void
    {
        BlogPost::factory()->create([
            'content' => 'Sensitive content',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/blog-posts');

        $response->assertStatus(200);
        $response->assertJsonMissingPath('data.0.content');
    }

    public function test_public_index_filters_published_only(): void
    {
        BlogPost::factory()->create(['is_published' => true, 'published_at' => now()]);
        BlogPost::factory()->create(['is_published' => false]);

        $response = $this->getJson('/api/blog-posts');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
    }

    public function test_admin_index_returns_all_posts(): void
    {
        BlogPost::factory()->create(['is_published' => true, 'published_at' => now()]);
        BlogPost::factory()->create(['is_published' => false]);

        $token = $this->getAdminToken();
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/admin/blog-posts');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
    }

    public function test_admin_index_requires_auth(): void
    {
        $response = $this->getJson('/api/admin/blog-posts');

        $response->assertStatus(401);
    }

    public function test_store_sanitizes_content(): void
    {
        $token = $this->getAdminToken();
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/blog-posts', [
                'title' => 'XSS Test',
                'slug' => 'xss-test',
                'content' => '<p>Safe</p><script>alert("xss")</script>',
            ]);

        $response->assertStatus(201);
        $post = BlogPost::where('slug', 'xss-test')->first();
        $this->assertStringNotContainsString('<script>', $post->content);
        $this->assertStringContainsString('<p>Safe</p>', $post->content);
    }

    public function test_update_sanitizes_content(): void
    {
        $post = BlogPost::factory()->create([
            'content' => '<p>Original</p>',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $token = $this->getAdminToken();
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->putJson("/api/blog-posts/{$post->id}", [
                'content' => '<p>Updated</p><iframe src="evil.com"></iframe>',
            ]);

        $response->assertStatus(200);
        $post->refresh();
        $this->assertStringNotContainsString('<iframe>', $post->content);
        $this->assertStringContainsString('<p>Updated</p>', $post->content);
    }

    public function test_swap_sort_order(): void
    {
        $post1 = BlogPost::factory()->create(['sort_order' => 0, 'is_published' => true, 'published_at' => now()]);
        $post2 = BlogPost::factory()->create(['sort_order' => 1, 'is_published' => true, 'published_at' => now()]);
        $post3 = BlogPost::factory()->create(['sort_order' => 2, 'is_published' => true, 'published_at' => now()]);

        $token = $this->getAdminToken();
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson("/api/blog-posts/{$post1->id}/sort-order", ['direction' => 'down']);

        $response->assertStatus(200);
        $this->assertEquals(1, $post1->fresh()->sort_order);
        $this->assertEquals(0, $post2->fresh()->sort_order);
    }

    public function test_swap_sort_order_rejects_invalid_direction(): void
    {
        $post = BlogPost::factory()->create(['sort_order' => 0, 'is_published' => true, 'published_at' => now()]);

        $token = $this->getAdminToken();
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson("/api/blog-posts/{$post->id}/sort-order", ['direction' => 'left']);

        $response->assertStatus(422);
    }

    public function test_swap_sort_order_first_item_cannot_go_up(): void
    {
        $post = BlogPost::factory()->create(['sort_order' => 0, 'is_published' => true, 'published_at' => now()]);

        $token = $this->getAdminToken();
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson("/api/blog-posts/{$post->id}/sort-order", ['direction' => 'up']);

        $response->assertStatus(422);
    }

    public function test_public_blog_posts_sorted_by_published_at_desc(): void
    {
        $old = BlogPost::factory()->create([
            'is_published' => true,
            'published_at' => now()->subDays(3),
        ]);
        $new = BlogPost::factory()->create([
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/blog-posts');

        $ids = $response->json('data.*.id');
        $this->assertEquals([$new->id, $old->id], $ids);
    }

    public function test_admin_blog_posts_sorted_by_sort_order(): void
    {
        $post1 = BlogPost::factory()->create(['sort_order' => 2, 'is_published' => true, 'published_at' => now()]);
        $post2 = BlogPost::factory()->create(['sort_order' => 0, 'is_published' => true, 'published_at' => now()]);
        $post3 = BlogPost::factory()->create(['sort_order' => 1, 'is_published' => true, 'published_at' => now()]);

        $token = $this->getAdminToken();
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->getJson('/api/admin/blog-posts');

        $ids = $response->json('data.*.id');
        $this->assertEquals([$post2->id, $post3->id, $post1->id], $ids);
    }

    public function test_public_blog_post_by_slug_returns_content(): void
    {
        $post = BlogPost::factory()->create([
            'slug' => 'content-test',
            'content' => '<p>Full article content here.</p>',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $response = $this->getJson('/api/blog-posts/content-test');

        $response->assertStatus(200);
        $response->assertJsonPath('data.content', '<p>Full article content here.</p>');
    }

    public function test_public_blog_post_by_nonexistent_slug_returns_404(): void
    {
        $response = $this->getJson('/api/blog-posts/this-does-not-exist');

        $response->assertStatus(404);
    }

    public function test_store_sets_published_at_on_publish(): void
    {
        $token = $this->getAdminToken();
        $response = $this->withHeaders(['Authorization' => 'Bearer ' . $token])
            ->postJson('/api/blog-posts', [
                'title' => 'Auto Date',
                'slug' => 'auto-date',
                'content' => '<p>Content</p>',
                'is_published' => true,
            ]);

        $response->assertStatus(201);
        $post = BlogPost::where('slug', 'auto-date')->first();
        $this->assertNotNull($post->published_at);
    }

    private function getAdminToken(): string
    {
        $user = \App\Models\User::factory()->create();
        return $user->createToken('admin-token')->plainTextToken;
    }
}
