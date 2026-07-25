<?php

namespace Tests\Feature;

use App\Models\Page;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PagesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test GET /api/pages returns only published pages sorted by id.
     */
    public function test_returns_published_pages_sorted_by_id(): void
    {
        // Create pages
        Page::factory()->create(['title' => 'Page A', 'slug' => 'page-a', 'is_published' => true]);
        Page::factory()->create(['title' => 'Page B', 'slug' => 'page-b', 'is_published' => false]);
        Page::factory()->create(['title' => 'Page C', 'slug' => 'page-c', 'is_published' => true]);

        $response = $this->getJson('/api/pages');

        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');

        // Verify only published pages returned
        $titles = $response->json('data.*.title');
        $this->assertEquals(['Page A', 'Page C'], $titles);

        // Verify ascending id order
        $ids = $response->json('data.*.id');
        for ($i = 1; $i < count($ids); $i++) {
            $this->assertGreaterThan($ids[$i - 1], $ids[$i], 'Pages must be ordered by id ascending');
        }

        // Verify response structure
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'title',
                    'slug',
                    'hero_heading',
                    'hero_subtext',
                    'sections',
                    'is_published',
                    'created_at',
                    'updated_at',
                ],
            ],
        ]);
    }

    /**
     * Test that the response is empty when no pages exist.
     */
    public function test_returns_empty_data_when_no_pages(): void
    {
        $response = $this->getJson('/api/pages');

        $response->assertStatus(200);
        $response->assertJson(['data' => []]);
    }

    /**
     * Test a single page in the list response has correct structure.
     */
    public function test_list_returns_single_page_with_correct_structure(): void
    {
        $page = Page::factory()->create([
            'title' => 'Home Page',
            'slug' => 'home',
            'hero_heading' => 'Welcome to Our Site',
            'hero_subtext' => 'A short subtitle',
            'sections' => [
                ['type' => 'hero', 'heading' => 'Welcome', 'content' => 'Welcome content'],
                ['type' => 'features', 'heading' => 'Features', 'content' => 'Feature content'],
            ],
            'is_published' => true,
        ]);

        $response = $this->getJson('/api/pages');

        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');

        $response->assertJsonPath('data.0.title', 'Home Page');
        $response->assertJsonPath('data.0.slug', 'home');
        $response->assertJsonPath('data.0.hero_heading', 'Welcome to Our Site');
        $response->assertJsonPath('data.0.hero_subtext', 'A short subtitle');
        $response->assertJsonPath('data.0.is_published', true);
        $this->assertIsArray($response->json('data.0.sections'));
    }

    /**
     * Test GET /api/pages/{slug} returns full single-item response structure.
     */
    public function test_show_returns_full_response_structure(): void
    {
        Page::factory()->create([
            'title' => 'Services',
            'slug' => 'services',
            'hero_heading' => 'Our Services',
            'hero_subtext' => 'What we offer',
            'sections' => [
                ['type' => 'features', 'heading' => 'Features', 'content' => 'Feature details'],
            ],
            'is_published' => true,
        ]);

        $response = $this->getJson('/api/pages/services');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'title',
                'slug',
                'hero_heading',
                'hero_subtext',
                'sections',
                'is_published',
                'created_at',
                'updated_at',
            ],
        ]);
        $response->assertJsonPath('data.title', 'Services');
        $response->assertJsonPath('data.slug', 'services');
        $response->assertJsonPath('data.hero_heading', 'Our Services');
        $response->assertJsonPath('data.is_published', true);
        $this->assertIsArray($response->json('data.sections'));
    }

    /**
     * Test GET /api/pages/{slug} returns a single page by slug.
     */
    public function test_show_returns_page_by_slug(): void
    {
        $page = Page::factory()->create([
            'title' => 'About',
            'slug' => 'about',
            'is_published' => true,
        ]);

        $response = $this->getJson('/api/pages/about');

        $response->assertStatus(200);
        $response->assertJsonPath('data.title', 'About');
        $response->assertJsonPath('data.slug', 'about');
    }

    /**
     * Test GET /api/pages/{slug} returns 404 for unknown slug.
     */
    public function test_show_returns_404_for_unknown_slug(): void
    {
        $response = $this->getJson('/api/pages/nonexistent');

        $response->assertStatus(404);
        $response->assertJson(['message' => 'Not found.']);
    }

    /**
     * Test that unpublished pages are not returned by the API.
     */
    public function test_unpublished_pages_not_returned(): void
    {
        Page::factory()->create([
            'title' => 'Draft Page',
            'slug' => 'draft',
            'is_published' => false,
        ]);

        // index should not include it
        $indexResponse = $this->getJson('/api/pages');
        $indexResponse->assertStatus(200);
        $indexResponse->assertJsonCount(0, 'data');

        // show should 404
        $showResponse = $this->getJson('/api/pages/draft');
        $showResponse->assertStatus(404);
    }

    public function test_admin_can_reorder_pages(): void
    {
        $pageA = Page::factory()->create(['sort_order' => 0]);
        $pageB = Page::factory()->create(['sort_order' => 1]);
        $pageC = Page::factory()->create(['sort_order' => 2]);

        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/admin/pages/reorder', [
            'ids' => [$pageC->id, $pageB->id, $pageA->id],
        ]);

        $response->assertStatus(200);
        $response->assertJson(['data' => ['message' => 'Reordered.']]);

        $this->assertEquals(0, Page::find($pageC->id)->sort_order);
        $this->assertEquals(1, Page::find($pageB->id)->sort_order);
        $this->assertEquals(2, Page::find($pageA->id)->sort_order);
    }

    public function test_pages_reorder_returns_401_without_token(): void
    {
        $response = $this->postJson('/api/admin/pages/reorder', ['ids' => [1]]);

        $response->assertStatus(401);
    }

    public function test_pages_reorder_validates_ids_required(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->postJson('/api/admin/pages/reorder', []);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['ids']);
    }
}
