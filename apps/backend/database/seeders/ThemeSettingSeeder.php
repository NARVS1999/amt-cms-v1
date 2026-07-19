<?php

namespace Database\Seeders;

use App\Models\ThemeSetting;
use Illuminate\Database\Seeder;

class ThemeSettingSeeder extends Seeder
{
    public function run(): void
    {
        ThemeSetting::updateOrCreate(
            ['id' => 1],
            [
                'primary_color' => '#FF0000',
                'secondary_color' => '#fb3d03',
                'accent_color' => '#FFC107',
                'background_color' => '#FFFFFF',
                'foreground_color' => '#333333',
                'muted_color' => '#f5f5f5',
                'muted_foreground_color' => '#888888',
                'border_color' => '#f0f0f0',
                'success_color' => '#22c55e',
                'error_color' => '#ef4444',
                'body_font' => 'Poppins',
                'heading_font' => 'Poppins',
            ]
        );
    }
}
