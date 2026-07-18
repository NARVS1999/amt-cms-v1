<?php

namespace App\Domains\Marketing\Http\Api;

use App\Domains\Marketing\Models\Page;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\PageResource;
use App\Traits\ApiResponse;

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
}
