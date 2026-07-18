<?php

namespace App\Domains\Contact\Http\Api;

use App\Domains\Contact\Http\Requests\SubscribeRequest;
use App\Domains\Contact\Models\Subscriber;
use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;

class SubscribeController extends Controller
{
    use ApiResponse;

    public function store(SubscribeRequest $request)
    {
        try {
            $subscriber = Subscriber::create([
                'email' => $request->input('email'),
                'subscribed_at' => now(),
            ]);
        } catch (\Throwable $e) {
            return $this->error('Could not subscribe. Please try again.', 500);
        }

        return $this->success([
            'message' => 'Welcome! You\'ve been subscribed successfully.',
            'subscriber' => [
                'id' => $subscriber->id,
                'email' => $subscriber->email,
                'subscribed_at' => $subscriber->subscribed_at?->toIso8601String(),
            ],
        ], 201);
    }
}
