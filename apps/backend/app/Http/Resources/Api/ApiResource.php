<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApiResource extends JsonResource
{
    /**
     * Intentionally does NOT wrap in 'data' — the ApiResponse trait
     * already provides the { "data": ... } envelope at the controller level.
     * Wrapping here would double-wrap when used with ApiResponse::success().
     */
    public function toArray(Request $request): array
    {
        return parent::toArray($request);
    }
}
