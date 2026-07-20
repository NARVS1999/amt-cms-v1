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
        BlogPost::factory()->count(3)->create();

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

    public function test_returns_blog_posts_sorted_by_created_at_desc(): void
    {
        $old = BlogPost::factory()->create(['created_at' => now()->subDays(2)]);
        $mid = BlogPost::factory()->create(['created_at' => now()->subDay()]);
        $new = BlogPost::factory()->create(['created_at' => now()]);

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
        BlogPost::factory()->create(['content' => 'Sensitive content']);

        $response = $this->getJson('/api/blog-posts');

        $response->assertStatus(200);
        $response->assertJsonMissingPath('data.0.content');
    }
}
