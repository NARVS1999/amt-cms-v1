<?php

namespace App\Domains\Marketing\Filament\Resources\TeamMemberResource\Pages;

use App\Domains\Marketing\Filament\Resources\TeamMemberResource;
use Filament\Resources\Pages\ListRecords;

class ListTeamMembers extends ListRecords
{
    protected static string $resource = TeamMemberResource::class;
}
