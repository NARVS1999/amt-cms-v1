<?php

namespace App\Http\Controllers\Api;

use App\Models\Page;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\PageResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PageController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $pages = Page::query()
            ->where('is_published', true)
            ->orderBy('id')
            ->get();

        return $this->success(PageResource::collection($pages));
    }

    public function adminIndex()
    {
        $pages = Page::query()
            ->orderBy('id')
            ->get();

        return $this->success(PageResource::collection($pages));
    }

    public function show(string $slug)
    {
        $page = Page::query()
            ->where('slug', $slug)
            ->where('is_published', true)
            ->first();

        if (! $page) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        return $this->success(new PageResource($page));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:marketing_pages,slug',
            'hero_heading' => 'nullable|string',
            'hero_subtext' => 'nullable|string',
            'sections' => 'nullable|json',
            'is_published' => 'boolean',
        ]);

        if (isset($data['sections']) && is_string($data['sections'])) {
            try {
                $data['sections'] = json_decode($data['sections'], true, 512, JSON_THROW_ON_ERROR);
            } catch (\JsonException) {
                throw ValidationException::withMessages(['sections' => ['Sections must be valid JSON.']]);
            }
        }

        $page = Page::create($data);

        return $this->success(new PageResource($page), 201);
    }

    public function update(Request $request, Page $page)
    {
        $data = $request->validate([
            'title' => 'string|max:255',
            'slug' => 'string|max:255|unique:marketing_pages,slug,' . $page->id,
            'hero_heading' => 'nullable|string',
            'hero_subtext' => 'nullable|string',
            'sections' => 'nullable|json',
            'is_published' => 'boolean',
        ]);

        if (isset($data['sections']) && is_string($data['sections'])) {
            try {
                $data['sections'] = json_decode($data['sections'], true, 512, JSON_THROW_ON_ERROR);
            } catch (\JsonException) {
                throw ValidationException::withMessages(['sections' => ['Sections must be valid JSON.']]);
            }
        }

        $page->update($data);

        return $this->success(new PageResource($page));
    }

    public function destroy(Page $page)
    {
        $page->delete();

        return $this->success(['message' => 'Deleted.']);
    }
}
