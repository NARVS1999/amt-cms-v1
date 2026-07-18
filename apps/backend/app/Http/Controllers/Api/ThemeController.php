<?php

namespace App\Http\Controllers\Api;

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
