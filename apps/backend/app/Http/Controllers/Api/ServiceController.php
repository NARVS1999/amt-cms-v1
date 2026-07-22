<?php

namespace App\Http\Controllers\Api;

use App\Models\Service;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\ServiceResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;

class ServiceController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $services = QueryBuilder::for(Service::class)
            ->defaultSort('sort_order')
            ->allowedSorts(['title', 'sort_order', 'created_at'])
            ->allowedFilters(['title'])
            ->paginate();

        return ServiceResource::collection($services);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'required|string|max:255',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $service = Service::create($data);

        return $this->success(new ServiceResource($service), 201);
    }

    public function update(Request $request, Service $service)
    {
        $data = $request->validate([
            'title' => 'string|max:255',
            'description' => 'string',
            'icon' => 'string|max:255',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $service->update($data);

        return $this->success(new ServiceResource($service));
    }

    public function destroy(Service $service)
    {
        $service->delete();

        return $this->success(['message' => 'Deleted.']);
    }
}
