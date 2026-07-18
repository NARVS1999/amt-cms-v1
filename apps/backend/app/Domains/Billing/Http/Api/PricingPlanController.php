<?php

namespace App\Domains\Billing\Http\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;

class PricingPlanController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success([]);
    }
}
