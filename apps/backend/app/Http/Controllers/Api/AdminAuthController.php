<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Traits\ApiResponse;

class AdminAuthController extends Controller
{
    use ApiResponse;

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['boolean'],
        ]);

        $user = User::where('email', $request->email)->first();

        $hashCheck = Hash::check($request->password, $user?->password ?? '');
        if (! $user || ! $hashCheck) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('admin-token');
        $token->accessToken->expires_at = $request->remember
            ? now()->addDays(30)
            : now()->addHours(24);
        $token->accessToken->save();

        return $this->success([
            'token' => $token->plainTextToken,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return $this->success([
            'id' => $request->user()->id,
            'name' => $request->user()->name,
            'email' => $request->user()->email,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(['message' => 'Logged out.']);
    }
}
