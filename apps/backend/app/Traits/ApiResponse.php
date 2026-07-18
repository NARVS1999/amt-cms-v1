<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    protected function success(mixed $data, int $code = 200): JsonResponse
    {
        return response()->json(['data' => $data], $code);
    }

    protected function error(string $message, int $code = 400, array $errors = []): JsonResponse
    {
        $response = ['message' => $message];
        if (! empty($errors)) {
            $response['errors'] = $errors;
        }
        return response()->json($response, $code);
    }
}
