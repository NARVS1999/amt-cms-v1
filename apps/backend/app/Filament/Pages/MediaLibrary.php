<?php

namespace App\Filament\Pages;

use Filament\Actions\Action;
use Filament\Forms\Components\FileUpload;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Schema;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaLibrary extends Page
{
    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill();
    }

    public static function getNavigationIcon(): string|\BackedEnum|\Illuminate\Contracts\Support\Htmlable|null
    {
        return 'heroicon-o-photo';
    }

    public static function getNavigationLabel(): string
    {
        return 'Media Library';
    }

    public static function getNavigationGroup(): string|\UnitEnum|null
    {
        return 'Settings';
    }

    public function getMediaItems()
    {
        return Media::query()->orderBy('created_at', 'desc')->get();
    }

    public function deleteMedia(int $id): void
    {
        $media = Media::find($id);
        if ($media) {
            $media->delete();
            Notification::make()
                ->title('Media deleted successfully.')
                ->success()
                ->send();
        } else {
            Notification::make()
                ->title('Media not found.')
                ->danger()
                ->send();
        }
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('upload')
                ->label('Upload Media')
                ->icon('heroicon-o-cloud-arrow-up')
                ->color('primary')
                ->form([
                    FileUpload::make('file')
                        ->label('File')
                        ->required()
                        ->disk('public')
                        ->directory('media')
                        ->maxSize(2048)
                        ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
                        ->validationMessages([
                            'maxSize' => 'File too large. Max 2MB.',
                            'acceptedFileTypes' => 'Format not supported. Accepted: JPG, PNG, WebP, SVG.',
                        ]),
                ])
                ->action(function (array $data) {
                    // FileUpload stores to storage/app/public/media/ automatically.
                    // We just need to persist the Media model record.
                    $file = $data['file'] ?? null;
                    if ($file) {
                        Media::create([
                            'name' => pathinfo(
                                $file instanceof \Livewire\Features\SupportFileUploads\TemporaryUploadedFile
                                    ? $file->getClientOriginalName()
                                    : (is_string($file) ? basename($file) : 'untitled'),
                                PATHINFO_FILENAME
                            ),
                            'file_name' => $file instanceof \Livewire\Features\SupportFileUploads\TemporaryUploadedFile
                                ? $file->hashName()
                                : basename((string) $file),
                            'mime_type' => $file instanceof \Livewire\Features\SupportFileUploads\TemporaryUploadedFile
                                ? $file->getMimeType()
                                : 'application/octet-stream',
                            'size' => $file instanceof \Livewire\Features\SupportFileUploads\TemporaryUploadedFile
                                ? $file->getSize()
                                : 0,
                            'disk' => 'public',
                            'conversions_disk' => 'public',
                            'model_type' => Media::class,
                            'model_id' => 0,
                            'collection_name' => 'default',
                        ]);
                    }

                    Notification::make()
                        ->title('File uploaded successfully.')
                        ->success()
                        ->send();
                }),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        if (!Schema::hasTable('media')) {
            return null;
        }
        return (string) Media::count();
    }
}
