<?php

namespace App\Domains\Marketing\Filament\Resources\TeamMemberResource\Pages;

use App\Domains\Marketing\Filament\Resources\TeamMemberResource;
use Filament\Resources\Pages\CreateRecord;

class CreateTeamMember extends CreateRecord
{
    protected static string $resource = TeamMemberResource::class;

    protected function getCreatedNotificationTitle(): ?string
    {
        return 'Saved.';
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResourceUrl();
    }
}
