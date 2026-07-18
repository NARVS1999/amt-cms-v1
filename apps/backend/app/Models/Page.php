<?php

namespace App\Models;

use Database\Factories\Models\PageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected static function newFactory(): PageFactory
    {
        return PageFactory::new();
    }

    protected $table = 'marketing_pages';

    protected $fillable = [
        'title',
        'slug',
        'hero_heading',
        'hero_subtext',
        'sections',
        'is_published',
    ];

    protected $casts = [
        'sections' => 'array',
        'is_published' => 'boolean',
    ];
}
