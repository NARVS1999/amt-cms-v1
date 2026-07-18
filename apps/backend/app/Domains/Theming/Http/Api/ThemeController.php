<?php

namespace App\Domains\Theming\Http\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;

class ThemeController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success([]);
    }
}
