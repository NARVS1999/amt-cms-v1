<?php

namespace App\Domains\Marketing\Http\Api;

use App\Domains\Marketing\Models\TeamMember;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\TeamMemberResource;
use App\Traits\ApiResponse;

class TeamMemberController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $teamMembers = TeamMember::query()
            ->with('media')
            ->orderBy('sort_order')
            ->get();

        return $this->success(TeamMemberResource::collection($teamMembers));
    }
}
