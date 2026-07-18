<?php

namespace App\Domains\Marketing\Filament\Resources\ServiceResource\Pages;

use App\Domains\Marketing\Filament\Resources\ServiceResource;
use Filament\Resources\Pages\CreateRecord;

class CreateService extends CreateRecord
{
    protected static string $resource = ServiceResource::class;

    protected function getCreatedNotificationTitle(): ?string
    {
        return 'Saved.';
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResourceUrl();
    }
}
