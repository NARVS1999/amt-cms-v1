@php
    $mediaItems = app(\App\Filament\Pages\MediaLibrary::class)->getMediaItems();
@endphp

<x-filament::page>
    <div class="space-y-6">
        @if($mediaItems->isEmpty())
            <div class="text-center py-12">
                <x-heroicon-o-photo class="mx-auto h-12 w-12 text-gray-400" />
                <h3 class="mt-2 text-sm font-semibold text-gray-900">No media uploaded yet</h3>
                <p class="mt-1 text-sm text-gray-500">Upload your first image to get started.</p>
            </div>
        @else
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                @foreach($mediaItems as $media)
                    <div class="relative group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div class="aspect-square overflow-hidden bg-gray-100">
                            @if(str_starts_with($media->mime_type, 'image/svg'))
                                <div class="p-4 flex items-center justify-center h-full">
                                    <span class="text-gray-400 text-sm">SVG</span>
                                </div>
                            @else
                                <img src="{{ $media->getUrl() }}"
                                     alt="{{ $media->name }}"
                                     class="w-full h-full object-cover">
                            @endif
                        </div>
                        <div class="p-2">
                            <p class="text-xs font-medium text-gray-900 truncate">{{ $media->name }}</p>
                            <p class="text-xs text-gray-500">{{ number_format($media->size / 1024, 1) }} KB</p>
                            <p class="text-xs text-gray-400">{{ $media->mime_type }}</p>
                        </div>
                        <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button type="button"
                                    wire:click="deleteMedia({{ $media->id }})"
                                    wire:confirm="Delete this media item? This can't be undone."
                                    class="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    aria-label="Delete media">
                                <x-heroicon-o-trash class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                @endforeach
            </div>
        @endif
    </div>
</x-filament::page>
