<?php

namespace App\Models;

use Database\Factories\Models\PricingPlanFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PricingPlan extends Model
{
    use HasFactory;

    protected static function newFactory(): PricingPlanFactory
    {
        return PricingPlanFactory::new();
    }

    protected $table = 'billing_pricing_plans';

    protected $fillable = [
        'name',
        'price',
        'interval',
        'description',
        'cta_text',
        'is_popular',
        'is_published',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_popular' => 'boolean',
        'is_published' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function features(): HasMany
    {
        return $this->hasMany(PlanFeature::class, 'pricing_plan_id')->orderBy('sort_order');
    }
}
