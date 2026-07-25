<?php

namespace Tests\Feature;

use App\Models\BlogPost;
use App\Models\Page;
use App\Models\PricingPlan;
use App\Models\Service;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCrudTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test')->plainTextToken;
    }

    protected function authHeaders(): array
    {
        return ['Authorization' => 'Bearer ' . $this->token];
    }

    /* ─── Services CRUD ─── */

    public function test_can_create_service(): void
    {
        $response = $this->postJson('/api/services', [
            'title' => 'New Service',
            'description' => 'Service description',
            'icon' => 'fa-solid fa-code',
            'sort_order' => 1,
        ], $this->authHeaders());

        $response->assertStatus(201);
        $response->assertJsonPath('data.title', 'New Service');
        $this->assertDatabaseCount('marketing_services', 1);
    }

    public function test_can_update_service(): void
    {
        $service = Service::factory()->create();

        $response = $this->putJson('/api/services/' . $service->id, [
            'title' => 'Updated Service',
        ], $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJsonPath('data.title', 'Updated Service');
    }

    public function test_can_delete_service(): void
    {
        $service = Service::factory()->create();

        $response = $this->deleteJson('/api/services/' . $service->id, [], $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJson(['data' => ['message' => 'Deleted.']]);
        $this->assertDatabaseCount('marketing_services', 0);
    }

    /* ─── Team Members CRUD ─── */

    public function test_can_create_team_member(): void
    {
        $response = $this->postJson('/api/team', [
            'name' => 'John Doe',
            'role' => 'Developer',
            'bio' => 'A developer.',
            'sort_order' => 1,
        ], $this->authHeaders());

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'John Doe');
        $this->assertDatabaseCount('marketing_team_members', 1);
    }

    public function test_can_update_team_member(): void
    {
        $member = TeamMember::factory()->create();

        $response = $this->putJson('/api/team/' . $member->id, [
            'role' => 'Senior Developer',
        ], $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJsonPath('data.role', 'Senior Developer');
    }

    public function test_can_delete_team_member(): void
    {
        $member = TeamMember::factory()->create();

        $response = $this->deleteJson('/api/team/' . $member->id, [], $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJson(['data' => ['message' => 'Deleted.']]);
        $this->assertDatabaseCount('marketing_team_members', 0);
    }

    /* ─── Pages CRUD ─── */

    public function test_can_create_page(): void
    {
        $response = $this->postJson('/api/pages', [
            'title' => 'New Page',
            'slug' => 'new-page',
            'hero_heading' => 'Welcome',
            'is_published' => true,
        ], $this->authHeaders());

        $response->assertStatus(201);
        $response->assertJsonPath('data.title', 'New Page');
        $response->assertJsonPath('data.slug', 'new-page');
        $this->assertDatabaseCount('marketing_pages', 1);
    }

    public function test_can_update_page(): void
    {
        $page = Page::factory()->create();

        $response = $this->putJson('/api/pages/' . $page->id, [
            'hero_heading' => 'Updated Heading',
        ], $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJsonPath('data.hero_heading', 'Updated Heading');
    }

    public function test_can_delete_page(): void
    {
        $page = Page::factory()->create();

        $response = $this->deleteJson('/api/pages/' . $page->id, [], $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJson(['data' => ['message' => 'Deleted.']]);
        $this->assertDatabaseCount('marketing_pages', 0);
    }

    /* ─── Pricing Plans CRUD ─── */

    public function test_can_create_pricing_plan(): void
    {
        $response = $this->postJson('/api/pricing-plans', [
            'name' => 'Starter',
            'price' => 9.99,
            'interval' => 'monthly',
            'is_published' => true,
        ], $this->authHeaders());

        $response->assertStatus(201);
        $response->assertJsonPath('data.name', 'Starter');
        $this->assertDatabaseCount('billing_pricing_plans', 1);
    }

    public function test_can_update_pricing_plan(): void
    {
        $plan = PricingPlan::factory()->create();

        $response = $this->putJson('/api/pricing-plans/' . $plan->id, [
            'price' => 19.99,
        ], $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJsonPath('data.price', 19.99);
    }

    public function test_can_delete_pricing_plan(): void
    {
        $plan = PricingPlan::factory()->create();

        $response = $this->deleteJson('/api/pricing-plans/' . $plan->id, [], $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJson(['data' => ['message' => 'Deleted.']]);
        $this->assertDatabaseCount('billing_pricing_plans', 0);
    }

    /* ─── Blog Posts CRUD ─── */

    public function test_can_create_blog_post(): void
    {
        $response = $this->postJson('/api/blog-posts', [
            'title' => 'New Post',
            'slug' => 'new-post',
            'content' => 'Post content here.',
            'is_published' => true,
        ], $this->authHeaders());

        $response->assertStatus(201);
        $response->assertJsonPath('data.title', 'New Post');
        $response->assertJsonPath('data.slug', 'new-post');
        $this->assertDatabaseCount('marketing_blog_posts', 1);
    }

    public function test_can_update_blog_post(): void
    {
        $post = BlogPost::factory()->create();

        $response = $this->putJson('/api/blog-posts/' . $post->id, [
            'title' => 'Updated Post',
        ], $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJsonPath('data.title', 'Updated Post');
    }

    public function test_can_delete_blog_post(): void
    {
        $post = BlogPost::factory()->create();

        $response = $this->deleteJson('/api/blog-posts/' . $post->id, [], $this->authHeaders());

        $response->assertStatus(200);
        $response->assertJson(['data' => ['message' => 'Deleted.']]);
        $this->assertDatabaseCount('marketing_blog_posts', 0);
    }
}
