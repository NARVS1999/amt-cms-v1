<?php

namespace App\Http\Controllers\Api;

use App\Models\BlogPost;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\BlogPostResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;

class BlogPostController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $posts = QueryBuilder::for(BlogPost::class)
            ->with('media')
            ->defaultSort('-created_at')
            ->allowedSorts(['published_at', 'title', 'created_at'])
            ->allowedFilters(['title', 'is_published'])
            ->paginate();

        return BlogPostResource::collection($posts);
    }

    public function show(string $slug)
    {
        $post = BlogPost::with('media')->where('slug', $slug)->first();

        if (!$post) {
            return $this->error('Blog post not found.', 404);
        }

        return $this->success(new BlogPostResource($post));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:marketing_blog_posts,slug',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:300',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
            'featured_image' => 'nullable|file|mimes:jpeg,png,webp,svg|max:2048',
        ]);

        if (!empty($data['is_published']) && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $post = BlogPost::create($data);

        if ($request->hasFile('featured_image')) {
            $post->addMediaFromRequest('featured_image')
                ->toMediaCollection('featured_image');
        }

        return $this->success(new BlogPostResource($post->load('media')), 201);
    }

    public function update(Request $request, BlogPost $blogPost)
    {
        $data = $request->validate([
            'title' => 'string|max:255',
            'slug' => 'string|max:255|unique:marketing_blog_posts,slug,' . $blogPost->id,
            'content' => 'string',
            'excerpt' => 'nullable|string|max:300',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
            'featured_image' => 'nullable|file|mimes:jpeg,png,webp,svg|max:2048',
        ]);

        if (array_key_exists('is_published', $data)) {
            if ($data['is_published'] && empty($data['published_at']) && !$blogPost->published_at) {
                $data['published_at'] = now();
            }
        }

        $blogPost->update($data);

        if ($request->hasFile('featured_image')) {
            $blogPost->clearMediaCollection('featured_image');
            $blogPost->addMediaFromRequest('featured_image')
                ->toMediaCollection('featured_image');
        }

        return $this->success(new BlogPostResource($blogPost->load('media')));
    }

    public function destroy(BlogPost $blogPost)
    {
        $blogPost->delete();

        return $this->success(['message' => 'Deleted.']);
    }
}
