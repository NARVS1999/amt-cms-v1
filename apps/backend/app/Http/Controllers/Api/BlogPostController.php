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
            ->allowedSorts(['published_at', 'sort_order'])
            ->allowedFilters([])
            ->with('media')
            ->where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->paginate(15);

        return BlogPostResource::collection($posts);
    }

    public function adminIndex()
    {
        $posts = BlogPost::with('media')
            ->orderBy('sort_order', 'asc')
            ->orderBy('published_at', 'desc')
            ->get();

        return $this->success(BlogPostResource::collection($posts));
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

        try {
            $data['content'] = $this->sanitizeContent($data['content']);
        } catch (\Exception $e) {
            return $this->error('Content could not be processed. Please check your content and try again.', 422);
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
            'content' => 'nullable|string',
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

        if (isset($data['content'])) {
            try {
                $data['content'] = $this->sanitizeContent($data['content']);
            } catch (\Exception $e) {
                return $this->error('Content could not be processed. Please check your content and try again.', 422);
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

    public function swapSortOrder(Request $request, BlogPost $blogPost)
    {
        $data = $request->validate([
            'direction' => 'required|in:up,down',
        ]);

        $direction = $data['direction'] === 'up' ? -1 : 1;
        $currentOrder = $blogPost->sort_order;

        $neighbor = BlogPost::where('sort_order', $direction === -1
            ? '<' : '>', $currentOrder)
            ->orderBy('sort_order', $direction === -1 ? 'desc' : 'asc')
            ->first();

        if (!$neighbor) {
            return $this->error('Cannot move ' . $data['direction'] . ' further.', 422);
        }

        $neighborOrder = $neighbor->sort_order;
        $blogPost->update(['sort_order' => $neighborOrder]);
        $neighbor->update(['sort_order' => $currentOrder]);

        return $this->success(new BlogPostResource($blogPost->load('media')));
    }

    public function destroy(BlogPost $blogPost)
    {
        $blogPost->delete();

        return $this->success(['message' => 'Deleted.']);
    }

    private function sanitizeContent(string $content): string
    {
        require_once base_path('vendor/ezyang/htmlpurifier/library/HTMLPurifier.auto.php');
        $config = \HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', 'p,h2,h3,strong,em,ul,ol,li,a[href],img[src|alt],blockquote,code,pre');
        $config->set('Attr.AllowedFrameTargets', ['_blank']);
        $purifier = new \HTMLPurifier($config);
        return $purifier->purify($content);
    }
}
