<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ThemeSetting extends Model
{
    protected $fillable = [
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
    ];
}
