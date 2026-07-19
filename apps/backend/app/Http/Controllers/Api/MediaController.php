<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends Controller
{
    public function index()
    {
        $media = Media::orderBy('created_at', 'desc')->get()->map(function (Media $item) {
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

        return response()->json(['data' => $media]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,svg', 'max:2048'],
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
        $media->delete();
        return response()->json(['message' => 'Deleted.']);
    }
}
