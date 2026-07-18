<?php

namespace App\Models;

use Database\Factories\Models\TeamMemberFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class TeamMember extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    protected static function newFactory(): TeamMemberFactory
    {
        return TeamMemberFactory::new();
    }

    protected $table = 'marketing_team_members';

    protected $fillable = [
        'name',
        'role',
        'bio',
        'social_links',
        'sort_order',
    ];

    protected $casts = [
        'social_links' => 'array',
        'sort_order' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (TeamMember $teamMember) {
            if ($teamMember->sort_order === null || $teamMember->sort_order === 0) {
                $teamMember->sort_order = static::max('sort_order') + 1;
            }
        });
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->fit('crop', 150, 150)
            ->nonQueued();
    }
}
