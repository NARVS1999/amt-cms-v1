<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends Controller
{
    public function index()
    {
        $media = Media::where('model_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->paginate(50)
            ->through(function (Media $item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'file_name' => $item->file_name,
                    'size' => $item->size,
                    'mime_type' => $item->mime_type,
                    'url' => $item->getUrl(),
                    'thumbnail' => $item->getUrl('thumb'),
                    'created_at' => $item->created_at,
                ];
            });

        return response()->json(['data' => $media->items(), 'meta' => [
            'current_page' => $media->currentPage(),
            'last_page' => $media->lastPage(),
            'per_page' => $media->perPage(),
            'total' => $media->total(),
        ]]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $file = $request->file('file');

        $media = auth()->user()
            ->addMedia($file)
            ->toMediaCollection('uploads');

        return response()->json([
            'data' => [
                'id' => $media->id,
                'name' => $media->name,
                'file_name' => $media->file_name,
                'size' => $media->size,
                'mime_type' => $media->mime_type,
                'url' => $media->getUrl(),
                'thumbnail' => $media->getUrl('thumb'),
                'created_at' => $media->created_at,
            ],
        ], 201);
    }

    public function destroy(Media $media)
    {
        if ($media->model_id !== auth()->id()) {
            abort(403, 'Forbidden.');
        }

        $media->delete();
        return response()->json(['message' => 'Deleted.']);
    }
}
