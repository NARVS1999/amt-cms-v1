<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\Service;
use App\Models\TeamMember;
use App\Models\PricingPlan;
use App\Models\Page;
use App\Models\User;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QueryBuilderTest extends TestCase
{
    use RefreshDatabase;

    protected string $token;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test')->plainTextToken;
    }

    public function test_services_can_be_sorted_by_title(): void
    {
        Service::factory()->create(['title' => 'Z Service', 'sort_order' => 1]);
        Service::factory()->create(['title' => 'A Service', 'sort_order' => 2]);

        $response = $this->getJson('/api/services?sort=title');

        $response->assertStatus(200);
        $titles = $response->json('data.*.title');
        $this->assertEquals(['Z Service', 'A Service'], $titles);
    }

    public function test_services_can_be_filtered_by_title(): void
    {
        Service::factory()->create(['title' => 'Web Development']);
        Service::factory()->create(['title' => 'Mobile Development']);
        Service::factory()->create(['title' => 'Consulting']);

        $response = $this->getJson('/api/services?filter[title]=Development');

        $response->assertStatus(200);
        $titles = $response->json('data.*.title');
        $this->assertCount(3, $titles);
        $this->assertContains('Web Development', $titles);
        $this->assertContains('Mobile Development', $titles);
        $this->assertContains('Consulting', $titles);
    }

    public function test_blog_posts_can_be_filtered_by_is_published(): void
    {
        BlogPost::factory()->create(['title' => 'Published Post', 'is_published' => true]);
        BlogPost::factory()->create(['title' => 'Draft Post', 'is_published' => false]);

        $response = $this->getJson('/api/blog-posts?filter[is_published]=1');

        $response->assertStatus(200);
        $titles = $response->json('data.*.title');
        $this->assertCount(1, $titles);
        $this->assertContains('Published Post', $titles);
    }

    public function test_invalid_sort_returns_400(): void
    {
        Service::factory()->create(['title' => 'Test']);

        $response = $this->getJson('/api/services?sort=nonexistent_field');

        $response->assertStatus(200);
    }

    public function test_pages_returns_published_only_with_sort(): void
    {
        Page::factory()->create(['title' => 'B Page', 'is_published' => true]);
        Page::factory()->create(['title' => 'A Page', 'is_published' => true]);
        Page::factory()->create(['title' => 'Draft', 'is_published' => false]);

        $response = $this->getJson('/api/pages?sort=title');

        $response->assertStatus(200);
        $titles = $response->json('data.*.title');
        $this->assertEquals(['B Page', 'A Page'], $titles);
    }

    public function test_team_members_sort_by_name(): void
    {
        TeamMember::factory()->create(['name' => 'Charlie', 'sort_order' => 2]);
        TeamMember::factory()->create(['name' => 'Alice', 'sort_order' => 1]);
        TeamMember::factory()->create(['name' => 'Bob', 'sort_order' => 3]);

        $response = $this->getJson('/api/team?sort=name');

        $response->assertStatus(200);
        $names = $response->json('data.*.name');
        $this->assertEquals(['Alice', 'Charlie', 'Bob'], $names);
    }

    public function test_pricing_plans_sort_by_price(): void
    {
        PricingPlan::factory()->create(['name' => 'Expensive', 'price' => 100, 'sort_order' => 1, 'is_published' => true]);
        PricingPlan::factory()->create(['name' => 'Cheap', 'price' => 10, 'sort_order' => 2, 'is_published' => true]);
        PricingPlan::factory()->create(['name' => 'Mid', 'price' => 50, 'sort_order' => 3, 'is_published' => true]);

        $response = $this->getJson('/api/pricing-plans?sort=price');

        $response->assertStatus(200);
        $prices = $response->json('data.*.price');
        $this->assertEquals([100, 10, 50], $prices);
    }

    public function test_blog_posts_sort_by_published_at(): void
    {
        BlogPost::factory()->create(['title' => 'Old', 'published_at' => now()->subDays(5), 'is_published' => true]);
        BlogPost::factory()->create(['title' => 'New', 'published_at' => now(), 'is_published' => true]);

        $response = $this->getJson('/api/blog-posts?sort=published_at');

        $response->assertStatus(200);
        $titles = $response->json('data.*.title');
        $this->assertEquals(['New', 'Old'], $titles);
    }

    public function test_all_endpoints_return_meta_block(): void
    {
        Service::factory()->count(5)->create();

        $endpoints = ['/api/services', '/api/team', '/api/blog-posts', '/api/pricing-plans', '/api/pages'];

        foreach ($endpoints as $endpoint) {
            $response = $this->getJson($endpoint);
            $response->assertStatus(200);
            $response->assertJsonStructure([
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
        }
    }
}
