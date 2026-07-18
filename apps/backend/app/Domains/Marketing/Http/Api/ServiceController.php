<?php

namespace App\Domains\Marketing\Http\Api;

use App\Domains\Marketing\Models\Service;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\ServiceResource;
use App\Traits\ApiResponse;

class ServiceController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $services = Service::query()
            ->orderBy('sort_order')
            ->get();

        return $this->success(ServiceResource::collection($services));
    }
}
