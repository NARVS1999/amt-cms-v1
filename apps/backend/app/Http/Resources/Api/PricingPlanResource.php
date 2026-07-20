<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PricingPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'price' => (float) $this->price,
            'interval' => $this->interval,
            'description' => $this->description,
            'cta_text' => $this->cta_text,
            'is_popular' => $this->is_popular,
            'is_published' => $this->is_published,
            'sort_order' => $this->sort_order,
            'features' => $this->whenLoaded('features', fn() =>
                $this->features->map(fn($f) => [
                    'id' => $f->id,
                    'description' => $f->description,
                    'is_included' => $f->is_included,
                    'sort_order' => $f->sort_order,
                ])
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
