<?php

namespace App\Domains\Marketing\Filament\Resources\PageResource\Pages;

use App\Domains\Marketing\Filament\Resources\PageResource;
use Filament\Resources\Pages\CreateRecord;

class CreatePage extends CreateRecord
{
    protected static string $resource = PageResource::class;

    protected function getCreatedNotificationTitle(): ?string
    {
        return 'Saved.';
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResourceUrl();
    }
}
