<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;

class BlogPostController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success([]);
    }

    public function show(string $slug)
    {
        return $this->success(null);
    }
}
