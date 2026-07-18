<?php

namespace App\Domains\Marketing\Http\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;

class TeamMemberController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success([]);
    }
}
