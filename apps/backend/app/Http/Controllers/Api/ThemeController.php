<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ThemeSetting;
use App\Traits\ApiResponse;

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
}
