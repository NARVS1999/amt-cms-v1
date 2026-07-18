<?php

namespace App\Domains\Marketing\Filament\Resources\PageResource\Pages;

use App\Domains\Marketing\Filament\Resources\PageResource;
use Filament\Resources\Pages\EditRecord;

class EditPage extends EditRecord
{
    protected static string $resource = PageResource::class;

    protected function getRedirectUrl(): string
    {
        return $this->getResourceUrl();
    }
}
