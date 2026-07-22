<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;

class ForgotPasswordController extends Controller
{
    use ApiResponse;

    public function sendResetLink(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (! $user) {
            return $this->success(['message' => 'Password reset link sent.']);
        }

        $token = Password::broker()->createToken($user);

        if (app()->environment('local', 'testing')) {
            return $this->success([
                'message' => 'Password reset link sent.',
                'token' => $token,
            ]);
        }

        $user->sendPasswordResetNotification($token);

        return $this->success(['message' => 'Password reset link sent.']);
    }
}
