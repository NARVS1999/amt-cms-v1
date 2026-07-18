<?php

namespace App\Domains\Marketing\Models;

use Database\Factories\Domains\Marketing\Models\TeamMemberFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class TeamMember extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia;

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory(): TeamMemberFactory
    {
        return TeamMemberFactory::new();
    }

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'marketing_team_members';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'role',
        'bio',
        'social_links',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'social_links' => 'array',
        'sort_order' => 'integer',
    ];

    /**
     * The "booted" method to auto-assign sort_order on creation.
     */
    protected static function booted(): void
    {
        static::creating(function (TeamMember $teamMember) {
            if ($teamMember->sort_order === null || $teamMember->sort_order === 0) {
                $teamMember->sort_order = static::max('sort_order') + 1;
            }
        });
    }

    /**
     * Register media collections for this model.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('photo')
            ->singleFile()
            ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp']);
    }

    /**
     * Register media conversions for this model.
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->fit('crop', 150, 150)
            ->nonQueued();
    }
}
