<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MediaLibrary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Media;

class MediaController extends Controller
{
    public function index(): JsonResponse
    {
        $media = Media::orderBy('created_at', 'desc')
            ->paginate(24)
            ->through(function (Media $item) {
                $thumbnail = null;
                try {
                    $thumbnail = $item->getUrl('thumb');
                } catch (\Throwable $e) {
                    $thumbnail = $item->getUrl();
                }
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'file_name' => $item->file_name,
                    'size' => $item->size,
                    'mime_type' => $item->mime_type,
                    'url' => $item->getUrl(),
                    'thumbnail' => $thumbnail,
                    'created_at' => $item->created_at,
                ];
            });

        return response()->json([
            'data' => $media->items(),
            'meta' => [
                'current_page' => $media->currentPage(),
                'last_page' => $media->lastPage(),
                'per_page' => $media->perPage(),
                'total' => $media->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,svg', 'max:2048'],
        ], [
            'file.required' => 'Please select a file to upload.',
            'file.max' => 'File too large. Max 2MB.',
            'file.mimes' => 'Format not supported. Accepted: JPG, PNG, WebP, SVG.',
        ]);

        $file = $request->file('file');

        if ($file->getClientOriginalExtension() === 'svg') {
            $content = file_get_contents($file->getRealPath());
            $content = preg_replace('/<script[^>]*>.*?<\/script>/si', '', $content);
            $content = preg_replace('/\bon\w+\s*=\s*"[^"]*"/si', '', $content);
            $content = preg_replace("/\bon\w+\s*=\s*'[^']*'/si", '', $content);
            file_put_contents($file->getRealPath(), $content);
        }

        $library = MediaLibrary::firstOrCreate(['name' => 'default']);

        $media = $library
            ->addMedia($file)
            ->toMediaCollection('default');

        $thumbnail = null;
        try {
            $thumbnail = $media->getUrl('thumb');
        } catch (\Throwable $e) {
            $thumbnail = $media->getUrl();
        }

        return response()->json([
            'data' => [
                'id' => $media->id,
                'name' => $media->name,
                'file_name' => $media->file_name,
                'size' => $media->size,
                'mime_type' => $media->mime_type,
                'url' => $media->getUrl(),
                'thumbnail' => $thumbnail,
                'created_at' => $media->created_at,
            ],
        ], 201);
    }

    public function destroy(Media $media): JsonResponse
    {
        $media->delete();

        return response()->json(['message' => 'Deleted.']);
    }
}
