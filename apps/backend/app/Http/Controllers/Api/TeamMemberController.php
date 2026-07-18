<?php

namespace App\Http\Controllers\Api;

use App\Models\TeamMember;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\TeamMemberResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

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

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'social_links' => 'nullable|json',
            'sort_order' => 'integer',
        ]);

        if (isset($data['social_links']) && is_string($data['social_links'])) {
            try {
                $data['social_links'] = json_decode($data['social_links'], true, 512, JSON_THROW_ON_ERROR);
            } catch (\JsonException) {
                throw ValidationException::withMessages(['social_links' => ['Social links must be valid JSON.']]);
            }
        }

        $member = TeamMember::create($data);

        return $this->success(new TeamMemberResource($member), 201);
    }

    public function update(Request $request, TeamMember $teamMember)
    {
        $data = $request->validate([
            'name' => 'string|max:255',
            'role' => 'string|max:255',
            'bio' => 'nullable|string',
            'social_links' => 'nullable|json',
            'sort_order' => 'integer',
        ]);

        if (isset($data['social_links']) && is_string($data['social_links'])) {
            try {
                $data['social_links'] = json_decode($data['social_links'], true, 512, JSON_THROW_ON_ERROR);
            } catch (\JsonException) {
                throw ValidationException::withMessages(['social_links' => ['Social links must be valid JSON.']]);
            }
        }

        $teamMember->update($data);

        return $this->success(new TeamMemberResource($teamMember));
    }

    public function destroy(TeamMember $teamMember)
    {
        $teamMember->delete();

        return $this->success(['message' => 'Deleted.']);
    }
}
