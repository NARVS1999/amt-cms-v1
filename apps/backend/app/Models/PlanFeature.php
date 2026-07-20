<?php

namespace App\Models;

use Database\Factories\Models\PlanFeatureFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PlanFeature extends Model
{
    use HasFactory;

    protected static function newFactory(): PlanFeatureFactory
    {
        return PlanFeatureFactory::new();
    }

    protected $table = 'billing_plan_features';

    protected $fillable = [
        'pricing_plan_id',
        'description',
        'is_included',
        'sort_order',
    ];

    protected $casts = [
        'is_included' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function plan(): BelongsTo
    {
        return $this->belongsTo(PricingPlan::class, 'pricing_plan_id');
    }
}
