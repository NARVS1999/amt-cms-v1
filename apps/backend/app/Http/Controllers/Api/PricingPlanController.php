<?php

namespace App\Http\Controllers\Api;

use App\Models\PricingPlan;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\PricingPlanResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class PricingPlanController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $plans = PricingPlan::query()
            ->with('features')
            ->where('is_published', true)
            ->orderBy('sort_order')
            ->get();

        return $this->success(PricingPlanResource::collection($plans));
    }

    public function adminIndex()
    {
        $plans = PricingPlan::query()
            ->with('features')
            ->orderBy('sort_order')
            ->get();

        return $this->success(PricingPlanResource::collection($plans));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'interval' => 'required|string|in:monthly,yearly,one-time',
            'description' => 'nullable|string',
            'cta_text' => 'nullable|string|max:255',
            'is_popular' => 'boolean',
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if (!empty($data['is_popular'])) {
            PricingPlan::where('is_popular', true)->update(['is_popular' => false]);
        }

        $plan = PricingPlan::create($data);

        if ($request->has('features')) {
            foreach ($request->input('features', []) as $i => $feature) {
                $plan->features()->create([
                    'description' => $feature['description'] ?? '',
                    'is_included' => $feature['is_included'] ?? true,
                    'sort_order' => $feature['sort_order'] ?? $i,
                ]);
            }
        }

        return $this->success(new PricingPlanResource($plan->load('features')), 201);
    }

    public function update(Request $request, PricingPlan $pricingPlan)
    {
        $data = $request->validate([
            'name' => 'string|max:255',
            'price' => 'numeric|min:0',
            'interval' => 'string|in:monthly,yearly,one-time',
            'description' => 'nullable|string',
            'cta_text' => 'nullable|string|max:255',
            'is_popular' => 'boolean',
            'is_published' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if (!empty($data['is_popular'])) {
            PricingPlan::where('is_popular', true)
                ->where('id', '!=', $pricingPlan->id)
                ->update(['is_popular' => false]);
        }

        $pricingPlan->update($data);

        if ($request->has('features')) {
            $pricingPlan->features()->delete();
            foreach ($request->input('features', []) as $i => $feature) {
                $pricingPlan->features()->create([
                    'description' => $feature['description'] ?? '',
                    'is_included' => $feature['is_included'] ?? true,
                    'sort_order' => $feature['sort_order'] ?? $i,
                ]);
            }
        }

        return $this->success(new PricingPlanResource($pricingPlan->load('features')));
    }

    public function destroy(PricingPlan $pricingPlan)
    {
        $pricingPlan->delete();

        return $this->success(['message' => 'Deleted.']);
    }
}
