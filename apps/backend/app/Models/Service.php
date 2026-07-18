<?php

namespace App\Models;

use Database\Factories\Models\ServiceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected static function newFactory(): ServiceFactory
    {
        return ServiceFactory::new();
    }

    protected $table = 'marketing_services';

    protected $fillable = [
        'title',
        'description',
        'icon',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
    ];
}
