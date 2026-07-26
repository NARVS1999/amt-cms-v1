<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ThemeSetting;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class ThemeController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $theme = ThemeSetting::first();

        if (!$theme) {
            return $this->success((object) []);
        }

        return $this->success($theme->only([
            'primary_color',
            'secondary_color',
            'accent_color',
            'background_color',
            'foreground_color',
            'muted_color',
            'muted_foreground_color',
            'border_color',
            'success_color',
            'error_color',
            'body_font',
            'heading_font',
        ]));
    }

    public function update(Request $request)
    {
        try {
            $validated = $request->validate([
                'primary_color' => 'nullable|string|max:7',
                'secondary_color' => 'nullable|string|max:7',
                'accent_color' => 'nullable|string|max:7',
                'background_color' => 'nullable|string|max:7',
                'foreground_color' => 'nullable|string|max:7',
                'muted_color' => 'nullable|string|max:7',
                'muted_foreground_color' => 'nullable|string|max:7',
                'border_color' => 'nullable|string|max:7',
                'success_color' => 'nullable|string|max:7',
                'error_color' => 'nullable|string|max:7',
                'body_font' => 'nullable|string|max:255',
                'heading_font' => 'nullable|string|max:255',
            ]);

            $theme = ThemeSetting::updateOrCreate([], $validated);

            return $this->success($theme->only([
                'primary_color',
                'secondary_color',
                'accent_color',
                'background_color',
                'foreground_color',
                'muted_color',
                'muted_foreground_color',
                'border_color',
                'success_color',
                'error_color',
                'body_font',
                'heading_font',
            ]));
        } catch (\Throwable $e) {
            return $this->error('Could not update theme settings. Please try again.', 500);
        }
    }
}
